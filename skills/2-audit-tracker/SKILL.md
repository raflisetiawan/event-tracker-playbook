---
name: 2-audit-tracker
description: Petakan tracker yang sudah berjalan dan temukan perilaku yang belum terekam. Pakai sebelum menyusun usulan event.
---

# Audit tracker

**Masukan:** `projects/<id>/sumber/tracker/`, akses tabel event, atau daftar event dari tim. **Hasil:** `knowledge/tracker-existing.md`.

## Langkah

1. Tanyakan lokasi data tracker dan siapa pemiliknya. Bila belum ada akses, kerjakan dari daftar event yang diberikan
   dan tulis bahwa aktivitas event belum terverifikasi.
2. Bila ada akses data, ambil **agregat saja**: jumlah per event, tanggal pertama dan terakhir, kolom yang kosong.
   - Cek skema dulu, lakukan dry run untuk tabel besar, dan selalu filter partisi waktu.
   - Jangan mengambil kolom email atau ID pengguna per baris.
3. Klasifikasikan tiap event: aktif, berhenti (sejak kapan), atau tidak dipakai lagi di UI.
4. Cocokkan dengan `knowledge/alur.md`: tahapan mana yang tidak punya event, dan kolom konteks mana yang kosong.
5. Bedakan data **hasil proses** yang sudah ada di backend dari **perilaku** yang belum terlihat. Usulan fokus ke perilaku.

## Isi laporan

| Bagian          | Isi                                                               |
| --------------- | ----------------------------------------------------------------- |
| Sumber          | Tabel, tanggal pengambilan, dan batasannya                        |
| Inventaris      | Event, status, jumlah, rentang tanggal                            |
| Gap             | Tahapan tanpa tracker dan kolom yang bermasalah                   |
| Peringatan data | Hal yang bisa menyesatkan analisis, mis. jam salah atau duplikasi |

## Titik berhenti

**Berhenti di sini.** Tampilkan gap utama, lalu minta tiga hal sebelum lanjut:

1. Konfirmasi bahwa gap-nya benar.
2. Pertanyaan perilaku dari Product. Kalau belum ada, ajukan draf untuk disetujui.
3. Prioritas: tahapan atau fitur mana yang paling penting.
