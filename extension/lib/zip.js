// Penulis ZIP sederhana tanpa kompresi. Gambar PNG sudah terkompresi, jadi ukurannya hampir sama
// dengan ZIP biasa, dan extension tidak butuh pustaka atau langkah build.

const TABEL_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(data) {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = TABEL_CRC[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function waktuDos(d) {
  return {
    jam: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    tanggal: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

/** files: [{ nama, data: Uint8Array | string }] → Uint8Array berisi file ZIP. */
export function buatZip(files, waktu = new Date()) {
  const enc = new TextEncoder();
  const { jam, tanggal } = waktuDos(waktu);
  const lokal = [];
  const pusat = [];
  let offset = 0;
  for (const f of files) {
    const nama = enc.encode(f.nama);
    const data = typeof f.data === "string" ? enc.encode(f.data) : f.data;
    const crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x0800, true); // nama file UTF-8
    h.setUint16(8, 0, true); // tanpa kompresi
    h.setUint16(10, jam, true);
    h.setUint16(12, tanggal, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true);
    h.setUint32(22, data.length, true);
    h.setUint16(26, nama.length, true);
    lokal.push(new Uint8Array(h.buffer), nama, data);

    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true);
    c.setUint16(12, jam, true);
    c.setUint16(14, tanggal, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, nama.length, true);
    c.setUint32(42, offset, true);
    pusat.push(new Uint8Array(c.buffer), nama);
    offset += 30 + nama.length + data.length;
  }
  const ukuranPusat = pusat.reduce((n, b) => n + b.length, 0);
  const akhir = new DataView(new ArrayBuffer(22));
  akhir.setUint32(0, 0x06054b50, true);
  akhir.setUint16(8, files.length, true);
  akhir.setUint16(10, files.length, true);
  akhir.setUint32(12, ukuranPusat, true);
  akhir.setUint32(16, offset, true);
  const bagian = [...lokal, ...pusat, new Uint8Array(akhir.buffer)];
  const hasil = new Uint8Array(bagian.reduce((n, b) => n + b.length, 0));
  let p = 0;
  for (const b of bagian) {
    hasil.set(b, p);
    p += b.length;
  }
  return hasil;
}
