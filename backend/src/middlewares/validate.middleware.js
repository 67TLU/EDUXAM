import AppError from "../utils/app-error.js";

export default function validate(schema, source = "body") {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            return next(
                new AppError(
                    "Validation failed",
                    422,
                    result.error.issues.map((issue) => ({
                        field: issue.path.join("."),
                        message: issue.message
                    }))
                )
            );
        }

        Object.defineProperty(req, source, {
            value: result.data,
            writable: true,
            configurable: true,
            enumerable: true
        });

        next();
    };
}