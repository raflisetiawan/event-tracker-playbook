---
name: 3-susun-usulan
description: Susun usulan event dari pertanyaan perilaku, gap tracker, dan panduan. Pakai setelah audit tracker ditinjau.
---

# Susun usulan

**Masukan:** `knowledge/`, gap tracker, pertanyaan Product. **Hasil:** `tribes/<id>/usulan.md`.

## Langkah

1. Mulai dari **pertanyaan perilaku** (`Q-01`, dst.), bukan dari daftar tombol. Setiap event harus menjawab minimal satu.
2. Telusuri alur di panduan per tahap. Untuk tiap pertanyaan, tentukan titik yang perlu dicatat: halaman utama,
   keputusan, kirim, dan titik pengguna berhenti.
3. Tulis event di tabel per tahap dengan format di template. Jangan mengubah judul bagian karena parser membacanya.
4. Tentukan prioritas: **P0** halaman utama dan tombol keputusan/kirim, **P1** langkah antara dan bantuan,
   **P2** filter rinci, fitur admin, dan aksi jarang.
5. Isi kamus atribut. Pakai kode nilai, bukan label UI. Tambahkan pola submit khusus ke `eventSubmitTambahan` di `playbook.json`.
6. Tulis pertanyaan terbuka untuk Product dan Engineer.

## Aturan penamaan

| Pola                                                            | Dipakai untuk                          | event_trigger |
| --------------------------------------------------------------- | -------------------------------------- | ------------- |
| `view_<halaman>`                                                | Halaman selesai dimuat                 | `page_load`   |
| `click_<objek>_<aksi>`                                          | Klik tombol                            | `click`       |
| `click_<objek>_<aksi>_confirm`                                  | Konfirmasi, dikirim setelah API sukses | `submit`      |
| `view_<objek>_<kondisi>` + `(event_trigger = system)` di Pemicu | Peringatan sistem                      | `system`      |
| `download_<objek>`                                              | Unduh                                  | `click`       |

Ikuti pola tracker yang sudah ada bila berbeda, dan pertahankan nama event lama agar deret waktunya tersambung.

## Aturan isi

- Jangan menggandakan data yang sudah ada di backend, kecuali perilakunya memang yang ingin dilihat.
- Sepasang `click_x` dan `click_x_confirm` hanya layak bila selisihnya menjawab pertanyaan, mis. pengajuan yang batal.
- Atribut tanpa teks bebas: `panjang_kata_kunci`, bukan kata kuncinya. `user_role` wajib di semua event.
- Perbarui angka di `**N event**` setiap kali jumlah event berubah.

## Selesai bila

`pnpm playbook check <id>` tanpa error, tanpa TODO di `usulan.md`, dan setiap event punya pertanyaan dan rujukan slide.

## Titik berhenti

**Berhenti di sini.** Tampilkan jumlah event per tahap dan prioritas, jalankan `pnpm playbook export <id>` untuk
bahan diskusi, lalu minta persetujuan. Juga tanyakan alur mana yang perlu wireframe; tidak semua perlu.
