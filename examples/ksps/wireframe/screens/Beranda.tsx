import { useState } from "react";
import clsx from "clsx";
import { BookOpen, Download, Megaphone, Search } from "lucide-react";
import { ksAktifDaftar, ksTidakAktifDaftar, labelKode } from "../dummy.ts";
import type { SetSim, SimState } from "../sim.ts";
import { useTrack } from "@engine/wireframe/tracker.tsx";
import { Btn, Card, Chip, inputClass, Modal, Table, Td } from "@engine/wireframe/ui.tsx";
import { Toast } from "./shared.tsx";

// Slide 23 & 263–265: Beranda (pengumuman diatur Super Admin); slide 259–261: Manajemen KS Aktif.

const MAKS_PENGUMUMAN = 500;

export function Beranda({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const superAdmin = sim.peran === "super_admin";
  const draft = sim.pengumumanDraft;

  return (
    <div className="space-y-4 p-5">
      <Toast sim={sim} setSim={setSim} />
      <Card tour="page-beranda" className="p-5">
        <h2 className="text-base font-semibold text-slate-900">Selamat datang di SIM KSPSTK</h2>
        <p className="mt-1 text-xs text-slate-600">
          Sistem Informasi dan Manajemen Kepala Sekolah, Pengawas Sekolah, dan Tenaga Kependidikan.
        </p>
      </Card>

      <Card className="space-y-2 p-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Megaphone size={14} /> Pengumuman
          </h3>
          {superAdmin && draft === null && (
            <Btn tour="br-ubah" onClick={() => setSim({ pengumumanDraft: sim.pengumuman })}>
              Ubah
            </Btn>
          )}
        </div>
        {draft === null ? (
          <p className="text-slate-700">{sim.pengumuman}</p>
        ) : (
          <>
            <textarea
              className={inputClass}
              rows={3}
              maxLength={MAKS_PENGUMUMAN}
              value={draft}
              onChange={(e) => setSim({ pengumumanDraft: e.target.value })}
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {draft.length}/{MAKS_PENGUMUMAN} karakter
              </span>
              <div className="flex gap-2">
                <Btn onClick={() => setSim({ pengumumanDraft: null })}>Batal</Btn>
                <Btn
                  variant="primary"
                  tour="br-simpan"
                  disabled={!draft.trim()}
                  onClick={() => setSim({ modal: "br_pengumuman_confirm" })}
                >
                  Simpan
                </Btn>
              </div>
            </div>
          </>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="space-y-2 p-4 text-xs">
          <h3 className="text-sm font-semibold text-slate-900">
            Penugasan Guru sebagai Kepala Sekolah
          </h3>
          <p className="text-slate-600">Mulai dari menu Kepala Sekolah di sebelah kiri.</p>
        </Card>
        <Card className="flex items-center justify-between p-4 text-xs">
          <span className="text-slate-600">
            Pelajari panduan penugasan Guru sebagai Kepala Sekolah.
          </span>
          <Btn tour="br-pelajari" onClick={() => track("click_pelajari_panduan")}>
            <BookOpen size={12} /> Pelajari
          </Btn>
        </Card>
      </div>

      {sim.modal === "br_pengumuman_confirm" && draft !== null && (
        <Modal
          title="Simpan pengumuman?"
          subtitle="Pengumuman akan tampil di beranda semua pengguna"
          onClose={() => setSim({ modal: null })}
          footer={
            <>
              <Btn onClick={() => setSim({ modal: null })}>Batal</Btn>
              <Btn
                variant="primary"
                tour="br-pengumuman-confirm"
                onClick={() => {
                  track("click_pengumuman_beranda_simpan", { jumlah_karakter: draft.length });
                  setSim({
                    modal: null,
                    pengumuman: draft,
                    pengumumanDraft: null,
                    toast: "Pengumuman berhasil disimpan.",
                  });
                }}
              >
                Simpan
              </Btn>
            </>
          }
        >
          <p className="rounded-md bg-slate-50 p-3 text-slate-700">{draft}</p>
        </Modal>
      )}
    </div>
  );
}

const filterTab = {
  aktif: ["semua", "segera_pensiun"],
  tidak_aktif: ["pensiun", "meninggal_dunia"],
} as const;

export function ManajemenKs({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const [cari, setCari] = useState("");
  const aktif = sim.ksTab === "aktif";
  const cocok = (nama: string, sekolah: string) =>
    `${nama} ${sekolah}`.toLowerCase().includes(cari.toLowerCase());
  const lolosAktif = (f: string) => ksAktifDaftar.filter((k) => f === "semua" || k.segeraPensiun);
  const lolosTidak = (f: string) => ksTidakAktifDaftar.filter((k) => k.kategori === f);
  const sumber = aktif ? lolosAktif(sim.ksFilter) : lolosTidak(sim.ksFilter);
  const daftarJenjang = aktif ? ksAktifDaftar : ksTidakAktifDaftar;

  const gantiTab = (tab: SimState["ksTab"]) => {
    track("click_manajemen_ks_tab", { tab_ks: tab });
    setSim({ ksTab: tab, ksFilter: filterTab[tab][0] });
  };

  return (
    <div className="space-y-4 p-5">
      <div data-tour="page-manajemen-ks" className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Manajemen Kepala Sekolah</h2>
        <Btn
          variant="dark"
          tour="ks-unduh"
          onClick={() => track("download_daftar_ks", { tab_ks: sim.ksTab })}
        >
          <Download size={14} /> Unduh Daftar
        </Btn>
      </div>

      <div
        data-tour="ks-tab"
        className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 text-xs"
      >
        {(["aktif", "tidak_aktif"] as const).map((t) => (
          <button
            key={t}
            onClick={() => gantiTab(t)}
            className={clsx(
              "rounded px-4 py-1.5",
              sim.ksTab === t ? "bg-blue-600 text-white" : "text-slate-600",
            )}
          >
            {t === "aktif" ? "Aktif" : "Tidak Aktif"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(["tk", "sd", "smp", "sma"] as const).map((j) => (
          <Card key={j} className="p-3">
            <p className="text-[10px] text-slate-500">
              KS {aktif ? "aktif" : "tidak aktif"} {j.toUpperCase()}
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {daftarJenjang.filter((k) => k.jenjang === j).length}
            </p>
          </Card>
        ))}
      </div>

      <Card className="space-y-3 p-4">
        <div className="relative">
          <Search size={13} className="absolute top-2 left-2.5 text-slate-400" />
          <input
            className={clsx(inputClass, "pl-7")}
            placeholder="Cari nama sekolah atau kepala sekolah"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
        </div>
        <div data-tour="ks-filter" className="flex gap-1.5 text-[11px]">
          {filterTab[sim.ksTab].map((f) => (
            <button
              key={f}
              onClick={() => {
                const jumlah = (aktif ? lolosAktif(f) : lolosTidak(f)).length;
                track("click_manajemen_ks_filter", {
                  tab_ks: sim.ksTab,
                  filter_value: f,
                  jumlah_hasil: jumlah,
                });
                setSim({ ksFilter: f });
              }}
              className={clsx(
                "rounded-full border px-2.5 py-0.5",
                sim.ksFilter === f
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600",
              )}
            >
              {labelKode(f)}
            </button>
          ))}
        </div>
        <div className="overflow-hidden rounded-md border border-slate-200">
          {aktif ? (
            <Table head={["Nama Kepala Sekolah", "Nama Sekolah", "Usia", "Tanggal Pensiun", ""]}>
              {ksAktifDaftar
                .filter((k) => sumber.some((s) => s.id === k.id) && cocok(k.nama, k.sekolah))
                .map((k) => (
                  <tr key={k.id}>
                    <Td className="font-medium text-slate-900">{k.nama}</Td>
                    <Td>{k.sekolah}</Td>
                    <Td>{k.usia}</Td>
                    <Td>{k.pensiun}</Td>
                    <Td>{k.segeraPensiun && <Chip tone="yellow">Segera pensiun</Chip>}</Td>
                  </tr>
                ))}
            </Table>
          ) : (
            <Table
              head={[
                "Nama Kepala Sekolah",
                "Sekolah Terakhir",
                "Kategori",
                "Terhitung Tanggal",
                "No. SK Pensiun / Akta Kematian",
              ]}
            >
              {ksTidakAktifDaftar
                .filter((k) => sumber.some((s) => s.id === k.id) && cocok(k.nama, k.sekolah))
                .map((k) => (
                  <tr key={k.id}>
                    <Td className="font-medium text-slate-900">{k.nama}</Td>
                    <Td>{k.sekolah}</Td>
                    <Td>{labelKode(k.kategori)}</Td>
                    <Td>{k.tanggal}</Td>
                    <Td>{k.dokumen}</Td>
                  </tr>
                ))}
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
