// useMemo is new to me!
import { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
// import thirdweb
import { useWeb3 } from '@3rdweb/hooks';
import { ThirdwebSDK } from "@3rdweb/sdk";

import { UnsupportedChainIdError } from "@web3-react/core";

// instantiate the SDK on rinkeby
const sdk = new ThirdwebSDK("rinkeby");

// grab a reference to our ERC-1155 contract 
const bundleDropModule = sdk.getBundleDropModule("0xdF58f0cf65B5FF497339EAF1920aBb36630fA930");
const tokenModule = sdk.getTokenModule("0x10FF7Ac6E25f770cFaBB82f9d020B00C3A443468");
const voteModule = sdk.getVoteModule("0x8f683e761C078DC0BbBBAa904a263272EFf18519");

const App = () => {
  // use ConnectWallet hook from thirdweb
  const { connectWallet, address, error, provider } = useWeb3();
  console.log('Address: ', address);

  // need signer to write to blockchain
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);  // boolean state var
  const [isClaiming, setIsClaiming] = useState(false);
  // holds the amount of token each member has in state
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // array holding all of our members addresses
  const [memberAddresses, setMemberAddresses] = useState([]);
  // governance state vars
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // function to shorten user addresses
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // retrieve all existing proposals from the contract
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    voteModule
      .getAll()
      .then((proposals) => {
        // set state
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      })
      .catch((error) => {
        console.error("Error obtaining proposals!", error);
      }); 
  }, [hasClaimedNFT]);

  // check if the user has already voted
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // if we haven't finished retrieving all proposals above then 
    // we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }

    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("User has already voted!")
        }
      })
      .catch((error) => {
        console.log("Error checking member voting status!", error);      
      });
  }, [hasClaimedNFT, proposals, address]);

  // obtain an updated list of DAO member addresses
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // grab users who hold our NFT with tokenId 0
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresses) => {
        console.log("🚀 Members addresses", addresses);
        setMemberAddresses(addresses);
      })
      .catch((error) => {
        console.log("Error obtaining member addresses.", error);
      });
  }, [hasClaimedNFT]);

  // This useEffect grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // grab all member balances
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("Amounts: ", amounts);
        setMemberTokenAmounts(amounts);
      })
      .catch((error) => {
        console.log("Error obtaining member token amounts.", error);
      });
  }, [hasClaimedNFT]);

  // combine member addresses and token amounts into single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address, 
        tokenAmount: ethers.utils.formatUnits(
          // if the address in memberTokenAmounts, then
          // they don't have any of our token
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

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

  if (error instanceof UnsupportedChainIdError ) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks
          in your connected wallet.
        </p>
      </div>
    );
  }

  const mintNft = () => {
    setIsClaiming(true);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    bundleDropModule
    .claim("0", 1) // tokenId, quantity
    .catch((error) => {
      console.error("failed to claim", error);
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

  // JSX RENDER SECTION 

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
        <h1>MickeyDAO Member Page</h1>
        <div>
          <div>
            <h2>Member List</h2>
            <table className='card'>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return(
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                // before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    // abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  // we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    // if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await tokenModule.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          // if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          // default the "abstain" vote to checked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
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
