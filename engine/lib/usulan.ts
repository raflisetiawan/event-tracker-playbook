import { eventTrigger, type UsulanData, type UsulanEvent } from "../plugin/parse-usulan.ts";

export type { UsulanEvent };

/** Indeks satu project atau contoh: pencarian event/pertanyaan/atribut dan URL gambar slide. */
export function createIndex(tribe: {
  id: string;
  usulan: UsulanData;
  eventSubmitTambahan?: string;
}) {
  return {
    eventsByName: new Map(tribe.usulan.events.map((e) => [e.name, e])),
    questionsById: new Map(tribe.usulan.questions.map((q) => [q.id, q])),
    attributesByKey: new Map(tribe.usulan.attributes.map((a) => [a.key, a])),
    trigger: (e: UsulanEvent) => eventTrigger(e, tribe.eventSubmitTambahan),
    slideUrl: (n: number) => `/slides/${tribe.id}/slide-${String(n).padStart(3, "0")}.png`,
  };
}

export type UsulanIndex = ReturnType<typeof createIndex>;

export const prioClass: Record<UsulanEvent["prio"], string> = {
  P0: "bg-red-100 text-red-800",
  P1: "bg-amber-100 text-amber-800",
  P2: "bg-slate-200 text-slate-700",
};

export function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) out[key(item)] = (out[key(item)] ?? 0) + 1;
  return out;
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

/** Isi popover Driver.js (HTML string) untuk satu event. */
export function popoverHtml(index: UsulanIndex, e: UsulanEvent | undefined, catatan?: string) {
  if (!e) return `<p style="color:#b91c1c">Event tidak ditemukan di dokumen usulan.</p>`;
  const chip = (t: string, bg: string, fg: string) =>
    `<span style="display:inline-block;padding:1px 8px;border-radius:999px;background:${bg};color:${fg};font-size:11px;font-weight:600;margin:0 4px 4px 0">${escapeHtml(t)}</span>`;
  const atribut = e.atribut.length
    ? e.atribut
        .map(
          (a) =>
            `<code style="font-size:11px;background:#f1f5f9;padding:1px 4px;border-radius:4px">${escapeHtml(a)}</code>`,
        )
        .join(" ")
    : "—";
  return [
    `<div style="margin-bottom:6px">`,
    chip(e.prio, e.prio === "P0" ? "#fee2e2" : e.prio === "P1" ? "#fef3c7" : "#e2e8f0", "#0f172a"),
    chip(index.trigger(e), "#dbeafe", "#1e3a8a"),
    chip(e.status, "#f1f5f9", "#334155"),
    `</div>`,
    `<p style="margin:0 0 6px">${escapeHtml(e.pemicu)}</p>`,
    `<p style="margin:0 0 4px;font-size:12px;color:#475569"><b>Atribut:</b> ${atribut}</p>`,
    `<p style="margin:0;font-size:12px;color:#475569"><b>Menjawab:</b> ${escapeHtml(e.questions.join(", ") || "—")}</p>`,
    catatan
      ? `<p style="margin:6px 0 0;font-size:12px;color:#92400e">${escapeHtml(catatan)}</p>`
      : "",
  ].join("");
}
