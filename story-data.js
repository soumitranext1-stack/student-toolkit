"use strict";
/* =====================================================================
   COUPLE CHRONICLES — MODULAR STORY LIBRARY DATA (`STORIES_CATALOG`)
   · Future-ready schema: push a new story object to `STORIES_CATALOG`
     or call `registerChronicleStory(storyObj)` and it automatically
     appears in the Couple Chronicles hub with scenes, split paths,
     EN/HI/BN voice narration, BGM/SFX cues, endings & PDF export.
   · Flagship Playable Story: "The Midnight Express: Velvet & Shadow"
     (11 interconnected scenes, 2 split-path chapters, common Reunion,
     and 4 distinct endings).
   ===================================================================== */
(function (global) {
  const CLUE_LABELS = {
    crimson_ticket: {
      en: 'Crimson Brass Ticket #13',
      hi: 'क्रिमसन पीतल टिकट #13',
      bn: 'ক্রিমসন পিতলের টিকিট #১৩'
    },
    wax_sealed_note: {
      en: 'Wax-Sealed Warning Note',
      hi: 'मोम-सीलबंद चेतावनी पत्र',
      bn: 'মোম-সিল করা সতর্কবার্তা'
    },
    steamer_blueprint: {
      en: 'Baggage Vault Blueprint',
      hi: 'लगेज वॉल्ट का नक्शा',
      bn: 'লাগেজ ভল্টের নকশা'
    },
    silver_locket: {
      en: 'Encrypted Silver Locket',
      hi: 'कोडेड चाँदी का लॉकेट',
      bn: 'সাংকেতিক রুপার লকেট'
    },
    broker_sigil: {
      en: 'Shadow Broker Signet',
      hi: 'शैडो ब्रोकर की मुहर',
      bn: 'শ্যাডো ব্রোকারের সিলমোহর'
    },
    heirloom_ledger: {
      en: 'Collector’s Secret Ledger',
      hi: 'कलेक्टर की गुप्त बही',
      bn: 'কালেক্টরের গোপন খাতা'
    },
    viaduct_key: {
      en: 'Viaduct Master Override Key',
      hi: 'वायाडक्ट मास्टर चाबी',
      bn: 'ভায়াডাক্ট মাস্টার চাবি'
    }
  };

  const MIDNIGHT_EXPRESS = {
    id: 'midnight_express_velvet_shadow',
    title: 'The Midnight Express: Velvet & Shadow',
    titleLocalized: {
      en: 'The Midnight Express: Velvet & Shadow',
      hi: 'द मिडनाइट एक्सप्रेस: मखमल और साया',
      bn: 'দ্য মিডনাইট এক্সপ্রেস: মখমল ও ছায়া'
    },
    tagline: 'A storm-locked sleeper train, a vanished heirloom, and two hearts split across midnight carriages.',
    taglineLocalized: {
      en: 'A storm-locked sleeper train, a vanished heirloom, and two hearts split across midnight carriages.',
      hi: 'तूफ़ान में घिरी आधी रात की ट्रेन, एक गायब विरासत, और अंधेरे डिब्बों में बिछड़े दो दिल।',
      bn: 'ঝড়ের রাতে আটকে পড়া এক্সপ্রেস ট্রেন, এক নিখোঁজ রত্ন, আর অন্ধকার বগিতে বিচ্ছিন্ন দুটি হৃদয়।'
    },
    genre: 'Dark Mystery',
    accent: '#c0395d',
    coverArt: 'assets/chronicles/velvet-cover.jpg',
    duration: '12–15 min',
    endingsCount: 4,
    scenesCount: 11,
    roles: {
      A: {
        title: { en: 'Partner A · The Shield', hi: 'पार्टनर A · रक्षक', bn: 'পার্টনার A · রক্ষক' },
        desc: { en: 'Distract, unlock, confront danger', hi: 'ध्यान भटकाओ, ताले खोलो, खतरे से लड़ो', bn: 'বিভ্রান্ত করো, তালা খোলো, বিপদের মুখোমুখি হও' }
      },
      B: {
        title: { en: 'Partner B · The Cipher', hi: 'पार्टनर B · सूत्रधार', bn: 'পার্টনার B · রহস্যভেদী' },
        desc: { en: 'Decode, heal, protect secrets', hi: 'कोड सुलझाओ, संभालो, राज़ बचाओ', bn: 'সংকেত ভেদ করো, রক্ষা করো, গোপনীয়তা আগলাও' }
      }
    },
    startSceneId: 's1_platform',
    scenes: {
      /* ===== SCENE 1: SHARED OPENING ===== */
      s1_platform: {
        id: 's1_platform',
        chapterNo: 1,
        totalChapters: 8,
        isSplit: false,
        location: { en: 'Platform 13 · Midnight Departure', hi: 'प्लेटफॉर्म 13 · आधी रात की रवानगी', bn: 'প্ল্যাটফর্ম ১৩ · মধ্যরাতের যাত্রা' },
        title: { en: 'The Last Whistle in the Rain', hi: 'बारिश में आखिरी सीटी', bn: 'বৃষ্টিভেজা শেষ বাঁশি' },
        bg: 'assets/chronicles/velvet-cover.jpg',
        fx: 'rain-fog',
        bgm: 'noir_train',
        sfx: 'thunder',
        narration: {
          en: 'Rain hammers the iron canopy of Platform 13 as the Midnight Express hisses with silver steam. A gloved courier presses a warm brass envelope into {A}’s palm and vanishes into the fog. Inside lies a single warning addressed to {A} and {B}: "Do not trust the Conductor after Mile 44."',
          hi: 'प्लेटफॉर्म 13 की लोहे की छत पर तेज़ बारिश बरस रही है और मिडनाइट एक्सप्रेस से चाँदी जैसी भाप उठ रही है। एक दस्ताने पहने अजनबी ने {A} के हाथ में पीतल का लिफ़ाफ़ा थमाया और कोहरे में गायब हो गया। अंदर {A} और {B} के नाम एक चेतावनी है: "मील 44 के बाद कंडक्टर पर भरोसा मत करना।"',
          bn: 'প্ল্যাটফর্ম ১৩-এর লোহার ছাদে ঝমঝম করে বৃষ্টি পড়ছে, আর মিডনাইট এক্সপ্রেস থেকে রুপালি বাষ্প উঠছে। কালো দস্তানা পরা এক আগন্তুক {A}-এর হাতে একটি পিতলের খাম গুঁজে দিয়ে কুয়াশায় মিলিয়ে গেল। ভেতরে {A} ও {B}-এর নামে লেখা সতর্কবার্তা: "মাইল ৪৪-এর পর কন্ডাক্টরকে বিশ্বাস কোরো না।"'
        },
        dialogue: {
          speaker: { en: 'Whispers on the Platform', hi: 'प्लेटफॉर्म पर सरगोशी', bn: 'প্ল্যাটফর্মের ফিসফিসানি' },
          line: {
            en: '"Two names on one brass ticket—step aboard together, or lose the truth before dawn."',
            hi: '"एक ही पीतल टिकट पर दो नाम—साथ चढ़ो, वरना सुबह से पहले सच हमेशा के लिए खो जाएगा।"',
            bn: '"একই পিতলের টিকিটে দুটি নাম—একসাথে ওঠো, নইলে ভোরের আগেই সত্য চিরতরে হারিয়ে যাবে।"'
          }
        },
        choicesA: [
          {
            id: 'a_shield_board',
            label: { en: 'Pull {B} close & scan the shadowed platform', hi: '{B} को पास खींचकर अंधेरे प्लेटफॉर्म पर नज़र रखो', bn: '{B}-কে কাছে টেনে অন্ধকার প্ল্যাটফর্ম নজরে রাখো' },
            hint: { en: 'Protective · +Trust', hi: 'सुरक्षात्मक · +विश्वास', bn: 'সুরক্ষামূলক · +বিশ্বাস' },
            trust: 2, risk: 0, clue: 'crimson_ticket'
          },
          {
            id: 'a_chase_courier',
            label: { en: 'Sprint toward the vanishing courier before boarding', hi: 'ट्रेन चढ़ने से पहले उस अजनबी के पीछे दौड़ो', bn: 'ট্রেনে ওঠার আগে আগন্তুকের পিছু ধাওয়া করো' },
            hint: { en: 'Bold · +Risk', hi: 'साहसी · +जोखिम', bn: 'সাহসী · +ঝুঁকি' },
            trust: 0, risk: 2
          }
        ],
        choicesB: [
          {
            id: 'b_inspect_seal',
            label: { en: 'Examine the crimson wax seal under the gas lamp', hi: 'गैस लैंप की रोशनी में लाल मोम की मुहर जाँचो', bn: 'গ্যাস ল্যাম্পের আলোয় লাল মোমের সিল পরীক্ষা করো' },
            hint: { en: 'Observant · +Clue', hi: 'सतर्क · +सुराग', bn: 'তীক্ষ্ণদৃষ্টি · +সূত্র' },
            trust: 1, risk: 0, clue: 'wax_sealed_note'
          },
          {
            id: 'b_hide_envelope',
            label: { en: 'Slip the envelope inside your velvet coat & board fast', hi: 'लिफ़ाफ़ा मखमली कोट में छिपाकर तेज़ी से ट्रेन में चढ़ो', bn: 'খামটা মখমলের কোটে লুকিয়ে দ্রুত ট্রেনে উঠে পড়ো' },
            hint: { en: 'Cautious · +Stealth', hi: 'सावधान · +चुपचाप', bn: 'সতর্ক · +নীরবে' },
            trust: 1, risk: 1
          }
        ],
        outcomes: {
          'a_shield_board+b_inspect_seal': {
            text: {
              en: '{A} shields {B} from the wind while {B} spots a hidden engraving on the wax seal: "Cabin 7 holds the key." They step aboard just as the heavy doors slam shut.',
              hi: '{A} ने तूफ़ानी हवा से {B} को बचाया और {B} ने मोम की मुहर पर छिपा संकेत पढ़ लिया: "केबिन 7 में चाबी है।" भारी दरवाज़े बंद होते ही दोनों ट्रेन में सवार हो गए।',
              bn: '{A} ঝোড়ো হাওয়া থেকে {B}-কে আড়াল করল আর {B} মোমের সিলে লুকানো সংকেত পড়ে ফেলল: "কেবিন ৭-এ চাবি আছে।" ভারী দরজা বন্ধ হওয়ার ঠিক আগে দুজনে ট্রেনে উঠল।'
            },
            trust: 1, sfx: 'clueFound', next: 's2_dining_car'
          },
          default: {
            text: {
              en: 'The locomotive lurches forward in a blast of rain and coal smoke. {A} grabs {B}’s hand on the brass handrail, pulling each other safely inside the warm crimson carriage.',
              hi: 'बारिश और कोयले के धुएँ के बीच इंजन चल पड़ा। {A} ने पीतल की रेलिंग पर {B} का हाथ थामा और दोनों सुरक्षित लाल मखमली डिब्बे के अंदर आ गए।',
              bn: 'বৃষ্টি আর কয়লার ধোঁয়ার মাঝে ইঞ্জিন চলতে শুরু করল। {A} পিতলের হাতলে {B}-এর হাত শক্ত করে ধরে দুজনেই ভেতরের লাল মখমলের বগিতে ঢুকে পড়ল।'
            },
            sfx: 'doorCreak', next: 's2_dining_car'
          }
        }
      },

      /* ===== SCENE 2: SHARED DINING CAR MYSTERY ===== */
      s2_dining_car: {
        id: 's2_dining_car',
        chapterNo: 2,
        totalChapters: 8,
        isSplit: false,
        location: { en: 'Carriage 4 · The Crimson Dining Car', hi: 'डिब्बा 4 · क्रिमसन डाइनिंग कार', bn: 'বগি ৪ · ক্রিমসন ডাইনিং কার' },
        title: { en: 'Velvet Booths & Watchful Eyes', hi: 'मखमली केबिन और घूरती निगाहें', bn: 'মখমলের আসন ও সতর্ক চোখ' },
        bg: 'assets/chronicles/dining-car.jpg',
        fx: 'rain-warm',
        bgm: 'velvet_mystery',
        sfx: 'doorCreak',
        narration: {
          en: 'Brass lamps sway above crimson velvet booths. Across the aisle, the Silver-Eyed Conductor watches {A} and {B} while tapping a pocket watch. Beside your crystal glass lies a second folded menu—marked in ink with coordinates for the Baggage Vault.',
          hi: 'लाल मखमली सीटों के ऊपर पीतल के लैंप झूल रहे हैं। दूसरी तरफ़ सिल्वर-आइड कंडक्टर अपनी पॉकेट वॉच बजाते हुए {A} और {B} को घूर रहा है। आपके गिलास के पास मुड़े हुए मेन्यू पर स्याही से लगेज वॉल्ट का नक्शा बना है।',
          bn: 'লাল মখমলের আসনের ওপর পিতলের বাতিগুলো দুলছে। উল্টোদিকে রুপালি চোখের কন্ডাক্টর পকেট ঘড়ি বাজিয়ে {A} ও {B}-এর ওপর নজর রাখছে। তোমাদের গ্লাসের পাশে ভাঁজ করা মেনুতে কালিতে লাগেজ ভল্টের সংকেত আঁকা।'
        },
        dialogue: {
          speaker: { en: 'The Conductor', hi: 'कंडक्टर', bn: 'কন্ডাক্টর' },
          line: {
            en: '"A stormy night for lovers to travel alone. May I see both tickets before we cross the ravine?"',
            hi: '"तूफ़ानी रात में प्रेमियों का अकेले सफ़र करना दिलचस्प है। खाई पार करने से पहले क्या मैं दोनों टिकट देख सकता हूँ?"',
            bn: '"ঝড়ের রাতে যুগলের একা ভ্রমণ বেশ রহস্যময়। গিরিখাত পার হওয়ার আগে কি দুজনের টিকিট দেখতে পারি?"'
          }
        },
        choicesA: [
          {
            id: 'a_distract_conductor',
            label: { en: 'Charm & distract the Conductor with a bold bluff', hi: 'आत्मविश्वास से बात घुमाकर कंडक्टर का ध्यान भटकाओ', bn: 'বুদ্ধিদীপ্ত কথায় কন্ডাক্টরের মন অন্যদিকে ঘোরাও' },
            hint: { en: 'Clever · +Trust', hi: 'चतुर · +विश्वास', bn: 'চতুর · +বিশ্বাস' },
            trust: 1, risk: 1, clue: 'steamer_blueprint'
          },
          {
            id: 'a_confront_conductor',
            label: { en: 'Challenge him directly about Mile 44', hi: 'सीधे मील 44 के बारे में उससे सवाल करो', bn: 'মাইল ৪৪ নিয়ে সরাসরি তাকে প্রশ্ন করো' },
            hint: { en: 'Intense · +Risk', hi: 'तीखा · +जोखिम', bn: 'তীব্র · +ঝুঁকি' },
            trust: 0, risk: 2
          }
        ],
        choicesB: [
          {
            id: 'b_palm_menu',
            label: { en: 'Quietly slip the inked map into your sleeve & decode it', hi: 'चुपचाप नक्शे वाला मेन्यू आस्तीन में छिपाकर उसे समझो', bn: 'চুপিসারে নকশা আঁকা মেনুটা লুকিয়ে অর্থ বোঝার চেষ্টা করো' },
            hint: { en: 'Decode · +Clue', hi: 'कोड · +सुराग', bn: 'সংকেত · +সূত্র' },
            trust: 1, risk: 0, clue: 'steamer_blueprint'
          },
          {
            id: 'b_check_glasses',
            label: { en: 'Swap the untouched crystal glasses before anyone drinks', hi: 'किसी के पीने से पहले मेज़ के गिलास चुपके से बदल दो', bn: 'কেউ খাওয়ার আগেই টেবিলের গ্লাস দুটো চুপিচুপি বদলে দাও' },
            hint: { en: 'Protect · +Trust', hi: 'सुरक्षा · +विश्वास', bn: 'রক্ষা · +বিশ্বাস' },
            trust: 2, risk: 0
          }
        ],
        outcomes: {
          'a_distract_conductor+b_palm_menu': {
            text: {
              en: 'While {A} keeps the Conductor busy with an effortless smile, {B} decodes the inked blueprint—revealing both a locked iron trunk ahead and a brass safe in Cabin 7!',
              hi: 'जब {A} ने अपनी मुस्कान से कंडक्टर को उलझाए रखा, {B} ने नक्शा सुलझा लिया—आगे लगेज कार में लोहे का संदूक और केबिन 7 में पीतल की तिजोरी है!',
              bn: '{A} যখন শান্ত হাসিতে কন্ডাক্টরকে ব্যস্ত রাখল, {B} তখন নকশাটা বুঝে ফেলল—সামনের লাগেজ কারে লোহার ট্রাঙ্ক আর কেবিন ৭-এ পিতলের সিন্দুক!'
            },
            trust: 1, sfx: 'clueFound', next: 's3_blackout'
          },
          default: {
            text: {
              en: 'The Conductor’s eyes narrow as lightning cracks outside the tall windows. Moments later, the train hits Mile 44—and every brass lamp snaps into pitch darkness.',
              hi: 'खिड़की के बाहर बिजली चमकते ही कंडक्टर की आँखें सिकुड़ गईं। अगले ही पल ट्रेन मील 44 पर पहुँची—और सारे लैंप अचानक बुझ गए।',
              bn: 'জানালার বাইরে বিদ্যুৎ চমকাতেই কন্ডাক্টরের চোখ সরু হয়ে এল। পরমুহূর্তেই ট্রেন মাইল ৪৪ ছুঁল—আর সব বাতি হঠাৎ নিভে গেল।'
            },
            sfx: 'dangerSting', next: 's3_blackout'
          }
        }
      },

      /* ===== SCENE 3: THE BLACKOUT — TRIGGERS SPLIT PATH ===== */
      s3_blackout: {
        id: 's3_blackout',
        chapterNo: 3,
        totalChapters: 8,
        isSplit: false,
        location: { en: 'Mile 44 · Emergency Bulkhead', hi: 'मील 44 · इमरजेंसी दरवाज़ा', bn: 'মাইল ৪৪ · ইমার্জেন্সি দরজা' },
        title: { en: 'Separated in the Dark', hi: 'अंधेरे में बिछड़ाव', bn: 'অন্ধকারে বিচ্ছেদ' },
        bg: 'assets/chronicles/engine-corridor.jpg',
        fx: 'storm-flicker',
        bgm: 'tension_pulse',
        sfx: 'heartbeat',
        narration: {
          en: 'Emergency brakes screech! Heavy iron security gates crash down between Carriage 4 and Sleeper Cabin 7. Through the frosted glass, {A} and {B} press their palms together as heavy footsteps close in from opposite ends of the train.',
          hi: 'इमरजेंसी ब्रेक चीख उठे! डिब्बा 4 और स्लीपर केबिन 7 के बीच भारी लोहे का गेट गिर गया। धुँधले शीशे के आर-पार {A} और {B} ने एक-दूसरे की हथेली पर हाथ रखा—दोनों तरफ़ से भारी कदमों की आहट आ रही है।',
          bn: 'ইমার্জেন্সি ব্রেক বিকট শব্দে চেপে ধরল! বগি ৪ আর স্লিপার কেবিন ৭-এর মাঝে ভারী লোহার গেট নেমে এল। ঝাপসা কাঁচের ওপার-এপার {A} ও {B} হাত রাখল—দুই দিক থেকেই ভারী পায়ের শব্দ এগিয়ে আসছে।'
        },
        dialogue: {
          speaker: { en: 'Through the Frosted Glass', hi: 'धुँधले शीशे के पार', bn: 'ঝাপসা কাঁচের ওপার থেকে' },
          line: {
            en: '"Split up, grab the proof, and meet me at the Viaduct Bridge before midnight!"',
            hi: '"अलग रास्ते से सबूत ढूँढो, और आधी रात से पहले वायाडक्ट ब्रिज पर मिलना!"',
            bn: '"আলাদা পথ থেকে প্রমাণ জোগাড় করো, আর মধ্যরাতের আগেই ভায়াডাক্ট ব্রিজে দেখা কোরো!"'
          }
        },
        choicesA: [
          {
            id: 'a_vow_corridor',
            label: { en: 'Promise {B} you will unlock the baggage vault & return', hi: '{B} से वादा करो कि तुम वॉल्ट खोलकर सुरक्षित लौटोगे', bn: '{B}-কে কথা দাও যে ভল্ট খুলে নিরাপদে ফিরে আসবে' },
            hint: { en: 'Lead Forward · +Trust', hi: 'आगे बढ़ो · +विश्वास', bn: 'এগিয়ে যাও · +বিশ্বাস' },
            trust: 1, risk: 0
          },
          {
            id: 'a_lure_guards',
            label: { en: 'Bang the iron door to draw the guards away from {B}', hi: 'लोहे का दरवाज़ा पीटकर गार्ड्स को {B} से दूर खींचो', bn: 'লোহার দরজায় শব্দ করে রক্ষীদের {B}-এর থেকে দূরে সরাও' },
            hint: { en: 'Sacrifice · +Trust / +Risk', hi: 'बलिदान · +विश्वास / +जोखिम', bn: 'ত্যাগ · +বিশ্বাস / +ঝুঁকি' },
            trust: 2, risk: 2
          }
        ],
        choicesB: [
          {
            id: 'b_slip_cabin7',
            label: { en: 'Slip silently into Cabin 7 & bolt the velvet curtains', hi: 'चुपचाप केबिन 7 में जाकर मखमली पर्दे बंद करो', bn: 'চুপচাপ কেবিন ৭-এ ঢুকে মখমলের পর্দা টেনে দাও' },
            hint: { en: 'Stealth · Safe', hi: 'चुपचाप · सुरक्षित', bn: 'নীরবে · নিরাপদ' },
            trust: 1, risk: 0
          },
          {
            id: 'b_pass_hairpin',
            label: { en: 'Slide your brass hairpin under the gate to help {A}', hi: 'दरवाज़े के नीचे से पीतल की पिन {A} की मदद के लिए खिसकाओ', bn: 'দরজার নিচ দিয়ে পিতলের পিনটা {A}-এর সাহায্যের জন্য ঠেলে দাও' },
            hint: { en: 'Assist {A} · +Trust', hi: '{A} की मदद · +विश्वास', bn: '{A}-কে সাহায্য · +বিশ্বাস' },
            trust: 2, risk: 1
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'PATH SPLIT! {A} vanishes down the lightning-lit Baggage Corridor while {B} slips into the candlelit silence of Sleeper Cabin 7. Each screen now follows your own path until you reunite!',
              hi: 'रास्ते अलग हो गए! {A} बिजली की चमक वाले लगेज कॉरिडोर की ओर बढ़ा और {B} मोमबत्ती की रोशनी वाले केबिन 7 में पहुँचा। अब दोनों की स्क्रीन पर अलग-अलग रास्ता चलेगा!',
              bn: 'পথ ভাগ হয়ে গেল! {A} বিদ্যুৎ চমকানো লাগেজ করিডোরে ঢুকল আর {B} মোমবাতির আলোয় ভরা স্লিপার কেবিন ৭-এ পৌঁছাল। মিলনের আগে দুজনের স্ক্রিনে আলাদা পথ চলবে!'
            },
            sfx: 'lockClick',
            next: { A: 's4a_corridor', B: 's4b_cabin' }
          }
        }
      },

      /* ===== SCENE 4A: PARTNER A SPLIT PATH ===== */
      s4a_corridor: {
        id: 's4a_corridor',
        chapterNo: 4,
        totalChapters: 8,
        isSplit: true,
        role: 'A',
        location: { en: 'SPLIT PATH · Partner A · Iron Baggage Corridor', hi: 'अलग रास्ता · पार्टनर A · लोहे का लगेज कॉरिडोर', bn: 'আলাদা পথ · পার্টনার A · লোহার লাগেজ করিডোর' },
        title: { en: 'The Locked Steamer Trunk', hi: 'बंद लोहे का संदूक', bn: 'তালাবদ্ধ লোহার ট্রাঙ্ক' },
        bg: 'assets/chronicles/engine-corridor.jpg',
        fx: 'storm-flicker',
        bgm: 'tension_pulse',
        sfx: 'thunder',
        narration: {
          en: 'Alone in the swaying baggage corridor, {A} spots the ornate iron trunk from the blueprint. Lightning flashes outside the narrow glass door. A tarnished brass lock guards whatever the Collector stole—while an armed shadow patrols just two carriages away.',
          hi: 'हिलते हुए लगेज कॉरिडोर में अकेले {A} को नक्शे वाला लोहे का संदूक दिख जाता है। बाहर खिड़की पर बिजली कौंधती है। पीतल के पुराने ताले के भीतर कलेक्टर का चुराया राज़ बंद है—और दो डिब्बे दूर एक हथियारबंद साया गश्त कर रहा है।',
          bn: 'দুলতে থাকা লাগেজ করিডোরে একা {A} নকশায় দেখা লোহার ট্রাঙ্কটা খুঁজে পায়। জানালার বাইরে বিদ্যুৎ চমকায়। পুরোনো পিতলের তালার ভেতরে কালেক্টরের চুরি করা প্রমাণ লুকানো—আর মাত্র দু-বগি দূরেই পাহারাদারের ছায়া।'
        },
        dialogue: {
          speaker: { en: '{A}’s Solo Path', hi: '{A} का अकेला रास्ता', bn: '{A}-এর একাকী পথ' },
          line: {
            en: '"Meanwhile, {B} is searching Cabin 7. I have ninety seconds before the patrol turns back."',
            hi: '"उधर {B} केबिन 7 की तलाशी ले रहा है। मेरे पास गश्ती गार्ड के लौटने से पहले बस नब्बे सेकंड हैं।"',
            bn: '"ওদিকে {B} কেবিন ৭ খুঁজছে। পাহারাদার ফিরে আসার আগে আমার হাতে মাত্র নব্বই সেকেন্ড।"'
          }
        },
        choices: [
          {
            id: 'a_pick_lock',
            label: { en: 'Pick the brass lock carefully without making a sound', hi: 'बिना आवाज़ किए सावधानी से पीतल का ताला खोलो', bn: 'কোনো শব্দ না করে সাবধানে পিতলের তালাটা খোলো' },
            hint: { en: 'Precision · +Clue', hi: 'सटीक · +सुराग', bn: 'নিখুঁত · +সূত্র' },
            trust: 1, risk: 0, clue: 'broker_sigil'
          },
          {
            id: 'a_pry_trunk',
            label: { en: 'Force the latch open with an iron crowbar & grab everything', hi: 'लोहे की रॉड से ताला तोड़कर सब कुछ जल्दी निकाल लो', bn: 'লোহার রড দিয়ে তালা ভেঙে সব কিছু দ্রুত নিয়ে নাও' },
            hint: { en: 'Loud · +Clue / +Risk', hi: 'तेज़ आवाज़ · +सुराग / +जोखिम', bn: 'জোরে শব্দ · +সূত্র / +ঝুঁকি' },
            trust: 0, risk: 2, clue: 'broker_sigil'
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'Click! Both {A} in the corridor and {B} in Cabin 7 uncover matching halves of the conspiracy—just as the train whistle echoes through the mountain tunnel.',
              hi: 'क्लिक! कॉरिडोर में {A} और केबिन 7 में {B} दोनों को साज़िश के आधे-आधे सुराग मिल गए—तभी पहाड़ी सुरंग में ट्रेन की सीटी गूँज उठी।',
              bn: 'ক্লিক! করিডোরে {A} আর কেবিন ৭-এ {B}—দুজনেই ষড়যন্ত্রের দুই অর্ধেক প্রমাণ হাতে পেল, ঠিক তখনই পাহাড়ি সুড়ঙ্গে ট্রেনের বাঁশি বেজে উঠল।'
            },
            sfx: 'clueFound',
            next: { A: 's5a_vestibule', B: 's5b_archive' }
          }
        }
      },

      /* ===== SCENE 4B: PARTNER B SPLIT PATH ===== */
      s4b_cabin: {
        id: 's4b_cabin',
        chapterNo: 4,
        totalChapters: 8,
        isSplit: true,
        role: 'B',
        location: { en: 'SPLIT PATH · Partner B · Sleeper Cabin 7', hi: 'अलग रास्ता · पार्टनर B · स्लीपर केबिन 7', bn: 'আলাদা পথ · পার্টনার B · স্লিপার কেবিন ৭' },
        title: { en: 'The Candlelit Brass Safe', hi: 'मोमबत्ती की रोशनी में पीतल की तिजोरी', bn: 'মোমবাতির আলোয় পিতলের সিন্দুক' },
        bg: 'assets/chronicles/compartment-archive.jpg',
        fx: 'candle-embers',
        bgm: 'velvet_mystery',
        sfx: 'lockClick',
        narration: {
          en: 'Inside Cabin 7, a single wax candle flickers beside an antique brass safe and a silver locket engraved with both of your initials. Moonlight spills across the velvet bed as {B} hears a faint tapping code from the radiator pipe—is it {A}, or a trap?',
          hi: 'केबिन 7 के अंदर एक मोमबत्ती पुरानी पीतल की तिजोरी और चाँदी के लॉकेट के पास टिमटिमा रही है। चाँदनी मखमली बिस्तर पर बिखरी है—तभी पाइप पर हल्की दस्तक सुनाई देती है। क्या यह {A} का इशारा है या कोई जाल?',
          bn: 'কেবিন ৭-এর ভেতর একটি মোমবাতি পুরোনো পিতলের সিন্দুক আর রুপার লকেটের পাশে কাঁপছে। চাঁদের আলো মখমলের বিছানায় পড়েছে—হঠাৎ পাইপে মৃদু টোকা শোনা গেল। এটা কি {A}-এর সংকেত, নাকি ফাঁদ?'
        },
        dialogue: {
          speaker: { en: '{B}’s Solo Path', hi: '{B} का अकेला रास्ता', bn: '{B}-এর একাকী পথ' },
          line: {
            en: '"The locket’s dial matches the date on the crimson ticket. If I open the safe now, we learn who hired the Collector."',
            hi: '"लॉकेट का कोड लाल टिकट की तारीख़ से मेल खाता है। अगर अभी तिजोरी खोलूँ तो कलेक्टर के पीछे का चेहरा सामने आ जाएगा।"',
            bn: '"লকেটের সংকেত লাল টিকিটের তারিখের সাথে মিলছে। এখনই সিন্দুক খুললে কালেক্টরের পেছনের মানুষটিকে চেনা যাবে।"'
          }
        },
        choices: [
          {
            id: 'b_decode_locket',
            label: { en: 'Decode the silver locket & open the inner diary', hi: 'चाँदी के लॉकेट का कोड खोलकर गुप्त डायरी पढ़ो', bn: 'রুপার লকেটের সংকেত ভেদ করে গোপন ডায়েরি পড়ো' },
            hint: { en: 'Insight · +Trust / +Clue', hi: 'सूझबूझ · +विश्वास / +सुराग', bn: 'বুদ্ধি · +বিশ্বাস / +সূত্র' },
            trust: 2, risk: 0, clue: 'silver_locket'
          },
          {
            id: 'b_tap_signal',
            label: { en: 'Tap a warning rhythm back on the pipe & lock the door', hi: 'पाइप पर चेतावनी का कोड बजाकर दरवाज़े की कुंडी लगाओ', bn: 'পাইপে সতর্কবার্তার ছন্দ বাজিয়ে দরজা শক্ত করে বন্ধ করো' },
            hint: { en: 'Protect {A} · +Trust', hi: '{A} की रक्षा · +विश्वास', bn: '{A}-কে রক্ষা · +বিশ্বাস' },
            trust: 1, risk: 1, clue: 'silver_locket'
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'Inside the safe lies the truth—the Collector was never after jewels, but the Viaduct Override Key!',
              hi: 'तिजोरी के अंदर सच छिपा था—कलेक्टर को गहने नहीं, बल्कि वायाडक्ट की मास्टर चाबी चाहिए थी!',
              bn: 'সিন্দুকের ভেতরেই ছিল আসল সত্য—কালেক্টরের লক্ষ্য গয়না নয়, বরং ভায়াডাক্টের মাস্টার চাবি!'
            },
            sfx: 'clueFound',
            next: { A: 's5a_vestibule', B: 's5b_archive' }
          }
        }
      },

      /* ===== SCENE 5A: PARTNER A SPLIT PATH 2 ===== */
      s5a_vestibule: {
        id: 's5a_vestibule',
        chapterNo: 5,
        totalChapters: 8,
        isSplit: true,
        role: 'A',
        location: { en: 'SPLIT PATH · Partner A · The Storm Vestibule', hi: 'अलग रास्ता · पार्टनर A · तूफ़ानी वेस्टिब्यूल', bn: 'আলাদা পথ · পার্টনার A · ঝোড়ো ভেস্টিবিউল' },
        title: { en: 'Face to Face with the Broker', hi: 'शैडो ब्रोकर से आमना-सामना', bn: 'শ্যাডো ব্রোকারের মুখোমুখি' },
        bg: 'assets/chronicles/engine-corridor.jpg',
        fx: 'rain-fog',
        bgm: 'tension_pulse',
        sfx: 'dangerSting',
        narration: {
          en: 'Wind howls through the open vestibule between carriages. A tall figure in a soaked trench coat blocks the passage toward the Viaduct deck, twirling the Viaduct Master Key. They offer {A} a whisper: "Leave {B} behind and the fortune is yours."',
          hi: 'डिब्बों के बीच खुले रास्ते में तेज़ हवा गरज रही है। भीगे ट्रेंच कोट में एक लंबा साया रास्ता रोके खड़ा है, उँगली पर मास्टर चाबी घुमाते हुए। वह {A} के कान में फुसफुसाता है: "{B} को पीछे छोड़ दो, सारी दौलत तुम्हारी होगी।"',
          bn: 'দুই বগির মাঝের খোলা জায়গায় ঝোড়ো বাতাস গর্জন করছে। ভেজা কোট পরা এক লম্বা ছায়া পথ আটকে দাঁড়িয়ে আঙুলে মাস্টার চাবি ঘোরাচ্ছে। সে {A}-কে ফিসফিস করে বলল: "{B}-কে ছেড়ে দাও, সব সম্পদ তোমার।"'
        },
        dialogue: {
          speaker: { en: 'The Shadow Broker', hi: 'शैडो ब्रोकर', bn: 'শ্যাডো ব্রোকার' },
          line: {
            en: '"One signature, {A}. Walk away rich—or step onto the bridge in the storm."',
            hi: '"सिर्फ़ एक दस्तखत, {A}। अमीर बनकर निकलो—या इस तूफ़ान में पुल पर लड़ो।"',
            bn: '"মাত্র একটা সই, {A}। ধনী হয়ে বেরিয়ে যাও—নইলে ঝড়ের মাঝে ব্রিজে লড়ো।"'
          }
        },
        choices: [
          {
            id: 'a_disarm_broker',
            label: { en: 'Reject the deal, snatch the key & sprint toward {B}', hi: 'सौदा ठुकराकर चाबी छीनो और {B} की तरफ़ दौड़ो', bn: 'চুক্তি প্রত্যাখ্যান করে চাবি কেড়ে নিয়ে {B}-এর দিকে দৌড়াও' },
            hint: { en: 'Loyal · +Trust / +Clue', hi: 'वफ़ादार · +विश्वास / +सुराग', bn: 'বিশ্বস্ত · +বিশ্বাস / +সূত্র' },
            trust: 2, risk: 1, clue: 'viaduct_key'
          },
          {
            id: 'a_feint_pact',
            label: { en: 'Pretend to agree to learn the Collector’s true leverage', hi: 'कलेक्टर की कमज़ोरी जानने के लिए सौदे का नाटक करो', bn: 'কালেক্টরের দুর্বলতা জানতে চুক্তির ভান করো' },
            hint: { en: 'Dangerous Bluff · +Risk', hi: 'खतरनाक चाल · +जोखिम', bn: 'বিপজ্জনক ছলনা · +ঝুঁকি' },
            trust: -1, risk: 3, clue: 'viaduct_key'
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'The bulkhead bolts finally release with a metallic roar! {A} bursts onto the moonlit Viaduct observation deck just as {B} emerges from the sleeper corridor.',
              hi: 'आखिरकार भारी लोहे के ताले खुल गए! {A} चाँदनी से नहाए वायाडक्ट डेक पर पहुँचा, और ठीक उसी पल {B} भी स्लीपर कॉरिडोर से बाहर आ गया।',
              bn: 'অবশেষে ভারী লোহার খিল খুলে গেল! {A} চাঁদের আলোয় ভরা ভায়াডাক্ট ডেকে বেরিয়ে এল, আর ঠিক সেই মুহূর্তেই {B}-ও স্লিপার করিডোর থেকে ছুটে এল।'
            },
            sfx: 'heartbeat',
            next: 's6_reunion'
          }
        }
      },

      /* ===== SCENE 5B: PARTNER B SPLIT PATH 2 ===== */
      s5b_archive: {
        id: 's5b_archive',
        chapterNo: 5,
        totalChapters: 8,
        isSplit: true,
        role: 'B',
        location: { en: 'SPLIT PATH · Partner B · The Secret Ledger', hi: 'अलग रास्ता · पार्टनर B · गुप्त बहीखाता', bn: 'আলাদা পথ · পার্টনার B · গোপন খাতা' },
        title: { en: 'Pages Written in Velvet Ink', hi: 'मखमली स्याही के पन्ने', bn: 'মখমলের কালিতে লেখা পাতা' },
        bg: 'assets/chronicles/compartment-archive.jpg',
        fx: 'candle-embers',
        bgm: 'velvet_mystery',
        sfx: 'clueFound',
        narration: {
          en: 'The leather diary opens to a final entry: the Midnight Express is scheduled to stop dead on Blackthorn Viaduct so the Collector can erase every witness. {B} spots the emergency corridor release lever behind the velvet drapery—right as the door handle begins to turn.',
          hi: 'चमड़े की डायरी का आखिरी पन्ना खुलता है: मिडनाइट एक्सप्रेस ब्लैकथॉर्न वायाडक्ट पर रुकने वाली है ताकि कलेक्टर हर गवाह मिटा सके। {B} को मखमली पर्दे के पीछे इमरजेंसी गेट खोलने का लीवर दिखता है—ठीक तभी दरवाज़े का हैंडल घूमने लगता है।',
          bn: 'চামড়ার ডায়েরির শেষ পাতায় লেখা: ব্ল্যাকথর্ন ভায়াডাক্টে ট্রেন থামিয়ে কালেক্টর সব সাক্ষী মুছে ফেলতে চায়। {B} মখমলের পর্দার আড়ালে ইমার্জেন্সি গেট খোলার লিভারটা দেখতে পায়—ঠিক তখনই দরজার হাতল ঘুরতে শুরু করে।'
        },
        dialogue: {
          speaker: { en: '{B}’s Discovery', hi: '{B} की खोज', bn: '{B}-এর আবিষ্কার' },
          line: {
            en: '"If I pull this lever, the gate opens for {A}—and I can bring the ledger straight to the bridge!"',
            hi: '"यह लीवर खींचते ही {A} के लिए गेट खुल जाएगा—और मैं यह बहीखाता सीधे पुल तक ले जा सकता हूँ!"',
            bn: '"এই লিভারটা টানলেই {A}-এর জন্য গেট খুলে যাবে—আর আমি গোপন খাতাটা সরাসরি ব্রিজে নিয়ে যেতে পারব!"'
          }
        },
        choices: [
          {
            id: 'b_release_and_take_ledger',
            label: { en: 'Pull the release lever & guard the ledger for {A}', hi: 'गेट खोलने का लीवर खींचो और {A} के लिए बहीखाता सुरक्षित रखो', bn: 'লিভার টেনে গেট খোলো আর {A}-এর জন্য গোপন খাতা আগলে রাখো' },
            hint: { en: 'Reunite · +Trust / +Clue', hi: 'मिलन · +विश्वास / +सुराग', bn: 'পুনর্মিলন · +বিশ্বাস / +সূত্র' },
            trust: 2, risk: 0, clue: 'heirloom_ledger'
          },
          {
            id: 'b_burn_decoy',
            label: { en: 'Burn a decoy page in the candle & slip out the window ledge', hi: 'मोमबत्ती में नकली पन्ना जलाकर खिड़की के रास्ते बाहर निकलो', bn: 'মোমবাতিতে নকল পাতা পুড়িয়ে জানালার কার্নিশ দিয়ে বেরিয়ে পড়ো' },
            hint: { en: 'Daring · +Risk / +Clue', hi: 'साहसी · +जोखिम / +सुराग', bn: 'দুঃসাহসিক · +ঝুঁকি / +সূত্র' },
            trust: 0, risk: 2, clue: 'heirloom_ledger'
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'The bulkhead bolts finally release! Both paths converge beneath the glowing full moon on Blackthorn Viaduct.',
              hi: 'भारी दरवाज़े खुल गए! ब्लैकथॉर्न वायाडक्ट की चाँदनी में दोनों के रास्ते फिर एक हो गए।',
              bn: 'ভারী দরজা খুলে গেল! ব্ল্যাকথর্ন ভায়াডাক্টের জ্যোৎস্নায় দুজনের পথ আবার এক হয়ে গেল।'
            },
            sfx: 'heartbeat',
            next: 's6_reunion'
          }
        }
      },

      /* ===== SCENE 6: COMMON REUNION SCENE ===== */
      s6_reunion: {
        id: 's6_reunion',
        chapterNo: 6,
        totalChapters: 8,
        isSplit: false,
        isReunion: true,
        location: { en: 'REUNION · Blackthorn Stone Viaduct', hi: 'पुनर्मिलन · ब्लैकथॉर्न स्टोन वायाडक्ट', bn: 'পুনর্মিলন · ব্ল্যাকথর্ন পাথরের সেতু' },
        title: { en: 'Embers Under a Silver Moon', hi: 'चाँदनी के नीचे चिंगारियाँ', bn: 'রুপালি চাঁদের নিচে স্ফুলিঙ্গ' },
        bg: 'assets/chronicles/bridge-finale.jpg',
        fx: 'rain-embers',
        bgm: 'reunion_strings',
        sfx: 'sceneOpen',
        narration: {
          en: 'REUNITED! The Midnight Express halts high above the misty gorge. Warm golden embers drift from the locomotive as {A} and {B} collide in an embrace on the rain-slick stone platform, piecing together every clue you both risked your lives to uncover.',
          hi: 'फिर मिलन! मिडनाइट एक्सप्रेस गहरी धुँधली खाई के ऊपर रुक गई है। इंजन से सुनहरी चिंगारियाँ उड़ रही हैं और बारिश से भीगे पत्थर के पुल पर {A} और {B} एक-दूसरे को थाम लेते हैं—दोनों के जमा किए हर सुराग अब एक तस्वीर बन चुके हैं।',
          bn: 'পুনর্মিলন! কুয়াশাচ্ছন্ন গিরিখাতের অনেক ওপরে মিডনাইট এক্সপ্রেস থেমে গেছে। ইঞ্জিন থেকে সোনালি স্ফুলিঙ্গ উড়ছে, আর বৃষ্টিভেজা পাথরের সেতুতে {A} ও {B} একে অপরকে জড়িয়ে ধরে—দুজনের ঝুঁকি নিয়ে জোগাড় করা প্রতিটি সূত্র এখন মিলে গেছে।'
        },
        dialogue: {
          speaker: { en: '{A} & {B} Together Again', hi: '{A} और {B} फिर एक साथ', bn: '{A} ও {B} আবার একসাথে' },
          line: {
            en: '"We survived the dark apart—nothing on this train can break us when we stand together."',
            hi: '"अंधेरे में अलग रहकर भी हम बच निकले—अब साथ खड़े हैं तो इस ट्रेन की कोई ताकत हमें नहीं तोड़ सकती।"',
            bn: '"অন্ধকারে আলাদা থেকেও আমরা টিকে গেছি—এখন একসাথে থাকলে এই ট্রেনের কোনো শক্তি আমাদের ভাঙতে পারবে না।"'
          }
        },
        choicesA: [
          {
            id: 'a_share_truth',
            label: { en: 'Tell {B} everything about the Broker & hand over the key', hi: '{B} को ब्रोकर का पूरा सच बताकर चाबी सौंप दो', bn: '{B}-কে ব্রোকারের সব সত্য জানিয়ে চাবিটা হাতে তুলে দাও' },
            hint: { en: 'Total Honesty · +Trust', hi: 'पूर्ण ईमानदारी · +विश्वास', bn: 'পূর্ণ সততা · +বিশ্বাস' },
            trust: 2, risk: 0
          },
          {
            id: 'a_keep_guard',
            label: { en: 'Hide the danger from {B} & prepare to fight alone', hi: '{B} से खतरा छिपाकर अकेले लड़ने की तैयारी करो', bn: '{B}-এর থেকে বিপদ লুকিয়ে একা লড়ার প্রস্তুতি নাও' },
            hint: { en: 'Lone Wolf · +Risk', hi: 'अकेला कदम · +जोखिम', bn: 'একক ঝুঁকি · +ঝুঁকি' },
            trust: -1, risk: 2
          }
        ],
        choicesB: [
          {
            id: 'b_bind_locket',
            label: { en: 'Place the silver locket in {A}’s hand & lock arms', hi: 'चाँदी का लॉकेट {A} के हाथ में रखकर एक-दूसरे का हाथ थामो', bn: 'রুপার লকেট {A}-এর হাতে রেখে হাত শক্ত করে ধরো' },
            hint: { en: 'Unbreakable Bond · +Trust', hi: 'अटूट बंधन · +विश्वास', bn: 'অটুট বন্ধন · +বিশ্বাস' },
            trust: 2, risk: 0
          },
          {
            id: 'b_set_trap',
            label: { en: 'Use the ledger to bait the Collector onto the bridge', hi: 'बहीखाते को चारा बनाकर कलेक्टर को पुल पर बुलाओ', bn: 'গোপন খাতাকে টোপ বানিয়ে কালেক্টরকে ব্রিজে টেনে আনো' },
            hint: { en: 'High Stakes · +Risk', hi: 'बड़ा दाँव · +जोखिम', bn: 'বড় বাজি · +ঝুঁকি' },
            trust: 0, risk: 2
          }
        ],
        outcomes: {
          'a_share_truth+b_bind_locket': {
            text: {
              en: 'The locket snaps cleanly into the Master Key—glowing with a hidden monogram. {A} and {B} realize the heirloom belongs to them both, not the Collector.',
              hi: 'चाँदी का लॉकेट मास्टर चाबी में बिल्कुल सटीक जुड़ गया। {A} और {B} समझ गए कि यह विरासत कलेक्टर की नहीं, बल्कि उन दोनों के नाम है।',
              bn: 'রুপার লকেটটা মাস্টার চাবির সাথে নিখুঁতভাবে মিলে গেল। {A} ও {B} বুঝল, এই রত্ন কালেক্টরের নয়—বরং তাঁদের দুজনেরই।'
            },
            trust: 1, sfx: 'clueFound', next: 's7_confrontation'
          },
          default: {
            text: {
              en: 'Footsteps ring across the iron bridge rails. Surrounded by swirling fog, the Collector steps forward with lanterns raised.',
              hi: 'लोहे के पुल की पटरियों पर कदमों की आवाज़ गूँज उठी। घने कोहरे से लालटेन उठाए कलेक्टर सामने आ खड़ा हुआ।',
              bn: 'লোহার সেতুর পাটাতনে পায়ের শব্দ গমগম করে উঠল। ঘন কুয়াশা চিরে লণ্ঠন হাতে কালেক্টর সামনে এসে দাঁড়াল।'
            },
            sfx: 'dangerSting', next: 's7_confrontation'
          }
        }
      },

      /* ===== SCENE 7: CLIMAX CONFRONTATION ===== */
      s7_confrontation: {
        id: 's7_confrontation',
        chapterNo: 7,
        totalChapters: 8,
        isSplit: false,
        location: { en: 'Viaduct Center Span · 11:57 PM', hi: 'वायाडक्ट का मध्य भाग · रात 11:57', bn: 'ভায়াডাক্টের মাঝখান · রাত ১১:৫৭' },
        title: { en: 'The Collector’s Ultimatum', hi: 'कलेक्टर की आखिरी शर्त', bn: 'কালেক্টরের চূড়ান্ত শর্ত' },
        bg: 'assets/chronicles/bridge-finale.jpg',
        fx: 'storm-flicker',
        bgm: 'tension_pulse',
        sfx: 'dangerSting',
        narration: {
          en: 'Three minutes until midnight. The Collector—unmasked as the Silver-Eyed Conductor—raises a crimson flare. "Give me the Ledger and the Key, and the train rolls safely to dawn. Refuse, and the bridge seals shut forever."',
          hi: 'आधी रात में तीन मिनट बाकी हैं। कलेक्टर—जो असल में वही सिल्वर-आइड कंडक्टर है—लाल फ़्लेयर उठाता है। "बहीखाता और चाबी मुझे दे दो, ट्रेन सुबह तक सुरक्षित पहुँचेगी। इनकार किया तो यह पुल हमेशा के लिए बंद हो जाएगा।"',
          bn: 'মধ্যরাতের আর তিন মিনিট বাকি। কালেক্টর—যিনি আসলে সেই রুপালি চোখের কন্ডাক্টর—একটি লাল ফ্লেয়ার তুলে ধরলেন। "গোপন খাতা আর চাবি আমাকে দাও, ট্রেন নিরাপদে ভোরে পৌঁছাবে। না দিলে এই সেতু চিরতরে বন্ধ হবে।"'
        },
        dialogue: {
          speaker: { en: 'The Collector', hi: 'कलेक्टर', bn: 'কালেক্টর' },
          line: {
            en: '"Love makes people reckless. Show me what {A} and {B} are truly willing to sacrifice."',
            hi: '"प्यार इंसान को बेपरवाह बना देता है। दिखाओ, {A} और {B} असल में क्या दाँव पर लगा सकते हैं।"',
            bn: '"ভালোবাসা মানুষকে বেপরোয়া করে তোলে। দেখাও তো, {A} আর {B} আসলে কী বাজি রাখতে পারে।"'
          }
        },
        choicesA: [
          {
            id: 'a_stand_firm',
            label: { en: 'Step in front of {B} & expose the Collector to every passenger', hi: '{B} के आगे खड़े होकर सब यात्रियों के सामने कलेक्टर का सच उजागर करो', bn: '{B}-এর সামনে দাঁড়িয়ে সব যাত্রীর সামনে কালেক্টরের মুখোশ খুলে দাও' },
            hint: { en: 'Truth · +Trust', hi: 'सच्चाई · +विश्वास', bn: 'সত্য · +বিশ্বাস' },
            trust: 2, risk: 0
          },
          {
            id: 'a_seize_crown',
            label: { en: 'Demand half of the Collector’s midnight empire', hi: 'कलेक्टर के आधे साम्राज्य पर अपना हक माँगो', bn: 'কালেক্টরের অন্ধকার সাম্রাজ্যের অর্ধেক দাবি করো' },
            hint: { en: 'Shadow Ambition · +Risk', hi: 'काला सौदा · +जोखिम', bn: 'অন্ধকার উচ্চাকাঙ্ক্ষা · +ঝুঁকি' },
            trust: 0, risk: 3
          }
        ],
        choicesB: [
          {
            id: 'b_override_brakes',
            label: { en: 'Turn the Master Key to release the train’s midnight locks', hi: 'मास्टर चाबी घुमाकर ट्रेन के लॉक खोल दो', bn: 'মাস্টার চাবি ঘুরিয়ে ট্রেনের লক খুলে দাও' },
            hint: { en: 'Break Free · +Trust', hi: 'आज़ादी · +विश्वास', bn: 'মুক্তি · +বিশ্বাস' },
            trust: 2, risk: 0
          },
          {
            id: 'b_seal_pact',
            label: { en: 'Hold the flare high & rewrite the Ledger in your own names', hi: 'फ़्लेयर थामकर बहीखाते पर अपने और {A} के नाम लिख दो', bn: 'ফ্লেয়ার উঁচু করে গোপন খাতায় নিজেদের নাম লিখে দাও' },
            hint: { en: 'Bold Gambit · +Risk', hi: 'बड़ा जुआ · +जोखिम', bn: 'বড় ঝুঁকি · +ঝুঁকি' },
            trust: 1, risk: 2
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'The midnight bell begins to toll across the valley—one final choice decides how {A} and {B}’s chronicle is written forever.',
              hi: 'घाटी में आधी रात की घंटी बज उठी—अब एक आखिरी फैसला हमेशा के लिए {A} और {B} की कहानी का अंत लिखेगा।',
              bn: 'উপত্যকাজুড়ে মধ্যরাতের ঘণ্টা বেজে উঠল—শেষ একটি সিদ্ধান্তই চিরদিনের জন্য {A} ও {B}-এর কাহিনির সমাপ্তি লিখবে।'
            },
            sfx: 'thunder',
            next: 's8_viaduct_choice'
          }
        }
      },

      /* ===== SCENE 8: FINAL CHOICE BEFORE ENDING ===== */
      s8_viaduct_choice: {
        id: 's8_viaduct_choice',
        chapterNo: 8,
        totalChapters: 8,
        isSplit: false,
        location: { en: 'Midnight Bell · The Final Decision', hi: 'आधी रात की घंटी · अंतिम फैसला', bn: 'মধ্যরাতের ঘণ্টা · শেষ সিদ্ধান্ত' },
        title: { en: 'Before the Twelfth Chime', hi: 'बारहवीं घंटी से पहले', bn: 'দ্বাদশ ঘণ্টার আগে' },
        bg: 'assets/chronicles/bridge-finale.jpg',
        fx: 'rain-embers',
        bgm: 'reunion_strings',
        sfx: 'heartbeat',
        narration: {
          en: 'Steam roars as the locomotive awakens. The storm clouds split above Blackthorn Viaduct, bathing {A} and {B} in silver starlight. Your final heartbeat together seals the ending of your chronicle.',
          hi: 'इंजन गरजते हुए फिर जाग उठा। ब्लैकथॉर्न वायाडक्ट के ऊपर तूफ़ानी बादल फट गए और {A} व {B} पर चाँदनी बरसने लगी। एक साथ लिया यह आखिरी फैसला आपकी पूरी कहानी का अंजाम तय करेगा।',
          bn: 'বাষ্পের গর্জনে ইঞ্জিন আবার জেগে উঠল। ব্ল্যাকথর্ন ভায়াডাক্টের ওপর ঝড়ের মেঘ সরে গিয়ে {A} ও {B}-কে রুপালি আলোয় ভরিয়ে দিল। তোমাদের শেষ সিদ্ধান্তেই লেখা হবে চূড়ান্ত পরিণতি।'
        },
        dialogue: {
          speaker: { en: 'Final Heartbeat', hi: 'आखिरी धड़कन', bn: 'শেষ হৃদস্পন্দন' },
          line: {
            en: '"Whatever waits beyond the storm, we cross this bridge as one."',
            hi: '"तूफ़ान के पार जो भी इंतज़ार कर रहा हो, यह पुल हम एक होकर पार करेंगे।"',
            bn: '"ঝড়ের ওপারে যা-ই অপেক্ষা করুক, এই সেতু আমরা একসাথেই পার হব।"'
          }
        },
        choicesA: [
          {
            id: 'a_velvet_vow',
            label: { en: 'Hold {B}’s hand & ride the Express into the golden dawn', hi: '{B} का हाथ थामकर सुनहरी सुबह की ओर बढ़ो', bn: '{B}-এর হাত ধরে সোনালি ভোরের দিকে এগিয়ে চলো' },
            hint: { en: 'Devotion · +Trust', hi: 'समर्पण · +विश्वास', bn: 'ভালোবাসা · +বিশ্বাস' },
            trust: 2, risk: -1
          },
          {
            id: 'a_night_throne',
            label: { en: 'Claim the Midnight Express & command the shadows together', hi: 'मिडनाइट एक्सप्रेस पर कब्ज़ा कर रात के शासक बनो', bn: 'মিডনাইট এক্সপ্রেস দখল করে রাতের শাসক হও' },
            hint: { en: 'Power · +Risk', hi: 'ताकत · +जोखिम', bn: 'ক্ষমতা · +ঝুঁকি' },
            trust: 0, risk: 3
          }
        ],
        choicesB: [
          {
            id: 'b_keep_vow',
            label: { en: 'Seal the locket over {A}’s heart & leave the darkness behind', hi: 'लॉकेट को {A} के दिल के पास रखकर अंधेरा पीछे छोड़ दो', bn: 'লকেটটি {A}-এর বুকে রেখে অন্ধকার পেছনে ফেলে যাও' },
            hint: { en: 'Light · +Trust', hi: 'रोशनी · +विश्वास', bn: 'আলো · +বিশ্বাস' },
            trust: 2, risk: -1
          },
          {
            id: 'b_vanish_mist',
            label: { en: 'Step off into the mountain mist with {A} before sunrise', hi: 'सूरज निकलने से पहले {A} के साथ पहाड़ी धुंध में गायब हो जाओ', bn: 'সূর্য ওঠার আগেই {A}-এর সাথে পাহাড়ি কুয়াশায় মিলিয়ে যাও' },
            hint: { en: 'Mystery · +Risk', hi: 'रहस्य · +जोखिम', bn: 'রহস্য · +ঝুঁকি' },
            trust: 1, risk: 2
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'The twelfth chime fades into the dawn. Your Couple Chronicle is complete.',
              hi: 'बारहवीं घंटी सुबह की रोशनी में घुल गई। आपकी कपल क्रॉनिकल पूरी हुई।',
              bn: 'দ্বাদশ ঘণ্টা ভোরের আলোয় মিলিয়ে গেল। তোমাদের কাপল ক্রনিকল সম্পূর্ণ হলো।'
            },
            sfx: 'endingReveal',
            next: 'ENDING'
          }
        }
      }
    },

    /* ===== 4 DISTINCT UNLOCKABLE ENDINGS ===== */
    endings: {
      velvet_vow: {
        id: 'velvet_vow',
        tier: 'True Ending · 1 of 4',
        badge: { en: 'True Ending · The Velvet Vow', hi: 'सच्चा अंत · मखमली वादा', bn: 'আসল সমাপ্তি · মখমলের শপথ' },
        title: { en: 'The Velvet Vow at Dawn', hi: 'भोर का मखमली वादा', bn: 'ভোরের মখমলের শপথ' },
        bg: 'assets/chronicles/bridge-finale.jpg',
        accent: '#f59e0b',
        epilogue: {
          en: 'As gold breaks over the mountains, the Collector’s plot collapses in front of every witness. Hand in hand inside the sunlit dining car, {A} and {B} keep the twin halves of the silver locket—living proof that not even a midnight storm could sever the trust between you.',
          hi: 'पहाड़ों के ऊपर सुनहरी सुबह खिलते ही सब गवाहों के सामने कलेक्टर की साज़िश ढह गई। धूप से भरे डाइनिंग कार में हाथ थामे {A} और {B} के पास चाँदी के लॉकेट के दोनों हिस्से हैं—यह सबूत कि आधी रात का तूफ़ान भी आपका विश्वास नहीं तोड़ सका।',
          bn: 'পাহাড়ের ওপরে সোনালি ভোর নামতেই সব সাক্ষীর সামনে কালেক্টরের ষড়যন্ত্র ভেঙে পড়ল। রোদে ভরা ডাইনিং কারে হাত ধরে বসে থাকা {A} ও {B}-এর কাছে রুপার লকেটের দুটি অংশই রইল—প্রমাণ যে মধ্যরাতের ঝড়ও তোমাদের বিশ্বাস ভাঙতে পারেনি।'
        }
      },
      shadow_pact: {
        id: 'shadow_pact',
        tier: 'Dark Ending · 2 of 4',
        badge: { en: 'Dark Ending · The Shadow Pact', hi: 'डार्क अंत · साये का सौदा', bn: 'ডার্ক সমাপ্তি · ছায়ার চুক্তি' },
        title: { en: 'Sovereigns of the Midnight Express', hi: 'मिडनाइट एक्सप्रेस के शासक', bn: 'মিডনাইট এক্সপ্রেসের অধিপতি' },
        bg: 'assets/chronicles/dining-car.jpg',
        accent: '#e11d48',
        epilogue: {
          en: 'Instead of surrendering to the Collector, {A} and {B} outplayed the shadows at their own game. With the Secret Ledger rewritten in both your names, the Velvet Express now rides only at your command—two fearless partners bound by a deliciously dangerous pact.',
          hi: 'कलेक्टर के आगे झुकने के बजाय {A} और {B} ने सायों को उन्हीं के खेल में मात दी। गुप्त बहीखाते पर अब आप दोनों के नाम दर्ज हैं, और वेलवेट एक्सप्रेस सिर्फ़ आपके इशारे पर चलती है—खतरनाक लेकिन अटूट साझेदारी।',
          bn: 'কালেক্টরের কাছে মাথা নত না করে {A} ও {B} ছায়াদের তাদেরই খেলায় হারিয়ে দিল। গোপন খাতায় এখন তোমাদের দুজনের নাম, আর ভেলভেট এক্সপ্রেস চলে কেবল তোমাদের নির্দেশেই—এক রোমাঞ্চকর ও অটুট চুক্তি।'
        }
      },
      crimson_escape: {
        id: 'crimson_escape',
        tier: 'Thriller Ending · 3 of 4',
        badge: { en: 'Thriller Ending · Crimson Escape', hi: 'थ्रिलर अंत · क्रिमसन फ़रार', bn: 'থ্রিলার সমাপ্তি · রক্তিম পলায়ন' },
        title: { en: 'Vanished Beyond the Viaduct', hi: 'वायाडक्ट के पार लापता', bn: 'ভায়াডাক্টের ওপারে নিরুদ্দেশ' },
        bg: 'assets/chronicles/velvet-cover.jpg',
        accent: '#a855f7',
        epilogue: {
          en: 'Before the bridge gates could lock, {A} and {B} leaped into the pine-scented mountain mist with the Master Key tucked safely away. By morning, only two warm footprints and a crimson ticket remained on Platform 13—your greatest adventure has only just begun.',
          hi: 'पुल के दरवाज़े बंद होने से पहले {A} और {B} मास्टर चाबी लेकर पहाड़ी धुंध में ओझल हो गए। सुबह प्लेटफॉर्म 13 पर बस एक लाल टिकट मिला—आपकी असली कहानी अभी शुरू हुई है।',
          bn: 'সেতুর দরজা বন্ধ হওয়ার আগেই {A} ও {B} মাস্টার চাবি নিয়ে পাহাড়ি কুয়াশায় মিলিয়ে গেল। সকালে প্ল্যাটফর্ম ১৩-এ পড়ে রইল শুধু একটি লাল টিকিট—তোমাদের আসল রোমাঞ্চ কেবল শুরু হলো।'
        }
      },
      midnight_ghost: {
        id: 'midnight_ghost',
        tier: 'Mystery Ending · 4 of 4',
        badge: { en: 'Mystery Ending · Whispers in Fog', hi: 'रहस्यमय अंत · कोहरे की सरगोशी', bn: 'রহস্য সমাপ্তি · কুয়াশার ফিসফিসানি' },
        title: { en: 'Echoes of Cabin 7', hi: 'केबिन 7 की गूँज', bn: 'কেবিন ৭-এর প্রতিধ্বনি' },
        bg: 'assets/chronicles/compartment-archive.jpg',
        accent: '#38bdf8',
        epilogue: {
          en: 'The Express rolled into the dawn station with half its secrets still locked in shadow. Though {A} and {B} survived the night, the unanswered riddle of Cabin 7 lingers—calling you both back to replay and uncover the Velvet Vow.',
          hi: 'एक्सप्रेस सुबह स्टेशन पर पहुँच गई, लेकिन आधे राज़ अब भी साये में बंद रह गए। {A} और {B} रात से बच निकले, पर केबिन 7 की अनसुलझी पहेली आपको दोबारा खेलकर सच्चा अंत खोजने के लिए बुला रही है।',
          bn: 'ভোরের স্টেশনে এক্সপ্রেস পৌঁছাল বটে, কিন্তু অর্ধেক রহস্য তখনও ছায়ায় ঢাকা। {A} ও {B} রাতটা পেরিয়ে এলেও কেবিন ৭-এর অমীমাংসিত ধাঁধা তোমাদের আবার ফিরে আসার ডাক দিচ্ছে।'
        }
      }
    }
  };

  const STORIES_CATALOG = [MIDNIGHT_EXPRESS];

  function registerChronicleStory(storyObj) {
    if (!storyObj || !storyObj.id || !storyObj.scenes) return false;
    const idx = STORIES_CATALOG.findIndex(s => s && s.id === storyObj.id);
    if (idx >= 0) STORIES_CATALOG[idx] = storyObj;
    else STORIES_CATALOG.push(storyObj);
    return true;
  }

  function getChronicleStoryById(storyId) {
    return STORIES_CATALOG.find(s => s && s.id === storyId) || STORIES_CATALOG[0] || null;
  }

  global.CHRONICLE_CLUE_LABELS = CLUE_LABELS;
  global.STORIES_CATALOG = STORIES_CATALOG;
  global.registerChronicleStory = registerChronicleStory;
  global.getChronicleStoryById = getChronicleStoryById;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STORIES_CATALOG, CLUE_LABELS, registerChronicleStory, getChronicleStoryById };
  }
})(typeof window !== 'undefined' ? window : globalThis);
