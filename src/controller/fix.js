import { ValidateData } from "../service/validate.js"
import { EMessage, SMessage, FixStatus } from "../service/message.js"
import { SendError, SendCreate, SendSuccess } from "../service/response.js"
import prisma from "../config/prima.js";
import { FindOneBooking, FindOneZone } from "../service/service.js";
export default class FixController {
    static async SearchFix(req, res) {
        try {
            const search = req.query.search;

            const data = await prisma.fix.findMany({
                where: {
                    fixName: {
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
    static async getAllFix(req, res) {
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
                    ['fixName'],
                    search
                );

            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }
            const fix = await prisma.fix.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            });
            if (!fix) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, fix);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectAll(req, res) {
        try {

            const data = await prisma.fix.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const fix_id = req.params.fix_id;

            const data = await prisma.fix.findFirst({ where: { fix_id: fix_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

    static async SelectBy(req, res) {
        try {
            const fixStatus = req.query.fixStatus;
            const checkStatus = Object.values(FixStatus);
            if (!checkStatus.includes(fixStatus)) {
                return SendError(res, 404, EMessage.NotFound);
            }

            const data = await prisma.fix.findMany({ where: { fixStatus: fixStatus } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectBy, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

    static async Insert(req, res) {
        try {
            const { bookingId, zoneId } = req.body;
            const validate = await ValidateData({ bookingId, zoneId });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            await FindOneBooking(bookingId);
            await FindOneZone(zoneId); // ສ້າງໃນ service

            const data = await prisma.fix.create({
                data: {
                    bookingId: bookingId, zoneId: zoneId, createBy: req.employee
                }
            })
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async UpdateFixSuccess(req, res) {
        try {
            const fix_id = req.params.fix_id;

            const { bookingId, zoneId, detailFix, kmLast, kmNext, fixCarPrice, carPartPrice, totalPrice } = req.body; // ເພີ່ມ fixCarPrice, carPartPrice
            const validate = await ValidateData({ bookingId, zoneId, kmLast, kmNext, fixCarPrice, carPartPrice, totalPrice }); // ຕເພີ່ມ fixCarPrice, carPartPrice
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            await FindOneBooking(bookingId); // ສ້າງໃນ service
            await FindOneZone(zoneId); // ສ້າງໃນ service 
            const data = await prisma.fix.update({
                data: {
                    bookingId, zoneId, detailFix,
                    kmLast: parseInt(kmLast), kmNext: parseInt(kmNext), fixCarPrice: parseInt(fixCarPrice), carPartPrice: parseInt(carPartPrice), totalPrice: parseInt(totalPrice), // ເພີ່ມ fixCarPrice, carPartPrice
                    fixStatus: FixStatus.success,
                    createBy: req.employee
                },
                where: {
                    fix_id: fix_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async UpdateFix(req, res) {
        try {
            const fix_id = req.params.fix_id;

            const { bookingId, zoneId } = req.body;
            const validate = await ValidateData({ bookingId, zoneId });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            await FindOneBooking(bookingId); // ສ້າງໃນ service
            await FindOneZone(zoneId); // ສ້າງໃນ service
            const data = await prisma.fix.update({
                data: {
                    zoneId, bookingId, createBy: req.employee
                }, where: { fix_id: fix_id }
            })
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

    static async DeleteFix(req, res) {
        try {
            const fix_id = req.params.fix_id;

            const data = await prisma.fix.delete({ where: { fix_id: fix_id } })

            return SendSuccess(res, SMessage.Delete, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
}