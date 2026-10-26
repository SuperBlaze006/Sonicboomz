import { Track, CloudflareEnv } from '../_lib/types';
import { jsonResponse } from '../_lib/utils';
import { ensureD1Tables } from '../_lib/db';
import { CURATED_POPULAR_TRACKS, getCategoryFallbackTracks, searchYouTube, searchJioSaavn, searchItunes } from '../_lib/musicSources';

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
  const isRefresh = url.searchParams.get('refresh') === 'true';
  const requestedLimit = parseInt(url.searchParams.get('limit') || (!category ? '150' : '40'), 10);
  const limit = Math.min(Math.max(requestedLimit, 10), 150);

  // Category-specific multi-query pools for all 11 Trending Charts
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
    'hollywood': [
      'billboard hot 100 hollywood english trending hit songs 2026',
      'top hollywood chartbusters the weeknd bruno mars sabrina carpenter',
      'popular hollywood english pop songs taylor swift billie eilish dua lipa',
      'global english chartbusters coldplay post malone ed sheeran',
      'billboard top 40 radio hits 2026 official video',
      'viral english songs tiktok billboard hits 2026'
    ],
    'cokestudio': [
      'coke studio pakistan kaifi khalil ali sethi 2025',
      'coke studio season 14 15 pasoori tu jhoom jhol',
      'pakistani sufi magic ghazal pop faheem abdullah',
      'coke studio viral chartbusters afreen kana yaari',
      'pakistani indie acoustic pop 2026',
      'coke studio unplugged live sessions atif aslam'
    ],
    'hustle': [
      'mtv hustle viral hit songs king mc square paradox bella',
      'mtv hustle season 3 season 4 top songs uday pandhi mrunal shankar',
      'hustle rap reality show young indian artists viral songs',
      'indian reality show breakout youngsters original hit songs hustle cypher',
      'mtv hustle best performances rap bangers official audio'
    ],
    'south': [
      'tamil telugu pan india hits anirudh 2026',
      'south indian chartbusters devara hukum chuttamalle',
      'sushin shyam illuminati telugu tamil top hits',
      'devi sri prasad thaman s gv prakash hits',
      'kannada malayalam telugu tamil superhits 2026',
      'anirudh ravichander latest hits devara leo jailer spark'
    ],
    'hiphop': [
      'desi hip hop divine seedhe maut krsna raftaar',
      'top indian rap bangers badshah ikka king',
      'underground desi rap hip hop 2026',
      'trap rap hindi punjabi hip hop hits',
      'young desi rappers viral drill rap 2026'
    ],
    'indianpop': [
      'indian pop viral hit songs anuv jain ap dhillon diljit dosanjh',
      'desi indie pop hits prateek kuhad zaeden aditya rikhari mitraz',
      'indian pop chartbusters king ritviz armaan malik akshath',
      'hindi & punjabi indie pop acoustic hits talwiinder',
      'anuv jain husn baarishein jo tum mere ho official audio'
    ],
    'lofi': [
      'hindi lofi chill relaxing songs arijit singh anuv jain',
      'soothing lofi chill songs late night relaxation aesthetic hindi indie',
      'chill relaxing lofi version popular songs peaceful evening study vibes',
      'bollywood lofi chill mix peaceful sleep relaxation unplugged beats'
    ],
    'slowed': [
      'trending hindi songs slowed and reverb night vibe arijit singh',
      'popular viral songs slowed and reverb late night evening morning chill audio',
      'coke studio & indie trending songs slowed and reverb jhol pasoori',
      'top punjabi & english trending songs slowed and reverb night drive vibes',
      'slowed reverb aesthetic hindi songs 2026'
    ],
    'rock': [
      'indian classical fusion sufi rock songs ar rahman nusrat fateh ali khan',
      'hindi rock classics the local train agnee euphoria junoon strings lucky ali',
      'rock classics anthems linkin park queen imagine dragons coldplay',
      'indian semi classical sufi rock masterpieces shankar mahadevan javed ali'
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
    'charlie xcx 360 apple von dutch brat',
    'rose apt bruno mars die with a smile',
    'post malone i had some help morgan wallen',
    'tate mcrae greedy exes sports car',
    'gracie abrams us risk i love you im sorry'
  ];

  const catRaw = (category || '').trim();
  const catClean = catRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
  const isAllTrending = !catRaw || catClean === 'alltrending' || catClean === 'all';

  let queryPool = globalTrendingPool;
  if (isAllTrending) {
    queryPool = globalTrendingPool;
  } else if (catClean.includes('bollywood') || catClean.includes('hindi')) {
    queryPool = categoryQueryPools.bollywood;
  } else if (catClean.includes('hollywood') || catClean.includes('english')) {
    queryPool = categoryQueryPools.hollywood;
  } else if (catClean.includes('coke') || catClean.includes('pakistan')) {
    queryPool = categoryQueryPools.cokestudio;
  } else if (catClean.includes('hustle') || catClean.includes('reality')) {
    queryPool = categoryQueryPools.hustle;
  } else if (catClean.includes('south') || catClean.includes('tamil') || catClean.includes('telugu') || catClean.includes('malayalam') || catClean.includes('kannada')) {
    queryPool = categoryQueryPools.south;
  } else if (catClean.includes('hiphop') || catClean.includes('rap')) {
    queryPool = categoryQueryPools.hiphop;
  } else if (catClean.includes('indianpop') || (catClean.includes('pop') && !catClean.includes('hollywood'))) {
    queryPool = categoryQueryPools.indianpop;
  } else if (catClean.includes('lofi') || catClean.includes('chill')) {
    queryPool = categoryQueryPools.lofi;
  } else if (catClean.includes('slowed') || catClean.includes('reverb')) {
    queryPool = categoryQueryPools.slowed;
  } else if (catClean.includes('classical') || catClean.includes('rock')) {
    queryPool = categoryQueryPools.rock;
  }

  const refreshOffset = isRefresh ? Math.floor(Math.random() * queryPool.length) : 0;
  const qIdx1 = (page - 1 + refreshOffset) % queryPool.length;
  const qIdx2 = (page * 2 - 1 + refreshOffset) % queryPool.length;
  const saavnPage = Math.floor((page - 1) / queryPool.length) + 1;
  const query1 = queryPool[qIdx1];
  const query2 = queryPool[qIdx2];

  // 1. Check D1 database if bound (only for page 1 when NOT in refresh mode)
  let d1Tracks: Track[] = [];
  if (page === 1 && !isRefresh && env && env.DB) {
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

  // 2. Fetch live multi-source tracks across complementary queries (YouTube, JioSaavn, iTunes)
  const [ytTracks1, ytTracks2, saavn1, saavn2, itunesTracks] = await Promise.all([
    searchYouTube(query1, 20),
    searchYouTube(query2, 20),
    searchJioSaavn(query1, 20, saavnPage),
    searchJioSaavn(query2, 20, saavnPage),
    searchItunes(query1, 15)
  ]);

  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const combined: Track[] = [];

  // Filter out ancient tracks (older than ~5-10 years) unless timeless
  const isAncientYear = (title: string) => {
    return /\b(199\d|200\d|2010|2011|2012|2013|2014|2015|2016|2017|2018)\b/.test(title);
  };

  for (const track of [...ytTracks1, ...ytTracks2, ...d1Tracks, ...saavn1, ...saavn2, ...itunesTracks]) {
    if (!track || !track.id || !track.title) continue;
    if (isAncientYear(track.title)) continue;

    const key = normalizeTrackKey(track.title, track.artist);
    if (!seenIds.has(track.id) && !seenKeys.has(key)) {
      seenIds.add(track.id);
      seenKeys.add(key);
      combined.push(track);
    }
  }

  // Fallback ONLY on Page 1 if live results returned empty: Use distinct category fallbacks
  if (combined.length === 0 && page === 1) {
    const categoryFallbacks = getCategoryFallbackTracks(category);
    for (const track of categoryFallbacks) {
      const key = normalizeTrackKey(track.title, track.artist);
      if (!seenIds.has(track.id) && !seenKeys.has(key)) {
        seenIds.add(track.id);
        seenKeys.add(key);
        combined.push(track);
      }
    }
  }

  let outputTracks = combined;
  if (isRefresh && outputTracks.length > 6 && page === 1) {
    const top = outputTracks.slice(0, 16);
    const rest = outputTracks.slice(16);
    for (let i = top.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [top[i], top[j]] = [top[j], top[i]];
    }
    outputTracks = [...top, ...rest];
  }

  const finalTracks = outputTracks.slice(0, Math.max(limit, 30));

  return jsonResponse(
    {
      results: finalTracks,
      nextPageToken: String(page + 1),
      source: 'live_edge_catalog'
    },
    200,
    isRefresh ? { 'Cache-Control': 'no-cache, no-store, must-revalidate' } : {}
  );
}
