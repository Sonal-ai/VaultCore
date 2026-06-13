// Vercel Serverless Entry Point
// Exports the Express app as a serverless function

require("dotenv").config()

const app = require("../src/app")
const connectToDB = require("../src/config/db")

// Connect to MongoDB once (reused across invocations)
let isConnected = false;

async function ensureConnection() {
    if (!isConnected) {
        await connectToDB();
        isConnected = true;
    }
}

module.exports = async (req, res) => {
    await ensureConnection();
    return app(req, res);
}
