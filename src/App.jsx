import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import "./App.css";
import { TokenLaunchpad } from "./components/TokenLaunchpad";
import {
  WalletDisconnectButton,
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import '@solana/wallet-adapter-react-ui/styles.css';

const endpoint = "https://solana-devnet.g.alchemy.com/v2/8y8Hi7MthK7hmykqgbvfg"

function App() {
  return (
    <div className="">
      <div>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>
              <div className="custom-wallet-container flex justify-between items-center p-8">
                <WalletMultiButton className="" />
                <WalletDisconnectButton className="disconnect" />
              </div>

              <TokenLaunchpad></TokenLaunchpad>

            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </div>

    </div>
  );
}

export default App;
