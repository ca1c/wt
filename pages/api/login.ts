import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { dbConnect } from '../../lib/mongo';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const { wallet, message, signature } = req.body;

    if (!wallet || !message || !signature) {
        return res.status(400).json({ error: "Incomplete Form Data" });
    }

    try {
        const pubKey = new PublicKey(wallet);
        const msgBytes = new TextEncoder().encode(message);
        const sigBytes = new Uint8Array(signature);
        
        const verified = nacl.sign.detached.verify(msgBytes, sigBytes, pubKey.toBytes());

        if (!verified) return res.status(401).json({ error: 'Invalid signature' });

        const client = await dbConnect();
        const db = client.db('wt');
        
        // upsert here is what allows a new user to login if they haven't before
        await db.collection('users').updateOne(
            { wallet },
            { $setOnInsert: { wallet, createdAt: new Date() } },
            { upsert: true }
        );

        res.status(200).json({ message: 'Login successful', wallet });
    } catch(err) {
        if(err instanceof Error ){
            return res.status(500).json({ error: 'Internal server error', detail: err.message });
        } else {
            return res.status(500).json({ error: 'Unknown server error' });
        }
    }
}