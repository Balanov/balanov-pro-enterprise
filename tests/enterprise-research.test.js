import { afterEach, describe, expect, it, vi } from 'vitest';
import { researchEntity, resolveEntitySite, searchWeb } from '../electron/research.mjs';

vi.mock('node:dns/promises', () => ({ default: { lookup: async () => [{ address: '93.184.216.34', family: 4 }] } }));

afterEach(() => vi.unstubAllGlobals());

describe('Enterprise entity resolution', () => {
  it('returns a ranked candidate for a company name instead of claiming a confirmed relation', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ results: [
      { url: 'https://teremok.ru/', title: 'Теремок — официальный сайт', content: 'Рестораны Теремок, официальный сайт компании.' },
      { url: 'https://ok.ru/teremok', title: 'Теремок в социальной сети', content: 'Публичная страница Теремок.' },
    ] }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const items = await searchWeb('"Теремок" официальный сайт');
    expect(items).toHaveLength(2);
    const candidates = await resolveEntitySite('Теремок');
    expect(candidates[0]).toMatchObject({ hostname: 'teremok.ru', url: 'https://teremok.ru/' });
    expect(candidates[0].matches).toBeGreaterThan(0);
  });

  it('marks a direct URL as direct and does not invoke entity-name search', async () => {
    const requests = [];
    vi.stubGlobal('fetch', async input => {
      const url = String(input); requests.push(url);
      if (url === 'https://agency.example/') return new Response('<html><head><title>Министерство цифрового развития</title></head><body><main><h1>Министерство цифрового развития</h1><p>Направления деятельности и государственные сервисы для граждан и организаций.</p></main></body></html>', { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      if (url.includes('format=json')) return new Response(JSON.stringify({ results: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      if (url.includes('wikipedia.org')) return new Response(JSON.stringify({ query: { search: [] } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      return new Response('<?xml version="1.0"?><rss><channel></channel></rss>', { status: 200, headers: { 'Content-Type': 'application/rss+xml' } });
    });
    const result = await researchEntity('https://agency.example/');
    expect(result.entityResolution).toBe('direct');
    expect(result.originalInput).toBe('https://agency.example/');
    expect(result.requestedUrl).toBe('https://agency.example/');
    expect(requests.some(url => url.includes('search.lumy.live'))).toBe(true);
    expect(requests.some(url => decodeURIComponent(url).includes('"https://agency.example/" официальный сайт'))).toBe(false);
  }, 15000);
});
