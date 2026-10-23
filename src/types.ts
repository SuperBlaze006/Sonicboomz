export interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  source?: string;
  duration?: number;
  viewCount?: number;
  publishedAt?: string;
  audioBlob?: Blob;
  embedUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  tracks: Track[];
  createdAt: number;
  updatedAt?: number;
  isPermanent?: boolean; // true for "Liked Songs"
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}
