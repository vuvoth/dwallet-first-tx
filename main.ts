// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { getFullnodeUrl, DWalletClient } from '@dwallet-network/dwallet.js/client';
import { Ed25519Keypair } from '@dwallet-network/dwallet.js/keypairs/ed25519';
import {createDWallet, createSignMessages, approveAndSign} from "@dwallet-network/dwallet.js/signature-mpc";
import { requestSuiFromFaucetV0 } from '@dwallet-network/dwallet.js/faucet';

// create a new SuiClient object pointing to the network you want to use
const client = new DWalletClient({ url: 'https://fullnode.alpha.testnet.dwallet.cloud' });
const keypair = new Ed25519Keypair();



console.log(keypair.getPublicKey().toSuiAddress());
// get tokens from the Testnet faucet server
const response = await requestSuiFromFaucetV0({
    // connect to Testnet faucet
    host: 'http://faucet.alpha.testnet.dwallet.cloud/gas',
    recipient: keypair.toSuiAddress(),
});

const dkg = await createDWallet(keypair, client);

const bytes = new TextEncoder().encode("dWallets are coming...");
const signMessagesIdKECCAK256 = await createSignMessages(dkg?.dwalletId!, dkg?.dkgOutput, [bytes], "KECCAK256", keypair, client);
const sigKECCAK256 = await approveAndSign(dkg?.dwalletCapId!, signMessagesIdKECCAK256!, [bytes], keypair, client);

console.log(dkg);