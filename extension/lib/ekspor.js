import { ambilGambar, ambilRekaman, daftarLangkah } from "./db.js";
import {
  dataRekaman,
  markdownRekaman,
  namaExcel,
  namaGambar,
  namaPaket,
  tabelExcel,
} from "./rekam.js";
import { kotakSorot } from "./ui.js";
import { buatXlsx } from "./xlsx.js";
import { buatZip } from "./zip.js";

// Menyusun hasil rekaman: gambar dengan samaran dan kotak sorot yang sudah "dibakar", lalu ZIP.

/** Gambar final satu langkah: kotak hitam permanen di area yang disamarkan, kotak merah di elemen. */
export async function gambarFinal(l) {
  const blob = await ambilGambar(l.id);
  if (!blob) return null;
  const bmp = await createImageBitmap(blob);
  const kanvas = new OffscreenCanvas(bmp.width, bmp.height);
  const c = kanvas.getContext("2d");
  c.drawImage(bmp, 0, 0);
  c.fillStyle = "#000";
  for (const r of l.samaran)
    c.fillRect(r.x * bmp.width, r.y * bmp.height, r.w * bmp.width, r.h * bmp.height);
  const s = kotakSorot(l, bmp.width, bmp.height);
  if (s) {
    c.strokeStyle = "#dc2626";
    c.lineWidth = Math.max(3, Math.round(bmp.width / 400));
    c.strokeRect(
      s.x * bmp.width - 3,
      s.y * bmp.height - 3,
      s.w * bmp.width + 6,
      s.h * bmp.height + 6,
    );
  }
  return kanvas.convertToBlob({ type: "image/png" });
}

export async function siapkan(rekamanId) {
  const rekaman = await ambilRekaman(rekamanId);
  const langkah = await daftarLangkah(rekamanId);
  return { rekaman, langkah, data: dataRekaman(rekaman, langkah) };
}

export async function buatPaket(rekamanId) {
  const { rekaman, langkah, data } = await siapkan(rekamanId);
  const files = [
    { nama: "rekaman.json", data: `${JSON.stringify(data, null, 2)}\n` },
    { nama: "rekaman.md", data: markdownRekaman(data) },
  ];
  for (const [i, l] of langkah.entries()) {
    if (!l.adaGambar) continue;
    const g = await gambarFinal(l);
    if (g) files.push({ nama: namaGambar(i + 1), data: new Uint8Array(await g.arrayBuffer()) });
  }
  return {
    nama: namaPaket(rekaman.judul),
    blob: new Blob([buatZip(files)], { type: "application/zip" }),
  };
}

export async function buatExcel(rekamanId) {
  const { rekaman, data } = await siapkan(rekamanId);
  const blob = new Blob([buatXlsx(tabelExcel(data))], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  return { nama: namaExcel(rekaman.judul), blob };
}

/** Cari web playbook yang sedang jalan di komputer ini, beserta daftar project-nya. */
export async function cariPlaybook() {
  for (let port = 5173; port <= 5180; port++) {
    const base = `http://localhost:${port}`;
    try {
      const res = await fetch(`${base}/api/projects`, { signal: AbortSignal.timeout(800) });
      if (!res.ok) continue;
      const d = await res.json();
      if (Array.isArray(d.projects)) return { base, projects: d.projects };
    } catch {
      // port ini tidak menjalankan playbook
    }
  }
  return null;
}

export async function kirimKePlaybook(base, projectId, paket) {
  const res = await fetch(
    `${base}/api/projects/${projectId}/bahan/panduan/${encodeURIComponent(paket.nama)}`,
    { method: "PUT", body: paket.blob },
  );
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error ?? `Gagal mengirim (${res.status}).`);
}
