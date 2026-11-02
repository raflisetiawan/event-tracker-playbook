import type { ReactNode } from "react";
import { CheckCircle2, FileText, X } from "lucide-react";
import { riwayatPengajuan } from "../dummy.ts";
import type { Jalur, SetSim, SimState } from "../sim.ts";
import { useTrack } from "@engine/wireframe/tracker.tsx";
import { Btn, Card, Chip, Modal, Table, Td } from "@engine/wireframe/ui.tsx";

// Bagian yang sama di daftar Penugasan Reguler (slide 147–155) dan Non-Reguler (slide 118–127).

const statusTone = {
  Selesai: "green",
  "Sedang Dikirim": "yellow",
  "Sedang Diverifikasi": "blue",
} as const;

export function Toast({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  if (!sim.toast) return null;
  return (
    <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
      <span className="flex items-center gap-2">
        <CheckCircle2 size={14} /> {sim.toast}
      </span>
      <button onClick={() => setSim({ toast: null })} aria-label="Tutup pemberitahuan">
        <X size={14} />
      </button>
    </div>
  );
}

/** Judul halaman, tombol Buat Pengajuan Baru, kartu ringkasan, dan daftar riwayat. */
export function KepalaDaftar({
  jalur,
  title,
  stats,
  aksiRiwayat,
  setSim,
}: {
  jalur: Jalur;
  title: string;
  stats: [string, string, string];
  aksiRiwayat: string;
  setSim: SetSim;
}) {
  const track = useTrack();
  const JALUR = { jalur_penugasan: jalur };
  const angka = [riwayatPengajuan.length, 2, 1];
  const dot = ["bg-blue-500", "bg-amber-400", "bg-emerald-500"];

  return (
    <>
      <div data-tour="page-penugasan" className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <Btn
          variant="primary"
          tour="buat-pengajuan"
          onClick={() => {
            track("click_penugasan_buat_pengajuan", JALUR);
            setSim({ screen: "penugasan_buat_pengajuan", tahap: 1, modal: null, toast: null });
          }}
        >
          Buat Pengajuan Baru
        </Btn>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((label, i) => (
          <Card key={label} className="flex items-center justify-between p-4">
            <div>
              <p className="text-[11px] text-slate-500">{label}</p>
              <p className="text-lg font-semibold text-slate-900">{angka[i]}</p>
            </div>
            <span className={`size-4 rounded-full ${dot[i]}`} />
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Daftar Riwayat Pengajuan{" "}
            {jalur === "reguler" ? "Reguler" : "Kepala Sekolah (Non-Reguler)"}
          </h3>
          <p className="text-[11px] text-slate-500">Terakhir diperbarui: 15 Oktober 2025</p>
        </div>
        <Table
          head={[
            "Tanggal Pengajuan",
            "Jumlah yang Diajukan",
            "Jumlah yang Diterima",
            "Status",
            "Aksi",
          ]}
        >
          {riwayatPengajuan.map((r, i) => (
            <tr key={r.id}>
              <Td>{r.tanggal}</Td>
              <Td>{r.diajukan}</Td>
              <Td>{r.diterima}</Td>
              <Td>
                <Chip tone={statusTone[r.status]}>{r.status}</Chip>
              </Td>
              <Td>
                <Btn
                  tour={i === 1 ? "cek-pengajuan" : undefined}
                  onClick={() => track("click_penugasan_cek_pengajuan", JALUR)}
                >
                  {aksiRiwayat}
                </Btn>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

export function KonfirmasiNapza({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      title="Konfirmasi Kirim Permintaan Dokumen NAPZA"
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Batal</Btn>
          <Btn variant="primary" tour="napza-kirim-confirm" onClick={onConfirm}>
            Ya, Kirim Permintaan
          </Btn>
        </>
      }
    >
      <p className="text-slate-600">
        Apakah Anda yakin ingin mengirim permintaan dokumen NAPZA kepada peserta yang dipilih?
        Peserta akan menerima notifikasi untuk mengunggah dokumen bebas NAPZA melalui Ruang GTK.
      </p>
    </Modal>
  );
}

/** Tampilan Dokumen NAPZA: pratinjau (placeholder) + panel validasi (slide 126 / 155). */
export function DokumenNapza<H extends string>({
  nama,
  sekolah,
  opsi,
  hasil,
  onHasil,
  onClose,
  onConfirm,
}: {
  nama: string;
  sekolah: string;
  opsi: { value: H; label: string }[];
  hasil: H | null;
  onHasil: (h: H) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-slate-900/90">
      <div className="flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-medium">
        <button onClick={onClose} aria-label="Kembali">
          <X size={16} />
        </button>
        Dokumen NAPZA
      </div>
      <div className="flex flex-1 gap-4 p-4">
        <div className="flex flex-1 flex-col items-center justify-center rounded-md bg-white text-slate-400">
          <FileText size={48} strokeWidth={1} />
          <p className="mt-2 text-xs">Pratinjau Surat Keterangan Bebas Narkoba (contoh)</p>
        </div>
        <div className="w-64 space-y-3 self-start rounded-md bg-white p-4 text-xs">
          <div>
            <p className="font-semibold text-slate-900">{nama}</p>
            <p className="mt-1 text-[11px] text-slate-500">Penugasan saat ini</p>
            <p>{sekolah}</p>
          </div>
          <fieldset data-tour="napza-pilihan" className="space-y-1.5">
            <legend className="mb-1 font-medium text-slate-700">Apakah dokumen ini valid?</legend>
            {opsi.map((o) => (
              <label key={o.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasil-napza"
                  checked={hasil === o.value}
                  onChange={() => onHasil(o.value)}
                />
                {o.label}
              </label>
            ))}
          </fieldset>
          <Btn
            variant="dark"
            tour="napza-validasi-confirm"
            className="w-full justify-center"
            disabled={!hasil}
            onClick={onConfirm}
          >
            Konfirmasi
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function KartuKandidat({
  tour,
  title,
  subtitle,
  children,
}: {
  tour: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Card tour={tour}>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <Btn>Unduh Dokumen</Btn>
      </div>
      {children}
    </Card>
  );
}
