import ExcelJS from "exceljs";
import { getPeriodLabel } from "../modules/report/report.helper.js";

export const generateReportExcel = async (res, filename, reportData) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");

  sheet.addRow([`${reportData.clinicName} — Report`]).font = { bold: true, size: 14 };
  sheet.addRow([`Period: ${getPeriodLabel(reportData)}`]);
  sheet.addRow([]);

  sheet.addRow(["Total Appointments", reportData.totalAppointments]);
  sheet.addRow(["Estimated Revenue (Rs.)", reportData.estimatedRevenue]);
  sheet.addRow([]);

  sheet.addRow(["Status", "Count"]).font = { bold: true };
  Object.entries(reportData.byStatus).forEach(([status, count]) => sheet.addRow([status, count]));
  sheet.addRow([]);

  sheet.addRow(["Booking Source", "Count"]).font = { bold: true };
  Object.entries(reportData.bySource).forEach(([source, count]) => sheet.addRow([source, count]));
  sheet.addRow([]);

  sheet.addRow(["Doctor", "Total", "Completed", "Revenue (Rs.)"]).font = { bold: true };
  Object.entries(reportData.byDoctor).forEach(([name, stats]) =>
    sheet.addRow([name, stats.totalAppointments, stats.completed, stats.revenue])
  );

  sheet.columns.forEach((col) => {
    col.width = 22;
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
};