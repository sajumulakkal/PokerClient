import React, { useContext } from 'react';
import SocketContext from './context/websocket/socketContext'; // Correct path
import AppRoutes from './components/routing/Routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';

const App = () => {
  const { isLoaded } = useContext(SocketContext);

  // If the socket connection isn't finished, render a loading indicator
  if (!isLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // Once connected, render your routes
  return <AppRoutes />;
};

export default App;