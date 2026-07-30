import React from 'react';

const ConnectWallet = () => {
  console.log("ConnectWallet page is rendering!");

  return (
    <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#1a1a1a', color: '#ffffff', minHeight: '100vh' }}>
      <h1>ACN-Verse Wallet Connection</h1>
      <p>Please connect your wallet to start playing.</p>
      <button 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
        onClick={() => window.location.href = '/play'}
      >
        Go to Play Page
      </button>
    </div>
  );
};

export default ConnectWallet;