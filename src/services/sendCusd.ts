import { newKit } from "@celo/contractkit";
import { CeloContract } from "@celo/contractkit";
import dotenv from 'dotenv';
import { sendSms } from "./sendSms";
dotenv.config();

const credentials = {
    apiKey: `${process.env.AT_SANDBOX_APIKEY}`,         // use your sandbox app API key for development in the test environment
    username: `${process.env.AT_SANDBOX_USERNAME}`,      // use 'sandbox' for development in the test environment
};
const Africastalking = require('africastalking')(credentials);
const sms = Africastalking.SMS


export const sendCUSD = async (
    rpcUrl:string,
    receiver:string,
    amount:number,
    privateKey:string,
	phoneNumber:string,
	recipentName:string
	) => {
	try {
		const kit = newKit(rpcUrl);

		kit.setFeeCurrency(CeloContract.StableToken);
        const web3 = kit.web3;

		const cusdtoken = await kit.contracts.getStableToken();

		kit.addAccount(privateKey);
        let cUSDcontract = await kit.contracts.getStableToken();

        const account = kit.web3.eth.accounts.privateKeyToAccount(privateKey);
        const  _cusdAmount =  web3.utils.toWei(amount.toString(), 'ether')

		const tx = await cusdtoken
			.transfer(receiver, _cusdAmount)
			.send({ from: account.address, feeCurrency: cUSDcontract.address });
		const receipt = await tx.waitReceipt();

		const smsData = {
            to: phoneNumber,
            message: `Confirmed cUSD ${amount} has been sent to ${recipentName}
            \n Transaction Hash: ${receipt?.transactionHash}`
        }

		sendSms(smsData)

		return receipt;
	} catch (e) {
		return e
	}
}

