// shared/excel.builder.js
import ExcelJS from "exceljs";

export class ExcelBuilder {

    static async export(res, { sheetName, columns, data, fileName }) {

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        worksheet.columns = columns;

        data.forEach(row => {
            worksheet.addRow(row);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${fileName}`
        );

        await workbook.xlsx.write(res);
        res.end();
    }
}

export const ReportColumns = {
    booking: [
        { header: "user_Name", key: "userName", width: 36 },
        { header: "phone_Number", key: "phoneNumber", width: 36 },
        { header: "branch_Name", key: "branchName", width: 36 },
        { header: "car_Model", key: "carModel", width: 36 },
        { header: "plate_Number", key: "plateNumber", width: 36 },
        { header: "date", key: "date", width: 36 },
        { header: "time", key: "time", width: 36 },
    ],
    branch: [
        { header: "BranchCode", key: "BranchCode", width: 36 },
        { header: "BranchName", key: "BranchName", width: 36 },
        { header: "Location", key: "Location", width: 36 },
    ],
    car: [
        { header: "frameNumber", key: "frameNumber", width: 36 },
        { header: "plateNumber", key: "plateNumber", width: 36 },
        { header: "model", key: "model", width: 36 },
        { header: "engineNumber", key: "engineNumber", width: 36 },
        { header: "province", key: "province", width: 36 },
        { header: "color", key: "color", width: 36 },
    ],
    employee: [
        { header: "EmployeeCode", key: "EmployeeCode", width: 36 },
        { header: "EmployeeName", key: "EmployeeName", width: 36 },
        { header: "Position", key: "Position", width: 36 },
        { header: "Branch", key: "Branch", width: 36 },
    ],
    fix: [
        { header: "CustomerName", key: "CustomerName", width: 36 },
        { header: "customerPhone", key: "customerPhone", width: 36 },
        { header: "CarModel", key: "CarModel", width: 36 },
        { header: "CarPlateNumber", key: "CarPlateNumber", width: 36 },
        { header: "CarEngineNumber", key: "CarEngineNumber", width: 36 },
        { header: "CarFrameNumber", key: "CarFrameNumber", width: 36 },
        { header: "BranchName", key: "BranchName", width: 36 },
        { header: "Zone", key: "Zone", width: 36 },
        { header: "Time", key: "Time", width: 36 },
        { header: "Date", key: "Date", width: 36 },
        { header: "DetailFix", key: "DetailFix", width: 36 },
        { header: "KmLast", key: "KmLast", width: 36 },
        { header: "KmNext", key: "KmNext", width: 36 },
        { header: "FixCarPrice", key: "FixCarPrice", width: 36 },
        { header: "CarPartPrice", key: "CarPartPrice", width: 36 },
        { header: "TotalPrice", key: "TotalPrice", width: 36 },
    ],
    giftCard: [
        { header: "name", key: "name", width: 36 },
        { header: "point", key: "point", width: 36 },
        { header: "amount", key: "amount", width: 36 },
    ],
    giftHistory: [
        { header: "CustomerName", key: "CustomerName", width: 36 },
        { header: "point", key: "point", width: 36 },
        { header: "amount", key: "amount", width: 36 },
    ],
    promotion: [
        { header: "PromotionName", key: "PromotionName", width: 36 },
        { header: "PromotionDetail", key: "PromotionDetail", width: 36 },
    ],
    service: [
        { header: "ServiceName", key: "ServiceName", width: 36 },
        { header: "ServiceDetail", key: "ServiceDetail", width: 36 },
    ],
    time: [
        { header: "Time", key: "Time", width: 36 },
        { header: "Date", key: "Date", width: 36 },
        { header: "Zone", key: "Zone", width: 36 },
        { header: "Branch", key: "Branch", width: 36 },
        { header: "TimeStatus", key: "TimeStatus", width: 36 },
    ],
    customer: [
        { header: "Name", key: "Name", width: 36 },
        { header: "PhoneNumber", key: "PhoneNumber", width: 36 },
        { header: "Province", key: "Province", width: 36 },
        { header: "District", key: "District", width: 36 },
        { header: "Village", key: "Village", width: 36 },
    ],
    employee: [
        { header: "EmployeeName", key: "EmployeeName", width: 36 },
        { header: "Position", key: "Position", width: 36 },
        { header: "Branch", key: "Branch", width: 36 },
        { header: "PhoneNumber", key: "PhoneNumber", width: 36 },
        { header: "Province", key: "Province", width: 36 },
        { header: "District", key: "District", width: 36 },
        { header: "Village", key: "Village", width: 36 },
    ],
    admin: [
        { header: "Name", key: "Name", width: 36 },
        { header: "PhoneNumber", key: "PhoneNumber", width: 36 },
        { header: "Province", key: "Province", width: 36 },
        { header: "District", key: "District", width: 36 },
        { header: "Village", key: "Village", width: 36 },
    ],
    zone: [
        { header: "ZoneName", key: "ZoneName", width: 36 },
        { header: "TimeFix", key: "TimeFix", width: 36 },
        { header: "ZoneStatus", key: "ZoneStatus", width: 36 },
    ],





};

