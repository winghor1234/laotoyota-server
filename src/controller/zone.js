import { ValidateData } from "../service/validate.js"
import { EMessage, SMessage } from "../service/message.js"
import { SendError, SendCreate, SendSuccess } from "../service/response.js"
import prisma from "../config/prima.js";
import { FindOneTime } from "../service/service.js";
import { ExcelBuilder, ReportColumns } from "../service/excelBuilder.js";
export default class ZoneController {
    static async SearchZone(req, res) {
        try {
            const search = req.query.search;

            const data = await prisma.zone.findMany({
                where: {
                    zoneName: {
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
    static async getAllZone(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
            } = req.query;
            const query = {};
            // if (search)
            //     query['OR'] = getSearchQuery(
            //         ['zoneName'],
            //         search
            //     );
            if (search)
                query['OR'] = [
                    { zoneName: { contains: search } },
                ];
            const zone = await prisma.zone.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });
            if (!zone) return SendError(res, 404, EMessage.NotFound);
            const count = await prisma.zone.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));
            return SendSuccess(res, SMessage.SelectAll, { data: zone, totalPage })
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectAll(req, res) {
        try {

            const data = await prisma.zone.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectOne(req, res) {
        try {
            const zone_id = req.params.zone_id;

            const data = await prisma.zone.findFirst({ where: { zone_id: zone_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async SelectBy(req, res) {
        try {
            const timeId = req.params.timeId;

            const data = await prisma.zone.findMany({ where: { timeId: timeId, zoneStatus: true } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectBy, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async Insert(req, res) {
        try {
            // const { zoneName, timeFix,branchId } = req.body;
            const { zoneName, timeFix } = req.body;
            // console.log(req.body);
            // const validate = await ValidateData({ zoneName, timeFix,branchId });
            const validate = await ValidateData({ zoneName, timeFix });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }

            const data = await prisma.zone.create({
                data: {
                    zoneName, timeFix, zoneStatus: true, createBy: req.user
                    // zoneName, timeFix, zoneStatus: true, createBy: req.user,branchId
                }
            })
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async UpdateZone(req, res) {
        try {
            const zone_id = req.params.zone_id;

            const { zoneName, timeFix } = req.body;
            // console.log("Update zone data:", { zoneName,timeFix });
            const validate = await ValidateData({ zoneName, timeFix });
            // await FindOneTime(timeId);
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }
            const data = await prisma.zone.updateMany({
                data: {
                    zoneName, timeFix, createBy: req.employee
                },
                where: {
                    zone_id: zone_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async UpdateZoneStatus(req, res) {
        try {
            const zone_id = req.params.zone_id;

            const { zoneStatus } = req.body;
            const validate = await ValidateData({ zoneStatus });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','));
            }

            const zoneStatusBoolean = String(zoneStatus).toLowerCase() === "true";
            const data = await prisma.zone.update({
                data: {
                    zoneStatus: zoneStatusBoolean, createBy: req.employee
                },
                where: {
                    zone_id: zone_id
                }
            });
            if (!data) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.Update, data)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async DeleteZone(req, res) {
        try {
            const zone_id = req.params.zone_id;

            const data = await prisma.zone.delete({ where: { zone_id: zone_id } })
            if (!data) return SendError(res, 404, EMessage.EDelete);
            return SendSuccess(res, SMessage.Delete)
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async ExportZone(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const query = {};
            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }
            const data = await prisma.zone.findMany({ where: query });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            const exportData = data.map(item => ({
                ZoneName: item.zoneName,
                TimeFix: item.timeFix,
                ZoneStatus: item.zoneStatus
            }));
            // เรียกใช้ ExcelBuilder
            return await ExcelBuilder.export(res, {
                sheetName: "Zone Report",
                columns: ReportColumns.zone,
                data: exportData,
                fileName: "zone-report.xlsx",
            })
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}