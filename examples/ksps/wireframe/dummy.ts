// Data contoh untuk wireframe. Semua fiktif: tidak ada nama, NIP, atau data pengguna asli
// (lihat knowledge/event/konvensi-event.md#kebijakan-privasi-wajib).

export const wilayah = "KOTA CONTOH";

export const riwayatPengajuan = [
  { id: "r1", tanggal: "1 April 2025", diajukan: 6, diterima: 6, status: "Selesai" },
  { id: "r2", tanggal: "20 Januari 2024", diajukan: 8, diterima: 5, status: "Sedang Dikirim" },
  { id: "r3", tanggal: "25 Januari 2024", diajukan: 4, diterima: 0, status: "Sedang Diverifikasi" },
] as const;

export const pesertaLulus = [
  { id: "p1", nama: "Guru A", sekolah: "SMA Negeri 1" },
  { id: "p2", nama: "Guru B", sekolah: "SMA Negeri 5" },
  { id: "p3", nama: "Guru H", sekolah: "SMP Negeri 9" },
  { id: "p4", nama: "Guru C", sekolah: "SMP Negeri 3" },
] as const;

/** Kode `status_dokumen_napza` (reguler) dari knowledge/domain/status-dan-enum.md (slide 149). */
export type NapzaStatus =
  | "sertifikat_belum_tersedia"
  | "sertifikat_tersedia"
  | "belum_unggah"
  | "belum_divalidasi"
  | "valid"
  | "tidak_valid";

export const napzaLabel: Record<NapzaStatus, string> = {
  sertifikat_belum_tersedia: "Sertifikat Belum Tersedia",
  sertifikat_tersedia: "Sertifikat Pelatihan Tersedia",
  belum_unggah: "Belum Unggah",
  belum_divalidasi: "Belum Divalidasi",
  valid: "Valid",
  tidak_valid: "Tidak Valid",
};

export const napzaAwal: Record<string, NapzaStatus> = {
  p1: "sertifikat_belum_tersedia",
  p2: "sertifikat_tersedia",
  p3: "belum_divalidasi",
  p4: "valid",
};

export interface Calon {
  id: string;
  nama: string;
  usia: number;
  golongan: string;
  jabatan: "Guru" | "Kepala Sekolah";
  kategori: "promosi" | "mutasi";
  sekolahAsal: string;
  domisili: string;
  tagRekomendasi?: string;
  bisaDitugaskan: boolean;
  /** Hanya tampil di jalur non-reguler (mis. KS segera pensiun, slide 134). */
  hanyaNonReguler?: boolean;
}

export const calon: Calon[] = [
  {
    id: "c1",
    nama: "Guru C",
    usia: 45,
    golongan: "III/d",
    jabatan: "Guru",
    kategori: "promosi",
    sekolahAsal: "SMP Negeri 3",
    domisili: "Kec. Utara",
    bisaDitugaskan: true,
  },
  {
    id: "c2",
    nama: "Guru D",
    usia: 41,
    golongan: "III/c",
    jabatan: "Guru",
    kategori: "promosi",
    sekolahAsal: "SMP Negeri 8",
    domisili: "Kec. Barat",
    bisaDitugaskan: true,
  },
  {
    id: "c3",
    nama: "KS E",
    usia: 36,
    golongan: "III/b",
    jabatan: "Kepala Sekolah",
    kategori: "mutasi",
    sekolahAsal: "SD Negeri 2",
    domisili: "Kec. Timur",
    tagRekomendasi: "tidak_direkomendasikan_mutasi",
    bisaDitugaskan: false,
  },
  {
    id: "c4",
    nama: "KS F",
    usia: 54,
    golongan: "IV/b",
    jabatan: "Kepala Sekolah",
    kategori: "mutasi",
    sekolahAsal: "SMP Negeri 26",
    domisili: "Kec. Selatan",
    tagRekomendasi: "dapat_dirotasi_mutasi",
    bisaDitugaskan: true,
  },
  {
    id: "c5",
    nama: "KS J",
    usia: 60,
    golongan: "IV/a",
    jabatan: "Kepala Sekolah",
    kategori: "mutasi",
    sekolahAsal: "SD Negeri 11",
    domisili: "Kec. Utara",
    tagRekomendasi: "segera_pensiun",
    bisaDitugaskan: false,
    hanyaNonReguler: true,
  },
];

export const sekolahTujuan = [
  { id: "s1", nama: "SMP Negeri 14", npsn: "20500014", ksAktif: "KS G" },
  { id: "s2", nama: "SMP Negeri 21", npsn: "20500021", ksAktif: null },
  { id: "s3", nama: "SD Negeri 7", npsn: "20500107", ksAktif: null },
] as const;

/** Kode dari knowledge/domain/status-dan-enum.md; label diturunkan dari kode. */
export const alasanPemberhentian = [
  "akhir_periode_penugasan",
  "pelanggaran_disiplin",
  "berhalangan_tetap_6_bulan",
  "kinerja_di_bawah_baik",
  "tugas_belajar_6_bulan",
  "permintaan_sendiri",
  "batas_usia_pensiun",
  "lainnya",
] as const;

export const labelKode = (kode: string) => {
  const s = kode.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Kandidat lulus seleksi administrasi untuk jalur non-reguler (slide 121). */
export const kandidatAdm = [
  { id: "k1", nama: "Guru K", sekolah: "SD Negeri 4" },
  { id: "k2", nama: "Guru L", sekolah: "SMP Negeri 12" },
  { id: "k3", nama: "Guru M", sekolah: "SMP Negeri 6" },
  { id: "k4", nama: "Guru N", sekolah: "SD Negeri 15" },
] as const;

/** Kode `status_dokumen_napza` (non-reguler) dari knowledge/domain/status-dan-enum.md (slide 121). */
export type NapzaStatusNR =
  | "belum_diundang"
  | "belum_mengunggah"
  | "belum_diverifikasi"
  | "gagal_verifikasi"
  | "valid";

export const napzaLabelNR: Record<NapzaStatusNR, string> = {
  belum_diundang: "Belum Diundang",
  belum_mengunggah: "Belum Mengunggah Dokumen",
  belum_diverifikasi: "Belum Diverifikasi",
  gagal_verifikasi: "Gagal Verifikasi",
  valid: "Valid",
};

export const napzaAwalNR: Record<string, NapzaStatusNR> = {
  k1: "belum_diundang",
  k2: "belum_diverifikasi",
  k3: "gagal_verifikasi",
  k4: "valid",
};

/** KS aktif yang bisa diusulkan pemberhentian murni (slide 187–190). */
export interface KsAktif {
  id: string;
  sekolah: string;
  nama: string;
  /** `status_pemberhentian` / `tag_rekomendasi` dari status-dan-enum.md */
  tag: "harus_diberhentikan" | "harus_segera_diberhentikan" | "segera_pensiun" | null;
  /** Data KS & UNOR ID lengkap; bila tidak, baris abu-abu dan tidak bisa dipilih (BR-060). */
  dataLengkap: boolean;
}

export const ksAktif: KsAktif[] = [
  {
    id: "b1",
    sekolah: "SMA Negeri 1",
    nama: "KS P",
    tag: "harus_diberhentikan",
    dataLengkap: true,
  },
  { id: "b2", sekolah: "SMA Negeri 2", nama: "KS Q", tag: null, dataLengkap: false },
  {
    id: "b3",
    sekolah: "SMA Negeri 3",
    nama: "KS R",
    tag: "harus_segera_diberhentikan",
    dataLengkap: true,
  },
  { id: "b4", sekolah: "SMP Negeri 4", nama: "KS S", tag: null, dataLengkap: true },
  { id: "b5", sekolah: "SD Negeri 5", nama: "KS T", tag: "segera_pensiun", dataLengkap: true },
];

/** Sekolah tempat KS yang diberhentikan kembali menjadi guru (slide 194). */
export const sekolahGuru = [
  { id: "g1", nama: "SMP Negeri 6" },
  { id: "g2", nama: "SMP Negeri 8" },
  { id: "g3", nama: "SD Negeri 20" },
] as const;

/** 6 alasan pertama membuka pilihan sekolah tujuan (status-dan-enum.md, slide 194). */
export const alasanDenganSekolahTujuan: readonly string[] = alasanPemberhentian.slice(0, 6);

/** Sekolah swasta untuk formulir Penugasan Swasta Murni (slide 170). */
export const sekolahSwasta = [
  { id: "w1", nama: "SMP Swasta Harapan", npsn: "20590001" },
  { id: "w2", nama: "SMA Swasta Bakti", npsn: "20590002" },
  { id: "w3", nama: "SD Swasta Mandiri", npsn: "20590003" },
] as const;

export const riwayatSwasta = [
  {
    id: "sw1",
    tanggal: "12 Agustus 2025",
    nama: "Guru W",
    asal: "SD Swasta Mandiri",
    tujuan: "SMP Swasta Harapan",
  },
  {
    id: "sw2",
    tanggal: "3 Juni 2025",
    nama: "Guru X",
    asal: "SMP Swasta Harapan",
    tujuan: "SMA Swasta Bakti",
  },
] as const;

// ---- Pemetaan Kebutuhan KS (slide 24–34) ----

export type Jenjang = "tk" | "sd" | "smp" | "sma";

export interface SekolahKebutuhan {
  id: string;
  nama: string;
  npsn: string;
  jenjang: Jenjang;
  ks: string | null;
  statusKs: "Kepala Sekolah" | "PLT Kepala Sekolah";
  statusSekolah: "negeri" | "swasta";
  periode: number | null;
  akhirPeriode: string | null;
  /** Sisa masa penugasan KS (bulan); < 6 memunculkan notifikasi (BR-011). */
  sisaBulan: number | null;
  /** `kondisi_ks` dari status-dan-enum.md */
  kondisi: "segera_akhir_periode" | "sudah_pensiun" | "plt" | "definitif" | "segera_pensiun";
  tag?: string;
}

export const sekolahKebutuhan: SekolahKebutuhan[] = [
  {
    id: "d1",
    nama: "TK Negeri 1",
    npsn: "20510001",
    jenjang: "tk",
    ks: null,
    statusKs: "PLT Kepala Sekolah",
    statusSekolah: "negeri",
    periode: null,
    akhirPeriode: null,
    sisaBulan: null,
    kondisi: "plt",
  },
  {
    id: "d2",
    nama: "TK Negeri 2",
    npsn: "20510002",
    jenjang: "tk",
    ks: "KS AA",
    statusKs: "Kepala Sekolah",
    statusSekolah: "negeri",
    periode: 1,
    akhirPeriode: "2027-11-29",
    sisaBulan: 12,
    kondisi: "definitif",
    tag: "dapat_dirotasi_mutasi",
  },
  {
    id: "d3",
    nama: "SD Negeri 3",
    npsn: "20520003",
    jenjang: "sd",
    ks: "KS AB",
    statusKs: "Kepala Sekolah",
    statusSekolah: "negeri",
    periode: 2,
    akhirPeriode: "2027-03-15",
    sisaBulan: 4,
    kondisi: "segera_akhir_periode",
    tag: "harus_segera_diberhentikan",
  },
  {
    id: "d4",
    nama: "SD Negeri 4",
    npsn: "20520004",
    jenjang: "sd",
    ks: "KS AC",
    statusKs: "Kepala Sekolah",
    statusSekolah: "negeri",
    periode: 1,
    akhirPeriode: "2027-01-10",
    sisaBulan: 2,
    kondisi: "segera_pensiun",
    tag: "segera_pensiun",
  },
  {
    id: "d5",
    nama: "SD Swasta Pelita",
    npsn: "20520005",
    jenjang: "sd",
    ks: "KS AD",
    statusKs: "Kepala Sekolah",
    statusSekolah: "swasta",
    periode: 1,
    akhirPeriode: "2028-07-01",
    sisaBulan: 20,
    kondisi: "definitif",
  },
  {
    id: "d6",
    nama: "SMP Negeri 6",
    npsn: "20530006",
    jenjang: "smp",
    ks: null,
    statusKs: "PLT Kepala Sekolah",
    statusSekolah: "negeri",
    periode: null,
    akhirPeriode: null,
    sisaBulan: null,
    kondisi: "sudah_pensiun",
  },
  {
    id: "d7",
    nama: "SMP Negeri 7",
    npsn: "20530007",
    jenjang: "smp",
    ks: "KS AE",
    statusKs: "Kepala Sekolah",
    statusSekolah: "negeri",
    periode: 1,
    akhirPeriode: "2026-12-20",
    sisaBulan: 1,
    kondisi: "segera_akhir_periode",
    tag: "harus_diberhentikan",
  },
  {
    id: "d8",
    nama: "SMA Negeri 8",
    npsn: "20540008",
    jenjang: "sma",
    ks: "KS AF",
    statusKs: "Kepala Sekolah",
    statusSekolah: "negeri",
    periode: 1,
    akhirPeriode: "2028-02-14",
    sisaBulan: 15,
    kondisi: "definitif",
  },
];

/** Sekolah yang belum ada di data kebutuhan, untuk fitur Tambah sekolah (slide 32). */
export const sekolahBelumTerdata = [
  { id: "t1", nama: "SD Negeri 21", npsn: "20520021", jenjang: "sd" },
  { id: "t2", nama: "SMP Negeri 30", npsn: "20530030", jenjang: "smp" },
  { id: "t3", nama: "TK Negeri 9", npsn: "20510009", jenjang: "tk" },
] as const;

/** Label dropdown Alasan dari slide 33; kodenya belum terenumerasi (status-dan-enum.md). */
export const alasanTambahSekolah = [
  "Berstatus Non-Definitif (Plt.)",
  "Meninggal dunia",
  "Mengundurkan diri",
  "Pensiun",
  "Berakhir masa tugas (tidak memiliki sertifikat diklat CKS atau GP)",
  "Berakhir masa tugas (memiliki sertifikat diklat CKS atau GP)",
  "Diangkat pada jabatan lain selain jabatan fungsional Guru",
  "Dikenai sanksi pidana",
  "Hasil penilaian kinerja tidak mencapai sebutan paling rendah Baik",
  "Menjadi anggota partai politik",
  "Menduduki jabatan negara",
] as const;

// ---- Guru Memenuhi Syarat (slide 35) ----

export interface GuruBcks {
  id: string;
  nama: string;
  domisili: string;
  kepegawaian: "PNS" | "PPPK";
  jenjang: Jenjang;
  jabatan: "guru" | "kepala_sekolah" | "guru_mantan_ks";
  keterangan: string;
}

export const guruBcks: GuruBcks[] = [
  {
    id: "m1",
    nama: "Guru BA",
    domisili: "Kec. Utara",
    kepegawaian: "PNS",
    jenjang: "sd",
    jabatan: "guru_mantan_ks",
    keterangan: "Mantan KS 1 Periode",
  },
  {
    id: "m2",
    nama: "Guru BB",
    domisili: "Kec. Barat",
    kepegawaian: "PNS",
    jenjang: "sd",
    jabatan: "kepala_sekolah",
    keterangan: "Dalam Periode 1 (Non Reguler)",
  },
  {
    id: "m3",
    nama: "Guru BC",
    domisili: "Kec. Timur",
    kepegawaian: "PNS",
    jenjang: "smp",
    jabatan: "guru",
    keterangan: "–",
  },
  {
    id: "m4",
    nama: "Guru BD",
    domisili: "Kec. Selatan",
    kepegawaian: "PPPK",
    jenjang: "tk",
    jabatan: "guru",
    keterangan: "–",
  },
  {
    id: "m5",
    nama: "Guru BE",
    domisili: "Kec. Utara",
    kepegawaian: "PNS",
    jenjang: "sma",
    jabatan: "guru",
    keterangan: "–",
  },
];

export const labelJabatan = {
  guru: "Guru",
  kepala_sekolah: "Kepala Sekolah",
  guru_mantan_ks: "Guru Mantan Kepala Sekolah",
} as const;

// ---- Pengusulan BCKS (slide 39–53) ----

export const riwayatPengusulan = [
  { id: "u1", nama: "Pengusulan 1", mulai: "1 Mei 2025", akhir: "10 Mei 2025", jenis: "Undangan" },
  {
    id: "u2",
    nama: "Pengusulan 2",
    mulai: "15 Juni 2025",
    akhir: "25 Juni 2025",
    jenis: "Pengumuman",
  },
] as const;

export interface BcksUndangan {
  id: string;
  nama: string;
  umur: number;
  domisili: string;
  golongan: string;
  jenjang: Jenjang;
  jabatan: "Guru" | "Kepala Sekolah";
  keterangan: string;
}

export const bcksUndangan: BcksUndangan[] = [
  {
    id: "n1",
    nama: "Guru CA",
    umur: 45,
    domisili: "Kec. Utara",
    golongan: "III/c",
    jenjang: "sd",
    jabatan: "Guru",
    keterangan: "–",
  },
  {
    id: "n2",
    nama: "Guru CB",
    umur: 43,
    domisili: "Kec. Barat",
    golongan: "III/c",
    jenjang: "sd",
    jabatan: "Guru",
    keterangan: "Mantan KS 1 Periode",
  },
  {
    id: "n3",
    nama: "Guru CC",
    umur: 42,
    domisili: "Kec. Timur",
    golongan: "III/d",
    jenjang: "smp",
    jabatan: "Guru",
    keterangan: "–",
  },
  {
    id: "n4",
    nama: "Guru CD",
    umur: 44,
    domisili: "Kec. Selatan",
    golongan: "IV/a",
    jenjang: "tk",
    jabatan: "Guru",
    keterangan: "–",
  },
  {
    id: "n5",
    nama: "KS CE",
    umur: 50,
    domisili: "Kec. Utara",
    golongan: "IV/b",
    jenjang: "smp",
    jabatan: "Kepala Sekolah",
    keterangan: "Dalam Periode 1",
  },
];

// ---- Seleksi Administrasi (slide 56–87) ----

/** ID periode seleksi yang sedang berjalan (contoh ID internal). */
export const seleksiAktif = "sel_0002";

export const riwayatSeleksi = [
  {
    id: "sel_0002",
    nama: "Seleksi Administrasi 2",
    mulai: "1 Mei 2026",
    akhir: "1 Juni 2026",
    status: "Berjalan",
  },
  {
    id: "sel_0001",
    nama: "Seleksi Administrasi 1",
    mulai: "1 Mei 2025",
    akhir: "10 Mei 2025",
    status: "Selesai",
  },
] as const;

/** `jenis_dokumen` dari status-dan-enum.md (5 dokumen wajib, BR-020). */
export const jenisDokumen = [
  { kode: "hasil_penilaian_kinerja", label: "Hasil Penilaian Kinerja" },
  { kode: "skck", label: "SKCK" },
  { kode: "sk_pengalaman_manajerial", label: "SK Pengalaman Manajerial" },
  { kode: "surat_bebas_hukuman", label: "Surat Keterangan Atasan Bebas Hukuman" },
  { kode: "pakta_integritas", label: "Pakta Integritas" },
] as const;

export type HasilDok = "perlu" | "valid" | "tidak_valid" | "perlu_diperbaiki";

export interface PesertaAdm {
  id: string;
  nama: string;
  pengusulan: "Mandiri" | "Dinas" | "Kepala Sekolah";
  penugasan: string;
  domisili: string;
  kepegawaian: "PNS" | "PPPK";
  golongan: string;
  usia: number;
  /** Sudah mengumpulkan berkas di Ruang GTK. */
  kumpul: boolean;
  meninggal?: boolean;
}

export const pesertaAdm: PesertaAdm[] = [
  {
    id: "e1",
    nama: "Guru DA",
    pengusulan: "Mandiri",
    penugasan: "SMP Negeri 1",
    domisili: "Kec. Utara",
    kepegawaian: "PNS",
    golongan: "III/c",
    usia: 32,
    kumpul: true,
  },
  {
    id: "e2",
    nama: "Guru DB",
    pengusulan: "Dinas",
    penugasan: "SMP Negeri 2",
    domisili: "Kec. Timur",
    kepegawaian: "PNS",
    golongan: "III/c",
    usia: 35,
    kumpul: true,
  },
  {
    id: "e3",
    nama: "Guru DC",
    pengusulan: "Kepala Sekolah",
    penugasan: "SMP Negeri 3",
    domisili: "Kec. Barat",
    kepegawaian: "PPPK",
    golongan: "III/c",
    usia: 29,
    kumpul: true,
  },
  {
    id: "e4",
    nama: "Guru DD",
    pengusulan: "Mandiri",
    penugasan: "SD Negeri 12",
    domisili: "Kec. Selatan",
    kepegawaian: "PNS",
    golongan: "III/d",
    usia: 41,
    kumpul: true,
  },
  {
    id: "e5",
    nama: "Guru DE",
    pengusulan: "Dinas",
    penugasan: "SD Negeri 4",
    domisili: "Kec. Utara",
    kepegawaian: "PNS",
    golongan: "III/d",
    usia: 38,
    kumpul: true,
  },
  {
    id: "e6",
    nama: "Guru DF",
    pengusulan: "Mandiri",
    penugasan: "SMA Negeri 2",
    domisili: "Kec. Timur",
    kepegawaian: "PNS",
    golongan: "IV/a",
    usia: 44,
    kumpul: true,
  },
  {
    id: "e7",
    nama: "KS DG",
    pengusulan: "Dinas",
    penugasan: "SD Negeri 9",
    domisili: "Kec. Barat",
    kepegawaian: "PNS",
    golongan: "IV/a",
    usia: 55,
    kumpul: false,
    meninggal: true,
  },
  {
    id: "e8",
    nama: "Guru DH",
    pengusulan: "Mandiri",
    penugasan: "SD Negeri 6",
    domisili: "Kec. Selatan",
    kepegawaian: "PNS",
    golongan: "III/b",
    usia: 30,
    kumpul: false,
  },
];

const semuaDok = (h: HasilDok) =>
  Object.fromEntries(jenisDokumen.map((d) => [d.kode, h])) as Record<string, HasilDok>;

export const dokAwal: Record<string, Record<string, HasilDok>> = {
  e1: semuaDok("valid"),
  e2: semuaDok("valid"),
  e3: semuaDok("perlu"),
  e4: { ...semuaDok("valid"), skck: "tidak_valid" },
  e5: semuaDok("valid"),
  e6: semuaDok("valid"),
};

/** Kuota pelatihan dinas contoh; kuota seleksi substansi = 2 × kuota pelatihan (BR-024). */
export const kuotaPelatihan = 2;

/** Pernyataan alasan tidak dilanjutkan dari slide 67 (kode belum terenumerasi). */
export const alasanTidakDilanjutkan = [
  "Hasil tes pra-substansi",
  "Lokasi domisili pendaftar pada lokasi penempatan satuan pendidikan ada yang lebih diprioritaskan",
  "Pangkat golongan pendaftar pada lokasi penempatan satuan pendidikan ada yang lebih diprioritaskan",
  "Masa kerja pendaftar pada lokasi penempatan satuan pendidikan ada yang lebih diprioritaskan",
  "Usia pendaftar pada lokasi penempatan satuan pendidikan ada yang lebih diprioritaskan",
  "Pengalaman manajerial pendaftar pada lokasi penempatan satuan pendidikan ada yang lebih diprioritaskan",
  "Penilaian Kinerja dan prestasi pendaftar pada lokasi penempatan satuan pendidikan ada yang lebih diprioritaskan",
] as const;

// ---- Pelatihan (slide 92–114, aktor UPT; aksi tidak lulus oleh Super Admin) ----

export const programPelatihan = [
  {
    id: "prg_0001",
    nama: "Pelatihan CKS Angkatan 1",
    periode: "3 Feb – 30 Apr 2026",
    status: "Selesai",
  },
  {
    id: "prg_0002",
    nama: "Pelatihan CKS Angkatan 2",
    periode: "1 Jul – 30 Sep 2026",
    status: "Berjalan",
  },
] as const;

/** `status_pelatihan` dari status-dan-enum.md (slide 94, 113). */
export type StatusPelatihan =
  | "siap_pelatihan"
  | "dikirim_ke_lms"
  | "pelatihan_berjalan"
  | "lulus"
  | "tidak_lulus"
  | "pelatihan_ulang";

export const statusPelatihanLabel: Record<StatusPelatihan, string> = {
  siap_pelatihan: "Siap Pelatihan",
  dikirim_ke_lms: "Sudah dikirim ke LMS Admin",
  pelatihan_berjalan: "Pelatihan Berjalan",
  lulus: "Lulus",
  tidak_lulus: "Tidak Lulus",
  pelatihan_ulang: "Pelatihan Ulang",
};

export const pesertaPelatihan = [
  {
    id: "f1",
    nama: "Guru EA",
    dinas: "KOTA CONTOH",
    domisili: "Kec. Utara",
    golongan: "III/c",
    asal: "SMP Negeri 1",
  },
  {
    id: "f2",
    nama: "Guru EB",
    dinas: "KOTA CONTOH",
    domisili: "Kec. Timur",
    golongan: "III/c",
    asal: "SMP Negeri 2",
  },
  {
    id: "f3",
    nama: "Guru EC",
    dinas: "KAB. CONTOH",
    domisili: "Kec. Barat",
    golongan: "III/d",
    asal: "SD Negeri 3",
  },
  {
    id: "f4",
    nama: "Guru ED",
    dinas: "KAB. CONTOH",
    domisili: "Kec. Selatan",
    golongan: "IV/a",
    asal: "SD Negeri 4",
  },
  {
    id: "f5",
    nama: "Guru EE",
    dinas: "KOTA CONTOH",
    domisili: "Kec. Utara",
    golongan: "III/d",
    asal: "SMA Negeri 5",
  },
  {
    id: "f6",
    nama: "Guru EF",
    dinas: "KOTA CONTOH",
    domisili: "Kec. Barat",
    golongan: "III/c",
    asal: "SMP Negeri 6",
  },
  {
    id: "f7",
    nama: "Guru EG",
    dinas: "KAB. CONTOH",
    domisili: "Kec. Timur",
    golongan: "IV/a",
    asal: "SMP Negeri 7",
  },
] as const;

export const statusPelatihanAwal: Record<string, StatusPelatihan> = {
  f1: "siap_pelatihan",
  f2: "siap_pelatihan",
  f3: "siap_pelatihan",
  f4: "siap_pelatihan",
  f5: "pelatihan_berjalan",
  f6: "lulus",
  f7: "tidak_lulus",
};

export const pengajar = [
  {
    id: "j1",
    nama: "Pengajar A",
    instansi: "UPT GTK Wilayah Contoh",
    jabatan: "Widyaiswara",
    lokasi: "KOTA CONTOH",
    luarDaerah: false,
  },
  {
    id: "j2",
    nama: "Pengajar B",
    instansi: "SMP Negeri 5",
    jabatan: "Kepala Sekolah",
    lokasi: "KOTA CONTOH",
    luarDaerah: false,
  },
  {
    id: "j3",
    nama: "Pengajar C",
    instansi: "Dinas Pendidikan Provinsi Lain",
    jabatan: "Pengawas Sekolah",
    lokasi: "PROVINSI LAIN",
    luarDaerah: true,
  },
  {
    id: "j4",
    nama: "Pengajar D",
    instansi: "SMA Negeri 2",
    jabatan: "Kepala Sekolah",
    lokasi: "KAB. CONTOH",
    luarDaerah: false,
  },
  {
    id: "j5",
    nama: "Pengajar E",
    instansi: "BGTK Provinsi Lain",
    jabatan: "Widyaiswara",
    lokasi: "PROVINSI LAIN",
    luarDaerah: true,
  },
] as const;

/** Batas dari aturan bisnis: maks. 5 admin/kelas (BR-031), 2–3 pengajar (BR-032), 40 peserta (BR-033). */
export const batasPelatihan = { admin: 5, pengajarMin: 2, pengajarMax: 3, peserta: 40 } as const;

// ---- Pengajuan Perubahan: periodisasi & SK PPPK (slide 204–257) ----

export interface Riwayat {
  id: string;
  tipe: "reguler" | "arsip";
  /** Reguler: satu tahun per entri (BR-070); arsip: rentang tahun TMT–TST. */
  tahun: string;
  sekolah: string;
  tmt: string;
  tst: string;
  noSk: string;
  /** Tunjangan KS yang sudah terbit di tahun ini (BR-074–075); memblokir hapus/ubah TMT. */
  tunjangan?: 1 | 2;
  /** Riwayat tahun berjalan muncul otomatis dan tidak bisa diubah (BR-072). */
  otomatis?: boolean;
  status: "asli" | "baru" | "diubah" | "dihapus";
}

export const ksPeriodisasi = [
  {
    id: "g1",
    nama: "KS HA",
    jabatan: "Kepala Sekolah",
    periodeSim: "Periode Ke 2",
    masaSim: "5 tahun 11 bulan",
  },
  {
    id: "g2",
    nama: "KS HB",
    jabatan: "Kepala Sekolah",
    periodeSim: "Periode Ke 1",
    masaSim: "2 tahun 3 bulan",
  },
] as const;

export const riwayatAwal: Riwayat[] = [
  {
    id: "r20",
    tipe: "reguler",
    tahun: "2020",
    sekolah: "SD Negeri 10",
    tmt: "2020-07-01",
    tst: "",
    noSk: "Peg.824/47/2020",
    tunjangan: 2,
    status: "asli",
  },
  {
    id: "r21",
    tipe: "reguler",
    tahun: "2021",
    sekolah: "SD Negeri 10",
    tmt: "2020-07-01",
    tst: "",
    noSk: "Peg.824/47/2020",
    tunjangan: 1,
    status: "asli",
  },
  {
    id: "r22",
    tipe: "reguler",
    tahun: "2022",
    sekolah: "SD Negeri 10",
    tmt: "2020-07-01",
    tst: "2022-07-01",
    noSk: "Peg.824/47/2020",
    status: "asli",
  },
  {
    id: "r24",
    tipe: "reguler",
    tahun: "2024",
    sekolah: "SD Negeri 15",
    tmt: "2020-07-01",
    tst: "",
    noSk: "Peg.82/47/2024",
    status: "asli",
  },
  {
    id: "r25",
    tipe: "reguler",
    tahun: "2025",
    sekolah: "SD Negeri 15",
    tmt: "2020-07-01",
    tst: "",
    noSk: "Peg.82/47/2024",
    status: "asli",
  },
  {
    id: "r26",
    tipe: "reguler",
    tahun: "2026",
    sekolah: "SD Negeri 15",
    tmt: "2020-07-01",
    tst: "",
    noSk: "Peg.82/47/2024",
    otomatis: true,
    status: "asli",
  },
];

export const pengajuanAwal = [
  {
    id: "pp1",
    tanggal: "12 Agustus 2026",
    jenis: "periodisasi" as const,
    nama: "KS HC",
    status: "disetujui" as const,
  },
  {
    id: "pp2",
    tanggal: "3 Oktober 2026",
    jenis: "sk_pppk" as const,
    nama: "2 PTK",
    status: "menunggu" as const,
  },
];

export const ptkPppk = [
  { id: "q1", nama: "PTK IA", sekolah: "SD Negeri 21", jabatan: "Guru" },
  { id: "q2", nama: "PTK IB", sekolah: "SMP Negeri 8", jabatan: "Kepala Sekolah" },
  { id: "q3", nama: "PTK IC", sekolah: "SD Negeri 2", jabatan: "Guru" },
] as const;

export const dasborDinas = [
  {
    dinas: "Dinas Pendidikan KOTA CONTOH",
    provinsi: "PROVINSI CONTOH",
    jumlah: 12,
    belum: 3,
    sudah: 9,
    setuju: 8,
    tolak: 1,
  },
  {
    dinas: "Dinas Pendidikan KAB. CONTOH",
    provinsi: "PROVINSI CONTOH",
    jumlah: 7,
    belum: 2,
    sudah: 5,
    setuju: 5,
    tolak: 0,
  },
  {
    dinas: "Dinas Pendidikan KOTA LAIN",
    provinsi: "PROVINSI LAIN",
    jumlah: 4,
    belum: 4,
    sudah: 0,
    setuju: 0,
    tolak: 0,
  },
] as const;

// ---- Umum: beranda, wilayah, bantuan (slide 11–23, 263–265) ----

/** Wilayah contoh; UPT bisa berganti wilayah sesuai kewenangannya (slide 11). */
export const wilayahOpsi = [
  { kode: "000001", nama: "KOTA CONTOH" },
  { kode: "000002", nama: "KAB. CONTOH" },
] as const;

export const pengumumanAwal =
  "Periode seleksi administrasi KS tahun 2026 dibuka hingga 1 Juni 2026. Pastikan data BCKS di Dapodik sudah diperbarui.";

export const jadwalKonsultasi = [
  {
    id: "z1",
    tanggal: "Selasa, 4 Nov 2026",
    jam: "09.00–11.00 WIB",
    topik: "Seleksi administrasi & pelatihan",
  },
  {
    id: "z2",
    tanggal: "Kamis, 6 Nov 2026",
    jam: "13.00–15.00 WIB",
    topik: "Penugasan & pemberhentian",
  },
] as const;

// ---- Manajemen KS Aktif (slide 259–261) ----

export const ksAktifDaftar = [
  {
    id: "a1",
    nama: "KS JA",
    sekolah: "SD Negeri 1",
    jenjang: "sd",
    usia: 59,
    pensiun: "2027-02-01",
    segeraPensiun: true,
  },
  {
    id: "a2",
    nama: "KS JB",
    sekolah: "SMP Negeri 3",
    jenjang: "smp",
    usia: 48,
    pensiun: "2038-05-01",
    segeraPensiun: false,
  },
  {
    id: "a3",
    nama: "KS JC",
    sekolah: "SD Negeri 7",
    jenjang: "sd",
    usia: 52,
    pensiun: "2034-09-01",
    segeraPensiun: false,
  },
  {
    id: "a4",
    nama: "KS JD",
    sekolah: "SMA Negeri 2",
    jenjang: "sma",
    usia: 59,
    pensiun: "2027-06-01",
    segeraPensiun: true,
  },
  {
    id: "a5",
    nama: "KS JE",
    sekolah: "TK Negeri 1",
    jenjang: "tk",
    usia: 45,
    pensiun: "2041-01-01",
    segeraPensiun: false,
  },
] as const;

export const ksTidakAktifDaftar = [
  {
    id: "t1",
    nama: "KS KA",
    sekolah: "SD Negeri 4",
    jenjang: "sd",
    kategori: "pensiun",
    tanggal: "2026-01-01",
    dokumen: "SK Pensiun 821/xx/2025",
  },
  {
    id: "t2",
    nama: "KS KB",
    sekolah: "SMP Negeri 9",
    jenjang: "smp",
    kategori: "meninggal_dunia",
    tanggal: "2026-03-12",
    dokumen: "Akta Kematian xxx/2026",
  },
  {
    id: "t3",
    nama: "KS KC",
    sekolah: "SD Negeri 11",
    jenjang: "sd",
    kategori: "pensiun",
    tanggal: "2025-09-01",
    dokumen: "SK Pensiun 821/yy/2025",
  },
] as const;
