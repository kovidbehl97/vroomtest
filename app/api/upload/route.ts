import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  secure_url: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the image to Cloudinary
    const uploadResult: CloudinaryUploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result as CloudinaryUploadResult);
      }).end(buffer);
    });

    const imageUrl = uploadResult.secure_url;

    return NextResponse.json({ imageUrl });
  } catch (error: unknown) {
    console.error('Upload Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to upload image', message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to upload image', message: 'An unknown error occurred' }, { status: 500 });
  }
}