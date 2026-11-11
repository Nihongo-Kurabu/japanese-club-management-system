export interface TeamMember {
  name: string;
  japaneseName: string;
  roles: string[];
  bio: string;
  image: string;
  category: 'core' | 'senpai';
  tags: string[];

  profile?: {
    about: string;
    responsibilities?: string[];
    education?: string;
    achievements?: string[];

    projects?: {
      name: string;
      description: string;
      url?: string;
    }[];

    socials?: {
      github?: string;
      linkedin?: string;
      instagram?: string;
      portfolio?: string;
      email?: string;
    };
  };
}

export interface ClubEvent {
  id: string;
  title: string;
  japaneseTitle: string;
  category: 'Cultural' | 'Anime & Media' | 'Language' | 'Workshop';
  date: string;
  time: string;
  venue: string;
  image: string;
  description: string;
  highlights: string[];
  capacity: number;
  registeredCount: number;
  isPast?: boolean;
}

export interface CulturalTopic {
  id: string;
  title: string;
  japaneseTitle: string;
  subtitle: string;
  summary: string;
  fullStory: string;
  image: string;
  keyElements: Array<{ term: string; kana: string; meaning: string }>;
  tags: string[];
}

export interface GalleryPhoto {
  id: string;
  title: string;
  japaneseTitle: string;
  category: 'Festivals' | 'Workshops' | 'Anime & Arts' | 'Scenery';
  imageUrl: string;
  caption: string;
  photographer: string;
  date: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  japaneseTitle: string;
  category: 'Recruitment' | 'Workshop' | 'Notice' | 'Cultural';
  date: string;
  isPinned: boolean;
  summary: string;
  fullContent: string;
}

export interface FacultyAdvisor {
  name: string;
  japaneseName: string;
  role: string;
  department: string;
  image: string;
  education: string;
  credentials: string[];
  welcomeMessage: string;
  about: string;
  office: string;
  email: string;
  consultationHours: string;
  initiatives: Array<{ title: string; japaneseTitle: string; description: string }>;
}

export const FACULTY_ADVISOR: FacultyAdvisor = {
  name: 'Prof. Dr. ',
  japaneseName: '田中 治人 教授',
  role: 'Chief Faculty Advisor & Institutional Patron',
  department: 'Department of Computer Science & Cultural Informatics',
  image: '/src/assets/images/faculty_advisor.jpg',
  education: 'Ph.D. in Computational Linguistics & Systems, University of Tokyo (東京大学)',
  credentials: [
    'JLPT N1 Certified (Rank A — Native Competency)',
    'Former Monbukagakusho (MEXT) Research Scholar',
    'Chairperson, University Indo-Japan Academic Exchange Cell',
    'Senior Member, Japan Foundation Educator Network'
  ],
  welcomeMessage:
    'A university education extends far beyond algorithmic proofs and textbooks. When students engage with Japanese culture—its foundational ethos of harmony (和), the relentless pursuit of mastery (Kaizen), and quiet empathy (Omoiyari)—they cultivate global perspective, discipline, and creative vitality. As Faculty Advisor of Komorebi, I am dedicated to championing our students, opening avenues for JLPT certifications, research fellowships, and fostering an inclusive community where everyone thrives.',
  about:
    'Prof. Dr. has served as the academic advisor to the Komorebi Japanese Club since its inception. Having spent over eight years at the University of Tokyo and Keio University engaged in research on cross-lingual semantics and human-computer interaction, Dr. Tanaka actively bridges technical engineering rigor with humanistic cultural immersion. He oversees the institutional curriculum of our JLPT preparation cohorts, provides direct recommendation letters for MEXT scholarships, and ensures our university matsuri celebrations meet the highest standards of cultural authenticity and safety.',
  office: 'Academic Block 3, Faculty Suites — Room 408',
  email: 'haruto.tanaka@college.edu',
  consultationHours: 'Tuesdays & Thursdays, 3:30 PM – 5:30 PM (or by email appointment)',
  initiatives: [
    {
      title: 'Institutional JLPT Examination Center',
      japaneseTitle: '学内日本語能力試験の推進',
      description: 'Facilitating official campus mock tests, subsidized student exam registrations, and structured peer learning circles.'
    },
    {
      title: 'Tokyo Tech & MEXT Exchange Pathways',
      japaneseTitle: '国費留学生・研究連携プログラム',
      description: 'Mentoring engineering students for summer research internships at top Japanese laboratories and universities.'
    },
    {
      title: 'Cross-Cultural Heritage & Ethics',
      japaneseTitle: '日本伝統文化・倫理の探求',
      description: 'Upholding authentic Japanese cultural practices, shodo calligraphy masterclasses, and mutual respect (和) on campus.'
    }
  ]
};

export const LEADERSHIP_TEAM: TeamMember[] = [
  {
    name: 'Divyam',
    japaneseName: 'ディヴィヤム',
    roles: ['President (会長 - Kaichou)'],
    bio: 'Guiding the club’s strategic vision, institutional partnerships, and cultural exchanges. Passionate about Japanese history, philosophy, and community building.',
    image: '/images/Divyam.jpeg',
    category: 'core',
    tags: ['Vision', 'Leadership', 'Sengoku History'],

    profile: {
      about:
        'As President of the Japanese Club, Divyam guides the club’s overall vision, encourages member participation, and helps build a welcoming community around Japanese language and culture.',

      responsibilities: [
        'Lead the Japanese Club and its executive team.',
        'Define the club’s vision and annual objectives.',
        'Coordinate institutional partnerships.',
        'Represent the club during official activities.',
        'Encourage cultural exchange and member engagement.'
      ],

      socials: {
        github: 'https://github.com/DivyamKishor',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/in/divyam-kishor/',
        instagram: 'https://www.instagram.com/royale_divyam/',
        email: ''
      }
    }
  },

  {
    name: 'Ridhi',
    japaneseName: 'リディ',
    roles: ['Vice President (副会長 - Fuku-Kaichou)'],
    bio: 'Overseeing operations, cross-department initiatives, and member welfare. Dedicated to celebrating both traditional Japanese arts and contemporary pop culture.',
    image: '/images/Ridhi.jpeg',
    category: 'core',
    tags: ['Operations', 'Culture', 'Tea Ceremony'],

    profile: {
      about:
        'As Vice President, Ridhi supports club operations, coordinates activities across departments, and contributes to a positive and inclusive environment for members.',

      responsibilities: [
        'Support the President in club administration.',
        'Coordinate different club departments.',
        'Assist in planning club activities.',
        'Support member welfare and engagement.',
        'Help maintain smooth club operations.'
      ],

      socials: {
        github: 'https://github.com/Pranav-git2005',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/in/pranav-anand-898475338',
        instagram: 'https://www.instagram.com/_anand.pranav?exln=a3V4NzllcDB0NW5l&utm_source=ig_contact_invite',
        email: 'pranavanand350@gmail.com'
      }
    }
  },

  {
    name: 'Pranav',
    japaneseName: 'プラナヴ',
    roles: ['Technical Head & Web Architect (技術部長兼ウェブ責任者)'],
    bio: 'Architect of the official Japanese Club digital universe, interactive language tools, and tech-driven cultural showcases.',
    image: '/images/Pranav.jpeg',
    category: 'core',
    tags: ['Full Stack', 'Interactive Portals', 'Cyberpunk & Anime Aesthetic'],

    profile: {
      about:
        'Pranav leads the technical development of the official Japanese Club website and its digital experiences. His work focuses on creating interactive platforms that connect students with Japanese language, culture, events, and club activities.',

      responsibilities: [
        'Lead the technical development of the official website.',
        'Design and maintain the club’s digital platforms.',
        'Develop interactive learning experiences.',
        'Manage website architecture and frontend implementation.',
        'Coordinate technical requirements with other departments.'
      ],

      projects: [
        {
          name: 'Japanese Club Official Website',
          description:
            'Official digital platform for club information, events, leadership, cultural activities, and member engagement.'
        },
        {
          name: 'CodeMind Visualizer',
          description:
            'Interactive learning platform for visualizing Data Structures and Algorithms through step-by-step execution.',
          url: 'https://github.com/Pranav-git2005/CodeMind-Visualizer'
        }
      ],

      socials: {
        github: 'https://github.com/Pranav-git2005',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/in/pranav-anand-898475338',
        instagram: 'https://www.instagram.com/_anand.pranav?exln=a3V4NzllcDB0NW5l&utm_source=ig_contact_invite',
        email: 'pranavanand350@gmail.com'
      }
    }
  },

  {
    name: 'Divyanka',
    japaneseName: 'ディヴィヤンカ',
    roles: ['Secretary (書記 - Shoki)'],
    bio: 'Managing club records, communications, session schedules, and internal community administration with precision and dedication.',
    image: '/images/Divyanka1.jpeg',
    category: 'core',
    tags: ['Records', 'Liaison', 'Language Enthusiast'],

    profile: {
      about:
        'Divyanka manages the club’s administrative activities and communication, helping maintain organized records and coordination between members and the leadership team.',

      responsibilities: [
        'Maintain club records and documentation.',
        'Coordinate internal communications.',
        'Manage meeting notes and schedules.',
        'Assist with official announcements.',
        'Support administrative coordination.'
      ],

      socials: {
        github: 'https://share.google/FE0SdCDIFk6oSGipR',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/in/divyanka-sinha-9680a632b?utm_source=share_via&utm_content=profile&utm_medium=member_android',
        instagram: 'https://www.instagram.com/uniquelydivine_20?obrf=MXAxNWtsc3R3djdvdw==',
        email: 'divyanka20sinha@gmail.com'
      }
    }
  },

  {
    name: 'Rishika',
    japaneseName: 'リシカ',
    roles: ['Event Head (企画部長 - Kikaku Buchou)'],
    bio: 'Curating unforgettable experiences, cultural showcases, matsuri celebrations, and interactive Japanese workshops on campus.',
    image: '/images/Rishika.jpeg',
    category: 'core',
    tags: ['Festivals', 'Stage Craft', 'Origami'],

    profile: {
      about:
        'Rishika leads event planning and helps create engaging experiences through Japanese cultural festivals, workshops, performances, and interactive activities.',

      responsibilities: [
        'Plan and coordinate club events.',
        'Organize cultural festivals and workshops.',
        'Coordinate event schedules and activities.',
        'Work with volunteers and event teams.',
        'Support stage programs and cultural showcases.'
      ],

      socials: {
        github: 'https://github.com/latte-in',
        portfolio: '',
        linkedin: 'www.linkedin.com/in/rishika-singh-32b950430',
        instagram: 'https://www.instagram.com/not_serene_?srtk=eXFoa25qYXZ5aTk1',
        email: 'rishika.siingh11@gmail.com'
      }
    }
  },

  {
    name: 'Ankitha',
    japaneseName: 'アンキタ 先輩',
    roles: ['Club Senpai & Cultural Mentor (先輩・文化相談役)'],
    bio: 'Senior advisor guiding junior members in cultural nuances, Japanese academic opportunities, and building long-lasting club traditions.',
    image: '/images/Ankita1.jpeg',
    category: 'senpai',
    tags: ['Academic Advisor', 'JLPT Mentorship', 'Cultural Heritage'],

    profile: {
      about:
        'Hi! I’m Ankitha Pradhan, currently pursuing my 7th semester in the Electronics and Communication Engineering (ECE) department. I am the Student Placement Coordinator for Japanese placements at CMRIT and a JLPT N4 certified Japanese language learner. I enjoy exploring Japanese language and culture. I’m a huge anime fan, with Naruto being my all time favourite and I love listening to Japanese music.',

      responsibilities: [
        'As a Club Senpai, I help juniors and fellow club members with their Japanese learning journey. My responsibilities include:',
        'Providing guidance and tips for JLPT examinations.',
        'Sharing advice and resources for learning Japanese.',
        'Guiding students interested in Japanese placements.',
        'Helping students understand the Japanese placement process.',
        'Sharing my experiences and motivating beginners to explore the language.'
      ],

      socials: {
        github: 'https://github.com/Ankitha-03',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/in/ankitha-pradhan-4b9796254',
        instagram: '',
        email: 'ankitha03p@gmail.com'
      }
    }
  },

  {
    name: 'Sameer',
    japaneseName: 'サミール 先輩',
    roles: ['Club Senpai & Community Mentor (先輩・コミュニティ相談役)'],
    bio: 'Former leadership steward providing steadfast counsel on club growth, collaborative spirit (和), and creative exploration.',
    image: '/images/Sameer.jpeg',
    category: 'senpai',
    tags: ['Strategic Counsel', 'Alumni Network', 'Martial Arts & Bushido'],

    profile: {
      about:
        'Sameer contributes experience and guidance to the club community, encouraging collaboration, continuity, and creative exploration.',

      responsibilities: [
        'Guide junior members.',
        'Support club community development.',
        'Share experience with the current leadership.',
        'Encourage collaboration and participation.',
        'Help preserve club traditions.'
      ],

      socials: {}
    }
  },

  {
    name: 'Abrar',
    japaneseName: 'アブラル',
    roles: ['Anime Group Moderator (アニメ統括 - Anime Toukatsu)'],
    bio: 'Leading anime analysis, weekly watch sessions, manga discussions, and sound track appreciation nights. The club’s resident lore archivist.',
    image: '/images/Abrar.jpeg',
    category: 'core',
    tags: ['Manga', 'Sakuga Analysis', 'Community Discussions'],

    profile: {
      about:
        'Abrar manages the anime community and encourages members to explore Japanese animation, manga, storytelling, and related creative discussions.',

      responsibilities: [
        'Moderate anime community activities.',
        'Organize anime screening sessions.',
        'Coordinate manga discussions.',
        'Encourage anime and animation analysis.',
        'Maintain an inclusive anime community.'
      ],

      socials: {}
    }
  }
];

export const UPCOMING_EVENTS: ClubEvent[] = [
  {
    id: 'hanami-matsuri-2026',
    title: '',
    japaneseTitle: '',
    category: 'Cultural',
    date: 'Novemeber 18, 2026',
    time: '2:00 PM – 4:00 PM',
    venue: '',
    image: '',
    description: '',
    highlights: [],
    capacity: 500,
    registeredCount: 0
  },
];

export const PAST_EVENTS: ClubEvent[] = [
  {
    id: 'bunkasai-2025',
    title: 'Annual Bunkasai: Japanese Cultural Fair 2025',
    japaneseTitle: '文化祭 2025',
    category: 'Cultural',
    date: 'November 15, 2025',
    time: '11:00 AM – 7:00 PM',
    venue: 'University Student Union',
    image: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80',
    description: 'Our flagship annual festival welcoming over 800 students for authentic cultural exhibitions, Maid & Butler café, cosplay runway, and manga art gallery.',
    highlights: ['800+ attendees across 8 colleges', '24 cultural stalls', 'Cosplay contest with celebrity judges'],
    capacity: 800,
    registeredCount: 800,
    isPast: true
  },
  {
    id: 'ramen-making-workshop',
    title: 'Washoku Alchemy: Handmade Ramen & Gyoza',
    japaneseTitle: '和食体験・手打ちラーメン',
    category: 'Workshop',
    date: 'October 12, 2025',
    time: '3:00 PM – 6:30 PM',
    venue: 'Culinary Arts Lab',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    description: 'Hands-on culinary session preparing authentic slow-simmered dashi broth, tare, handmade noodles, and delicate pan-fried pork and vegetable gyoza.',
    highlights: ['Broth chemistry and umami balancing', 'Noodle stretching workshop', 'Communal feast'],
    capacity: 35,
    registeredCount: 35,
    isPast: true
  }
];

export const CULTURAL_TOPICS: CulturalTopic[] = [
  {
    id: 'festivals',
    title: 'Japanese Festivals (Matsuri)',
    japaneseTitle: '祭 — Matsuri',
    subtitle: 'The Soul of Japanese Celebration & Community Bond',
    summary: 'From ancient Shinto celebrations to lantern-lit summer nights, Matsuri brings communities together through vibrant Mikoshi shrines, food stalls (Yatai), and traditional Bon dances.',
    fullStory: 'Matsuri (祭り) are lively Japanese festivals steeped in centuries of folklore and Shinto traditions. Almost every neighborhood shrine hosts its own festival honoring local kami (deities). During summer festivals, participants wear lightweight cotton Yukata and wooden Geta sandals. Vibrant Yatai street food carts line the avenues offering Takoyaki, Yakisoba, and shaved ice, while the rhythm of Taiko drums accompanies the communal Bon Odori dancing under floating crimson paper lanterns.',
    image: '/images/Matsuri.jpeg',
    keyElements: [
      { term: '神輿 (Mikoshi)', kana: 'みこし', meaning: 'Portable Shinto shrine carried by teams during festival parades' },
      { term: '屋台 (Yatai)', kana: 'やたい', meaning: 'Traditional open-air street food stalls offering festival delicacies' },
      { term: '盆踊り (Bon Odori)', kana: 'ぼんおどり', meaning: 'Communal circle dance honoring ancestral spirits' },
      { term: '花火 (Hanabi)', kana: 'はなび', meaning: 'Elaborate Japanese fireworks displays, celebrated as "fire flowers"' }
    ],
    tags: ['Tradition', 'Celebration', 'Shinto', 'Summer']
  },
  {
    id: 'clothing',
    title: 'Traditional Clothing: Kimono & Yukata',
    japaneseTitle: '和服 — Wafuku',
    subtitle: 'Elegance, Seasonality & Craftsmanship in Fabric',
    summary: 'The world of traditional Japanese dress balances geometric precision, seasonal motifs, and centuries of textile mastery from silk Nishijin weave to indigo dye.',
    fullStory: 'Traditional Japanese clothing (和服 - Wafuku) represents a profound philosophical relationship with seasons and etiquette. While the Kimono (着物) is a formal silk garment with intricate Obi sashes reserved for ceremonies and coming-of-age days, the Yukata (浴衣) is a breathable cotton garment celebrated at summer festivals and hot-spring ryokan. The colors and motifs change by month—cherry blossoms in April, maple leaves in autumn, and cranes for longevity.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    keyElements: [
      { term: '着物 (Kimono)', kana: 'きもの', meaning: 'Traditional silk garment worn on formal cultural milestones' },
      { term: '浴衣 (Yukata)', kana: 'ゆかた', meaning: 'Lightweight breathable cotton kimono worn at summer festivals' },
      { term: '帯 (Obi)', kana: 'おび', meaning: 'Elaborately tied decorative belt securing the kimono' },
      { term: '袴 (Hakama)', kana: 'はかま', meaning: 'Traditional pleated trousers worn in martial arts and formal graduations' }
    ],
    tags: ['Elegance', 'Textiles', 'Etiquette', 'Craftsmanship']
  },
  {
    id: 'cuisine',
    title: 'Washoku: The UNESCO Cultural Heritage of Food',
    japaneseTitle: '和食 — Washoku',
    subtitle: 'Harmony, Umami & Seasonal Ingredients',
    summary: 'Japanese cuisine is an art form built on the principle of "Shun" (eating ingredients at their seasonal peak), balanced flavors, and visual harmony.',
    fullStory: 'Recognized as an Intangible Cultural Heritage by UNESCO, Washoku (和食) is rooted in respect for nature and sustainable preparation. At its heart lies the concept of Ichiju-sansai ("one soup, three dishes"), powered by Dashi broth brewed from Kombu kelp and Katsuobushi (bonito flakes) to achieve the fifth taste: Umami. From delicate Kaiseki multi-course banquets to steaming bowls of Ramen and hand-pressed Nigiri sushi, every dish honors color, texture, and presentation.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    keyElements: [
      { term: '旨味 (Umami)', kana: 'うまみ', meaning: 'The savory fifth taste discovered and named in Japan' },
      { term: '出汁 (Dashi)', kana: 'だし', meaning: 'The foundational soup stock brewed from kelp and bonito flakes' },
      { term: '茶道 (Chado)', kana: 'さどう', meaning: 'The Way of Tea; spiritual powdered green matcha ceremony' },
      { term: '懐石 (Kaiseki)', kana: 'かいせき', meaning: 'Traditional multi-course dinner demonstrating culinary mastery' }
    ],
    tags: ['UNESCO', 'Umami', 'Gastronomy', 'Matcha']
  },
  {
    id: 'architecture',
    title: 'Sacred Architecture: Torii Gates & Zen Temples',
    japaneseTitle: '日本建築 — Architecture',
    subtitle: 'Timber Joinery, Shinto Gateways & Zen Garden Landscapes',
    summary: 'Japanese architecture reflects harmony with natural elements, using interlocking timber without nails, vermilion Torii gates, Shoji screens, and meditative Karesansui rock gardens.',
    fullStory: 'Traditional Japanese architecture bridges the spiritual and the natural world. Torii (鳥居) gates stand as sacred thresholds marking the transition between the mundane realm and the sacred presence of Kami. In Buddhist temples, timber joinery (Kigumi) allows wooden temples like Horyu-ji to withstand centuries of earthquakes without iron nails. Zen gardens (枯山水 - Karesansui) use raked white gravel and mossy stones to evoke oceans and mountains for deep meditation.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    keyElements: [
      { term: '鳥居 (Torii)', kana: 'とりい', meaning: 'Sacred gateway marking the entrance to a Shinto sanctuary' },
      { term: '枯山水 (Karesansui)', kana: 'かれさんすい', meaning: 'Dry Japanese rock garden designed for contemplative meditation' },
      { term: '木組み (Kigumi)', kana: 'きぐみ', meaning: 'Ancient mortise-and-tenon wood joinery without nails' },
      { term: '障子 (Shoji)', kana: 'しょうじ', meaning: 'Translucent sliding paper screens diffusing soft natural light' }
    ],
    tags: ['Torii', 'Woodwork', 'Zen', 'Shinto']
  },
  {
    id: 'sakura',
    title: 'Sakura Season & Hanami Tradition',
    japaneseTitle: '桜と花見 — Cherry Blossoms',
    subtitle: 'Mono no Aware — The Transience & Beauty of Life',
    summary: 'Every spring, Japan is bathed in soft pink petals. Hanami (flower viewing) embodies "Mono no Aware"—a poignant aesthetic appreciation of life’s ephemeral beauty.',
    fullStory: 'Sakura (桜) blossoms last only one to two weeks before gently scattering in the spring breeze, a phenomenon celebrated as "Hanafubuki" (cherry blossom blizzard). For over a thousand years, people gather under flowering canopies for Hanami picnics, sharing bento boxes, sake, and conversation. The brief bloom serves as a philosophical reminder to treasure every fleeting moment in friendship and life.',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80',
    keyElements: [
      { term: '花見 (Hanami)', kana: 'はなみ', meaning: 'The custom of picnicking while viewing cherry blossoms' },
      { term: '花吹雪 (Hanafubuki)', kana: 'はなふぶき', meaning: 'A cherry blossom blizzard where petals shower through the air' },
      { term: '物の哀れ (Mono no aware)', kana: 'もののあわれ', meaning: 'Deep aesthetic empathy for the fleeting transience of things' },
      { term: '満開 (Mankai)', kana: 'まんかい', meaning: 'Full bloom peak of the cherry blossom trees' }
    ],
    tags: ['Sakura', 'Hanami', 'Philosophy', 'Spring']
  },
  {
    id: 'etiquette',
    title: 'Customs & Daily Etiquette',
    japaneseTitle: '礼儀作法 — Reigi Sahou',
    subtitle: 'Respect, Mindfulness & Harmonious Coexistence',
    summary: 'Japanese social etiquette is based on consideration for others (Omoiyari), bow angles (Ojigi), removing shoes at the Genkan, and dining gratitude.',
    fullStory: 'Daily life in Japan is guided by mutual consideration. Bowing (お辞儀 - Ojigi) serves as greeting, gratitude, and apology, with varying depths denoting degrees of respect (15° informal Eshaku to 45° formal Saikeirei). Entering a home requires leaving shoes facing backwards at the Genkan entryway. Before eating, one brings hands together and says "Itadakimasu" (humbly receiving life and effort), and closes with "Gochisousama deshita" to honor the cook.',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    keyElements: [
      { term: 'お辞儀 (Ojigi)', kana: 'おじぎ', meaning: 'The traditional Japanese bow denoting greeting, respect or apology' },
      { term: '玄関 (Genkan)', kana: 'げんかん', meaning: 'Traditional sunken entranceway where outdoor footwear is removed' },
      { term: 'いただきます', kana: 'いただきます', meaning: 'Gratitude expressed before partaking in a meal' },
      { term: '思いやり (Omoiyari)', kana: 'おもいやり', meaning: 'Proactive consideration and empathy for others in public spaces' }
    ],
    tags: ['Etiquette', 'Respect', 'Harmony', 'Culture']
  }
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'g1',
    title: 'Majestic Mount Fuji at Sunrise',
    japaneseTitle: '富士の夜明け',
    category: 'Scenery',
    imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80',
    caption: 'Mount Fuji rising over morning clouds, reflecting the quiet eternity of Japan’s most iconic sacred peak.',
    photographer: 'Club Archives',
    date: '2025'
  },
  {
    id: 'g2',
    title: 'Fushimi Inari Torii Pathway',
    japaneseTitle: '伏見稲荷の千本鳥居',
    category: 'Scenery',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Thousands of vermilion Torii gates winding through the sacred wooded mountains of Kyoto.',
    photographer: 'Cultural Media Team',
    date: '2025'
  },
  {
    id: 'g3',
    title: 'Spring Sakura Canopies in Bloom',
    japaneseTitle: '満開の桜並木',
    category: 'Festivals',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80',
    caption: 'Students gathering beneath cherry trees for our annual Hanami gathering and poetry exchange.',
    photographer: 'Divyam',
    date: '2025'
  },
  {
    id: 'g4',
    title: 'Traditional Calligraphy Brushwork',
    japaneseTitle: '伝統の書道',
    category: 'Workshops',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    caption: 'Student writing the Kanji for "Friendship" (絆 - Kizuna) during our Shodo weekend studio.',
    photographer: 'Rishika',
    date: '2025'
  },
  {
    id: 'g5',
    title: 'Anime Universe Showcase & Exhibition',
    japaneseTitle: 'アニメ原画展',
    category: 'Anime & Arts',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    caption: 'Displaying original fan artworks, character sketches, and frame animation studies at Bunkasai.',
    photographer: 'Abrar',
    date: '2025'
  },
  {
    id: 'g6',
    title: 'Tokyo Neon Twilight',
    japaneseTitle: '東京の夜景',
    category: 'Scenery',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    caption: 'The vibrant intersection of cutting-edge modern Tokyo lights and traditional alleys.',
    photographer: 'Pranav',
    date: '2025'
  },
  {
    id: 'g7',
    title: 'Artisan Ramen Preparation',
    japaneseTitle: '職人のラーメン',
    category: 'Workshops',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    caption: 'Club members perfecting homemade dashi broth and springy handmade noodles.',
    photographer: 'Ridhi',
    date: '2025'
  },
  {
    id: 'g8',
    title: 'Yukata Celebration Ceremony',
    japaneseTitle: '浴衣の集い',
    category: 'Festivals',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    caption: 'Club officers and members dressed in traditional Yukata welcoming freshmen to the society.',
    photographer: 'Divyanka',
    date: '2025'
  }
];

export const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-01',
    title: 'We are excited to announce that the Japanese Club will be holding an event on November 18, 2026. Further details regarding the time and location will be shared shortly. We look forward to seeing you there!',
    japaneseTitle: '',
    category: 'Notice',
    date: 'November 18, 2026',
    isPinned: true,
    summary: 'The Komorebi Japanese Club is thrilled to announce an upcoming event on November 18, 2026. Stay tuned for more details regarding the time and location. We can’t wait to welcome you!',
    fullContent: 'We are excited to announce that the Komorebi Japanese Club will be hosting a special event on November 18, 2026! This event promises to be an engaging and culturally enriching experience for all attendees. While we are still finalizing the details regarding the time and location, we wanted to share this exciting news with our community. Please stay tuned for further updates, and mark your calendars! We look forward to seeing you there and celebrating Japanese culture together.'
  },
];

export const CLUB_FAQS = [
  {
    question: 'Do I need to know any Japanese before joining the club?',
    answer: 'Absolutely not! More than half of our new members start with zero prior knowledge. We host beginner-friendly language bootcamps covering Hiragana, Katakana, and everyday conversational phrases.'
  },
  {
    question: 'What kind of activities does the club host during the semester?',
    answer: 'We host traditional cultural festivals (Matsuri, Hanami), hands-on workshops (Calligraphy, Origami, Cooking), anime analytical screenings, JLPT study circles, Japanese gaming tournaments, and guest speaker sessions.'
  },
  {
    question: 'How do I become an official member and get a membership card?',
    answer: 'Simply fill out the form in the "Join the Club" section on this website. Once submitted, you immediately receive a personalized digital membership card with your unique club ID and Japanese Hanko seal.'
  },
  {
    question: 'Are events free for college students?',
    answer: 'Yes! All regular club gatherings, language classes, and cultural exhibitions are completely free for verified college students.'
  }
];
