const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

const uri = process.env.MONGO_URI;

if (!uri) {
    console.error("URI environment variable is not defined.");
    process.exit(1);
}

async function checkConnection() {
    console.log("Attempting to connect to MongoDB...");
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    } finally {
        await client.close();
        console.log("Connection closed.");
    }
}

checkConnection();
