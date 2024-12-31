import express from "express";
import dotenv from "dotenv";
import authRoutes from "./Routes/authRoutes";
import cors from "cors"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2000;

app.use(express.json());
app.use(cors());

const router = express.Router();
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
