import type { ReactNode } from "react";
import clsx from "clsx";
import {
  Bot,
  Box,
  ChevronDown,
  Download,
  FileCheck,
  FileEdit,
  HelpCircle,
  Home,
  LayoutDashboard,
  MapPin,
  Send,
  Users,
  Video,
  X,
} from "lucide-react";
import { jadwalKonsultasi, wilayahOpsi } from "./dummy.ts";
import type { MenuKey, Peran, SetSim, SimState } from "./sim.ts";
import { useTrack } from "@engine/wireframe/tracker.tsx";
import { Btn, inputClass, Modal } from "@engine/wireframe/ui.tsx";

// Kerangka aplikasi: bilah atas (peran, wilayah, Konsultasi Daring), menu samping, dan tombol
// Chat dengan Bot. Menu mengikuti struktur di panduan (slide 147); hanya menu yang sudah punya
// layar wireframe yang bisa diklik.

const menu: {
  label: string;
  indent?: 1 | 2;
  icon?: ReactNode;
  group?: boolean;
  key?: MenuKey;
  /** Keterangan peran untuk menu khusus. */
  note?: string;
}[] = [
  { label: "Beranda", icon: <Home size={14} />, key: "beranda" },
  { label: "Kepala Sekolah (KS)", icon: <Users size={14} />, group: true },
  { label: "Pemetaan Kebutuhan KS", indent: 1, key: "pemetaan" },
  { label: "Guru Memenuhi Syarat", indent: 1, key: "gms" },
  { label: "Pengusulan", indent: 1, key: "pengusulan" },
  { label: "Seleksi", indent: 1, group: true },
  { label: "Seleksi Administrasi", indent: 2, key: "seleksi_administrasi" },
  { label: "Seleksi Substansi", indent: 2, key: "seleksi_substansi" },
  { label: "Pelatihan", indent: 1, key: "pelatihan" },
  { label: "Penugasan", indent: 1, group: true },
  { label: "Reguler", indent: 2, key: "reguler" },
  { label: "Non-Reguler", indent: 2, key: "non_reguler" },
  { label: "Swasta Murni", indent: 2, key: "swasta_murni" },
  { label: "Pemberhentian", indent: 1, key: "pemberhentian" },
  { label: "Manajemen KS Aktif", indent: 1, key: "manajemen_ks" },
  { label: "Pengajuan Perubahan", icon: <FileEdit size={14} />, key: "pengajuan_perubahan" },
  {
    label: "Dasbor Pengajuan Perubahan",
    icon: <LayoutDashboard size={14} />,
    key: "dasbor",
    note: "Super Admin",
  },
  { label: "Verval SK PPPK", icon: <FileCheck size={14} />, key: "verval_sk", note: "Super Admin" },
  { label: "Unduh Juknis", icon: <Download size={14} /> },
  { label: "Bantuan", icon: <HelpCircle size={14} /> },
];

const peranLabel: Record<Peran, string> = {
  dinas_pendidikan: "Dinas Pendidikan",
  upt_gtk: "UPT GTK",
  super_admin: "Super Admin",
};

export function AppShell({
  active,
  onNavigate,
  sim,
  setSim,
  children,
}: {
  active: MenuKey;
  onNavigate: (key: MenuKey) => void;
  sim: SimState;
  setSim: SetSim;
  children: ReactNode;
}) {
  const track = useTrack();
  const upt = sim.peran === "upt_gtk";
  const namaWilayah = wilayahOpsi.find((w) => w.kode === sim.wilayah)?.nama;

  return (
    <div className="relative flex min-h-[640px] flex-col bg-slate-100 text-slate-800">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-7 items-center justify-center rounded bg-sky-500 text-white">
            <Box size={16} />
          </span>
          SIM KSPSTK
          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
            WIREFRAME
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-700">
          <Btn
            tour="konsultasi-btn"
            onClick={() => {
              track("click_konsultasi_daring");
              setSim({ modal: "konsultasi" });
            }}
          >
            <Video size={12} /> Konsultasi Daring
          </Btn>
          <select
            data-tour="peran"
            aria-label="Peran pengguna"
            value={sim.peran}
            onChange={(e) => setSim({ peran: e.target.value as Peran })}
            className="rounded border border-slate-300 bg-white px-1.5 py-0.5"
          >
            {(Object.keys(peranLabel) as Peran[]).map((p) => (
              <option key={p} value={p}>
                {peranLabel[p]}
              </option>
            ))}
          </select>
          {upt ? (
            <label data-tour="wilayah" className="flex items-center gap-1">
              <MapPin size={13} />
              <select
                aria-label="Ganti wilayah"
                value={sim.wilayah}
                onChange={(e) => {
                  track("click_ganti_wilayah", { kode_wilayah_tujuan: e.target.value });
                  setSim({ wilayah: e.target.value });
                }}
                className="rounded border border-slate-300 bg-white px-1.5 py-0.5"
              >
                {wilayahOpsi.map((w) => (
                  <option key={w.kode} value={w.kode}>
                    {w.nama}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="flex items-center gap-1" title="Hanya UPT yang dapat berganti wilayah">
              <MapPin size={13} /> {namaWilayah} <ChevronDown size={13} />
            </span>
          )}
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav className="w-52 shrink-0 space-y-0.5 bg-slate-800 px-2 py-3 text-[11px] text-slate-200">
          {menu.map((m) => {
            const isActive = m.key === active;
            return (
              <button
                key={m.label}
                type="button"
                disabled={!m.key}
                data-tour={m.key ? `menu-${m.key}` : undefined}
                onClick={() => m.key && onNavigate(m.key)}
                className={clsx(
                  "flex w-full items-center justify-between rounded px-2 py-1.5 text-left",
                  m.indent === 1 && "pl-4",
                  m.indent === 2 && "pl-7",
                  isActive && "bg-sky-600 font-medium text-white",
                  m.key && !isActive && "hover:bg-slate-700",
                  m.group && "bg-slate-700/60",
                )}
              >
                <span className="flex items-center gap-2">
                  {m.icon}
                  {m.label}
                  {m.note && <span className="text-[9px] text-slate-400">({m.note})</span>}
                </span>
                {m.group && <ChevronDown size={12} />}
              </button>
            );
          })}
        </nav>
        <main className="relative min-w-0 flex-1 pb-16">{children}</main>
      </div>

      <ChatBot sim={sim} setSim={setSim} />

      {sim.modal === "konsultasi" && (
        <Modal
          title="Jadwal Konsultasi Daring"
          subtitle="Pendampingan langsung bersama tim layanan melalui Zoom Meeting"
          onClose={() => setSim({ modal: null })}
        >
          <ul className="space-y-2">
            {jadwalKonsultasi.map((j, i) => (
              <li
                key={j.id}
                className="flex items-center justify-between rounded-md border border-slate-200 p-3"
              >
                <span>
                  <b className="font-medium text-slate-900">{j.tanggal}</b> · {j.jam}
                  <span className="block text-slate-500">{j.topik}</span>
                </span>
                <Btn
                  variant="primary"
                  tour={i === 0 ? "konsultasi-ikuti" : undefined}
                  onClick={() => {
                    track("click_ikuti_konsultasi_zoom");
                    setSim({ modal: null });
                  }}
                >
                  Ikuti Konsultasi Daring
                </Btn>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}

/** Jawaban bot contoh; isi pertanyaan tidak dikirim ke tracker. */
const jawabanBot =
  "Terima kasih. Untuk pertanyaan ini, silakan cek panduan SIM KSPSTK bagian terkait atau ikuti jadwal konsultasi daring.";

function ChatBot({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const kirim = () => {
    const teks = sim.chatDraft.trim();
    if (!teks) return;
    const nomor = sim.chatPesan.filter((p) => p.dari === "user").length + 1;
    track("click_chat_bot_kirim_pertanyaan", {
      nomor_pertanyaan: nomor,
      panjang_pertanyaan: teks.length,
    });
    setSim({
      chatDraft: "",
      chatPesan: [...sim.chatPesan, { dari: "user", teks }, { dari: "bot", teks: jawabanBot }],
    });
  };

  if (!sim.chatOpen) {
    return (
      <button
        data-tour="chat-bot-btn"
        onClick={() => {
          track("click_chat_bot");
          setSim({ chatOpen: true });
        }}
        className="absolute right-4 bottom-4 z-10 flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-xs font-medium text-white shadow-lg hover:bg-sky-700"
      >
        <Bot size={16} /> Chat dengan Bot
      </button>
    );
  }

  return (
    <div className="absolute right-4 bottom-4 z-30 flex w-80 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-xs shadow-xl">
      <div className="flex items-center justify-between bg-sky-600 px-3 py-2 text-white">
        <span className="flex items-center gap-2 font-medium">
          <Bot size={14} /> Chat dengan Bot
        </span>
        <button aria-label="Tutup chat" onClick={() => setSim({ chatOpen: false })}>
          <X size={14} />
        </button>
      </div>
      {!sim.chatTerdaftar ? (
        <div className="space-y-2 p-3">
          <p className="text-slate-600">Isi formulir sebelum mengajukan pertanyaan.</p>
          <input className={inputClass} placeholder="Nama" defaultValue="Operator Dinas" />
          <input className={inputClass} placeholder="Email" defaultValue="operator@contoh.id" />
          <Btn
            variant="primary"
            tour="chat-form-kirim"
            className="w-full justify-center"
            onClick={() => {
              // Nama dan email TIDAK dikirim ke tracker.
              track("click_chat_bot_form_kirim");
              setSim({ chatTerdaftar: true });
            }}
          >
            Kirim
          </Btn>
        </div>
      ) : (
        <>
          <div className="max-h-56 space-y-2 overflow-y-auto p-3">
            {sim.chatPesan.length === 0 && (
              <p className="text-slate-500">
                Tanyakan seputar penggunaan SIM KSPSTK, regulasi, atau kebijakan.
              </p>
            )}
            {sim.chatPesan.map((p, i) => (
              <p
                key={i}
                className={clsx(
                  "max-w-[85%] rounded-lg px-2.5 py-1.5",
                  p.dari === "user"
                    ? "ml-auto bg-sky-100 text-sky-900"
                    : "bg-slate-100 text-slate-700",
                )}
              >
                {p.teks}
              </p>
            ))}
            {sim.chatPesan.length > 0 && (
              <button
                className="text-sky-700 underline"
                onClick={() => setSim({ modal: "konsultasi" })}
              >
                Lihat jadwal konsultasi daring
              </button>
            )}
          </div>
          <div className="flex gap-2 border-t border-slate-100 p-2">
            <input
              className={inputClass}
              placeholder="Ketik pertanyaan..."
              value={sim.chatDraft}
              onChange={(e) => setSim({ chatDraft: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && kirim()}
            />
            <Btn variant="primary" tour="chat-kirim" aria-label="Kirim pertanyaan" onClick={kirim}>
              <Send size={12} />
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}
