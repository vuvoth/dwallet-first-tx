/// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/// @ts-nocheck

import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock as TransactionBlockSUI} from '@mysten/sui.js/transactions';
import {requestSuiFromFaucetV0, getFaucetHost} from '@mysten/sui.js/faucet';

import { DWalletClient } from '@dwallet-network/dwallet.js/client';
import { Ed25519Keypair } from '@dwallet-network/dwallet.js/keypairs/ed25519';
import { requestSuiFromFaucetV0 as requestDwltFromFaucetV0 } from '@dwallet-network/dwallet.js/faucet';
import { fromB64 } from '@mysten/sui.js/utils';

import 'dotenv/config';

const PRIVATE_KEY = process.env.PRIVATE_KEY;


import {
    createDWallet,
    createSignMessages,
    approveAndSign,
    submitDWalletCreationProof,
    submitTxStateProof,
    recoveryIdKeccak256
} from '@dwallet-network/dwallet.js/signature-mpc';

const serviceUrl = 'http://sui-testnet-light-client.testnet.dwallet.cloud/gettxdata';

const dWalletNodeUrl = 'https://fullnode.alpha.testnet.dwallet.cloud';

const suiTestnetURL = 'https://fullnode.testnet.sui.io:443';

const configObjectId = '0xf084273c85bfc3839be06bd51fed4ac48b0370f9e084d8f37c1d22407e61213b';

const dWalletCapPackageSUI = '0xda072e51bf74040f2f99909595ef1db40fdc75071b92438bb9864f6c744c6736';


const sui_client = new SuiClient({ url: suiTestnetURL });
const dwallet_client = new DWalletClient({ url: dWalletNodeUrl });


const keyArray = Uint8Array.from(Array.from(fromB64(PRIVATE_KEY)));

const keyPair = Ed25519Keypair.fromSecretKey(keyArray);




const dkg = await createDWallet(keyPair, dwallet_client);

if (dkg == null) {
    throw new Error('createDWallet returned null');
}
let { dwalletCapId } = dkg;

console.log("dwallet Cap ID", dwalletCapId);
let txb = new TransactionBlockSUI();

let dWalletCapArg = txb.pure(dwalletCapId);

let [cap] = txb.moveCall({
    target: `${dWalletCapPackageSUI}::dwallet_cap::create_cap`,
    arguments: [dWalletCapArg],
});

txb.transferObjects([cap], keyPair.toSuiAddress());

txb.setGasBudget(10000000);

let res = await sui_client.signAndExecuteTransactionBlock({
    signer: keyPair,
    transactionBlock: txb,
    options: {
        showEffects: true,
    },
});

const createCapTxId = res.digest;

console.log('createCapTxId', createCapTxId);

let first = res.effects?.created?.[0];
let ref;
if (first) {
    ref = first.reference.objectId;
    console.log('cap created', ref);
} else {
    console.log('No objects were created');
}


