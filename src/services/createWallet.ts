import { ethers } from 'ethers';
 

export const createAccount = async (derivationPath?: string) => {
    // const path = derivationPath || "m/44'/60'/0'/0/0";
    const wallet = ethers.Wallet.createRandom();

    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      mnemonic: wallet?.mnemonic?.phrase,
    };
  }