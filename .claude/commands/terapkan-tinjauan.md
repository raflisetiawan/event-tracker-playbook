---
description: Kerjakan catatan tinjauan yang ditandai pengguna di web
argument-hint: <id-project>
---

Kerjakan tinjauan project `$ARGUMENTS` mengikuti `AGENTS.md`.

1. Baca `projects/$ARGUMENTS/tinjauan.json`. Yang perlu dikerjakan adalah item berstatus `ubah`, beserta `catatan`-nya.
2. Periksa `sumber/` dan `knowledge/` untuk tiap catatan, lalu ubah `usulan.md`, `wireframe/`, atau `tours.ts` seperlunya.
   Bila catatan bertentangan dengan panduan atau tidak jelas, jangan ditebak: tanyakan ke pengguna.
3. Setelah satu item selesai, hapus item itu dari `tinjauan.json` supaya bisa ditinjau ulang. Biarkan item berstatus `sesuai`.
4. Jalankan `node cli/playbook.ts check $ARGUMENTS` sampai tanpa error, lalu laporkan dengan bahasa sederhana apa saja yang berubah.
