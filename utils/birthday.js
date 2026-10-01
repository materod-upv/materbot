// Birthdays are stored as 'YYYY-MM-DD'. new Date('YYYY-MM-DD') parses them as UTC midnight,
// so comparing with local getDate()/getMonth() can be off by one day. Compare the parts directly.
function isBirthdayToday(birthday, today = new Date()) {
  if (!birthday) return false;

  const [, month, day] = birthday.split('-').map(Number);
  return today.getMonth() + 1 === month && today.getDate() === day;
}

module.exports = { isBirthdayToday };
