import { ValidateData } from "../service/validate.js"
import { BookingStatus, EMessage, SMessage } from "../service/message.js"
import { SendError, SendCreate, SendSuccess } from "../service/response.js"
import prisma from "../config/prima.js";
import { FindOneTime, FindOneUser, FindOneService, FindOneCar, FindOneBooking, FindOneBranch } from "../service/service.js";
import NotificationController from "./notification.js";
import { ExcelBuilder, ReportColumns } from "../service/excelBuilder.js";
export default class BookingController {
    static async SearchBooking(req, res) {
        try {
            const search = req.query.search;

            const data = await prisma.booking.findMany({
                include: {
                    car: true,
                    user: true,
                    time: true,
                    branch: true

                },
                where: {
                    car: {
                        OR: [
                            {
                                plateNumber: {
                                    contains: search,
                                },
                            },
                            {
                                frameNumber: {
                                    contains: search,

                                },
                            },
                        ],
                    }
                }
            });
            if (!data) {
                return SendError(res, 404, EMessage.NotFound);
            }
            return SendSuccess(res, SMessage.Search, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async getAllBooking(req, res) {
        try {
            const { page = 1, limit = 10, search, startDate, endDate, } = matchedData(req);
            const query = {};
            if (search)
                query['OR'] = [
                    { code: { contains: search } },
                    { bookingStatus: { contains: search } },
                ];

            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }


            const data = await prisma.booking.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            const count = await prisma.booking.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));
            return SendSuccess(res, SMessage.SelectAll, { data, totalPage });
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async getAllBookingByBranch(req, res) {
        try {
            const branchId = req.params.branch_id;
            const { page = 1, limit = 10, search, startDate, endDate } = matchedData(req);
            const query = { branchId: branchId };
            if (search)
                query['OR'] = [
                    { code: { contains: search } },
                    { bookingStatus: { contains: search } },
                ];

            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }

            const data = await prisma.booking.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            const count = await prisma.booking.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));
            return SendSuccess(res, SMessage.SelectAll, { data, totalPage });
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectAll(req, res) {
        try {

            const data = await prisma.booking.findMany({
                include: {
                    car: true,
                    time: true,
                    user: true,
                    branch: true,
                }
            });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const booking_id = req.params.booking_id;
            // console.log("Booking ID :", booking_id);
            const data = await prisma.booking.findFirst({
                include: {
                    car: true,
                    time: true,
                    user: true,
                    branch: true,
                }, where: { booking_id: booking_id }
            });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectByBranch(req, res) {
        try {
            const branchId = req.params.branch_id;
            // console.log("Branch ID in Controller:", branchId);
            const data = await prisma.booking.findMany({
                where: { branchId: branchId },
                include: {
                    car: true,
                    time: true,
                    user: true,
                    branch: true,
                },
            });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectBy, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectByUser(req, res) {
        try {
            const userId = req.user;
            const bookingStatus = req.query.bookingStatus;

            const data = await prisma.booking.findMany({
                where: { userId: userId, bookingStatus: bookingStatus }, orderBy: {
                    createdAt: 'desc',
                },
            });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectBy, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectBy(req, res) {
        try {
            const bookingStatus = req.query.bookingStatus;
            const checkStatus = Object.values(BookingStatus);
            if (!checkStatus.includes(bookingStatus)) {
                return SendError(res, 400, EMessage.BadRequest);
            }

            const data = await prisma.booking.findMany({
                where: { bookingStatus: bookingStatus }, orderBy: {
                    createdAt: 'desc',
                },
            });

            return SendSuccess(res, SMessage.SelectBy, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

    static async Insert(req, res) {
        try {
            const { userId, timeId, carId, remark, branchId } = req.body;
            const validate = await ValidateData({ userId, timeId, carId, remark, branchId });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            await FindOneBranch(branchId);
            await FindOneUser(userId);
            await FindOneTime(timeId);
            await FindOneCar(carId); // ສ້າງຢູ່ service
            //await FindOneService(serviceId) // ສ້າງຢູ່ service


            const now = new Date();

            const dateStr = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, "0") +
                now.getDate().toString().padStart(2, "0") +
                now.getHours().toString().padStart(2, "0") +
                now.getMinutes().toString().padStart(2, "0") +
                now.getSeconds().toString().padStart(2, "0") +
                now.getMilliseconds().toString().padStart(2, "0");

            const code = "LTS" + dateStr;
            // console.log(code);
            const data = await prisma.booking.create({
                data: {
                    code: code,
                    remark: remark,
                    timeId: timeId,
                    carId: carId,
                    userId: userId,
                    branchId: branchId,

                },
                include: {
                    car: true,
                    time: true,
                    user: true,
                    branch: true,
                }

            })
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Updatebooking(req, res) {
        try {
            const booking_id = req.params.booking_id;
            const employee = req.employee;
            await FindOneBooking(booking_id);
            // const { timeId, carId, serviceId, remark, branchId } = req.body;
            const { timeId, carId, remark, branchId } = req.body;
            console.log("body of update booking:", req.body);
            // const validate = await ValidateData({ timeId, carId, serviceId, remark, branchId });
            const validate = await ValidateData({ timeId, carId, remark, branchId });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            await FindOneBranch(branchId);
            await FindOneTime(timeId);
            await FindOneCar(carId); // ສ້າງຢູ່ service
            // await FindOneService(serviceId) // ສ້າງຢູ່ service
            const data = await prisma.booking.update({
                data: {
                    timeId: timeId, carId: carId, remark, branchId, createBy: employee,
                },
                where: {
                    booking_id: booking_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async UpdateBookingStatus(req, res) {
        try {
            const booking_id = req.params.booking_id;
            const employee = req.employee;
            const { bookingStatus } = req.body;
            const checkBookingStatus = Object.values(BookingStatus);
            if (!checkBookingStatus.includes(bookingStatus)) {
                return SendError(res, 400, EMessage.BadRequest)
            }
            const data = await prisma.booking.update({
                data: {
                    bookingStatus: bookingStatus, createBy: employee
                },
                where: {
                    booking_id: booking_id
                }
            });
            if (!data) return SendError(res, 400, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async UpdateCancel(req, res) {
        try {
            const booking_id = req.params.booking_id;

            const { remark } = req.body;
            if (!remark) return SendError(res, 400, EMessage.BadRequest);
            const data = await prisma.booking.updateMany({
                data: {
                    remark: remark,
                    bookingStatus: BookingStatus.cancel, createBy: req.employee
                },
                where: {
                    booking_id: booking_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async DeleteBooking(req, res) {
        try {
            const booking_id = req.params.booking_id;

            const data = await prisma.booking.delete({ where: { booking_id: booking_id } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    // report.controller.js

    static async exportBooking(req, res) {
        try {
            const { startDate, endDate } = req.query
            //  console.log(startDate, endDate);
            // รอผลลัพธ์จาก Prisma
            const data = await prisma.booking.findMany({
                where: {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
                orderBy: { createdAt: "desc" },
                include: {
                    user: true,
                    branch: true,
                    car: true,
                    time: true,
                },
            });

            if (!data.length) {
                return SendError(res, 404, "No data found for this date range");
            }
            // console.log("Booking data:", data);
            const exportData = data.map(item => ({
                userName: item.user?.username , 
                phoneNumber: item.user?.phoneNumber,
                branchName: item.branch?.branch_name,
                carModel: item.car?.model,
                plateNumber: item.car?.plateNumber,
                date: item.time?.date,
                time: item.time?.time,
            }));

            // เรียกใช้ ExcelBuilder
            return await ExcelBuilder.export(res, {
                sheetName: "Booking Report",
                columns: ReportColumns.booking,
                data: exportData,
                fileName: "booking-report.xlsx",
            });

        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}