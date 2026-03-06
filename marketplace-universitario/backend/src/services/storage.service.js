const { createClient } = require('@supabase/supabase-js');
const { retryWithBackoff } = require('../utils/retryWithBackoff');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const BUCKET_PRODUCTS = 'product-images';
const BUCKET_PROFILES = 'profile-images';

/**
 * Upload a file buffer to Supabase Storage.
 * @param {Buffer}  fileBuffer    Raw file buffer
 * @param {string}  originalName  Original filename
 * @param {string}  mimeType      MIME type (e.g. image/jpeg)
 * @param {string}  bucket        Supabase bucket name
 * @returns {Promise<string>}     Public URL of the uploaded file
 */
async function uploadFile(fileBuffer, originalName, mimeType, bucket) {
  const ext = originalName.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

  return retryWithBackoff(async () => {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw new Error(`Supabase upload error: ${error.message}`);

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  });
}

/**
 * Upload a product image (max 5 per product)
 */
async function uploadProductImage(fileBuffer, originalName, mimeType) {
  return uploadFile(fileBuffer, originalName, mimeType, BUCKET_PRODUCTS);
}

/**
 * Upload a profile/avatar image
 */
async function uploadProfileImage(fileBuffer, originalName, mimeType) {
  return uploadFile(fileBuffer, originalName, mimeType, BUCKET_PROFILES);
}

/**
 * Delete a file from Supabase Storage given its full public URL.
 */
async function deleteFile(publicUrl, bucket) {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split(`/storage/v1/object/public/${bucket}/`);
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw new Error(`Supabase delete error: ${error.message}`);
  } catch (err) {
    console.error('[storageService.deleteFile]', err.message);
  }
}

module.exports = {
  uploadProductImage,
  uploadProfileImage,
  deleteFile,
  BUCKET_PRODUCTS,
  BUCKET_PROFILES,
};
