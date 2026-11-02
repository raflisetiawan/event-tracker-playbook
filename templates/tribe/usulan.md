---
topik: Usulan event tracker {{nama}}
status: DRAF v0.1 — untuk diskusi dengan tim Product
dibuat: TODO-YYYY-MM-DD
---

# Usulan Tracker {{nama}}

**1 event** — perbarui jumlah ini setiap menambah event. `pnpm playbook check` akan menolak bila tidak cocok.

## Latar

TODO: data apa yang sudah ada, perilaku apa yang belum terlihat, dan kenapa event ini diusulkan.

## Pertanyaan perilaku yang ingin dijawab

| ID   | Area    | Pertanyaan                                      |
| ---- | ------- | ----------------------------------------------- |
| Q-01 | Beranda | TODO: pertanyaan yang ingin dijawab tim Product |

## Standar skema

| Kolom         | Isi yang diusulkan                          | Kondisi saat ini |
| ------------- | ------------------------------------------- | ---------------- |
| `event_name`  | Nama event sesuai daftar ini                | TODO             |
| `screen_name` | Kode halaman dari daftar screen_name        | TODO             |
| `attributes`  | Key-value; `user_role` wajib di semua event | TODO             |

### Daftar `screen_name`

| screen_name | Halaman |
| ----------- | ------- |
| `beranda`   | Beranda |

## Event per tahap

Kolom atribut hanya mencantumkan atribut khusus event. Pola nama: `view_`, `click_`, atau `download_`.
Tambahkan `(event_trigger = system)` di Pemicu untuk peringatan dari sistem, dan akhiran `_confirm`
atau frasa "setelah respons sukses" untuk aksi yang dikirim setelah API berhasil.

### Umum

Aktor: TODO.

| Event          | screen_name | Pemicu                 | Atribut | Prio | Q    | Status | Panduan                            |
| -------------- | ----------- | ---------------------- | ------- | ---- | ---- | ------ | ---------------------------------- |
| `view_beranda` | `beranda`   | Halaman beranda tampil | —       | P0   | Q-01 | Baru   | [slide 1](guide/README.md#slide-1) |

## Kamus atribut

| Key         | Tipe   | Keterangan                           |
| ----------- | ------ | ------------------------------------ |
| `user_role` | string | Wajib di semua event: peran pengguna |

## Pertanyaan terbuka

| Untuk   | Pertanyaan |
| ------- | ---------- |
| Product | TODO       |

## Privasi

Tidak ada atribut berisi nama, email, NIP, NIK, nomor HP, isi pencarian, atau isi teks bebas.
