import OpenLogin from '@toruslabs/openlogin';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './App.css';

const VERIFIER = {
    loginProvider: "google",
    clientId: "PROJECT ID"
}

function App() {
    const [isLoading, setLoading] = useState(true);
    const [openlogin, setOpenLogin] = useState();
    const [privKey, setPrivKey] = useState();
    const [address, setAddress] = useState();
    const [balance, setBalance] = useState();

    useEffect(() => {
        async function onMount() {
            setLoading(true);

            try {
                const openlogin = new OpenLogin({
                    clientId: VERIFIER.clientId,
                    network: "testnet"
                });
                setOpenLogin(openlogin);

                await openlogin.init();

                await connectEther(openlogin.privKey);
                setPrivKey(openlogin.privKey);
            } finally {
                setLoading(false);
            }
        }
        onMount();
    }, []);

    const onLogin = async () => {
        if (isLoading || privKey) return;

        setLoading(true);
        try {
            //trigger login
            await openlogin.login({
                loginProvider: VERIFIER.loginProvider,
                redirectUrl: "http://localhost:3000/redirect",
            });
            setPrivKey(openlogin.privKey);

            await connectEther(openlogin.privKey);
        } finally {
            setLoading(false);
        }
    }

    async function connectEther(privKey) {
        if (!privKey) {
            return;
        }
        const wallet = new ethers.Wallet(privKey, ethers.getDefaultProvider());
        const address = await wallet.getAddress();
        const balance = await wallet.getBalance();
        setAddress(address);
        setBalance(balance.toString());
    }

    const onLogout = async () => {
        await openlogin.logout();
        setPrivKey('');
    }

    
    if (isLoading) return <div>Loading...</div>
    return privKey ?
        (<div>
            Logged in address: {address}
            <div>Balance: {balance}</div>
            <div><button onClick={onLogout}>Logout</button></div>
        </div>) :
        (<button onClick={onLogin}>Login</button>);
}

export default App;
