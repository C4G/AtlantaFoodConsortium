'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EmailPrefs {
  announcementEmailOptOut: boolean;
  discussionEmailOptOut: boolean;
}

function Toggle({
  enabled,
  disabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  disabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      role='switch'
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        enabled ? 'bg-primary' : 'bg-input',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0',
          'transition-transform duration-200',
          enabled ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

export function EmailSettingsForm() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<EmailPrefs>({
    announcementEmailOptOut: false,
    discussionEmailOptOut: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: EmailPrefs) => setPrefs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = async (next: EmailPrefs) => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      toast({ title: '✓ Preferences saved', variant: 'success' });
    } catch {
      // revert optimistic update and surface the error
      setPrefs(prefs);
      toast({ title: 'Failed to save preferences', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (field: keyof EmailPrefs) => {
    const next = { ...prefs, [field]: !prefs[field] };
    setPrefs(next);
    save(next);
  };

  if (loading) {
    return (
      <div className='space-y-4'>
        {[0, 1].map((i) => (
          <div key={i} className='flex items-center gap-3'>
            <div className='h-6 w-11 animate-pulse rounded-full bg-muted' />
            <div className='h-4 w-48 animate-pulse rounded bg-muted' />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      {/* Announcement emails */}
      <div className='flex items-center justify-between gap-4'>
        <div>
          <p className='text-sm font-medium'>Announcement emails</p>
          <p className='text-xs text-muted-foreground'>
            Receive emails when new announcements are posted.
          </p>
        </div>
        <Toggle
          enabled={!prefs.announcementEmailOptOut}
          disabled={saving}
          onToggle={() => toggle('announcementEmailOptOut')}
          label='Toggle announcement emails'
        />
      </div>

      {/* Discussion emails */}
      <div className='flex items-center justify-between gap-4'>
        <div>
          <p className='text-sm font-medium'>Discussion emails</p>
          <p className='text-xs text-muted-foreground'>
            Receive emails when new discussion threads are posted.
          </p>
        </div>
        <Toggle
          enabled={!prefs.discussionEmailOptOut}
          disabled={saving}
          onToggle={() => toggle('discussionEmailOptOut')}
          label='Toggle discussion emails'
        />
      </div>
    </div>
  );
}
