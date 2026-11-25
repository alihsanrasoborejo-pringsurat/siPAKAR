-- ============================================================================
-- SKEMA DATABASE siPAKAR RA AL IHSAN SOBOREJO
-- Jalankan di menu SQL Editor pada Dashboard Supabase Project Anda.
-- Skrip ini aman dijalankan ulang (idempotent) dan sudah mencakup:
--   1. Pembuatan seluruh 7 tabel utama + index
--   2. Hak akses role PostgreSQL (GRANT) agar bebas error "permission denied"
--   3. Row Level Security (RLS) policy untuk akses API publik aplikasi
--   4. Publikasi Supabase Realtime untuk sinkronisasi instan multi-perangkat
-- ============================================================================

-- Pastikan role Supabase memiliki akses ke schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 1. Tabel Surat Masuk
CREATE TABLE IF NOT EXISTS public.surat_masuk (
  id TEXT PRIMARY KEY,
  nomor_agenda TEXT NOT NULL,
  tahun_agenda INTEGER NOT NULL,
  nomor_surat_pengirim TEXT NOT NULL,
  tanggal_surat DATE NOT NULL,
  tanggal_diterima DATE NOT NULL,
  pengirim TEXT NOT NULL,
  perihal TEXT NOT NULL,
  ringkasan TEXT,
  kategori TEXT NOT NULL,
  sifat TEXT NOT NULL,
  tujuan_internal TEXT,
  status TEXT NOT NULL,
  catatan TEXT,
  file_doc JSONB,
  disposisi JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_surat_masuk_agenda_tahun
  ON public.surat_masuk(nomor_agenda, tahun_agenda);

-- 2. Tabel Surat Keluar
CREATE TABLE IF NOT EXISTS public.surat_keluar (
  id TEXT PRIMARY KEY,
  nomor_urut INTEGER NOT NULL,
  nomor_surat_lengkap TEXT NOT NULL UNIQUE,
  tahun_surat INTEGER NOT NULL,
  bulan_surat TEXT NOT NULL,
  kode_klasifikasi TEXT NOT NULL,
  tanggal_surat DATE NOT NULL,
  tujuan_surat TEXT NOT NULL,
  nama_penerima TEXT,
  jabatan_penerima TEXT,
  alamat_penerima TEXT,
  perihal TEXT NOT NULL,
  ringkasan TEXT,
  kategori TEXT NOT NULL,
  sifat TEXT NOT NULL,
  status TEXT NOT NULL,
  catatan TEXT,
  file_doc JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_surat_keluar_urut_tahun
  ON public.surat_keluar(nomor_urut, tahun_surat);

-- 3. Tabel Surat Keputusan (SK)
CREATE TABLE IF NOT EXISTS public.surat_keputusan (
  id TEXT PRIMARY KEY,
  nomor_sk TEXT NOT NULL UNIQUE,
  nomor_urut INTEGER NOT NULL,
  tahun INTEGER NOT NULL,
  judul TEXT NOT NULL,
  tentang TEXT NOT NULL,
  tanggal_sk DATE NOT NULL,
  tahun_pelajaran TEXT,
  penandatangan TEXT NOT NULL,
  jabatan_penandatangan TEXT NOT NULL,
  status TEXT NOT NULL,
  ringkasan TEXT,
  file_doc JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- 4. Tabel Arsip Digital
CREATE TABLE IF NOT EXISTS public.arsip_digital (
  id TEXT PRIMARY KEY,
  kode_arsip TEXT NOT NULL UNIQUE,
  judul_arsip TEXT NOT NULL,
  kategori TEXT NOT NULL,
  tahun INTEGER NOT NULL,
  nomor_dokumen_terkait TEXT,
  deskripsi TEXT,
  tags TEXT[],
  file_doc JSONB NOT NULL,
  lokasi_fisik TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- 5. Tabel Dokumen PKKRA (Penilaian Kinerja Kepala Raudlatul Athfal)
CREATE TABLE IF NOT EXISTS public.pkkm_dokumen (
  id TEXT PRIMARY KEY,
  komponen_id TEXT NOT NULL,
  sub_menu_id TEXT NOT NULL,
  sub_item_id TEXT,
  kode_dokumen TEXT NOT NULL,
  judul_dokumen TEXT NOT NULL,
  tahun_ajaran TEXT,
  tahun INTEGER NOT NULL,
  tanggal_dokumen DATE,
  penanggung_jawab TEXT,
  status_verifikasi TEXT NOT NULL DEFAULT 'Lengkap',
  keterangan TEXT,
  file_doc JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_pkkm_dokumen_komponen
  ON public.pkkm_dokumen(komponen_id, sub_menu_id);
CREATE INDEX IF NOT EXISTS idx_pkkm_dokumen_kode
  ON public.pkkm_dokumen(kode_dokumen);

-- 6. Tabel Pengaturan RA (Identitas, Kop Surat, Konfigurasi Apps Script)
CREATE TABLE IF NOT EXISTS public.pengaturan_madrasah (
  id TEXT PRIMARY KEY DEFAULT 'default_setting',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Log Aktivitas
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. GRANT HAK AKSES TABEL KE ROLE anon, authenticated, service_role
-- (Wajib agar tidak muncul error "permission denied for table surat_masuk")
-- ============================================================================
GRANT ALL PRIVILEGES ON TABLE public.surat_masuk TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.surat_keluar TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.surat_keputusan TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.arsip_digital TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.pkkm_dokumen TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.pengaturan_madrasah TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.activity_logs TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) UNTUK MULTI-PERANGKAT
-- ============================================================================
ALTER TABLE public.surat_masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_keluar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_keputusan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arsip_digital ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pkkm_dokumen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan_madrasah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.surat_masuk;
CREATE POLICY "Allow public read-write for SIPAS"
  ON public.surat_masuk FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.surat_keluar;
CREATE POLICY "Allow public read-write for SIPAS"
  ON public.surat_keluar FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.surat_keputusan;
CREATE POLICY "Allow public read-write for SIPAS"
  ON public.surat_keputusan FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.arsip_digital;
CREATE POLICY "Allow public read-write for SIPAS"
  ON public.arsip_digital FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.pkkm_dokumen;
CREATE POLICY "Allow public read-write for SIPAS"
  ON public.pkkm_dokumen FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.pengaturan_madrasah;
CREATE POLICY "Allow public read-write for SIPAS"
  ON public.pengaturan_madrasah FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.activity_logs;
CREATE POLICY "Allow public read-write for SIPAS"
  ON public.activity_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- 10. SUPABASE REALTIME MULTI-PERANGKAT + RELOAD SCHEMA CACHE
-- ============================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.surat_masuk;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.surat_keluar;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.surat_keputusan;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arsip_digital;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pkkm_dokumen;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pengaturan_madrasah;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

NOTIFY pgrst, 'reload schema';
