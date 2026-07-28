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