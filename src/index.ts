import express from 'express';
import dotenv from 'dotenv';
import UssdMenu from 'ussd-menu-builder'
import mongoose from 'mongoose';
import { User } from './models/models'
import { createAccount } from './services/createWallet';
import { sendCUSD } from './services/sendCusd';
import { resolveSoulName } from './services/resolveSoulNames';
dotenv.config();

const credentials = {
    apiKey: `${process.env.AT_SANDBOX_APIKEY}`,         // use your sandbox app API key for development in the test environment
    username: `${process.env.AT_SANDBOX_USERNAME}`,      // use 'sandbox' for development in the test environment
};
const Africastalking = require('africastalking')(credentials);
const sms = Africastalking.SMS



const dbString:any=process.env.DATABASE_URL;

mongoose.connect(dbString)
const database=mongoose.connection

database.on('error', (error)=>{
    console.error(error)
})

database.once('connected', ()=>{
    console.log('Database connected...')
})


let menu = new UssdMenu();

const router = express.Router();
let recipentName:string=''
let recipientAmount:number;


menu.startState({
    run: async ()=>{
        //TODO logic to create account and verifying if account exists

        let phone = menu.args.phoneNumber;


        const wallet:any = await createAccount();
        const user = new User({
            phone:phone,
            address:wallet.address,
            publicKey:wallet.publicKey,
            privateKey:wallet.privateKey,
            mnemonic:wallet.mnemonic
        });

        user.save()

        console.log({wallet})
        console.log('current user phone: ', phone)
        menu.con('Welcome to the MoMo Menu' + 
        '\n1. Send Money' +
        '\n2. My Account');
    },
    next: {
        '1': 'sendMoney',
        '2': 'myAccount'
    }
})

// Send Money flow
menu.state('sendMoney', {
    run: ()=>{
        menu.con('Enter celo soul name of the recipent')
    },
    next: {
        '*[.\w]+':'sendMoney.name'
    }
})

menu.state('sendMoney.name', {
    run: () => {
        menu.con('Enter amount')

        recipentName = menu.val
        console.log('recipent name is: ',recipentName)
    },
    next:{
        '*^[0-9]*$': 'amount',
    }
})

menu.state('amount', {
    run: () => {
        menu.con('Enter Pin')
        recipientAmount=parseInt(menu.val)
        console.log('amount: ',recipientAmount)
    },
    next:{
        '*^[0-9]*$':'pin'
    }
})

menu.state('pin', {
    run: async () => {
        console.log('pin: ', menu.val)

        const soulNameAddress = await resolveSoulName(
            recipentName,
            `${process.env.NODE_URL}`,
            `${process.env.MASA_SIGNER}`
        )

        console.log('soulName: ', soulNameAddress)
        // send money here
        const receipt:any = sendCUSD(
            `${process.env.NODE_URL}`,
            `${soulNameAddress}`,
            recipientAmount,
            `${process.env.MASA_SIGNER}`,
            menu.args.phoneNumber,
            recipentName
        )
        
        menu.end('The transaction is being processed. A notification will be sent')
    }
})

menu.state('myAccount', {
    run: ()=>{
        menu.con('Account' + 
        '\n1. Check Balance'+
        '\n2. Account Details')
    },
    next: {
        '1':'checkBalance',
        '2':'accountDetails'
    }
})

menu.state('checkBalance', {
    run: ()=>{
        // fetch balance using address 
        menu.end('Balance: 1000cUSD')
    }
})

menu.state('accountDetails', {
    run: ()=>{
        // fetch account details (resolve celo name)
        menu.end('Your account details will be sent to you')
    }
})


router.post("/", (req, res) => {
    // const { sessionId, serviceCode, phoneNumber, text } = req.body;
    let args ={
        sessionId: req.body.sessionId,
        serviceCode: req.body.serviceCode,
        phoneNumber: req.body.phoneNumber,
        text: req.body.text
    }

    // check if user exists in db first ....if they do throw them to social connect
    menu.run(args, (ussdResult: any) => {
        res.send(ussdResult);
    });


  });
  
  module.exports = router;


