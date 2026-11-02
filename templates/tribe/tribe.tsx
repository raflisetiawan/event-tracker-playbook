import { defineTribe } from "@engine/types.ts";
import meta from "./playbook.json";
import { tours } from "./tours.ts";
import usulan from "./usulan.md?usulan";
import { initialState, type State } from "./wireframe/state.ts";
import { Wireframe } from "./wireframe/Wireframe.tsx";

// Untuk katalog saja: hapus folder wireframe/ dan tours.ts, lalu sisakan id, nama, dan usulan.
export default defineTribe<State>({
  ...meta,
  usulan,
  initialState,
  tours,
  Wireframe,
  screenOf: (s) => s.screen,
  konteks: (s) => ({ user_role: s.peran }),
  eventAwal: { name: "view_beranda" },
});
