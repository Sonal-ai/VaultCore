const express = require("express");
const cookieParser = require("cookie-parser")


const app = express()


app.use(express.json())
app.use(cookieParser())

//routes required
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRouter = require("./routes/transaction.routes")

//Routes
app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/transaction", transactionRouter)

module.exports = app