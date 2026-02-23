/**
 * API Route: Fetch Page HTML
 * Server-side proxy to fetch website HTML content for analysis.
 * This avoids CORS issues that would occur from client-side fetching.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

interface FetchResponse {
  html?: string;
  error?: string;
  status?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FetchResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Block non-HTTP protocols
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: 'Only HTTP/HTTPS URLs are supported' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CROAuditBot/1.0; +https://github.com/cro-tool-suite)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(502).json({
        error: `Website returned status ${response.status}`,
        status: response.status,
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return res.status(400).json({ error: 'URL does not return HTML content' });
    }

    const html = await response.text();

    if (!html || html.length < 100) {
      return res.status(400).json({ error: 'Page returned insufficient content' });
    }

    // Cap response size at 2MB
    const truncatedHtml = html.slice(0, 2_000_000);

    return res.status(200).json({ html: truncatedHtml });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out after 15 seconds' });
    }

    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(502).json({
      error: `Failed to fetch page: ${message}`,
    });
  }
}
