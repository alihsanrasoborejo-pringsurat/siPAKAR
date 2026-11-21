import { PkkmKomponenId } from '../types';

export interface PkkmSubItem {
  id: string; // '1', '2', '3', ...
  kode: string; // '1.1.1.', '1.1.2.', ...
  label: string;
}

export interface PkkmSubMenu {
  id: string; // '1', '2', '3', ...
  kode: string; // '1.1.', '1.2.', ...
  tabLabel: string; // concise label for single-line tab navigation
  fullTitle: string; // exact full criterion title
  subItems?: PkkmSubItem[];
}

export interface PkkmKomponen {
  id: PkkmKomponenId;
  tabId: string; // 'pkkra-pengembangan', etc.
  nomor: number;
  sidebarLabel: string;
  title: string;
  subtitle: string;
  subMenus: PkkmSubMenu[];
}

export const PKKM_COMPONENTS: PkkmKomponen[] = [
  {
    id: 'pengembangan_ra',
    tabId: 'pkkra-pengembangan',
    nomor: 1,
    sidebarLabel: '1. Usaha Pengembangan RA',
    title: 'Usaha Pengembangan Raudlatul Athfal',
    subtitle:
      'Pengembangan organisasi, perubahan pembelajaran efektif, hubungan masyarakat, pencapaian SNP, layanan khusus, dan pemanfaatan TIK RA.',
    subMenus: [
      {
        id: '1',
        kode: '1.1.',
        tabLabel: '1.1. Sesuai Kebutuhan RA',
        fullTitle: 'Mengembangkan Raudlatul Athfal sesuai dengan kebutuhan',
        subItems: [
          {
            id: '1',
            kode: '1.1.1.',
            label: 'Mampu mengembangkan struktur organisasi yang sesuai dengan kebutuhan program',
          },
          {
            id: '2',
            kode: '1.1.2.',
            label: 'Mampu menempatkan personalia yang sesuai dengan kebutuhan',
          },
          {
            id: '3',
            kode: '1.1.3.',
            label: 'Mampu mengembangkan pedoman dan prosedur kerja organisasi RA',
          },
        ],
      },
      {
        id: '2',
        kode: '1.2.',
        tabLabel: '1.2. Organisasi Pembelajar',
        fullTitle:
          'Mengelola perubahan dan pengembangan Raudlatul Athfal menuju organisasi pembelajar yang efektif',
        subItems: [
          {
            id: '1',
            kode: '1.2.1.',
            label:
              'Mampu mengembangkan program baru untuk meningkatkan pencapaian target yang lebih tinggi.',
          },
          {
            id: '2',
            kode: '1.2.2.',
            label:
              'Mampu dan terampil dalam membangun tim kerja yang efektif untuk mendapatkan produk kinerja yang lebih unggul',
          },
          {
            id: '3',
            kode: '1.2.3.',
            label: 'Mampu mengembangkan potensi dan meningkatkan prestasi Raudlatul Athfal',
          },
        ],
      },
      {
        id: '3',
        kode: '1.3.',
        tabLabel: '1.3. Hubungan Masyarakat',
        fullTitle:
          'Mengelola hubungan antara Raudlatul Athfal dan masyarakat dalam rangka pencarian dukungan ide, sumber belajar, dan pembiayaan',
        subItems: [
          {
            id: '1',
            kode: '1.3.1.',
            label: 'Merencanakan kerjasama dengan lembaga pemerintah, swasta dan masyarakat',
          },
          {
            id: '2',
            kode: '1.3.2.',
            label:
              'Melakukan pendekatan-pendekatan dalam rangka mendapatkan dukungan dari lembaga pemerintah, swasta dan masyarakat',
          },
        ],
      },
      {
        id: '4',
        kode: '1.4.',
        tabLabel: '1.4. Pencapaian SNP',
        fullTitle:
          'Mengelola proses pencapaian SNP sesuai dengan arah dan tujuan Pendidikan Nasional',
        subItems: [
          {
            id: '1',
            kode: '1.4.1.',
            label: 'Mengaplikasikan pengembangan kurikulum yang mengacu kepada standar isi',
          },
          {
            id: '2',
            kode: '1.4.2.',
            label:
              'Mengaplikasikan pengembangan proses pembelajaran yang mengacu kepada standar proses',
          },
          {
            id: '3',
            kode: '1.4.3.',
            label:
              'Mengaplikasikan sistem penilaian pembelajaran yang mengacu kepada standar penilaian',
          },
          {
            id: '4',
            kode: '1.4.4.',
            label: 'Melaksanakan penjaminan mutu pencapaian standar kompetensi lulusan',
          },
        ],
      },
      {
        id: '5',
        kode: '1.5.',
        tabLabel: '1.5. Unit Layanan Khusus',
        fullTitle:
          'Mengelola unit layanan khusus Raudlatul Athfal dalam mendukung kegiatan pembelajaran dan kegiatan peserta didik di Raudlatul Athfal',
        subItems: [
          {
            id: '1',
            kode: '1.5.1.',
            label:
              'Mampu mengelola perpustakaan Raudlatul Athfal dalam menyiapkan sumber belajar yang diperlukan peserta didik',
          },
        ],
      },
      {
        id: '6',
        kode: '1.6.',
        tabLabel: '1.6. Sistem Informasi RA',
        fullTitle:
          'Mengelola sistem informasi Raudlatul Athfal dalam mendukung penyusunan program dan pengambilan keputusan',
        subItems: [
          {
            id: '1',
            kode: '1.6.1.',
            label:
              'Memanfaatkan teknologi informasi dan komunikasi dalam manajemen Raudlatul Athfal',
          },
          {
            id: '2',
            kode: '1.6.2.',
            label:
              'Memanfaatkan teknologi informasi dan komunikasi dalam pembelajaran, baik sebagai sumber belajar maupun sebagai alat/media pembelajaran',
          },
          {
            id: '3',
            kode: '1.6.3.',
            label:
              'Memanfaatkan teknologi informasi dan komunikasi dalam menjalin kerjasama dengan pihak lain',
          },
        ],
      },
      {
        id: '7',
        kode: '1.7.',
        tabLabel: '1.7. Kemajuan Teknologi Informasi',
        fullTitle:
          'Memanfaatkan kemajuan teknologi informasi bagi peningkatan pembelajaran dan manajemen Raudlatul Athfal',
        subItems: [
          {
            id: '1',
            kode: '1.7.1.',
            label:
              'Mampu mengembangkan sistem administrasi pengelolaan secara efektif dengan dukungan penerapan teknologi informasi dan komunikasi',
          },
          {
            id: '2',
            kode: '1.7.2.',
            label:
              'Mengelola administrasi pembelajaran secara efektif dengan dukungan penerapan teknologi informasi dan komunikasi',
          },
        ],
      },
    ],
  },
  {
    id: 'manajerial',
    tabId: 'pkkra-manajerial',
    nomor: 2,
    sidebarLabel: '2. Pelaksanaan Tugas Manajerial',
    title: 'Pelaksanaan Tugas Manajerial',
    subtitle:
      'Perencanaan RA, kepemimpinan sumber daya, budaya belajar kondusif, pengelolaan SDM, sarpras, peserta didik, kurikulum, keuangan, ketatausahaan, dan monev.',
    subMenus: [
      {
        id: '1',
        kode: '2.1.',
        tabLabel: '2.1. Perencanaan RA',
        fullTitle: 'Menyusun perencanaan Raudlatul Athfal untuk berbagai tingkatan perencanaan',
        subItems: [
          {
            id: '1',
            kode: '2.1.1.',
            label:
              'Mampu mengembangkan RKT/RKAM dengan program lainnya berdasarkan data hasil evaluasi dalam pemenuhan SNP',
          },
        ],
      },
      {
        id: '2',
        kode: '2.2.',
        tabLabel: '2.2. Pendayagunaan SDM',
        fullTitle:
          'Memimpin Raudlatul Athfal dalam rangka pendayagunaan sumber daya Raudlatul Athfal secara optimal',
        subItems: [
          {
            id: '1',
            kode: '2.2.1.',
            label:
              'Mampu memberikan contoh disiplin, hadir tepat waktu, disiplin menggunakan waktu, dan tepat waktu mengakhiri pekerjaan.',
          },
          {
            id: '2',
            kode: '2.2.2.',
            label: 'Mampu melaksanakan peraturan sesuai dengan ketentuan yang berlaku',
          },
          {
            id: '3',
            kode: '2.2.3.',
            label: 'Mampu menunjukkan kedisiplinan sebagai insan pembelajar',
          },
        ],
      },
      {
        id: '3',
        kode: '2.3.',
        tabLabel: '2.3. Budaya & Iklim RA',
        fullTitle:
          'Menciptakan budaya dan iklim Raudlatul Athfal yang kondusif dan inovatif bagi pembelajaran peserta didik',
        subItems: [
          {
            id: '1',
            kode: '2.3.1.',
            label:
              'Mampu melengkapi sarana dan prasarana untuk menciptakan suasana belajar kondusif dan inovatif bagi peserta didik',
          },
          {
            id: '2',
            kode: '2.3.2.',
            label:
              'Mampu memfasilitasi kegiatan-kegiatan lomba di bidang akademik dan non akademik bagi peserta didik',
          },
        ],
      },
      {
        id: '4',
        kode: '2.4.',
        tabLabel: '2.4. Guru & Staf',
        fullTitle:
          'Mengelola guru dan staf dalam rangka pendayagunaan sumber daya manusia secara optimal.',
        subItems: [
          {
            id: '1',
            kode: '2.4.1.',
            label: 'Mampu melakukan pembinaan berkala untuk meningkatkan mutu SDM Raudlatul Athfal',
          },
          {
            id: '2',
            kode: '2.4.2.',
            label:
              'Memantau dan menilai penerapan hasil pelatihan dalam pekerjaan di Raudlatul Athfal',
          },
        ],
      },
      {
        id: '5',
        kode: '2.5.',
        tabLabel: '2.5. Sarana & Prasarana',
        fullTitle:
          'Mengelola sarana dan prasarana Raudlatul Athfal dalam rangka pendayagunaan secara optimal',
        subItems: [
          {
            id: '1',
            kode: '2.5.1.',
            label:
              'Mampu mengelola fasilitas prasarana perabot dan sarana Raudlatul Athfal (gedung, bangunan, dan lahan meja, kursi, lemari, peralatan kantor dan alat kebersihan)',
          },
        ],
      },
      {
        id: '6',
        kode: '2.6.',
        tabLabel: '2.6. Peserta Didik',
        fullTitle:
          'Mengelola peserta didik dalam rangka penerimaan peserta didik baru, dan penempatan dan pengembangan kapasitas peserta didik',
        subItems: [
          {
            id: '1',
            kode: '2.6.1.',
            label:
              'Menyusun perencanaan penerimaan, pengelolaan dan pengembangan kompetensi peserta didik',
          },
          {
            id: '2',
            kode: '2.6.2.',
            label:
              'Memfasilitasi kegiatan pengembangan diri bagi peserta didik, pendidik dan tenaga kependidikan lainnya secara optimal',
          },
        ],
      },
      {
        id: '7',
        kode: '2.7.',
        tabLabel: '2.7. Kurikulum & Pembelajaran',
        fullTitle:
          'Mengelola pengembangan kurikulum dan kegiatan pembelajaran sesuai dengan arah dan tujuan pendidikan nasional',
        subItems: [
          {
            id: '1',
            kode: '2.7.1.',
            label:
              'Mampu mengarahkan secara efektif dalam menerapkan prinsip-prinsip pengembangan kurikulum yang berlaku dalam kegiatan IHT, workshop, Rapat Koordinasi dan Kegiatan KKG RA',
          },
          {
            id: '2',
            kode: '2.7.2.',
            label:
              'Mampu mengendalikan pelaksanaan kurikulum berlandaskan kalender pendidikan, menerbitkan surat keputusan pembagian tugas mengajar dan menerapkan aturan akademik',
          },
          {
            id: '3',
            kode: '2.7.3.',
            label: 'Memfasilitasi efektivitas tim kerja guru dalam rangka meningkatkan mutu pembelajaran',
          },
        ],
      },
      {
        id: '8',
        kode: '2.8.',
        tabLabel: '2.8. Keuangan RA',
        fullTitle:
          'Mengelola keuangan Raudlatul Athfal sesuai dengan prinsip pengelolaan yang akuntabel, transparan, dan efisien',
        subItems: [
          {
            id: '1',
            kode: '2.8.1.',
            label:
              'Mampu merencanakan kebutuhan keuangan Raudlatul Athfal sesuai dengan rencana pengembangan Raudlatul Athfal, baik jangka pendek maupun jangka panjang',
          },
          {
            id: '2',
            kode: '2.8.2.',
            label:
              'Mampu membuat laporan dan evaluasi pengelolaan keuangan Raudlatul Athfal sesuai dengan prinsip efisien, transparan dan akuntabel',
          },
        ],
      },
      {
        id: '9',
        kode: '2.9.',
        tabLabel: '2.9. Ketatausahaan RA',
        fullTitle:
          'Mengelola ketatausahaan Raudlatul Athfal dalam mendukung pencapaian tujuan Raudlatul Athfal',
        subItems: [
          {
            id: '1',
            kode: '2.9.1.',
            label:
              'Mampu mengelola administrasi surat masuk dan surat keluar sesuai dengan pedoman persuratan yang berlaku',
          },
          {
            id: '2',
            kode: '2.9.2.',
            label:
              'Mampu mengelola administrasi kearsipan Raudlatul Athfal baik arsip dinamis maupun arsip lainnya',
          },
        ],
      },
      {
        id: '10',
        kode: '2.10.',
        tabLabel: '2.10. Monitoring & Evaluasi',
        fullTitle:
          'Melakukan monitoring, evaluasi dan pelaporan pelaksanaan program kegiatan Raudlatul Athfal dengan prosedur yang tepat, serta merencanakan tindak lanjutnya',
        subItems: [
          {
            id: '1',
            kode: '2.10.1.',
            label:
              'Melakukan monitoring dan evaluasi kerja program pendidikan dengan menggunakan teknik yang sesuai',
          },
        ],
      },
    ],
  },
  {
    id: 'kewirausahaan',
    tabId: 'pkkra-kewirausahaan',
    nomor: 3,
    sidebarLabel: '3. Pengembangan Kewirausahaan',
    title: 'Pengembangan Kewirausahaan',
    subtitle:
      'Inovasi pengembangan RA, kerja keras organisasi pembelajaran efektif, motivasi kepemimpinan, dan ketangguhan mencari solusi kelembagaan.',
    subMenus: [
      {
        id: '1',
        kode: '3.1.',
        tabLabel: '3.1. Inovasi Pengembangan RA',
        fullTitle: 'Menciptakan inovasi yang bermanfaat dan tepat bagi pengembangan Raudlatul Athfal',
        subItems: [
          {
            id: '1',
            kode: '3.1.1.',
            label: 'Menggunakan metode teknik dan proses perubahan madrasah',
          },
        ],
      },
      {
        id: '2',
        kode: '3.2.',
        tabLabel: '3.2. Kerja Keras & Efektif',
        fullTitle:
          'Bekerja keras untuk mencapai keberhasilan Raudlatul Athfal sebagai organisasi pembelajaran yang efektif',
        subItems: [
          {
            id: '1',
            kode: '3.2.1.',
            label:
              'Mampu bertindak kreatif dan inovatif dalam melaksanakan pekerjaan melalui cara berpikir dan cara bertindak',
          },
          {
            id: '2',
            kode: '3.2.2.',
            label:
              'Mampu menumbuhkan jiwa kewirausahaan (kreatif, inovatif dan produktif) di kalangan warga Raudlatul Athfal',
          },
          {
            id: '3',
            kode: '3.2.3.',
            label: 'Mampu mencatat ide-ide baru, kemudian mengembangkannya',
          },
        ],
      },
      {
        id: '3',
        kode: '3.3.',
        tabLabel: '3.3. Motivasi Kepemimpinan',
        fullTitle:
          'Memiliki motivasi yang kuat untuk sukses dalam melaksanakan tugas pokok dan fungsinya sebagai pemimpin Raudlatul Athfal',
        subItems: [
          {
            id: '1',
            kode: '3.3.1.',
            label: 'Bersedia belajar dari orang lain',
          },
          {
            id: '2',
            kode: '3.3.2.',
            label: 'Ingin melakukan yang terbaik',
          },
          {
            id: '3',
            kode: '3.3.3.',
            label: 'Menciptakan perubahan yang kuat',
          },
        ],
      },
      {
        id: '4',
        kode: '3.4.',
        tabLabel: '3.4. Solusi Masalah RA',
        fullTitle:
          'Pantang menyerah dan selalu mencari solusi terbaik dalam menghadapi kendala yang dihadapi Raudlatul Athfal',
        subItems: [
          {
            id: '1',
            kode: '3.4.1.',
            label:
              'Mampu melibatkan tokoh agama, masyarakat dan pemerintah dalam memecahkan masalah kelembagaan',
          },
        ],
      },
    ],
  },
  {
    id: 'supervisi',
    tabId: 'pkkra-supervisi',
    nomor: 4,
    sidebarLabel: '4. Supervisi Guru & Tendik',
    title: 'Supervisi Kepada Guru dan Tenaga Kependidikan',
    subtitle:
      'Penyusunan program supervisi akademik dan pelaksanaan supervisi akademik dengan pendekatan serta teknik yang tepat.',
    subMenus: [
      {
        id: '1',
        kode: '4.1.',
        tabLabel: '4.1. Program Supervisi Akademik',
        fullTitle:
          'Menyusun program supervisi akademik dalam rangka peningkatan profesionalisme guru',
        subItems: [
          {
            id: '1',
            kode: '4.1.1.',
            label: 'Mengidentifikasi masalah yang guru hadapi dalam pelaksanaan pembelajaran',
          },
          {
            id: '2',
            kode: '4.1.2.',
            label: 'Mampu merumuskan tujuan yang dilengkapi dengan target pencapaian yang terukur',
          },
          {
            id: '3',
            kode: '4.1.3.',
            label: 'Mampu mengembangkan instrumen supervisi',
          },
        ],
      },
      {
        id: '2',
        kode: '4.2.',
        tabLabel: '4.2. Pelaksanaan Supervisi',
        fullTitle:
          'Melaksanakan supervisi akademik terhadap guru dengan menggunakan pendekatan dan teknik supervisi yang tepat',
        subItems: [
          {
            id: '1',
            kode: '4.2.1.',
            label:
              'Mengadakan pertemuan awal untuk menjaring data rencana pembelajaran dan menetapkan fokus kegiatan supervisi',
          },
          {
            id: '2',
            kode: '4.2.2.',
            label:
              'Melaksanakan kegiatan pemantauan pembelajaran dan membuat catatan yang objektif dan selektif sebagai bahan pemecahan masalah supervisi',
          },
          {
            id: '3',
            kode: '4.2.3.',
            label:
              'Melakukan pertemuan refleksi, menganalisis catatan hasil observasi, dan menyimpulkan hasil observasi',
          },
          {
            id: '4',
            kode: '4.2.4.',
            label:
              'Bersama guru menyusun rekomendasi tindak lanjut perbaikan dalam bentuk kegiatan analisis butir soal, remedial, dan pengayaan',
          },
        ],
      },
    ],
  },
];

export const PKKRA_COMPONENTS = PKKM_COMPONENTS;

export function getPkkmKomponenByTab(tabId: string): PkkmKomponen | undefined {
  return PKKM_COMPONENTS.find((k) => k.tabId === tabId);
}

export function getPkkmKomponenById(komponenId: PkkmKomponenId): PkkmKomponen {
  return PKKM_COMPONENTS.find((k) => k.id === komponenId) || PKKM_COMPONENTS[0];
}
