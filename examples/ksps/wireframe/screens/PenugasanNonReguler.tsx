import { kandidatAdm, napzaLabelNR, type NapzaStatusNR } from "../dummy.ts";
import type { SetSim, SimState } from "../sim.ts";
import { useTrack } from "@engine/wireframe/tracker.tsx";
import { Btn, Chip, Table, Td } from "@engine/wireframe/ui.tsx";
import { DokumenNapza, KartuKandidat, KepalaDaftar, KonfirmasiNapza, Toast } from "./shared.tsx";

// Slide 117–127: Daftar Penugasan Kepala Sekolah (Proses Non-Reguler), termasuk alur NAPZA
// untuk kandidat lulus seleksi administrasi.

const JALUR = { jalur_penugasan: "non_reguler" } as const;

const napzaTone: Record<NapzaStatusNR, "gray" | "yellow" | "green" | "red"> = {
  belum_diundang: "gray",
  belum_mengunggah: "yellow",
  belum_diverifikasi: "yellow",
  gagal_verifikasi: "red",
  valid: "green",
};

const hasilKeStatus = {
  valid: "valid",
  tidak_valid: "gagal_verifikasi",
  // Status setelah "Perlu Diperbaiki" tidak dijelaskan di panduan; diasumsikan peserta
  // mengunggah ulang (belum dikonfirmasi tim produk).
  perlu_diperbaiki: "belum_mengunggah",
} as const satisfies Record<string, NapzaStatusNR>;

const hasilLabel = {
  valid: "Valid",
  tidak_valid: "Tidak Valid",
  perlu_diperbaiki: "Perlu Diperbaiki",
};

export function PenugasanNonReguler({ sim, setSim }: { sim: SimState; setSim: SetSim }) {
  const track = useTrack();
  const target = kandidatAdm.find((k) => k.id === sim.napzaTarget);
  const firstWith = (s: NapzaStatusNR) => kandidatAdm.find((k) => sim.napzaNR[k.id] === s)?.id;
  const firstKirim = firstWith("belum_diundang");
  const firstLihat = firstWith("belum_diverifikasi");

  return (
    <div className="space-y-4 p-5">
      <Toast sim={sim} setSim={setSim} />
      <KepalaDaftar
        jalur="non_reguler"
        title="Penugasan Kepala Sekolah (Proses Non-Reguler)"
        stats={["Total Penugasan", "Sedang Diverifikasi", "Selesai"]}
        aksiRiwayat="Cek Penugasan"
        setSim={setSim}
      />

      <KartuKandidat
        tour="kandidat-adm"
        title="Daftar Kandidat Lulus Seleksi Administrasi"
        subtitle="Kandidat yang telah dinyatakan lulus seleksi administrasi dengan dokumen yang telah divalidasi"
      >
        <Table head={["No.", "Nama Peserta", "NIP", "Sekolah Asal", "Status Dokumen", "Aksi"]}>
          {kandidatAdm.map((k, i) => {
            const status = sim.napzaNR[k.id];
            return (
              <tr key={k.id}>
                <Td>{i + 1}</Td>
                <Td>{k.nama}</Td>
                <Td className="text-slate-400">19xxxxxxxxxxxxxx</Td>
                <Td>{k.sekolah}</Td>
                <Td>
                  <Chip tone={napzaTone[status]}>{napzaLabelNR[status]}</Chip>
                </Td>
                <Td>
                  {status === "belum_diundang" && (
                    <Btn
                      tour={k.id === firstKirim ? "napza-kirim" : undefined}
                      onClick={() => setSim({ modal: "konfirmasi_napza", napzaTarget: k.id })}
                    >
                      Kirim Permintaan Dokumen NAPZA
                    </Btn>
                  )}
                  {status === "belum_mengunggah" && (
                    <span className="text-slate-500">Menunggu Dokumen Peserta</span>
                  )}
                  {status === "belum_diverifikasi" && (
                    <Btn
                      tour={k.id === firstLihat ? "napza-lihat-berkas" : undefined}
                      onClick={() => {
                        track("click_penugasan_lihat_berkas_napza", JALUR);
                        setSim({ modal: "dokumen_napza", napzaTarget: k.id, napzaHasil: null });
                      }}
                    >
                      Lihat Berkas
                    </Btn>
                  )}
                  {(status === "gagal_verifikasi" || status === "valid") && (
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
              napzaNR: { ...sim.napzaNR, [target.id]: "belum_mengunggah" },
              toast: "Berhasil. Permintaan dokumen NAPZA berhasil dikirim.",
            });
          }}
        />
      )}

      {sim.modal === "dokumen_napza" && target && (
        <DokumenNapza
          nama={target.nama}
          sekolah={target.sekolah}
          opsi={(["valid", "tidak_valid", "perlu_diperbaiki"] as const).map((v) => ({
            value: v,
            label: hasilLabel[v],
          }))}
          hasil={sim.napzaHasil}
          onHasil={(h) => setSim({ napzaHasil: h })}
          onClose={() => setSim({ modal: null })}
          onConfirm={() => {
            const hasil = sim.napzaHasil!;
            track("click_penugasan_validasi_napza_confirm", { ...JALUR, hasil_validasi: hasil });
            setSim({
              modal: null,
              napzaNR: { ...sim.napzaNR, [target.id]: hasilKeStatus[hasil] },
              toast: `Dokumen NAPZA ${target.nama}: ${hasilLabel[hasil]}.`,
            });
          }}
        />
      )}
    </div>
  );
}
