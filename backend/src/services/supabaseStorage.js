'use strict';

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { AppError } = require('../utils/errors');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

function hasSupabaseConfig(env = process.env) {
  const baseUrl = env.SUPABASE_URL?.trim();
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = env.SUPABASE_STORAGE_BUCKET?.trim();
  return Boolean(baseUrl && serviceKey && bucket);
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['.pdf', ['application/pdf']],
  ['.doc', ['application/msword', 'application/octet-stream']],
  ['.docx', ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream']],
  ['.xls', ['application/vnd.ms-excel', 'application/octet-stream']],
  ['.xlsx', ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream']],
  ['.ppt', ['application/vnd.ms-powerpoint', 'application/octet-stream']],
  ['.pptx', ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/octet-stream']],
  ['.txt', ['text/plain', 'application/octet-stream']],
  ['.png', ['image/png']],
  ['.jpg', ['image/jpeg']],
  ['.jpeg', ['image/jpeg']],
  ['.webp', ['image/webp']],
  ['.gif', ['image/gif']],
  ['.zip', ['application/zip', 'application/x-zip-compressed', 'application/octet-stream']],
]);

function getStorageConfig(env = process.env) {
  const baseUrl = env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = env.SUPABASE_STORAGE_BUCKET?.trim();
  if (!baseUrl || !serviceKey || !bucket) {
    throw new AppError('File storage is not configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.', 503);
  }
  let parsedUrl;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new AppError('SUPABASE_URL must be a valid HTTPS URL.', 503);
  }
  if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost') {
    throw new AppError('SUPABASE_URL must use HTTPS.', 503);
  }
  return { baseUrl, serviceKey, bucket };
}

function validateFile(file) {
  if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
    throw new AppError('Uploaded file is empty or invalid.', 400);
  }
  if (file.buffer.length > MAX_FILE_SIZE) {
    throw new AppError('Each file must be 10 MB or smaller.', 413);
  }
  const name = file.originalname || '';
  const extension = name.slice(name.lastIndexOf('.')).toLowerCase();
  const allowedMimeTypes = ALLOWED_TYPES.get(extension);
  if (!allowedMimeTypes || !allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError('Unsupported file type. Use PDF, Word, Excel, PowerPoint, TXT, PNG, or JPG files.', 415);
  }
  return {
    originalFilename: name.slice(0, 255),
    contentType: file.mimetype === 'application/octet-stream'
      ? getCanonicalMimeType(extension)
      : file.mimetype,
    fileSize: file.buffer.length,
  };
}

function getCanonicalMimeType(extension) {
  const types = {
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
  };
  return types[extension];
}

function encodeStoragePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function storageRequest(path, options = {}) {
  const { baseUrl, serviceKey } = getStorageConfig();
  let response;
  try {
    response = await fetch(`${baseUrl}/storage/v1${path}`, {
      ...options,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        ...options.headers,
      },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new AppError('Could not connect to file storage. Check the Supabase configuration and try again.', 503);
  }
  if (!response.ok) {
    throw new AppError(`File storage rejected the request (HTTP ${response.status}). Check the bucket configuration and available storage quota.`, 503);
  }
  return response;
}

async function uploadFile(file, storagePath) {
  if (hasSupabaseConfig()) {
    const { bucket } = getStorageConfig();
    const path = `/object/${encodeURIComponent(bucket)}/${encodeStoragePath(storagePath)}`;
    await storageRequest(path, {
      method: 'POST',
      headers: {
        'Content-Type': file.contentType,
        'x-upsert': 'false',
      },
      body: file.buffer,
    });
    return;
  }

  // Local filesystem fallback
  const fullPath = path.join(UPLOADS_DIR, storagePath);
  await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.promises.writeFile(fullPath, file.buffer);
}

async function deleteFile(storagePath) {
  if (hasSupabaseConfig()) {
    const { bucket } = getStorageConfig();
    const response = await storageRequest(`/object/${encodeURIComponent(bucket)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefixes: [storagePath] }),
    });
    return response;
  }

  // Local filesystem fallback
  try {
    const fullPath = path.join(UPLOADS_DIR, storagePath);
    await fs.promises.unlink(fullPath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

async function createSignedUrl(storagePath, download = false) {
  if (hasSupabaseConfig()) {
    const { baseUrl, bucket } = getStorageConfig();
    const response = await storageRequest(
      `/object/sign/${encodeURIComponent(bucket)}/${encodeStoragePath(storagePath)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: 120, download }),
      }
    );
    const result = await response.json();
    if (typeof result.signedURL !== 'string' || result.signedURL.length === 0) {
      throw new AppError('File storage returned an invalid download link.', 503);
    }
    const signedUrl = result.signedURL.startsWith('/')
      ? `${baseUrl}/storage/v1${result.signedURL}`
      : result.signedURL;
    return new URL(signedUrl).toString();
  }

  // Local filesystem fallback URL
  const port = process.env.PORT || 3000;
  const baseUrl = process.env.API_URL || `http://localhost:${port}`;
  return `${baseUrl}/api/files/${storagePath}`;
}

function createStoragePath(taskId, reportId, filename) {
  const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return `${taskId}/${reportId ? `reports/${reportId}` : 'documents'}/${randomUUID()}${extension}`;
}

module.exports = {
  MAX_FILE_SIZE,
  createSignedUrl,
  createStoragePath,
  deleteFile,
  getStorageConfig,
  uploadFile,
  validateFile,
};
