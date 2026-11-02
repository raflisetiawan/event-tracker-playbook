// Definisi tur per alur. Detail event (pemicu, atribut, prioritas) diambil dari markdown usulan;
// file ini hanya menyimpan urutan langkah, state wireframe, dan elemen yang disorot.

import type { Tour } from "@engine/types.ts";
import { pengajuanAwal, riwayatAwal } from "./wireframe/dummy.ts";
import type { SimState } from "./wireframe/sim.ts";

const pilihan = { sekolahTujuan: { c1: "s1", c4: "s2" } };
const tahap1 = { screen: "penugasan_buat_pengajuan", tahap: 1 } as const;
const nr = { jalur: "non_reguler", screen: "penugasan_non_reguler" } as const;
const nrTahap1 = { ...nr, ...tahap1 } as const;
const pb = { screen: "pemberhentian" } as const;
const pbBuat = { screen: "pemberhentian_buat_pengajuan", pbTahap: 1 } as const;
const pbDipilih = ["b1", "b3"];
const br = { screen: "beranda" } as const;
const ks = { screen: "manajemen_ks_aktif" } as const;
const pdDaftar = { screen: "pengajuan_perubahan" } as const;
const pdIsi = { screen: "pengajuan_perubahan_periodisasi", pdKs: "g1", pdTahap: 1 } as const;
const pdRiwayatUbah: SimState["pdRiwayat"] = [
  ...riwayatAwal.map((r) => (r.id === "r22" ? { ...r, status: "dihapus" as const } : r)),
  {
    id: "n23",
    tipe: "reguler",
    tahun: "2023",
    sekolah: "SD Negeri 10",
    tmt: "2020-07-01",
    tst: "",
    noSk: "Peg.824/47/2020",
    status: "baru",
  },
];
const pdAntrean: SimState["pdPengajuan"] = [
  {
    id: "pp9",
    tanggal: "1 November 2026",
    jenis: "periodisasi",
    nama: "KS HA",
    status: "menunggu",
  },
  ...pengajuanAwal,
];
const pl = { screen: "pelatihan", peran: "upt_gtk" } as const;
const plKelasIsi = [{ id: "k1", nama: "Kelas A", admin: 1, maks: 30, pengajar: ["j1", "j3"] }];
const plBuat: Partial<SimState> = {
  screen: "pelatihan_buat_program",
  peran: "upt_gtk",
  plAngkatan: "3",
  plKelas: [{ id: "k1", nama: "Kelas A", admin: 1, maks: 30, pengajar: [] }],
  plKelasAktif: "k1",
};
const plPesertaIsi = { f1: "k1", f2: "k1", f3: "k1" };
const saCek = { screen: "seleksi_administrasi_cek_berkas" } as const;
const saValidasi = {
  ...saCek,
  saPeserta: "e3",
  modal: "sa_validasi",
  saDokAktif: "hasil_penilaian_kinerja",
  saHasil: "perlu_diperbaiki",
} as const;
const semuaValid = {
  hasil_penilaian_kinerja: "valid",
  skck: "valid",
  sk_pengalaman_manajerial: "valid",
  surat_bebas_hukuman: "valid",
  pakta_integritas: "valid",
} as const;
const saDokSelesai = {
  e1: semuaValid,
  e2: semuaValid,
  e3: semuaValid,
  e4: { ...semuaValid, skck: "tidak_valid" },
  e5: semuaValid,
  e6: semuaValid,
} as const;
const saPilih = {
  screen: "seleksi_administrasi_pilih_peserta_substansi",
  saDok: saDokSelesai,
} as const;
const lanjut = (dana: string) => ({ keputusan: "dilanjutkan", dana }) as const;
const saSemuaLanjut = {
  e1: lanjut("apbd"),
  e2: lanjut("apbd"),
  e3: lanjut("apbn"),
  e5: lanjut("apbd"),
  e6: lanjut("lainnya"),
};
const saEmpatLanjut = {
  e1: lanjut("apbd"),
  e2: lanjut("apbd"),
  e3: lanjut("apbn"),
  e5: lanjut("apbd"),
  e6: { keputusan: "tidak_dilanjutkan", dana: null },
} as const;
const pg = { screen: "pengusulan" } as const;
const pgUndangan = {
  screen: "pengusulan_buat_undangan",
  pgJenis: "undangan",
  pgTanggalMulai: "2026-12-01",
  pgTanggalAkhir: "2026-12-15",
} as const;
const pk = { screen: "pemetaan_kebutuhan" } as const;
const sm = { screen: "penugasan_swasta_murni", smMode: "form" } as const;
const smIsi = { nik: "3201", asal: "w3", tujuan: "w1" };
const pbData = {
  b1: { alasan: "permintaan_sendiri", sekolah: "g1" },
  b3: { alasan: "akhir_periode_penugasan", sekolah: "g2" },
};

export const tours: Tour<SimState>[] = [
  {
    id: "penugasan-reguler",
    title: "Penugasan Reguler",
    description:
      "Dari daftar Penugasan Reguler: minta dan validasi dokumen NAPZA, buat pengajuan, sampai kirim data dan dokumen ke BKN.",
    questions: ["Q-05", "Q-06", "Q-07"],
    steps: [
      { event: "view_penugasan_reguler", target: "page-penugasan", sim: {} },
      {
        event: "click_penugasan_kirim_permintaan_napza_confirm",
        target: "napza-kirim-confirm",
        sim: { modal: "konfirmasi_napza", napzaTarget: "p2" },
        catatan:
          "Tombol Kirim Permintaan Dokumen NAPZA sendiri tidak dicatat; event dikirim setelah konfirmasi. Hanya untuk peserta dengan sertifikat pelatihan (BR-041).",
      },
      {
        event: "click_penugasan_lihat_berkas_napza",
        target: "napza-lihat-berkas",
        sim: {},
        catatan:
          "Muncul untuk peserta yang sudah mengunggah NAPZA di Ruang GTK (Belum Divalidasi).",
      },
      {
        event: "click_penugasan_validasi_napza_confirm",
        target: "napza-validasi-confirm",
        sim: { modal: "dokumen_napza", napzaTarget: "p3", napzaHasil: "valid" },
        catatan: "Hanya CKS dengan NAPZA valid yang bisa dipilih di pengajuan (BR-043).",
      },
      { event: "click_penugasan_buat_pengajuan", target: "buat-pengajuan", sim: {} },
      { event: "click_penugasan_filter_kategori", target: "filter-kategori", sim: { ...tahap1 } },
      {
        event: "click_penugasan_info_rekomendasi",
        target: "info-rekomendasi",
        sim: { ...tahap1 },
        catatan: "Menjawab Q-05: apakah rekomendasi dibuka sebelum memilih sekolah tujuan.",
      },
      { event: "click_penugasan_pilih_sekolah", target: "pilih-sekolah", sim: { ...tahap1 } },
      { event: "click_penugasan_lanjutkan", target: "lanjutkan", sim: { ...tahap1, ...pilihan } },
      {
        event: "click_penugasan_alasan_pemberhentian_simpan",
        target: "alasan-simpan",
        sim: {
          screen: "penugasan_buat_pengajuan",
          tahap: 2,
          modal: "alasan_pemberhentian",
          alasanPemberhentian: "akhir_periode_penugasan",
          ...pilihan,
        },
        catatan: "Muncul hanya bila sekolah tujuan masih punya KS aktif.",
      },
      {
        event: "click_penugasan_kirim_bkn",
        target: "kirim-bkn",
        sim: {
          screen: "penugasan_buat_pengajuan",
          tahap: 3,
          modal: "unggah_dokumen",
          alasanPemberhentian: "akhir_periode_penugasan",
          ...pilihan,
        },
        catatan: "Dikirim setelah respons API sukses, bukan saat tombol diklik.",
      },
      {
        event: "click_penugasan_cek_pengajuan",
        target: "cek-pengajuan",
        sim: {},
        catatan: "Menjawab Q-07: seberapa sering status dicek setelah kirim ke BKN.",
      },
    ],
  },
  {
    id: "penugasan-non-reguler",
    title: "Penugasan Non-Reguler",
    description:
      "Dari daftar Penugasan Non-Reguler: minta dan validasi NAPZA kandidat lulus seleksi administrasi, pilih calon, lengkapi alasan, sampai kirim ke BKN.",
    questions: ["Q-05", "Q-06", "Q-07"],
    steps: [
      { event: "view_penugasan_non_reguler", target: "page-penugasan", sim: { ...nr } },
      {
        event: "click_penugasan_kirim_permintaan_napza_confirm",
        target: "napza-kirim-confirm",
        sim: { ...nr, modal: "konfirmasi_napza", napzaTarget: "k1" },
        catatan:
          "Untuk kandidat lulus seleksi administrasi berstatus Belum Diundang. Setelah dikirim, kolom aksi menjadi Menunggu Dokumen Peserta.",
      },
      { event: "click_penugasan_lihat_berkas_napza", target: "napza-lihat-berkas", sim: { ...nr } },
      {
        event: "click_penugasan_validasi_napza_confirm",
        target: "napza-validasi-confirm",
        sim: { ...nr, modal: "dokumen_napza", napzaTarget: "k2", napzaHasil: "perlu_diperbaiki" },
        catatan:
          "Non-reguler punya opsi ketiga Perlu Diperbaiki (hasil_validasi = perlu_diperbaiki).",
      },
      { event: "click_penugasan_buat_pengajuan", target: "buat-pengajuan", sim: { ...nr } },
      {
        event: "click_penugasan_filter_kategori",
        target: "filter-kategori",
        sim: { ...nrTahap1 },
        catatan: "Di non-reguler filter berupa dropdown Semua/Promosi/Mutasi.",
      },
      {
        event: "click_penugasan_info_rekomendasi",
        target: "info-rekomendasi",
        sim: { ...nrTahap1 },
        catatan:
          "KS dengan keterangan Segera Pensiun tidak bisa diusulkan non-reguler (slide 134).",
      },
      {
        event: "click_penugasan_ajukan_mutasi_kurang_2_tahun",
        target: "ajukan-mutasi-2-tahun",
        sim: { ...nrTahap1, peran: "super_admin", modal: "info_rekomendasi", infoTarget: "c3" },
        catatan:
          "Aksi Super Admin (slide 173–182), tersedia di reguler & non-reguler. Setelah dokumen diunggah, Dinas melanjutkan pengajuan dengan SPTJM.",
      },
      { event: "click_penugasan_pilih_sekolah", target: "pilih-sekolah", sim: { ...nrTahap1 } },
      {
        event: "click_penugasan_lanjutkan",
        target: "lanjutkan",
        sim: { ...nrTahap1, ...pilihan },
        catatan: "Tombol Lanjutkan Penugasan ada di atas tabel, sejajar pencarian.",
      },
      {
        event: "click_penugasan_alasan_pemberhentian_simpan",
        target: "alasan-simpan",
        sim: {
          ...nr,
          screen: "penugasan_buat_pengajuan",
          tahap: 2,
          modal: "alasan_pemberhentian",
          alasanPemberhentian: "akhir_periode_penugasan",
          ...pilihan,
        },
      },
      {
        event: "click_penugasan_kirim_bkn",
        target: "kirim-bkn",
        sim: {
          ...nr,
          screen: "penugasan_buat_pengajuan",
          tahap: 2,
          modal: "unggah_dokumen",
          alasanPemberhentian: "akhir_periode_penugasan",
          ...pilihan,
        },
        catatan:
          "Non-reguler tidak punya langkah Ringkasan; dari daftar langsung ke unggah dokumen.",
      },
      {
        event: "click_penugasan_cek_pengajuan",
        target: "cek-pengajuan",
        sim: { ...nr, toast: "Berhasil melakukan Penugasan Kepala Sekolah (Non-Reguler)." },
        catatan: "Di non-reguler tombolnya berlabel Cek Penugasan.",
      },
    ],
  },
  {
    id: "pemberhentian",
    title: "Pemberhentian Murni",
    description:
      "Dari daftar Pemberhentian: pilih KS, lengkapi alasan dan sekolah tujuan, unggah dokumen, cek ringkasan, sampai kirim ke BKN.",
    questions: ["Q-05", "Q-06", "Q-07"],
    steps: [
      { event: "view_pemberhentian", target: "page-pemberhentian", sim: { ...pb } },
      { event: "click_pemberhentian_buat_pengajuan", target: "buat-pengajuan", sim: { ...pb } },
      {
        event: "click_pemberhentian_info_rekomendasi",
        target: "pb-info",
        sim: { ...pbBuat },
        catatan:
          "Menjawab Q-05: apakah tag Harus (Segera) Diberhentikan dibuka sebelum KS dipilih. Baris abu-abu (data belum lengkap, segera pensiun) tidak bisa dipilih.",
      },
      {
        event: "click_pemberhentian_lanjut_lengkapi_data",
        target: "pb-lanjut-lengkapi",
        sim: { ...pbBuat, pbDipilih },
      },
      {
        event: "click_pemberhentian_alasan_simpan",
        target: "pb-alasan-simpan",
        sim: {
          ...pbBuat,
          pbTahap: 2,
          pbDipilih,
          modal: "pb_lengkapi",
          pbTarget: "b1",
          pbDraft: { alasan: "permintaan_sendiri", sekolah: "g1" },
        },
        catatan:
          "Pilihan sekolah tujuan hanya muncul untuk 6 alasan pertama (KS kembali menjadi guru).",
      },
      {
        event: "click_pemberhentian_lanjut_cek_ringkasan",
        target: "pb-lanjut-ringkasan",
        sim: { ...pbBuat, pbTahap: 3, pbDipilih, pbData },
      },
      {
        event: "click_pemberhentian_kirim_bkn_confirm",
        target: "pb-kirim-confirm",
        sim: { ...pbBuat, pbTahap: 4, pbDipilih, pbData, modal: "pb_kirim_confirm" },
        catatan: "Dikirim setelah respons API sukses dari tombol Ya, Kirim ke BKN.",
      },
      {
        event: "click_pemberhentian_cek_pengajuan",
        target: "cek-pengajuan",
        sim: {
          ...pb,
          pbRiwayatBaru: 2,
          toast: "Pengajuan pemberhentian kepala sekolah berhasil dibuat.",
        },
        catatan: "Menjawab Q-07: pengajuan baru berstatus Sedang Dikirim (BR-062).",
      },
    ],
  },
  {
    id: "swasta-murni",
    title: "Penugasan Swasta Murni",
    description:
      "Formulir tunggal untuk KS sekolah swasta non-ASN: isi formulir, konfirmasi, lalu riwayat dan unduh Excel.",
    questions: ["Q-06", "Q-09"],
    steps: [
      {
        event: "view_penugasan_swasta_murni",
        target: "sm-form",
        sim: { ...sm },
        catatan: "Formulir langsung tampil saat menu Swasta Murni dibuka.",
      },
      {
        event: "click_penugasan_swasta_murni_simpan_confirm",
        target: "sm-simpan",
        sim: { ...sm, smForm: smIsi, smSetuju: true, modal: "sm_konfirmasi" },
        catatan:
          "Tombol Kirim di formulir dan Reset Form tidak punya event; formulir yang ditinggalkan di tengah jalan tidak terlihat.",
      },
      {
        event: "download_riwayat_penugasan_swasta",
        target: "sm-unduh",
        sim: {
          ...sm,
          smForm: smIsi,
          smMode: "riwayat",
          smBaru: 1,
          toast: "Penugasan Swasta Murni Berhasil Dikirim.",
        },
        catatan: "Menjawab Q-09: indikasi rekap riwayat diolah di luar sistem.",
      },
    ],
  },
  {
    id: "pemetaan-kebutuhan",
    title: "Pemetaan Kebutuhan KS",
    description:
      "Dinas memilih tahun proyeksi, memfilter dan mencari sekolah, membuka info rekomendasi/periode, memetakan sekolah, lalu menambah sekolah di luar daftar.",
    questions: ["Q-01", "Q-05", "Q-09"],
    steps: [
      {
        event: "view_demand_ks",
        target: "page-pemetaan",
        sim: { ...pk },
        catatan: "Aktifkan kembali: event v2 ini berhenti sejak 2025-08-04.",
      },
      { event: "click_demand_ks_proyeksi_tahun", target: "pk-tahun", sim: { ...pk } },
      {
        event: "click_demand_ks_filter",
        target: "pk-filter-kondisi",
        sim: { ...pk },
        catatan:
          "Satu event untuk dua kelompok chip; dibedakan lewat filter_name (jenjang / kondisi_ks).",
      },
      {
        event: "click_demand_ks_search",
        target: "pk-search",
        sim: { ...pk },
        catatan: "Dikirim setelah berhenti mengetik 800 ms; isi kata kunci tidak dikirim.",
      },
      { event: "click_demand_ks_info_rekomendasi", target: "pk-info-rekomendasi", sim: { ...pk } },
      {
        event: "click_demand_ks_info_periode",
        target: "pk-info-periode",
        sim: { ...pk },
        catatan: "Ikon biru muncul untuk sisa masa penugasan < 6 bulan (BR-011).",
      },
      {
        event: "click_demand_ks_petakan",
        target: "pk-petakan",
        sim: { ...pk },
        catatan:
          "Menjawab Q-01. Dikirim setelah respons API sukses; aksi = petakan / batal_petakan.",
      },
      { event: "click_profile_school", target: "pk-rincian", sim: { ...pk } },
      { event: "download_demand_ks", target: "pk-unduh", sim: { ...pk } },
      { event: "click_manual_demand_tambah_sekolah", target: "pk-tambah", sim: { ...pk } },
      {
        event: "click_manual_demand_tambah_sekolah_simpan",
        target: "pk-tambah-simpan",
        sim: {
          screen: "pemetaan_tambah_sekolah",
          pkDraft: [{ sekolah: "t1", alasan: "Pensiun" }],
        },
        catatan:
          "Halaman Perbarui Data Kebutuhan belum punya screen_name sendiri di usulan; event ini memakai pemetaan_kebutuhan.",
      },
    ],
  },
  {
    id: "guru-memenuhi-syarat",
    title: "Guru Memenuhi Syarat",
    description:
      "Dinas meninjau daftar guru yang memenuhi syarat BCKS: filter jenjang/jabatan dan cek profil.",
    questions: ["Q-09"],
    steps: [
      {
        event: "view_supply_bcks",
        target: "page-gms",
        sim: { screen: "guru_memenuhi_syarat" },
        catatan: "Aktifkan kembali: event v2 ini berhenti sejak 2025-06-16.",
      },
      {
        event: "click_supply_bcks_filter",
        target: "gms-filter-jenjang",
        sim: { screen: "guru_memenuhi_syarat" },
        catatan: "Pencarian nama BCKS belum punya event di usulan.",
      },
      {
        event: "click_profile_bcks",
        target: "gms-profil",
        sim: { screen: "guru_memenuhi_syarat" },
      },
    ],
  },
  {
    id: "pengusulan-bcks",
    title: "Pengusulan BCKS",
    description:
      "Dinas membuka seleksi administrasi lewat Pengumuman (semua BCKS di wilayah) atau Undangan (BCKS terpilih): atur tanggal, pilih BCKS, kirim.",
    questions: ["Q-02", "Q-09"],
    steps: [
      { event: "view_pengusulan", target: "page-pengusulan", sim: { ...pg } },
      {
        event: "click_pengusulan_buat_pengumuman",
        target: "pg-buat-pengumuman",
        sim: { ...pg },
        catatan:
          "Setelah ini muncul modal Konfirmasi Pengumuman; tombol Lanjut buat Pengumuman tidak dicatat.",
      },
      {
        event: "click_pengusulan_kirim_pengumuman",
        target: "pg-kirim-pengumuman",
        sim: {
          screen: "pengusulan_buat_pengumuman",
          pgJenis: "pengumuman",
          pgTanggalAkhir: "2026-12-15",
        },
        catatan:
          "Menjawab Q-02: selisih dengan *_confirm = pengumuman yang batal di modal konfirmasi.",
      },
      {
        event: "click_pengusulan_kirim_pengumuman_confirm",
        target: "pg-kirim-confirm",
        sim: {
          screen: "pengusulan_buat_pengumuman",
          pgJenis: "pengumuman",
          pgTanggalAkhir: "2026-12-15",
          modal: "pg_kirim_confirm",
        },
      },
      { event: "click_pengusulan_buat_undangan", target: "pg-buat-undangan", sim: { ...pg } },
      {
        event: "click_pengusulan_undangan_pilih_bcks",
        target: "pg-pilih-bcks",
        sim: { ...pgUndangan, pgTahap: 1 },
      },
      {
        event: "click_pengusulan_undangan_filter",
        target: "pg-filter",
        sim: { ...pgUndangan, pgTahap: 2 },
        catatan:
          "Chip jenjang dan dropdown golongan memakai satu event, dibedakan lewat filter_name.",
      },
      {
        event: "click_pengusulan_undangan_cek_profil",
        target: "pg-cek-profil",
        sim: { ...pgUndangan, pgTahap: 2 },
      },
      {
        event: "click_pengusulan_undangan_ke_kirim",
        target: "pg-ke-kirim",
        sim: { ...pgUndangan, pgTahap: 2, pgDipilih: ["n1", "n2", "n3"] },
        catatan: "Memilih BCKS (centang) tidak punya event; jumlahnya terbawa di jumlah_bcks.",
      },
      {
        event: "click_pengusulan_kirim_undangan_confirm",
        target: "pg-kirim-confirm",
        sim: {
          ...pgUndangan,
          pgTahap: 3,
          pgDipilih: ["n1", "n2", "n3"],
          modal: "pg_kirim_confirm",
        },
      },
    ],
  },
  {
    id: "seleksi-administrasi",
    title: "Seleksi Administrasi",
    description:
      "Cek dan validasi berkas BCKS, tambah BCKS, selesaikan, lalu pilih peserta seleksi substansi (aksi, sumber dana, kuota, berita acara).",
    questions: ["Q-03", "Q-04"],
    steps: [
      {
        event: "view_seleksi_administrasi",
        target: "page-sa",
        sim: { screen: "seleksi_administrasi" },
      },
      {
        event: "click_selections_cek_berkas",
        target: "sa-cek-berkas",
        sim: { ...saCek },
        catatan:
          "Tombol Cek berkas di halaman riwayat (membuka daftar peserta satu seleksi) belum punya event; event ini untuk Cek berkas per peserta.",
      },
      {
        event: "click_selections_cek_berkas_validasi_dokumen",
        target: "sa-validasi-dok",
        sim: { ...saCek, saPeserta: "e3" },
      },
      {
        event: "click_selections_cek_berkas_validasi_dokumen_perbaiki",
        target: "sa-opsi-perbaiki",
        sim: { ...saValidasi },
        catatan:
          "Dikirim saat opsi dipilih, bukan saat dikonfirmasi; Konfirmasi Perlu Diperbaiki tidak punya event sendiri.",
      },
      {
        event: "click_selections_cek_berkas_validasi_dokumen_valid_confirm",
        target: "sa-validasi-konfirmasi",
        sim: { ...saValidasi, saHasil: "valid" },
        catatan: "Hasil validasi tidak dapat diubah setelah dikonfirmasi (BR-021).",
      },
      {
        event: "click_selections_cek_berkas_validasi_dokumen_tidak_valid_simpan",
        target: "sa-validasi-konfirmasi",
        sim: { ...saValidasi, saHasil: "tidak_valid" },
      },
      { event: "click_selections_tambah_bcks", target: "sa-tambah-bcks", sim: { ...saCek } },
      {
        event: "click_selections_tambah_bcks_confirm",
        target: "sa-tambah-confirm",
        sim: { ...saCek, modal: "sa_tambah_bcks", saTambahPilih: ["n3"] },
        catatan: "Fitur baru (BR-029): BCKS ditambahkan ke seleksi yang masih berjalan.",
      },
      {
        event: "click_selections_atur_seleksi",
        target: "sa-atur",
        sim: { ...saCek },
        catatan:
          "Hasil perpanjang/batal sudah ada di backend; event ini hanya mencatat niat membuka pengaturan.",
      },
      {
        event: "click_selections_selesaikan",
        target: "sa-selesaikan",
        sim: { ...saCek, saDok: saDokSelesai },
        catatan: "Selesaikan baru aktif setelah berkas semua peserta divalidasi (BR-022).",
      },
      {
        event: "click_selections_ke_non_reguler",
        target: "sa-ke-nonreguler",
        sim: { ...saCek, saDok: saDokSelesai, modal: "sa_selesaikan" },
        catatan: "Menjawab Q-04: berapa yang memilih jalur non-reguler (BR-023).",
      },
      {
        event: "click_selections_ke_seleksi_substansi",
        target: "sa-ke-substansi",
        sim: { ...saCek, saDok: saDokSelesai, modal: "sa_selesaikan" },
      },
      {
        event: "click_selections_substansi_terapkan",
        target: "sa-terapkan",
        sim: {
          ...saPilih,
          saPilih: ["e1", "e2", "e3"],
          saBulkAksi: "dilanjutkan",
          saBulkDana: "apbd",
        },
        catatan:
          "Aksi per baris (dropdown di tabel) belum punya event; hanya Terapkan di bilah massal.",
      },
      {
        event: "click_selections_substansi_tidak_dilanjutkan_confirm",
        target: "sa-tidak-lanjut-confirm",
        sim: {
          ...saPilih,
          modal: "sa_tidak_lanjut_confirm",
          saTidakLanjut: ["e6"],
          saAlasan: [
            "Usia pendaftar pada lokasi penempatan satuan pendidikan ada yang lebih diprioritaskan",
          ],
        },
        catatan: "Isi alasan tambahan tidak dikirim; cukup ada_alasan_tambahan (BR-025).",
      },
      {
        event: "view_selections_substansi_kuota_terlampaui",
        target: "sa-kuota-warning",
        sim: { ...saPilih, saKeputusan: saSemuaLanjut, saKuotaLebih: true },
        catatan:
          "Peringatan sistem (event_trigger = system) saat dilanjutkan > 2 × kuota pelatihan (BR-024).",
      },
      {
        event: "click_selections_unggah_berita_acara",
        target: "sa-unggah-ba",
        sim: { ...saPilih, saKeputusan: saEmpatLanjut },
      },
      {
        event: "click_selections_kirim_undangan_substansi_confirm",
        target: "sa-kirim-undangan",
        sim: { ...saPilih, saKeputusan: saEmpatLanjut, modal: "sa_berita_acara", saSetuju: true },
        catatan: "Setelah terkirim data peserta terkunci (BR-026).",
      },
      {
        event: "click_seleksi_substansi_manajemen",
        target: "sa-manajemen",
        sim: { screen: "seleksi_substansi" },
        catatan: "Tautan keluar ke Sistem Seleksi Substansi.",
      },
    ],
  },
  {
    id: "pelatihan",
    title: "Pelatihan (UPT)",
    description:
      "UPT membuka daftar program dan peserta, lalu membuat program: jadwal, kelas & pengajar, peserta, ringkasan, kirim ke LMS. Super Admin menindaklanjuti peserta tidak lulus.",
    questions: ["Q-09", "Q-10"],
    steps: [
      {
        event: "view_pelatihan",
        target: "page-pelatihan",
        sim: { ...pl },
        catatan: "Aktor UPT: user_role = upt_gtk, kode_wilayah = wilayah yang dipilih UPT.",
      },
      { event: "click_pelatihan_ke_lms_admin", target: "pl-lms", sim: { ...pl } },
      { event: "download_peserta_pelatihan", target: "pl-unduh", sim: { ...pl } },
      {
        event: "click_pelatihan_tidak_lulus_aksi_confirm",
        target: "pl-tidak-lulus-confirm",
        sim: {
          ...pl,
          peran: "super_admin",
          modal: "pl_tidak_lulus",
          plTarget: "f7",
          plAksi: "pelatihan_ulang",
        },
        catatan:
          "Aksi Super Admin (BR-035). Pelatihan ulang punya batas waktu; gugurkan mengembalikan ke Guru Memenuhi Syarat.",
      },
      { event: "click_pelatihan_buat_program", target: "pl-buat", sim: { ...pl } },
      {
        event: "click_pelatihan_jadwal_berikutnya",
        target: "pl-jadwal-berikutnya",
        sim: { ...plBuat, plTahap: 1 },
        catatan: "Menjawab Q-10 bersama langkah berikutnya: di langkah mana UPT berhenti.",
      },
      {
        event: "click_pelatihan_pilih_pengajar_simpan",
        target: "pl-pengajar-simpan",
        sim: { ...plBuat, plTahap: 2, modal: "pl_pengajar", plPengajarDraft: ["j1", "j3"] },
        catatan:
          "2–3 pengajar per kelas (BR-032); ada_pengajar_luar_daerah = true bila memilih dari daerah lain.",
      },
      {
        event: "click_pelatihan_tambah_kelas",
        target: "pl-tambah-kelas",
        sim: { ...plBuat, plTahap: 2, plKelas: plKelasIsi },
        catatan: "Tambah/hapus admin kelas (maks. 5, BR-031) belum punya event.",
      },
      {
        event: "click_pelatihan_peserta_berikutnya",
        target: "pl-peserta-berikutnya",
        sim: { ...plBuat, plTahap: 3, plKelas: plKelasIsi, plPeserta: plPesertaIsi },
        catatan: "Maks. 40 peserta per kelas (BR-033); satu peserta hanya di satu kelas (BR-034).",
      },
      {
        event: "click_pelatihan_buat_program_confirm",
        target: "pl-buat-confirm",
        sim: {
          ...plBuat,
          plTahap: 4,
          plKelas: plKelasIsi,
          plPeserta: plPesertaIsi,
          modal: "pl_buat_confirm",
        },
        catatan:
          "Dikirim setelah respons API sukses; status peserta berubah menjadi Sudah dikirim ke LMS Admin.",
      },
    ],
  },
  {
    id: "pengajuan-perubahan",
    title: "Periodisasi & SK PPPK",
    description:
      "Dinas mengajukan perubahan periodisasi KS (tambah/ubah/hapus riwayat, validasi tunjangan) dan pengaliran SK PPPK; UPT dan Super Admin memverval.",
    questions: ["Q-06", "Q-11"],
    steps: [
      {
        event: "view_pengajuan_perubahan",
        target: "page-pengajuan-perubahan",
        sim: { ...pdDaftar },
      },
      {
        event: "click_pengajuan_perubahan_buat",
        target: "pd-jenis-periodisasi",
        sim: { ...pdDaftar, modal: "pd_jenis" },
        catatan:
          "Dikirim saat jenis dipilih (periodisasi / sk_pppk), bukan saat tombol Buat pengajuan baru diklik.",
      },
      {
        event: "click_periodisasi_tambah_riwayat",
        target: "pd-tambah-reguler",
        sim: { ...pdIsi },
        catatan: "Reguler = satu entri per tahun (BR-070); Arsip = rentang sebelum 2019 (BR-071).",
      },
      {
        event: "click_periodisasi_riwayat_simpan",
        target: "pd-form-simpan",
        sim: {
          ...pdIsi,
          modal: "pd_form",
          pdForm: {
            id: null,
            tipe: "reguler",
            tahun: "2023",
            sekolah: "SD Negeri 10",
            tmt: "2020-07-01",
            tst: "",
            noSk: "Peg.824/47/2020",
            tstLebih2018: false,
          },
        },
      },
      {
        event: "view_periodisasi_blokir_tunjangan",
        target: "pd-blokir",
        sim: { ...pdIsi, pdBlokir: { aturan: "hapus_riwayat", tahun: "2021", semester: 1 } },
        catatan:
          "Menjawab Q-11. Peringatan sistem saat riwayat bertunjangan coba dihapus/diubah (BR-074, BR-075).",
      },
      {
        event: "click_periodisasi_riwayat_hapus_confirm",
        target: "pd-hapus-confirm",
        sim: { ...pdIsi, modal: "pd_hapus", pdHapusId: "r22" },
      },
      {
        event: "click_periodisasi_lanjut_ringkasan",
        target: "pd-lanjut-ringkasan",
        sim: { ...pdIsi, pdRiwayat: pdRiwayatUbah },
      },
      {
        event: "click_periodisasi_ajukan_confirm",
        target: "pd-ajukan-confirm",
        sim: { ...pdIsi, pdTahap: 2, pdRiwayat: pdRiwayatUbah, modal: "pd_ajukan" },
        catatan:
          "Wajib SPTJM + SK Pengangkatan KS Definitif Pertama (BR-073). Selisih dengan lanjut_ringkasan = pengajuan yang tidak jadi.",
      },
      {
        event: "click_periodisasi_upt_periksa",
        target: "pd-periksa",
        sim: { ...pdDaftar, peran: "upt_gtk", pdPengajuan: pdAntrean },
        catatan: "Aktor UPT.",
      },
      {
        event: "click_periodisasi_upt_setujui_confirm",
        target: "pd-verval-confirm",
        sim: {
          screen: "verval_periodisasi",
          peran: "upt_gtk",
          pdPengajuan: pdAntrean,
          pdVerval: "pp9",
          pdHasil: "disetujui",
          modal: "pd_verval_confirm",
        },
      },
      {
        event: "view_dasbor_pengajuan_perubahan",
        target: "page-dasbor",
        sim: { screen: "dasbor_pengajuan_perubahan", peran: "super_admin" },
        catatan: "Hanya Super Admin.",
      },
      {
        event: "click_sk_pppk_lanjut_unggah",
        target: "sk-lanjut-unggah",
        sim: { screen: "pengaliran_sk_pppk", skTahap: 1, skPilih: ["q1"] },
        catatan: "Memilih PTK (centang) belum punya event; jumlahnya terbawa di jumlah_ptk.",
      },
      {
        event: "click_sk_pppk_ajukan_confirm",
        target: "sk-ajukan-confirm",
        sim: {
          screen: "pengaliran_sk_pppk",
          skTahap: 3,
          skPilih: ["q1"],
          modal: "sk_ajukan_confirm",
        },
      },
      {
        event: "click_sk_pppk_verval_confirm",
        target: "sk-verval-confirm",
        sim: {
          screen: "verval_sk_pppk",
          peran: "super_admin",
          modal: "sk_verval_confirm",
          skTarget: "q2",
          skHasil: "disetujui",
        },
        catatan: "Keputusan final dan tidak dapat diubah. Alasan penolakan (teks) tidak dikirim.",
      },
    ],
  },
  {
    id: "beranda-bantuan",
    title: "Beranda & Bantuan",
    description:
      "Beranda dan pengumuman (Super Admin), Chat dengan Bot, Konsultasi Daring, serta ganti wilayah oleh UPT. Bantuan tersedia di semua halaman.",
    questions: ["Q-08"],
    steps: [
      { event: "view_beranda", target: "page-beranda", sim: { ...br } },
      { event: "click_pelajari_panduan", target: "br-pelajari", sim: { ...br } },
      {
        event: "click_pengumuman_beranda_simpan",
        target: "br-pengumuman-confirm",
        sim: {
          ...br,
          peran: "super_admin",
          pengumumanDraft: "Konsultasi daring minggu ini dibuka Selasa dan Kamis.",
          modal: "br_pengumuman_confirm",
        },
        catatan:
          "Aksi Super Admin; maks. 500 karakter. Isi teks tidak dikirim, hanya jumlah_karakter.",
      },
      {
        event: "click_chat_bot",
        target: "chat-bot-btn",
        sim: { ...br },
        catatan: "Menjawab Q-08: screen_name menunjukkan di halaman mana pengguna mencari bantuan.",
      },
      {
        event: "click_chat_bot_form_kirim",
        target: "chat-form-kirim",
        sim: { ...br, chatOpen: true },
        catatan: "Nama dan email di formulir TIDAK dikirim ke tracker.",
      },
      {
        event: "click_chat_bot_kirim_pertanyaan",
        target: "chat-kirim",
        sim: {
          ...br,
          chatOpen: true,
          chatTerdaftar: true,
          chatDraft: "Bagaimana cara memperpanjang seleksi?",
        },
        catatan: "Isi pertanyaan tidak dikirim; hanya nomor_pertanyaan dan panjang_pertanyaan.",
      },
      {
        event: "click_konsultasi_daring",
        target: "konsultasi-btn",
        sim: { ...br },
        catatan: "Sudah ada di tracker v3; dipertahankan dengan kolom konteks yang terisi.",
      },
      {
        event: "click_ikuti_konsultasi_zoom",
        target: "konsultasi-ikuti",
        sim: { ...br, modal: "konsultasi" },
      },
      {
        event: "click_ganti_wilayah",
        target: "wilayah",
        sim: { ...br, peran: "upt_gtk" },
        catatan: "Hanya UPT. Setelah berganti, kode_wilayah di event berikutnya ikut berubah.",
      },
    ],
  },
  {
    id: "manajemen-ks-aktif",
    title: "Manajemen KS Aktif",
    description:
      "Daftar KS aktif (segera pensiun) dan tidak aktif (pensiun, meninggal dunia), filter, dan unduh daftar.",
    questions: ["Q-09"],
    steps: [
      { event: "view_manajemen_ks", target: "page-manajemen-ks", sim: { ...ks } },
      { event: "click_manajemen_ks_tab", target: "ks-tab", sim: { ...ks } },
      {
        event: "click_manajemen_ks_filter",
        target: "ks-filter",
        sim: { ...ks },
        catatan: "Pencarian nama sekolah/KS belum punya event di usulan.",
      },
      { event: "download_daftar_ks", target: "ks-unduh", sim: { ...ks } },
    ],
  },
];
