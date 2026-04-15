'use client';

import { useState } from 'react';

export function QuickLoginForm() {
  const [email, setEmail] = useState('');

  return (
    <form
      action='/api/auth/test-login'
      method='GET'
      className='col-span-2 mt-1 flex gap-2'
    >
      <input
        name='email'
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='any-email@example.com'
        required
        className='min-w-0 flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'
      />
      <button
        type='submit'
        disabled={!email}
        className='whitespace-nowrap rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'
      >
        Login as →
      </button>
    </form>
  );
}
