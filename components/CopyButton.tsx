'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <span
      onClick={handleCopy}
      className="text-blue-500 cursor-pointer hover:opacity-70 transition-opacity"
    >
      {text}
      <span className="ml-1">
        {status === 'idle' && '❐'}
        {status === 'success' && '✓'}
        {status === 'error' && '×'}
      </span>
    </span>
  );
}
