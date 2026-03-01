import { ValidateData } from "../service/validate.js"
import { EMessage, SMessage } from "../service/message.js"
import { SendError, SendCreate, SendSuccess } from "../service/response.js"
import prisma from "../config/prima.js";
import { UploadImageToCloud } from "../config/cloudinary.js";
import { ExcelBuilder, ReportColumns } from "../service/excelBuilder.js";
export default class ServiceController {
    static async getAllService(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
            } = req.query;
            const query = {};
            // if (search)
            //     query['OR'] = getSearchQuery(
            //         ['serviceName', 'description'],
            //         search
            //     );
            if (search)
                query['OR'] = [
                    { serviceName: { contains: search } },
                ];
            const service = await prisma.service.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });
            if (!service) return SendError(res, 404, EMessage.NotFound);
            const count = await prisma.service.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));
            return SendSuccess(res, SMessage.SelectAll, { data: service, totalPage })
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectAll(req, res) {
        try {

            const data = await prisma.service.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const service_id = req.params.service_id;

            const data = await prisma.service.findFirst({ where: { service_id: service_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Insert(req, res) {
        try {
            const { serviceName, description } = req.body;
            const validate = await ValidateData({ serviceName, description });
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

            const data = await prisma.service.create({
                data: {
                    serviceName, description, image: img_url, createBy: req.user
                }
            })
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

    static async Updateservice(req, res) {
        try {
            const service_id = req.params.service_id;
            const { serviceName, description } = req.body;

            // validate
            const validate = await ValidateData({ serviceName, description });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","));
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

            // update
            const data = await prisma.service.update({
                where: { service_id },
                data: {
                    createBy: req.employee,
                    serviceName,
                    description,
                    ...(img_url && { image: img_url }), // ถ้ามีรูปใหม่ค่อยอัพเดต
                },
            });

            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }

    static async Deleteservice(req, res) {
        try {
            const service_id = req.params.service_id;
            const data = await prisma.service.delete({ where: { service_id: service_id } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async ExportService(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const query = {};
            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }
            const data = await prisma.service.findMany({ where: query });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            const exportData = data.map(item => ({
                ServiceName: item.serviceName,
                Description: item.description,
            }));
            // เรียกใช้ ExcelBuilder
            return await ExcelBuilder.export(res, {
                sheetName: "Service Report",
                columns: ReportColumns.service,
                data: exportData,
                fileName: "service-report.xlsx",
            })
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}
