import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { Check, X } from "lucide-react";

// Komponen dasar wireframe. Sengaja netral (abu-abu + satu warna aksen), bukan tiruan visual resmi.

type Variant = "primary" | "dark" | "outline" | "link";

export function Btn({
  variant = "outline",
  tour,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; tour?: string }) {
  return (
    <button
      data-tour={tour}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "dark" && "bg-slate-900 text-white hover:bg-slate-700",
        variant === "outline" &&
          "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
        variant === "link" && "px-0 text-blue-600 hover:underline",
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  children,
  className,
  tour,
}: {
  children: ReactNode;
  className?: string;
  tour?: string;
}) {
  return (
    <section
      data-tour={tour}
      className={clsx("rounded-lg border border-slate-200 bg-white", className)}
    >
      {children}
    </section>
  );
}

const chipTone = {
  green: "bg-emerald-50 text-emerald-700",
  yellow: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  red: "bg-rose-50 text-rose-700",
  gray: "bg-slate-100 text-slate-600",
};

export function Chip({
  tone = "gray",
  children,
}: {
  tone?: keyof typeof chipTone;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
        chipTone[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <table className="w-full text-left text-xs">
      <thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
        <tr>
          {head.map((h) => (
            <th key={h} className="px-4 py-2.5 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700">{children}</tbody>
    </table>
  );
}

export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={clsx("px-4 py-3 align-middle", className)}>{children}</td>
);

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = "max-w-lg",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-8">
      <div className={clsx("w-full rounded-xl bg-white shadow-xl", width)}>
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4 text-xs">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none";

export function FakeUpload({ name, tour }: { name: string; tour?: string }) {
  return (
    <div
      data-tour={tour}
      className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-slate-500"
    >
      📎 {name}
    </div>
  );
}

export function Stepper({ active, steps }: { active: number; steps: string[] }) {
  return (
    <div className="border-b border-slate-100 px-5 pt-4">
      <ol className="flex flex-wrap gap-6 pb-3 text-xs">
        {steps.map((s, i) => {
          const n = i + 1;
          const done = n < active;
          return (
            <li
              key={s}
              className={clsx(
                "flex items-center gap-2",
                n === active ? "text-blue-700" : done ? "text-emerald-700" : "text-slate-500",
              )}
            >
              <span
                className={clsx(
                  "flex size-5 items-center justify-center rounded-full text-[10px] font-semibold",
                  done
                    ? "bg-emerald-600 text-white"
                    : n === active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-600",
                )}
              >
                {done ? <Check size={12} /> : n}
              </span>
              {s}
            </li>
          );
        })}
      </ol>
      <div className="h-1 rounded-full bg-slate-100">
        <div
          className="h-1 rounded-full bg-blue-600 transition-all"
          style={{ width: `${(active / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
