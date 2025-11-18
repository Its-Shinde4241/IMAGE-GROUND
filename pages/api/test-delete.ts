import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { publicId } = req.body;

        if (!publicId) {
            return res.status(400).json({ error: 'Public ID is required' });
        }

        console.log('Testing delete for public_id:', publicId);

        // Test the delete API
        const deleteResponse = await fetch(`${req.headers.origin}/api/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                publicId: publicId,
            }),
        });

        const result = await deleteResponse.json();

        return res.status(200).json({
            success: true,
            testResult: {
                statusCode: deleteResponse.status,
                response: result,
            },
        });
    } catch (error) {
        console.error('Test delete error:', error);
        return res.status(500).json({
            success: false,
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}