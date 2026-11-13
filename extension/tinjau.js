import { ambilRekaman, daftarLangkah, hapusRekaman, simpanRekaman } from "./lib/db.js";
import {
  buatExcel,
  buatPaket,
  cariPlaybook,
  gambarFinal,
  kirimKePlaybook,
  siapkan,
} from "./lib/ekspor.js";
import { daftarEvent, ringkasLangkah } from "./lib/rekam.js";
import { h, kartuLangkah } from "./lib/ui.js";

// Halaman tinjau: rapikan narasi dan event, samarkan area, lalu unduh daftar event (Excel), PDF,
// atau kirim rekaman ke playbook.

const $ = (id) => document.getElementById(id);
const id = new URLSearchParams(location.search).get("id");
const pesan = (t) => {
  $("pesan").textContent = t;
};

async function tampilkan() {
  const r = await ambilRekaman(id);
  if (!r) {
    document.body.replaceChildren(h("main", {}, h("p", {}, "Rekaman tidak ditemukan.")));
    return;
  }
  document.title = `Tinjau: ${r.judul}`;
  $("judul").value = r.judul;
  $("peran").value = r.peran;
  $("deskripsi").value = r.deskripsi;
  const langkah = await daftarLangkah(id);
  const jumlahEvent = langkah.filter((l) => l.event.aktif).length;
  $("ringkasan").textContent =
    `${langkah.length} langkah · ${jumlahEvent} event ditandai · ${r.aplikasi}`;
  $("langkah").replaceChildren(
    ...langkah.map((l, i) =>
      kartuLangkah(l, i + 1, { besar: true, onHapus: () => void tampilkan() }),
    ),
  );
}

for (const kolom of ["judul", "peran", "deskripsi"]) {
  $(kolom).addEventListener("change", async () => {
    const r = await ambilRekaman(id);
    r[kolom] = $(kolom).value.trim();
    await simpanRekaman(r);
  });
}

function unduh(blob, nama) {
  const a = h("a", { href: URL.createObjectURL(blob), download: nama });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

$("unduh-zip").addEventListener("click", async () => {
  pesan("Menyusun ZIP…");
  const paket = await buatPaket(id);
  unduh(paket.blob, paket.nama);
  pesan(`${paket.nama} diunduh. Upload ke kartu "Panduan produk" di halaman awal playbook.`);
});

$("cetak-pdf").addEventListener("click", async () => {
  pesan("Menyiapkan PDF…");
  const { data, langkah } = await siapkan(id);
  const bagian = [
    h("h1", {}, data.judul),
    h(
      "p",
      {},
      `${data.aplikasi}${data.peran ? ` · ${data.peran}` : ""} · ${new Date(data.dibuat).toLocaleString("id-ID")}`,
    ),
    data.deskripsi ? h("p", {}, data.deskripsi) : null,
    ...(() => {
      const event = daftarEvent(data);
      if (event.length === 0) return [];
      return [
        h("h2", {}, "Daftar event"),
        h(
          "table",
          { class: "tabel" },
          h(
            "thead",
            {},
            h(
              "tr",
              {},
              ...["event_name", "trigger", "Halaman", "Langkah"].map((t) => h("th", {}, t)),
            ),
          ),
          h(
            "tbody",
            {},
            ...event.map((e) =>
              h(
                "tr",
                {},
                h("td", {}, e.nama),
                h("td", {}, e.tipe),
                h("td", {}, e.halaman.join(", ")),
                h("td", {}, e.langkah.join(", ")),
              ),
            ),
          ),
        ),
      ];
    })(),
  ];
  for (const [i, l] of langkah.entries()) {
    const g = l.adaGambar ? await gambarFinal(l) : null;
    bagian.push(
      h(
        "section",
        {},
        h("h2", {}, `${i + 1}. ${ringkasLangkah(l)}`),
        h(
          "p",
          {},
          `Halaman ${l.halaman.path}${l.event.aktif ? ` · event ${l.event.nama} (${l.event.tipe})` : ""}`,
        ),
        l.narasi ? h("p", {}, l.narasi) : null,
        g
          ? h("img", { src: URL.createObjectURL(g), alt: `Langkah ${i + 1}` })
          : h(
              "p",
              {},
              `(Tanpa screenshot${l.alasanTanpaGambar ? `: ${l.alasanTanpaGambar}` : ""})`,
            ),
      ),
    );
  }
  $("cetak").replaceChildren(...bagian);
  // Tunggu gambar selesai dimuat sebelum dialog cetak terbuka.
  await Promise.all(
    [...$("cetak").querySelectorAll("img")].map((img) => img.decode().catch(() => {})),
  );
  pesan('Pilih "Simpan sebagai PDF" di dialog cetak.');
  print();
});

$("hapus-rekaman").addEventListener("click", async () => {
  if (!confirm("Hapus rekaman ini beserta semua screenshot-nya?")) return;
  await hapusRekaman(id);
  close();
});

let playbook = null;
$("kirim").addEventListener("click", async () => {
  try {
    if (!playbook) {
      pesan("Mencari web playbook di komputer ini…");
      playbook = await cariPlaybook();
      if (!playbook) {
        pesan(
          'Web playbook belum jalan. Jalankan npm run dev di folder playbook, lalu coba lagi. Bisa juga pakai "Unduh ZIP rekaman".',
        );
        return;
      }
      if (playbook.projects.length === 0) {
        pesan("Belum ada project. Buat project dulu di halaman awal playbook.");
        playbook = null;
        return;
      }
      $("project").replaceChildren(
        ...playbook.projects.map((p) => h("option", { value: p.id }, p.nama)),
      );
      $("project").hidden = false;
      pesan("Pilih project tujuan, lalu klik Kirim ke playbook lagi.");
      return;
    }
    pesan("Mengirim…");
    const paket = await buatPaket(id);
    await kirimKePlaybook(playbook.base, $("project").value, paket);
    pesan(`Terkirim ke project ${$("project").value} sebagai ${paket.nama}.`);
  } catch (e) {
    pesan(e instanceof Error ? e.message : String(e));
  }
});

$("unduh-excel").addEventListener("click", async () => {
  const excel = await buatExcel(id);
  unduh(excel.blob, excel.nama);
  pesan(`${excel.nama} diunduh.`);
});

/** Tabel ringkas daftar event, diperbarui setiap ada perubahan di kartu langkah. */
async function tampilkanDaftarEvent() {
  const { data } = await siapkan(id);
  const event = daftarEvent(data);
  $("daftar-event").replaceChildren(
    event.length === 0
      ? h(
          "p",
          { class: "redup" },
          'Belum ada event. Centang "Jadikan event" di langkah yang penting.',
        )
      : h(
          "table",
          { class: "tabel" },
          h(
            "thead",
            {},
            h(
              "tr",
              {},
              ...["event_name", "trigger", "Langkah", "Perlu dicek"].map((t) => h("th", {}, t)),
            ),
          ),
          h(
            "tbody",
            {},
            ...event.map((e) =>
              h(
                "tr",
                {},
                h("td", { class: "mono" }, e.nama),
                h("td", {}, e.tipe),
                h("td", {}, e.langkah.join(", ")),
                h("td", { class: "peringatan" }, e.peringatan.join("; ")),
              ),
            ),
          ),
        ),
  );
}
let jadwalDaftar;
const segarkanDaftar = () => {
  clearTimeout(jadwalDaftar);
  jadwalDaftar = setTimeout(() => void tampilkanDaftarEvent(), 600);
};
$("langkah").addEventListener("input", segarkanDaftar);
$("langkah").addEventListener("change", segarkanDaftar);
$("langkah").addEventListener("click", segarkanDaftar);

void tampilkan().then(tampilkanDaftarEvent);
