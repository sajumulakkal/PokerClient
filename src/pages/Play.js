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

  // 1. Check if socket exists and if we have a wallet address
  useEffect(() => {
    if (!socket) {
      navigate("/")
      return;
    }

    if (!walletAddress) {
      // If no wallet address exists in context, trigger the modal registration form
      setShowRegistrationModal(true);
    } else {
      // If address already exists, join the table directly
      console.log("Attempting to join table 1 with wallet:", walletAddress);
      joinTable(1);
    }
    // eslint-disable-next-line
  }, [socket, walletAddress])

  // 2. Handle registering player to MongoDB via API
  const handleRegisterPlayer = async (e) => {
    e.preventDefault();
    if (!playerName.trim() || !inputAddress.trim()) {
      alert("Please enter both Name and Wallet Address.");
      return;
    }

    setIsSubmitting(true);
    try {
      //const response = await fetch('https://sparkling-gecko-148372.netlify.app/api/players', {
      const response = await fetch('https://pokerserver-production-b6bc.up.railway.app/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName.trim(), address: inputAddress.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save player');
      }

      console.log('Player successfully registered in MongoDB:', data);

      // Save into global context so the rest of the app recognizes it
      setWalletAddress(inputAddress.trim());
      setShowRegistrationModal(false);

      // Now join the table
      joinTable(1);
    } catch (error) {
      console.error('Error saving player:', error);
      alert('Error saving player to database. Check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (currentTable) {
      currentTable.callAmount > currentTable.minBet
        ? setBet(currentTable.callAmount)
        : currentTable.pot > 0
        ? setBet(currentTable.minRaise)
        : setBet(currentTable.minBet)
    }
  }, [currentTable])

  return (
    <>
      <RotateDevicePrompt />
      
      {/* Registration Modal Overlay if player info is missing */}
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
        {/* Fallback indicator if table data hasn't arrived yet */}
        {!currentTable && !showRegistrationModal && (
          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', color: 'yellow', zIndex: 100, textAlign: 'center' }}>
            <h3>Connecting to Table 1... Waiting for server response.</h3>
          </div>
        )}

        {currentTable && (
          <>
            <PositionedUISlot
              top="2vh"
              left="1.5rem"
              scale="0.65"
              style={{ zIndex: '50' }}
            >
              <Button small secondary onClick={leaveTable}>
                Leave
              </Button>
            </PositionedUISlot>
          </>
        )}
        <PokerTableWrapper>
          <PokerTable />
          {currentTable && (
            <>
              <PositionedUISlot top="-5%" left="0" scale="0.55" origin="top left">
                <Seat seatNumber={1} currentTable={currentTable} sitDown={sitDown} />
              </PositionedUISlot>
              <PositionedUISlot top="-5%" right="2%" scale="0.55" origin="top right">
                <Seat seatNumber={2} currentTable={currentTable} sitDown={sitDown} />
              </PositionedUISlot>
              <PositionedUISlot bottom="15%" right="2%" scale="0.55" origin="bottom right">
                <Seat seatNumber={3} currentTable={currentTable} sitDown={sitDown} />
              </PositionedUISlot>
              <PositionedUISlot bottom="8%" scale="0.55" origin="bottom center">
                <Seat seatNumber={4} currentTable={currentTable} sitDown={sitDown} />
              </PositionedUISlot>
              <PositionedUISlot bottom="15%" left="0" scale="0.55" origin="bottom left">
                <Seat seatNumber={5} currentTable={currentTable} sitDown={sitDown} />
              </PositionedUISlot>
              <PositionedUISlot top="-25%" scale="0.55" origin="top center" style={{ zIndex: '1' }}>
                <BrandingImage></BrandingImage>
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

        {currentTable &&
          currentTable.seats?.[seatId] &&
          currentTable.seats[seatId].turn && (
            <GameUI
              currentTable={currentTable}
              seatId={seatId}
              bet={bet}
              setBet={setBet}
              raise={raise}
              standUp={standUp}
              fold={fold}
              check={check}
              call={call}
            />
          )}
      </Container>
    </>
  )
}

export default Play
