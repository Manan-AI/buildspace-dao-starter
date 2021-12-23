import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
    "0xdF58f0cf65B5FF497339EAF1920aBb36630fA930",
);

(async () => {
    try {
        const claimConditionFactory = bundleDrop.getClaimConditionFactory();
        // specify conditions:
        claimConditionFactory.newClaimPhase({
            startTime: new Date(),
            maxQuantity: 50_000,
            maxQuantityPerTransaction: 1,
        });

        // don't continue until claim condtions are set
        await bundleDrop.setClaimCondition(0, claimConditionFactory); // (tokenId, conditionFactory)
        console.log("✅ Sucessfully set claim condition!");
    } catch (error) {
        console.error("Failed to set claim condition", error);
    }
})() // what's with the extra set of parentheses?
