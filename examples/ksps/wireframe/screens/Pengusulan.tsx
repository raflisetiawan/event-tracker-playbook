import clsx from "clsx";
import { ArrowLeft, CheckCircle2, Search } from "lucide-react";
import { useState } from "react";
import { bcksUndangan, riwayatPengusulan, type BcksUndangan } from "../dummy.ts";
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
  Stepper,
  Table,
  Td,
} from "@engine/wireframe/ui.tsx";

// Slide 39–53: Pengusulan BCKS lewat Pengumuman (terbuka) atau Undangan (BCKS terpilih).

/** ID seleksi contoh; di data resmi berupa ID internal/hash. */
const seleksiId = (n: number) => `sel_${String(n).padStart(4, "0")}`;
const jenjangOpsi = ["semua", "tk", "sd", "smp", "sma"] as const;
const golonganOpsi = ["semua", "III/c", "III/d", "IV/a", "IV/b"];

export function PengusulanDaftar({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const baru = sim.pgBaru.map((b, i) => ({
    id: `baru-${i}`,
    nama: `Pengusulan ${riwayatPengusulan.length + i + 1}`,
    mulai: b.mulai || "Hari ini",
    akhir: b.akhir,
    jenis: b.jenis === "pengumuman" ? "Pengumuman" : "Undangan",
    baru: true,
  }));

  const buat = (jenis: "pengumuman" | "undangan") => {
    track(
      jenis === "pengumuman"
        ? "click_pengusulan_buat_pengumuman"
        : "click_pengusulan_buat_undangan",
    );
    setSim({ modal: "pg_konfirmasi_buat", pgJenis: jenis, toast: null });
  };

  return (
    <div className="space-y-4 p-5">
      <div data-tour="page-pengusulan" className="flex items-start justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900">
          Pengusulan Pelatihan BCKS (Proses Reguler) / Pengusulan BCKS (Proses Non-Reguler)
        </h2>
        <div className="flex shrink-0 gap-2">
          <Btn variant="dark" tour="pg-buat-pengumuman" onClick={() => buat("pengumuman")}>
            Buat Pengumuman
          </Btn>
          <Btn tour="pg-buat-undangan" onClick={() => buat("undangan")}>
            Buat Undangan
          </Btn>
        </div>
      </div>

      <Card>
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Daftar Riwayat Pengusulan</h3>
          <p className="text-[11px] text-slate-500">Terakhir diperbarui: 1 Januari 2026</p>
        </div>
        <Table head={["Nama", "Tanggal mulai", "Tanggal akhir", "Jenis Pengusulan", "Status"]}>
          {[...baru.reverse(), ...riwayatPengusulan.map((r) => ({ ...r, baru: false }))].map(
            (r) => (
              <tr key={r.id}>
                <Td>{r.nama}</Td>
                <Td>{r.mulai}</Td>
                <Td>{r.akhir}</Td>
                <Td>{r.jenis}</Td>
                <Td>
                  {/* Panduan hanya menampilkan status Selesai; status pengusulan berjalan diturunkan. */}
                  <Chip tone={r.baru ? "blue" : "green"}>{r.baru ? "Berjalan" : "Selesai"}</Chip>
                </Td>
              </tr>
            ),
          )}
        </Table>
      </Card>

      {sim.modal === "pg_konfirmasi_buat" && (
        <Modal
          title={sim.pgJenis === "pengumuman" ? "Konfirmasi Pengumuman" : "Konfirmasi Undangan"}
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="pg-lanjut-buat"
                onClick={() =>
                  setSim({
                    modal: null,
                    screen:
                      sim.pgJenis === "pengumuman"
                        ? "pengusulan_buat_pengumuman"
                        : "pengusulan_buat_undangan",
                    pgTahap: 1,
                    pgDipilih: [],
                    pgTanggalMulai: "",
                    pgTanggalAkhir: "",
                  })
                }
              >
                Lanjut buat {sim.pgJenis === "pengumuman" ? "Pengumuman" : "Undangan"}
              </Btn>
            </>
          }
        >
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-slate-700">
            {sim.pgJenis === "pengumuman"
              ? "Jika Anda mengumumkan, maka pengumuman ini akan terkirim kepada seluruh Guru Memenuhi Syarat dan Kepala Sekolah aktif di daerah sesuai kewenangan."
              : "Undangan hanya dikirim kepada BCKS yang Anda pilih dan bersifat personal."}
          </p>
        </Modal>
      )}
    </div>
  );
}

/** Modal konfirmasi kirim + pemberitahuan berhasil, dipakai pengumuman dan undangan. */
function KirimModals({
  sim,
  setSim,
  onConfirm,
}: {
  sim: SimState;
  setSim: SetSim;
  onConfirm: () => void;
}) {
  const track = useTrack();
  const jenis = sim.pgJenis === "pengumuman" ? "Pengumuman" : "Undangan";
  return (
    <>
      {sim.modal === "pg_kirim_confirm" && (
        <Modal
          title={`Kirim ${jenis}?`}
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn variant="primary" tour="pg-kirim-confirm" onClick={onConfirm}>
                Konfirmasi
              </Btn>
            </>
          }
        >
          <p className="text-slate-600">
            {sim.pgJenis === "pengumuman"
              ? `Periode seleksi administrasi akan dimulai. Batas pengumpulan berkas: ${sim.pgTanggalAkhir}.`
              : `Undangan dikirim ke ${sim.pgDipilih.length} BCKS untuk periode ${sim.pgTanggalMulai} s.d. ${sim.pgTanggalAkhir}.`}
          </p>
        </Modal>
      )}
      {sim.modal === "pg_berhasil" && (
        <Modal
          title={`${jenis} berhasil dikirim`}
          onClose={() => setSim({ modal: null })}
          footer={
            <Btn
              variant="primary"
              onClick={() => {
                setSim({ modal: null, screen: "pengusulan" });
                track("view_pengusulan", {
                  jumlah_riwayat: riwayatPengusulan.length + sim.pgBaru.length,
                });
              }}
            >
              Saya mengerti
            </Btn>
          }
        >
          <p className="flex items-center gap-2 text-slate-600">
            <CheckCircle2 size={16} className="text-emerald-600" />
            {sim.pgJenis === "pengumuman"
              ? "Semua BCKS memenuhi syarat di wilayah Anda akan menerima pengumuman seleksi administrasi."
              : "BCKS terpilih akan menerima undangan seleksi administrasi di email dan Ruang GTK."}
          </p>
        </Modal>
      )}
    </>
  );
}

function Kembali({ label, setSim }: { label: string; setSim: SetSim }) {
  const track = useTrack();
  return (
    <button
      onClick={() => {
        setSim({ screen: "pengusulan", modal: null });
        track("view_pengusulan", { jumlah_riwayat: riwayatPengusulan.length });
      }}
      className="flex items-center gap-2 text-base font-semibold text-slate-900"
    >
      <ArrowLeft size={18} /> {label}
    </button>
  );
}

export function BuatPengumuman({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  return (
    <div className="space-y-4 p-5">
      <Kembali label="Pengumuman" setSim={setSim} />
      <Card className="space-y-4 p-5 text-xs">
        <h3 className="text-sm font-semibold text-slate-900">Batas Waktu Seleksi Administrasi</h3>
        <Field label="Batas akhir kandidat BCKS mengumpulkan berkas *">
          <input
            type="date"
            data-tour="pg-tanggal-akhir"
            className={clsx(inputClass, "w-56")}
            value={sim.pgTanggalAkhir}
            onChange={(e) => setSim({ pgTanggalAkhir: e.target.value })}
          />
        </Field>
        <Field label="Dokumen Pengumuman * (PDF, maksimal 5 MB)">
          <FakeUpload name="Pengumuman Seleksi Administrasi.pdf" />
        </Field>
        <div className="flex justify-end">
          <Btn
            variant="primary"
            tour="pg-kirim-pengumuman"
            disabled={!sim.pgTanggalAkhir}
            onClick={() => {
              track("click_pengusulan_kirim_pengumuman", {
                tanggal_akhir_berkas: sim.pgTanggalAkhir,
              });
              setSim({ modal: "pg_kirim_confirm" });
            }}
          >
            Kirim Pengumuman
          </Btn>
        </div>
      </Card>
      <KirimModals
        sim={sim}
        setSim={setSim}
        onConfirm={() => {
          track("click_pengusulan_kirim_pengumuman_confirm", {
            seleksi_id: seleksiId(riwayatPengusulan.length + sim.pgBaru.length + 1),
            tanggal_akhir_berkas: sim.pgTanggalAkhir,
          });
          setSim({
            modal: "pg_berhasil",
            pgBaru: [...sim.pgBaru, { jenis: "pengumuman", mulai: "", akhir: sim.pgTanggalAkhir }],
          });
        }}
      />
    </div>
  );
}

export function BuatUndangan({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  return (
    <div className="space-y-4 p-5">
      <Kembali label="Undangan" setSim={setSim} />
      <Card>
        <Stepper
          active={sim.pgTahap}
          steps={["Pilih Batas Waktu", "Pilih BCKS", "Kirim Undangan"]}
        />

        {sim.pgTahap === 1 && (
          <div className="space-y-4 p-5 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tanggal mulai mengumpulkan berkas *">
                <input
                  type="date"
                  className={inputClass}
                  value={sim.pgTanggalMulai}
                  onChange={(e) => setSim({ pgTanggalMulai: e.target.value })}
                />
              </Field>
              <Field label="Tanggal akhir mengumpulkan berkas *">
                <input
                  type="date"
                  className={inputClass}
                  value={sim.pgTanggalAkhir}
                  onChange={(e) => setSim({ pgTanggalAkhir: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex justify-end">
              <Btn
                variant="primary"
                tour="pg-pilih-bcks"
                disabled={!sim.pgTanggalMulai || !sim.pgTanggalAkhir}
                onClick={() => {
                  track("click_pengusulan_undangan_pilih_bcks", {
                    tanggal_mulai_berkas: sim.pgTanggalMulai,
                    tanggal_akhir_berkas: sim.pgTanggalAkhir,
                  });
                  setSim({ pgTahap: 2 });
                }}
              >
                Pilih BCKS
              </Btn>
            </div>
          </div>
        )}

        {sim.pgTahap === 2 && <PilihBcks sim={sim} setSim={setSim} />}

        {sim.pgTahap === 3 && (
          <div className="space-y-4 p-5 text-xs">
            <p className="text-slate-600">
              {sim.pgDipilih.length} BCKS terpilih · periode {sim.pgTanggalMulai} s.d.{" "}
              {sim.pgTanggalAkhir}
            </p>
            <Field label="Dokumen undangan resmi dari Dinas Pendidikan * (PDF)">
              <FakeUpload name="Undangan Seleksi Administrasi.pdf" />
            </Field>
            <div className="flex justify-between">
              <Btn onClick={() => setSim({ pgTahap: 2 })}>Sebelumnya</Btn>
              <Btn
                variant="primary"
                tour="pg-kirim-undangan"
                onClick={() => setSim({ modal: "pg_kirim_confirm" })}
              >
                Kirim undangan
              </Btn>
            </div>
          </div>
        )}
      </Card>

      <KirimModals
        sim={sim}
        setSim={setSim}
        onConfirm={() => {
          track("click_pengusulan_kirim_undangan_confirm", {
            seleksi_id: seleksiId(riwayatPengusulan.length + sim.pgBaru.length + 1),
            jumlah_bcks: sim.pgDipilih.length,
            tanggal_mulai_berkas: sim.pgTanggalMulai,
            tanggal_akhir_berkas: sim.pgTanggalAkhir,
          });
          setSim({
            modal: "pg_berhasil",
            pgBaru: [
              ...sim.pgBaru,
              { jenis: "undangan", mulai: sim.pgTanggalMulai, akhir: sim.pgTanggalAkhir },
            ],
          });
        }}
      />

      {sim.modal === "pg_profil" && <ProfilBcks sim={sim} setSim={setSim} />}
    </div>
  );
}

function PilihBcks({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const [cari, setCari] = useState("");
  const lolos = (b: BcksUndangan, j = sim.pgJenjang, g = sim.pgGolongan) =>
    (j === "semua" || b.jenjang === j) && (g === "semua" || b.golongan === g);
  const daftar = bcksUndangan.filter(
    (b) => lolos(b) && `${b.nama} ${b.domisili}`.toLowerCase().includes(cari.toLowerCase()),
  );
  const ids = daftar.map((b) => b.id);
  const semuaDipilih = ids.length > 0 && ids.every((id) => sim.pgDipilih.includes(id));

  return (
    <div className="space-y-3 p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Pilih BCKS yang dapat mengikuti Seleksi Administrasi
        </h3>
        <span className="text-[11px] text-slate-500">Terakhir diperbarui: 1 Januari 2026</span>
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
      <div data-tour="pg-filter" className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {jenjangOpsi.map((j) => {
          const n = bcksUndangan.filter((b) => lolos(b, j)).length;
          return (
            <button
              key={j}
              onClick={() => {
                track("click_pengusulan_undangan_filter", {
                  filter_name: "jenjang",
                  filter_value: j,
                  jumlah_hasil: n,
                });
                setSim({ pgJenjang: j });
              }}
              className={clsx(
                "rounded-full border px-2.5 py-0.5",
                sim.pgJenjang === j
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {j === "semua" ? "Semua" : j.toUpperCase()} ({n})
            </button>
          );
        })}
        <select
          className={clsx(inputClass, "ml-2 w-36")}
          value={sim.pgGolongan}
          onChange={(e) => {
            const g = e.target.value;
            track("click_pengusulan_undangan_filter", {
              filter_name: "golongan",
              filter_value: g,
              jumlah_hasil: bcksUndangan.filter((b) => lolos(b, undefined, g)).length,
            });
            setSim({ pgGolongan: g });
          }}
        >
          {golonganOpsi.map((g) => (
            <option key={g} value={g}>
              {g === "semua" ? "Semua golongan" : `Golongan ${g}`}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Pilih semua"
                  checked={semuaDipilih}
                  onChange={() =>
                    setSim({
                      pgDipilih: semuaDipilih
                        ? sim.pgDipilih.filter((id) => !ids.includes(id))
                        : [...new Set([...sim.pgDipilih, ...ids])],
                    })
                  }
                />
              </th>
              {[
                "Nama Lengkap",
                "Umur",
                "Domisili",
                "Golongan",
                "Jenjang",
                "Jabatan",
                "Keterangan",
                "Aksi",
              ].map((h) => (
                <th key={h} className="px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {daftar.map((b, i) => (
              <tr key={b.id}>
                <Td>
                  <input
                    type="checkbox"
                    aria-label={`Pilih ${b.nama}`}
                    checked={sim.pgDipilih.includes(b.id)}
                    onChange={() =>
                      setSim({
                        pgDipilih: sim.pgDipilih.includes(b.id)
                          ? sim.pgDipilih.filter((x) => x !== b.id)
                          : [...sim.pgDipilih, b.id],
                      })
                    }
                  />
                </Td>
                <Td className="font-medium text-slate-900">{b.nama}</Td>
                <Td>{b.umur}</Td>
                <Td>{b.domisili}</Td>
                <Td>{b.golongan}</Td>
                <Td>{b.jenjang.toUpperCase()}</Td>
                <Td>{b.jabatan}</Td>
                <Td>{b.keterangan}</Td>
                <Td>
                  <Btn
                    tour={i === 0 ? "pg-cek-profil" : undefined}
                    onClick={() => {
                      track("click_pengusulan_undangan_cek_profil");
                      setSim({ modal: "pg_profil", pgTarget: b.id });
                    }}
                  >
                    Cek Profil
                  </Btn>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <Btn onClick={() => setSim({ pgTahap: 1 })}>Sebelumnya</Btn>
        <Btn
          variant="primary"
          tour="pg-ke-kirim"
          disabled={sim.pgDipilih.length === 0}
          onClick={() => {
            track("click_pengusulan_undangan_ke_kirim", { jumlah_bcks: sim.pgDipilih.length });
            setSim({ pgTahap: 3 });
          }}
        >
          Ke Kirim Undangan ({sim.pgDipilih.length})
        </Btn>
      </div>
    </div>
  );
}

function ProfilBcks({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const b = bcksUndangan.find((x) => x.id === sim.pgTarget);
  if (!b) return null;
  return (
    <Modal
      title={b.nama}
      subtitle="Profil BCKS (data dari Dapodik)"
      onClose={() => setSim({ modal: null })}
      footer={<Btn onClick={() => setSim({ modal: null })}>Tutup</Btn>}
    >
      <dl className="grid grid-cols-2 gap-3">
        {[
          ["NIP", "19xxxxxxxxxxxxxx"],
          ["Umur", String(b.umur)],
          ["Domisili", b.domisili],
          ["Golongan", b.golongan],
          ["Jenjang", b.jenjang.toUpperCase()],
          ["Jabatan", b.jabatan],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[10px] text-slate-500">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
