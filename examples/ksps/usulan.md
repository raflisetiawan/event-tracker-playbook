---
topik: Usulan event tracker frontend KSPS untuk gap pasca-RPM (untuk diskusi dengan tim Product)
status: DRAF v0.1 — untuk diskusi dengan tim Product
dibuat: 2026-10-22
dibaca-oleh: tim Product, Engineer, AI agent yang menindaklanjuti usulan tracker
---

# Usulan Tracker KSPS Pasca-RPM

**104 event** — P0: 43 · P1: 43 · P2: 18 · baru: 89 · aktifkan kembali: 5 · pertahankan: 10.

Dasar: [tracker-existing.md](tracker-existing.md) (gap), [konvensi-event.md](konvensi-event.md) (pola nama), [katalog-event.md](katalog-event.md) (konsep event dari panduan).

## Latar

- Dashboard adopsi KSPS saat ini memakai data backend (punya akun, login, mulai seleksi, finalisasi). Data itu mencatat hasil proses, belum perilaku pengguna.
- Tracker frontend v2 berhenti merekam 39 dari 58 event sejak peluncuran RPM (±21 Mei 2025). Alur pasca-RPM — pengusulan, pemilihan peserta substansi, pelatihan, NAPZA, penugasan, pemberhentian, periodisasi, SK PPPK — belum punya tracker perilaku.
- Tracker v3 (sejak September 2026) baru dipakai untuk konsultasi daring, dan kolom konteksnya (screen_name, platform, url) belum terisi.

Tujuan: memahami **perilaku** Dinas/UPT di setiap menu, bukan menggandakan data proses yang sudah ada di backend.

## Pertanyaan perilaku yang ingin dijawab

| ID   | Area                        | Pertanyaan                                                                                                                              |
| ---- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Q-01 | Pemetaan                    | Berapa lama dinas dari membuka halaman pemetaan sampai memetakan sekolah, dan apakah tahun proyeksi / filter dipakai sebelum memetakan? |
| Q-02 | Pengusulan                  | Berapa banyak pengumuman/undangan yang mulai dibuat tetapi tidak jadi dikirim, dan di langkah mana dinas berhenti?                      |
| Q-03 | Seleksi administrasi        | Seberapa intens dinas mengecek berkas peserta, berapa lama verval sampai Selesaikan, dan dokumen mana paling sering perlu diperbaiki?   |
| Q-04 | Pemilihan peserta substansi | Seberapa sering peringatan kuota muncul, apa yang dilakukan dinas setelahnya, dan berapa yang memilih jalur non-reguler?                |
| Q-05 | Rekomendasi                 | Apakah informasi rekomendasi (ikon i/!) dibuka sebelum dinas memetakan, memilih sekolah tujuan, atau memberhentikan KS?                 |
| Q-06 | Penugasan                   | Di titik mana alur NAPZA → buat pengajuan → kirim ke BKN paling sering terhenti, per jalur reguler/non-reguler?                         |
| Q-07 | Pasca kirim BKN             | Seberapa sering dinas membuka cek pengajuan setelah mengirim ke BKN (indikasi kebutuhan notifikasi status)?                             |
| Q-08 | Bantuan                     | Kapan dan di halaman mana pengguna mencari bantuan (chat bot, konsultasi daring, panduan)?                                              |
| Q-09 | Eksplorasi data             | Seberapa sering pengguna mengunduh daftar, memfilter, mencari, dan membuka profil — indikasi kerja di luar sistem?                      |
| Q-10 | Pelatihan (UPT)             | Di langkah mana UPT berhenti saat membuat program pelatihan (jadwal, kelas, pengajar, peserta)?                                         |
| Q-11 | Periodisasi                 | Seberapa sering validasi tunjangan memblokir perubahan riwayat, dan berapa pengajuan periodisasi yang tidak jadi diajukan?              |

## Prioritas

| Prioritas | Arti                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------ |
| **P0**    | Gelombang pertama: halaman utama tiap tahap + tombol keputusan/kirim; dibutuhkan untuk funnel perilaku |
| **P1**    | Gelombang kedua: langkah antara, rekomendasi, bantuan, unduh                                           |
| **P2**    | Opsional: filter/pencarian rinci, fitur Super Admin, aksi jarang                                       |

## Standar skema v3 (berlaku untuk semua event usulan)

| Kolom                  | Isi yang diusulkan                                                                                            | Kondisi saat ini                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `event_name`           | Nama event sesuai daftar ini (pola `<aksi>_<objek>…`)                                                         | Terisi                                           |
| `screen_name`          | Kode halaman dari daftar screen_name di bawah                                                                 | Saat ini selalu `unknown` — **wajib diperbaiki** |
| `referrer_screen_name` | screen_name halaman sebelumnya                                                                                | Kosong — wajib diisi                             |
| `url / referrer_url`   | URL tanpa query string yang memuat data pribadi                                                               | Kosong — wajib diisi                             |
| `event_trigger`        | `page_load` (view_*), `click`, `submit` (*_confirm setelah respons sukses), `system` (peringatan dari sistem) | Kosong — wajib diisi                             |
| `platform`             | `web`                                                                                                         | Saat ini `unknown`                               |
| `application_version`  | Versi rilis frontend (semver)                                                                                 | Saat ini `unknown`                               |
| `device_category`      | `desktop`                                                                                                     | `mobile`                                         | `tablet` | Kosong |
| `attributes`           | Key-value; `user_role` dan `kode_wilayah` wajib di semua event, ditambah atribut per event                    | Baru dipakai untuk konsultasi daring             |
| `email`                | Usulan: tidak dikirim, atau di-hash                                                                           | Terisi email mentah — perlu keputusan            |

Aturan pemicu:

- `view_*` dikirim sekali saat halaman selesai dimuat (`event_trigger = page_load`).
- `*_confirm`, `click_*_kirim_bkn`, dan `click_demand_ks_petakan` dikirim **setelah respons API sukses** (`event_trigger = submit`), agar jumlahnya sama dengan aksi yang benar-benar terjadi.
- Peringatan dari sistem (kuota, blokir tunjangan) memakai prefiks `view_` dan `event_trigger = system`.
- Pencarian dikirim setelah pengguna berhenti mengetik 800 ms; isi kata kunci tidak dikirim.

### Daftar `screen_name`

| screen_name                                    | Halaman                             |
| ---------------------------------------------- | ----------------------------------- |
| `beranda`                                      | Beranda                             |
| `pemetaan_kebutuhan`                           | Pemetaan Kebutuhan KS               |
| `guru_memenuhi_syarat`                         | Guru Memenuhi Syarat                |
| `pengusulan`                                   | Daftar Riwayat Pengusulan           |
| `pengusulan_buat_pengumuman`                   | Buat Pengumuman                     |
| `pengusulan_buat_undangan`                     | Buat Undangan & pilih BCKS          |
| `seleksi_administrasi`                         | Daftar seleksi administrasi         |
| `seleksi_administrasi_cek_berkas`              | Cek berkas & validasi dokumen       |
| `seleksi_administrasi_pilih_peserta_substansi` | Pemilihan peserta seleksi substansi |
| `seleksi_substansi`                            | Menu Seleksi Substansi              |
| `pelatihan`                                    | Pelatihan (UPT)                     |
| `pelatihan_buat_program`                       | Buat program pelatihan              |
| `penugasan_reguler`                            | Penugasan Reguler                   |
| `penugasan_non_reguler`                        | Penugasan Non-Reguler               |
| `penugasan_buat_pengajuan`                     | Buat pengajuan penugasan/mutasi     |
| `penugasan_detail_pengajuan`                   | Detail pengajuan                    |
| `penugasan_swasta_murni`                       | Penugasan Swasta Murni              |
| `pemberhentian`                                | Pemberhentian                       |
| `pemberhentian_buat_pengajuan`                 | Buat usulan pemberhentian           |
| `pengajuan_perubahan`                          | Pengajuan Perubahan                 |
| `pengajuan_perubahan_periodisasi`              | Perubahan periodisasi               |
| `pengaliran_sk_pppk`                           | Pengaliran SK PPPK                  |
| `verval_periodisasi`                           | Verval periodisasi (UPT)            |
| `verval_sk_pppk`                               | Verval SK PPPK (Super Admin)        |
| `dasbor_pengajuan_perubahan`                   | Dasbor pengajuan perubahan          |
| `manajemen_ks_aktif`                           | Manajemen KS Aktif                  |

## Event per tahap

Kolom atribut hanya mencantumkan atribut khusus event; `user_role` dan `kode_wilayah` selalu ada.

### Umum & bantuan

Aktor: Dinas, UPT, Super Admin.

| Event                             | screen_name     | Pemicu                                                 | Atribut                                  | Prio | Q    | Status                   | Panduan                                                                            |
| --------------------------------- | --------------- | ------------------------------------------------------ | ---------------------------------------- | ---- | ---- | ------------------------ | ---------------------------------------------------------------------------------- |
| `view_beranda`                    | `beranda`       | Halaman beranda tampil                                 | —                                        | P1   | Q-08 | Baru                     | [slide 23](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-23) |
| `click_ganti_wilayah`             | (halaman aktif) | UPT memilih wilayah di kanan atas                      | `kode_wilayah_tujuan`                    | P1   | Q-09 | Baru                     | [slide 11](../guide/02-masuk-ke-sim-kspstk.md#slide-11)                            |
| `click_chat_bot`                  | (halaman aktif) | Klik Chat dengan Bot                                   | —                                        | P1   | Q-08 | Baru                     | [slide 13](../guide/03-fitur-tanya-bot-dan-konsultasi-daring.md#slide-13)          |
| `click_chat_bot_form_kirim`       | (halaman aktif) | Kirim formulir sebelum chat (nama/email TIDAK dikirim) | —                                        | P2   | Q-08 | Baru                     | [slide 14](../guide/03-fitur-tanya-bot-dan-konsultasi-daring.md#slide-14)          |
| `click_chat_bot_kirim_pertanyaan` | (halaman aktif) | Kirim pertanyaan ke bot                                | `nomor_pertanyaan`, `panjang_pertanyaan` | P1   | Q-08 | Baru                     | [slide 15](../guide/03-fitur-tanya-bot-dan-konsultasi-daring.md#slide-15)          |
| `click_pelajari_panduan`          | `beranda`       | Klik Pelajari                                          | —                                        | P2   | Q-08 | Baru                     | [slide 23](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-23) |
| `click_konsultasi_daring`         | (halaman aktif) | Klik Konsultasi Daring (sudah ada di v3)               | —                                        | P0   | Q-08 | Pertahankan (migrasi v3) | [slide 18](../guide/03-fitur-tanya-bot-dan-konsultasi-daring.md#slide-18)          |
| `click_ikuti_konsultasi_zoom`     | (halaman aktif) | Klik Ikuti Konsultasi Daring (sudah ada di v3)         | —                                        | P0   | Q-08 | Pertahankan (migrasi v3) | [slide 19](../guide/03-fitur-tanya-bot-dan-konsultasi-daring.md#slide-19)          |

### Pemetaan kebutuhan & Guru Memenuhi Syarat

Aktor: Dinas.

| Event                                       | screen_name            | Pemicu                                           | Atribut                                                   | Prio | Q          | Status                   | Panduan                                                                            |
| ------------------------------------------- | ---------------------- | ------------------------------------------------ | --------------------------------------------------------- | ---- | ---------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `view_demand_ks`                            | `pemetaan_kebutuhan`   | Halaman Pemetaan Kebutuhan KS tampil             | `tahun_proyeksi`                                          | P0   | Q-01       | Aktifkan kembali         | [slide 24](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-24) |
| `click_demand_ks_proyeksi_tahun`            | `pemetaan_kebutuhan`   | Memilih Proyeksi Tahun                           | `tahun_proyeksi`                                          | P1   | Q-01       | Baru                     | [slide 25](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-25) |
| `click_demand_ks_filter`                    | `pemetaan_kebutuhan`   | Klik chip jenjang/kondisi                        | `filter_name`, `filter_value`, `jumlah_hasil`             | P1   | Q-09       | Baru                     | [slide 26](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-26) |
| `click_demand_ks_search`                    | `pemetaan_kebutuhan`   | Cari nama sekolah (debounce 800 ms)              | `panjang_kata_kunci`, `jumlah_hasil`                      | P2   | Q-09       | Baru                     | [slide 26](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-26) |
| `click_demand_ks_info_rekomendasi`          | `pemetaan_kebutuhan`   | Klik ikon i merah di nama KS                     | `tag_rekomendasi`                                         | P1   | Q-05       | Baru                     | [slide 27](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-27) |
| `click_demand_ks_info_periode`              | `pemetaan_kebutuhan`   | Klik ikon i biru di periode penugasan            | `sisa_masa_bulan`                                         | P2   | Q-05       | Baru                     | [slide 29](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-29) |
| `click_demand_ks_petakan`                   | `pemetaan_kebutuhan`   | Klik Petakan / batalkan (setelah respons sukses) | `aksi`, `npsn`, `tahun_proyeksi`, `jenjang`, `kondisi_ks` | P0   | Q-01, Q-05 | Baru                     | [slide 30](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-30) |
| `click_manual_demand_tambah_sekolah`        | `pemetaan_kebutuhan`   | Klik Tambah Sekolah                              | —                                                         | P1   | Q-01       | Aktifkan kembali         | [slide 31](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-31) |
| `click_manual_demand_tambah_sekolah_simpan` | `pemetaan_kebutuhan`   | Simpan sekolah tambahan                          | `jumlah_peserta`                                          | P1   | Q-01       | Pertahankan (migrasi v3) | [slide 34](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-34) |
| `click_profile_school`                      | `pemetaan_kebutuhan`   | Klik Cek Rincian sekolah                         | `npsn`                                                    | P1   | Q-09       | Pertahankan (migrasi v3) | [slide 26](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-26) |
| `download_demand_ks`                        | `pemetaan_kebutuhan`   | Klik Unduh daftar                                | `tahun_proyeksi`                                          | P1   | Q-09       | Pertahankan (migrasi v3) | [slide 24](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-24) |
| `view_supply_bcks`                          | `guru_memenuhi_syarat` | Halaman Guru Memenuhi Syarat tampil              | —                                                         | P0   | Q-09       | Aktifkan kembali         | [slide 35](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-35) |
| `click_profile_bcks`                        | `guru_memenuhi_syarat` | Klik Cek Profil                                  | —                                                         | P1   | Q-09       | Aktifkan kembali         | [slide 35](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-35) |
| `click_supply_bcks_filter`                  | `guru_memenuhi_syarat` | Filter jenjang/jabatan                           | `filter_name`, `filter_value`, `jumlah_hasil`             | P2   | Q-09       | Aktifkan kembali         | [slide 35](../guide/04-tahapan-di-sim-kspstk/01-pemetaan-kebutuhan-ks.md#slide-35) |

### Pengusulan BCKS

Aktor: Dinas.

| Event                                       | screen_name                  | Pemicu                                     | Atribut                                                                     | Prio | Q    | Status | Panduan                                                                      |
| ------------------------------------------- | ---------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- | ---- | ---- | ------ | ---------------------------------------------------------------------------- |
| `view_pengusulan`                           | `pengusulan`                 | Halaman Daftar Riwayat Pengusulan tampil   | `jumlah_riwayat`                                                            | P0   | Q-02 | Baru   | [slide 39](../guide/04-tahapan-di-sim-kspstk/02-pengusulan-bcks.md#slide-39) |
| `click_pengusulan_buat_pengumuman`          | `pengusulan`                 | Klik Buat Pengumuman                       | —                                                                           | P0   | Q-02 | Baru   | [slide 39](../guide/04-tahapan-di-sim-kspstk/02-pengusulan-bcks.md#slide-39) |
| `click_pengusulan_kirim_pengumuman`         | `pengusulan_buat_pengumuman` | Klik Kirim Pengumuman (sebelum konfirmasi) | `tanggal_akhir_berkas`                                                      | P1   | Q-02 | Baru   | [slide 41](../guide/04-tahapan-di-sim-kspstk/02-pengusulan-bcks.md#slide-41) |
| `click_pengusulan_kirim_pengumuman_confirm` | `pengusulan_buat_pengumuman` | Klik Konfirmasi, setelah respons sukses    | `seleksi_id`, `tanggal_akhir_berkas`                                        | P0   | Q-02 | Baru   | [slide 42](../guide/04-tahapan-di-sim-kspstk/02-pengusulan-bcks.md#slide-42) |
| `click_pengusulan_buat_undangan`            | `pengusulan`                 | Klik Buat Undangan                         | —                                                                           | P0   | Q-02 | Baru   | [slide 46](../guide/04-tahapan-di-sim-kspstk/02-pengusulan-bcks.md#slide-46) |
| `click_pengusulan_undangan_pilih_bcks`      | `pengusulan_buat_undangan`   | Klik Pilih BCKS setelah atur tanggal       | `tanggal_mulai_berkas`, `tanggal_akhir_berkas`                              | P1   | Q-02 | Baru   | [slide 48](../guide/04-tahapan-di-sim-kspstk/02-pengusulan-bcks.md#slide-48) |
| `click_pengusulan_undangan_filter`          | `pengusulan_buat_undangan`   | Filter jenjang/usia/golongan/domisili      | `filter_name`, `filter_value`, `jumlah_hasil`                               | P2   | Q-09 | Baru   | [slide 49](../guide/04-tahapan-di-sim-kspstk/02-pengusulan-bcks.md#slide-49) |
| `click_pengusulan_undangan_cek_profil`      | `pengusulan_buat_undangan`   | Klik Cek Profil kandidat                   | —                                                                           | P2   | Q-09 | Baru   | [slide 49](../guide/04-tahapan-di-sim-kspstk/02-pengusulan-bcks.md#slide-49) |
| `click_pengusulan_undangan_ke_kirim`        | `pengusulan_buat_undangan`   | Klik Ke Kirim Undangan                     | `jumlah_bcks`                                                               | P1   | Q-02 | Baru   | [slide 50](../guide/04-tahapan-di-sim-kspstk/02-pengusulan-bcks.md#slide-50) |
| `click_pengusulan_kirim_undangan_confirm`   | `pengusulan_buat_undangan`   | Klik Konfirmasi, setelah respons sukses    | `seleksi_id`, `jumlah_bcks`, `tanggal_mulai_berkas`, `tanggal_akhir_berkas` | P0   | Q-02 | Baru   | [slide 52](../guide/04-tahapan-di-sim-kspstk/02-pengusulan-bcks.md#slide-52) |

### Seleksi administrasi & pemilihan peserta substansi

Aktor: Dinas.

| Event                                                             | screen_name                                    | Pemicu                                                              | Atribut                                                                           | Prio | Q    | Status                   | Panduan                                                                           |
| ----------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---- | ---- | ------------------------ | --------------------------------------------------------------------------------- |
| `view_seleksi_administrasi`                                       | `seleksi_administrasi`                         | Halaman riwayat seleksi administrasi tampil                         | `jumlah_riwayat`                                                                  | P0   | Q-03 | Baru                     | [slide 56](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-56) |
| `click_selections_cek_berkas`                                     | `seleksi_administrasi_cek_berkas`              | Klik Cek Berkas peserta (sudah ada di v2)                           | `seleksi_id`                                                                      | P0   | Q-03 | Pertahankan (migrasi v3) | [slide 57](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-57) |
| `click_selections_cek_berkas_validasi_dokumen`                    | `seleksi_administrasi_cek_berkas`              | Buka Validasi Dokumen (sudah ada di v2)                             | `seleksi_id`, `jenis_dokumen`                                                     | P0   | Q-03 | Pertahankan (migrasi v3) | [slide 58](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-58) |
| `click_selections_cek_berkas_validasi_dokumen_valid_confirm`      | `seleksi_administrasi_cek_berkas`              | Konfirmasi Valid (sudah ada di v2)                                  | `seleksi_id`, `jenis_dokumen`                                                     | P0   | Q-03 | Pertahankan (migrasi v3) | [slide 59](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-59) |
| `click_selections_cek_berkas_validasi_dokumen_perbaiki`           | `seleksi_administrasi_cek_berkas`              | Pilih Perlu Diperbaiki (sudah ada di v2)                            | `seleksi_id`, `jenis_dokumen`                                                     | P0   | Q-03 | Pertahankan (migrasi v3) | [slide 59](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-59) |
| `click_selections_cek_berkas_validasi_dokumen_tidak_valid_simpan` | `seleksi_administrasi_cek_berkas`              | Simpan Tidak Valid (sudah ada di v2)                                | `seleksi_id`, `jenis_dokumen`                                                     | P0   | Q-03 | Pertahankan (migrasi v3) | [slide 59](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-59) |
| `click_selections_selesaikan`                                     | `seleksi_administrasi_cek_berkas`              | Klik Selesaikan                                                     | `seleksi_id`, `jumlah_peserta`, `jumlah_berkas_valid`                             | P0   | Q-03 | Baru                     | [slide 61](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-61) |
| `click_selections_ke_seleksi_substansi`                           | `seleksi_administrasi_cek_berkas`              | Klik Ke Pemilihan Peserta Seleksi Substansi                         | `seleksi_id`                                                                      | P0   | Q-04 | Baru                     | [slide 62](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-62) |
| `click_selections_ke_non_reguler`                                 | `seleksi_administrasi_cek_berkas`              | Klik Ke Penugasan Non-Reguler                                       | `seleksi_id`                                                                      | P0   | Q-04 | Baru                     | [slide 75](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-75) |
| `click_selections_substansi_terapkan`                             | `seleksi_administrasi_pilih_peserta_substansi` | Klik Terapkan aksi & sumber dana                                    | `seleksi_id`, `keputusan_substansi`, `sumber_dana`, `jumlah_peserta`, `is_massal` | P0   | Q-04 | Baru                     | [slide 65](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-65) |
| `click_selections_substansi_tidak_dilanjutkan_confirm`            | `seleksi_administrasi_pilih_peserta_substansi` | Klik Ya, Konfirmasi alasan tidak dilanjutkan                        | `seleksi_id`, `jumlah_alasan`, `ada_alasan_tambahan`                              | P1   | Q-04 | Baru                     | [slide 67](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-67) |
| `view_selections_substansi_kuota_terlampaui`                      | `seleksi_administrasi_pilih_peserta_substansi` | Peringatan "melebihi batas kuota" tampil (event_trigger = system)   | `seleksi_id`, `jumlah_dipilih`, `kuota_substansi`                                 | P0   | Q-04 | Baru                     | [slide 69](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-69) |
| `click_selections_unggah_berita_acara`                            | `seleksi_administrasi_pilih_peserta_substansi` | Klik Unggah Berita Acara                                            | `seleksi_id`, `jumlah_peserta`                                                    | P1   | Q-04 | Baru                     | [slide 68](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-68) |
| `click_selections_kirim_undangan_substansi_confirm`               | `seleksi_administrasi_pilih_peserta_substansi` | Klik Konfirmasi Kirim Undangan, setelah respons sukses              | `seleksi_id`, `jumlah_peserta`                                                    | P0   | Q-04 | Baru                     | [slide 70](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-70) |
| `click_selections_tambah_bcks`                                    | `seleksi_administrasi_cek_berkas`              | Klik Tambah BCKS pada seleksi berjalan                              | `seleksi_id`                                                                      | P1   | Q-03 | Baru                     | [slide 85](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-85) |
| `click_selections_tambah_bcks_confirm`                            | `seleksi_administrasi_cek_berkas`              | Klik Konfirmasi penambahan                                          | `seleksi_id`, `jumlah_bcks`                                                       | P1   | Q-03 | Baru                     | [slide 87](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-87) |
| `click_selections_atur_seleksi`                                   | `seleksi_administrasi`                         | Klik Atur seleksi (perpanjang/batal; hasilnya sudah ada di backend) | `seleksi_id`                                                                      | P2   | Q-03 | Baru                     | [slide 77](../guide/04-tahapan-di-sim-kspstk/03-seleksi-administrasi.md#slide-77) |
| `click_seleksi_substansi_manajemen`                               | `seleksi_substansi`                            | Klik Manajemen Seleksi Substansi (tautan keluar)                    | —                                                                                 | P1   | Q-04 | Baru                     | [slide 89](../guide/04-tahapan-di-sim-kspstk/04-seleksi-substansi.md#slide-89)    |

### Pelatihan

Aktor: UPT (aksi tidak lulus: Super Admin).

| Event                                      | screen_name              | Pemicu                                               | Atribut                                                                                 | Prio | Q    | Status | Panduan                                                                  |
| ------------------------------------------ | ------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------- | ---- | ---- | ------ | ------------------------------------------------------------------------ |
| `view_pelatihan`                           | `pelatihan`              | Halaman Pelatihan tampil                             | —                                                                                       | P1   | Q-10 | Baru   | [slide 93](../guide/04-tahapan-di-sim-kspstk/05-pelatihan.md#slide-93)   |
| `click_pelatihan_ke_lms_admin`             | `pelatihan`              | Klik Ke LMS Admin                                    | —                                                                                       | P1   | Q-10 | Baru   | [slide 93](../guide/04-tahapan-di-sim-kspstk/05-pelatihan.md#slide-93)   |
| `click_pelatihan_buat_program`             | `pelatihan`              | Klik + Buat program pelatihan baru                   | —                                                                                       | P0   | Q-10 | Baru   | [slide 96](../guide/04-tahapan-di-sim-kspstk/05-pelatihan.md#slide-96)   |
| `click_pelatihan_jadwal_berikutnya`        | `pelatihan_buat_program` | Klik Berikutnya di langkah jadwal                    | `angkatan`                                                                              | P1   | Q-10 | Baru   | [slide 97](../guide/04-tahapan-di-sim-kspstk/05-pelatihan.md#slide-97)   |
| `click_pelatihan_pilih_pengajar_simpan`    | `pelatihan_buat_program` | Klik Simpan Pilihan pengajar                         | `jumlah_pengajar`, `ada_pengajar_luar_daerah`                                           | P1   | Q-10 | Baru   | [slide 101](../guide/04-tahapan-di-sim-kspstk/05-pelatihan.md#slide-101) |
| `click_pelatihan_tambah_kelas`             | `pelatihan_buat_program` | Klik Tambah Kelas                                    | —                                                                                       | P2   | Q-10 | Baru   | [slide 102](../guide/04-tahapan-di-sim-kspstk/05-pelatihan.md#slide-102) |
| `click_pelatihan_peserta_berikutnya`       | `pelatihan_buat_program` | Klik Berikutnya setelah memilih peserta              | `jumlah_kelas`, `jumlah_peserta`                                                        | P1   | Q-10 | Baru   | [slide 103](../guide/04-tahapan-di-sim-kspstk/05-pelatihan.md#slide-103) |
| `click_pelatihan_buat_program_confirm`     | `pelatihan_buat_program` | Klik Ya, Buat Program, setelah respons sukses        | `program_pelatihan_id`, `angkatan`, `jumlah_kelas`, `jumlah_peserta`, `jumlah_pengajar` | P0   | Q-10 | Baru   | [slide 108](../guide/04-tahapan-di-sim-kspstk/05-pelatihan.md#slide-108) |
| `download_peserta_pelatihan`               | `pelatihan`              | Klik Unduh Daftar Peserta                            | —                                                                                       | P2   | Q-09 | Baru   | [slide 95](../guide/04-tahapan-di-sim-kspstk/05-pelatihan.md#slide-95)   |
| `click_pelatihan_tidak_lulus_aksi_confirm` | `pelatihan`              | Super Admin: Ya, Konfirmasi pelatihan ulang/gugurkan | `aksi_tidak_lulus`                                                                      | P2   | Q-10 | Baru   | [slide 113](../guide/04-tahapan-di-sim-kspstk/05-pelatihan.md#slide-113) |

### Penugasan (reguler, non-reguler, swasta murni)

Aktor: Dinas (mutasi < 2 tahun: Super Admin).

| Event                                            | screen_name                                   | Pemicu                                                      | Atribut                                                                      | Prio | Q    | Status | Panduan                                                                  |
| ------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- | ---- | ---- | ------ | ------------------------------------------------------------------------ |
| `view_penugasan_reguler`                         | `penugasan_reguler`                           | Halaman Penugasan Reguler tampil                            | `jumlah_riwayat`                                                             | P0   | Q-06 | Baru   | [slide 147](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-147) |
| `view_penugasan_non_reguler`                     | `penugasan_non_reguler`                       | Halaman Penugasan Non-Reguler tampil                        | `jumlah_riwayat`                                                             | P0   | Q-06 | Baru   | [slide 118](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-118) |
| `click_penugasan_kirim_permintaan_napza_confirm` | `penugasan_reguler` / `penugasan_non_reguler` | Klik Ya, Kirim Permintaan dokumen NAPZA                     | `jalur_penugasan`, `jumlah_kandidat`                                         | P0   | Q-06 | Baru   | [slide 151](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-151) |
| `click_penugasan_lihat_berkas_napza`             | `penugasan_reguler` / `penugasan_non_reguler` | Klik Lihat Berkas NAPZA                                     | `jalur_penugasan`                                                            | P1   | Q-06 | Baru   | [slide 153](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-153) |
| `click_penugasan_validasi_napza_confirm`         | `penugasan_reguler` / `penugasan_non_reguler` | Klik Konfirmasi hasil validasi NAPZA                        | `jalur_penugasan`, `hasil_validasi`                                          | P0   | Q-06 | Baru   | [slide 155](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-155) |
| `click_penugasan_buat_pengajuan`                 | `penugasan_reguler` / `penugasan_non_reguler` | Klik Buat Pengajuan Baru                                    | `jalur_penugasan`                                                            | P0   | Q-06 | Baru   | [slide 156](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-156) |
| `click_penugasan_filter_kategori`                | `penugasan_buat_pengajuan`                    | Filter Semua/Promosi/Mutasi                                 | `jalur_penugasan`, `filter_value`, `jumlah_hasil`                            | P2   | Q-09 | Baru   | [slide 130](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-130) |
| `click_penugasan_info_rekomendasi`               | `penugasan_buat_pengajuan`                    | Klik ikon i merah di nama kandidat/KS                       | `jalur_penugasan`, `tag_rekomendasi`                                         | P1   | Q-05 | Baru   | [slide 131](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-131) |
| `click_penugasan_pilih_sekolah`                  | `penugasan_buat_pengajuan`                    | Memilih sekolah tujuan                                      | `jalur_penugasan`, `kategori_pengajuan`                                      | P1   | Q-06 | Baru   | [slide 135](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-135) |
| `click_penugasan_lanjutkan`                      | `penugasan_buat_pengajuan`                    | Klik Lanjutkan Penugasan / Ke Penugasan dan Pemberhentian   | `jalur_penugasan`, `jumlah_promosi`, `jumlah_mutasi`                         | P0   | Q-06 | Baru   | [slide 136](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-136) |
| `click_penugasan_alasan_pemberhentian_simpan`    | `penugasan_buat_pengajuan`                    | Simpan alasan & dokumen pemberhentian KS lama               | `jalur_penugasan`, `alasan_pemberhentian`                                    | P1   | Q-06 | Baru   | [slide 162](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-162) |
| `click_penugasan_kirim_bkn`                      | `penugasan_buat_pengajuan`                    | Klik Kirim Data dan Dokumen ke BKN, setelah respons sukses  | `jalur_penugasan`, `jumlah_promosi`, `jumlah_mutasi`, `jumlah_pemberhentian` | P0   | Q-06 | Baru   | [slide 165](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-165) |
| `click_penugasan_cek_pengajuan`                  | `penugasan_detail_pengajuan`                  | Klik Cek Pengajuan / Cek Penugasan                          | `jalur_penugasan`                                                            | P1   | Q-07 | Baru   | [slide 166](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-166) |
| `view_penugasan_swasta_murni`                    | `penugasan_swasta_murni`                      | Formulir Penugasan Swasta Murni tampil                      | —                                                                            | P1   | Q-06 | Baru   | [slide 169](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-169) |
| `click_penugasan_swasta_murni_simpan_confirm`    | `penugasan_swasta_murni`                      | Klik Simpan di Konfirmasi Penugasan, setelah respons sukses | —                                                                            | P1   | Q-06 | Baru   | [slide 171](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-171) |
| `download_riwayat_penugasan_swasta`              | `penugasan_swasta_murni`                      | Klik Unduh Excel                                            | —                                                                            | P2   | Q-09 | Baru   | [slide 172](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-172) |
| `click_penugasan_ajukan_mutasi_kurang_2_tahun`   | `penugasan_buat_pengajuan`                    | Super Admin: klik Ajukan Mutasi KS < 2 Tahun                | —                                                                            | P2   | Q-06 | Baru   | [slide 176](../guide/04-tahapan-di-sim-kspstk/06-penugasan.md#slide-176) |

### Pemberhentian murni

Aktor: Dinas.

| Event                                      | screen_name                    | Pemicu                                        | Atribut                                      | Prio | Q    | Status | Panduan                                                                            |
| ------------------------------------------ | ------------------------------ | --------------------------------------------- | -------------------------------------------- | ---- | ---- | ------ | ---------------------------------------------------------------------------------- |
| `view_pemberhentian`                       | `pemberhentian`                | Halaman Pemberhentian tampil                  | `jumlah_riwayat`                             | P0   | Q-07 | Baru   | [slide 184](../guide/04-tahapan-di-sim-kspstk/07-pemberhentian-murni.md#slide-184) |
| `click_pemberhentian_buat_pengajuan`       | `pemberhentian`                | Klik Buat Pengajuan Baru                      | —                                            | P0   | Q-06 | Baru   | [slide 186](../guide/04-tahapan-di-sim-kspstk/07-pemberhentian-murni.md#slide-186) |
| `click_pemberhentian_info_rekomendasi`     | `pemberhentian_buat_pengajuan` | Klik tombol (!) rekomendasi                   | `tag_rekomendasi`                            | P1   | Q-05 | Baru   | [slide 188](../guide/04-tahapan-di-sim-kspstk/07-pemberhentian-murni.md#slide-188) |
| `click_pemberhentian_lanjut_lengkapi_data` | `pemberhentian_buat_pengajuan` | Klik Lanjut ke Lengkapi Data                  | `jumlah_ks`                                  | P0   | Q-06 | Baru   | [slide 191](../guide/04-tahapan-di-sim-kspstk/07-pemberhentian-murni.md#slide-191) |
| `click_pemberhentian_alasan_simpan`        | `pemberhentian_buat_pengajuan` | Simpan alasan & dokumen per KS                | `alasan_pemberhentian`, `ada_sekolah_tujuan` | P1   | Q-06 | Baru   | [slide 193](../guide/04-tahapan-di-sim-kspstk/07-pemberhentian-murni.md#slide-193) |
| `click_pemberhentian_lanjut_cek_ringkasan` | `pemberhentian_buat_pengajuan` | Klik Lanjutkan ke Cek Ringkasan               | `jumlah_ks`                                  | P1   | Q-06 | Baru   | [slide 196](../guide/04-tahapan-di-sim-kspstk/07-pemberhentian-murni.md#slide-196) |
| `click_pemberhentian_kirim_bkn_confirm`    | `pemberhentian_buat_pengajuan` | Klik Ya, Kirim ke BKN, setelah respons sukses | `jumlah_ks`                                  | P0   | Q-06 | Baru   | [slide 198](../guide/04-tahapan-di-sim-kspstk/07-pemberhentian-murni.md#slide-198) |
| `click_pemberhentian_cek_pengajuan`        | `pemberhentian`                | Klik Cek Pengajuan                            | —                                            | P1   | Q-07 | Baru   | [slide 200](../guide/04-tahapan-di-sim-kspstk/07-pemberhentian-murni.md#slide-200) |

### Perubahan periodisasi & SK PPPK

Aktor: Dinas (verval: UPT / Super Admin).

| Event                                     | screen_name                       | Pemicu                                                          | Atribut                                                                      | Prio | Q    | Status | Panduan                                                                                                     |
| ----------------------------------------- | --------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---- | ---- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `view_pengajuan_perubahan`                | `pengajuan_perubahan`             | Halaman Pengajuan Perubahan tampil                              | `jumlah_riwayat`                                                             | P0   | Q-11 | Baru   | [slide 204](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-204) |
| `click_pengajuan_perubahan_buat`          | `pengajuan_perubahan`             | Klik Buat pengajuan baru + pilih jenis                          | `jenis_pengajuan_perubahan`                                                  | P0   | Q-11 | Baru   | [slide 204](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-204) |
| `click_periodisasi_tambah_riwayat`        | `pengajuan_perubahan_periodisasi` | Klik Tambah Riwayat (Reguler/Arsip)                             | `tipe_riwayat`                                                               | P0   | Q-11 | Baru   | [slide 208](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-208) |
| `click_periodisasi_riwayat_simpan`        | `pengajuan_perubahan_periodisasi` | Klik Simpan riwayat (tambah/ubah)                               | `aksi`, `tipe_riwayat`, `tahun`                                              | P0   | Q-11 | Baru   | [slide 209](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-209) |
| `click_periodisasi_riwayat_hapus_confirm` | `pengajuan_perubahan_periodisasi` | Konfirmasi hapus riwayat                                        | `tipe_riwayat`, `tahun`                                                      | P1   | Q-11 | Baru   | [slide 206](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-206) |
| `view_periodisasi_blokir_tunjangan`       | `pengajuan_perubahan_periodisasi` | Pesan blokir validasi tunjangan tampil (event_trigger = system) | `aturan_tunjangan`, `tahun`, `semester`                                      | P0   | Q-11 | Baru   | [slide 241](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-241) |
| `click_periodisasi_lanjut_ringkasan`      | `pengajuan_perubahan_periodisasi` | Klik Lanjut ke Ringkasan                                        | `jumlah_riwayat_ditambah`, `jumlah_riwayat_diubah`, `jumlah_riwayat_dihapus` | P1   | Q-11 | Baru   | [slide 229](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-229) |
| `click_periodisasi_ajukan_confirm`        | `pengajuan_perubahan_periodisasi` | Klik Ajukan setelah unggah dokumen, setelah respons sukses      | `jumlah_riwayat_ditambah`, `jumlah_riwayat_diubah`, `jumlah_riwayat_dihapus` | P0   | Q-11 | Baru   | [slide 231](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-231) |
| `click_periodisasi_upt_periksa`           | `verval_periodisasi`              | UPT klik Periksa                                                | —                                                                            | P1   | Q-11 | Baru   | [slide 234](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-234) |
| `click_periodisasi_upt_setujui_confirm`   | `verval_periodisasi`              | UPT klik Ya, Setujui / tolak                                    | `hasil_verval`                                                               | P0   | Q-11 | Baru   | [slide 236](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-236) |
| `view_dasbor_pengajuan_perubahan`         | `dasbor_pengajuan_perubahan`      | Super Admin membuka dasbor                                      | —                                                                            | P2   | Q-11 | Baru   | [slide 237](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-237) |
| `click_sk_pppk_lanjut_unggah`             | `pengaliran_sk_pppk`              | Klik Lanjut Unggah Dokumen                                      | `jumlah_ptk`                                                                 | P1   | Q-06 | Baru   | [slide 250](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-250) |
| `click_sk_pppk_ajukan_confirm`            | `pengaliran_sk_pppk`              | Klik Ya, Ajukan, setelah respons sukses                         | `jumlah_ptk`                                                                 | P0   | Q-06 | Baru   | [slide 253](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-253) |
| `click_sk_pppk_verval_confirm`            | `verval_sk_pppk`                  | Super Admin: Ya, Setujui / Ya, Tolak                            | `hasil_verval`                                                               | P1   | Q-06 | Baru   | [slide 255](../guide/04-tahapan-di-sim-kspstk/08-perubahan-periodisasi-dan-pengaliran-sk-pppk.md#slide-255) |

### Manajemen KS Aktif & pengumuman beranda

Aktor: Dinas, UPT (pengumuman: Super Admin).

| Event                             | screen_name          | Pemicu                                            | Atribut                                  | Prio | Q    | Status | Panduan                                                             |
| --------------------------------- | -------------------- | ------------------------------------------------- | ---------------------------------------- | ---- | ---- | ------ | ------------------------------------------------------------------- |
| `view_manajemen_ks`               | `manajemen_ks_aktif` | Halaman Manajemen KS Aktif tampil                 | `tab_ks`                                 | P1   | Q-09 | Baru   | [slide 259](../guide/05-manajemen-ks-aktif.md#slide-259)            |
| `click_manajemen_ks_tab`          | `manajemen_ks_aktif` | Pindah tab Aktif/Tidak Aktif                      | `tab_ks`                                 | P2   | Q-09 | Baru   | [slide 260](../guide/05-manajemen-ks-aktif.md#slide-260)            |
| `click_manajemen_ks_filter`       | `manajemen_ks_aktif` | Filter Segera Pensiun / Pensiun / Meninggal Dunia | `tab_ks`, `filter_value`, `jumlah_hasil` | P2   | Q-09 | Baru   | [slide 260](../guide/05-manajemen-ks-aktif.md#slide-260)            |
| `download_daftar_ks`              | `manajemen_ks_aktif` | Klik Unduh Daftar                                 | `tab_ks`                                 | P1   | Q-09 | Baru   | [slide 260](../guide/05-manajemen-ks-aktif.md#slide-260)            |
| `click_pengumuman_beranda_simpan` | `beranda`            | Super Admin menyimpan pengumuman beranda          | `jumlah_karakter`                        | P2   | —    | Baru   | [slide 264](../guide/06-pengaturan-pengumuman-beranda.md#slide-264) |

## Event lama (v1/v2): apa yang dilakukan

| Tindakan                                                  | Event                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pertahankan, migrasi ke v3 dengan atribut                 | `login`, `logout`, `click_bantuan`, `download_demand_ks`, `click_profile_school`, `click_manual_demand_tambah_sekolah_simpan`, `click_riwayat_seleksi_ks_lihat_rincian`, `click_selections_cek_berkas*`, `click_konsultasi_daring`, `click_lihat_jadwal_lengkap`, `click_ikuti_konsultasi_zoom` |
| Aktifkan kembali (nama sama, agar deret waktu tersambung) | `view_demand_ks (berhenti 2025-08-04)`, `view_supply_bcks (2025-06-16)`, `click_profile_bcks`, `click_supply_bcks_filter (2025-05-28)`, `click_manual_demand_tambah_sekolah (2025-06-03)`                                                                                                       |
| Pensiunkan (alur lama pra-RPM, tidak ada di UI sekarang)  | `click_selections_pasangkan_bcks_*`, `click_selections_kirim_undangan`, `click_selections_finalisasi`, `click_selections_cetak_daftar*`, `click_start_selection`, `click_manual_demand_hapus_sekolah*`, `click_manual_demand_ubah_alasan*`                                                      |
| Cek dulu apakah tombolnya masih ada                       | `click_juknis_ks (2025-06-05)`, `click_riwayat_seleksi_ks (2025-06-03)`, `download_supply_bcks (2025-05-28)`                                                                                                                                                                                    |
| Di luar cakupan usulan ini (Pengawas Sekolah)             | `view_demand_ps`, `view_supply_bcps`, `download_supply_bcps`, `click_ps_selections_*`                                                                                                                                                                                                           |

## Kamus atribut

| Key                         | Tipe v3 | Keterangan                                                                                                                |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| `user_role`                 | string  | Wajib di semua event: dinas_pendidikan / upt_gtk / super_admin                                                            |
| `kode_wilayah`              | string  | Wajib di semua event: kode wilayah dinas yang sedang aktif (UPT: wilayah terpilih)                                        |
| `tahun_proyeksi`            | int     | Tahun proyeksi pemetaan                                                                                                   |
| `npsn`                      | string  | NPSN sekolah (data publik)                                                                                                |
| `jenjang`                   | string  | tk / sd / smp / sma                                                                                                       |
| `kondisi_ks`                | string  | Kategori kondisi KS di baris yang dipetakan (segera_pensiun, plt, …)                                                      |
| `aksi`                      | string  | Varian aksi tombol, mis. petakan / batal_petakan, tambah / ubah                                                           |
| `tag_rekomendasi`           | string  | tidak_direkomendasikan_mutasi / dapat_dirotasi_mutasi / harus_diberhentikan / harus_segera_diberhentikan / segera_pensiun |
| `sisa_masa_bulan`           | int     | Sisa masa penugasan KS (bulan)                                                                                            |
| `filter_name`               | string  | Nama filter, mis. jenjang, kondisi_ks, status_kepegawaian                                                                 |
| `filter_value`              | string  | Kode nilai filter (bukan label UI)                                                                                        |
| `jumlah_hasil`              | int     | Jumlah baris setelah filter/cari                                                                                          |
| `panjang_kata_kunci`        | int     | Panjang kata kunci; isi kata kunci TIDAK dikirim                                                                          |
| `seleksi_id`                | string  | ID periode seleksi (hash/ID internal)                                                                                     |
| `tanggal_mulai_berkas`      | string  | YYYY-MM-DD                                                                                                                |
| `tanggal_akhir_berkas`      | string  | YYYY-MM-DD                                                                                                                |
| `jumlah_bcks`               | int     | Jumlah BCKS terpilih/ditambahkan                                                                                          |
| `jumlah_riwayat`            | int     | Jumlah baris riwayat yang tampil                                                                                          |
| `jumlah_peserta`            | int     | Jumlah peserta terkait aksi                                                                                               |
| `jumlah_berkas_valid`       | int     | Peserta dengan berkas valid saat Selesaikan                                                                               |
| `jenis_dokumen`             | string  | hasil_penilaian_kinerja / skck / sk_pengalaman_manajerial / surat_bebas_hukuman / pakta_integritas                        |
| `keputusan_substansi`       | string  | dilanjutkan / tidak_dilanjutkan                                                                                           |
| `sumber_dana`               | string  | apbn / apbd / lainnya                                                                                                     |
| `is_massal`                 | bool    | Aksi diterapkan ke beberapa peserta sekaligus                                                                             |
| `jumlah_alasan`             | int     | Jumlah pernyataan alasan yang dipilih                                                                                     |
| `ada_alasan_tambahan`       | bool    | Dinas mengetik alasan tambahan (isi teks TIDAK dikirim)                                                                   |
| `jumlah_dipilih`            | int     | Peserta yang dipilih saat peringatan kuota muncul                                                                         |
| `kuota_substansi`           | int     | Kuota seleksi substansi dinas (2 × kuota pelatihan)                                                                       |
| `program_pelatihan_id`      | string  | ID program pelatihan                                                                                                      |
| `angkatan`                  | int     | Angkatan program pelatihan                                                                                                |
| `jumlah_kelas`              | int     | Jumlah kelas dalam program                                                                                                |
| `jumlah_pengajar`           | int     | Jumlah pengajar terpilih                                                                                                  |
| `ada_pengajar_luar_daerah`  | bool    | Ada pengajar dari daerah lain                                                                                             |
| `aksi_tidak_lulus`          | string  | pelatihan_ulang / gugurkan                                                                                                |
| `jalur_penugasan`           | string  | reguler / non_reguler / swasta_murni                                                                                      |
| `jumlah_kandidat`           | int     | Jumlah kandidat yang diminta dokumen NAPZA                                                                                |
| `hasil_validasi`            | string  | valid / tidak_valid / perlu_diperbaiki                                                                                    |
| `kategori_pengajuan`        | string  | promosi / mutasi                                                                                                          |
| `jumlah_promosi`            | int     | Jumlah promosi dalam pengajuan                                                                                            |
| `jumlah_mutasi`             | int     | Jumlah mutasi dalam pengajuan                                                                                             |
| `jumlah_pemberhentian`      | int     | Jumlah pemberhentian KS lama dalam pengajuan                                                                              |
| `alasan_pemberhentian`      | string  | Kode alasan pemberhentian (lihat status-dan-enum)                                                                         |
| `ada_sekolah_tujuan`        | bool    | KS diberhentikan ditempatkan sebagai guru di sekolah tujuan                                                               |
| `jumlah_ks`                 | int     | Jumlah KS dalam usulan pemberhentian                                                                                      |
| `jenis_pengajuan_perubahan` | string  | periodisasi / sk_pppk                                                                                                     |
| `tipe_riwayat`              | string  | reguler / arsip                                                                                                           |
| `tahun`                     | int     | Tahun riwayat masa jabatan                                                                                                |
| `aturan_tunjangan`          | string  | hapus_riwayat / ubah_tmt / ubah_tst                                                                                       |
| `semester`                  | int     | 1 / 2                                                                                                                     |
| `jumlah_riwayat_ditambah`   | int     | Riwayat baru dalam pengajuan                                                                                              |
| `jumlah_riwayat_diubah`     | int     | Riwayat diubah dalam pengajuan                                                                                            |
| `jumlah_riwayat_dihapus`    | int     | Riwayat dihapus dalam pengajuan                                                                                           |
| `hasil_verval`              | string  | disetujui / ditolak                                                                                                       |
| `jumlah_ptk`                | int     | Jumlah PTK dalam pengaliran SK PPPK                                                                                       |
| `tab_ks`                    | string  | aktif / tidak_aktif                                                                                                       |
| `jumlah_karakter`           | int     | Panjang teks pengumuman beranda                                                                                           |
| `nomor_pertanyaan`          | int     | Urutan pertanyaan dalam satu sesi chat                                                                                    |
| `panjang_pertanyaan`        | int     | Panjang pertanyaan; isi TIDAK dikirim                                                                                     |
| `kode_wilayah_tujuan`       | string  | Wilayah yang dipilih UPT saat ganti wilayah                                                                               |

## Pertanyaan terbuka

| Untuk           | Pertanyaan                                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Product         | Pertanyaan perilaku Q-01…Q-11 mana yang paling penting? Apakah ada concern Product yang belum tercakup?                                         |
| Product         | Apakah prioritas P0 (gelombang pertama) sudah tepat, atau ada fitur yang sedang dikembangkan dan perlu didahulukan?                             |
| Engineer        | Apakah event v2 yang masih aktif dimigrasikan ke tabel v3, atau v2 tetap berjalan paralel?                                                      |
| Engineer        | Satu event `view_<halaman>` per halaman (pola existing) atau satu event generik `view_screen` dengan `screen_name`?                             |
| Engineer        | Bisakah `user_role` dan `kode_wilayah` diisi dari sesi login di setiap event? Tanpa ini, wilayah harus dipetakan dari email seperti di mart v2. |
| Engineer + Data | Kolom `email` di v3: tetap dikirim, di-hash, atau dihapus?                                                                                      |
| Engineer        | Event `*_confirm` dikirim setelah respons API sukses — apakah memungkinkan di semua alur?                                                       |
| Data            | Akun tester/QA: cukup dikecualikan via `dim_ksps_tester_table`, atau perlu atribut penanda?                                                     |

## Privasi

Tidak ada atribut berisi nama, email, NIP, NIK, isi pencarian, isi pertanyaan bot, atau isi alasan bebas. ID seleksi/program/pengajuan memakai ID internal atau hash. Lihat [konvensi-event.md](konvensi-event.md#kebijakan-privasi-wajib).
