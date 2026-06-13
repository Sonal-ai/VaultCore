const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors")
const path = require("path")


const app = express()

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../public")))

//routes required
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRouter = require("./routes/transaction.routes")

//Routes
app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/transaction", transactionRouter)

// SPA catch-all — serve index.html for any non-API route
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"))
})

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err)
    res.status(500).json({
        message: "Internal server error"
    })
})

module.exports = app