import { ValidateData } from "../service/validate.js"
import { EMessage, SMessage } from "../service/message.js"
import { SendError, SendCreate, SendSuccess } from "../service/response.js"
import prisma from "../config/prima.js";
import { UploadImageToCloud } from "../config/cloudinary.js";
export default class PromotionController {
    static async SelectAll(req, res) {
        try {

            const data = await prisma.promotion.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const promotion_id = req.params.promotion_id;

            const data = await prisma.promotion.findFirst({ where: { promotion_id: promotion_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Insert(req, res) {
        try {
            const { title, detail } = req.body;
            // console.log("req.body:", req.body);
            const validate = await ValidateData({ title, detail });
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

            const data = await prisma.promotion.create({
                data: {
                    title, detail, image: img_url , createBy: req.employee
                }
            })
            console.log("data promotion:", data);
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async UpdatePromotion(req, res) {
        try {
            const promotion_id = req.params.promotion_id;
            
            const { title, detail } = req.body;
            const validate = await ValidateData({ title, detail });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }

            let img_url = null;
            if (req.files && req.files.image) {
                const image = req.files.image;
                img_url = await UploadImageToCloud(image.data, image.mimetype);
                if (!img_url) {
                    return SendError(res, 404, EMessage.EUpload);
                }
            }

            const data = await prisma.promotion.update({
                where: {
                    promotion_id: promotion_id
                },
                data: {
                    createBy: req.employee,
                    title, detail, ...(img_url && { image: img_url })
                }

            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async DeletePromotion(req, res) {
        try {
            const promotion_id = req.params.promotion_id;
            
            const data = await prisma.promotion.delete({ where: { promotion_id: promotion_id } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
}