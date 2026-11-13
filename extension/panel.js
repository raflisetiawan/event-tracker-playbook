import { ambilRekaman, daftarLangkah, daftarRekaman } from "./lib/db.js";
import { h, kartuLangkah } from "./lib/ui.js";

// Panel samping: mulai dan hentikan rekaman, lalu isi narasi dan tandai event sambil merekam.

const $ = (id) => document.getElementById(id);
const kirim = async (pesan) => {
  const j = await chrome.runtime.sendMessage(pesan);
  if (!j?.ok) throw new Error(j?.error ?? "Gagal.");
  return j.hasil;
};

let rekamanTampil = null;
const kartuTampil = new Map();

const bukaTinjau = (id) =>
  chrome.tabs.create({ url: chrome.runtime.getURL(`tinjau.html?id=${id}`) });

async function tampilkanLangkah() {
  const wadah = $("langkah");
  if (!rekamanTampil) {
    wadah.replaceChildren();
    kartuTampil.clear();
    return;
  }
  const semua = await daftarLangkah(rekamanTampil);
  const ada = new Set(semua.map((l) => l.id));
  for (const [id, el] of kartuTampil) {
    if (!ada.has(id)) {
      el.remove();
      kartuTampil.delete(id);
    }
  }
  // Langkah baru ditambahkan tanpa membangun ulang yang lama, supaya narasi yang sedang diketik
  // tidak hilang. Langkah terbaru tampil paling atas.
  semua.forEach((l, i) => {
    if (kartuTampil.has(l.id)) return;
    const el = kartuLangkah(l, i + 1, { onHapus: () => void tampilkanLangkah() });
    kartuTampil.set(l.id, el);
    wadah.prepend(el);
  });
  // Perbarui nomor, mis. setelah ada langkah yang dihapus.
  semua.forEach((l, i) => {
    const strong = kartuTampil.get(l.id).querySelector("header strong");
    strong.textContent = strong.textContent.replace(/^\d+\./, `${i + 1}.`);
  });
}

async function tampilkanDaftar() {
  const wadah = $("daftar-rekaman");
  const semua = await daftarRekaman();
  wadah.replaceChildren(
    ...(semua.length === 0
      ? [h("p", { class: "redup" }, "Belum ada rekaman.")]
      : semua.map((r) =>
          h(
            "div",
            { class: "baris" },
            h(
              "span",
              { style: "flex:1" },
              r.judul,
              h("br"),
              h("span", { class: "redup" }, new Date(r.dibuat).toLocaleString("id-ID")),
            ),
            h("button", { onClick: () => bukaTinjau(r.id) }, "Buka"),
          ),
        )),
  );
}

async function segarkan() {
  const status = await kirim({ jenis: "status" });
  $("form-mulai").hidden = status.merekam;
  $("sedang-rekam").hidden = !status.merekam;
  if (status.merekam) {
    const r = await ambilRekaman(status.rekamanId);
    $("judul-aktif").textContent = `● Merekam: ${r?.judul ?? ""}`;
    if (rekamanTampil !== status.rekamanId) {
      rekamanTampil = status.rekamanId;
      $("langkah").replaceChildren();
      kartuTampil.clear();
    }
  } else {
    rekamanTampil = null;
  }
  await tampilkanLangkah();
  await tampilkanDaftar();
}

$("mulai").addEventListener("click", async () => {
  $("pesan-mulai").textContent = "";
  try {
    // Izin diminta saat pertama dipakai, supaya extension tidak membaca web lain tanpa diminta.
    const diizinkan = await chrome.permissions.request({ origins: ["<all_urls>"] });
    if (!diizinkan) throw new Error("Izin dibutuhkan untuk merekam halaman.");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("Tidak ada tab yang aktif.");
    await kirim({
      jenis: "mulai",
      tabId: tab.id,
      judul: $("judul").value,
      peran: $("peran").value,
    });
    $("judul").value = "";
    $("peran").value = "";
  } catch (e) {
    $("pesan-mulai").textContent = e instanceof Error ? e.message : String(e);
  }
  await segarkan();
});

$("berhenti").addEventListener("click", async () => {
  const id = rekamanTampil;
  await kirim({ jenis: "berhenti" });
  await segarkan();
  if (id) await bukaTinjau(id);
});

$("tinjau-aktif").addEventListener("click", () => {
  if (rekamanTampil) void bukaTinjau(rekamanTampil);
});

chrome.runtime.onMessage.addListener((pesan) => {
  if (pesan?.jenis === "langkah-baru" && pesan.rekamanId === rekamanTampil) void tampilkanLangkah();
  if (pesan?.jenis === "status-berubah") void segarkan();
});

void segarkan();
