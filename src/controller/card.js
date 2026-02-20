import { ValidateData } from "../service/validate.js"
import { EMessage, SMessage } from "../service/message.js"
import { SendError, SendCreate, SendSuccess } from "../service/response.js"
import prisma from "../config/prima.js";
import { FindOneUser } from "../service/service.js";
import { UploadImageToCloud } from "../config/cloudinary.js";
export default class CardController {
    static async getAllCard(req, res) {
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
                    ['customer_number', 'card_number', 'vip_number'],
                    search
                );

            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }
            const card = await prisma.card.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            });
            if (!card) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.GetAll, card, page, limit);
            function getSearchQuery(columns, search) {
                const searchQuery = {};
                columns.forEach(column => {
                    searchQuery[column] = { contains: search };
                });
                return searchQuery;
            }
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectAll(req, res) {
        try {

            const data = await prisma.card.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const card_id = req.params.card_id;

            const data = await prisma.card.findFirst({ where: { card_id: card_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Insert(req, res) {
        try {
            const { userId, customer_number, card_number, vip_number, discount } = req.body;
            const validate = await ValidateData({ userId, customer_number, card_number, vip_number, discount });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            await FindOneUser(userId);

            const data = await prisma.card.create({
                data: {
                    userId, customer_number, card_number, vip_number, discount: parseInt(discount), createBy: req.employee
                }
            })
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async UpdateCard(req, res) {
        try {
            const card_id = req.params.card_id;

            const { userId, customer_number, card_number, vip_number, discount } = req.body;
            const validate = await ValidateData({ userId, customer_number, card_number, vip_number, discount });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            await FindOneUser(userId);
            const data = await prisma.card.update({
                data: {
                    userId, customer_number, card_number, vip_number, discount: parseInt(discount), createBy: req.employee
                },
                where: {
                    card_id: card_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }

    static async DeleteCard(req, res) {
        try {
            const card_id = req.params.card_id;

            const data = await prisma.card.delete({ where: { card_id: card_id } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
}