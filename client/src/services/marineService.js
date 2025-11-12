import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

export const getMarineData = async (lat, lon) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/marine`, {
      params: { lat, lon }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching marine data:', error);
    throw error;
  }
};
