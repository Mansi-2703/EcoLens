import axios from "axios";

export const getGlacierMeltData = async () => {
  try {
    const { data } = await axios.get('http://localhost:4000/api/glacier');
    return data.global || [];
  } catch (error) {
    console.error('Error fetching glacier melt data:', error);
    throw error;
  }
};

// Fetch WGMS glacier data for specific regions
export const getRegionalGlacierData = async () => {
  try {
    const { data } = await axios.get('http://localhost:4000/api/glacier');
    return data.regional || {};
  } catch (error) {
    console.error('Error fetching regional glacier data:', error);
    throw error;
  }
};
