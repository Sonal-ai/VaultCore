const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account must be associated with a user"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "status can be either active, frozen , closed",
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "cuurency is required for creating an account"],
        default: "INR"
    }
}, {
    timestamps: true
})

accountSchema.index({user: 1, status: 1})

const accountModel = mongoose.model("account", accountSchema)

module.exports = accountModel