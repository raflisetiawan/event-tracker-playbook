import type { WireframeProps } from "@engine/types.ts";
import { useTrack } from "@engine/wireframe/tracker.tsx";
import { AppShell } from "./AppShell.tsx";
import { Beranda, ManajemenKs } from "./screens/Beranda.tsx";
import { BuatPengajuan } from "./screens/BuatPengajuan.tsx";
import { BuatProgram, Pelatihan } from "./screens/Pelatihan.tsx";
import { BuatPemberhentian, PemberhentianDaftar } from "./screens/Pemberhentian.tsx";
import { GuruMemenuhiSyarat, PemetaanKebutuhan, TambahSekolah } from "./screens/Pemetaan.tsx";
import {
  DasborPerubahan,
  PengajuanPerubahanDaftar,
  PengaliranSk,
  Periodisasi,
  VervalPeriodisasi,
  VervalSk,
} from "./screens/PengajuanPerubahan.tsx";
import { BuatPengumuman, BuatUndangan, PengusulanDaftar } from "./screens/Pengusulan.tsx";
import { PenugasanNonReguler } from "./screens/PenugasanNonReguler.tsx";
import { PenugasanReguler } from "./screens/PenugasanReguler.tsx";
import {
  CekBerkas,
  PilihPesertaSubstansi,
  SeleksiAdministrasiDaftar,
  SeleksiSubstansi,
} from "./screens/SeleksiAdministrasi.tsx";
import { SwastaMurni } from "./screens/SwastaMurni.tsx";
import type { MenuKey, Peran, SimState } from "./sim.ts";

/** Peran yang dipakai menu: Pelatihan oleh UPT, Dasbor & Verval SK oleh Super Admin,
 * Pengajuan Perubahan oleh Dinas (atau UPT untuk verval), menu lain oleh Dinas. */
function peranMenu(key: MenuKey, sekarang: Peran): Peran {
  if (key === "beranda") return sekarang;
  if (key === "manajemen_ks") return sekarang === "upt_gtk" ? sekarang : "dinas_pendidikan";
  if (key === "pelatihan") return sekarang === "super_admin" ? sekarang : "upt_gtk";
  if (key === "dasbor" || key === "verval_sk") return "super_admin";
  if (key === "pengajuan_perubahan")
    return sekarang === "super_admin" ? "dinas_pendidikan" : sekarang;
  return "dinas_pendidikan";
}

/** Menu samping yang aktif untuk layar wireframe saat ini. */
function menuAktif(sim: SimState): MenuKey {
  if (sim.screen.startsWith("pemetaan")) return "pemetaan";
  if (sim.screen === "guru_memenuhi_syarat") return "gms";
  if (sim.screen.startsWith("pengusulan")) return "pengusulan";
  if (sim.screen === "beranda") return "beranda";
  if (sim.screen === "manajemen_ks_aktif") return "manajemen_ks";
  if (sim.screen === "dasbor_pengajuan_perubahan") return "dasbor";
  if (sim.screen === "verval_sk_pppk") return "verval_sk";
  if (
    [
      "pengajuan_perubahan",
      "pengajuan_perubahan_periodisasi",
      "verval_periodisasi",
      "pengaliran_sk_pppk",
    ].includes(sim.screen)
  )
    return "pengajuan_perubahan";
  if (sim.screen.startsWith("pelatihan")) return "pelatihan";
  if (sim.screen === "seleksi_substansi") return "seleksi_substansi";
  if (sim.screen.startsWith("seleksi_administrasi")) return "seleksi_administrasi";
  if (sim.screen.startsWith("pemberhentian")) return "pemberhentian";
  if (sim.screen === "penugasan_swasta_murni") return "swasta_murni";
  return sim.jalur;
}

export function Wireframe({ state: sim, setState: setSim }: WireframeProps<SimState>) {
  const track = useTrack();

  // Klik menu samping: buka halaman daftar menu tersebut dan kirim view_* yang sesuai.
  const bukaMenu = (key: MenuKey) => {
    const reset: Partial<SimState> = {
      peran: peranMenu(key, sim.peran),
      tahap: 1,
      modal: null,
      kategori: "semua",
      sekolahTujuan: {},
      alasanPemberhentian: null,
      toast: null,
      pbTahap: 1,
      pbDipilih: [],
      pbData: {},
    };
    switch (key) {
      case "beranda":
        setSim({ ...reset, screen: "beranda", pengumumanDraft: null });
        return track("view_beranda");
      case "manajemen_ks":
        setSim({ ...reset, screen: "manajemen_ks_aktif", ksTab: "aktif", ksFilter: "semua" });
        return track("view_manajemen_ks", { tab_ks: "aktif" });
      case "pengajuan_perubahan":
        setSim({ ...reset, screen: "pengajuan_perubahan" });
        return track("view_pengajuan_perubahan", { jumlah_riwayat: sim.pdPengajuan.length });
      case "dasbor":
        setSim({ ...reset, screen: "dasbor_pengajuan_perubahan" });
        return track("view_dasbor_pengajuan_perubahan");
      case "verval_sk":
        return setSim({ ...reset, screen: "verval_sk_pppk" });
      case "pelatihan":
        setSim({ ...reset, screen: "pelatihan" });
        return track("view_pelatihan");
      case "seleksi_administrasi":
        setSim({ ...reset, screen: "seleksi_administrasi", saPeserta: null });
        return track("view_seleksi_administrasi", { jumlah_riwayat: 2 });
      case "seleksi_substansi":
        return setSim({ ...reset, screen: "seleksi_substansi" });
      case "pengusulan":
        setSim({ ...reset, screen: "pengusulan" });
        return track("view_pengusulan", { jumlah_riwayat: 2 + sim.pgBaru.length });
      case "pemetaan":
        setSim({ ...reset, screen: "pemetaan_kebutuhan" });
        return track("view_demand_ks", { tahun_proyeksi: sim.pkTahun });
      case "gms":
        setSim({ ...reset, screen: "guru_memenuhi_syarat" });
        return track("view_supply_bcks");
      case "swasta_murni":
        setSim({
          ...reset,
          screen: "penugasan_swasta_murni",
          smMode: "form",
          smForm: { nik: "", asal: "", tujuan: "" },
        });
        return track("view_penugasan_swasta_murni");
      case "pemberhentian":
        setSim({ ...reset, screen: "pemberhentian" });
        return track("view_pemberhentian", { jumlah_riwayat: 3 });
      case "reguler":
      case "non_reguler":
        setSim({
          ...reset,
          jalur: key,
          screen: key === "reguler" ? "penugasan_reguler" : "penugasan_non_reguler",
        });
        return track(key === "reguler" ? "view_penugasan_reguler" : "view_penugasan_non_reguler", {
          jumlah_riwayat: 3,
        });
    }
  };

  const p = { sim, setSim };
  return (
    <AppShell active={menuAktif(sim)} onNavigate={bukaMenu} sim={sim} setSim={setSim}>
      {sim.screen === "beranda" && <Beranda {...p} />}
      {sim.screen === "manajemen_ks_aktif" && <ManajemenKs {...p} />}
      {sim.screen === "pengajuan_perubahan" && <PengajuanPerubahanDaftar {...p} />}
      {sim.screen === "pengajuan_perubahan_periodisasi" && <Periodisasi {...p} />}
      {sim.screen === "verval_periodisasi" && <VervalPeriodisasi {...p} />}
      {sim.screen === "pengaliran_sk_pppk" && <PengaliranSk {...p} />}
      {sim.screen === "verval_sk_pppk" && <VervalSk {...p} />}
      {sim.screen === "dasbor_pengajuan_perubahan" && <DasborPerubahan />}
      {sim.screen === "pelatihan" && <Pelatihan {...p} />}
      {sim.screen === "pelatihan_buat_program" && <BuatProgram {...p} />}
      {sim.screen === "seleksi_administrasi" && <SeleksiAdministrasiDaftar setSim={setSim} />}
      {sim.screen === "seleksi_administrasi_cek_berkas" && <CekBerkas {...p} />}
      {sim.screen === "seleksi_administrasi_pilih_peserta_substansi" && (
        <PilihPesertaSubstansi {...p} />
      )}
      {sim.screen === "seleksi_substansi" && <SeleksiSubstansi {...p} />}
      {sim.screen === "pengusulan" && <PengusulanDaftar {...p} />}
      {sim.screen === "pengusulan_buat_pengumuman" && <BuatPengumuman {...p} />}
      {sim.screen === "pengusulan_buat_undangan" && <BuatUndangan {...p} />}
      {sim.screen === "pemetaan_kebutuhan" && <PemetaanKebutuhan {...p} />}
      {sim.screen === "pemetaan_tambah_sekolah" && <TambahSekolah {...p} />}
      {sim.screen === "guru_memenuhi_syarat" && <GuruMemenuhiSyarat {...p} />}
      {sim.screen === "penugasan_reguler" && <PenugasanReguler {...p} />}
      {sim.screen === "penugasan_non_reguler" && <PenugasanNonReguler {...p} />}
      {sim.screen === "penugasan_buat_pengajuan" && <BuatPengajuan {...p} />}
      {sim.screen === "penugasan_swasta_murni" && <SwastaMurni {...p} />}
      {sim.screen === "pemberhentian" && <PemberhentianDaftar {...p} />}
      {sim.screen === "pemberhentian_buat_pengajuan" && <BuatPemberhentian {...p} />}
    </AppShell>
  );
}
