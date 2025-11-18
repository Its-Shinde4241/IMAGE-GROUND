import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { publicId } = req.body;

        if (!publicId) {
            return res.status(400).json({ error: 'Public ID is required' });
        }

        console.log('Attempting to delete image with public_id:', publicId);

        // Delete the image from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        console.log('Cloudinary deletion result:', result);

        if (result.result === 'ok') {
            return res.status(200).json({
                success: true,
                message: 'Image deleted successfully',
                result
            });
        } else if (result.result === 'not found') {
            return res.status(404).json({
                success: false,
                error: 'Image not found in Cloudinary',
                result
            });
        } else {
            return res.status(400).json({
                success: false,
                error: 'Failed to delete image from Cloudinary',
                result
            });
        }
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}