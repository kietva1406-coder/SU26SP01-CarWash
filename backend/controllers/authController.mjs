import { login } from "../services/authService.mjs";

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const token = await login(email, password);

        res.json({
            message: "Login success",
            token
        });

    } catch (err) {
        res.status(401).json({
            message: err.message
        });
    }
};