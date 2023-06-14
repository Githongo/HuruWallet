
import * as dotenv from 'dotenv'
dotenv.config()
import { Masa } from "@masa-finance/masa-sdk";
import { providers, Wallet } from "ethers";



/**
 * @param soulName - soulName to be resolved to address
 * */ 
export const resolveSoulName= async(soulName:string,providerUrl:string,masaSigner:string)=>{
  const provider = new providers.JsonRpcProvider("https://alfajores-forno.celo-testnet.org");
  const wallet = new Wallet(`0x8f69f852ef8b1c292e01bf21f51021e1a5eb526fca121fdcc411ecf3bb66b0fb`, provider);

  const masa = new Masa({
    signer: wallet,
    apiUrl: 'https://middleware.masa.finance',
    environment:'production',
    networkName:'alfajores'
  });

  try {
    const address = await masa.soulName.resolve(soulName);
    console.log(address);
    return address;
  } catch (error) {
    console.error(`${soulName} does not exist!`);
    return error
  }
}

// resolveSoulName('mutebi.celo')