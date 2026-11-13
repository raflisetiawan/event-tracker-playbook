import fs from "node:fs";
import path from "node:path";
import { parseUsulan } from "../engine/plugin/parse-usulan.ts";
import { bacaTinjauan } from "./tinjauan.ts";

// Operasi folder project (`projects/<id>/`) yang dipakai CLI dan halaman awal lokal.

export const DIR_PROJECTS = "projects";
export const POLA_ID = /^[a-z][a-z0-9-]*$/;
export const BATAS_UKURAN = 100 * 1024 * 1024;

/** ID extension Perekam Alur Playbook, dikunci lewat `key` di extension/manifest.json. */
export const ID_EXTENSION = "monlmlljocchnlehojbmkhmndigpbojg";

/** Jenis bahan yang diupload. Disimpan di projects/<id>/sumber/<kategori>/ dan tidak masuk git. */
export const KATEGORI = {
  panduan: {
    label: "Panduan produk",
    keterangan:
      "Panduan website atau aplikasi: PDF, PPTX, screenshot, atau ZIP dari Perekam Alur Playbook.",
    wajib: true,
    ekstensi: [".pdf", ".pptx", ".png", ".jpg", ".jpeg", ".zip"],
  },
  tracker: {
    label: "Tracker yang sudah ada",
    keterangan: "Daftar event atau rangkuman agregat. Jangan upload data per pengguna.",
    wajib: false,
    ekstensi: [".xlsx", ".csv", ".tsv", ".txt", ".md", ".json"],
  },
  lain: {
    label: "Dokumen lain",
    keterangan: "PRD, catatan rapat, atau hal lain yang perlu dibaca agent.",
    wajib: false,
    ekstensi: [".pdf", ".docx", ".pptx", ".xlsx", ".csv", ".md", ".txt", ".png", ".jpg", ".jpeg"],
  },
} as const;

export type Kategori = keyof typeof KATEGORI;

export const adalahKategori = (k: string): k is Kategori => Object.hasOwn(KATEGORI, k);

/** Nama file aman untuk disimpan, atau null bila memuat path atau karakter terlarang. */
export function namaFileAman(nama: string): string | null {
  const bersih = nama.trim();
  if (!bersih || bersih.length > 200 || bersih.startsWith(".")) return null;
  // eslint-disable-next-line no-control-regex
  if (/[/\\:*?"<>|\u0000-\u001f]/.test(bersih)) return null;
  return bersih;
}

export const ekstensiDiizinkan = (k: Kategori, nama: string) =>
  (KATEGORI[k].ekstensi as readonly string[]).includes(path.extname(nama).toLowerCase());

export const dirProject = (root: string, id: string) => path.join(root, DIR_PROJECTS, id);

function salinTemplate(dari: string, ke: string, ganti: Record<string, string>) {
  fs.mkdirSync(ke, { recursive: true });
  for (const e of fs.readdirSync(dari, { withFileTypes: true })) {
    const a = path.join(dari, e.name);
    const b = path.join(ke, e.name);
    if (e.isDirectory()) {
      salinTemplate(a, b, ganti);
    } else {
      let teks = fs.readFileSync(a, "utf8");
      for (const [k, v] of Object.entries(ganti)) teks = teks.replaceAll(`{{${k}}}`, v);
      fs.writeFileSync(b, teks);
    }
  }
}

/** Buat projects/<id> dari template. Melempar Error berisi pesan untuk pengguna. */
export function buatProject(root: string, id: string, nama: string) {
  if (!POLA_ID.test(id)) {
    throw new Error("Id project harus huruf kecil, angka, dan tanda hubung, mis. portal-guru.");
  }
  const tujuan = dirProject(root, id);
  if (fs.existsSync(tujuan)) throw new Error(`projects/${id} sudah ada.`);
  // Teks nama masuk ke JSON dan TSX template, jadi batasi karakternya.
  if (!/^[\p{L}\p{N} ().,&-]{1,80}$/u.test(nama)) {
    throw new Error("Nama project hanya boleh huruf, angka, spasi, dan tanda baca sederhana.");
  }
  salinTemplate(path.join(root, "templates", "project"), tujuan, { id, nama });
  return tujuan;
}

const jumlahFile = (dir: string, cocok: (nama: string) => boolean = () => true) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile() && cocok(e.name)).length
    : 0;

/** Kondisi satu project untuk halaman awal: bahan yang sudah ada dan progres agent. */
export function statusProject(root: string, id: string) {
  const dir = dirProject(root, id);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "playbook.json"), "utf8")) as {
    nama: string;
  };
  const sumber = path.join(dir, "sumber");
  const bahan = (Object.keys(KATEGORI) as Kategori[]).map((k) => {
    const folder = path.join(sumber, k);
    const files = fs.existsSync(folder)
      ? fs
          .readdirSync(folder, { withFileTypes: true })
          .filter((e) => e.isFile())
          .map((e) => ({ nama: e.name, ukuran: fs.statSync(path.join(folder, e.name)).size }))
      : [];
    return { kategori: k, ...KATEGORI[k], files };
  });
  const pertanyaanPath = path.join(sumber, "pertanyaan.md");
  const pertanyaan = fs.existsSync(pertanyaanPath) ? fs.readFileSync(pertanyaanPath, "utf8") : "";
  const lengkap = bahan.every((b) => !b.wajib || b.files.length > 0);

  const baca = (f: string) => {
    const p = path.join(dir, f);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
  };
  // Progres dibaca dari file yang dihasilkan agent; penanda "contoh" berasal dari template.
  const langkah = [
    {
      nama: "Ingest panduan",
      selesai:
        jumlahFile(path.join(dir, "knowledge"), (n) => n !== "README.md") > 0 &&
        jumlahFile(path.join(dir, "guide"), (n) => n !== "README.md") > 0,
      tinjau: false,
    },
    {
      nama: "Audit tracker",
      selesai: fs.existsSync(path.join(dir, "knowledge", "tracker-existing.md")),
      tinjau: true,
    },
    { nama: "Susun usulan", selesai: !baca("usulan.md").includes("TODO"), tinjau: true },
    {
      nama: "Bangun wireframe",
      selesai: fs.existsSync(path.join(dir, "wireframe", "screens")),
      tinjau: false,
    },
    {
      nama: "Susun tur",
      selesai: !baca("tours.ts").includes("Contoh tur satu langkah"),
      tinjau: false,
    },
    { nama: "Ekspor", selesai: jumlahFile(path.join(dir, "export")) > 0, tinjau: false },
  ];
  const isiTinjauan = Object.values(bacaTinjauan(dir));
  const tinjauan = {
    sesuai: isiTinjauan.filter((t) => t.status === "sesuai").length,
    ubah: isiTinjauan.filter((t) => t.status === "ubah").length,
    jumlahEvent: parseUsulan(baca("usulan.md")).events.length,
  };
  return { id, nama: meta.nama, bahan, pertanyaan, lengkap, langkah, tinjauan };
}

export const daftarProject = (root: string) => {
  const base = path.join(root, DIR_PROJECTS);
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(base, e.name, "playbook.json")))
    .map((e) => e.name)
    .sort();
};
