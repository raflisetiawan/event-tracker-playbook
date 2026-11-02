import { napzaLabel, pesertaLulus, type NapzaStatus } from "../dummy.ts";
import type { SetSim, SimState } from "../sim.ts";
import { useTrack } from "@engine/wireframe/tracker.tsx";
import { Btn, Chip, Table, Td } from "@engine/wireframe/ui.tsx";
import { DokumenNapza, KartuKandidat, KepalaDaftar, KonfirmasiNapza, Toast } from "./shared.tsx";

// Slide 147–156: Daftar Penugasan Kepala Sekolah (Proses Reguler), termasuk alur NAPZA.

const JALUR = { jalur_penugasan: "reguler" } as const;

const napzaTone: Record<NapzaStatus, "gray" | "blue" | "yellow" | "green" | "red"> = {
  sertifikat_belum_tersedia: "gray",
  sertifikat_tersedia: "blue",
  belum_unggah: "yellow",
  belum_divalidasi: "yellow",
  valid: "green",
  tidak_valid: "red",
};

export function PenugasanReguler({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const target = pesertaLulus.find((p) => p.id === sim.napzaTarget);
  const firstWith = (s: NapzaStatus) => pesertaLulus.find((p) => sim.napza[p.id] === s)?.id;
  const firstKirim = firstWith("sertifikat_tersedia");
  const firstLihat = firstWith("belum_divalidasi");

  return (
    <div className="space-y-4 p-5">
      <Toast sim={sim} setSim={setSim} />
      <KepalaDaftar
        jalur="reguler"
        title="Penugasan Kepala Sekolah (Proses Reguler)"
        stats={["Total Pengajuan", "Sedang Diverifikasi", "Diterima"]}
        aksiRiwayat="Cek Pengajuan"
        setSim={setSim}
      />

      <KartuKandidat
        tour="peserta-lulus"
        title="Daftar Peserta Lulus Pelatihan"
        subtitle="Peserta yang telah dinyatakan lulus pelatihan serta menyelesaikan unggahan dokumen sertifikat"
      >
        <Table head={["No.", "Nama Peserta", "NIP", "Sekolah Asal", "Status Dokumen", "Aksi"]}>
          {pesertaLulus.map((p, i) => {
            const status = sim.napza[p.id];
            return (
              <tr key={p.id}>
                <Td>{i + 1}</Td>
                <Td>{p.nama}</Td>
                <Td className="text-slate-400">19xxxxxxxxxxxxxx</Td>
                <Td>{p.sekolah}</Td>
                <Td>
                  <Chip tone={napzaTone[status]}>{napzaLabel[status]}</Chip>
                </Td>
                <Td>
                  {status === "sertifikat_tersedia" && (
                    <Btn
                      tour={p.id === firstKirim ? "napza-kirim" : undefined}
                      onClick={() => setSim({ modal: "konfirmasi_napza", napzaTarget: p.id })}
                    >
                      Kirim Permintaan Dokumen NAPZA
                    </Btn>
                  )}
                  {status === "belum_divalidasi" && (
                    <Btn
                      tour={p.id === firstLihat ? "napza-lihat-berkas" : undefined}
                      onClick={() => {
                        track("click_penugasan_lihat_berkas_napza", JALUR);
                        setSim({ modal: "dokumen_napza", napzaTarget: p.id, napzaHasil: null });
                      }}
                    >
                      Lihat Berkas
                    </Btn>
                  )}
                  {status !== "sertifikat_tersedia" && status !== "belum_divalidasi" && (
                    <span className="text-slate-400">–</span>
                  )}
                </Td>
              </tr>
            );
          })}
        </Table>
      </KartuKandidat>

      {sim.modal === "konfirmasi_napza" && target && (
        <KonfirmasiNapza
          onClose={() => setSim({ modal: null })}
          onConfirm={() => {
            track("click_penugasan_kirim_permintaan_napza_confirm", {
              ...JALUR,
              jumlah_kandidat: 1,
            });
            setSim({
              modal: null,
              napza: { ...sim.napza, [target.id]: "belum_unggah" },
              toast: "Berhasil. Permintaan dokumen NAPZA berhasil dikirim.",
            });
          }}
        />
      )}

      {sim.modal === "dokumen_napza" && target && (
        <DokumenNapza
          nama={target.nama}
          sekolah={target.sekolah}
          opsi={[
            { value: "valid", label: "Valid" },
            { value: "tidak_valid", label: "Tidak Valid" },
          ]}
          hasil={sim.napzaHasil === "perlu_diperbaiki" ? null : sim.napzaHasil}
          onHasil={(h) => setSim({ napzaHasil: h })}
          onClose={() => setSim({ modal: null })}
          onConfirm={() => {
            const hasil = sim.napzaHasil as "valid" | "tidak_valid";
            track("click_penugasan_validasi_napza_confirm", { ...JALUR, hasil_validasi: hasil });
            setSim({
              modal: null,
              napza: { ...sim.napza, [target.id]: hasil },
              toast: `Dokumen NAPZA ${target.nama} dinyatakan ${napzaLabel[hasil].toLowerCase()}.`,
            });
          }}
        />
      )}
    </div>
  );
}
