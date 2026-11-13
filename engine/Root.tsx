import { useEffect, useState } from "react";
import { TourApp } from "./App.tsx";
import { Home } from "./components/Home.tsx";
import type { TribeConfig } from "./types.ts";

// Project ditemukan otomatis dari `projects/*/tribe.tsx` dan contoh dari `examples/*/tribe.tsx`,
// lalu dimuat saat dibuka. Rute di hash URL: `#/` halaman awal, `#/mulai/<id>` persiapan satu
// project, `#/<id>` hasilnya.
const modules = {
  ...import.meta.glob<{ default: TribeConfig<never> }>("../examples/*/tribe.tsx"),
  ...import.meta.glob<{ default: TribeConfig<never> }>("../projects/*/tribe.tsx"),
};
const loaders = new Map(
  Object.entries(modules).map(([p, load]) => [p.split("/").at(-2) as string, load]),
);
const tribeIds = [...loaders.keys()].sort();

type Rute = { halaman: "home"; project: string | null } | { halaman: "project"; id: string };

function bacaRute(): Rute {
  const [a, b] = location.hash.replace(/^#\/?/, "").split("/");
  if (a === "mulai") return { halaman: "home", project: b || null };
  return a && loaders.has(a) ? { halaman: "project", id: a } : { halaman: "home", project: null };
}

export function Root() {
  const [rute, setRute] = useState(bacaRute);
  const [tribe, setTribe] = useState<TribeConfig<never> | null>(null);
  const idAktif = rute.halaman === "project" ? rute.id : null;

  useEffect(() => {
    const onHash = () => setRute(bacaRute());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!idAktif) return;
    let aktif = true;
    void loaders
      .get(idAktif)?.()
      .then((m) => {
        if (aktif) setTribe(m.default);
      });
    return () => {
      aktif = false;
    };
  }, [idAktif]);

  if (rute.halaman === "home") {
    return (
      <Home
        projectTerpilih={rute.project}
        hasilIds={tribeIds}
        onPilih={(id) => {
          location.hash = id ? `/mulai/${id}` : "/";
        }}
      />
    );
  }
  if (!tribe || tribe.id !== rute.id) return <p className="p-8 text-sm">Memuat…</p>;
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
