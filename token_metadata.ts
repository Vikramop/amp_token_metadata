import 'dotenv/config';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { base58 } from '@metaplex-foundation/umi/serializers';
import {
  createSignerFromKeypair,
  signerIdentity,
} from '@metaplex-foundation/umi';
import {
  mplTokenMetadata,
  updateV1,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata';
import { percentAmount, publicKey } from '@metaplex-foundation/umi';

// Parse the secret key from the .env variable
const secretKeyString = process.env.SECRET_KEY;
if (!secretKeyString) throw new Error('SECRET_KEY not found in .env');
const secretKey = Uint8Array.from(JSON.parse(secretKeyString));

// Set up Umi and signer
const umi = createUmi('https://api.devnet.solana.com').use(mplTokenMetadata());
const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));

// Your SPL Token mint address and metadata
const mint = publicKey('6h5XJD9aArEqVyxAss98hdxJHoZLB4SzccVDdgEttRkf');
const tokenMetadata = {
  name: 'Amply',
  symbol: 'AMP',
  uri: 'https://raw.githubusercontent.com/Vikramop/amp_token_metadata/master/amply.json',
};

async function addMetadata() {
  const tx = await updateV1(umi, {
    mint,
    authority: umi.identity,
    payer: umi.identity,
    updateAuthority: umi.identity,
    name: tokenMetadata.name,
    symbol: tokenMetadata.symbol,
    uri: tokenMetadata.uri,
    sellerFeeBasisPoints: percentAmount(0),
    tokenStandard: TokenStandard.Fungible,
  }).sendAndConfirm(umi);

  // Base58 encode the signature for Solana Explorer
  const txSig = base58.deserialize(tx.signature);
  console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`);
}

addMetadata();
