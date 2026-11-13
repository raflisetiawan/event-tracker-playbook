import fs from "node:fs";
import path from "node:path";
import { checkTribe } from "./check.ts";
import { exportTribe } from "./export.ts";
import { npmSync } from "./npm.ts";
import { buatProject } from "./project.ts";

// CLI playbook: node cli/playbook.ts <list|new|check|export|verifikasi> ...

const ROOT = path.resolve(import.meta.dirname, "..");
const LOKASI = ["projects", "examples"];

const usage = `Pemakaian:
  node cli/playbook.ts list                       Daftar project dan cakupannya
  node cli/playbook.ts new <id> [--nama "Nama"]   Buat project baru dari template
  node cli/playbook.ts check <id> [--ketat]       Periksa satu project (--ketat: peringatan = gagal)
  node cli/playbook.ts export <id>                Ekspor usulan.md ke Excel
  node cli/playbook.ts verifikasi                 Format, lint, tipe, tes, dan build`;

function cariProject(id: string) {
  for (const l of LOKASI) {
    const dir = path.join(ROOT, l, id);
    if (fs.existsSync(path.join(dir, "playbook.json"))) return dir;
  }
  console.error(`Project "${id}" tidak ditemukan di ${LOKASI.join(" atau ")}.`);
  process.exit(1);
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
    if (!id) {
      console.error(usage);
      process.exit(1);
    }
    const iNama = sisa.indexOf("--nama");
    const nama = iNama >= 0 && sisa[iNama + 1] ? sisa[iNama + 1] : id;
    try {
      buatProject(ROOT, id, nama);
    } catch (e) {
      console.error(e instanceof Error ? e.message : e);
      process.exit(1);
    }
    console.log(
      `Project dibuat di projects/${id}. Upload bahan di halaman awal, lalu jalankan agent.`,
    );
    break;
  }
  case "check": {
    if (!id) {
      console.error(usage);
      process.exit(1);
    }
    const h = checkTribe(cariProject(id));
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
    const dir = cariProject(id);
    const tujuan = path.join(dir, "export", `event-tracker-${id}.xlsx`);
    const n = await exportTribe(dir, tujuan);
    console.log(`${n} event diekspor ke ${path.relative(ROOT, tujuan)}`);
    break;
  }
  case "verifikasi": {
    for (const args of [
      ["exec", "--", "vp", "check", "--fix"],
      ["run", "test"],
      ["run", "build"],
    ]) {
      const kode = npmSync(args);
      if (kode !== 0) process.exit(kode);
    }
    break;
  }
  default:
    console.log(usage);
    if (perintah) process.exit(1);
}
