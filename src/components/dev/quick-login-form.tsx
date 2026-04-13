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
        className='min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400'
      />
      <button
        type='submit'
        disabled={!email}
        className='whitespace-nowrap rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-40'
      >
        Login as →
      </button>
    </form>
  );
}
