import { ValidateData } from "../service/validate.js"
import { EMessage, SMessage } from "../service/message.js"
import { SendError, SendCreate, SendSuccess } from "../service/response.js"
import prisma from "../config/prima.js";
import { FindOneUser } from "../service/service.js";
export default class CarController {
    static async SearchCar(req, res) {
        try {
            const search = req.query.search;

            const data = await prisma.car.findMany({
                where: {
                    frameNumber: {
                        contains: search
                    }, plateNumber: {
                        contains: search
                    }
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
    static async SelectAll(req, res) {
        try {

            const data = await prisma.car.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const car_id = req.params.car_id;

            const data = await prisma.car.findFirst({ where: { car_id: car_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
     static async SelectBy(req, res) {
        try {
            const userId = req.params.userId;

            const data = await prisma.car.findMany({ where: { userId: userId } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectBy, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectBy(req, res) {
        try {
            const userId = req.params.userId;

            const data = await prisma.car.findMany({ where: { userId: userId } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectBy, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Insert(req, res) {
        try {
            const { userId, model, frameNumber, engineNumber, plateNumber, province, color } = req.body;
            // console.log("Inserting car:", { userId });
            console.log("car body : ",req.body);
            const validate = await ValidateData({ userId, model, frameNumber, engineNumber, plateNumber, province, color });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            await FindOneUser(userId);

            const data = await prisma.car.create({
                data: {
                    userId, model, frameNumber, engineNumber, plateNumber, province, color, createBy: req.employee
                }
            })
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async UpdateCar(req, res) {
        try {
            const car_id = req.params.car_id;
            const { userId, model, frameNumber, engineNumber, plateNumber, province, color } = req.body;
            // console.log("Updating car:", car_id);
            // console.log("New car data:", { userId, model, frameNumber, engineNumber, plateNumber, province });
            const validate = await ValidateData({ userId, model, frameNumber, engineNumber, plateNumber, province, color });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            await FindOneUser(userId);
            const data = await prisma.car.update({
                data: {
                    userId, model, frameNumber, engineNumber, plateNumber, province,createBy: req.employee
                },
                where: {
                    car_id: car_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }

    static async DeleteCar(req, res) {
        try {
            const carId = req.params.car_id;

            const data = await prisma.car.delete({ where: { car_id: carId } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete, data)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
}