// Dipasang ke halaman yang direkam. Mencatat klik, pindah halaman, isian, dan kirim form.
// Nilai yang diketik pengguna tidak pernah dicatat. Saat screenshot diambil, isian form dan
// teks yang mirip data pribadi ditutup kotak abu-abu.
(() => {
  if (window.__perekamPlaybook) return;

  // Sinkron dengan POLA_PII di lib/rekam.js.
  const POLA_PII = [
    /[\w.+-]+@[\w-]+(\.[\w-]+)+/g,
    /(?<![\d])\d{16,18}(?![\d])/g,
    /(?<![\d])(\+62|62|08)[\d -]{8,14}\d(?![\d])/g,
    /(?<![\d])\d{8}\s\d{6}\s\d\s\d{3}(?![\d])/g,
  ];
  const INTERAKTIF =
    "a,button,summary,select,label,[role=button],[role=link],[role=tab],[role=menuitem],[role=option],[role=checkbox],[role=radio],[role=switch],input[type=submit],input[type=button],input[type=checkbox],input[type=radio],input[type=reset],input[type=image]";
  const EKSTENSI_UNDUH = /\.(pdf|xlsx?|csv|docx?|zip|pptx?)(\?|#|$)/i;

  let aktif = true;
  let jumlah = 0;
  let urlTerakhir = "";
  let klikTerakhir = { waktu: 0, form: null };

  // Penanda di pojok layar, di shadow DOM supaya tidak terpengaruh CSS halaman.
  const host = document.createElement("div");
  host.setAttribute("data-perekam-playbook", "");
  const shadow = host.attachShadow({ mode: "closed" });
  shadow.innerHTML = `<style>
    .p{position:fixed;right:16px;bottom:16px;z-index:2147483647;font:600 12px system-ui,sans-serif;
      background:#b91c1c;color:#fff;padding:6px 10px;border-radius:999px;box-shadow:0 2px 8px #0004;pointer-events:none}
  </style><div class="p">● Merekam · <span>0</span> langkah</div>`;
  const penghitung = shadow.querySelector("span");
  document.documentElement.append(host);

  const lapisan = document.createElement("div");
  lapisan.setAttribute("data-perekam-playbook", "");
  Object.assign(lapisan.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483646",
    pointerEvents: "none",
  });

  const dalamViewport = (r) =>
    r.width > 0 &&
    r.height > 0 &&
    r.bottom > 0 &&
    r.right > 0 &&
    r.top < innerHeight &&
    r.left < innerWidth;

  function kotakSamaran(r) {
    const d = document.createElement("div");
    Object.assign(d.style, {
      position: "fixed",
      left: `${r.left - 2}px`,
      top: `${r.top - 2}px`,
      width: `${r.width + 4}px`,
      height: `${r.height + 4}px`,
      background: "#9ca3af",
      borderRadius: "3px",
    });
    lapisan.append(d);
  }

  function pasangSamaran() {
    lapisan.replaceChildren();
    for (const el of document.querySelectorAll(
      "input,textarea,select,[contenteditable=''],[contenteditable=true]",
    )) {
      const tipe = (el.getAttribute("type") || "").toLowerCase();
      if (["checkbox", "radio", "submit", "button", "reset", "image", "hidden"].includes(tipe))
        continue;
      const isi = el.isContentEditable
        ? el.textContent.trim()
        : el.tagName === "SELECT"
          ? el.selectedIndex > 0
          : el.value;
      if (!isi) continue;
      const r = el.getBoundingClientRect();
      if (dalamViewport(r)) kotakSamaran(r);
    }
    const walker = document.createTreeWalker(
      document.body ?? document.documentElement,
      NodeFilter.SHOW_TEXT,
    );
    let n = 0;
    for (let node = walker.nextNode(); node && n < 20000; node = walker.nextNode(), n++) {
      const teks = node.nodeValue;
      if (!teks || teks.length < 8 || !/[\d@]/.test(teks)) continue;
      for (const pola of POLA_PII) {
        pola.lastIndex = 0;
        for (const m of teks.matchAll(pola)) {
          const range = document.createRange();
          range.setStart(node, m.index);
          range.setEnd(node, m.index + m[0].length);
          for (const r of range.getClientRects()) if (dalamViewport(r)) kotakSamaran(r);
        }
      }
    }
    host.style.display = "none";
    document.documentElement.append(lapisan);
  }

  function lepasSamaran() {
    lapisan.remove();
    host.style.display = "";
  }

  // Background meminta penutup tepat sebelum screenshot dan melepasnya sesudahnya. Selama penutup
  // terpasang, perubahan halaman ditutup ulang supaya data baru tidak ikut terekam. Pengamat
  // dimatikan selama penutup dipasang; tanpa itu, perubahan dari penutup sendiri memicu
  // pengamat lagi tanpa henti dan halaman hang.
  let jumlahSamaran = 0;
  let batasWaktu;
  // Dibangun ulang paling sering sekali per frame, supaya portal yang terus berubah tidak berat.
  let jadwalUlang = 0;
  const pengamat = new MutationObserver(() => {
    if (jumlahSamaran === 0 || jadwalUlang) return;
    jadwalUlang = requestAnimationFrame(() => {
      jadwalUlang = 0;
      if (jumlahSamaran > 0) pasangUlang();
    });
  });
  function amati() {
    pengamat.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["value", "style", "class"],
    });
  }
  function pasangUlang() {
    pengamat.disconnect();
    pasangSamaran();
    amati();
  }
  function mintaSamaran() {
    jumlahSamaran++;
    pasangUlang();
    // Pengaman bila pesan "lepas" tidak pernah datang.
    clearTimeout(batasWaktu);
    batasWaktu = setTimeout(() => {
      jumlahSamaran = 1;
      akhiriSamaran();
    }, 5000);
  }
  function akhiriSamaran() {
    jumlahSamaran = Math.max(0, jumlahSamaran - 1);
    if (jumlahSamaran === 0) {
      clearTimeout(batasWaktu);
      pengamat.disconnect();
      lepasSamaran();
    }
  }

  const rapikan = (t) =>
    String(t ?? "")
      .replace(/\s+/g, " ")
      .trim();

  function labelDari(el) {
    const aria = el.getAttribute("aria-label");
    if (aria) return rapikan(aria);
    const labelledby = el.getAttribute("aria-labelledby");
    if (labelledby) {
      const t = labelledby
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.innerText ?? "")
        .join(" ");
      if (rapikan(t)) return rapikan(t);
    }
    if (el.labels?.[0]) return rapikan(el.labels[0].innerText);
    const tipe = (el.getAttribute("type") || "").toLowerCase();
    if (el.tagName === "INPUT" && ["submit", "button", "reset"].includes(tipe))
      return rapikan(el.value);
    const teks = rapikan(el.innerText);
    if (teks) return teks.slice(0, 80);
    return rapikan(
      el.getAttribute("title") ||
        el.querySelector("img")?.alt ||
        el.getAttribute("placeholder") ||
        el.getAttribute("name") ||
        "",
    );
  }

  function selectorDari(el) {
    if (el.id && !/\d{3,}|[:.]/.test(el.id)) return `#${el.id}`;
    const testid = el.getAttribute("data-testid") || el.getAttribute("data-test");
    if (testid) return `[data-testid="${testid}"]`;
    const bagian = [];
    for (let e = el; e && e !== document.body && bagian.length < 4; e = e.parentElement) {
      const saudara = e.parentElement
        ? [...e.parentElement.children].filter((c) => c.tagName === e.tagName)
        : [];
      const urut = saudara.length > 1 ? `:nth-of-type(${saudara.indexOf(e) + 1})` : "";
      bagian.unshift(e.tagName.toLowerCase() + urut);
    }
    return bagian.join(" > ");
  }

  function infoElemen(el) {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role") || "",
      tipe: (el.getAttribute("type") || "").toLowerCase(),
      label: labelDari(el),
      selector: selectorDari(el),
      kotak: {
        x: Math.round(r.left),
        y: Math.round(r.top),
        lebar: Math.round(r.width),
        tinggi: Math.round(r.height),
      },
    };
  }

  const layar = () => ({ lebar: innerWidth, tinggi: innerHeight, dpr: devicePixelRatio });

  async function kirim(jenis, elemen, butuhGambar) {
    if (!aktif) return;
    const data = { jenis, url: location.href, judul: document.title, elemen, layar: layar() };
    try {
      const jawab = await chrome.runtime.sendMessage({ jenis: "langkah", data, butuhGambar });
      if (jawab?.ok && jawab.hasil) {
        jumlah = jawab.hasil;
        penghitung.textContent = String(jumlah);
      }
    } catch {
      // Extension dimuat ulang atau perekaman dihentikan.
    }
  }

  function targetKlik(el) {
    const langsung = el.closest(INTERAKTIF);
    if (langsung) return langsung;
    // Kartu atau baris yang bisa diklik biasanya memakai kursor tangan.
    for (let e = el, i = 0; e && e !== document.body && i < 6; e = e.parentElement, i++) {
      if (getComputedStyle(e).cursor === "pointer") return e;
    }
    return null;
  }

  function onPointerDown(ev) {
    if (
      ev.button !== 0 ||
      !(ev.target instanceof Element) ||
      ev.target.closest("[data-perekam-playbook]")
    )
      return;
    const el = targetKlik(ev.target);
    if (!el) return;
    const href = el.closest("a")?.getAttribute("href") ?? "";
    const unduh = el.closest("a")?.hasAttribute("download") || EKSTENSI_UNDUH.test(href);
    const submit =
      el.matches("button:not([type]),button[type=submit],input[type=submit]") && el.form;
    klikTerakhir = { waktu: Date.now(), form: submit ? el.form : null };
    void kirim(unduh ? "unduh" : "klik", infoElemen(el), true);
  }

  function onChange(ev) {
    const el = ev.target;
    if (!(el instanceof Element) || !el.matches("input,select,textarea")) return;
    const tipe = (el.getAttribute("type") || "").toLowerCase();
    if (["checkbox", "radio", "submit", "button", "hidden"].includes(tipe)) return;
    void kirim("isi", infoElemen(el), false);
  }

  function onSubmit(ev) {
    const form = ev.target;
    if (klikTerakhir.form === form && Date.now() - klikTerakhir.waktu < 2000) {
      void chrome.runtime.sendMessage({ jenis: "jadikan-kirim" }).catch(() => {});
      return;
    }
    void kirim("kirim", infoElemen(form.querySelector("button,input[type=submit]") ?? form), true);
  }

  // Halaman dianggap terbuka setelah tampilannya tenang sebentar; juga berlaku untuk SPA.
  let tundaHalaman;
  function cekHalaman() {
    const url = location.origin + location.pathname;
    if (url === urlTerakhir) return;
    urlTerakhir = url;
    clearTimeout(tundaHalaman);
    tundaHalaman = setTimeout(() => void kirim("buka_halaman", null, true), 900);
  }

  addEventListener("pointerdown", onPointerDown, true);
  addEventListener("change", onChange, true);
  addEventListener("submit", onSubmit, true);
  addEventListener("popstate", cekHalaman);
  const pemantau = setInterval(cekHalaman, 700);
  cekHalaman();

  function berhenti() {
    aktif = false;
    removeEventListener("pointerdown", onPointerDown, true);
    removeEventListener("change", onChange, true);
    removeEventListener("submit", onSubmit, true);
    removeEventListener("popstate", cekHalaman);
    clearInterval(pemantau);
    clearTimeout(tundaHalaman);
    pengamat.disconnect();
    host.remove();
    lapisan.remove();
    chrome.runtime.onMessage.removeListener(onPesan);
    window.__perekamPlaybook = undefined;
  }

  function onPesan(pesan, _pengirim, balas) {
    if (pesan?.jenis === "berhenti") berhenti();
    // Perekam yang sudah berhenti diam saja, supaya perekam baru di halaman yang sama yang menjawab.
    if (!aktif) return undefined;
    if (pesan?.jenis === "samarkan") {
      mintaSamaran();
      // Tunggu satu frame supaya penutup sudah tergambar sebelum screenshot diambil.
      requestAnimationFrame(() => requestAnimationFrame(() => balas({ ok: true })));
      return true;
    }
    if (pesan?.jenis === "lepas") akhiriSamaran();
    return undefined;
  }
  chrome.runtime.onMessage.addListener(onPesan);
  window.__perekamPlaybook = { berhenti };
})();
