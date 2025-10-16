import {React, useState} from "react";
import { motion } from "framer-motion";
import { createInitializeInstruction, createMint, getMinimumBalanceForRentExemptMint } from "@solana/spl-token"
import { Transaction, SystemProgram, Keypair, Connection, clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { MINT_SIZE, TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, mintTo, getOrCreateAssociatedTokenAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { pack } from "@solana/spl-token-metadata"
import { useConnection } from "@solana/wallet-adapter-react";

// Animation variants for a staggered fade-in effect
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
      staggerChildren: 0.1, // This will make each child animate one after the other
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};


export function TokenLaunchpad() {
  const { connection } = useConnection();
  const wallet = useWallet();
  // const connection = new Connection(clusterApiUrl("devnet"));

  const [TokenName, setTokenName] = useState('')
  const [TokenSymbol, setTokenSymbol] = useState('');

  // create token function
async function createToken() {
  const mintKeypair = Keypair.generate();
  
  const metadata = {
    mint: mintKeypair.publicKey,
    name: TokenName,
    symbol: TokenSymbol,
    uri: "https://cdn.100xdevs.com/metadata.json",
    additionalMetadata: []
  }

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  // const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
  // const lamports = await getMinimumBalanceForRentExemptMint(connection); // calculate the rent amount
   const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

      const transaction = new Transaction().add(
          SystemProgram.createAccount({
              fromPubkey: wallet.publicKey,
              newAccountPubkey: mintKeypair.publicKey,
              space: mintLen, // totoal amount of space in bytes
              lamports,
              programId: TOKEN_2022_PROGRAM_ID,
          }),
          //Links the mint to a metadata account.
          createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
          // Initializes your mint:
          createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
          // Actually creates the metadata object on-chain with name, symbol, and URI.
          createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: mintKeypair.publicKey, 
            updateAuthority: wallet.publicKey, 
            mint: mintKeypair.publicKey, 
            mintAuthority: wallet.publicKey, 
            name: metadata.name, 
            symbol: metadata.symbol, 
            uri: metadata.uri
          })
      );

     transaction.feePayer = wallet.publicKey;
transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
transaction.partialSign(mintKeypair);

await wallet.sendTransaction(transaction, connection);


      console.log(`TOKEN mint created at ${mintKeypair.publicKey.toBase58()}`);
      // Get Associated Token Account (ATA)
      const associatedToken = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      )

      console.log(associatedToken.toBase58()); // return a publicKey

      const transection2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );

      await wallet.sendTransaction(transection2, connection)

      const transection3 = new Transaction().add(
        createMintToInstruction(mintKeypair.publicKey, associatedToken, wallet.publicKey, 1000000000, [], TOKEN_2022_PROGRAM_ID)
      )

      await wallet.sendTransaction(transection3, connection);

      console.log("MINTED!")
  
      // await sendAndConfirmTransaction(connection, transaction, [payer, keypair], confirmOptions);
  
}

  return (
    // The main container that centers the card on the page
    <div className="flex p-8 w-full items-center justify-center font-sans">
      {/* The Card: A motion.div to enable the entrance animation */}
      <motion.div
        className="w-full max-w-lg rounded-2xl border border-purple-500/20 bg-slate-800/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-md md:p-8"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- Card Header --- */}
        <motion.div variants={itemVariants} className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-white">
            Solana Token Launchpad
          </h1>
          <p className="text-slate-400 mt-2">Create a Token-2022 Token with Metadata</p>
        </motion.div>

        {/* --- Form --- */}
        <div className="flex flex-col gap-5">
          {/* Each input is an animated item */}
          <motion.input
            variants={itemVariants}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            type="text"
            placeholder="Name (e.g., Galaxy Coin)"
            value={TokenName}
            onChange={(e) => {
              setTokenName(e.target.value)
            }}
          />
          <motion.input
            variants={itemVariants}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            type="text"
            placeholder="Symbol (e.g., GXY)"
             value={TokenSymbol}
            onChange={(e) => {
              setTokenSymbol(e.target.value)
            }}
          />
          <motion.input
            variants={itemVariants}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            type="text"
            placeholder="Image URL (https://...)"
          />
          <motion.input
            variants={itemVariants}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            type="number"
            placeholder="Initial Supply (e.g., 1000000)"
          />

          {/* --- Create Button --- */}
          <div onClick={createToken} className="button-wrap">
            <button>
              <span>Generate</span>
            </button>
            <div className="button-shadow"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
