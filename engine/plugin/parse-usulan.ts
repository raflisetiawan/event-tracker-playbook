// Parser `usulan.md` → data terstruktur untuk web dan CLI.
// Format dokumennya ada di templates/project/usulan.md. Sumber kebenaran tetap markdown.

export interface UsulanEvent {
  name: string;
  tahap: string;
  aktor: string;
  screenNames: string[];
  pemicu: string;
  atribut: string[];
  prio: "P0" | "P1" | "P2";
  questions: string[];
  status: string;
  slide: number | null;
  guidePath: string | null;
}

export interface UsulanQuestion {
  id: string;
  area: string;
  pertanyaan: string;
}

export interface UsulanScreen {
  name: string;
  halaman: string;
}

export interface UsulanAttribute {
  key: string;
  tipe: string;
  keterangan: string;
}

export interface UsulanData {
  status: string;
  events: UsulanEvent[];
  questions: UsulanQuestion[];
  screens: UsulanScreen[];
  attributes: UsulanAttribute[];
}

const codeTokens = (s: string) => [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
const stripMd = (s: string) => s.replace(/`/g, "").replace(/\*\*/g, "").trim();

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

const isSeparator = (line: string) => /^\|\s*:?-{3,}/.test(line.trim());

export function parseUsulan(md: string): UsulanData {
  const lines = md.split(/\r?\n/);
  const data: UsulanData = { status: "", events: [], questions: [], screens: [], attributes: [] };

  const statusMatch = md.match(/^status:\s*(.+)$/m);
  data.status = statusMatch?.[1].trim() ?? "";

  let h2 = "";
  let h3 = "";
  let aktor = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      h2 = line.slice(3).trim();
      h3 = "";
      continue;
    }
    if (line.startsWith("### ")) {
      h3 = line.slice(4).trim();
      aktor = "";
      continue;
    }
    if (line.startsWith("Aktor:")) {
      aktor = line.slice(6).trim().replace(/\.$/, "");
      continue;
    }
    // Baris data tabel: diawali "|" dan bukan header (header diikuti separator).
    if (!line.startsWith("|") || isSeparator(line) || isSeparator(lines[i + 1] ?? "")) continue;

    const cells = splitRow(line);

    if (h2 === "Event per tahap" && cells.length >= 8) {
      const [event, screen, pemicu, atribut, prio, q, status, panduan] = cells;
      const link = panduan.match(/\[slide (\d+)\]\(([^)]+)\)/);
      data.events.push({
        name: stripMd(event),
        tahap: h3,
        aktor,
        screenNames: codeTokens(screen),
        pemicu: stripMd(pemicu),
        atribut: codeTokens(atribut),
        prio: prio as UsulanEvent["prio"],
        questions: q.match(/Q-\d{2}/g) ?? [],
        status: stripMd(status),
        slide: link ? Number(link[1]) : null,
        guidePath: link ? link[2].replace(/^(\.\.\/)+/, "") : null,
      });
    } else if (h2 === "Pertanyaan perilaku yang ingin dijawab" && cells.length >= 3) {
      data.questions.push({ id: cells[0], area: cells[1], pertanyaan: cells[2] });
    } else if (h3 === "Daftar `screen_name`" && cells.length >= 2) {
      data.screens.push({ name: stripMd(cells[0]), halaman: cells[1] });
    } else if (h2 === "Kamus atribut" && cells.length >= 3) {
      data.attributes.push({ key: stripMd(cells[0]), tipe: cells[1], keterangan: cells[2] });
    }
  }

  return data;
}

export type EventTrigger = "page_load" | "click" | "submit" | "system";

/**
 * Aturan event_trigger: peringatan sistem = system; view_* = page_load; *_confirm atau pemicu
 * "setelah respons sukses" = submit; lainnya = click. Project bisa menambah pola submit lewat
 * `eventSubmitTambahan` di playbook.json.
 */
export function eventTrigger(
  e: Pick<UsulanEvent, "name" | "pemicu">,
  submitTambahan?: string,
): EventTrigger {
  if (e.pemicu.includes("event_trigger = system")) return "system";
  if (e.name.startsWith("view_")) return "page_load";
  if (
    /_confirm$/.test(e.name) ||
    /setelah respons (API )?sukses/.test(e.pemicu) ||
    (submitTambahan && new RegExp(submitTambahan).test(e.name))
  )
    return "submit";
  return "click";
}
