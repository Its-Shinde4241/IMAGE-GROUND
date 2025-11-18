import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { file } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Upload to Cloudinary using the base64 data with metadata tags
        const result = await cloudinary.uploader.upload(file, {
            folder: process.env.CLOUDINARY_FOLDER,
            resource_type: 'auto',
            tags: ['user_uploaded', 'image_ground_app'], // Add tags to identify user uploads
            context: {
                source: 'image_ground_app',
                uploaded_at: new Date().toISOString()
            }
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Upload failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}