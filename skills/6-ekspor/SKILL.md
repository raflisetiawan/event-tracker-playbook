---
name: 6-ekspor
description: Ekspor usulan ke Excel dan siapkan web untuk dibagikan. Pakai saat project siap dibahas atau diperbarui.
---

# Ekspor dan bagikan

## Langkah

1. Jalankan pemeriksaan penuh:
   ```bash
   node cli/playbook.ts check <id>
   node cli/playbook.ts verifikasi
   ```
2. Buat Excel. Hasilnya `projects/<id>/export/event-tracker-<id>.xlsx`:
   ```bash
   node cli/playbook.ts export <id>
   ```
3. Buka file Excel dan cek angka di sheet Ringkasan terhadap `usulan.md`.
4. Laporkan peringatan yang tersisa dan pertanyaan terbuka.

## Sebelum mempublikasikan web (konfirmasi dulu ke pengguna)

Publikasi membuat isi repo bisa dilihat orang lain, jadi tanyakan dulu:

- Siapa yang boleh mengakses? Situs statis bersifat publik kecuali dibatasi di hosting-nya.
- Sudahkah gambar `guide/images/` ditinjau? Build ikut menyalin slide yang dirujuk event, dan `check` tidak bisa memindai gambar.
- Apakah repo dan hosting memakai akun organisasi?

Konfigurasi Netlify ada di `netlify.toml`. Project dibuka lewat `/#/<id>`.
