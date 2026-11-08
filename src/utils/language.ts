export interface KanaCharacter {
  kana: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  group: string; // e.g., 'vowels', 'k-line', 's-line'
  exampleWord?: string;
  exampleRomaji?: string;
  exampleMeaning?: string;
}

export interface KanjiItem {
  kanji: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  strokes: number;
  level: string;
  examples: Array<{
    word: string;
    reading: string;
    meaning: string;
  }>;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  japanese: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// 46 Basic Hiragana
export const HIRAGANA_CHARACTERS: KanaCharacter[] = [
  { kana: 'あ', romaji: 'a', type: 'hiragana', group: 'vowels', exampleWord: 'あさ (asa)', exampleMeaning: 'Morning' },
  { kana: 'い', romaji: 'i', type: 'hiragana', group: 'vowels', exampleWord: 'いぬ (inu)', exampleMeaning: 'Dog' },
  { kana: 'う', romaji: 'u', type: 'hiragana', group: 'vowels', exampleWord: 'うみ (umi)', exampleMeaning: 'Sea / Ocean' },
  { kana: 'え', romaji: 'e', type: 'hiragana', group: 'vowels', exampleWord: 'えき (eki)', exampleMeaning: 'Train Station' },
  { kana: 'お', romaji: 'o', type: 'hiragana', group: 'vowels', exampleWord: 'お茶 (ocha)', exampleMeaning: 'Tea' },

  { kana: 'か', romaji: 'ka', type: 'hiragana', group: 'k-line', exampleWord: 'かさ (kasa)', exampleMeaning: 'Umbrella' },
  { kana: 'き', romaji: 'ki', type: 'hiragana', group: 'k-line', exampleWord: 'き (ki)', exampleMeaning: 'Tree' },
  { kana: 'く', romaji: 'ku', type: 'hiragana', group: 'k-line', exampleWord: 'くるま (kuruma)', exampleMeaning: 'Car' },
  { kana: 'け', romaji: 'ke', type: 'hiragana', group: 'k-line', exampleWord: 'けさ (kesa)', exampleMeaning: 'This morning' },
  { kana: 'こ', romaji: 'ko', type: 'hiragana', group: 'k-line', exampleWord: 'こころ (kokoro)', exampleMeaning: 'Heart / Mind' },

  { kana: 'さ', romaji: 'sa', type: 'hiragana', group: 's-line', exampleWord: 'さくら (sakura)', exampleMeaning: 'Cherry blossom' },
  { kana: 'し', romaji: 'shi', type: 'hiragana', group: 's-line', exampleWord: 'しろ (shiro)', exampleMeaning: 'White / Castle' },
  { kana: 'す', romaji: 'su', type: 'hiragana', group: 's-line', exampleWord: 'すし (sushi)', exampleMeaning: 'Sushi' },
  { kana: 'せ', romaji: 'se', type: 'hiragana', group: 's-line', exampleWord: 'せんせい (sensei)', exampleMeaning: 'Teacher' },
  { kana: 'そ', romaji: 'so', type: 'hiragana', group: 's-line', exampleWord: 'そら (sora)', exampleMeaning: 'Sky' },

  { kana: 'た', romaji: 'ta', type: 'hiragana', group: 't-line', exampleWord: 'たいよう (taiyou)', exampleMeaning: 'Sun' },
  { kana: 'ち', romaji: 'chi', type: 'hiragana', group: 't-line', exampleWord: 'ちず (chizu)', exampleMeaning: 'Map' },
  { kana: 'つ', romaji: 'tsu', type: 'hiragana', group: 't-line', exampleWord: 'つき (tsuki)', exampleMeaning: 'Moon' },
  { kana: 'て', romaji: 'te', type: 'hiragana', group: 't-line', exampleWord: 'て (te)', exampleMeaning: 'Hand' },
  { kana: 'と', romaji: 'to', type: 'hiragana', group: 't-line', exampleWord: 'ともだち (tomodachi)', exampleMeaning: 'Friend' },

  { kana: 'な', romaji: 'na', type: 'hiragana', group: 'n-line', exampleWord: 'なつ (natsu)', exampleMeaning: 'Summer' },
  { kana: 'に', romaji: 'ni', type: 'hiragana', group: 'n-line', exampleWord: 'にほん (nihon)', exampleMeaning: 'Japan' },
  { kana: 'ぬ', romaji: 'nu', type: 'hiragana', group: 'n-line', exampleWord: 'ぬいぐるみ (nuigurumi)', exampleMeaning: 'Stuffed toy' },
  { kana: 'ね', romaji: 'ne', type: 'hiragana', group: 'n-line', exampleWord: 'ねこ (neko)', exampleMeaning: 'Cat' },
  { kana: 'の', romaji: 'no', type: 'hiragana', group: 'n-line', exampleWord: 'のり (nori)', exampleMeaning: 'Seaweed' },

  { kana: 'は', romaji: 'ha', type: 'hiragana', group: 'h-line', exampleWord: 'はな (hana)', exampleMeaning: 'Flower / Nose' },
  { kana: 'ひ', romaji: 'hi', type: 'hiragana', group: 'h-line', exampleWord: 'ひと (hito)', exampleMeaning: 'Person' },
  { kana: 'ふ', romaji: 'fu', type: 'hiragana', group: 'h-line', exampleWord: 'ふじさん (fujisan)', exampleMeaning: 'Mt. Fuji' },
  { kana: 'へ', romaji: 'he', type: 'hiragana', group: 'h-line', exampleWord: 'へや (heya)', exampleMeaning: 'Room' },
  { kana: 'ほ', romaji: 'ho', type: 'hiragana', group: 'h-line', exampleWord: 'ほし (hoshi)', exampleMeaning: 'Star' },

  { kana: 'ま', romaji: 'ma', type: 'hiragana', group: 'm-line', exampleWord: 'まち (machi)', exampleMeaning: 'Town' },
  { kana: 'み', romaji: 'mi', type: 'hiragana', group: 'm-line', exampleWord: 'みず (mizu)', exampleMeaning: 'Water' },
  { kana: 'む', romaji: 'mu', type: 'hiragana', group: 'm-line', exampleWord: 'むし (mushi)', exampleMeaning: 'Insect' },
  { kana: 'め', romaji: 'me', type: 'hiragana', group: 'm-line', exampleWord: 'め (me)', exampleMeaning: 'Eye' },
  { kana: 'も', romaji: 'mo', type: 'hiragana', group: 'm-line', exampleWord: 'もり (mori)', exampleMeaning: 'Forest' },

  { kana: 'や', romaji: 'ya', type: 'hiragana', group: 'y-line', exampleWord: 'やま (yama)', exampleMeaning: 'Mountain' },
  { kana: 'ゆ', romaji: 'yu', type: 'hiragana', group: 'y-line', exampleWord: 'ゆき (yuki)', exampleMeaning: 'Snow' },
  { kana: 'よ', romaji: 'yo', type: 'hiragana', group: 'y-line', exampleWord: 'よる (yoru)', exampleMeaning: 'Night' },

  { kana: 'ら', romaji: 'ra', type: 'hiragana', group: 'r-line', exampleWord: 'らいおん (raion)', exampleMeaning: 'Lion' },
  { kana: 'り', romaji: 'ri', type: 'hiragana', group: 'r-line', exampleWord: 'りんご (ringo)', exampleMeaning: 'Apple' },
  { kana: 'る', romaji: 'ru', type: 'hiragana', group: 'r-line', exampleWord: 'るす (rusu)', exampleMeaning: 'Absence' },
  { kana: 'れ', romaji: 're', type: 'hiragana', group: 'r-line', exampleWord: '歴史 (rekishi)', exampleMeaning: 'History' },
  { kana: 'ろ', romaji: 'ro', type: 'hiragana', group: 'r-line', exampleWord: 'ろうそく (rousoku)', exampleMeaning: 'Candle' },

  { kana: 'わ', romaji: 'wa', type: 'hiragana', group: 'w-line', exampleWord: 'わたし (watashi)', exampleMeaning: 'I / Me' },
  { kana: 'を', romaji: 'wo', type: 'hiragana', group: 'w-line', exampleWord: '〜を (particle)', exampleMeaning: 'Direct object marker' },
  { kana: 'ん', romaji: 'n', type: 'hiragana', group: 'n-special', exampleWord: 'にほん (nihon)', exampleMeaning: 'Japan' },
];

// 46 Katakana
export const KATAKANA_CHARACTERS: KanaCharacter[] = [
  { kana: 'ア', romaji: 'a', type: 'katakana', group: 'vowels', exampleWord: 'アイス (aisu)', exampleMeaning: 'Ice cream' },
  { kana: 'イ', romaji: 'i', type: 'katakana', group: 'vowels', exampleWord: 'インターネット (intaanetto)', exampleMeaning: 'Internet' },
  { kana: 'ウ', romaji: 'u', type: 'katakana', group: 'vowels', exampleWord: 'ウェブ (webu)', exampleMeaning: 'Web' },
  { kana: 'エ', romaji: 'e', type: 'katakana', group: 'vowels', exampleWord: 'エアコン (eakon)', exampleMeaning: 'Air conditioner' },
  { kana: 'オ', romaji: 'o', type: 'katakana', group: 'vowels', exampleWord: 'オレンジ (orenji)', exampleMeaning: 'Orange' },

  { kana: 'カ', romaji: 'ka', type: 'katakana', group: 'k-line', exampleWord: 'カメラ (kamera)', exampleMeaning: 'Camera' },
  { kana: 'キ', romaji: 'ki', type: 'katakana', group: 'k-line', exampleWord: 'キーボード (kiiboudo)', exampleMeaning: 'Keyboard' },
  { kana: 'ク', romaji: 'ku', type: 'katakana', group: 'k-line', exampleWord: 'クラブ (kurabu)', exampleMeaning: 'Club' },
  { kana: 'ケ', romaji: 'ke', type: 'katakana', group: 'k-line', exampleWord: 'ケーキ (keeki)', exampleMeaning: 'Cake' },
  { kana: 'コ', romaji: 'ko', type: 'katakana', group: 'k-line', exampleWord: 'コーヒー (koohii)', exampleMeaning: 'Coffee' },

  { kana: 'サ', romaji: 'sa', type: 'katakana', group: 's-line', exampleWord: 'サンダル (sandaru)', exampleMeaning: 'Sandal' },
  { kana: 'シ', romaji: 'shi', type: 'katakana', group: 's-line', exampleWord: 'シャツ (shatsu)', exampleMeaning: 'Shirt' },
  { kana: 'ス', romaji: 'su', type: 'katakana', group: 's-line', exampleWord: 'スポーツ (supootsu)', exampleMeaning: 'Sports' },
  { kana: 'セ', romaji: 'se', type: 'katakana', group: 's-line', exampleWord: 'センパイ (senpai)', exampleMeaning: 'Senior mentor' },
  { kana: 'ソ', romaji: 'so', type: 'katakana', group: 's-line', exampleWord: 'ソーダ (sooda)', exampleMeaning: 'Soda' },

  { kana: 'タ', romaji: 'ta', type: 'katakana', group: 't-line', exampleWord: 'タクシー (takushii)', exampleMeaning: 'Taxi' },
  { kana: 'チ', romaji: 'chi', type: 'katakana', group: 't-line', exampleWord: 'チーム (chiimu)', exampleMeaning: 'Team' },
  { kana: 'ツ', romaji: 'tsu', type: 'katakana', group: 't-line', exampleWord: 'ツアー (tsuaa)', exampleMeaning: 'Tour' },
  { kana: 'テ', romaji: 'te', type: 'katakana', group: 't-line', exampleWord: 'テレビ (terebi)', exampleMeaning: 'Television' },
  { kana: 'ト', romaji: 'to', type: 'katakana', group: 't-line', exampleWord: 'トマト (tomato)', exampleMeaning: 'Tomato' },

  { kana: 'ナ', romaji: 'na', type: 'katakana', group: 'n-line', exampleWord: 'ナイフ (naifu)', exampleMeaning: 'Knife' },
  { kana: 'ニ', romaji: 'ni', type: 'katakana', group: 'n-line', exampleWord: 'ニュース (nyuusu)', exampleMeaning: 'News' },
  { kana: 'ヌ', romaji: 'nu', type: 'katakana', group: 'n-line', exampleWord: 'ヌードル (nuudoru)', exampleMeaning: 'Noodles' },
  { kana: 'ネ', romaji: 'ne', type: 'katakana', group: 'n-line', exampleWord: 'ネクタイ (nekutai)', exampleMeaning: 'Necktie' },
  { kana: 'ノ', romaji: 'no', type: 'katakana', group: 'n-line', exampleWord: 'ノート (nooto)', exampleMeaning: 'Notebook' },

  { kana: 'ハ', romaji: 'ha', type: 'katakana', group: 'h-line', exampleWord: 'ハンバーガー (hanbaagaa)', exampleMeaning: 'Burger' },
  { kana: 'ヒ', romaji: 'hi', type: 'katakana', group: 'h-line', exampleWord: 'ヒーロー (hiiroo)', exampleMeaning: 'Hero' },
  { kana: 'フ', romaji: 'fu', type: 'katakana', group: 'h-line', exampleWord: 'フィルム (firumu)', exampleMeaning: 'Film' },
  { kana: 'ヘ', romaji: 'he', type: 'katakana', group: 'h-line', exampleWord: 'ヘルメット (herumetto)', exampleMeaning: 'Helmet' },
  { kana: 'ホ', romaji: 'ho', type: 'katakana', group: 'h-line', exampleWord: 'ホテル (hoteru)', exampleMeaning: 'Hotel' },

  { kana: 'マ', romaji: 'ma', type: 'katakana', group: 'm-line', exampleWord: 'マンガ (manga)', exampleMeaning: 'Manga' },
  { kana: 'ミ', romaji: 'mi', type: 'katakana', group: 'm-line', exampleWord: 'ミルク (miruku)', exampleMeaning: 'Milk' },
  { kana: 'ム', romaji: 'mu', type: 'katakana', group: 'm-line', exampleWord: 'ムービー (muubii)', exampleMeaning: 'Movie' },
  { kana: 'メ', romaji: 'me', type: 'katakana', group: 'm-line', exampleWord: 'メール (meeru)', exampleMeaning: 'Email' },
  { kana: 'モ', romaji: 'mo', type: 'katakana', group: 'm-line', exampleWord: 'モデル (moderu)', exampleMeaning: 'Model' },

  { kana: 'ヤ', romaji: 'ya', type: 'katakana', group: 'y-line', exampleWord: 'ヤシ (yashi)', exampleMeaning: 'Palm tree' },
  { kana: 'ユ', romaji: 'yu', type: 'katakana', group: 'y-line', exampleWord: 'ユーザー (yuuzaa)', exampleMeaning: 'User' },
  { kana: 'ヨ', romaji: 'yo', type: 'katakana', group: 'y-line', exampleWord: 'ヨーグルト (yooguruto)', exampleMeaning: 'Yogurt' },

  { kana: 'ラ', romaji: 'ra', type: 'katakana', group: 'r-line', exampleWord: 'ラジオ (rajio)', exampleMeaning: 'Radio' },
  { kana: 'リ', romaji: 'ri', type: 'katakana', group: 'r-line', exampleWord: 'リーダー (riidaa)', exampleMeaning: 'Leader' },
  { kana: 'ル', romaji: 'ru', type: 'katakana', group: 'r-line', exampleWord: 'ルール (ruuru)', exampleMeaning: 'Rule' },
  { kana: 'レ', romaji: 're', type: 'katakana', group: 'r-line', exampleWord: 'レストラン (resutoran)', exampleMeaning: 'Restaurant' },
  { kana: 'ロ', romaji: 'ro', type: 'katakana', group: 'r-line', exampleWord: 'ロボット (robotto)', exampleMeaning: 'Robot' },

  { kana: 'ワ', romaji: 'wa', type: 'katakana', group: 'w-line', exampleWord: 'ワイン (wain)', exampleMeaning: 'Wine' },
  { kana: 'ヲ', romaji: 'wo', type: 'katakana', group: 'w-line', exampleWord: 'ヲタク (wotaku)', exampleMeaning: 'Otaku / Geek' },
  { kana: 'ン', romaji: 'n', type: 'katakana', group: 'n-special', exampleWord: 'アニメーション (animeeshon)', exampleMeaning: 'Animation' },
];

// Essential Kanji (N5)
export const KANJI_ESSENTIALS: KanjiItem[] = [
  {
    kanji: '日',
    meaning: 'Sun / Day / Japan',
    onyomi: 'NICHI, JITSU',
    kunyomi: 'hi, -ka',
    strokes: 4,
    level: 'N5',
    examples: [
      { word: '日本 (nihon)', reading: 'にほん', meaning: 'Japan' },
      { word: '今日 (kyou)', reading: 'きょう', meaning: 'Today' },
      { word: '日曜日 (nichiyoubi)', reading: 'にちようび', meaning: 'Sunday' }
    ]
  },
  {
    kanji: '本',
    meaning: 'Book / Origin / Real',
    onyomi: 'HON',
    kunyomi: 'moto',
    strokes: 5,
    level: 'N5',
    examples: [
      { word: '日本語 (nihongo)', reading: 'にほんご', meaning: 'Japanese language' },
      { word: '本 (hon)', reading: 'ほん', meaning: 'Book' }
    ]
  },
  {
    kanji: '文',
    meaning: 'Sentence / Literature / Culture',
    onyomi: 'BUN, MON',
    kunyomi: 'fumi',
    strokes: 4,
    level: 'N5',
    examples: [
      { word: '文化 (bunka)', reading: 'ぶんか', meaning: 'Culture' },
      { word: '文学 (bungaku)', reading: 'ぶんがく', meaning: 'Literature' }
    ]
  },
  {
    kanji: '化',
    meaning: 'Change / Transform / Influence',
    onyomi: 'KA, KE',
    kunyomi: 'ba(keru)',
    strokes: 4,
    level: 'N5',
    examples: [
      { word: '文化 (bunka)', reading: 'ぶんか', meaning: 'Culture' },
      { word: '化学 (kagaku)', reading: 'かがく', meaning: 'Chemistry' }
    ]
  },
  {
    kanji: '友',
    meaning: 'Friend / Companion',
    onyomi: 'YUU',
    kunyomi: 'tomo',
    strokes: 4,
    level: 'N5',
    examples: [
      { word: '友達 (tomodachi)', reading: 'ともだち', meaning: 'Friend' },
      { word: '友人 (yuujin)', reading: 'ゆうじん', meaning: 'Close friend' }
    ]
  },
  {
    kanji: '学',
    meaning: 'Study / Learn / Science',
    onyomi: 'GAKU',
    kunyomi: 'mana(bu)',
    strokes: 8,
    level: 'N5',
    examples: [
      { word: '学生 (gakusei)', reading: 'がくせい', meaning: 'Student' },
      { word: '学校 (gakkou)', reading: 'がっこう', meaning: 'School' },
      { word: '大学 (daigaku)', reading: 'だいがく', meaning: 'University' }
    ]
  },
  {
    kanji: '山',
    meaning: 'Mountain',
    onyomi: 'SAN, ZAN',
    kunyomi: 'yama',
    strokes: 3,
    level: 'N5',
    examples: [
      { word: '富士山 (fujisan)', reading: 'ふじさん', meaning: 'Mt. Fuji' },
      { word: '山 (yama)', reading: 'やま', meaning: 'Mountain' }
    ]
  },
  {
    kanji: '道',
    meaning: 'Way / Path / Road / Moral',
    onyomi: 'DOU, TOU',
    kunyomi: 'michi',
    strokes: 12,
    level: 'N5',
    examples: [
      { word: '武士道 (bushidou)', reading: 'ぶしどう', meaning: 'Way of the Samurai' },
      { word: '茶道 (sadou)', reading: 'さどう', meaning: 'Tea ceremony' }
    ]
  }
];

export const ESSENTIAL_PHRASES = [
  { japanese: 'こんにちは', romaji: 'Konnichiwa', english: 'Hello / Good afternoon', usage: 'Daytime greeting' },
  { japanese: 'ありがとうございます', romaji: 'Arigatou gozaimasu', english: 'Thank you very much', usage: 'Polite gratitude' },
  { japanese: 'すみません', romaji: 'Sumimasen', english: 'Excuse me / I am sorry', usage: 'Apology or calling attention' },
  { japanese: 'はじめまして', romaji: 'Hajimemashite', english: 'Nice to meet you', usage: 'First-time meeting intro' },
  { japanese: 'よろしくおねがいします', romaji: 'Yoroshiku onegaishimasu', english: 'Please treat me favorably', usage: 'Polite closing after meeting' },
  { japanese: 'いただきます', romaji: 'Itadakimasu', english: 'Humbly receiving this food', usage: 'Said before eating' },
  { japanese: 'ごちそうさまでした', romaji: 'Gochisousama deshita', english: 'Thank you for the delicious meal', usage: 'Said after eating' },
  { japanese: 'いってきます', romaji: 'Ittekimasu', english: 'I am leaving (and will return)', usage: 'Leaving home/office' },
  { japanese: 'ただいま', romaji: 'Tadaima', english: 'I am home / I am back', usage: 'Returning home' },
  { japanese: 'おやすみなさい', romaji: 'Oyasuminasai', english: 'Good night', usage: 'Before sleeping' }
];

export const JAPANESE_NUMBERS = [
  { kanji: '一', kana: 'いち', romaji: 'ichi', number: 1 },
  { kanji: '二', kana: 'に', romaji: 'ni', number: 2 },
  { kanji: '三', kana: 'さん', romaji: 'san', number: 3 },
  { kanji: '四', kana: 'よん / し', romaji: 'yon / shi', number: 4 },
  { kanji: '五', kana: 'ご', romaji: 'go', number: 5 },
  { kanji: '六', kana: 'ろく', romaji: 'roku', number: 6 },
  { kanji: '七', kana: 'なな / しち', romaji: 'nana / shichi', number: 7 },
  { kanji: '八', kana: 'はち', romaji: 'hachi', number: 8 },
  { kanji: '九', kana: 'きゅう / く', romaji: 'kyuu / ku', number: 9 },
  { kanji: '十', kana: 'じゅう', romaji: 'juu', number: 10 },
  { kanji: '百', kana: 'ひゃく', romaji: 'hyaku', number: 100 },
  { kanji: '千', kana: 'せん', romaji: 'sen', number: 1000 },
  { kanji: '万', kana: 'まん', romaji: 'man', number: 10000 }
];

export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'What is the romaji reading of the hiragana character "あ"?',
    japanese: 'あ',
    options: ['a', 'o', 'ka', 'u'],
    correctAnswer: 'a',
    explanation: '"あ" is the first vowel of the Japanese syllabary, pronounced like the "a" in "father".'
  },
  {
    id: 'q2',
    prompt: 'Which hiragana character represents "sa"?',
    japanese: 'さ',
    options: ['き', 'さ', 'ち', 'ろ'],
    correctAnswer: 'さ',
    explanation: '"さ" represents "sa". Notice the open loop compared to "ち" (chi).'
  },
  {
    id: 'q3',
    prompt: 'What does "ありがとうございます" mean?',
    japanese: 'ありがとうございます',
    options: ['Good morning', 'Thank you very much', 'Excuse me', 'Goodbye'],
    correctAnswer: 'Thank you very much',
    explanation: '"Arigatou gozaimasu" is the standard polite phrase for expressing gratitude.'
  },
  {
    id: 'q4',
    prompt: 'Which kanji means "Mountain"?',
    japanese: '山',
    options: ['日', '本', '山', '学'],
    correctAnswer: '山',
    explanation: '"山" (yama / san) is a pictograph of three mountain peaks.'
  },
  {
    id: 'q5',
    prompt: 'What is the katakana for the loanword "Camera"?',
    japanese: 'カメラ',
    options: ['カメラ (kamera)', 'ラジオ (rajio)', 'ケーキ (keeki)', 'テレビ (terebi)'],
    correctAnswer: 'カメラ (kamera)',
    explanation: '"カメラ" (ka-me-ra) is written in katakana because it is a foreign loanword.'
  }
];

export function findKanaByRomaji(romaji: string): KanaCharacter | undefined {
  const clean = romaji.trim().toLowerCase();
  return (
    HIRAGANA_CHARACTERS.find((k) => k.romaji === clean) ||
    KATAKANA_CHARACTERS.find((k) => k.romaji === clean)
  );
}

export function searchKanji(query: string): KanjiItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return KANJI_ESSENTIALS;
  return KANJI_ESSENTIALS.filter(
    (item) =>
      item.kanji.includes(q) ||
      item.meaning.toLowerCase().includes(q) ||
      item.onyomi.toLowerCase().includes(q) ||
      item.kunyomi.toLowerCase().includes(q)
  );
}

export function calculateQuizScore(answers: Record<string, string>, questions: QuizQuestion[]): {
  correctCount: number;
  total: number;
  percentage: number;
} {
  let correctCount = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  }
  const total = questions.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  return { correctCount, total, percentage };
}
