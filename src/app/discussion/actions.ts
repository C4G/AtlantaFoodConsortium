//! Threads Related
export async function fetchThreads(page = 0, limit = 10) {
  if (page < 0) {
    page = 0;
  }

  const MAX_LIMIT = 100;
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const res = await fetch(`/api/threads?page=${page}&limit=${limit}`);
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to fetch thread');
  }
  return res.json();
}

export async function fetchThreadById(threadId: string) {
  const res = await fetch(`/api/threads/${threadId}`);
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to fetch thread by Id');
  }
  return res.json();
}

export async function createThread(data: {
  title: string;
  content: string;
  groupType: string;
}) {
  const res = await fetch(`/api/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to create thread');
  }
  return res.json();
}

export async function editThread(
  threadId: string,
  data: { title: string; content: string }
) {
  const res = await fetch(`/api/threads/${threadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to edit thread');
  }
  return res.json();
}

export async function deleteThread(threadId: string) {
  const res = await fetch(`/api/threads/${threadId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to delete thread');
  }
  return res.json();
}

//! Comments Related
export async function fetchComments(threadId: string, page = 0, limit = 10) {
  if (page < 0) {
    page = 0;
  }

  const MAX_LIMIT = 100;
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const res = await fetch(
    `/api/threads/${threadId}/comments?page=${page}&limit=${limit}`,
    { method: 'GET' }
  );
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to fetch comments');
  }
  return res.json();
}

export async function postComment(threadId: string, data: { content: string }) {
  const res = await fetch(`/api/threads/${threadId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to add comment');
  }
  return res.json();
}

export async function patchComment(
  threadId: string,
  commentId: string,
  data: { content: string }
) {
  const res = await fetch(`/api/threads/${threadId}/comments/${commentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to update comment');
  }
  return res.json();
}
