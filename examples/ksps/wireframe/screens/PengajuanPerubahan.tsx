import type { ReactNode } from "react";
import clsx from "clsx";
import { AlertTriangle, ArrowLeft, Download, Plus, Trash2 } from "lucide-react";
import { dasborDinas, ksPeriodisasi, ptkPppk, riwayatAwal, type Riwayat } from "../dummy.ts";
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
import { Toast } from "./shared.tsx";

// Slide 204–257: Pengajuan Perubahan — perubahan periodisasi KS (Dinas, verval UPT),
// pengaliran SK PPPK (Dinas, verval Super Admin), dan dasbor pemantauan (Super Admin).

const statusPengajuan = {
  menunggu: { label: "Menunggu Verval", tone: "yellow" },
  disetujui: { label: "Disetujui", tone: "green" },
  ditolak: { label: "Ditolak", tone: "red" },
} as const;

const formKosong: SimState["pdForm"] = {
  id: null,
  tipe: "reguler",
  tahun: "",
  sekolah: "",
  tmt: "",
  tst: "",
  noSk: "",
  tstLebih2018: false,
};

/** Hitung perubahan riwayat untuk atribut jumlah_riwayat_* . */
function hitungPerubahan(r: Riwayat[]) {
  return {
    jumlah_riwayat_ditambah: r.filter((x) => x.status === "baru").length,
    jumlah_riwayat_diubah: r.filter((x) => x.status === "diubah").length,
    jumlah_riwayat_dihapus: r.filter((x) => x.status === "dihapus").length,
  };
}

const tanggalHariIni = "1 November 2026";

export function PengajuanPerubahanDaftar({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const upt = sim.peran === "upt_gtk";
  const firstPeriksa = sim.pdPengajuan.find(
    (p) => p.jenis === "periodisasi" && p.status === "menunggu",
  )?.id;

  return (
    <div className="space-y-4 p-5">
      <Toast sim={sim} setSim={setSim} />
      <div data-tour="page-pengajuan-perubahan" className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Pengajuan Perubahan</h2>
        {!upt && (
          <Btn
            variant="primary"
            tour="pd-buat"
            onClick={() => setSim({ modal: "pd_jenis", toast: null })}
          >
            <Plus size={14} /> Buat pengajuan baru
          </Btn>
        )}
      </div>
      <Card>
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Daftar Riwayat Pengajuan Perubahan
          </h3>
          {upt && (
            <p className="text-[11px] text-slate-500">
              Tampilan UPT: periksa dan verval pengajuan periodisasi.
            </p>
          )}
        </div>
        <Table head={["Tanggal Pengajuan", "Jenis Pengajuan", "Nama", "Status", "Aksi"]}>
          {sim.pdPengajuan.map((p) => (
            <tr key={p.id}>
              <Td>{p.tanggal}</Td>
              <Td>{p.jenis === "periodisasi" ? "Perubahan Periodisasi" : "Pengaliran SK PPPK"}</Td>
              <Td>{p.nama}</Td>
              <Td>
                <Chip tone={statusPengajuan[p.status].tone}>{statusPengajuan[p.status].label}</Chip>
              </Td>
              <Td>
                {upt && p.jenis === "periodisasi" && p.status === "menunggu" ? (
                  <Btn
                    variant="primary"
                    tour={p.id === firstPeriksa ? "pd-periksa" : undefined}
                    onClick={() => {
                      track("click_periodisasi_upt_periksa");
                      setSim({ screen: "verval_periodisasi", pdVerval: p.id, pdHasil: null });
                    }}
                  >
                    Periksa
                  </Btn>
                ) : (
                  <Btn>Cek Pengajuan</Btn>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {sim.modal === "pd_jenis" && (
        <Modal
          title="Pilih jenis pengajuan perubahan"
          onClose={() => setSim({ modal: null })}
          width="max-w-xl"
        >
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                [
                  "periodisasi",
                  "Perubahan Periodisasi Kepala Sekolah",
                  "Sesuaikan riwayat masa jabatan KS.",
                ],
                ["sk_pppk", "Pengaliran Dokumen SK PPPK", "Alirkan SK PPPK ke Dapodik."],
              ] as const
            ).map(([jenis, judul, ket]) => (
              <button
                key={jenis}
                data-tour={`pd-jenis-${jenis}`}
                className="rounded-lg border border-slate-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50"
                onClick={() => {
                  track("click_pengajuan_perubahan_buat", { jenis_pengajuan_perubahan: jenis });
                  setSim(
                    jenis === "periodisasi"
                      ? {
                          modal: null,
                          screen: "pengajuan_perubahan_periodisasi",
                          pdKs: null,
                          pdTahap: 1,
                          pdRiwayat: riwayatAwal,
                          pdBlokir: null,
                        }
                      : { modal: null, screen: "pengaliran_sk_pppk", skTahap: 1, skPilih: [] },
                  );
                }}
              >
                <p className="font-semibold text-slate-900">{judul}</p>
                <p className="mt-1 text-slate-500">{ket}</p>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Kembali({ setSim, label }: { setSim: SetSim; label: string }) {
  const track = useTrack();
  return (
    <button
      onClick={() => {
        setSim({ screen: "pengajuan_perubahan", modal: null });
        track("view_pengajuan_perubahan", { jumlah_riwayat: 2 });
      }}
      className="flex items-center gap-2 text-base font-semibold text-slate-900"
    >
      <ArrowLeft size={18} /> {label}
    </button>
  );
}

/** Tabel riwayat masa jabatan dengan penanda Baru / Diubah / Dihapus (slide 230). */
function TabelRiwayat({
  riwayat,
  aksi,
}: {
  riwayat: Riwayat[];
  aksi?: (r: Riwayat, i: number) => ReactNode;
}) {
  const urut = [...riwayat].sort((a, b) => b.tahun.localeCompare(a.tahun));
  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <Table
        head={[
          "",
          "Satuan Pendidikan",
          "Tahun",
          "Nomor SK",
          "TMT",
          "TST",
          "Keterangan",
          ...(aksi ? ["Aksi"] : []),
        ]}
      >
        {urut.map((r, i) => (
          <tr
            key={r.id}
            className={clsx(
              r.status === "baru" && "bg-emerald-50",
              r.status === "diubah" && "bg-blue-50",
              r.status === "dihapus" && "bg-rose-50 text-rose-400 line-through",
            )}
          >
            <Td>
              {r.status !== "asli" && (
                <Chip tone={r.status === "baru" ? "green" : r.status === "diubah" ? "blue" : "red"}>
                  {r.status === "baru" ? "Baru" : r.status === "diubah" ? "Diubah" : "Dihapus"}
                </Chip>
              )}
            </Td>
            <Td>{r.sekolah}</Td>
            <Td>{r.tahun}</Td>
            <Td>{r.noSk}</Td>
            <Td>{r.tmt}</Td>
            <Td>{r.tst || "–"}</Td>
            <Td>
              {r.tipe === "arsip" ? "Arsip" : r.otomatis ? "Otomatis (tahun berjalan)" : "–"}
              {r.tunjangan && (
                <span className="block text-[10px] text-amber-700">
                  Ada tunjangan Sem. {r.tunjangan}
                </span>
              )}
            </Td>
            {aksi && <Td>{aksi(r, i)}</Td>}
          </tr>
        ))}
      </Table>
    </div>
  );
}

export function Periodisasi({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const ks = ksPeriodisasi.find((k) => k.id === sim.pdKs);
  const perubahan = hitungPerubahan(sim.pdRiwayat);
  const adaPerubahan = Object.values(perubahan).some((n) => n > 0);

  const blokir = (aturan: NonNullable<SimState["pdBlokir"]>["aturan"], r: Riwayat) => {
    const b = { aturan, tahun: r.tahun, semester: r.tunjangan ?? 1 };
    track("view_periodisasi_blokir_tunjangan", {
      aturan_tunjangan: b.aturan,
      tahun: Number(b.tahun),
      semester: b.semester,
    });
    setSim({ pdBlokir: b, modal: null });
  };

  return (
    <div className="space-y-4 p-5">
      <Kembali setSim={setSim} label="Perubahan Periodisasi" />
      <p className="-mt-2 text-[11px] text-slate-500">
        Pengajuan ini hanya berlaku untuk kepala sekolah di sekolah induk dengan status definitif.
      </p>
      <Card>
        <Stepper active={sim.pdTahap} steps={["Isi Data", "Ringkasan Pengajuan"]} />
        <div className="space-y-4 p-5 text-xs">
          {!ks ? (
            <Field label="Nama Kepala Sekolah">
              <select
                data-tour="pd-pilih-ks"
                className={clsx(inputClass, "w-72")}
                value=""
                onChange={(e) => setSim({ pdKs: e.target.value })}
              >
                <option value="">Ketik nama kepala sekolah</option>
                {ksPeriodisasi.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <dl className="flex gap-8">
                  {[
                    ["Nama", ks.nama],
                    ["Jabatan", ks.jabatan],
                    ["NIP", "19xxxxxxxxxxxxxx"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[10px] text-slate-500 uppercase">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                {sim.pdTahap === 1 && (
                  <button
                    aria-label="Ganti kepala sekolah"
                    className="text-rose-600"
                    onClick={() => setSim({ pdKs: null })}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-[10px] text-slate-500 uppercase">Periode pada SIM KSPSTK</p>
                  <p className="font-semibold">{ks.periodeSim}</p>
                  <p className="text-slate-500">{ks.masaSim}</p>
                </div>
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                  <p className="text-[10px] text-blue-700 uppercase">Periode baru</p>
                  <p className="font-semibold text-blue-900">{ks.periodeSim}</p>
                  <p className="text-blue-800">
                    {adaPerubahan ? "Dihitung ulang dari riwayat" : ks.masaSim}
                  </p>
                </div>
              </div>

              {sim.pdBlokir && (
                <p
                  data-tour="pd-blokir"
                  className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900"
                >
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {sim.pdBlokir.aturan === "hapus_riwayat"
                    ? `Riwayat tahun ${sim.pdBlokir.tahun} tidak dapat dihapus karena tercatat tunjangan KS Semester ${sim.pdBlokir.semester} (BR-074).`
                    : `TMT riwayat tahun ${sim.pdBlokir.tahun} tidak dapat diubah karena tunjangan Semester ${sim.pdBlokir.semester} sudah terbit (BR-075).`}{" "}
                  Hubungi Tim Pusat Regulasi Direktorat KSPSTK bila data sudah sesuai.
                </p>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Riwayat Masa Jabatan Kepala Sekolah
                </h3>
                {sim.pdTahap === 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Tambah Riwayat:</span>
                    {(["reguler", "arsip"] as const).map((tipe) => (
                      <Btn
                        key={tipe}
                        tour={`pd-tambah-${tipe}`}
                        onClick={() => {
                          track("click_periodisasi_tambah_riwayat", { tipe_riwayat: tipe });
                          setSim({ modal: "pd_form", pdForm: { ...formKosong, tipe } });
                        }}
                      >
                        <Plus size={12} /> Riwayat {tipe === "reguler" ? "Reguler" : "Arsip"}
                      </Btn>
                    ))}
                  </div>
                )}
              </div>
              <TabelRiwayat
                riwayat={sim.pdRiwayat}
                aksi={
                  sim.pdTahap === 1
                    ? (r) =>
                        r.otomatis || r.status === "dihapus" ? (
                          <span className="text-[10px] text-slate-400">
                            {r.otomatis ? "Terkunci (BR-072)" : ""}
                          </span>
                        ) : (
                          <span className="flex gap-2">
                            <Btn
                              variant="link"
                              tour={r.id === "r20" ? "pd-ubah" : undefined}
                              onClick={() =>
                                setSim({
                                  modal: "pd_form",
                                  pdForm: { ...formKosong, ...r, id: r.id, tstLebih2018: false },
                                })
                              }
                            >
                              Ubah
                            </Btn>
                            <Btn
                              variant="link"
                              className="text-rose-600"
                              tour={
                                r.id === "r22"
                                  ? "pd-hapus"
                                  : r.id === "r21"
                                    ? "pd-hapus-tunjangan"
                                    : undefined
                              }
                              onClick={() =>
                                r.tunjangan
                                  ? blokir("hapus_riwayat", r)
                                  : setSim({ modal: "pd_hapus", pdHapusId: r.id })
                              }
                            >
                              Hapus
                            </Btn>
                          </span>
                        )
                    : undefined
                }
              />
            </>
          )}
        </div>
      </Card>

      {ks && (
        <div className="flex justify-between">
          {sim.pdTahap === 2 ? <Btn onClick={() => setSim({ pdTahap: 1 })}>Kembali</Btn> : <span />}
          {sim.pdTahap === 1 ? (
            <Btn
              variant="primary"
              tour="pd-lanjut-ringkasan"
              disabled={!adaPerubahan}
              onClick={() => {
                track("click_periodisasi_lanjut_ringkasan", perubahan);
                setSim({ pdTahap: 2, pdBlokir: null });
              }}
            >
              Lanjut ke Ringkasan
            </Btn>
          ) : (
            <Btn variant="primary" tour="pd-ajukan" onClick={() => setSim({ modal: "pd_ajukan" })}>
              Ajukan Perubahan Periodisasi
            </Btn>
          )}
        </div>
      )}

      {sim.modal === "pd_form" && <FormRiwayat sim={sim} setSim={setSim} onBlokir={blokir} />}

      {sim.modal === "pd_hapus" && (
        <Modal
          title="Hapus riwayat masa jabatan?"
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                className="bg-rose-600 hover:bg-rose-700"
                tour="pd-hapus-confirm"
                onClick={() => {
                  const r = sim.pdRiwayat.find((x) => x.id === sim.pdHapusId)!;
                  track("click_periodisasi_riwayat_hapus_confirm", {
                    tipe_riwayat: r.tipe,
                    tahun: Number(r.tahun.slice(0, 4)),
                  });
                  setSim({
                    modal: null,
                    pdRiwayat:
                      r.status === "baru"
                        ? sim.pdRiwayat.filter((x) => x.id !== r.id)
                        : sim.pdRiwayat.map((x) =>
                            x.id === r.id ? { ...x, status: "dihapus" } : x,
                          ),
                  });
                }}
              >
                Ya, Hapus
              </Btn>
            </>
          }
        >
          <p className="text-slate-600">Riwayat akan ditandai Dihapus di ringkasan pengajuan.</p>
        </Modal>
      )}

      {sim.modal === "pd_ajukan" && (
        <Modal
          title="Konfirmasi pengajuan perubahan periodisasi"
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="pd-ajukan-confirm"
                onClick={() => {
                  track("click_periodisasi_ajukan_confirm", perubahan);
                  setSim({
                    modal: null,
                    screen: "pengajuan_perubahan",
                    pdPengajuan: [
                      {
                        id: `pp${sim.pdPengajuan.length + 1}`,
                        tanggal: tanggalHariIni,
                        jenis: "periodisasi",
                        nama: ks!.nama,
                        status: "menunggu",
                      },
                      ...sim.pdPengajuan,
                    ],
                    toast: "Pengajuan perubahan periodisasi terkirim dan menunggu verval UPT.",
                  });
                  track("view_pengajuan_perubahan", { jumlah_riwayat: sim.pdPengajuan.length + 1 });
                }}
              >
                Ajukan
              </Btn>
            </>
          }
        >
          <Field label="SPTJM * (PDF, maks. 5 MB)">
            <FakeUpload name="SPTJM.pdf" />
          </Field>
          <Field label="SK Pengangkatan KS Definitif Pertama * (PDF, maks. 5 MB)">
            <FakeUpload name="SK Definitif Pertama.pdf" />
          </Field>
          <Field label="Dokumen Pendukung Lainnya (opsional)">
            <FakeUpload name="Dokumen Pendukung.pdf" />
          </Field>
        </Modal>
      )}
    </div>
  );
}

function FormRiwayat({
  sim,
  setSim,
  onBlokir,
}: {
  sim: SimState;
  setSim: SetSim;
  onBlokir: (aturan: "hapus_riwayat" | "ubah_tmt" | "ubah_tst", r: Riwayat) => void;
}) {
  const track = useTrack();
  const f = sim.pdForm;
  const set = (patch: Partial<typeof f>) => setSim({ pdForm: { ...f, ...patch } });
  const arsip = f.tipe === "arsip";
  const lengkap = f.sekolah && f.tmt && f.noSk && (arsip ? f.tst || f.tstLebih2018 : f.tahun);

  return (
    <Modal
      title={`${f.id ? "Ubah" : "Tambah"} Riwayat ${arsip ? "Arsip (sebelum 2019)" : "Reguler"}`}
      subtitle={
        arsip
          ? "TST wajib, kecuali dicentang “Tahun TST lebih dari 2018” (BR-071)"
          : "Satu entri untuk setiap tahun menjabat (BR-070)"
      }
      onClose={() => setSim({ modal: null })}
      footer={
        <>
          <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
          <Btn
            variant="primary"
            tour="pd-form-simpan"
            disabled={!lengkap}
            onClick={() => {
              const asal = sim.pdRiwayat.find((x) => x.id === f.id);
              if (asal?.tunjangan && asal.tmt !== f.tmt) return onBlokir("ubah_tmt", asal);
              if (asal?.tunjangan && asal.tst !== f.tst) return onBlokir("ubah_tst", asal);
              const tahun = arsip
                ? `${f.tmt.slice(0, 4)}–${f.tstLebih2018 ? "2018" : f.tst.slice(0, 4)}`
                : f.tahun;
              track("click_periodisasi_riwayat_simpan", {
                aksi: f.id ? "ubah" : "tambah",
                tipe_riwayat: f.tipe,
                tahun: Number(tahun.slice(0, 4)),
              });
              const baru: Riwayat = {
                id: f.id ?? `n${Date.now()}`,
                tipe: f.tipe,
                tahun,
                sekolah: f.sekolah,
                tmt: f.tmt,
                tst: f.tstLebih2018 ? "" : f.tst,
                noSk: f.noSk,
                tunjangan: asal?.tunjangan,
                status: asal ? (asal.status === "baru" ? "baru" : "diubah") : "baru",
              };
              setSim({
                modal: null,
                pdBlokir: null,
                pdRiwayat: asal
                  ? sim.pdRiwayat.map((x) => (x.id === asal.id ? baru : x))
                  : [...sim.pdRiwayat, baru],
              });
            }}
          >
            Simpan
          </Btn>
        </>
      }
    >
      <Field label="Satuan pendidikan *">
        <input
          className={inputClass}
          value={f.sekolah}
          onChange={(e) => set({ sekolah: e.target.value })}
        />
      </Field>
      {!arsip && (
        <Field label="Tahun *">
          <select
            className={inputClass}
            value={f.tahun}
            onChange={(e) => set({ tahun: e.target.value })}
          >
            <option value="">Pilih tahun</option>
            {["2019", "2020", "2021", "2022", "2023", "2024", "2025"].map((t) => (
              <option
                key={t}
                value={t}
                disabled={sim.pdRiwayat.some(
                  (r) => r.tahun === t && r.id !== f.id && r.status !== "dihapus",
                )}
              >
                {t}
              </option>
            ))}
          </select>
        </Field>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="TMT *">
          <input
            type="date"
            className={inputClass}
            value={f.tmt}
            onChange={(e) => set({ tmt: e.target.value })}
          />
        </Field>
        <Field label={arsip ? "TST *" : "TST (opsional)"}>
          <input
            type="date"
            className={inputClass}
            disabled={f.tstLebih2018}
            value={f.tst}
            onChange={(e) => set({ tst: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nomor SK *">
          <input
            className={inputClass}
            value={f.noSk}
            onChange={(e) => set({ noSk: e.target.value })}
          />
        </Field>
        <Field label="Tanggal SK *">
          <input type="date" className={inputClass} defaultValue="2019-12-31" />
        </Field>
      </div>
      <Field label="Unggah SK * (PDF, maks. 5 MB)">
        <FakeUpload name="SK.pdf" />
      </Field>
      {arsip && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={f.tstLebih2018}
            onChange={(e) => set({ tstLebih2018: e.target.checked, tst: "" })}
          />
          Tahun TST lebih dari tahun 2018
        </label>
      )}
    </Modal>
  );
}

export function VervalPeriodisasi({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const p = sim.pdPengajuan.find((x) => x.id === sim.pdVerval);
  // Riwayat contoh yang diajukan: satu tahun baru dan satu dihapus.
  const riwayat: Riwayat[] = [
    ...riwayatAwal.filter((r) => r.id !== "r22"),
    { ...riwayatAwal[2], status: "dihapus" },
    {
      id: "v23",
      tipe: "reguler",
      tahun: "2023",
      sekolah: "SD Negeri 10",
      tmt: "2020-07-01",
      tst: "",
      noSk: "Peg.824/47/2020",
      status: "baru",
    },
  ];
  if (!p) return null;
  return (
    <div className="space-y-4 p-5">
      <Kembali setSim={setSim} label="Verval Perubahan Periodisasi" />
      <Card className="space-y-3 p-5 text-xs">
        <div className="flex items-center justify-between">
          <p>
            <b className="text-slate-900">{p.nama}</b> · diajukan {p.tanggal}
          </p>
          <div className="flex gap-2">
            <Btn>Lihat SK Pengangkatan KS Definitif Pertama</Btn>
            <Btn>Lihat Dokumen Pendukung</Btn>
          </div>
        </div>
        <TabelRiwayat riwayat={riwayat} />
        <div className="flex justify-end gap-2">
          <Btn
            tour="pd-tolak"
            onClick={() => setSim({ modal: "pd_verval_confirm", pdHasil: "ditolak" })}
          >
            Tolak Pengajuan
          </Btn>
          <Btn
            variant="primary"
            tour="pd-setujui"
            onClick={() => setSim({ modal: "pd_verval_confirm", pdHasil: "disetujui" })}
          >
            Setujui Pengajuan
          </Btn>
        </div>
      </Card>
      {sim.modal === "pd_verval_confirm" && sim.pdHasil && (
        <Modal
          title={sim.pdHasil === "disetujui" ? "Setujui pengajuan?" : "Tolak pengajuan?"}
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="pd-verval-confirm"
                onClick={() => {
                  track("click_periodisasi_upt_setujui_confirm", { hasil_verval: sim.pdHasil! });
                  setSim({
                    modal: null,
                    screen: "pengajuan_perubahan",
                    pdPengajuan: sim.pdPengajuan.map((x) =>
                      x.id === p.id ? { ...x, status: sim.pdHasil! } : x,
                    ),
                    toast: `Pengajuan ${p.nama} ${sim.pdHasil === "disetujui" ? "disetujui" : "ditolak"}.`,
                  });
                }}
              >
                {sim.pdHasil === "disetujui" ? "Ya, Setujui" : "Ya, Tolak"}
              </Btn>
            </>
          }
        >
          <p className="text-slate-600">Keputusan verval akan diteruskan ke Dinas Pendidikan.</p>
        </Modal>
      )}
    </div>
  );
}

export function PengaliranSk({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const dipilih = ptkPppk.filter((p) => sim.skPilih.includes(p.id));
  const jumlah_ptk = dipilih.length;
  return (
    <div className="space-y-4 p-5">
      <Kembali setSim={setSim} label="Pengaliran Dokumen Surat Keputusan (SK) PPPK" />
      <Card>
        <Stepper active={sim.skTahap} steps={["Pilih PTK", "Unggah Dokumen", "Ringkasan"]} />
        <div className="space-y-3 p-5 text-xs">
          {sim.skTahap === 1 && (
            <div className="overflow-hidden rounded-md border border-slate-200">
              <Table head={["", "Nama PTK", "NIP", "Sekolah", "Jabatan"]}>
                {ptkPppk.map((p) => (
                  <tr key={p.id}>
                    <Td>
                      <input
                        type="checkbox"
                        aria-label={`Pilih ${p.nama}`}
                        checked={sim.skPilih.includes(p.id)}
                        onChange={() =>
                          setSim({
                            skPilih: sim.skPilih.includes(p.id)
                              ? sim.skPilih.filter((x) => x !== p.id)
                              : [...sim.skPilih, p.id],
                          })
                        }
                      />
                    </Td>
                    <Td className="font-medium text-slate-900">{p.nama}</Td>
                    <Td>19xxxxxxxxxxxxxx</Td>
                    <Td>{p.sekolah}</Td>
                    <Td>{p.jabatan}</Td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
          {sim.skTahap === 2 &&
            dipilih.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 p-3"
              >
                <p className="col-span-2 font-semibold text-slate-900">{p.nama}</p>
                <Field label="Surat Keputusan (SK) *">
                  <FakeUpload name="SK PPPK.pdf" />
                </Field>
                <Field label="Surat Rekomendasi/Pertimbangan Teknis BKN *">
                  <FakeUpload name="Pertek BKN.pdf" />
                </Field>
                <Field label="Nomor SK *">
                  <input className={inputClass} defaultValue="800/123/2026" />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Tanggal SK *">
                    <input type="date" className={inputClass} defaultValue="2026-09-01" />
                  </Field>
                  <Field label="Tanggal efektif *">
                    <input type="date" className={inputClass} defaultValue="2026-10-01" />
                  </Field>
                </div>
              </div>
            ))}
          {sim.skTahap === 3 && (
            <Table head={["Nama PTK", "Sekolah", "Nomor SK", "Dokumen"]}>
              {dipilih.map((p) => (
                <tr key={p.id}>
                  <Td className="font-medium">{p.nama}</Td>
                  <Td>{p.sekolah}</Td>
                  <Td>800/123/2026</Td>
                  <Td>SK PPPK.pdf, Pertek BKN.pdf</Td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </Card>
      <div className="flex justify-between">
        {sim.skTahap > 1 ? (
          <Btn onClick={() => setSim({ skTahap: (sim.skTahap - 1) as 1 | 2 })}>Sebelumnya</Btn>
        ) : (
          <span />
        )}
        {sim.skTahap === 1 && (
          <Btn
            variant="primary"
            tour="sk-lanjut-unggah"
            disabled={jumlah_ptk === 0}
            onClick={() => {
              track("click_sk_pppk_lanjut_unggah", { jumlah_ptk });
              setSim({ skTahap: 2 });
            }}
          >
            Lanjut Unggah Dokumen
          </Btn>
        )}
        {sim.skTahap === 2 && (
          <Btn variant="primary" onClick={() => setSim({ skTahap: 3 })}>
            Lanjut Ringkasan
          </Btn>
        )}
        {sim.skTahap === 3 && (
          <Btn
            variant="primary"
            tour="sk-ajukan"
            onClick={() => setSim({ modal: "sk_ajukan_confirm" })}
          >
            Ajukan Perubahan
          </Btn>
        )}
      </div>
      {sim.modal === "sk_ajukan_confirm" && (
        <Modal
          title="Ajukan pengaliran SK PPPK?"
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="sk-ajukan-confirm"
                onClick={() => {
                  track("click_sk_pppk_ajukan_confirm", { jumlah_ptk });
                  const status = { ...sim.skStatus };
                  for (const p of dipilih) status[p.id] = "menunggu";
                  setSim({
                    modal: null,
                    screen: "pengajuan_perubahan",
                    skStatus: status,
                    pdPengajuan: [
                      {
                        id: `pp${sim.pdPengajuan.length + 1}`,
                        tanggal: tanggalHariIni,
                        jenis: "sk_pppk",
                        nama: `${jumlah_ptk} PTK`,
                        status: "menunggu",
                      },
                      ...sim.pdPengajuan,
                    ],
                    toast: "Pengajuan pengaliran SK PPPK terkirim dan menunggu verval Super Admin.",
                  });
                  track("view_pengajuan_perubahan", { jumlah_riwayat: sim.pdPengajuan.length + 1 });
                }}
              >
                Ya, Ajukan
              </Btn>
            </>
          }
        >
          <p className="text-slate-600">
            Data {jumlah_ptk} PTK akan dialirkan ke Dapodik setelah disetujui.
          </p>
        </Modal>
      )}
    </div>
  );
}

export function VervalSk({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const target = ptkPppk.find((p) => p.id === sim.skTarget);
  const firstMenunggu = ptkPppk.find((p) => sim.skStatus[p.id] === "menunggu")?.id;
  return (
    <div className="space-y-4 p-5">
      <Toast sim={sim} setSim={setSim} />
      <h2 data-tour="page-verval-sk" className="text-base font-semibold text-slate-900">
        Verval Pengajuan Pengaliran Dokumen SK PPPK
      </h2>
      <Card>
        <Table head={["Nama PTK", "Sekolah", "Dokumen", "Status", "Aksi"]}>
          {ptkPppk
            .filter((p) => sim.skStatus[p.id])
            .map((p) => {
              const st = sim.skStatus[p.id];
              return (
                <tr key={p.id}>
                  <Td className="font-medium text-slate-900">{p.nama}</Td>
                  <Td>{p.sekolah}</Td>
                  <Td>
                    <span className="flex gap-2">
                      <Btn variant="link">Lihat SK</Btn>
                      <Btn variant="link">Lihat dokumen</Btn>
                    </span>
                  </Td>
                  <Td>
                    <Chip tone={statusPengajuan[st].tone}>
                      {st === "menunggu" ? "Menunggu" : statusPengajuan[st].label}
                    </Chip>
                  </Td>
                  <Td>
                    {st === "menunggu" ? (
                      <span className="flex gap-2">
                        <Btn
                          variant="primary"
                          tour={p.id === firstMenunggu ? "sk-setuju" : undefined}
                          onClick={() =>
                            setSim({
                              modal: "sk_verval_confirm",
                              skTarget: p.id,
                              skHasil: "disetujui",
                            })
                          }
                        >
                          Setuju
                        </Btn>
                        <Btn
                          onClick={() =>
                            setSim({
                              modal: "sk_verval_confirm",
                              skTarget: p.id,
                              skHasil: "ditolak",
                            })
                          }
                        >
                          Tolak
                        </Btn>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Final</span>
                    )}
                  </Td>
                </tr>
              );
            })}
        </Table>
      </Card>
      {sim.modal === "sk_verval_confirm" && target && sim.skHasil && (
        <Modal
          title={
            sim.skHasil === "disetujui"
              ? `Setujui SK PPPK ${target.nama}?`
              : `Tolak SK PPPK ${target.nama}?`
          }
          subtitle="Keputusan bersifat final dan tidak dapat diubah"
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="sk-verval-confirm"
                onClick={() => {
                  track("click_sk_pppk_verval_confirm", { hasil_verval: sim.skHasil! });
                  setSim({
                    modal: null,
                    skStatus: { ...sim.skStatus, [target.id]: sim.skHasil! },
                    toast: `SK PPPK ${target.nama} ${sim.skHasil}.`,
                  });
                }}
              >
                {sim.skHasil === "disetujui" ? "Ya, Setujui" : "Ya, Tolak"}
              </Btn>
            </>
          }
        >
          {sim.skHasil === "ditolak" && (
            <Field label="Alasan Penolakan * (isi teks tidak dikirim ke tracker)">
              <textarea className={inputClass} rows={2} />
            </Field>
          )}
          <p className="text-slate-600">
            {sim.skHasil === "ditolak"
              ? "Berkas dikembalikan ke daerah untuk diperbarui."
              : "Data akan dialirkan ke Dapodik."}
          </p>
        </Modal>
      )}
    </div>
  );
}

export function DasborPerubahan() {
  const total = dasborDinas.reduce(
    (a, d) => ({
      jumlah: a.jumlah + d.jumlah,
      belum: a.belum + d.belum,
      sudah: a.sudah + d.sudah,
      setuju: a.setuju + d.setuju,
      tolak: a.tolak + d.tolak,
    }),
    { jumlah: 0, belum: 0, sudah: 0, setuju: 0, tolak: 0 },
  );
  return (
    <div className="space-y-4 p-5">
      <div data-tour="page-dasbor" className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Dasbor Pengajuan Perubahan</h2>
        <div className="flex gap-2">
          <select className={clsx(inputClass, "w-40")}>
            <option>Semua Provinsi</option>
          </select>
          <select className={clsx(inputClass, "w-44")}>
            <option>Semua Dinas Pendidikan</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {[
          ["Dinas mengajukan", dasborDinas.length],
          ["Jumlah pengajuan", total.jumlah],
          ["Belum diverval", total.belum],
          ["Sudah diverval", total.sudah],
          ["Disetujui", total.setuju],
          ["Ditolak", total.tolak],
        ].map(([l, n]) => (
          <Card key={l} className="p-3">
            <p className="text-[10px] text-slate-500">{l}</p>
            <p className="text-lg font-semibold text-slate-900">{n}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Rincian per Dinas Pendidikan</h3>
          <Btn>
            <Download size={14} /> Unduh Tabel
          </Btn>
        </div>
        <Table
          head={[
            "Dinas Pendidikan",
            "Jumlah",
            "Belum diverval",
            "Sudah diverval",
            "Disetujui",
            "Ditolak",
            "Aksi",
          ]}
        >
          {dasborDinas.map((d) => (
            <tr key={d.dinas}>
              <Td>
                <p className="font-medium text-slate-900">{d.dinas}</p>
                <p className="text-[10px] text-slate-400">{d.provinsi}</p>
              </Td>
              <Td>{d.jumlah}</Td>
              <Td>{d.belum}</Td>
              <Td>{d.sudah}</Td>
              <Td>{d.setuju}</Td>
              <Td>{d.tolak}</Td>
              <Td>
                <Btn>Cek Rincian</Btn>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
