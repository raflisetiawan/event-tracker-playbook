import type { ReactNode } from "react";
import clsx from "clsx";
import { Box } from "lucide-react";

// Kerangka wireframe generik: bilah atas + menu samping. Tribe bisa memakai ini apa adanya
// atau membuat kerangka sendiri bila aplikasinya jauh berbeda (lihat examples/ksps).

export interface MenuItem {
  label: string;
  /** Kunci navigasi; tanpa kunci, menu tampil nonaktif (layarnya belum dibuat). */
  key?: string;
  indent?: 1 | 2;
  icon?: ReactNode;
}

export function Shell({
  namaAplikasi,
  menu,
  aktif,
  onNavigate,
  kananAtas,
  children,
}: {
  namaAplikasi: string;
  menu: MenuItem[];
  aktif?: string;
  onNavigate: (key: string) => void;
  kananAtas?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[640px] flex-col bg-slate-100 text-slate-800">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-7 items-center justify-center rounded bg-sky-500 text-white">
            <Box size={16} />
          </span>
          {namaAplikasi}
          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
            WIREFRAME
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-700">
          {kananAtas}
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav className="w-52 shrink-0 space-y-0.5 bg-slate-800 px-2 py-3 text-[11px] text-slate-200">
          {menu.map((m) => (
            <button
              key={m.label}
              type="button"
              disabled={!m.key}
              data-tour={m.key ? `menu-${m.key}` : undefined}
              onClick={() => m.key && onNavigate(m.key)}
              className={clsx(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left",
                m.indent === 1 && "pl-4",
                m.indent === 2 && "pl-7",
                m.key === aktif && "bg-sky-600 font-medium text-white",
                m.key && m.key !== aktif && "hover:bg-slate-700",
              )}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </nav>
        <main className="relative min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
