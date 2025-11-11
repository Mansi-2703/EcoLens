import express from "express";
import cors from "cors";
import weatherRoutes from "./routes/weatherRoutes.js";
import aqiRoutes from "./routes/aqiRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/weather", weatherRoutes);
app.use("/api/aqi", aqiRoutes);
app.use("/api/ai", aiRoutes);

export default app;
