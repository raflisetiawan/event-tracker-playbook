// State simulasi wireframe. Tur mengatur state ini langsung untuk setiap langkah;
// mode bebas mengubahnya lewat klik. Tambahkan field untuk modal, tahap, dan pilihan pengguna.

export interface State {
  /** Nilainya sama dengan screen_name di usulan.md. */
  screen: "beranda";
  /** Dikirim sebagai atribut user_role. */
  peran: string;
}

export const initialState: State = {
  screen: "beranda",
  peran: "pengguna",
};
