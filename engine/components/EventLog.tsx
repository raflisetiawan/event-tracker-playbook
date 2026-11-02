import clsx from "clsx";
import type { AttrValue } from "../wireframe/tracker.tsx";

export interface LoggedEvent {
  id: number;
  name: string;
  time: string;
  trigger: string;
  screen: string;
  attributes: Record<string, AttrValue>;
  /** Atribut yang ada di dokumen usulan tetapi tidak dikirim wireframe. */
  missing: string[];
  /** Event tidak ada di dokumen usulan. */
  unknown: boolean;
}

export function EventLog({
  log,
  onSelect,
  onClear,
}: {
  log: LoggedEvent[];
  onSelect: (name: string) => void;
  onClear: () => void;
}) {
  if (log.length === 0) {
    return (
      <p className="p-4 text-sm text-slate-500">
        Belum ada event. Klik tombol di wireframe untuk mensimulasikan.
      </p>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
        <span>Terbaru di atas · contoh nilai atribut (fiktif)</span>
        <button onClick={onClear} className="hover:text-slate-800">
          Bersihkan
        </button>
      </div>
      <ol className="divide-y divide-slate-100">
        {log.map((e) => (
          <li key={e.id}>
            <button
              onClick={() => onSelect(e.name)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={clsx(
                    "font-mono text-xs font-medium break-all",
                    e.unknown ? "text-red-700" : "text-slate-900",
                  )}
                >
                  {e.name}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-slate-400">{e.time}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                <span className="rounded bg-sky-100 px-1.5 text-sky-800">{e.trigger}</span>
                <span className="rounded bg-slate-100 px-1.5 font-mono text-slate-600">
                  {e.screen}
                </span>
              </div>
              <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-2 font-mono text-[10px] text-slate-600">
                {Object.entries(e.attributes).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-slate-400">{k}</dt>
                    <dd className="break-all">{String(v)}</dd>
                  </div>
                ))}
              </dl>
              {e.unknown && (
                <p className="mt-1 text-[10px] text-red-700">Tidak ada di dokumen usulan.</p>
              )}
              {e.missing.length > 0 && (
                <p className="mt-1 text-[10px] text-amber-700">
                  Atribut belum dikirim: {e.missing.join(", ")}
                </p>
              )}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
