import fs from "node:fs";
import path from "node:path";

// Tinjauan manusia per event, ditulis dari web dan dibaca agent lewat projects/<id>/tinjauan.json.

export type StatusTinjauan = "sesuai" | "ubah";
export interface ItemTinjauan {
  status: StatusTinjauan;
  catatan: string;
}
export type Tinjauan = Record<string, ItemTinjauan>;

const POLA_NAMA = /^[a-z0-9_]{1,120}$/;
export const BATAS_CATATAN = 2000;

const lokasi = (dirKerja: string) => path.join(dirKerja, "tinjauan.json");

export function bacaTinjauan(dirKerja: string): Tinjauan {
  const p = lokasi(dirKerja);
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as Tinjauan) : {};
}

/** Simpan satu event. Status kosong menghapus tinjauannya. Melempar Error bila isian tidak sah. */
export function simpanTinjauan(dirKerja: string, event: string, status: string, catatan: string) {
  if (!POLA_NAMA.test(event)) throw new Error("Nama event tidak valid.");
  if (status !== "" && status !== "sesuai" && status !== "ubah") {
    throw new Error("Status tinjauan tidak valid.");
  }
  if (catatan.length > BATAS_CATATAN) throw new Error("Catatan terlalu panjang.");
  if (status === "ubah" && !catatan.trim()) {
    throw new Error("Tulis apa yang perlu diubah supaya agent bisa memperbaikinya.");
  }
  const data = bacaTinjauan(dirKerja);
  if (status === "") delete data[event];
  else data[event] = { status, catatan: catatan.trim() };
  fs.writeFileSync(lokasi(dirKerja), `${JSON.stringify(data, null, 2)}\n`);
  return data;
}
