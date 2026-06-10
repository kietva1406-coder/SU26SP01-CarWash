import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

/**
 * AUTH JWT
 */
export const authMiddleware = (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({ message: "No token" });
        }

        const token = header.split(" ")[1];

        const decoded = jwt.verify(token, SECRET);

        req.user = decoded;

        next();

    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

/**
 * ROLE CHECK
 */
export const requireManager = (req, res, next) => {
    if (req.user.role !== "MANAGER") {
        return res.status(403).json({ message: "Manager only" });
    }
    next();
};

export const requireCustomer = (req, res, next) => {
    if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({ message: "Customer only" });
    }
    next();
};

export const requireStaff = (req, res, next) => {
    // Both STAFF and MANAGER should probably be able to view staff routes if needed, or just STAFF. We'll strict it to STAFF based on pattern.
    if (req.user.role !== "STAFF") {
        return res.status(403).json({ message: "Staff only" });
    }
    next();
};