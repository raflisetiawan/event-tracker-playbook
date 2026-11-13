---
description: Susun usulan event tracker satu project, dari panduan produk sampai web tur
argument-hint: <id-project>
---

Kerjakan project `$ARGUMENTS` mengikuti `AGENTS.md`.

1. Bila `projects/$ARGUMENTS` belum ada, minta pengguna membuatnya di halaman awal (`npm run dev`), atau tanyakan nama lengkapnya lalu jalankan `node cli/playbook.ts new $ARGUMENTS --nama "<nama>"`.
2. Baca bahan di `projects/$ARGUMENTS/sumber/`: `panduan/`, `tracker/`, `lain/`, dan `pertanyaan.md`. Bila `panduan/` kosong, minta pengguna mengupload dulu di halaman awal.
3. Kerjakan skill di `skills/` berurutan dari langkah yang belum selesai.
4. Patuhi titik berhenti setelah langkah 2 dan 3. Di langkah 3, minta pengguna membuka project ini di web, menandai tiap event, lalu mengetik `lanjut`. Sebelum melanjutkan, baca `projects/$ARGUMENTS/tinjauan.json` dan kerjakan yang berstatus `ubah`.
5. Gunakan bahasa sederhana saat melapor: pengguna mungkin bukan programmer. Jalankan sendiri semua perintah teknis; jangan meminta pengguna menjalankannya.
