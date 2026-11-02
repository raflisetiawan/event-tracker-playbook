import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";
import { parseUsulan } from "./parse-usulan.ts";

// Plugin Vite:
// - `./usulan.md?usulan` → hasil parse markdown usulan (ikut reload saat file md diubah).
// - `/slides/<tribe>/slide-NNN.png` → gambar dari `<tribe>/guide/images` (dev: dilayani langsung,
//   build: hanya slide yang dirujuk event yang ikut disalin). Gambar bersifat opsional.

const QUERY = "?usulan";
const SLIDE = /^slide-\d{3}\.png$/;

export function usulanPlugin(options: { root: string; dirs: string[] }): Plugin {
  const tribeDirs = () =>
    options.dirs.flatMap((d) => {
      const base = path.join(options.root, d);
      if (!fs.existsSync(base)) return [];
      return fs
        .readdirSync(base, { withFileTypes: true })
        .filter((e) => e.isDirectory() && fs.existsSync(path.join(base, e.name, "usulan.md")))
        .map((e) => ({ id: e.name, dir: path.join(base, e.name) }));
    });
  const slideFile = (n: number) => `slide-${String(n).padStart(3, "0")}.png`;

  return {
    name: "playbook-usulan",

    load(id) {
      if (!id.endsWith(QUERY)) return;
      const file = id.slice(0, -QUERY.length);
      this.addWatchFile(file);
      return `export default ${JSON.stringify(parseUsulan(fs.readFileSync(file, "utf8")))};`;
    },

    configureServer(server) {
      server.middlewares.use("/slides", (req, res, next) => {
        const [tribeId, name] = (req.url ?? "").split("?")[0].split("/").filter(Boolean);
        const tribe = tribeDirs().find((t) => t.id === tribeId);
        if (!tribe || !name || !SLIDE.test(name)) return next();
        const file = path.join(tribe.dir, "guide", "images", name);
        if (!fs.existsSync(file)) return next();
        res.setHeader("Content-Type", "image/png");
        fs.createReadStream(file).pipe(res);
      });
    },

    generateBundle() {
      for (const tribe of tribeDirs()) {
        const data = parseUsulan(fs.readFileSync(path.join(tribe.dir, "usulan.md"), "utf8"));
        const slides = new Set(
          data.events.map((e) => e.slide).filter((n): n is number => n !== null),
        );
        for (const n of slides) {
          const file = path.join(tribe.dir, "guide", "images", slideFile(n));
          if (!fs.existsSync(file)) continue;
          this.emitFile({
            type: "asset",
            fileName: `slides/${tribe.id}/${slideFile(n)}`,
            source: fs.readFileSync(file),
          });
        }
      }
    },
  };
}
