// Logika murni perekam: penyamaran teks, saran nama event, dan isi rekaman.md.
// Tidak memakai API browser supaya bisa diuji dengan `npm test`.

export const FORMAT = "rekaman-playbook";
export const VERSI_FORMAT = 1;

// Pola data pribadi yang bisa dikenali dari teks. Nama orang tidak bisa dikenali otomatis.
export const POLA_PII = [
  /[\w.+-]+@[\w-]+(\.[\w-]+)+/g,
  /(?<![\d])\d{16,18}(?![\d])/g,
  /(?<![\d])(\+62|62|08)[\d -]{8,14}\d(?![\d])/g,
  /(?<![\d])\d{8}\s\d{6}\s\d\s\d{3}(?![\d])/g,
];

export const SAMARAN = "[disamarkan]";

/** Ganti teks yang mirip email, NIP, NIK, atau nomor HP. */
export function samarkanTeks(teks) {
  let hasil = String(teks ?? "");
  for (const pola of POLA_PII) hasil = hasil.replace(pola, SAMARAN);
  return hasil;
}

/** Path tanpa query dan hash; potongan berisi angka panjang atau ID acak diganti `:id`. */
export function samarkanPath(url) {
  let path;
  try {
    path = new URL(url).pathname;
  } catch {
    return "/";
  }
  return (
    path
      .split("/")
      .map((p) => (/\d{5,}/.test(p) || /^[0-9a-f-]{20,}$/i.test(p) || p.includes("@") ? ":id" : p))
      .join("/") || "/"
  );
}

/** Ubah teks bebas menjadi potongan nama event: huruf kecil, angka, garis bawah. */
export function slug(teks, maks = 40) {
  const s = String(teks ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\[disamarkan\]/g, " ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return s.slice(0, maks).replace(/_+$/g, "");
}

/** Saran event untuk satu langkah, mengikuti konvensi playbook. Pengguna tetap bisa mengubahnya. */
export function saranEvent(langkah) {
  const label = slug(langkah.elemen?.label) || slug(langkah.elemen?.tag) || "elemen";
  const halaman =
    slug(langkah.halaman?.judul, 30) ||
    slug(langkah.halaman?.path?.replace(/:id/g, ""), 30) ||
    "halaman";
  if (langkah.jenis === "buka_halaman") return { nama: `view_${halaman}`, tipe: "page_load" };
  if (langkah.jenis === "kirim") return { nama: `click_${label}_confirm`, tipe: "submit" };
  if (langkah.jenis === "unduh") return { nama: `download_${label}`, tipe: "click" };
  return { nama: `click_${label}`, tipe: "click" };
}

export const POLA_NAMA_EVENT = /^(view|click|download)_[a-z0-9_]+$/;
export const TIPE_EVENT = ["page_load", "click", "submit", "system"];

const JUDUL_JENIS = {
  buka_halaman: "Buka halaman",
  klik: "Klik",
  isi: "Isi",
  kirim: "Kirim",
  unduh: "Unduh",
};

/** Kalimat singkat untuk satu langkah, dipakai bila narasi kosong. */
export function ringkasLangkah(l) {
  const label = l.elemen?.label ? `"${l.elemen.label}"` : "";
  if (l.jenis === "buka_halaman")
    return `Buka halaman ${l.halaman?.judul || l.halaman?.path || ""}`.trim();
  return `${JUDUL_JENIS[l.jenis] ?? l.jenis} ${label}`.trim();
}

export const namaGambar = (nomor) => `gambar/langkah-${String(nomor).padStart(3, "0")}.png`;

/** Data rekaman.json: semua langkah tanpa gambar, dengan nomor urut. */
export function dataRekaman(rekaman, langkah) {
  return {
    format: FORMAT,
    versi: VERSI_FORMAT,
    judul: rekaman.judul,
    peran: rekaman.peran || "",
    deskripsi: rekaman.deskripsi || "",
    aplikasi: rekaman.aplikasi || "",
    dibuat: rekaman.dibuat,
    langkah: langkah.map((l, i) => ({
      nomor: i + 1,
      jenis: l.jenis,
      halaman: l.halaman,
      elemen: l.elemen ?? null,
      layar: l.layar ?? null,
      gambar: l.adaGambar ? namaGambar(i + 1) : null,
      narasi: l.narasi || "",
      event: l.event?.aktif
        ? { nama: l.event.nama, tipe: l.event.tipe, catatan: l.event.catatan || "" }
        : null,
    })),
  };
}

/** rekaman.md: versi yang enak dibaca manusia dan agent. */
export function markdownRekaman(data) {
  const baris = [
    `# ${data.judul}`,
    "",
    `Rekaman alur dari ${data.aplikasi || "aplikasi"}${data.peran ? `, sebagai **${data.peran}**` : ""}.`,
    `Dibuat ${data.dibuat}. ${data.langkah.length} langkah.`,
    "",
  ];
  if (data.deskripsi) baris.push(data.deskripsi, "");
  const event = data.langkah.filter((l) => l.event);
  if (event.length > 0) {
    baris.push(
      "## Event yang ditandai perekam",
      "",
      "| Langkah | Event | Tipe | Catatan |",
      "| --- | --- | --- | --- |",
    );
    for (const l of event) {
      baris.push(
        `| ${l.nomor} | \`${l.event.nama}\` | ${l.event.tipe} | ${l.event.catatan.replace(/\|/g, "/")} |`,
      );
    }
    baris.push("");
  }
  baris.push("## Langkah", "");
  for (const l of data.langkah) {
    baris.push(`<a id="langkah-${l.nomor}"></a>`, "", `### ${l.nomor}. ${ringkasLangkah(l)}`, "");
    baris.push(`- Halaman: \`${l.halaman?.path ?? "/"}\` (${l.halaman?.judul ?? ""})`);
    if (l.elemen)
      baris.push(
        `- Elemen: ${l.elemen.tag}${l.elemen.role ? ` (${l.elemen.role})` : ""}, label "${l.elemen.label}"`,
      );
    if (l.event) baris.push(`- Event: \`${l.event.nama}\` (${l.event.tipe})`);
    baris.push("");
    if (l.narasi) baris.push(l.narasi, "");
    if (l.gambar) baris.push(`![Langkah ${l.nomor}](${l.gambar})`, "");
  }
  return baris.join("\n");
}

/**
 * Daftar event unik dari rekaman: satu baris per nama event, dengan nomor langkah tempat event
 * itu ditandai. Peringatan menandai nama yang tidak sesuai konvensi atau tipe yang berbeda-beda.
 */
export function daftarEvent(data) {
  const peta = new Map();
  for (const l of data.langkah) {
    if (!l.event) continue;
    const e = peta.get(l.event.nama) ?? {
      nama: l.event.nama,
      tipe: l.event.tipe,
      tipeLain: new Set(),
      langkah: [],
      halaman: new Set(),
      elemen: l.elemen?.label ?? "",
      catatan: [],
      narasi: l.narasi || "",
    };
    if (l.event.tipe !== e.tipe) e.tipeLain.add(l.event.tipe);
    e.langkah.push(l.nomor);
    e.halaman.add(l.halaman?.path ?? "/");
    if (l.event.catatan) e.catatan.push(l.event.catatan);
    peta.set(e.nama, e);
  }
  return [...peta.values()].map((e) => {
    const peringatan = [];
    if (!POLA_NAMA_EVENT.test(e.nama)) peringatan.push("nama tidak sesuai konvensi");
    if (e.tipeLain.size > 0) peringatan.push(`tipe berbeda: ${[e.tipe, ...e.tipeLain].join(", ")}`);
    if (e.tipe === "page_load" && !e.nama.startsWith("view_"))
      peringatan.push("page_load sebaiknya view_");
    if (e.tipe === "submit" && !e.nama.endsWith("_confirm"))
      peringatan.push("submit sebaiknya diakhiri _confirm");
    return {
      nama: e.nama,
      tipe: e.tipe,
      langkah: e.langkah,
      halaman: [...e.halaman],
      elemen: e.elemen,
      catatan: e.catatan.join("; "),
      narasi: e.narasi,
      peringatan,
    };
  });
}

/** Isi sheet Excel: daftar event unik dan semua langkah. */
export function tabelExcel(data) {
  const event = daftarEvent(data);
  return [
    {
      nama: "Daftar Event",
      header: [
        "No",
        "event_name",
        "event_trigger",
        "Halaman",
        "Elemen",
        "Langkah",
        "Catatan",
        "Narasi",
        "Perlu dicek",
      ],
      lebar: [5, 38, 13, 34, 26, 10, 30, 40, 30],
      baris: event.map((e, i) => [
        i + 1,
        e.nama,
        e.tipe,
        e.halaman.join(", "),
        e.elemen,
        e.langkah.join(", "),
        e.catatan,
        e.narasi,
        e.peringatan.join("; "),
      ]),
    },
    {
      nama: "Langkah",
      header: ["No", "Jenis", "Halaman", "Judul halaman", "Elemen", "Event", "Narasi"],
      lebar: [5, 14, 34, 30, 26, 36, 40],
      baris: data.langkah.map((l) => [
        l.nomor,
        l.jenis,
        l.halaman?.path ?? "",
        l.halaman?.judul ?? "",
        l.elemen?.label ?? "",
        l.event?.nama ?? "",
        l.narasi,
      ]),
    },
    {
      nama: "Info",
      header: ["Kolom", "Isi"],
      lebar: [18, 70],
      baris: [
        ["Judul alur", data.judul],
        ["Aplikasi", data.aplikasi],
        ["Peran", data.peran],
        ["Dibuat", data.dibuat],
        ["Deskripsi", data.deskripsi],
        [
          "Catatan",
          "Nama event disarankan otomatis dari rekaman dan ditinjau perekam. Konvensi: view_ (page_load), click_ (click), click_..._confirm (submit, setelah respons sukses), download_.",
        ],
      ],
    },
  ];
}

export const namaExcel = (judul) => `event-${slug(judul, 50).replace(/_/g, "-") || "alur"}.xlsx`;

/** Nama file ZIP yang aman untuk folder sumber/ playbook. */
export const namaPaket = (judul) => `rekaman-${slug(judul, 50).replace(/_/g, "-") || "alur"}.zip`;
