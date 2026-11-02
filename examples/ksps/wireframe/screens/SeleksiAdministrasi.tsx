import { useState } from "react";
import clsx from "clsx";
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, Search, Users } from "lucide-react";
import {
  alasanTidakDilanjutkan,
  bcksUndangan,
  jenisDokumen,
  kuotaPelatihan,
  pesertaAdm,
  riwayatSeleksi,
  seleksiAktif,
  type HasilDok,
  type PesertaAdm,
} from "../dummy.ts";
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

// Slide 56–87: Seleksi Administrasi (cek berkas, selesaikan, pemilihan peserta substansi,
// tambah BCKS, atur seleksi); slide 89: Seleksi Substansi (tautan keluar).

const SEL = { seleksi_id: seleksiAktif };
const kuotaSubstansi = 2 * kuotaPelatihan;

type StatusCek =
  | "meninggal"
  | "belum_kumpul"
  | "perlu_cek"
  | "dalam_proses"
  | "valid"
  | "tidak_valid";

const statusLabel: Record<
  StatusCek,
  { label: string; tone: "gray" | "yellow" | "blue" | "green" | "red" }
> = {
  meninggal: { label: "Meninggal dunia", tone: "gray" },
  belum_kumpul: { label: "Belum kumpulkan berkas", tone: "gray" },
  perlu_cek: { label: "Perlu cek berkas", tone: "yellow" },
  dalam_proses: { label: "Dalam proses cek", tone: "blue" },
  valid: { label: "Valid", tone: "green" },
  tidak_valid: { label: "Tidak valid", tone: "red" },
};

const hasilLabel: Record<HasilDok, string> = {
  perlu: "Perlu divalidasi",
  valid: "Valid",
  tidak_valid: "Tidak Valid",
  perlu_diperbaiki: "Perlu Diperbaiki",
};

/** Peserta seleksi berjalan, termasuk BCKS yang ditambahkan (BR-029). */
function semuaPeserta(sim: SimState): PesertaAdm[] {
  const tambahan = bcksUndangan
    .filter((b) => sim.saTambahan.includes(b.id))
    .map<PesertaAdm>((b) => ({
      id: b.id,
      nama: b.nama,
      pengusulan: "Dinas",
      penugasan: "–",
      domisili: b.domisili,
      kepegawaian: "PNS",
      golongan: b.golongan,
      usia: b.umur,
      kumpul: false,
    }));
  return [...pesertaAdm, ...tambahan];
}

function statusCek(p: PesertaAdm, sim: SimState): StatusCek {
  if (p.meninggal) return "meninggal";
  if (!p.kumpul) return "belum_kumpul";
  const hasil = Object.values(sim.saDok[p.id] ?? {});
  if (hasil.every((h) => h === "perlu")) return "perlu_cek";
  if (hasil.some((h) => h === "perlu")) return "dalam_proses";
  // "Perlu Diperbaiki" dianggap selesai dicek tetapi belum lolos (turunan).
  return hasil.every((h) => h === "valid") ? "valid" : "tidak_valid";
}

export function SeleksiAdministrasiDaftar({ setSim }: { setSim: SetSim }) {
  return (
    <div className="space-y-4 p-5">
      <h2 data-tour="page-sa" className="text-base font-semibold text-slate-900">
        Seleksi Administrasi
      </h2>
      <Card>
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Riwayat Seleksi Administrasi</h3>
        </div>
        <Table head={["Nama", "Tanggal mulai", "Tanggal akhir", "Status", "Aksi"]}>
          {riwayatSeleksi.map((r, i) => (
            <tr key={r.id}>
              <Td>{r.nama}</Td>
              <Td>{r.mulai}</Td>
              <Td>{r.akhir}</Td>
              <Td>
                <Chip tone={r.status === "Berjalan" ? "blue" : "green"}>{r.status}</Chip>
              </Td>
              <Td>
                <Btn
                  tour={i === 0 ? "sa-buka-cek-berkas" : undefined}
                  onClick={() =>
                    setSim({
                      screen: "seleksi_administrasi_cek_berkas",
                      saPeserta: null,
                      toast: null,
                    })
                  }
                >
                  Cek berkas
                </Btn>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

export function CekBerkas({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const [cari, setCari] = useState("");
  const peserta = semuaPeserta(sim);
  const status = (p: PesertaAdm) => statusCek(p, sim);
  const aktifDicek = peserta.filter((p) => p.kumpul && !p.meninggal);
  const belumSelesai = aktifDicek.some((p) => ["perlu_cek", "dalam_proses"].includes(status(p)));
  const jumlahValid = aktifDicek.filter((p) => status(p) === "valid").length;
  const firstPerlu = peserta.find((p) => status(p) === "perlu_cek")?.id;
  const detail = peserta.find((p) => p.id === sim.saPeserta);

  const kembali = () => {
    setSim({ screen: "seleksi_administrasi", saPeserta: null, modal: null });
    track("view_seleksi_administrasi", { jumlah_riwayat: riwayatSeleksi.length });
  };

  return (
    <div className="space-y-4 p-5">
      <button
        onClick={kembali}
        className="flex items-center gap-2 text-base font-semibold text-slate-900"
      >
        <ArrowLeft size={18} /> Seleksi Administrasi
      </button>
      <Toast sim={sim} setSim={setSim} />

      {detail ? (
        <DetailBerkas p={detail} sim={sim} setSim={setSim} />
      ) : (
        <>
          <Card className="space-y-3 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Cek berkas peserta</h3>
                <p className="text-[11px] text-slate-500">
                  Cek berkas di bawah lalu klik Selesaikan untuk menyimpan ke Daftar Peserta dengan
                  Berkas Valid.
                </p>
              </div>
              <div className="flex gap-2">
                <Btn
                  tour="sa-tambah-bcks"
                  onClick={() => {
                    track("click_selections_tambah_bcks", SEL);
                    setSim({ modal: "sa_tambah_bcks", saTambahPilih: [] });
                  }}
                >
                  Tambah BCKS
                </Btn>
                <Btn
                  tour="sa-atur"
                  onClick={() => {
                    track("click_selections_atur_seleksi", SEL);
                    setSim({ modal: "sa_atur" });
                  }}
                >
                  Atur Seleksi
                </Btn>
                <Btn
                  variant="primary"
                  tour="sa-selesaikan"
                  disabled={belumSelesai}
                  title={
                    belumSelesai
                      ? "Selesaikan muncul setelah semua berkas divalidasi (BR-022)"
                      : undefined
                  }
                  onClick={() => {
                    track("click_selections_selesaikan", {
                      ...SEL,
                      jumlah_peserta: aktifDicek.length,
                      jumlah_berkas_valid: jumlahValid,
                    });
                    setSim({ modal: "sa_selesaikan" });
                  }}
                >
                  Selesaikan
                </Btn>
              </div>
            </div>
            <div className="flex justify-between rounded-md bg-blue-50 px-3 py-2 text-[11px] font-medium text-slate-700">
              <span>BATAS WAKTU PESERTA MENGUMPULKAN BERKAS</span>
              <span>1 Juni 2026</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                [
                  "Belum kumpulkan berkas",
                  peserta.filter((p) => status(p) === "belum_kumpul").length,
                ],
                ["Perlu cek berkas", peserta.filter((p) => status(p) === "perlu_cek").length],
                ["Berkas valid", jumlahValid],
              ].map(([l, n]) => (
                <div key={l} className="rounded-md border border-slate-200 px-3 py-2">
                  <p className="text-[10px] text-slate-500 uppercase">{l}</p>
                  <p className="text-base font-semibold text-slate-900">{n}</p>
                </div>
              ))}
            </div>
            <div className="relative">
              <Search size={13} className="absolute top-2 left-2.5 text-slate-400" />
              <input
                className={clsx(inputClass, "pl-7")}
                placeholder="Cari nama peserta"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
              />
            </div>
          </Card>

          <Card>
            <Table
              head={[
                "No.",
                "Nama Lengkap Peserta",
                "Pengusulan",
                "Penugasan Saat Ini",
                "Status Pengecekan Berkas",
                "Domisili",
                "",
              ]}
            >
              {peserta
                .filter((p) => p.nama.toLowerCase().includes(cari.toLowerCase()))
                .map((p, i) => {
                  const st = status(p);
                  const nonaktif = st === "meninggal" || st === "belum_kumpul";
                  return (
                    <tr key={p.id} className={clsx(p.meninggal && "bg-slate-50 text-slate-400")}>
                      <Td>{i + 1}</Td>
                      <Td>
                        <span className="flex items-center gap-1.5 font-medium">
                          {p.nama}
                          {p.meninggal && (
                            <AlertCircle
                              size={14}
                              className="text-rose-500"
                              aria-label="Meninggal dunia"
                            />
                          )}
                        </span>
                      </Td>
                      <Td>{p.pengusulan}</Td>
                      <Td>{p.penugasan}</Td>
                      <Td>
                        <Chip tone={statusLabel[st].tone}>{statusLabel[st].label}</Chip>
                      </Td>
                      <Td>{p.domisili}</Td>
                      <Td>
                        <Btn
                          variant={st === "perlu_cek" ? "outline" : "link"}
                          tour={p.id === firstPerlu ? "sa-cek-berkas" : undefined}
                          disabled={nonaktif}
                          onClick={() => {
                            track("click_selections_cek_berkas", SEL);
                            setSim({ saPeserta: p.id, toast: null });
                          }}
                        >
                          {st === "perlu_cek" ? "Cek berkas" : "Lihat berkas"}
                        </Btn>
                      </Td>
                    </tr>
                  );
                })}
            </Table>
          </Card>
        </>
      )}

      {sim.modal === "sa_validasi" && <ModalValidasi sim={sim} setSim={setSim} />}
      {sim.modal === "sa_selesaikan" && <ModalSelesaikan setSim={setSim} />}
      {sim.modal === "sa_tambah_bcks" && <ModalTambahBcks sim={sim} setSim={setSim} />}
      {sim.modal === "sa_atur" && <ModalAturSeleksi setSim={setSim} />}
    </div>
  );
}

function DetailBerkas({ p, sim, setSim }: { p: PesertaAdm; sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const st = statusCek(p, sim);
  const firstPerlu = jenisDokumen.find((d) => sim.saDok[p.id]?.[d.kode] === "perlu")?.kode;
  return (
    <div className="space-y-4">
      <Btn variant="link" onClick={() => setSim({ saPeserta: null })}>
        <ArrowLeft size={12} /> Kembali ke daftar peserta
      </Btn>
      <Card className="space-y-2 p-4 text-xs">
        <p className="font-medium text-slate-900">
          Apa saja yang perlu diperhatikan saat melakukan pengecekan berkas?
        </p>
        <p className="text-slate-600">
          Keaslian dokumen · Masa berlaku dokumen (mis. SKCK belum habis) · Kesesuaian dokumen
          dengan kriteria seleksi Kepala Sekolah.
        </p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">{p.nama}</p>
          <Chip tone={statusLabel[st].tone}>{statusLabel[st].label}</Chip>
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
          {[
            ["Penugasan saat ini", p.penugasan],
            ["Domisili", p.domisili],
            ["Status Kepegawaian", p.kepegawaian],
            ["Pangkat/Golongan", p.golongan],
            ["Usia", `${p.usia} tahun`],
            ["Pengusulan", p.pengusulan],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[10px] text-slate-500">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card>
        <Table head={["Nama Dokumen", "Status", "Lampiran"]}>
          {jenisDokumen.map((d) => {
            const h = sim.saDok[p.id]?.[d.kode] ?? "perlu";
            return (
              <tr key={d.kode}>
                <Td>
                  {d.label}
                  {d.kode === "sk_pengalaman_manajerial" && p.kepegawaian === "PPPK" && (
                    <span className="block text-[10px] text-slate-400">
                      + pengalaman sebagai Guru (PPPK)
                    </span>
                  )}
                </Td>
                <Td>
                  <Chip tone={h === "valid" ? "green" : h === "perlu" ? "yellow" : "red"}>
                    {hasilLabel[h]}
                  </Chip>
                </Td>
                <Td>
                  {h === "perlu" ? (
                    <Btn
                      tour={d.kode === firstPerlu ? "sa-validasi-dok" : undefined}
                      onClick={() => {
                        track("click_selections_cek_berkas_validasi_dokumen", {
                          ...SEL,
                          jenis_dokumen: d.kode,
                        });
                        setSim({ modal: "sa_validasi", saDokAktif: d.kode, saHasil: null });
                      }}
                    >
                      Validasi dokumen
                    </Btn>
                  ) : (
                    <span className="text-[11px] text-slate-400">Terkunci (BR-021)</span>
                  )}
                </Td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}

function ModalValidasi({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const p = semuaPeserta(sim).find((x) => x.id === sim.saPeserta);
  const dok = jenisDokumen.find((d) => d.kode === sim.saDokAktif);
  if (!p || !dok) return null;
  const attrs = { ...SEL, jenis_dokumen: dok.kode };
  return (
    <Modal
      title={`Validasi ${dok.label}`}
      subtitle={p.nama}
      onClose={() => setSim({ modal: null })}
      footer={
        <>
          <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
          <Btn
            variant="primary"
            tour="sa-validasi-konfirmasi"
            disabled={!sim.saHasil}
            onClick={() => {
              const hasil = sim.saHasil!;
              if (hasil === "valid")
                track("click_selections_cek_berkas_validasi_dokumen_valid_confirm", attrs);
              if (hasil === "tidak_valid") {
                track("click_selections_cek_berkas_validasi_dokumen_tidak_valid_simpan", attrs);
              }
              const dokBaru = { ...sim.saDok[p.id], [dok.kode]: hasil };
              const selesai = Object.values(dokBaru).every((h) => h !== "perlu");
              const lolos = Object.values(dokBaru).every((h) => h === "valid");
              setSim({
                modal: null,
                saDok: { ...sim.saDok, [p.id]: dokBaru },
                toast: selesai
                  ? lolos
                    ? "BCKS ini lolos pengecekan berkas!"
                    : "Pengecekan berkas selesai; BCKS ini tidak lolos pengecekan berkas."
                  : null,
              });
            }}
          >
            {sim.saHasil === "tidak_valid" ? "Simpan" : "Konfirmasi"}
          </Btn>
        </>
      }
    >
      <FakeUpload name={`${dok.label}.pdf`} />
      <fieldset className="space-y-1.5">
        <legend className="mb-1 text-slate-600">
          Hasil validasi (tidak dapat diubah setelah dikonfirmasi)
        </legend>
        {(["valid", "tidak_valid", "perlu_diperbaiki"] as const).map((h) => (
          <label
            key={h}
            data-tour={h === "perlu_diperbaiki" ? "sa-opsi-perbaiki" : undefined}
            className="flex items-center gap-2"
          >
            <input
              type="radio"
              name="hasil-dok"
              checked={sim.saHasil === h}
              onChange={() => {
                if (h === "perlu_diperbaiki") {
                  track("click_selections_cek_berkas_validasi_dokumen_perbaiki", attrs);
                }
                setSim({ saHasil: h });
              }}
            />
            {hasilLabel[h]}
          </label>
        ))}
      </fieldset>
    </Modal>
  );
}

function ModalSelesaikan({ setSim }: { setSim: SetSim }) {
  const track = useTrack();
  return (
    <Modal
      title="Lanjutkan ke tahap berikutnya"
      onClose={() => setSim({ modal: null })}
      width="max-w-xl"
    >
      <div className="grid grid-cols-2 gap-3">
        <button
          data-tour="sa-ke-substansi"
          className="rounded-lg border border-slate-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50"
          onClick={() => {
            track("click_selections_ke_seleksi_substansi", SEL);
            setSim({
              modal: null,
              screen: "seleksi_administrasi_pilih_peserta_substansi",
              saPilih: [],
            });
          }}
        >
          <p className="font-semibold text-slate-900">Ke Pemilihan Peserta Seleksi Substansi</p>
          <p className="mt-1 text-slate-500">Penugasan secara reguler.</p>
        </button>
        <button
          data-tour="sa-ke-nonreguler"
          className="rounded-lg border border-slate-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50"
          onClick={() => {
            track("click_selections_ke_non_reguler", SEL);
            setSim({ modal: null, screen: "penugasan_non_reguler", jalur: "non_reguler" });
            track("view_penugasan_non_reguler", { jumlah_riwayat: 3 });
          }}
        >
          <p className="font-semibold text-slate-900">Ke Penugasan Non-Reguler</p>
          <p className="mt-1 text-slate-500">
            Untuk kebutuhan mendesak; hanya sebelum pemilihan peserta seleksi substansi (BR-023).
          </p>
        </button>
      </div>
    </Modal>
  );
}

function ModalTambahBcks({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const tersedia = bcksUndangan.filter((b) => !sim.saTambahan.includes(b.id));
  return (
    <Modal
      title="Tambah BCKS ke Seleksi Administrasi"
      subtitle="BCKS memenuhi syarat yang dapat ditambahkan ke seleksi yang sedang berjalan"
      onClose={() => setSim({ modal: null })}
      footer={
        <>
          <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
          <Btn
            variant="primary"
            tour="sa-tambah-confirm"
            disabled={sim.saTambahPilih.length === 0}
            onClick={() => {
              track("click_selections_tambah_bcks_confirm", {
                ...SEL,
                jumlah_bcks: sim.saTambahPilih.length,
              });
              setSim({
                modal: null,
                saTambahan: [...sim.saTambahan, ...sim.saTambahPilih],
                toast: `${sim.saTambahPilih.length} BCKS ditambahkan ke seleksi administrasi.`,
              });
            }}
          >
            Konfirmasi ({sim.saTambahPilih.length})
          </Btn>
        </>
      }
    >
      <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
        {tersedia.map((b) => (
          <li key={b.id}>
            <label className="flex items-center gap-3 px-3 py-2">
              <input
                type="checkbox"
                checked={sim.saTambahPilih.includes(b.id)}
                onChange={() =>
                  setSim({
                    saTambahPilih: sim.saTambahPilih.includes(b.id)
                      ? sim.saTambahPilih.filter((x) => x !== b.id)
                      : [...sim.saTambahPilih, b.id],
                  })
                }
              />
              <span className="font-medium text-slate-900">{b.nama}</span>
              <span className="text-slate-500">
                NIP 19xxxxxxxxxxxxxx · {b.jenjang.toUpperCase()} · {b.domisili}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function ModalAturSeleksi({ setSim }: { setSim: SetSim }) {
  const [tab, setTab] = useState<"perpanjang" | "batalkan">("perpanjang");
  return (
    <Modal
      title="Atur Seleksi"
      onClose={() => setSim({ modal: null })}
      footer={
        <>
          <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
          <Btn
            variant="primary"
            onClick={() =>
              setSim({
                modal: null,
                toast:
                  tab === "perpanjang"
                    ? "Batas waktu berhasil diperpanjang."
                    : "Seleksi administrasi dibatalkan.",
              })
            }
          >
            {tab === "perpanjang" ? "Simpan" : "Batalkan seleksi"}
          </Btn>
        </>
      }
    >
      <div className="inline-flex rounded-md border border-slate-300 p-0.5">
        {(["perpanjang", "batalkan"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "rounded px-3 py-1",
              tab === t ? "bg-blue-600 text-white" : "text-slate-600",
            )}
          >
            {t === "perpanjang" ? "Perpanjang batas waktu" : "Batalkan seleksi"}
          </button>
        ))}
      </div>
      {tab === "perpanjang" ? (
        <>
          <Field label="Batas waktu baru">
            <input type="date" className={inputClass} defaultValue="2026-06-15" />
          </Field>
          <Field label="Alasan perpanjangan * (BR-027)">
            <textarea className={inputClass} rows={2} />
          </Field>
        </>
      ) : (
        <>
          <Field label="Surat Permohonan Pembatalan Seleksi * (PDF, maks. 2 MB, BR-028)">
            <FakeUpload name="Surat Pembatalan.pdf" />
          </Field>
          <Field label="Alasan pembatalan *">
            <textarea className={inputClass} rows={2} />
          </Field>
        </>
      )}
    </Modal>
  );
}

const danaOpsi = [
  { kode: "apbn", label: "APBN" },
  { kode: "apbd", label: "APBD" },
  { kode: "lainnya", label: "Sumber lainnya yang sah" },
];

export function PilihPesertaSubstansi({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const kandidat = semuaPeserta(sim).filter(
    (p) =>
      statusCek(p, sim) === "valid" && sim.saKeputusan[p.id]?.keputusan !== "tidak_dilanjutkan",
  );
  const digugurkan = semuaPeserta(sim).filter(
    (p) => sim.saKeputusan[p.id]?.keputusan === "tidak_dilanjutkan",
  );
  const dilanjutkan = kandidat.filter((p) => sim.saKeputusan[p.id]?.keputusan === "dilanjutkan");
  const hitungDana = (d: string | null) =>
    kandidat.filter((p) => (sim.saKeputusan[p.id]?.dana ?? null) === d).length;
  const semuaDipilih = kandidat.length > 0 && kandidat.every((p) => sim.saPilih.includes(p.id));
  const kuotaLebih = sim.saKuotaLebih && dilanjutkan.length > kuotaSubstansi;
  const terkunci = sim.saTerkirim;

  const setKeputusan = (ids: string[], patch: { keputusan?: "dilanjutkan"; dana?: string }) => {
    const next = { ...sim.saKeputusan };
    for (const id of ids) {
      next[id] = { keputusan: next[id]?.keputusan ?? null, dana: next[id]?.dana ?? null, ...patch };
    }
    return next;
  };

  return (
    <div className="space-y-4 p-5">
      <button
        onClick={() => setSim({ screen: "seleksi_administrasi_cek_berkas", saPeserta: null })}
        className="flex items-center gap-2 text-base font-semibold text-slate-900"
      >
        <ArrowLeft size={18} /> Cek Berkas
      </button>
      <Toast sim={sim} setSim={setSim} />

      {terkunci && (
        <Card className="flex items-center justify-between border-emerald-200 bg-emerald-50 p-4 text-xs">
          <span className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 size={16} /> Undangan seleksi substansi terkirim ke {dilanjutkan.length}{" "}
            peserta. Data peserta terkunci (BR-026).
          </span>
          <Btn variant="dark" onClick={() => track("click_seleksi_substansi_manajemen")}>
            Manajemen Seleksi Substansi <ExternalLink size={12} />
          </Btn>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-3">
        {[
          ["APBN", hitungDana("apbn")],
          ["APBD", hitungDana("apbd")],
          ["Sumber Dana Lainnya", hitungDana("lainnya")],
          ["Belum Ditentukan", hitungDana(null)],
        ].map(([l, n]) => (
          <Card key={l} className="flex items-center justify-between p-3">
            <div>
              <p className="text-[11px] text-slate-500">{l}</p>
              <p className="text-lg font-semibold text-slate-900">{n}</p>
              <p className="text-[10px] text-slate-400">orang</p>
            </div>
            <Users size={16} className="text-slate-400" />
          </Card>
        ))}
      </div>

      {kuotaLebih && (
        <p
          data-tour="sa-kuota-warning"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800"
        >
          Jumlah peserta yang dipilih melebihi batas kuota Seleksi Substansi ({dilanjutkan.length}{" "}
          dari maks. {kuotaSubstansi}). Gugurkan peserta dengan aksi “Tidak dilanjutkan”.
        </p>
      )}

      <Card className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Hasil Seleksi Administrasi BCKS untuk pengusulan Seleksi Substansi
            </h3>
            <ul className="mt-1 list-disc pl-4 text-[11px] text-slate-500">
              <li>
                Pilih BCKS sesuai kuota Seleksi Substansi: {kuotaSubstansi} peserta (2 × kuota
                pelatihan {kuotaPelatihan}, BR-024).
              </li>
              <li>
                Pastikan untuk menggugurkan BCKS yang tidak diloloskan pada Seleksi Administrasi.
              </li>
            </ul>
          </div>
          <Btn
            variant="primary"
            tour="sa-unggah-ba"
            disabled={dilanjutkan.length === 0 || terkunci}
            onClick={() => {
              if (dilanjutkan.length > kuotaSubstansi) {
                track("view_selections_substansi_kuota_terlampaui", {
                  ...SEL,
                  jumlah_dipilih: dilanjutkan.length,
                  kuota_substansi: kuotaSubstansi,
                });
                setSim({ saKuotaLebih: true });
                return;
              }
              track("click_selections_unggah_berita_acara", {
                ...SEL,
                jumlah_peserta: dilanjutkan.length,
              });
              setSim({ modal: "sa_berita_acara", saSetuju: false });
            }}
          >
            Unggah Berita Acara
          </Btn>
        </div>

        <div className="overflow-hidden rounded-md border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    aria-label="Pilih semua"
                    disabled={terkunci}
                    checked={semuaDipilih}
                    onChange={() =>
                      setSim({ saPilih: semuaDipilih ? [] : kandidat.map((p) => p.id) })
                    }
                  />
                </th>
                {[
                  "Nama Lengkap",
                  "Penugasan Saat Ini",
                  "Status Kepegawaian",
                  "Golongan",
                  "Usia",
                  "Domisili",
                  "Aksi",
                  "Sumber Dana",
                ].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {kandidat.map((p) => {
                const k = sim.saKeputusan[p.id];
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        aria-label={`Pilih ${p.nama}`}
                        disabled={terkunci}
                        checked={sim.saPilih.includes(p.id)}
                        onChange={() =>
                          setSim({
                            saPilih: sim.saPilih.includes(p.id)
                              ? sim.saPilih.filter((x) => x !== p.id)
                              : [...sim.saPilih, p.id],
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-slate-900">{p.nama}</p>
                      <p className="text-[10px] text-slate-400">NIP 19xxxxxxxxxxxxxx</p>
                    </td>
                    <td className="px-3 py-2.5">{p.penugasan}</td>
                    <td className="px-3 py-2.5">{p.kepegawaian}</td>
                    <td className="px-3 py-2.5">{p.golongan}</td>
                    <td className="px-3 py-2.5">{p.usia}</td>
                    <td className="px-3 py-2.5">{p.domisili}</td>
                    <td className="px-3 py-2.5">
                      <select
                        className={clsx(inputClass, "w-36")}
                        disabled={terkunci}
                        value={k?.keputusan ?? ""}
                        onChange={(e) =>
                          e.target.value === "tidak_dilanjutkan"
                            ? setSim({
                                modal: "sa_alasan",
                                saTidakLanjut: [p.id],
                                saAlasan: [],
                                saAlasanTambahan: "",
                              })
                            : setSim({
                                saKeputusan: setKeputusan([p.id], { keputusan: "dilanjutkan" }),
                              })
                        }
                      >
                        <option value="" disabled>
                          Pilih Aksi
                        </option>
                        <option value="dilanjutkan">Dilanjutkan ke Seleksi Substansi</option>
                        <option value="tidak_dilanjutkan">
                          Tidak dilanjutkan ke Seleksi Substansi
                        </option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        className={clsx(inputClass, "w-32")}
                        disabled={terkunci || k?.keputusan !== "dilanjutkan"}
                        value={k?.dana ?? ""}
                        onChange={(e) =>
                          setSim({ saKeputusan: setKeputusan([p.id], { dana: e.target.value }) })
                        }
                      >
                        <option value="" disabled>
                          Pilih Sumber Dana
                        </option>
                        {danaOpsi.map((d) => (
                          <option key={d.kode} value={d.kode}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {digugurkan.length > 0 && (
          <p className="text-[11px] text-slate-500">
            {digugurkan.length} peserta tidak dilanjutkan dan dihapus dari daftar:{" "}
            {digugurkan.map((p) => p.nama).join(", ")}.
          </p>
        )}
      </Card>

      {sim.saPilih.length > 0 && !terkunci && (
        <div className="sticky bottom-0 flex items-center gap-3 rounded-lg border border-blue-200 bg-white p-3 text-xs shadow-lg">
          <Chip tone="blue">{sim.saPilih.length} BCKS dipilih</Chip>
          <label className="flex items-center gap-2">
            Aksi:
            <select
              className={clsx(inputClass, "w-48")}
              value={sim.saBulkAksi}
              onChange={(e) => setSim({ saBulkAksi: e.target.value as SimState["saBulkAksi"] })}
            >
              <option value="">Pilih Aksi</option>
              <option value="dilanjutkan">Dilanjutkan ke Seleksi Substansi</option>
              <option value="tidak_dilanjutkan">Tidak dilanjutkan ke Seleksi Substansi</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Sumber Dana:
            <select
              className={clsx(inputClass, "w-44")}
              disabled={sim.saBulkAksi !== "dilanjutkan"}
              value={sim.saBulkDana}
              onChange={(e) => setSim({ saBulkDana: e.target.value })}
            >
              <option value="">Pilih Sumber Dana</option>
              {danaOpsi.map((d) => (
                <option key={d.kode} value={d.kode}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <span className="flex-1" />
          <Btn onClick={() => setSim({ saPilih: [] })}>Batal</Btn>
          <Btn
            variant="primary"
            tour="sa-terapkan"
            disabled={!sim.saBulkAksi || (sim.saBulkAksi === "dilanjutkan" && !sim.saBulkDana)}
            onClick={() => {
              track("click_selections_substansi_terapkan", {
                ...SEL,
                keputusan_substansi: sim.saBulkAksi,
                sumber_dana: sim.saBulkAksi === "dilanjutkan" ? sim.saBulkDana : "",
                jumlah_peserta: sim.saPilih.length,
                is_massal: sim.saPilih.length > 1,
              });
              if (sim.saBulkAksi === "tidak_dilanjutkan") {
                setSim({
                  modal: "sa_alasan",
                  saTidakLanjut: sim.saPilih,
                  saAlasan: [],
                  saAlasanTambahan: "",
                });
              } else {
                setSim({
                  saKeputusan: setKeputusan(sim.saPilih, {
                    keputusan: "dilanjutkan",
                    dana: sim.saBulkDana,
                  }),
                  saPilih: [],
                  saBulkAksi: "",
                  saBulkDana: "",
                });
              }
            }}
          >
            Terapkan
          </Btn>
        </div>
      )}

      {sim.modal === "sa_alasan" && <ModalAlasan sim={sim} setSim={setSim} />}
      {sim.modal === "sa_tidak_lanjut_confirm" && (
        <ModalTidakLanjutConfirm sim={sim} setSim={setSim} />
      )}
      {sim.modal === "sa_berita_acara" && (
        <Modal
          title="Unggah Berita Acara"
          subtitle="Berita Acara berisi daftar nama peserta sesuai daftar di sistem"
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="sa-kirim-undangan"
                disabled={!sim.saSetuju}
                onClick={() => {
                  track("click_selections_kirim_undangan_substansi_confirm", {
                    ...SEL,
                    jumlah_peserta: dilanjutkan.length,
                  });
                  setSim({ modal: null, saTerkirim: true, saPilih: [] });
                }}
              >
                Konfirmasi Kirim Undangan
              </Btn>
            </>
          }
        >
          <Field label="Berita Acara * (PDF)">
            <FakeUpload name="Berita Acara Seleksi Administrasi.pdf" />
          </Field>
          <label className="flex items-start gap-2 rounded-md border border-slate-200 p-2.5">
            <input
              type="checkbox"
              checked={sim.saSetuju}
              onChange={(e) => setSim({ saSetuju: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-slate-600">
              Saya menyatakan bahwa data peserta yang terpilih sudah benar dan tidak dapat diubah
              lagi.
            </span>
          </label>
        </Modal>
      )}
    </div>
  );
}

function ModalAlasan({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const nama = semuaPeserta(sim)
    .filter((p) => sim.saTidakLanjut.includes(p.id))
    .map((p) => p.nama);
  return (
    <Modal
      title={`${nama.length === 1 ? nama[0] : `${nama.length} peserta`} tidak dilanjutkan ke seleksi substansi dikarenakan satu dan lain hal berikut:`}
      onClose={() => setSim({ modal: null })}
      footer={
        <>
          <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
          <Btn
            variant="primary"
            className="bg-rose-600 hover:bg-rose-700"
            disabled={sim.saAlasan.length === 0}
            onClick={() => setSim({ modal: "sa_tidak_lanjut_confirm" })}
          >
            Konfirmasi Alasan
          </Btn>
        </>
      }
    >
      <div className="space-y-1.5">
        {alasanTidakDilanjutkan.map((a) => (
          <label key={a} className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={sim.saAlasan.includes(a)}
              onChange={() =>
                setSim({
                  saAlasan: sim.saAlasan.includes(a)
                    ? sim.saAlasan.filter((x) => x !== a)
                    : [...sim.saAlasan, a],
                })
              }
            />
            {a}
          </label>
        ))}
      </div>
      <Field label="Alasan tambahan (tampil di Ruang GTK guru; isi teks tidak dikirim ke tracker)">
        <textarea
          className={inputClass}
          rows={2}
          placeholder="Masukkan alasan tambahan..."
          value={sim.saAlasanTambahan}
          onChange={(e) => setSim({ saAlasanTambahan: e.target.value })}
        />
      </Field>
    </Modal>
  );
}

function ModalTidakLanjutConfirm({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  return (
    <Modal
      title="Konfirmasi Tidak Dilanjutkan"
      onClose={() => setSim({ modal: null })}
      footer={
        <>
          <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
          <Btn
            variant="primary"
            className="bg-rose-600 hover:bg-rose-700"
            tour="sa-tidak-lanjut-confirm"
            onClick={() => {
              track("click_selections_substansi_tidak_dilanjutkan_confirm", {
                ...SEL,
                jumlah_alasan: sim.saAlasan.length,
                ada_alasan_tambahan: sim.saAlasanTambahan.trim().length > 0,
              });
              const next = { ...sim.saKeputusan };
              for (const id of sim.saTidakLanjut)
                next[id] = { keputusan: "tidak_dilanjutkan", dana: null };
              const nama = semuaPeserta(sim)
                .filter((p) => sim.saTidakLanjut.includes(p.id))
                .map((p) => p.nama)
                .join(", ");
              setSim({
                modal: null,
                saKeputusan: next,
                saPilih: sim.saPilih.filter((id) => !sim.saTidakLanjut.includes(id)),
                saBulkAksi: "",
                saTidakLanjut: [],
                toast: `${nama} ditandai sebagai tidak dilanjutkan.`,
              });
            }}
          >
            Ya, Konfirmasi
          </Btn>
        </>
      }
    >
      <p className="text-slate-600">
        Nama yang dipilih untuk tidak dilanjutkan ini akan dihapus dari daftar nama yang bisa
        dipilih untuk dilanjutkan ke seleksi substansi. Apakah Anda yakin ingin melanjutkan?
      </p>
    </Modal>
  );
}

export function SeleksiSubstansi({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  return (
    <div className="space-y-4 p-5">
      <h2 data-tour="page-seleksi-substansi" className="text-base font-semibold text-slate-900">
        Seleksi Substansi
      </h2>
      <Toast sim={sim} setSim={setSim} />
      <Card className="flex items-center justify-between p-5 text-xs">
        <p className="max-w-lg text-slate-600">
          Seleksi Substansi dilakukan di luar SIM KSPSTK, di Sistem Seleksi Substansi Bakal Calon
          Kepala Sekolah dan Bakal Calon Pengawas Sekolah. Datanya sudah terintegrasi.
        </p>
        <Btn
          variant="dark"
          tour="sa-manajemen"
          onClick={() => {
            track("click_seleksi_substansi_manajemen");
            setSim({ toast: "Membuka Sistem Seleksi Substansi (tautan keluar)." });
          }}
        >
          Manajemen Seleksi Substansi <ExternalLink size={12} />
        </Btn>
      </Card>
    </div>
  );
}
