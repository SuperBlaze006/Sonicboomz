import { Track, AlbumItem } from './types';
import { decodeHtmlEntities, cleanArtistName, cleanSongTitle } from './utils';

// Multi-Source Category Distinct Fallback Tracks (All 11 Trending Categories)
export const CATEGORY_FALLBACK_TRACKS: Record<string, Track[]> = {
  bollywood: [
    { source: 'youtube', id: 'k3g_WjLCsXM', title: 'Sajni (From "Laapataa Ladies")', artist: 'Arijit Singh, Ram Sampath', coverUrl: 'https://i.ytimg.com/vi/k3g_WjLCsXM/hqdefault.jpg', duration: 170, viewCount: 165000000 },
    { source: 'youtube', id: 'VAdGW7QDJUI', title: 'Pehle Bhi Main (From "Animal")', artist: 'Vishal Mishra, Raj Shekhar', coverUrl: 'https://i.ytimg.com/vi/VAdGW7QDJUI/hqdefault.jpg', duration: 250, viewCount: 340000000 },
    { source: 'youtube', id: 'BddP6PYo2gs', title: 'Kesariya (From "Brahmastra")', artist: 'Arijit Singh, Pritam', coverUrl: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg', duration: 268, viewCount: 520000000 },
    { source: 'youtube', id: 'gvyUuxdRdR4', title: 'Chaleya (From "Jawan")', artist: 'Arijit Singh, Shilpa Rao, Anirudh', coverUrl: 'https://i.ytimg.com/vi/gvyUuxdRdR4/hqdefault.jpg', duration: 200, viewCount: 410000000 },
    { source: 'youtube', id: '7nk5i5JmQ_Y', title: 'Apna Bana Le', artist: 'Arijit Singh, Sachin-Jigar', coverUrl: 'https://i.ytimg.com/vi/7nk5i5JmQ_Y/hqdefault.jpg', duration: 261, viewCount: 390000000 },
    { source: 'youtube', id: 'O6UvjK-lT8U', title: 'O Maahi (From "Dunki")', artist: 'Arijit Singh, Pritam', coverUrl: 'https://i.ytimg.com/vi/O6UvjK-lT8U/hqdefault.jpg', duration: 233, viewCount: 280000000 },
    { source: 'youtube', id: '6xKwi3K-H5E', title: 'Satranga (From "Animal")', artist: 'Arijit Singh, Shreyas Puranik', coverUrl: 'https://i.ytimg.com/vi/6xKwi3K-H5E/hqdefault.jpg', duration: 271, viewCount: 310000000 },
    { source: 'youtube', id: 'r2Gz2_C8pY4', title: 'Tere Hawaale', artist: 'Arijit Singh, Shilpa Rao, Pritam', coverUrl: 'https://i.ytimg.com/vi/r2Gz2_C8pY4/hqdefault.jpg', duration: 346, viewCount: 220000000 },
    { source: 'youtube', id: 'h7GyfeqC3C4', title: 'Ve Kamleya (From "Rocky Aur Rani")', artist: 'Arijit Singh, Shreya Ghoshal, Pritam', coverUrl: 'https://i.ytimg.com/vi/h7GyfeqC3C4/hqdefault.jpg', duration: 247, viewCount: 195000000 },
    { source: 'youtube', id: 'Ax0G_P2dSBw', title: 'Tum Se (From "Teri Baaton Mein")', artist: 'Sachin-Jigar, Raghav Chaitanya', coverUrl: 'https://i.ytimg.com/vi/Ax0G_P2dSBw/hqdefault.jpg', duration: 264, viewCount: 180000000 }
  ],
  hollywood: [
    { source: 'youtube', id: '4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd', coverUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg', duration: 200, viewCount: 820000000 },
    { source: 'youtube', id: 'kPa7bsKwL-8', title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', coverUrl: 'https://i.ytimg.com/vi/kPa7bsKwL-8/hqdefault.jpg', duration: 252, viewCount: 430000000 },
    { source: 'youtube', id: 'eVli-tstM5E', title: 'Espresso', artist: 'Sabrina Carpenter', coverUrl: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg', duration: 175, viewCount: 310000000 },
    { source: 'youtube', id: 'd5gf9dXHevw', title: 'BIRDS OF A FEATHER', artist: 'Billie Eilish', coverUrl: 'https://i.ytimg.com/vi/d5gf9dXHevw/hqdefault.jpg', duration: 194, viewCount: 220000000 },
    { source: 'youtube', id: 'b8m9zhNAgKs', title: 'Cruel Summer', artist: 'Taylor Swift', coverUrl: 'https://i.ytimg.com/vi/b8m9zhNAgKs/hqdefault.jpg', duration: 178, viewCount: 460000000 },
    { source: 'youtube', id: 'Oa_RSwwpPaA', title: 'Beautiful Things', artist: 'Benson Boone', coverUrl: 'https://i.ytimg.com/vi/Oa_RSwwpPaA/hqdefault.jpg', duration: 180, viewCount: 410000000 },
    { source: 'youtube', id: 'H5v3kku4y6Q', title: 'As It Was', artist: 'Harry Styles', coverUrl: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg', duration: 167, viewCount: 780000000 },
    { source: 'youtube', id: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', coverUrl: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg', duration: 233, viewCount: 950000000 },
    { source: 'youtube', id: 'TUVcZfQe-Kw', title: 'Levitating', artist: 'Dua Lipa', coverUrl: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg', duration: 203, viewCount: 890000000 }
  ],
  cokestudio: [
    { source: 'youtube', id: '_XbvH79U3bQ', title: 'Kahani Suno 2.0', artist: 'Kaifi Khalil', coverUrl: 'https://i.ytimg.com/vi/_XbvH79U3bQ/hqdefault.jpg', duration: 173, viewCount: 520000000 },
    { source: 'youtube', id: '5Eqb_-j3FDA', title: 'Pasoori', artist: 'Ali Sethi x Shae Gill', coverUrl: 'https://i.ytimg.com/vi/5Eqb_-j3FDA/hqdefault.jpg', duration: 224, viewCount: 730000000 },
    { source: 'youtube', id: '7D4vNcK6D38', title: 'Tu Jhoom', artist: 'Naseebo Lal x Abida Parveen', coverUrl: 'https://i.ytimg.com/vi/7D4vNcK6D38/hqdefault.jpg', duration: 423, viewCount: 180000000 },
    { source: 'youtube', id: 'hpcZ_0m38dY', title: 'Jhol', artist: 'Maanu x Annural Khalid', coverUrl: 'https://i.ytimg.com/vi/hpcZ_0m38dY/hqdefault.jpg', duration: 215, viewCount: 140000000 },
    { source: 'youtube', id: 'kw4tT7SCmaY', title: 'Afreen Afreen', artist: 'Rahat Fateh Ali Khan & Momina Mustehsan', coverUrl: 'https://i.ytimg.com/vi/kw4tT7SCmaY/hqdefault.jpg', duration: 405, viewCount: 460000000 },
    { source: 'youtube', id: 'zC5K_BwFmJc', title: 'Kana Yaari', artist: 'Kaifi Khalil x Eva B x Abdul Wahab', coverUrl: 'https://i.ytimg.com/vi/zC5K_BwFmJc/hqdefault.jpg', duration: 217, viewCount: 135000000 },
    { source: 'youtube', id: '5EpeS_iT3qA', title: 'Ishq', artist: 'Faheem Abdullah x Rauhan Malik', coverUrl: 'https://i.ytimg.com/vi/5EpeS_iT3qA/hqdefault.jpg', duration: 242, viewCount: 220000000 }
  ],
  hustle: [
    { source: 'youtube', id: 'M4P78eNl9z0', title: 'Maan Meri Jaan', artist: 'King', coverUrl: 'https://i.ytimg.com/vi/M4P78eNl9z0/hqdefault.jpg', duration: 194, viewCount: 650000000 },
    { source: 'youtube', id: 'vK9vO_rOtxQ', title: 'Ram Ram Bhai Saryane', artist: 'MC Square', coverUrl: 'https://i.ytimg.com/vi/vK9vO_rOtxQ/hqdefault.jpg', duration: 185, viewCount: 140000000 },
    { source: 'youtube', id: 't2A_nK9fR_w', title: 'Babam Bam', artist: 'Paradox', coverUrl: 'https://i.ytimg.com/vi/t2A_nK9fR_w/hqdefault.jpg', duration: 172, viewCount: 125000000 },
    { source: 'youtube', id: 'Q7b2_jK7wO8', title: 'Jaadugar', artist: 'Paradox', coverUrl: 'https://i.ytimg.com/vi/Q7b2_jK7wO8/hqdefault.jpg', duration: 160, viewCount: 190000000 },
    { source: 'youtube', id: 'z1m_9xK8k8M', title: 'Naina Ki Talwar', artist: 'MC Square', coverUrl: 'https://i.ytimg.com/vi/z1m_9xK8k8M/hqdefault.jpg', duration: 165, viewCount: 110000000 },
    { source: 'youtube', id: '8_aK4nKx0lA', title: 'Bad Munda', artist: 'J Trix x Subh', coverUrl: 'https://i.ytimg.com/vi/8_aK4nKx0lA/hqdefault.jpg', duration: 178, viewCount: 95000000 }
  ],
  south: [
    { source: 'youtube', id: '5cx7rvMvAWo', title: 'Hukum - Thalaivar Alappara (Jailer)', artist: 'Anirudh Ravichander, Super Subu', coverUrl: 'https://i.ytimg.com/vi/5cx7rvMvAWo/hqdefault.jpg', duration: 206, viewCount: 230000000 },
    { source: 'youtube', id: '1k8m5w0z7_c', title: 'Chuttamalle (Devara)', artist: 'Anirudh Ravichander, Shilpa Rao', coverUrl: 'https://i.ytimg.com/vi/1k8m5w0z7_c/hqdefault.jpg', duration: 224, viewCount: 310000000 },
    { source: 'youtube', id: 'jH8w4Fk9x7A', title: 'Illuminati (Aavesham)', artist: 'Sushin Shyam, Dabzee', coverUrl: 'https://i.ytimg.com/vi/jH8w4Fk9x7A/hqdefault.jpg', duration: 195, viewCount: 260000000 },
    { source: 'youtube', id: 'G4vN5eL4qQk', title: 'Badass (Leo)', artist: 'Anirudh Ravichander', coverUrl: 'https://i.ytimg.com/vi/G4vN5eL4qQk/hqdefault.jpg', duration: 229, viewCount: 190000000 },
    { source: 'youtube', id: '8o4mK4e7rXk', title: 'Oo Antava (Pushpa)', artist: 'Devi Sri Prasad, Indravathi Chauhan', coverUrl: 'https://i.ytimg.com/vi/8o4mK4e7rXk/hqdefault.jpg', duration: 228, viewCount: 420000000 },
    { source: 'youtube', id: '9k5n_6wL8A8', title: 'Arabic Kuthu (Beast)', artist: 'Anirudh Ravichander, Jonita Gandhi', coverUrl: 'https://i.ytimg.com/vi/9k5n_6wL8A8/hqdefault.jpg', duration: 279, viewCount: 510000000 }
  ],
  hiphop: [
    { source: 'youtube', id: 'mK6n9X8r5j8', title: 'Mirchi', artist: 'DIVINE, MC Altaf, Phenom', coverUrl: 'https://i.ytimg.com/vi/mK6n9X8r5j8/hqdefault.jpg', duration: 215, viewCount: 280000000 },
    { source: 'youtube', id: '1o8m4kL7e5Q', title: 'Khatam Hue Waande', artist: 'Emiway Bantai', coverUrl: 'https://i.ytimg.com/vi/1o8m4kL7e5Q/hqdefault.jpg', duration: 198, viewCount: 160000000 },
    { source: 'youtube', id: '8xK3m5L8j7A', title: 'Makasam', artist: 'KR$NA', coverUrl: 'https://i.ytimg.com/vi/8xK3m5L8j7A/hqdefault.jpg', duration: 262, viewCount: 95000000 },
    { source: 'youtube', id: '7k9mL4x3w2Q', title: 'Nanchaku', artist: 'Seedhe Maut, MC Stan', coverUrl: 'https://i.ytimg.com/vi/7k9mL4x3w2Q/hqdefault.jpg', duration: 185, viewCount: 110000000 },
    { source: 'youtube', id: '5o8mK9x4e2A', title: 'Kohinoor', artist: 'DIVINE', coverUrl: 'https://i.ytimg.com/vi/5o8mK9x4e2A/hqdefault.jpg', duration: 231, viewCount: 195000000 }
  ],
  indianpop: [
    { source: 'youtube', id: 'fXae_fPZcKk', title: 'MoonRise', artist: 'Diljit Dosanjh', coverUrl: 'https://i.ytimg.com/vi/fXae_fPZcKk/hqdefault.jpg', duration: 182, viewCount: 92000000 },
    { source: 'youtube', id: 'LK7-_dgAVQE', title: 'Softly (Making Memories)', artist: 'Karan Aujla, Ikky', coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg', duration: 154, viewCount: 210000000 },
    { source: 'youtube', id: 'g6n8m5K4x2Q', title: 'Jo Tum Mere Ho', artist: 'Anuv Jain', coverUrl: 'https://i.ytimg.com/vi/g6n8m5K4x2Q/hqdefault.jpg', duration: 252, viewCount: 180000000 },
    { source: 'youtube', id: '4k8mL7x2w1Q', title: 'Husn', artist: 'Anuv Jain', coverUrl: 'https://i.ytimg.com/vi/4k8mL7x2w1Q/hqdefault.jpg', duration: 217, viewCount: 240000000 },
    { source: 'youtube', id: '2k8n5x4L7wA', title: 'Tauba Tauba (Bad Newz)', artist: 'Karan Aujla', coverUrl: 'https://i.ytimg.com/vi/2k8n5x4L7wA/hqdefault.jpg', duration: 210, viewCount: 380000000 },
    { source: 'youtube', id: '9k7mL4x2w1Q', title: 'Winning Speech', artist: 'Karan Aujla', coverUrl: 'https://i.ytimg.com/vi/9k7mL4x2w1Q/hqdefault.jpg', duration: 195, viewCount: 165000000 }
  ],
  lofi: [
    { source: 'youtube', id: '8o6mK5x4e2A', title: 'Apna Bana Le (Lofi Chill)', artist: 'Arijit Singh, Sachin-Jigar', coverUrl: 'https://i.ytimg.com/vi/8o6mK5x4e2A/hqdefault.jpg', duration: 280, viewCount: 95000000 },
    { source: 'youtube', id: '6k9mL4x3w2Q', title: 'Sajni - Lofi Flip', artist: 'Arijit Singh, Ram Sampath', coverUrl: 'https://i.ytimg.com/vi/6k9mL4x3w2Q/hqdefault.jpg', duration: 215, viewCount: 88000000 },
    { source: 'youtube', id: '4o8mK5x4e2A', title: 'Kesariya Lofi Evening Chill', artist: 'Arijit Singh, Pritam', coverUrl: 'https://i.ytimg.com/vi/4o8mK5x4e2A/hqdefault.jpg', duration: 260, viewCount: 75000000 },
    { source: 'youtube', id: '2o8mK5x4e2A', title: 'Baarishein (Midnight Lofi Version)', artist: 'Anuv Jain', coverUrl: 'https://i.ytimg.com/vi/2o8mK5x4e2A/hqdefault.jpg', duration: 245, viewCount: 65000000 }
  ],
  slowed: [
    { source: 'youtube', id: '7o8mK5x4e2A', title: 'Kahani Suno 2.0 (Slowed + Reverb)', artist: 'Kaifi Khalil', coverUrl: 'https://i.ytimg.com/vi/7o8mK5x4e2A/hqdefault.jpg', duration: 230, viewCount: 140000000 },
    { source: 'youtube', id: '5o8mK5x4e2A', title: 'Pehle Bhi Main - Slowed & Reverb Drive', artist: 'Vishal Mishra', coverUrl: 'https://i.ytimg.com/vi/5o8mK5x4e2A/hqdefault.jpg', duration: 295, viewCount: 110000000 },
    { source: 'youtube', id: '3o8mK5x4e2A', title: 'Jhol Slowed Reverb Late Night', artist: 'Maanu x Annural Khalid', coverUrl: 'https://i.ytimg.com/vi/3o8mK5x4e2A/hqdefault.jpg', duration: 248, viewCount: 85000000 },
    { source: 'youtube', id: '1o8mK5x4e2A', title: 'Softly Slowed & Reverb', artist: 'Karan Aujla', coverUrl: 'https://i.ytimg.com/vi/1o8mK5x4e2A/hqdefault.jpg', duration: 198, viewCount: 92000000 }
  ],
  rock: [
    { source: 'youtube', id: 'Tk9TM7-eTmw', title: 'Falling In Reverse - "All My Life"', artist: 'Falling In Reverse, Jelly Roll', coverUrl: 'https://i.ytimg.com/vi/Tk9TM7-eTmw/hqdefault.jpg', duration: 202, viewCount: 75000000 },
    { source: 'youtube', id: 'kXYiU_JCYtU', title: 'Numb', artist: 'Linkin Park', coverUrl: 'https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg', duration: 187, viewCount: 2200000000 },
    { source: 'youtube', id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', coverUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg', duration: 359, viewCount: 1700000000 },
    { source: 'youtube', id: '7wtfhZwyrcc', title: 'Believer', artist: 'Imagine Dragons', coverUrl: 'https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg', duration: 204, viewCount: 2600000000 },
    { source: 'youtube', id: '6b8n4xK7w2A', title: 'Choo Lo', artist: 'The Local Train', coverUrl: 'https://i.ytimg.com/vi/6b8n4xK7w2A/hqdefault.jpg', duration: 235, viewCount: 155000000 }
  ]
};

// Global default fallback
export const CURATED_POPULAR_TRACKS: Track[] = [
  ...CATEGORY_FALLBACK_TRACKS.bollywood.slice(0, 4),
  ...CATEGORY_FALLBACK_TRACKS.hollywood.slice(0, 4),
  ...CATEGORY_FALLBACK_TRACKS.cokestudio.slice(0, 3),
  ...CATEGORY_FALLBACK_TRACKS.south.slice(0, 3)
];

export function getCategoryFallbackTracks(category: string): Track[] {
  const cat = (category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cat || cat === 'alltrending' || cat === 'all') {
    return CURATED_POPULAR_TRACKS;
  }
  for (const [key, tracks] of Object.entries(CATEGORY_FALLBACK_TRACKS)) {
    if (cat.includes(key) || key.includes(cat)) {
      return tracks;
    }
  }
  return CURATED_POPULAR_TRACKS;
}

// Edge-Compatible Real-Time YouTube Search via pure Fetch & ytInitialData
export async function searchYouTube(query: string, limit = 25): Promise<Track[]> {
  try {
    const q = encodeURIComponent(query);
    const res = await fetch(`https://www.youtube.com/results?search_query=${q}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(4500)
    });
    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.+?});/);
    if (!match) return [];
    
    const data = JSON.parse(match[1]);
    const sections = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const tracks: Track[] = [];
    const seen = new Set<string>();

    for (const sec of sections) {
      const items = sec.itemSectionRenderer?.contents || [];
      for (const item of items) {
        const v = item.videoRenderer;
        if (!v || !v.videoId || seen.has(v.videoId)) continue;
        seen.add(v.videoId);

        const rawTitle = v.title?.runs?.map((r: any) => r.text).join('') || '';
        const titleLower = rawTitle.toLowerCase();
        // Skip obvious non-songs (hours-long playlists, full albums, shorts)
        if (
          titleLower.includes('full album') ||
          titleLower.includes('jukebox') ||
          titleLower.includes('non stop') ||
          titleLower.includes('nonstop') ||
          /\b(shorts|reels|tiktok)\b/i.test(titleLower)
        ) {
          continue;
        }

        const artist = (v.ownerText?.runs?.[0]?.text || 'Top Artist').replace(/ - Topic|VEVO/gi, '').trim();
        const durationText = v.lengthText?.simpleText || '3:30';
        const parts = durationText.split(':').map(Number);
        const duration = parts.length === 2 ? parts[0] * 60 + parts[1] : (parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 210);
        
        // Skip tracks under 45s or over 10 minutes
        if (duration < 45 || duration > 600) continue;

        const viewText = v.viewCountText?.simpleText || '';
        const viewMatch = viewText.replace(/,/g, '').match(/(\d+)/);
        const viewCount = viewMatch ? parseInt(viewMatch[1], 10) : 1500000;
        const thumbnail = v.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

        tracks.push({
          source: 'youtube',
          id: v.videoId,
          title: decodeHtmlEntities(rawTitle),
          artist: cleanArtistName(artist),
          coverUrl: thumbnail,
          duration,
          viewCount
        });

        if (tracks.length >= limit) break;
      }
      if (tracks.length >= limit) break;
    }

    return tracks;
  } catch (_) {
    return [];
  }
}

export async function searchJioSaavn(query: string, limit = 20, page = 1): Promise<Track[]> {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&n=${limit}&p=${page}&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((item: any) => ({
      source: 'jiosaavn',
      id: item.id || `saavn_${item.id}`,
      title: cleanSongTitle(item.song || item.title || ''),
      artist: cleanArtistName(item.singers || item.primary_artists || item.more_info?.singers || 'Top Artist'),
      coverUrl: (item.image || '').replace('150x150', '500x500').replace(/\.(jpg|jpeg|png)$/i, '.webp'),
      duration: parseInt(item.more_info?.duration || item.duration || '200', 10),
      viewCount: parseInt(item.play_count || '1200000', 10),
      streamUrl: item.more_info?.encrypted_media_url || ''
    }));
  } catch (_) {
    return [];
  }
}

export async function searchItunes(query: string, limit = 20): Promise<Track[]> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((item: any) => ({
      source: 'itunes',
      id: `itunes_${item.trackId}`,
      title: cleanSongTitle(item.trackName || ''),
      artist: cleanArtistName(item.artistName || 'Top Artist'),
      coverUrl: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
      duration: Math.round((item.trackTimeMillis || 180000) / 1000),
      viewCount: 1500000,
      previewUrl: item.previewUrl || ''
    }));
  } catch (_) {
    return [];
  }
}

export async function fetchLiveAlbums(query: string, limit = 16, page = 1): Promise<AlbumItem[]> {
  try {
    const [saavnRes, itunesRes] = await Promise.allSettled([
      fetch(`https://www.jiosaavn.com/api.php?__call=search.getAlbumResults&q=${encodeURIComponent(query)}&n=${limit}&p=${page}&_format=json&_marker=0&ctx=web6dot0`, { signal: AbortSignal.timeout(2500) })
        .then(r => r.ok ? r.json() : null),
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=${limit}`, { signal: AbortSignal.timeout(2500) })
        .then(r => r.ok ? r.json() : null)
    ]);

    const albums: AlbumItem[] = [];
    const seen = new Set<string>();

    if (saavnRes.status === 'fulfilled' && saavnRes.value?.results) {
      for (const alb of saavnRes.value.results) {
        const title = decodeHtmlEntities(alb.title || alb.name || '').trim();
        const artist = decodeHtmlEntities(alb.music || alb.subtitle || 'Various Artists').trim();
        const cover = (alb.image || '').replace('150x150', '500x500');
        const key = `${title.toLowerCase()}::${artist.toLowerCase()}`;
        if (title && cover && !seen.has(key)) {
          seen.add(key);
          const tracks = parseInt(alb.more_info?.song_pids?.split(',').length || '8', 10);
          albums.push({
            id: `saavn-alb-${alb.id || alb.albumid}`,
            title,
            artist,
            coverUrl: cover,
            year: parseInt(alb.year || '2026', 10) || 2026,
            type: tracks === 1 ? 'Single' : tracks <= 5 ? 'EP' : 'Album',
            trackCount: tracks
          });
        }
      }
    }

    if (itunesRes.status === 'fulfilled' && itunesRes.value?.results) {
      for (const alb of itunesRes.value.results) {
        const title = alb.collectionName || alb.collectionCensoredName;
        const artist = alb.artistName;
        const cover = (alb.artworkUrl100 || '').replace('100x100bb', '600x600bb');
        const key = `${title?.toLowerCase()}::${artist?.toLowerCase()}`;
        if (title && cover && !seen.has(key)) {
          seen.add(key);
          albums.push({
            id: `itunes-alb-${alb.collectionId}`,
            title,
            artist,
            coverUrl: cover,
            year: alb.releaseDate ? new Date(alb.releaseDate).getFullYear() : 2026,
            type: alb.trackCount === 1 ? 'Single' : (alb.trackCount <= 5 ? 'EP' : 'Album'),
            trackCount: alb.trackCount || 8
          });
        }
      }
    }

    return albums;
  } catch (_) {
    return [];
  }
}
