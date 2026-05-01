import jwt from "jsonwebtoken";

export function authUser(req, res, next) {

    const cookieToken = req.cookies?.token;
    const authHeader = req.headers?.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;
    const token = cookieToken || bearerToken;

    if(!token) {
        return res.status(401).json({
            message: "Unauthorized",
            success: false,
            error: "No token provided. Use login cookie or Authorization Bearer token."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized",
            success: false,
            error: "Invalid token"
        });
    }
}
