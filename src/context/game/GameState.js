import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CS_CALL,
  CS_CHECK,
  CS_FOLD,
  CS_JOIN_TABLE,
  CS_LEAVE_TABLE,
  CS_RAISE,
  CS_REBUY,
  CS_SIT_DOWN,
  CS_STAND_UP,
  SC_TABLE_JOINED,
  SC_TABLE_LEFT,
  SC_TABLE_UPDATED,
} from '../../game/actions'
import socketContext from '../websocket/socketContext'
import GameContext from './gameContext'
import globalContext from '../global/globalContext'

const GameState = ({ children }) => {
  const { socket } = useContext(socketContext)
  const { walletAddress } = useContext(globalContext)
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [currentTable, setCurrentTable] = useState(null)
  const [seatId, setSeatId] = useState(null)
  const [turn, setTurn] = useState(false)
  const [turnTimeOutHandle, setHandle] = useState(null)

  const currentTableRef = React.useRef(currentTable)

  useEffect(() => {
    currentTableRef.current = currentTable

    seatId &&
      currentTable &&
      currentTable.seats &&
      currentTable.seats[seatId] &&
      turn !== currentTable.seats[seatId].turn &&
      setTurn(currentTable.seats[seatId].turn)
    // eslint-disable-next-line
  }, [currentTable])

  useEffect(() => {
    if (turn && !turnTimeOutHandle) {
      const handle = setTimeout(fold, 15000)
      setHandle(handle)
    } else {
      turnTimeOutHandle && clearTimeout(turnTimeOutHandle)
      turnTimeOutHandle && setHandle(null)
    }
    // eslint-disable-next-line
  }, [turn])

  useEffect(() => {
    if (socket) {
      window.addEventListener('unload', leaveTable)
      window.addEventListener('close', leaveTable)

      socket.on(SC_TABLE_UPDATED, ({ table, message, from }) => {
        console.log(SC_TABLE_UPDATED, { table, message, from })
        setCurrentTable(table)
        message && addMessage(message)
      })

      socket.on(SC_TABLE_JOINED, (data) => {
        console.log(SC_TABLE_JOINED, data)
        // Handle variations of backend payload (supports both direct table object or tables array)
        if (data && data.table) {
          setCurrentTable(data.table)
        } else if (data && data.tables && data.tables.length > 0) {
          setCurrentTable(data.tables[0])
          if (data.tables[0].currentNumberPlayers > 0) {
            setSeatId(data.tables[0].currentNumberPlayers)
          }
        }
      })

      socket.on(SC_TABLE_LEFT, ({ tables, tableId }) => {
        console.log(SC_TABLE_LEFT, { tables, tableId })
        setCurrentTable(null)
        setMessages([])
      })
    }
    if (socket) {
      return () => leaveTable()
    }
    // eslint-disable-next-line
  }, [socket])

  const joinTable = (tableId) => {
    console.log(CS_JOIN_TABLE, tableId)
    // Pass both tableId and player structure so backend doesn't receive undefined player
    const playerPayload = {
      tableId,
      player: {
        socketId: socket.id,
        id: walletAddress || 'local-guest-id',
        name: 'Player',
        chipsAmount: 10000
      }
    };
    socket.emit(CS_JOIN_TABLE, playerPayload)
  }

  const leaveTable = () => {
    standUp()
    currentTableRef &&
      currentTableRef.current &&
      currentTableRef.current.id &&
      socket.emit(CS_LEAVE_TABLE, currentTableRef.current.id)
    navigate('/')
  }

  const sitDown = (tableId, seatId, amount) => {
    socket.emit(CS_SIT_DOWN, { tableId, seatId, amount })
    console.log(CS_SIT_DOWN, { tableId, seatId, amount })
    setSeatId(seatId)
  }

  const rebuy = (tableId, seatId, amount) => {
    socket.emit(CS_REBUY, { tableId, seatId, amount })
    console.log(CS_REBUY, { tableId, seatId, amount })
  }

  const standUp = () => {
    currentTableRef &&
      currentTableRef.current &&
      socket.emit(CS_STAND_UP, currentTableRef.current.id)
    setSeatId(null)
  }

  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message])
    console.log(message)
  }

  const fold = () => {
    currentTableRef &&
      currentTableRef.current &&
      socket.emit(CS_FOLD, currentTableRef.current.id)
  }

  const check = () => {
    currentTableRef &&
      currentTableRef.current &&
      socket.emit(CS_CHECK, currentTableRef.current.id)
  }

  const call = () => {
    currentTableRef &&
      currentTableRef.current &&
      socket.emit(CS_CALL, currentTableRef.current.id)
  }

  const raise = (amount) => {
    currentTableRef &&
      currentTableRef.current &&
      socket.emit(CS_RAISE, { tableId: currentTableRef.current.id, amount })
  }

  return (
    <GameContext.Provider
      value={{
        messages,
        currentTable,
        seatId,
        joinTable,
        leaveTable,
        sitDown,
        standUp,
        addMessage,
        fold,
        check,
        call,
        raise,
        rebuy,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export default GameState