import type { ComponentType } from "react";
import type { UsulanData } from "./plugin/parse-usulan.ts";
import type { AttrValue } from "./wireframe/tracker.tsx";

export type { UsulanData, UsulanEvent } from "./plugin/parse-usulan.ts";
export type { AttrValue, Track } from "./wireframe/tracker.tsx";

export interface TourStep<S> {
  /** Nama event; harus ada di usulan.md. */
  event: string;
  /** Nilai `data-tour` elemen yang disorot di wireframe. */
  target: string;
  /** State wireframe sebelum langkah ini disorot (digabung dengan initialState). */
  sim: Partial<S>;
  /** Catatan tambahan khusus tur. */
  catatan?: string;
}

export interface Tour<S> {
  id: string;
  title: string;
  description: string;
  questions: string[];
  steps: TourStep<S>[];
}

export interface WireframeProps<S> {
  state: S;
  /** Menggabungkan patch ke state; langsung berlaku untuk track() berikutnya. */
  setState: (patch: Partial<S>) => void;
}

/** Yang disediakan tiap tribe di `tribe.tsx`. Hanya id, nama, dan usulan yang wajib. */
export interface TribeConfig<S = unknown> {
  id: string;
  nama: string;
  usulan: UsulanData;
  /** Pola nama event tambahan yang dikirim setelah respons API sukses (selain *_confirm). */
  eventSubmitTambahan?: string;
  // Tanpa bagian di bawah ini, hasilnya tampil sebagai katalog event saja.
  initialState?: S;
  tours?: Tour<S>[];
  Wireframe?: ComponentType<WireframeProps<S>>;
  /** screen_name layar yang sedang tampil. */
  screenOf?: (state: S) => string;
  /** Atribut yang ikut di semua event, mis. user_role dan kode_wilayah. */
  konteks?: (state: S) => Record<string, AttrValue>;
  /** Event yang tercatat saat halaman pertama kali dibuka. */
  eventAwal?: { name: string; attrs?: Record<string, AttrValue> };
}

export const defineTribe = <S>(config: TribeConfig<S>) => config;
