import { Track } from '../types';

export interface ChartVibeFilter {
  id: string;
  label: string;
  query: string;
  keywords: string[];
}

export interface FeaturedChartConfig {
  id: string;
  title: string;
  subtitle: string;
  circleLabel: string;
  gradient: string;
  accentColor: string;
  bgGradient: string;
  borderGlow: string;
  bpmTag?: string;
  curatorNote: string;
  query: string;
  queryPool: string[];
  excludeKeywords: string[];
  vibeFilters: ChartVibeFilter[];
  defaultTracks: Track[];
}

export const FEATURED_CHARTS_DATA: FeaturedChartConfig[] = [
  {
    id: 'gym-workout',
    title: 'Workout',
    subtitle: 'PR Motivation & Heavy Lifting Anthems',
    circleLabel: 'WORKOUT',
    gradient: 'from-amber-600 via-orange-600 to-rose-700',
    accentColor: '#f97316',
    bgGradient: 'from-orange-950/80 via-stone-900/80 to-neutral-950',
    borderGlow: 'hover:border-orange-500/60 hover:shadow-orange-500/20',
    curatorNote: 'High-energy workout motivation, warrior anthems & drift phonk',
    query: 'aarambh hai prachand zinda sultan kar har maidan fateh kordhell phonk eminem till i collapse gym workout',
    queryPool: [
      'aarambh hai prachand zinda bhaag milkha bhaag kar har maidan fateh sultan workout song',
      'kordhell murder in my mind interworld metamorphosis dvrst close eyes brazilian phonk gym',
      'eminem till i collapse lose yourself fort minor remember the name imagine dragons believer',
      'dangal title track brothers anthem ziddi dil mary kom challa uri workout motivation',
      'sidhu moose wala 295 divine apna time aayega diljit lalkara gym bass workout'
    ],
    excludeKeywords: [
      'romantic', 'love song', 'sad song', 'lofi', 'slowed', 'sleep', 'relaxing',
      'ullu', 'wedding', 'mehndi', 'shaadi', 'acoustic', 'unplugged', 'ghazal',
      'lullaby', 'cafe', 'coffee', 'rain', 'couple song'
    ],
    vibeFilters: [
      { id: 'all', label: 'All Beast Mode', query: 'gym workout motivation phonk high energy', keywords: [] },
      { id: 'desi-gym', label: 'Desi Warrior & Gym', query: 'aarambh hai prachand zinda sultan dangal kar har maidan fateh challa', keywords: ['aarambh', 'zinda', 'sultan', 'dangal', 'fateh', 'brothers', 'ziddi', 'apna time', '295', 'lalkara', 'challa', 'shoorveer'] },
      { id: 'phonk', label: 'Brazilian & Drift Phonk', query: 'kordhell murder in my mind interworld metamorphosis dvrst close eyes brazilian phonk montage', keywords: ['phonk', 'montagem', 'kordhell', 'interworld', 'dvrst', 'dxrk', 'murder', 'metamorphosis', 'close eyes', 'rave'] },
      { id: 'global-pr', label: 'Global PR Anthems', query: 'eminem till i collapse lose yourself remember the name believer unstoppable', keywords: ['eminem', 'collapse', 'lose yourself', 'remember', 'believer', 'unstoppable', 'imagine dragons', 'sia', 'fort minor'] }
    ],
    defaultTracks: [
      {
        source: 'youtube',
        id: 'r6SbfF9FjTg',
        title: 'Aarambh Hai Prachand (Warrior Gym Anthem)',
        artist: 'Piyush Mishra',
        coverUrl: 'https://i.ytimg.com/vi/r6SbfF9FjTg/hqdefault.jpg',
        duration: 296,
        viewCount: 240000000,
        publishedAt: 'Warrior Anthem'
      },
      {
        source: 'youtube',
        id: 'Ax0G_P2dSBw',
        title: 'Zinda - Bhaag Milkha Bhaag',
        artist: 'Shankar-Ehsaan-Loy, Siddharth Mahadevan',
        coverUrl: 'https://i.ytimg.com/vi/Ax0G_P2dSBw/hqdefault.jpg',
        duration: 211,
        viewCount: 165000000,
        publishedAt: 'High Energy'
      },
      {
        source: 'youtube',
        id: '9iIX4PBplAY',
        title: 'Kar Har Maidan Fateh',
        artist: 'Sukhwinder Singh, Shreya Ghoshal, Vikram Montrose',
        coverUrl: 'https://i.ytimg.com/vi/9iIX4PBplAY/hqdefault.jpg',
        duration: 311,
        viewCount: 280000000,
        publishedAt: 'Motivation'
      },
      {
        source: 'youtube',
        id: 'wPxqcq6Byq0',
        title: 'Sultan (Title Track)',
        artist: 'Sukhwinder Singh, Shadab Faridi, Vishal-Shekhar',
        coverUrl: 'https://i.ytimg.com/vi/wPxqcq6Byq0/hqdefault.jpg',
        duration: 280,
        viewCount: 310000000,
        publishedAt: 'Heavy Lift'
      },
      {
        source: 'youtube',
        id: 'jMfvlh0tjyo',
        title: 'Dangal - Title Track',
        artist: 'Daler Mehndi, Pritam',
        coverUrl: 'https://i.ytimg.com/vi/jMfvlh0tjyo/hqdefault.jpg',
        duration: 299,
        viewCount: 230000000,
        publishedAt: 'Power Track'
      },
      {
        source: 'youtube',
        id: 'wDjeBNv6ip0',
        title: 'Murder In My Mind (Drift Phonk)',
        artist: 'Kordhell',
        coverUrl: 'https://i.ytimg.com/vi/wDjeBNv6ip0/hqdefault.jpg',
        duration: 145,
        viewCount: 420000000,
        publishedAt: 'Drift Phonk'
      },
      {
        source: 'youtube',
        id: 'NSdcG1e9APE',
        title: 'METAMORPHOSIS (Gym Phonk)',
        artist: 'INTERWORLD',
        coverUrl: 'https://i.ytimg.com/vi/NSdcG1e9APE/hqdefault.jpg',
        duration: 142,
        viewCount: 390000000,
        publishedAt: 'Gym Phonk'
      },
      {
        source: 'youtube',
        id: 'ao4RCon11eY',
        title: 'Close Eyes (Beast Mode Phonk)',
        artist: 'DVRST',
        coverUrl: 'https://i.ytimg.com/vi/ao4RCon11eY/hqdefault.jpg',
        duration: 132,
        viewCount: 360000000,
        publishedAt: 'Beast Mode'
      },
      {
        source: 'youtube',
        id: 'j6gZefW4ykg',
        title: 'Montagem Diamante - Brazilian Phonk',
        artist: 'Phonk Killer',
        coverUrl: 'https://i.ytimg.com/vi/j6gZefW4ykg/hqdefault.jpg',
        duration: 154,
        viewCount: 94000000,
        publishedAt: 'Brazilian Bass'
      },
      {
        source: 'youtube',
        id: 'ytQ5CYE1VZw',
        title: 'Till I Collapse',
        artist: 'Eminem ft. Nate Dogg',
        coverUrl: 'https://i.ytimg.com/vi/ytQ5CYE1VZw/hqdefault.jpg',
        duration: 297,
        viewCount: 780000000,
        publishedAt: 'Gym Legend'
      },
      {
        source: 'youtube',
        id: '_Yhyp-_hX2s',
        title: 'Lose Yourself',
        artist: 'Eminem',
        coverUrl: 'https://i.ytimg.com/vi/_Yhyp-_hX2s/hqdefault.jpg',
        duration: 320,
        viewCount: 1350000000,
        publishedAt: 'Adrenaline'
      },
      {
        source: 'youtube',
        id: 'VDvr08sCPOc',
        title: 'Remember The Name',
        artist: 'Fort Minor',
        coverUrl: 'https://i.ytimg.com/vi/VDvr08sCPOc/hqdefault.jpg',
        duration: 230,
        viewCount: 410000000,
        publishedAt: 'Focus Anthem'
      },
      {
        source: 'youtube',
        id: '7wtfhZwyrcc',
        title: 'Believer',
        artist: 'Imagine Dragons',
        coverUrl: 'https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg',
        duration: 204,
        viewCount: 2700000000,
        publishedAt: 'Power Cardio'
      },
      {
        source: 'youtube',
        id: 'YaEG2aWJnZ8',
        title: 'Unstoppable',
        artist: 'Sia',
        coverUrl: 'https://i.ytimg.com/vi/YaEG2aWJnZ8/hqdefault.jpg',
        duration: 217,
        viewCount: 980000000,
        publishedAt: 'Motivation'
      },
      {
        source: 'youtube',
        id: 'IjBAgWKW12Y',
        title: 'Brothers Anthem',
        artist: 'Vishal Dadlani, Ajay-Atul',
        coverUrl: 'https://i.ytimg.com/vi/IjBAgWKW12Y/hqdefault.jpg',
        duration: 342,
        viewCount: 140000000,
        publishedAt: 'Combat Energy'
      },
      {
        source: 'youtube',
        id: 'puKD3nkB1h4',
        title: 'Challa (Main Lad Jaana) - Uri',
        artist: 'Romy, Vivek Hariharan, Shashwat Sachdev',
        coverUrl: 'https://i.ytimg.com/vi/puKD3nkB1h4/hqdefault.jpg',
        duration: 205,
        viewCount: 175000000,
        publishedAt: 'High Energy'
      },
      {
        source: 'youtube',
        id: 'h7gyJRWrjbg',
        title: 'Ziddi Dil - Mary Kom',
        artist: 'Vishal Dadlani',
        coverUrl: 'https://i.ytimg.com/vi/h7gyJRWrjbg/hqdefault.jpg',
        duration: 286,
        viewCount: 110000000,
        publishedAt: 'Cardio Rush'
      },
      {
        source: 'youtube',
        id: 'jFGKJBPFdUA',
        title: 'Apna Time Aayega - Gully Boy',
        artist: 'DIVINE, Ranveer Singh, Dub Sharma',
        coverUrl: 'https://i.ytimg.com/vi/jFGKJBPFdUA/hqdefault.jpg',
        duration: 140,
        viewCount: 390000000,
        publishedAt: 'Hustle'
      },
      {
        source: 'youtube',
        id: 'n_FCrCQ6-bA',
        title: '295 (Gym Beast Anthem)',
        artist: 'Sidhu Moose Wala',
        coverUrl: 'https://i.ytimg.com/vi/n_FCrCQ6-bA/hqdefault.jpg',
        duration: 270,
        viewCount: 640000000,
        publishedAt: 'Heavy Bass'
      },
      {
        source: 'youtube',
        id: 'bB3-CUMERIU',
        title: 'Lalkara',
        artist: 'Diljit Dosanjh, Sultaan, Intense',
        coverUrl: 'https://i.ytimg.com/vi/bB3-CUMERIU/hqdefault.jpg',
        duration: 160,
        viewCount: 145000000,
        publishedAt: 'Punjabi Pump'
      },
      {
        source: 'youtube',
        id: '0dXiVYq8HBc',
        title: '100 Million',
        artist: 'DIVINE, Karan Aujla',
        coverUrl: 'https://i.ytimg.com/vi/0dXiVYq8HBc/hqdefault.jpg',
        duration: 200,
        viewCount: 92000000,
        publishedAt: 'Rap Bass'
      },
      {
        source: 'youtube',
        id: 'ymW2sP6_hco',
        title: 'RAVE (Aggressive Gym Phonk)',
        artist: 'Dxrk ダーク',
        coverUrl: 'https://i.ytimg.com/vi/ymW2sP6_hco/hqdefault.jpg',
        duration: 169,
        viewCount: 280000000,
        publishedAt: 'Hard Phonk'
      }
    ]
  },
  {
    id: 'pakistani-sufi',
    title: 'Sufi Soul',
    subtitle: 'Coke Studio Legends & Timeless Qawwali',
    circleLabel: 'SUFI',
    gradient: 'from-emerald-700 via-teal-700 to-cyan-800',
    accentColor: '#0d9488',
    bgGradient: 'from-teal-950/80 via-stone-900/80 to-neutral-950',
    borderGlow: 'hover:border-teal-500/60 hover:shadow-teal-500/20',
    curatorNote: 'Coke studio seasons, timeless qawwali & soul melodies',
    query: 'coke studio pakistan jhol pasoori tu jhoom afreen afreen tajdar e haram kaifi khalil atif aslam',
    queryPool: [
      'coke studio pakistan season 15 jhol blockbuster harkalay turabaz maanu annural khalid',
      'coke studio pakistan pasoori tu jhoom kana yaari afreen afreen tajdar e haram',
      'kaifi khalil kahani suno faheem abdullah ishq abdul hannan iraaday bikhra',
      'nusrat fateh ali khan rahat fateh ali khan abida parveen atif aslam sufi qawwali',
      'hasan raheem talha anjum young stunners asim azhar ali sethi pakistani hits'
    ],
    excludeKeywords: [
      'gym', 'workout', 'phonk', 'hardstyle', 'bhojpuri', 'item song', 'dj remix bass boosted'
    ],
    vibeFilters: [
      { id: 'all', label: 'All Sufi & Pak', query: 'coke studio pakistan sufi viral songs', keywords: [] },
      { id: 'coke-studio', label: 'Coke Studio Legends', query: 'coke studio pakistan jhol pasoori tu jhoom afreen afreen kana yaari blockbuster', keywords: ['coke studio', 'jhol', 'pasoori', 'tu jhoom', 'afreen', 'tajdar', 'kana yaari', 'blockbuster', 'tera woh pyar'] },
      { id: 'qawwali', label: 'Qawwali & Sufi Soul', query: 'nusrat fateh ali khan rahat fateh ali khan atif aslam abida parveen qawwali sufi', keywords: ['nusrat', 'rahat', 'abida', 'tajdar', 'afreen', 'kun faya', 'rashke qamar', 'kali kali', 'tu jhoom', 'sufi'] },
      { id: 'pak-indie', label: 'Pakistani Indie & Pop', query: 'kaifi khalil abdul hannan faheem abdullah hasan raheem talha anjum maanu', keywords: ['kaifi', 'faheem', 'abdul hannan', 'hasan raheem', 'talha', 'maanu', 'ishq', 'kahani', 'iraaday', 'sadqay', 'wishes'] }
    ],
    defaultTracks: [
      {
        source: 'youtube',
        id: '-2RAq5o5pwc',
        title: 'Jhol - Coke Studio Season 15',
        artist: 'Maanu x Annural Khalid',
        coverUrl: 'https://i.ytimg.com/vi/-2RAq5o5pwc/hqdefault.jpg',
        duration: 265,
        viewCount: 185000000,
        publishedAt: 'Coke Studio S15'
      },
      {
        source: 'youtube',
        id: 'hHuG7FIKgtc',
        title: 'Ishq',
        artist: 'Faheem Abdullah, Rauhan Malik',
        coverUrl: 'https://i.ytimg.com/vi/hHuG7FIKgtc/hqdefault.jpg',
        duration: 230,
        viewCount: 210000000,
        publishedAt: 'Sufi Indie #1'
      },
      {
        source: 'youtube',
        id: '5Eqb_-j3FDA',
        title: 'Pasoori - Coke Studio Season 14',
        artist: 'Ali Sethi x Shae Gill',
        coverUrl: 'https://i.ytimg.com/vi/5Eqb_-j3FDA/hqdefault.jpg',
        duration: 224,
        viewCount: 860000000,
        publishedAt: 'Coke Studio S14'
      },
      {
        source: 'youtube',
        id: '7D4vNcK6D38',
        title: 'Tu Jhoom - Coke Studio Season 14',
        artist: 'Abida Parveen x Naseebo Lal',
        coverUrl: 'https://i.ytimg.com/vi/7D4vNcK6D38/hqdefault.jpg',
        duration: 402,
        viewCount: 230000000,
        publishedAt: 'Sufi Anthem'
      },
      {
        source: 'youtube',
        id: '_XbvH79U3bQ',
        title: 'Kahani Suno 2.0',
        artist: 'Kaifi Khalil',
        coverUrl: 'https://i.ytimg.com/vi/_XbvH79U3bQ/hqdefault.jpg',
        duration: 175,
        viewCount: 510000000,
        publishedAt: 'Pakistani Classic'
      },
      {
        source: 'youtube',
        id: 'kw4tT7SCmaY',
        title: 'Afreen Afreen - Coke Studio',
        artist: 'Rahat Fateh Ali Khan x Momina Mustehsan',
        coverUrl: 'https://i.ytimg.com/vi/kw4tT7SCmaY/hqdefault.jpg',
        duration: 405,
        viewCount: 490000000,
        publishedAt: 'Sufi Legend'
      },
      {
        source: 'youtube',
        id: 'a18py61_F_w',
        title: 'Tajdar-e-Haram - Coke Studio',
        artist: 'Atif Aslam',
        coverUrl: 'https://i.ytimg.com/vi/a18py61_F_w/hqdefault.jpg',
        duration: 540,
        viewCount: 530000000,
        publishedAt: 'Qawwali Masterpiece'
      },
      {
        source: 'youtube',
        id: 'd9NqYdM1uGg',
        title: 'Kana Yaari - Coke Studio Season 14',
        artist: 'Kaifi Khalil, Eva B, Abdul Wahab Bugti',
        coverUrl: 'https://i.ytimg.com/vi/d9NqYdM1uGg/hqdefault.jpg',
        duration: 232,
        viewCount: 155000000,
        publishedAt: 'Balochi Folk'
      },
      {
        source: 'youtube',
        id: 'R6cR5X3hFdc',
        title: 'Blockbuster - Coke Studio Season 15',
        artist: 'Faris Shafi, Umair Butt, Gharwi Group',
        coverUrl: 'https://i.ytimg.com/vi/R6cR5X3hFdc/hqdefault.jpg',
        duration: 215,
        viewCount: 95000000,
        publishedAt: 'Coke Studio S15'
      },
      {
        source: 'youtube',
        id: '0RDI9CMilhk',
        title: 'Iraaday',
        artist: 'Abdul Hannan, Rovalio',
        coverUrl: 'https://i.ytimg.com/vi/0RDI9CMilhk/hqdefault.jpg',
        duration: 134,
        viewCount: 145000000,
        publishedAt: 'Indie Soul'
      },
      {
        source: 'youtube',
        id: 'vBGiFtb8Rpw',
        title: 'Bikhra',
        artist: 'Abdul Hannan, Rovalio',
        coverUrl: 'https://i.ytimg.com/vi/vBGiFtb8Rpw/hqdefault.jpg',
        duration: 168,
        viewCount: 110000000,
        publishedAt: 'Pakistani Indie'
      },
      {
        source: 'youtube',
        id: '6MgsHSAcI9k',
        title: 'Kun Faya Kun',
        artist: 'A.R. Rahman, Javed Ali, Mohit Chauhan',
        coverUrl: 'https://i.ytimg.com/vi/6MgsHSAcI9k/hqdefault.jpg',
        duration: 470,
        viewCount: 480000000,
        publishedAt: 'Sufi Spiritual'
      },
      {
        source: 'youtube',
        id: '8c5M3P3f4_0',
        title: 'Sadqay',
        artist: 'Aashir Wajahat, Nayel, Nehaal Naseem',
        coverUrl: 'https://i.ytimg.com/vi/8c5M3P3f4_0/hqdefault.jpg',
        duration: 204,
        viewCount: 120000000,
        publishedAt: 'Viral Melody'
      },
      {
        source: 'youtube',
        id: 'I2sA9oD9gCE',
        title: 'Tera Woh Pyar - Coke Studio',
        artist: 'Momina Mustehsan, Asim Azhar',
        coverUrl: 'https://i.ytimg.com/vi/I2sA9oD9gCE/hqdefault.jpg',
        duration: 365,
        viewCount: 240000000,
        publishedAt: 'Coke Studio Classic'
      },
      {
        source: 'youtube',
        id: 'qD6bPNZRRbQ',
        title: 'Mere Rashke Qamar',
        artist: 'Nusrat Fateh Ali Khan, Rahat Fateh Ali Khan',
        coverUrl: 'https://i.ytimg.com/vi/qD6bPNZRRbQ/hqdefault.jpg',
        duration: 220,
        viewCount: 390000000,
        publishedAt: 'Qawwali Hit'
      },
      {
        source: 'youtube',
        id: 'H5v3kku4y6Q',
        title: 'Wishes',
        artist: 'Hasan Raheem, Talwiinder, Umair',
        coverUrl: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
        duration: 218,
        viewCount: 98000000,
        publishedAt: 'Pakistani R&B'
      },
      {
        source: 'youtube',
        id: '4tH3nQd_Y5I',
        title: 'Afsanay',
        artist: 'Young Stunners (Talha Anjum, Talhah Yunus)',
        coverUrl: 'https://i.ytimg.com/vi/4tH3nQd_Y5I/hqdefault.jpg',
        duration: 315,
        viewCount: 130000000,
        publishedAt: 'Poetic Hip-Hop'
      },
      {
        source: 'youtube',
        id: 'G_S2kE8cK1E',
        title: 'Guman',
        artist: 'Young Stunners (Talha Anjum, Talhah Yunus)',
        coverUrl: 'https://i.ytimg.com/vi/G_S2kE8cK1E/hqdefault.jpg',
        duration: 256,
        viewCount: 145000000,
        publishedAt: 'Karachi Soul'
      }
    ]
  },
  {
    id: 'global-english',
    title: 'Global Pop',
    subtitle: 'Billboard Hot 100 & Pop Superstars',
    circleLabel: 'GLOBAL',
    gradient: 'from-indigo-600 via-violet-600 to-purple-800',
    accentColor: '#8b5cf6',
    bgGradient: 'from-violet-950/80 via-stone-900/80 to-neutral-950',
    borderGlow: 'hover:border-purple-500/60 hover:shadow-purple-500/20',
    curatorNote: '100% International Pop, R&B & Global Chart-Toppers',
    query: 'die with a smile apt rose bruno mars billie eilish birds of a feather sabrina carpenter espresso the weeknd timeless',
    queryPool: [
      'lady gaga bruno mars die with a smile rose apt billie eilish birds of a feather official',
      'sabrina carpenter espresso please please please taste benson boone beautiful things',
      'the weeknd timeless blinding lights starboy one of the girls taylor swift cruel summer',
      'kendrick lamar sza luther not like us post malone dua lipa levitating harry styles as it was',
      'hozier too sweet teddy swims lose control miley cyrus flowers glass animals heat waves'
    ],
    excludeKeywords: [
      'hindi', 'bollywood', 'punjabi', 'bhojpuri', 'tamil', 'telugu', 'malayalam',
      'kannada', 'arijit', 'diljit', 'karan aujla', 'coke studio', 'qawwali', 'bhajan'
    ],
    vibeFilters: [
      { id: 'all', label: 'All Hot 100', query: 'billboard hot 100 global english hits', keywords: [] },
      { id: 'pop-icons', label: 'Pop Superstars', query: 'sabrina carpenter billie eilish taylor swift dua lipa lady gaga bruno mars', keywords: ['gaga', 'bruno', 'rose', 'sabrina', 'billie', 'taylor', 'dua', 'harry', 'miley', 'benson', 'espresso', 'smile', 'feather'] },
      { id: 'rnb-weeknd', label: 'The Weeknd & R&B', query: 'the weeknd timeless blinding lights starboy sza kendrick lamar', keywords: ['weeknd', 'sza', 'kendrick', 'carti', 'timeless', 'blinding', 'starboy', 'luther', 'not like us', 'girls', 'rema'] },
      { id: 'viral-anthems', label: 'Billion-Stream Anthems', query: 'glass animals heat waves the kid laroi stay hozier too sweet teddy swims', keywords: ['heat waves', 'stay', 'hozier', 'teddy', 'benson', 'flowers', 'as it was', 'calm down', 'levitating'] }
    ],
    defaultTracks: [
      {
        source: 'youtube',
        id: 'kPa7bsKwL-8',
        title: 'Die With A Smile',
        artist: 'Lady Gaga, Bruno Mars',
        coverUrl: 'https://i.ytimg.com/vi/kPa7bsKwL-8/hqdefault.jpg',
        duration: 251,
        viewCount: 840000000,
        publishedAt: 'Billboard #1'
      },
      {
        source: 'youtube',
        id: 'ekr2nIex040',
        title: 'APT.',
        artist: 'ROSÉ & Bruno Mars',
        coverUrl: 'https://i.ytimg.com/vi/ekr2nIex040/hqdefault.jpg',
        duration: 170,
        viewCount: 790000000,
        publishedAt: 'Global #1'
      },
      {
        source: 'youtube',
        id: 'V9PVRfjEBTI',
        title: 'BIRDS OF A FEATHER',
        artist: 'Billie Eilish',
        coverUrl: 'https://i.ytimg.com/vi/V9PVRfjEBTI/hqdefault.jpg',
        duration: 210,
        viewCount: 540000000,
        publishedAt: 'Spotify #1'
      },
      {
        source: 'youtube',
        id: 'eVTXPUF4Oz4',
        title: 'Espresso',
        artist: 'Sabrina Carpenter',
        coverUrl: 'https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg',
        duration: 175,
        viewCount: 490000000,
        publishedAt: 'Pop Smash'
      },
      {
        source: 'youtube',
        id: '16jA-6hiSUo',
        title: 'Timeless',
        artist: 'The Weeknd, Playboi Carti',
        coverUrl: 'https://i.ytimg.com/vi/16jA-6hiSUo/hqdefault.jpg',
        duration: 256,
        viewCount: 230000000,
        publishedAt: 'Hot 100 Top 5'
      },
      {
        source: 'youtube',
        id: 'Oa_RSwwpPaA',
        title: 'Beautiful Things',
        artist: 'Benson Boone',
        coverUrl: 'https://i.ytimg.com/vi/Oa_RSwwpPaA/hqdefault.jpg',
        duration: 180,
        viewCount: 520000000,
        publishedAt: 'Global Smash'
      },
      {
        source: 'youtube',
        id: 'cF1Na4AIecM',
        title: 'Please Please Please',
        artist: 'Sabrina Carpenter',
        coverUrl: 'https://i.ytimg.com/vi/cF1Na4AIecM/hqdefault.jpg',
        duration: 186,
        viewCount: 310000000,
        publishedAt: 'Billboard #1'
      },
      {
        source: 'youtube',
        id: 'KEG7b851Ric',
        title: 'Taste',
        artist: 'Sabrina Carpenter',
        coverUrl: 'https://i.ytimg.com/vi/KEG7b851Ric/hqdefault.jpg',
        duration: 157,
        viewCount: 240000000,
        publishedAt: 'Pop Hit'
      },
      {
        source: 'youtube',
        id: 'T6eK-2OQtew',
        title: 'Not Like Us',
        artist: 'Kendrick Lamar',
        coverUrl: 'https://i.ytimg.com/vi/T6eK-2OQtew/hqdefault.jpg',
        duration: 274,
        viewCount: 420000000,
        publishedAt: 'Grammy Record'
      },
      {
        source: 'youtube',
        id: 'sOnqjkJTMaA',
        title: 'luther',
        artist: 'Kendrick Lamar, SZA',
        coverUrl: 'https://i.ytimg.com/vi/sOnqjkJTMaA/hqdefault.jpg',
        duration: 177,
        viewCount: 190000000,
        publishedAt: 'Hot 100 #1'
      },
      {
        source: 'youtube',
        id: '4NRXx6U8ABQ',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        coverUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
        duration: 200,
        viewCount: 1200000000,
        publishedAt: 'All-Time #1'
      },
      {
        source: 'youtube',
        id: '34Na4j8AVgA',
        title: 'Starboy',
        artist: 'The Weeknd ft. Daft Punk',
        coverUrl: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
        duration: 230,
        viewCount: 2500000000,
        publishedAt: 'Global Classic'
      },
      {
        source: 'youtube',
        id: 'ic8j13piAhQ',
        title: 'Cruel Summer',
        artist: 'Taylor Swift',
        coverUrl: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg',
        duration: 178,
        viewCount: 650000000,
        publishedAt: 'Pop Anthem'
      },
      {
        source: 'youtube',
        id: 'H5v3kku4y6Q',
        title: 'As It Was',
        artist: 'Harry Styles',
        coverUrl: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
        duration: 167,
        viewCount: 820000000,
        publishedAt: 'Global #1'
      },
      {
        source: 'youtube',
        id: 'G7KNmW9a75Y',
        title: 'Flowers',
        artist: 'Miley Cyrus',
        coverUrl: 'https://i.ytimg.com/vi/G7KNmW9a75Y/hqdefault.jpg',
        duration: 200,
        viewCount: 950000000,
        publishedAt: 'Record Breaker'
      },
      {
        source: 'youtube',
        id: 'TUVcZfQe-Kw',
        title: 'Levitating',
        artist: 'Dua Lipa',
        coverUrl: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg',
        duration: 203,
        viewCount: 980000000,
        publishedAt: 'Dance Pop'
      },
      {
        source: 'youtube',
        id: 'mRD0-GxqHVo',
        title: 'Heat Waves',
        artist: 'Glass Animals',
        coverUrl: 'https://i.ytimg.com/vi/mRD0-GxqHVo/hqdefault.jpg',
        duration: 238,
        viewCount: 890000000,
        publishedAt: 'Indie Pop Hit'
      },
      {
        source: 'youtube',
        id: 'kTJczUoc26U',
        title: 'STAY',
        artist: 'The Kid LAROI, Justin Bieber',
        coverUrl: 'https://i.ytimg.com/vi/kTJczUoc26U/hqdefault.jpg',
        duration: 141,
        viewCount: 960000000,
        publishedAt: 'Hot 100 #1'
      },
      {
        source: 'youtube',
        id: 'WcIcVapfqXw',
        title: 'Calm Down',
        artist: 'Rema, Selena Gomez',
        coverUrl: 'https://i.ytimg.com/vi/WcIcVapfqXw/hqdefault.jpg',
        duration: 239,
        viewCount: 1050000000,
        publishedAt: 'Global Afro-Pop'
      },
      {
        source: 'youtube',
        id: 'GZ3zL7kT6_c',
        title: 'Lose Control',
        artist: 'Teddy Swims',
        coverUrl: 'https://i.ytimg.com/vi/GZ3zL7kT6_c/hqdefault.jpg',
        duration: 210,
        viewCount: 410000000,
        publishedAt: 'Soul Pop #1'
      }
    ]
  },
  {
    id: 'punjabi-party',
    title: 'Punjabi Heat',
    subtitle: 'Bhangra Bangers & Heavy Desi Bass',
    circleLabel: 'PUNJABI',
    gradient: 'from-rose-600 via-red-600 to-amber-600',
    accentColor: '#e11d48',
    bgGradient: 'from-rose-950/80 via-stone-900/80 to-neutral-950',
    borderGlow: 'hover:border-rose-500/60 hover:shadow-rose-500/20',
    curatorNote: 'Non-stop Punjabi chartbusters, bhangra anthems & heavy bass',
    query: 'karan aujla wavy winning speech tauba tauba softly diljit dosanjh goat born to shine shubh king shit ap dhillon',
    queryPool: [
      'karan aujla wavy winning speech softly tauba tauba 52 bars admirin you',
      'diljit dosanjh born to shine goat lover naina lalkara hass hass kinni kinni',
      'shubh king shit one love cheques elevated no love still rollin',
      'ap dhillon brown munde excuses with you summer high jazzy b guru randhawa',
      'yo yo honey singh millionaire kalaastar badshah punjabi party hits'
    ],
    excludeKeywords: [
      'sad song', 'emotional crying', 'lullaby', 'ghazal', 'classical instrumental'
    ],
    vibeFilters: [
      { id: 'all', label: 'All Punjabi Hits', query: 'punjabi party bangers karan aujla diljit shubh', keywords: [] },
      { id: 'aujla-diljit', label: 'Aujla & Diljit', query: 'karan aujla diljit dosanjh wavy winning speech goat born to shine softly', keywords: ['karan aujla', 'diljit', 'wavy', 'winning speech', 'softly', 'tauba', 'naina', 'goat', 'born to shine', 'lover', '52 bars'] },
      { id: 'desi-drip', label: 'Shubh & AP Dhillon', query: 'shubh ap dhillon king shit one love cheques brown munde excuses', keywords: ['shubh', 'ap dhillon', 'king shit', 'one love', 'cheques', 'elevated', 'brown munde', 'excuses', 'with you'] },
      { id: 'club-bhangra', label: 'Club & Wedding Party', query: 'yo yo honey singh millionaire badshah kalaastar 3 peg white brown black', keywords: ['honey singh', 'badshah', 'millionaire', 'kalaastar', 'white brown', '3 peg', 'tauba', 'naina', 'bhangra'] }
    ],
    defaultTracks: [
      {
        source: 'youtube',
        id: 'XTp5jaRU3Ws',
        title: 'Wavy',
        artist: 'Karan Aujla',
        coverUrl: 'https://i.ytimg.com/vi/XTp5jaRU3Ws/hqdefault.jpg',
        duration: 174,
        viewCount: 98000000,
        publishedAt: 'Punjabi #1'
      },
      {
        source: 'youtube',
        id: 'vsWxs1tuwDk',
        title: 'Winning Speech',
        artist: 'Karan Aujla, Mxrci',
        coverUrl: 'https://i.ytimg.com/vi/vsWxs1tuwDk/hqdefault.jpg',
        duration: 198,
        viewCount: 135000000,
        publishedAt: 'Chartbuster'
      },
      {
        source: 'youtube',
        id: 'LK7-_dgAVQE',
        title: 'Tauba Tauba',
        artist: 'Karan Aujla, Badshah',
        coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg',
        duration: 208,
        viewCount: 290000000,
        publishedAt: 'Party Smash'
      },
      {
        source: 'youtube',
        id: 'XO8wew38VM8',
        title: 'Millionaire',
        artist: 'Yo Yo Honey Singh',
        coverUrl: 'https://i.ytimg.com/vi/XO8wew38VM8/hqdefault.jpg',
        duration: 200,
        viewCount: 260000000,
        publishedAt: 'Club Anthem'
      },
      {
        source: 'youtube',
        id: 'X_sF7W8wYw4',
        title: 'Softly',
        artist: 'Karan Aujla, Ikky',
        coverUrl: 'https://i.ytimg.com/vi/X_sF7W8wYw4/hqdefault.jpg',
        duration: 156,
        viewCount: 280000000,
        publishedAt: 'Making Memories'
      },
      {
        source: 'youtube',
        id: 'fXae_fPZcKk',
        title: 'Naina',
        artist: 'Diljit Dosanjh, Badshah',
        coverUrl: 'https://i.ytimg.com/vi/fXae_fPZcKk/hqdefault.jpg',
        duration: 180,
        viewCount: 165000000,
        publishedAt: 'Superhit'
      },
      {
        source: 'youtube',
        id: 'dCmp56tSSmA',
        title: 'Born to Shine',
        artist: 'Diljit Dosanjh',
        coverUrl: 'https://i.ytimg.com/vi/dCmp56tSSmA/hqdefault.jpg',
        duration: 213,
        viewCount: 390000000,
        publishedAt: 'Bhangra Icon'
      },
      {
        source: 'youtube',
        id: 'cl0a3i2wFcc',
        title: 'G.O.A.T.',
        artist: 'Diljit Dosanjh',
        coverUrl: 'https://i.ytimg.com/vi/cl0a3i2wFcc/hqdefault.jpg',
        duration: 224,
        viewCount: 340000000,
        publishedAt: 'Punjabi Legend'
      },
      {
        source: 'youtube',
        id: 'mH_LFkWxpI0',
        title: 'Lover',
        artist: 'Diljit Dosanjh, Intense',
        coverUrl: 'https://i.ytimg.com/vi/mH_LFkWxpI0/hqdefault.jpg',
        duration: 190,
        viewCount: 270000000,
        publishedAt: 'Party Vibe'
      },
      {
        source: 'youtube',
        id: '0mYBSayCsH0',
        title: 'One Love',
        artist: 'Shubh',
        coverUrl: 'https://i.ytimg.com/vi/0mYBSayCsH0/hqdefault.jpg',
        duration: 159,
        viewCount: 240000000,
        publishedAt: 'Viral Hit'
      },
      {
        source: 'youtube',
        id: '4tywp83zkmk',
        title: 'Cheques',
        artist: 'Shubh',
        coverUrl: 'https://i.ytimg.com/vi/4tywp83zkmk/hqdefault.jpg',
        duration: 188,
        viewCount: 295000000,
        publishedAt: 'Punjabi Drip'
      },
      {
        source: 'youtube',
        id: 'I1nX5EuvwzE',
        title: 'Elevated',
        artist: 'Shubh',
        coverUrl: 'https://i.ytimg.com/vi/I1nX5EuvwzE/hqdefault.jpg',
        duration: 200,
        viewCount: 260000000,
        publishedAt: 'Bass Hit'
      },
      {
        source: 'youtube',
        id: 'VNs_cCtdbPc',
        title: 'Brown Munde',
        artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon',
        coverUrl: 'https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg',
        duration: 254,
        viewCount: 720000000,
        publishedAt: 'All-Time Anthem'
      },
      {
        source: 'youtube',
        id: 'vX2cDW8LUWk',
        title: 'Excuses',
        artist: 'AP Dhillon, Gurinder Gill, Intense',
        coverUrl: 'https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg',
        duration: 176,
        viewCount: 480000000,
        publishedAt: 'Global Punjabi'
      },
      {
        source: 'youtube',
        id: 'k85mRPqvMbE',
        title: 'White Brown Black',
        artist: 'Avvy Sra, Karan Aujla, Jaani',
        coverUrl: 'https://i.ytimg.com/vi/k85mRPqvMbE/hqdefault.jpg',
        duration: 168,
        viewCount: 230000000,
        publishedAt: 'Club Banger'
      },
      {
        source: 'youtube',
        id: '4rD9_wP2zL0',
        title: '52 Bars',
        artist: 'Karan Aujla, Ikky',
        coverUrl: 'https://i.ytimg.com/vi/4rD9_wP2zL0/hqdefault.jpg',
        duration: 214,
        viewCount: 160000000,
        publishedAt: 'Four You EP'
      },
      {
        source: 'youtube',
        id: 'bB3-CUMERIU',
        title: 'Lalkara',
        artist: 'Diljit Dosanjh, Sultaan',
        coverUrl: 'https://i.ytimg.com/vi/bB3-CUMERIU/hqdefault.jpg',
        duration: 160,
        viewCount: 145000000,
        publishedAt: 'Ghost Album'
      },
      {
        source: 'youtube',
        id: 'j9k3liT2MLo',
        title: 'Hass Hass',
        artist: 'Diljit Dosanjh x Sia',
        coverUrl: 'https://i.ytimg.com/vi/j9k3liT2MLo/hqdefault.jpg',
        duration: 153,
        viewCount: 150000000,
        publishedAt: 'Global Collab'
      }
    ]
  },
  {
    id: 'desi-lofi',
    title: 'Lofi Chill',
    subtitle: 'Slowed, Reverb & Midnight Calm',
    circleLabel: 'LO-FI',
    gradient: 'from-purple-700 via-indigo-700 to-slate-900',
    accentColor: '#a855f7',
    bgGradient: 'from-purple-950/80 via-stone-900/80 to-neutral-950',
    borderGlow: 'hover:border-purple-500/60 hover:shadow-purple-500/20',
    curatorNote: 'Midnight Hindi lo-fi, slowed + reverb & aesthetic calm',
    query: 'hindi lofi slowed reverb jo tum mere ho husn sajni ishq kesariya pehle bhi main satranga',
    queryPool: [
      'anuv jain jo tum mere ho husn baarishein slowed reverb lofi chill',
      'arijit singh sajni satranga o maahi apna bana le kesariya lofi slowed reverb',
      'faheem abdullah ishq vishal mishra pehle bhi main mitraz akhiyaan gulaab lofi',
      'mohit chauhan tum se hi kk zara sa atif aslam slowed and reverb hindi',
      'aditya rikhari samjho na sahiba jasleen royal late night hindi lofi'
    ],
    excludeKeywords: [
      'gym', 'workout', 'beast mode', 'phonk', 'hardstyle', 'item song', 'bhangra party'
    ],
    vibeFilters: [
      { id: 'all', label: 'All Lo-Fi Chill', query: 'hindi lofi chill slowed reverb songs', keywords: [] },
      { id: 'slowed-reverb', label: 'Slowed + Reverb', query: 'bollywood slowed and reverb arijit singh vishal mishra kk mohit chauhan', keywords: ['slowed', 'reverb', 'ishq', 'pehle bhi', 'satranga', 'kesariya', 'zara sa', 'tum se hi', 'maahi'] },
      { id: 'indie-lofi', label: 'Indie Midnight', query: 'anuv jain jo tum mere ho husn baarishein mitraz faheem abdullah', keywords: ['anuv', 'jo tum', 'husn', 'baarishein', 'faheem', 'sahiba', 'akhiyaan', 'choo lo', 'waqt'] },
      { id: 'arijit-chill', label: 'Arijit Lo-Fi Soul', query: 'arijit singh lofi chill sajni satranga apna bana le tainu khabar nahi', keywords: ['arijit', 'sajni', 'satranga', 'apna bana le', 'tainu', 'channa', 'shayad', 'agar tum'] }
    ],
    defaultTracks: [
      {
        source: 'youtube',
        id: 'ilNt2bikxwc',
        title: 'Jo Tum Mere Ho (Midnight Lo-Fi)',
        artist: 'Anuv Jain',
        coverUrl: 'https://i.ytimg.com/vi/ilNt2bikxwc/hqdefault.jpg',
        duration: 252,
        viewCount: 195000000,
        publishedAt: 'Midnight Vibe'
      },
      {
        source: 'youtube',
        id: 'hHuG7FIKgtc',
        title: 'Ishq (Slowed & Reverb)',
        artist: 'Faheem Abdullah, Rauhan Malik',
        coverUrl: 'https://i.ytimg.com/vi/hHuG7FIKgtc/hqdefault.jpg',
        duration: 230,
        viewCount: 210000000,
        publishedAt: 'Slowed + Reverb'
      },
      {
        source: 'youtube',
        id: 'k3g_WjLCsXM',
        title: 'Sajni (Aesthetic Lo-Fi Flip)',
        artist: 'Arijit Singh, Ram Sampath',
        coverUrl: 'https://i.ytimg.com/vi/k3g_WjLCsXM/hqdefault.jpg',
        duration: 170,
        viewCount: 225000000,
        publishedAt: 'Lo-Fi Soul'
      },
      {
        source: 'youtube',
        id: 'gVyRBNb_J4o',
        title: 'Husn (Late Night Chill)',
        artist: 'Anuv Jain',
        coverUrl: 'https://i.ytimg.com/vi/gVyRBNb_J4o/hqdefault.jpg',
        duration: 218,
        viewCount: 180000000,
        publishedAt: 'Indie Chill'
      },
      {
        source: 'youtube',
        id: 'hUxO6qj8oK0',
        title: 'Pehle Bhi Main (Slowed & Reverb)',
        artist: 'Vishal Mishra, Raj Shekhar',
        coverUrl: 'https://i.ytimg.com/vi/hUxO6qj8oK0/hqdefault.jpg',
        duration: 250,
        viewCount: 240000000,
        publishedAt: '2 AM Vibe'
      },
      {
        source: 'youtube',
        id: 'HrnrqYxYrbk',
        title: 'Satranga (Midnight Acoustic)',
        artist: 'Arijit Singh, Shreyas Puranik',
        coverUrl: 'https://i.ytimg.com/vi/HrnrqYxYrbk/hqdefault.jpg',
        duration: 271,
        viewCount: 260000000,
        publishedAt: 'Soulful Lo-Fi'
      },
      {
        source: 'youtube',
        id: 'n2dVFdqMYGA',
        title: 'Sahiba (Chill Edit)',
        artist: 'Jasleen Royal, Stebin Ben, Vijay Deverakonda',
        coverUrl: 'https://i.ytimg.com/vi/n2dVFdqMYGA/hqdefault.jpg',
        duration: 224,
        viewCount: 95000000,
        publishedAt: 'Dreamy Lo-Fi'
      },
      {
        source: 'youtube',
        id: 'ElZfdU54Cp8',
        title: 'Apna Bana Le (Slowed & Reverb)',
        artist: 'Arijit Singh, Sachin-Jigar',
        coverUrl: 'https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg',
        duration: 261,
        viewCount: 380000000,
        publishedAt: 'Lo-Fi Classic'
      },
      {
        source: 'youtube',
        id: 'E7k4wM5zS3k',
        title: 'O Maahi (Midnight Lo-Fi)',
        artist: 'Arijit Singh, Pritam',
        coverUrl: 'https://i.ytimg.com/vi/E7k4wM5zS3k/hqdefault.jpg',
        duration: 233,
        viewCount: 215000000,
        publishedAt: 'Slowed Chill'
      },
      {
        source: 'youtube',
        id: 'BddP6PYo2gs',
        title: 'Kesariya (Lo-Fi Flip)',
        artist: 'Arijit Singh, Pritam',
        coverUrl: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
        duration: 268,
        viewCount: 540000000,
        publishedAt: 'Aesthetic Beats'
      },
      {
        source: 'youtube',
        id: 'PJWemSzExXs',
        title: 'Baarishein (Rainy Night Lo-Fi)',
        artist: 'Anuv Jain',
        coverUrl: 'https://i.ytimg.com/vi/PJWemSzExXs/hqdefault.jpg',
        duration: 207,
        viewCount: 165000000,
        publishedAt: 'Rain Vibe'
      },
      {
        source: 'youtube',
        id: 'dp8PhLsUcFE',
        title: 'Tum Se Hi (Slowed & Reverb)',
        artist: 'Mohit Chauhan, Pritam',
        coverUrl: 'https://i.ytimg.com/vi/dp8PhLsUcFE/hqdefault.jpg',
        duration: 321,
        viewCount: 290000000,
        publishedAt: 'Nostalgic Lo-Fi'
      },
      {
        source: 'youtube',
        id: '-8C_2BBVWk8',
        title: 'Zara Sa (Midnight Reverb)',
        artist: 'KK, Pritam',
        coverUrl: 'https://i.ytimg.com/vi/-8C_2BBVWk8/hqdefault.jpg',
        duration: 303,
        viewCount: 230000000,
        publishedAt: 'Golden Lo-Fi'
      },
      {
        source: 'youtube',
        id: 'sK7riqg2mr4',
        title: 'Agar Tum Saath Ho (Lo-Fi Soul)',
        artist: 'Alka Yagnik, Arijit Singh, A.R. Rahman',
        coverUrl: 'https://i.ytimg.com/vi/sK7riqg2mr4/hqdefault.jpg',
        duration: 341,
        viewCount: 410000000,
        publishedAt: 'Late Night'
      },
      {
        source: 'youtube',
        id: '284Ov7ysmfA',
        title: 'Channa Mereya (Slowed & Reverb)',
        artist: 'Arijit Singh, Pritam',
        coverUrl: 'https://i.ytimg.com/vi/284Ov7ysmfA/hqdefault.jpg',
        duration: 289,
        viewCount: 390000000,
        publishedAt: 'Heartfelt Lo-Fi'
      },
      {
        source: 'youtube',
        id: 'MJyKN-8UncM',
        title: 'Shayad (Lo-Fi Chill)',
        artist: 'Arijit Singh, Pritam',
        coverUrl: 'https://i.ytimg.com/vi/MJyKN-8UncM/hqdefault.jpg',
        duration: 247,
        viewCount: 310000000,
        publishedAt: 'Chillwave'
      },
      {
        source: 'youtube',
        id: 'sFMRqxCexDk',
        title: 'Choo Lo (Midnight Edit)',
        artist: 'The Local Train',
        coverUrl: 'https://i.ytimg.com/vi/sFMRqxCexDk/hqdefault.jpg',
        duration: 233,
        viewCount: 145000000,
        publishedAt: 'Indie Classic'
      },
      {
        source: 'youtube',
        id: '1-nnEM8chwo',
        title: 'Khoobsurat (Chill Mix)',
        artist: 'Vishal Mishra, Sachin-Jigar',
        coverUrl: 'https://i.ytimg.com/vi/1-nnEM8chwo/hqdefault.jpg',
        duration: 244,
        viewCount: 165000000,
        publishedAt: 'Smooth Vibe'
      }
    ]
  },
  {
    id: 'pan-india-south',
    title: 'South Mass',
    subtitle: 'Tamil, Telugu & Malayalam Power',
    circleLabel: 'SOUTH',
    gradient: 'from-red-600 via-rose-700 to-amber-700',
    accentColor: '#ef4444',
    bgGradient: 'from-red-950/80 via-stone-900/80 to-neutral-950',
    borderGlow: 'hover:border-red-500/60 hover:shadow-red-500/20',
    curatorNote: 'High-voltage Tamil, Telugu, Malayalam & Kannada cinema bangers',
    query: 'chuttamalle devara kissik pushpa 2 illuminati aavesham hukum naa ready anirudh devi sri prasad',
    queryPool: [
      'devara chuttamalle fear song pushpa 2 kissik peelings pushpa pushpa',
      'anirudh ravichander hukum jailer naa ready badass leo kaavaalaa manasilaayo',
      'illuminati aavesham sushin shyam kurchi madathapetti thaman oo antava srivalli',
      'naatu naatu rrr arabic kuthu vaathi coming vikram title track',
      'rowdy baby butta bomma kgf toofan kantara varaha roopam south mass songs'
    ],
    excludeKeywords: [
      'sad ghazal', 'english country', 'lullaby'
    ],
    vibeFilters: [
      { id: 'all', label: 'All South Mass', query: 'pan india south bangers anirudh dsp thaman', keywords: [] },
      { id: 'anirudh-tamil', label: 'Anirudh & Tamil Mass', query: 'anirudh ravichander hukum naa ready badass kaavaalaa arabic kuthu vaathi coming', keywords: ['anirudh', 'hukum', 'naa ready', 'badass', 'kaavaalaa', 'manasilaayo', 'arabic kuthu', 'vaathi', 'vikram', 'rowdy'] },
      { id: 'telugu-fire', label: 'Telugu Blockbusters', query: 'chuttamalle devara kissik pushpa 2 kurchi madathapetti naatu naatu srivalli', keywords: ['chuttamalle', 'kissik', 'pushpa', 'peelings', 'kurchi', 'oo antava', 'srivalli', 'naatu', 'butta bomma', 'devara'] },
      { id: 'mollywood-sandalwood', label: 'Malayalam & Kannada', query: 'illuminati aavesham sushin shyam kgf toofan kantara', keywords: ['illuminati', 'aavesham', 'sushin', 'toofan', 'kgf', 'chaleya'] }
    ],
    defaultTracks: [
      {
        source: 'youtube',
        id: '5cx7rvMvAWo',
        title: 'Chuttamalle - Devara',
        artist: 'Shilpa Rao, Anirudh Ravichander',
        coverUrl: 'https://i.ytimg.com/vi/5cx7rvMvAWo/hqdefault.jpg',
        duration: 222,
        viewCount: 330000000,
        publishedAt: 'Pan-India #1'
      },
      {
        source: 'youtube',
        id: 'r0c1f6yB_mI',
        title: 'Kissik - Pushpa 2: The Rule',
        artist: 'Sublahshini, Devi Sri Prasad',
        coverUrl: 'https://i.ytimg.com/vi/r0c1f6yB_mI/hqdefault.jpg',
        duration: 248,
        viewCount: 215000000,
        publishedAt: 'Pushpa 2 Smash'
      },
      {
        source: 'youtube',
        id: 'tOM-nWPcR4U',
        title: 'Illuminati - Aavesham',
        artist: 'Sushin Shyam, Dabzee',
        coverUrl: 'https://i.ytimg.com/vi/tOM-nWPcR4U/hqdefault.jpg',
        duration: 215,
        viewCount: 275000000,
        publishedAt: 'Mollywood #1'
      },
      {
        source: 'youtube',
        id: '1F3HM635S0k',
        title: 'Hukum - Thalaivar Alappara (Jailer)',
        artist: 'Anirudh Ravichander',
        coverUrl: 'https://i.ytimg.com/vi/1F3HM635S0k/hqdefault.jpg',
        duration: 207,
        viewCount: 260000000,
        publishedAt: 'Mass Anthem'
      },
      {
        source: 'youtube',
        id: 'szvt1vD0Uug',
        title: 'Naa Ready - Leo',
        artist: 'Anirudh Ravichander, Thalapathy Vijay',
        coverUrl: 'https://i.ytimg.com/vi/szvt1vD0Uug/hqdefault.jpg',
        duration: 248,
        viewCount: 290000000,
        publishedAt: 'Kollywood #1'
      },
      {
        source: 'youtube',
        id: 'lM8h5Mm6ODo',
        title: 'Kaavaalaa - Jailer',
        artist: 'Shilpa Rao, Anirudh Ravichander',
        coverUrl: 'https://i.ytimg.com/vi/lM8h5Mm6ODo/hqdefault.jpg',
        duration: 190,
        viewCount: 340000000,
        publishedAt: 'Viral Dance'
      },
      {
        source: 'youtube',
        id: '5yH6_hE58e0',
        title: 'Manasilaayo - Vettaiyan',
        artist: 'Anirudh Ravichander, Malaysia Vasudevan, Yugendran',
        coverUrl: 'https://i.ytimg.com/vi/5yH6_hE58e0/hqdefault.jpg',
        duration: 235,
        viewCount: 165000000,
        publishedAt: 'Superstar Hit'
      },
      {
        source: 'youtube',
        id: 'CKpbdCciELk',
        title: 'Kurchi Madathapetti - Guntur Kaaram',
        artist: 'Thaman S, Sri Krishna, Sahithi Chaganti',
        coverUrl: 'https://i.ytimg.com/vi/CKpbdCciELk/hqdefault.jpg',
        duration: 215,
        viewCount: 280000000,
        publishedAt: 'Telugu Mass'
      },
      {
        source: 'youtube',
        id: 'OsU0CGZoV8E',
        title: 'Naatu Naatu - RRR',
        artist: 'Rahul Sipligunj, Kaala Bhairava, M.M. Keeravani',
        coverUrl: 'https://i.ytimg.com/vi/OsU0CGZoV8E/hqdefault.jpg',
        duration: 214,
        viewCount: 620000000,
        publishedAt: 'Oscar Winner'
      },
      {
        source: 'youtube',
        id: 'u_wB6byrl5k',
        title: 'Oo Antava Oo Oo Antava - Pushpa',
        artist: 'Indravathi Chauhan, Devi Sri Prasad',
        coverUrl: 'https://i.ytimg.com/vi/u_wB6byrl5k/hqdefault.jpg',
        duration: 228,
        viewCount: 490000000,
        publishedAt: 'Pan-India Rage'
      },
      {
        source: 'youtube',
        id: 'txHO7PLGE3o',
        title: 'Srivalli - Pushpa',
        artist: 'Sid Sriram, Devi Sri Prasad',
        coverUrl: 'https://i.ytimg.com/vi/txHO7PLGE3o/hqdefault.jpg',
        duration: 224,
        viewCount: 540000000,
        publishedAt: 'Melody Blockbuster'
      },
      {
        source: 'youtube',
        id: 'KUN5Uf9mObQ',
        title: 'Arabic Kuthu - Halamithi Habibo',
        artist: 'Anirudh Ravichander, Jonita Gandhi',
        coverUrl: 'https://i.ytimg.com/vi/KUN5Uf9mObQ/hqdefault.jpg',
        duration: 280,
        viewCount: 670000000,
        publishedAt: 'Kuthu Smash'
      },
      {
        source: 'youtube',
        id: 'fRD_3vJagxk',
        title: 'Vaathi Coming - Master',
        artist: 'Anirudh Ravichander, Gana Balachandar',
        coverUrl: 'https://i.ytimg.com/vi/fRD_3vJagxk/hqdefault.jpg',
        duration: 230,
        viewCount: 510000000,
        publishedAt: 'High Voltage'
      },
      {
        source: 'youtube',
        id: 'OKBMCL-frPU',
        title: 'Vikram - Title Track',
        artist: 'Anirudh Ravichander',
        coverUrl: 'https://i.ytimg.com/vi/OKBMCL-frPU/hqdefault.jpg',
        duration: 218,
        viewCount: 195000000,
        publishedAt: 'Action Theme'
      },
      {
        source: 'youtube',
        id: 'x6Q7c9RyMzk',
        title: 'Rowdy Baby - Maari 2',
        artist: 'Dhanush, Dhee, Yuvan Shankar Raja',
        coverUrl: 'https://i.ytimg.com/vi/x6Q7c9RyMzk/hqdefault.jpg',
        duration: 284,
        viewCount: 1550000000,
        publishedAt: '1.5B+ Legend'
      },
      {
        source: 'youtube',
        id: 'O2d2a7H6b2s',
        title: 'Fear Song - Devara',
        artist: 'Anirudh Ravichander',
        coverUrl: 'https://i.ytimg.com/vi/O2d2a7H6b2s/hqdefault.jpg',
        duration: 202,
        viewCount: 120000000,
        publishedAt: 'High Octane'
      },
      {
        source: 'youtube',
        id: 'VAdGW7QDJUI',
        title: 'Chaleya - Jawan',
        artist: 'Anirudh Ravichander, Arijit Singh, Shilpa Rao',
        coverUrl: 'https://i.ytimg.com/vi/VAdGW7QDJUI/hqdefault.jpg',
        duration: 200,
        viewCount: 380000000,
        publishedAt: 'Pan-India Hit'
      },
      {
        source: 'youtube',
        id: 'L9G3eH9b2a4',
        title: 'Toofan - KGF Chapter 2',
        artist: 'Ravi Basrur, Santhosh Venky',
        coverUrl: 'https://i.ytimg.com/vi/L9G3eH9b2a4/hqdefault.jpg',
        duration: 215,
        viewCount: 210000000,
        publishedAt: 'Sandalwood Mass'
      }
    ]
  },
  {
    id: 'late-night-drive',
    title: 'Night Drive',
    subtitle: 'Midnight Cruise & Synthwave Beats',
    circleLabel: 'DRIVE',
    gradient: 'from-cyan-700 via-blue-700 to-indigo-900',
    accentColor: '#06b6d4',
    bgGradient: 'from-cyan-950/80 via-stone-900/80 to-neutral-950',
    borderGlow: 'hover:border-cyan-500/60 hover:shadow-cyan-500/20',
    curatorNote: 'Engineered for empty highways, neon city lights & midnight drives',
    query: 'the weeknd timeless blinding lights starboy after hours travis scott fein don toliver night drive songs',
    queryPool: [
      'the weeknd timeless blinding lights starboy after hours call out my name night drive',
      'travis scott fein goosebumps highest in the room don toliver no idea metro boomin too many nights',
      'kavinsky nightcall m83 midnight city the neighbourhood sweater weather chase atlantic swim',
      'shubh no love we rollin karan aujla wavy sidhu moose wala 295 punjabi night drive',
      'synthwave chillwave night drive car bass songs 2026'
    ],
    excludeKeywords: [
      'wedding', 'mehndi', 'morning bhajan', 'kids song', 'comedy'
    ],
    vibeFilters: [
      { id: 'all', label: 'All Night Drive', query: 'late night drive synthwave weeknd travis scott', keywords: [] },
      { id: 'synth-weeknd', label: 'Synthwave & Weeknd', query: 'the weeknd timeless blinding lights starboy after hours kavinsky nightcall m83', keywords: ['weeknd', 'timeless', 'blinding', 'starboy', 'after hours', 'call out', 'nightcall', 'midnight city', 'sweater weather', 'swim'] },
      { id: 'trap-cruise', label: 'Dark Trap & Bass', query: 'travis scott fein goosebumps highest in the room metro boomin don toliver', keywords: ['travis', 'fe!n', 'goosebumps', 'highest', 'toliver', 'metro', 'superhero', 'too many nights'] },
      { id: 'desi-highway', label: 'Desi Highway Cruise', query: 'shubh no love we rollin karan aujla wavy sidhu moose wala 295 talwiinder', keywords: ['shubh', 'no love', 'we rollin', 'wavy', '295', 'jhol', 'karan aujla'] }
    ],
    defaultTracks: [
      {
        source: 'youtube',
        id: '16jA-6hiSUo',
        title: 'Timeless',
        artist: 'The Weeknd, Playboi Carti',
        coverUrl: 'https://i.ytimg.com/vi/16jA-6hiSUo/hqdefault.jpg',
        duration: 256,
        viewCount: 230000000,
        publishedAt: 'Midnight Cruise'
      },
      {
        source: 'youtube',
        id: '4NRXx6U8ABQ',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        coverUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
        duration: 200,
        viewCount: 1200000000,
        publishedAt: 'Neon Highway'
      },
      {
        source: 'youtube',
        id: '34Na4j8AVgA',
        title: 'Starboy',
        artist: 'The Weeknd ft. Daft Punk',
        coverUrl: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
        duration: 230,
        viewCount: 2500000000,
        publishedAt: 'Night Anthem'
      },
      {
        source: 'youtube',
        id: 'ygTZZpVkmKg',
        title: 'After Hours',
        artist: 'The Weeknd',
        coverUrl: 'https://i.ytimg.com/vi/ygTZZpVkmKg/hqdefault.jpg',
        duration: 361,
        viewCount: 310000000,
        publishedAt: '3 AM Drive'
      },
      {
        source: 'youtube',
        id: 'MV_3Dpw-BRY',
        title: 'Nightcall',
        artist: 'Kavinsky',
        coverUrl: 'https://i.ytimg.com/vi/MV_3Dpw-BRY/hqdefault.jpg',
        duration: 258,
        viewCount: 340000000,
        publishedAt: 'Drive Classic'
      },
      {
        source: 'youtube',
        id: 'B9synWjqBn8',
        title: 'FE!N',
        artist: 'Travis Scott ft. Playboi Carti',
        coverUrl: 'https://i.ytimg.com/vi/B9synWjqBn8/hqdefault.jpg',
        duration: 191,
        viewCount: 380000000,
        publishedAt: 'Subwoofer Test'
      },
      {
        source: 'youtube',
        id: 'Dst9gZkq1a8',
        title: 'goosebumps',
        artist: 'Travis Scott ft. Kendrick Lamar',
        coverUrl: 'https://i.ytimg.com/vi/Dst9gZkq1a8/hqdefault.jpg',
        duration: 243,
        viewCount: 1100000000,
        publishedAt: 'Night Trap'
      },
      {
        source: 'youtube',
        id: 'tfSS1e3kYeo',
        title: 'HIGHEST IN THE ROOM',
        artist: 'Travis Scott',
        coverUrl: 'https://i.ytimg.com/vi/tfSS1e3kYeo/hqdefault.jpg',
        duration: 175,
        viewCount: 690000000,
        publishedAt: 'Late Cruise'
      },
      {
        source: 'youtube',
        id: '_r-nPqWGG6c',
        title: 'No Idea',
        artist: 'Don Toliver',
        coverUrl: 'https://i.ytimg.com/vi/_r-nPqWGG6c/hqdefault.jpg',
        duration: 154,
        viewCount: 310000000,
        publishedAt: 'Smooth R&B'
      },
      {
        source: 'youtube',
        id: 'Nyf039377sU',
        title: 'Too Many Nights',
        artist: 'Metro Boomin, Future, Don Toliver',
        coverUrl: 'https://i.ytimg.com/vi/Nyf039377sU/hqdefault.jpg',
        duration: 200,
        viewCount: 190000000,
        publishedAt: 'City Lights'
      },
      {
        source: 'youtube',
        id: 'dX3k_QDnzHE',
        title: 'Midnight City',
        artist: 'M83',
        coverUrl: 'https://i.ytimg.com/vi/dX3k_QDnzHE/hqdefault.jpg',
        duration: 244,
        viewCount: 460000000,
        publishedAt: 'Synthwave'
      },
      {
        source: 'youtube',
        id: 'GCdwKhTtNNw',
        title: 'Sweater Weather',
        artist: 'The Neighbourhood',
        coverUrl: 'https://i.ytimg.com/vi/GCdwKhTtNNw/hqdefault.jpg',
        duration: 240,
        viewCount: 980000000,
        publishedAt: 'Alt Night'
      },
      {
        source: 'youtube',
        id: 'mC9v5FaLt84',
        title: 'Swim',
        artist: 'Chase Atlantic',
        coverUrl: 'https://i.ytimg.com/vi/mC9v5FaLt84/hqdefault.jpg',
        duration: 228,
        viewCount: 240000000,
        publishedAt: 'Dark R&B'
      },
      {
        source: 'youtube',
        id: '6RrEQJNZwPQ',
        title: 'No Love (Highway Bass)',
        artist: 'Shubh',
        coverUrl: 'https://i.ytimg.com/vi/6RrEQJNZwPQ/hqdefault.jpg',
        duration: 170,
        viewCount: 390000000,
        publishedAt: 'Punjabi Cruise'
      },
      {
        source: 'youtube',
        id: 'hV8EGTjzD2s',
        title: 'We Rollin',
        artist: 'Shubh',
        coverUrl: 'https://i.ytimg.com/vi/hV8EGTjzD2s/hqdefault.jpg',
        duration: 199,
        viewCount: 340000000,
        publishedAt: 'Car Bass'
      },
      {
        source: 'youtube',
        id: 'XTp5jaRU3Ws',
        title: 'Wavy (Night Drive Mix)',
        artist: 'Karan Aujla',
        coverUrl: 'https://i.ytimg.com/vi/XTp5jaRU3Ws/hqdefault.jpg',
        duration: 174,
        viewCount: 98000000,
        publishedAt: 'Highway Vibe'
      },
      {
        source: 'youtube',
        id: 'M4ZoCHID9GI',
        title: 'Call Out My Name',
        artist: 'The Weeknd',
        coverUrl: 'https://i.ytimg.com/vi/M4ZoCHID9GI/hqdefault.jpg',
        duration: 228,
        viewCount: 960000000,
        publishedAt: 'Midnight Soul'
      },
      {
        source: 'youtube',
        id: '-2RAq5o5pwc',
        title: 'Jhol (Night Cruise)',
        artist: 'Maanu x Annural Khalid',
        coverUrl: 'https://i.ytimg.com/vi/-2RAq5o5pwc/hqdefault.jpg',
        duration: 265,
        viewCount: 185000000,
        publishedAt: 'Smooth Drive'
      }
    ]
  },
  {
    id: 'exotic-coffee',
    title: 'Acoustic Cafe',
    subtitle: 'Cozy Indie Folk & Unplugged Soul',
    circleLabel: 'ACOUSTIC',
    gradient: 'from-amber-800 via-stone-800 to-neutral-900',
    accentColor: '#d97706',
    bgGradient: 'from-amber-950/80 via-stone-900/80 to-neutral-950',
    borderGlow: 'hover:border-amber-500/60 hover:shadow-amber-500/20',
    curatorNote: 'Intimate acoustic guitars, indie folk & warm coffeehouse sessions',
    query: 'prateek kuhad co2 kasoor cold mess anuv jain gul alag aasmaan when chai met toast acoustic cafe songs',
    queryPool: [
      'prateek kuhad co2 kasoor cold mess kho gaye hum kahan acoustic indie',
      'anuv jain gul alag aasmaan mazaak riha baarishein acoustic guitar',
      'when chai met toast firefly kahaani the local train dil mere choo lo',
      'iktara wake up sid sham aisha kabira unplugged ilahi acoustic cafe',
      'cigarettes after sex apocalypse sunsetz coldplay yellow ed sheeran photograph acoustic'
    ],
    excludeKeywords: [
      'gym', 'workout', 'phonk', 'hardstyle', 'dj remix', 'item song', 'heavy metal'
    ],
    vibeFilters: [
      { id: 'all', label: 'All Coffee House', query: 'acoustic indie coffee house cozy songs', keywords: [] },
      { id: 'indie-cafe', label: 'Indian Indie Acoustic', query: 'prateek kuhad anuv jain when chai met toast the local train', keywords: ['prateek', 'anuv', 'gul', 'alag aasmaan', 'kasoor', 'co2', 'cold/mess', 'kho gaye', 'chai met toast', 'local train', 'mazaak'] },
      { id: 'unplugged-hindi', label: 'Cozy Hindi Unplugged', query: 'iktara wake up sid sham aisha kabira ilahi unplugged acoustic', keywords: ['iktara', 'sham', 'kabira', 'ilahi', 'udaarian', 'amit trivedi', 'arijit'] },
      { id: 'global-cafe', label: 'Global Acoustic Cafe', query: 'cigarettes after sex sunsetz apocalypse coldplay yellow ed sheeran photograph billie eilish', keywords: ['cigarettes', 'sunsetz', 'apocalypse', 'coldplay', 'yellow', 'photograph', 'sheeran', 'billie'] }
    ],
    defaultTracks: [
      {
        source: 'youtube',
        id: 'U2SVCCENLjE',
        title: 'CO2',
        artist: 'Prateek Kuhad',
        coverUrl: 'https://i.ytimg.com/vi/U2SVCCENLjE/hqdefault.jpg',
        duration: 164,
        viewCount: 115000000,
        publishedAt: 'Coffeehouse #1'
      },
      {
        source: 'youtube',
        id: 'BmUe3-sfr7E',
        title: 'Kasoor',
        artist: 'Prateek Kuhad',
        coverUrl: 'https://i.ytimg.com/vi/BmUe3-sfr7E/hqdefault.jpg',
        duration: 198,
        viewCount: 96000000,
        publishedAt: 'Warm Acoustic'
      },
      {
        source: 'youtube',
        id: 'S7b8ADhadJU',
        title: 'Gul',
        artist: 'Anuv Jain',
        coverUrl: 'https://i.ytimg.com/vi/S7b8ADhadJU/hqdefault.jpg',
        duration: 217,
        viewCount: 110000000,
        publishedAt: 'Indie Folk'
      },
      {
        source: 'youtube',
        id: 'vA86QFrXoho',
        title: 'Alag Aasmaan',
        artist: 'Anuv Jain',
        coverUrl: 'https://i.ytimg.com/vi/vA86QFrXoho/hqdefault.jpg',
        duration: 212,
        viewCount: 125000000,
        publishedAt: 'Ukulele & Brew'
      },
      {
        source: 'youtube',
        id: 'tF27TNC_4pc',
        title: 'Kho Gaye Hum Kahan',
        artist: 'Jasleen Royal, Prateek Kuhad',
        coverUrl: 'https://i.ytimg.com/vi/tF27TNC_4pc/hqdefault.jpg',
        duration: 214,
        viewCount: 185000000,
        publishedAt: 'Cozy Evening'
      },
      {
        source: 'youtube',
        id: 'fSS_R91Nimw',
        title: 'Iktara - Wake Up Sid',
        artist: 'Kavita Seth, Amit Trivedi',
        coverUrl: 'https://i.ytimg.com/vi/fSS_R91Nimw/hqdefault.jpg',
        duration: 253,
        viewCount: 230000000,
        publishedAt: 'Morning Coffee'
      },
      {
        source: 'youtube',
        id: 'iX_TFkut1PM',
        title: 'Sham - Aisha (Acoustic Session)',
        artist: 'Amit Trivedi, Nikhil D\'Souza, Neuman Pinto',
        coverUrl: 'https://i.ytimg.com/vi/iX_TFkut1PM/hqdefault.jpg',
        duration: 284,
        viewCount: 88000000,
        publishedAt: 'Campfire Vibe'
      },
      {
        source: 'youtube',
        id: 'jHNNMj5bNQw',
        title: 'Kabira (Acoustic Encore)',
        artist: 'Tochi Raina, Rekha Bhardwaj, Pritam',
        coverUrl: 'https://i.ytimg.com/vi/jHNNMj5bNQw/hqdefault.jpg',
        duration: 223,
        viewCount: 460000000,
        publishedAt: 'Unplugged Soul'
      },
      {
        source: 'youtube',
        id: 'fdubeMFwuGs',
        title: 'Ilahi (Unplugged Travel Edit)',
        artist: 'Arijit Singh, Pritam',
        coverUrl: 'https://i.ytimg.com/vi/fdubeMFwuGs/hqdefault.jpg',
        duration: 229,
        viewCount: 290000000,
        publishedAt: 'Breezy Cafe'
      },
      {
        source: 'youtube',
        id: '2fDzCWNS3ig',
        title: 'cold/mess',
        artist: 'Prateek Kuhad',
        coverUrl: 'https://i.ytimg.com/vi/2fDzCWNS3ig/hqdefault.jpg',
        duration: 284,
        viewCount: 74000000,
        publishedAt: 'Indie Classic'
      },
      {
        source: 'youtube',
        id: 'qLCLvzTGFVM',
        title: 'Dil Mere',
        artist: 'The Local Train',
        coverUrl: 'https://i.ytimg.com/vi/qLCLvzTGFVM/hqdefault.jpg',
        duration: 211,
        viewCount: 92000000,
        publishedAt: 'Acoustic Rock'
      },
      {
        source: 'youtube',
        id: 'H3l4wRLdG78',
        title: 'Firefly',
        artist: 'When Chai Met Toast',
        coverUrl: 'https://i.ytimg.com/vi/H3l4wRLdG78/hqdefault.jpg',
        duration: 218,
        viewCount: 45000000,
        publishedAt: 'Indie Folk'
      },
      {
        source: 'youtube',
        id: '5-M2jH98cEA',
        title: 'Sunsetz',
        artist: 'Cigarettes After Sex',
        coverUrl: 'https://i.ytimg.com/vi/5-M2jH98cEA/hqdefault.jpg',
        duration: 215,
        viewCount: 160000000,
        publishedAt: 'Dream Pop'
      },
      {
        source: 'youtube',
        id: 'sElE_BfQ67s',
        title: 'Apocalypse',
        artist: 'Cigarettes After Sex',
        coverUrl: 'https://i.ytimg.com/vi/sElE_BfQ67s/hqdefault.jpg',
        duration: 290,
        viewCount: 340000000,
        publishedAt: 'Ambient Cafe'
      },
      {
        source: 'youtube',
        id: 'yKNxeF4KMsY',
        title: 'Yellow',
        artist: 'Coldplay',
        coverUrl: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
        duration: 269,
        viewCount: 1100000000,
        publishedAt: 'Acoustic Classic'
      },
      {
        source: 'youtube',
        id: 'nSDgHBxUbVQ',
        title: 'Photograph',
        artist: 'Ed Sheeran',
        coverUrl: 'https://i.ytimg.com/vi/nSDgHBxUbVQ/hqdefault.jpg',
        duration: 258,
        viewCount: 1400000000,
        publishedAt: 'Warm Guitar'
      },
      {
        source: 'youtube',
        id: 'viimfQi_pUw',
        title: 'ocean eyes',
        artist: 'Billie Eilish',
        coverUrl: 'https://i.ytimg.com/vi/viimfQi_pUw/hqdefault.jpg',
        duration: 200,
        viewCount: 510000000,
        publishedAt: 'Soft Vocal'
      },
      {
        source: 'youtube',
        id: 'm7Bc3pLyij0',
        title: 'Udaarian',
        artist: 'Satinder Sartaaj',
        coverUrl: 'https://i.ytimg.com/vi/m7Bc3pLyij0/hqdefault.jpg',
        duration: 330,
        viewCount: 165000000,
        publishedAt: 'Poetic Soul'
      }
    ]
  }
];
