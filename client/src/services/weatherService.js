import axios from "axios";

export const getWeatherData = async (lat, lon) => {
  const { data } = await axios.get(`http://localhost:4000/api/weather?lat=${lat}&lon=${lon}`);
  return data;
};
