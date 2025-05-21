import 'dotenv/config';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { base58 } from '@metaplex-foundation/umi/serializers';
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from '@metaplex-foundation/umi';
import {
  mplTokenMetadata,
  updateV1,
  fetchMetadataFromSeeds,
} from '@metaplex-foundation/mpl-token-metadata';

const secretKeyString = process.env.SECRET_KEY;
if (!secretKeyString) throw new Error('SECRET_KEY not found in .env');
const secretKey = Uint8Array.from(JSON.parse(secretKeyString));

const umi = createUmi('https://api.devnet.solana.com').use(mplTokenMetadata());
const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));

// Your SPL Token mint address
const mint = publicKey('HYbi3JvAQNDawVmndhqaDQfBaZYzW8FxsAEpTae3mzrm');

// The new metadata URI (raw link to your updated JSON)
const newUri =
  'https://raw.githubusercontent.com/Vikramop/amp_token_metadata/master/amply.json';

async function updateMetadata() {
  // Fetch current metadata so we can preserve fields you don't want to change
  const initialMetadata = await fetchMetadataFromSeeds(umi, { mint });

  const tx = await updateV1(umi, {
    mint,
    authority: umi.identity,
    updateAuthority: umi.identity,
    data: {
      ...initialMetadata,
      uri: newUri,
    },
  }).sendAndConfirm(umi);

  const txSig = base58.deserialize(tx.signature);
  console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`);
}

updateMetadata();
