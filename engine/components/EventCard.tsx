import type { ReactNode } from "react";
import clsx from "clsx";
import { prioClass, type UsulanEvent, type UsulanIndex } from "../lib/usulan.ts";

export function EventCard({
  index,
  event,
  name,
  children,
}: {
  index: UsulanIndex;
  event: UsulanEvent | undefined;
  name: string;
  children?: ReactNode;
}) {
  if (!event) {
    return (
      <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Event <code className="font-mono">{name}</code> tidak ada di dokumen usulan. Periksa nama di{" "}
        <code className="font-mono">tours.ts</code> atau wireframe.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="font-mono text-sm font-medium break-all text-slate-900">{event.name}</p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
          <span className={clsx("rounded-full px-2 py-0.5", prioClass[event.prio])}>
            {event.prio}
          </span>
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-800">
            {index.trigger(event)}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
            {event.status}
          </span>
        </div>
      </div>

      {children}

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Pemicu</dt>
          <dd className="text-slate-800">{event.pemicu}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            screen_name
          </dt>
          <dd className="font-mono text-xs text-slate-800">
            {event.screenNames.join(" / ") || "(halaman aktif)"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Atribut</dt>
          <dd>
            {event.atribut.length === 0 && (
              <span className="text-slate-500">Hanya user_role & kode_wilayah</span>
            )}
            <ul className="space-y-1">
              {event.atribut.map((a) => (
                <li key={a}>
                  <code className="rounded bg-slate-100 px-1 font-mono text-xs">{a}</code>{" "}
                  <span className="text-xs text-slate-600">
                    {index.attributesByKey.get(a)?.keterangan}
                  </span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Pertanyaan perilaku
          </dt>
          <dd>
            <ul className="space-y-1">
              {event.questions.map((q) => (
                <li key={q} className="text-xs text-slate-700">
                  <b>{q}</b> {index.questionsById.get(q)?.pertanyaan}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Slide panduan
          </dt>
          <dd className="space-y-1.5 text-xs text-slate-600">
            <p>
              {event.tahap} · slide {event.slide}
            </p>
            {event.slide && (
              <a
                href={index.slideUrl(event.slide)}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <img
                  src={index.slideUrl(event.slide)}
                  alt={`Slide panduan ${event.slide}`}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="w-full rounded-md border border-slate-200 hover:opacity-90"
                />
              </a>
            )}
            <p className="font-mono text-[10px] break-all text-slate-400">{event.guidePath}</p>
          </dd>
        </div>
      </dl>
    </div>
  );
}
