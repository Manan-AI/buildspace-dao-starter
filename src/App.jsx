// useMemo is new to me!
import { useState, useEffect, useMemo } from 'react';

// import thirdweb
import { useWeb3 } from '@3rdweb/hooks';

const App = () => {
  // use ConnectWallet hook from thirdweb
  const { connectWallet, address, error, provider } = useWeb3();
  console.log('Address: ', address);

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

  // This is the case where we have the user's address
  // which means they've connected their wallet to our site!
  return (
    <div className="landing">
      <h1>👀 wallet connected, now what!</h1>
    </div>
  );
};

export default App;
