# Event Tracker Playbook

Workflow untuk AI agent: dari panduan produk sampai **usulan event tracker** dan **web tur interaktif**
yang bisa dibahas bersama Product dan Engineer. Satu repo melayani banyak tribe.

```text
panduan produk → knowledge → audit tracker → usulan event → wireframe → tur → Excel & web
                                  ▲ tinjau       ▲ setujui
```

## Isi repo

| Path               | Isi                                                                    |
| ------------------ | ---------------------------------------------------------------------- |
| `AGENTS.md`        | Pintu masuk agent: urutan kerja dan aturan                             |
| `skills/`          | Enam langkah kerja                                                     |
| `templates/tribe/` | Kerangka tribe baru                                                    |
| `engine/`          | Mesin web: tur Driver.js, katalog event, log event, komponen wireframe |
| `cli/`             | `pnpm playbook`: buat tribe, periksa, ekspor                           |
| `examples/ksps/`   | Contoh lengkap: 104 event dan 12 tur                                   |
| `tribes/`          | Hasil kerja per tribe                                                  |

## Mulai

Butuh Node 24 dan pnpm.

```bash
pnpm install
pnpm dev
```

Buat tribe baru dengan agent (Claude Code: `/buat-tribe <id>`; agent lain: minta ikuti `AGENTS.md`), atau manual:

```bash
pnpm playbook new pembelajaran --nama "Tribe Pembelajaran"
pnpm playbook check pembelajaran
```

Tribe baru langsung muncul di web, di `http://localhost:5173/#/pembelajaran`.

## Dua tingkat hasil

| Tingkat     | Yang dibutuhkan                      | Yang didapat                                         |
| ----------- | ------------------------------------ | ---------------------------------------------------- |
| **Katalog** | `usulan.md` dan `playbook.json`      | Daftar event yang bisa difilter, panel detail, Excel |
| **Tur**     | Ditambah `wireframe/` dan `tours.ts` | Tur Driver.js dan simulasi klik dengan log event     |

## Apa yang diperiksa `pnpm playbook check`

| Pemeriksaan        | Contoh temuan                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Konsistensi usulan | Nama event salah pola, atribut tidak ada di kamus, jumlah di ringkasan tidak cocok            |
| Wireframe dan tur  | `track()` atau tur memakai event yang tidak ada, target tur tidak ditemukan                   |
| Cakupan            | Berapa event sudah dipasang dan masuk tur                                                     |
| Privasi            | Email, angka mirip NIP/NIK, nomor HP. Gambar tidak bisa dipindai, jadi harus ditinjau manusia |

`check` memastikan hasilnya konsisten, bukan bahwa usulannya berguna. Itu tetap keputusan manusia.

## Kenapa belum ada MCP

Pekerjaannya sebagian besar membaca dokumen, menulis file, dan menjalankan build, yang sudah bisa dilakukan agent.
MCP baru layak bila agent perlu akses data yang dibatasi (mis. BigQuery hanya agregat) atau katalog lintas tribe.
Logika CLI sudah terpisah di `cli/check.ts` dan `cli/export.ts`, jadi bisa dibungkus MCP nanti tanpa ditulis ulang.
