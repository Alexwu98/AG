// 预约数据存储：上线用 Vercel KV，本地开发用文件（.data/bookings.json）

let kvCache = null;

function hasKV() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKV() {
  if (!kvCache) {
    const mod = await import('@vercel/kv');
    kvCache = mod;
  }
  return kvCache;
}

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

async function readLocalFile() {
  const fs = await import('fs/promises');
  const path = await import('path');
  const file = path.join(process.cwd(), '.data', 'bookings.json');
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalFile(bookings) {
  const fs = await import('fs/promises');
  const path = await import('path');
  const file = path.join(process.cwd(), '.data', 'bookings.json');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(bookings, null, 2), 'utf8');
}

export async function listBookings() {
  if (hasKV()) {
    const { kv } = await getKV();
    const data = await kv.get('bookings');
    return Array.isArray(data) ? data : [];
  }
  return readLocalFile();
}

async function saveBookings(bookings) {
  if (hasKV()) {
    const { kv } = await getKV();
    await kv.set('bookings', bookings);
    return;
  }
  await writeLocalFile(bookings);
}

export async function createBooking({ date, slot, name, people, note }) {
  const bookings = await listBookings();
  if (bookings.some((b) => b.date === date && b.slot === slot)) {
    return { ok: false, error: '该时段刚刚被约走了，请换一个时段' };
  }
  const booking = {
    id: genId(),
    date,
    slot,
    name,
    people: Number(people) || 1,
    note: (note || '').trim(),
    createdAt: Date.now(),
  };
  bookings.push(booking);
  await saveBookings(bookings);
  return { ok: true, booking };
}

export async function deleteBooking(id) {
  const bookings = await listBookings();
  const next = bookings.filter((b) => b.id !== id);
  if (next.length === bookings.length) {
    return { ok: false, error: '未找到该预约' };
  }
  await saveBookings(next);
  return { ok: true };
}
