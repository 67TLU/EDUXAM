import AppError from "../utils/app-error.js";
import { errorResponse } from "../utils/api-response.js";

export default function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    let error = err;

    // MySQL duplicate entry
    if (err.code === "ER_DUP_ENTRY") {
        error = new AppError(
            "Resource already exists",
            409
        );
    }

    // MySQL foreign key constraint
    else if (err.code === "ER_NO_REFERENCED_ROW_2") {
        error = new AppError(
            "Referenced resource does not exist",
            400
        );
    }

    // MySQL foreign key constraint on delete/update
    else if (err.code === "ER_ROW_IS_REFERENCED_2") {
        error = new AppError(
            "Resource is being used by another record",
            409
        );
    }

    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
        console.error(err);
    }

    return errorResponse(res, {
        statusCode,
        message: error.isOperational
            ? error.message
            : "Internal server error",
        errors: error.details
    });
}