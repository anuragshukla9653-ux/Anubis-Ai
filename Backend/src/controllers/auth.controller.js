import User from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";

const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 8000}`;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const isUserExist = await User.findOne({ $or: [{ email }, { username }] });

        if (isUserExist) {
            return res.status(400).json({
                message: "User with email or username already exists",
                success: false,
                err: "User already exists",
            });
        }

        const user = await User.create({ username, email, password });

        const emailVerificationToken = jwt.sign(
            {
                email: user.email,
            },
            process.env.JWT_SECRET
        );

        sendEmail({
            to: email,
            subject: "Welcome to Perplexity",
            html: `<p>Hi ${username},</p><p>Thank you for registering at <strong>Perplexity</strong>! We are excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p>Please verify your email address by clicking the email below:</p>
            <a href="${apiUrl}/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
            <p>Best regards,<br>The Perplexity Team</p>`,
        }).catch((error) => {
            console.error("Welcome email failed:", error.message);
        });

        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            message: "Failed to register user",
            success: false,
            error: error.message,
        });
    }
}



export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail }).select("+password");

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
                error: "User not found",
                success: false,
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password",
                error: "Incorrect password",
                success: false,
            });
        }

        if (!user.verified) {
            return res.status(400).json({
                message: "Please verify your email before logging in",
                error: "Email not verified",
                success: false,
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Failed to log in",
            success: false,
            error: error.message,
        });
    }
}

export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    
    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            error: "No user found with the given ID",
        });
    }

    return res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user,
    });
}

export async function verifyEmail(req, res) {
    try {
        const { token } = req.query;

        if (!token || typeof token !== "string") {
            return res.status(400).send(`
                <h1>Verification link is invalid</h1>
                <p>The verification token is missing. Please request a new verification email.</p>
            `);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({
            email: decoded.email,
        });

        if (!user) {
            return res.status(404).send(`
                <h1>User not found</h1>
                <p>We could not find an account for this verification link.</p>
            `);
        }

        if (user.verified) {
            return res.status(200).send(`
                <h1>Email already verified</h1>
                <p>Your email address has already been verified. You can log in to your account.</p>
                <a href="${frontendUrl}/login">Go to Login</a>
            `);
        }

        user.verified = true;
        await user.save();

        return res.status(200).send(`
            <h1>Email verified successfully</h1>
            <p>Your email has been verified successfully. You can now log in to your account.</p>
            <a href="${frontendUrl}/login">Go to Login</a>
        `);
    } catch (error) {
        console.error("Verify email error:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(400).send(`
                <h1>Verification link expired</h1>
                <p>This verification link has expired. Please request a new verification email.</p>
            `);
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(400).send(`
                <h1>Invalid verification link</h1>
                <p>This verification link is invalid or has been tampered with.</p>
            `);
        }

        return res.status(500).send(`
            <h1>Verification failed</h1>
            <p>Something went wrong while verifying your email. Please try again later.</p>
        `);
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
        return res.status(200).json({
            message: "Logged out successfully",
            success: true,
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            message: "Failed to log out",
            success: false,
            error: error.message,
        });
    }
}

