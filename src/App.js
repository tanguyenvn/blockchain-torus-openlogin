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
    const [userInfo, setUserInfo] = useState();

    useEffect(() => {
        async function onMount() {
            setLoading(true);

            try {
                const openlogin = new OpenLogin({
                    clientId: VERIFIER.clientId,
                    network: "testnet",
                    redirectUrl: "http://localhost:3000/redirect",
                    uxMode: "popup"
                });
                setOpenLogin(openlogin);

                //sync up the state of user login session, add privKey if user logged in before
                //inject an iframe to DOM
                await openlogin.init();

                await connectEther(openlogin);
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
            await openlogin.login();

            await connectEther(openlogin);
        } finally {
            setLoading(false);
        }
    }

    async function connectEther(openlogin) {
        if (!openlogin.privKey) {
            return;
        }
        const wallet = new ethers.Wallet(openlogin.privKey, ethers.getDefaultProvider());
        const address = await wallet.getAddress();
        const balance = await wallet.getBalance();
        const userInfo = await openlogin.getUserInfo();
        setPrivKey(openlogin.privKey);
        setUserInfo(userInfo);
        setAddress(address);
        setBalance(balance.toString());
    }

    const onLogout = async () => {
        await openlogin.logout();
        setPrivKey('');
    }


    return (
        <div class="container">
            <div class="header clearfix"> <nav>
                <ul class="nav nav-pills pull-right">
                    <li role="presentation" class="active"><a href="/#">Home</a></li>
                    <li role="presentation">{privKey ? <a role="button" href="/#" onClick={onLogout}>Log-out</a> : <span></span>}</li>
                </ul>
            </nav>
                <h3 class="text-muted">Torus Demo</h3>
            </div>

            <div class="jumbotron">
                <h1>OpenLogin & React</h1>
                <p>
                    {isLoading ? <div>Loading...</div> :
                        privKey ? (<div>
                            <p><strong>Verifier:</strong> {userInfo.verifier}</p>
                            <p><strong>Aggregate Verifier:</strong> {userInfo.aggregateVerifier}</p>
                            <p><strong>Verifier Id:</strong> {userInfo.verifierId}</p>
                            <p><strong>Type of Login:</strong> {userInfo.typeOfLogin}</p>
                            <p><strong>Email:</strong> {userInfo.email}</p>
                            <p><b>Address:</b> {address}</p>
                            <p><b>Balance:</b> {balance}</p>
                            </div>)
                            : (<p class="lead">
                                <p>A plug n play auth suite that combines the simplicity of passwordless authentication with the security of non-custodial public key infrastructure.</p>
                                <a class="btn btn-lg btn-success" href="/#" role="button" onClick={onLogin}>Login</a>
                            </p>)
                    }
                </p>
            </div>
        </div>
    );

}

export default App;
