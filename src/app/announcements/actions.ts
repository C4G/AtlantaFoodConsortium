export async function fetchAnnouncements() {
  const res = await fetch('/api/admin-announcements');
  if (!res.ok) throw new Error('Failed to load announcements');
  return res.json();
}

export async function createAnnouncement(data: unknown) {
  const res = await fetch('/api/admin-announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create announcement');
  return res.json();
}

export async function updateAnnouncement(id: string, data: unknown) {
  const res = await fetch(`/api/admin-announcements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update announcement');
  return res.json();
}

export async function deleteAnnouncement(id: string) {
  const res = await fetch(`/api/admin-announcements/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete announcement');
  return res.json();
}
