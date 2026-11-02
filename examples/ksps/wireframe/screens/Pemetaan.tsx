import { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, Check, Download, Info, PlusCircle, Search, Trash2 } from "lucide-react";
import {
  alasanTambahSekolah,
  guruBcks,
  labelJabatan,
  labelKode,
  sekolahBelumTerdata,
  sekolahKebutuhan,
  type SekolahKebutuhan,
} from "../dummy.ts";
import type { SetSim, SimState } from "../sim.ts";
import { useTrack } from "@engine/wireframe/tracker.tsx";
import { Btn, Card, Chip, inputClass, Modal, Table, Td } from "@engine/wireframe/ui.tsx";
import { Toast } from "./shared.tsx";

// Slide 24–34: Pemetaan Kebutuhan KS; slide 35: Guru Memenuhi Syarat.

const tahunProyeksi = [2026, 2027, 2028, 2029, 2030]; // tahun berjalan s.d. +4 (BR-010)
const jenjangOpsi = ["semua", "tk", "sd", "smp", "sma"] as const;
const kondisiOpsi = [
  "semua",
  "segera_akhir_periode",
  "sudah_pensiun",
  "plt",
  "definitif",
  "segera_pensiun",
] as const;

function Chips<T extends string>({
  tour,
  label,
  opsi,
  nilai,
  hitung,
  onPilih,
}: {
  tour?: string;
  label?: string;
  opsi: readonly T[];
  nilai: T;
  hitung: (v: T) => number;
  onPilih: (v: T) => void;
}) {
  return (
    <div data-tour={tour} className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {label && <span className="mr-1 text-slate-500">{label}</span>}
      {opsi.map((o) => (
        <button
          key={o}
          onClick={() => onPilih(o)}
          className={clsx(
            "rounded-full border px-2.5 py-0.5",
            nilai === o
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
          )}
        >
          {o === "semua" ? "Semua" : o.length <= 3 ? o.toUpperCase() : labelKode(o)} ({hitung(o)})
        </button>
      ))}
    </div>
  );
}

/** Daftar sekolah di data kebutuhan, termasuk yang ditambahkan manual. */
function semuaSekolah(sim: SimState): SekolahKebutuhan[] {
  const manual = sekolahBelumTerdata
    .filter((t) => sim.pkTambahan.includes(t.id))
    .map<SekolahKebutuhan>((t) => ({
      id: t.id,
      nama: t.nama,
      npsn: t.npsn,
      jenjang: t.jenjang,
      ks: null,
      statusKs: "PLT Kepala Sekolah",
      statusSekolah: "negeri",
      periode: null,
      akhirPeriode: null,
      sisaBulan: null,
      kondisi: "plt",
    }));
  return [...sekolahKebutuhan, ...manual];
}

export function PemetaanKebutuhan({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const [cari, setCari] = useState("");
  const semua = semuaSekolah(sim);
  const lolosFilter = (s: SekolahKebutuhan, jenjang = sim.pkJenjang, kondisi = sim.pkKondisi) =>
    (jenjang === "semua" || s.jenjang === jenjang) &&
    (kondisi === "semua" || s.kondisi === kondisi);
  const daftar = semua.filter(
    (s) => lolosFilter(s) && s.nama.toLowerCase().includes(cari.toLowerCase()),
  );
  const dipetakan = sim.pkPetakan[sim.pkTahun] ?? [];
  const jumlahPetakan = (j?: string) =>
    semua.filter((s) => dipetakan.includes(s.id) && (!j || s.jenjang === j)).length;
  const kurang6Bulan = semua.filter((s) => s.sisaBulan !== null && s.sisaBulan < 6);
  const firstTag = daftar.find((s) => s.tag)?.id;
  const firstPeriode = daftar.find((s) => s.sisaBulan !== null && s.sisaBulan < 6)?.id;
  const target = semua.find((s) => s.id === sim.pkTarget);

  // Pencarian dikirim setelah berhenti mengetik 800 ms; isi kata kunci tidak dikirim.
  const jumlahHasil = daftar.length;
  useEffect(() => {
    if (!cari) return;
    const t = setTimeout(
      () =>
        track("click_demand_ks_search", {
          panjang_kata_kunci: cari.length,
          jumlah_hasil: jumlahHasil,
        }),
      800,
    );
    return () => clearTimeout(t);
  }, [cari, jumlahHasil, track]);

  return (
    <div className="space-y-4 p-5">
      <Toast sim={sim} setSim={setSim} />
      <div data-tour="page-pemetaan" className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Pemetaan Kebutuhan Kepala Sekolah
        </h2>
        <div className="flex gap-2">
          <Btn
            tour="pk-tambah"
            onClick={() => {
              track("click_manual_demand_tambah_sekolah");
              setSim({
                screen: "pemetaan_tambah_sekolah",
                pkDraft: [{ sekolah: "", alasan: "" }],
                toast: null,
              });
            }}
          >
            Tambah sekolah
          </Btn>
          <Btn
            variant="dark"
            tour="pk-unduh"
            onClick={() => track("download_demand_ks", { tahun_proyeksi: sim.pkTahun })}
          >
            <Download size={14} /> Unduh Daftar
          </Btn>
        </div>
      </div>

      {kurang6Bulan.length > 0 && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Terdapat {kurang6Bulan.length} sekolah dengan masa penugasan Kepala Sekolah kurang dari 6
          bulan. Pertimbangkan untuk memetakan sekolah tersebut.
        </p>
      )}

      <Card className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Petakan sekolah sesuai kebutuhan di daerah Anda
            </h3>
            <p className="text-[11px] text-slate-500">
              Sekolah yang Anda petakan akan menjadi pilihan pada Penugasan Kepala Sekolah.
            </p>
          </div>
          <select
            data-tour="pk-tahun"
            className={clsx(inputClass, "w-32")}
            value={sim.pkTahun}
            onChange={(e) => {
              const tahun = Number(e.target.value);
              track("click_demand_ks_proyeksi_tahun", { tahun_proyeksi: tahun });
              setSim({ pkTahun: tahun });
            }}
          >
            {tahunProyeksi.map((t) => (
              <option key={t} value={t}>
                Tahun {t}
              </option>
            ))}
          </select>
        </div>

        <div data-tour="pk-total" className="grid grid-cols-5 gap-2">
          {[
            ["Total Pemetaan", jumlahPetakan()],
            ["TK", jumlahPetakan("tk")],
            ["SD", jumlahPetakan("sd")],
            ["SMP", jumlahPetakan("smp")],
            ["SMA", jumlahPetakan("sma")],
          ].map(([l, n]) => (
            <div key={l} className="rounded-md bg-blue-50 px-3 py-2">
              <p className="text-[10px] font-medium text-blue-700">{l}</p>
              <p className="text-sm font-semibold text-slate-900">{n}</p>
            </div>
          ))}
        </div>

        <div className="relative" data-tour="pk-search">
          <Search size={13} className="absolute top-2 left-2.5 text-slate-400" />
          <input
            className={clsx(inputClass, "pl-7")}
            placeholder="Cari nama sekolah"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
        </div>

        <Chips
          tour="pk-filter-jenjang"
          opsi={jenjangOpsi}
          nilai={sim.pkJenjang}
          hitung={(j) => semua.filter((s) => lolosFilter(s, j)).length}
          onPilih={(j) => {
            track("click_demand_ks_filter", {
              filter_name: "jenjang",
              filter_value: j,
              jumlah_hasil: semua.filter((s) => lolosFilter(s, j)).length,
            });
            setSim({ pkJenjang: j });
          }}
        />
        <Chips
          tour="pk-filter-kondisi"
          opsi={kondisiOpsi}
          nilai={sim.pkKondisi}
          hitung={(k) => semua.filter((s) => lolosFilter(s, undefined, k)).length}
          onPilih={(k) => {
            track("click_demand_ks_filter", {
              filter_name: "kondisi_ks",
              filter_value: k,
              jumlah_hasil: semua.filter((s) => lolosFilter(s, undefined, k)).length,
            });
            setSim({ pkKondisi: k });
          }}
        />
      </Card>

      <Card>
        <Table
          head={[
            "Nama Sekolah",
            "Nama Kepala Sekolah",
            "Status KS",
            "Status Sekolah",
            "Periode",
            "Akhir Periode",
            "Petakan",
            "",
          ]}
        >
          {daftar.map((s, i) => {
            const aktif = dipetakan.includes(s.id);
            return (
              <tr key={s.id}>
                <Td className="font-medium text-slate-900">{s.nama}</Td>
                <Td>
                  <span className="flex items-center gap-1.5">
                    {s.ks ?? "–"}
                    {s.tag && (
                      <button
                        data-tour={s.id === firstTag ? "pk-info-rekomendasi" : undefined}
                        className="text-rose-600"
                        aria-label="Informasi rekomendasi"
                        onClick={() => {
                          track("click_demand_ks_info_rekomendasi", { tag_rekomendasi: s.tag! });
                          setSim({ modal: "pk_info_rekomendasi", pkTarget: s.id });
                        }}
                      >
                        <Info size={14} />
                      </button>
                    )}
                  </span>
                </Td>
                <Td>{s.statusKs}</Td>
                <Td>{labelKode(s.statusSekolah)}</Td>
                <Td>
                  <span className="flex items-center gap-1.5">
                    {s.periode ?? "–"}
                    {s.sisaBulan !== null && s.sisaBulan < 6 && (
                      <button
                        data-tour={s.id === firstPeriode ? "pk-info-periode" : undefined}
                        className="text-blue-600"
                        aria-label="Informasi periode penugasan"
                        onClick={() => {
                          track("click_demand_ks_info_periode", { sisa_masa_bulan: s.sisaBulan! });
                          setSim({ modal: "pk_info_periode", pkTarget: s.id });
                        }}
                      >
                        <Info size={14} />
                      </button>
                    )}
                  </span>
                </Td>
                <Td>{s.akhirPeriode ?? "–"}</Td>
                <Td>
                  <button
                    data-tour={i === 0 ? "pk-petakan" : undefined}
                    role="switch"
                    aria-checked={aktif}
                    aria-label={`Petakan ${s.nama}`}
                    onClick={() => {
                      track("click_demand_ks_petakan", {
                        aksi: aktif ? "batal_petakan" : "petakan",
                        npsn: s.npsn,
                        tahun_proyeksi: sim.pkTahun,
                        jenjang: s.jenjang,
                        kondisi_ks: s.kondisi,
                      });
                      setSim({
                        pkPetakan: {
                          ...sim.pkPetakan,
                          [sim.pkTahun]: aktif
                            ? dipetakan.filter((x) => x !== s.id)
                            : [...dipetakan, s.id],
                        },
                      });
                    }}
                    className={clsx(
                      "relative h-5 w-9 rounded-full transition",
                      aktif ? "bg-blue-600" : "bg-slate-300",
                    )}
                  >
                    <span
                      className={clsx(
                        "absolute top-0.5 flex size-4 items-center justify-center rounded-full bg-white transition-all",
                        aktif ? "left-4.5" : "left-0.5",
                      )}
                    >
                      {aktif && <Check size={10} className="text-blue-600" />}
                    </span>
                  </button>
                </Td>
                <Td>
                  <Btn
                    tour={i === 0 ? "pk-rincian" : undefined}
                    onClick={() => {
                      track("click_profile_school", { npsn: s.npsn });
                      setSim({ modal: "pk_rincian", pkTarget: s.id });
                    }}
                  >
                    Cek Rincian
                  </Btn>
                </Td>
              </tr>
            );
          })}
        </Table>
      </Card>

      {target && sim.modal === "pk_info_rekomendasi" && (
        <Modal
          title="Informasi Rekomendasi"
          onClose={() => setSim({ modal: null })}
          footer={<Btn onClick={() => setSim({ modal: null })}>Tutup</Btn>}
        >
          <p>
            <Chip tone="red">{labelKode(target.tag ?? "")}</Chip>
          </p>
          <p className="text-slate-600">
            Rekomendasi aksi untuk {target.ks} berdasarkan Permendikdasmen Nomor 7 Tahun 2025.
          </p>
        </Modal>
      )}
      {target && sim.modal === "pk_info_periode" && (
        <Modal
          title="Informasi Periode Penugasan"
          onClose={() => setSim({ modal: null })}
          footer={<Btn onClick={() => setSim({ modal: null })}>Tutup</Btn>}
        >
          <p className="text-slate-600">
            Masa penugasan {target.ks} di {target.nama} tersisa <b>{target.sisaBulan} bulan</b>{" "}
            (periode ke-{target.periode}, berakhir {target.akhirPeriode}).
          </p>
        </Modal>
      )}
      {target && sim.modal === "pk_rincian" && (
        <Modal
          title={target.nama}
          subtitle={`NPSN ${target.npsn}`}
          onClose={() => setSim({ modal: null })}
          footer={<Btn onClick={() => setSim({ modal: null })}>Tutup</Btn>}
        >
          <dl className="grid grid-cols-2 gap-3">
            {[
              ["Jenjang", target.jenjang.toUpperCase()],
              ["Status Sekolah", labelKode(target.statusSekolah)],
              ["Kepala Sekolah", target.ks ?? "–"],
              ["Status KS", target.statusKs],
              ["Kondisi", labelKode(target.kondisi)],
              ["Akhir Periode", target.akhirPeriode ?? "–"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] text-slate-500">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}
    </div>
  );
}

export function TambahSekolah({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const tersedia = sekolahBelumTerdata.filter((t) => !sim.pkTambahan.includes(t.id));
  const lengkap = sim.pkDraft.length > 0 && sim.pkDraft.every((d) => d.sekolah && d.alasan);
  const ubah = (i: number, patch: Partial<SimState["pkDraft"][number]>) =>
    setSim({ pkDraft: sim.pkDraft.map((d, j) => (j === i ? { ...d, ...patch } : d)) });
  const keDaftar = (patch: Partial<SimState> = {}) => {
    setSim({ screen: "pemetaan_kebutuhan", ...patch });
    track("view_demand_ks", { tahun_proyeksi: sim.pkTahun });
  };

  return (
    <div className="space-y-4 p-5">
      <button
        onClick={() => keDaftar()}
        className="flex items-center gap-2 text-base font-semibold text-slate-900"
      >
        <ArrowLeft size={18} /> Perbarui Data Kebutuhan Kepala Sekolah
      </button>
      <Card className="space-y-3 p-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Tambah sekolah</h3>
          <p className="text-[11px] text-slate-500">
            Tambah sekolah yang membutuhkan Kepala Sekolah dan belum terdaftar di data kebutuhan.
          </p>
        </div>
        <div className="overflow-hidden rounded-md border border-slate-200">
          <Table head={["No.", "Nama Sekolah", "Alasan", ""]}>
            {sim.pkDraft.map((d, i) => (
              <tr key={i}>
                <Td>{i + 1}</Td>
                <Td>
                  <select
                    className={inputClass}
                    value={d.sekolah}
                    onChange={(e) => ubah(i, { sekolah: e.target.value })}
                  >
                    <option value="">Ketik nama sekolah atau NPSN</option>
                    {tersedia.map((t) => (
                      <option
                        key={t.id}
                        value={t.id}
                        disabled={sim.pkDraft.some((x, j) => j !== i && x.sekolah === t.id)}
                      >
                        {t.nama} - {t.npsn}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <select
                    className={inputClass}
                    value={d.alasan}
                    onChange={(e) => ubah(i, { alasan: e.target.value })}
                  >
                    <option value="">Pilih alasan</option>
                    {alasanTambahSekolah.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <Btn
                    variant="link"
                    onClick={() => setSim({ pkDraft: sim.pkDraft.filter((_, j) => j !== i) })}
                  >
                    <Trash2 size={12} /> Hapus sekolah
                  </Btn>
                </Td>
              </tr>
            ))}
          </Table>
        </div>
        <Btn
          disabled={sim.pkDraft.length >= tersedia.length}
          onClick={() => setSim({ pkDraft: [...sim.pkDraft, { sekolah: "", alasan: "" }] })}
        >
          <PlusCircle size={14} /> Tambah sekolah
        </Btn>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <Btn onClick={() => keDaftar()}>Batal</Btn>
          <Btn
            variant="primary"
            tour="pk-tambah-simpan"
            disabled={!lengkap}
            onClick={() => {
              track("click_manual_demand_tambah_sekolah_simpan", {
                jumlah_peserta: sim.pkDraft.length,
              });
              keDaftar({
                pkTambahan: [...sim.pkTambahan, ...sim.pkDraft.map((d) => d.sekolah)],
                pkDraft: [],
                toast: `${sim.pkDraft.length} sekolah berhasil ditambahkan ke data kebutuhan.`,
              });
            }}
          >
            Simpan
          </Btn>
        </div>
        <p className="text-[11px] text-slate-500">
          Sekolah yang ditambahkan manual tidak mengubah data Dapodik (BR-005).
        </p>
      </Card>
    </div>
  );
}

const jabatanOpsi = ["semua", "kepala_sekolah", "guru", "guru_mantan_ks"] as const;

export function GuruMemenuhiSyarat({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const [cari, setCari] = useState("");
  const lolos = (g: (typeof guruBcks)[number], j = sim.gmsJenjang, jb = sim.gmsJabatan) =>
    (j === "semua" || g.jenjang === j) && (jb === "semua" || g.jabatan === jb);
  const daftar = guruBcks.filter(
    (g) => lolos(g) && g.nama.toLowerCase().includes(cari.toLowerCase()),
  );
  const target = guruBcks.find((g) => g.id === sim.gmsTarget);

  return (
    <div className="space-y-4 p-5">
      <Card className="space-y-3 p-4">
        <div data-tour="page-gms" className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-slate-900">Rincian Data BCKS</h2>
          <span className="text-[11px] text-slate-500">Terakhir diperbarui: 2 Maret 2026</span>
        </div>
        <div className="relative">
          <Search size={13} className="absolute top-2 left-2.5 text-slate-400" />
          <input
            className={clsx(inputClass, "pl-7")}
            placeholder="Cari nama BCKS"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
        </div>
        <Chips
          tour="gms-filter-jenjang"
          label="Filter berdasarkan jenjang:"
          opsi={jenjangOpsi}
          nilai={sim.gmsJenjang}
          hitung={(j) => guruBcks.filter((g) => lolos(g, j)).length}
          onPilih={(j) => {
            track("click_supply_bcks_filter", {
              filter_name: "jenjang",
              filter_value: j,
              jumlah_hasil: guruBcks.filter((g) => lolos(g, j)).length,
            });
            setSim({ gmsJenjang: j });
          }}
        />
        <div
          data-tour="gms-filter-jabatan"
          className="flex flex-wrap items-center gap-1.5 text-[11px]"
        >
          <span className="mr-1 text-slate-500">Filter berdasarkan jabatan:</span>
          {jabatanOpsi.map((jb) => (
            <button
              key={jb}
              onClick={() => {
                track("click_supply_bcks_filter", {
                  filter_name: "jabatan",
                  filter_value: jb,
                  jumlah_hasil: guruBcks.filter((g) => lolos(g, undefined, jb)).length,
                });
                setSim({ gmsJabatan: jb });
              }}
              className={clsx(
                "rounded-full border px-2.5 py-0.5",
                sim.gmsJabatan === jb
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {jb === "semua" ? "Semua" : labelJabatan[jb]} (
              {guruBcks.filter((g) => lolos(g, undefined, jb)).length})
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <Table
          head={[
            "Nama Lengkap",
            "Domisili",
            "Status Kepegawaian",
            "Jenjang",
            "Jabatan",
            "Keterangan",
            "Aksi",
          ]}
        >
          {daftar.map((g, i) => (
            <tr key={g.id}>
              <Td className="font-medium text-slate-900">{g.nama}</Td>
              <Td>{g.domisili}</Td>
              <Td>{g.kepegawaian}</Td>
              <Td>{g.jenjang.toUpperCase()}</Td>
              <Td>{labelJabatan[g.jabatan]}</Td>
              <Td>{g.keterangan}</Td>
              <Td>
                <Btn
                  tour={i === 0 ? "gms-profil" : undefined}
                  onClick={() => {
                    track("click_profile_bcks");
                    setSim({ modal: "gms_profil", gmsTarget: g.id });
                  }}
                >
                  Cek Profil
                </Btn>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {target && sim.modal === "gms_profil" && (
        <Modal
          title={target.nama}
          subtitle="Profil BCKS (data dari Dapodik)"
          onClose={() => setSim({ modal: null })}
          footer={<Btn onClick={() => setSim({ modal: null })}>Tutup</Btn>}
        >
          <dl className="grid grid-cols-2 gap-3">
            {[
              ["NIP", "19xxxxxxxxxxxxxx"],
              ["Domisili", target.domisili],
              ["Status Kepegawaian", target.kepegawaian],
              ["Jenjang", target.jenjang.toUpperCase()],
              ["Jabatan", labelJabatan[target.jabatan]],
              ["Keterangan", target.keterangan],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] text-slate-500">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}
    </div>
  );
}
