import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Play from '../../pages/Play';
import NotFoundPage from '../../pages/NotFoundPage';
import ConnectWallet from '../../pages/ConnectWallet';

const AppRoutes = () => {
  console.log("AppRoutes component is mounted and rendering.");
  
  return (
    <div className="routes-container">
      <Routes>
        <Route path="/" element={<ConnectWallet />} />
        <Route path="/play" element={<Play />} />
        <Route path="*" element={<NotFoundPage />} /> 
      </Routes>
    </div>
  );
};

export default AppRoutes;