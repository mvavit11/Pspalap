import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import Main from './Main.jsx';
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';
export default function App() {
const network = WalletAdapterNetwork.Mainnet;
const endpoint = useMemo(() => clusterApiUrl(network), [network]);
const wallets = useMemo(() => [
new PhantomWalletAdapter(),
new SolflareWalletAdapter(),
], []);
return (
<ConnectionProvider endpoint={endpoint}>
<WalletProvider wallets={wallets} autoConnect>
<WalletModalProvider>
<Main />
</WalletModalProvider>
</WalletProvider>
</ConnectionProvider>
);
}
