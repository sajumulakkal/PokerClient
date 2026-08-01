import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '../components/layout/Container'
import Button from '../components/buttons/Button'
import gameContext from '../context/game/gameContext'
import socketContext from '../context/websocket/socketContext'
import globalContext from '../context/global/globalContext'
import PokerTable from '../components/game/PokerTable'
import { RotateDevicePrompt } from '../components/game/RotateDevicePrompt'
import { PositionedUISlot } from '../components/game/PositionedUISlot'
import { PokerTableWrapper } from '../components/game/PokerTableWrapper'
import { Seat } from '../components/game/Seat/Seat'
import { InfoPill } from '../components/game/InfoPill'
import { GameUI } from '../components/game/GameUI'
import { GameStateInfo } from '../components/game/GameStateInfo'
import BrandingImage from '../components/game/BrandingImage'
import PokerCard from '../components/game/PokerCard'
import background from '../assets/img/background.png'
import './Play.scss';

const Play = () => {
  const navigate = useNavigate()
  const { socket } = useContext(socketContext)
  const { walletAddress, setWalletAddress } = useContext(globalContext)
  const {
    messages,
    currentTable,
    seatId,
    joinTable,
    leaveTable,
    sitDown,
    standUp,
    fold,
    check,
    call,
    raise,
  } = useContext(gameContext)
    
  const [bet, setBet] = useState(0)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [inputAddress, setInputAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Pre-fill saved values from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedName) setPlayerName(savedName);
    if (savedAddress) {
      setInputAddress(savedAddress);
      if (!walletAddress) setWalletAddress(savedAddress);
    }
  }, [walletAddress, setWalletAddress]);

  // 2. Check socket connection and saved registration
  useEffect(() => {
    if (!socket) {
      navigate("/")
      return;
    }

    if (!walletAddress) {
      setShowRegistrationModal(true);
    } else if (!currentTable) {
      joinTable(1);
    }
    // eslint-disable-next-line
  }, [socket, walletAddress, currentTable])

  // 3. Register Player to MongoDB & Send Player Info to Socket Engine
  const handleRegisterPlayer = async (e) => {
    e.preventDefault();
    const cleanName = playerName.trim();
    const cleanAddress = inputAddress.trim();

    if (!cleanName || !cleanAddress) {
      alert("Please enter both Name and Wallet Address.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Store in context & localStorage immediately
      setWalletAddress(cleanAddress);
      localStorage.setItem('playerName', cleanName);
      localStorage.setItem('walletAddress', cleanAddress);

      // Save player to database via API
      const response = await fetch('https://pokerserver-production-b6bc.up.railway.app/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, address: cleanAddress })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save player');
      }

      setShowRegistrationModal(false);

      // Emit lobby info to register username on socket session before joining table
      if (socket) {
        socket.emit("CS_FETCH_LOBBY_INFO", {
          walletAddress: cleanAddress,
          socketId: socket.id,
          username: cleanName
        });
      }

      // Pass player metadata when joining table room
      joinTable(1, { name: cleanName, address: cleanAddress });
    } catch (error) {
      console.error('Error saving player:', error);
      alert('Error saving player to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (currentTable) {
      if (currentTable.callAmount > currentTable.minBet) {
        setBet(currentTable.callAmount);
      } else if (currentTable.pot > 0) {
        setBet(currentTable.minRaise || currentTable.minBet || 1000);
      } else {
        setBet(currentTable.minBet || 1000);
      }
    }
  }, [currentTable]);

  // Find active seat ID from state or socket match
  const getActiveSeatId = () => {
    if (seatId !== null && seatId !== undefined) return seatId;
    if (currentTable && currentTable.seats) {
      const seatsArray = Array.isArray(currentTable.seats) 
        ? currentTable.seats 
        : Object.values(currentTable.seats);

      const foundIndex = seatsArray.findIndex(
        (s) => s && (s.socketId === socket?.id || s.id === socket?.id || s.player?.address === walletAddress)
      );
      if (foundIndex !== -1) return foundIndex + 1;
    }
    return null;
  };

  const activeSeatId = getActiveSeatId();

  // Custom sitDown handler that binds player details
  const handleSitDown = (seatNum) => {
    const storedName = playerName || localStorage.getItem('playerName') || 'Player';
    const storedAddress = walletAddress || localStorage.getItem('walletAddress') || inputAddress;
    if (sitDown) {
      sitDown(seatNum, { name: storedName, address: storedAddress });
    }
  };

  return (
    <>
      <RotateDevicePrompt />
      
      {/* Registration Modal Overlay */}
      {showRegistrationModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white'
        }}>
          <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '10px', textAlign: 'center', width: '350px', border: '1px solid #444' }}>
            <h2>Enter Player Details</h2>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '20px' }}>Please provide your name and address to join the table.</p>
            <form onSubmit={handleRegisterPlayer}>
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Player Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Alice"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Wallet / Real Address:</label>
                <input
                  type="text"
                  placeholder="e.g. 0x123... or User1"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                  required
                />
              </div>
              <Button primary type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
                {isSubmitting ? 'Saving to DB...' : 'Join Table'}
              </Button>
            </form>
          </div>
        </div>
      )}

      <Container
        fullHeight
        style={{
          backgroundImage: `url(${background})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          backgroundColor: 'black',
        }}
        className="play-area"
      >
        {!currentTable && !showRegistrationModal && (
          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', color: 'yellow', zIndex: 100, textAlign: 'center' }}>
            <h3>Connecting to Table 1... Waiting for server response.</h3>
          </div>
        )}

        {currentTable && (
          <PositionedUISlot top="2vh" left="1.5rem" scale="0.65" style={{ zIndex: '50' }}>
            <Button small secondary onClick={leaveTable}>
              Leave
            </Button>
          </PositionedUISlot>
        )}

        <PokerTableWrapper>
          <PokerTable />
          {currentTable && (
            <>
              <PositionedUISlot top="-5%" left="0" scale="0.55" origin="top left">
                <Seat seatNumber={1} currentTable={currentTable} sitDown={handleSitDown} />
              </PositionedUISlot>
              <PositionedUISlot top="-5%" right="2%" scale="0.55" origin="top right">
                <Seat seatNumber={2} currentTable={currentTable} sitDown={handleSitDown} />
              </PositionedUISlot>
              <PositionedUISlot bottom="15%" right="2%" scale="0.55" origin="bottom right">
                <Seat seatNumber={3} currentTable={currentTable} sitDown={handleSitDown} />
              </PositionedUISlot>
              <PositionedUISlot bottom="8%" scale="0.55" origin="bottom center">
                <Seat seatNumber={4} currentTable={currentTable} sitDown={handleSitDown} />
              </PositionedUISlot>
              <PositionedUISlot bottom="15%" left="0" scale="0.55" origin="bottom left">
                <Seat seatNumber={5} currentTable={currentTable} sitDown={handleSitDown} />
              </PositionedUISlot>
              <PositionedUISlot top="-25%" scale="0.55" origin="top center" style={{ zIndex: '1' }}>
                <BrandingImage />
              </PositionedUISlot>
              <PositionedUISlot
                width="100%"
                origin="center center"
                scale="0.60"
                style={{ display: 'flex', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}
              >
                {currentTable.board && currentTable.board.length > 0 && (
                  <>
                    {currentTable.board.map((card, index) => (
                      <PokerCard key={index} card={card} />
                    ))}
                  </>
                )}
              </PositionedUISlot>
              <PositionedUISlot top="-5%" scale="0.60" origin="bottom center">
                {messages && messages.length > 0 && (
                  <>
                    <InfoPill>{messages[messages.length - 1]}</InfoPill>
                    {currentTable.winMessages?.length > 0 && (
                      <InfoPill>
                        {currentTable.winMessages[currentTable.winMessages.length - 1]}
                      </InfoPill>
                    )}
                  </>
                )}
              </PositionedUISlot>
              <PositionedUISlot top="12%" scale="0.60" origin="center center">
                {currentTable.winMessages?.length === 0 && (
                  <GameStateInfo currentTable={currentTable} />
                )}
              </PositionedUISlot>
            </>
          )}
        </PokerTableWrapper>

        {currentTable && (
          <div style={{ position: 'fixed', bottom: '15px', left: '0', width: '100vw', zIndex: 99999, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
            <GameUI
              currentTable={currentTable}
              seatId={activeSeatId || seatId}
              bet={bet}
              setBet={setBet}
              raise={raise}
              standUp={standUp}
              fold={fold}
              check={check}
              call={call}
            />
          </div>
        )}
      </Container>
    </>
  )
}

export default Play
