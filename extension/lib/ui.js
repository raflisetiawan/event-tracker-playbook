import { ambilGambar, hapusLangkah, simpanLangkah } from "./db.js";
import { POLA_NAMA_EVENT, ringkasLangkah, TIPE_EVENT } from "./rekam.js";

// Kartu satu langkah, dipakai panel samping (ringkas) dan halaman tinjau (besar, bisa disamarkan).

export function h(tag, attrs = {}, ...anak) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "class") el.className = v;
    else if (v === true) el.setAttribute(k, "");
    else if (v !== false && v != null) el.setAttribute(k, String(v));
  }
  el.append(...anak.flat().filter((a) => a != null && a !== false));
  return el;
}

const tunda = (fn, ms = 400) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

/**
 * Posisi kotak elemen yang diklik, dalam pecahan ukuran gambar. Skala diambil dari lebar saja,
 * karena tinggi screenshot bisa berbeda dari tinggi jendela.
 */
export function kotakSorot(l, lebarGambar, tinggiGambar) {
  if (!l.elemen?.kotak || !l.layar?.lebar || l.jenis === "buka_halaman" || !lebarGambar)
    return null;
  const k = l.elemen.kotak;
  const skala = lebarGambar / l.layar.lebar;
  return {
    x: (k.x * skala) / lebarGambar,
    y: (k.y * skala) / tinggiGambar,
    w: (k.lebar * skala) / lebarGambar,
    h: (k.tinggi * skala) / tinggiGambar,
  };
}

const persen = (v) => `${(v * 100).toFixed(2)}%`;
const posisi = (el, r) =>
  Object.assign(el.style, {
    left: persen(r.x),
    top: persen(r.y),
    width: persen(r.w),
    height: persen(r.h),
  });

function bingkaiGambar(l, { bisaSamarkan, onUbah }) {
  const bingkai = h("div", { class: "bingkai" });
  let sorot = null;
  void ambilGambar(l.id).then((blob) => {
    if (!blob) return;
    const img = h("img", {
      src: URL.createObjectURL(blob),
      alt: "Screenshot langkah",
      draggable: "false",
    });
    img.addEventListener("load", () => {
      sorot = kotakSorot(l, img.naturalWidth, img.naturalHeight);
      gambarUlang();
    });
    bingkai.prepend(img);
  });
  const lapisan = h("div", { class: "lapisan" });
  bingkai.append(lapisan);

  const gambarUlang = () => {
    lapisan.replaceChildren();
    if (sorot) {
      const s = h("div", { class: "sorot" });
      posisi(s, sorot);
      lapisan.append(s);
    }
    l.samaran.forEach((r, i) => {
      const s = h("div", {
        class: "samaran",
        title: bisaSamarkan ? "Klik untuk menghapus samaran ini" : "",
        onClick: (e) => {
          if (!bisaSamarkan) return;
          e.stopPropagation();
          l.samaran.splice(i, 1);
          void onUbah();
          gambarUlang();
        },
      });
      posisi(s, r);
      lapisan.append(s);
    });
  };
  gambarUlang();

  if (bisaSamarkan) {
    bingkai.classList.add("bisa-samarkan");
    let awal = null;
    let calon = null;
    const titik = (e) => {
      const b = bingkai.getBoundingClientRect();
      return {
        x: Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)),
        y: Math.min(1, Math.max(0, (e.clientY - b.top) / b.height)),
      };
    };
    bingkai.addEventListener("dragstart", (e) => e.preventDefault());
    bingkai.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.classList.contains("samaran")) return;
      e.preventDefault();
      awal = titik(e);
      calon = h("div", { class: "samaran calon" });
      lapisan.append(calon);
      bingkai.setPointerCapture(e.pointerId);
    });
    bingkai.addEventListener("pointermove", (e) => {
      if (!awal) return;
      const p = titik(e);
      posisi(calon, {
        x: Math.min(awal.x, p.x),
        y: Math.min(awal.y, p.y),
        w: Math.abs(p.x - awal.x),
        h: Math.abs(p.y - awal.y),
      });
    });
    bingkai.addEventListener("pointerup", (e) => {
      if (!awal) return;
      const p = titik(e);
      const r = {
        x: Math.min(awal.x, p.x),
        y: Math.min(awal.y, p.y),
        w: Math.abs(p.x - awal.x),
        h: Math.abs(p.y - awal.y),
      };
      awal = null;
      calon.remove();
      if (r.w > 0.005 && r.h > 0.005) {
        l.samaran.push(r);
        void onUbah();
      }
      gambarUlang();
    });
  }
  return bingkai;
}

export function kartuLangkah(l, nomor, { besar = false, onHapus } = {}) {
  const simpan = () => simpanLangkah(l);
  const simpanNanti = tunda(simpan);

  const namaEvent = h("input", {
    class: "isian mono",
    value: l.event.nama,
    "aria-label": "Nama event",
  });
  const tipeEvent = h(
    "select",
    { class: "isian", "aria-label": "Tipe event" },
    TIPE_EVENT.map((t) => h("option", { value: t, selected: t === l.event.tipe }, t)),
  );
  const catatanEvent = h("input", {
    class: "isian",
    value: l.event.catatan,
    placeholder: "Catatan event (opsional)",
    "aria-label": "Catatan event",
  });
  const peringatan = h("p", { class: "peringatan" });
  const cekNama = () => {
    peringatan.textContent = POLA_NAMA_EVENT.test(l.event.nama)
      ? ""
      : "Nama harus diawali view_, click_, atau download_, lalu huruf kecil, angka, dan garis bawah.";
  };
  namaEvent.addEventListener("input", () => {
    l.event.nama = namaEvent.value.trim();
    cekNama();
    simpanNanti();
  });
  tipeEvent.addEventListener("change", () => {
    l.event.tipe = tipeEvent.value;
    void simpan();
  });
  catatanEvent.addEventListener("input", () => {
    l.event.catatan = catatanEvent.value;
    simpanNanti();
  });
  cekNama();
  const rincianEvent = h(
    "div",
    { class: "rincian-event", hidden: !l.event.aktif },
    namaEvent,
    tipeEvent,
    catatanEvent,
    peringatan,
  );
  const centang = h("input", { type: "checkbox", checked: l.event.aktif });
  centang.addEventListener("change", () => {
    l.event.aktif = centang.checked;
    rincianEvent.hidden = !centang.checked;
    void simpan();
  });

  const narasi = h("textarea", {
    class: "isian",
    rows: besar ? 3 : 2,
    placeholder: "Narasi: apa yang dilakukan pengguna di langkah ini dan kenapa",
    "aria-label": "Narasi langkah",
  });
  narasi.value = l.narasi;
  narasi.addEventListener("input", () => {
    l.narasi = narasi.value;
    simpanNanti();
  });

  return h(
    "article",
    { class: `kartu${besar ? " besar" : ""}`, "data-langkah": l.id },
    h(
      "header",
      {},
      h("strong", {}, `${nomor}. ${ringkasLangkah(l)}`),
      h("span", { class: "path mono" }, l.halaman.path),
      h(
        "button",
        {
          class: "hapus",
          title: "Hapus langkah ini",
          onClick: async () => {
            if (!confirm(`Hapus langkah ${nomor}?`)) return;
            await hapusLangkah(l.id);
            onHapus?.();
          },
        },
        "Hapus",
      ),
    ),
    l.adaGambar
      ? bingkaiGambar(l, { bisaSamarkan: besar, onUbah: simpan })
      : l.alasanTanpaGambar
        ? h("p", { class: "redup" }, `Tanpa screenshot: ${l.alasanTanpaGambar}.`)
        : null,
    narasi,
    h("label", { class: "jadikan-event" }, centang, " Jadikan event"),
    rincianEvent,
  );
}
