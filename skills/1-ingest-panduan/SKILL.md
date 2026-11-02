---
name: 1-ingest-panduan
description: Ubah panduan produk tribe menjadi guide/ dan knowledge/ terstruktur. Pakai di awal tribe baru atau saat panduan berubah.
---

# Ingest panduan

**Masukan:** panduan produk (PPTX, PDF, dokumen, atau screenshot). **Hasil:** `tribes/<id>/guide/` dan `tribes/<id>/knowledge/`.

## Langkah

1. Konversi panduan ke `guide/` per slide atau per halaman, dengan anchor `<a id="slide-N"></a>` dan gambar
   `guide/images/slide-NNN.png`. Untuk PPTX, pakai project `pptx-to-md` bila tersedia. Jangan menyunting hasilnya manual.
2. Baca seluruh panduan. Baca gambarnya bila teks slide kurang jelas, terutama untuk label tombol dan urutan klik.
3. Isi `knowledge/` mengikuti tabel di `knowledge/README.md`, dimulai dari `ringkasan.md` dan `glosarium.md`.
4. Beri ID tetap pada aturan bisnis (`BR-001`, dst.) dan jangan mengubah nomornya setelah dipakai.

## Aturan

- Setiap fakta domain bertaut ke slide, mis. `[slide 64](../guide/03-seleksi.md#slide-64)`.
- Nilai yang tidak tertulis eksplisit ditandai **(turunan)**.
- Panduan sering memuat contoh nama dan NIP. Jangan salin ke `knowledge/`; catat bahwa gambarnya perlu ditinjau.

## Selesai bila

- Glosarium mencakup semua istilah dan akronim yang dipakai panduan.
- Semua peran dan tahapan utama punya entri, masing-masing bertaut ke slide.
- `pnpm playbook check <id>` tidak melaporkan PII di `knowledge/`.

Contoh hasil yang baik: pola file `knowledge/` di repo sumber KSPS, dan tabel sumber di `examples/ksps/usulan.md`.
