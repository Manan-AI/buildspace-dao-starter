import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js"; // cool!
import { readFileSync } from "fs";

const app = sdk.getAppModule("0x70b1513866d477205906e32a06A811435C72Aaa5");

(async () => {
    try {
      const bundleDropModule = await app.deployBundleDropModule({
        // name, description, image
        name: "MickeyDAO Membership",
        description: "A DAO for members of the MickeyDegods community.",
        image: readFileSync("scripts/assets/mickey_logo.PNG"),
        // We need to pass in the address of the person who will be receiving the proceeds from sales of nfts in the module.
        // We're planning on not charging people for the drop, so we'll pass in the 0x0 address
        // you can set this to your own wallet address if you want to charge for the drop.
        primarySaleRecipientAddress: ethers.constants.AddressZero,
      });
      
      console.log(
        "✅ Successfully deployed bundleDrop module, address:",
        bundleDropModule.address,
      );
      console.log(
        "✅ bundleDrop metadata:",
        await bundleDropModule.getMetadata(),
      );
    } catch (error) {
      console.log("failed to deploy bundleDrop module", error);
    }
  })()