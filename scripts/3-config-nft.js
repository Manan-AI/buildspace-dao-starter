import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

// this is our ERC-1155 contract (each NFT is the same, vs ERC-721)
const bundleDrop = sdk.getBundleDropModule(
  "0x27a357d83E1A0A862566ff7bf0620240C18Ed7D8",
);

(async () => {
  try {
    // create a batch of NFTs
    await bundleDrop.createBatch([
      {
        name: "Classic Burnt Fries",
        description: "An OG classic. This NFT will give you access to MickeyDAO!",
        image: readFileSync("scripts/assets/classic-fry_orig.gif"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()