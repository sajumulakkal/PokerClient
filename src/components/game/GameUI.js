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
  // Safely get current seat
  const currentSeat =
    currentTable?.seats?.[seatId] ||
    currentTable?.seats?.[seatId - 1] ||
    {};

  const currentBetOnTable = currentTable?.callAmount || 0;
  const myCurrentBet = currentSeat?.bet || 0;

  // Simple disabled checks
  const isCheckDisabled = currentBetOnTable > 0 && currentBetOnTable !== myCurrentBet;
  const isCallDisabled = currentBetOnTable === 0 || myCurrentBet >= currentBetOnTable;
  const callDifference = currentBetOnTable > myCurrentBet ? currentBetOnTable - myCurrentBet : 0;

  return (
    <UIWrapper style={{ display: 'flex', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <Row style={{ width: '100%' }}>
        <Col sm={12} md={6}>
          <Row>
            <Col sm={4}>
              <Button
                small
                secondary
                onClick={fold}
                style={{ minHeight: '100%', width: '100%' }}
              >
                Fold
              </Button>
            </Col>
            <Col sm={4}>
              <Button
                small
                secondary
                disabled={isCheckDisabled}
                onClick={check}
                style={{ minHeight: '100%', width: '100%' }}
              >
                Check
              </Button>
            </Col>
            <Col sm={4}>
              <Button
                small
                disabled={isCallDisabled}
                onClick={call}
                style={{ minHeight: '100%', width: '100%' }}
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
                onClick={() => raise(bet + myCurrentBet)}
                style={{ minHeight: '100%', width: '100%' }}
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
                padding: '0px 5px',
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
