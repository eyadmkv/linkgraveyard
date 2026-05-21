import { parse } from 'node-html-parser';

export async function scrapeMetadata(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
      },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    
    if (!res.ok) throw new Error('Failed to fetch URL');
    
    const html = await res.text();
    const root = parse(html);

    // 1st Opengraph, fallback to standard tags, fallback to the URL itself
    const title =
      root.querySelector('meta[property="og:title"]')?.getAttribute('content') ??
      root.querySelector('title')?.text?.trim() ??
      url;

    const description =
      root.querySelector('meta[property="og:description"]')?.getAttribute('content') ??
      root.querySelector('meta[name="description"]')?.getAttribute('content') ??
      '';

    const thumbnail =
      root.querySelector('meta[property="og:image"]')?.getAttribute('content') ??
      '';

    return { title, description, thumbnail };
  } catch (error) {
    // If scraping fails (network error, timeout, etc.), save with basic defaults
    return { 
      title: url, 
      description: 'Could not fetch summary details for this link.', 
      thumbnail: '' 
    };
  }
}