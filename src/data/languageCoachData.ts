export interface LanguageCoachLesson {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  synthLang: string;
  recogLang: string;
  listening: {
    passage: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  reading: {
    passage: string;
    translation: string;
    vocab: { word: string; meaning: string }[];
  };
  writing: {
    prompt: string;
    guidance: string;
  };
  grammar: {
    title: string;
    rule: string;
    sentence: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  vocabulary: {
    word: string;
    trans: string;
    phonetic: string;
  }[];
  pronunciation: {
    phrase: string;
    phoneticGuide: string;
    cleanExpected: string;
  };
}

export const LANGUAGE_COACH_DATA: Record<string, LanguageCoachLesson> = {
  English: {
    id: 'English',
    name: 'English',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    synthLang: 'en-US',
    recogLang: 'en-US',
    listening: {
      passage: "Sarah arrives at the learning library every morning at eight o'clock to prepare for her upcoming biology exams. She finds a peaceful desk near the tall windows and reviews her study notes before her classes begin.",
      question: "Why does Sarah visit the learning library every morning?",
      options: [
        "To prepare for her upcoming biology exams",
        "To return borrowed novels to the librarian",
        "To have breakfast with her study group",
        "To attend a science workshop with her teacher"
      ],
      correctIndex: 0,
      explanation: "Sarah visits the learning library at 8:00 AM specifically to prepare for her upcoming biology exams."
    },
    reading: {
      passage: "The Apollo 11 mission was humanity's first successful lunar landing in July 1969. Astronaut Neil Armstrong set foot upon the moon and declared: 'That's one small step for man, one giant leap for mankind.' This historic achievement demonstrated the extraordinary power of scientific curiosity, engineering precision, and international collaboration.",
      translation: "La misión Apolo 11 fue el primer alunizaje lunar exitoso de la humanidad en julio de 1969. El astronauta Neil Armstrong pisó la luna y declaró: 'Un pequeño paso para el hombre, un gran salto para la humanidad.' Este logro histórico demostró el poder extraordinario de la curiosidad científica, la precisión ingenieril y la colaboración internacional.",
      vocab: [
        { word: "curiosity", meaning: "eager desire to learn or know" },
        { word: "achievement", meaning: "a thing done successfully through effort" },
        { word: "precision", meaning: "exactness and meticulous accuracy" },
        { word: "collaboration", meaning: "working jointly with others toward a common goal" }
      ]
    },
    writing: {
      prompt: "Describe your favorite hobby or subject and explain why you find it engaging (write at least 2 complete English sentences).",
      guidance: "Use expressive adjectives such as 'fascinating', 'rewarding', or 'challenging'."
    },
    grammar: {
      title: "English Present Perfect Tense",
      rule: "Use the Present Perfect (have/has + past participle) when an action began in the past and continues into the present, or has immediate relevance to now.",
      sentence: "Emily _____ (study) environmental science for three years, and she still enjoys every single course.",
      options: ["studied", "studies", "has studied", "is studying"],
      correctIndex: 2,
      explanation: "Because Emily's period of study began in the past and continues into the present, 'has studied' is the correct present perfect form."
    },
    vocabulary: [
      { word: "Perseverance", trans: "Persistence in doing something despite difficulty", phonetic: "[pur-suh-veer-uhns]" },
      { word: "Perspective", trans: "A particular way of viewing or considering things", phonetic: "[per-spek-tiv]" },
      { word: "Eloquent", trans: "Fluent or persuasive in speaking and writing", phonetic: "[el-uh-kwuhnt]" },
      { word: "Resilience", trans: "The capacity to recover quickly from challenges", phonetic: "[ri-zil-yuhns]" }
    ],
    pronunciation: {
      phrase: "Consistent practice and clear articulation build lasting conversational confidence.",
      phoneticGuide: "Focus on articulating 'consistent practice' and the vowel sounds in 'conversational confidence'.",
      cleanExpected: "consistent practice and clear articulation build lasting conversational confidence"
    }
  },

  Spanish: {
    id: 'Spanish',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    synthLang: 'es-ES',
    recogLang: 'es-ES',
    listening: {
      passage: "María va a la panadería por la mañana para comprar pan recién horneado y cruasanes deliciosos para compartir con su familia durante el desayuno.",
      question: "¿Qué compra María en la panadería por la mañana?",
      options: [
        "Pan recién horneado y cruasanes",
        "Manzanas y naranjas frescas",
        "Pescado fresco del mercado",
        "Café con leche y revistas"
      ],
      correctIndex: 0,
      explanation: "María va a la panadería para comprar pan recién horneado y cruasanes deliciosos."
    },
    reading: {
      passage: "El Camino de Santiago es una famosa ruta de peregrinación en el norte de España. Miles de personas de todo el mundo caminan este sendero histórico cada año en busca de reflexión, cultura y naturaleza impresionante.",
      translation: "The Camino de Santiago is a famous pilgrimage route in northern Spain. Thousands of people from all over the world walk this historic trail every year seeking reflection, culture, and breathtaking nature.",
      vocab: [
        { word: "peregrinación", meaning: "pilgrimage / spiritual journey" },
        { word: "sendero", meaning: "trail / historic pathway" },
        { word: "impresionante", meaning: "breathtaking / impressive" },
        { word: "reflexión", meaning: "reflection / introspection" }
      ]
    },
    writing: {
      prompt: "Describe tu comida favorita y por qué te gusta tanto (escribe al menos 2 oraciones en español).",
      guidance: "Usa conectores como 'porque', 'además' y adjetivos descriptivos de sabor."
    },
    grammar: {
      title: "Verbos Regulares en Presente (-ar)",
      rule: "Los verbos regulares terminados en -ar conjugados con 'Yo' adoptan la terminación '-o' en presente de indicativo.",
      sentence: "Yo _____ (hablar) español con mi tutor todas las semanas para mejorar mi fluidez.",
      options: ["hablas", "hablan", "hablo", "hablamos"],
      correctIndex: 2,
      explanation: "Para la primera persona del singular ('Yo'), la conjugación del presente es 'hablo'."
    },
    vocabulary: [
      { word: "La playa", trans: "The beach", phonetic: "[lah plah-yah]" },
      { word: "El amanecer", trans: "The sunrise", phonetic: "[el ah-mah-neh-sehr]" },
      { word: "La mariposa", trans: "The butterfly", phonetic: "[lah mah-ree-poh-sah]" },
      { word: "El conocimiento", trans: "Knowledge", phonetic: "[el koh-noh-see-myehn-toh]" }
    ],
    pronunciation: {
      phrase: "Me gustaría aprender español para viajar por diferentes países y descubrir sus culturas.",
      phoneticGuide: "Presta atención a la 'r' suave en 'aprender' y la 'll' suave en 'viajar'.",
      cleanExpected: "me gustaria aprender espanol para viajar por diferentes paises y descubrir sus culturas"
    }
  },

  French: {
    id: 'French',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    synthLang: 'fr-FR',
    recogLang: 'fr-FR',
    listening: {
      passage: "Chaque matin, Pierre boit un café chaud sur son balcon tout en lisant les actualités littéraires avant d'aller à son atelier d'art.",
      question: "Où Pierre prend-il son café chaque matin ?",
      options: [
        "Dans la cuisine",
        "Sur son balcon",
        "Dans sa voiture",
        "Au bureau central"
      ],
      correctIndex: 1,
      explanation: "Pierre boit son café chaque matin sur son balcon."
    },
    reading: {
      passage: "La Tour Eiffel, haute de trois cents mètres, est le symbole le plus célèbre de la ville de Paris. Conçue par Gustave Eiffel en 1889, elle continue d'accueillir des millions de visiteurs passionnés d'architecture.",
      translation: "The Eiffel Tower, three hundred meters high, is the most famous symbol of the city of Paris. Designed by Gustave Eiffel in 1889, it continues to welcome millions of visitors passionate about architecture.",
      vocab: [
        { word: "haute", meaning: "high / tall" },
        { word: "symbole", meaning: "symbol / emblem" },
        { word: "accueillir", meaning: "to welcome / receive" },
        { word: "conçue", meaning: "designed / conceived" }
      ]
    },
    writing: {
      prompt: "Décris ta nourriture préférée et pourquoi tu l'aimes tant (écris au moins 2 phrases en français).",
      guidance: "Utilise des adjectifs comme 'délicieux', 'savoureux' ou 'traditionnel'."
    },
    grammar: {
      title: "L'auxiliaire Avoir au Présent",
      rule: "La possession et la plupart des temps composés utilisent le verbe 'avoir'. Avec 'nous', la forme est 'avons'.",
      sentence: "Nous _____ (avoir) beaucoup de chance d'apprendre ensemble avec Ini.",
      options: ["avez", "avons", "ont", "suis"],
      correctIndex: 1,
      explanation: "La conjugaison du verbe 'avoir' à la 1ère personne du pluriel (nous) est 'avons'."
    },
    vocabulary: [
      { word: "Le soleil", trans: "The sun", phonetic: "[luh soh-ley]" },
      { word: "Le papillon", trans: "The butterfly", phonetic: "[luh pah-pee-yohn]" },
      { word: "La bibliothèque", trans: "The library", phonetic: "[lah bee-blee-oh-tehk]" },
      { word: "L'étoile", trans: "The star", phonetic: "[lay-twahl]" }
    ],
    pronunciation: {
      phrase: "S'il vous plaît, où se trouve la station de train la plus proche ?",
      phoneticGuide: "Faites attention à la liaison dans 'vous plaît' et la clarté de 'gare'.",
      cleanExpected: "s il vous plait ou se trouve la station de train la plus proche"
    }
  },

  German: {
    id: 'German',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    synthLang: 'de-DE',
    recogLang: 'de-DE',
    listening: {
      passage: "Lukas geht jeden Nachmittag in den Stadtpark, um mit seinem Hund spazieren zu gehen und frische Luft nach der Vorlesung zu genießen.",
      question: "Wohin geht Lukas jeden Nachmittag?",
      options: [
        "In den Stadtpark",
        "In die Universitätsbibliothek",
        "Ins städtische Schwimmbad",
        "In den Supermarkt"
      ],
      correctIndex: 0,
      explanation: "Lukas geht jeden Nachmittag in den Stadtpark, um mit seinem Hund spazieren zu gehen."
    },
    reading: {
      passage: "Das Brandenburger Tor in Berlin ist ein weltbekanntes Denkmal und ein starkes Symbol für die deutsche Einheit und den europäischen Frieden. Viele Reisende bewundern die klassische Architektur.",
      translation: "The Brandenburg Gate in Berlin is a world-famous monument and a strong symbol of German unity and European peace. Many travelers admire its classical architecture.",
      vocab: [
        { word: "Denkmal", meaning: "monument / memorial" },
        { word: "Einheit", meaning: "unity / union" },
        { word: "Frieden", meaning: "peace" },
        { word: "bewundern", meaning: "to admire" }
      ]
    },
    writing: {
      prompt: "Beschreibe deinen typischen Tagesablauf (schreibe mindestens 2 Sätze auf Deutsch).",
      guidance: "Benutze Verben wie 'aufstehen', 'lernen', 'essen'."
    },
    grammar: {
      title: "Präsens der regelmäßigen Verben",
      rule: "Regelmäßige deutsche Verben in der 1. Person Singular ('ich') enden auf '-e'.",
      sentence: "Ich _____ (lernen) jeden Tag mit Begeisterung eine neue Sprache.",
      options: ["lernst", "lernt", "lerne", "lernen"],
      correctIndex: 2,
      explanation: "Mit dem Subjektpronomen 'ich' endet das konjugierte Verb im Präsens auf '-e': 'lerne'."
    },
    vocabulary: [
      { word: "Das Buch", trans: "The book", phonetic: "[dahs bookh]" },
      { word: "Die Wissenschaft", trans: "Science", phonetic: "[dee vis-en-shaft]" },
      { word: "Die Freude", trans: "Joy / Pleasure", phonetic: "[dee froy-duh]" },
      { word: "Die Zukunft", trans: "Future", phonetic: "[dee tsoo-koonft]" }
    ],
    pronunciation: {
      phrase: "Guten Tag! Ich freue mich sehr darauf, heute Deutsch zu lernen.",
      phoneticGuide: "Achte auf den klaren ch-Laut in 'freue mich' und den Diphthong 'eu'.",
      cleanExpected: "guten tag ich freue mich sehr darauf heute deutsch zu lernen"
    }
  },

  Portuguese: {
    id: 'Portuguese',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    synthLang: 'pt-BR',
    recogLang: 'pt-BR',
    listening: {
      passage: "Lucas acorda cedo todos os dias para caminhar pela praia de Copacabana antes de começar seu trabalho no centro da cidade.",
      question: "O que Lucas faz todos os dias de manhã?",
      options: [
        "Caminha pela praia de Copacabana",
        "Vai direto para o escritório",
        "Toma café em uma padaria distante",
        "Pratica natação no clube municipal"
      ],
      correctIndex: 0,
      explanation: "Lucas caminha pela praia de Copacabana antes de começar seu trabalho."
    },
    reading: {
      passage: "A Floresta Amazônica é a maior floresta tropical do mundo, abrigando uma biodiversidade inigualável e desempenhando um papel crucial no equilíbrio climático global.",
      translation: "The Amazon Rainforest is the largest tropical rainforest in the world, housing unrivaled biodiversity and playing a crucial role in global climate balance.",
      vocab: [
        { word: "floresta", meaning: "forest / jungle" },
        { word: "biodiversidade", meaning: "biodiversity" },
        { word: "desempenhando", meaning: "playing / executing" },
        { word: "equilíbrio", meaning: "balance / equilibrium" }
      ]
    },
    writing: {
      prompt: "Descreva um lugar especial que você gostaria de visitar no Brasil ou em Portugal (escreva pelo menos 2 frases).",
      guidance: "Use verbos no futuro ou presente como 'gostaria de', 'tem', 'é bonito'."
    },
    grammar: {
      title: "Presente do Indicativo - Verbos em -ar",
      rule: "Na primeira pessoa do singular ('Eu'), verbos regulares em -ar recebem a terminação '-o'.",
      sentence: "Eu _____ (estudar) português com dedicação todas as manhãs.",
      options: ["estudas", "estuda", "estudo", "estudamos"],
      correctIndex: 2,
      explanation: "Com 'Eu', o verbo regular 'estudar' é conjugado como 'estudo'."
    },
    vocabulary: [
      { word: "A esperança", trans: "Hope", phonetic: "[ah es-peh-rahn-sah]" },
      { word: "O horizonte", trans: "The horizon", phonetic: "[o oh-ree-zohn-chee]" },
      { word: "A amizade", trans: "Friendship", phonetic: "[ah ah-mee-zah-jee]" },
      { word: "A sabedoria", trans: "Wisdom", phonetic: "[ah sah-beh-doh-ree-ah]" }
    ],
    pronunciation: {
      phrase: "Olá! É um grande prazer praticar conversação em português hoje.",
      phoneticGuide: "Enfatize a nasalidade em 'conversação' e o som suave de 'prazer'.",
      cleanExpected: "ola e um grande prazer praticar conversacao em portugues hoje"
    }
  },

  Mandarin: {
    id: 'Mandarin',
    name: 'Mandarin',
    nativeName: '中文 (Chinese)',
    flag: '🇨🇳',
    synthLang: 'zh-CN',
    recogLang: 'zh-CN',
    listening: {
      passage: "王老师每天早上去学校图书馆看书，她非常喜欢那里的安静环境和丰富的书籍。",
      question: "王老师为什么喜欢学校图书馆？",
      options: [
        "环境安静且书籍丰富",
        "离她的家非常近",
        "有免费的咖啡和点心",
        "可以和学生一起做运动"
      ],
      correctIndex: 0,
      explanation: "王老师喜欢图书馆是因为环境安静且书籍丰富。"
    },
    reading: {
      passage: "万里长城是中国古代最著名的伟大建筑之一，全长数千公里。每年吸引世界各地的游客前来领略古老文明的雄伟与壮丽。",
      translation: "The Great Wall of China is one of the most famous architectural wonders of ancient China, stretching thousands of kilometers. Every year it attracts tourists from all over the world to experience the grandeur of ancient civilization.",
      vocab: [
        { word: "长城 (Chángchéng)", meaning: "Great Wall" },
        { word: "文明 (Wénmíng)", meaning: "civilization" },
        { word: "雄伟 (Xióngwěi)", meaning: "grand / magnificent" },
        { word: "建筑 (Jiànzhù)", meaning: "architecture / building" }
      ]
    },
    writing: {
      prompt: "用中文简单介绍你的爱好或最喜欢的季节（写至少两句话）。",
      guidance: "可以使用 '我喜欢...'，'因为...'。"
    },
    grammar: {
      title: "中文基础语序 (Subject + Verb + Object)",
      rule: "中文的基本句式是主语 + 动词 + 宾语，表示正在进行的动作通常在动词前加 '在'。",
      sentence: "我每天都在认真地 _____ (学习) 中文语法。",
      options: ["学习", "走", "看书", "休息"],
      correctIndex: 0,
      explanation: "'学习中文语法' (study Chinese grammar) 搭配最准确。"
    },
    vocabulary: [
      { word: "朋友 (Péngyou)", trans: "Friend", phonetic: "[péng-yǒu]" },
      { word: "学习 (Xuéxí)", trans: "To study / learn", phonetic: "[xué-xí]" },
      { word: "未来 (Wèilái)", trans: "Future", phonetic: "[wèi-lái]" },
      { word: "知识 (Zhīshi)", trans: "Knowledge", phonetic: "[zhī-shi]" }
    ],
    pronunciation: {
      phrase: "你好！我非常高兴能够在这里练习中文口语。",
      phoneticGuide: "注意'高兴'(gāoxìng)的声调，以及'练习'(liànxí)的发音。",
      cleanExpected: "你好我非常高兴能够在这里练习中文口语"
    }
  },

  Japanese: {
    id: 'Japanese',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    synthLang: 'ja-JP',
    recogLang: 'ja-JP',
    listening: {
      passage: "田中さんは毎朝七時に起きて、近所の公園を散歩してから大学へ向かいます。新鮮な空気が好きだからです。",
      question: "田中さんは毎朝なぜ公園を散歩しますか？",
      options: [
        "新鮮な空気が好きだから",
        "友達と走る約束があるから",
        "犬の世話をするため",
        "図書館が開くのを待つため"
      ],
      correctIndex: 0,
      explanation: "田中さんは新鮮な空気が好きなので毎朝公園を散歩します。"
    },
    reading: {
      passage: "富士山は日本で一番高い山であり、国の象徴として古くから親しまれています。四季折々の美しい自然が多くの登山者や観光客を魅了しています。",
      translation: "Mount Fuji is the highest mountain in Japan and has long been cherished as a national symbol. The beautiful nature of each season captivates countless climbers and tourists.",
      vocab: [
        { word: "象徴 (Shōchō)", meaning: "symbol" },
        { word: "登山者 (Tozansha)", meaning: "climbers / hikers" },
        { word: "魅了 (Miryō)", meaning: "captivate / charm" },
        { word: "四季折々 (Shiki-oriori)", meaning: "season to season" }
      ]
    },
    writing: {
      prompt: "あなたの趣味や好きな食べ物について日本語で二文以上書いてみましょう。",
      guidance: "「私の趣味は〜です」「〜が好きです」を使ってみましょう。"
    },
    grammar: {
      title: "です・ます調の基本現在形",
      rule: "丁寧な表現では、動詞の現在形に「〜ます」、名詞や形容詞の語尾に「〜です」を用います。",
      sentence: "私は毎日日本語を一生懸命 _____ (勉強する)。",
      options: ["勉強します", "勉強した", "勉強しましょう", "勉強しません"],
      correctIndex: 0,
      explanation: "現在の習慣を表す丁寧な肯定形は「勉強します」です。"
    },
    vocabulary: [
      { word: "桜 (Sakura)", trans: "Cherry blossom", phonetic: "[sah-koo-rah]" },
      { word: "希望 (Kibō)", trans: "Hope", phonetic: "[kee-boh]" },
      { word: "心 (Kokoro)", trans: "Heart / Mind", phonetic: "[koh-koh-roh]" },
      { word: "平和 (Heiwa)", trans: "Peace", phonetic: "[hey-wah]" }
    ],
    pronunciation: {
      phrase: "こんにちは！今日も一緒に楽しく日本語を学びましょう。",
      phoneticGuide: "「学びましょう」(manabimashō)の語尾を滑らかに伸ばして発音しましょう。",
      cleanExpected: "こんにちは今日も一緒に楽しく日本語を学びましょう"
    }
  },

  Italian: {
    id: 'Italian',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    synthLang: 'it-IT',
    recogLang: 'it-IT',
    listening: {
      passage: "Marco va al mercato ogni sabato mattina per comprare frutta fresca, verdura di stagione e formaggio artigianale per preparare il pranzo della domenica.",
      question: "Cosa compra Marco al mercato ogni sabato mattina?",
      options: [
        "Frutta fresca, verdura di stagione e formaggio",
        "Pane e dolci appena sfornati",
        "Fiori profumati per la terrazza",
        "Libri usati e souvenir antichi"
      ],
      correctIndex: 0,
      explanation: "Marco compra frutta fresca, verdura di stagione e formaggio artigianale."
    },
    reading: {
      passage: "Il Colosseo a Roma è uno dei monumenti storici più ammirati al mondo. Testimonia la maestosità dell'architettura romana e attrae ogni giorno migliaia di visitatori da ogni continente.",
      translation: "The Colosseum in Rome is one of the most admired historic monuments in the world. It testifies to the majesty of Roman architecture and attracts thousands of visitors from every continent each day.",
      vocab: [
        { word: "monumento", meaning: "monument / historic site" },
        { word: "maestosità", meaning: "majesty / greatness" },
        { word: "ammirati", meaning: "admired" },
        { word: "testimonia", meaning: "testifies / bears witness" }
      ]
    },
    writing: {
      prompt: "Descrivi la tua città o il tuo piatto preferito (scrivi almeno 2 frasi in italiano).",
      guidance: "Usa aggettivi come 'delizioso', 'storico', 'accogliente'."
    },
    grammar: {
      title: "Presente Indicativo - Verbi in -are",
      rule: "I verbi regolari della prima coniugazione (-are) con 'Io' terminano con la desinenza '-o'.",
      sentence: "Io _____ (parlare) italiano con il mio tutor per migliorare la pronuncia.",
      options: ["parli", "parla", "parlo", "parliamo"],
      correctIndex: 2,
      explanation: "Con il pronome 'Io', la desinenza regolare è '-o': 'parlo'."
    },
    vocabulary: [
      { word: "La speranza", trans: "Hope", phonetic: "[lah speh-rahn-tsah]" },
      { word: "Il tramonto", trans: "The sunset", phonetic: "[eel trah-mohn-toh]" },
      { word: "La bellezza", trans: "Beauty", phonetic: "[lah bel-lets-tsah]" },
      { word: "Il sorriso", trans: "The smile", phonetic: "[eel sohr-ree-zoh]" }
    ],
    pronunciation: {
      phrase: "Buongiorno! Sono felice di praticare la lingua italiana oggi con Ini.",
      phoneticGuide: "Pronuncia le doppie con decisione in 'felice' e 'italiana'.",
      cleanExpected: "buongiorno sono felice di praticare la lingua italiana oggi con ini"
    }
  }
};
