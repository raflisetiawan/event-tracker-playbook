import fs from "node:fs";
import path from "node:path";
import { inflateRawSync } from "node:zlib";

// Pembuka ZIP untuk bahan yang diupload (mis. rekaman dari extension). Mendukung file tanpa
// kompresi dan deflate, menolak path yang keluar dari folder tujuan, dan membatasi ukurannya.

const BATAS_ISI = 500 * 1024 * 1024;
const BATAS_ENTRI = 5000;

export function ekstrakZip(zip: Buffer, tujuan: string) {
  const akhir = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (akhir < 0) throw new Error("File ZIP tidak valid.");
  const jumlah = zip.readUInt16LE(akhir + 10);
  if (jumlah > BATAS_ENTRI) throw new Error("ZIP berisi terlalu banyak file.");
  let p = zip.readUInt32LE(akhir + 16);
  const akar = path.resolve(tujuan);
  let total = 0;
  for (let i = 0; i < jumlah; i++) {
    if (zip.readUInt32LE(p) !== 0x02014b50) throw new Error("File ZIP rusak.");
    const metode = zip.readUInt16LE(p + 10);
    const ukuranZip = zip.readUInt32LE(p + 20);
    const ukuranAsli = zip.readUInt32LE(p + 24);
    const panjangNama = zip.readUInt16LE(p + 28);
    const panjangEkstra = zip.readUInt16LE(p + 30);
    const panjangKomentar = zip.readUInt16LE(p + 32);
    const offsetLokal = zip.readUInt32LE(p + 42);
    const nama = zip.toString("utf8", p + 46, p + 46 + panjangNama);
    p += 46 + panjangNama + panjangEkstra + panjangKomentar;

    if (nama.endsWith("/")) continue;
    const lokasi = path.resolve(akar, nama);
    if (!lokasi.startsWith(akar + path.sep) || nama.includes("\\") || path.isAbsolute(nama)) {
      throw new Error(`ZIP berisi path yang tidak diizinkan: ${nama}`);
    }
    total += ukuranAsli;
    if (total > BATAS_ISI) throw new Error("Isi ZIP lebih besar dari 500 MB.");

    const awalData =
      offsetLokal + 30 + zip.readUInt16LE(offsetLokal + 26) + zip.readUInt16LE(offsetLokal + 28);
    const mentah = zip.subarray(awalData, awalData + ukuranZip);
    let data: Buffer;
    if (metode === 0) data = mentah;
    else if (metode === 8) data = inflateRawSync(mentah, { maxOutputLength: ukuranAsli || 1 });
    else throw new Error(`Metode kompresi ZIP tidak didukung (${metode}).`);

    fs.mkdirSync(path.dirname(lokasi), { recursive: true });
    fs.writeFileSync(lokasi, data);
  }
}
