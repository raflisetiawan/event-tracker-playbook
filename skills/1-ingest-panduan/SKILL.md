---
name: 1-ingest-panduan
description: Ubah panduan produk menjadi guide/ dan knowledge/ terstruktur. Pakai di awal project atau saat panduan berubah.
---

# Ingest panduan

**Masukan:** `projects/<id>/sumber/panduan/` (PPTX, PDF, screenshot, atau ZIP rekaman) dan `sumber/lain/`. **Hasil:** `projects/<id>/guide/` dan `projects/<id>/knowledge/`.

## Langkah

1. Konversi panduan ke `guide/` per slide atau per halaman, dengan anchor `<a id="slide-N"></a>` dan gambar
   `guide/images/slide-NNN.png`. Untuk PPTX, pakai project `pptx-to-md` bila tersedia. Jangan menyunting hasilnya manual.
   Untuk ZIP rekaman (`rekaman-*.zip` dari Perekam Alur Playbook), lihat bagian **Rekaman alur** di bawah.
2. Baca seluruh panduan. Baca gambarnya bila teks slide kurang jelas, terutama untuk label tombol dan urutan klik.
3. Isi `knowledge/` mengikuti tabel di `knowledge/README.md`, dimulai dari `ringkasan.md` dan `glosarium.md`.
4. Beri ID tetap pada aturan bisnis (`BR-001`, dst.) dan jangan mengubah nomornya setelah dipakai.

## Rekaman alur

ZIP dari extension berisi `rekaman.json` (data per langkah), `rekaman.md` (versi bacaan), dan `gambar/langkah-NNN.png`.

1. Playbook sudah mengekstraknya ke `sumber/panduan/<nama-zip-tanpa-.zip>/` saat diupload. Mulai dari `rekaman.md` di folder itu.
2. Jadikan tiap langkah satu "slide" di `guide/`: nomor slide melanjutkan nomor terakhir, anchor `<a id="slide-N"></a>`,
   gambar disalin menjadi `guide/images/slide-NNN.png`. Tulis jenis langkah, path halaman, label elemen, dan narasinya.
3. Kotak merah di gambar menandai elemen yang diklik; kotak hitam dan abu-abu adalah area yang disamarkan perekam.
4. Rekaman hanya menunjukkan satu jalur dengan satu peran. Kondisi lain (error, peran berbeda) tidak terekam:
   tandai sebagai pertanyaan untuk pengguna, jangan ditebak.
5. **Sebelum menyalin gambar ke `guide/`, minta pengguna memastikan screenshot tidak memuat data pribadi**, karena
   `guide/` ikut di-commit. Nama orang tidak disamarkan otomatis.

## Aturan

- Setiap fakta domain bertaut ke slide, mis. `[slide 64](../guide/03-seleksi.md#slide-64)`.
- Nilai yang tidak tertulis eksplisit ditandai **(turunan)**.
- Panduan sering memuat contoh nama dan NIP. Jangan salin ke `knowledge/`; catat bahwa gambarnya perlu ditinjau.

## Selesai bila

- Glosarium mencakup semua istilah dan akronim yang dipakai panduan.
- Semua peran dan tahapan utama punya entri, masing-masing bertaut ke slide.
- `node cli/playbook.ts check <id>` tidak melaporkan PII di `knowledge/`.

Contoh hasil yang baik: pola file `knowledge/` di repo sumber KSPS, dan tabel sumber di `examples/ksps/usulan.md`.
