import mongoose from "mongoose";
import app from "./app";
import { ENV } from "./lib/env";

const mongoURI = ENV.MONGO_URI || "mongodb://localhost:27017/chatifydb";
const port = ENV.PORT || 3000;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("database mongodb connected!");

    app.listen(port, () => {
      console.log(`Server running at port: ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
