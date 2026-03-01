import { ValidateData } from "../service/validate.js"
import { EMessage, Role, SMessage } from "../service/message.js"
import { SendError, SendCreate, SendSuccess } from "../service/response.js"
import prisma from "../config/prima.js";
import { FindOneUser } from "../service/service.js";
import shortid from "shortid";
import { matchedData } from "express-validator"
import { ExcelBuilder, ReportColumns } from "../service/excelBuilder.js";
export default class EmployeeController {
    static async SearchEmployee(req, res) {
        try {
            const search = req.query.search;

            const data = await prisma.employee.findMany({
                where: {
                    fullname: {
                        contains: search
                    }, employee_code: {
                        contains: search
                    },
                }
            });
            if (!data) {
                return SendError(res, 404, EMessage.NotFound);
            }
            return SendSuccess(res, SMessage.Search, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async getAllSuper(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                startDate,
                endDate,
            } = req.query;
            const query = {};
            // if (search)
            //     query['OR'] = getSearchQuery(
            //         ['employee_code', 'employee_name','position'],
            //         search
            //     );
            if (search)
                query['OR'] = [
                    { employee_code: { contains: search } },
                    { employee_name: { contains: search } },
                ];

            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }


            const employee = await prisma.employee.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });
            const count = await prisma.employee.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));
            return SendSuccess(res, SMessage.SelectAll, { data: employee, totalPage })
            // return SendSuccess(res,SMessage.SelectAll,{employee,count})
        } catch (error) {
            console.log(`employee/getAll error: ${error}`);

            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectAll(req, res) {
        try {

            const data = await prisma.employee.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const employee_id = req.params.employee_id;

            const data = await prisma.employee.findFirst({ where: { employee_id: employee_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

    static async Insert(req, res) {
        try {
            const { userId, branchId, employee_name, position } = req.body;
            const validate = await ValidateData({ userId, branchId, employee_name, position });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            const userData = await prisma.user.findFirst({ where: { user_id: userId } })
            if (!userData) return SendError(res, 400, EMessage.BadRequest);
            const branchData = await prisma.branch.findFirst({ where: { branch_id: branchId } })
            if (!branchData) return SendError(res, 400, EMessage.BadRequest);
            await prisma.user.update({
                where: { user_id: userId },
                data: { role: Role.admin }
            });
            const data = await prisma.employee.create({
                data: {
                    userId, branchId, employee_name, position, employee_code: "LTS_EMPL_" + shortid.generate(),
                    createBy: req.user
                }
            })
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Updateemployee(req, res) {
        try {
            const employee_id = req.params.employee_id;
            const { userId, employee_name, position } = req.body;
            const validate = await ValidateData({ userId, employee_name, position });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            await FindOneUser(userId);
            const data = await prisma.employee.update({
                data: {
                    userId, employee_name, position
                },
                where: {
                    employee_id: employee_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }

    static async Deleteemployee(req, res) {
        try {
            const userId = req.params.employee_id;

            const data = await prisma.employee.delete({ where: { employee_id: userId } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete, data)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async ExportEmployee(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const query = {};
            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }
            const data = await prisma.employee.findMany({ where: query });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            const exportData = data.map(item => ({
                EmployeeCode: item.employee_code,
                EmployeeName: item.employee_name,
                Position: item.position,
                Branch: item.branch.branch_name,
            }));
            // เรียกใช้ ExcelBuilder
            return await ExcelBuilder.export(res, {
                sheetName: "Employee Report",
                columns: ReportColumns.employee,
                data: exportData,
                fileName: "employee-report.xlsx",
            })
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}