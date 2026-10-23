export interface Track {
  source?: 'jiosaavn' | 'youtube' | 'mp3_scrape' | 'itunes';
  id: string;
  title: string;
  artist: string;
  cleanArtist?: string;
  isCollab?: boolean;
  collabArtists?: string[];
  coverUrl: string;
  duration: number;
  viewCount?: number;
  publishedAt?: string;
  streamUrl?: string;
  previewUrl?: string;
}

export interface AlbumItem {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  year?: number | string;
  type?: 'Album' | 'Single' | 'EP';
  trackCount?: number;
  releaseYear?: string;
}

export interface ArtistEntry {
  id: string;
  name: string;
  role: string;
  genre: string;
  tags: string[];
  listeners: string;
  image: string;
  headerImage: string;
  bio: string;
  verified: boolean;
}

export interface SongCredits {
  title: string;
  artist: string;
  album: string;
  releaseYear: number | string;
  composers: string[];
  lyricists: string[];
  singers: string[];
  producers: string[];
  recordLabel: string;
  copyright: string;
  audioBitrate: string;
  source: string;
}

export interface CloudflareEnv {
  DB?: any;
  ENVIRONMENT?: string;
  [key: string]: any;
}
