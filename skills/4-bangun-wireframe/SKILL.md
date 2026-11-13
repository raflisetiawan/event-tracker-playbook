---
name: 4-bangun-wireframe
description: Bangun wireframe React layar produk dan pasang event simulasi. Pakai setelah usulan disetujui.
---

# Bangun wireframe

**Masukan:** `usulan.md` yang disetujui dan panduan. **Hasil:** `projects/<id>/wireframe/`.

Baca `examples/ksps/wireframe/` dulu. Mulai dari alur P0 yang dipilih, lalu tambah alur lain.

## Langkah per alur

1. Baca teks dan gambar slide alur itu. Catat layar, modal, urutan langkah, dan status.
2. Tambahkan field ke `wireframe/state.ts`: `screen` (nilainya = `screen_name`), modal, tahap, dan pilihan pengguna.
3. Buat layar di `wireframe/screens/<Alur>.tsx` dengan komponen dari `@engine/wireframe/ui.tsx`
   (`Btn`, `Card`, `Chip`, `Table`, `Td`, `Modal`, `Field`, `FakeUpload`, `Stepper`).
4. Daftarkan layar di `wireframe/Wireframe.tsx`. Pakai `Shell`, atau kerangka sendiri bila aplikasinya jauh berbeda.
5. Pasang event di aksinya:
   ```tsx
   <Btn tour="kirim" onClick={() => { track("click_x_kirim_confirm", { jumlah: 1 }); setState({ modal: null }); }}>
   ```
6. Beri `tour="..."` atau `data-tour="..."` pada elemen yang akan disorot.

## Aturan

- Layar mengikuti panduan: label tombol, urutan, dan aturan bisnis (mis. tombol nonaktif sampai syaratnya terpenuhi).
- Data di `wireframe/dummy.ts`, semuanya fiktif. Tanpa logo atau branding resmi; tampilan tetap netral.
- Jangan menulis detail event di kode. Atribut yang dikirim harus sama dengan kolom Atribut di usulan.
- Panggil `setState` sebelum `track` bila aksinya mengubah layar atau peran, supaya konteks event benar.
- Bila panduan tidak menjelaskan suatu perilaku, beri komentar asumsi dan laporkan.
- Catat kalau menemukan aksi penting tanpa event, atau atribut yang kurang: itu masukan untuk usulan.

## Selesai bila

- `node cli/playbook.ts verifikasi` dan `node cli/playbook.ts check <id>` tanpa error.
- Alur sudah diklik dari awal sampai akhir di browser, dan tab **Log event** tidak menampilkan
  "Tidak ada di dokumen usulan" atau "Atribut belum dikirim".
