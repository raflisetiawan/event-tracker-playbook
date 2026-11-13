import { useEffect, useState } from "react";
import clsx from "clsx";
import { api, kirimJson } from "../lib/api.ts";

// Tinjauan per event di web, supaya penilaian manusia tidak perlu lewat terminal. Hasilnya
// tersimpan di projects/<id>/tinjauan.json dan dibaca agent. Hanya ada di server lokal.

export type Tinjauan = Record<string, { status: "sesuai" | "ubah"; catatan: string }>;

/** null berarti tinjauan tidak tersedia: situs hasil build, atau contoh seperti KSPS. */
export function useTinjauan(tribeId: string) {
  const [tinjauan, setTinjauan] = useState<Tinjauan | null>(null);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let aktif = true;
    api<Tinjauan>(`/api/projects/${tribeId}/tinjauan`)
      .then((t) => {
        if (aktif) setTinjauan(t);
      })
      .catch(() => {
        if (aktif) setTinjauan(null);
      });
    return () => {
      aktif = false;
    };
  }, [tribeId]);
  return [tinjauan, setTinjauan] as const;
}

export function LabelTinjauan({ item }: { item: Tinjauan[string] | undefined }) {
  if (!item) return <span className="text-slate-400">Belum</span>;
  return item.status === "sesuai" ? (
    <span className="rounded bg-emerald-100 px-1.5 font-semibold text-emerald-800">Sesuai</span>
  ) : (
    <span className="rounded bg-amber-100 px-1.5 font-semibold text-amber-800">Perlu diubah</span>
  );
}

export function FormTinjauan({
  projectId,
  event,
  item,
  onUbah,
}: {
  projectId: string;
  event: string;
  item: Tinjauan[string] | undefined;
  onUbah: (t: Tinjauan) => void;
}) {
  const [menulis, setMenulis] = useState(false);
  const [catatan, setCatatan] = useState(item?.catatan ?? "");
  const [error, setError] = useState("");

  const simpan = (status: string, isi: string) => {
    void api<Tinjauan>(
      `/api/projects/${projectId}/tinjauan/${event}`,
      kirimJson("PUT", { status, catatan: isi }),
    )
      .then((t) => {
        onUbah(t);
        setMenulis(false);
        setError("");
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Gagal menyimpan.");
      });
  };

  const tombol = "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium";
  return (
    <div data-tinjauan className="space-y-2 rounded-lg border border-sky-200 bg-sky-50 p-3">
      <p className="text-xs font-semibold text-slate-900">Tinjauan Anda</p>
      <div className="flex gap-2">
        <button
          type="button"
          // Klik ulang pada status aktif membatalkan tinjauan.
          onClick={() => simpan(item?.status === "sesuai" ? "" : "sesuai", "")}
          className={clsx(
            tombol,
            item?.status === "sesuai"
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          Sudah sesuai
        </button>
        <button
          type="button"
          onClick={() => setMenulis(true)}
          className={clsx(
            tombol,
            item?.status === "ubah"
              ? "border-amber-500 bg-amber-500 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          Perlu diubah
        </button>
      </div>
      {item?.status === "ubah" && !menulis && (
        <p className="text-xs text-slate-700">Catatan: {item.catatan}</p>
      )}
      {menulis && (
        <div className="space-y-1.5">
          <textarea
            aria-label="Apa yang perlu diubah"
            rows={3}
            maxLength={2000}
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
            placeholder="Mis. Tombol ini tidak ada di aplikasi, atau labelnya salah. Jangan tulis data pribadi."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => simpan("ubah", catatan)}
              className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700"
            >
              Simpan catatan
            </button>
            <button
              type="button"
              onClick={() => setMenulis(false)}
              className="px-2 text-xs text-slate-600 hover:underline"
            >
              Batal
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
