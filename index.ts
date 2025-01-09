import express from "express";
import dotenv from "dotenv";
import authRoutes from "./Routes/authRoutes";
import instructorRoutes from './Routes/instructorRoutes'
import classRoutes from './Routes/classRoutes'
import adminRoutes from './Routes/adminRoutes'
import cors from "cors"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2000;


app.use(cors());
app.use(express.json());


const router = express.Router();
app.use("/auth", authRoutes);
app.use("/instructor",instructorRoutes)
app.use('/classes',classRoutes)
app.use("/admin",adminRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
