import { EMessage, Role } from "../service/message.js";
import { SendError } from "../service/response.js";
import { VerifyToken, FindOneUser, FindOneEmployee, FindOneByUser, FindEmployeeByUser } from "../service/service.js";
export const auth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return SendError(res, 401, EMessage.Uaunthorization)
        }
        const token = authorization.replace("Bearer ", "");
        if (!token) return SendError(res, 401, EMessage.Uaunthorization)
        const verify = await VerifyToken(token); // ສ້າງໃນ service
        req.user = verify.user_id;
        next();
    } catch (error) {
        return SendError(res, 500, EMessage.ServerInternal, error);
    }
}


export const authAdmin = async (req, res, next) => {
    try {
        const admin = req.user;
        // console.log("req user : ",admin);
        if (!admin) {
            return SendError(res, 401, EMessage.Uaunthorization)
        }
        const user = await FindOneUser(admin) // ສ້າງໃນ serivce
        if (user.role !== Role.admin) {
            return SendError(res, 401, EMessage.Uaunthorization)
        }
        const employee = await FindEmployeeByUser(user.user_id);
        if (!employee) {
            return SendError(res, 404, EMessage.EmployeeNotFound)
        }
        req.employee = employee.employee_id;
        req.branch = employee.branchId
        next();
    } catch (error) {
        return SendError(res, 500, EMessage.ServerInternal, error);
    }
}

export const authSuperAdmin = async (req, res, next) => {
    try {
        const superadmin = req.user;
        if (!superadmin) {
            return SendError(res, 401, EMessage.Uaunthorization)
        }
        const user = await FindOneUser(superadmin) // ສ້າງໃນ serivce
        if (user.role !== Role.superadmin) {
            return SendError(res, 401, EMessage.Uaunthorization)
        }
        const employee = await FindEmployeeByUser(user.user_id);
        if (!employee) {
            return SendError(res, 404, EMessage.EmployeeNotFound)
        }
        req.employee = employee.employee_id;
        req.branch = employee.branchId
        next();
    } catch (error) {
        return SendError(res, 500, EMessage.ServerInternal, error);
    }
}

export const authAdminOrSuperAdmin = async (req, res, next) => {
    try {
        const userId = req.user;
        if (!userId) {
            return SendError(res, 401, EMessage.Uaunthorization)
        }
        const user = await FindOneUser(userId) // ສ້າງໃນ serivce
        if (user.role === Role.admin) {
            const employee = await FindEmployeeByUser(user.user_id);
            if (!employee) {
                return SendError(res, 404, EMessage.EmployeeNotFound)
            }
            req.employee = employee.employee_id;
            req.branch = employee.branchId
            return next();
        }
        if (user.role === "super_admin" || user.role === "superadmin") {
            const employee = await FindEmployeeByUser(user.user_id);
            if (!employee) {
                return SendError(res, 404, EMessage.EmployeeNotFound)
            }
            req.employee = employee.employee_id;
            req.branch = employee.branchId
            return next();
        }
        return SendError(res, 401, EMessage.Uaunthorization)
    } catch (error) {
        return SendError(res, 500, EMessage.ServerInternal, error);
    }
}