const {Router} = require('express');
const transactionController = require("../controllers/transaction.controller")
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router()

//Post - to create new transaction
router.post("/" , authMiddleware.authMiddleware, transactionController.createTransaction)
router.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)

module.exports = router;