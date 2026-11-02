// State simulasi wireframe. Tur mengatur state ini langsung untuk setiap langkah;
// mode bebas mengubahnya lewat klik di wireframe.

import {
  dokAwal,
  pengumumanAwal,
  pengajuanAwal,
  riwayatAwal,
  type Riwayat,
  statusPelatihanAwal,
  type StatusPelatihan,
  napzaAwal,
  napzaAwalNR,
  type HasilDok,
  type NapzaStatus,
  type NapzaStatusNR,
} from "./dummy.ts";

export type Screen =
  | "penugasan_reguler"
  | "penugasan_non_reguler"
  | "penugasan_buat_pengajuan"
  | "pemberhentian"
  | "pemberhentian_buat_pengajuan"
  | "penugasan_swasta_murni"
  | "pemetaan_kebutuhan"
  | "pemetaan_tambah_sekolah"
  | "guru_memenuhi_syarat"
  | "pengusulan"
  | "pengusulan_buat_pengumuman"
  | "pengusulan_buat_undangan"
  | "seleksi_administrasi"
  | "seleksi_administrasi_cek_berkas"
  | "seleksi_administrasi_pilih_peserta_substansi"
  | "seleksi_substansi"
  | "pelatihan"
  | "pelatihan_buat_program"
  | "pengajuan_perubahan"
  | "pengajuan_perubahan_periodisasi"
  | "verval_periodisasi"
  | "pengaliran_sk_pppk"
  | "verval_sk_pppk"
  | "dasbor_pengajuan_perubahan"
  | "beranda"
  | "manajemen_ks_aktif";
export type Jalur = "reguler" | "non_reguler";
/** Menu samping yang bisa diklik di wireframe. */
export type MenuKey =
  | "beranda"
  | "manajemen_ks"
  | "pemetaan"
  | "gms"
  | "pengusulan"
  | "seleksi_administrasi"
  | "seleksi_substansi"
  | "pelatihan"
  | "pengajuan_perubahan"
  | "dasbor"
  | "verval_sk"
  | Jalur
  | "swasta_murni"
  | "pemberhentian";
export type Modal =
  | null
  | "konfirmasi_napza"
  | "dokumen_napza"
  | "info_rekomendasi"
  | "alasan_pemberhentian"
  | "unggah_dokumen"
  | "berhasil"
  | "pb_info"
  | "pb_lengkapi"
  | "pb_kirim_confirm"
  | "sm_konfirmasi"
  | "pk_info_rekomendasi"
  | "pk_info_periode"
  | "pk_rincian"
  | "gms_profil"
  | "pg_konfirmasi_buat"
  | "pg_kirim_confirm"
  | "pg_berhasil"
  | "pg_profil"
  | "sa_validasi"
  | "sa_selesaikan"
  | "sa_tambah_bcks"
  | "sa_atur"
  | "sa_alasan"
  | "sa_tidak_lanjut_confirm"
  | "sa_berita_acara"
  | "pl_pengajar"
  | "pl_buat_confirm"
  | "pl_tidak_lulus"
  | "pd_jenis"
  | "pd_form"
  | "pd_hapus"
  | "pd_ajukan"
  | "pd_verval_confirm"
  | "sk_ajukan_confirm"
  | "sk_verval_confirm"
  | "konsultasi"
  | "br_pengumuman_confirm"
  | "mutasi_dokumen";
export type Kategori = "semua" | "promosi" | "mutasi";

export type Peran = "dinas_pendidikan" | "upt_gtk" | "super_admin";

export interface Kelas {
  id: string;
  nama: string;
  admin: number;
  maks: number;
  pengajar: string[];
}

export interface SimState {
  screen: Screen;
  /** Peran pengguna yang sedang disimulasikan; dikirim sebagai atribut user_role. */
  peran: Peran;
  /** Jalur penugasan yang sedang dibuka; menentukan isi layar Buat Pengajuan. */
  jalur: Jalur;
  /** Langkah di layar Buat Pengajuan: 1 pilih calon, 2 penugasan & pemberhentian, 3 ringkasan. */
  tahap: 1 | 2 | 3;
  modal: Modal;
  kategori: Kategori;
  /** id calon → id sekolah tujuan */
  sekolahTujuan: Record<string, string>;
  alasanPemberhentian: string | null;
  /** id peserta lulus pelatihan → status dokumen NAPZA */
  napza: Record<string, NapzaStatus>;
  /** id kandidat lulus seleksi administrasi → status dokumen NAPZA (non-reguler) */
  napzaNR: Record<string, NapzaStatusNR>;
  /** Peserta yang sedang diproses di modal NAPZA. */
  napzaTarget: string | null;
  napzaHasil: "valid" | "tidak_valid" | "perlu_diperbaiki" | null;
  /** Pemberitahuan singkat di atas halaman. */
  toast: string | null;

  // Pemberhentian murni (slide 184–201)
  /** 1 pilih KS, 2 lengkapi data, 3 unggah dokumen pendukung, 4 cek ringkasan */
  pbTahap: 1 | 2 | 3 | 4;
  pbDipilih: string[];
  /** id KS → alasan & sekolah tujuan yang sudah disimpan */
  pbData: Record<string, { alasan: string; sekolah: string | null }>;
  /** KS yang sedang dibuka di modal (info rekomendasi / lengkapi data). */
  pbTarget: string | null;
  pbDraft: { alasan: string | null; sekolah: string | null };
  /** Jumlah KS di pengajuan yang baru dikirim; tampil sebagai baris riwayat teratas. */
  pbRiwayatBaru: number | null;

  // Penugasan swasta murni (slide 169–172)
  /** Formulir pengajuan atau daftar riwayat (tampil setelah berhasil dikirim). */
  smMode: "form" | "riwayat";
  smForm: { nik: string; asal: string; tujuan: string };
  /** Centang pernyataan di modal Konfirmasi Penugasan. */
  smSetuju: boolean;
  /** Jumlah penugasan baru yang dikirim di simulasi ini. */
  smBaru: number;

  // Pemetaan Kebutuhan KS (slide 24–34)
  pkTahun: number;
  /** tahun proyeksi → id sekolah yang sudah dipetakan */
  pkPetakan: Record<number, string[]>;
  pkJenjang: "semua" | "tk" | "sd" | "smp" | "sma";
  pkKondisi:
    | "semua"
    | "segera_akhir_periode"
    | "sudah_pensiun"
    | "plt"
    | "definitif"
    | "segera_pensiun";
  /** Sekolah yang sedang dibuka di modal informasi / rincian. */
  pkTarget: string | null;
  /** Baris di halaman Tambah sekolah. */
  pkDraft: { sekolah: string; alasan: string }[];
  /** Sekolah yang sudah ditambahkan manual (id sekolahBelumTerdata). */
  pkTambahan: string[];

  // Guru Memenuhi Syarat (slide 35)
  gmsJenjang: "semua" | "tk" | "sd" | "smp" | "sma";
  gmsJabatan: "semua" | "kepala_sekolah" | "guru" | "guru_mantan_ks";
  gmsTarget: string | null;

  // Pengusulan BCKS (slide 39–53)
  pgJenis: "pengumuman" | "undangan";
  pgTanggalMulai: string;
  pgTanggalAkhir: string;
  /** Langkah undangan: 1 pilih batas waktu, 2 pilih BCKS, 3 kirim undangan */
  pgTahap: 1 | 2 | 3;
  pgDipilih: string[];
  pgJenjang: "semua" | "tk" | "sd" | "smp" | "sma";
  pgGolongan: string;
  pgTarget: string | null;
  /** Pengusulan yang dikirim di simulasi ini (tampil di riwayat). */
  pgBaru: { jenis: "pengumuman" | "undangan"; mulai: string; akhir: string }[];

  // Seleksi Administrasi (slide 56–87)
  /** id peserta → jenis dokumen → hasil validasi */
  saDok: Record<string, Record<string, HasilDok>>;
  /** Peserta yang panel cek berkasnya sedang dibuka. */
  saPeserta: string | null;
  saDokAktif: string | null;
  saHasil: Exclude<HasilDok, "perlu"> | null;
  /** BCKS yang ditambahkan ke seleksi berjalan (id bcksUndangan). */
  saTambahan: string[];
  saTambahPilih: string[];
  /** id peserta → keputusan & sumber dana di pemilihan peserta substansi */
  saKeputusan: Record<
    string,
    { keputusan: "dilanjutkan" | "tidak_dilanjutkan" | null; dana: string | null }
  >;
  saPilih: string[];
  saBulkAksi: "dilanjutkan" | "tidak_dilanjutkan" | "";
  saBulkDana: string;
  /** Peserta yang sedang diberi alasan tidak dilanjutkan. */
  saTidakLanjut: string[];
  saAlasan: string[];
  saAlasanTambahan: string;
  saKuotaLebih: boolean;
  saSetuju: boolean;
  saTerkirim: boolean;

  // Pelatihan (slide 92–114)
  /** 1 jadwal, 2 kelas & pengajar, 3 peserta, 4 ringkasan */
  plTahap: 1 | 2 | 3 | 4;
  plAngkatan: string;
  plKelas: Kelas[];
  /** Kelas yang sedang dipilihkan pengajar / peserta. */
  plKelasAktif: string;
  plPengajarDraft: string[];
  /** id peserta → id kelas */
  plPeserta: Record<string, string>;
  plStatus: Record<string, StatusPelatihan>;
  plProgramBaru: string[];
  plTarget: string | null;
  plAksi: "pelatihan_ulang" | "gugurkan" | null;

  // Pengajuan Perubahan (slide 204–257)
  pdPengajuan: {
    id: string;
    tanggal: string;
    jenis: "periodisasi" | "sk_pppk";
    nama: string;
    status: "menunggu" | "disetujui" | "ditolak";
  }[];
  pdKs: string | null;
  /** 1 isi data, 2 ringkasan pengajuan */
  pdTahap: 1 | 2;
  pdRiwayat: Riwayat[];
  /** Draf form tambah/ubah riwayat. */
  pdForm: {
    id: string | null;
    tipe: "reguler" | "arsip";
    tahun: string;
    sekolah: string;
    tmt: string;
    tst: string;
    noSk: string;
    tstLebih2018: boolean;
  };
  pdHapusId: string | null;
  pdBlokir: {
    aturan: "hapus_riwayat" | "ubah_tmt" | "ubah_tst";
    tahun: string;
    semester: number;
  } | null;
  /** Pengajuan yang sedang diverval UPT. */
  pdVerval: string | null;
  pdHasil: "disetujui" | "ditolak" | null;
  skTahap: 1 | 2 | 3;
  skPilih: string[];
  /** id PTK → status verval Super Admin */
  skStatus: Record<string, "menunggu" | "disetujui" | "ditolak">;
  skTarget: string | null;
  skHasil: "disetujui" | "ditolak" | null;

  // Umum & bantuan (slide 11–23)
  /** Kode wilayah aktif; dikirim sebagai atribut kode_wilayah. */
  wilayah: string;
  chatOpen: boolean;
  /** Formulir nama/email chat bot sudah dikirim. */
  chatTerdaftar: boolean;
  chatPesan: { dari: "user" | "bot"; teks: string }[];
  chatDraft: string;
  pengumuman: string;
  /** Teks pengumuman yang sedang diubah Super Admin; null bila tidak sedang mengubah. */
  pengumumanDraft: string | null;

  // Manajemen KS Aktif (slide 259–261)
  ksTab: "aktif" | "tidak_aktif";
  ksFilter: "semua" | "segera_pensiun" | "pensiun" | "meninggal_dunia";

  // Mutasi KS < 2 tahun oleh Super Admin (slide 173–182)
  /** Calon yang informasi rekomendasinya sedang dibuka. */
  infoTarget: string | null;
  /** id calon → id sekolah tujuan yang diajukan lewat mutasi pengecualian. */
  mutasiKhusus: Record<string, string>;
  mutasiSekolah: string;
}

export const initialSim: SimState = {
  screen: "penugasan_reguler",
  peran: "dinas_pendidikan",
  jalur: "reguler",
  tahap: 1,
  modal: null,
  kategori: "semua",
  sekolahTujuan: {},
  alasanPemberhentian: null,
  napza: napzaAwal,
  napzaNR: napzaAwalNR,
  napzaTarget: null,
  napzaHasil: null,
  toast: null,
  pbTahap: 1,
  pbDipilih: [],
  pbData: {},
  pbTarget: null,
  pbDraft: { alasan: null, sekolah: null },
  pbRiwayatBaru: null,
  smMode: "form",
  smForm: { nik: "", asal: "", tujuan: "" },
  smSetuju: false,
  smBaru: 0,
  pkTahun: 2026,
  pkPetakan: { 2026: ["d2", "d6"] },
  pkJenjang: "semua",
  pkKondisi: "semua",
  pkTarget: null,
  pkDraft: [],
  pkTambahan: [],
  gmsJenjang: "semua",
  gmsJabatan: "semua",
  gmsTarget: null,
  pgJenis: "pengumuman",
  pgTanggalMulai: "",
  pgTanggalAkhir: "",
  pgTahap: 1,
  pgDipilih: [],
  pgJenjang: "semua",
  pgGolongan: "semua",
  pgTarget: null,
  pgBaru: [],
  saDok: dokAwal,
  saPeserta: null,
  saDokAktif: null,
  saHasil: null,
  saTambahan: [],
  saTambahPilih: [],
  saKeputusan: {},
  saPilih: [],
  saBulkAksi: "",
  saBulkDana: "",
  saTidakLanjut: [],
  saAlasan: [],
  saAlasanTambahan: "",
  saKuotaLebih: false,
  saSetuju: false,
  saTerkirim: false,
  plTahap: 1,
  plAngkatan: "",
  plKelas: [],
  plKelasAktif: "",
  plPengajarDraft: [],
  plPeserta: {},
  plStatus: statusPelatihanAwal,
  plProgramBaru: [],
  plTarget: null,
  plAksi: null,
  pdPengajuan: pengajuanAwal,
  pdKs: null,
  pdTahap: 1,
  pdRiwayat: riwayatAwal,
  pdForm: {
    id: null,
    tipe: "reguler",
    tahun: "",
    sekolah: "",
    tmt: "",
    tst: "",
    noSk: "",
    tstLebih2018: false,
  },
  pdHapusId: null,
  pdBlokir: null,
  pdVerval: null,
  pdHasil: null,
  skTahap: 1,
  skPilih: [],
  skStatus: { q2: "menunggu", q3: "menunggu" },
  skTarget: null,
  skHasil: null,
  wilayah: "000001",
  chatOpen: false,
  chatTerdaftar: false,
  chatPesan: [],
  chatDraft: "",
  pengumuman: pengumumanAwal,
  pengumumanDraft: null,
  ksTab: "aktif",
  ksFilter: "semua",
  infoTarget: null,
  mutasiKhusus: {},
  mutasiSekolah: "",
};

export type SetSim = (patch: Partial<SimState>) => void;
