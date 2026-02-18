/**
 * useClipboard Hook
 * Copy text to clipboard with success feedback.
 */
import { useState, useCallback } from 'react';

export function useClipboard(resetDelay: number = 2000): {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
} {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
    }
  }, [resetDelay]);

  return { copied, copyToClipboard };
}
