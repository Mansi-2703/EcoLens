import axios from "axios";

export const getClimateData = async (lat, lon) => {
  const { data } = await axios.get(`http://localhost:4000/api/climate?lat=${lat}&lon=${lon}`);
  return data;
};
