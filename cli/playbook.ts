import fs from "node:fs";
import path from "node:path";
import { checkTribe } from "./check.ts";
import { exportTribe } from "./export.ts";

// CLI playbook: pnpm playbook <list|new|check|export> ...

const ROOT = path.resolve(import.meta.dirname, "..");
const LOKASI = ["tribes", "examples"];

const usage = `Pemakaian:
  pnpm playbook list                       Daftar tribe dan cakupannya
  pnpm playbook new <id> [--nama "Nama"]   Buat tribe baru dari template
  pnpm playbook check <id> [--ketat]       Periksa satu tribe (--ketat: peringatan = gagal)
  pnpm playbook export <id>                Ekspor usulan.md ke Excel`;

function cariTribe(id: string) {
  for (const l of LOKASI) {
    const dir = path.join(ROOT, l, id);
    if (fs.existsSync(path.join(dir, "playbook.json"))) return dir;
  }
  console.error(`Tribe "${id}" tidak ditemukan di ${LOKASI.join(" atau ")}.`);
  process.exit(1);
}

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

const [perintah, id, ...sisa] = process.argv.slice(2);

switch (perintah) {
  case "list": {
    for (const l of LOKASI) {
      const base = path.join(ROOT, l);
      if (!fs.existsSync(base)) continue;
      for (const e of fs.readdirSync(base, { withFileTypes: true })) {
        if (!e.isDirectory() || !fs.existsSync(path.join(base, e.name, "playbook.json"))) continue;
        const h = checkTribe(path.join(base, e.name));
        const cakupan = h.adaWireframe
          ? `wireframe ${h.terpasang}/${h.jumlahEvent}, tur ${h.diTur}/${h.jumlahEvent}`
          : "katalog saja";
        console.log(`${l}/${e.name}: ${h.jumlahEvent} event, ${cakupan}, ${h.errors.length} error`);
      }
    }
    break;
  }
  case "new": {
    if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) {
      console.error("Id tribe harus huruf kecil, angka, dan tanda hubung, mis. pembelajaran.");
      process.exit(1);
    }
    const tujuan = path.join(ROOT, "tribes", id);
    if (fs.existsSync(tujuan)) {
      console.error(`tribes/${id} sudah ada.`);
      process.exit(1);
    }
    const iNama = sisa.indexOf("--nama");
    const nama = iNama >= 0 && sisa[iNama + 1] ? sisa[iNama + 1] : id;
    salinTemplate(path.join(ROOT, "templates", "tribe"), tujuan, { id, nama });
    console.log(`Tribe dibuat di tribes/${id}. Lanjutkan dengan skills/1-ingest-panduan/SKILL.md.`);
    break;
  }
  case "check": {
    if (!id) {
      console.error(usage);
      process.exit(1);
    }
    const h = checkTribe(cariTribe(id));
    const ketat = sisa.includes("--ketat");
    for (const t of h.info) console.log(`info: ${t}`);
    for (const t of h.warnings) console.log(`peringatan: ${t}`);
    for (const t of h.errors) console.log(`ERROR: ${t}`);
    console.log(
      `\n${id}: ${h.jumlahEvent} event` +
        (h.adaWireframe
          ? `, wireframe ${h.terpasang}/${h.jumlahEvent}, tur ${h.diTur}/${h.jumlahEvent}`
          : "") +
        `, ${h.errors.length} error, ${h.warnings.length} peringatan`,
    );
    if (h.errors.length > 0 || (ketat && h.warnings.length > 0)) process.exit(1);
    break;
  }
  case "export": {
    if (!id) {
      console.error(usage);
      process.exit(1);
    }
    const dir = cariTribe(id);
    const tujuan = path.join(dir, "export", `event-tracker-${id}.xlsx`);
    const n = await exportTribe(dir, tujuan);
    console.log(`${n} event diekspor ke ${path.relative(ROOT, tujuan)}`);
    break;
  }
  default:
    console.log(usage);
    if (perintah) process.exit(1);
}
