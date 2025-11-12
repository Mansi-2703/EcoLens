import express from "express";
import cors from "cors";
import weatherRoutes from "./routes/weatherRoutes.js";
import aqiRoutes from "./routes/aqiRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import climateRoutes from "./routes/climateRoutes.js";
import marineRoutes from "./routes/marineRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/weather", weatherRoutes);
app.use("/api/aqi", aqiRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/climate", climateRoutes);
app.use("/api/marine", marineRoutes);

export default app;
