import { buatZip } from "./zip.js";

// Penulis XLSX minimal: beberapa sheet berisi teks dan angka, baris judul tebal dan dibekukan.
// Cukup untuk dibuka Excel, Google Sheets, dan LibreOffice tanpa pustaka tambahan.

const esc = (v) =>
  String(v ?? "")
    // Karakter kontrol tidak sah di XML.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const kolom = (i) => {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26))
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

function sel(nilai, ref, gaya) {
  const s = gaya ? ` s="${gaya}"` : "";
  if (typeof nilai === "number" && Number.isFinite(nilai))
    return `<c r="${ref}"${s}><v>${nilai}</v></c>`;
  return `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${esc(nilai)}</t></is></c>`;
}

function xmlSheet({ header, baris, lebar = [] }) {
  const semua = [header, ...baris];
  const isi = semua
    .map(
      (b, r) =>
        `<row r="${r + 1}">${b.map((v, c) => sel(v, `${kolom(c)}${r + 1}`, r === 0 ? 1 : 2)).join("")}</row>`,
    )
    .join("");
  const cols = header
    .map((_, i) => `<col min="${i + 1}" max="${i + 1}" width="${lebar[i] ?? 18}" customWidth="1"/>`)
    .join("");
  const akhir = `${kolom(header.length - 1)}${semua.length}`;
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    `<cols>${cols}</cols><sheetData>${isi}</sheetData>` +
    `<autoFilter ref="A1:${akhir}"/></worksheet>`
  );
}

/** sheets: [{ nama, header, baris, lebar? }] → Uint8Array file .xlsx */
export function buatXlsx(sheets) {
  const nsRel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const files = [
    {
      nama: "[Content_Types].xml",
      data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        sheets
          .map(
            (_, i) =>
              `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
          )
          .join("") +
        "</Types>",
    },
    {
      nama: "_rels/.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${nsRel}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      nama: "xl/workbook.xml",
      data:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${nsRel}"><sheets>` +
        sheets
          .map(
            (s, i) =>
              `<sheet name="${esc(s.nama.slice(0, 31))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
          )
          .join("") +
        "</sheets></workbook>",
    },
    {
      nama: "xl/_rels/workbook.xml.rels",
      data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        sheets
          .map(
            (_, i) =>
              `<Relationship Id="rId${i + 1}" Type="${nsRel}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
          )
          .join("") +
        `<Relationship Id="rId${sheets.length + 1}" Type="${nsRel}/styles" Target="styles.xml"/></Relationships>`,
    },
    {
      nama: "xl/styles.xml",
      data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts>' +
        '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F3864"/></patternFill></fill></fills>' +
        '<borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
        '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
        "</styleSheet>",
    },
    ...sheets.map((s, i) => ({ nama: `xl/worksheets/sheet${i + 1}.xml`, data: xmlSheet(s) })),
  ];
  return buatZip(files);
}
