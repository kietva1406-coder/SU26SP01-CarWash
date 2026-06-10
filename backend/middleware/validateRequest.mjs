export const validateCreateRequest = (req, res, next) => {
    const { title, description, priority } = req.body;

    if (!title || !description) {
        return res.status(400).json({
            message: "title and description are required"
        });
    }

    const validPriority = ["LOW", "MEDIUM", "HIGH"];

    if (priority && !validPriority.includes(priority)) {
        return res.status(400).json({
            message: "Invalid priority"
        });
    }

    next();
};