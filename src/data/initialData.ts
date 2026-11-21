import {
  MadrasahSettings,
  SuratMasuk,
  SuratKeluar,
  SuratKeputusan,
  ArsipDigital,
  UserProfile,
  KlasifikasiSurat,
  ActivityLog,
} from '../types';

export const initialMadrasahSettings: MadrasahSettings = {
  namaMadrasah: "RA AL IHSAN SOBOREJO",
  namaAplikasi: "siPAKAR",
  nsm: "101233230062",
  npsn: "69742668",
  alamat: "Dusun Nglarangan 02/03, Desa Soborejo",
  kecamatan: "Pringsurat",
  kabupaten: "Temanggung",
  provinsi: "Jawa Tengah",
  kodePos: "56272",
  telepon: "-",
  email: "alihsanrasoborejo@gmail.com",
  website: "-",
  kepalaMadrasah: "MUIN, S.Pd.I.",
  nipKepalaMadrasah: "-",
  operatorMadrasah: "Nur Hidayah",
  nipOperatorMadrasah: "-",
  kodeMadrasah: "RA.23.14.14",
  formatPenomoranSK: "XXX Tahun YYYY",
  logoUrl: "/src/assets/images/madrasah_logo_1794281106438.jpg",
  kopSuratFormat: "RAUDLATUL ATHFAL AL IHSAN SOBOREJO\nTERAKREDITASI B (SK NOMOR: 558/BAN-PDM/SK/2025)",
  kopSurat: {
    baris1Instansi: "RAUDLATUL ATHFAL",
    baris2Judul: "RA AL IHSAN SOBOREJO",
    baris3Status: 'TERAKREDITASI "B" · SK NOMOR: 558/BAN-PDM/SK/2025 · NSRA: 101233230062 · NPSN: 69742668',
    baris4Alamat: "Alamat: Dusun Nglarangan 02/03, Desa Soborejo, Kecamatan Pringsurat, Kabupaten Temanggung, Jawa Tengah 56272",
    baris5Kontak: "Email: alihsanrasoborejo@gmail.com",
    baris6Tambahan: "",
    tampilkanLogo: true,
    posisiLogo: 'left',
    logoKananUrl: '',
    ukuranLogo: 'md',
    perataanTeks: 'center',
    warnaJudul: 'emerald',
    gayaGarisBawah: 'double',
    warnaGarisBawah: 'slate',
  },
  supabaseConfig: {
    url: "",
    anonKey: "",
    isConnected: false,
  },
  googleDriveConfig: {
    folderIdSuratMasuk: "",
    folderIdSuratKeluar: "",
    folderIdSK: "",
    folderIdArsip: "",
    serviceAccountEmail: "alihsanrasoborejo@gmail.com",
    isConnected: false,
    driveFolderUrl: "",
    urlSuratMasuk: "",
    urlSuratKeluar: "",
    urlSK: "",
    urlArsip: "",
    appsScriptUrl: "",
    activeMode: "folder-link",
  },
  adminPassword: "Nglarangan123#",
  izinkanNomorManual: true,
};

export const initialKlasifikasiSurat: KlasifikasiSurat[] = [
  { kode: 'PP.00', nama: 'Kurikulum & Pembelajaran', deskripsi: 'Penyusunan jadwal, kalender pendidikan RA, pembelajaran, asesmen perkembangan anak' },
  { kode: 'PP.01', nama: 'Kesiswaan & PPDB', deskripsi: 'Penerimaan peserta didik baru RA, mutasi siswa, kegiatan anak, lomba' },
  { kode: 'KS.01.1', nama: 'Kepegawaian & Ketenagaan', deskripsi: 'Pengangkatan guru, mutasi, pembagian tugas mengajar, cuti' },
  { kode: 'HM.00', nama: 'Hubungan Masyarakat', deskripsi: 'Kerjasama instansi, komite RA/wali murid, kunjungan tamu, publikasi' },
  { kode: 'KU.00', nama: 'Keuangan & BOP RA', deskripsi: 'Pengelolaan dana BOP RA, RKAM, SPJ keuangan, permohonan dana' },
  { kode: 'PR.00', nama: 'Perencanaan RA', deskripsi: 'Rencana kerja RA (RKT/RKAM), evaluasi diri RA' },
  { kode: 'BA.00', nama: 'Bantuan & Sarpras', deskripsi: 'Bantuan operasional, hibah sarana prasarana, APE, inventarisasi gedung' },
  { kode: 'OT.00', nama: 'Organisasi & Tata Laksana', deskripsi: 'Struktur organisasi, pedoman kerja, SOP RA' },
];

// Single Administrator Account for siPAKAR
export const singleAdministrator: UserProfile = {
  id: 'admin-1',
  name: 'Administrator siPAKAR',
  email: 'alihsanrasoborejo@gmail.com',
  role: 'admin',
  jabatan: 'Administrator Sistem siPAKAR',
  isActive: true,
};

// Default Read-Only Viewer Profile for visitors
export const guestViewerProfile: UserProfile = {
  id: 'viewer-guest',
  name: 'Mode Tamu',
  email: 'tamu@raalihsansoborejo.sch.id',
  role: 'viewer',
  jabatan: 'Mode Hanya Lihat (Read-Only)',
  isActive: true,
};

export const initialUsers: UserProfile[] = [singleAdministrator];

// Clean empty tables ready for production use
export const initialSuratMasuk: SuratMasuk[] = [];
export const initialSuratKeluar: SuratKeluar[] = [];
export const initialSuratKeputusan: SuratKeputusan[] = [];
export const initialArsipDigital: ArsipDigital[] = [];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'log-init',
    userId: 'admin-1',
    userName: 'Administrator siPAKAR',
    action: 'Inisialisasi Sistem',
    entityType: 'Pengaturan',
    details: 'Sistem siPAKAR RA AL IHSAN SOBOREJO siap digunakan. Seluruh data awal telah dibersihkan.',
    timestamp: new Date().toISOString(),
  },
];
