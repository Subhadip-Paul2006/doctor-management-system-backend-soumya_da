export const summarizeAppointments = (appointments) => {
  const summary = {
    totalAppointments: appointments.length,
    byStatus: { WAITING: 0, CHECKED_IN: 0, ABSENT: 0, COMPLETED: 0, CANCELLED: 0 },
    bySource: { ONLINE: 0, RECEPTION: 0, WALK_IN: 0, PHONE: 0 },
    byDoctor: {},
    estimatedRevenue: 0,
  };

  for (const appt of appointments) {
    summary.byStatus[appt.status] = (summary.byStatus[appt.status] || 0) + 1;
    summary.bySource[appt.bookingSource] = (summary.bySource[appt.bookingSource] || 0) + 1;

    const doctorName = appt.doctor.user.name;
    if (!summary.byDoctor[doctorName]) {
      summary.byDoctor[doctorName] = { totalAppointments: 0, completed: 0, revenue: 0 };
    }
    summary.byDoctor[doctorName].totalAppointments += 1;

    if (appt.status === "COMPLETED") {
      summary.byDoctor[doctorName].completed += 1;
      const fee = appt.doctor.fee || 0;
      summary.byDoctor[doctorName].revenue += fee;
      summary.estimatedRevenue += fee;
    }
  }

  return summary;
};

// Monday-to-Sunday week containing the given date
export const getWeekRange = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(date);
  start.setDate(date.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getYearRange = (year) => {
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
};

// Picks whichever period field is present on a report object and formats it for display
export const getPeriodLabel = (reportData) => {
  if (reportData.date) return reportData.date;
  if (reportData.month) return reportData.month;
  if (reportData.year) return String(reportData.year);
  if (reportData.weekStart && reportData.weekEnd) return `${reportData.weekStart} to ${reportData.weekEnd}`;
  if (reportData.startDate && reportData.endDate) return `${reportData.startDate} to ${reportData.endDate}`;
  return "";
};