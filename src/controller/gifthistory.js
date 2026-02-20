import { ValidateData } from "../service/validate.js"
import { EMessage, SMessage } from "../service/message.js"
import { SendError, SendCreate, SendSuccess } from "../service/response.js"
import prisma from "../config/prima.js";
import { FindOneUser, FindOneGiftCard, FindOneGiftHistory } from "../service/service.js";

export default class GiftHistoryController {
    static async getAllGifthistory(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                startDate,
                endDate,
            } = req.query;
            const query = {};
            if (search)
                query['OR'] = getSearchQuery(
                    ['name'],
                    search
                );

            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }
            const giftHistory = await prisma.giftHistory.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: true,
                    giftcard: true
                }
            });
            if (!giftHistory) return SendError(res, 404, EMessage.NotFound);
            return {
                total: await prisma.giftHistory.count({ where: query }),
                page,
                limit,
                data: giftHistory
            }
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectAll(req, res) {
        try {
            
            const data = await prisma.giftHistory.findMany({
                include: {
                    user: true,
                    giftcard: true
                }
            });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const gifthistory_id = req.params.gifthistory_id;
            
            const data = await prisma.giftHistory.findFirst(
                {
                    include: {
                        user: true,
                        giftcard: true
                    },
                    where: { gifthistory_id: gifthistory_id }
                });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Insert(req, res) {
        try {
            
            const { userId, giftcardId, amount } = req.body;
            const validate = await ValidateData({ userId, giftcardId, amount });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            const user = await FindOneUser(userId); // ສ້າງຢູ່ໃນ service
            const giftcardData = await FindOneGiftCard(giftcardId); // ສ້າງຢູ່ໃນ service
            // ຕັດສະ stock
            const pointTotal = giftcardData.point * parseInt(amount)
            if (user.point < pointTotal) {
                return SendError(res, 400, "Point Not Enough")
            }
            const pointAll = user.point - pointTotal;
            const update = await prisma.user.update({
                data: {
                    point: parseInt(pointAll)
                },
                where: { user_id: userId }
            })
            if (!update) {
                return SendError(res, 400, "Error Update Point")
            }
            //--------

            const data = await prisma.giftHistory.create({
                data: {
                    userId: userId, giftcardId: giftcardId,
                    amount: parseInt(amount),
                }
            })
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async UpdateGifthistory(req, res) {
        try {
            const gifthistory_id = req.params.gifthistory_id;
            
            const { giftcardId, amount, } = req.body;
            const validate = await ValidateData({ giftcardId, amount });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            const gifthistoryData = await FindOneGiftHistory(gifthistory_id); // ສ້າງຢູ່ໃນ service
            const user = await FindOneUser(gifthistoryData.userId);
            const giftcardData = await FindOneGiftCard(giftcardId); // ສ້າງຢູ່ໃນ service
            // ຕັດສະ stock
            const pointTotalUpdate = giftcardData.point * parseInt(amount)
            //console.log("pointUpdate ====> ", pointTotalUpdate);
            const pointTotalBefore = giftcardData.point * gifthistoryData.amount;
            //console.log("pointBefore ====> ", pointTotalBefore);
            const points = pointTotalBefore + user.point;
            //console.log("points ====> ", points);
            if (points < pointTotalUpdate) {
                return SendError(res, 400, "Point Not Enough")
            }
            const pointAll = points - pointTotalUpdate;
            //console.log("pointAll ====> ", pointAll);
            const update = await prisma.user.update({
                data: {
                    point: parseInt(pointAll)
                },
                where: { user_id: gifthistoryData.userId }
            })
            if (!update) {
                return SendError(res, 400, "Error Update Point")
            }
            const data = await prisma.giftHistory.update({
                data: {
                    giftcardId: giftcardId, amount: parseInt(amount)
                },
                where: {
                    gifthistory_id: gifthistory_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update,data)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }

    static async DeleteGifthistory(req, res) {
        try {
            const gifthistory_id = req.params.gifthistory_id;
            
            const data = await prisma.giftHistory.delete({ where: { gifthistory_id: gifthistory_id } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete,data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
}