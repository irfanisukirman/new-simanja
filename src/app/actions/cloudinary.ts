
'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(base64Image: string) {
  try {
    const response = await cloudinary.uploader.upload(base64Image, {
      folder: 'simanja/listrik',
      resource_type: 'auto',
    });
    return { success: true, url: response.secure_url, public_id: response.public_id };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, error: 'Gagal mengunggah gambar ke Cloudinary.' };
  }
}
