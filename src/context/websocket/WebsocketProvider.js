import React, { useState, useEffect, useContext } from 'react'
import SocketContext from './socketContext'
import io from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import {
  CS_DISCONNECT,
  SC_PLAYERS_UPDATED,
  SC_RECEIVE_LOBBY_INFO,
  SC_TABLES_UPDATED,
} from '../../game/actions'
import globalContext from '../global/globalContext'
import config from '../../clientConfig'

const WebSocketProvider = ({ children }) => {
  const { setTables, setPlayers, setChipsAmount } = useContext(globalContext)
  const navigate = useNavigate()

  const [socket, setSocket] = useState(null)
  const [socketId, setSocketId] = useState(null)
  // Added isLoaded to control your loading screen
  const [isLoaded, setIsLoaded] = useState(false) 

  useEffect(() => {
    // Initialize connection
    const webSocket = io(config.socketURI, {
      transports: ['websocket'],
      upgrade: false,
    })

    registerCallbacks(webSocket)
    window.socket = webSocket
    setSocket(webSocket)

    // Cleanup listeners on unmount
    return () => {
      cleanUp()
    }
    // eslint-disable-next-line
  }, [])

  function cleanUp() {
    if (window.socket) {
      window.socket.emit(CS_DISCONNECT)
      window.socket.close()
    }
    setSocket(null)
    setSocketId(null)
    setPlayers(null)
    setTables(null)
    setIsLoaded(false)
  }

  function registerCallbacks(socket) {
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket')
      setIsLoaded(true) // Signals the app is ready
    })

    socket.on('connect_error', (err) => {
      console.error('❌ WebSocket Connection Error:', err)
      setIsLoaded(true) // Stop loading even on error so UI can show error state
    })

    socket.on(SC_RECEIVE_LOBBY_INFO, ({ tables, players, socketId, amount }) => {
      setSocketId(socketId)
      setChipsAmount(amount)
      setTables(tables)
      setPlayers(players)
    })

    socket.on(SC_PLAYERS_UPDATED, (players) => {
      setPlayers(players)
    })

    socket.on(SC_TABLES_UPDATED, (tables) => {
      setTables(tables)
    })
  }

  return (
    <SocketContext.Provider value={{ socket, socketId, cleanUp, isLoaded }}>
      {children}
    </SocketContext.Provider>
  )
}

export default WebSocketProvider