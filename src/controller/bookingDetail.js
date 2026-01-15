import { PrismaClient } from "@prisma/client";
import { EMessage, SMessage } from "../service/message.js";
import { SendError, SendSuccess } from "../service/response.js";

export default class BookingDetailController {
    static async getAll(req, res) {
        try {
            const prisma = new PrismaClient();
            const bookingDetailData = await prisma.bookingDetail.findMany();
            return SendSuccess(res, SMessage.SelectAll, bookingDetailData);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async getOne(req, res) {
        try {
            const prisma = new PrismaClient();
            const booking_detail_id = req.params.booking_detail_id;
            if (!booking_detail_id) return SendError(res, 400, EMessage.BadRequest);
            const bookingDetailData = await prisma.bookingDetail.findFirst({ where: { booking_detail_id: booking_detail_id } });
            return SendSuccess(res, SMessage.SelectOne, bookingDetailData);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async getByBooking(req, res) {
        try {
            const prisma = new PrismaClient();
            const bookingId = req.params.bookingId;
            if (!bookingId) return SendError(res, 400, EMessage.BadRequest);
            const bookingDetailData = await prisma.bookingDetail.findMany({
                where: { bookingId: bookingId }, include: {
                    service: true , booking: true
                }
            },);
            return SendSuccess(res, SMessage.SelectBy, bookingDetailData);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async insert(req, res) {
        try {
            const { serviceId, bookingId } = req.body;
            if (!serviceId || !bookingId) {
                return SendError(res, 400, EMessage.BadRequest)
            }
            const prisma = new PrismaClient();    

            await prisma.bookingDetail.create({
                data: {
                    serviceId: serviceId, bookingId: bookingId
                }
            })
            return SendSuccess(res, SMessage.Insert);

        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

}