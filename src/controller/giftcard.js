import { ValidateData } from "../service/validate.js"
import { EMessage, SMessage } from "../service/message.js"
import { SendError, SendCreate, SendSuccess } from "../service/response.js"
import prisma from "../config/prima.js";
import { UploadImageToCloud } from "../config/cloudinary.js";
import { ExcelBuilder, ReportColumns } from "../service/excelBuilder.js";
export default class GiftCardController {
    static async getAllGiftCard(req, res) {
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
            //         ['name'],
            //         search
            //     );
            if (search)
                query['OR'] = [
                    { name: { contains: search } },
                ];

            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }
            const giftcard = await prisma.giftCard.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });
            if (!giftcard) return SendError(res, 404, EMessage.NotFound);
            const count = await prisma.giftCard.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));
            return SendSuccess(res, SMessage.SelectAll, { data: giftcard, totalPage })

        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectAll(req, res) {
        try {

            const data = await prisma.giftCard.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const giftcard_id = req.params.giftcard_id;

            const data = await prisma.giftCard.findFirst({ where: { giftcard_id: giftcard_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Insert(req, res) {
        try {
            const { name, point, amount } = req.body;
            const validate = await ValidateData({ name, point, amount });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            const image = req.files; // formdata
            if (!image || !image.files) {
                return SendError(res, 400, EMessage.BadRequest, "Files")
            }
            const img_url = await UploadImageToCloud(image.files.data, image.files.mimetype);
            if (!img_url) {
                return SendError(res, 404, EMessage.EUpload)
            }

            const data = await prisma.giftCard.create({
                data: {
                    name, point: parseInt(point), amount: parseInt(amount), image: img_url, createBy: req.employee
                }
            })
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async UpdateGiftCard(req, res) {
        try {
            const giftcard_id = req.params.giftcard_id;

            const { name, point } = req.body;
            const validate = await ValidateData({ name, point });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            let img_url = null;
            // check ถ้ามีไฟล์
            if (req.files && req.files.image) {
                const image = req.files.image;
                img_url = await UploadImageToCloud(image.data, image.mimetype);
                if (!img_url) {
                    return SendError(res, 404, EMessage.EUpload);
                }
            }

            const data = await prisma.giftCard.update({
                where: {
                    giftcard_id: giftcard_id, createBy: req.employee
                },
                data: {
                    name, point: parseInt(point), ...(img_url && { image: img_url })
                },
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async UpdateStatus(req, res) {
        try {
            const giftcard_id = req.params.giftcard_id;
            const { status } = req.body
            if (!status) {
                return SendError(res, 400, EMessage.BadRequest);
            }
            const giftcardStatusBoolean = String(status).toLowerCase() === "true";

            const data = await prisma.giftCard.update({
                data: {
                    status: giftcardStatusBoolean, createBy: req.employee
                }, where: { giftcard_id: giftcard_id }
            });
            return SendSuccess(res, SMessage.Update, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, 500);
        }
    }
    static async DeleteGiftcard(req, res) {
        try {
            const giftcard_id = req.params.giftcard_id;

            const data = await prisma.giftCard.delete({ where: { giftcard_id: giftcard_id } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async ExportGiftCard(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const query = {};
            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }
            const data = await prisma.giftCard.findMany({ where: query });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            const exportData = data.map(item => ({
                name: item.name,
                point: item.point,
                amount: item.amount,
            }));
            // เรียกใช้ ExcelBuilder
            return await ExcelBuilder.export(res, {
                sheetName: "GiftCard Report",
                columns: ReportColumns.giftCard,
                data: exportData,
                fileName: "giftcard-report.xlsx",
            })
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}