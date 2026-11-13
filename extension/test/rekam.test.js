import { describe, expect, it } from "vite-plus/test";
import {
  daftarEvent,
  dataRekaman,
  markdownRekaman,
  namaPaket,
  POLA_NAMA_EVENT,
  samarkanPath,
  samarkanTeks,
  saranEvent,
  tabelExcel,
} from "../lib/rekam.js";
import { buatXlsx } from "../lib/xlsx.js";
import { buatZip, crc32 } from "../lib/zip.js";

describe("penyamaran", () => {
  it("menutup email, NIP, NIK, dan nomor HP", () => {
    expect(samarkanTeks("Kirim ke guru.a@sekolah.sch.id")).toBe("Kirim ke [disamarkan]");
    expect(samarkanTeks("NIP 198001012005011001")).toBe("NIP [disamarkan]");
    expect(samarkanTeks("NIP 19800101 200501 1 001")).toBe("NIP [disamarkan]");
    expect(samarkanTeks("NIK 3201010101010001")).toBe("NIK [disamarkan]");
    expect(samarkanTeks("Hubungi 0812-3456-7890")).toBe("Hubungi [disamarkan]");
    expect(samarkanTeks("Simpan draf")).toBe("Simpan draf");
  });

  it("membuang query dan ID dari path", () => {
    expect(samarkanPath("https://contoh.id/guru/198001012005011001/profil?email=a@b.id#x")).toBe(
      "/guru/:id/profil",
    );
    expect(samarkanPath("https://contoh.id/pengajuan/3f2b9c1e-8a7d-4e21-9c33-1a2b3c4d5e6f")).toBe(
      "/pengajuan/:id",
    );
    expect(samarkanPath("bukan url")).toBe("/");
  });
});

describe("saran event", () => {
  const dasar = {
    halaman: { path: "/pengajuan", judul: "Pengajuan BCKS" },
    elemen: { label: "Ajukan Sekarang", tag: "button" },
  };

  it("mengikuti konvensi nama playbook", () => {
    const klik = saranEvent({ ...dasar, jenis: "klik" });
    const kirim = saranEvent({ ...dasar, jenis: "kirim" });
    const buka = saranEvent({ ...dasar, jenis: "buka_halaman", elemen: null });
    const unduh = saranEvent({
      ...dasar,
      jenis: "unduh",
      elemen: { label: "Template.xlsx", tag: "a" },
    });
    expect(klik).toEqual({ nama: "click_ajukan_sekarang", tipe: "click" });
    expect(kirim).toEqual({ nama: "click_ajukan_sekarang_confirm", tipe: "submit" });
    expect(buka).toEqual({ nama: "view_pengajuan_bcks", tipe: "page_load" });
    expect(unduh.nama).toBe("download_template_xlsx");
    for (const e of [klik, kirim, buka, unduh]) expect(POLA_NAMA_EVENT.test(e.nama)).toBe(true);
  });

  it("tidak membawa teks yang disamarkan ke nama event", () => {
    const e = saranEvent({ ...dasar, jenis: "klik", elemen: { label: "[disamarkan]", tag: "a" } });
    expect(e.nama).toBe("click_a");
  });
});

describe("paket rekaman", () => {
  const rekaman = {
    judul: "Mengajukan BCKS",
    peran: "Guru",
    aplikasi: "https://staging.contoh.id",
    dibuat: "2026-11-06T03:00:00.000Z",
  };
  const langkah = [
    {
      jenis: "buka_halaman",
      halaman: { path: "/", judul: "Beranda" },
      adaGambar: true,
      narasi: "",
      event: { aktif: false },
    },
    {
      jenis: "kirim",
      halaman: { path: "/pengajuan", judul: "Pengajuan" },
      elemen: { tag: "button", role: "", label: "Kirim" },
      adaGambar: false,
      narasi: "Guru mengirim berkas.",
      event: { aktif: true, nama: "click_kirim_confirm", tipe: "submit", catatan: "" },
    },
  ];

  it("menomori langkah dan hanya membawa event yang ditandai", () => {
    const d = dataRekaman(rekaman, langkah);
    expect(d.langkah.map((l) => l.nomor)).toEqual([1, 2]);
    expect(d.langkah[0].gambar).toBe("gambar/langkah-001.png");
    expect(d.langkah[0].event).toBeNull();
    expect(d.langkah[1].event).toEqual({
      nama: "click_kirim_confirm",
      tipe: "submit",
      catatan: "",
    });
    const md = markdownRekaman(d);
    expect(md).toContain('<a id="langkah-2"></a>');
    expect(md).toContain("| 2 | `click_kirim_confirm` | submit |");
    expect(namaPaket(rekaman.judul)).toBe("rekaman-mengajukan-bcks.zip");
  });
});

describe("zip", () => {
  it("menghitung CRC32 standar", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });

  it("menulis direktori pusat dengan jumlah file yang benar", () => {
    const z = buatZip([
      { nama: "a.txt", data: "halo" },
      { nama: "gambar/b.bin", data: new Uint8Array([1, 2, 3]) },
    ]);
    const v = new DataView(z.buffer);
    expect(v.getUint32(0, true)).toBe(0x04034b50);
    expect(v.getUint32(z.length - 22, true)).toBe(0x06054b50);
    expect(v.getUint16(z.length - 12, true)).toBe(2);
  });
});

describe("daftar event dan Excel", () => {
  const data = {
    judul: "Dasbor eksekutif",
    peran: "",
    aplikasi: "https://staging.contoh.id",
    dibuat: "2026-11-13T00:00:00.000Z",
    deskripsi: "",
    langkah: [
      {
        nomor: 1,
        jenis: "buka_halaman",
        halaman: { path: "/beranda" },
        elemen: null,
        narasi: "",
        event: { nama: "view_beranda", tipe: "page_load", catatan: "" },
      },
      {
        nomor: 2,
        jenis: "klik",
        halaman: { path: "/dasbor" },
        elemen: { label: "Terapkan" },
        narasi: "Pilih filter",
        event: { nama: "click_terapkan", tipe: "click", catatan: "filter" },
      },
      {
        nomor: 3,
        jenis: "klik",
        halaman: { path: "/dasbor/2" },
        elemen: { label: "Terapkan" },
        narasi: "",
        event: { nama: "click_terapkan", tipe: "submit", catatan: "" },
      },
      {
        nomor: 4,
        jenis: "klik",
        halaman: { path: "/x" },
        elemen: { label: "Simpan" },
        narasi: "",
        event: { nama: "Simpan Data", tipe: "click", catatan: "" },
      },
      {
        nomor: 5,
        jenis: "isi",
        halaman: { path: "/x" },
        elemen: { label: "Nama" },
        narasi: "",
        event: null,
      },
    ],
  };

  it("menggabungkan event bernama sama dan memberi peringatan", () => {
    const e = daftarEvent(data);
    expect(e.map((x) => x.nama)).toEqual(["view_beranda", "click_terapkan", "Simpan Data"]);
    const terapkan = e[1];
    expect(terapkan.langkah).toEqual([2, 3]);
    expect(terapkan.halaman).toEqual(["/dasbor", "/dasbor/2"]);
    expect(terapkan.peringatan.join(" ")).toContain("tipe berbeda");
    expect(e[2].peringatan).toContain("nama tidak sesuai konvensi");
    expect(e[0].peringatan).toEqual([]);
  });

  it("menghasilkan XLSX dengan sheet dan isi yang benar", () => {
    const z = buatXlsx(tabelExcel(data));
    const teks = new TextDecoder().decode(z);
    expect(teks).toContain('<sheet name="Daftar Event"');
    expect(teks).toContain('<sheet name="Langkah"');
    expect(teks).toContain("click_terapkan");
    expect(teks).not.toMatch(/<t xml:space="preserve">[^<]*[<&][^<]*<\/t>/);
    expect(new DataView(z.buffer).getUint32(0, true)).toBe(0x04034b50);
  });
});
