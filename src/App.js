import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import OpenLogin from '@toruslabs/openlogin';

const VERIFIER = {
    loginProvider: "google",
    clientId: "PROJECT ID"
}

function App() {
    const [isLoading, setLoading] = useState(true);
    const [openlogin, setOpenLogin] = useState();
    const [privKey, setPrivKey] = useState();

    const onMount = async () => {
        setLoading(true);

        try {
            const openlogin = new OpenLogin({
                clientId: VERIFIER.clientId,
                network: "testnet"
            });
            setOpenLogin(openlogin); //setState???

            await openlogin.init();
            setPrivKey(openlogin.privKey);
        } finally {
            setLoading(false)
        }
    }

    const onLogin = async () => {
        if (isLoading || privKey) return;

        setLoading(true);
        try {
            //trigger login
            await openlogin.login({
                loginProvider: VERIFIER.loginProvider,
                redirectUrl: "http://localhost:3000/redirect",
            });
            setPrivKey(openlogin.privKey); //setState???
        } finally {
            setLoading(false);
        }
    }

    const onLogout = async () => {
        await openlogin.logout();
        setPrivKey('');
    }

    useEffect(() => {
        onMount();
    }, []);

    if (isLoading) return <div>Loading...</div>
    return privKey ?
        (<div>
            Logged in: {privKey}
            <button onClick={onLogout}>Logout</button>
        </div>) :
        (<button onClick={onLogin}>Login</button>);
}

export default App;
