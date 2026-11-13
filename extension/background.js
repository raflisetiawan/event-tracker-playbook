import {
  ambilRekaman,
  daftarLangkah,
  idBaru,
  simpanGambar,
  simpanLangkah,
  simpanRekaman,
} from "./lib/db.js";
import { saranEvent, samarkanPath, samarkanTeks } from "./lib/rekam.js";

// Pusat perekaman: menerima langkah dari content.js, mengambil screenshot, lalu menyimpannya.
// Status disimpan di storage.session karena service worker bisa dimatikan browser kapan saja.

const JEDA_SCREENSHOT = 600; // Chrome membatasi screenshot sekitar 2 kali per detik.
let screenshotTerakhir = 0;
let antrean = Promise.resolve();

chrome.runtime.onInstalled.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
chrome.runtime.onStartup.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

const bacaStatus = async () =>
  (await chrome.storage.session.get("status")).status ?? { merekam: false };
const tulisStatus = (status) => chrome.storage.session.set({ status });

const kabari = (pesan) => chrome.runtime.sendMessage(pesan).catch(() => {});

async function pasangPerekam(tabId) {
  await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
}

async function mulai({ tabId, judul, peran }) {
  const tab = await chrome.tabs.get(tabId);
  let aplikasi = "";
  try {
    aplikasi = new URL(tab.url).origin;
  } catch {
    // dibiarkan kosong
  }
  if (!/^https?:/.test(aplikasi))
    throw new Error("Halaman ini tidak bisa direkam. Buka web yang ingin direkam dulu.");
  const rekaman = {
    id: idBaru(),
    judul: samarkanTeks(judul).trim() || "Alur tanpa judul",
    peran: samarkanTeks(peran).trim(),
    deskripsi: "",
    aplikasi,
    dibuat: new Date().toISOString(),
  };
  await simpanRekaman(rekaman);
  await tulisStatus({ merekam: true, rekamanId: rekaman.id, tabId, urutan: 0 });
  await pasangPerekam(tabId);
  kabari({ jenis: "status-berubah" });
  return rekaman;
}

async function berhenti() {
  const status = await bacaStatus();
  await tulisStatus({ merekam: false, rekamanId: status.rekamanId });
  if (status.tabId)
    await chrome.tabs.sendMessage(status.tabId, { jenis: "berhenti" }).catch(() => {});
  kabari({ jenis: "status-berubah" });
}

async function screenshot(tabId) {
  const tab = await chrome.tabs.get(tabId);
  // Screenshot hanya bisa diambil dari tab yang sedang tampil.
  if (!tab.active) return { alasan: "tab yang direkam sedang tidak tampil" };
  const tunggu = screenshotTerakhir + JEDA_SCREENSHOT - Date.now();
  if (tunggu > 0) await new Promise((r) => setTimeout(r, tunggu));
  screenshotTerakhir = Date.now();
  // Halaman yang tampil harus memasang penutup dulu. Bila tidak menjawab (mis. sedang pindah
  // halaman), screenshot dilewati daripada menyimpan data yang tidak tertutup.
  const siap = await Promise.race([
    chrome.tabs.sendMessage(tabId, { jenis: "samarkan" }).catch(() => null),
    new Promise((r) => setTimeout(() => r(null), 3000)),
  ]);
  if (!siap?.ok) return { alasan: "halaman belum siap ditutupi (mungkin sedang pindah halaman)" };
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
    return { blob: await (await fetch(dataUrl)).blob() };
  } catch (e) {
    return { alasan: `browser menolak screenshot: ${e instanceof Error ? e.message : String(e)}` };
  } finally {
    await chrome.tabs.sendMessage(tabId, { jenis: "lepas" }).catch(() => {});
  }
}

async function catatLangkah(data, butuhGambar, tabId) {
  const status = await bacaStatus();
  if (!status.merekam || status.tabId !== tabId) return null;
  const urutan = status.urutan + 1;
  await tulisStatus({ ...status, urutan });

  const langkah = {
    id: idBaru(),
    rekamanId: status.rekamanId,
    urutan,
    waktu: new Date().toISOString(),
    jenis: data.jenis,
    halaman: { path: samarkanPath(data.url), judul: samarkanTeks(data.judul).slice(0, 120) },
    elemen: data.elemen
      ? { ...data.elemen, label: samarkanTeks(data.elemen.label).slice(0, 80) }
      : null,
    layar: data.layar ?? null,
    adaGambar: false,
    samaran: [],
    narasi: "",
  };
  langkah.event = { aktif: false, catatan: "", ...saranEvent(langkah) };

  if (butuhGambar) {
    const hasil = await screenshot(tabId);
    if (hasil.blob) {
      await simpanGambar(langkah.id, hasil.blob);
      langkah.adaGambar = true;
    } else {
      langkah.alasanTanpaGambar = hasil.alasan;
    }
  }
  await simpanLangkah(langkah);
  kabari({ jenis: "langkah-baru", rekamanId: status.rekamanId });
  return urutan;
}

/** Klik tombol kirim lalu form terkirim: cukup satu langkah, jenisnya diganti "kirim". */
async function jadikanKirim(tabId) {
  const status = await bacaStatus();
  if (!status.merekam || status.tabId !== tabId) return;
  const semua = await daftarLangkah(status.rekamanId);
  const terakhir = semua.at(-1);
  if (!terakhir || terakhir.jenis !== "klik") return;
  terakhir.jenis = "kirim";
  terakhir.event = { ...terakhir.event, ...saranEvent(terakhir) };
  await simpanLangkah(terakhir);
  kabari({ jenis: "langkah-baru", rekamanId: status.rekamanId });
}

chrome.runtime.onMessage.addListener((pesan, sender, balas) => {
  const kerja = async () => {
    switch (pesan.jenis) {
      case "status":
        return bacaStatus();
      case "mulai":
        return mulai(pesan);
      case "berhenti":
        return berhenti();
      case "langkah": {
        // Antrean menjaga urutan langkah saat klik berdekatan.
        const hasil = antrean.then(() =>
          catatLangkah(pesan.data, pesan.butuhGambar, sender.tab?.id),
        );
        antrean = hasil.catch(() => {});
        return hasil;
      }
      case "jadikan-kirim":
        antrean = antrean.then(() => jadikanKirim(sender.tab?.id)).catch(() => {});
        return antrean;
      case "rekaman":
        return ambilRekaman(pesan.id);
      default:
        return undefined;
    }
  };
  kerja().then(
    (hasil) => balas({ ok: true, hasil }),
    (e) => balas({ ok: false, error: e instanceof Error ? e.message : String(e) }),
  );
  return true;
});

// Halaman baru di tab yang direkam: pasang perekam lagi.
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status !== "complete") return;
  void bacaStatus().then((s) => {
    if (s.merekam && s.tabId === tabId) pasangPerekam(tabId).catch(() => {});
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void bacaStatus().then((s) => {
    if (s.merekam && s.tabId === tabId) void berhenti();
  });
});
