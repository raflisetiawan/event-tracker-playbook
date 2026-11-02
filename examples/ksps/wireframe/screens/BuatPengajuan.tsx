import { useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ChevronLeft, ChevronRight, Info, Search } from "lucide-react";
import {
  alasanPemberhentian,
  calon,
  labelKode,
  sekolahTujuan,
  wilayah,
  type Calon,
} from "../dummy.ts";
import type { Kategori, SetSim, SimState } from "../sim.ts";
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

// Buat pengajuan penugasan.
// Reguler (slide 156–165): 3 langkah ber-stepper → Unggah dan Selesaikan → kirim ke BKN.
// Non-reguler (slide 128–142): pilih calon → daftar yang akan ditugaskan → Lanjutkan → kirim ke BKN.

/** Dasar hukum tiap tag rekomendasi (status-dan-enum.md, slide 133–134). */
const alasanTag: Record<string, string> = {
  tidak_direkomendasikan_mutasi:
    "Berdasarkan Pasal 23 ayat (3) Permendikdasmen Nomor 7 Tahun 2025: belum mencapai 2 tahun masa penugasan di satminkal yang sama.",
  dapat_dirotasi_mutasi:
    "Pasal 23 ayat (3): KS dapat dipindahkan ke satminkal lain setelah bertugas paling singkat 2 tahun di satminkalnya.",
  harus_diberhentikan:
    "Pasal 7 ayat (1): KS tidak memenuhi syarat penugasan (kualifikasi, status ASN, atau sertifikat pendidik).",
  harus_segera_diberhentikan: "Pasal 31/32: telah habis periode penugasan.",
  segera_pensiun:
    "Usia ≥ 59 tahun 6 bulan tanpa SK pensiun; tidak dapat diusulkan untuk penugasan non-reguler.",
};

const daftarCalon = (sim: SimState) =>
  calon.filter((c) => sim.jalur === "non_reguler" || !c.hanyaNonReguler);

function ringkas(sim: SimState) {
  const dipilih = daftarCalon(sim).filter((c) => sim.sekolahTujuan[c.id]);
  const pemberhentian = dipilih.filter(
    (c) => sekolahTujuan.find((s) => s.id === sim.sekolahTujuan[c.id])?.ksAktif,
  );
  return {
    dipilih,
    pemberhentian,
    jumlah_promosi: dipilih.filter((c) => c.kategori === "promosi").length,
    jumlah_mutasi: dipilih.filter((c) => c.kategori === "mutasi").length,
    jumlah_pemberhentian: pemberhentian.length,
  };
}

const sesudahKirim = { sekolahTujuan: {}, alasanPemberhentian: null, tahap: 1 } as const;

export function BuatPengajuan({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const r = ringkas(sim);
  const nr = sim.jalur === "non_reguler";
  const JALUR = { jalur_penugasan: sim.jalur };
  const infoCalon = calon.find((c) => c.id === sim.infoTarget);

  const keDaftar = (patch: Partial<SimState> = {}) => {
    setSim({
      screen: nr ? "penugasan_non_reguler" : "penugasan_reguler",
      modal: null,
      ...patch,
    });
    track(nr ? "view_penugasan_non_reguler" : "view_penugasan_reguler", { jumlah_riwayat: 3 });
  };

  const lanjutkan = () => {
    track("click_penugasan_lanjutkan", {
      ...JALUR,
      jumlah_promosi: r.jumlah_promosi,
      jumlah_mutasi: r.jumlah_mutasi,
    });
    setSim({ tahap: 2 });
  };

  return (
    <div className="space-y-4 p-5">
      <div>
        <button
          onClick={() => (nr && sim.tahap === 2 ? setSim({ tahap: 1 }) : keDaftar())}
          className="flex items-center gap-2 text-base font-semibold text-slate-900"
        >
          <ArrowLeft size={18} />
          {nr && sim.tahap === 2
            ? "Daftar Kepala Sekolah yang akan Ditugaskan (Promosi atau Mutasi)"
            : `Penugasan Kepala Sekolah (Proses ${nr ? "Non-Reguler" : "Reguler"})`}
        </button>
        <p className="mt-1 text-[11px] text-slate-500">
          {nr
            ? "Dalam hal Pemerintah Daerah belum memiliki BCKS bersertifikat pelatihan, Pemerintah Daerah dapat langsung mengangkat Guru ASN yang memenuhi syarat untuk penugasan 1 periode."
            : "Silakan memilih peserta untuk diajukan sesuai dengan kebutuhan penugasan (promosi), mutasi dan penggantian, atau pemberhentian di satuan pendidikan daerah Anda."}
        </p>
      </div>

      <Card>
        {!nr && (
          <Stepper
            active={sim.tahap}
            steps={[
              "Promosi dan/atau Mutasi",
              "Penugasan dan Pemberhentian",
              "Ringkasan Daftar Pengajuan",
            ]}
          />
        )}
        {sim.tahap === 1 && <TahapPilih sim={sim} setSim={setSim} onLanjut={lanjutkan} />}
        {sim.tahap === 2 && <TahapPemberhentian sim={sim} setSim={setSim} />}
        {sim.tahap === 3 && !nr && <TahapRingkasan sim={sim} />}
      </Card>

      {nr ? (
        sim.tahap === 2 && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {sim.alasanPemberhentian ? r.jumlah_pemberhentian : 0} dari {r.jumlah_pemberhentian}{" "}
              alasan telah dipilih
            </span>
            <div className="flex gap-2">
              <Btn onClick={() => setSim({ tahap: 1 })}>Kembali</Btn>
              <Btn
                variant="dark"
                tour="unggah-selesaikan"
                disabled={r.jumlah_pemberhentian > 0 && !sim.alasanPemberhentian}
                onClick={() => setSim({ modal: "unggah_dokumen" })}
              >
                Lanjutkan
              </Btn>
            </div>
          </div>
        )
      ) : (
        <div className="flex justify-between">
          {sim.tahap > 1 ? (
            <Btn onClick={() => setSim({ tahap: (sim.tahap - 1) as 1 | 2 })}>
              <ChevronLeft size={14} /> Sebelumnya
            </Btn>
          ) : (
            <span />
          )}
          {sim.tahap === 1 && (
            <Btn
              variant="dark"
              tour="lanjutkan"
              disabled={r.dipilih.length === 0}
              onClick={lanjutkan}
            >
              Ke Penugasan dan Pemberhentian <ChevronRight size={14} />
            </Btn>
          )}
          {sim.tahap === 2 && (
            <Btn
              variant="dark"
              disabled={r.jumlah_pemberhentian > 0 && !sim.alasanPemberhentian}
              onClick={() => setSim({ tahap: 3 })}
            >
              Ke Ringkasan <ChevronRight size={14} />
            </Btn>
          )}
          {sim.tahap === 3 && (
            <Btn
              variant="dark"
              tour="unggah-selesaikan"
              onClick={() => setSim({ modal: "unggah_dokumen" })}
            >
              Unggah dan Selesaikan
            </Btn>
          )}
        </div>
      )}

      {sim.modal === "info_rekomendasi" && infoCalon?.tagRekomendasi && (
        <Modal
          title="Informasi Rekomendasi"
          subtitle={infoCalon.nama}
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              {infoCalon.tagRekomendasi === "tidak_direkomendasikan_mutasi" && (
                <Btn
                  tour="ajukan-mutasi-2-tahun"
                  disabled={sim.peran !== "super_admin"}
                  title={sim.peran !== "super_admin" ? "Hanya Super Admin (slide 174)" : undefined}
                  onClick={() => {
                    track("click_penugasan_ajukan_mutasi_kurang_2_tahun");
                    setSim({ modal: "mutasi_dokumen", mutasiSekolah: "" });
                  }}
                >
                  Ajukan Mutasi KS &lt; 2 Tahun
                </Btn>
              )}
              <Btn variant="primary" onClick={() => setSim({ modal: null })}>
                Tutup
              </Btn>
            </>
          }
        >
          <p>
            <Chip tone={infoCalon.tagRekomendasi === "dapat_dirotasi_mutasi" ? "green" : "red"}>
              {labelKode(infoCalon.tagRekomendasi)}
            </Chip>
          </p>
          <p className="text-slate-600">{alasanTag[infoCalon.tagRekomendasi]}</p>
          {infoCalon.tagRekomendasi === "tidak_direkomendasikan_mutasi" && (
            <p className="rounded-md bg-slate-50 p-2.5 text-slate-600">
              Mutasi tetap dapat diajukan oleh Super Admin dengan mengunggah Hasil Evaluasi Kinerja
              dan SK Pengangkatan KS saat ini; Dinas melengkapi SPTJM saat mengirim ke BKN.
            </p>
          )}
        </Modal>
      )}

      {sim.modal === "mutasi_dokumen" && infoCalon && (
        <Modal
          title="Unggah Dokumen Tambahan"
          subtitle={`Dokumen tambahan untuk proses mutasi kepala sekolah atas nama ${infoCalon.nama}`}
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="mutasi-unggah"
                disabled={!sim.mutasiSekolah}
                onClick={() =>
                  setSim({
                    modal: null,
                    mutasiKhusus: { ...sim.mutasiKhusus, [infoCalon.id]: sim.mutasiSekolah },
                    sekolahTujuan: { ...sim.sekolahTujuan, [infoCalon.id]: sim.mutasiSekolah },
                  })
                }
              >
                Unggah Dokumen
              </Btn>
            </>
          }
        >
          <Field label="Sekolah Tujuan *">
            <select
              className={inputClass}
              value={sim.mutasiSekolah}
              onChange={(e) => setSim({ mutasiSekolah: e.target.value })}
            >
              <option value="">Ketik nama sekolah atau NPSN</option>
              {sekolahTujuan.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.npsn})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hasil Evaluasi Kinerja * (PDF, maks. 5 MB)">
            <FakeUpload name="Hasil Evaluasi Kinerja.pdf" />
          </Field>
          <Field label="SK Pengangkatan Kepala Sekolah Saat Ini * (PDF, maks. 5 MB)">
            <FakeUpload name="SK Pengangkatan KS.pdf" />
          </Field>
          <Field label="Data Dukung Lainnya (opsional)">
            <FakeUpload name="Surat Rekomendasi.pdf" />
          </Field>
        </Modal>
      )}

      {sim.modal === "alasan_pemberhentian" && (
        <Modal
          title="Unggah Dokumen Pemberhentian"
          subtitle="Kepala sekolah aktif di sekolah tujuan perlu diberhentikan"
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="alasan-simpan"
                disabled={!sim.alasanPemberhentian}
                onClick={() => {
                  track("click_penugasan_alasan_pemberhentian_simpan", {
                    ...JALUR,
                    alasan_pemberhentian: sim.alasanPemberhentian ?? "",
                  });
                  setSim({ modal: null });
                }}
              >
                Simpan
              </Btn>
            </>
          }
        >
          <Field label="Dokumen Alasan Pemberhentian (PDF, maksimal 5 MB)">
            <FakeUpload name="Surat Alasan Pemberhentian.pdf" />
          </Field>
          <fieldset className="space-y-1.5" data-tour="alasan-pilihan">
            <legend className="mb-1 text-slate-600">Alasan Pemberhentian</legend>
            {alasanPemberhentian.map((a) => (
              <label key={a} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="alasan"
                  checked={sim.alasanPemberhentian === a}
                  onChange={() => setSim({ alasanPemberhentian: a })}
                />
                {labelKode(a)}
              </label>
            ))}
          </fieldset>
        </Modal>
      )}

      {sim.modal === "unggah_dokumen" && (
        <UnggahDokumen
          onClose={() => setSim({ modal: null })}
          onKirim={() => {
            track("click_penugasan_kirim_bkn", {
              ...JALUR,
              jumlah_promosi: r.jumlah_promosi,
              jumlah_mutasi: r.jumlah_mutasi,
              jumlah_pemberhentian: r.jumlah_pemberhentian,
            });
            if (nr) {
              keDaftar({
                ...sesudahKirim,
                toast: "Berhasil melakukan Penugasan Kepala Sekolah (Non-Reguler).",
              });
            } else {
              setSim({ modal: "berhasil" });
            }
          }}
        />
      )}

      {sim.modal === "berhasil" && (
        <Modal
          title="Pengajuan berhasil dikirim ke BKN"
          onClose={() => keDaftar()}
          footer={
            <Btn variant="primary" onClick={() => keDaftar(sesudahKirim)}>
              Kembali ke Daftar Pengajuan
            </Btn>
          }
        >
          <p className="text-slate-600">
            Status pengajuan dapat dipantau lewat tombol Cek Pengajuan di daftar riwayat.
          </p>
        </Modal>
      )}
    </div>
  );
}

/** Keterangan per calon. Non-reguler mengikuti slide 130 & 134; reguler mengikuti slide 157. */
function Keterangan({ c, nr, khusus }: { c: Calon; nr: boolean; khusus: boolean }) {
  if (khusus) return <Chip tone="blue">Mutasi pengecualian &lt; 2 tahun</Chip>;
  if (c.tagRekomendasi === "segera_pensiun") return <Chip tone="red">Segera pensiun</Chip>;
  if (!c.bisaDitugaskan) return <Chip tone="red">Tidak bisa dimutasikan</Chip>;
  if (c.jabatan === "Kepala Sekolah") return <Chip tone="green">Kepala Sekolah Aktif</Chip>;
  return nr ? <span className="text-slate-400">–</span> : <Chip tone="green">NAPZA Valid</Chip>;
}

function TahapPilih({
  sim,
  setSim,
  onLanjut,
}: {
  sim: SimState;
  setSim: SetSim;
  onLanjut: () => void;
}) {
  const track = useTrack();
  const [cari, setCari] = useState("");
  const nr = sim.jalur === "non_reguler";
  const JALUR = { jalur_penugasan: sim.jalur };
  const semua = daftarCalon(sim);
  const daftar = semua.filter(
    (c) =>
      (sim.kategori === "semua" || c.kategori === sim.kategori) &&
      `${c.nama} ${c.sekolahAsal} ${c.domisili}`.toLowerCase().includes(cari.toLowerCase()),
  );
  const firstTagged = daftar.find((c) => c.tagRekomendasi)?.id;
  const firstSelectable = daftar.find((c) => c.bisaDitugaskan)?.id;
  const adaDipilih = Object.keys(sim.sekolahTujuan).length > 0;

  const pilihKategori = (k: Kategori) => {
    const jumlah = semua.filter((c) => k === "semua" || c.kategori === k).length;
    track("click_penugasan_filter_kategori", { ...JALUR, filter_value: k, jumlah_hasil: jumlah });
    setSim({ kategori: k });
  };

  const pencarian = (
    <div className={clsx("relative", nr ? "flex-1" : "w-72")}>
      <Search size={13} className="absolute top-2 left-2.5 text-slate-400" />
      <input
        className={clsx(inputClass, "pl-7")}
        placeholder="Cari berdasarkan nama, sekolah atau domisili"
        value={cari}
        onChange={(e) => setCari(e.target.value)}
      />
    </div>
  );

  return (
    <div className="space-y-3 p-5">
      {nr ? (
        <div className="flex items-center gap-3">
          {pencarian}
          <select
            data-tour="filter-kategori"
            className={clsx(inputClass, "w-36")}
            value={sim.kategori}
            onChange={(e) => pilihKategori(e.target.value as Kategori)}
          >
            {(["semua", "promosi", "mutasi"] as Kategori[]).map((k) => (
              <option key={k} value={k}>
                {labelKode(k)}
              </option>
            ))}
          </select>
          <Btn variant="dark" tour="lanjutkan" disabled={!adaDipilih} onClick={onLanjut}>
            Lanjutkan Penugasan
          </Btn>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            data-tour="filter-kategori"
            className="inline-flex rounded-md border border-slate-300 p-0.5 text-xs"
          >
            {(["semua", "promosi", "mutasi"] as Kategori[]).map((k) => (
              <button
                key={k}
                onClick={() => pilihKategori(k)}
                className={clsx(
                  "rounded px-3 py-1 capitalize",
                  sim.kategori === k
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {k}
              </button>
            ))}
          </div>
          {pencarian}
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-slate-200">
        <Table
          head={[
            "Nama",
            "Usia",
            "Gol.",
            "Jabatan",
            "Sekolah Asal",
            "Domisili",
            "Sekolah Tujuan",
            "Keterangan",
          ]}
        >
          {daftar.map((c) => (
            <tr key={c.id}>
              <Td>
                <span className="flex items-center gap-1.5 font-medium text-slate-900">
                  {c.nama}
                  {c.tagRekomendasi && (
                    <button
                      data-tour={c.id === firstTagged ? "info-rekomendasi" : undefined}
                      onClick={() => {
                        track("click_penugasan_info_rekomendasi", {
                          ...JALUR,
                          tag_rekomendasi: c.tagRekomendasi!,
                        });
                        setSim({ modal: "info_rekomendasi", infoTarget: c.id });
                      }}
                      className="text-rose-600"
                      aria-label="Informasi rekomendasi"
                    >
                      <Info size={14} />
                    </button>
                  )}
                </span>
                <span className="text-[10px] text-slate-400">NIP 19xxxxxxxxxxxxxx</span>
              </Td>
              <Td>{c.usia}</Td>
              <Td>{c.golongan}</Td>
              <Td>{c.jabatan}</Td>
              <Td>{c.sekolahAsal}</Td>
              <Td>
                {wilayah}
                <br />
                <span className="text-slate-400">{c.domisili}</span>
              </Td>
              <Td>
                <select
                  data-tour={c.id === firstSelectable ? "pilih-sekolah" : undefined}
                  disabled={!c.bisaDitugaskan || Boolean(sim.mutasiKhusus[c.id])}
                  className={clsx(inputClass, "w-44 disabled:bg-slate-100")}
                  value={sim.sekolahTujuan[c.id] ?? ""}
                  onChange={(e) => {
                    const next = { ...sim.sekolahTujuan };
                    if (e.target.value) next[c.id] = e.target.value;
                    else delete next[c.id];
                    if (e.target.value) {
                      track("click_penugasan_pilih_sekolah", {
                        ...JALUR,
                        kategori_pengajuan: c.kategori,
                      });
                    }
                    setSim({ sekolahTujuan: next });
                  }}
                >
                  <option value="">Ketik nama sekolah atau NPSN</option>
                  {sekolahTujuan.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.npsn})
                    </option>
                  ))}
                </select>
              </Td>
              <Td>
                <Keterangan c={c} nr={nr} khusus={Boolean(sim.mutasiKhusus[c.id])} />
              </Td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}

function TahapPemberhentian({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const { dipilih } = ringkas(sim);
  const nr = sim.jalur === "non_reguler";
  return (
    <div className="space-y-3 p-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          {nr
            ? "Daftar Sekolah dan Kepala Sekolah yang Akan Ditugaskan"
            : "Daftar Usulan Penugasan dan Pemberhentian Kepala Sekolah"}
        </h3>
        {nr && (
          <p className="text-[11px] text-slate-500">
            Lengkapi alasan penggantian untuk setiap kepala sekolah yang digantikan di sekolah
            tujuan.
          </p>
        )}
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <Table
          head={[
            "Sekolah Tujuan",
            "KS yang Ditugaskan",
            "KS yang Digantikan",
            "Kategori",
            "Alasan Penggantian",
            "Alasan Pemberhentian",
          ]}
        >
          {dipilih.flatMap((c) => {
            const s = sekolahTujuan.find((x) => x.id === sim.sekolahTujuan[c.id])!;
            const rows = [
              <tr key={c.id}>
                <Td>{s.nama}</Td>
                <Td>{c.nama}</Td>
                <Td>{s.ksAktif ?? "–"}</Td>
                <Td>
                  <Chip tone="blue">{labelKode(c.kategori)}</Chip>
                </Td>
                <Td>
                  {s.ksAktif ? (
                    <select className={clsx(inputClass, "w-40")} defaultValue="">
                      <option value="" disabled>
                        Pilih alasan penggantian
                      </option>
                      <option value="pensiun">Pensiun</option>
                    </select>
                  ) : (
                    <span className="text-slate-400">Tidak diperlukan</span>
                  )}
                </Td>
                <Td className="text-slate-400">Tidak diperlukan</Td>
              </tr>,
            ];
            if (s.ksAktif) {
              rows.push(
                <tr key={`${c.id}-stop`}>
                  <Td>{s.nama}</Td>
                  <Td>–</Td>
                  <Td>{s.ksAktif}</Td>
                  <Td>
                    <Chip tone="red">Pemberhentian</Chip>
                  </Td>
                  <Td className="text-slate-400">Tidak diperlukan</Td>
                  <Td>
                    <Btn
                      variant="primary"
                      tour="unggah-pemberhentian"
                      onClick={() => setSim({ modal: "alasan_pemberhentian" })}
                    >
                      Unggah Dokumen Pemberhentian
                    </Btn>
                    {sim.alasanPemberhentian ? (
                      <p className="mt-1 text-[11px] text-emerald-700">
                        ✓ {labelKode(sim.alasanPemberhentian)}
                      </p>
                    ) : (
                      nr && <p className="mt-1 text-[11px] text-rose-600">* Wajib diunggah</p>
                    )}
                  </Td>
                </tr>,
              );
            }
            return rows;
          })}
        </Table>
      </div>
    </div>
  );
}

function TahapRingkasan({ sim }: { sim: SimState }) {
  const { dipilih, pemberhentian } = ringkas(sim);
  const sekolah = (id: string) => sekolahTujuan.find((s) => s.id === sim.sekolahTujuan[id])!;
  return (
    <div className="space-y-4 p-5">
      <h3 className="text-sm font-semibold text-slate-900">Ringkasan Daftar Pengajuan</h3>
      <div>
        <p className="mb-2 text-xs font-medium text-emerald-700">Daftar Penugasan atau Promosi</p>
        <div className="overflow-hidden rounded-md border border-slate-200">
          <Table head={["Sekolah Tujuan", "KS yang Ditugaskan", "KS yang Digantikan", "Kategori"]}>
            {dipilih.map((c) => (
              <tr key={c.id}>
                <Td className="font-medium">{sekolah(c.id).nama}</Td>
                <Td>{c.nama}</Td>
                <Td>{sekolah(c.id).ksAktif ?? "–"}</Td>
                <Td>{labelKode(c.kategori)}</Td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
      {pemberhentian.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-rose-700">Daftar Pengajuan Pemberhentian</p>
          <div className="overflow-hidden rounded-md border border-slate-200">
            <Table head={["Nama Sekolah", "KS yang Digantikan", "Alasan Pemberhentian", "Dokumen"]}>
              {pemberhentian.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium">{sekolah(c.id).nama}</Td>
                  <Td>{sekolah(c.id).ksAktif}</Td>
                  <Td>{labelKode(sim.alasanPemberhentian ?? "–")}</Td>
                  <Td>Surat Alasan Pemberhentian.pdf</Td>
                </tr>
              ))}
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

function UnggahDokumen({ onClose, onKirim }: { onClose: () => void; onKirim: () => void }) {
  const [setuju, setSetuju] = useState(true);
  return (
    <Modal
      title="Unggah Dokumen Pendukung"
      subtitle="Unggah dokumen yang diperlukan untuk menyesuaikan proses penugasan"
      onClose={onClose}
      width="max-w-xl"
      footer={
        <>
          <Btn onClick={onClose}>Batal</Btn>
          <Btn variant="primary" tour="kirim-bkn" disabled={!setuju} onClick={onKirim}>
            Kirim Data dan Dokumen ke BKN
          </Btn>
        </>
      }
    >
      <Field label="1. Surat Usulan dari PPK (PDF, maksimal 5 MB)">
        <FakeUpload name="Surat Usulan PPK.pdf" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="2. Nomor Surat">
          <input className={inputClass} defaultValue="12/KSPSTK/2025" />
        </Field>
        <Field label="3. Tanggal Surat">
          <input type="date" className={inputClass} defaultValue="2025-10-15" />
        </Field>
      </div>
      <Field label="4. Perihal Surat">
        <input className={inputClass} defaultValue="Penugasan Kepala Sekolah" />
      </Field>
      <Field label="5. Instansi">
        <input className={inputClass} defaultValue={`Dinas Pendidikan ${wilayah}`} />
      </Field>
      <Field label="6. Berita Acara Tim Pertimbangan (PDF, maksimal 5 MB)">
        <FakeUpload name="Berita Acara Tim Pertimbangan.pdf" />
      </Field>
      <label className="flex items-start gap-2 rounded-md border border-slate-200 p-2.5">
        <input
          type="checkbox"
          checked={setuju}
          onChange={(e) => setSetuju(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-slate-600">
          Saya menyatakan bahwa semua dokumen yang diunggah adalah benar, valid, dan menjadi
          tanggung jawab mutlak dari Dinas Pendidikan.
        </span>
      </label>
    </Modal>
  );
}
