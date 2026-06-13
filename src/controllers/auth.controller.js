const userModel = require("../models/user.model")
const tokenBlackListModel = require("../models/blackList.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")

async function userRegisterController(req,res){
    try {
        const {email, password, name} = req.body

        if(!email || !password || !name){
            return res.status(400).json({
                message: "email, password and name are required",
                status: "failed"
            })
        }

        const isExists = await userModel.findOne({
            email:email
        })

        if(isExists){
            return res.status(422).json({
                message: "User already exists with email.",
                status: "failed"
            })
        }

        const user = await userModel.create({
            email, password, name
        })

        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET, {expiresIn:"3d"})
        res.cookie("token", token, { httpOnly: true, sameSite: "strict" })

        res.status(201).json({
            user:{
                _id: user._id,
                email:user.email,
                name:user.name
            },
            token
        })

        // Fire-and-forget email — don't block the response
        emailService.sendRegistrationEmail(user.email, user.name).catch(err => {
            console.error("Failed to send registration email:", err.message)
        })
    } catch(err) {
        console.error("Registration error:", err.message)
        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        })
    }
}

async function userLoginController(req,res) {
    try {
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({
                message: "email and password are required"
            })
        }

        const user = await userModel.findOne({ email }).select("+password")

        if(!user){
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }

        const isValidPassword = await user.comparePassword(password)

        if(!isValidPassword){
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET, {expiresIn:"3d"})
        res.cookie("token", token, { httpOnly: true, sameSite: "strict" })

        res.status(200).json({
            user:{
                _id: user._id,
                email:user.email,
                name:user.name
            },
            token
        })
    } catch(err) {
        console.error("Login error:", err.message)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

async function userLogoutController(req,res) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

        if(!token) {
            return res.status(200).json({
                message: "user logged out successfully"
            })
        }
        
        await tokenBlackListModel.create({
            token: token
        })

        res.clearCookie("token")
        
        return res.status(200).json({
            message: "user logged out successfully"
        })
    } catch(err) {
        console.error("Logout error:", err.message)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}



module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}