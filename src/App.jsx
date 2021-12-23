// useMemo is new to me!
import { useState, useEffect, useMemo } from 'react';

// import thirdweb
import { useWeb3 } from '@3rdweb/hooks';
import { ThirdwebSDK } from "@3rdweb/sdk";

// instantiate the SDK on rinkeby
const sdk = new ThirdwebSDK("rinkeby");

// grab a reference to our ERC-1155 contract 
const bundleDropModule = sdk.getBundleDropModule("0xdF58f0cf65B5FF497339EAF1920aBb36630fA930");

const App = () => {
  // use ConnectWallet hook from thirdweb
  const { connectWallet, address, error, provider } = useWeb3();
  console.log('Address: ', address);

  // need signer to write to blockchain
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);  // boolean state var
  const [isClaiming, setIsClaiming] = useState(false);

  // when the signer updates, pass it to the SDK
  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);
  
  useEffect(() => {
    // if they don't have a connected wallet, exit
    if (!address) {
      return;
    }

    // check if user has NFT by returning bundleDropModule(balanceOf)
    return bundleDropModule
      .balanceOf(address, 0) // tokenId = 0 for all membership NFTs
      .then((balance) => {
        // if balance > 0, we have an NFT
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!")
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.")
        }
      })
      // promise catch
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to obtain nft balance", error);
      });
  }, [address]);  // run this whenever the wallet address changes

  const mintNft = () => {
    setIsClaiming(true);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    bundleDropModule
    .claim("0", 1) // tokenId, quantity
    .catch((err) => {
      console.error("failed to claim", err);
      setIsClaiming(false);
    })
    .finally(() => {
      // Stop loading state.
      setIsClaiming(false);
      // Set claim state.
      setHasClaimedNFT(true);
      // Show user their fancy new NFT!
      console.log(
        // some tight interpolation
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
      );
    });
  }

  // if user hasn't connected wallet, let them
  if (!address) {
    console.log('User has not yet connected wallet');
    return (
      <div className='landing'>
        <h1>Welcome to MickeyDAO</h1>
        <button onClick={() => connectWallet("injected")} className='btn-hero'>
          Connect Wallet
        </button>
      </div>
    );
  };

  // show DAO dashboard if user has the member nft
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>🍟 MickeyDAO Member Page</h1>
        <p>Get in here and close the door, this spliff is getting me twisted </p>
      </div>
    );
  };

  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <h1>Mint your free 🍪 DAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => mintNft()}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

export default App;
