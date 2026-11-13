import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  Check,
  Circle,
  ClipboardCheck,
  Copy,
  Download,
  FileUp,
  Terminal,
  Trash2,
  Upload,
} from "lucide-react";
import { AGENTS, perintahPasang, type Agent } from "../lib/agent.ts";
import { api, kirimJson } from "../lib/api.ts";

// Halaman awal: tutorial dan upload bahan. Web tidak menjalankan AI; setelah bahan lengkap,
// pengguna membuka terminal dan menjalankan agent sendiri. Upload hanya ada di server lokal.

interface Bahan {
  kategori: string;
  label: string;
  keterangan: string;
  wajib: boolean;
  ekstensi: readonly string[];
  files: { nama: string; ukuran: number }[];
}

interface StatusProject {
  id: string;
  nama: string;
  bahan: Bahan[];
  pertanyaan: string;
  lengkap: boolean;
  langkah: { nama: string; selesai: boolean; tinjau: boolean }[];
  tinjauan: { sesuai: number; ubah: number; jumlahEvent: number };
}

interface Lingkungan {
  root: string;
  pemisah: string;
  platform: string;
  agen: Record<string, boolean>;
}

const ukuran = (b: number) =>
  b < 1024 * 1024
    ? `${Math.max(1, Math.round(b / 1024))} KB`
    : `${(b / 1024 / 1024).toFixed(1)} MB`;

const LANGKAH_TUTORIAL = [
  ["Buat project", "Beri nama project, mis. nama produk yang dibuatkan tracker."],
  ["Upload bahan", "Panduan produk wajib ada. Tracker dan dokumen lain membantu agent."],
  [
    "Jalankan agent",
    "Pilih agent (Claude Code, Codex, OpenCode, atau lainnya), lalu salin perintahnya.",
  ],
  ["Tinjau hasilnya", "Tandai tiap event langsung di web. Agent memperbaiki yang Anda tandai."],
] as const;

export function Home({
  projectTerpilih,
  hasilIds,
  onPilih,
}: {
  projectTerpilih: string | null;
  hasilIds: string[];
  onPilih: (id: string | null) => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">Event Tracker Playbook</h1>
          <p className="mt-1 text-sm text-slate-600">
            Dari panduan produk menjadi usulan event tracker dan web tur untuk dibahas bersama
            Product dan Engineer.
          </p>
        </header>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LANGKAH_TUTORIAL.map(([judul, isi], i) => (
            <li key={judul} className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="flex size-6 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <p className="mt-2 text-sm font-semibold text-slate-900">{judul}</p>
              <p className="mt-1 text-xs text-slate-600">{isi}</p>
            </li>
          ))}
        </ol>

        {import.meta.env.DEV ? (
          <Persiapan projectTerpilih={projectTerpilih} onPilih={onPilih} />
        ) : (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Upload hanya tersedia di komputer sendiri, supaya panduan internal tidak terkirim ke
            situs ini. Pasang Node.js 24, clone repo, jalankan <code>npm install</code> dan{" "}
            <code>npm run dev</code>, lalu buka halaman ini di localhost.
          </p>
        )}

        {hasilIds.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Lihat hasil</h2>
            <p className="mt-1 text-xs text-slate-600">
              Hasil setiap project. KSPS adalah contoh yang sudah lengkap.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {hasilIds.map((id) => (
                <a
                  key={id}
                  href={`#/${id}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  {id}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Persiapan({
  projectTerpilih,
  onPilih,
}: {
  projectTerpilih: string | null;
  onPilih: (id: string | null) => void;
}) {
  const [lingkungan, setLingkungan] = useState<Lingkungan | null>(null);
  const [projects, setProjects] = useState<StatusProject[]>([]);
  const [error, setError] = useState("");

  const muat = useCallback(async () => {
    try {
      const d = await api<{ projects: StatusProject[] }>("/api/projects");
      setProjects(d.projects);
      setLingkungan(await api<Lingkungan>("/api/lingkungan"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat.");
    }
  }, []);

  // Muat ulang saat kembali ke tab, supaya progres dari agent di terminal ikut terlihat.
  useEffect(() => {
    const muatUlang = () => void muat();
    muatUlang();
    addEventListener("focus", muatUlang);
    return () => removeEventListener("focus", muatUlang);
  }, [muat]);

  const [agent, pilihAgent] = useAgent(lingkungan);
  const project = projects.find((p) => p.id === projectTerpilih);
  const perbarui = (s: StatusProject) =>
    setProjects((l) =>
      l.some((p) => p.id === s.id) ? l.map((p) => (p.id === s.id ? s : p)) : [...l, s],
    );

  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">1. Pilih atau buat project</h2>
        {projects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => onPilih(p.id)}
                className={clsx(
                  "rounded-lg border px-3 py-1.5 text-sm",
                  p.id === projectTerpilih
                    ? "border-sky-500 bg-sky-50 font-medium text-sky-900"
                    : "border-slate-300 hover:bg-slate-50",
                )}
              >
                {p.nama}
              </button>
            ))}
          </div>
        )}
        <FormProjectBaru
          onDibuat={(s) => {
            perbarui(s);
            setError("");
            onPilih(s.id);
          }}
        />
      </section>

      <RekamPanduan lingkungan={lingkungan} />

      {project && (
        <>
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">2. Upload bahan</h2>
              <p className="text-xs text-slate-600">
                File disimpan di <code>projects/{project.id}/sumber/</code> di komputer ini dan
                tidak ikut ke git.
              </p>
            </div>
            {project.bahan.map((b) => (
              <KartuBahan key={b.kategori} projectId={project.id} bahan={b} onUbah={perbarui} />
            ))}
            <Pertanyaan key={project.id} project={project} onUbah={perbarui} />
          </section>
          <JalankanAgent
            project={project}
            lingkungan={lingkungan}
            agent={agent}
            onPilihAgent={pilihAgent}
          />
          {project.langkah[2].selesai && (
            <TinjauHasil project={project} lingkungan={lingkungan} agent={agent} />
          )}
        </>
      )}
    </>
  );
}

function RekamPanduan({ lingkungan }: { lingkungan: Lingkungan | null }) {
  const folder = lingkungan ? `${lingkungan.root}${lingkungan.pemisah}extension` : "";
  return (
    <details
      data-section="rekam-panduan"
      className="rounded-xl border border-slate-200 bg-white p-4"
    >
      <summary className="cursor-pointer text-sm font-semibold text-slate-900">
        Belum punya panduan? Rekam langsung dari web-nya
      </summary>
      <div className="mt-3 space-y-3 text-xs text-slate-700">
        <p>
          <b>Perekam Alur Playbook</b> adalah extension Chrome dan Edge. Klik seperti biasa di web
          yang ingin dibuatkan event; tiap klik dan halaman menjadi satu langkah lengkap dengan
          screenshot. Anda bisa menambah narasi dan menandai event, lalu langsung mengunduh daftar
          event (Excel) atau PDF, atau mengirim rekamannya ke project ini.
        </p>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            Buka <code>chrome://extensions</code> (Edge: <code>edge://extensions</code>) di tab
            baru.
          </li>
          <li>
            Nyalakan <b>Developer mode</b> (Edge: <b>Mode pengembang</b>).
          </li>
          <li>
            Klik <b>Load unpacked</b>, lalu pilih folder ini:
            {folder && (
              <div className="mt-1.5">
                <BarisPerintah perintah={folder} />
              </div>
            )}
          </li>
          <li>Sematkan ikonnya di toolbar, buka web yang ingin direkam, lalu klik ikon itu.</li>
        </ol>
        <p className="rounded-lg bg-amber-50 p-2.5 text-amber-900">
          Rekam di staging atau akun demo. Isian form dan teks mirip email, NIP, NIK, atau nomor HP
          disamarkan otomatis, tetapi nama orang tidak; tutup sendiri di halaman tinjau. Jangan
          memindahkan folder extension setelah dipasang. Setelah memperbarui repo, klik tombol muat
          ulang di halaman extension.
        </p>
      </div>
    </details>
  );
}

function FormProjectBaru({ onDibuat }: { onDibuat: (s: StatusProject) => void }) {
  const [nama, setNama] = useState("");
  const [error, setError] = useState("");
  const id = nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^[0-9-]+/, "");

  return (
    <form
      className="space-y-1"
      onSubmit={(e) => {
        e.preventDefault();
        void api<StatusProject>("/api/projects", kirimJson("POST", { id, nama: nama.trim() }))
          .then((s) => {
            setNama("");
            setError("");
            onDibuat(s);
          })
          .catch((err: unknown) => {
            setError(err instanceof Error ? err.message : "Gagal membuat project.");
          });
      }}
    >
      <div className="flex flex-wrap gap-2">
        <input
          aria-label="Nama project baru"
          className="min-w-60 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          placeholder="Nama project baru, mis. Portal Kemendikdasmen"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />
        <button
          disabled={!id}
          className="rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-40"
        >
          Buat project
        </button>
      </div>
      {id && <p className="text-xs text-slate-500">Folder: projects/{id}</p>}
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}

function KartuBahan({
  projectId,
  bahan,
  onUbah,
}: {
  projectId: string;
  bahan: Bahan;
  onUbah: (s: StatusProject) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState("");
  const [seret, setSeret] = useState(false);
  const url = (nama: string) =>
    `/api/projects/${projectId}/bahan/${bahan.kategori}/${encodeURIComponent(nama)}`;

  const upload = async (files: FileList | File[]) => {
    setSibuk(true);
    setError("");
    try {
      for (const f of files)
        onUbah(await api<StatusProject>(url(f.name), { method: "PUT", body: f }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setSibuk(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      data-bahan={bahan.kategori}
      onDragOver={(e) => {
        e.preventDefault();
        setSeret(true);
      }}
      onDragLeave={() => setSeret(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSeret(false);
        void upload(e.dataTransfer.files);
      }}
      className={clsx(
        "rounded-lg border border-dashed p-3",
        seret ? "border-sky-500 bg-sky-50" : "border-slate-300",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <FileUp size={14} /> {bahan.label}
            <span
              className={clsx(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                bahan.wajib ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600",
              )}
            >
              {bahan.wajib ? "Wajib" : "Opsional"}
            </span>
          </p>
          <p className="text-xs text-slate-600">{bahan.keterangan}</p>
        </div>
        <button
          type="button"
          disabled={sibuk}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
        >
          <Upload size={12} /> {sibuk ? "Mengunggah…" : "Pilih file"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          aria-label={`Upload ${bahan.label}`}
          accept={bahan.ekstensi.join(",")}
          onChange={(e) => {
            if (e.target.files) void upload(e.target.files);
          }}
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
      {bahan.files.length > 0 && (
        <ul className="mt-2 divide-y divide-slate-100 text-xs">
          {bahan.files.map((f) => (
            <li key={f.nama} className="flex items-center justify-between gap-2 py-1.5">
              <span className="flex min-w-0 items-center gap-2">
                <Check size={12} className="shrink-0 text-emerald-600" />
                <span className="truncate">{f.nama}</span>
                <span className="shrink-0 text-slate-400">{ukuran(f.ukuran)}</span>
              </span>
              <button
                type="button"
                aria-label={`Hapus ${f.nama}`}
                className="text-slate-400 hover:text-red-600"
                onClick={() => {
                  void api<StatusProject>(url(f.nama), { method: "DELETE" })
                    .then(onUbah)
                    .catch((e: unknown) => {
                      setError(e instanceof Error ? e.message : "Gagal menghapus.");
                    });
                }}
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Pertanyaan({
  project,
  onUbah,
}: {
  project: StatusProject;
  onUbah: (s: StatusProject) => void;
}) {
  const [teks, setTeks] = useState(project.pertanyaan);
  const [info, setInfo] = useState("");
  const berubah = teks !== project.pertanyaan;
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <label htmlFor="pertanyaan-product" className="text-sm font-medium text-slate-900">
        Pertanyaan dari Product
        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
          Opsional
        </span>
      </label>
      <p className="text-xs text-slate-600">
        Perilaku apa yang ingin diketahui? Kalau dikosongkan, agent akan mengajukan draf.
      </p>
      <textarea
        id="pertanyaan-product"
        rows={3}
        maxLength={20000}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        placeholder="Mis. Di langkah mana pengguna paling sering berhenti saat mengajukan?"
        value={teks}
        onChange={(e) => {
          setTeks(e.target.value);
          setInfo("");
        }}
      />
      <div className="mt-1 flex items-center gap-3">
        <button
          type="button"
          disabled={!berubah}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-40"
          onClick={() => {
            void api<StatusProject>(
              `/api/projects/${project.id}/pertanyaan`,
              kirimJson("PUT", { teks }),
            )
              .then((s) => {
                onUbah(s);
                setInfo("Tersimpan.");
              })
              .catch((e: unknown) => {
                setInfo(e instanceof Error ? e.message : "Gagal menyimpan.");
              });
          }}
        >
          Simpan pertanyaan
        </button>
        {info && <span className="text-xs text-slate-600">{info}</span>}
      </div>
    </div>
  );
}

function BarisPerintah({ perintah }: { perintah: string }) {
  const [tersalin, setTersalin] = useState(false);
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100">
      <code className="break-all">{perintah}</code>
      <button
        type="button"
        aria-label={`Salin ${perintah}`}
        className="flex shrink-0 items-center gap-1 text-slate-300 hover:text-white"
        onClick={() => {
          void navigator.clipboard.writeText(perintah).then(() => {
            setTersalin(true);
            setTimeout(() => setTersalin(false), 1500);
          });
        }}
      >
        {tersalin ? <Check size={12} /> : <Copy size={12} />}
        {tersalin ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}

const KUNCI_AGENT = "playbook-agent";

/** Agent pilihan pengguna, diingat di browser. Bawaannya agent pertama yang sudah terpasang. */
function useAgent(lingkungan: Lingkungan | null) {
  const [pilihan, setPilihan] = useState<string | null>(() => {
    try {
      return localStorage.getItem(KUNCI_AGENT);
    } catch {
      return null;
    }
  });
  const bawaan = AGENTS.find((a) => a.program && lingkungan?.agen[a.program]) ?? AGENTS[0];
  const agent = AGENTS.find((a) => a.id === pilihan) ?? bawaan;
  const pilih = (id: string) => {
    setPilihan(id);
    try {
      localStorage.setItem(KUNCI_AGENT, id);
    } catch {
      // Penyimpanan browser tidak tersedia; pilihan tetap berlaku sampai halaman ditutup.
    }
  };
  return [agent, pilih] as const;
}

function PilihAgent({
  agent,
  lingkungan,
  onPilih,
}: {
  agent: Agent;
  lingkungan: Lingkungan | null;
  onPilih: (id: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="AI agent" className="flex flex-wrap gap-1.5">
      {AGENTS.map((a) => {
        const ada = a.program ? lingkungan?.agen[a.program] : undefined;
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={a.id === agent.id}
            onClick={() => onPilih(a.id)}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs",
              a.id === agent.id
                ? "border-sky-500 bg-sky-50 font-medium text-sky-900"
                : "border-slate-300 text-slate-700 hover:bg-slate-50",
            )}
          >
            {ada !== undefined && (
              <span
                aria-hidden
                className={clsx("size-1.5 rounded-full", ada ? "bg-emerald-500" : "bg-slate-300")}
              />
            )}
            {a.label}
            {ada && <span className="sr-only">(terpasang)</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Perintah pasang (bila agent belum ada) lalu perintah menjalankan satu aksi. */
function PerintahAgent({
  agent,
  lingkungan,
  baris,
}: {
  agent: Agent;
  lingkungan: Lingkungan | null;
  baris: string[];
}) {
  const pasang =
    agent.program && lingkungan && !lingkungan.agen[agent.program]
      ? perintahPasang(agent, lingkungan.platform)
      : null;
  return (
    <div className="space-y-1.5">
      {pasang && (
        <>
          <p className="text-xs text-amber-800">
            {agent.label} belum terpasang. Jalankan ini sekali di terminal, lalu tutup terminal dan
            buka lagi:
          </p>
          <BarisPerintah perintah={pasang} />
        </>
      )}
      {agent.program === null && (
        <p className="text-xs text-slate-600">
          Jalankan agent Anda di folder playbook, lalu tempel prompt ini. Agent perlu bisa membaca
          file dan menjalankan perintah di terminal.
        </p>
      )}
      {baris.map((b) => (
        <BarisPerintah key={b} perintah={b} />
      ))}
    </div>
  );
}

function JalankanAgent({
  project,
  lingkungan,
  agent,
  onPilihAgent,
}: {
  project: StatusProject;
  lingkungan: Lingkungan | null;
  agent: Agent;
  onPilihAgent: (id: string) => void;
}) {
  const [pesan, setPesan] = useState("");
  const belumWajib = project.bahan.filter((b) => b.wajib && b.files.length === 0);
  const selesai = project.langkah.filter((l) => l.selesai).length;
  const opsionalKosong = project.bahan.filter((b) => !b.wajib && b.files.length === 0);

  return (
    <section
      data-section="jalankan-agent"
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Terminal size={14} /> 3. Jalankan AI agent di terminal
      </h2>
      {project.lengkap ? (
        <>
          <p className="text-xs text-slate-600">
            Bahan wajib sudah lengkap.
            {opsionalKosong.length > 0 &&
              ` ${opsionalKosong.map((b) => b.label).join(" dan ")} belum ada; agent akan menanyakannya bila perlu.`}
          </p>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            onClick={() => {
              void api<{ dibuka: boolean }>("/api/buka-terminal", { method: "POST" })
                .then((d) => {
                  setPesan(
                    d.dibuka
                      ? "Terminal terbuka di folder playbook. Salin perintah di bawah ke sana."
                      : `Buka terminal sendiri, lalu jalankan: cd "${lingkungan?.root ?? ""}"`,
                  );
                })
                .catch((e: unknown) => {
                  setPesan(e instanceof Error ? e.message : "Gagal membuka terminal.");
                });
            }}
          >
            <Terminal size={14} /> Buka terminal
          </button>
          {pesan && <p className="text-xs text-slate-600">{pesan}</p>}
          <PilihAgent agent={agent} lingkungan={lingkungan} onPilih={onPilihAgent} />
          <PerintahAgent
            agent={agent}
            lingkungan={lingkungan}
            baris={agent.jalankan("buat-usulan", project.id)}
          />
        </>
      ) : (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          Perintah muncul setelah bahan wajib lengkap. Yang belum ada:{" "}
          {belumWajib.map((b) => b.label).join(", ")}.
        </p>
      )}
      <div>
        <p className="text-xs font-medium text-slate-700">
          Progres agent: {selesai} dari {project.langkah.length} langkah
        </p>
        <ol className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
          {project.langkah.map((l, i) => (
            <li key={l.nama} className="flex items-center gap-2">
              {l.selesai ? (
                <Check size={13} className="text-emerald-600" />
              ) : (
                <Circle size={13} className="text-slate-300" />
              )}
              {i + 1}. {l.nama}
              {l.tinjau && (
                <span className="rounded bg-sky-100 px-1.5 text-[10px] font-semibold text-sky-800">
                  Anda tinjau
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

interface HasilPeriksa {
  errors: string[];
  warnings: string[];
}

function TinjauHasil({
  project,
  lingkungan,
  agent,
}: {
  project: StatusProject;
  lingkungan: Lingkungan | null;
  agent: Agent;
}) {
  const [hasil, setHasil] = useState<HasilPeriksa | null>(null);
  const [error, setError] = useState("");
  const { sesuai, ubah, jumlahEvent } = project.tinjauan;
  const belum = Math.max(0, jumlahEvent - sesuai - ubah);
  const tombol =
    "flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50";

  return (
    <section
      data-section="tinjau-hasil"
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <ClipboardCheck size={14} /> 4. Tinjau hasilnya
      </h2>
      <p className="text-xs text-slate-600">
        Buka hasilnya, klik sebuah event, lalu tandai <b>Sudah sesuai</b> atau <b>Perlu diubah</b>.
        Slide panduan tampil di panel yang sama untuk dibandingkan.
      </p>
      <p className="text-xs font-medium text-slate-700">
        {sesuai} sesuai · {ubah} perlu diubah · {belum} belum ditinjau
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={`#/${project.id}`}
          className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700"
        >
          Buka dan tinjau
        </a>
        <button
          type="button"
          className={tombol}
          onClick={() => {
            setError("");
            void api<HasilPeriksa>(`/api/projects/${project.id}/periksa`)
              .then(setHasil)
              .catch((e: unknown) => {
                setError(e instanceof Error ? e.message : "Pemeriksaan gagal.");
              });
          }}
        >
          <ClipboardCheck size={12} /> Periksa otomatis
        </button>
        <a href={`/api/projects/${project.id}/excel`} className={tombol}>
          <Download size={12} /> Unduh Excel
        </a>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
      {ubah > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-600">
            Ada {ubah} event yang perlu diubah. Jalankan ini di terminal ({agent.label}):
          </p>
          <PerintahAgent
            agent={agent}
            lingkungan={lingkungan}
            baris={agent.jalankan("terapkan-tinjauan", project.id)}
          />
        </div>
      )}
      {hasil && (
        <div data-hasil-periksa className="space-y-1 text-xs">
          <p
            className={clsx(
              "font-medium",
              hasil.errors.length > 0 ? "text-red-700" : "text-emerald-700",
            )}
          >
            {hasil.errors.length > 0
              ? `${hasil.errors.length} masalah harus diperbaiki agent`
              : "Tidak ada masalah yang wajib diperbaiki"}
            {hasil.warnings.length > 0 && `, ${hasil.warnings.length} hal perlu Anda lihat`}
          </p>
          <ul className="max-h-48 list-disc space-y-0.5 overflow-y-auto pl-4 text-slate-600">
            {[...hasil.errors, ...hasil.warnings].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
