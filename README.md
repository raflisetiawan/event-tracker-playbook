# Event Tracker Playbook

Workflow untuk AI agent: dari panduan produk sampai **usulan event tracker** dan **web tur interaktif**
yang bisa dibahas bersama Product dan Engineer. Satu repo melayani banyak project.

```text
panduan produk → knowledge → audit tracker → usulan event → wireframe → tur → Excel & web
                                  ▲ tinjau       ▲ setujui
```

## Isi repo

| Path                 | Isi                                                                    |
| -------------------- | ---------------------------------------------------------------------- |
| `AGENTS.md`          | Pintu masuk agent: urutan kerja dan aturan                             |
| `skills/`            | Enam langkah kerja                                                     |
| `templates/project/` | Kerangka project baru                                                  |
| `engine/`            | Mesin web: tur Driver.js, katalog event, log event, komponen wireframe |
| `cli/`               | `node cli/playbook.ts`: buat project, periksa, ekspor                  |
| `examples/ksps/`     | Contoh lengkap: 104 event dan 12 tur                                   |
| `projects/`          | Hasil kerja per project                                                |
| `extension/`         | Perekam Alur Playbook: rekam alur web menjadi panduan                  |

## Mulai

**Syarat:** [Node.js](https://nodejs.org) 24 atau lebih baru, dan AI coding agent (Claude Code, atau agent lain yang
bisa membaca `AGENTS.md`). npm sudah ikut terpasang bersama Node.

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`, lalu:

1. **Buat project** di halaman awal, mis. satu project per produk.
2. **Upload bahan**: panduan produk wajib ada; tracker, dokumen lain, dan pertanyaan Product membantu agent.
3. **Klik Buka terminal** dan salin perintah yang ditampilkan. Bila Claude Code belum terpasang, halaman menampilkan
   perintah pemasangannya. Agent lain: minta ikuti `AGENTS.md`.
4. **Tinjau di web**: klik event, bandingkan dengan slide, tandai **Sudah sesuai** atau **Perlu diubah**, lalu jalankan
   `/terapkan-tinjauan <id>` agar agent memperbaikinya. **Periksa otomatis** dan **Unduh Excel** juga ada di halaman itu.

Web tidak menjalankan AI. Upload dan tinjauan hanya ada di `npm run dev` di komputer sendiri, dan bahan tersimpan di
`projects/<id>/sumber/` yang tidak ikut ke git maupun ke hasil build.

## Belum punya panduan?

Pasang **Perekam Alur Playbook** dari folder `extension/` (Chrome atau Edge, tanpa Web Store). Rekam alur di web-nya,
tulis narasi, tandai event, lalu unduh daftar event sebagai Excel atau PDF. Rekamannya juga bisa dikirim ke project agar agent menyusun usulan lengkap dengan tur. Cara pasang dan rencananya ada di
[`extension/README.md`](extension/README.md).

## Dua tingkat hasil

| Tingkat     | Yang dibutuhkan                      | Yang didapat                                         |
| ----------- | ------------------------------------ | ---------------------------------------------------- |
| **Katalog** | `usulan.md` dan `playbook.json`      | Daftar event yang bisa difilter, panel detail, Excel |
| **Tur**     | Ditambah `wireframe/` dan `tours.ts` | Tur Driver.js dan simulasi klik dengan log event     |

## Apa yang diperiksa tombol Periksa otomatis (`node cli/playbook.ts check`)

| Pemeriksaan        | Contoh temuan                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Konsistensi usulan | Nama event salah pola, atribut tidak ada di kamus, jumlah di ringkasan tidak cocok            |
| Wireframe dan tur  | `track()` atau tur memakai event yang tidak ada, target tur tidak ditemukan                   |
| Cakupan            | Berapa event sudah dipasang dan masuk tur                                                     |
| Privasi            | Email, angka mirip NIP/NIK, nomor HP. Gambar tidak bisa dipindai, jadi harus ditinjau manusia |

`check` memastikan hasilnya konsisten, bukan bahwa usulannya berguna. Itu tetap keputusan manusia.

## Kenapa belum ada MCP

Pekerjaannya sebagian besar membaca dokumen, menulis file, dan menjalankan build, yang sudah bisa dilakukan agent.
MCP baru layak bila agent perlu akses data yang dibatasi (mis. BigQuery hanya agregat) atau katalog lintas project.
Logika CLI sudah terpisah di `cli/check.ts` dan `cli/export.ts`, jadi bisa dibungkus MCP nanti tanpa ditulis ulang.
