import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import globalContext from './../../context/global/globalContext';
import LoadingScreen from '../../components/loading/LoadingScreen';
import socketContext from '../../context/websocket/socketContext';
import { CS_FETCH_LOBBY_INFO } from '../../game/actions';
import './ConnectWallet.scss';

const ConnectWallet = () => {
  const { setWalletAddress, setIsLoading } = useContext(globalContext);
  const { socket } = useContext(socketContext);
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  useEffect(() => {
    // 1. Safety: Fallback timer to hide loader after 5 seconds if connection hangs
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    const handleConnect = () => {
      const walletAddress = query.get('walletAddress');
      const gameId = query.get('gameId');
      const username = query.get('username');

      if (walletAddress && gameId && username) {
        setWalletAddress(walletAddress);
        socket.emit(CS_FETCH_LOBBY_INFO, { 
          walletAddress, 
          socketId: socket.id, 
          gameId, 
          username 
        });
        
        setIsLoading(false);
        navigate('/play');
      } else {
        setIsLoading(false);
      }
    };

    // 2. Logic: If already connected, run immediately; otherwise, wait for 'connect' event
    if (socket && socket.connected) {
      handleConnect();
    } else if (socket) {
      socket.on('connect', handleConnect);
    }

    // Cleanup: Remove listener and timer on unmount
    return () => {
      clearTimeout(timer);
      if (socket) {
        socket.off('connect', handleConnect);
      }
    };
  }, [socket, navigate, query, setWalletAddress, setIsLoading]);

  return (
    <>
      <LoadingScreen />
    </>
  );
};

export default ConnectWallet;