import { useState } from 'react';
import {
  GOOGLE_APPS_SCRIPT_CODE,
  testAppsScriptConnection,
  AppsScriptPingResult,
} from '../../services/googleDriveService';
import { storageService } from '../../services/storageService';
import { MadrasahSettings } from '../../types';
import {
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  FolderSync,
  Sparkles,
  Link2,
  FolderOpen,
  Save,
  Code2,
  Copy,
  Check,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GoogleDriveCardProps {
  onStatusChanged?: (connected: boolean) => void;
  compact?: boolean;
  settings?: MadrasahSettings;
  onUpdateSettings?: (cfg: Partial<MadrasahSettings['googleDriveConfig']>) => void;
}

export default function GoogleDriveCard({
  onStatusChanged,
  compact = false,
  settings: propSettings,
  onUpdateSettings,
}: GoogleDriveCardProps) {
  const currentSettings = propSettings || storageService.getSettings();
  const driveConfig = currentSettings.googleDriveConfig || {
    folderIdSuratMasuk: '',
    folderIdSuratKeluar: '',
    folderIdSK: '',
    folderIdArsip: '',
    folderIdPkkm: '',
    serviceAccountEmail: currentSettings.email || 'alihsanrasoborejo@gmail.com',
    isConnected: false,
    driveFolderUrl: '',
    appsScriptUrl: '',
    activeMode: 'apps-script',
  };

  // Default to Google Apps Script mode
  const initialMode: 'apps-script' | 'folder-link' =
    driveConfig.activeMode === 'folder-link' && !driveConfig.appsScriptUrl
      ? 'folder-link'
      : 'apps-script';

  // State
  const [activeTabMode, setActiveTabMode] = useState<'apps-script' | 'folder-link'>(initialMode);
  const [appsScriptUrl, setAppsScriptUrl] = useState(driveConfig.appsScriptUrl || '');
  const [folderUrl, setFolderUrl] = useState(driveConfig.driveFolderUrl || '');
  const [accountEmail, setAccountEmail] = useState(
    driveConfig.serviceAccountEmail || currentSettings.email || 'alihsanrasoborejo@gmail.com'
  );
  const [urlMasuk, setUrlMasuk] = useState(driveConfig.urlSuratMasuk || '');
  const [urlKeluar, setUrlKeluar] = useState(driveConfig.urlSuratKeluar || '');
  const [urlSK, setUrlSK] = useState(driveConfig.urlSK || '');
  const [urlArsip, setUrlArsip] = useState(driveConfig.urlArsip || '');
  const [urlPkkm, setUrlPkkm] = useState(driveConfig.urlPkkm || '');
  const [showSubFolders, setShowSubFolders] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Apps Script test & UI state
  const [isTestingScript, setIsTestingScript] = useState(false);
  const [scriptTestResult, setScriptTestResult] = useState<AppsScriptPingResult | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);

  const persistDriveConfig = (partial: Partial<MadrasahSettings['googleDriveConfig']>) => {
    const latest = storageService.getSettings();
    const nextConfig: MadrasahSettings['googleDriveConfig'] = {
      ...latest.googleDriveConfig,
      ...partial,
    };
    const hasConnection = Boolean(
      nextConfig.appsScriptUrl?.trim().startsWith('https://script.google.com/') ||
        nextConfig.driveFolderUrl?.trim()
    );
    const updatedDriveConfig: MadrasahSettings['googleDriveConfig'] = {
      ...nextConfig,
      isConnected: hasConnection,
    };

    const newSettings: MadrasahSettings = {
      ...latest,
      googleDriveConfig: updatedDriveConfig,
    };

    storageService.saveSettings(newSettings, storageService.getActiveUser());
    if (onUpdateSettings) {
      onUpdateSettings(updatedDriveConfig);
    }
  };

  const handleSaveAppsScriptConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = appsScriptUrl.trim();
    persistDriveConfig({
      appsScriptUrl: cleanUrl,
      serviceAccountEmail: accountEmail.trim(),
      driveFolderUrl: folderUrl.trim(),
      urlSuratMasuk: urlMasuk.trim(),
      urlSuratKeluar: urlKeluar.trim(),
      urlSK: urlSK.trim(),
      urlArsip: urlArsip.trim(),
      urlPkkm: urlPkkm.trim(),
      activeMode: 'apps-script',
    });
    if (onStatusChanged) onStatusChanged(Boolean(cleanUrl));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestAppsScript = async () => {
    const cleanUrl = appsScriptUrl.trim();
    if (!cleanUrl) {
      setScriptTestResult({
        success: false,
        message: 'Silakan tempel URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }

    setIsTestingScript(true);
    setScriptTestResult(null);
    const res = await testAppsScriptConnection(cleanUrl);
    setScriptTestResult(res);
    setIsTestingScript(false);

    if (res.success) {
      const newFolderUrl = res.rootFolderUrl || folderUrl;
      const newMasuk = res.subfolders?.['Surat Masuk']?.url || urlMasuk;
      const newKeluar = res.subfolders?.['Surat Keluar']?.url || urlKeluar;
      const newSK = res.subfolders?.['Surat Keputusan']?.url || urlSK;
      const newArsip = res.subfolders?.['Arsip Digital']?.url || urlArsip;
      const newPkkm = res.subfolders?.['PKKRA']?.url || urlPkkm;
      const resolvedEmail = res.ownerEmail || accountEmail;

      setFolderUrl(newFolderUrl);
      setUrlMasuk(newMasuk);
      setUrlKeluar(newKeluar);
      setUrlSK(newSK);
      setUrlArsip(newArsip);
      setUrlPkkm(newPkkm);
      if (resolvedEmail) setAccountEmail(resolvedEmail);

      persistDriveConfig({
        appsScriptUrl: cleanUrl,
        serviceAccountEmail: resolvedEmail,
        driveFolderUrl: newFolderUrl,
        urlSuratMasuk: newMasuk,
        urlSuratKeluar: newKeluar,
        urlSK: newSK,
        urlArsip: newArsip,
        urlPkkm: newPkkm,
        folderIdSuratMasuk: res.subfolders?.['Surat Masuk']?.id || driveConfig.folderIdSuratMasuk,
        folderIdSuratKeluar: res.subfolders?.['Surat Keluar']?.id || driveConfig.folderIdSuratKeluar,
        folderIdSK: res.subfolders?.['Surat Keputusan']?.id || driveConfig.folderIdSK,
        folderIdArsip: res.subfolders?.['Arsip Digital']?.id || driveConfig.folderIdArsip,
        folderIdPkkm: res.subfolders?.['PKKRA']?.id || driveConfig.folderIdPkkm,
        activeMode: 'apps-script',
      });

      if (onStatusChanged) onStatusChanged(true);
    }
  };

  const handleCopyScriptCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      setShowScriptCode(true);
    }
  };

  const handleSaveDriveFolderConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    persistDriveConfig({
      driveFolderUrl: folderUrl.trim(),
      serviceAccountEmail: accountEmail.trim(),
      urlSuratMasuk: urlMasuk.trim(),
      urlSuratKeluar: urlKeluar.trim(),
      urlSK: urlSK.trim(),
      urlArsip: urlArsip.trim(),
      urlPkkm: urlPkkm.trim(),
      activeMode: 'folder-link',
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const isAppsScriptActive = Boolean(appsScriptUrl.trim().startsWith('https://script.google.com/'));

  // Compact rendering for headers / widget bars
  if (compact) {
    const isFolderActive = Boolean(folderUrl);
    return (
      <div className="flex items-center justify-between p-2.5 bg-emerald-50/90 rounded-lg border border-emerald-200 text-xs">
        <div className="flex items-center gap-2 truncate">
          <HardDrive
            className={`w-4 h-4 shrink-0 ${
              isAppsScriptActive || isFolderActive ? 'text-emerald-700' : 'text-slate-400'
            }`}
          />
          <div className="truncate">
            <span className="font-semibold text-emerald-950 block truncate">
              {isAppsScriptActive
                ? 'Apps Script Drive Aktif'
                : isFolderActive
                ? 'Google Drive RA Aktif'
                : 'Google Drive Belum Diatur'}
            </span>
            <span className="text-[10px] text-emerald-700 truncate block">
              {accountEmail || currentSettings.email || 'alihsanrasoborejo@gmail.com'}
            </span>
          </div>
        </div>

        {folderUrl ? (
          <a
            href={folderUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300 shadow-2xs"
          >
            <FolderOpen className="w-3 h-3 text-emerald-700" /> Buka
          </a>
        ) : null}
      </div>
    );
  }

  // Full card rendering in Settings
  return (
    <div className="p-5 rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white space-y-4 shadow-sm border-t-4 border-t-amber-400">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
            <HardDrive className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
              Penyimpanan Google Drive RA
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300">
                Apps Script Bridge
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Upload berkas otomatis ke Google Drive {currentSettings.namaMadrasah} &amp; metadata tersinkron ke Supabase.
            </p>
          </div>
        </div>

        {isAppsScriptActive ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Apps Script Otomatis Aktif
          </span>
        ) : activeTabMode === 'folder-link' && folderUrl ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Mode Folder Aktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Menunggu URL Apps Script
          </span>
        )}
      </div>

      {/* Mode Switcher Tabs (2 Clean Modes - No Firebase) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-emerald-100/60 rounded-xl border border-emerald-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTabMode('apps-script')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
            activeTabMode === 'apps-script'
              ? 'bg-[#023126] text-amber-300 shadow-sm'
              : 'text-slate-700 hover:text-emerald-950'
          }`}
        >
          <Code2 className="w-4 h-4 shrink-0" />
          <span className="truncate">Google Apps Script (Upload Otomatis)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabMode('folder-link')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
            activeTabMode === 'folder-link'
              ? 'bg-[#023126] text-amber-300 shadow-sm'
              : 'text-slate-700 hover:text-emerald-950'
          }`}
        >
          <FolderSync className="w-4 h-4 shrink-0" />
          <span className="truncate">Tautan Folder Drive (Manual)</span>
        </button>
      </div>

      {/* TAB 1: GOOGLE APPS SCRIPT BRIDGE */}
      {activeTabMode === 'apps-script' && (
        <form onSubmit={handleSaveAppsScriptConfig} className="space-y-4 text-xs animate-in fade-in duration-150">
          {/* Benefit Box */}
          <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-2.5">
            <div className="flex items-start gap-2.5 text-emerald-950">
              <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">
                  Upload Otomatis ke Google Drive via Google Apps Script + Supabase
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                  Google Apps Script bertindak sebagai jembatan resmi di dalam akun Google RA Anda (
                  <span className="font-mono text-emerald-800">{accountEmail || currentSettings.email}</span>). Setiap berkas Surat Masuk, Surat Keluar, SK, Arsip Digital, maupun PKKRA yang diunggah langsung tersimpan di Google Drive sesuai sub-folder kategori, sementara tautan &amp; metadatanya tersimpan di database Supabase.
                </p>
              </div>
            </div>

            {/* 4-Step Quick Setup */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-900 block">1. Salin Kode Script</span>
                <span className="text-slate-600">Klik tombol &quot;Salin Kode Script (Code.gs)&quot; di bawah ini.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-900 block">2. Buka Apps Script</span>
                <span className="text-slate-600">
                  Kunjungi{' '}
                  <a
                    href="https://script.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-emerald-700 font-semibold"
                  >
                    script.google.com
                  </a>{' '}
                  &rarr; Project Baru &rarr; Tempel kode.
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-900 block">3. Deploy Aplikasi Web</span>
                <span className="text-slate-600">
                  Klik <strong>Terapkan &rarr; Deployment Baru &rarr; Aplikasi Web</strong>. Akses: <strong>Siapa saja (Anyone)</strong>.
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-900 block">4. Tempel URL /exec</span>
                <span className="text-slate-600">
                  Salin URL Web App berakhiran <code className="bg-slate-200 px-1 rounded">/exec</code> lalu klik Uji Koneksi.
                </span>
              </div>
            </div>

            {/* Script Copy & Preview Controls */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyScriptCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#023126] hover:bg-[#034436] rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                <span>{copiedCode ? 'Kode Code.gs Berhasil Disalin!' : 'Salin Kode Script (Code.gs)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowScriptCode(!showScriptCode)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showScriptCode ? 'Sembunyikan Kode' : 'Lihat Kode Code.gs'}</span>
                {showScriptCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <a
                href="https://script.google.com/home/start"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buka script.google.com
              </a>
            </div>

            {showScriptCode && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-300 bg-slate-900 text-slate-100">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-[11px] font-mono text-amber-300">
                  <span>Code.gs — Jembatan Google Drive siPAKAR</span>
                  <button
                    type="button"
                    onClick={handleCopyScriptCode}
                    className="text-xs text-white hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Disalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 text-[11px] font-mono overflow-x-auto max-h-64 leading-relaxed">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            )}
          </div>

          {/* Apps Script Endpoint Form */}
          <div className="space-y-3 p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                URL Web App Google Apps Script (berakhiran /exec) *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={appsScriptUrl}
                    onChange={(e) => setAppsScriptUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs bg-slate-50/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleTestAppsScript}
                  disabled={isTestingScript || !appsScriptUrl.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isTestingScript ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-800" />
                      <span>Menguji...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-emerald-800" />
                      <span>Uji Koneksi &amp; Buat Folder</span>
                    </>
                  )}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Pastikan menggunakan URL <strong>Web App</strong> yang berakhiran <code className="bg-slate-100 px-1 rounded">/exec</code> (bukan link editor script).
              </span>
            </div>

            {scriptTestResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  scriptTestResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                {scriptTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-bold">{scriptTestResult.message}</p>
                  {scriptTestResult.success && scriptTestResult.rootFolderUrl && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={scriptTestResult.rootFolderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-300 text-emerald-900 rounded font-semibold hover:bg-emerald-100 text-[11px]"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Buka Folder Utama Drive
                      </a>
                      {scriptTestResult.ownerEmail && (
                        <span className="text-[11px] text-emerald-800 font-mono">
                          Akun: {scriptTestResult.ownerEmail}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Folder Access if folderUrl exists */}
            {folderUrl && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                <span className="text-[11px] text-slate-500 font-semibold self-center mr-1">
                  Folder Drive Terhubung:
                </span>
                <a
                  href={urlMasuk || folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors"
                >
                  <FolderOpen className="w-3 h-3 text-emerald-700" /> Surat Masuk
                </a>
                <a
                  href={urlKeluar || folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors"
                >
                  <FolderOpen className="w-3 h-3 text-emerald-700" /> Surat Keluar
                </a>
                <a
                  href={urlSK || folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors"
                >
                  <FolderOpen className="w-3 h-3 text-emerald-700" /> SK Madrasah
                </a>
                <a
                  href={urlArsip || folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors"
                >
                  <FolderOpen className="w-3 h-3 text-emerald-700" /> Arsip Digital
                </a>
                <a
                  href={urlPkkm || folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors"
                >
                  <FolderOpen className="w-3 h-3 text-emerald-700" /> PKKRA
                </a>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {saveSuccess ? (
                <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> URL Google Apps Script berhasil disimpan!
                </div>
              ) : (
                <span className="text-[11px] text-slate-500">
                  URL tersinkron ke Supabase agar seluruh perangkat langsung mengunggah berkas ke Google Drive.
                </span>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 border border-amber-400/80 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Save className="w-3.5 h-3.5" /> Simpan URL Apps Script
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: MODE TAUTAN FOLDER */}
      {activeTabMode === 'folder-link' && (
        <form onSubmit={handleSaveDriveFolderConfig} className="space-y-4 text-xs animate-in fade-in duration-150">
          {/* Explanation Box */}
          <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-2">
            <div className="flex items-start gap-2.5 text-emerald-950">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">
                  Mode Tautan Folder (Pintasan Manual)
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                  Tempel tautan folder Google Drive madrasah (
                  <span className="font-mono text-emerald-800">{accountEmail}</span>) sebagai pintasan cepat. Untuk unggah berkas otomatis ke Google Drive langsung dari form siPAKAR, gunakan tab <strong>Google Apps Script (Upload Otomatis)</strong>.
                </p>
              </div>
            </div>

            {/* Quick 3-Step Guide */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-900 block">1. Buat Folder di Drive</span>
                <span className="text-slate-500">Buka drive.google.com, buat folder &quot;siPAKAR {currentSettings.namaMadrasah}&quot;.</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-900 block">2. Salin Tautan Folder</span>
                <span className="text-slate-500">Klik kanan folder &gt; Bagikan &gt; Siapa saja yang memiliki link dapat melihat.</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-900 block">3. Tempel di siPAKAR</span>
                <span className="text-slate-500">Tempel URL di bawah lalu klik Simpan. Folder langsung terhubung!</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Tautan / URL Folder Utama Google Drive Madrasah *
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    required
                    value={folderUrl}
                    onChange={(e) => setFolderUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs bg-slate-50/50"
                  />
                </div>
                {folderUrl && (
                  <a
                    href={folderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors shrink-0"
                  >
                    <FolderOpen className="w-4 h-4 text-emerald-800" /> Buka Folder
                  </a>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Tautan ini akan terbuka ketika tombol &quot;Folder Drive Madrasah&quot; diklik pada header atau daftar persuratan.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Email Akun Google RA (Pemilik Drive)
              </label>
              <input
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="alihsanrasoborejo@gmail.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
              />
            </div>

            {/* Toggle subfolder URLs */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubFolders(!showSubFolders)}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
              >
                <span>
                  {showSubFolders
                    ? '▼ Sembunyikan Tautan Sub-Folder'
                    : '▶ Atur Tautan Sub-Folder Per Kategori (Surat Masuk, Surat Keluar, SK, Arsip, PKKRA)'}
                </span>
              </button>

              {showSubFolders && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      URL Folder Surat Masuk
                    </label>
                    <input
                      type="url"
                      value={urlMasuk}
                      onChange={(e) => setUrlMasuk(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-[11px] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      URL Folder Surat Keluar
                    </label>
                    <input
                      type="url"
                      value={urlKeluar}
                      onChange={(e) => setUrlKeluar(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-[11px] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      URL Folder Surat Keputusan (SK)
                    </label>
                    <input
                      type="url"
                      value={urlSK}
                      onChange={(e) => setUrlSK(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-[11px] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      URL Folder Arsip Digital
                    </label>
                    <input
                      type="url"
                      value={urlArsip}
                      onChange={(e) => setUrlArsip(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-[11px] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      URL Folder PKKRA
                    </label>
                    <input
                      type="url"
                      value={urlPkkm}
                      onChange={(e) => setUrlPkkm(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-[11px] bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Access Folder Buttons */}
            {folderUrl && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                <span className="text-[11px] text-slate-500 font-semibold self-center mr-1">
                  Pintasan Buka Folder:
                </span>
                <a
                  href={urlMasuk || folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors"
                >
                  <FolderOpen className="w-3 h-3 text-emerald-700" /> Surat Masuk
                </a>
                <a
                  href={urlKeluar || folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors"
                >
                  <FolderOpen className="w-3 h-3 text-emerald-700" /> Surat Keluar
                </a>
                <a
                  href={urlSK || folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors"
                >
                  <FolderOpen className="w-3 h-3 text-emerald-700" /> SK Madrasah
                </a>
                <a
                  href={urlArsip || folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors"
                >
                  <FolderOpen className="w-3 h-3 text-emerald-700" /> Arsip Digital
                </a>
                <a
                  href={urlPkkm || folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors"
                >
                  <FolderOpen className="w-3 h-3 text-emerald-700" /> PKKRA
                </a>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {saveSuccess ? (
                <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tautan folder berhasil disimpan!
                </div>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Data langsung disinkronkan ke Supabase &amp; dapat dibuka seluruh perangkat.
                </span>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 border border-amber-400/80 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Simpan Konfigurasi Tautan
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
