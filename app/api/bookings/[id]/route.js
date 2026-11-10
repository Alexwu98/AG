import { deleteBooking } from '@/lib/store';

export async function DELETE(req, { params }) {
  const { id } = params;
  if (!id) {
    return Response.json({ error: '缺少预约 ID' }, { status: 400 });
  }
  const result = await deleteBooking(id);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 404 });
  }
  return Response.json({ ok: true });
}
