import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Konfigurasi Supabase diambil dari environment variable (.env) atau pengaturan tersimpan pengguna
const ENV_SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
  '';

const ENV_SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
  '';

function readCleanSavedSupabaseConfig(): { url: string; anonKey: string } {
  try {
    // Abaikan cache versi lama agar kredensial bawaan template sebelumnya tidak termuat ulang
    if (localStorage.getItem('sipas_data_version') !== 'v4_ra_al_ihsan_sobo_clean') {
      return { url: '', anonKey: '' };
    }
    const raw = localStorage.getItem('sipas_settings');
    if (!raw) return { url: '', anonKey: '' };
    const parsed = JSON.parse(raw);
    const url = (parsed?.supabaseConfig?.url || '').trim();
    const anonKey = (parsed?.supabaseConfig?.anonKey || '').trim();
    if (!url || !anonKey) return { url: '', anonKey: '' };
    return { url, anonKey };
  } catch {
    return { url: '', anonKey: '' };
  }
}

const savedCfg = readCleanSavedSupabaseConfig();

export let SUPABASE_URL = ENV_SUPABASE_URL || savedCfg.url || '';
export let SUPABASE_ANON_KEY = ENV_SUPABASE_ANON_KEY || savedCfg.anonKey || '';
export const SUPABASE_JWKS_URL =
  (import.meta.env.VITE_SUPABASE_JWKS_URL as string) ||
  (SUPABASE_URL ? `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json` : '');

function buildSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  try {
    if (url.trim() && anonKey.trim()) {
      return createClient(url.trim(), anonKey.trim(), {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
  } catch (err) {
    console.warn('Supabase initialization failed:', err);
  }
  return null;
}

export let supabase: SupabaseClient | null = buildSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function reinitSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  SUPABASE_URL = url.trim();
  SUPABASE_ANON_KEY = anonKey.trim();
  supabase = buildSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase && SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Test connectivity with Supabase project
 */
export async function testSupabaseConnection(
  customUrl?: string,
  customAnonKey?: string
): Promise<{
  success: boolean;
  message: string;
  missingTables?: string[];
  permissionDeniedTables?: string[];
}> {
  const activeClient =
    customUrl && customAnonKey
      ? reinitSupabaseClient(customUrl, customAnonKey)
      : supabase;

  if (!activeClient) {
    return {
      success: false,
      message: 'Endpoint URL dan Publishable/Anon Key Supabase belum diisi.',
    };
  }
  try {
    const tablesToCheck = [
      'surat_masuk',
      'surat_keluar',
      'surat_keputusan',
      'arsip_digital',
      'pkkm_dokumen',
      'pengaturan_madrasah',
      'activity_logs',
    ];

    const results = await Promise.all(
      tablesToCheck.map(async (table) => {
        const { error } = await activeClient.from(table).select('id').limit(1);
        return { table, error };
      })
    );

    const permissionDeniedTables = results
      .filter(
        ({ error }) =>
          error &&
          (error.code === '42501' ||
            error.message?.toLowerCase().includes('permission denied'))
      )
      .map(({ table }) => table);

    if (permissionDeniedTables.length > 0) {
      return {
        success: false,
        permissionDeniedTables,
        message: `Izin akses ditolak (permission denied) pada tabel: ${permissionDeniedTables.join(
          ', '
        )}. Salin dan jalankan (Run) Skrip SQL Schema terbaru di bawah ini pada Supabase SQL Editor agar hak akses (GRANT & RLS) aktif untuk semua perangkat.`,
      };
    }

    const missingTables = results
      .filter(
        ({ error }) =>
          error &&
          (error.code === '42P01' ||
            error.code === 'PGRST205' ||
            error.message?.toLowerCase().includes('does not exist') ||
            error.message?.toLowerCase().includes('schema cache'))
      )
      .map(({ table }) => table);

    if (missingTables.length > 0) {
      return {
        success: true,
        missingTables,
        message: `Terhubung ke Supabase, namun tabel berikut belum dibuat: ${missingTables.join(
          ', '
        )}. Salin dan jalankan (Run) Skrip SQL Schema terbaru di Supabase SQL Editor.`,
      };
    }

    const firstUnexpectedErr = results.find(({ error }) => error)?.error;
    if (firstUnexpectedErr) {
      return { success: false, message: firstUnexpectedErr.message };
    }

    return {
      success: true,
      missingTables: [],
      permissionDeniedTables: [],
      message: 'Terhubung aktif dengan seluruh 7 tabel Supabase PostgreSQL (termasuk PKKRA & Realtime multi-perangkat)!',
    };
  } catch (e: any) {
    return { success: false, message: e.message || 'Gagal menghubungi server Supabase.' };
  }
}

/**
 * SQL Schema migration DDL for user to run in Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- SKEMA DATABASE siPAKAR RA AL IHSAN SOBOREJO
-- Jalankan di menu SQL Editor pada Dashboard Supabase Project Anda.
-- Catatan: Skrip ini aman dijalankan ulang (idempotent) dan sudah mencakup GRANT hak akses agar bebas error "permission denied".

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

CREATE UNIQUE INDEX IF NOT EXISTS idx_surat_masuk_agenda_tahun ON public.surat_masuk(nomor_agenda, tahun_agenda);

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

CREATE UNIQUE INDEX IF NOT EXISTS idx_surat_keluar_urut_tahun ON public.surat_keluar(nomor_urut, tahun_surat);

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

CREATE INDEX IF NOT EXISTS idx_pkkm_dokumen_komponen ON public.pkkm_dokumen(komponen_id, sub_menu_id);
CREATE INDEX IF NOT EXISTS idx_pkkm_dokumen_kode ON public.pkkm_dokumen(kode_dokumen);

-- 6. Tabel Pengaturan Madrasah
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

-- 8. Berikan hak akses eksplisit (GRANT) ke role anon, authenticated, service_role
GRANT ALL PRIVILEGES ON TABLE public.surat_masuk TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.surat_keluar TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.surat_keputusan TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.arsip_digital TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.pkkm_dokumen TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.pengaturan_madrasah TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.activity_logs TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 9. Aktifkan Row Level Security (RLS) dengan kebijakan publik untuk REST API
ALTER TABLE public.surat_masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_keluar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_keputusan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arsip_digital ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pkkm_dokumen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan_madrasah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.surat_masuk;
CREATE POLICY "Allow public read-write for SIPAS" ON public.surat_masuk FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.surat_keluar;
CREATE POLICY "Allow public read-write for SIPAS" ON public.surat_keluar FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.surat_keputusan;
CREATE POLICY "Allow public read-write for SIPAS" ON public.surat_keputusan FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.arsip_digital;
CREATE POLICY "Allow public read-write for SIPAS" ON public.arsip_digital FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.pkkm_dokumen;
CREATE POLICY "Allow public read-write for SIPAS" ON public.pkkm_dokumen FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.pengaturan_madrasah;
CREATE POLICY "Allow public read-write for SIPAS" ON public.pengaturan_madrasah FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for SIPAS" ON public.activity_logs;
CREATE POLICY "Allow public read-write for SIPAS" ON public.activity_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 10. Aktifkan Supabase Realtime untuk sinkronisasi instan multi-perangkat (Websocket Push)
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
`;
