'use client';

import { useEffect, useMemo, useState } from 'react';
import { WEEKDAY_NAMES } from '../../lib/slots';

export default function AdminPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      const list = (data.bookings || []).slice().sort((a, b) =>
        (a.date + a.slot).localeCompare(b.date + b.slot)
      );
      setBookings(list);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function del(id, name) {
    if (!window.confirm(`确定取消「${name}」的这条预约吗？`)) return;
    setDeleting(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || '删除失败' });
        return;
      }
      setMessage({ type: 'success', text: '已取消该预约' });
      await load();
    } catch {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setDeleting(null);
    }
  }

  const grouped = useMemo(() => {
    const map = new Map();
    for (const b of bookings) {
      if (!map.has(b.date)) map.set(b.date, []);
      map.get(b.date).push(b);
    }
    return Array.from(map.entries());
  }, [bookings]);

  function fmtDate(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return `${m}月${d}日 ${WEEKDAY_NAMES[wd] || ''}`;
  }

  const totalPeople = bookings.reduce((s, b) => s + (Number(b.people) || 1), 0);

  return (
    <div className="page">
      <header className="header">
        <h1>预约后台</h1>
        <div className="sub">共 {bookings.length} 条预约 · {totalPeople} 人</div>
      </header>

      {message && <div className={`banner ${message.type}`}>{message.text}</div>}

      <button className="btn ghost" style={{ width: '100%', marginBottom: 16 }} onClick={load}>
        刷新
      </button>

      {loading ? (
        <div className="banner">加载中…</div>
      ) : grouped.length === 0 ? (
        <div className="banner">暂无预约</div>
      ) : (
        grouped.map(([date, items]) => (
          <div className="date-card" key={date}>
            <div className="date-title">{fmtDate(date)}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={th}>时间</th>
                  <th style={th}>名字</th>
                  <th style={th}>人数</th>
                  <th style={th}>备注</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id}>
                    <td style={td}>{b.slot}</td>
                    <td style={td}>{b.name}</td>
                    <td style={td}>{b.people}</td>
                    <td style={td}>{b.note || '-'}</td>
                    <td style={td}>
                      <button
                        className="btn ghost"
                        style={{ padding: '6px 12px', fontSize: 13 }}
                        onClick={() => del(b.id, b.name)}
                        disabled={deleting === b.id}
                      >
                        {deleting === b.id ? '取消中…' : '取消'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

const th = { textAlign: 'left', padding: '8px 6px', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: 500 };
const td = { padding: '8px 6px', borderBottom: '1px solid #f1f2f4' };
