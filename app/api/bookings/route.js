import { listBookings, createBooking } from '@/lib/store';
import { SLOT_TIMES, BOOKABLE_WEEKDAYS, weekdayOfDateKey } from '@/lib/slots';

// 上海时区（UTC+8，无夏令时）当前时间分量
function shanghaiParts() {
  const now = new Date(Date.now() + 8 * 3600 * 1000);
  return {
    y: now.getUTCFullYear(),
    m: now.getUTCMonth() + 1,
    d: now.getUTCDate(),
    h: now.getUTCHours(),
    min: now.getUTCMinutes(),
  };
}

function toKey(y, m, d, h, min) {
  return y * 1e8 + m * 1e6 + d * 1e4 + h * 100 + min;
}

function isPast(date, slot) {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = slot.split(':').map(Number);
  const now = shanghaiParts();
  return toKey(y, m, d, h, min) <= toKey(now.y, now.m, now.d, now.h, now.min);
}

export async function GET() {
  const bookings = await listBookings();
  return Response.json({ bookings });
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 });
  }

  const { date, slot, name, people, note } = body || {};
  const nameTrim = (name || '').trim();

  if (!nameTrim) return Response.json({ error: '请填写名字或微信名' }, { status: 400 });
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: '日期无效' }, { status: 400 });
  }
  if (!SLOT_TIMES.includes(slot)) {
    return Response.json({ error: '时段无效' }, { status: 400 });
  }
  if (!BOOKABLE_WEEKDAYS.includes(weekdayOfDateKey(date))) {
    return Response.json({ error: '只能预约周一、周三或周五' }, { status: 400 });
  }
  if (isPast(date, slot)) {
    return Response.json({ error: '该时段已结束，无法预约' }, { status: 400 });
  }

  const peopleNum = Math.max(1, Math.min(20, Math.floor(Number(people)) || 1));

  const result = await createBooking({ date, slot, name: nameTrim, people: peopleNum, note });
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 409 });
  }
  return Response.json({ ok: true, booking: result.booking });
}
