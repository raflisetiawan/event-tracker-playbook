import fs from "node:fs";
import path from "node:path";
import { parseUsulan, type UsulanData } from "../engine/plugin/parse-usulan.ts";

// Pemeriksaan satu tribe. Error = harus diperbaiki; peringatan = perlu ditinjau manusia.

export interface HasilCheck {
  errors: string[];
  warnings: string[];
  info: string[];
  jumlahEvent: number;
  terpasang: number;
  diTur: number;
  adaWireframe: boolean;
}

const POLA_EVENT = /^(view|click|download)_[a-z0-9_]+$/;
const EKSTENSI_TEKS = new Set([".md", ".ts", ".tsx", ".json", ".csv", ".txt"]);
const DOMAIN_CONTOH = /@(contoh\.id|example\.(com|org|id))$/i;

function daftarFile(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? daftarFile(p) : [p];
  });
}

/** Aturan isi dokumen usulan. Terpisah supaya bisa diuji tanpa folder tribe. */
export function periksaUsulan(md: string, data: UsulanData = parseUsulan(md)) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (data.events.length === 0) {
    errors.push('usulan.md: tidak ada event. Pastikan ada bagian "## Event per tahap".');
  }
  const klaim = md.match(/\*\*(\d+) event\*\*/);
  if (klaim && Number(klaim[1]) !== data.events.length) {
    errors.push(
      `usulan.md: ringkasan menyebut ${klaim[1]} event, tabel berisi ${data.events.length}.`,
    );
  }
  const questions = new Set(data.questions.map((q) => q.id));
  const screens = new Set(data.screens.map((s) => s.name));
  const attributes = new Set(data.attributes.map((a) => a.key));
  const seen = new Set<string>();
  for (const e of data.events) {
    if (seen.has(e.name)) errors.push(`Event ganda: ${e.name}`);
    seen.add(e.name);
    if (!POLA_EVENT.test(e.name)) {
      errors.push(`${e.name}: nama harus view_/click_/download_ + huruf kecil dan garis bawah.`);
    }
    if (!["P0", "P1", "P2"].includes(e.prio)) errors.push(`${e.name}: prioritas "${e.prio}".`);
    for (const q of e.questions) {
      if (!questions.has(q)) errors.push(`${e.name}: pertanyaan ${q} tidak ada di daftar.`);
    }
    for (const s of e.screenNames) {
      if (!screens.has(s)) errors.push(`${e.name}: screen_name ${s} tidak ada di daftar.`);
    }
    for (const a of e.atribut) {
      if (!attributes.has(a)) errors.push(`${e.name}: atribut ${a} tidak ada di kamus.`);
    }
    if (e.questions.length === 0) warnings.push(`${e.name}: tidak menjawab pertanyaan apa pun.`);
    if (e.slide === null) warnings.push(`${e.name}: tidak punya rujukan slide panduan.`);
  }
  return { errors, warnings };
}

/** Cari data pribadi yang tertulis di teks: email, NIP, NIK, nomor HP. */
export function cariPii(teks: string): string[] {
  const temuan: string[] = [];
  for (const m of teks.matchAll(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g)) {
    if (!DOMAIN_CONTOH.test(m[0])) temuan.push(`email ${m[0]}`);
  }
  if (/(?<![\d/.-])\d{18}(?![\d/.-])/.test(teks)) temuan.push("angka 18 digit (mirip NIP)");
  if (/(?<![\d/.-])\d{16}(?![\d/.-])/.test(teks)) temuan.push("angka 16 digit (mirip NIK)");
  if (/(?<![\d/.-])(\+62|08)\d{8,11}(?![\d/.-])/.test(teks)) temuan.push("nomor mirip nomor HP");
  return temuan;
}

export function checkTribe(dir: string): HasilCheck {
  const usulanPath = path.join(dir, "usulan.md");
  const hasil: HasilCheck = {
    errors: [],
    warnings: [],
    info: [],
    jumlahEvent: 0,
    terpasang: 0,
    diTur: 0,
    adaWireframe: false,
  };
  if (!fs.existsSync(usulanPath)) {
    hasil.errors.push("usulan.md tidak ditemukan.");
    return hasil;
  }
  const md = fs.readFileSync(usulanPath, "utf8");
  const data = parseUsulan(md);
  hasil.jumlahEvent = data.events.length;
  const u = periksaUsulan(md, data);
  hasil.errors.push(...u.errors);
  hasil.warnings.push(...u.warnings);

  const metaPath = path.join(dir, "playbook.json");
  if (!fs.existsSync(metaPath)) {
    hasil.errors.push("playbook.json tidak ditemukan.");
  } else {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as { id?: string };
    if (meta.id !== path.basename(dir)) {
      hasil.errors.push(`playbook.json: id "${meta.id}" tidak sama dengan nama folder.`);
    }
  }

  const semua = daftarFile(dir);
  const relatif = (f: string) => path.relative(dir, f).split(path.sep).join("/");
  const teksDari = (fs_: string[]) => fs_.map((f) => fs.readFileSync(f, "utf8")).join("\n");

  // Cakupan wireframe dan tur.
  const fileWireframe = semua.filter((f) => relatif(f).startsWith("wireframe/"));
  hasil.adaWireframe = fileWireframe.length > 0;
  const toursPath = path.join(dir, "tours.ts");
  const toursTeks = fs.existsSync(toursPath) ? fs.readFileSync(toursPath, "utf8") : "";
  if (hasil.adaWireframe) {
    // Komentar dibuang supaya contoh kode di dalamnya tidak terbaca sebagai pemakaian.
    const kode = (
      teksDari(fileWireframe) +
      "\n" +
      fs.readFileSync(path.join(dir, "tribe.tsx"), "utf8")
    )
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    const nama = new Set(data.events.map((e) => e.name));
    for (const m of kode.matchAll(/track\(\s*"([^"]+)"/g)) {
      if (!nama.has(m[1])) hasil.errors.push(`wireframe: track("${m[1]}") tidak ada di usulan.md.`);
    }
    for (const m of toursTeks.matchAll(/event:\s*"([^"]+)"/g)) {
      if (!nama.has(m[1])) hasil.errors.push(`tours.ts: event ${m[1]} tidak ada di usulan.md.`);
    }
    const awalanTemplate = [...kode.matchAll(/`([a-z0-9-]+)\$\{/g)].map((m) => m[1]);
    awalanTemplate.push("menu-");
    for (const m of toursTeks.matchAll(/target:\s*"([^"]+)"/g)) {
      const ada = kode.includes(`"${m[1]}"`) || awalanTemplate.some((a) => m[1].startsWith(a));
      if (!ada) hasil.errors.push(`tours.ts: target "${m[1]}" tidak ada di wireframe.`);
    }
    const belumPasang = data.events.filter((e) => !kode.includes(`"${e.name}"`));
    const belumTur = data.events.filter((e) => !toursTeks.includes(`"${e.name}"`));
    hasil.terpasang = data.events.length - belumPasang.length;
    hasil.diTur = data.events.length - belumTur.length;
    for (const e of belumPasang) {
      hasil.warnings.push(`${e.name}: belum dipasang di wireframe (${e.prio}).`);
    }
    for (const e of belumTur) hasil.warnings.push(`${e.name}: belum ada di tur (${e.prio}).`);
  } else {
    hasil.info.push("Belum ada wireframe: tribe ini tampil sebagai katalog event saja.");
  }

  // Privasi dan sisa pekerjaan.
  for (const f of semua) {
    const rel = relatif(f);
    if (!EKSTENSI_TEKS.has(path.extname(f))) continue;
    const teks = fs.readFileSync(f, "utf8");
    for (const t of cariPii(teks)) {
      const pesan = `${rel}: ${t}`;
      // Panduan asli memuat contoh data dari slide; tetap perlu ditinjau, tetapi bukan error.
      if (rel.startsWith("guide/")) hasil.warnings.push(pesan);
      else hasil.errors.push(`PII? ${pesan}`);
    }
    if (rel === "usulan.md" && teks.includes("TODO")) {
      hasil.warnings.push("usulan.md masih berisi TODO.");
    }
  }
  const jumlahGambar = semua.filter((f) => /\.(png|jpe?g)$/i.test(f)).length;
  if (jumlahGambar > 0) {
    hasil.warnings.push(
      `${jumlahGambar} gambar di guide/ tidak bisa dipindai otomatis; tinjau isinya sebelum dipublikasikan.`,
    );
  }
  return hasil;
}
