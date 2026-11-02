import { useMemo, useState } from "react";
import clsx from "clsx";
import type { UsulanData } from "../plugin/parse-usulan.ts";
import { prioClass, type UsulanIndex } from "../lib/usulan.ts";

// Tampilan dasar semua tribe: daftar event yang bisa difilter. Cukup butuh usulan.md.

export function Katalog({
  usulan,
  index,
  onPilih,
}: {
  usulan: UsulanData;
  index: UsulanIndex;
  onPilih: (name: string) => void;
}) {
  const [cari, setCari] = useState("");
  const [tahap, setTahap] = useState("");
  const [prio, setPrio] = useState("");
  const daftarTahap = useMemo(() => [...new Set(usulan.events.map((e) => e.tahap))], [usulan]);
  const hasil = usulan.events.filter(
    (e) =>
      (!tahap || e.tahap === tahap) &&
      (!prio || e.prio === prio) &&
      `${e.name} ${e.pemicu}`.toLowerCase().includes(cari.toLowerCase()),
  );
  const select = "rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3">
        <input
          className={clsx(select, "min-w-60 flex-1")}
          placeholder="Cari nama event atau pemicu"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
        />
        <select
          aria-label="Filter tahap"
          className={select}
          value={tahap}
          onChange={(e) => setTahap(e.target.value)}
        >
          <option value="">Semua tahap</option>
          {daftarTahap.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          aria-label="Filter prioritas"
          className={select}
          value={prio}
          onChange={(e) => setPrio(e.target.value)}
        >
          <option value="">Semua prioritas</option>
          {["P0", "P1", "P2"].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500">
          {hasil.length} dari {usulan.events.length} event
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
            <tr>
              {["Event", "Tahap", "Pemicu", "Trigger", "Prio", "Status"].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {hasil.map((e) => (
              <tr key={e.name} className="align-top hover:bg-slate-50">
                <td className="px-3 py-2">
                  <button
                    onClick={() => onPilih(e.name)}
                    className="text-left font-mono break-all text-sky-700 hover:underline"
                  >
                    {e.name}
                  </button>
                </td>
                <td className="px-3 py-2">{e.tahap}</td>
                <td className="px-3 py-2">{e.pemicu}</td>
                <td className="px-3 py-2">{index.trigger(e)}</td>
                <td className="px-3 py-2">
                  <span className={clsx("rounded px-1.5 font-semibold", prioClass[e.prio])}>
                    {e.prio}
                  </span>
                </td>
                <td className="px-3 py-2">{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
