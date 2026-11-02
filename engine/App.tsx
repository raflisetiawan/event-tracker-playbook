import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { driver, type Driver } from "driver.js";
import clsx from "clsx";
import { Play, RotateCcw } from "lucide-react";
import { EventCard } from "./components/EventCard.tsx";
import { EventLog, type LoggedEvent } from "./components/EventLog.tsx";
import { Katalog } from "./components/Katalog.tsx";
import { countBy, createIndex, popoverHtml, prioClass, type UsulanIndex } from "./lib/usulan.ts";
import type { AttrValue, TribeConfig } from "./types.ts";
import { TrackerContext, type Track } from "./wireframe/tracker.tsx";

let nextLogId = 1;

function makeEntry(
  index: UsulanIndex,
  name: string,
  attrs: Record<string, AttrValue>,
  currentScreen: string,
  konteks: Record<string, AttrValue>,
): LoggedEvent {
  const def = index.eventsByName.get(name);
  // view_* dikirim saat layar tujuan tampil; pakai screen_name dari dokumen bila berbeda.
  const screen =
    def && def.screenNames.length > 0 && !def.screenNames.includes(currentScreen)
      ? def.screenNames[0]
      : currentScreen;
  return {
    id: nextLogId++,
    name,
    time: new Date().toLocaleTimeString("id-ID", { hour12: false }),
    trigger: def ? index.trigger(def) : "?",
    screen,
    attributes: { ...konteks, ...attrs },
    missing: def ? def.atribut.filter((a) => !(a in attrs)) : [],
    unknown: !def,
  };
}

export function TourApp<S>({
  tribe,
  tribeIds,
  onPilihTribe,
}: {
  tribe: TribeConfig<S>;
  tribeIds: string[];
  onPilihTribe: (id: string) => void;
}) {
  const index = useMemo(() => createIndex(tribe), [tribe]);
  const tours = useMemo(() => tribe.tours ?? [], [tribe]);
  const adaWireframe = Boolean(tribe.Wireframe && tribe.initialState !== undefined);
  const initial = tribe.initialState as S;

  const [tampilan, setTampilan] = useState<"tur" | "katalog">(adaWireframe ? "tur" : "katalog");
  const [tourId, setTourId] = useState(tours[0]?.id ?? "");
  const [state, setReactState] = useState<S>(initial);
  const [touring, setTouring] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  // Naik setiap navigasi tur, agar efek tetap jalan walau indeks langkah tidak berubah.
  const [navTick, setNavTick] = useState(0);
  const [panel, setPanel] = useState<"detail" | "log">("detail");
  const [focusEvent, setFocusEvent] = useState(
    tours[0]?.steps[0]?.event ?? tribe.usulan.events[0]?.name ?? "",
  );
  const [log, setLog] = useState<LoggedEvent[]>(() =>
    tribe.eventAwal && adaWireframe
      ? [
          makeEntry(
            index,
            tribe.eventAwal.name,
            tribe.eventAwal.attrs ?? {},
            tribe.screenOf?.(initial) ?? "",
            tribe.konteks?.(initial) ?? {},
          ),
        ]
      : [],
  );

  // Selalu berisi state terbaru, supaya track() setelah setState memakai konteks yang baru.
  const stateRef = useRef<S>(initial);
  const driverRef = useRef<Driver | null>(null);
  // Wadah wireframe; Driver.js bisa menggesernya ke samping saat menyorot elemen di kanan.
  const frameRef = useRef<HTMLDivElement>(null);
  // Callback yang dijalankan setelah wireframe selesai dirender untuk langkah tur berikutnya.
  const pendingRef = useRef<(() => void) | null>(null);

  const tour = tours.find((t) => t.id === tourId);
  const prioCount = countBy(tribe.usulan.events, (e) => e.prio);

  const replaceState = useCallback((next: S) => {
    stateRef.current = next;
    setReactState(next);
  }, []);
  const setState = useCallback(
    (patch: Partial<S>) => replaceState({ ...stateRef.current, ...patch }),
    [replaceState],
  );

  const track = useCallback<Track>(
    (name, attrs = {}) => {
      const s = stateRef.current;
      const entry = makeEntry(
        index,
        name,
        attrs,
        tribe.screenOf?.(s) ?? "",
        tribe.konteks?.(s) ?? {},
      );
      setLog((l) => [entry, ...l].slice(0, 100));
      setFocusEvent(name);
    },
    [index, tribe],
  );

  useEffect(() => {
    const cb = pendingRef.current;
    if (!cb) return;
    pendingRef.current = null;
    // DOM sudah ter-commit saat efek jalan; setTimeout memberi jeda agar layout stabil.
    setTimeout(cb, 30);
  }, [stepIndex, navTick]);

  useEffect(() => () => driverRef.current?.destroy(), []);

  const goTo = (i: number, after: () => void) => {
    const step = tour!.steps[i];
    pendingRef.current = after;
    replaceState({ ...initial, ...step.sim });
    setStepIndex(i);
    setFocusEvent(step.event);
    setNavTick((n) => n + 1);
  };

  const startTour = (from = 0) => {
    if (!tour) return;
    driverRef.current?.destroy();
    setPanel("detail");
    const d = driver({
      showProgress: true,
      popoverClass: "playbook-popover",
      progressText: "{{current}} / {{total}}",
      nextBtnText: "Berikutnya →",
      prevBtnText: "← Sebelumnya",
      doneBtnText: "Selesai",
      steps: tour.steps.map((s) => ({
        element: () => document.querySelector<HTMLElement>(`[data-tour="${s.target}"]`)!,
        popover: {
          title: s.event,
          description: popoverHtml(index, index.eventsByName.get(s.event), s.catatan),
        },
      })),
      onNextClick: () => {
        const next = (d.getActiveIndex() ?? 0) + 1;
        if (next >= tour.steps.length) return d.destroy();
        goTo(next, () => d.moveTo(next));
      },
      onPrevClick: () => {
        const prev = (d.getActiveIndex() ?? 0) - 1;
        if (prev < 0) return;
        goTo(prev, () => d.moveTo(prev));
      },
      onDestroyed: () => {
        setTouring(false);
        // Driver.js bisa menggeser lagi saat menutup; reset setelah jeda singkat.
        setTimeout(() => frameRef.current?.scrollTo({ left: 0 }), 100);
      },
    });
    driverRef.current = d;
    setTouring(true);
    goTo(from, () => d.drive(from));
  };

  const Wireframe = tribe.Wireframe;

  return (
    <TrackerContext.Provider value={track}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Usulan Event: {tribe.nama}</h1>
                <p className="text-xs text-slate-500">{tribe.usulan.status}</p>
              </div>
              {tribeIds.length > 1 && (
                <select
                  aria-label="Pilih tribe"
                  value={tribe.id}
                  onChange={(e) => onPilihTribe(e.target.value)}
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                >
                  {tribeIds.map((id) => (
                    <option key={id}>{id}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-white">
                {tribe.usulan.events.length} event
              </span>
              {(["P0", "P1", "P2"] as const).map((p) => (
                <span key={p} className={clsx("rounded-full px-2.5 py-1", prioClass[p])}>
                  {p}: {prioCount[p] ?? 0}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] space-y-4 px-4 py-4">
          {adaWireframe && (
            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-sm">
              {(["tur", "katalog"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    driverRef.current?.destroy();
                    setTampilan(t);
                  }}
                  className={clsx(
                    "rounded-md px-4 py-1.5",
                    tampilan === t ? "bg-sky-600 text-white" : "text-slate-600",
                  )}
                >
                  {t === "tur" ? "Tur wireframe" : "Katalog event"}
                </button>
              ))}
            </div>
          )}

          {tampilan === "tur" && tour && (
            <section className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <select
                aria-label="Pilih tur"
                value={tourId}
                onChange={(e) => {
                  driverRef.current?.destroy();
                  const next = tours.find((t) => t.id === e.target.value)!;
                  setTourId(next.id);
                  replaceState({ ...initial, ...next.steps[0]?.sim });
                }}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-medium"
              >
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
              <p className="min-w-60 flex-1 text-xs text-slate-600">
                {tour.description}{" "}
                <span className="text-slate-400">({tour.questions.join(", ")})</span>
              </p>
              <button
                onClick={() => {
                  driverRef.current?.destroy();
                  replaceState({ ...initial, ...tour.steps[0]?.sim });
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                onClick={() => startTour(0)}
                className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                <Play size={16} /> Mulai tur
              </button>
              <ol className="flex w-full gap-1.5 overflow-x-auto pb-1">
                {tour.steps.map((s, i) => {
                  const e = index.eventsByName.get(s.event);
                  return (
                    <li key={i} className="shrink-0">
                      <button
                        onClick={() => startTour(i)}
                        className={clsx(
                          "rounded-md border px-2 py-1 text-left font-mono text-[11px]",
                          touring && i === stepIndex
                            ? "border-sky-400 bg-sky-50"
                            : "border-slate-200 hover:bg-slate-50",
                        )}
                      >
                        <span className="mr-1 text-slate-400">{i + 1}.</span>
                        {s.event}
                        {e && (
                          <span
                            className={clsx(
                              "ml-1.5 rounded px-1 font-sans font-semibold",
                              prioClass[e.prio],
                            )}
                          >
                            {e.prio}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            {tampilan === "tur" && Wireframe ? (
              <div
                ref={frameRef}
                className="overflow-x-auto rounded-xl border border-slate-300 shadow-sm"
              >
                <div className="min-w-[1180px]">
                  <Wireframe state={state} setState={setState} />
                </div>
              </div>
            ) : (
              <Katalog
                usulan={tribe.usulan}
                index={index}
                onPilih={(name) => {
                  setFocusEvent(name);
                  setPanel("detail");
                }}
              />
            )}

            <aside className="self-start rounded-xl border border-slate-200 bg-white xl:sticky xl:top-4">
              <div className="flex border-b border-slate-200 text-sm">
                {(
                  [
                    ["detail", "Detail event"],
                    ["log", `Log event (${log.length})`],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setPanel(id)}
                    className={clsx(
                      "flex-1 px-4 py-2.5",
                      panel === id
                        ? "border-b-2 border-sky-600 font-medium text-sky-800"
                        : "text-slate-500",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                {panel === "detail" ? (
                  <EventCard
                    index={index}
                    event={index.eventsByName.get(focusEvent)}
                    name={focusEvent}
                  />
                ) : (
                  <EventLog
                    log={log}
                    onSelect={(name) => {
                      setFocusEvent(name);
                      setPanel("detail");
                    }}
                    onClear={() => setLog([])}
                  />
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </TrackerContext.Provider>
  );
}
