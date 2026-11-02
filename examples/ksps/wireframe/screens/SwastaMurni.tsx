import { Download, Plus } from "lucide-react";
import { riwayatSwasta, sekolahSwasta } from "../dummy.ts";
import type { SetSim, SimState } from "../sim.ts";
import { useTrack } from "@engine/wireframe/tracker.tsx";
import {
  Btn,
  Card,
  Chip,
  FakeUpload,
  Field,
  inputClass,
  Modal,
  Table,
  Td,
} from "@engine/wireframe/ui.tsx";
import { Toast } from "./shared.tsx";

// Slide 169–172: Penugasan Kepala Sekolah Swasta Murni (KS swasta non-ASN, formulir tunggal).

const kosong = { nik: "", asal: "", tujuan: "" };
const namaSekolah = (id: string) => sekolahSwasta.find((s) => s.id === id)?.nama ?? "–";
/** Nama calon muncul otomatis dari NIK (slide 170); di wireframe cukup nama contoh. */
const namaDariNik = (nik: string) => (nik.length >= 4 ? "Guru V" : null);

export function SwastaMurni({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();

  return (
    <div className="space-y-4 p-5">
      <Toast sim={sim} setSim={setSim} />
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Penugasan Kepala Sekolah (Swasta Murni)
          </h2>
          <p className="text-[11px] text-slate-500">
            Kelola pengaturan dan penugasan Kepala Sekolah untuk sekolah swasta murni.
          </p>
        </div>
        {sim.smMode === "riwayat" && (
          <Btn
            variant="primary"
            tour="sm-pengajuan-baru"
            onClick={() => {
              setSim({ smMode: "form", smForm: kosong, toast: null });
              track("view_penugasan_swasta_murni");
            }}
          >
            <Plus size={14} /> Pengajuan Baru
          </Btn>
        )}
      </div>

      {sim.smMode === "form" ? <Formulir sim={sim} setSim={setSim} /> : <Riwayat sim={sim} />}

      {sim.modal === "sm_konfirmasi" && <Konfirmasi sim={sim} setSim={setSim} />}
    </div>
  );
}

function Formulir({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const f = sim.smForm;
  const set = (patch: Partial<typeof f>) => setSim({ smForm: { ...f, ...patch } });
  const nama = namaDariNik(f.nik);

  return (
    <Card tour="sm-form" className="space-y-3 p-5 text-xs">
      <h3 className="text-sm font-semibold text-slate-900">Formulir Penugasan KS Swasta Murni</h3>
      <Field label="NIK *">
        <input
          className={inputClass}
          placeholder="Cari NIK"
          value={f.nik}
          onChange={(e) => set({ nik: e.target.value })}
        />
        {nama && <p className="text-[11px] text-emerald-700">Calon kepala sekolah: {nama}</p>}
      </Field>
      <Field label="Sekolah Asal">
        <select
          className={inputClass}
          value={f.asal}
          onChange={(e) => set({ asal: e.target.value })}
        >
          <option value="">Ketik nama sekolah atau NPSN</option>
          {sekolahSwasta.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nama} ({s.npsn})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Sekolah Tujuan *">
        <select
          className={inputClass}
          value={f.tujuan}
          onChange={(e) => set({ tujuan: e.target.value })}
        >
          <option value="">Ketik nama sekolah atau NPSN</option>
          {sekolahSwasta.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nama} ({s.npsn})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Unggah SK Penugasan * (PDF, maksimal 5 MB)">
        <FakeUpload name="SK Penugasan.pdf" />
      </Field>
      <Field label="Nomor SK *">
        <input className={inputClass} defaultValue="421/045/2025" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tanggal SK *">
          <input type="date" className={inputClass} defaultValue="2025-10-01" />
        </Field>
        <Field label="Tanggal Mulai Tugas *">
          <input type="date" className={inputClass} defaultValue="2025-10-15" />
        </Field>
      </div>
      <div className="flex gap-2 pt-1">
        <Btn
          variant="primary"
          tour="sm-kirim"
          disabled={!nama || !f.tujuan}
          onClick={() => setSim({ modal: "sm_konfirmasi", smSetuju: false })}
        >
          Kirim
        </Btn>
        <Btn onClick={() => setSim({ smForm: kosong })}>Reset Form</Btn>
      </div>
    </Card>
  );
}

function Konfirmasi({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const f = sim.smForm;
  return (
    <Modal
      title="Konfirmasi Penugasan"
      subtitle="Pastikan semua data sudah tepat sebelum disimpan"
      onClose={() => setSim({ modal: null })}
      footer={
        <>
          <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
          <Btn
            variant="primary"
            tour="sm-simpan"
            disabled={!sim.smSetuju}
            onClick={() => {
              track("click_penugasan_swasta_murni_simpan_confirm");
              setSim({
                modal: null,
                smMode: "riwayat",
                smBaru: sim.smBaru + 1,
                toast: "Penugasan Swasta Murni Berhasil Dikirim.",
              });
            }}
          >
            Simpan
          </Btn>
        </>
      }
    >
      <dl className="grid grid-cols-2 gap-3 rounded-md bg-slate-50 p-3">
        {[
          ["Nama Calon Kepala Sekolah", namaDariNik(f.nik) ?? "–"],
          ["NIK", "32xxxxxxxxxxxxxx"],
          ["Sekolah Asal", namaSekolah(f.asal)],
          ["Sekolah Tujuan", namaSekolah(f.tujuan)],
          ["Nomor SK", "421/045/2025"],
          ["Tanggal Mulai Tugas", "2025-10-15"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[10px] text-slate-500">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <label
        data-tour="sm-pernyataan"
        className="flex items-start gap-2 rounded-md border border-slate-200 p-2.5"
      >
        <input
          type="checkbox"
          checked={sim.smSetuju}
          onChange={(e) => setSim({ smSetuju: e.target.checked })}
          className="mt-0.5"
        />
        <span className="text-slate-600">
          Saya menyatakan data yang diisi sudah benar dan dapat dipertanggungjawabkan.
        </span>
      </label>
    </Modal>
  );
}

function Riwayat({ sim }: { sim: SimState }) {
  const track = useTrack();
  const baru = Array.from({ length: sim.smBaru }, (_, i) => ({
    id: `baru-${i}`,
    tanggal: "Hari ini",
    nama: "Guru V",
    asal: namaSekolah(sim.smForm.asal),
    tujuan: namaSekolah(sim.smForm.tujuan),
  }));
  return (
    <Card>
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Riwayat Penugasan KS Swasta Murni</h3>
        <Btn
          variant="dark"
          tour="sm-unduh"
          onClick={() => track("download_riwayat_penugasan_swasta")}
        >
          <Download size={14} /> Unduh Excel
        </Btn>
      </div>
      <Table
        head={["Tanggal Pengajuan", "Nama", "Sekolah Asal", "Sekolah Tujuan", "Status", "Aksi"]}
      >
        {[...baru, ...riwayatSwasta].map((r, i) => (
          <tr key={r.id}>
            <Td>{r.tanggal}</Td>
            <Td>{r.nama}</Td>
            <Td>{r.asal}</Td>
            <Td>{r.tujuan}</Td>
            <Td>
              {/* Status riwayat swasta murni tidak dirinci di panduan; dipakai label umum. */}
              <Chip tone={i < baru.length ? "yellow" : "green"}>
                {i < baru.length ? "Sedang Dikirim" : "Selesai"}
              </Chip>
            </Td>
            <Td>
              <Btn>Detail</Btn>
            </Td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}
