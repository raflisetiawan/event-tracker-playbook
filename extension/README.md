# Perekam Alur Playbook

Extension Chrome dan Edge untuk membuat **panduan langkah demi langkah** dari web yang sedang berjalan. Hasilnya
dipakai agent playbook sebagai pengganti (atau pelengkap) panduan PPTX/PDF. Tidak dipublikasikan ke Web Store:
dipasang manual dari folder ini.

## Pasang

1. Unduh atau clone repo playbook. Jangan memindahkan folder `extension/` setelah dipasang.
2. Buka `chrome://extensions` (Edge: `edge://extensions`).
3. Nyalakan **Developer mode** (Edge: **Mode pengembang**).
4. Klik **Load unpacked**, lalu pilih folder `extension/`.
5. Sematkan ikon **Perekam Alur Playbook** di toolbar.

**Memperbarui:** setelah mengunduh versi repo yang baru, klik tombol muat ulang pada kartu extension di
`chrome://extensions`. Nomor versi ada di kartu itu.

Bila tombol Developer mode tidak bisa dinyalakan, laptop dikunci kebijakan IT; extension ini tidak bisa dipasang di
laptop tersebut tanpa izin IT.

## Pakai

1. Buka web yang ingin direkam (sebaiknya **staging atau akun demo**), lalu klik ikon extension. Panel samping terbuka.
2. Isi judul alur dan peran yang dipakai, lalu klik **Mulai rekam di tab ini**. Pertama kali, browser meminta izin
   membaca halaman; izin ini dibutuhkan untuk mencatat klik dan mengambil screenshot.
3. Pakai web seperti biasa. Tiap klik, unduhan, kirim form, dan halaman baru menjadi satu langkah. Nilai yang diketik
   tidak pernah dicatat, hanya nama kolomnya.
4. Di panel, tulis narasi dan centang **Jadikan event** pada langkah penting. Nama event disarankan otomatis
   mengikuti konvensi (`view_`, `click_`, `_confirm`, `download_`) dan bisa diubah.
5. Klik **Berhenti**. Halaman tinjau terbuka: rapikan narasi, seret di atas screenshot untuk menutup area (misalnya
   nama orang), lalu pilih:
   - **Unduh daftar event (Excel)**: satu baris per nama event, siap dibahas dengan Product. Tidak butuh playbook.
   - **Kirim ke playbook**: langsung masuk ke project pilihan bila web playbook (`npm run dev`) sedang jalan, untuk usulan lengkap dengan tur.
   - **Unduh ZIP untuk playbook**: upload manual ke kartu "Panduan produk".
   - **Simpan PDF**: panduan untuk dibaca manusia.

## Privasi

| Yang dilakukan otomatis                                                  | Yang tetap tanggung jawab perekam                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------- |
| Isian form yang berisi nilai ditutup abu-abu di screenshot               | **Nama orang** tidak bisa dikenali; tutup manual        |
| Teks mirip email, NIP, NIK, nomor HP ditutup abu-abu dan disamarkan      | Data di gambar, grafik, atau PDF yang tampil di halaman |
| Query dan ID panjang di URL dibuang (`/guru/:id`)                        | Memilih akun demo atau staging                          |
| Screenshot dilewati bila halaman sedang berpindah dan belum bisa ditutup | Memeriksa semua screenshot sebelum mengirim             |
| Semua data tersimpan di browser ini (IndexedDB), tidak dikirim ke server |                                                         |

Rekaman yang dikirim ke playbook masuk ke `projects/<id>/sumber/`, yang tidak ikut ke git. Agent baru menyalin screenshot ke `guide/`
(yang di-commit) setelah pengguna memastikan isinya aman.

## Format ZIP

| File                     | Isi                                                                          |
| ------------------------ | ---------------------------------------------------------------------------- |
| `rekaman.json`           | Format `rekaman-playbook` versi 1: judul, peran, langkah, elemen, event      |
| `rekaman.md`             | Versi bacaan, dengan anchor `langkah-N` dan tabel event yang ditandai        |
| `gambar/langkah-NNN.png` | Screenshot dengan samaran (hitam/abu-abu) dan kotak merah pada elemen diklik |

Playbook mengekstrak ZIP otomatis ke `sumber/panduan/<nama-zip>/` saat diterima.

## Batasan

- Hanya Chrome dan Edge (Chromium). Firefox dan aplikasi mobile tidak didukung.
- Satu rekaman = satu jalur dengan satu peran. Kondisi lain (error, peran berbeda) perlu direkam terpisah.
- Screenshot hanya bagian layar yang terlihat, bukan seluruh halaman yang bisa digulir.
- Elemen di dalam iframe dan Shadow DOM tertutup tidak terekam dengan baik.

## Kode

Tanpa build dan tanpa pustaka luar, supaya bisa langsung dipasang dari repo.

| File                                      | Peran                                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `manifest.json`                           | Manifest V3. `key` mengunci ID extension (`monlmlljocchnlehojbmkhmndigpbojg`) |
| `background.js`                           | Status rekaman, screenshot, penyimpanan langkah                               |
| `content.js`                              | Dipasang di halaman yang direkam: klik, halaman, isian, penutup data          |
| `panel.*`, `tinjau.*`                     | Panel samping dan halaman tinjau                                              |
| `lib/rekam.js`                            | Logika murni: penyamaran, saran nama event, isi `rekaman.json`/`.md`          |
| `lib/zip.js`                              | Penulis ZIP tanpa kompresi                                                    |
| `lib/db.js`, `lib/ui.js`, `lib/ekspor.js` | Penyimpanan, kartu langkah, ekspor dan kirim                                  |

Playbook hanya menerima kiriman dari ID di atas (`ID_EXTENSION` di `cli/project.ts`). Bila `key` diganti, ubah keduanya.
Tes logika: `npm test` (`extension/test/`).

## Rencana

| Tahap | Isi                                                                                 | Status                               |
| ----- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| 0     | Pastikan Developer mode boleh di laptop kantor; uji satu alur nyata                 | **Perlu dilakukan tim**              |
| 1     | Rekam klik/halaman/isian/kirim, screenshot dengan penutup, narasi, tandai event     | Selesai, diuji di Chromium           |
| 2     | Tinjau, samaran manual, ekspor ZIP + PDF, kirim ke playbook, ekstrak otomatis       | Selesai, diuji di Chromium           |
| 3     | Agent memakai rekaman (skill 1 dan 3)                                               | Instruksi ditulis, belum diuji agent |
| 4     | Simpan struktur halaman (DOM) untuk wireframe yang lebih mirip; draf narasi dari AI | Belum                                |
