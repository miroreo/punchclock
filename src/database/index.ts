import mongoose from "mongoose";

const uri: string = process.env.MONGODB_URI;

export const getConnection = async () => {
  // check if we have a connection to the database or if it's currently
  // connecting or disconnecting (readyState 1, 2 and 3)
  if (mongoose.connection.readyState >= 1) {
    return
  }

  return mongoose.connect(process.env.MONGODB_URI);
};