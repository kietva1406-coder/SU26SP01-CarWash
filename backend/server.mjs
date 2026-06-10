import express from "express";
import cors from "cors";
import "dotenv/config";

import requestRoutes from "./routes/requestRoutes.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import { authMiddleware } from "./middleware/authMiddleware.mjs";

const app = express();


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend Running OK");
});


app.use("/api/auth", authRoutes);


app.use("/api/requests", authMiddleware, requestRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});