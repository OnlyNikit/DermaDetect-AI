// Server may run in UTC (e.g. on Render) while the app is
// India-only. All date/time comparisons for appointments and
// availability MUST use India time (Asia/Kolkata, UTC+5:30),
// not the server's local timezone. Use these helpers instead
// of `new Date()` for "today"/"now" logic.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Current moment shifted into IST wall-clock values.
// (Still a Date object, but its UTC getters now read as IST.)
function nowInIST() {
  return new Date(Date.now() + IST_OFFSET_MS);
}

// "YYYY-MM-DD" for today, in IST.
function todayIST() {
  const d = nowInIST();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// "HH:MM" for right now, in IST.
function nowTimeIST() {
  const d = nowInIST();
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

// True if the given "YYYY-MM-DD" + "HH:MM" (assumed IST) is
// in the past compared to right now in IST. Pure string/number
// comparison — no Date-object timezone ambiguity at all.
function isPastIST(dateStr, timeStr) {
  const today = todayIST();
  const nowTime = nowTimeIST();

  if (dateStr < today) return true;
  if (dateStr > today) return false;
  return timeStr <= nowTime;
}

module.exports = {
  todayIST,
  nowTimeIST,
  isPastIST,
};