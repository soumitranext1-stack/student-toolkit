"use strict";
/* =====================================================================
   COUPLE CHRONICLES — MODULAR STORY LIBRARY DATA (`STORIES_CATALOG`)
   · Flagship Emotional Romantic Drama:
     "Velvet & Rain: A Love Divided" (Amir Ladki vs Garib Ladka /
     Ek Duniya, Do Kahaani)
   · 7 Chapters across 10 interconnected scenes:
     - Split Opening (Separate Worlds), Late-Night Call, Split Conflict,
       Rain Reunion #1, Split Climax Pressure, Mansion Courtyard Reunion #2,
       Final Dawn Crossroads -> 4 Distinct Endings.
   · Zero heavy .jpg files — uses clean layered SVG + CSS scene themes.
   · Complete EN / HI / BN scripts with {A} & {B} partner name insertion.
   ===================================================================== */
(function (global) {
  const MEMORY_LABELS = {
    rain_umbrella: {
      en: 'Torn Monsoon Umbrella',
      hi: 'बारिश वाली पुरानी छतरी',
      bn: 'বৃষ্টিভেজা পুরোনো ছাতা'
    },
    folded_bill: {
      en: 'Hidden Clinic Receipt',
      hi: 'छिपाई हुई दवाई की पर्ची',
      bn: 'লুকানো ওষুধের রসিদ'
    },
    silver_bangle: {
      en: 'Heirloom Velvet Bangle',
      hi: 'कोठी वाला चाँदी का कंगन',
      bn: 'প্রাসাদের রুপার বালা'
    },
    midnight_call_vow: {
      en: '2 AM Rain Promise',
      hi: 'आधी रात की कॉल का वादा',
      bn: 'মধ্যরাতের ফোনের প্রতিশ্রুতি'
    },
    torn_cheque: {
      en: 'Torn Blank Cheque',
      hi: 'फाड़ा हुआ ब्लैंक चेक (ख़ुद्दारी)',
      bn: 'ছেঁড়া ব্ল্যাঙ্ক চেক (আত্মসম্মান)'
    },
    velvet_letter: {
      en: 'Diary Letter in Velvet Ribbon',
      hi: 'मखमली रिबन में बँधी चिट्ठी',
      bn: 'মখমলের ফিতেয় বাঁধা চিঠি'
    },
    bridge_promise: {
      en: 'Old Footbridge Rain Vow',
      hi: 'स्टेशन ब्रिज की बारिश में वादा',
      bn: 'ফুটব্রিজে বৃষ্টির শপথ'
    },
    workshop_blueprint: {
      en: 'Late-Night Dream Blueprint',
      hi: 'छोटे कमरे का सपना और नक्शा',
      bn: 'ছোট ঘরের স্বপ্নের নকশা'
    },
    mansion_keys: {
      en: 'Keys Left on the Marble Table',
      hi: 'मार्बल टेबल पर छोड़ी कोठी की चाबी',
      bn: 'মার্বেল টেবিলে রেখে আসা চাবি'
    }
  };

  const VELVET_AND_RAIN = {
    id: 'velvet_and_rain_love_divided',
    title: 'Velvet & Rain: A Love Divided',
    titleLocalized: {
      en: 'Velvet & Rain: A Love Divided',
      hi: 'एक दुनिया, दो कहानी: अमीर लड़की और ग़रीब लड़का',
      bn: 'মখমল ও বৃষ্টি: দুই পৃথিবীর ভালোবাসা'
    },
    tagline: 'He fights monsoon storms, debt, and pride in a tiny lane. She lives behind chandelier arches and family walls. Two separate worlds—one forbidden love.',
    taglineLocalized: {
      en: 'He fights monsoon storms, debt, and pride in a tiny lane. She lives behind chandelier arches and family walls. Two separate worlds—one forbidden love.',
      hi: 'एक तरफ़ छोटी गली, मेहनत और ख़ुद्दारी का संघर्ष—दूसरी तरफ़ बड़ी कोठी, रईसी और बंदिशों की दीवार। दो अलग दुनिया, और हर फैसले पर टिका एक सच्चा प्यार।',
      bn: 'একদিকে বৃষ্টির গলি, অভাব আর আত্মসম্মানের লড়াই—অন্যদিকে বড় কোঠি, আভিজাত্য আর পরিবারের দেয়াল। দুই ভিন্ন পৃথিবী, আর প্রতিটি সিদ্ধান্তে বাঁধা এক ভালোবাসা।'
    },
    genre: 'Romantic Drama',
    accent: '#c9335b',
    artTheme: 'cover_divided',
    duration: '12–15 min',
    endingsCount: 4,
    scenesCount: 10,
    roles: {
      A: {
        title: {
          en: 'Partner A · The Dreamer (Struggle & Pride)',
          hi: 'पार्टनर A · मेहनत और ख़ुद्दारी (लड़का)',
          bn: 'পার্টনার A · সংগ্রাম ও আত্মসম্মান (ছেলে)'
        },
        desc: {
          en: 'Carry family responsibility, self-respect, and dreams through the rain.',
          hi: 'घर की ज़िम्मेदारी, तंगी, स्वाभिमान और अपने प्यार के बीच फैसले लो।',
          bn: 'পরিবারের দায়িত্ব, অভাব, আত্মসম্মান আর ভালোবাসার মাঝে সিদ্ধান্ত নাও।'
        }
      },
      B: {
        title: {
          en: 'Partner B · The Heiress (Mansion & Freedom)',
          hi: 'पार्टनर B · बड़ी कोठी और आज़ादी (लड़की)',
          bn: 'পার্টনার B · রাজপ্রাসাদ ও স্বাধীনতা (মেয়ে)'
        },
        desc: {
          en: 'Stand between mansion status, family expectations, and your own heart.',
          hi: 'बड़ी कोठी की पाबंदियों, रिश्ते के दबाव और अपने दिल के बीच रास्ता चुनो।',
          bn: 'অভিজাত পরিবারের বাঁধন, সম্মানের চাপ আর নিজের হৃদয়ের মাঝে পথ খোঁজো।'
        }
      }
    },
    startSceneId: 's1a_rain_lane',
    startSceneIdA: 's1a_rain_lane',
    startSceneIdB: 's1b_kothi_balcony',
    scenes: {
      /* ===== CHAPTER 1 (SPLIT OPENING): TWO SEPARATE WORLDS ===== */
      s1a_rain_lane: {
        id: 's1a_rain_lane',
        chapterNo: 1,
        totalChapters: 7,
        isSplit: true,
        role: 'A',
        location: {
          en: 'SPLIT WORLD · Partner A · Rainy Repair Lane, 9:40 PM',
          hi: 'अलग दुनिया · पार्टनर A · बारिश वाली छोटी गली, रात 9:40',
          bn: 'ভিন্ন পৃথিবী · পার্টনার A · বৃষ্টিভেজা গলি, রাত ৯:৪০'
        },
        title: {
          en: 'Rain on the Tin Roof',
          hi: 'टीन की छत पर बारिश और ख़ुद्दारी',
          bn: 'টিনের চালে বৃষ্টি ও লড়াই'
        },
        artTheme: 'rain_lane',
        fx: 'rain-fog',
        bgm: 'monsoon_piano',
        sfx: 'rainChime',
        narration: {
          en: 'Monsoon rain pours over the narrow lane outside {A}’s tiny repair room. On the wooden table sit Mother’s medicine bills and a half-finished design sketch. Suddenly, {A}’s cracked phone lights up with a message from {B}: "Everyone downstairs is talking about my engagement. Are you free to talk?"',
          hi: 'छोटी सी गली और टीन की छत पर तेज़ बारिश बरस रही है। लकड़ी की मेज़ पर माँ की दवाई की पर्ची और {A} का अधूरा सपना पड़ा है। तभी टूटे स्क्रीन वाले फ़ोन पर {B} का मैसेज चमकता है: "नीचे हॉल में मेरी सगाई की बात चल रही है... क्या तुम अभी बात कर सकते हो?"',
          bn: 'সরু গলি আর ছোট ঘরের টিনের চালে ঝমঝম করে বৃষ্টি পড়ছে। কাঠের টেবিলে মায়ের ওষুধের বিল আর {A}-এর অসমাপ্ত নকশা। ঠিক তখনই ফাটা স্ক্রিনের ফোনে {B}-এর মেসেজ ভেসে ওঠে: "নিচে সবাই আমার বিয়ের কথা বলছে... তুমি কি একটু কথা বলতে পারবে?"'
        },
        dialogue: {
          speaker: { en: '{A}’s Quiet Struggle', hi: '{A} के दिल की उलझन', bn: '{A}-এর নীরব লড়াই' },
          line: {
            en: '"My pockets are nearly empty tonight, yet {B} trusts me more than the whole mansion."',
            hi: '"जेब में आज बस किराये और दवाई के पैसे हैं, फिर भी {B} को पूरी कोठी से ज़्यादा मुझ पर भरोसा है।"',
            bn: '"পকেটে আজ শুধু মায়ের ওষুধের টাকা, তবুও {B} পুরো প্রাসাদের চেয়ে আমাকে বেশি বিশ্বাস করে।"'
          }
        },
        choices: [
          {
            id: 'a_honest_work',
            label: {
              en: 'Finish the night shift honestly & tell {B} the truth about your struggle',
              hi: 'ईमानदारी से नाइट शिफ्ट पूरी करो और {B} को अपनी तंगी का पूरा सच बताओ',
              bn: 'রাতের কাজ সততার সাথে শেষ করো আর {B}-কে নিজের লড়াইয়ের পুরো সত্য বলো'
            },
            hint: {
              en: 'Honesty & Pride · +Trust / +Courage',
              hi: 'सच्चाई और ख़ुद्दारी · +विश्वास / +हिम्मत',
              bn: 'সততা ও আত্মসম্মান · +বিশ্বাস / +সাহস'
            },
            trust: 2, courage: 1, sacrifice: 0, status: 0, memory: 'rain_umbrella'
          },
          {
            id: 'a_hide_burden',
            label: {
              en: 'Hide the medicine bills & smile so {B} never feels burdened by your poverty',
              hi: 'दवाई के बिल छिपा लो और मुस्कुराकर बात करो ताकि {B} तुम्हारी मजबूरी से परेशान न हो',
              bn: 'ওষুধের বিল লুকিয়ে হাসিমুখে কথা বলো যাতে {B} তোমার কষ্টে ভেঙে না পড়ে'
            },
            hint: {
              en: 'Silent Sacrifice · +Sacrifice',
              hi: 'ख़ामोश क़ुर्बानी · +त्याग',
              bn: 'নীরব ত্যাগ · +ত্যাগ'
            },
            trust: 0, courage: 0, sacrifice: 2, status: 0, memory: 'folded_bill'
          }
        ],
        outcomes: {
          'a_honest_work+b_refuse_dinner': {
            text: {
              en: 'Across the rain-washed city, both {A} and {B} choose courage over silence. Even miles apart, their hearts beat on the exact same rhythm as midnight approaches.',
              hi: 'बारिश में भीगे शहर के दो छोरों पर {A} और {B} दोनों ने ख़ामोशी के बजाय सच और हिम्मत को चुना। मीलों दूर होकर भी दोनों के दिल एक ही धड़कन पर जुड़ गए।',
              bn: 'বৃষ্টিভেজা শহরের দুই প্রান্তে {A} ও {B} দুজনেই নীরবতার বদলে সত্য আর সাহস বেছে নিল। বহু দূরে থেকেও দুজনের হৃদয় একই সুরে বাঁধা পড়ে রইল।'
            },
            trust: 1, sfx: 'heartSwell', next: 's2_midnight_call'
          },
          default: {
            text: {
              en: 'The rain grows heavier over both the tin roof and the marble balcony. With their separate worlds pressing in, {A} and {B} wait for the house to fall silent for a midnight call.',
              hi: 'टीन की छत और संगमरमर की बालकनी—दोनों पर बारिश और तेज़ हो गई। अपनी-अपनी दुनिया के दबाव के बीच {A} और {B} आधी रात की कॉल का इंतज़ार करने लगे।',
              bn: 'টিনের চাল আর মার্বেলের বারান্দা—দুই জায়গাতেই বৃষ্টি আরও বাড়ল। দুই ভিন্ন পৃথিবীর চাপ মাথায় নিয়ে {A} ও {B} মধ্যরাতের ফোনের অপেক্ষায় রইল।'
            },
            sfx: 'phoneBuzz', next: 's2_midnight_call'
          }
        }
      },

      s1b_kothi_balcony: {
        id: 's1b_kothi_balcony',
        chapterNo: 1,
        totalChapters: 7,
        isSplit: true,
        role: 'B',
        location: {
          en: 'SPLIT WORLD · Partner B · Kapoor Kothi Balcony, 9:40 PM',
          hi: 'अलग दुनिया · पार्टनर B · बड़ी कोठी की बालकनी, रात 9:40',
          bn: 'ভিন্ন পৃথিবী · পার্টনার B · বড় কোঠির বারান্দা, রাত ৯:৪০'
        },
        title: {
          en: 'Behind Chandelier Walls',
          hi: 'झूमर की रोशनी और बंदिशें',
          bn: 'ঝাড়বাতির আলো ও বন্দী জীবন'
        },
        artTheme: 'kothi_balcony',
        fx: 'candle-embers',
        bgm: 'mansion_velvet',
        sfx: 'sceneOpen',
        narration: {
          en: 'Golden chandeliers glitter inside the grand marble hall while {B} steps onto the rain-misted balcony. Downstairs, {B}’s father is shaking hands with a wealthy industrialist’s son. Guards stand at the wrought-iron gate, and Mother whispers: "Status protects a daughter—dreams do not."',
          hi: 'बड़ी कोठी के संगमरमर हॉल में सुनहरे झूमर चमक रहे हैं और {B} बारिश की धुंध से भरी बालकनी में खड़ी है। नीचे पापा एक बड़े बिज़नेसमैन के बेटे से रिश्ते की बात पक्की कर रहे हैं। माँ धीमे से कहती हैं: "बेटी, बड़ी हैसियत ही ज़िंदगी संभालती है, ख़ाली सपने नहीं।"',
          bn: 'বিশাল মার্বেল হলে সোনালি ঝাড়বাতি জ্বলছে, আর {B} বৃষ্টির কুয়াশা ভেজা বারান্দায় একা দাঁড়িয়ে। নিচে বাবা এক ধনী শিল্পপতির ছেলের সাথে বিয়ের কথা বলছেন। মা ফিসফিস করে বললেন: "সম্মান আর ঐশ্বর্যই জীবন বাঁচায়, শুধু স্বপ্ন নয়।"'
        },
        dialogue: {
          speaker: { en: '{B}’s Heart in the Mansion', hi: '{B} के मन की आवाज़', bn: '{B}-এর মনের কথা' },
          line: {
            en: '"Everyone thinks this velvet cage is paradise—only {A} ever asked if I am truly happy."',
            hi: '"सबको लगता है इस मखमली महल में हर ख़ुशी है—सिर्फ़ {A} ने कभी पूछा कि मैं सच में ख़ुश हूँ या नहीं।"',
            bn: '"সবাই ভাবে এই মখমলের প্রাসাদে সব সুখ আছে—শুধু {A} জানতে চেয়েছিল আমি সত্যিই ভালো আছি কি না।"'
          }
        },
        choices: [
          {
            id: 'b_refuse_dinner',
            label: {
              en: 'Speak up politely at the dinner table & refuse the rushed alliance',
              hi: 'डिनर टेबल पर साफ़ और सलीके से कहो कि तुम अभी इस रिश्ते के लिए तैयार नहीं हो',
              bn: 'ডিনার টেবিলে স্পষ্ট অথচ শান্তভাবে জানিয়ে দাও যে তুমি এই বিয়েতে রাজি নও'
            },
            hint: {
              en: 'Bold Voice · +Courage / +Trust',
              hi: 'साफ़ आवाज़ · +हिम्मत / +विश्वास',
              bn: 'সাহসী কণ্ঠ · +সাহস / +বিশ্বাস'
            },
            trust: 1, courage: 2, sacrifice: 0, status: 0, memory: 'silver_bangle'
          },
          {
            id: 'b_quiet_delay',
            label: {
              en: 'Stay silent for now to avoid a scene & buy time to call {A} tonight',
              hi: 'अभी हंगामा टालने के लिए ख़ामोश रहो ताकि रात को चुपके से {A} को कॉल कर सको',
              bn: 'এখন অশান্তি এড়াতে চুপ থাকো যাতে রাতে গোপনে {A}-কে ফোন করার সময় পাও'
            },
            hint: {
              en: 'Family Caution · +Status / +Sacrifice',
              hi: 'परिवार का लिहाज़ · +परिवार / +त्याग',
              bn: 'পরিবারের চাপ · +সম্মান / +ত্যাগ'
            },
            trust: 0, courage: 0, sacrifice: 1, status: 2
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'Midnight settles over the mansion gardens. Locking the balcony glass softly, {B} dials {A}’s number as thunder rolls across the sky.',
              hi: 'कोठी के बगीचे में सन्नाटा छा गया। बालकनी का शीशा धीरे से बंद कर {B} ने {A} का नंबर मिलाया—उधर बारिश में फ़ोन की घंटी बज उठी।',
              bn: 'কোঠির বাগানে গভীর রাত নেমে এল। বারান্দার দরজা আলতো করে বন্ধ করে {B} ফোন করল {A}-কে—ওদিকে বৃষ্টির মাঝে ফোন বেজে উঠল।'
            },
            sfx: 'phoneBuzz', next: 's2_midnight_call'
          }
        }
      },

      /* ===== CHAPTER 2 (SHARED): LATE-NIGHT CALL ACROSS TWO WORLDS ===== */
      s2_midnight_call: {
        id: 's2_midnight_call',
        chapterNo: 2,
        totalChapters: 7,
        isSplit: false,
        location: {
          en: '2:05 AM · Late-Night Call Across the Rainy City',
          hi: 'रात 2:05 · दो दुनिया को जोड़ती आधी रात की कॉल',
          bn: 'রাত ২:০৫ · দুই পৃথিবীর মাঝে মধ্যরাতের ফোনকল'
        },
        title: {
          en: 'Two Voices, One Monsoon Night',
          hi: 'एक बारिश, दो छोर, और अनकहे डर',
          bn: 'একই বৃষ্টি, দুই প্রান্তের কণ্ঠস্বর'
        },
        artTheme: 'midnight_call',
        fx: 'rain-warm',
        bgm: 'midnight_call',
        sfx: 'phoneBuzz',
        narration: {
          en: 'On one end of the call, rain taps against a rusted tin awning; on the other, soft silk curtains sway over marble floors. {A} hears the tremor in {B}’s voice, and {B} hears the exhaustion behind {A}’s gentle laugh. Tomorrow morning, {B}’s father plans to visit {A}’s workshop.',
          hi: 'कॉल के एक छोर पर टीन की छत पर बूँदें गिर रही हैं, और दूसरे छोर पर संगमरमर के कमरे में रेशमी पर्दे हिल रहे हैं। {A} को {B} की आवाज़ की कंपकंपी सुनाई देती है, और {B} को {A} की थकान। कल सुबह {B} के पापा ख़ुद {A} की वर्कशॉप आने वाले हैं।',
          bn: 'ফোনের এক প্রান্তে টিনের চালে বৃষ্টির শব্দ, অন্য প্রান্তে মার্বেল ঘরের নীরবতা। {A} শুনতে পায় {B}-এর গলার কাঁপুনি, আর {B} টের পায় {A}-এর সারাদিনের ক্লান্তি। কাল সকালেই {B}-এর বাবা {A}-এর ওয়ার্কশপে আসছেন।'
        },
        dialogue: {
          speaker: { en: 'Whispered Over the Line', hi: 'फ़ोन पर धीमी सरगोशी', bn: 'ফোনের ওপার থেকে ফিসফিসানি' },
          line: {
            en: '"If the whole world measures us in rupees and surnames, how do we keep each other safe?"',
            hi: '"अगर सारी दुनिया हमें पैसों और बड़े नाम से तौलती है, तो हम एक-दूसरे को कैसे बचाएंगे?"',
            bn: '"পুরো পৃথিবী যদি আমাদের টাকা আর পদবি দিয়ে মাপে, তবে আমরা একে অপরকে কীভাবে আগলে রাখব?"'
          }
        },
        choicesA: [
          {
            id: 'a_vow_earn_future',
            label: {
              en: 'Promise {B}: "Give me your hand—I will earn our future with dignity, never fear"',
              hi: '{B} से वादा करो: "बस मेरा विश्वास मत तोड़ना, मैं अपनी मेहनत और इज़्ज़त से काबिल बनकर दिखाऊँगा"',
              bn: '{B}-কে কথা দাও: "শুধু বিশ্বাস রেখো, আমি নিজের পরিশ্রম আর সম্মান দিয়ে আমাদের ভবিষ্যৎ গড়ব"'
            },
            hint: {
              en: 'Devotion & Pride · +Trust / +Courage',
              hi: 'वादा और स्वाभिमान · +विश्वास / +हिम्मत',
              bn: 'প্রতিশ্রুতি ও সাহস · +বিশ্বাস / +সাহস'
            },
            trust: 2, courage: 1, sacrifice: 0, status: 0, memory: 'midnight_call_vow'
          },
          {
            id: 'a_offer_release',
            label: {
              en: 'Say softly: "If loving me hurts your family, I will step back without blaming you"',
              hi: 'नम आवाज़ में कहो: "अगर मेरे कारण तुम्हारे घर में दुख है, तो मैं बिना शिकायत पीछे हट जाऊँगा"',
              bn: 'নরম গলায় বলো: "আমার জন্য তোমার পরিবারে অশান্তি হলে আমি নীরবে সরে দাঁড়াব"'
            },
            hint: {
              en: 'Selfless Step Back · +Sacrifice',
              hi: 'निःस्वार्थ त्याग · +त्याग',
              bn: 'নিঃস্বার্থ ত্যাগ · +ত্যাগ'
            },
            trust: 0, courage: -1, sacrifice: 2, status: 1
          }
        ],
        choicesB: [
          {
            id: 'b_choose_heart',
            label: {
              en: 'Tell {A}: "I never wanted a palace—I only want a home where we can breathe"',
              hi: '{A} से कहो: "मुझे कोई महल नहीं चाहिए—मुझे बस वो घर चाहिए जहाँ हम खुलकर जी सकें"',
              bn: '{A}-কে বলো: "আমার কোনো প্রাসাদ চাই না—আমি শুধু সেই ঘর চাই যেখানে আমরা শান্তিতে বাঁচতে পারব"'
            },
            hint: {
              en: 'Unshakable Love · +Trust / +Courage',
              hi: 'अटूट प्यार · +विश्वास / +हिम्मत',
              bn: 'অটুট ভালোবাসা · +বিশ্বাস / +সাহস'
            },
            trust: 2, courage: 1, sacrifice: 0, status: 0
          },
          {
            id: 'b_fear_father',
            label: {
              en: 'Warn {A}: "Please be careful tomorrow—Papa’s anger can destroy everything you built"',
              hi: '{A} को आगाह करो: "कल संभलकर रहना—पापा का गुस्सा तुम्हारी मेहनत बर्बाद कर सकता है"',
              bn: '{A}-কে সাবধান করো: "কাল সাবধানে থেকো—বাবার রাগ তোমার সব স্বপ্ন ভেঙে দিতে পারে"'
            },
            hint: {
              en: 'Protective Worry · +Status / +Sacrifice',
              hi: 'फ़िक्र और दबाव · +परिवार / +त्याग',
              bn: 'দুশ্চিন্তা ও সতর্কতা · +সম্মান / +ত্যাগ'
            },
            trust: 1, courage: 0, sacrifice: 1, status: 2
          }
        ],
        outcomes: {
          'a_vow_earn_future+b_choose_heart': {
            text: {
              en: 'The line stays connected until dawn’s first birds chirp. Both {A} and {B} hang up with steady hearts—knowing tomorrow’s storm will test every word they promised tonight.',
              hi: 'सुबह की पहली रोशनी तक फ़ोन चलता रहा। {A} और {B} दोनों के दिल में एक सुकून था—कल का तूफ़ान चाहे जितना बड़ा हो, आज का वादा उनके साथ है।',
              bn: 'ভোরের আলো ফোটা পর্যন্ত কথা চলল। {A} ও {B} দুজনেই দৃঢ় মন নিয়ে ফোন রাখল—আগামীকালের ঝড় যত বড়ই হোক, আজকের প্রতিশ্রুতি তাদের শক্তি।'
            },
            trust: 1, sfx: 'heartSwell',
            next: { A: 's3a_cheque_insult', B: 's3b_sagai_wall' }
          },
          default: {
            text: {
              en: 'Before the call disconnects, footsteps approach {B}’s bedroom door. Morning arrives sharply—and their two separate worlds collide with brutal pressure!',
              hi: 'कॉल कटने से पहले ही {B} के कमरे के बाहर कदमों की आहट सुनाई दी। सुबह होते ही दोनों की अलग-अलग दुनिया में सबसे बड़ा इम्तिहान शुरू हो गया!',
              bn: 'কল কাটার আগেই {B}-এর ঘরের বাইরে পায়ের শব্দ শোনা গেল। সকাল হতেই দুই ভিন্ন পৃথিবীতে নেমে এল সবচেয়ে কঠিন পরীক্ষা!'
            },
            sfx: 'dangerSting',
            next: { A: 's3a_cheque_insult', B: 's3b_sagai_wall' }
          }
        }
      },

      /* ===== CHAPTER 3 (SPLIT CONFLICT): THE CHEQUE & THE ENGAGEMENT WALL ===== */
      s3a_cheque_insult: {
        id: 's3a_cheque_insult',
        chapterNo: 3,
        totalChapters: 7,
        isSplit: true,
        role: 'A',
        location: {
          en: 'SPLIT WORLD · Partner A · The Workshop Counter, Morning',
          hi: 'अलग दुनिया · पार्टनर A · छोटी वर्कशॉप, सुबह 10:30',
          bn: 'ভিন্ন পৃথিবী · পার্টনার A · ছোট ওয়ার্কশপ, সকাল ১০:৩০'
        },
        title: {
          en: 'A Blank Cheque on the Table',
          hi: 'मेज़ पर रखा ब्लैंक चेक',
          bn: 'টেবিলে রাখা ব্ল্যাঙ্ক চেক'
        },
        artTheme: 'rain_lane',
        fx: 'storm-flicker',
        bgm: 'heartbreak_tension',
        sfx: 'dangerSting',
        narration: {
          en: 'A gleaming black sedan stops outside the muddy lane. {B}’s father steps into {A}’s modest workshop, looks down at the grease-stained workbench, and slides a crisp signed blank cheque across the counter. "Write any amount that clears your family’s debt—and vanish from {B}’s life forever."',
          hi: 'कीचड़ भरी गली के बाहर एक चमचमाती काली कार रुकती है। {B} के पापा {A} की छोटी सी दुकान में कदम रखते हैं और मेज़ पर एक साइन किया हुआ ब्लैंक चेक रख देते हैं। "जितनी रकम चाहिए भर लो, अपने घर का क़र्ज़ चुकाओ—और {B} की ज़िंदगी से हमेशा के लिए दूर हो जाओ।"',
          bn: 'কাদামাখা গলির সামনে একটা চকচকে কালো গাড়ি এসে থামল। {B}-এর বাবা {A}-এর ছোট ওয়ার্কশপে ঢুকে টেবিলের ওপর একটা সই করা ব্ল্যাঙ্ক চেক ছুঁড়ে দিলেন। "যত টাকা লাগে লিখে নাও, সংসারের ঋণ মেটাও—আর {B}-এর জীবন থেকে চিরতরে সরে যাও।"'
        },
        dialogue: {
          speaker: { en: '{B}’s Father', hi: '{B} के पिता', bn: '{B}-এর বাবা' },
          line: {
            en: '"Love fades in a leaky room, young man. Take this paper and save both of you from humiliation."',
            hi: '"टपकती छत के नीचे मोहब्बत ज़्यादा दिन नहीं टिकती, लड़के। यह चेक लो और दोनों की इज़्ज़त बचा लो।"',
            bn: '"ভাঙা চালের নিচে ভালোবাসা বেশিদিন বাঁচে না। এই চেকটা নাও, দুজনেরই সম্মান বাঁচাও।"'
          }
        },
        choices: [
          {
            id: 'a_tear_cheque',
            label: {
              en: 'Tear the blank cheque in half & say: "My house is small, Sir, not my self-respect"',
              hi: 'ब्लैंक चेक दो टुकड़ों में फाड़ दो और कहो: "मेरा घर छोटा है सर, मेरी ख़ुद्दारी और प्यार बिकाऊ नहीं"',
              bn: 'ব্ল্যাঙ্ক চেকটা দু-টুকরো করে ছিঁড়ে বলো: "আমার ঘর ছোট হতে পারে, কিন্তু আমার আত্মসম্মান বিক্রির নয়"'
            },
            hint: {
              en: 'Unbreakable Pride · +Courage / +Trust',
              hi: 'अटूट स्वाभिमान · +हिम्मत / +विश्वास',
              bn: 'অটল আত্মসম্মান · +সাহস / +বিশ্বাস'
            },
            trust: 2, courage: 2, sacrifice: 0, status: -1, memory: 'torn_cheque'
          },
          {
            id: 'a_return_quietly',
            label: {
              en: 'Push the cheque back untouched & stay silent so he does not punish {B} at home',
              hi: 'चेक बिना छुए वापस सरका दो और ख़ामोश रहो ताकि घर जाकर वह {B} पर सख़्ती न करें',
              bn: 'চেকটা না ছুঁয়েই ফিরিয়ে দাও আর চুপ থাকো যাতে বাড়ি ফিরে তিনি {B}-কে কষ্ট না দেন'
            },
            hint: {
              en: 'Quiet Restraint · +Sacrifice / +Status',
              hi: 'ख़ामोश सब्र · +त्याग / +परिवार',
              bn: 'নীরব সংযম · +ত্যাগ / +সম্মান'
            },
            trust: 0, courage: 0, sacrifice: 2, status: 2
          }
        ],
        outcomes: {
          'a_tear_cheque+b_trust_and_leave_note': {
            text: {
              en: 'Paper flutters to the workshop floor as {A} refuses to sell love—while across town, {B} refuses to believe a single lie and slips out through the garden gate toward the old footbridge!',
              hi: 'फटे हुए चेक के टुकड़े फ़र्श पर गिर गए और {A} का सिर गर्व से ऊँचा रहा—उधर बड़ी कोठी में {B} ने भी हर झूठ को ठुकराकर चुपचाप पुराने स्टेशन ब्रिज की राह पकड़ ली!',
              bn: 'ছেঁড়া চেকের টুকরোগুলো মেঝেতে পড়ে রইল, {A} মাথা উঁচু করে দাঁড়াল—ওদিকে প্রাসাদে {B} সব মিথ্যা অগ্রাহ্য করে পুরোনো ফুটব্রিজের উদ্দেশ্যে বেরিয়ে পড়ল!'
            },
            trust: 2, sfx: 'paperTear', next: 's4_rain_reunion'
          },
          default: {
            text: {
              en: 'By evening, storm clouds gather again. Haunted by what happened in their separate worlds, both {A} and {B} are pulled toward the only place where no one knows their surnames—the old railway footbridge.',
              hi: 'शाम ढलते ही फिर बादल घिर आए। अपनी-अपनी दुनिया के घाव लिए {A} और {B} दोनों एक ही जगह की ओर खिंचे चले आए—पुराना रेलवे फुटब्रिज, जहाँ सिर्फ़ बारिश और दोनों का सच है।',
              bn: 'সন্ধ্যা নামতেই আবার মেঘ জমল। দুই ভিন্ন পৃথিবীর ক্ষত বুকে নিয়ে {A} ও {B} ছুটে এল সেই একটাই জায়গায়—পুরোনো রেলওয়ে ফুটব্রিজ, যেখানে কোনো পদবির দেয়াল নেই।'
            },
            sfx: 'thunder', next: 's4_rain_reunion'
          }
        }
      },

      s3b_sagai_wall: {
        id: 's3b_sagai_wall',
        chapterNo: 3,
        totalChapters: 7,
        isSplit: true,
        role: 'B',
        location: {
          en: 'SPLIT WORLD · Partner B · Mansion Drawing Room, Afternoon',
          hi: 'अलग दुनिया · पार्टनर B · कोठी का ड्राइंग रूम, दोपहर',
          bn: 'ভিন্ন পৃথিবী · পার্টনার B · কোঠির ড্রয়িং রুম, দুপুর'
        },
        title: {
          en: 'The Lie Behind Silk Curtains',
          hi: 'रेशमी पर्दों के पीछे बोला गया झूठ',
          bn: 'রেশমি পর্দার আড়ালে মিথ্যার দেয়াল'
        },
        artTheme: 'kothi_balcony',
        fx: 'candle-embers',
        bgm: 'heartbreak_tension',
        sfx: 'heartbeat',
        narration: {
          en: '{B}’s phone is taken away and engagement invitations are spread across the velvet table. Returning from the city, Papa says coldly: "I met {A} this morning. Money speaks louder than promises—he agreed to walk away." {B}’s heart freezes, remembering {A}’s eyes.',
          hi: '{B} का फ़ोन ले लिया गया है और मखमली मेज़ पर सगाई के कार्ड सजे हैं। बाहर से लौटकर पापा सख़्त लहजे में कहते हैं: "आज सुबह मैं {A} से मिला था। पैसों के आगे वादे टिकते नहीं—उसने दूर जाने के लिए हामी भर दी है।" {B} की साँसें थम जाती हैं।',
          bn: '{B}-এর ফোন কেড়ে নেওয়া হয়েছে, আর মখমলের টেবিলে সাজানো বাগদানের নিমন্ত্রণপত্র। বাইরে থেকে ফিরে বাবা কঠোর গলায় বললেন: "আজ সকালে {A}-এর সাথে দেখা হয়েছিল। টাকার কাছে ভালোবাসা হেরে গেছে—সে সরে যেতে রাজি হয়েছে।" {B}-এর বুক কেঁপে উঠল।'
        },
        dialogue: {
          speaker: { en: '{B}’s Dilemma', hi: '{B} की परीक्षा', bn: '{B}-এর অন্তর্দ্বন্দ্ব' },
          line: {
            en: '"Is Papa telling the truth, or trying to break my trust in {A} before the ring ceremony?"',
            hi: '"क्या पापा सच कह रहे हैं, या सगाई से पहले {A} पर मेरा भरोसा तोड़ना चाहते हैं?"',
            bn: '"বাবা কি সত্যি বলছেন, নাকি বাগদানের আগে {A}-এর প্রতি আমার বিশ্বাস ভেঙে দিতে চাইছেন?"'
          }
        },
        choices: [
          {
            id: 'b_trust_and_leave_note',
            label: {
              en: 'Refuse to believe the lie, slip a velvet note under your pillow & run to meet {A}',
              hi: 'झूठ पर यक़ीन मत करो—तकिये के नीचे चिट्ठी छोड़कर बारिश में {A} से मिलने निकल पड़ो',
              bn: 'মিথ্যায় বিশ্বাস কোরো না—বালিশের নিচে চিঠি রেখে বৃষ্টির মাঝে {A}-এর সাথে দেখা করতে বেরিয়ে পড়ো'
            },
            hint: {
              en: 'Fierce Trust · +Trust / +Courage',
              hi: 'अटूट भरोसा · +विश्वास / +हिम्मत',
              bn: 'অটল বিশ্বাস · +বিশ্বাস / +সাহস'
            },
            trust: 2, courage: 2, sacrifice: 0, status: -1, memory: 'velvet_letter'
          },
          {
            id: 'b_weep_obey_first',
            label: {
              en: 'Lock yourself in the room in tears, torn between family honor and your heart',
              hi: 'परिवार की इज़्ज़त और टूटते दिल के बीच ख़ुद को कमरे में बंद करके आँसुओं से लड़ो',
              bn: 'পরিবারের সম্মান আর ভাঙা হৃদয়ের মাঝে নিজেকে ঘরে বন্দী করে নীরবে কেঁদে ফেলো'
            },
            hint: {
              en: 'Heartbreak & Duty · +Sacrifice / +Status',
              hi: 'दिल का दर्द और फ़र्ज़ · +त्याग / +परिवार',
              bn: 'হৃদয়ের যন্ত্রণা ও কর্তব্য · +ত্যাগ / +সম্মান'
            },
            trust: -1, courage: 0, sacrifice: 2, status: 2
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'Unable to live with unanswered questions, {B} slips past the drenched garden wall as evening falls—running straight toward the old railway footbridge where {A} waits in the rain.',
              hi: 'अनकहे सवालों के साथ एक पल भी रुकना मुश्किल था—शाम होते ही {B} भीगे बगीचे के रास्ते बाहर निकल पड़ी, सीधे पुराने रेलवे फुटब्रिज की तरफ़ जहाँ बारिश में {A} खड़ा है।',
              bn: 'অজানা প্রশ্নের ভার সইতে না পেরে সন্ধ্যা নামতেই {B} ভেজা বাগানের পথ দিয়ে বেরিয়ে পড়ল—সরাসরি পুরোনো রেলওয়ে ফুটব্রিজের দিকে, যেখানে বৃষ্টিতে ভিজছে {A}।'
            },
            sfx: 'heartbeat', next: 's4_rain_reunion'
          }
        }
      },

      /* ===== CHAPTER 4 (REUNION SCENE #1): RAINY FOOTBRIDGE MULAKAT ===== */
      s4_rain_reunion: {
        id: 's4_rain_reunion',
        chapterNo: 4,
        totalChapters: 7,
        isSplit: false,
        isReunion: true,
        location: {
          en: 'REUNION SCENE · Old Railway Footbridge · Monsoon Evening',
          hi: 'मुलाक़ात (REUNION) · पुराना रेलवे फुटब्रिज · बारिश भरी शाम',
          bn: 'পুনর্মিলন (REUNION) · পুরোনো রেলওয়ে ফুটব্রিজ · বৃষ্টির সন্ধ্যা'
        },
        title: {
          en: 'Under One Umbrella in the Rain',
          hi: 'बारिश में एक छतरी के नीचे आमने-सामने',
          bn: 'বৃষ্টির মাঝে এক ছাতার নিচে দুজন'
        },
        artTheme: 'reunion_bridge',
        fx: 'rain-embers',
        bgm: 'reunion_warmth',
        sfx: 'heartSwell',
        narration: {
          en: 'REUNITED! Beneath the single amber lamp of the old footbridge, {A} holds out a worn umbrella just as {B} runs up breathless, silk hem soaked in rain. The city lights blur below them. For the first time since the storm began, there are no guards, no bills, and no lies between them—only two drenched hearts.',
          hi: 'आख़िरकार मुलाक़ात! पुराने फुटब्रिज की पीली रोशनी के नीचे {A} अपनी पुरानी छतरी थामे खड़ा है, और भीगी हुई {B} हाँफते हुए सामने आ खड़ी होती है। नीचे शहर की रोशनियाँ धुँधली दिख रही हैं। आज पहली बार दोनों के बीच न कोई गार्ड है, न कोई झूठ—सिर्फ़ दो भीगे हुए दिल हैं।',
          bn: 'অবশেষে দেখা! পুরোনো ফুটব্রিজের হলুদ আলোর নিচে {A} পুরোনো ছাতা হাতে দাঁড়িয়ে, আর বৃষ্টিতে ভিজে হাঁপাতে হাঁপাতে ছুটে এল {B}। নিচে শহরের আলো ঝাপসা হয়ে এসেছে। আজ দুজনের মাঝে কোনো প্রহরী নেই, কোনো মিথ্যা নেই—শুধু দুটি ভেজা হৃদয়।'
        },
        dialogue: {
          speaker: { en: 'Face to Face in the Rain', hi: 'बारिश में आमने-सामने', bn: 'বৃষ্টির মাঝে মুখোমুখি' },
          line: {
            en: '"They told me our worlds can never meet—look at us now. Tell me what we do next."',
            hi: '"सबने कहा था हमारी दुनिया कभी नहीं मिल सकती—देखो, हम फिर सामने खड़े हैं। अब बताओ, आगे क्या करना है?"',
            bn: '"সবাই বলেছিল আমাদের দুই পৃথিবী কখনো মিলবে না—দেখো, আমরা আবার পাশাপাশি। এখন বলো, আমরা কী করব?"'
          }
        },
        choicesA: [
          {
            id: 'a_hold_hand_fight',
            label: {
              en: 'Hold {B}’s cold hands tightly & swear you will face her father together tomorrow',
              hi: '{B} के ठंडे हाथ थामकर वादा करो कि कल हम दोनों मिलकर तुम्हारे पापा का सामना करेंगे',
              bn: '{B}-এর ঠান্ডা হাত শক্ত করে ধরে শপথ নাও যে কাল দুজনে মিলে ওর বাবার মুখোমুখি হবে'
            },
            hint: {
              en: 'Stand Together · +Trust / +Courage',
              hi: 'साथ लड़ेंगे · +विश्वास / +हिम्मत',
              bn: 'একসাথে লড়াই · +বিশ্বাস / +সাহস'
            },
            trust: 2, courage: 2, sacrifice: 0, status: 0, memory: 'bridge_promise'
          },
          {
            id: 'a_urge_return',
            label: {
              en: 'With trembling eyes, tell {B} to go back to the warm mansion before she catches a fever',
              hi: 'नम आँखों से कहो कि तुम वापस कोठी लौट जाओ—मैं तुम्हें अपनी तंगी का दर्द नहीं दे सकता',
              bn: 'ভেজা চোখে বলো প্রাসাদে ফিরে যেতে—আমি তোমাকে আমার অভাবের কষ্ট দিতে পারব না'
            },
            hint: {
              en: 'Painful Protection · +Sacrifice',
              hi: 'दर्दभरी फ़िक्र · +त्याग',
              bn: 'বেদনাময় মায়া · +ত্যাগ'
            },
            trust: -1, courage: 0, sacrifice: 2, status: 1
          }
        ],
        choicesB: [
          {
            id: 'b_remove_bangle',
            label: {
              en: 'Take off your expensive gold bangle & say: "I choose your world, even with nothing"',
              hi: 'अपना महँगा कंगन उतारकर कहो: "मुझे तुम्हारी दुनिया मंजूर है, चाहे हमारे पास कुछ भी न हो"',
              bn: 'দামি সোনার বালা খুলে বলো: "আমি তোমার পৃথিবীকেই বেছে নিলাম, আমাদের কিছু না থাকলেও"'
            },
            hint: {
              en: 'Fearless Devotion · +Courage / +Trust',
              hi: 'बेख़ौफ़ समर्पण · +हिम्मत / +विश्वास',
              bn: 'নির্ভীক ভালোবাসা · +সাহস / +বিশ্বাস'
            },
            trust: 2, courage: 2, sacrifice: 0, status: -1
          },
          {
            id: 'b_face_family_dignity',
            label: {
              en: 'Say gently: "We won’t run away in shame—we will win my family’s respect"',
              hi: 'सधे हुए स्वर में कहो: "हम छिपकर नहीं भागेंगे—हम अपने परिवार की इज़्ज़त और रज़ामंदी जीतेंगे"',
              bn: 'দৃঢ় কণ্ঠে বলো: "আমরা পালিয়ে যাব না—আমরা আমার পরিবারের সম্মান আর আশীর্বাদ জয় করব"'
            },
            hint: {
              en: 'Dignity & Family · +Trust / +Status',
              hi: 'इज़्ज़त और परिवार · +विश्वास / +परिवार',
              bn: 'সম্মান ও পরিবার · +বিশ্বাস / +সম্মান'
            },
            trust: 2, courage: 1, sacrifice: 0, status: 2
          }
        ],
        outcomes: {
          'a_hold_hand_fight+b_remove_bangle': {
            text: {
              en: 'Thunder fades into a quiet drizzle as {A} gently slides the bangle back onto {B}’s wrist: "Keep your grace, keep your name—we will build our own sky." Before headlights sweep the bridge road, they part one last time for tomorrow’s decisive morning.',
              hi: 'बिजली की गड़गड़ाहट शांत हो गई और {A} ने वही कंगन धीरे से {B} की कलाई में वापस पहना दिया: "तुम्हारी शान नहीं छीननी, हम अपना आसमान ख़ुद बनाएंगे।" कार की हेडलाइट्स दिखने से पहले दोनों कल के फ़ैसले के लिए अलग हुए।',
              bn: 'বজ্রপাত থেমে মৃদু বৃষ্টি নামল, আর {A} বালাটা আবার {B}-এর হাতে পরিয়ে দিল: "তোমার গর্ব কেড়ে নেব না, আমরা নিজেদের আকাশ গড়ব।" গাড়ির আলো আসার আগেই তারা আগামীকালের শেষ লড়াইয়ের জন্য বিদায় নিল।'
            },
            trust: 1, courage: 1, sfx: 'heartSwell',
            next: { A: 's5a_small_room_dream', B: 's5b_mansion_ultimatum' }
          },
          default: {
            text: {
              en: 'Mansion headlights cut through the monsoon mist! {A} and {B} pull apart just in time—returning to their two separate worlds for the longest, hardest night before the engagement dawn.',
              hi: 'कोठी की कार की हेडलाइट्स कोहरे को चीरती हुई पुल के पास आ गईं! {A} और {B} आख़िरी पल में अलग हुए—अब सगाई की सुबह से पहले की सबसे लंबी और भारी रात दोनों को अकेले काटनी है।',
              bn: 'কোঠির গাড়ির আলো কুয়াশা চিরে ব্রিজের কাছে চলে এল! {A} ও {B} শেষ মুহূর্তে আলাদা হলো—বাগদানের ভোরের আগে সবচেয়ে দীর্ঘ আর কঠিন রাতটা দুজনকে একা কাটাতে হবে।'
            },
            sfx: 'heartbeat',
            next: { A: 's5a_small_room_dream', B: 's5b_mansion_ultimatum' }
          }
        }
      },

      /* ===== CHAPTER 5 (SPLIT CLIMAX PRESSURE): NIGHT BEFORE THE ENGAGEMENT ===== */
      s5a_small_room_dream: {
        id: 's5a_small_room_dream',
        chapterNo: 5,
        totalChapters: 7,
        isSplit: true,
        role: 'A',
        location: {
          en: 'SPLIT WORLD · Partner A · Small Room Lamp, 4:15 AM',
          hi: 'अलग दुनिया · पार्टनर A · छोटा कमरा और टेबल लैंप, सुबह 4:15',
          bn: 'ভিন্ন পৃথিবী · পার্টনার A · ছোট ঘরের টেবিল ল্যাম্প, ভোর ৪:১৫'
        },
        title: {
          en: 'Mother’s Blessing & The Morning Bus',
          hi: 'माँ का आशीर्वाद और सुबह का फ़ैसला',
          bn: 'মায়ের আশীর্বাদ ও ভোরের সিদ্ধান্ত'
        },
        artTheme: 'rain_lane',
        fx: 'rain-warm',
        bgm: 'monsoon_piano',
        sfx: 'sceneOpen',
        narration: {
          en: 'Under a flickering bulb at 4:15 AM, {A}’s engineering prototype is finally accepted for a city startup grant—the first real spark of hope! Just then, a neighbor knocks with urgent news: "{B}’s engagement ceremony has been moved to 8 AM today." Mother places a warm hand on {A}’s shoulder.',
          hi: 'सुबह 4:15 बजे टिमटिमाते बल्ब के नीचे {A} को अपने प्रोजेक्ट के लिए पहली बड़ी स्कॉलरशिप और ग्रांट का मेल मिलता है—मेहनत रंग लाने लगी है! तभी पड़ोसी दरवाज़ा खटखटाकर बताता है: "{B} की सगाई आज सुबह 8 बजे ही तय कर दी गई है।" माँ चुपचाप {A} के सिर पर हाथ रखती हैं।',
          bn: 'ভোর ৪:১৫-য় টিমটিমে বাল্বের নিচে {A}-এর প্রজেক্টের জন্য প্রথম বড় গ্র্যান্টের খবর এল—স্বপ্ন সত্যি হওয়ার শুরু! ঠিক তখনই প্রতিবেশী দরজায় এসে জানাল: "{B}-এর বাগদান আজ সকাল ৮টাতেই এগিয়ে আনা হয়েছে।" মা নীরবে {A}-এর কাঁধে হাত রাখলেন।'
        },
        dialogue: {
          speaker: { en: '{A}’s Mother', hi: '{A} की माँ', bn: '{A}-এর মা' },
          line: {
            en: '"Poverty is never a sin, beta—but letting true love go without speaking your truth is a lifelong regret."',
            hi: '"ग़रीबी कोई गुनाह नहीं है बेटा—पर सच्चे प्यार के लिए सच न बोलना पूरी उम्र का पछतावा बन जाता है।"',
            bn: '"দারিদ্র্য কোনো পাপ নয় বাবা—কিন্তু সত্যিকারের ভালোবাসার জন্য না দাঁড়ালে সারাজীবন আক্ষেপ থেকে যায়।"'
          }
        },
        choices: [
          {
            id: 'a_march_to_kothi',
            label: {
              en: 'Take your acceptance letter, touch Mother’s feet & walk straight to the Kothi gate',
              hi: 'अपनी मेहनत का लेटर हाथ में लो, माँ का आशीर्वाद लेकर सीधे कोठी के दरवाज़े पर पहुँचो',
              bn: 'নিজের সাফল্যের চিঠি হাতে নিয়ে মায়ের আশীর্বাদ মাথায় করে সোজা কোঠির গেটে যাও'
            },
            hint: {
              en: 'Fearless Arrival · +Courage / +Trust',
              hi: 'निडर क़दम · +हिम्मत / +विश्वास',
              bn: 'সাহসী পদক্ষেপ · +সাহস / +বিশ্বাস'
            },
            trust: 2, courage: 2, sacrifice: 0, status: 0, memory: 'workshop_blueprint'
          },
          {
            id: 'a_buy_away_ticket',
            label: {
              en: 'Pack a quiet bag & go to the gate only to wish {B} happiness from afar',
              hi: 'अपना झोला बाँधकर चुपचाप कोठी के बाहर सिर्फ़ {B} को दूर से दुआ देने जाओ',
              bn: 'নীরবে ব্যাগ গুছিয়ে শুধু দূর থেকে {B}-এর ভালো থাকার দোয়া জানাতে গেটে যাও'
            },
            hint: {
              en: 'Silent Goodbye · +Sacrifice / +Status',
              hi: 'ख़ामोश अलविदा · +त्याग / +परिवार',
              bn: 'নীরব বিদায় · +ত্যাগ / +সম্মান'
            },
            trust: -1, courage: 0, sacrifice: 2, status: 1
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'Dawn breaks in rose and gold over Kapoor Kothi. Lanterns sway in the wet courtyard as guests gather—and the wrought-iron gates creak open to bring {A} and {B} face to face before everyone!',
              hi: 'बड़ी कोठी पर सुनहरी-गुलाबी सुबह उतर आई। भीगे आँगन में मेहमान जमा हैं—और तभी लोहे का बड़ा गेट खुलता है, जहाँ सबके सामने {A} और {B} फिर आमने-सामने आ खड़े होते हैं!',
              bn: 'বড় কোঠির আকাশে সোনালি-গোলাপি ভোর নামল। ভেজা উঠোনে অতিথিরা জড়ো হয়েছে—আর ঠিক তখনই লোহার গেট খুলে গেল, সবার সামনে মুখোমুখি হলো {A} ও {B}!'
            },
            sfx: 'doorCreak', next: 's6_courtyard_confrontation'
          }
        }
      },

      s5b_mansion_ultimatum: {
        id: 's5b_mansion_ultimatum',
        chapterNo: 5,
        totalChapters: 7,
        isSplit: true,
        role: 'B',
        location: {
          en: 'SPLIT WORLD · Partner B · Mansion Study, 6:30 AM',
          hi: 'अलग दुनिया · पार्टनर B · कोठी का स्टडी रूम, सुबह 6:30',
          bn: 'ভিন্ন পৃথিবী · পার্টনার B · কোঠির স্টাডি রুম, সকাল ৬:৩০'
        },
        title: {
          en: 'The Ultimatum at Dawn',
          hi: 'सुबह की आख़िरी शर्त',
          bn: 'ভোরের শেষ শর্ত'
        },
        artTheme: 'kothi_balcony',
        fx: 'candle-embers',
        bgm: 'heartbreak_tension',
        sfx: 'heartbeat',
        narration: {
          en: 'Dressed in crimson silk for a ceremony she never wanted, {B} stands before her father in the oak-paneled study. He places the house keys and the engagement ring side by side on the marble desk: "Walk downstairs with your head bowed and keep this family’s name—or leave everything you grew up with behind."',
          hi: 'लाल रेशमी जोड़े में सजी {B} अपने पापा के सामने खड़ी है। पापा मार्बल की मेज़ पर घर की चाबियाँ और सगाई की अँगूठी एक साथ रखते हैं: "या तो चुपचाप नीचे चलकर खानदान की इज़्ज़त रखो—या खाली हाथ इस घर की हर दौलत छोड़कर जाओ।"',
          bn: 'লাল রেশমি পোশাকে {B} বাবার সামনে দাঁড়িয়ে। বাবা মার্বেল টেবিলে বাড়ির চাবি আর বাগদানের আংটি পাশাপাশি রাখলেন: "হয় মাথা নিচু করে নিচে নেমে বংশের সম্মান বাঁচাও—নয়তো খালি হাতে এই প্রাসাদের সবকিছু ছেড়ে বেরিয়ে যাও।"'
        },
        dialogue: {
          speaker: { en: '{B}’s Final Moment Before Stepping Out', hi: 'बाहर कदम रखने से पहले {B}', bn: 'বাইরে পা রাখার আগে {B}' },
          line: {
            en: '"I love my family—but if I lose myself today, what is left of this mansion’s pride?"',
            hi: '"मुझे अपने परिवार से प्यार है—पर अगर आज ख़ुद को ही खो दिया, तो इस बड़ी कोठी की शान किस काम की?"',
            bn: '"আমি আমার পরিবারকে ভালোবাসি—কিন্তু আজ নিজেকেই হারিয়ে ফেললে এই প্রাসাদের গর্ব দিয়ে কী হবে?"'
          }
        },
        choices: [
          {
            id: 'b_leave_keys_table',
            label: {
              en: 'Place your car keys & jewelry on the desk and step down to speak the truth openly',
              hi: 'गाड़ी की चाबियाँ और गहने मेज़ पर रखकर सबके सामने सच बोलने आँगन में उतर जाओ',
              bn: 'গাড়ির চাবি ও গয়না টেবিলে রেখে সবার সামনে সত্য বলার জন্য উঠোনে নেমে এসো'
            },
            hint: {
              en: 'Break the Cage · +Courage / +Trust',
              hi: 'बंदिशें तोड़ो · +हिम्मत / +विश्वास',
              bn: 'শিকল ভাঙো · +সাহস / +বিশ্বাস'
            },
            trust: 2, courage: 2, sacrifice: 0, status: -1, memory: 'mansion_keys'
          },
          {
            id: 'b_plead_fair_chance',
            label: {
              en: 'Hold Papa’s hands tearfully & ask him to listen to {A} once in front of everyone',
              hi: 'पापा के हाथ थामकर कहो कि एक बार सबके सामने {A} की बात और सच्चाई ज़रूर सुनें',
              bn: 'বাবার হাত ধরে অনুরোধ করো যেন সবার সামনে অন্তত একবার {A}-এর কথা শোনেন'
            },
            hint: {
              en: 'Bridge Both Worlds · +Trust / +Status',
              hi: 'दोनों दुनिया को जोड़ो · +विश्वास / +परिवार',
              bn: 'দুই পৃথিবীর সেতু · +বিশ্বাস / +সম্মান'
            },
            trust: 2, courage: 0, sacrifice: 1, status: 2
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'As {B} steps out into the rose-lit courtyard, the whispers suddenly stop—standing framed in the open iron gates is {A}, rain-damp shoes on marble stone and eyes steady.',
              hi: 'जैसे ही {B} सुनहरी रोशनी से भरे आँगन में उतरती है, सारी फुसफुसाहट थम जाती है—खुले लोहे के गेट पर {A} खड़ा है, आँखों में न डर है, न लालच, बस सच्चा प्यार।',
              bn: 'সোনালি আলোয় ভরা উঠোনে {B} পা রাখতেই সব গুঞ্জন থেমে গেল—খোলা লোহার গেটের সামনে দাঁড়িয়ে আছে {A}, চোখে ভয় নয়, শুধু অটল ভালোবাসা।'
            },
            sfx: 'heartSwell', next: 's6_courtyard_confrontation'
          }
        }
      },

      /* ===== CHAPTER 6 (REUNION SCENE #2): GRAND COURTYARD CONFRONTATION ===== */
      s6_courtyard_confrontation: {
        id: 's6_courtyard_confrontation',
        chapterNo: 6,
        totalChapters: 7,
        isSplit: false,
        isReunion: true,
        location: {
          en: 'REUNION CLIMAX · Kapoor Kothi Courtyard · Dawn',
          hi: 'क्लाइमैक्स मुलाक़ात · बड़ी कोठी का आँगन · सुबह',
          bn: 'ক্লাইম্যাক্স পুনর্মিলন · বড় কোঠির উঠোন · ভোর'
        },
        title: {
          en: 'When Two Worlds Stand Face to Face',
          hi: 'जब दो दुनिया आमने-सामने खड़ी हुईं',
          bn: 'যখন দুই পৃথিবী মুখোমুখি দাঁড়াল'
        },
        artTheme: 'courtyard_climax',
        fx: 'candle-embers',
        bgm: 'reunion_warmth',
        sfx: 'heartbeat',
        narration: {
          en: 'Lantern garlands glow softly against the dawn sky. Every guest watches in silence as {A} walks across the wet marble courtyard toward {B}. Papa steps between them, voice echoing off the stone pillars: "You have nothing to offer my daughter. Why are you here?"',
          hi: 'सुबह के आसमान के नीचे लैंप की लड़ियाँ चमक रही हैं। हर मेहमान ख़ामोश है जब {A} भीगे संगमरमर के आँगन को पार कर {B} के सामने आता है। पापा बीच में आकर गरजते हैं: "तुम्हारे पास मेरी बेटी को देने के लिए क्या है? यहाँ किस हक़ से आए हो?"',
          bn: 'ভোরের আকাশের নিচে আলোর মালা জ্বলছে। সব অতিথি স্তব্ধ হয়ে দেখছে {A} ভেজা মার্বেল পেরিয়ে {B}-এর সামনে এসে দাঁড়াল। বাবা মাঝখানে দাঁড়িয়ে গর্জে উঠলেন: "আমার মেয়েকে দেওয়ার মতো তোমার কী আছে? কোন সাহসে এখানে এসেছ?"'
        },
        dialogue: {
          speaker: { en: 'In Front of Everyone', hi: 'सबकी नज़रों के सामने', bn: 'সবার চোখের সামনে' },
          line: {
            en: '"One answer here changes everything—pride, family, and whether love survives the sunrise."',
            hi: '"यहाँ दिया गया एक जवाब सब कुछ बदल देगा—ख़ुद्दारी, परिवार, और इस प्यार का कल।"',
            bn: '"এখানে দেওয়া একটি উত্তরই সব বদলে দেবে—আত্মসম্মান, পরিবার, আর ভালোবাসার ভবিষ্যৎ।"'
          }
        },
        choicesA: [
          {
            id: 'a_speak_dignity',
            label: {
              en: 'Speak with head held high: "I have no palace yet, Sir—but my love & hard work are fearless"',
              hi: 'सिर उठाकर कहो: "मेरे पास अभी महल नहीं है सर—पर मेरी मेहनत, ख़ुद्दारी और प्यार दोनों सच्चे हैं"',
              bn: 'মাথা উঁচু করে বলো: "আমার এখন প্রাসাদ নেই স্যার—কিন্তু আমার পরিশ্রম আর ভালোবাসা অটল"'
            },
            hint: {
              en: 'Fearless Pride · +Courage / +Trust',
              hi: 'बेख़ौफ़ ख़ुद्दारी · +हिम्मत / +विश्वास',
              bn: 'অদম্য আত্মসম্মান · +সাহস / +বিশ্বাস'
            },
            trust: 2, courage: 2, sacrifice: 0, status: 0
          },
          {
            id: 'a_ask_one_year',
            label: {
              en: 'Bow respectfully & say: "Give me one year to prove myself—I want your blessing, not war"',
              hi: 'अदब से सिर झुकाकर कहो: "मुझे एक साल का वक़्त दीजिए—मैं लड़ाई नहीं, आपका आशीर्वाद चाहता हूँ"',
              bn: 'সম্মান জানিয়ে বলো: "আমাকে এক বছর সময় দিন—আমি যুদ্ধ নয়, আপনার আশীর্বাদ নিয়ে {B}-কে চাই"'
            },
            hint: {
              en: 'Earn Blessing · +Trust / +Status',
              hi: 'आशीर्वाद की राह · +विश्वास / +परिवार',
              bn: 'আশীর্বাদের পথ · +বিশ্বাস / +সম্মান'
            },
            trust: 1, courage: 0, sacrifice: 1, status: 2
          }
        ],
        choicesB: [
          {
            id: 'b_hold_hand_public',
            label: {
              en: 'Step past the velvet rope, hold {A}’s hand openly & say: "He is my choice"',
              hi: 'सबके सामने आगे बढ़कर {A} का हाथ थामो और कहो: "मेरा फ़ैसला और मेरी ज़िंदगी यही हैं"',
              bn: 'সবার সামনে এগিয়ে গিয়ে {A}-এর হাত ধরো আর বলো: "আমার জীবন আর আমার সিদ্ধান্ত এখানেই"'
            },
            hint: {
              en: 'Public Stand · +Courage / +Trust',
              hi: 'सबके सामने साथ · +हिम्मत / +विश्वास',
              bn: 'সবার সামনে সাহস · +সাহস / +বিশ্বাস'
            },
            trust: 2, courage: 2, sacrifice: 0, status: -1
          },
          {
            id: 'b_appeal_father_heart',
            label: {
              en: 'Look into Papa’s eyes softly: "You taught me honesty—don’t ask me to live a lie today"',
              hi: 'पापा की आँखों में देखकर कहो: "आपने ही सच बोलना सिखाया है—आज मुझे झूठी ज़िंदगी मत दीजिए"',
              bn: 'বাবার চোখে চোখ রেখে বলো: "আপনিই তো সত্যের পথে চলতে শিখিয়েছেন—আজ আমাকে মিথ্যা জীবনে বাঁধবেন না"'
            },
            hint: {
              en: 'Touch His Heart · +Trust / +Status',
              hi: 'दिल को छूने वाली बात · +विश्वास / +परिवार',
              bn: 'হৃদয় ছোঁয়া আবেদন · +বিশ্বাস / +সম্মান'
            },
            trust: 2, courage: 0, sacrifice: 1, status: 2
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'Silence falls like mist over the courtyard. Papa’s stern eyes soften for a fleeting heartbeat—and then harden with one last question. The iron gate stands wide open ahead. Your final choice decides how {A} and {B}’s story enters history!',
              hi: 'पूरे आँगन में गहरी ख़ामोशी छा गई। एक पल के लिए पापा की सख़्त आँखें नम हुईं—और फिर उन्होंने आख़िरी फ़ैसला दोनों पर छोड़ दिया। सामने खुला लोहे का गेट और सुबह की रोशनी है। अब आख़िरी फ़ैसला तय करेगा कि {A} और {B} की कहानी किस अंजाम पर पहुँचेगी!',
              bn: 'পুরো উঠোনে নিস্তব্ধতা নেমে এল। এক মুহূর্তের জন্য বাবার কঠোর চোখ ভিজে উঠল—তারপর শেষ সিদ্ধান্ত ছেড়ে দিলেন দুজনের হাতে। সামনে খোলা লোহার গেট আর ভোরের আলো। এখনই শেষ সিদ্ধান্ত ঠিক করবে {A} ও {B}-এর গল্পের পরিণতি!'
            },
            sfx: 'sceneOpen', next: 's7_final_crossroads'
          }
        }
      },

      /* ===== CHAPTER 7 (FINAL CLIMAX CHOICE): DAWN AT THE IRON GATE ===== */
      s7_final_crossroads: {
        id: 's7_final_crossroads',
        chapterNo: 7,
        totalChapters: 7,
        isSplit: false,
        location: {
          en: 'FINAL CHAPTER · The Open Iron Gate · Sunrise',
          hi: 'आख़िरी अध्याय · कोठी का खुला गेट · सूर्योदय',
          bn: 'শেষ অধ্যায় · খোলা লোহার গেট · সূর্যোদয়'
        },
        title: {
          en: 'What Love Chooses at Sunrise',
          hi: 'सूर्योदय पर प्यार का आख़िरी फ़ैसला',
          bn: 'সূর্যোদয়ে ভালোবাসার শেষ সিদ্ধান্ত'
        },
        artTheme: 'courtyard_climax',
        fx: 'rain-embers',
        bgm: 'ending_dawn',
        sfx: 'heartbeat',
        narration: {
          en: 'Warm sunlight spills across the wet marble steps. Outside the gate, a morning bus hums toward a brand-new city. Inside the veranda, {B}’s parents wait in tense silence. Every tear, late-night call, and promise has led {A} and {B} to this single heartbeat.',
          hi: 'भीगी हुई संगमरमर की सीढ़ियों पर सुबह की सुनहरी धूप बिखर रही है। गेट के बाहर नए शहर जाने वाली सुबह की बस खड़ी है। बरामदे में {B} के माता-पिता ख़ामोशी से दोनों को देख रहे हैं। हर आँसू, आधी रात की कॉल और वादा आज इसी एक पल पर आकर ठहर गया है।',
          bn: 'ভেজা মার্বেলের সিঁড়িতে ভোরের সোনালি রোদ ছড়িয়ে পড়েছে। গেটের বাইরে নতুন শহরের বাস দাঁড়িয়ে। বারান্দায় {B}-এর বাবা-মা নিঃশব্দে তাকিয়ে আছেন। প্রতিটি চোখের জল, রাতের ফোন আর প্রতিশ্রুতি এসে থেমেছে এই একটি মুহূর্তে।'
        },
        dialogue: {
          speaker: { en: 'The Final Decision', hi: 'आख़िरी फ़ैसला', bn: 'শেষ সিদ্ধান্ত' },
          line: {
            en: '"Stay and heal both worlds, break every wall for a new dawn, make a solemn pact, or let go in silence?"',
            hi: '"क्या हम साथ खड़े होकर दोनों दुनिया जीतेंगे, सब बंदिशें तोड़कर नई शुरुआत करेंगे, कोई बड़ा समझौता करेंगे, या ख़ामोशी से बिछड़ जाएंगे?"',
            bn: '"একসাথে দাঁড়িয়ে দুই পৃথিবী জয় করবে, সব বাঁধন ভেঙে নতুন ভোর গড়বে, কোনো কঠিন শর্ত মানবে, নাকি নীরবে আলাদা হবে?"'
          }
        },
        choicesA: [
          {
            id: 'a_stand_together',
            label: {
              en: 'Hold {B}’s hand calmly & stand firm to win both love and family respect',
              hi: '{B} का हाथ थामकर शांत विश्वास से खड़े रहो—ताकि प्यार और परिवार दोनों साथ मिलें',
              bn: '{B}-এর হাত ধরে শান্ত দৃঢ়তায় দাঁড়াও—যাতে ভালোবাসা আর পরিবারের সম্মান দুটোই জেতা যায়'
            },
            hint: {
              en: 'Together Path · Dignity & Harmony',
              hi: 'साथ का रास्ता · प्यार और सम्मान',
              bn: 'একসাথে পথচলা · ভালোবাসা ও সম্মান'
            },
            trust: 2, courage: 1, sacrifice: 0, status: 1
          },
          {
            id: 'a_run_new_city',
            label: {
              en: 'Look into {B}’s eyes & say: "Let’s leave every wall behind and start a fearless new life"',
              hi: '{B} की आँखों में देखकर कहो: "चलो सारी बंदिशें छोड़कर नए शहर में अपनी नई दुनिया बसाएं"',
              bn: '{B}-এর চোখে চোখ রেখে বলো: "চলো সব দেয়াল ভেঙে নতুন শহরে আমাদের নতুন জীবন শুরু করি"'
            },
            hint: {
              en: 'Bold Beginning · Break Every Chain',
              hi: 'नई शुरुआत · हर बंदिश के पार',
              bn: 'নতুন শুরু · সব শিকল ভেঙে'
            },
            trust: 1, courage: 3, sacrifice: 0, status: -2
          },
          {
            id: 'a_silent_step_back',
            label: {
              en: 'Smile through tears & step back from the gate so {B} never loses her family’s shelter',
              hi: 'आँसुओं के बीच मुस्कुराकर पीछे हट जाओ ताकि {B} को कभी अपना परिवार न खोना पड़े',
              bn: 'চোখের জল লুকিয়ে হাসিমুখে পিছিয়ে যাও যাতে {B}-কে কখনো পরিবার হারাতে না হয়'
            },
            hint: {
              en: 'Bittersweet Sacrifice · Quiet Love',
              hi: 'ख़ामोश क़ुर्बानी · अधूरा पर सच्चा प्यार',
              bn: 'নীরব ত্যাগ · অপূর্ণ তবু অমর প্রেম'
            },
            trust: 0, courage: -2, sacrifice: 3, status: 1
          }
        ],
        choicesB: [
          {
            id: 'b_stand_together',
            label: {
              en: 'Stand beside {A} with grace & ask your parents to bless your honest love',
              hi: '{A} के साथ खड़े होकर माता-पिता से कहो कि वे हमारे सच्चे प्यार को अपना आशीर्वाद दें',
              bn: '{A}-এর পাশে দাঁড়িয়ে বাবা-মায়ের কাছে আমাদের সত্যিকারের ভালোবাসার আশীর্বাদ চাও'
            },
            hint: {
              en: 'Together Path · Heal Both Worlds',
              hi: 'साथ का रास्ता · दोनों दुनिया एक',
              bn: 'একসাথে পথচলা · দুই পৃথিবীর মিলন'
            },
            trust: 2, courage: 1, sacrifice: 0, status: 1
          },
          {
            id: 'b_break_chains',
            label: {
              en: 'Step through the open iron gate with {A}—leaving the velvet cage forever',
              hi: 'खुले लोहे के गेट से {A} के साथ बाहर कदम रखो—मखमली पिंजरा हमेशा के लिए पीछे छोड़ दो',
              bn: 'খোলা লোহার গেট পেরিয়ে {A}-এর হাত ধরে বেরিয়ে পড়ো—মখমলের খাঁচা চিরতরে পেছনে ফেলে'
            },
            hint: {
              en: 'Bold Beginning · Choose Freedom',
              hi: 'आज़ादी और नई शुरुआत · बेख़ौफ़ क़दम',
              bn: 'স্বাধীনতা ও নতুন ভোর · নির্ভীক যাত্রা'
            },
            trust: 1, courage: 3, sacrifice: 0, status: -2
          },
          {
            id: 'b_family_compromise',
            label: {
              en: 'Make a solemn one-year pact with Papa: stay apart while {A} builds his name, bound by an unspoken ring',
              hi: 'पापा से एक साल का वादा करो: एक साल की दूरी और सब्र, जब तक {A} अपनी पहचान न बना ले',
              bn: 'বাবার সাথে এক বছরের কঠিন শর্তে রাজি হও: এক বছর দূরে থেকে {A} নিজের পরিচয় গড়বে, তবু মন বাঁধা থাকবে'
            },
            hint: {
              en: 'Dramatic Twist · The Unspoken Pact',
              hi: 'नाटकीय मोड़ · एक वादा, एक क़ुर्बानी',
              bn: 'নাটকীয় মোড় · এক শর্ত, এক অপেক্ষা'
            },
            trust: 1, courage: 0, sacrifice: 2, status: 3
          }
        ],
        outcomes: {
          default: {
            text: {
              en: 'The sunrise turns the monsoon puddles to liquid gold—sealing the final chapter of {A} and {B}’s love story.',
              hi: 'सूर्योदय की रोशनी में बारिश की बूँदें सोने सी चमक उठीं—और {A} व {B} की प्रेम कहानी अपने अनोखे अंजाम पर पहुँच गई।',
              bn: 'সূর্যোদয়ের আলোয় বৃষ্টির জল সোনালি হয়ে উঠল—আর {A} ও {B}-এর ভালোবাসার গল্প তার চূড়ান্ত পরিণতি পেল।'
            },
            sfx: 'endingReveal',
            next: 'ENDING'
          }
        }
      }
    },

    /* ===== 4 DISTINCT EMOTIONAL ENDINGS ===== */
    endings: {
      together_horizon: {
        id: 'together_horizon',
        artTheme: 'courtyard_climax',
        badge: {
          en: 'Happy / Together Ending',
          hi: 'हैप्पी एंडिंग · दोनों दुनिया, एक हाथ',
          bn: 'হ্যাপি এন্ডিং · দুই পৃথিবী, এক হাত'
        },
        title: {
          en: 'Two Worlds, One Home',
          hi: 'दो दुनिया, एक आशियाना',
          bn: 'দুই পৃথিবী, একটি ঘর'
        },
        epilogue: {
          en: 'When {A} refused to sell his self-respect and {B} stood beside him without hatred in her heart, even the highest mansion walls finally gave way. Seeing the quiet strength in {A}’s eyes—and the acceptance letter for his dream—{B}’s father lowered his gaze and softly said, "Take care of my daughter." One monsoon later, {A}’s studio thrives, both mothers share evening tea in the courtyard, and {A} and {B} walk beneath the rain with nothing left to hide.',
          hi: 'जब {A} ने अपनी ख़ुद्दारी नहीं बेची और {B} ने बिना किसी कड़वाहट के उसका हाथ थामा, तो बड़ी कोठी की सबसे ऊँची दीवारें भी पिघल गईं। {A} की आँखों की सच्चाई और मेहनत देखकर {B} के पापा की आवाज़ नम हो गई—"मेरी बेटी को हमेशा ख़ुश रखना।" एक बरसात बाद {A} का अपना काम चमक उठा, दोनों परिवार एक आँगन में चाय पर मिलने लगे, और {A} व {B} अब बिना किसी डर के हर बारिश साथ जीते हैं।',
          bn: '{A} যখন নিজের আত্মসম্মান বিক্রি করেনি আর {B} যখন কোনো তিক্ততা ছাড়াই তার হাত ধরে দাঁড়িয়েছে, তখন বড় প্রাসাদের সবচেয়ে উঁচু দেয়ালও গলে গেল। {A}-এর চোখের সততা আর পরিশ্রম দেখে {B}-এর বাবার গলা ভিজে এল—"আমার মেয়েকে ভালো রেখো।" এক বর্ষা পরে {A}-এর নিজের স্টুডিও দাঁড়িয়ে গেল, দুই পরিবার এক উঠোনে হাসতে শিখল, আর {A} ও {B} আজ মুক্ত আকাশের নিচে একসাথে।'
        }
      },

      bold_new_dawn: {
        id: 'bold_new_dawn',
        artTheme: 'reunion_bridge',
        badge: {
          en: 'Bold / New Beginning Ending',
          hi: 'बोल्ड एंडिंग · बंदिशें तोड़कर नई सुबह',
          bn: 'বোল্ড এন্ডিং · সব বাঁধন ভেঙে নতুন ভোর'
        },
        title: {
          en: 'Beyond the Velvet Walls',
          hi: 'मखमली दीवारों के पार नई शुरुआत',
          bn: 'মখমলের দেয়াল পেরিয়ে নতুন ভোর'
        },
        epilogue: {
          en: 'Leaving behind marble halls, gilded expectations, and fear, {A} and {B} stepped through the open iron gate together into the golden morning. With two backpacks, one worn umbrella, and fierce love, they boarded the coastal highway bus to a new city. Their first apartment is tiny—just two teacups on a rainy balcony—yet every laugh echoes louder than any chandelier hall they ever knew. One day their families may knock again, and when they do, they will find a love nobody could break.',
          hi: 'संगमरमर के महल, दिखावे की शर्तें और हर डर को पीछे छोड़कर {A} और {B} ने खुले गेट से सुबह की नई राह चुनी। दो छोटे बैग, एक पुरानी छतरी और बेख़ौफ़ मोहब्बत के साथ दोनों नए शहर की ओर निकल पड़े। उनका पहला कमरा छोटा है—बारिश वाली बालकनी में दो कप चाय—पर उस घर की हँसी किसी भी बड़े महल से ज़्यादा अमीर है। एक दिन रिश्ते लौटेंगे, और तब वे देखेंगे कि सच्चा प्यार किसी बंदिश से नहीं हारता।',
          bn: 'মার্বেলের প্রাসাদ, লোকদেখানো শর্ত আর সব ভয় পেছনে ফেলে {A} ও {B} খোলা গেট দিয়ে নতুন ভোরের পথে পা বাড়াল। দুটি ছোট ব্যাগ, এক পুরোনো ছাতা আর অদম্য ভালোবাসা নিয়ে তারা নতুন শহরে যাত্রা শুরু করল। তাদের প্রথম ঘরটা ছোট—বৃষ্টিভেজা বারান্দায় দু-কাপ চা—তবুও সেই ঘরের হাসি যেকোনো রাজপ্রাসাদের চেয়ে অনেক বেশি ধনী। তারা প্রমাণ করে দিল, সাহসী প্রেম নিজের আকাশ নিজেই গড়ে নেয়।'
        }
      },

      dramatic_compromise: {
        id: 'dramatic_compromise',
        artTheme: 'midnight_call',
        badge: {
          en: 'Dramatic Twist / Compromise Ending',
          hi: 'ड्रामेटिक ट्विस्ट · एक वादा, एक क़ुर्बानी',
          bn: 'নাটকীয় মোড় · এক শর্ত, এক প্রতিশ্রুতি'
        },
        title: {
          en: 'The Unspoken One-Year Pact',
          hi: 'एक साल का अनकहा वादा',
          bn: 'এক বছরের নীরব শপথ'
        },
        epilogue: {
          en: 'To stop a war that would shatter both homes, {B} struck a breathtaking bargain with her father: the engagement is cancelled, and for 365 days {A} and {B} will not meet while {A} builds his venture from scratch. Before parting at the gate, {B} pressed her heirloom silver bangle into {A}’s palm—"Return it to me next monsoon." Every night at 2:05 AM, two lamps still glow across opposite ends of the city, counting down the days until the promise is redeemed.',
          hi: 'दोनों घरों को टूटने से बचाने के लिए {B} ने पापा के सामने एक चौंकाने वाली शर्त रखी: यह सगाई रद्द होगी, और पूरे 365 दिन {A} और {B} नहीं मिलेंगे जब तक {A} अपने दम पर अपना नाम न बना ले। गेट पर बिछड़ने से पहले {B} ने अपना चाँदी का कंगन {A} की हथेली में रखा—"अगली बारिश में इसे मुझे ख़ुद पहनाना।" आज भी हर रात 2:05 बजे शहर के दो छोरों पर दो लैंप जलते हैं, उस एक वादे के दिन गिनते हुए।',
          bn: 'দুটি পরিবারকে ভেঙে যাওয়া থেকে বাঁচাতে {B} বাবার সামনে এক নাটকীয় শর্ত রাখল: এই বাগদান বাতিল হবে, আর পুরো ৩৬৫ দিন {A} ও {B} দেখা করবে না যতক্ষণ না {A} নিজের পায়ে দাঁড়ায়। বিদায়ের আগে {B} নিজের রুপার বালাটা {A}-এর হাতে গুঁজে দিল—"আগামী বর্ষায় এটা নিজের হাতে পরিয়ে দিও।" আজও প্রতি রাত ২:০৫-এ শহরের দুই প্রান্তে দুটি আলো জ্বলে, সেই প্রতিশ্রুতির দিন গুনে গুনে।'
        }
      },

      bittersweet_rain: {
        id: 'bittersweet_rain',
        artTheme: 'rain_lane',
        badge: {
          en: 'Bittersweet / Separation Ending',
          hi: 'बिटर्सवीट एंडिंग · बारिश में बचा हुआ प्यार',
          bn: 'বিটারসুইট এন্ডিং · বৃষ্টিতে থেকে যাওয়া প্রেম'
        },
        title: {
          en: 'What the Rain Kept Forever',
          hi: 'बारिश में हमेशा ज़िंदा रहा प्यार',
          bn: 'বৃষ্টি যা চিরকাল আগলে রাখল'
        },
        epilogue: {
          en: 'Sometimes the heaviest walls are not made of stone, but of love that sacrifices itself to spare the other pain. {A} stepped quietly back into the monsoon lane so {B} would never lose her family, and {B} watched from the balcony as his silhouette vanished into the mist. Years later, {A}’s name shines on the city’s skyline and {B} walks her own free path. They live in separate worlds still—yet whenever monsoon rain touches the glass at midnight, both pause and smile at the love that shaped who they became.',
          hi: 'कभी-कभी सबसे ऊँची दीवार पत्थर की नहीं, बल्कि उस क़ुर्बानी की होती है जो अपनों को दुख से बचाने के लिए दी जाती है। {A} ख़ामोशी से बारिश वाली गली में लौट गया ताकि {B} का परिवार न टूटे, और {B} बालकनी से उसे कोहरे में जाते देखती रही। बरसों बाद {A} एक कामयाब इंसान बन चुका है और {B} ने अपनी आज़ाद राह चुन ली। रास्ते अलग हो गए—पर आज भी जब आधी रात को बारिश खिड़की पर दस्तक देती है, दोनों के होंठों पर उस सच्चे प्यार की मुस्कान तैर जाती है।',
          bn: 'কখনো কখনো সবচেয়ে বড় দেয়াল পাথরের নয়, বরং প্রিয়জনকে কষ্ট থেকে বাঁচানোর নীরব ত্যাগের। {A} চুপচাপ বৃষ্টির গলিতে ফিরে গেল যাতে {B}-এর পরিবার না ভাঙে, আর {B} বারান্দা থেকে কুয়াশায় তাকে হারিয়ে যেতে দেখল। বছর পেরিয়ে {A} আজ সফল, আর {B}-ও নিজের মতো স্বাধীন পথ খুঁজে নিয়েছে। পথ আলাদা হয়ে গেলেও, আজও মধ্যরাতে জানালার কাঁচে বৃষ্টি পড়লে দুজনেই সেই অমর ভালোবাসার কথা ভেবে মৃদু হাসে।'
        }
      }
    }
  };

  const STORIES_CATALOG = [VELVET_AND_RAIN];

  function registerChronicleStory(storyObj) {
    if (!storyObj || !storyObj.id) return false;
    const idx = STORIES_CATALOG.findIndex(s => s.id === storyObj.id);
    if (idx >= 0) STORIES_CATALOG[idx] = storyObj;
    else STORIES_CATALOG.push(storyObj);
    return true;
  }

  function getChronicleStoryById(storyId) {
    if (!storyId) return STORIES_CATALOG[0] || null;
    return STORIES_CATALOG.find(s => s.id === storyId) || STORIES_CATALOG[0] || null;
  }

  global.STORIES_CATALOG = STORIES_CATALOG;
  global.CHRONICLE_MEMORY_LABELS = MEMORY_LABELS;
  global.CHRONICLE_CLUE_LABELS = MEMORY_LABELS;
  global.registerChronicleStory = registerChronicleStory;
  global.getChronicleStoryById = getChronicleStoryById;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      STORIES_CATALOG,
      CHRONICLE_MEMORY_LABELS: MEMORY_LABELS,
      CHRONICLE_CLUE_LABELS: MEMORY_LABELS,
      registerChronicleStory,
      getChronicleStoryById
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
