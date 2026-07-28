import PDFDocument from "pdfkit";

// Generates a PDF report (daily/monthly appointment summary) as a stream piped to res
export const generateReportPDF = (res, filename, reportData) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(18).text(`${reportData.clinicName} — Report`, { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${reportData.date || reportData.month}`);
  doc.moveDown();

  doc.fontSize(14).text("Summary", { underline: true });
  doc.fontSize(11);
  doc.text(`Total Appointments: ${reportData.totalAppointments}`);
  doc.text(`Estimated Revenue: Rs. ${reportData.estimatedRevenue}`);
  doc.moveDown();

  doc.fontSize(14).text("By Status", { underline: true });
  doc.fontSize(11);
  Object.entries(reportData.byStatus).forEach(([status, count]) => {
    doc.text(`${status}: ${count}`);
  });
  doc.moveDown();

  doc.fontSize(14).text("By Booking Source", { underline: true });
  doc.fontSize(11);
  Object.entries(reportData.bySource).forEach(([source, count]) => {
    doc.text(`${source}: ${count}`);
  });
  doc.moveDown();

  doc.fontSize(14).text("By Doctor", { underline: true });
  doc.fontSize(11);
  Object.entries(reportData.byDoctor).forEach(([doctorName, stats]) => {
    doc.text(
      `${doctorName} — Total: ${stats.totalAppointments}, Completed: ${stats.completed}, Revenue: Rs. ${stats.revenue}`
    );
  });

  doc.end();
};

// Generates a simple tabular PDF of the patient list
export const generatePatientListPDF = (res, filename, clinicName, patients) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(18).text(`${clinicName} — Patient List`, { align: "center" });
  doc.moveDown();
  doc.fontSize(11).text(`Total Patients: ${patients.length}`);
  doc.moveDown();

  const startX = 40;
  let y = doc.y;
  const rowHeight = 22;

  doc.fontSize(12).font("Helvetica-Bold");
  doc.text("Name", startX, y);
  doc.text("Age", startX + 250, y);
  doc.text("Phone", startX + 330, y);
  y += rowHeight;
  doc.moveTo(startX, y - 5).lineTo(555, y - 5).stroke();

  doc.font("Helvetica").fontSize(11);
  patients.forEach((p) => {
    if (y > 750) {
      doc.addPage();
      y = 40;
    }
    doc.text(p.name || "-", startX, y, { width: 240 });
    doc.text(p.age != null ? String(p.age) : "-", startX + 250, y);
    doc.text(p.phone || "-", startX + 330, y);
    y += rowHeight;
  });

  doc.end();
};