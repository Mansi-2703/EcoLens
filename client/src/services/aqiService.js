

import axios from "axios";


export const getAQIData = async (lat, lon) => {
const { data } = await axios.get(`http://localhost:4000/api/aqi?lat=${lat}&lon=${lon}`);
return data;
};