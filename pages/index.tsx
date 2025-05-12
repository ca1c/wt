import { useEffect, useState} from 'react';

declare global {
    interface Window {
        solana?: any;
    }
}

export default function PhantomLogin() {
    const [wallet, setWallet] = useState<string | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    const connectWallet = async () => {
        const provider = window.solana;
        if(!provider || !provider.isPhantom) {
            alert('Phantom Wallet not found. Please install the Phantom Wallet Extension or Application.');
            return;
        }

        try {
            const resp = await provider.connect();
            setWallet(resp.publicKey.toString());
        } catch (err) {
            console.error('User rejected connection:', err);
        }
    };

    const signAndLogin = async() => {
        if(!wallet) return;

        const message = `Login to Wallet Tracker at ${new Date().toISOString()}`;
        const encoded = new TextEncoder().encode(message);
        const signed = await window.solana.signMessage(encoded, 'utf8');

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wallet,
                message,
                signature: Array.from(signed.signature)
            }),
        });

        const result = await res.json();
        if(res.ok) {
            setLoggedIn(true);
        } else {
            console.error(result.error);
        }
    };

    return (
        <div>
            {wallet ? (
                <button onClick={signAndLogin}>Sign & Login</button>
            ) : (
                <button onClick={connectWallet}>Connect Phantom</button>
            )}
            {loggedIn && <p>✅ Logged in as {wallet}</p>}
        </div>
    );
}