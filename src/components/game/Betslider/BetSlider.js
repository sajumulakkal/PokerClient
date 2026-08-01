 import React from 'react'
import { BetSliderInput } from './BetSliderInput'
import { BetSliderWrapper } from './BetSliderWrapper'
import './BetSlider.scss'

export const BetSlider = ({ currentTable, seatId, bet, setBet }) => {
  // 1. Safely resolve current seat object (handles 1-based/0-based indexing and null states)
  const currentSeat =
    currentTable?.seats?.[seatId] ||
    currentTable?.seats?.[seatId - 1] ||
    {};

  // 2. Safe calculation of stack, limit, and bounds
  const playerStack = currentSeat?.stack || 0;
  const tableLimit = currentTable?.limit || 100000;
  
  const minBet =
    currentTable?.minBet >= currentTable?.callAmount
      ? currentTable?.minBet || 1000
      : currentTable?.callAmount || 1000;

  const maxBet =
    playerStack > 0
      ? (playerStack < tableLimit ? playerStack : tableLimit)
      : minBet * 10;

  return (
    <BetSliderWrapper>
      <BetSliderInput
        type="range"
        style={{ width: '60%' }}
        step="10"
        min={minBet}
        max={maxBet}
        value={bet || minBet}
        onChange={(e) => setBet(+e.target.value)}
      />
      <span className="bet-slider-value">$ {bet || minBet}</span>
    </BetSliderWrapper>
  )
}
