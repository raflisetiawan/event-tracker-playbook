# AGENTS.md — Event Tracker Playbook

Panduan untuk AI agent (Claude Code, Codex, Cursor, dll.). Repo ini adalah workflow untuk menyusun
**usulan event tracker** suatu produk dan **web tur interaktif** untuk membahasnya dengan Product
dan Engineer. Satu repo melayani banyak tribe.

Agent mengerjakan konten tribe. Mesin web dan pemeriksaan sudah tersedia, jadi jangan ditulis ulang.

## Membuat tribe baru

Jalankan skill berurutan. Baca `SKILL.md`-nya sebelum mengerjakan tiap langkah.

| #   | Skill                       | Masukan                            | Hasil                           | Setelahnya                      |
| --- | --------------------------- | ---------------------------------- | ------------------------------- | ------------------------------- |
| 1   | `skills/1-ingest-panduan`   | Panduan produk                     | `guide/`, `knowledge/`          | Lanjut                          |
| 2   | `skills/2-audit-tracker`    | Data atau daftar tracker           | `knowledge/tracker-existing.md` | **Berhenti, minta tinjauan**    |
| 3   | `skills/3-susun-usulan`     | Knowledge, gap, pertanyaan Product | `usulan.md`                     | **Berhenti, minta persetujuan** |
| 4   | `skills/4-bangun-wireframe` | Usulan yang disetujui              | `wireframe/`                    | Lanjut                          |
| 5   | `skills/5-susun-tur`        | Wireframe                          | `tours.ts`                      | Lanjut                          |
| 6   | `skills/6-ekspor`           | Tribe yang lolos check             | Excel, build siap deploy        | Selesai                         |

Jangan melewati titik berhenti: salah usulan paling mahal kalau baru ketahuan setelah wireframe jadi.
Langkah 4–5 opsional. Tanpa keduanya, tribe tetap tampil sebagai katalog event.

## Peta repo

| Path               | Isi                                                            | Boleh diedit agent?                          |
| ------------------ | -------------------------------------------------------------- | -------------------------------------------- |
| `tribes/<id>/`     | Semua hasil kerja satu tribe                                   | Ya, itu pekerjaannya                         |
| `examples/ksps/`   | Contoh lengkap sebagai acuan pola                              | Baca saja, kecuali diminta                   |
| `templates/tribe/` | Kerangka tribe baru                                            | Hanya bila memperbaiki playbook              |
| `engine/`          | Mesin web: parser, tur, katalog, log event, komponen wireframe | Hanya bila kebutuhannya berlaku lintas tribe |
| `cli/`             | `pnpm playbook`                                                | Hanya bila memperbaiki playbook              |
| `skills/`          | Langkah kerja                                                  | Hanya bila memperbaiki playbook              |

## Perintah

```bash
pnpm install
pnpm playbook list
pnpm playbook new <id> --nama "Nama Tribe"
pnpm playbook check <id>          # wajib lolos sebelum melaporkan selesai
pnpm playbook export <id>
pnpm dev                          # http://localhost:5173/#/<id>
pnpm exec vp check                # format, lint, tipe
pnpm test
pnpm run build
```

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

- Jangan melapor selesai sebelum `pnpm playbook check <id>` tanpa error dan alurnya diuji di browser.
- Laporkan peringatan yang tersisa, asumsi, dan gap yang perlu diputuskan Product.
- `check` hanya memeriksa konsistensi, bukan apakah usulannya berguna. Itu keputusan manusia.

## Gaya

Tulis dalam Bahasa Indonesia, ringkas, dan pakai tabel untuk daftar. Pakai istilah resmi dari glosarium tribe.
