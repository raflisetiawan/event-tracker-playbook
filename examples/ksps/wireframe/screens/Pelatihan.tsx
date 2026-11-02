import { useState } from "react";
import clsx from "clsx";
import { ArrowLeft, Download, ExternalLink, Plus, Search, X } from "lucide-react";
import {
  batasPelatihan,
  pengajar,
  pesertaPelatihan,
  programPelatihan,
  statusPelatihanLabel,
  type StatusPelatihan,
} from "../dummy.ts";
import type { Kelas, SetSim, SimState } from "../sim.ts";
import { useTrack } from "@engine/wireframe/tracker.tsx";
import {
  Btn,
  Card,
  Chip,
  Field,
  inputClass,
  Modal,
  Stepper,
  Table,
  Td,
} from "@engine/wireframe/ui.tsx";
import { Toast } from "./shared.tsx";

// Slide 92–114: Pelatihan (UPT membuat program & kelas; Super Admin menindaklanjuti peserta tidak lulus).

const statusTone: Record<StatusPelatihan, "gray" | "blue" | "yellow" | "green" | "red"> = {
  siap_pelatihan: "blue",
  dikirim_ke_lms: "gray",
  pelatihan_berjalan: "yellow",
  lulus: "green",
  tidak_lulus: "red",
  pelatihan_ulang: "yellow",
};

const statusFilter = [
  "semua",
  "siap_pelatihan",
  "dikirim_ke_lms",
  "pelatihan_berjalan",
  "lulus",
  "tidak_lulus",
] as const;

/** ID program contoh; di data resmi berupa ID internal. */
const programId = (n: number) => `prg_${String(n).padStart(4, "0")}`;

const kelasBaru = (n: number): Kelas => ({
  id: `k${n}`,
  nama: `Kelas ${String.fromCharCode(64 + n)}`,
  admin: 1,
  maks: 30,
  pengajar: [],
});

export function Pelatihan({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState<(typeof statusFilter)[number]>("semua");
  const target = pesertaPelatihan.find((p) => p.id === sim.plTarget);
  // Peserta yang digugurkan tidak punya status lagi: kembali ke Guru Memenuhi Syarat (BR-035).
  const daftar = pesertaPelatihan.filter(
    (p) =>
      sim.plStatus[p.id] &&
      (filter === "semua" || sim.plStatus[p.id] === filter) &&
      `${p.nama} ${p.domisili}`.toLowerCase().includes(cari.toLowerCase()),
  );
  const programBaru = sim.plProgramBaru.map((id, i) => ({
    id,
    nama: `Pelatihan CKS Angkatan ${programPelatihan.length + i + 1}`,
    periode: "1 Jan – 31 Mar 2027",
    status: "Dikirim ke LMS",
  }));

  return (
    <div className="space-y-4 p-5">
      <Toast sim={sim} setSim={setSim} />
      <div data-tour="page-pelatihan" className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Pelatihan</h2>
        <div className="flex gap-2">
          <Btn tour="pl-lms" onClick={() => track("click_pelatihan_ke_lms_admin")}>
            Ke LMS Admin <ExternalLink size={12} />
          </Btn>
          <Btn
            variant="primary"
            tour="pl-buat"
            disabled={sim.peran !== "upt_gtk"}
            title={
              sim.peran !== "upt_gtk" ? "Program pelatihan dibuat oleh UPT (BR-030)" : undefined
            }
            onClick={() => {
              track("click_pelatihan_buat_program");
              setSim({
                screen: "pelatihan_buat_program",
                plTahap: 1,
                plAngkatan: String(programPelatihan.length + sim.plProgramBaru.length + 1),
                plKelas: [kelasBaru(1)],
                plKelasAktif: "k1",
                plPeserta: {},
                toast: null,
              });
            }}
          >
            <Plus size={14} /> Buat program pelatihan baru
          </Btn>
        </div>
      </div>

      <Card>
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Program Pelatihan</h3>
        </div>
        <Table head={["Nama Program", "Periode Pelatihan", "Status", "Aksi"]}>
          {[...programBaru.reverse(), ...programPelatihan].map((p) => (
            <tr key={p.id}>
              <Td className="font-medium text-slate-900">{p.nama}</Td>
              <Td>{p.periode}</Td>
              <Td>
                <Chip
                  tone={
                    p.status === "Selesai" ? "green" : p.status === "Berjalan" ? "yellow" : "blue"
                  }
                >
                  {p.status}
                </Chip>
              </Td>
              <Td>
                <Btn>Lihat detail</Btn>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Daftar Peserta yang Memenuhi Syarat
          </h3>
          <Btn tour="pl-unduh" onClick={() => track("download_peserta_pelatihan")}>
            <Download size={14} /> Unduh Daftar Peserta
          </Btn>
        </div>
        <div className="relative">
          <Search size={13} className="absolute top-2 left-2.5 text-slate-400" />
          <input
            className={clsx(inputClass, "pl-7")}
            placeholder="Cari nama atau domisili"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {statusFilter.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "rounded-full border px-2.5 py-0.5",
                filter === f
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600",
              )}
            >
              {f === "semua" ? "Semua" : statusPelatihanLabel[f]}
            </button>
          ))}
        </div>
        <div className="overflow-hidden rounded-md border border-slate-200">
          <Table
            head={[
              "Nama Kandidat",
              "Dinas",
              "Domisili",
              "Golongan",
              "Asal Sekolah",
              "Status Pelatihan",
              "",
            ]}
          >
            {daftar.map((p) => {
              const st = sim.plStatus[p.id];
              return (
                <tr key={p.id}>
                  <Td className="font-medium text-slate-900">{p.nama}</Td>
                  <Td>{p.dinas}</Td>
                  <Td>{p.domisili}</Td>
                  <Td>{p.golongan}</Td>
                  <Td>{p.asal}</Td>
                  <Td>
                    <Chip tone={statusTone[st]}>{statusPelatihanLabel[st]}</Chip>
                    {st === "pelatihan_ulang" && (
                      <span className="block text-[10px] text-slate-500">Batas: 31 Des 2027</span>
                    )}
                  </Td>
                  <Td>
                    {st === "tidak_lulus" && sim.peran === "super_admin" && (
                      <Btn
                        tour="pl-pilih-aksi"
                        onClick={() =>
                          setSim({ modal: "pl_tidak_lulus", plTarget: p.id, plAksi: null })
                        }
                      >
                        Pilih Aksi
                      </Btn>
                    )}
                  </Td>
                </tr>
              );
            })}
          </Table>
        </div>
        {sim.peran !== "super_admin" && (
          <p className="text-[11px] text-slate-500">
            Peserta Tidak Lulus ditindaklanjuti Super Admin (pelatihan ulang / gugurkan) setelah
            koordinasi dengan Dinas. Ganti peran di kanan atas untuk mencobanya.
          </p>
        )}
      </Card>

      {sim.modal === "pl_tidak_lulus" && target && (
        <Modal
          title={`Aksi untuk ${target.nama}`}
          subtitle="Peserta tidak lulus pelatihan"
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="pl-tidak-lulus-confirm"
                disabled={!sim.plAksi}
                onClick={() => {
                  track("click_pelatihan_tidak_lulus_aksi_confirm", {
                    aksi_tidak_lulus: sim.plAksi!,
                  });
                  const status = { ...sim.plStatus };
                  if (sim.plAksi === "pelatihan_ulang") status[target.id] = "pelatihan_ulang";
                  else delete status[target.id];
                  setSim({
                    modal: null,
                    plStatus: status,
                    toast:
                      sim.plAksi === "pelatihan_ulang"
                        ? `${target.nama} dapat mengikuti pelatihan ulang hingga 31 Desember 2027.`
                        : `${target.nama} digugurkan dan kembali ke daftar Guru Memenuhi Syarat.`,
                  });
                }}
              >
                Ya, Konfirmasi
              </Btn>
            </>
          }
        >
          {(["pelatihan_ulang", "gugurkan"] as const).map((a) => (
            <label key={a} className="flex items-center gap-2">
              <input
                type="radio"
                name="aksi-tl"
                checked={sim.plAksi === a}
                onChange={() => setSim({ plAksi: a })}
              />
              {a === "pelatihan_ulang" ? "Pelatihan Ulang" : "Gugurkan dari Seleksi"}
            </label>
          ))}
        </Modal>
      )}
    </div>
  );
}

const langkah = ["Atur Jadwal", "Kelas & Pengajar", "Pilih Peserta", "Ringkasan"];

export function BuatProgram({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const jumlahPeserta = Object.keys(sim.plPeserta).length;
  const jumlahPengajar = new Set(sim.plKelas.flatMap((k) => k.pengajar)).size;
  const kelasLengkap = sim.plKelas.every(
    (k) =>
      k.pengajar.length >= batasPelatihan.pengajarMin &&
      k.pengajar.length <= batasPelatihan.pengajarMax,
  );

  const keDaftar = (patch: Partial<SimState> = {}) => {
    setSim({ screen: "pelatihan", modal: null, ...patch });
    track("view_pelatihan");
  };

  return (
    <div className="space-y-4 p-5">
      <button
        onClick={() => keDaftar()}
        className="flex items-center gap-2 text-base font-semibold text-slate-900"
      >
        <ArrowLeft size={18} /> Buat Program Pelatihan
      </button>
      <Card>
        <Stepper active={sim.plTahap} steps={langkah} />
        {sim.plTahap === 1 && (
          <div className="grid grid-cols-2 gap-4 p-5 text-xs">
            <Field label="Angkatan ke- *">
              <input
                className={inputClass}
                inputMode="numeric"
                value={sim.plAngkatan}
                onChange={(e) => setSim({ plAngkatan: e.target.value.replace(/\D/g, "") })}
              />
            </Field>
            <div />
            <div className="col-span-2">
              <Field label="Deskripsi program *">
                <textarea
                  className={inputClass}
                  rows={2}
                  defaultValue="Pelatihan Calon Kepala Sekolah wilayah contoh."
                />
              </Field>
            </div>
            <Field label="Tanggal mulai *">
              <input type="date" className={inputClass} defaultValue="2027-01-04" />
            </Field>
            <Field label="Tanggal selesai *">
              <input type="date" className={inputClass} defaultValue="2027-03-31" />
            </Field>
          </div>
        )}
        {sim.plTahap === 2 && <KelasPengajar sim={sim} setSim={setSim} />}
        {sim.plTahap === 3 && <PilihPeserta sim={sim} setSim={setSim} />}
        {sim.plTahap === 4 && <Ringkasan sim={sim} />}
      </Card>

      <div className="flex justify-between">
        {sim.plTahap > 1 ? (
          <Btn onClick={() => setSim({ plTahap: (sim.plTahap - 1) as 1 | 2 | 3 })}>Sebelumnya</Btn>
        ) : (
          <span />
        )}
        {sim.plTahap === 1 && (
          <Btn
            variant="primary"
            tour="pl-jadwal-berikutnya"
            disabled={!sim.plAngkatan}
            onClick={() => {
              track("click_pelatihan_jadwal_berikutnya", { angkatan: Number(sim.plAngkatan) });
              setSim({ plTahap: 2 });
            }}
          >
            Berikutnya
          </Btn>
        )}
        {sim.plTahap === 2 && (
          <Btn
            variant="primary"
            disabled={!kelasLengkap}
            title={!kelasLengkap ? "Setiap kelas perlu 2–3 pengajar (BR-032)" : undefined}
            onClick={() => setSim({ plTahap: 3, plKelasAktif: sim.plKelas[0].id })}
          >
            Berikutnya
          </Btn>
        )}
        {sim.plTahap === 3 && (
          <Btn
            variant="primary"
            tour="pl-peserta-berikutnya"
            disabled={jumlahPeserta === 0}
            onClick={() => {
              track("click_pelatihan_peserta_berikutnya", {
                jumlah_kelas: sim.plKelas.length,
                jumlah_peserta: jumlahPeserta,
              });
              setSim({ plTahap: 4 });
            }}
          >
            Berikutnya
          </Btn>
        )}
        {sim.plTahap === 4 && (
          <Btn
            variant="primary"
            tour="pl-buat-program"
            onClick={() => setSim({ modal: "pl_buat_confirm" })}
          >
            Buat Program Pelatihan
          </Btn>
        )}
      </div>

      {sim.modal === "pl_pengajar" && <ModalPengajar sim={sim} setSim={setSim} />}
      {sim.modal === "pl_buat_confirm" && (
        <Modal
          title="Buat program pelatihan?"
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="pl-buat-confirm"
                onClick={() => {
                  const id = programId(programPelatihan.length + sim.plProgramBaru.length + 1);
                  track("click_pelatihan_buat_program_confirm", {
                    program_pelatihan_id: id,
                    angkatan: Number(sim.plAngkatan),
                    jumlah_kelas: sim.plKelas.length,
                    jumlah_peserta: jumlahPeserta,
                    jumlah_pengajar: jumlahPengajar,
                  });
                  const status = { ...sim.plStatus };
                  for (const pid of Object.keys(sim.plPeserta)) status[pid] = "dikirim_ke_lms";
                  keDaftar({
                    plProgramBaru: [...sim.plProgramBaru, id],
                    plStatus: status,
                    toast: "Berhasil kirim program pelatihan ke LMS Admin.",
                  });
                }}
              >
                Ya, Buat Program
              </Btn>
            </>
          }
        >
          <p className="text-slate-600">
            Program Angkatan {sim.plAngkatan} dengan {sim.plKelas.length} kelas dan {jumlahPeserta}{" "}
            peserta akan dikirim ke LMS Admin.
          </p>
        </Modal>
      )}
    </div>
  );
}

function KelasPengajar({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const ubah = (id: string, patch: Partial<Kelas>) =>
    setSim({ plKelas: sim.plKelas.map((k) => (k.id === id ? { ...k, ...patch } : k)) });

  return (
    <div className="space-y-4 p-5 text-xs">
      {sim.plKelas.map((k, i) => (
        <div key={k.id} className="space-y-3 rounded-lg border-l-4 border-blue-500 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">{k.nama}</p>
          {Array.from({ length: k.admin }, (_, a) => (
            <div key={a} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <Field label={`Nama admin kelas ${a + 1}`}>
                <input className={inputClass} defaultValue={`Admin ${k.nama} ${a + 1}`} />
              </Field>
              <Field label="Email admin kelas">
                <input className={inputClass} defaultValue={`admin${a + 1}.${k.id}@contoh.id`} />
              </Field>
              {a > 0 ? (
                <button
                  className="pb-1.5 text-rose-600"
                  aria-label="Hapus admin"
                  onClick={() => ubah(k.id, { admin: k.admin - 1 })}
                >
                  <X size={14} />
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
          <Btn
            disabled={k.admin >= batasPelatihan.admin}
            title={k.admin >= batasPelatihan.admin ? "Maks. 5 admin per kelas (BR-031)" : undefined}
            onClick={() => ubah(k.id, { admin: k.admin + 1 })}
          >
            <Plus size={12} /> Tambah Admin
          </Btn>
          <Field label="Maksimal peserta (maks. 40, BR-033)">
            <input
              type="number"
              min={1}
              max={batasPelatihan.peserta}
              className={clsx(inputClass, "w-28")}
              value={k.maks}
              onChange={(e) =>
                ubah(k.id, { maks: Math.min(batasPelatihan.peserta, Number(e.target.value)) })
              }
            />
          </Field>
          <div>
            <Btn
              tour={i === 0 ? "pl-pilih-pengajar" : undefined}
              onClick={() =>
                setSim({ modal: "pl_pengajar", plKelasAktif: k.id, plPengajarDraft: k.pengajar })
              }
            >
              <Plus size={12} /> Pilih Pengajar ({k.pengajar.length} terpilih)
            </Btn>
            <ul className="mt-2 space-y-1.5">
              {k.pengajar.map((pid) => {
                const pj = pengajar.find((x) => x.id === pid)!;
                return (
                  <li
                    key={pid}
                    className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2"
                  >
                    <span>
                      <b className="font-medium text-slate-900">{pj.nama}</b>
                      <span className="block text-[10px] text-slate-500">{pj.instansi}</span>
                    </span>
                    <button
                      className="text-rose-600"
                      aria-label={`Hapus ${pj.nama}`}
                      onClick={() => ubah(k.id, { pengajar: k.pengajar.filter((x) => x !== pid) })}
                    >
                      <X size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ))}
      <Btn
        tour="pl-tambah-kelas"
        className="w-full justify-center"
        onClick={() => {
          track("click_pelatihan_tambah_kelas");
          setSim({ plKelas: [...sim.plKelas, kelasBaru(sim.plKelas.length + 1)] });
        }}
      >
        <Plus size={12} /> Tambah Kelas
      </Btn>
    </div>
  );
}

function ModalPengajar({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const [cari, setCari] = useState("");
  const kelas = sim.plKelas.find((k) => k.id === sim.plKelasAktif);
  if (!kelas) return null;
  const draft = sim.plPengajarDraft;
  const valid =
    draft.length >= batasPelatihan.pengajarMin && draft.length <= batasPelatihan.pengajarMax;
  return (
    <Modal
      title={`Pilih Pengajar — ${kelas.nama}`}
      subtitle="Pilih 2–3 pengajar; boleh dari daerah lain (BR-032)"
      onClose={() => setSim({ modal: null })}
      width="max-w-xl"
      footer={
        <>
          <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
          <Btn
            variant="primary"
            tour="pl-pengajar-simpan"
            disabled={!valid}
            onClick={() => {
              track("click_pelatihan_pilih_pengajar_simpan", {
                jumlah_pengajar: draft.length,
                ada_pengajar_luar_daerah: draft.some(
                  (id) => pengajar.find((p) => p.id === id)?.luarDaerah,
                ),
              });
              setSim({
                modal: null,
                plKelas: sim.plKelas.map((k) =>
                  k.id === kelas.id ? { ...k, pengajar: draft } : k,
                ),
              });
            }}
          >
            Simpan Pilihan ({draft.length})
          </Btn>
        </>
      }
    >
      <div className="relative">
        <Search size={13} className="absolute top-2 left-2.5 text-slate-400" />
        <input
          className={clsx(inputClass, "pl-7")}
          placeholder="Cari nama pengajar / instansi / jabatan / lokasi"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
        />
      </div>
      <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
        {pengajar
          .filter((p) =>
            `${p.nama} ${p.instansi} ${p.jabatan} ${p.lokasi}`
              .toLowerCase()
              .includes(cari.toLowerCase()),
          )
          .map((p) => (
            <li key={p.id}>
              <label className="flex items-center gap-3 px-3 py-2">
                <input
                  type="checkbox"
                  checked={draft.includes(p.id)}
                  disabled={!draft.includes(p.id) && draft.length >= batasPelatihan.pengajarMax}
                  onChange={() =>
                    setSim({
                      plPengajarDraft: draft.includes(p.id)
                        ? draft.filter((x) => x !== p.id)
                        : [...draft, p.id],
                    })
                  }
                />
                <span className="flex-1">
                  <b className="font-medium text-slate-900">{p.nama}</b>
                  <span className="block text-[10px] text-slate-500">
                    {p.jabatan} · {p.instansi}
                  </span>
                </span>
                <Chip tone={p.luarDaerah ? "yellow" : "gray"}>{p.lokasi}</Chip>
              </label>
            </li>
          ))}
      </ul>
    </Modal>
  );
}

function PilihPeserta({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const [dinas, setDinas] = useState("semua");
  const kelas = sim.plKelas.find((k) => k.id === sim.plKelasAktif) ?? sim.plKelas[0];
  // Hanya peserta Siap Pelatihan atau Pelatihan Ulang yang bisa dimasukkan ke kelas.
  const tersedia = pesertaPelatihan.filter((p) =>
    ["siap_pelatihan", "pelatihan_ulang"].includes(sim.plStatus[p.id]),
  );
  const daftar = tersedia.filter((p) => dinas === "semua" || p.dinas === dinas);
  const dipilihKelas = Object.values(sim.plPeserta).filter((k) => k === kelas.id).length;
  const ditugaskan = Object.keys(sim.plPeserta).length;

  return (
    <div className="space-y-3 p-5 text-xs">
      <div className="flex flex-wrap gap-2">
        {sim.plKelas.map((k) => (
          <button
            key={k.id}
            onClick={() => setSim({ plKelasAktif: k.id })}
            className={clsx(
              "rounded-md border px-3 py-1.5",
              k.id === kelas.id ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200",
            )}
          >
            {k.nama} ({Object.values(sim.plPeserta).filter((x) => x === k.id).length}/{k.maks})
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2">
        Filter berdasarkan Dinas:
        <select
          className={clsx(inputClass, "w-40")}
          value={dinas}
          onChange={(e) => setDinas(e.target.value)}
        >
          <option value="semua">Semua Dinas</option>
          {[...new Set(pesertaPelatihan.map((p) => p.dinas))].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <Table head={["", "Nama Peserta", "Dinas", "Domisili", "Golongan", "Keterangan"]}>
          {daftar.map((p) => {
            const kelasLain = sim.plPeserta[p.id] && sim.plPeserta[p.id] !== kelas.id;
            const terpilih = sim.plPeserta[p.id] === kelas.id;
            const penuh = !terpilih && dipilihKelas >= kelas.maks;
            return (
              <tr key={p.id} className={clsx(kelasLain && "bg-slate-50 text-slate-400")}>
                <Td>
                  <input
                    type="checkbox"
                    aria-label={`Pilih ${p.nama}`}
                    disabled={Boolean(kelasLain) || penuh}
                    checked={terpilih || Boolean(kelasLain)}
                    onChange={() => {
                      const next = { ...sim.plPeserta };
                      if (terpilih) delete next[p.id];
                      else next[p.id] = kelas.id;
                      setSim({ plPeserta: next });
                    }}
                  />
                </Td>
                <Td className="font-medium">{p.nama}</Td>
                <Td>{p.dinas}</Td>
                <Td>{p.domisili}</Td>
                <Td>{p.golongan}</Td>
                <Td>
                  {kelasLain
                    ? `Sudah di ${sim.plKelas.find((k) => k.id === sim.plPeserta[p.id])?.nama} (BR-034)`
                    : statusPelatihanLabel[sim.plStatus[p.id]]}
                </Td>
              </tr>
            );
          })}
        </Table>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          ["Total Peserta", tersedia.length],
          ["Dipilih", dipilihKelas],
          ["Sudah ditugaskan", ditugaskan],
          ["Tersedia", tersedia.length - ditugaskan],
        ].map(([l, n]) => (
          <div key={l} className="rounded-md bg-slate-50 px-2 py-1.5">
            <p className="text-[10px] text-slate-500">{l}</p>
            <p className="font-semibold text-slate-900">{n}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Ringkasan({ sim }: { sim: SimState }) {
  const jumlahPeserta = Object.keys(sim.plPeserta).length;
  return (
    <div className="space-y-4 p-5 text-xs">
      <div>
        <p className="font-medium text-slate-900">Informasi Program</p>
        <p className="text-slate-600">Angkatan {sim.plAngkatan} · 4 Jan – 31 Mar 2027</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[
          ["Total Kelas", sim.plKelas.length],
          ["Total Peserta", jumlahPeserta],
          ["Total Pengajar", new Set(sim.plKelas.flatMap((k) => k.pengajar)).size],
          ["Hari Pelatihan", 87],
        ].map(([l, n]) => (
          <div key={l} className="rounded-md bg-blue-50 px-3 py-2">
            <p className="text-[10px] text-blue-700">{l}</p>
            <p className="text-sm font-semibold text-slate-900">{n}</p>
          </div>
        ))}
      </div>
      {sim.plKelas.map((k) => (
        <div key={k.id} className="rounded-md border border-slate-200 p-3">
          <p className="font-medium text-slate-900">{k.nama}</p>
          <p className="text-slate-600">
            Admin: {k.admin} · Pengajar:{" "}
            {k.pengajar.map((id) => pengajar.find((p) => p.id === id)?.nama).join(", ")}
          </p>
          <p className="text-slate-600">
            Peserta:{" "}
            {pesertaPelatihan
              .filter((p) => sim.plPeserta[p.id] === k.id)
              .map((p) => p.nama)
              .join(", ") || "–"}
          </p>
        </div>
      ))}
    </div>
  );
}
