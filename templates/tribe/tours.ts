import type { Tour } from "@engine/types.ts";
import type { State } from "./wireframe/state.ts";

export const tours: Tour<State>[] = [
  {
    id: "beranda",
    title: "Beranda",
    description: "Contoh tur satu langkah. Ganti dengan alur prioritas tribe ini.",
    questions: ["Q-01"],
    steps: [{ event: "view_beranda", target: "page-beranda", sim: { screen: "beranda" } }],
  },
];
