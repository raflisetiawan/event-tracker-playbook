import { defineTribe } from "@engine/types.ts";
import meta from "./playbook.json";
import { tours } from "./tours.ts";
import usulan from "./usulan.md?usulan";
import { initialSim, type SimState } from "./wireframe/sim.ts";
import { Wireframe } from "./wireframe/Wireframe.tsx";

export default defineTribe<SimState>({
  ...meta,
  usulan,
  initialState: initialSim,
  tours,
  Wireframe,
  screenOf: (s) => s.screen,
  konteks: (s) => ({ user_role: s.peran, kode_wilayah: s.wilayah }),
  eventAwal: { name: "view_penugasan_reguler", attrs: { jumlah_riwayat: 3 } },
});
