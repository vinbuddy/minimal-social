import express, { Application, Request, Response, NextFunction } from "express";
import env from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

env.config();

const app: Application = express();
const PORT: string | number = process.env.PORT || 5000;

// Use middlewares
app.use(cors());
app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.disable("etag");

// Routes
app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.send("Hello World!");
});

app.listen(5000, () => {
    console.log(`running on http://localhost:${PORT}`);
});
