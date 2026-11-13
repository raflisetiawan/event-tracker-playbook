// AI coding agent yang bisa dipakai bersama playbook, beserta perintah untuk menjalankannya.
// Claude Code memakai perintah garis miring dari .claude/commands/. Agent lain diberi prompt yang
// menunjuk file langkah yang sama, jadi instruksinya tetap satu sumber.

export type Aksi = "buat-usulan" | "terapkan-tinjauan";

export interface Agent {
  id: string;
  label: string;
  /** Nama program untuk dicek apakah terpasang; null bila tidak bisa dicek. */
  program: string | null;
  /** Perintah pasang per platform (`win32`, `darwin`, `linux`, atau `*`). */
  pasang: Record<string, string>;
  /** Baris perintah yang disalin pengguna ke terminal. */
  jalankan: (aksi: Aksi, id: string) => string[];
}

/**
 * Prompt untuk agent tanpa perintah garis miring. Sengaja tanpa `$`, backtick, dan tanda kutip
 * supaya aman ditempel di dalam tanda kutip di bash, PowerShell, maupun cmd.
 */
export const promptAksi = (aksi: Aksi, id: string) =>
  `Kerjakan project ${id}: ikuti AGENTS.md dan langkah di .claude/commands/${aksi}.md, dengan id project ${id}.`;

export const AGENTS: Agent[] = [
  {
    id: "claude",
    label: "Claude Code",
    program: "claude",
    pasang: {
      win32:
        "curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd",
      darwin: "curl -fsSL https://claude.ai/install.sh | bash",
      linux: "curl -fsSL https://claude.ai/install.sh | bash",
    },
    jalankan: (aksi, id) => ["claude", `/${aksi} ${id}`],
  },
  {
    id: "codex",
    label: "Codex",
    program: "codex",
    pasang: { "*": "npm install -g @openai/codex" },
    jalankan: (aksi, id) => [`codex "${promptAksi(aksi, id)}"`],
  },
  {
    id: "opencode",
    label: "OpenCode",
    program: "opencode",
    pasang: { "*": "npm install -g @opencode/cli" },
    jalankan: (aksi, id) => [`opencode --prompt "${promptAksi(aksi, id)}"`],
  },
  {
    id: "lain",
    label: "Agent lain",
    program: null,
    pasang: {},
    jalankan: (aksi, id) => [promptAksi(aksi, id)],
  },
];

export const perintahPasang = (agent: Agent, platform: string) =>
  agent.pasang[platform] ?? agent.pasang["*"] ?? null;

/** Program yang perlu dicek keberadaannya di komputer pengguna. */
export const PROGRAM_AGENT = AGENTS.flatMap((a) => (a.program ? [a.program] : []));
