import { useState } from "react";
import clsx from "clsx";
import { AlertCircle, ArrowLeft, ChevronLeft, Search } from "lucide-react";
import {
  alasanDenganSekolahTujuan,
  alasanPemberhentian,
  ksAktif,
  labelKode,
  riwayatPengajuan,
  sekolahGuru,
  wilayah,
  type KsAktif,
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
  Stepper,
  Table,
  Td,
} from "@engine/wireframe/ui.tsx";
import { Toast } from "./shared.tsx";

// Slide 184–201: Pemberhentian murni (tanpa promosi/mutasi ke sekolah lain).

const statusTone = {
  Selesai: "green",
  "Sedang Dikirim": "yellow",
  "Sedang Diverifikasi": "blue",
} as const;

const tagChip: Record<NonNullable<KsAktif["tag"]>, { label: string; tone: "red" | "yellow" }> = {
  harus_diberhentikan: { label: "Harus diberhentikan", tone: "red" },
  harus_segera_diberhentikan: { label: "Harus segera diberhentikan", tone: "yellow" },
  segera_pensiun: { label: "Segera pensiun", tone: "red" },
};

/** KS bisa dipilih bila datanya lengkap (BR-060) dan tidak segera pensiun (slide 189). */
const bisaDipilih = (k: KsAktif) => k.dataLengkap && k.tag !== "segera_pensiun";

const namaSekolahGuru = (id: string | null) => sekolahGuru.find((s) => s.id === id)?.nama ?? "–";

export function PemberhentianDaftar({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const riwayat = [
    ...(sim.pbRiwayatBaru
      ? [
          {
            id: "baru",
            tanggal: "Hari ini",
            diajukan: sim.pbRiwayatBaru,
            diterima: 0,
            status: "Sedang Dikirim" as const,
          },
        ]
      : []),
    ...riwayatPengajuan,
  ];

  return (
    <div className="space-y-4 p-5">
      <Toast sim={sim} setSim={setSim} />
      <div data-tour="page-pemberhentian" className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Pemberhentian Kepala Sekolah</h2>
        <Btn
          variant="primary"
          tour="buat-pengajuan"
          onClick={() => {
            track("click_pemberhentian_buat_pengajuan");
            setSim({
              screen: "pemberhentian_buat_pengajuan",
              pbTahap: 1,
              pbDipilih: [],
              pbData: {},
              modal: null,
              toast: null,
            });
          }}
        >
          Buat Pengajuan Baru
        </Btn>
      </div>

      <Card className="flex items-center justify-between p-4">
        <div>
          <p className="text-[11px] text-slate-500">Total Pengajuan</p>
          <p className="text-lg font-semibold text-slate-900">{riwayat.length}</p>
        </div>
        <span className="size-4 rounded-full bg-blue-500" />
      </Card>

      <Card>
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Daftar Riwayat Pengajuan Pemberhentian Kepala Sekolah
          </h3>
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
          {riwayat.map((r, i) => (
            <tr key={r.id}>
              <Td>{r.tanggal}</Td>
              <Td>{r.diajukan}</Td>
              <Td>{r.diterima}</Td>
              <Td>
                <Chip tone={statusTone[r.status]}>{r.status}</Chip>
              </Td>
              <Td>
                <Btn
                  tour={i === 0 ? "cek-pengajuan" : undefined}
                  onClick={() => track("click_pemberhentian_cek_pengajuan")}
                >
                  Cek Pengajuan
                </Btn>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

const langkah = [
  "Pilih Kepala Sekolah",
  "Lengkapi Data",
  "Unggah Dokumen Pendukung",
  "Cek Ringkasan",
];

export function BuatPemberhentian({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const dipilih = ksAktif.filter((k) => sim.pbDipilih.includes(k.id));
  const jumlah_ks = dipilih.length;
  const semuaLengkap = dipilih.every((k) => sim.pbData[k.id]);
  const target = ksAktif.find((k) => k.id === sim.pbTarget);

  const keDaftar = (patch: Partial<SimState> = {}) => {
    setSim({ screen: "pemberhentian", modal: null, ...patch });
    track("view_pemberhentian", {
      jumlah_riwayat: riwayatPengajuan.length + (patch.pbRiwayatBaru ? 1 : 0),
    });
  };

  return (
    <div className="space-y-4 p-5">
      <div>
        <button
          onClick={() => keDaftar()}
          className="flex items-center gap-2 text-base font-semibold text-slate-900"
        >
          <ArrowLeft size={18} /> Buat Usulan Pemberhentian Kepala Sekolah
        </button>
        <p className="mt-1 text-[11px] text-slate-500">
          Pilih dan lengkapi data Kepala Sekolah yang akan diberhentikan.
        </p>
      </div>

      <Card>
        <Stepper active={sim.pbTahap} steps={langkah} />
        {sim.pbTahap === 1 && <PilihKs sim={sim} setSim={setSim} />}
        {sim.pbTahap === 2 && <LengkapiData sim={sim} setSim={setSim} />}
        {sim.pbTahap === 3 && <UnggahPendukung />}
        {sim.pbTahap === 4 && <Ringkasan sim={sim} />}
      </Card>

      <div className="flex justify-between">
        {sim.pbTahap > 1 ? (
          <Btn onClick={() => setSim({ pbTahap: (sim.pbTahap - 1) as 1 | 2 | 3 })}>
            <ChevronLeft size={14} /> Sebelumnya
          </Btn>
        ) : (
          <span />
        )}
        {sim.pbTahap === 1 && (
          <Btn
            variant="dark"
            tour="pb-lanjut-lengkapi"
            disabled={jumlah_ks === 0}
            onClick={() => {
              track("click_pemberhentian_lanjut_lengkapi_data", { jumlah_ks });
              setSim({ pbTahap: 2 });
            }}
          >
            Lanjut ke Lengkapi Data
          </Btn>
        )}
        {sim.pbTahap === 2 && (
          <Btn variant="dark" disabled={!semuaLengkap} onClick={() => setSim({ pbTahap: 3 })}>
            Lanjut ke Unggah Dokumen
          </Btn>
        )}
        {sim.pbTahap === 3 && (
          <Btn
            variant="dark"
            tour="pb-lanjut-ringkasan"
            onClick={() => {
              track("click_pemberhentian_lanjut_cek_ringkasan", { jumlah_ks });
              setSim({ pbTahap: 4 });
            }}
          >
            Lanjutkan ke Cek Ringkasan
          </Btn>
        )}
        {sim.pbTahap === 4 && (
          <Btn
            variant="primary"
            tour="pb-kirim"
            onClick={() => setSim({ modal: "pb_kirim_confirm" })}
          >
            Kirim data dan dokumen ke BKN
          </Btn>
        )}
      </div>

      {sim.modal === "pb_info" && target?.tag && (
        <Modal
          title="Informasi Rekomendasi"
          onClose={() => setSim({ modal: null })}
          footer={<Btn onClick={() => setSim({ modal: null })}>Tutup</Btn>}
        >
          <p>
            <Chip tone={tagChip[target.tag].tone}>{tagChip[target.tag].label}</Chip>
          </p>
          <p className="text-slate-600">
            {target.tag === "segera_pensiun"
              ? "KS berusia ≥ 59 tahun 6 bulan tanpa SK pensiun tidak dapat diusulkan pemberhentiannya karena menunggu pembaruan otomatis."
              : "KS tidak memenuhi syarat penugasan sesuai Permendikdasmen Nomor 7 Tahun 2025."}
          </p>
          <div className="rounded-md bg-slate-50 p-2.5 text-slate-600">
            Kelengkapan data KS (NIP, Nomor SK, TMT di satminkal) dan UNOR ID sekolah:{" "}
            <b>{target.dataLengkap ? "sudah tersedia" : "belum tersedia"}</b>
          </div>
        </Modal>
      )}

      {sim.modal === "pb_lengkapi" && target && (
        <Modal
          title="Unggahan Dokumen Alasan Pemberhentian"
          subtitle="Unggah dokumen pendukung sebagai keterangan tambahan dalam proses pemberhentian Kepala Sekolah"
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="pb-alasan-simpan"
                disabled={
                  !sim.pbDraft.alasan ||
                  (alasanDenganSekolahTujuan.includes(sim.pbDraft.alasan) && !sim.pbDraft.sekolah)
                }
                onClick={() => {
                  const alasan = sim.pbDraft.alasan!;
                  const sekolah = alasanDenganSekolahTujuan.includes(alasan)
                    ? sim.pbDraft.sekolah
                    : null;
                  track("click_pemberhentian_alasan_simpan", {
                    alasan_pemberhentian: alasan,
                    ada_sekolah_tujuan: sekolah !== null,
                  });
                  setSim({
                    modal: null,
                    pbData: { ...sim.pbData, [target.id]: { alasan, sekolah } },
                  });
                }}
              >
                Simpan
              </Btn>
            </>
          }
        >
          <Field label="Dokumen Alasan Pemberhentian * (PDF, maksimal 5 MB)">
            <FakeUpload name="Alasan Pemberhentian KS.pdf" />
          </Field>
          <Field label="Alasan Pemberhentian *">
            <select
              data-tour="pb-alasan"
              className={inputClass}
              value={sim.pbDraft.alasan ?? ""}
              onChange={(e) => setSim({ pbDraft: { ...sim.pbDraft, alasan: e.target.value } })}
            >
              <option value="" disabled>
                Pilih alasan pemberhentian
              </option>
              {alasanPemberhentian.map((a) => (
                // Batas usia pensiun hanya bila usia KS melewati batas (slide 138); KS contoh belum.
                <option key={a} value={a} disabled={a === "batas_usia_pensiun"}>
                  {labelKode(a)}
                </option>
              ))}
            </select>
          </Field>
          {sim.pbDraft.alasan && alasanDenganSekolahTujuan.includes(sim.pbDraft.alasan) && (
            <Field label="Sekolah Tujuan * — pilih sekolah tujuan untuk menjadi guru">
              <select
                data-tour="pb-sekolah-tujuan"
                className={inputClass}
                value={sim.pbDraft.sekolah ?? ""}
                onChange={(e) => setSim({ pbDraft: { ...sim.pbDraft, sekolah: e.target.value } })}
              >
                <option value="" disabled>
                  Pilih sekolah tujuan
                </option>
                {sekolahGuru.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </Modal>
      )}

      {sim.modal === "pb_kirim_confirm" && (
        <Modal
          title="Kirim ke BKN?"
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="pb-kirim-confirm"
                onClick={() => {
                  track("click_pemberhentian_kirim_bkn_confirm", { jumlah_ks });
                  keDaftar({
                    pbRiwayatBaru: jumlah_ks,
                    pbTahap: 1,
                    pbDipilih: [],
                    pbData: {},
                    toast: "Pengajuan pemberhentian kepala sekolah berhasil dibuat.",
                  });
                }}
              >
                Ya, Kirim ke BKN
              </Btn>
            </>
          }
        >
          <p className="text-slate-600">
            Data pemberhentian untuk {jumlah_ks} Kepala Sekolah akan dikirim ke BKN.
          </p>
        </Modal>
      )}
    </div>
  );
}

function PilihKs({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const [cari, setCari] = useState("");
  const daftar = ksAktif.filter((k) =>
    `${k.sekolah} ${k.nama}`.toLowerCase().includes(cari.toLowerCase()),
  );
  const eligible = daftar.filter(bisaDipilih).map((k) => k.id);
  const semuaDipilih = eligible.length > 0 && eligible.every((id) => sim.pbDipilih.includes(id));
  const firstTagged = daftar.find((k) => k.tag)?.id;
  const firstEligible = eligible[0];

  const toggle = (id: string) =>
    setSim({
      pbDipilih: sim.pbDipilih.includes(id)
        ? sim.pbDipilih.filter((x) => x !== id)
        : [...sim.pbDipilih, id],
    });

  return (
    <div className="space-y-3 p-5">
      <h3 className="text-sm font-semibold text-slate-900">
        Daftar Kepala Sekolah yang Diusulkan untuk Pemberhentian
      </h3>
      <div className="relative">
        <Search size={13} className="absolute top-2 left-2.5 text-slate-400" />
        <input
          className={clsx(inputClass, "pl-7")}
          placeholder="Cari berdasarkan nama sekolah atau nama kepala sekolah"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
        />
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
                      pbDipilih: semuaDipilih
                        ? sim.pbDipilih.filter((id) => !eligible.includes(id))
                        : [...new Set([...sim.pbDipilih, ...eligible])],
                    })
                  }
                />
              </th>
              {["Nama Sekolah", "Nama Kepala Sekolah", "NIP", "Status Pemberhentian"].map((h) => (
                <th key={h} className="px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {daftar.map((k) => {
              const aktif = bisaDipilih(k);
              return (
                <tr key={k.id} className={clsx(!aktif && "bg-slate-50 text-slate-400")}>
                  <Td>
                    <input
                      type="checkbox"
                      data-tour={k.id === firstEligible ? "pb-pilih" : undefined}
                      disabled={!aktif}
                      checked={sim.pbDipilih.includes(k.id)}
                      onChange={() => toggle(k.id)}
                      aria-label={`Pilih ${k.nama}`}
                    />
                  </Td>
                  <Td>{k.sekolah}</Td>
                  <Td>
                    <span className="flex items-center gap-1.5">
                      {k.nama}
                      {k.tag && (
                        <button
                          data-tour={k.id === firstTagged ? "pb-info" : undefined}
                          className="text-rose-600"
                          aria-label="Informasi rekomendasi"
                          onClick={() => {
                            track("click_pemberhentian_info_rekomendasi", {
                              tag_rekomendasi: k.tag!,
                            });
                            setSim({ modal: "pb_info", pbTarget: k.id });
                          }}
                        >
                          <AlertCircle size={14} />
                        </button>
                      )}
                    </span>
                  </Td>
                  <Td>19xxxxxxxxxxxxxx</Td>
                  <Td>
                    {k.tag ? <Chip tone={tagChip[k.tag].tone}>{tagChip[k.tag].label}</Chip> : "–"}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-500">
        Baris abu-abu: data KS (NIP, Nomor SK, TMT di satminkal) atau UNOR ID sekolah belum lengkap,
        atau KS segera pensiun.
      </p>
    </div>
  );
}

function LengkapiData({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const dipilih = ksAktif.filter((k) => sim.pbDipilih.includes(k.id));
  return (
    <div className="space-y-3 p-5">
      <h3 className="text-sm font-semibold text-slate-900">Lengkapi Data Pemberhentian</h3>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <Table
          head={["Kepala Sekolah", "Alasan Pemberhentian", "Sekolah Tujuan", "Status", "Aksi"]}
        >
          {dipilih.map((k, i) => {
            const d = sim.pbData[k.id];
            return (
              <tr key={k.id}>
                <Td>
                  <p className="font-medium text-slate-900">{k.nama}</p>
                  <p className="text-[10px] text-slate-400">{k.sekolah}</p>
                </Td>
                <Td>{d ? labelKode(d.alasan) : "–"}</Td>
                <Td>{d ? namaSekolahGuru(d.sekolah) : "–"}</Td>
                <Td>
                  {d ? <Chip tone="green">Lengkap</Chip> : <Chip tone="red">Belum lengkap</Chip>}
                </Td>
                <Td>
                  <Btn
                    tour={i === 0 ? "pb-lengkapi" : undefined}
                    onClick={() =>
                      setSim({
                        modal: "pb_lengkapi",
                        pbTarget: k.id,
                        pbDraft: { alasan: d?.alasan ?? null, sekolah: d?.sekolah ?? null },
                      })
                    }
                  >
                    {d ? "Ubah Data" : "Lengkapi Data"}
                  </Btn>
                </Td>
              </tr>
            );
          })}
        </Table>
      </div>
    </div>
  );
}

function UnggahPendukung() {
  const [setuju, setSetuju] = useState(true);
  return (
    <div className="grid grid-cols-2 gap-4 p-5 text-xs">
      <div className="col-span-2">
        <Field label="Surat Usulan dari PPK (PDF, maksimal 5 MB)">
          <FakeUpload name="Surat Usulan PPK.pdf" />
        </Field>
      </div>
      <Field label="Nomor Surat">
        <input className={inputClass} defaultValue="1234" />
      </Field>
      <Field label="Tanggal Surat">
        <input type="date" className={inputClass} defaultValue="2025-11-20" />
      </Field>
      <Field label="Perihal Surat">
        <input className={inputClass} defaultValue="Pemberhentian" />
      </Field>
      <Field label="Instansi">
        <input className={inputClass} defaultValue={`Dinas Pendidikan ${wilayah}`} />
      </Field>
      <label className="col-span-2 flex items-start gap-2 rounded-md border border-slate-200 p-2.5">
        <input
          type="checkbox"
          checked={setuju}
          onChange={(e) => setSetuju(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-slate-600">
          Konfirmasi persetujuan: data dan dokumen yang diunggah sudah benar dan menjadi tanggung
          jawab Dinas Pendidikan.
        </span>
      </label>
    </div>
  );
}

function Ringkasan({ sim }: { sim: SimState }) {
  const dipilih = ksAktif.filter((k) => sim.pbDipilih.includes(k.id));
  return (
    <div className="space-y-4 p-5 text-xs">
      <h3 className="text-sm font-semibold text-slate-900">Ringkasan Pengajuan Pemberhentian</h3>
      <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-blue-800">
        Anda akan mengirimkan data pemberhentian untuk <b>{dipilih.length} Kepala Sekolah</b> ke
        BKN. Pastikan semua data sudah benar sebelum mengirim.
      </p>
      <div>
        <p className="mb-2 font-medium text-slate-900">Unggahan Dokumen Pendukung</p>
        <dl className="grid grid-cols-2 gap-2 rounded-md bg-slate-50 p-3">
          {[
            ["Surat Usulan dari PPK", "Surat Usulan PPK.pdf"],
            ["Nomor Surat", "1234"],
            ["Tanggal Surat", "2025-11-20"],
            ["Perihal Surat", "Pemberhentian"],
            ["Instansi", `Dinas Pendidikan ${wilayah}`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[10px] text-slate-500">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <p className="mb-2 font-medium text-slate-900">
          Daftar Usulan Pemberhentian Kepala Sekolah
        </p>
        <div className="overflow-hidden rounded-md border border-slate-200">
          <Table head={["Kepala Sekolah", "Alasan Pemberhentian", "Sekolah Tujuan", "Dokumen"]}>
            {dipilih.map((k) => (
              <tr key={k.id}>
                <Td>
                  <p className="font-medium text-slate-900">{k.nama}</p>
                  <p className="text-[10px] text-slate-400">{k.sekolah}</p>
                </Td>
                <Td>{labelKode(sim.pbData[k.id]?.alasan ?? "–")}</Td>
                <Td>{namaSekolahGuru(sim.pbData[k.id]?.sekolah ?? null)}</Td>
                <Td>Alasan Pemberhentian KS.pdf</Td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
}
