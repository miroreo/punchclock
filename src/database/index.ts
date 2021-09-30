import mongoose from "mongoose";

const uri: string = process.env.MONGO_DB_URI;

let conn: mongoose.Connection = null;

export const getConnection = async (): Promise<mongoose.Connection> => {
  if (conn == null) {
    conn = await mongoose.createConnection(uri, {
      bufferCommands: false, // Disable mongoose buffering
    });
  }

  return conn;
};