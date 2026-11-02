import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "driver.js/dist/driver.css";
import "./index.css";
import { TourApp } from "./App.tsx";
import type { TribeConfig } from "./types.ts";

// Tribe ditemukan otomatis dari `tribes/*/tribe.tsx` dan `examples/*/tribe.tsx`, lalu dimuat
// saat dibuka. Tribe aktif disimpan di hash URL, mis. `#/ksps`.
const modules = {
  ...import.meta.glob<{ default: TribeConfig<never> }>("../examples/*/tribe.tsx"),
  ...import.meta.glob<{ default: TribeConfig<never> }>("../tribes/*/tribe.tsx"),
};
const loaders = new Map(
  Object.entries(modules).map(([p, load]) => [p.split("/").at(-2) as string, load]),
);
const tribeIds = [...loaders.keys()].sort();
const tribeDariHash = () => {
  const id = location.hash.replace(/^#\/?/, "");
  return loaders.has(id) ? id : tribeIds[0];
};

function Root() {
  const [id, setId] = useState(tribeDariHash);
  const [tribe, setTribe] = useState<TribeConfig<never> | null>(null);

  useEffect(() => {
    const onHash = () => setId(tribeDariHash());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    let aktif = true;
    void loaders
      .get(id)?.()
      .then((m) => {
        if (aktif) setTribe(m.default);
      });
    return () => {
      aktif = false;
    };
  }, [id]);

  if (tribeIds.length === 0) {
    return <p className="p-8 text-sm">Belum ada tribe. Jalankan: pnpm playbook new nama-tribe</p>;
  }
  if (!tribe || tribe.id !== id) return <p className="p-8 text-sm">Memuat…</p>;
  return (
    <TourApp
      key={tribe.id}
      tribe={tribe}
      tribeIds={tribeIds}
      onPilihTribe={(next) => {
        location.hash = `/${next}`;
      }}
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
