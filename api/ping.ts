import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        ok: true,
        message: "Pong",
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
}
