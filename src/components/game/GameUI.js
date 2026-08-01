 import React from 'react'
import Button from '../buttons/Button'
import { BetSlider } from './Betslider/BetSlider'
import { UIWrapper } from './UIWrapper'
import { Row, Col } from 'react-bootstrap'

export const GameUI = ({
  currentTable,
  seatId,
  bet,
  setBet,
  raise,
  standUp,
  fold,
  check,
  call,
}) => {
  // 1. Safely resolve the active seat object (handles both 1-based and 0-based seat indexing)
  const currentSeat =
    currentTable?.seats?.[seatId] ||
    currentTable?.seats?.[seatId - 1] ||
    {};

  // 2. Extract bets safely with fallbacks
  const currentBetOnTable = currentTable?.callAmount || 0;
  const myCurrentBet = currentSeat?.bet || 0;

  // 3. Determine button states
  const isCheckDisabled = currentBetOnTable !== myCurrentBet && currentBetOnTable > 0;
  const isCallDisabled = currentBetOnTable === 0 || myCurrentBet >= currentBetOnTable;
  const callDifference = currentBetOnTable > myCurrentBet ? currentBetOnTable - myCurrentBet : 0;

  // 4. Click handlers with stopPropagation to ensure events fire
  const handleFold = (e) => {
    e.stopPropagation();
    console.log("Fold button clicked");
    if (fold) fold();
  };

  const handleCheck = (e) => {
    e.stopPropagation();
    console.log("Check button clicked");
    if (check) check();
  };

  const handleCall = (e) => {
    e.stopPropagation();
    console.log("Call button clicked");
    if (call) call();
  };

  const handleRaise = (e) => {
    e.stopPropagation();
    console.log("Raise button clicked:", bet + myCurrentBet);
    if (raise) raise(bet + myCurrentBet);
  };

  return (
    <UIWrapper style={{ 
      display: 'flex', 
      position: 'relative', 
      zIndex: 99999, 
      pointerEvents: 'auto' 
    }}>
      <Row style={{ width: '100%' }}>
        <Col sm={12} md={6}>
          <Row>
            <Col sm={4}>
              <Button
                small
                secondary
                onClick={handleFold}
                style={{ 
                  minHeight: '100%', 
                  cursor: 'pointer', 
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 100000 
                }}
              >
                Fold
              </Button>
            </Col>
            <Col sm={4}>
              <Button
                small
                secondary
                disabled={isCheckDisabled}
                onClick={handleCheck}
                style={{ 
                  minHeight: '100%', 
                  cursor: isCheckDisabled ? 'not-allowed' : 'pointer', 
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 100000 
                }}
              >
                Check
              </Button>
            </Col>
            <Col sm={4}>
              <Button
                small
                disabled={isCallDisabled}
                onClick={handleCall}
                style={{ 
                  minHeight: '100%', 
                  cursor: isCallDisabled ? 'not-allowed' : 'pointer', 
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 100000 
                }}
              >
                Call {callDifference > 0 ? `$${callDifference}` : ''}
              </Button>
            </Col>
          </Row>
        </Col>
        <Col sm={12} md={6}>
          <Row>
            <Col sm={4}>
              <Button
                small
                onClick={handleRaise}
                style={{ 
                  minHeight: '100%', 
                  cursor: 'pointer', 
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 100000 
                }}
              >
                Raise
              </Button>
            </Col>
            <Col
              sm={{ span: 7, offset: 1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderImage: 'linear-gradient(to bottom, #21a68e, #0d3733) 2',
                backgroundImage: 'linear-gradient(to bottom, #187969, #081c1c)',
                backgroundOrigin: 'border-box',
                padding: '0px 5px',
                clipPath: `polygon(
                  0 5px,
                  5px 0,
                  calc(100% - 5px) 0,
                  100% 5px,
                  100% calc(100% - 5px),
                  calc(100% - 5px) 100%,
                  5px 100%,
                  0% calc(100% - 5px),
                  0% 5px
                )`,
              }}
            >
              <BetSlider
                currentTable={currentTable}
                seatId={seatId}
                bet={bet}
                setBet={setBet}
                style={{ display: 'flex', alignItems: 'center' }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </UIWrapper>
  )
}
