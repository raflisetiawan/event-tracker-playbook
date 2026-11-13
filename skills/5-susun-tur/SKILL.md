---
name: 5-susun-tur
description: Susun langkah tur Driver.js di atas wireframe. Pakai setelah layar dan event terpasang.
---

# Susun tur

**Masukan:** wireframe dan event yang terpasang. **Hasil:** `projects/<id>/tours.ts`.

## Langkah

1. Buat satu tur per alur, urutannya sama dengan langkah pengguna di panduan.
2. Tiap langkah berisi `event`, `target` (nilai `data-tour`), `sim`, dan bila perlu `catatan`.
3. `sim` digabung dengan `initialState`, jadi tulis semua yang dibutuhkan layar itu. Contoh menyorot tombol di dalam modal:
   ```ts
   {
     event: "click_x_kirim_confirm",
     target: "kirim-confirm",
     sim: { screen: "x_buat", modal: "konfirmasi", pilihan: ["a"] },
     catatan: "Dikirim setelah respons API sukses.",
   }
   ```
4. Pakai `catatan` untuk hal yang menentukan keputusan: pertanyaan yang dijawab, aturan bisnis (`BR-xxx`), atau gap.

## Aturan

- Jangan menyorot tombol yang nonaktif. Isi `sim` sampai syaratnya terpenuhi.
- Jangan menyorot elemen setinggi layar; sorot judul halaman untuk event `view_`.
- Elemen yang muncul dengan kondisi tertentu harus benar-benar tampil dengan `sim` langkah itu.

## Selesai bila

- `node cli/playbook.ts check <id>` tanpa error. Kalau ada event yang sengaja tidak masuk tur, sebutkan saat melapor.
- Semua tur dijalankan di browser sampai akhir: setiap langkah menyorot elemen yang tepat, dan tombol Selesai menutup tur.
