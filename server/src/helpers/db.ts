import mongoose from "mongoose";

import env from "dotenv";
env.config();

function connectToDB(): void {
    const uri = process.env.MONGODB_URI as string;

    try {
        mongoose.connect(uri);
    } catch (error: any) {
        console.log("error: ", error.message);
        process.exit(1);
    }

    const dbConnection = mongoose.connection;
    dbConnection.once("open", (_) => {
        console.log(`Database connected`);
    });

    dbConnection.on("error", (err) => {
        console.error(`connection error: ${err}`);
    });

    return;
}

export default connectToDB;
