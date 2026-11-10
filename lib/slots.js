// 时段与日期生成逻辑

// 每晚 19:00 - 22:30，每半小时一个时段
export const SLOT_TIMES = [
  '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30',
];

// 周一=1，周三=3，周五=5
export const BOOKABLE_WEEKDAYS = [1, 3, 5];

export const WEEKDAY_NAMES = { 1: '周一', 3: '周三', 5: '周五' };

// 生成本地时区的 YYYY-MM-DD 字符串
export function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 从今天起生成接下来 weeks 周内所有周一/周三/周五
export function generateDates(weeks = 4) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetCount = weeks * 3;
  const maxDays = weeks * 7 + 10;

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const wd = d.getDay();
    if (BOOKABLE_WEEKDAYS.includes(wd)) {
      dates.push({ key: formatDateKey(d), weekday: wd, label: `${d.getMonth() + 1}月${d.getDate()}日` });
    }
    if (dates.length >= targetCount) break;
  }
  return dates;
}

// 由 "YYYY-MM-DD" 计算该日历日期的星期几（与运行机器时区无关）
export function weekdayOfDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
