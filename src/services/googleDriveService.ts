import { GoogleDriveMetadata } from '../types';

export type DriveCategory =
  | 'Surat Masuk'
  | 'Surat Keluar'
  | 'Surat Keputusan'
  | 'Arsip Digital'
  | 'PKKRA';

// ============================================================================
// GOOGLE APPS SCRIPT WEB APP BRIDGE (TANPA FIREBASE / LANGSUNG KE GOOGLE DRIVE)
// ============================================================================

export const GOOGLE_APPS_SCRIPT_CODE = `// ============================================================================
// JEMBATAN GOOGLE DRIVE UNTUK siPAKAR RA AL IHSAN SOBOREJO
// Salin seluruh kode ini ke Code.gs di https://script.google.com
// Lalu Deploy > New Deployment > Web App:
//   - Execute as: Me (akun Google RA Anda)
//   - Who has access: Anyone
// ============================================================================

var ROOT_FOLDER_NAME = "siPAKAR RA AL IHSAN SOBOREJO";
var SUBFOLDER_NAMES = ["Surat Masuk", "Surat Keluar", "Surat Keputusan", "Arsip Digital", "PKKRA"];

function getOrCreateFolder_(name, parentFolder) {
  var iterator = parentFolder
    ? parentFolder.getFoldersByName(name)
    : DriveApp.getFoldersByName(name);
  while (iterator.hasNext()) {
    var folder = iterator.next();
    if (!folder.isTrashed()) {
      return folder;
    }
  }
  return parentFolder ? parentFolder.createFolder(name) : DriveApp.createFolder(name);
}

function getOrCreateRootStructure_() {
  var root = getOrCreateFolder_(ROOT_FOLDER_NAME, null);
  var subfolders = {};
  for (var i = 0; i < SUBFOLDER_NAMES.length; i++) {
    var catName = SUBFOLDER_NAMES[i];
    var sub = getOrCreateFolder_(catName, root);
    subfolders[catName] = {
      id: sub.getId(),
      url: "https://drive.google.com/drive/folders/" + sub.getId()
    };
  }
  return { root: root, subfolders: subfolders };
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
    if (action === "ping") {
      var structure = getOrCreateRootStructure_();
      var ownerEmail = "";
      try {
        ownerEmail = Session.getEffectiveUser().getEmail() || "";
      } catch (errEmail) {}

      return jsonResponse_({
        success: true,
        app: "siPAKAR Google Apps Script Bridge",
        ownerEmail: ownerEmail,
        rootFolderId: structure.root.getId(),
        rootFolderUrl: "https://drive.google.com/drive/folders/" + structure.root.getId(),
        subfolders: structure.subfolders
      });
    }
    return jsonResponse_({ success: false, error: "Action GET tidak dikenali." });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.message || String(err) });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ success: false, error: "Payload POST kosong." });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || "upload";

    if (action === "upload") {
      var category = payload.category || "Arsip Digital";
      var fileName = payload.fileName || ("Dokumen_siPAKAR_" + new Date().getTime() + ".pdf");
      var mimeType = payload.mimeType || "application/pdf";
      var base64Data = payload.base64Data || "";

      if (!base64Data) {
        return jsonResponse_({ success: false, error: "Data berkas (base64) kosong." });
      }

      if (base64Data.indexOf(",") !== -1) {
        base64Data = base64Data.split(",")[1];
      }

      var bytes = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(bytes, mimeType, fileName);

      var root = getOrCreateFolder_(ROOT_FOLDER_NAME, null);
      var targetFolder = getOrCreateFolder_(category, root);
      var file = targetFolder.createFile(blob);

      if (payload.description) {
        try {
          file.setDescription(String(payload.description));
        } catch (descErr) {}
      }

      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (permErr) {}

      var fileId = file.getId();
      return jsonResponse_({
        success: true,
        fileId: fileId,
        folderId: targetFolder.getId(),
        fileName: file.getName(),
        driveUrl: "https://drive.google.com/file/d/" + fileId + "/view",
        downloadUrl: "https://drive.google.com/uc?id=" + fileId + "&export=download"
      });
    }

    if (action === "delete") {
      if (!payload.fileId) {
        return jsonResponse_({ success: false, error: "fileId wajib disertakan." });
      }
      var fileToDelete = DriveApp.getFileById(payload.fileId);
      fileToDelete.setTrashed(true);
      return jsonResponse_({ success: true, fileId: payload.fileId });
    }

    return jsonResponse_({ success: false, error: "Action POST tidak dikenali: " + action });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.message || String(err) });
  }
}
`;

const ENV_APPS_SCRIPT_URL = ((import.meta.env.VITE_APPS_SCRIPT_URL as string) || '').trim();

/**
 * Get saved Google Apps Script Web App URL from settings or Vite env var
 */
export function getAppsScriptUrl(): string {
  try {
    const raw = localStorage.getItem('sipas_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      const url = parsed?.googleDriveConfig?.appsScriptUrl;
      if (typeof url === 'string' && url.trim().startsWith('https://script.google.com/')) {
        return url.trim();
      }
    }
  } catch {
    // ignore storage parse error
  }
  if (ENV_APPS_SCRIPT_URL.startsWith('https://script.google.com/')) {
    return ENV_APPS_SCRIPT_URL;
  }
  return '';
}

export function isAppsScriptConfigured(): boolean {
  return Boolean(getAppsScriptUrl());
}

/**
 * Returns true if Google Apps Script Web App bridge is configured
 */
export function isAnyDriveUploadConnected(): boolean {
  return isAppsScriptConfigured();
}

export interface AppsScriptPingResult {
  success: boolean;
  message: string;
  ownerEmail?: string;
  rootFolderId?: string;
  rootFolderUrl?: string;
  subfolders?: Record<string, { id: string; url: string }>;
}

/**
 * Test connectivity to a Google Apps Script Web App URL (?action=ping)
 */
export async function testAppsScriptConnection(url: string): Promise<AppsScriptPingResult> {
  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith('https://script.google.com/')) {
    return {
      success: false,
      message: 'URL harus diawali dengan https://script.google.com/macros/s/.../exec',
    };
  }

  try {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const res = await fetch(`${cleanUrl}${separator}action=ping`, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Server Google Apps Script merespons kode ${res.status}. Pastikan akses Web App diatur ke "Anyone" (Siapa saja).`,
      };
    }

    const data = await res.json();
    if (!data.success) {
      return {
        success: false,
        message: data.error || 'Respons Apps Script tidak valid.',
      };
    }

    return {
      success: true,
      message: 'Koneksi Google Apps Script berhasil! Folder otomatis siap di Google Drive.',
      ownerEmail: data.ownerEmail,
      rootFolderId: data.rootFolderId,
      rootFolderUrl: data.rootFolderUrl,
      subfolders: data.subfolders,
    };
  } catch (err: any) {
    return {
      success: false,
      message:
        err?.message ||
        'Gagal terhubung ke URL Apps Script. Pastikan URL benar (/exec), sudah dideploy sebagai Web App, dan akses diatur ke "Anyone".',
    };
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64Part = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64Part);
    };
    reader.onerror = () => reject(new Error('Gagal membaca isi berkas lokal.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload real file to Google Drive through Google Apps Script Web App bridge
 * Uses Content-Type: text/plain;charset=utf-8 to avoid CORS preflight OPTIONS failure on GAS.
 */
export async function uploadFileViaAppsScript(
  file: File,
  category: DriveCategory,
  description?: string,
  customUrl?: string
): Promise<GoogleDriveMetadata> {
  const endpoint = (customUrl || getAppsScriptUrl()).trim();
  if (!endpoint) {
    throw new Error('URL Web App Google Apps Script belum dikonfigurasi.');
  }

  if (file.size > 25 * 1024 * 1024) {
    throw new Error('Ukuran berkas melebihi batas unggahan 25 MB untuk jembatan Apps Script.');
  }

  const base64Data = await readFileAsBase64(file);

  const res = await fetch(endpoint, {
    method: 'POST',
    redirect: 'follow',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'upload',
      category,
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      base64Data,
      description: description || `Dokumen ${category} RA AL IHSAN SOBOREJO`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Unggahan Apps Script gagal dengan status HTTP ${res.status}.`);
  }

  const result = await res.json();
  if (!result.success || !result.fileId) {
    throw new Error(result.error || 'Apps Script gagal menyimpan berkas ke Google Drive.');
  }

  return {
    fileId: result.fileId,
    folderId: result.folderId,
    fileName: result.fileName || file.name,
    fileSize: file.size,
    fileType: file.type || 'application/pdf',
    driveUrl: result.driveUrl || `https://drive.google.com/file/d/${result.fileId}/view`,
    downloadUrl: result.downloadUrl || `https://drive.google.com/uc?id=${result.fileId}&export=download`,
    uploadedAt: new Date().toISOString(),
    textContent: description || file.name,
  };
}

/**
 * Trash a file on Google Drive via Google Apps Script Web App
 */
export async function deleteFileViaAppsScript(
  fileId: string,
  customUrl?: string
): Promise<boolean> {
  const endpoint = (customUrl || getAppsScriptUrl()).trim();
  if (!endpoint || !fileId) return false;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'delete',
        fileId,
      }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

/**
 * Upload file to Google Drive via Google Apps Script Web App
 */
export async function uploadFileSmart(
  file: File,
  category: DriveCategory,
  description?: string
): Promise<GoogleDriveMetadata> {
  if (isAppsScriptConfigured()) {
    return uploadFileViaAppsScript(file, category, description);
  }
  throw new Error('URL Web App Google Apps Script belum dikonfigurasi di Pengaturan.');
}

/**
 * Trash file on Google Drive via Google Apps Script with confirmation
 */
export async function deleteFileSmart(fileId: string, fileName: string): Promise<boolean> {
  if (!fileId || fileId.startsWith('1gdrive-') || fileId.startsWith('gdrive-link-')) {
    return true;
  }

  if (isAppsScriptConfigured()) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin memindahkan berkas "${fileName}" ke Sampah Google Drive madrasah?`
    );
    if (!confirmed) return false;
    return deleteFileViaAppsScript(fileId);
  }

  return false;
}
