import { Track, CloudflareEnv } from '../_lib/types';
import { jsonResponse } from '../_lib/utils';
import { ensureD1Tables } from '../_lib/db';
import { CURATED_POPULAR_TRACKS, searchJioSaavn, searchItunes } from '../_lib/musicSources';

export { CURATED_POPULAR_TRACKS as FALLBACK_TRACKS };

function normalizeTrackKey(title: string, artist: string): string {
  const cleanTitle = (title || '')
    .toLowerCase()
    .replace(/\(official.*?\)/gi, '')
    .replace(/\[official.*?\]/gi, '')
    .replace(/audio|video|lyric|remix|lofi|slowed|reverb|full song/gi, '')
    .replace(/[^a-z0-9]/g, '');
  const cleanArtist = (artist || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);
  return `${cleanTitle}_${cleanArtist}`;
}

export async function onRequestGet(context: { request: Request; env: CloudflareEnv }) {
  const { request, env } = context;
  const url = new URL(request.url);

  const category = (url.searchParams.get('category') || '').trim();
  const pageToken = url.searchParams.get('pageToken') || '';
  const page = parseInt(pageToken || '1', 10) || 1;
  const requestedLimit = parseInt(url.searchParams.get('limit') || (!category ? '150' : '40'), 10);
  const limit = Math.min(Math.max(requestedLimit, 10), 150);

  // Category-specific multi-query pools for unlimited, non-repeating pagination
  const categoryQueryPools: Record<string, string[]> = {
    'bollywood': [
      'latest bollywood hits arijit singh 2026',
      'top bollywood chartbusters shreya ghoshal vishal mishra',
      'romantic hindi hits pritam sachin jigar 2026',
      'bollywood party dance songs badshah honey singh',
      'superhit hindi playback songs 2025 2026',
      'bollywood emotional melodies new hindi songs',
      'latest bollywood movie original soundtracks',
      'trending hindi viral songs 2026'
    ],
    'punjabi': [
      'punjabi hits karan aujla diljit dosanjh sidhu moose wala 2026',
      'top punjabi chartbusters shubh ap dhillon',
      'punjabi pop wave gurinder sehmbi jordan sandhu',
      'latest punjabi bangers haryanvi punjabi hits',
      'punjabi lofi chill acoustic songs',
      'punjabi bhangra party blast 2026'
    ],
    'cokestudio': [
      'coke studio pakistan kaifi khalil ali sethi 2025',
      'coke studio season 14 15 pasoori tu jhoom jhol',
      'pakistani sufi magic ghazal pop faheem abdullah',
      'coke studio viral chartbusters afreen kana yaari',
      'pakistani indie acoustic pop 2026'
    ],
    'slowed': [
      'lofi hindi slowed reverb study chill late night',
      'bollywood lofi beats aesthetic midnight songs',
      'slowed reverb romantic hindi lofi 2026',
      'sad hindi lofi acoustic night vibes',
      'chill lofi pop hits Indian lofi'
    ],
    'south': [
      'tamil telugu pan india hits anirudh 2026',
      'south indian chartbusters devara hukum chuttamalle',
      'sushin shyam illuminati telugu tamil top hits',
      'devi sri prasad thaman s gv prakash hits',
      'kannada malayalam telugu tamil superhits 2026'
    ],
    'pop': [
      'global pop hits the weeknd billie eilish bruno mars sabrina carpenter',
      'top 40 billboard pop chartbusters 2026',
      'sabrina carpenter espresso taste taylor swift',
      'dua lipa tate mcrae charlie xcx pop hits',
      'viral global english pop 2026'
    ],
    'hiphop': [
      'desi hip hop divine seedhe maut krsna raftaar',
      'top indian rap bangers badshah ikka king',
      'underground desi rap hip hop 2026',
      'trap rap hindi punjabi hip hop hits'
    ],
    'rock': [
      'rock alternative hits official audio',
      'indian rock indie bands local train sanam',
      'classic rock grunge alternative bangers'
    ],
    'electronic': [
      'edm dance electronic festival hits 2026',
      'electronica house dance party anthems'
    ]
  };

  const globalTrendingPool = [
    'latest viral trending songs 2026',
    'top trending chartbuster music bollywood english punjabi',
    'hot 100 new songs 2026',
    'coke studio pakistan hits pasoori jhol tu jhoom',
    'karan aujla wavy winning speech tauba tauba',
    'diljit dosanjh born to shine goat lemonade',
    'the weeknd timeless dancing in the flames die with a smile',
    'arijit singh sajni satranga apna bana le O maahi',
    'shreya ghoshal new playback hits 2026',
    'shubh king shit cheques one love elevated',
    'anuv jain jo tum mere ho husn baarishein',
    'sabrina carpenter espresso taste please please please',
    'billie eilish birds of a feather ocean eyes wildflower',
    'anirudh ravichander hukum devara chuttamalle spark',
    'badshah millionaire tauba tauba honey singh',
    'faheem abdullah ishq rauhan malik',
    'vishal mishra pehle bhi main satranga zihaal',
    'sidhu moose wala 295 level 100 million signature',
    'ap dhillon brown munde excuses with you target',
    'sushin shyam illuminati aavesham manjummel',
    'taylor swift cruel summer fortnight I can do it with a broken heart',
    'kendrick lamar not like us luther squabble up',
    'dua lipa levitating houdini training season',
    'prateek kuhad cold mess kasoor co2',
    'chappell roan good luck babe red wine supernovo',
    'charlie xcx360 apple von dutch brat',
    'rose apt bruno mars die with a smile',
    'post malone i had some help morgan wallen',
    'tate mcrae greedy exes sports car',
    'gracie abrams us risk i love you im sorry'
  ];

  const catLower = category.toLowerCase();
  let queryPool = globalTrendingPool;

  for (const [k, pool] of Object.entries(categoryQueryPools)) {
    if (catLower.includes(k)) {
      queryPool = pool;
      break;
    }
  }

  const qIdx1 = (page - 1) % queryPool.length;
  const qIdx2 = (page * 2 - 1) % queryPool.length;
  const saavnPage = Math.floor((page - 1) / queryPool.length) + 1;
  const query1 = queryPool[qIdx1];
  const query2 = queryPool[qIdx2];

  // 1. Check D1 database if bound (only for page 1)
  let d1Tracks: Track[] = [];
  if (page === 1 && env && env.DB) {
    try {
      await ensureD1Tables(env);
      const stmt = env.DB.prepare(`
        SELECT id, title, artist, coverUrl, duration, source, viewCount 
        FROM songs_cache 
        WHERE (category = ? OR ? = '') 
        ORDER BY viewCount DESC LIMIT ?
      `);
      const { results } = await stmt.bind(category, category, limit).all();
      if (Array.isArray(results) && results.length > 0) {
        d1Tracks = results as Track[];
      }
    } catch (_) {}
  }

  // 2. Fetch live multi-source tracks across complementary queries & native pagination
  const [saavn1, saavn2, itunesTracks] = await Promise.all([
    searchJioSaavn(query1, 25, saavnPage),
    searchJioSaavn(query2, 25, saavnPage),
    searchItunes(query1, 20)
  ]);

  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const combined: Track[] = [];

  // Filter out ancient tracks (older than ~5-10 years) unless timeless
  const isAncientYear = (title: string) => {
    return /\b(199\d|200\d|2010|2011|2012|2013|2014|2015|2016|2017|2018)\b/.test(title);
  };

  for (const track of [...d1Tracks, ...saavn1, ...saavn2, ...itunesTracks]) {
    if (!track || !track.id || !track.title) continue;
    if (isAncientYear(track.title)) continue;

    const key = normalizeTrackKey(track.title, track.artist);
    if (!seenIds.has(track.id) && !seenKeys.has(key)) {
      seenIds.add(track.id);
      seenKeys.add(key);
      combined.push(track);
    }
  }

  // Fallback ONLY on Page 1 if live results returned empty
  if (combined.length === 0 && page === 1) {
    for (const track of CURATED_POPULAR_TRACKS) {
      const key = normalizeTrackKey(track.title, track.artist);
      if (!seenIds.has(track.id) && !seenKeys.has(key)) {
        seenIds.add(track.id);
        seenKeys.add(key);
        combined.push(track);
      }
    }
  }

  const finalTracks = combined.slice(0, Math.max(limit, 30));

  return jsonResponse({
    results: finalTracks,
    nextPageToken: String(page + 1),
    source: 'live_edge_catalog'
  });
}
