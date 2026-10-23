// Master Catalog of 100+ Top Real Artists & Metadata
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

export const ARTISTS_DATABASE: ArtistEntry[] = [
  {
    "id": "art-sidhu-moose-wala",
    "name": "Sidhu Moose Wala",
    "role": "Punjabi Rap Pioneer",
    "genre": "Punjabi Hip-Hop",
    "tags": [
      "punjabi",
      "rap",
      "hip-hop",
      "drill",
      "desi"
    ],
    "listeners": "6K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/fb1def876c43cc16738bfd6ad3d1dcd9/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/fb1def876c43cc16738bfd6ad3d1dcd9/1000x1000-000000-80-0-0.jpg",
    "bio": "Sidhu Moose Wala is a chart-topping Punjabi Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-ap-dhillon",
    "name": "AP Dhillon",
    "role": "Urban Punjabi Icon",
    "genre": "Urban Punjabi",
    "tags": [
      "punjabi",
      "hip-hop",
      "rap",
      "r&b",
      "desi"
    ],
    "listeners": "29K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/52594ac9fa763dc163ed13d21cb130ec/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/52594ac9fa763dc163ed13d21cb130ec/1000x1000-000000-80-0-0.jpg",
    "bio": "AP Dhillon is a chart-topping Urban Punjabi artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-karan-aujla",
    "name": "Karan Aujla",
    "role": "Geetan Di Machine",
    "genre": "Punjabi Hip-Hop",
    "tags": [
      "punjabi",
      "rap",
      "hip-hop",
      "drill",
      "desi"
    ],
    "listeners": "33K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/a91a1d5ea91e85e4f0966569b50e8d6a/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/a91a1d5ea91e85e4f0966569b50e8d6a/1000x1000-000000-80-0-0.jpg",
    "bio": "Karan Aujla is a chart-topping Punjabi Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-diljit-dosanjh",
    "name": "Diljit Dosanjh",
    "role": "Global Punjabi Superstar",
    "genre": "Punjabi Pop & Folk",
    "tags": [
      "punjabi",
      "pop",
      "folk",
      "bhangra",
      "desi"
    ],
    "listeners": "46K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/79b85e695e0ca6529e56bf3b628e92bd/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/79b85e695e0ca6529e56bf3b628e92bd/1000x1000-000000-80-0-0.jpg",
    "bio": "Diljit Dosanjh is a chart-topping Punjabi Pop & Folk artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-shubh",
    "name": "Shubh",
    "role": "Trap & Melodic Rap",
    "genre": "Punjabi Trap",
    "tags": [
      "punjabi",
      "rap",
      "hip-hop",
      "trap",
      "drill"
    ],
    "listeners": "16K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/66c1e15679704beb01c912eb6668de14/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/66c1e15679704beb01c912eb6668de14/1000x1000-000000-80-0-0.jpg",
    "bio": "Shubh is a chart-topping Punjabi Trap artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-gurinder-gill",
    "name": "Gurinder Gill",
    "role": "Urban Punjabi Vocalist",
    "genre": "Urban Punjabi",
    "tags": [
      "punjabi",
      "hip-hop",
      "rap",
      "r&b"
    ],
    "listeners": "10K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/740ac7d20d49a868be7be6f713a31e4a/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/740ac7d20d49a868be7be6f713a31e4a/1000x1000-000000-80-0-0.jpg",
    "bio": "Gurinder Gill is a chart-topping Urban Punjabi artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-prem-dhillon",
    "name": "Prem Dhillon",
    "role": "Desi Gangster Rap",
    "genre": "Punjabi Rap",
    "tags": [
      "punjabi",
      "rap",
      "hip-hop",
      "gangster"
    ],
    "listeners": "4K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/d84d91d148af32b183fc2e6bd582cf33/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/d84d91d148af32b183fc2e6bd582cf33/1000x1000-000000-80-0-0.jpg",
    "bio": "Prem Dhillon is a chart-topping Punjabi Rap artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-amrit-maan",
    "name": "Amrit Maan",
    "role": "Goniana Aala",
    "genre": "Punjabi Folk-Rap",
    "tags": [
      "punjabi",
      "rap",
      "desi",
      "folk"
    ],
    "listeners": "9K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/7f02204629aa27fcafe66ece9a70f3e3/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/7f02204629aa27fcafe66ece9a70f3e3/1000x1000-000000-80-0-0.jpg",
    "bio": "Amrit Maan is a chart-topping Punjabi Folk-Rap artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-arjan-dhillon",
    "name": "Arjan Dhillon",
    "role": "Lyrical Maestro",
    "genre": "Punjabi Folk & Melodic",
    "tags": [
      "punjabi",
      "folk",
      "lyrical",
      "desi"
    ],
    "listeners": "4K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/6c93b05371951bf101e918f8d7004e63/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/6c93b05371951bf101e918f8d7004e63/1000x1000-000000-80-0-0.jpg",
    "bio": "Arjan Dhillon is a chart-topping Punjabi Folk & Melodic artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-wazir-patar",
    "name": "Wazir Patar",
    "role": "Boom Bap Producer & Rapper",
    "genre": "Desi Boom Bap",
    "tags": [
      "punjabi",
      "rap",
      "boom-bap",
      "hip-hop"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/50454881320238696ce9abcc4c69dd14/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/50454881320238696ce9abcc4c69dd14/1000x1000-000000-80-0-0.jpg",
    "bio": "Wazir Patar is a chart-topping Desi Boom Bap artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-raf-saperra",
    "name": "Raf Saperra",
    "role": "UK Bhangra & Folk Revival",
    "genre": "UK Punjabi Folk",
    "tags": [
      "punjabi",
      "uk",
      "folk",
      "bhangra"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/a8c9713d56e85e0f77d48f0803a2b0bb/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/a8c9713d56e85e0f77d48f0803a2b0bb/1000x1000-000000-80-0-0.jpg",
    "bio": "Raf Saperra is a chart-topping UK Punjabi Folk artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-jerry",
    "name": "Jerry",
    "role": "Melodic Punjabi Rapper",
    "genre": "Punjabi Trap",
    "tags": [
      "punjabi",
      "rap",
      "hip-hop",
      "trap"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/8b324e02f25ec8597d6bd714c07c7c5f/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/8b324e02f25ec8597d6bd714c07c7c5f/1000x1000-000000-80-0-0.jpg",
    "bio": "Jerry is a chart-topping Punjabi Trap artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-amantej-hundal",
    "name": "Amantej Hundal",
    "role": "Gangster Drill & Trap",
    "genre": "Punjabi Drill",
    "tags": [
      "punjabi",
      "drill",
      "trap",
      "rap"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/11ae19cfb614dbf6d15ad06ccd6b8234/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/11ae19cfb614dbf6d15ad06ccd6b8234/1000x1000-000000-80-0-0.jpg",
    "bio": "Amantej Hundal is a chart-topping Punjabi Drill artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-hustinder",
    "name": "Hustinder",
    "role": "Rustic Storyteller",
    "genre": "Punjabi Folk",
    "tags": [
      "punjabi",
      "folk",
      "storytelling"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/81f8be225a55620afef9098b29d76ba8/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/81f8be225a55620afef9098b29d76ba8/1000x1000-000000-80-0-0.jpg",
    "bio": "Hustinder is a chart-topping Punjabi Folk artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-jassa-dhillon",
    "name": "Jassa Dhillon",
    "role": "Desi Trap & Club Anthemist",
    "genre": "Punjabi Club",
    "tags": [
      "punjabi",
      "club",
      "trap",
      "pop"
    ],
    "listeners": "4K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/b6df04d8d104d403725904c8ed48aafb/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/b6df04d8d104d403725904c8ed48aafb/1000x1000-000000-80-0-0.jpg",
    "bio": "Jassa Dhillon is a chart-topping Punjabi Club artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-jordan-sandhu",
    "name": "Jordan Sandhu",
    "role": "High-Pitch Bhangra Vocalist",
    "genre": "Punjabi Folk-Pop",
    "tags": [
      "punjabi",
      "bhangra",
      "folk"
    ],
    "listeners": "3K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/bf67ce63cb9c4c2b3d277e033ed9b5e0/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/bf67ce63cb9c4c2b3d277e033ed9b5e0/1000x1000-000000-80-0-0.jpg",
    "bio": "Jordan Sandhu is a chart-topping Punjabi Folk-Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-nimrat-khaira",
    "name": "Nimrat Khaira",
    "role": "Queen of Punjabi Melodies",
    "genre": "Punjabi Pop",
    "tags": [
      "punjabi",
      "pop",
      "female",
      "folk"
    ],
    "listeners": "2K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/a8e84fce42a9d82ca3a47369a34dba11/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/a8e84fce42a9d82ca3a47369a34dba11/1000x1000-000000-80-0-0.jpg",
    "bio": "Nimrat Khaira is a chart-topping Punjabi Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-sunanda-sharma",
    "name": "Sunanda Sharma",
    "role": "Energetic Desi Popstar",
    "genre": "Punjabi Pop",
    "tags": [
      "punjabi",
      "pop",
      "bhangra"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/3ea4e72e9355ce8ca3c0cf4abcb1e57b/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/3ea4e72e9355ce8ca3c0cf4abcb1e57b/1000x1000-000000-80-0-0.jpg",
    "bio": "Sunanda Sharma is a chart-topping Punjabi Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-b-praak",
    "name": "B Praak",
    "role": "Soulful High-Pitch Melodist",
    "genre": "Desi Soul & Pop",
    "tags": [
      "punjabi",
      "hindi",
      "soul",
      "sad"
    ],
    "listeners": "20K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/efe513aabaa0a94c4db307ac3431b833/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/efe513aabaa0a94c4db307ac3431b833/1000x1000-000000-80-0-0.jpg",
    "bio": "B Praak is a chart-topping Desi Soul & Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-jaani",
    "name": "Jaani",
    "role": "Master Lyricist & Composer",
    "genre": "Punjabi Poetry & Pop",
    "tags": [
      "punjabi",
      "composer",
      "poetry"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/935cc61602afc6c5fe70723ad811c788/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/935cc61602afc6c5fe70723ad811c788/1000x1000-000000-80-0-0.jpg",
    "bio": "Jaani is a chart-topping Punjabi Poetry & Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-mankirt-aulakh",
    "name": "Mankirt Aulakh",
    "role": "Punjabi Club King",
    "genre": "Punjabi Pop",
    "tags": [
      "punjabi",
      "club",
      "bhangra"
    ],
    "listeners": "6K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/2b67315c4d24eb9c205df1d2c5fe278c/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/2b67315c4d24eb9c205df1d2c5fe278c/1000x1000-000000-80-0-0.jpg",
    "bio": "Mankirt Aulakh is a chart-topping Punjabi Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-garry-sandhu",
    "name": "Garry Sandhu",
    "role": "Punjabi Melodic Legend",
    "genre": "Punjabi Romantic & Pop",
    "tags": [
      "punjabi",
      "romantic",
      "pop"
    ],
    "listeners": "17K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/ef569ddf3773c8e3f60600eda9cd90e9/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/ef569ddf3773c8e3f60600eda9cd90e9/1000x1000-000000-80-0-0.jpg",
    "bio": "Garry Sandhu is a chart-topping Punjabi Romantic & Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-hardy-sandhu",
    "name": "Hardy Sandhu",
    "role": "Pop & Dance Hitmaker",
    "genre": "Punjabi Dance",
    "tags": [
      "punjabi",
      "dance",
      "pop"
    ],
    "listeners": "1K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/002a4004ab1d5f9c8899a684163232ec/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/002a4004ab1d5f9c8899a684163232ec/1000x1000-000000-80-0-0.jpg",
    "bio": "Hardy Sandhu is a chart-topping Punjabi Dance artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-kulwinder-billa",
    "name": "Kulwinder Billa",
    "role": "Traditional Folk & Romantic",
    "genre": "Punjabi Folk",
    "tags": [
      "punjabi",
      "folk",
      "romantic"
    ],
    "listeners": "2K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/431de718d775fbc8517bda38716258d7/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/431de718d775fbc8517bda38716258d7/1000x1000-000000-80-0-0.jpg",
    "bio": "Kulwinder Billa is a chart-topping Punjabi Folk artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-tarsem-jassar",
    "name": "Tarsem Jassar",
    "role": "Turbanator & Royal Lyricist",
    "genre": "Punjabi Folk",
    "tags": [
      "punjabi",
      "folk",
      "lyrical"
    ],
    "listeners": "2K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/899d737cb6b13946845a5e4776e70869/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/899d737cb6b13946845a5e4776e70869/1000x1000-000000-80-0-0.jpg",
    "bio": "Tarsem Jassar is a chart-topping Punjabi Folk artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-arijit-singh",
    "name": "Arijit Singh",
    "role": "Voice of a Generation",
    "genre": "Bollywood Romantic",
    "tags": [
      "bollywood",
      "romantic",
      "soul",
      "hindi",
      "acoustic"
    ],
    "listeners": "233K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/ac5350cff290edd5b69fa584b8b1bd4f/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/ac5350cff290edd5b69fa584b8b1bd4f/1000x1000-000000-80-0-0.jpg",
    "bio": "Arijit Singh is a chart-topping Bollywood Romantic artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-shreya-ghoshal",
    "name": "Shreya Ghoshal",
    "role": "Melody Queen of India",
    "genre": "Indian Classical & Filmi",
    "tags": [
      "bollywood",
      "classical",
      "female",
      "hindi"
    ],
    "listeners": "256K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/3bb832d37d10ff2affcfa9afdc7c68a0/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/3bb832d37d10ff2affcfa9afdc7c68a0/1000x1000-000000-80-0-0.jpg",
    "bio": "Shreya Ghoshal is a chart-topping Indian Classical & Filmi artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-atif-aslam",
    "name": "Atif Aslam",
    "role": "Sufi & Rock Vocalist",
    "genre": "Sufi Rock & Bollywood",
    "tags": [
      "bollywood",
      "sufi",
      "rock",
      "romantic",
      "pakistani"
    ],
    "listeners": "221K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/0ea90444148fff9c11d77f06a344724e/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/0ea90444148fff9c11d77f06a344724e/1000x1000-000000-80-0-0.jpg",
    "bio": "Atif Aslam is a chart-topping Sufi Rock & Bollywood artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-kk",
    "name": "KK",
    "role": "Timeless Soul & Nostalgia",
    "genre": "Indian Pop-Rock",
    "tags": [
      "bollywood",
      "rock",
      "nostalgia",
      "hindi"
    ],
    "listeners": "26K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/e118eeb5332fe76610d4b355fdb61b03/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/e118eeb5332fe76610d4b355fdb61b03/1000x1000-000000-80-0-0.jpg",
    "bio": "KK is a chart-topping Indian Pop-Rock artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-pritam",
    "name": "Pritam",
    "role": "Hit Factory Composer",
    "genre": "Bollywood Pop-Rock",
    "tags": [
      "bollywood",
      "composer",
      "pop",
      "guitar"
    ],
    "listeners": "71K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/d4914ccd414067cd5e2c108867079a85/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/d4914ccd414067cd5e2c108867079a85/1000x1000-000000-80-0-0.jpg",
    "bio": "Pritam is a chart-topping Bollywood Pop-Rock artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-ar-rahman",
    "name": "AR Rahman",
    "role": "The Mozart of Madras",
    "genre": "World Music & Cinematic",
    "tags": [
      "soundtrack",
      "cinematic",
      "fusion",
      "world"
    ],
    "listeners": "284K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/bd34315ef977a62a9e28c1ab19bb8ac4/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/bd34315ef977a62a9e28c1ab19bb8ac4/1000x1000-000000-80-0-0.jpg",
    "bio": "AR Rahman is a chart-topping World Music & Cinematic artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-anuv-jain",
    "name": "Anuv Jain",
    "role": "Acoustic Indie Balladeer",
    "genre": "Indie Pop",
    "tags": [
      "indie",
      "acoustic",
      "ballad",
      "hindi",
      "guitar"
    ],
    "listeners": "4K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/eb0c0e91c8ad621b41178e0d66c81057/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/eb0c0e91c8ad621b41178e0d66c81057/1000x1000-000000-80-0-0.jpg",
    "bio": "Anuv Jain is a chart-topping Indie Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-prateek-kuhad",
    "name": "Prateek Kuhad",
    "role": "Intimate Indie Folk",
    "genre": "Indie Folk",
    "tags": [
      "indie",
      "folk",
      "acoustic",
      "chill"
    ],
    "listeners": "3K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/7f69b3905ae630b3f7bcd826bd2dc46f/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/7f69b3905ae630b3f7bcd826bd2dc46f/1000x1000-000000-80-0-0.jpg",
    "bio": "Prateek Kuhad is a chart-topping Indie Folk artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-jubin-nautiyal",
    "name": "Jubin Nautiyal",
    "role": "Heartfelt Ballad Specialist",
    "genre": "Bollywood Romantic",
    "tags": [
      "bollywood",
      "romantic",
      "hindi",
      "soul"
    ],
    "listeners": "22K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/9031b483049b5551abcb11529873b4f6/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/9031b483049b5551abcb11529873b4f6/1000x1000-000000-80-0-0.jpg",
    "bio": "Jubin Nautiyal is a chart-topping Bollywood Romantic artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-darshan-raval",
    "name": "Darshan Raval",
    "role": "Monsoon Romance & Pop",
    "genre": "Hindi Pop",
    "tags": [
      "pop",
      "romantic",
      "monsoon",
      "hindi"
    ],
    "listeners": "21K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/9428424029a929927b7081b70d3a0fc6/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/9428424029a929927b7081b70d3a0fc6/1000x1000-000000-80-0-0.jpg",
    "bio": "Darshan Raval is a chart-topping Hindi Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-neha-kakkar",
    "name": "Neha Kakkar",
    "role": "Party & Dance Anthem Queen",
    "genre": "Bollywood Dance",
    "tags": [
      "bollywood",
      "dance",
      "party",
      "pop"
    ],
    "listeners": "75K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/3a0f7ba65d6d8c1081b461ee49cb59e8/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/3a0f7ba65d6d8c1081b461ee49cb59e8/1000x1000-000000-80-0-0.jpg",
    "bio": "Neha Kakkar is a chart-topping Bollywood Dance artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-sonu-nigam",
    "name": "Sonu Nigam",
    "role": "Legendary Classical & Pop Maestro",
    "genre": "Indian Filmi & Classical",
    "tags": [
      "bollywood",
      "classical",
      "legend",
      "hindi"
    ],
    "listeners": "167K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/812220125c4f0db57050438b65afcf78/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/812220125c4f0db57050438b65afcf78/1000x1000-000000-80-0-0.jpg",
    "bio": "Sonu Nigam is a chart-topping Indian Filmi & Classical artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-sunidhi-chauhan",
    "name": "Sunidhi Chauhan",
    "role": "Versatile Powerhouse Diva",
    "genre": "Bollywood Pop-Rock",
    "tags": [
      "bollywood",
      "rock",
      "dance",
      "powerhouse"
    ],
    "listeners": "100K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/37dbd33ae8cf7075e247968acf4b48da/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/37dbd33ae8cf7075e247968acf4b48da/1000x1000-000000-80-0-0.jpg",
    "bio": "Sunidhi Chauhan is a chart-topping Bollywood Pop-Rock artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-mohit-chauhan",
    "name": "Mohit Chauhan",
    "role": "Soulful Mountain Folk-Rock",
    "genre": "Sufi & Folk Rock",
    "tags": [
      "bollywood",
      "rock",
      "folk",
      "acoustic"
    ],
    "listeners": "33K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/f9533880207ac5714b65e760e5686af8/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/f9533880207ac5714b65e760e5686af8/1000x1000-000000-80-0-0.jpg",
    "bio": "Mohit Chauhan is a chart-topping Sufi & Folk Rock artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-armaan-malik",
    "name": "Armaan Malik",
    "role": "Global Pop & Desi Ballads",
    "genre": "Contemporary Pop",
    "tags": [
      "pop",
      "bollywood",
      "r&b",
      "english"
    ],
    "listeners": "31K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/3aacd4e00a34aefb6041d30e0cc5bc5e/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/3aacd4e00a34aefb6041d30e0cc5bc5e/1000x1000-000000-80-0-0.jpg",
    "bio": "Armaan Malik is a chart-topping Contemporary Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-lucky-ali",
    "name": "Lucky Ali",
    "role": "Indie Pop Pioneer & Nomad",
    "genre": "Indie Pop",
    "tags": [
      "indie",
      "nostalgia",
      "acoustic",
      "90s"
    ],
    "listeners": "4K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/26bae46ac78a361f5df75e8994377ff0/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/26bae46ac78a361f5df75e8994377ff0/1000x1000-000000-80-0-0.jpg",
    "bio": "Lucky Ali is a chart-topping Indie Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-amit-trivedi",
    "name": "Amit Trivedi",
    "role": "Experimental Soundscapes",
    "genre": "Fusion & Bollywood",
    "tags": [
      "bollywood",
      "fusion",
      "experimental",
      "indie"
    ],
    "listeners": "6K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/b1c15791419c0f9c6ea4a55f80319d6a/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/b1c15791419c0f9c6ea4a55f80319d6a/1000x1000-000000-80-0-0.jpg",
    "bio": "Amit Trivedi is a chart-topping Fusion & Bollywood artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-vishal-mishra",
    "name": "Vishal Mishra",
    "role": "Emotional Soul & Anthems",
    "genre": "Bollywood Soul",
    "tags": [
      "bollywood",
      "soul",
      "acoustic",
      "hindi"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/6125247795ee1f0b64253a1e993e7b0e/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/6125247795ee1f0b64253a1e993e7b0e/1000x1000-000000-80-0-0.jpg",
    "bio": "Vishal Mishra is a chart-topping Bollywood Soul artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-sachin-jigar",
    "name": "Sachin-Jigar",
    "role": "Electro-Folk & Dance Composers",
    "genre": "Bollywood Electro-Folk",
    "tags": [
      "bollywood",
      "dance",
      "folk",
      "electronic"
    ],
    "listeners": "9K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/d812840574d5c6177ef5480a4ba24d59/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/d812840574d5c6177ef5480a4ba24d59/1000x1000-000000-80-0-0.jpg",
    "bio": "Sachin-Jigar is a chart-topping Bollywood Electro-Folk artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-shankar-ehsaan-loy",
    "name": "Shankar Ehsaan Loy",
    "role": "Rock & Fusion Maestros",
    "genre": "Bollywood Fusion-Rock",
    "tags": [
      "bollywood",
      "rock",
      "fusion",
      "trio"
    ],
    "listeners": "4K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/0bffc56f16ad55ffc7324a8b215123c5/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/0bffc56f16ad55ffc7324a8b215123c5/1000x1000-000000-80-0-0.jpg",
    "bio": "Shankar Ehsaan Loy is a chart-topping Bollywood Fusion-Rock artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-divine",
    "name": "DIVINE",
    "role": "Gully Rap Pioneer",
    "genre": "Desi Hip-Hop",
    "tags": [
      "gully",
      "rap",
      "hip-hop",
      "mumbai",
      "desi"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/500a263f7444ff211b379a36e9757a8e/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/500a263f7444ff211b379a36e9757a8e/1000x1000-000000-80-0-0.jpg",
    "bio": "DIVINE is a chart-topping Desi Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-naezy",
    "name": "Naezy",
    "role": "The Original Gully Boy",
    "genre": "Desi Hip-Hop",
    "tags": [
      "gully",
      "rap",
      "hip-hop",
      "mumbai"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/79d6cf66dd7cc41aae93e31ce104e28a/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/79d6cf66dd7cc41aae93e31ce104e28a/1000x1000-000000-80-0-0.jpg",
    "bio": "Naezy is a chart-topping Desi Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-mc-stan",
    "name": "MC Stan",
    "role": "Basti Ki Hasti & Trap Innovator",
    "genre": "Hindi Trap & Hip-Hop",
    "tags": [
      "trap",
      "hip-hop",
      "pune",
      "desi"
    ],
    "listeners": "1K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/5a6fc1cf6fa0f4edadeebfaace93f612/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/5a6fc1cf6fa0f4edadeebfaace93f612/1000x1000-000000-80-0-0.jpg",
    "bio": "MC Stan is a chart-topping Hindi Trap & Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-seedhe-maut",
    "name": "Seedhe Maut",
    "role": "Delhi Hardcore Rap Duo",
    "genre": "Alternative Hip-Hop",
    "tags": [
      "rap",
      "drill",
      "delhi",
      "hardcore",
      "duo"
    ],
    "listeners": "1K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/dbd4cd0d5c2e3f1000b742542d3d7a07/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/dbd4cd0d5c2e3f1000b742542d3d7a07/1000x1000-000000-80-0-0.jpg",
    "bio": "Seedhe Maut is a chart-topping Alternative Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-kr",
    "name": "KR",
    "role": "Lyrical Assassin & Technical Rap",
    "genre": "Hardcore Hip-Hop",
    "tags": [
      "rap",
      "technical",
      "bars",
      "drill",
      "desi"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/d7341d8327e33ad2cdd39c7f26262cd1/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/d7341d8327e33ad2cdd39c7f26262cd1/1000x1000-000000-80-0-0.jpg",
    "bio": "KR is a chart-topping Hardcore Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-raftaar",
    "name": "Raftaar",
    "role": "Rap General & Speed Maestro",
    "genre": "Desi Hip-Hop",
    "tags": [
      "rap",
      "commercial",
      "drill",
      "desi"
    ],
    "listeners": "16K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/29570d57452267a2a237c812e79fe8fe/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/29570d57452267a2a237c812e79fe8fe/1000x1000-000000-80-0-0.jpg",
    "bio": "Raftaar is a chart-topping Desi Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-badshah",
    "name": "Badshah",
    "role": "Commercial Pop-Rap King",
    "genre": "Commercial Desi Rap",
    "tags": [
      "pop",
      "rap",
      "club",
      "party",
      "commercial"
    ],
    "listeners": "77K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/5b90b89299a7d42f81d79afa263a85d2/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/5b90b89299a7d42f81d79afa263a85d2/1000x1000-000000-80-0-0.jpg",
    "bio": "Badshah is a chart-topping Commercial Desi Rap artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-yo-yo-honey-singh",
    "name": "Yo Yo Honey Singh",
    "role": "The Desi Hip-Hop Pioneer",
    "genre": "Desi Commercial Rap",
    "tags": [
      "rap",
      "pop",
      "legend",
      "club",
      "desi"
    ],
    "listeners": "112K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/7859b461c10352f02a11368905f0903f/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/7859b461c10352f02a11368905f0903f/1000x1000-000000-80-0-0.jpg",
    "bio": "Yo Yo Honey Singh is a chart-topping Desi Commercial Rap artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-ikka",
    "name": "Ikka",
    "role": "Versatile Underground & Commercial Rapper",
    "genre": "Desi Hip-Hop",
    "tags": [
      "rap",
      "bars",
      "commercial",
      "hip-hop"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/151d70de1bd55b85d27cd2da13b2aafd/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/151d70de1bd55b85d27cd2da13b2aafd/1000x1000-000000-80-0-0.jpg",
    "bio": "Ikka is a chart-topping Desi Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-king",
    "name": "King",
    "role": "New-Age Pop-Rap Phenomenon",
    "genre": "Pop-Rap & Melodic",
    "tags": [
      "pop",
      "rap",
      "romantic",
      "melodic"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/9a09fb99f86ade7048ec3d8fce8e93ec/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/9a09fb99f86ade7048ec3d8fce8e93ec/1000x1000-000000-80-0-0.jpg",
    "bio": "King is a chart-topping Pop-Rap & Melodic artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-emiway-bantai",
    "name": "Emiway Bantai",
    "role": "Independent Street Rap Machine",
    "genre": "Street Hip-Hop",
    "tags": [
      "rap",
      "mumbai",
      "independent",
      "desi"
    ],
    "listeners": "2K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/38649dcc44b30112c3e15f57bc600bc3/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/38649dcc44b30112c3e15f57bc600bc3/1000x1000-000000-80-0-0.jpg",
    "bio": "Emiway Bantai is a chart-topping Street Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-talha-anjum",
    "name": "Talha Anjum",
    "role": "Urdu Rap Pioneer & Storyteller",
    "genre": "Urdu Hip-Hop",
    "tags": [
      "urdu",
      "rap",
      "storytelling",
      "karachi",
      "hip-hop"
    ],
    "listeners": "8K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/380e0c7629f94b9c75b7745a8990073a/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/380e0c7629f94b9c75b7745a8990073a/1000x1000-000000-80-0-0.jpg",
    "bio": "Talha Anjum is a chart-topping Urdu Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-talhah-yunus",
    "name": "Talhah Yunus",
    "role": "Melodic Urdu Rap Virtuoso",
    "genre": "Urdu Hip-Hop",
    "tags": [
      "urdu",
      "rap",
      "melodic",
      "karachi"
    ],
    "listeners": "5K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/694f8ba09e5f44ece5552824788b66a9/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/694f8ba09e5f44ece5552824788b66a9/1000x1000-000000-80-0-0.jpg",
    "bio": "Talhah Yunus is a chart-topping Urdu Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-fukra-insaan",
    "name": "Fukra Insaan",
    "role": "Digital Creator & Rap Artist",
    "genre": "Desi Pop-Rap",
    "tags": [
      "pop",
      "rap",
      "youtube"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/326627e8f754048b0481a97f5e36d8bc/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/326627e8f754048b0481a97f5e36d8bc/1000x1000-000000-80-0-0.jpg",
    "bio": "Fukra Insaan is a chart-topping Desi Pop-Rap artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-fotty-seven",
    "name": "Fotty Seven",
    "role": "Raw Delhi Desi Rap",
    "genre": "Desi Hip-Hop",
    "tags": [
      "rap",
      "delhi",
      "desi"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/d79a9a7c2a99409019fe87637a7ac9eb/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/d79a9a7c2a99409019fe87637a7ac9eb/1000x1000-000000-80-0-0.jpg",
    "bio": "Fotty Seven is a chart-topping Desi Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-taylor-swift",
    "name": "Taylor Swift",
    "role": "Global Pop Titan & Songwriter",
    "genre": "Pop & Synth-Pop",
    "tags": [
      "pop",
      "country",
      "synth-pop",
      "global"
    ],
    "listeners": "12725K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/e528e270424103b527f8a27ac625563b/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/e528e270424103b527f8a27ac625563b/1000x1000-000000-80-0-0.jpg",
    "bio": "Taylor Swift is a chart-topping Pop & Synth-Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-the-weeknd",
    "name": "The Weeknd",
    "role": "Dark Synth-Wave & R&B King",
    "genre": "R&B & Synth-Pop",
    "tags": [
      "r&b",
      "synthwave",
      "pop",
      "dark"
    ],
    "listeners": "14688K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/581693b4724a7fcfa754455101e13a44/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/581693b4724a7fcfa754455101e13a44/1000x1000-000000-80-0-0.jpg",
    "bio": "The Weeknd is a chart-topping R&B & Synth-Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-drake",
    "name": "Drake",
    "role": "Global Hip-Hop & Melodic Trap Titan",
    "genre": "Hip-Hop & R&B",
    "tags": [
      "hip-hop",
      "rap",
      "r&b",
      "trap"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/1051e7fd110f9d3e5e88cdc69c5f227b/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/1051e7fd110f9d3e5e88cdc69c5f227b/1000x1000-000000-80-0-0.jpg",
    "bio": "Drake is a chart-topping Hip-Hop & R&B artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-billie-eilish",
    "name": "Billie Eilish",
    "role": "Alternative Pop Innovator",
    "genre": "Alternative Pop",
    "tags": [
      "alt-pop",
      "indie",
      "electronic",
      "moody"
    ],
    "listeners": "9253K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/8eab1a9a644889aabaca1e193e05f984/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/8eab1a9a644889aabaca1e193e05f984/1000x1000-000000-80-0-0.jpg",
    "bio": "Billie Eilish is a chart-topping Alternative Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-ed-sheeran",
    "name": "Ed Sheeran",
    "role": "Acoustic Pop Mastermind",
    "genre": "Acoustic Pop",
    "tags": [
      "pop",
      "acoustic",
      "guitar",
      "ballad"
    ],
    "listeners": "20913K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/d6bb84390641d8ae9118228d9544e53d/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/d6bb84390641d8ae9118228d9544e53d/1000x1000-000000-80-0-0.jpg",
    "bio": "Ed Sheeran is a chart-topping Acoustic Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-post-malone",
    "name": "Post Malone",
    "role": "Genre-Bending Trap-Rock Icon",
    "genre": "Pop-Rap & Alternative",
    "tags": [
      "trap",
      "rock",
      "pop",
      "guitar"
    ],
    "listeners": "4202K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/a5a8cca44e7eab2db7d44e039bed2574/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/a5a8cca44e7eab2db7d44e039bed2574/1000x1000-000000-80-0-0.jpg",
    "bio": "Post Malone is a chart-topping Pop-Rap & Alternative artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-dua-lipa",
    "name": "Dua Lipa",
    "role": "Future Nostalgia Disco-Pop Queen",
    "genre": "Nu-Disco & Pop",
    "tags": [
      "pop",
      "disco",
      "dance",
      "club"
    ],
    "listeners": "8780K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/877872aaf75694f11d53c318700ab2b5/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/877872aaf75694f11d53c318700ab2b5/1000x1000-000000-80-0-0.jpg",
    "bio": "Dua Lipa is a chart-topping Nu-Disco & Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-bruno-mars",
    "name": "Bruno Mars",
    "role": "Funk & Soul Virtuoso",
    "genre": "Funk & R&B",
    "tags": [
      "funk",
      "soul",
      "pop",
      "r&b"
    ],
    "listeners": "12786K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/90f0b5b11df4f87ee878f38569b5995b/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/90f0b5b11df4f87ee878f38569b5995b/1000x1000-000000-80-0-0.jpg",
    "bio": "Bruno Mars is a chart-topping Funk & R&B artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-eminem",
    "name": "Eminem",
    "role": "Rap God & Global Hip-Hop Legend",
    "genre": "Hardcore Hip-Hop",
    "tags": [
      "rap",
      "hip-hop",
      "legend",
      "bars"
    ],
    "listeners": "1K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/7fa738468c9a73ff98c1e1b78d622b81/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/7fa738468c9a73ff98c1e1b78d622b81/1000x1000-000000-80-0-0.jpg",
    "bio": "Eminem is a chart-topping Hardcore Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-kendrick-lamar",
    "name": "Kendrick Lamar",
    "role": "Pulitzer-Winning Hip-Hop Master",
    "genre": "Conscious Hip-Hop",
    "tags": [
      "hip-hop",
      "rap",
      "conscious",
      "jazz-rap"
    ],
    "listeners": "6171K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/be0a7c550567f4af0ed202d7235b74d6/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/be0a7c550567f4af0ed202d7235b74d6/1000x1000-000000-80-0-0.jpg",
    "bio": "Kendrick Lamar is a chart-topping Conscious Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-justin-bieber",
    "name": "Justin Bieber",
    "role": "Pop & Contemporary R&B Icon",
    "genre": "Pop & R&B",
    "tags": [
      "pop",
      "r&b",
      "acoustic"
    ],
    "listeners": "11154K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/fe097f693cebf1f882e3da79e99e3bf9/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/fe097f693cebf1f882e3da79e99e3bf9/1000x1000-000000-80-0-0.jpg",
    "bio": "Justin Bieber is a chart-topping Pop & R&B artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-ariana-grande",
    "name": "Ariana Grande",
    "role": "Four-Octave Pop Diva",
    "genre": "Pop & R&B",
    "tags": [
      "pop",
      "r&b",
      "vocals",
      "dance"
    ],
    "listeners": "13426K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/721d8fab84b315502de422b8d0901509/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/721d8fab84b315502de422b8d0901509/1000x1000-000000-80-0-0.jpg",
    "bio": "Ariana Grande is a chart-topping Pop & R&B artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-travis-scott",
    "name": "Travis Scott",
    "role": "Psychedelic Trap Visionary",
    "genre": "Psychedelic Hip-Hop",
    "tags": [
      "trap",
      "hip-hop",
      "psychedelic",
      "autotune"
    ],
    "listeners": "3140K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/8d8316146026d7e6ce377e314536df62/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/8d8316146026d7e6ce377e314536df62/1000x1000-000000-80-0-0.jpg",
    "bio": "Travis Scott is a chart-topping Psychedelic Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-kanye-west",
    "name": "Kanye West",
    "role": "Visionary Producer & Hip-Hop Icon",
    "genre": "Progressive Hip-Hop",
    "tags": [
      "hip-hop",
      "rap",
      "sampling",
      "art-pop"
    ],
    "listeners": "4545K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/bb76c2ee3b068726ab4c37b0aabdb57a/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/bb76c2ee3b068726ab4c37b0aabdb57a/1000x1000-000000-80-0-0.jpg",
    "bio": "Kanye West is a chart-topping Progressive Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-coldplay",
    "name": "Coldplay",
    "role": "Anthemic Stadium Alternative Rock",
    "genre": "Alternative Rock & Pop",
    "tags": [
      "rock",
      "alternative",
      "piano",
      "anthem"
    ],
    "listeners": "18389K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/3087954bca22f306324912e5ac8375c3/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/3087954bca22f306324912e5ac8375c3/1000x1000-000000-80-0-0.jpg",
    "bio": "Coldplay is a chart-topping Alternative Rock & Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-rihanna",
    "name": "Rihanna",
    "role": "Caribbean & Pop Empress",
    "genre": "Pop & Dancehall",
    "tags": [
      "pop",
      "r&b",
      "dancehall",
      "fashion"
    ],
    "listeners": "1K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/a7cbbe2e254f206c5ba9f5063270e3e4/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/a7cbbe2e254f206c5ba9f5063270e3e4/1000x1000-000000-80-0-0.jpg",
    "bio": "Rihanna is a chart-topping Pop & Dancehall artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-beyonc",
    "name": "Beyoncé",
    "role": "Queen of Modern Pop & Soul",
    "genre": "R&B & Pop",
    "tags": [
      "r&b",
      "pop",
      "dance",
      "empowerment"
    ],
    "listeners": "12835K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/0aa9d669be4e7310b8647afae37ffaab/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/0aa9d669be4e7310b8647afae37ffaab/1000x1000-000000-80-0-0.jpg",
    "bio": "Beyoncé is a chart-topping R&B & Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-adele",
    "name": "Adele",
    "role": "Soulful Ballad Powerhouse",
    "genre": "Soul & Pop",
    "tags": [
      "soul",
      "ballad",
      "piano",
      "vocal"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/5e22b1d2569cf1ea763b09ff3c978a50/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/5e22b1d2569cf1ea763b09ff3c978a50/1000x1000-000000-80-0-0.jpg",
    "bio": "Adele is a chart-topping Soul & Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-olivia-rodrigo",
    "name": "Olivia Rodrigo",
    "role": "Pop-Punk & Gen-Z Alt-Pop",
    "genre": "Alt-Pop & Pop-Punk",
    "tags": [
      "pop",
      "punk",
      "teen-pop",
      "rock"
    ],
    "listeners": "1824K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/2c9e480317183c037eaebcd7ba96daf4/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/2c9e480317183c037eaebcd7ba96daf4/1000x1000-000000-80-0-0.jpg",
    "bio": "Olivia Rodrigo is a chart-topping Alt-Pop & Pop-Punk artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-sza",
    "name": "SZA",
    "role": "Contemporary R&B & Neo-Soul Queen",
    "genre": "Neo-Soul & R&B",
    "tags": [
      "r&b",
      "soul",
      "neo-soul",
      "alt-r&b"
    ],
    "listeners": "1330K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/8ced041da2bed70d5715f0860956169b/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/8ced041da2bed70d5715f0860956169b/1000x1000-000000-80-0-0.jpg",
    "bio": "SZA is a chart-topping Neo-Soul & R&B artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-harry-styles",
    "name": "Harry Styles",
    "role": "Vintage Glam-Rock & Indie Pop",
    "genre": "Pop-Rock",
    "tags": [
      "pop",
      "rock",
      "glam",
      "indie"
    ],
    "listeners": "2195K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/1151dba9b3edc0633adf35b64c21713f/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/1151dba9b3edc0633adf35b64c21713f/1000x1000-000000-80-0-0.jpg",
    "bio": "Harry Styles is a chart-topping Pop-Rock artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-lady-gaga",
    "name": "Lady Gaga",
    "role": "Electropop & Avant-Garde Diva",
    "genre": "Electropop & Dance",
    "tags": [
      "pop",
      "dance",
      "electronic",
      "theatrical"
    ],
    "listeners": "9279K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/7565262f7661b0d762621a8d69ba6f49/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/7565262f7661b0d762621a8d69ba6f49/1000x1000-000000-80-0-0.jpg",
    "bio": "Lady Gaga is a chart-topping Electropop & Dance artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-imagine-dragons",
    "name": "Imagine Dragons",
    "role": "Stomp-Rock & Pop-Rock Giants",
    "genre": "Alternative Pop-Rock",
    "tags": [
      "rock",
      "arena-rock",
      "pop"
    ],
    "listeners": "9528K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/1ba025c23cae3dee14b51152990285fc/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/1ba025c23cae3dee14b51152990285fc/1000x1000-000000-80-0-0.jpg",
    "bio": "Imagine Dragons is a chart-topping Alternative Pop-Rock artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-maroon-5",
    "name": "Maroon 5",
    "role": "Funk-Pop & Radio Hitmakers",
    "genre": "Pop-Rock",
    "tags": [
      "pop",
      "rock",
      "funk",
      "radio"
    ],
    "listeners": "11412K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/bbb526b9666c7e31dee295bcabbbdd8e/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/bbb526b9666c7e31dee295bcabbbdd8e/1000x1000-000000-80-0-0.jpg",
    "bio": "Maroon 5 is a chart-topping Pop-Rock artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-chappell-roan",
    "name": "Chappell Roan",
    "role": "Camp-Pop & Synth Diva",
    "genre": "Synth-Pop",
    "tags": [
      "pop",
      "synth-pop",
      "indie"
    ],
    "listeners": "311K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/14ca3aea25950189f30efe0fa79ac4f9/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/14ca3aea25950189f30efe0fa79ac4f9/1000x1000-000000-80-0-0.jpg",
    "bio": "Chappell Roan is a chart-topping Synth-Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-sabrina-carpenter",
    "name": "Sabrina Carpenter",
    "role": "Effortless Espresso Pop",
    "genre": "Dance-Pop",
    "tags": [
      "pop",
      "dance",
      "r&b"
    ],
    "listeners": "1814K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/4a9cdc7737e2a0e59b4917b47884b859/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/4a9cdc7737e2a0e59b4917b47884b859/1000x1000-000000-80-0-0.jpg",
    "bio": "Sabrina Carpenter is a chart-topping Dance-Pop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-lofi-girl",
    "name": "Lofi Girl",
    "role": "Peaceful Study Beats",
    "genre": "Lofi Chillhop",
    "tags": [
      "lofi",
      "chill",
      "beats",
      "study",
      "relax"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/f5c07c0a901f819f11d8a69b8e8da119/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/f5c07c0a901f819f11d8a69b8e8da119/1000x1000-000000-80-0-0.jpg",
    "bio": "Lofi Girl is a chart-topping Lofi Chillhop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-chilledcow",
    "name": "ChilledCow",
    "role": "Nostalgic Lofi Hip-Hop",
    "genre": "Lofi Hip-Hop",
    "tags": [
      "lofi",
      "chillhop",
      "instrumental",
      "sleep"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/e351419a46bf91eeeb0dce113d16ec9c/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/e351419a46bf91eeeb0dce113d16ec9c/1000x1000-000000-80-0-0.jpg",
    "bio": "ChilledCow is a chart-topping Lofi Hip-Hop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-kavinsky",
    "name": "Kavinsky",
    "role": "Outrun Synthwave Pioneer",
    "genre": "Synthwave",
    "tags": [
      "synthwave",
      "electronic",
      "retrowave",
      "drive"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/3e080ec9d0825c855d38d08705c37bea/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/3e080ec9d0825c855d38d08705c37bea/1000x1000-000000-80-0-0.jpg",
    "bio": "Kavinsky is a chart-topping Synthwave artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-alan-walker",
    "name": "Alan Walker",
    "role": "Faded Melodic EDM King",
    "genre": "Melodic Electro House",
    "tags": [
      "edm",
      "dance",
      "electronic",
      "house"
    ],
    "listeners": "4054K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/79d384488d390e65a6c27a95c431627e/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/79d384488d390e65a6c27a95c431627e/1000x1000-000000-80-0-0.jpg",
    "bio": "Alan Walker is a chart-topping Melodic Electro House artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-marshmello",
    "name": "Marshmello",
    "role": "Joyful Future Bass & Trap",
    "genre": "Future Bass & Pop-EDM",
    "tags": [
      "edm",
      "future-bass",
      "pop",
      "dance"
    ],
    "listeners": "3109K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/7990773a89df9f06fc2b871ad1de00bf/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/7990773a89df9f06fc2b871ad1de00bf/1000x1000-000000-80-0-0.jpg",
    "bio": "Marshmello is a chart-topping Future Bass & Pop-EDM artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-dj-snake",
    "name": "DJ Snake",
    "role": "Trap & Global Moombahton",
    "genre": "Electronic Trap",
    "tags": [
      "edm",
      "trap",
      "moombahton",
      "french"
    ],
    "listeners": "1K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/2dd77560a5b23c506f288010275073fb/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/2dd77560a5b23c506f288010275073fb/1000x1000-000000-80-0-0.jpg",
    "bio": "DJ Snake is a chart-topping Electronic Trap artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-avicii",
    "name": "Avicii",
    "role": "Folk-House & Melodic EDM Legend",
    "genre": "Melodic House",
    "tags": [
      "edm",
      "house",
      "folk-house",
      "legend"
    ],
    "listeners": "8362K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/82e214b0cb39316f4a12a082fded54f6/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/82e214b0cb39316f4a12a082fded54f6/1000x1000-000000-80-0-0.jpg",
    "bio": "Avicii is a chart-topping Melodic House artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-david-guetta",
    "name": "David Guetta",
    "role": "The Godfather of Dance Pop",
    "genre": "Dance Pop & Electro",
    "tags": [
      "edm",
      "dance",
      "house",
      "commercial"
    ],
    "listeners": "20110K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/2d527fa03e106ed82a28f161694278d3/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/2d527fa03e106ed82a28f161694278d3/1000x1000-000000-80-0-0.jpg",
    "bio": "David Guetta is a chart-topping Dance Pop & Electro artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-calvin-harris",
    "name": "Calvin Harris",
    "role": "Summer Anthem & Funk Wav King",
    "genre": "Nu-Disco & Electro House",
    "tags": [
      "edm",
      "house",
      "disco",
      "dance"
    ],
    "listeners": "12323K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/a53031d02dc2f8a8eb15d117c015d5eb/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/a53031d02dc2f8a8eb15d117c015d5eb/1000x1000-000000-80-0-0.jpg",
    "bio": "Calvin Harris is a chart-topping Nu-Disco & Electro House artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-martin-garrix",
    "name": "Martin Garrix",
    "role": "Progressive House Maestro",
    "genre": "Progressive House",
    "tags": [
      "edm",
      "progressive",
      "festival"
    ],
    "listeners": "7593K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/4cab1c0cbe0edc1b3d2234873abc485e/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/4cab1c0cbe0edc1b3d2234873abc485e/1000x1000-000000-80-0-0.jpg",
    "bio": "Martin Garrix is a chart-topping Progressive House artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-kygo",
    "name": "Kygo",
    "role": "Tropical House Pioneer",
    "genre": "Tropical House",
    "tags": [
      "edm",
      "tropical",
      "piano",
      "chill"
    ],
    "listeners": "2393K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/c3e15399350755674d0462ddf51e0008/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/c3e15399350755674d0462ddf51e0008/1000x1000-000000-80-0-0.jpg",
    "bio": "Kygo is a chart-topping Tropical House artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-chainsmokers",
    "name": "Chainsmokers",
    "role": "Indie-Pop & Future Bass Duo",
    "genre": "Electropop",
    "tags": [
      "pop",
      "edm",
      "future-bass"
    ],
    "listeners": "5846K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/461231bf0a032d7b8b315e05d1b4bbd7/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/461231bf0a032d7b8b315e05d1b4bbd7/1000x1000-000000-80-0-0.jpg",
    "bio": "Chainsmokers is a chart-topping Electropop artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-daft-punk",
    "name": "Daft Punk",
    "role": "Electronic French Touch Legends",
    "genre": "French Touch & Disco",
    "tags": [
      "electronic",
      "disco",
      "house",
      "legend"
    ],
    "listeners": "5208K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/1000x1000-000000-80-0-0.jpg",
    "bio": "Daft Punk is a chart-topping French Touch & Disco artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  },
  {
    "id": "art-zedd",
    "name": "Zedd",
    "role": "Complex Electro-Pop Architect",
    "genre": "Electro House",
    "tags": [
      "edm",
      "electro",
      "pop",
      "complex"
    ],
    "listeners": "0K fans",
    "image": "https://cdn-images.dzcdn.net/images/artist/90ea90596186b65fcba4ae6a5b3353be/500x500-000000-80-0-0.jpg",
    "headerImage": "https://cdn-images.dzcdn.net/images/artist/90ea90596186b65fcba4ae6a5b3353be/1000x1000-000000-80-0-0.jpg",
    "bio": "Zedd is a chart-topping Electro House artist celebrated for iconic releases, dynamic vocal range, and widespread global streaming acclaim.",
    "verified": true
  }
];

// Helper functions
export function getArtistsByTaste(taste: string[] = [], page: number = 1, limit: number = 24) {
  const normalizedTaste = (Array.isArray(taste) ? taste : []).map(t => String(t).toLowerCase().trim()).filter(Boolean);
  let sorted = [...ARTISTS_DATABASE];

  if (normalizedTaste.length > 0) {
    sorted.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      let aScore = 0;
      let bScore = 0;
      for (const t of normalizedTaste) {
        if (aName.includes(t)) aScore += 10;
        if (bName.includes(t)) bScore += 10;
        if (a.tags.some(tag => tag.includes(t) || t.includes(tag))) aScore += 5;
        if (b.tags.some(tag => tag.includes(t) || t.includes(tag))) bScore += 5;
        if (a.genre.toLowerCase().includes(t)) aScore += 4;
        if (b.genre.toLowerCase().includes(t)) bScore += 4;
      }
      return bScore - aScore;
    });
  }

  const startIndex = (page - 1) * limit;
  const paginated = sorted.slice(startIndex, startIndex + limit);
  return {
    artists: paginated,
    total: sorted.length,
    hasMore: startIndex + limit < sorted.length
  };
}

export function isRealArtistName(name: string): boolean {
  if (!name || name.length < 2) return false;
  const clean = name.toLowerCase().trim();
  const blacklistedTerms = [
    "official video", "official audio", "lyric video", "slowed reverb",
    "lofi remix", "full song", "bass boosted", "audio track", "cover video",
    "hook step", "dance video", "teaser", "trailer", "status video",
    "8d audio", "clean audio", "visualizer", "instrumental beat"
  ];
  for (const term of blacklistedTerms) {
    if (clean.includes(term)) return false;
  }
  return true;
}

export function getArtistMeta(name: string): { bio: string; listeners: string; headerImage: string; avatar: string; verified: boolean } {
  const clean = name.toLowerCase().trim();
  const match = ARTISTS_DATABASE.find(a => 
    a.name.toLowerCase() === clean || 
    clean.includes(a.name.toLowerCase()) || 
    a.name.toLowerCase().includes(clean)
  );

  if (match) {
    return {
      bio: match.bio,
      listeners: match.listeners,
      headerImage: match.headerImage,
      avatar: match.image,
      verified: true
    };
  }

  return {
    bio: `${name} is an acclaimed musical artist celebrated for international streaming popularity, chart-topping catalog, and distinctive sonic style.`,
    listeners: `24.5M monthly listeners`,
    headerImage: "https://cdn-images.dzcdn.net/images/artist/ac5350cff290edd5b69fa584b8b1bd4f/1000x1000-000000-80-0-0.jpg",
    avatar: "https://cdn-images.dzcdn.net/images/artist/ac5350cff290edd5b69fa584b8b1bd4f/500x500-000000-80-0-0.jpg",
    verified: true
  };
}

export function parseCollabInfo(title: string, authorArtist: string, queriedArtist: string): {
  cleanTitle: string;
  isCollab: boolean;
  collabArtists: string[];
  displayArtist: string;
} {
  let isCollab = false;
  const foundArtists = new Set<string>();

  if (queriedArtist && isRealArtistName(queriedArtist)) {
    foundArtists.add(queriedArtist.trim());
  }

  if (authorArtist && isRealArtistName(authorArtist)) {
    const splitAuthors = authorArtist.split(/[,&xX]|feat\.|ft\.|with/i).map(s => s.trim()).filter(isRealArtistName);
    splitAuthors.forEach(a => foundArtists.add(a));
  }

  const titleCollabMatches = [
    /(?:feat\.|ft\.)\s*([^(\])\-]+)/i,
    /\bwith\s+([^(\])\-]+)/i,
    /\bx\s+([A-Z][a-zA-Z\s]+)/,
    /\s+&\s+([A-Z][a-zA-Z\s]+)/
  ];

  for (const regex of titleCollabMatches) {
    const match = title.match(regex);
    if (match && match[1]) {
      const parts = match[1].split(/[,&xX]|feat\.|ft\./i).map(s => s.trim()).filter(isRealArtistName);
      if (parts.length > 0) {
        isCollab = true;
        parts.forEach(p => foundArtists.add(p));
      }
    }
  }

  if (foundArtists.size > 1) {
    isCollab = true;
  }

  const collabArtists = Array.from(foundArtists);
  const displayArtist = authorArtist || queriedArtist;

  return {
    cleanTitle: title,
    isCollab,
    collabArtists,
    displayArtist
  };
}
