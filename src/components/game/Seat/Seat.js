 import React, { useContext, useEffect } from 'react'
import Button from '../../buttons/Button'
import modalContext from '../../../context/modal/modalContext'
import globalContext from '../../../context/global/globalContext'
import { ButtonGroup } from '../../forms/ButtonGroup'
import { Form } from '../../forms/Form'
import { FormGroup } from '../../forms/FormGroup'
import { Input } from '../../forms/Input'
import gameContext from '../../../context/game/gameContext'
import socketContext from '../../../context/websocket/socketContext'
import { PositionedUISlot } from '../PositionedUISlot'
import { LastAction } from '../LastAction'
import PokerCard from '../PokerCard'
import ChipsAmountPill from '../ChipsAmountPill'
import ColoredText from '../../typography/ColoredText'
import PokerChip from '../../icons/PokerChip'
import { EmptySeat } from './EmptySeat'
import { OccupiedSeat } from './OccupiedSeat'
import { Hand } from '../Hand'
import { NameTag } from '../NameTag'
import Markdown from 'react-remarkable'
import DealerButton from '../../icons/DealerButton'
import SmallBlindButton from '../../icons/SmallBlindButton'
import BigBlindButton from '../../icons/BigBlindButton'
import { StyledSeat } from './StyledSeat'
import { convertOmittedAddress } from '../../../helpers/common'
import './Seat.scss'

export const Seat = ({ currentTable, seatNumber, sitDown }) => {
  const { chipsAmount, walletAddress } = useContext(globalContext)
  const { standUp, seatId, rebuy } = useContext(gameContext)
  const { socket } = useContext(socketContext)

  // 1. Resolve seat object safely (handles both Objects and Arrays without crashing)
  const resolveSeat = () => {
    if (!currentTable?.seats) return null;

    if (currentTable.seats[seatNumber]) return currentTable.seats[seatNumber];
    if (currentTable.seats[seatNumber - 1]) return currentTable.seats[seatNumber - 1];

    const seatsList = Array.isArray(currentTable.seats)
      ? currentTable.seats
      : Object.values(currentTable.seats);

    return seatsList.find(
      (s) => s && (s.seatNumber === seatNumber || s.id === seatNumber || s.seatId === seatNumber)
    );
  };

  const seat = resolveSeat();

  useEffect(() => {
    if (currentTable) {
      console.log(`Seat ${seatNumber} Data:`, seat);
    }
    // eslint-disable-next-line
  }, [currentTable, seatNumber]);

  const gameActions = {
    CS_CALL: { text: 'Call', bgColor: '#feaa33' },
    CS_FOLD: { text: 'Fold', bgColor: '#ff3332' },
    CS_CHECK: { text: 'Check', bgColor: '#48ff52' },    
    CS_RAISE: { text: 'Raise', bgColor: '#179ddc' },
  };

  // 2. STRICT single seat match logic
  // Compare numerical seatId directly or active socket match for single seat
  const isMySeat = Boolean(
    seat && (
      (seatId !== null && seatId !== undefined && Number(seatNumber) === Number(seatId)) ||
      (socket?.id && (seat.socketId === socket.id || seat.player?.socketId === socket.id) && 
       (seatId === null || seatId === undefined || Number(seatNumber) === Number(seatId)))
    )
  );

  // 3. Extract display name robustly per seat
  const getPlayerName = () => {
    if (!seat) return "Empty Seat";

    // Direct server-provided seat properties
    if (seat.player?.name && seat.player.name !== 'Player') return seat.player.name;
    if (seat.player?.username) return seat.player.username;
    if (seat.playerName && seat.playerName !== 'Player') return seat.playerName;
    if (seat.name && seat.name !== 'Player') return seat.name;

    // Address abbreviation fallback
    if (seat.player?.address) return convertOmittedAddress(seat.player.address);
    if (seat.address) return convertOmittedAddress(seat.address);

    // Use local storage name only if this is strictly your active seat
    if (isMySeat) {
      const localSavedName = localStorage.getItem('playerName');
      if (localSavedName) return localSavedName;
    }

    return seat.player?.name || `Player ${seatNumber}`;
  };

  const displayName = getPlayerName();

  return (
    <StyledSeat style={{ position: 'relative' }}>
      {!seat ? (
        <EmptySeat onClick={() => sitDown && sitDown(seatNumber)}>
          <div className="empty-set-wrapper" style={{ cursor: 'pointer' }}>
            <Markdown><span className="empty-seat">Sit Here</span></Markdown>
          </div>
        </EmptySeat>
      ) : (
        <PositionedUISlot
          style={{
            display: 'flex',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
            boxShadow: isMySeat ? '0 0 15px #21a68e' : 'none',
            border: isMySeat ? '2px solid #21a68e' : 'none',
          }}
        >
          {/* Bet Pill and Last Action Display */}
          <PositionedUISlot
            top="-7.5rem"
            left="-75px"
            origin="top center"
            style={{ minWidth: '150px', zIndex: '55' }}
          >
            {seat.bet > 0 && <ChipsAmountPill chipsAmount={seat.bet} />}
            {!currentTable.handOver && seat.lastAction && gameActions[seat.lastAction] && (
              <LastAction bgColor={gameActions[seat.lastAction]['bgColor']}>
                {gameActions[seat.lastAction]['text']}
              </LastAction>
            )}
          </PositionedUISlot>

          {/* Seat Graphic */}
          <PositionedUISlot>
            <OccupiedSeat seatNumber={seatNumber} hasTurn={seat.turn} />
          </PositionedUISlot>

          {/* Hand Cards */}
          <PositionedUISlot
            left="4vh"
            style={{
              display: 'flex',
              textAlign: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            origin="center right"
          >
            <Hand>
              {seat.hand &&
                seat.hand.map((card, index) => (
                  <PokerCard
                    key={index}
                    card={card}
                    width="5vw"
                    maxWidth="60px"
                    minWidth="30px"
                  />
                ))}
            </Hand>
          </PositionedUISlot>

          {/* Dealer Button */}
          {currentTable.button === seatNumber && (
            <PositionedUISlot
              top="-85px"
              left="-70px"
              origin="top left"
              style={{ zIndex: '55' }}
            >
              <DealerButton />
            </PositionedUISlot>
          )}

          {/* Big Blind Button */}
          {currentTable.bigBlind === seatNumber && (
            <PositionedUISlot
              top="-55px"
              left="-93px"
              origin="top left"
              style={{ zIndex: '55' }}            
            >
              <BigBlindButton />
            </PositionedUISlot>
          )}

          {/* Small Blind Button */}
          {currentTable.smallBlind === seatNumber && (
            <PositionedUISlot            
              top="-55px"
              left="-93px"
              origin="top left"
              style={{ zIndex: '55' }}
            >
              <SmallBlindButton />
            </PositionedUISlot>
          )}

          {/* Player Name Tag & Stack Count */}
          <PositionedUISlot
            top="6vh"
            style={{ minWidth: '150px', zIndex: '55' }}
            origin="bottom center"
          >
            <NameTag style={{ background: isMySeat ? '#0a3630' : undefined, border: isMySeat ? '1px solid #21a68e' : undefined }}>
              <ColoredText primary textAlign="center" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                {displayName} {isMySeat ? <span style={{ color: '#21a68e' }}>(YOU)</span> : ''}
                <br />
                {seat.stack !== undefined && seat.stack !== null && (
                  <ColoredText secondary style={{ fontSize: '12px', color: '#21a68e' }}>
                    <PokerChip width="15" height="15" />{' '}
                    {new Intl.NumberFormat(document.documentElement.lang || 'en-US').format(seat.stack)}
                  </ColoredText>
                )}
              </ColoredText>
            </NameTag>
          </PositionedUISlot>
        </PositionedUISlot>
      )}
    </StyledSeat>
  )
}

export default Seat
