import { ValidateData } from "../service/validate.js"
import { EMessage, SMessage } from "../service/message.js"
import { SendError, SendCreate, SendSuccess } from "../service/response.js"
import prisma from "../config/prima.js";
import { FindOneUser } from "../service/service.js";
import shortid from "shortid";
import { getSearchQuery } from "../service/lib.js";
import { matchedData } from "express-validator";
export default class BranchController {

    static async getAllAdmin(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                startDate,
                endDate,
            } = matchedData(req); 
            const query = {};
            if (search)
                query['OR'] = getSearchQuery(
                    ['branch_code', 'branch_name','location'],
                    search
                );

            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }

          
            const branch = await prisma.branch.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            });
            const count = await prisma.branch.count({ where: query });
            return SendSuccess(res,SMessage.SelectAll,{branch,count})
        } catch (error) {
            console.log(`branch/getAll error: ${error}`);
        
            return SendError(res,500,EMessage.ServerInternal,error)
        }
    }

   
    static async SelectAll(req, res) {
        try {

            const data = await prisma.branch.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const branch_id = req.params.branch_id;

            const data = await prisma.branch.findFirst({ where: { branch_id: branch_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

    static async Insert(req, res) {
        try {
            const { userId, branch_name, location, phone } = req.body;
            const validate = await ValidateData({ userId, branch_name, location, phone });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            await FindOneUser(userId);
            if (!userId) return SendError(res, 400, EMessage.BadRequest);

            const data = await prisma.branch.create({
                data: {
                    createBy: userId, branch_name, location, branch_code: "LTSBC_" + shortid.generate(), phone
                }
            })
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Updatebranch(req, res) {
        try {
            const branch_id = req.params.branch_id;
            const { branch_name, location, phone } = req.body
            const validate = await ValidateData({ branch_name, location, phone });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }


            const data = await prisma.branch.update({
                data: {
                    createBy: req.employee, branch_name, location, phone
                },
                where: {
                    branch_id: branch_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update, data)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }

    static async Deletebranch(req, res) {
        try {
            const branchId = req.params.branch_id;

            const data = await prisma.branch.delete({ where: { branch_id: branchId } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete, data)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
}