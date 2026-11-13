import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Menjalankan npm yang ikut terpasang bersama Node yang sedang dipakai, untuk `verifikasi`.

export const ROOT = path.resolve(import.meta.dirname, "..");

function npmCli() {
  const dir = path.dirname(process.execPath);
  return [
    path.join(dir, "node_modules/npm/bin/npm-cli.js"),
    path.join(dir, "../lib/node_modules/npm/bin/npm-cli.js"),
  ].find((p) => fs.existsSync(p));
}

function perintahNpm(args: string[]) {
  const cli = npmCli();
  return cli
    ? { cmd: process.execPath, args: [cli, ...args], shell: false }
    : { cmd: "npm", args, shell: process.platform === "win32" };
}

// Node yang sedang jalan ditaruh paling depan, supaya skrip npm memakai Node yang sama.
const envNpm = () => ({
  ...process.env,
  PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH ?? ""}`,
});

/** Jalankan npm sampai selesai dan kembalikan kode keluarnya. */
export function npmSync(args: string[]) {
  const p = perintahNpm(args);
  const hasil = spawnSync(p.cmd, p.args, {
    cwd: ROOT,
    stdio: "inherit",
    env: envNpm(),
    shell: p.shell,
  });
  return hasil.status ?? 1;
}
