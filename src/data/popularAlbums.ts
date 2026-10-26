export interface PopularAlbumItem {
  id: string;
  title: string;
  artist: string;
  year: number;
  type: 'Album' | 'Single' | 'EP';
  coverUrl: string;
  query: string;
  trackCount: number;
}

export const POPULAR_ALBUMS_AND_SINGLES: PopularAlbumItem[] = [
  {
    id: 'single-casa-tupka',
    title: 'Casa Tupka Anthemo',
    artist: 'Yo Yo Honey Singh, Priyanshi',
    year: 2026,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/vRjaGgDsWSo/hqdefault.jpg',
    query: 'Casa Tupka Anthemo Yo Yo Honey Singh official music video',
    trackCount: 1
  },
  {
    id: 'album-aujla-szn-1',
    title: 'Aujla Szn 1',
    artist: 'Karan Aujla, Mxrci',
    year: 2026,
    type: 'EP',
    coverUrl: 'https://i.ytimg.com/vi/X_sF7W8wYw4/hqdefault.jpg',
    query: 'Aujla Szn 1 Karan Aujla Mxrci full ep songs ashke real bad man straight up',
    trackCount: 6
  },
  {
    id: 'album-stree-2',
    title: 'Stree 2 (Original Motion Picture Soundtrack)',
    artist: 'Sachin-Jigar, Arijit Singh, Madhubanti Bagchi',
    year: 2025,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/gcR2vM-v8o8/hqdefault.jpg',
    query: 'Stree 2 full album songs aayi nai aaj ki raat khoobsurat tumhare hi rahenge hum',
    trackCount: 5
  },
  {
    id: 'single-die-with-smile',
    title: 'Die With A Smile',
    artist: 'Lady Gaga, Bruno Mars',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/kPa7bsKwL-8/hqdefault.jpg',
    query: 'Die With A Smile Lady Gaga Bruno Mars official audio',
    trackCount: 1
  },
  {
    id: 'album-glory',
    title: 'Glory',
    artist: 'Karan Aujla',
    year: 2025,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg',
    query: 'Glory Karan Aujla full album songs winning speech wavy antidote',
    trackCount: 18
  },
  {
    id: 'single-apt',
    title: 'APT.',
    artist: 'ROSÉ, Bruno Mars',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/ekr2nIex040/hqdefault.jpg',
    query: 'APT ROSE Bruno Mars official music video',
    trackCount: 1
  },
  {
    id: 'album-cs15',
    title: 'Coke Studio Season 15',
    artist: 'Coke Studio Pakistan',
    year: 2025,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/-2RAq5o5pwc/hqdefault.jpg',
    query: 'Coke Studio Season 15 full songs jhol blockbuster aayi aayi maana',
    trackCount: 11
  },
  {
    id: 'album-short-sweet',
    title: "Short n' Sweet (Deluxe)",
    artist: 'Sabrina Carpenter',
    year: 2025,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg',
    query: 'Short n Sweet Sabrina Carpenter album songs espresso please please please taste',
    trackCount: 14
  },
  {
    id: 'album-pushpa-2',
    title: 'Pushpa 2: The Rule',
    artist: 'Devi Sri Prasad, Shreya Ghoshal',
    year: 2025,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/r0c1f6yB_mI/hqdefault.jpg',
    query: 'Pushpa 2 The Rule full album songs kissik peelings angaaron pushpa pushpa',
    trackCount: 6
  },
  {
    id: 'single-sajni',
    title: 'Sajni (From "Laapataa Ladies")',
    artist: 'Arijit Singh, Ram Sampath',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/k3g_WjLCsXM/hqdefault.jpg',
    query: 'Sajni Laapataa Ladies Arijit Singh Ram Sampath official song',
    trackCount: 1
  },
  {
    id: 'album-hurry-up-tomorrow',
    title: 'Hurry Up Tomorrow',
    artist: 'The Weeknd',
    year: 2025,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/16jA-6hiSUo/hqdefault.jpg',
    query: 'Hurry Up Tomorrow The Weeknd full album songs timeless dancing in the flames sao paulo',
    trackCount: 16
  },
  {
    id: 'album-bhool-bhulaiyaa-3',
    title: 'Bhool Bhulaiyaa 3',
    artist: 'Pritam, Tanishk Bagchi, Sonu Nigam, Diljit Dosanjh',
    year: 2025,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/fXae_fPZcKk/hqdefault.jpg',
    query: 'Bhool Bhulaiyaa 3 full album songs ami je tomar 3.0 title track jaana samjho na',
    trackCount: 6
  },
  {
    id: 'album-hit-me-hard',
    title: 'HIT ME HARD AND SOFT',
    artist: 'Billie Eilish',
    year: 2025,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/V9PVRfjEBTI/hqdefault.jpg',
    query: 'HIT ME HARD AND SOFT Billie Eilish full album songs birds of a feather lunch chihiro',
    trackCount: 10
  },
  {
    id: 'single-jhol',
    title: 'Jhol - Coke Studio Season 15',
    artist: 'Maanu, Annural Khalid',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/-2RAq5o5pwc/hqdefault.jpg',
    query: 'Jhol Coke Studio Season 15 Maanu Annural Khalid official video',
    trackCount: 1
  },
  {
    id: 'single-wavy',
    title: 'Wavy',
    artist: 'Karan Aujla',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/XTp5jaRU3Ws/hqdefault.jpg',
    query: 'Wavy Karan Aujla official music video',
    trackCount: 1
  },
  {
    id: 'album-devara',
    title: 'Devara Part 1',
    artist: 'Anirudh Ravichander, Shilpa Rao',
    year: 2025,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/5cx7rvMvAWo/hqdefault.jpg',
    query: 'Devara Anirudh Ravichander full album songs chuttamalle fear song daavudi',
    trackCount: 6
  },
  {
    id: 'single-jo-tum-mere-ho',
    title: 'Jo Tum Mere Ho',
    artist: 'Anuv Jain',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/ilNt2bikxwc/hqdefault.jpg',
    query: 'Jo Tum Mere Ho Anuv Jain official music video',
    trackCount: 1
  },
  {
    id: 'album-gnx',
    title: 'GNX',
    artist: 'Kendrick Lamar',
    year: 2025,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/U8F5G5wR1mk/hqdefault.jpg',
    query: 'GNX Kendrick Lamar full album songs luther squabble up tv off',
    trackCount: 12
  },
  {
    id: 'single-millionaire',
    title: 'Millionaire',
    artist: 'Yo Yo Honey Singh',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/XO8wew38VM8/hqdefault.jpg',
    query: 'Millionaire Yo Yo Honey Singh Glory official music video',
    trackCount: 1
  },
  {
    id: 'album-street-dreams',
    title: 'Street Dreams',
    artist: 'Karan Aujla, DIVINE',
    year: 2024,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/0dXiVYq8HBc/hqdefault.jpg',
    query: 'Street Dreams Karan Aujla DIVINE full album songs 100 million nothing lasts',
    trackCount: 7
  },
  {
    id: 'single-tauba-tauba',
    title: 'Tauba Tauba',
    artist: 'Karan Aujla, Badshah',
    year: 2024,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg',
    query: 'Tauba Tauba Karan Aujla Bad Newz official song',
    trackCount: 1
  },
  {
    id: 'single-ishq',
    title: 'Ishq (From "Lost;Found")',
    artist: 'Faheem Abdullah, Rauhan Malik',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/hHuG7FIKgtc/hqdefault.jpg',
    query: 'Ishq Faheem Abdullah Rauhan Malik official audio',
    trackCount: 1
  },
  {
    id: 'album-making-memories',
    title: 'Making Memories',
    artist: 'Karan Aujla, Ikky',
    year: 2024,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/X_sF7W8wYw4/hqdefault.jpg',
    query: 'Making Memories Karan Aujla Ikky full album songs softly admirin you',
    trackCount: 9
  },
  {
    id: 'album-ghost',
    title: 'Ghost',
    artist: 'Diljit Dosanjh',
    year: 2024,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/kKn1Dlt2qXQ/hqdefault.jpg',
    query: 'Ghost Diljit Dosanjh full album songs kinni kinni lalkara case',
    trackCount: 22
  },
  {
    id: 'single-sahiba',
    title: 'Sahiba',
    artist: 'Jasleen Royal, Stebin Ben, Vijay Deverakonda',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/n2dVFdqMYGA/hqdefault.jpg',
    query: 'Sahiba Jasleen Royal Stebin Ben official music video',
    trackCount: 1
  },
  {
    id: 'album-animal',
    title: 'Animal (Deluxe Soundtrack)',
    artist: 'Pritam, Vishal Mishra, Harshavardhan Rameshwar',
    year: 2024,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/hUxO6qj8oK0/hqdefault.jpg',
    query: 'Animal soundtrack full songs arjan vailly satranga pehle bhi main',
    trackCount: 8
  },
  {
    id: 'single-husn',
    title: 'Husn',
    artist: 'Anuv Jain',
    year: 2024,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/gVyRBNb_J4o/hqdefault.jpg',
    query: 'Husn Anuv Jain official music video',
    trackCount: 1
  },
  {
    id: 'album-jawan',
    title: 'Jawan',
    artist: 'Anirudh Ravichander, Arijit Singh',
    year: 2024,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/VAdGW7QDJUI/hqdefault.jpg',
    query: 'Jawan Anirudh Ravichander full album songs chaleya zinda banda not ramaiya vastavaiya',
    trackCount: 7
  },
  {
    id: 'single-winning-speech',
    title: 'Winning Speech',
    artist: 'Karan Aujla, Mxrci',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/vsWxs1tuwDk/hqdefault.jpg',
    query: 'Winning Speech Karan Aujla Mxrci official video',
    trackCount: 1
  },
  {
    id: 'album-cs14',
    title: 'Coke Studio Season 14',
    artist: 'Coke Studio Pakistan',
    year: 2023,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/5Eqb_-j3FDA/hqdefault.jpg',
    query: 'Coke Studio Season 14 full songs pasoori tu jhoom kana yaari',
    trackCount: 13
  },
  {
    id: 'single-beautiful-things',
    title: 'Beautiful Things',
    artist: 'Benson Boone',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/Oa_RSwwpPaA/hqdefault.jpg',
    query: 'Beautiful Things Benson Boone official music video',
    trackCount: 1
  },
  {
    id: 'single-kahani-suno',
    title: 'Kahani Suno 2.0',
    artist: 'Kaifi Khalil',
    year: 2024,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/_XbvH79U3bQ/hqdefault.jpg',
    query: 'Kahani Suno 2.0 Kaifi Khalil official',
    trackCount: 1
  },
  {
    id: 'album-leo',
    title: 'Leo (Original Motion Picture Soundtrack)',
    artist: 'Anirudh Ravichander',
    year: 2024,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/szvt1vD0Uug/hqdefault.jpg',
    query: 'Leo Anirudh Ravichander full album songs naa ready badass ordinary person',
    trackCount: 8
  },
  {
    id: 'single-timeless',
    title: 'Timeless',
    artist: 'The Weeknd, Playboi Carti',
    year: 2025,
    type: 'Single',
    coverUrl: 'https://i.ytimg.com/vi/16jA-6hiSUo/hqdefault.jpg',
    query: 'Timeless The Weeknd Playboi Carti official video',
    trackCount: 1
  },
  {
    id: 'album-four-you',
    title: 'Four You',
    artist: 'Karan Aujla, Ikky',
    year: 2024,
    type: 'EP',
    coverUrl: 'https://i.ytimg.com/vi/4DfVxVeqk2o/hqdefault.jpg',
    query: 'Four You Karan Aujla Ikky full ep songs 52 bars take it easy fallin apart',
    trackCount: 4
  },
  {
    id: 'album-aashiqui2',
    title: 'Aashiqui 2',
    artist: 'Arijit Singh, Mithoon, Ankit Tiwari',
    year: 2023,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg',
    query: 'Aashiqui 2 full album songs tum hi ho sunn raha hai chahun main ya naa',
    trackCount: 11
  },
  {
    id: 'album-rockstar',
    title: 'Rockstar',
    artist: 'A.R. Rahman, Mohit Chauhan',
    year: 2023,
    type: 'Album',
    coverUrl: 'https://i.ytimg.com/vi/6MgsHSAcI9k/hqdefault.jpg',
    query: 'Rockstar AR Rahman full album songs kun faya kun nadaan parindey phir se udd chala',
    trackCount: 14
  }
];

export function getShuffledPopularAlbums(limit = 18): PopularAlbumItem[] {
  const recent = POPULAR_ALBUMS_AND_SINGLES.filter(a => a.year >= 2025);
  const classic = POPULAR_ALBUMS_AND_SINGLES.filter(a => a.year < 2025);

  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  return [...shuffle(recent), ...shuffle(classic)].slice(0, limit);
}
