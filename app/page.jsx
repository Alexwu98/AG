'use client';

import { useEffect, useMemo, useState } from 'react';
import { SLOT_TIMES, generateDates, formatDateKey, WEEKDAY_NAMES } from '../lib/slots';

export default function Home() {
  const dates = useMemo(() => generateDates(4), []);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { date, slot }
  const [form, setForm] = useState({ name: '', people: 1, note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const todayKey = formatDateKey(new Date());

  async function load() {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const bookingBySlot = useMemo(() => {
    const map = {};
    for (const b of bookings) {
      map[`${b.date}|${b.slot}`] = b;
    }
    return map;
  }, [bookings]);

  function isPast(dateKey, slot) {
    if (dateKey !== todayKey) return false;
    const [h, m] = slot.split(':').map(Number);
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return h * 60 + m <= nowMin;
  }

  function openModal(date, slot) {
    setForm({ name: '', people: 1, note: '' });
    setMessage(null);
    setModal({ date, slot });
  }

  async function submit() {
    if (!form.name.trim()) {
      setMessage({ type: 'error', text: '请填写名字或微信名' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: modal.date,
          slot: modal.slot,
          name: form.name,
          people: form.people,
          note: form.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || '预约失败，请重试' });
        return;
      }
      setMessage({ type: 'success', text: '预约成功！' });
      setModal(null);
      await load();
    } catch {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1>预约表</h1>
        <div className="sub">周一 / 周三 / 周五 · 晚上 19:00 - 22:30 · 每半小时一个时段</div>
      </header>

      {message && <div className={`banner ${message.type}`}>{message.text}</div>}

      {loading ? (
        <div className="banner">加载中…</div>
      ) : (
        dates.map((date) => (
          <div className="date-card" key={date.key}>
            <div className="date-title">
              {date.label}
              <span className="wd">{WEEKDAY_NAMES[date.weekday]}</span>
            </div>
            <div className="slot-grid">
              {SLOT_TIMES.map((slot) => {
                const booked = bookingBySlot[`${date.key}|${slot}`];
                const past = isPast(date.key, slot);
                if (booked) {
                  return (
                    <div className="slot booked" key={slot}>
                      <span className="time">{slot}</span>
                      <span className="info">{booked.name}</span>
                    </div>
                  );
                }
                if (past) {
                  return (
                    <div className="slot past" key={slot}>
                      <span className="time">{slot}</span>
                      <span className="info">已结束</span>
                    </div>
                  );
                }
                return (
                  <button className="slot available" key={slot} onClick={() => openModal(date.key, slot)}>
                    <span className="time">{slot}</span>
                    <span className="info">可预约</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}

      <div className="footer-note">点击「可预约」时段即可预约，只需填写名字或微信名</div>

      {modal && (
        <div className="modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>预约</h2>
            <div className="slot-hint">
              {modal.date} · {modal.slot}
            </div>
            <div className="field">
              <label>名字 / 微信名 *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="填写名字或微信名"
                autoFocus
              />
            </div>
            <div className="field">
              <label>一起来的人数（含自己）</label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.people}
                onChange={(e) => setForm({ ...form, people: e.target.value })}
              />
            </div>
            <div className="field">
              <label>备注（可选）</label>
              <input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="如有需要可备注"
              />
            </div>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setModal(null)} disabled={submitting}>
                取消
              </button>
              <button className="btn primary" onClick={submit} disabled={submitting}>
                {submitting ? '提交中…' : '确认预约'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
