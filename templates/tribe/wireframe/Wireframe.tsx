import type { WireframeProps } from "@engine/types.ts";
import { Shell } from "@engine/wireframe/Shell.tsx";
import { useTrack } from "@engine/wireframe/tracker.tsx";
import { Card } from "@engine/wireframe/ui.tsx";
import type { State } from "./state.ts";

// Menu tanpa `key` tampil nonaktif sampai layarnya dibuat. Elemen yang disorot tur diberi
// data-tour (atau prop `tour` pada Btn/Card), lalu aksinya memanggil track dengan nama event.

export function Wireframe({ state, setState }: WireframeProps<State>) {
  const track = useTrack();
  return (
    <Shell
      namaAplikasi="{{nama}}"
      menu={[{ label: "Beranda", key: "beranda" }]}
      aktif={state.screen}
      onNavigate={() => {
        setState({ screen: "beranda" });
        track("view_beranda");
      }}
    >
      <div className="p-5">
        <Card tour="page-beranda" className="p-5">
          <h2 className="text-base font-semibold text-slate-900">Beranda</h2>
          <p className="mt-1 text-xs text-slate-600">
            Bangun layar di sini mengikuti panduan produk, dengan data fiktif saja.
          </p>
        </Card>
      </div>
    </Shell>
  );
}
