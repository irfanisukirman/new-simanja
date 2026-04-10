'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary inside the action to ensure it's initialized with fresh env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(base64Image: string) {
  // Check if env vars are present
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary environment variables are missing!');
    return { 
      success: false, 
      error: 'Konfigurasi Cloudinary tidak ditemukan. Pastikan Environment Variables sudah diatur di Vercel.' 
    };
  }

  try {
    const response = await cloudinary.uploader.upload(base64Image, {
      folder: 'simanja/listrik',
      resource_type: 'auto',
    });
    
    return { 
      success: true, 
      url: response.secure_url, 
      public_id: response.public_id 
    };
  } catch (error: any) {
    console.error('Detailed Cloudinary upload error:', error);
    
    // Return detailed error message for easier debugging in production
    return { 
      success: false, 
      error: error?.message || 'Gagal mengunggah gambar ke Cloudinary. Periksa koneksi atau kredensial API.' 
    };
  }
}
