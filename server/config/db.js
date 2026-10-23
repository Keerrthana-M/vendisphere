import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vendisphere')
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`)
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`)
    // Do not exit process abruptly if running locally without active mongod service
  }
}
