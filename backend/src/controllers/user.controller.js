import * as userService from "../services/user.service.js";
import { getPagination } from "../utils/pagination.js";

export async function getUsers(req, res, next) {
    try {
        const pagination = getPagination(req.query);

        const result = await userService.getUsers({
            ...pagination,
            search: req.query.search?.trim() || "",
            status: req.query.status || "",
            role: req.query.role || ""
        });

        res.json({
            success: true,
            data: result.users,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
}

export async function getUser(req, res, next) {
    try {
        const user = await userService.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
}

export async function createUser(req, res, next) {
    try {
        const { username, email, password, full_name, roleIds } = req.body;

        if (!username || !email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: "username, email, password and full_name are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        if (roleIds !== undefined && !Array.isArray(roleIds)) {
            return res.status(400).json({
                success: false,
                message: "roleIds must be an array"
            });
        }

        const userId = await userService.createUser({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password,
            full_name: full_name.trim(),
            roleIds: roleIds || []
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: { id: userId }
        });
    } catch (error) {
        next(error);
    }
}

export async function updateUser(req, res, next) {
    try {
        const { username, email, full_name, password, status, roleIds } = req.body;

        if (
            status !== undefined &&
            !["active", "inactive"].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user status"
            });
        }

        if (roleIds !== undefined && !Array.isArray(roleIds)) {
            return res.status(400).json({
                success: false,
                message: "roleIds must be an array"
            });
        }

        if (password !== undefined && password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        await userService.updateUser(req.params.id, {
            username: username?.trim(),
            email: email?.trim().toLowerCase(),
            full_name: full_name?.trim(),
            password,
            status,
            roleIds
        });

        res.json({
            success: true,
            message: "User updated successfully"
        });
    } catch (error) {
        next(error);
    }
}

export async function deactivateUser(req, res, next) {
    try {
        if (String(req.user.userId) === String(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account"
            });
        }

        const success = await userService.deactivateUser(req.params.id);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User deactivated successfully"
        });
    } catch (error) {
        next(error);
    }
}