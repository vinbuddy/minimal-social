import express, { Application } from "express";
import env from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import router from "./routes";

env.config();

const app: Application = express();
const PORT: string | number = process.env.PORT || 5000;

// Use middlewares
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.BASE_CLIENT_URL as string }));
app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.disable("etag");

// Routes
app.use(router);

app.use(errorHandler);

app.listen(PORT, async () => {
    const uri = process.env.MONGODB_URI as string;
    try {
        await mongoose.connect(uri);
        console.log(`Database connected`);
    } catch (error: any) {
        console.log("error: ", error.message);
        process.exit(1);
    }
    console.log(`running on http://localhost:${PORT}`);
});
