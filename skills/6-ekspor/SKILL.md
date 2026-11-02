---
name: 6-ekspor
description: Ekspor usulan ke Excel dan siapkan web untuk dibagikan. Pakai saat tribe siap dibahas atau diperbarui.
---

# Ekspor dan bagikan

## Langkah

1. Jalankan pemeriksaan penuh:
   ```bash
   pnpm playbook check <id>
   pnpm exec vp check
   pnpm test
   pnpm run build
   ```
2. Buat Excel. Hasilnya `export/event-tracker-<id>.xlsx` di folder tribe:
   ```bash
   pnpm playbook export <id>
   ```
3. Buka file Excel dan cek angka di sheet Ringkasan terhadap `usulan.md`.
4. Laporkan peringatan yang tersisa dan pertanyaan terbuka.

## Sebelum mempublikasikan web (konfirmasi dulu ke pengguna)

Publikasi membuat isi repo bisa dilihat orang lain, jadi tanyakan dulu:

- Siapa yang boleh mengakses? Situs statis bersifat publik kecuali dibatasi di hosting-nya.
- Sudahkah gambar `guide/images/` ditinjau? Build ikut menyalin slide yang dirujuk event, dan `check` tidak bisa memindai gambar.
- Apakah repo dan hosting memakai akun organisasi?

Konfigurasi Netlify ada di `netlify.toml`. Tribe dibuka lewat `/#/<id>`.
