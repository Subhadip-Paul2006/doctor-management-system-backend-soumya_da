// Formats a Date into a bucket label based on granularity
export const getBucketLabel = (date, granularity) => {
  const d = new Date(date);

  if (granularity === "daily") {
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  if (granularity === "weekly") {
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    return monday.toISOString().split("T")[0]; // week starting Monday
  }

  if (granularity === "monthly") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
  }

  if (granularity === "yearly") {
    return String(d.getFullYear());
  }

  return d.toISOString().split("T")[0];
};

// Given a date range, returns the immediately preceding range of equal length —
// used to compute growth rate ("this period vs last period")
export const getPreviousEquivalentRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end.getTime() - start.getTime();

  const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000); // day before start
  const prevStart = new Date(prevEnd.getTime() - durationMs);

  return { prevStart, prevEnd };
};

export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10; // one decimal place
};