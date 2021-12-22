import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

// import and config your .env file
import dotenv from "dotenv";
dotenv.config();

// check that your values are set
if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY == ""){
    console.log("FATAL ERROR: Private key not found!")
}
if (!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL == ""){
    console.log("FATAL ERROR: Alchemy API not found!")
}
if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS == ""){
    console.log("FATAL ERROR: Wallet address not found!")
}

const sdk = new ThirdwebSDK(
    // network
    new ethers.Wallet(
        // wallet private key
        process.env.PRIVATE_KEY,
        // RPC url 
        ethers.getDefaultProvider(process.env.ALCHEMY_API_URL),
    ),
);

(async () => {
    try {
      const apps = await sdk.getApps();
      console.log("Your app address is:", apps[0].address);
    } catch (err) {
      console.error("Failed to get apps from the sdk", err);
      process.exit(1);
    }
  })()
  
  // We are exporting the initialized thirdweb SDK so that we can use it in our other scripts
  export default sdk;