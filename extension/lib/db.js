// Penyimpanan rekaman di IndexedDB milik extension. Semua tetap di komputer ini.

const NAMA_DB = "perekam-playbook";

function buka() {
  return new Promise((ok, gagal) => {
    const req = indexedDB.open(NAMA_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore("rekaman", { keyPath: "id" });
      const s = db.createObjectStore("langkah", { keyPath: "id" });
      s.createIndex("rekamanId", "rekamanId");
      db.createObjectStore("gambar");
    };
    req.onsuccess = () => ok(req.result);
    req.onerror = () => gagal(req.error);
  });
}

async function transaksi(toko, mode, kerja) {
  const db = await buka();
  return new Promise((ok, gagal) => {
    const tx = db.transaction(toko, mode);
    let hasil;
    void Promise.resolve(kerja(tx)).then((h) => {
      hasil = h;
    }, gagal);
    tx.oncomplete = () => ok(hasil);
    tx.onerror = () => gagal(tx.error);
    tx.onabort = () => gagal(tx.error);
  });
}

const minta = (req) =>
  new Promise((ok, gagal) => {
    req.onsuccess = () => ok(req.result);
    req.onerror = () => gagal(req.error);
  });

export const idBaru = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const simpanRekaman = (r) =>
  transaksi("rekaman", "readwrite", (tx) => minta(tx.objectStore("rekaman").put(r)));

export const ambilRekaman = (id) =>
  transaksi("rekaman", "readonly", (tx) => minta(tx.objectStore("rekaman").get(id)));

export async function daftarRekaman() {
  const semua = await transaksi("rekaman", "readonly", (tx) =>
    minta(tx.objectStore("rekaman").getAll()),
  );
  return semua.sort((a, b) => b.dibuat.localeCompare(a.dibuat));
}

export async function daftarLangkah(rekamanId) {
  const semua = await transaksi("langkah", "readonly", (tx) =>
    minta(tx.objectStore("langkah").index("rekamanId").getAll(rekamanId)),
  );
  return semua.sort((a, b) => a.urutan - b.urutan);
}

export const simpanLangkah = (l) =>
  transaksi("langkah", "readwrite", (tx) => minta(tx.objectStore("langkah").put(l)));

export const simpanGambar = (id, blob) =>
  transaksi("gambar", "readwrite", (tx) => minta(tx.objectStore("gambar").put(blob, id)));

export const ambilGambar = (id) =>
  transaksi("gambar", "readonly", (tx) => minta(tx.objectStore("gambar").get(id)));

export const hapusLangkah = (id) =>
  transaksi(["langkah", "gambar"], "readwrite", (tx) => {
    tx.objectStore("langkah").delete(id);
    tx.objectStore("gambar").delete(id);
  });

export async function hapusRekaman(id) {
  for (const l of await daftarLangkah(id)) await hapusLangkah(l.id);
  await transaksi("rekaman", "readwrite", (tx) => minta(tx.objectStore("rekaman").delete(id)));
}
