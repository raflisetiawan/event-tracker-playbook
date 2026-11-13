# AGENTS.md — Event Tracker Playbook

Panduan untuk AI agent (Claude Code, Codex, Cursor, dll.). Repo ini adalah workflow untuk menyusun
**usulan event tracker** suatu produk dan **web tur interaktif** untuk membahasnya dengan Product
dan Engineer. Satu repo melayani banyak project, masing-masing di `projects/<id>/`.

Agent mengerjakan isi satu project. Mesin web dan pemeriksaan sudah tersedia, jadi jangan ditulis ulang.

## Menyusun usulan

Pengguna membuat project dan mengupload bahan di halaman awal (`npm run dev`), lalu menjalankan agent di terminal.
Bahan ada di `projects/<id>/sumber/`: `panduan/` (termasuk ZIP rekaman dari extension `extension/`), `tracker/`, `lain/`, dan `pertanyaan.md`. Folder ini tidak masuk git:
jangan menyalin isinya mentah-mentah ke file yang di-commit, dan jangan memindahkannya keluar dari folder itu.

Jalankan skill berurutan. Baca `SKILL.md`-nya sebelum mengerjakan tiap langkah.

| #   | Skill                       | Masukan                            | Hasil                           | Setelahnya                      |
| --- | --------------------------- | ---------------------------------- | ------------------------------- | ------------------------------- |
| 1   | `skills/1-ingest-panduan`   | Panduan produk                     | `guide/`, `knowledge/`          | Lanjut                          |
| 2   | `skills/2-audit-tracker`    | Data atau daftar tracker           | `knowledge/tracker-existing.md` | **Berhenti, minta tinjauan**    |
| 3   | `skills/3-susun-usulan`     | Knowledge, gap, pertanyaan Product | `usulan.md`                     | **Berhenti, minta persetujuan** |
| 4   | `skills/4-bangun-wireframe` | Usulan yang disetujui              | `wireframe/`                    | Lanjut                          |
| 5   | `skills/5-susun-tur`        | Wireframe                          | `tours.ts`                      | Lanjut                          |
| 6   | `skills/6-ekspor`           | Project yang lolos check           | Excel, build siap deploy        | Selesai                         |

Jangan melewati titik berhenti: salah usulan paling mahal kalau baru ketahuan setelah wireframe jadi.
Tinjauan event ditulis pengguna dari web ke `projects/<id>/tinjauan.json`; kerjakan yang berstatus `ubah` lalu hapus itemnya.
Pengguna mungkin bukan programmer: jalankan sendiri semua perintah teknis dan melapor dengan bahasa sederhana.
Langkah 4–5 opsional. Tanpa keduanya, project tetap tampil sebagai katalog event.

## Peta repo

| Path                 | Isi                                                            | Boleh diedit agent?                  |
| -------------------- | -------------------------------------------------------------- | ------------------------------------ |
| `projects/<id>/`     | Semua hasil kerja satu project                                 | Ya, itu pekerjaannya                 |
| `examples/ksps/`     | Contoh lengkap sebagai acuan pola                              | Baca saja, kecuali diminta           |
| `templates/project/` | Kerangka project baru                                          | Hanya bila memperbaiki playbook      |
| `engine/`            | Mesin web: parser, tur, katalog, log event, komponen wireframe | Hanya bila kebutuhannya berlaku umum |
| `cli/`               | `node cli/playbook.ts`                                         | Hanya bila memperbaiki playbook      |
| `skills/`            | Langkah kerja                                                  | Hanya bila memperbaiki playbook      |
| `extension/`         | Perekam Alur Playbook (extension Chrome/Edge)                  | Hanya bila memperbaiki playbook      |

## Perintah

```bash
node cli/playbook.ts list
node cli/playbook.ts new <id> --nama "Nama Project"
node cli/playbook.ts check <id>          # wajib lolos sebelum melaporkan selesai
node cli/playbook.ts export <id>
node cli/playbook.ts verifikasi          # format, lint, tipe, tes, dan build
```

Butuh Node.js 24 atau lebih baru. Pasang dependensi sekali dengan `npm install`; web lokal (`npm run dev`) biasanya ada di
`http://localhost:5173/#/<id>`.

## Aturan wajib

**Kebenaran domain**

- Bila jawabannya tidak ada di panduan atau data, tulis tidak ada. Jangan mengarang aturan produk.
- Setiap fakta domain bertaut ke slide sumber; fakta data menyebut tabel dan tanggal pengambilan.
- Nilai yang hanya disimpulkan ditandai **(turunan)** dan masuk daftar pertanyaan untuk Product.
- Asumsi di wireframe diberi komentar dan disebut saat melapor.

**Privasi**

- Dilarang menulis data pribadi pengguna: nama, email, NIP, NIK, nomor HP, `user_id` mentah,
  termasuk sebagai contoh. Wireframe hanya memakai data fiktif ("Guru A", NIP tersamar, domain `contoh.id`).
- Data produksi hanya boleh masuk repo dalam bentuk agregat.
- Atribut event tidak boleh berisi teks bebas: kirim panjangnya atau penanda boolean, bukan isinya.

**Sumber kebenaran**

- Detail event hanya ditulis di `usulan.md`. Kode dan tur cukup menyebut nama event.

**Melapor**

- Jangan melapor selesai sebelum `node cli/playbook.ts check <id>` tanpa error dan alurnya diuji di browser.
- Laporkan peringatan yang tersisa, asumsi, dan gap yang perlu diputuskan Product.
- `check` hanya memeriksa konsistensi, bukan apakah usulannya berguna. Itu keputusan manusia.

## Gaya

Tulis dalam Bahasa Indonesia, ringkas, dan pakai tabel untuk daftar. Pakai istilah resmi dari glosarium project.
