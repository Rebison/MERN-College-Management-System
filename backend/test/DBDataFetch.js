import { MongoClient } from 'mongodb';
import { writeFileSync } from 'fs';
import { config } from "dotenv";
config({ path: '../.env' });

async function exportData() {
  const client = new MongoClient(process.env.MONGO_URI);


  try {
    await client.connect();
    const db = client.db("linchpin");
    const collection = db.collection("_enrolmentRequest");

    const data = await collection.find({}).toArray(); // Fetch all documents

    writeFileSync("enrolmentRequest.json", JSON.stringify(data, null, 2)); // Save to JSON file
    console.log("Data exported successfully to data.json");
  } finally {
    await client.close();
  }
}

exportData();
