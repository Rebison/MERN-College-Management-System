import student from "../models/student.js"
import Mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config({ path: "../.env" })

async function setFirstLoginTrue() {
  try {

    await Mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB Connected")

    const result = await student.updateMany(
      {},
      { $set: { firstLogin: true } } 
    )

    console.log(`Updated ${result.modifiedCount} students`)
    
  } catch (error) {
    console.error(`Error: ${error}`)
  } finally {
    await Mongoose.disconnect()
  }
}

setFirstLoginTrue()