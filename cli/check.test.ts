import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { eventTrigger, parseUsulan } from "../engine/plugin/parse-usulan.ts";
import { cariPii, checkTribe, periksaUsulan } from "./check.ts";
import { ekstensiDiizinkan, namaFileAman } from "./project.ts";
import { ekstrakZip } from "./zip.ts";
// @ts-expect-error modul JavaScript extension tanpa deklarasi tipe
import { buatZip } from "../extension/lib/zip.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const TEMPLATE = fs.readFileSync(path.join(ROOT, "templates/project/usulan.md"), "utf8");

describe("parseUsulan", () => {
  it("membaca template project", () => {
    const d = parseUsulan(TEMPLATE);
    expect(d.events.map((e) => e.name)).toEqual(["view_beranda"]);
    expect(d.questions).toHaveLength(1);
    expect(d.screens[0].name).toBe("beranda");
    expect(d.attributes.map((a) => a.key)).toContain("user_role");
  });

  it("membaca contoh KSPS sesuai jumlah di dokumennya", () => {
    const d = parseUsulan(fs.readFileSync(path.join(ROOT, "examples/ksps/usulan.md"), "utf8"));
    expect(d.events).toHaveLength(104);
    expect(d.events.filter((e) => e.prio === "P0")).toHaveLength(43);
  });
});

describe("eventTrigger", () => {
  it("mengikuti aturan pemicu", () => {
    expect(eventTrigger({ name: "view_a", pemicu: "" })).toBe("page_load");
    expect(eventTrigger({ name: "view_a", pemicu: "(event_trigger = system)" })).toBe("system");
    expect(eventTrigger({ name: "click_a_confirm", pemicu: "" })).toBe("submit");
    expect(eventTrigger({ name: "click_a", pemicu: "" })).toBe("click");
    expect(eventTrigger({ name: "click_a_kirim", pemicu: "" }, "_kirim$")).toBe("submit");
  });
});

describe("periksaUsulan", () => {
  it("menolak nama, atribut, dan pertanyaan yang tidak dikenal", () => {
    const rusak = TEMPLATE.replace("`view_beranda`", "`Lihat-Beranda`").replace(
      "| Q-01 | P0",
      "| Q-99 | P0",
    );
    const { errors } = periksaUsulan(rusak);
    expect(errors.some((e) => e.includes("nama harus"))).toBe(true);
  });

  it("menangkap ringkasan yang tidak cocok dengan tabel", () => {
    const { errors } = periksaUsulan(TEMPLATE.replace("**1 event**", "**5 event**"));
    expect(errors.some((e) => e.includes("ringkasan menyebut 5"))).toBe(true);
  });
});

describe("cariPii", () => {
  it("menemukan email asli dan NIP, tetapi membiarkan domain contoh", () => {
    expect(cariPii("a@contoh.id")).toEqual([]);
    expect(cariPii("budi@sekolah.sch.id")).toHaveLength(1);
    expect(cariPii("NIP 198501012010011001")).toHaveLength(1);
    expect(cariPii("NPSN 20500014")).toEqual([]);
  });
});

describe("checkTribe", () => {
  it("contoh KSPS lolos dengan cakupan penuh", () => {
    const h = checkTribe(path.join(ROOT, "examples/ksps"));
    expect(h.errors).toEqual([]);
    expect(h.terpasang).toBe(104);
    expect(h.diTur).toBe(104);
  });
});

describe("nama file upload", () => {
  it("menolak path dan karakter terlarang", () => {
    expect(namaFileAman("panduan produk.pdf")).toBe("panduan produk.pdf");
    expect(namaFileAman("../rahasia.pdf")).toBeNull();
    expect(namaFileAman("..\\rahasia.pdf")).toBeNull();
    expect(namaFileAman("C:evil.pdf")).toBeNull();
    expect(namaFileAman(".env")).toBeNull();
  });

  it("hanya menerima ekstensi sesuai kategori", () => {
    expect(ekstensiDiizinkan("panduan", "a.PDF")).toBe(true);
    expect(ekstensiDiizinkan("panduan", "a.exe")).toBe(false);
    expect(ekstensiDiizinkan("tracker", "a.pdf")).toBe(false);
  });
});

describe("ekstrak ZIP", () => {
  const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "zip-uji-"));

  it("membuka ZIP dari extension, termasuk subfolder", () => {
    const dir = tmp();
    const zip = Buffer.from(
      buatZip([
        { nama: "rekaman.md", data: "# Uji" },
        { nama: "gambar/langkah-001.png", data: new Uint8Array([1, 2, 3]) },
      ]),
    );
    ekstrakZip(zip, path.join(dir, "rekaman"));
    expect(fs.readFileSync(path.join(dir, "rekaman", "rekaman.md"), "utf8")).toBe("# Uji");
    expect([...fs.readFileSync(path.join(dir, "rekaman", "gambar", "langkah-001.png"))]).toEqual([
      1, 2, 3,
    ]);
  });

  it("menolak path yang keluar dari folder tujuan", () => {
    const dir = tmp();
    const zip = Buffer.from(buatZip([{ nama: "../jahat.txt", data: "x" }]));
    expect(() => ekstrakZip(zip, path.join(dir, "rekaman"))).toThrow(/tidak diizinkan/);
    expect(fs.existsSync(path.join(dir, "jahat.txt"))).toBe(false);
  });
});
