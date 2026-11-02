import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import { eventTrigger, parseUsulan } from "../engine/plugin/parse-usulan.ts";

// Ekspor usulan.md ke Excel. Sheet Ringkasan memakai formula, jadi tetap benar bila sheet
// Daftar Event difilter atau disunting; file ini tetap salinan dari markdown.

const NAVY = "FF1F3864";
const PRIO_WARNA: Record<string, string> = { P0: "FFF8CBAD", P1: "FFFFE699", P2: "FFE7E6E6" };
const GARIS = { style: "thin", color: { argb: "FFD9D9D9" } } as const;
const BORDER = { top: GARIS, left: GARIS, bottom: GARIS, right: GARIS };
const FONT = { name: "Arial", size: 10 };

function tabel(
  wb: ExcelJS.Workbook,
  nama: string,
  header: string[],
  baris: unknown[][],
  lebar: number[],
) {
  const ws = wb.addWorksheet(nama, {
    views: [{ state: "frozen", ySplit: 1, showGridLines: false }],
  });
  ws.addRow(header);
  for (const b of baris) ws.addRow(b);
  ws.eachRow((row, r) => {
    row.eachCell({ includeEmpty: true }, (c) => {
      c.border = BORDER;
      c.font = r === 1 ? { ...FONT, bold: true, color: { argb: "FFFFFFFF" } } : FONT;
      c.alignment = { wrapText: true, vertical: r === 1 ? "middle" : "top" };
      if (r === 1) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    });
  });
  lebar.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: baris.length + 1, column: header.length },
  };
  return ws;
}

export async function exportTribe(dir: string, tujuan: string) {
  const data = parseUsulan(fs.readFileSync(path.join(dir, "usulan.md"), "utf8"));
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "playbook.json"), "utf8")) as {
    nama: string;
    eventSubmitTambahan?: string;
  };
  const trigger = (e: (typeof data.events)[number]) => eventTrigger(e, meta.eventSubmitTambahan);
  const wb = new ExcelJS.Workbook();

  // ---- Ringkasan: dibuat lebih dulu agar menjadi sheet pertama ----
  const rg = wb.addWorksheet("Ringkasan", { views: [{ showGridLines: false }] });
  const last = data.events.length + 1;
  const R = "'Daftar Event'!";
  const rentang = {
    tahap: `${R}$B$2:$B$${last}`,
    trigger: `${R}$G$2:$G$${last}`,
    prio: `${R}$I$2:$I$${last}`,
    status: `${R}$K$2:$K$${last}`,
  };
  let r = 1;
  rg.getCell(r, 1).value = `Event Tracker: ${meta.nama}`;
  rg.getCell(r, 1).font = { name: "Arial", size: 14, bold: true, color: { argb: NAVY } };
  r++;
  rg.getCell(r, 1).value =
    `Status: ${data.status || "-"}. Sumber: usulan.md. Semua event masih usulan.`;
  rg.getCell(r, 1).font = { ...FONT, color: { argb: "FF595959" } };
  r += 2;

  const judul = (labels: string[]) => {
    labels.forEach((l, i) => {
      const c = rg.getCell(r, i + 1);
      c.value = l;
      c.font = { ...FONT, bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
      c.alignment = { horizontal: i === 0 ? "left" : "center" };
      c.border = BORDER;
    });
    r++;
  };
  const isi = (col: number, value: ExcelJS.CellValue, bold = false) => {
    const c = rg.getCell(r, col);
    c.value = value;
    c.font = { ...FONT, bold };
    c.border = BORDER;
    c.alignment = { horizontal: col === 1 ? "left" : "center", wrapText: col === 1 };
  };
  const bagian = (label: string, nilai: string[], kolom: string, hitung: (v: string) => number) => {
    judul([label, "Jumlah"]);
    for (const v of nilai) {
      isi(1, v);
      isi(2, { formula: `COUNTIF(${kolom},A${r})`, result: hitung(v) });
      r++;
    }
    r++;
  };

  judul(["Total", "Jumlah"]);
  isi(1, "Semua event", true);
  isi(2, { formula: `COUNTA(${R}$D$2:$D$${last})`, result: data.events.length }, true);
  r += 2;
  bagian(
    "Status",
    [...new Set(data.events.map((e) => e.status))],
    rentang.status,
    (v) => data.events.filter((e) => e.status === v).length,
  );
  bagian(
    "event_trigger",
    ["page_load", "click", "submit", "system"],
    rentang.trigger,
    (v) => data.events.filter((e) => trigger(e) === v).length,
  );

  const hdr = r;
  judul(["Tahap", "P0", "P1", "P2", "Total"]);
  const pertama = r;
  for (const t of new Set(data.events.map((e) => e.tahap))) {
    isi(1, t);
    (["P0", "P1", "P2"] as const).forEach((p, i) => {
      const col = "BCD"[i];
      isi(i + 2, {
        formula: `COUNTIFS(${rentang.tahap},$A${r},${rentang.prio},${col}$${hdr})`,
        result: data.events.filter((e) => e.tahap === t && e.prio === p).length,
      });
    });
    isi(
      5,
      { formula: `SUM(B${r}:D${r})`, result: data.events.filter((e) => e.tahap === t).length },
      true,
    );
    r++;
  }
  isi(1, "Total", true);
  ["P0", "P1", "P2", null].forEach((p, i) => {
    const col = "BCDE"[i];
    isi(
      i + 2,
      {
        formula: `SUM(${col}${pertama}:${col}${r - 1})`,
        result: data.events.filter((e) => !p || e.prio === p).length,
      },
      true,
    );
  });
  rg.getColumn(1).width = 52;
  for (const c of [2, 3, 4, 5]) rg.getColumn(c).width = 10;

  // ---- Daftar Event ----
  const ev = tabel(
    wb,
    "Daftar Event",
    [
      "No",
      "Tahap",
      "Aktor",
      "Nama Event",
      "screen_name",
      "Pemicu",
      "event_trigger",
      "Atribut Khusus",
      "Prioritas",
      "Pertanyaan",
      "Status",
      "Slide",
      "Rujukan Panduan",
    ],
    data.events.map((e, i) => [
      i + 1,
      e.tahap,
      e.aktor,
      e.name,
      e.screenNames.join(", ") || "(halaman aktif)",
      e.pemicu,
      trigger(e),
      e.atribut.join(", ") || "-",
      e.prio,
      e.questions.join(", ") || "-",
      e.status,
      e.slide,
      e.guidePath ?? "",
    ]),
    [5, 26, 22, 50, 32, 42, 12, 38, 9, 11, 16, 7, 50],
  );
  ev.views = [{ state: "frozen", xSplit: 4, ySplit: 1, showGridLines: false }];
  for (let i = 2; i <= last; i++) {
    const c = ev.getCell(i, 9);
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: PRIO_WARNA[typeof c.value === "string" ? c.value : ""] ?? "FFFFFFFF" },
    };
    c.alignment = { horizontal: "center", vertical: "top" };
  }

  tabel(
    wb,
    "Pertanyaan Perilaku",
    ["ID", "Area", "Pertanyaan"],
    data.questions.map((q) => [q.id, q.area, q.pertanyaan]),
    [8, 26, 100],
  );
  tabel(
    wb,
    "Daftar screen_name",
    ["screen_name", "Halaman"],
    data.screens.map((s) => [s.name, s.halaman]),
    [48, 42],
  );
  tabel(
    wb,
    "Kamus Atribut",
    ["Key", "Tipe", "Keterangan"],
    data.attributes.map((a) => [a.key, a.tipe, a.keterangan]),
    [30, 10, 90],
  );

  fs.mkdirSync(path.dirname(tujuan), { recursive: true });
  await wb.xlsx.writeFile(tujuan);
  return data.events.length;
}
