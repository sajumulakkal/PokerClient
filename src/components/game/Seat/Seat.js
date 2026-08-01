import React, { useContext, useEffect } from 'react'
import Button from '../../buttons/Button'
import modalContext from '../../../context/modal/modalContext'
import globalContext from '../../../context/global/globalContext'
import { ButtonGroup } from '../../forms/ButtonGroup'
import { Form } from '../../forms/Form'
import { FormGroup } from '../../forms/FormGroup'
import { Input } from '../../forms/Input'
import gameContext from '../../../context/game/gameContext'
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
  const { chipsAmount } = useContext(globalContext)
  const { standUp, seatId, rebuy } = useContext(gameContext)

  // Safely resolve the seat object (supports both 1-based and 0-based indexing)
  const seat =
    currentTable?.seats?.[seatNumber] ||
    currentTable?.seats?.[seatNumber - 1];

  const maxBuyin = currentTable?.limit || 100000;
  const minBuyIn = (currentTable?.minBet || 1000) * 2 * 10;

  useEffect(() => {
    if (currentTable) {
      console.log(`Seat ${seatNumber} Data:`, seat);
    }
    // eslint-disable-next-line
  }, [currentTable, seatNumber])

  const gameActions = {
    CS_CALL: {
      text: 'Call',
      bgColor: '#feaa33'
    },
    CS_FOLD: {
      text: 'Fold',
      bgColor: '#ff3332'
    },
    CS_CHECK: {
      text: 'Check',
      bgColor: '#48ff52'
    },    
    CS_RAISE: {
      text: 'Raise',
      bgColor: '#179ddc'
    },
  }

  // Robust Player Name Extractor (prevents undefined crashes)
  const getPlayerName = () => {
    if (!seat) return "Empty Seat";
    if (seat.player?.name) return seat.player.name;
    if (seat.player?.playerName) return seat.player.playerName;
    if (seat.playerName) return seat.playerName;
    if (seat.name) return seat.name;
    if (seat.player?.address) return convertOmittedAddress(seat.player.address);
    return "Player";
  };

  return (
    <StyledSeat>
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

          {/* Seat Circle */}
          <PositionedUISlot>
            <OccupiedSeat seatNumber={seatNumber} hasTurn={seat.turn} />
          </PositionedUISlot>

          {/* Hand Cards Display */}
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
            <p className="seat-name" style={{ color: 'white', fontWeight: 'bold', margin: '0' }}>
              {getPlayerName()}
            </p>
            {seat.stack !== undefined && seat.stack !== null && (
              <p className="seat-stack" style={{ color: '#21a68e', margin: '0' }}>
                {new Intl.NumberFormat(document.documentElement.lang || 'en-US').format(seat.stack)}
              </p>
            )}
          </PositionedUISlot>
        </PositionedUISlot>
      )}
    </StyledSeat>
  )
}

export default Seat
