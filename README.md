# Event Tracker Playbook

Workflow untuk menyusun **usulan event tracker** sebuah web atau aplikasi, lengkap dengan **web tur interaktif** untuk
dibahas bersama Product dan Engineer. AI agent mengerjakan isinya; web lokal dipakai untuk upload bahan dan meninjau
hasil. Satu repo melayani banyak project.

```text
panduan produk → knowledge → audit tracker → usulan event → wireframe → tur → Excel & web
                                  ▲ tinjau       ▲ setujui
```

## Dua cara pakai

| Cara        | Untuk                                             | Butuh                                  | Hasil                                                   |
| ----------- | ------------------------------------------------- | -------------------------------------- | ------------------------------------------------------- |
| **Cepat**   | Daftar nama event dari satu alur web              | Extension saja                         | Excel daftar event dan PDF panduan langkah demi langkah |
| **Lengkap** | Usulan resmi yang dibahas dengan Product/Engineer | Node.js, AI coding agent, web playbook | `usulan.md`, katalog event, wireframe, tur, Excel       |

Cara cepat bisa jadi bahan cara lengkap: rekaman dari extension dikirim ke project, lalu agent menyusun usulannya.

## Syarat

- [Node.js](https://nodejs.org) 24 atau lebih baru. npm sudah ikut terpasang bersama Node.
- AI coding agent: [Claude Code](https://code.claude.com), atau agent lain yang bisa membaca `AGENTS.md`.
- Untuk extension: Chrome atau Edge dengan Developer mode diizinkan.

## Mulai

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`, lalu:

1. **Buat project** di halaman awal, mis. satu project per produk.
2. **Upload bahan**. Panduan produk wajib ada (PDF, PPTX, screenshot, atau ZIP rekaman extension); tracker yang sudah
   ada, dokumen lain, dan pertanyaan Product membantu agent.
3. **Jalankan agent.** Klik **Buka terminal**, lalu jalankan perintah yang ditampilkan:

   ```text
   claude
   /buat-usulan <id-project>
   ```

   Agent berhenti dua kali untuk ditinjau: setelah audit tracker, dan setelah usulan event tersusun.

4. **Tinjau di web.** Buka project, klik sebuah event, bandingkan dengan slide panduan di panel yang sama, lalu tandai
   **Sudah sesuai** atau **Perlu diubah** beserta catatannya. Setelah itu jalankan `/terapkan-tinjauan <id-project>`
   agar agent memperbaikinya. **Periksa otomatis** dan **Unduh Excel** ada di halaman awal.

Web tidak menjalankan AI. Upload dan tinjauan hanya ada di `npm run dev` di komputer sendiri; bahan tersimpan di
`projects/<id>/sumber/` yang tidak ikut ke git maupun ke hasil build.

## Belum punya panduan?

Pasang **Perekam Alur Playbook** dari folder `extension/` (Chrome atau Edge, tanpa Web Store):

1. Buka `chrome://extensions` (Edge: `edge://extensions`) dan nyalakan **Developer mode**.
2. Klik **Load unpacked**, lalu pilih folder `extension/`.
3. Buka web yang ingin direkam, klik ikon extension, lalu **Mulai rekam**.

Tiap klik dan halaman menjadi satu langkah dengan screenshot. Tulis narasi dan centang **Jadikan event** di langkah
penting; nama event disarankan otomatis sesuai konvensi. Hasilnya bisa diunduh sebagai **Excel daftar event** atau
**PDF**, atau dikirim ke project. Rincian dan batasannya ada di [`extension/README.md`](extension/README.md).

## Perintah

**Claude Code** (di terminal, dari folder repo ini):

| Perintah                          | Fungsi                                                  |
| --------------------------------- | ------------------------------------------------------- |
| `/buat-usulan <id-project>`       | Menjalankan enam langkah kerja dari panduan sampai tur  |
| `/terapkan-tinjauan <id-project>` | Mengerjakan event yang ditandai **Perlu diubah** di web |

Agent lain cukup diminta mengikuti `AGENTS.md`.

**CLI** (dipakai agent, bisa juga manual):

| Perintah                                     | Fungsi                                               |
| -------------------------------------------- | ---------------------------------------------------- |
| `node cli/playbook.ts list`                  | Daftar project dan contoh beserta cakupannya         |
| `node cli/playbook.ts new <id> --nama "..."` | Buat project baru dari template                      |
| `node cli/playbook.ts check <id>`            | Periksa satu project (`--ketat`: peringatan = gagal) |
| `node cli/playbook.ts export <id>`           | Ekspor `usulan.md` ke Excel                          |
| `node cli/playbook.ts verifikasi`            | Format, lint, tipe, tes, dan build                   |

## Isi repo

| Path                 | Isi                                                                    |
| -------------------- | ---------------------------------------------------------------------- |
| `AGENTS.md`          | Pintu masuk agent: urutan kerja dan aturan                             |
| `skills/`            | Enam langkah kerja agent                                               |
| `.claude/commands/`  | Perintah `/buat-usulan` dan `/terapkan-tinjauan` untuk Claude Code     |
| `projects/`          | Hasil kerja per project                                                |
| `examples/ksps/`     | Contoh lengkap: 104 event dan 12 tur                                   |
| `templates/project/` | Kerangka project baru                                                  |
| `engine/`            | Mesin web: halaman awal, tur Driver.js, katalog event, wireframe       |
| `cli/`               | CLI playbook: buat project, periksa, ekspor                            |
| `extension/`         | Perekam Alur Playbook: rekam alur web menjadi panduan dan daftar event |

## Isi satu project

```text
projects/<id>/
├── playbook.json      nama project
├── usulan.md          sumber kebenaran: pertanyaan perilaku, event, atribut
├── knowledge/         ringkasan domain dari panduan, tiap fakta bertaut ke slide
├── guide/             panduan per slide beserta gambarnya
├── wireframe/         wireframe React dengan event terpasang (opsional)
├── tours.ts           langkah tur Driver.js (opsional)
├── tribe.tsx          konfigurasi web project
├── tinjauan.json      hasil tinjauan dari web
├── sumber/            bahan yang diupload — tidak ikut ke git
└── export/            Excel hasil ekspor — tidak ikut ke git
```

Tanpa `wireframe/` dan `tours.ts`, project tetap tampil sebagai **katalog** event yang bisa difilter dan diekspor ke
Excel. Dengan keduanya, project mendapat **tur** Driver.js dan simulasi klik dengan log event.

## Apa yang diperiksa

**Periksa otomatis** di web dan `node cli/playbook.ts check` memeriksa hal yang sama:

| Pemeriksaan        | Contoh temuan                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Konsistensi usulan | Nama event salah pola, atribut tidak ada di kamus, jumlah di ringkasan tidak cocok            |
| Wireframe dan tur  | `track()` atau tur memakai event yang tidak ada, target tur tidak ditemukan                   |
| Cakupan            | Berapa event sudah dipasang dan masuk tur                                                     |
| Tinjauan           | Event yang ditandai **Perlu diubah** dan belum dikerjakan                                     |
| Privasi            | Email, angka mirip NIP/NIK, nomor HP. Gambar tidak bisa dipindai, jadi harus ditinjau manusia |

Pemeriksaan ini memastikan hasilnya konsisten, bukan bahwa usulannya berguna. Itu tetap keputusan manusia.

## Privasi

- Jangan menulis data pribadi pengguna (nama, email, NIP, NIK, nomor HP, `user_id` mentah) di file yang di-commit,
  termasuk sebagai contoh. Wireframe hanya memakai data fiktif.
- Data produksi hanya boleh masuk repo dalam bentuk agregat.
- Rekam dengan extension di staging atau akun demo. Isian form dan teks mirip email/NIP/NIK/HP disamarkan otomatis,
  tetapi nama orang tidak; tutup sendiri di halaman tinjau sebelum mengekspor.

## Membagikan hasil

`npm run build` menghasilkan situs statis di `dist/` (konfigurasi Netlify ada di `netlify.toml`). Situs ini hanya
menampilkan katalog dan tur; upload, tinjauan, dan tombol terminal tidak ikut, sehingga bahan internal tidak pernah
terkirim ke sana. Project dibuka lewat `/#/<id>`.

## Kenapa belum ada MCP

Pekerjaannya sebagian besar membaca dokumen, menulis file, dan menjalankan build, yang sudah bisa dilakukan agent.
MCP baru layak bila agent perlu akses data yang dibatasi (mis. BigQuery hanya agregat) atau katalog lintas project.
Logika CLI sudah terpisah di `cli/check.ts` dan `cli/export.ts`, jadi bisa dibungkus MCP nanti tanpa ditulis ulang.
