function validateRegister(req, res, next) {
    const { username, email, password } = req.body;
    const errors = [];

    if (!username || typeof username !== "string" || !username.trim()) {
        errors.push({ field: "username", message: "Username is required" });
    } else {
        const normalizedUsername = username.trim();
        if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
            errors.push({ field: "username", message: "Username must be between 3 and 30 characters" });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
            errors.push({ field: "username", message: "Username can only contain letters, numbers, and underscores" });
        }
    }

    if (!email || typeof email !== "string" || !email.trim()) {
        errors.push({ field: "email", message: "Email is required" });
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        errors.push({ field: "email", message: "Please provide a valid email" });
    }

    if (!password || typeof password !== "string" || !password.trim()) {
        errors.push({ field: "password", message: "Password is required" });
    } else if (password.length < 8) {
        errors.push({ field: "password", message: "Password must be at least 8 characters" });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    next();
}

function validateLogin(req, res, next) {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== "string" || !email.trim()) {
        errors.push({ field: "email", message: "Email is required" });
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        errors.push({ field: "email", message: "Please provide a valid email" });
    }

    if (!password || typeof password !== "string" || !password.trim()) {
        errors.push({ field: "password", message: "Password is required" });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    next();
}

export const registerValidator = [validateRegister];
export const loginValidator = [validateLogin];
