import type { User } from '@prisma/client';

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

export async function updateUser(userData: User): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  return response.json();
}

export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch('/api/users', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userId),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }
}
