import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { Plugin } from "vite-plus";
import { checkTribe } from "../../cli/check.ts";
import { ekstrakZip } from "../../cli/zip.ts";
import { PROGRAM_AGENT } from "../lib/agent.ts";
import { bacaTinjauan, simpanTinjauan } from "../../cli/tinjauan.ts";
import {
  adalahKategori,
  BATAS_UKURAN,
  buatProject,
  daftarProject,
  dirProject,
  ekstensiDiizinkan,
  ID_EXTENSION,
  namaFileAman,
  statusProject,
} from "../../cli/project.ts";

// API halaman awal. Hanya hidup di server dev (`npm run dev`), jadi file bahan tidak pernah sampai ke situs
// hasil build. Permintaan dari situs lain ditolak supaya tab asing tidak bisa menulis ke disk.

const BATAS_JSON = 64 * 1024;

function asalLokal(req: IncomingMessage) {
  const host = req.headers.host ?? "";
  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return false;
  const origin = req.headers.origin;
  if (origin) {
    // Perekam Alur Playbook boleh membaca daftar project dan mengirim rekaman; extension lain tidak.
    if (origin === `chrome-extension://${ID_EXTENSION}`) return true;
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  // Tanpa Origin (mis. GET biasa) hanya boleh membaca.
  return req.method === "GET";
}

async function bacaJson(req: IncomingMessage) {
  let teks = "";
  for await (const potongan of req) {
    teks += String(potongan);
    if (teks.length > BATAS_JSON) throw new Error("Isian terlalu panjang.");
  }
  return JSON.parse(teks) as Record<string, unknown>;
}

const teksDari = (nilai: unknown) => (typeof nilai === "string" ? nilai : "");

function kirim(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

/** Apakah program agent bisa dijalankan. Installer resmi Claude Code memasang ke ~/.local/bin. */
function terpasang(program: string) {
  const cari = process.platform === "win32" ? "where" : "which";
  if (spawnSync(cari, [program], { stdio: "ignore" }).status === 0) return true;
  const nama = process.platform === "win32" ? `${program}.exe` : program;
  return fs.existsSync(path.join(os.homedir(), ".local", "bin", nama));
}

/** Buka terminal baru di folder repo. Hanya membuka terminal; agent dijalankan pengguna. */
function bukaTerminal(root: string) {
  if (process.platform === "win32") {
    spawn("cmd", ["/c", `start "Event Tracker Playbook" /d "${root}" cmd`], {
      detached: true,
      stdio: "ignore",
      windowsVerbatimArguments: true,
    }).unref();
    return true;
  }
  if (process.platform === "darwin") {
    spawn("open", ["-a", "Terminal", root], { detached: true, stdio: "ignore" }).unref();
    return true;
  }
  return false;
}

export function apiPlugin(options: { root: string }): Plugin {
  const { root } = options;

  return {
    name: "playbook-api",
    configureServer(server) {
      server.middlewares.use("/api", (req, res) => {
        void (async () => {
          if (!asalLokal(req)) return kirim(res, 403, { error: "Hanya dari situs lokal ini." });
          const bagian = (req.url ?? "/")
            .split("?")[0]
            .split("/")
            .filter(Boolean)
            .map(decodeURIComponent);
          const [sumberDaya, id, sub, kategori, nama] = bagian;
          if (sumberDaya === "lingkungan" && req.method === "GET") {
            return kirim(res, 200, {
              root,
              pemisah: path.sep,
              platform: process.platform,
              agen: Object.fromEntries(PROGRAM_AGENT.map((p) => [p, terpasang(p)])),
            });
          }
          if (sumberDaya === "buka-terminal" && req.method === "POST") {
            return kirim(res, 200, { dibuka: bukaTerminal(root) });
          }
          if (sumberDaya !== "projects") return kirim(res, 404, { error: "Tidak ditemukan." });

          if (!id) {
            if (req.method === "GET") {
              return kirim(res, 200, {
                root,
                projects: daftarProject(root).map((p) => statusProject(root, p)),
              });
            }
            if (req.method === "POST") {
              const body = await bacaJson(req);
              const baru = teksDari(body.id);
              buatProject(root, baru, teksDari(body.nama).trim());
              return kirim(res, 201, statusProject(root, baru));
            }
            return kirim(res, 405, { error: "Metode tidak didukung." });
          }

          if (!daftarProject(root).includes(id)) {
            return kirim(res, 404, { error: `Project ${id} tidak ada.` });
          }
          const dirKerja = dirProject(root, id);
          const sumber = path.join(dirKerja, "sumber");

          if (sub === "periksa" && req.method === "GET") {
            return kirim(res, 200, checkTribe(dirKerja));
          }

          if (sub === "excel" && req.method === "GET") {
            // Dimuat saat dipakai: exceljs besar dan tidak perlu ikut setiap kali server menyala.
            const { exportTribe } = await import("../../cli/export.ts");
            const namaFile = `event-tracker-${id}.xlsx`;
            const tujuan = path.join(dirKerja, "export", namaFile);
            await exportTribe(dirKerja, tujuan);
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            );
            res.setHeader("Content-Disposition", `attachment; filename="${namaFile}"`);
            return void fs.createReadStream(tujuan).pipe(res);
          }

          if (sub === "tinjauan") {
            if (req.method === "GET" && !kategori) {
              return kirim(res, 200, bacaTinjauan(dirKerja));
            }
            if (req.method === "PUT" && kategori) {
              const body = await bacaJson(req);
              return kirim(
                res,
                200,
                simpanTinjauan(dirKerja, kategori, teksDari(body.status), teksDari(body.catatan)),
              );
            }
          }

          if (sub === "pertanyaan" && req.method === "PUT") {
            const body = await bacaJson(req);
            fs.mkdirSync(sumber, { recursive: true });
            fs.writeFileSync(path.join(sumber, "pertanyaan.md"), teksDari(body.teks));
            return kirim(res, 200, statusProject(root, id));
          }

          if (sub === "bahan" && kategori && nama) {
            const aman = namaFileAman(nama);
            if (!adalahKategori(kategori) || !aman) {
              return kirim(res, 400, { error: "Kategori atau nama file tidak valid." });
            }
            const folder = path.join(sumber, kategori);
            const file = path.join(folder, aman);
            const folderEkstrak = file.replace(/\.zip$/i, "");
            if (req.method === "DELETE") {
              fs.rmSync(file, { force: true });
              if (folderEkstrak !== file)
                fs.rmSync(folderEkstrak, { recursive: true, force: true });
              return kirim(res, 200, statusProject(root, id));
            }
            if (req.method === "PUT") {
              if (!ekstensiDiizinkan(kategori, aman)) {
                return kirim(res, 400, {
                  error: `Jenis file ${path.extname(aman)} tidak didukung.`,
                });
              }
              if (Number(req.headers["content-length"] ?? 0) > BATAS_UKURAN) {
                return kirim(res, 413, { error: "File lebih besar dari 100 MB." });
              }
              fs.mkdirSync(folder, { recursive: true });
              // Tulis ke file sementara agar upload yang putus tidak meninggalkan file rusak.
              const sementara = `${file}.upload`;
              let total = 0;
              try {
                await pipeline(
                  req,
                  async function* (sumberData) {
                    for await (const potongan of sumberData) {
                      total += (potongan as Buffer).length;
                      if (total > BATAS_UKURAN) throw new Error("File lebih besar dari 100 MB.");
                      yield potongan as Buffer;
                    }
                  },
                  fs.createWriteStream(sementara),
                );
                fs.renameSync(sementara, file);
                if (folderEkstrak !== file) {
                  // Isi ZIP dibuka di sebelahnya supaya agent bisa langsung membacanya.
                  fs.rmSync(folderEkstrak, { recursive: true, force: true });
                  try {
                    ekstrakZip(fs.readFileSync(file), folderEkstrak);
                  } catch (e) {
                    fs.rmSync(folderEkstrak, { recursive: true, force: true });
                    fs.rmSync(file, { force: true });
                    throw e;
                  }
                }
              } catch (e) {
                fs.rmSync(sementara, { force: true });
                throw e;
              }
              return kirim(res, 200, statusProject(root, id));
            }
          }
          return kirim(res, 405, { error: "Metode tidak didukung." });
        })().catch((e: unknown) => {
          if (!res.headersSent) {
            kirim(res, 400, { error: e instanceof Error ? e.message : "Permintaan gagal." });
          }
        });
      });
    },
  };
}
