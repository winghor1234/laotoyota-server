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
};

