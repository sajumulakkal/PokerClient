import axios from 'axios';
import { toast } from 'react-toastify';

// Hardcoded URI to ensure connection to your backend on port 7778
//const SERVER_URI = 'https://sparkling-gecko-148372.netlify.app';
const SERVER_URI = 'https://pokerserver-production-b6bc.up.railway.app/';
export const useApi = () => {
  const getUserProfile = async (address) => {
    try {
      console.log(`API CALL: ${SERVER_URI}/get_profile`); // Debug log
      const { data } = await axios.post(`${SERVER_URI}/get_profile`, {
        address: address
      });
      if (data.success) {
        return data;
      } else {
        console.error('Profile load error:', data);
        return null;
      }
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  };

  const getPokerTables = async (gameId) => {
    try {
      const { data } = await axios.post(`${SERVER_URI}/get_poker_tables`, {
        gameId: gameId
      });
      if (data.success) {
        return data.result;
      } else {
        toast.error('Failed to load poker tables.');
        return null;
      }
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  };

  const getGameById = async (gameId) => {
    try {
      const { data } = await axios.post(`${SERVER_URI}/get_game_by_id`, {
        gameId: gameId
      });
      if (data.success) {
        return data.result;
      } else {
        toast.error('Failed to load game details.');
        return null;
      }
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  };

  return {
    getUserProfile,
    getPokerTables,
    getGameById,
  };
};
