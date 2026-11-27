"use strict";
/* =====================================================================
   PURE RULES ENGINE: BUDGET CLASH, COUPLE & BESTIE ARENA,
   STRICT COIN ECONOMY, VR SYNC & MODERATION HELPERS
   - Zero DOM dependencies so node:test can verify every invariant cleanly
   ===================================================================== */

const ShowGamesRules = (() => {
  const DAILY_FREE_COIN_CAP = 120;
  const BUDGET_ROUND_TIMER_SEC = 7;

  // ---------- 1. STRICT COIN ECONOMY ----------
  function calcDailyFreeCoinGrant(requestedCoins, alreadyClaimedToday, cap = DAILY_FREE_COIN_CAP) {
    const req = Math.max(0, Math.floor(Number(requestedCoins) || 0));
    const used = Math.max(0, Math.floor(Number(alreadyClaimedToday) || 0));
    const hardCap = Math.max(0, Math.floor(Number(cap) || DAILY_FREE_COIN_CAP));
    const remainingBefore = Math.max(0, hardCap - used);
    const granted = Math.min(req, remainingBefore);
    const remainingAfter = Math.max(0, remainingBefore - granted);
    return {
      requested: req,
      granted,
      usedAfter: used + granted,
      remaining: remainingAfter,
      cap: hardCap,
      capped: granted < req
    };
  }

  function validateShowBet(betAmount, walletCoins) {
    const bet = Math.max(0, Math.floor(Number(betAmount) || 0));
    const wallet = Math.max(0, Math.floor(Number(walletCoins) || 0));
    if (bet === 0) return { ok: true, bet: 0, grossPot: 0, fee: 0, winPayout: 0 };
    if (bet > wallet) {
      return { ok: false, reason: `Not enough coins (Need ${bet} 🪙, have ${wallet} 🪙)`, bet, winPayout: 0 };
    }
    const grossPot = bet * 2;
    const fee = Math.max(1, Math.round(grossPot * 0.1));
    const winPayout = Math.max(bet, grossPot - fee);
    return { ok: true, bet, grossPot, fee, winPayout };
  }

  // Enforces 0 coins in Free/Bot/Practice mode; coins ONLY on paid stake full-match win
  function settleStrictGameReward({ stake = 0, won = false, tie = false, expWin = 30, expLose = 12 } = {}) {
    const s = Math.max(0, Math.floor(Number(stake) || 0));
    if (s <= 0) {
      return {
        paidMatch: false,
        coinsDelta: 0,
        expDelta: won ? expWin : (tie ? Math.round(expWin * 0.65) : expLose),
        label: won ? `Victory · +${expWin} EXP (Free · 0 🪙)` : (tie ? `Draw · +${Math.round(expWin * 0.65)} EXP (Free · 0 🪙)` : `Good Try · +${expLose} EXP`)
      };
    }
    const pay = validateShowBet(s, s);
    if (won) {
      return {
        paidMatch: true,
        coinsDelta: pay.winPayout,
        expDelta: expWin,
        label: `🏆 Match Won! +${pay.winPayout} 🪙`
      };
    }
    if (tie) {
      return {
        paidMatch: true,
        coinsDelta: s,
        expDelta: Math.round(expWin * 0.65),
        label: `🤝 Draw · ${s} 🪙 Refunded`
      };
    }
    return {
      paidMatch: true,
      coinsDelta: 0,
      expDelta: expLose,
      label: `Match Lost · −${s} 🪙 Stake`
    };
  }

  // ---------- 2. INR CURRENCY FORMATTER ----------
  function formatINR(amount) {
    const n = Math.max(0, Math.round(Number(amount) || 0));
    if (n >= 10000000) {
      const cr = n / 10000000;
      return `₹${Number.isInteger(cr) ? cr : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`;
    }
    if (n >= 100000) {
      const lk = n / 100000;
      return `₹${Number.isInteger(lk) ? lk : lk.toFixed(1).replace(/\.0$/, '')} Lakh`;
    }
    return '₹' + n.toLocaleString('en-IN');
  }

  // ---------- 3. TOUGHER BUDGET CLASH CATALOG (CLOSE, TRICKY INDIAN & GLOBAL ITEMS) ----------
  const BUDGET_ITEMS = [
    // Close Everyday & Café Tier (₹35 – ₹899)
    {
      id: 'masala_chai', name: 'Airport Masala Chai', price: 140, decoyPrice: 110, category: 'Food', icon: 'chai',
      hint: 'Airport lounge pricing — way pricier than street cutting chai!',
      enText: 'Airport Masala Chai. Can you guess its real Indian market price?',
      hiSpoken: 'एयरपोर्ट मसाला चाय! क्या आप इसकी असली कीमत का सही अंदाज़ा लगा सकते हैं?',
      bnSpoken: 'এয়ারপোর্ট মসলা চা! আপনি কি এর আসল দামটা ঠিক আন্দাজ করতে পারবেন?'
    },
    {
      id: 'vintage_coin_10', name: '1947 Silver Proof Coin', price: 8500000, decoyPrice: 6800000, category: 'Collector', icon: 'goldbar',
      hint: 'Looks tiny like spare change, but rare pre-Independence mint proofs fetch lakhs!',
      enText: '1947 Silver Proof Coin. Small metal, massive auction value!',
      hiSpoken: '1947 का दुर्लभ सिल्वर प्रूफ सिक्का! देखने में छोटा, लेकिन नीलामी में कीमत करोड़ के करीब!',
      bnSpoken: '১৯৪৭ সালের বিরল সিলভার প্রুফ কয়েন! দেখতে ছোট, কিন্তু নিলামে দাম আকাশছোঁয়া!'
    },
    {
      id: 'replica_watch', name: 'Street Gold-Plated Watch', price: 499, decoyPrice: 699, category: 'Fashion', icon: 'watch',
      hint: 'Shiny gold finish, but it is a street market quartz replica under ₹1,000!',
      enText: 'Street Gold-Plated Watch. Looks royal, or is it a budget replica?',
      hiSpoken: 'स्ट्रीट गोल्ड-प्लेटेड घड़ी! दिखने में शाही है, पर क्या यह सस्ती रेप्लिका है?',
      bnSpoken: 'স্ট্রিট গোল্ড-প্লেটেড ঘড়ি! দেখতে রাজকীয়, নাকি এটা বাজেট রেপ্লিকা?'
    },
    {
      id: 'caramel_popcorn', name: 'Multiplex Caramel Popcorn', price: 420, decoyPrice: 340, category: 'Food', icon: 'pizza',
      hint: 'Large tub at a city cinema hall — noticeably above ₹300!',
      enText: 'Multiplex Caramel Popcorn. Think about cinema hall snack prices!',
      hiSpoken: 'मल्टीप्लेक्स कैरामेल पॉपकॉर्न! सिनेमा हॉल के स्नैक प्राइस याद कीजिए!',
      bnSpoken: 'মাল্টিপ্লেক্স ক্যারামেল পপকর্ন! সিনেমা হলের স্ন্যাকসের দাম ভাবুন!'
    },
    {
      id: 'matcha_latte', name: 'Artisanal Iced Matcha', price: 340, decoyPrice: 280, category: 'Food', icon: 'chai',
      hint: 'Specialty café drink in Mumbai or Bengaluru — right around ₹300 to ₹400.',
      enText: 'Artisanal Iced Matcha from a specialty metro café. What is the bill?',
      hiSpoken: 'स्पेशलिटी कैफे की आइस्ड माचा लाटे! बताइए इसका बिल कितना होगा?',
      bnSpoken: 'স্পেশালিটি ক্যাফের আইসড মাচা লাতে! বলুন তো এর দাম কত?'
    },
    {
      id: 'steel_flask', name: 'Vacuum Insulated Flask', price: 899, decoyPrice: 1149, category: 'Campus', icon: 'notebook',
      hint: 'Double-wall stainless bottle — sits right below the ₹1,000 mark.',
      enText: 'Vacuum Insulated Steel Flask. Close call around a thousand rupees!',
      hiSpoken: 'वैक्यूम इंसुलेटेड स्टील फ्लास्क! एक हज़ार रुपये के आस-पास का नज़दीकी मुकाबला!',
      bnSpoken: 'ভ্যাকুয়াম ইনসুলেটেড স্টিল ফ্লাস্ক! এক হাজার টাকার আশেপাশে দারুণ টক্কর!'
    },
    // Tricky Gadget & Lifestyle Tier (₹2,200 – ₹18,999)
    {
      id: 'earbuds', name: 'ANC Wireless Earbuds', price: 2799, decoyPrice: 2299, category: 'Tech', icon: 'earbuds',
      hint: 'Active noise cancelling TWS — mid-budget under ₹3,000.',
      enText: 'Active Noise Cancelling Wireless Earbuds. Spot the true market tag!',
      hiSpoken: 'एएनसी वायरलेस ईयरबड्स! इनकी असली मार्केट कीमत पहचानिए!',
      bnSpoken: 'এএনসি ওয়্যারলেস ইয়ারবাডস! এর আসল বাজারদর চিনে নিন!'
    },
    {
      id: 'mech_kb', name: 'RGB Mechanical Keyboard', price: 3499, decoyPrice: 2899, category: 'Tech', icon: 'laptop',
      hint: 'Hot-swappable tactile switches — just above ₹3,000.',
      enText: 'RGB Mechanical Keyboard with tactile switches. Guess closely!',
      hiSpoken: 'आरजीबी मैकेनिकल कीबोर्ड! सही कीमत का करीबी अंदाज़ा लगाइए!',
      bnSpoken: 'আরজিবি মেকানিক্যাল কিবোর্ড! একদম কাছাকাছি দামটা আন্দাজ করুন!'
    },
    {
      id: 'running_shoes', name: 'Carbon-Foam Running Shoes', price: 5499, decoyPrice: 4599, category: 'Sport', icon: 'sneakers',
      hint: 'Global athletic brand mid-tier trainers — around ₹5,000 to ₹6,000.',
      enText: 'Carbon-Foam Running Shoes. Close athletic pricing — choose smartly!',
      hiSpoken: 'कार्बन-फोम रनिंग शूज़! स्पोर्ट्स ब्रांड की असली कीमत सोचकर चुनिए!',
      bnSpoken: 'কার্বন-ফোম রানিং জুতো! স্পোর্টস ব্র্যান্ডের আসল দাম ভেবে বাছুন!'
    },
    {
      id: 'instant_cam', name: 'Retro Instant Film Camera', price: 6999, decoyPrice: 5799, category: 'Lifestyle', icon: 'phone',
      hint: 'Prints instant photo cards — sits right around ₹7,000.',
      enText: 'Retro Instant Film Camera. Popular gift item — what does it cost?',
      hiSpoken: 'रेट्रो इंस्टेंट फिल्म कैमरा! बताइए इसकी असली कीमत क्या है?',
      bnSpoken: 'রেট্রো ইনস্ট্যান্ট ফিল্ম ক্যামেরা! বলুন তো এর আসল দাম কত?'
    },
    {
      id: 'espresso_pod', name: 'Compact Espresso Machine', price: 12499, decoyPrice: 10299, category: 'Home', icon: 'chai',
      hint: '15-bar home coffee maker — just over ₹12,000.',
      enText: 'Compact Home Espresso Machine. Worth more or less than a smart watch?',
      hiSpoken: 'कॉम्पैक्ट होम एस्प्रेसो मशीन! क्या इसकी कीमत दस हज़ार से ऊपर है?',
      bnSpoken: 'কম্প্যাক্ট হোম এসপ্রেসো মেশিন! এর দাম কি দশ হাজারের বেশি?'
    },
    {
      id: 'smart_ring', name: 'Titanium Fitness Ring', price: 17999, decoyPrice: 14999, category: 'Tech', icon: 'necklace',
      hint: 'Tracks sleep & heart rate without a screen — close to ₹18,000!',
      enText: 'Titanium Smart Fitness Ring. Tiny wearable with premium sensors!',
      hiSpoken: 'टाइटेनियम स्मार्ट फिटनेस रिंग! छोटा सा गैजेट, लेकिन प्रीमियम सेंसर!',
      bnSpoken: 'টাইটানিয়াম স্মার্ট ফিটনেস রিং! ছোট্ট গ্যাজেট, কিন্তু দারুণ প্রিমিয়াম সেন্সর!'
    },
    // Premium Tech & Global Luxury Tier (₹28,000 – ₹1,85,000)
    {
      id: 'anc_headphones', name: 'Studio Over-Ear ANC', price: 29900, decoyPrice: 24900, category: 'Audio', icon: 'earbuds',
      hint: 'Flagship Japanese studio headphones — just shy of ₹30,000.',
      enText: 'Flagship Studio Over-Ear Headphones. Very close price spread!',
      hiSpoken: 'फ्लैगशिप स्टूडियो ओवर-ईयर हेडफ़ोन! बहुत करीबी मुकाबला है!',
      bnSpoken: 'ফ্ল্যাগশিপ স্টুডিও ওভার-ইয়ার হেডফোন! দাম দুটো খুব কাছাকাছি!'
    },
    {
      id: 'handheld_pc', name: 'OLED Handheld Console', price: 38999, decoyPrice: 32499, category: 'Gaming', icon: 'laptop',
      hint: 'Portable gaming powerhouse — sits near ₹39,000.',
      enText: 'OLED Handheld Gaming Console. Gamers know this price well!',
      hiSpoken: 'ओएलईडी हैंडहेल्ड गेमिंग कंसोल! गेमर्स को इसकी कीमत ज़रूर पता होगी!',
      bnSpoken: 'ওএলইডি হ্যান্ডহেল্ড গেমিং কনসোল! গেমাররা এর দাম নিশ্চয়ই জানেন!'
    },
    {
      id: 'flagship_phone', name: 'Pro Titanium 5G Phone', price: 82900, decoyPrice: 69900, category: 'Tech', icon: 'phone',
      hint: 'Flagship 256GB titanium edition — over ₹80,000 in India.',
      enText: 'Pro Titanium 5G Smartphone. Flagship pricing — pick carefully!',
      hiSpoken: 'प्रो टाइटेनियम 5G स्मार्टफोन! ध्यान से असली कीमत चुनिए!',
      bnSpoken: 'প্রো টাইটানিয়াম 5G স্মার্টফোন! মন দিয়ে আসল দামটা বেছে নিন!'
    },
    {
      id: 'carbon_bike', name: 'Carbon Road Bicycle', price: 118000, decoyPrice: 96000, category: 'Sport', icon: 'supercar',
      hint: 'Pro carbon-frame cycle — crosses ₹1.1 Lakh!',
      enText: 'Pro Carbon Road Bicycle. Lightweight frame, serious price tag!',
      hiSpoken: 'प्रो कार्बन रोड साइकिल! हल्का फ्रेम, लेकिन कीमत लाख के पार!',
      bnSpoken: 'প্রো কার্বন রোড সাইকেল! হালকা ফ্রেম, কিন্তু দাম এক লাখের উপরে!'
    },
    {
      id: 'gaming_laptop', name: 'Ultralight RTX Laptop', price: 149900, decoyPrice: 126900, category: 'Tech', icon: 'laptop',
      hint: 'High-refresh OLED creator laptop — right around ₹1.5 Lakh.',
      enText: 'Ultralight RTX Creator Laptop. Is it closer to 1.25 or 1.5 Lakh?',
      hiSpoken: 'अल्ट्रालाइट आरटीएक्स लैपटॉप! असली कीमत 1.5 लाख के करीब है या कम?',
      bnSpoken: 'আল্ট্রালাইট আরটিএক্স ল্যাপটপ! আসল দাম কি দেড় লাখের কাছাকাছি?'
    },
    {
      id: 'swiss_dress_watch', name: 'Swiss Automatic Diver', price: 175000, decoyPrice: 142000, category: 'Luxury', icon: 'watch',
      hint: 'Entry-luxury Swiss mechanical diver — ₹1.75 Lakh, NOT ₹1 Crore!',
      enText: 'Swiss Automatic Diver Watch. Luxury watch, but is it Lakhs or Crores?',
      hiSpoken: 'स्विस ऑटोमैटिक डाइवर घड़ी! लक्ज़री है, पर लाख में है या करोड़ में?',
      bnSpoken: 'সুইস অটোমেটিক ডাইভার ঘড়ি! লাক্সারি ঘড়ি, কিন্তু লাখে নাকি কোটিতে?'
    },
    // Ultra-Luxury & ₹1 Cr Showstopper Tier (₹45 Lakh – ₹1.35 Cr)
    {
      id: 'vintage_comic', name: 'First-Print Rare Comic', price: 4800000, decoyPrice: 3800000, category: 'Collector', icon: 'notebook',
      hint: 'Looks like an old comic book, but graded mint copies auction for ₹48 Lakh!',
      enText: 'Graded First-Print Rare Comic Book. Paper that beats a luxury car!',
      hiSpoken: 'पहली प्रिंट की दुर्लभ कॉमिक बुक! कागज़ की कीमत लक्ज़री कार से भी ज़्यादा!',
      bnSpoken: 'প্রথম প্রিন্টের বিরল কমিক বই! একটা বইয়ের দাম লাক্সারি গাড়ির সমান!'
    },
    {
      id: 'ev_sedan', name: 'Luxury Electric Sedan', price: 7800000, decoyPrice: 6400000, category: 'Auto', icon: 'supercar',
      hint: 'Imported dual-motor EV sedan in India — ₹78 Lakh ex-showroom.',
      enText: 'Luxury Dual-Motor Electric Sedan. Almost a Crore, or just under?',
      hiSpoken: 'लक्ज़री इलेक्ट्रिक सेडान! क्या यह एक करोड़ के पार है या नीचे?',
      bnSpoken: 'লাক্সারি ইলেকট্রিক সেডান! এর দাম কি এক কোটির কাছে?'
    },
    {
      id: 'swiss_watch', name: 'Swiss Diamond Tourbillon', price: 10000000, decoyPrice: 8200000, category: 'Luxury', icon: 'watch',
      hint: 'True haute horlogerie tourbillon — right on the ₹1 Crore jackpot mark!',
      enText: 'Swiss Diamond Tourbillon Watch. Masterpiece worth One Crore!',
      hiSpoken: 'स्विस डायमंड टर्बिलॉन घड़ी! पूरे एक करोड़ का शानदार जैकपॉट!',
      bnSpoken: 'সুইস ডায়মন্ড টার্বিলন ঘড়ি! পুরো এক কোটি টাকার দারুণ জ্যাকপট!'
    },
    {
      id: 'gold_bullion', name: 'Heritage Gold Bullion Set', price: 10500000, decoyPrice: 8800000, category: 'Vault', icon: 'goldbar',
      hint: '24K Hallmarked Investment Vault Bars — just above ₹1 Crore!',
      enText: 'Heritage 24K Gold Bullion Set. Pure bullion vault value!',
      hiSpoken: '24 कैरेट गोल्ड बुलियन सेट! तिजोरी का असली एक करोड़ का खज़ाना!',
      bnSpoken: '২৪ ক্যারেট গোল্ড বুলিয়ন সেট! ভল্টের আসল এক কোটির সম্পদ!'
    },
    {
      id: 'emerald_necklace', name: 'Royal Kashmir Emerald Set', price: 11200000, decoyPrice: 9100000, category: 'Vault', icon: 'necklace',
      hint: 'Collector-grade emerald & diamond heritage set — ₹1.12 Crore!',
      enText: 'Royal Kashmir Emerald Necklace. Auction-grade fine jewellery!',
      hiSpoken: 'रॉयल कश्मीर एमरल्ड नेकलेस! नीलामी स्तर का करोड़ों का हार!',
      bnSpoken: 'রয়্যাল কাশ্মীর পান্না নেকলেস! নিলামের কোটি টাকার গয়না!'
    },
    {
      id: 'supercar', name: 'Bespoke V8 Sports Coupe', price: 13200000, decoyPrice: 10800000, category: 'Auto', icon: 'supercar',
      hint: 'Imported European V8 coupe — crosses ₹1.3 Crore in India!',
      enText: 'Bespoke V8 Sports Coupe. Pure supercar territory!',
      hiSpoken: 'बिस्पोक वी8 स्पोर्ट्स कूप! असली सुपरकार की कीमत पहचानिए!',
      bnSpoken: 'বিস্পোক ভি৮ স্পোর্টস কুপ! আসল সুপারকারের দাম চিনে নিন!'
    }
  ];

  // ---------- 3B. NON-REPEATING QUESTION / PROMPT ENGINE ----------
  function shuffleArray(list, rng = Math.random) {
    const arr = Array.isArray(list) ? list.slice() : [];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function defaultItemId(item, idx) {
    if (item && typeof item === 'object') {
      if (item.id != null && item.id !== '') return String(item.id);
      if (item.q) return String(item.q);
      if (item.question) return String(item.question);
      if (item.prompt) return String(item.prompt);
      if (item.task) return String(item.task);
    }
    return String(idx);
  }

  /**
   * Draws `count` items from `pool` prioritizing unseen IDs in `seenIds`.
   * Once unseen items run out, begins a fresh shuffled cycle while avoiding
   * immediately repeating the items just chosen in this batch (or recently seen).
   */
  function drawNonRepeatingBatch(pool, count, seenIds = [], getId = defaultItemId, rng = Math.random) {
    const src = Array.isArray(pool) ? pool : [];
    const want = Math.max(0, Math.min(Number(count) || 0, src.length));
    if (!want) {
      return { items: [], seenIds: Array.isArray(seenIds) ? seenIds.slice() : Array.from(seenIds || []), cycled: false };
    }
    const idOf = typeof getId === 'function' ? getId : defaultItemId;
    const seenSet = new Set(Array.isArray(seenIds) ? seenIds.map(String) : Array.from(seenIds || []).map(String));
    const keyed = src.map((item, idx) => ({ item, id: String(idOf(item, idx)) }));

    const unseen = shuffleArray(keyed.filter(x => !seenSet.has(x.id)), rng);
    const chosen = [];
    const chosenIds = new Set();
    let cycled = false;

    for (let i = 0; i < unseen.length && chosen.length < want; i++) {
      chosen.push(unseen[i].item);
      chosenIds.add(unseen[i].id);
    }

    if (chosen.length < want) {
      // Fresh cycle: reset seen history to only the items picked in this batch
      // so we never repeat the exact previous batch back-to-back.
      cycled = true;
      const prevSeenList = Array.isArray(seenIds) ? seenIds.map(String) : Array.from(seenIds || []).map(String);
      const recentTail = new Set(prevSeenList.slice(-Math.min(want, Math.max(1, src.length - want))));
      const preferredRecycle = shuffleArray(
        keyed.filter(x => !chosenIds.has(x.id) && !recentTail.has(x.id)),
        rng
      );
      const fallbackRecycle = shuffleArray(
        keyed.filter(x => !chosenIds.has(x.id) && recentTail.has(x.id)),
        rng
      );
      const refill = [...preferredRecycle, ...fallbackRecycle];
      for (let i = 0; i < refill.length && chosen.length < want; i++) {
        chosen.push(refill[i].item);
        chosenIds.add(refill[i].id);
      }
      return {
        items: chosen,
        seenIds: Array.from(chosenIds),
        cycled: true
      };
    }

    const nextSeen = [...Array.from(seenSet), ...Array.from(chosenIds)];
    // If the entire pool has now been consumed, keep the latest batch as the
    // cooldown anchor so the next call starts a fresh cycle without repeating this batch.
    if (nextSeen.length >= keyed.length) {
      return {
        items: chosen,
        seenIds: Array.from(chosenIds),
        cycled: true
      };
    }
    return {
      items: chosen,
      seenIds: nextSeen,
      cycled
    };
  }

  function loadSeenQuestionIds(storageKey) {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem('sg_seen_q_' + storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  function saveSeenQuestionIds(storageKey, ids) {
    try {
      if (typeof localStorage === 'undefined') return;
      const list = Array.isArray(ids) ? ids.map(String).slice(-200) : [];
      localStorage.setItem('sg_seen_q_' + storageKey, JSON.stringify(list));
    } catch {}
  }

  function drawPersistentQuestions(storageKey, pool, count, getId = defaultItemId, rng = Math.random) {
    const prev = loadSeenQuestionIds(storageKey);
    const res = drawNonRepeatingBatch(pool, count, prev, getId, rng);
    saveSeenQuestionIds(storageKey, res.seenIds);
    return res.items;
  }

  // Tricky "₹10 vs ₹1 Cr" deceptive matchups (10 unique pairs so back-to-back rounds stay fresh!)
  const TRICKY_TEN_VS_CR_PAIRS = [
    {
      id: 'tvc_watch',
      budget: {
        id: 'decoy_watch', name: 'Gold-Plated Quartz Replica', price: 499, category: 'Lookalike', icon: 'watch',
        hint: 'One watch is a ₹499 street replica; the other is an authentic ₹1 Cr Tourbillon!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'swiss_watch')
    },
    {
      id: 'tvc_book',
      budget: {
        id: 'decoy_book', name: 'Spiral Sketch Notebook', price: 120, category: 'Campus', icon: 'notebook',
        hint: 'Both look like paper, but a graded First-Print Comic auctions for ₹48 Lakh!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'vintage_comic')
    },
    {
      id: 'tvc_coin',
      budget: {
        id: 'decoy_gold_coin', name: 'Brass Souvenir Token', price: 80, category: 'Souvenir', icon: 'goldbar',
        hint: 'Do not judge by shine — one is an ₹80 souvenir token, the other is a ₹85 Lakh 1947 Proof Coin!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'vintage_coin_10')
    },
    {
      id: 'tvc_swiss',
      budget: {
        id: 'decoy_swiss', name: 'Swiss Automatic Diver', price: 175000, category: 'Mid-Luxury', icon: 'watch',
        hint: 'Both are real luxury items, but only ONE crosses the ₹1 Crore mark!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'emerald_necklace')
    },
    {
      id: 'tvc_bike',
      budget: {
        id: 'decoy_bike', name: 'Carbon Road Bicycle', price: 118000, category: 'Pro Sport', icon: 'supercar',
        hint: 'Both are performance machines, yet one is ₹1.18 Lakh and the other is ₹1.32 Crore!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'supercar')
    },
    {
      id: 'tvc_ring',
      budget: {
        id: 'decoy_ring', name: 'Titanium Fitness Ring', price: 17999, category: 'Smart Tech', icon: 'necklace',
        hint: 'Smart titanium wearable vs 24K Investment Gold Bullion Vault Set!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'gold_bullion')
    },
    {
      id: 'tvc_ev',
      budget: {
        id: 'decoy_diecast', name: '1:18 Scale Collector Model Car', price: 3200, category: 'Collectible', icon: 'supercar',
        hint: 'One fits on a desk for ₹3,200; the other is a real ₹78 Lakh Luxury EV Sedan!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'ev_sedan')
    },
    {
      id: 'tvc_tech',
      budget: {
        id: 'decoy_earbuds', name: 'ANC Wireless Earbuds', price: 2799, category: 'Tech', icon: 'earbuds',
        hint: 'Budget TWS earbuds vs an authentic ₹1.05 Crore 24K Gold Bullion Vault!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'gold_bullion')
    },
    {
      id: 'tvc_laptop',
      budget: {
        id: 'decoy_laptop', name: 'Ultralight RTX Laptop', price: 149900, category: 'Tech', icon: 'laptop',
        hint: 'High-end creator laptop (₹1.5L) vs a ₹1.12 Crore Kashmir Emerald Necklace!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'emerald_necklace')
    },
    {
      id: 'tvc_cam',
      budget: {
        id: 'decoy_cam', name: 'Retro Instant Film Camera', price: 6999, category: 'Lifestyle', icon: 'phone',
        hint: 'Retro instant camera (₹6,999) vs a ₹1 Crore Swiss Diamond Tourbillon!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'swiss_watch')
    }
  ];

  const BUDGET_MODES = [
    { id: 'ten_vs_cr', name: '₹10 vs ₹1 Cr', short: 'Tricky Decoys', icon: '🎭' },
    { id: 'asli_nakli', name: 'Asli vs Nakli', short: 'Tight Market Price', icon: '🏷️' },
    { id: 'sasta_mehnga', name: 'Sasta ya Mehnga', short: 'Close Higher/Lower', icon: '📈' },
    { id: 'closest_guess', name: 'Closest Guess Wins', short: 'Exact Price Duel', icon: '🎯' }
  ];

  function createTenVsCrRound(excludeOrRng = new Set(), maybeRng = Math.random) {
    let excludeIds = new Set();
    let rng = Math.random;
    if (typeof excludeOrRng === 'function') {
      rng = excludeOrRng;
    } else {
      excludeIds = excludeOrRng instanceof Set ? excludeOrRng : new Set(Array.isArray(excludeOrRng) ? excludeOrRng : []);
      rng = typeof maybeRng === 'function' ? maybeRng : Math.random;
    }
    const pool = TRICKY_TEN_VS_CR_PAIRS.filter(p => !excludeIds.has(p.id));
    const list = pool.length ? pool : TRICKY_TEN_VS_CR_PAIRS;
    const pick = list[Math.floor(rng() * list.length)] || TRICKY_TEN_VS_CR_PAIRS[0];
    const swap = rng() >= 0.5;
    const pair = swap ? [pick.jackpot, pick.budget] : [pick.budget, pick.jackpot];
    const jackpotIndex = swap ? 0 : 1;
    return {
      id: pick.id,
      mode: 'ten_vs_cr',
      pair,
      jackpotIndex,
      jackpot: pick.jackpot,
      budget: pick.budget,
      timerSec: BUDGET_ROUND_TIMER_SEC,
      prompt: {
        enText: `Tricky Curtain Reveal! Between ${pair[0].name} and ${pair[1].name}, which one is the real fortune? You have 7 seconds!`,
        hiSpoken: `मुश्किल पर्दा उठा है! ${pair[0].name} और ${pair[1].name} में से असली करोड़ों का खज़ाना कौन-सा है? आपके पास 7 सेकंड हैं!`,
        bnSpoken: `কঠিন পর্দা উঠল! ${pair[0].name} আর ${pair[1].name}-এর মধ্যে আসল কোটি টাকার জিনিস কোনটা? আপনার হাতে ৭ সেকেন্ড!`
      }
    };
  }

  function createAsliNakliRound(excludeIds = new Set(), rng = Math.random) {
    const seen = excludeIds instanceof Set ? excludeIds : new Set(Array.isArray(excludeIds) ? excludeIds : []);
    const pool = BUDGET_ITEMS.filter(i => !seen.has(i.id));
    const item = (pool.length ? pool : BUDGET_ITEMS)[Math.floor(rng() * (pool.length ? pool.length : BUDGET_ITEMS.length))];
    // Tight realistic spread (±14% to ±26%) so it requires genuine price sense
    const direction = rng() >= 0.5 ? 1 : -1;
    const pct = 0.14 + rng() * 0.12;
    const computedDecoy = item.decoyPrice && Math.abs(item.decoyPrice - item.price) / item.price <= 0.28
      ? item.decoyPrice
      : Math.max(10, Math.round((item.price * (1 + direction * pct)) / 10) * 10);
    const swap = rng() >= 0.5;
    const options = swap
      ? [{ price: item.price, isReal: true }, { price: computedDecoy, isReal: false }]
      : [{ price: computedDecoy, isReal: false }, { price: item.price, isReal: true }];
    return {
      mode: 'asli_nakli',
      item,
      options,
      correctIdx: swap ? 0 : 1,
      timerSec: BUDGET_ROUND_TIMER_SEC,
      prompt: {
        enText: `Asli vs Nakli! ${item.name} — is the real price ${formatINR(options[0].price)} or ${formatINR(options[1].price)}? 7 seconds!`,
        hiSpoken: `असली या नकली! ${item.name} की असली कीमत ${formatINR(options[0].price)} है या ${formatINR(options[1].price)}? 7 सेकंड हैं!`,
        bnSpoken: `আসল নাকি নকল! ${item.name}-এর আসল দাম ${formatINR(options[0].price)} নাকি ${formatINR(options[1].price)}? ৭ সেকেন্ড সময়!`
      }
    };
  }

  function createSastaMehngaPair(prevItem = null, excludeOrRng = new Set(), maybeRng = Math.random) {
    let excludeIds = new Set();
    let rng = Math.random;
    if (typeof excludeOrRng === 'function') {
      rng = excludeOrRng;
    } else {
      excludeIds = excludeOrRng instanceof Set ? excludeOrRng : new Set(Array.isArray(excludeOrRng) ? excludeOrRng : []);
      rng = typeof maybeRng === 'function' ? maybeRng : Math.random;
    }
    const anchorPool = BUDGET_ITEMS.filter(i => !excludeIds.has(i.id));
    const anchor = prevItem || (anchorPool.length ? anchorPool : BUDGET_ITEMS)[Math.floor(rng() * (anchorPool.length ? anchorPool.length : BUDGET_ITEMS.length))];
    // Prefer unseen, close, tricky challengers within 0.35x .. 2.8x of anchor price!
    const unseenClose = BUDGET_ITEMS.filter(i =>
      i.id !== anchor.id &&
      !excludeIds.has(i.id) &&
      i.price !== anchor.price &&
      i.price >= anchor.price * 0.35 &&
      i.price <= anchor.price * 2.8
    );
    const unseenAny = BUDGET_ITEMS.filter(i => i.id !== anchor.id && !excludeIds.has(i.id) && i.price !== anchor.price);
    const closePool = BUDGET_ITEMS.filter(i =>
      i.id !== anchor.id &&
      i.price !== anchor.price &&
      i.price >= anchor.price * 0.35 &&
      i.price <= anchor.price * 2.8
    );
    const fallbackPool = BUDGET_ITEMS.filter(i => i.id !== anchor.id && i.price !== anchor.price);
    const pool = unseenClose.length ? unseenClose : (unseenAny.length ? unseenAny : (closePool.length ? closePool : fallbackPool));
    const challenger = pool[Math.floor(rng() * pool.length)];
    const answer = challenger.price > anchor.price ? 'higher' : 'lower';
    return {
      mode: 'sasta_mehnga',
      anchor,
      challenger,
      answer,
      timerSec: BUDGET_ROUND_TIMER_SEC,
      prompt: {
        enText: `Sasta ya Mehnga! ${anchor.name} costs ${formatINR(anchor.price)}. Is ${challenger.name} Higher or Lower? 7 seconds!`,
        hiSpoken: `सस्ता या महंगा! ${anchor.name} की कीमत ${formatINR(anchor.price)} है। क्या ${challenger.name} इससे महंगा है या सस्ता?`,
        bnSpoken: `সস্তা না দামি! ${anchor.name}-এর দাম ${formatINR(anchor.price)}। ${challenger.name} কি এর থেকে দামি না সস্তা?`
      }
    };
  }

  function evaluateClosestGuesses(actualPrice, entries) {
    const actual = Math.max(1, Number(actualPrice) || 1);
    const ranked = (Array.isArray(entries) ? entries : []).map(e => {
      const guess = Math.max(0, Math.round(Number(e.guess) || 0));
      const diff = Math.abs(guess - actual);
      const accuracy = Math.max(0, Math.round((1 - Math.min(1, diff / actual)) * 100));
      return { ...e, guess, diff, accuracy };
    }).sort((a, b) => a.diff - b.diff);
    return {
      actual,
      winnerId: ranked[0]?.id || '',
      ranked
    };
  }

  function applyBudgetLifeline(type, roundState) {
    if (type === 'fifty_fifty' || type === 'fifty') {
      return {
        ok: true,
        type: 'fifty_fifty',
        message: '50-50 Active! Tighter price bracket locked on the correct card.'
      };
    }
    if (type === 'hint') {
      const target = roundState?.item || roundState?.challenger || roundState?.pair?.[roundState?.jackpotIndex || 0];
      const baseHint = target?.hint || 'Compare Indian retail & collector market value carefully!';
      const low = target ? formatINR(Math.max(10, Math.round(target.price * 0.78))) : '₹100';
      const high = target ? formatINR(Math.round(target.price * 1.22)) : '₹1 Cr';
      return {
        ok: true,
        type,
        message: `💡 Price Hint: ${baseHint} (Bracket: ${low} – ${high})`
      };
    }
    return { ok: false, message: 'Unknown lifeline' };
  }

  // ---------- 4. COUPLE & BESTIE ARENA DATA & RULES (EXPANDED NON-REPEATING POOLS) ----------
  const MIND_SYNC_PROMPTS = [
    {
      id: 'ms1', question: 'Ideal Midnight Craving?',
      options: ['Hot Maggi', 'Ice Cream', 'Street Momos', 'Cold Coffee'],
      enText: 'Mind Sync! What is your duo’s ideal midnight craving?',
      hiSpoken: 'माइंड सिंक! आधी रात को आप दोनों का सबसे पसंदीदा खाना क्या है?',
      bnSpoken: 'মাইন্ড সিঙ্ক! মাঝরাতে তোমাদের দুজনের সবচেয়ে পছন্দের খাবার কোনটা?'
    },
    {
      id: 'ms2', question: 'Dream Weekend Escape?',
      options: ['Mountain Roadtrip', 'Beach Sunset', 'Cozy Movie Night', 'Gaming Marathon'],
      enText: 'Pick your dream weekend escape without peeking!',
      hiSpoken: 'बिना देखे अपना ड्रीम वीकेंड प्लान चुनिए!',
      bnSpoken: 'না দেখে তোমাদের স্বপ্নের উইকেন্ড প্ল্যান বেছে নাও!'
    },
    {
      id: 'ms3', question: 'Who Takes Longer to Get Ready?',
      options: ['Always Me', 'My Partner', 'Both Late', 'Ready in 5 Mins'],
      enText: 'Be honest! Who takes longer to get ready?',
      hiSpoken: 'सच बताइए! तैयार होने में सबसे ज़्यादा समय कौन लेता है?',
      bnSpoken: 'সত্যি করে বলো! তৈরি হতে সবচেয়ে বেশি সময় কে নেয়?'
    },
    {
      id: 'ms4', question: 'Best Music Vibe Together?',
      options: ['Bollywood Lo-Fi', 'Punjabi Party', 'Bengali Acoustic', 'Global Pop'],
      enText: 'Lock in the soundtrack that matches your vibe!',
      hiSpoken: 'आप दोनों की वाइब से सबसे ज़्यादा कौन-सा म्यूज़िक मैच करता है?',
      bnSpoken: 'তোমাদের দুজনের ভাইবের সাথে কোন গান সবচেয়ে ভালো মানায়?'
    },
    {
      id: 'ms5', question: 'First Thing on a ₹1 Cr Lottery Win?',
      options: ['World Tour', 'Dream House', 'Supercar', 'Invest & Chill'],
      enText: 'If you won One Crore together today, what is move number one?',
      hiSpoken: 'अगर आज आप दोनों एक करोड़ जीत जाएं, तो सबसे पहले क्या करेंगे?',
      bnSpoken: 'যদি আজ তোমরা এক কোটি টাকা জিতে যাও, প্রথমেই কী করবে?'
    },
    {
      id: 'ms6', question: 'Rainy Evening Perfect Plan?',
      options: ['Chai & Pakora', 'Long Drive', 'Balcony Music', 'Binge Web Series'],
      enText: 'Rain is pouring outside! Pick your perfect duo plan.',
      hiSpoken: 'बाहर बारिश हो रही है! आप दोनों का परफेक्ट प्लान क्या होगा?',
      bnSpoken: 'বাইরে বৃষ্টি হচ্ছে! তোমাদের পারফেক্ট প্ল্যান কোনটা?'
    },
    {
      id: 'ms7', question: 'Best Movie Genre for Tonight?',
      options: ['Rom-Com', 'Horror Thriller', 'Sci-Fi Action', 'Anime Marathon'],
      enText: 'Movie night starts in five minutes! What genre do you both pick?',
      hiSpoken: 'मूवी नाइट शुरू होने वाली है! आप दोनों कौन-सा जॉनर चुनेंगे?',
      bnSpoken: 'মুভি নাইট শুরু হবে! তোমরা কোন ধরনের সিনেমা বেছে নেবে?'
    },
    {
      id: 'ms8', question: 'Dream International Vacation?',
      options: ['Switzerland Alps', 'Tokyo Streets', 'Bali Villas', 'Paris Lights'],
      enText: 'Passports ready! Which dream country do you pick together?',
      hiSpoken: 'पासपोर्ट तैयार है! आप दोनों साथ में किस देश घूमने जाएंगे?',
      bnSpoken: 'পাসপোর্ট রেডি! তোমরা একসাথে কোন দেশে ঘুরতে যাবে?'
    },
    {
      id: 'ms9', question: 'Go-To Street Food Treat?',
      options: ['Pani Puri', 'Chole Bhature', 'Egg Roll', 'Pav Bhaji'],
      enText: 'Street food cravings just hit! Lock in the ultimate plate.',
      hiSpoken: 'स्ट्रीट फूड की क्रेविंग हो रही है! सबसे बेस्ट डिश चुनिए!',
      bnSpoken: 'স্ট্রিট ফুড খেতে ইচ্ছে করছে! কোন খাবারটা বাছবে?'
    },
    {
      id: 'ms10', question: 'Your Duo Superpower?',
      options: ['Telepathy', 'Time Travel', 'Invisibility', 'Flying'],
      enText: 'Choose one superpower to share as a duo!',
      hiSpoken: 'आप दोनों को एक सुपरपावर मिले तो कौन-सी चुनेंगे?',
      bnSpoken: 'তোমরা দুজন মিলে একটা সুপারপাওয়ার পেলে কোনটা নেবে?'
    },
    {
      id: 'ms11', question: 'Ideal Sunday Morning?',
      options: ['Sleep Till Noon', 'Cafe Brunch', 'Early Workout', 'Arcade Session'],
      enText: 'No alarms today! What does your ideal Sunday look like?',
      hiSpoken: 'आज कोई अलार्म नहीं है! आपका परफेक्ट संडे कैसा होगा?',
      bnSpoken: 'আজ কোনো অ্যালার্ম নেই! তোমাদের পারফেক্ট রবিবার কেমন হবে?'
    },
    {
      id: 'ms12', question: 'Favorite Dessert to Share?',
      options: ['Gulab Jamun', 'Chocolate Brownie', 'Rasmalai', 'Cheesecake'],
      enText: 'Dessert menu is open! Pick the sweet dish you both love.',
      hiSpoken: 'मीठे का समय हो गया है! अपनी पसंदीदा मिठाई लॉक कीजिए!',
      bnSpoken: 'মিষ্টি খাওয়ার সময়! তোমাদের প্রিয় ডেজার্ট কোনটা?'
    },
    {
      id: 'ms13', question: 'Best Multiplayer Game Night Pick?',
      options: ['Ludo Royal', 'UNO Chaos', '8-Ball Pool', 'Budget Clash'],
      enText: 'Game night trophy is on the line! Which arena do you pick?',
      hiSpoken: 'गेम नाइट की ट्रॉफी दांव पर है! आप कौन-सा गेम चुनेंगे?',
      bnSpoken: 'গেম নাইট ট্রফি জেতার লড়াই! কোন গেমটা খেলবে?'
    },
    {
      id: 'ms14', question: 'Dream Pet to Adopt Together?',
      options: ['Golden Retriever', 'Fluffy Cat', 'Talking Parrot', 'Mini Bunny'],
      enText: 'If you adopt a cute pet together, which one steals your heart?',
      hiSpoken: 'अगर आप दोनों साथ में कोई पेट अपनाएं, तो कौन-सा चुनेंगे?',
      bnSpoken: 'তোমরা একসাথে কোনো পোষা প্রাণী নিলে কোনটা বেছে নেবে?'
    },
    {
      id: 'ms15', question: 'Go-To Drink at a Cafe?',
      options: ['Iced Latte', 'Masala Chai', 'Hot Chocolate', 'Fresh Mojito'],
      enText: 'Waiter is at your table! Lock your cafe order.',
      hiSpoken: 'कैफे में वेटर आ गया है! अपनी पसंदीदा ड्रिंक चुनिए!',
      bnSpoken: 'ক্যাফেতে অর্ডার দেওয়ার সময়! কোন ড্রিঙ্কটা বেছে নেবে?'
    },
    {
      id: 'ms16', question: 'Best Way to Celebrate a Big Win?',
      options: ['Fancy Dinner', 'Party Room Jam', 'Shopping Spree', 'Surprise Trip'],
      enText: 'You just hit a massive milestone! How do you celebrate?',
      hiSpoken: 'आप दोनों ने बड़ी जीत हासिल की है! सेलिब्रेशन कैसे होगा?',
      bnSpoken: 'তোমরা বড় একটা জয় পেয়েছ! কীভাবে সেলিব্রেট করবে?'
    }
  ];

  const TRUTH_DARE_WEDGES = [
    {
      id: 'td1', kind: 'DARE', label: 'No Yes/No', color: '#ec4899',
      task: 'Talk on voice chat for 2 minutes without saying "Yes" or "No"!',
      enText: 'Dare! Talk on voice chat for two minutes without saying Yes or No!',
      hiSpoken: 'डेयर! वॉइस चैट पर दो मिनट तक बिना हाँ या ना कहे बात कीजिए!',
      bnSpoken: 'ডেয়ার! ভয়েস চ্যাটে দুই মিনিট হ্যাঁ বা না না বলে কথা বলো!',
      variants: [
        { id: 'td1_a', task: 'Talk on voice chat for 2 minutes without saying "Yes" or "No"!', enText: 'Dare! Talk for two minutes without saying Yes or No!', hiSpoken: 'डेयर! दो मिनट तक बिना हाँ या ना कहे बात कीजिए!', bnSpoken: 'ডেয়ার! দুই মিনিট হ্যাঁ বা না না বলে কথা বলো!' },
        { id: 'td1_b', task: 'Speak the next 3 sentences in a dramatic news anchor voice!', enText: 'Dare! Speak your next three sentences like a breaking news anchor!', hiSpoken: 'डेयर! अगले तीन वाक्य ब्रेकिंग न्यूज़ एंकर की आवाज़ में बोलिए!', bnSpoken: 'ডেয়ার! পরের তিনটে বাক্য নিউজ অ্যাঙ্কারের মতো করে বলো!' },
        { id: 'td1_c', task: 'Give your partner a hilarious royal nickname and use it for 3 rounds!', enText: 'Dare! Invent a royal nickname for your partner and use it for three rounds!', hiSpoken: 'डेयर! अपने पार्टनर को एक शाही निकनेम दीजिए और 3 राउंड तक वही बोलिए!', bnSpoken: 'ডেয়ার! তোমার পার্টনারকে একটা রাজকীয় ডাকনাম দাও আর ৩ রাউন্ড ওটাই বলো!' }
      ]
    },
    {
      id: 'td2', kind: 'TRUTH', label: 'First Impression', color: '#8b5cf6',
      task: 'Share your honest first impression of your partner or bestie!',
      enText: 'Truth! Share your honest first impression of your partner or bestie!',
      hiSpoken: 'ट्रुथ! अपने पार्टनर या बेस्टी के बारे में आपका पहला इम्प्रेशन क्या था?',
      bnSpoken: 'ট্রুথ! তোমার পার্টনার বা বেস্টিকে প্রথম দেখে কী মনে হয়েছিল?',
      variants: [
        { id: 'td2_a', task: 'Share your honest first impression of your partner or bestie!', enText: 'Truth! Share your honest first impression of your partner!', hiSpoken: 'ट्रुथ! अपने पार्टनर के बारे में आपका पहला इम्प्रेशन क्या था?', bnSpoken: 'ট্রুথ! তোমার পার্টনারকে প্রথম দেখে কী মনে হয়েছিল?' },
        { id: 'td2_b', task: 'What is one tiny thing your partner does that secretly makes you smile?', enText: 'Truth! What tiny thing your partner does secretly makes you smile?', hiSpoken: 'ट्रुथ! आपके पार्टनर की कौन-सी छोटी-सी बात आपको मुस्कुराने पर मजबूर कर देती है?', bnSpoken: 'ট্রুথ! তোমার পার্টনারের কোন ছোট্ট কাজটা তোমার মুখে হাসি আনে?' },
        { id: 'td2_c', task: 'When was the last time you laughed until your stomach hurt together?', enText: 'Truth! When did you last laugh until your stomach hurt together?', hiSpoken: 'ट्रुथ! आखिरी बार आप दोनों साथ में कब इतना हंसे थे कि पेट दुखने लगा?', bnSpoken: 'ট্রুথ! শেষ কবে তোমরা দুজনে মিলে পেটে খিল ধরা হাসি হেসেছিলে?' }
      ]
    },
    {
      id: 'td3', kind: 'PENALTY', label: 'Sweet Penalty', color: '#f59e0b',
      task: 'Hum or sing 2 lines of a romantic or friendship song right now!',
      enText: 'Sweet Penalty! Hum or sing two lines of a romantic or friendship song!',
      hiSpoken: 'स्वीट पेनल्टी! अभी कोई प्यारा-सा दोस्ती या रोमांटिक गाना गुनगुनाइए!',
      bnSpoken: 'সুইট পেনাল্টি! এখনই বন্ধুত্ব বা ভালোবাসার গানের দুটো লাইন গেয়ে শোনাও!',
      variants: [
        { id: 'td3_a', task: 'Hum or sing 2 lines of a romantic or friendship song right now!', enText: 'Sweet Penalty! Sing two lines of a romantic or friendship song!', hiSpoken: 'स्वीट पेनल्टी! अभी कोई प्यारा-सा गाना गुनगुनाइए!', bnSpoken: 'সুইট পেনাল্টি! এখনই একটা সুন্দর গানের দুটো লাইন গাও!' },
        { id: 'td3_b', task: 'Write a 2-line rhyming shayari or mini poem about your duo right now!', enText: 'Sweet Penalty! Create a two-line rhyming poem about your duo!', hiSpoken: 'स्वीट पेनल्टी! अपनी जोड़ी पर अभी दो लाइन की मज़ेदार शायरी सुनाइए!', bnSpoken: 'সুইট পেনাল্টি! তোমাদের জুটি নিয়ে এখনই দুই লাইনের একটা ছড়া বলো!' },
        { id: 'td3_c', task: 'Send a surprise sweet voice note or hype message in chat!', enText: 'Sweet Penalty! Drop a surprise hype compliment in chat right now!', hiSpoken: 'स्वीट पेनल्टी! अभी चैट में एक प्यारा-सा सरप्राइज़ मैसेज भेजिए!', bnSpoken: 'সুইট পেনাল্টি! এখনই চ্যাটে একটা মিষ্টি সারপ্রাইজ মেসেজ পাঠাও!' }
      ]
    },
    {
      id: 'td4', kind: 'DARE', label: '3 Compliments', color: '#ef4444',
      task: 'Give 3 rapid-fire genuine compliments in under 15 seconds!',
      enText: 'Dare! Give three rapid-fire genuine compliments in fifteen seconds!',
      hiSpoken: 'डेयर! पंद्रह सेकंड में अपने पार्टनर की तीन सच्ची तारीफें कीजिए!',
      bnSpoken: 'ডেয়ার! পনেরো সেকেন্ডের মধ্যে তিনটি সত্যিকারের প্রশংসা করো!',
      variants: [
        { id: 'td4_a', task: 'Give 3 rapid-fire genuine compliments in under 15 seconds!', enText: 'Dare! Give three rapid-fire genuine compliments in fifteen seconds!', hiSpoken: 'डेयर! पंद्रह सेकंड में तीन सच्ची तारीफें कीजिए!', bnSpoken: 'ডেয়ার! পনেরো সেকেন্ডে তিনটি সত্যিকারের প্রশংসা করো!' },
        { id: 'td4_b', task: 'Do a 10-second victory speech thanking your bestie like you won an Oscar!', enText: 'Dare! Give a ten-second Oscar acceptance speech thanking your bestie!', hiSpoken: 'डेयर! ऑस्कर जीतने के अंदाज़ में 10 सेकंड में अपने बेस्टी को थैंक्स बोलिए!', bnSpoken: 'ডেয়ার! অস্কার জেতার স্টাইলে ১০ সেকেন্ডে তোমার বেস্টিকে ধন্যবাদ জানাও!' },
        { id: 'td4_c', task: 'Imitate your partner’s favorite catchphrase with 100% drama!', enText: 'Dare! Imitate your partner’s favorite catchphrase with full drama!', hiSpoken: 'डेयर! अपने पार्टनर के फेवरेट डायलॉग की पूरी एक्टिंग करके दिखाइए!', bnSpoken: 'ডেয়ার! তোমার পার্টনারের প্রিয় ডায়লগটা পুরো নাটকীয়ভাবে নকল করে দেখাও!' }
      ]
    },
    {
      id: 'td5', kind: 'TRUTH', label: 'Secret Habit', color: '#6366f1',
      task: 'What is one funny habit of yours that almost nobody knows?',
      enText: 'Truth! Reveal one funny secret habit nobody knows about you!',
      hiSpoken: 'ट्रुथ! अपनी कोई एक मज़ेदार आदत बताइए जो शायद ही कोई जानता हो!',
      bnSpoken: 'ট্রুথ! নিজের এমন একটা মজার অভ্যাস বলো যা কেউ জানে না!',
      variants: [
        { id: 'td5_a', task: 'What is one funny habit of yours that almost nobody knows?', enText: 'Truth! Reveal one funny secret habit nobody knows about you!', hiSpoken: 'ट्रुथ! अपनी कोई एक मज़ेदार आदत बताइए जो कोई नहीं जानता!', bnSpoken: 'ট্রুথ! নিজের একটা মজার গোপন অভ্যাস বলো যা কেউ জানে না!' },
        { id: 'td5_b', task: 'What is the funniest excuse you ever used to avoid going out?', enText: 'Truth! What is the funniest excuse you ever used to skip plans?', hiSpoken: 'ट्रुथ! बाहर न जाने के लिए आपने अब तक का सबसे मज़ेदार बहाना क्या बनाया था?', bnSpoken: 'ট্রুথ! বাইরে না যাওয়ার জন্য তুমি সবচেয়ে মজার কী অজুহাত দিয়েছিলে?' },
        { id: 'td5_c', task: 'Which song on your playlist are you secretly embarrassed to love?', enText: 'Truth! Which guilty-pleasure song do you secretly love?', hiSpoken: 'ट्रुथ! आपकी प्लेलिस्ट का कौन-सा गाना है जिसे आप छुपकर सुनते हैं?', bnSpoken: 'ট্রুথ! কোন গানটা তুমি লুকিয়ে লুকিয়ে শুনতে ভালোবাসো?' }
      ]
    },
    {
      id: 'td6', kind: 'PENALTY', label: 'Emoji Story', color: '#f43f5e',
      task: 'Describe your bestie using ONLY 3 emojis — let them decode it!',
      enText: 'Sweet Penalty! Describe your bestie using only three emojis!',
      hiSpoken: 'स्वीट पेनल्टी! सिर्फ तीन इमोजी में अपने बेस्टी को बयान कीजिए!',
      bnSpoken: 'সুইট পেনাল্টি! মাত্র তিনটি ইমোজিতে তোমার বেস্টিকে বর্ণনা করো!',
      variants: [
        { id: 'td6_a', task: 'Describe your bestie using ONLY 3 emojis — let them decode it!', enText: 'Sweet Penalty! Describe your bestie using only three emojis!', hiSpoken: 'स्वीट पेनल्टी! सिर्फ तीन इमोजी में अपने बेस्टी को बयान कीजिए!', bnSpoken: 'সুইট পেনাল্টি! মাত্র তিনটি ইমোজিতে তোমার বেস্টিকে বর্ণনা করো!' },
        { id: 'td6_b', task: 'Act out a movie title using only 4 emojis and make your partner guess!', enText: 'Sweet Penalty! Send four emojis for a famous movie and let your partner guess!', hiSpoken: 'स्वीट पेनल्टी! चार इमोजी में किसी मशहूर फिल्म का नाम बताइए!', bnSpoken: 'সুইট পেনাল্টি! চারটে ইমোজি দিয়ে একটা সিনেমার নাম বোঝাও!' },
        { id: 'td6_c', task: 'Rate your partner’s meme game out of 10 with a dramatic explanation!', enText: 'Sweet Penalty! Rate your partner’s meme sense out of ten with drama!', hiSpoken: 'स्वीट पेनल्टी! अपने पार्टनर के मीम सेंस को 10 में से नंबर दीजिए!', bnSpoken: 'সুইট পেনাল্টি! তোমার পার্টনারের মিম সেন্সকে ১০-এ কত দেবে, নাটকীয়ভাবে বলো!' }
      ]
    },
    {
      id: 'td7', kind: 'DARE', label: 'Movie Dialogue', color: '#db2777',
      task: 'Deliver a dramatic Bollywood or Hollywood dialogue with full energy!',
      enText: 'Dare! Deliver your best dramatic movie dialogue with full energy!',
      hiSpoken: 'डेयर! पूरे जोश के साथ अपना सबसे फिल्मी डायलॉग सुनाइए!',
      bnSpoken: 'ডেয়ার! পুরো এনার্জি দিয়ে একটা দারুণ সিনেমার ডায়লগ বলো!',
      variants: [
        { id: 'td7_a', task: 'Deliver a dramatic Bollywood or Hollywood dialogue with full energy!', enText: 'Dare! Deliver a dramatic movie dialogue with full energy!', hiSpoken: 'डेयर! पूरे जोश के साथ कोई फिल्मी डायलॉग सुनाइए!', bnSpoken: 'ডেয়ার! পুরো এনার্জি দিয়ে একটা সিনেমার ডায়লগ বলো!' },
        { id: 'td7_b', task: 'Say a tongue twister 3 times fast without laughing!', enText: 'Dare! Say a tricky tongue twister three times fast without laughing!', hiSpoken: 'डेयर! बिना हंसे एक मुश्किल टंग ट्विस्टर तीन बार तेज़ी से बोलिए!', bnSpoken: 'ডেয়ার! না হেসে একটা কঠিন টাং টুইস্টার তিনবার দ্রুত বলো!' },
        { id: 'td7_c', task: 'Hype up your duo like a stadium sports commentator for 15 seconds!', enText: 'Dare! Hype up your duo like a cricket commentator for fifteen seconds!', hiSpoken: 'डेयर! क्रिकेट कमेंटेटर के स्टाइल में 15 सेकंड अपनी जोड़ी की तारीफ कीजिए!', bnSpoken: 'ডেয়ার! ক্রিকেট ধারাভাষ্যকারের মতো ১৫ সেকেন্ড তোমাদের জুটির প্রশংসা করো!' }
      ]
    },
    {
      id: 'td8', kind: 'TRUTH', label: 'Dream Memory', color: '#9333ea',
      task: 'What is your favorite shared memory or dream hangout spot?',
      enText: 'Truth! What is your favorite shared memory or dream hangout spot?',
      hiSpoken: 'ट्रुथ! आप दोनों की सबसे प्यारी याद या ड्रीम हैंगआउट जगह कौन-सी है?',
      bnSpoken: 'ট্রুথ! তোমাদের সবচেয়ে প্রিয় স্মৃতি বা স্বপ্নের আড্ডার জায়গা কোনটা?',
      variants: [
        { id: 'td8_a', task: 'What is your favorite shared memory or dream hangout spot?', enText: 'Truth! What is your favorite shared memory or dream hangout spot?', hiSpoken: 'ट्रुथ! आप दोनों की सबसे प्यारी याद या ड्रीम हैंगआउट जगह कौन-सी है?', bnSpoken: 'ট্রুথ! তোমাদের সবচেয়ে প্রিয় স্মৃতি বা স্বপ্নের আড্ডার জায়গা কোনটা?' },
        { id: 'td8_b', task: 'If we could teleport anywhere for 2 hours right now, where would you take us?', enText: 'Truth! If we could teleport anywhere for two hours, where would you choose?', hiSpoken: 'ट्रुथ! अगर हम अभी 2 घंटे के लिए कहीं भी टेलीपोर्ट हो सकें, तो आप कहाँ ले जाएंगे?', bnSpoken: 'ট্রুথ! এখনই ২ ঘণ্টার জন্য কোথাও টেলিপোর্ট হতে পারলে কোথায় নিয়ে যাবে?' },
        { id: 'td8_c', task: 'What is one bucket-list adventure you definitely want to do together?', enText: 'Truth! Name one bucket-list adventure you want to do together!', hiSpoken: 'ट्रुथ! ऐसा कौन-सा बकेट-लिस्ट एडवेंचर है जो आप दोनों साथ करना चाहते हैं?', bnSpoken: 'ট্রুথ! কোন বাকেট-লিস্ট অ্যাডভেঞ্চারটা তোমরা একসাথে করতে চাও?' }
      ]
    }
  ];

  function pickTruthDareChallenge(wedge, seenIds = [], rng = Math.random) {
    if (!wedge) return { challenge: null, seenIds: Array.isArray(seenIds) ? seenIds : [] };
    const variants = Array.isArray(wedge.variants) && wedge.variants.length
      ? wedge.variants
      : [{ id: wedge.id, task: wedge.task, enText: wedge.enText, hiSpoken: wedge.hiSpoken, bnSpoken: wedge.bnSpoken }];
    const res = drawNonRepeatingBatch(variants, 1, seenIds, v => v.id, rng);
    const chosen = res.items[0] || variants[0];
    return {
      challenge: { ...wedge, ...chosen },
      seenIds: res.seenIds
    };
  }

  const MOST_LIKELY_PROMPTS = [
    { id: 'ml1', prompt: 'Who is most likely to forget where they kept their phone?', enText: 'Who is most likely to forget where they kept their phone?', hiSpoken: 'सबसे ज़्यादा चांस किसके हैं कि वो अपना फोन रखकर भूल जाए?', bnSpoken: 'কে সবচেয়ে বেশি নিজের ফোন কোথায় রেখেছে ভুলে যায়?' },
    { id: 'ml2', prompt: 'Who is most likely to start laughing during a serious moment?', enText: 'Who is most likely to start laughing during a serious moment?', hiSpoken: 'सीरियस मौके पर सबसे पहले हंसी किसे आ जाती है?', bnSpoken: 'সিরিয়াস মুহূর্তে সবার আগে কে হেসে ফেলে?' },
    { id: 'ml3', prompt: 'Who is most likely to plan a surprise midnight snack run?', enText: 'Who is most likely to plan a surprise midnight snack run?', hiSpoken: 'आधी रात को सरप्राइज़ स्नैक प्लान सबसे पहले कौन बनाता है?', bnSpoken: 'মাঝরাতে সারপ্রাইজ খাবার প্ল্যান সবার আগে কে করে?' },
    { id: 'ml4', prompt: 'Who is most likely to win a ₹1 Cr game show jackpot?', enText: 'Who is most likely to win a One Crore game show jackpot?', hiSpoken: 'एक करोड़ का गेम शो जैकपॉट जीतने के सबसे ज़्यादा चांस किसके हैं?', bnSpoken: 'এক কোটি টাকার গেম শো জ্যাকপট জেতার সম্ভাবনা কার সবচেয়ে বেশি?' },
    { id: 'ml5', prompt: 'Who is most likely to send 10 voice notes in a row?', enText: 'Who is most likely to send ten voice notes in a row?', hiSpoken: 'लगातार दस वॉइस नोट भेजने में सबसे आगे कौन रहता है?', bnSpoken: 'টানা দশটা ভয়েস নোট পাঠাতে কে সবচেয়ে ওস্তাদ?' },
    { id: 'ml6', prompt: 'Who is most likely to fall asleep during a movie night?', enText: 'Who is most likely to fall asleep halfway through a movie?', hiSpoken: 'मूवी नाइट के बीच में सबसे पहले कौन सो जाएगा?', bnSpoken: 'মুভি নাইটের মাঝখানে সবার আগে কে ঘুমিয়ে পড়বে?' },
    { id: 'ml7', prompt: 'Who is most likely to accidentally spoil a web series ending?', enText: 'Who is most likely to accidentally spoil a show ending?', hiSpoken: 'वेब सीरीज़ का स्पॉइलर गलती से कौन बता देगा?', bnSpoken: 'ওয়েব সিরিজের স্পয়লার ভুল করে কে বলে ফেলবে?' },
    { id: 'ml8', prompt: 'Who is most likely to spend 20 minutes choosing what to order?', enText: 'Who is most likely to take twenty minutes just picking food?', hiSpoken: 'खाना ऑर्डर करने में 20 मिनट सिर्फ मेन्यू देखने में कौन लगाएगा?', bnSpoken: 'খাবার অর্ডার করতে গিয়ে ২০ মিনিট ধরে মেনু কে দেখবে?' },
    { id: 'ml9', prompt: 'Who is most likely to become a viral creator overnight?', enText: 'Who is most likely to go viral overnight?', hiSpoken: 'रातों-रात वायरल क्रिएटर बनने के सबसे ज़्यादा चांस किसके हैं?', bnSpoken: 'রাতারাতি ভাইরাল ক্রিয়েটর হওয়ার চান্স কার সবচেয়ে বেশি?' },
    { id: 'ml10', prompt: 'Who is most likely to survive longest on a deserted island?', enText: 'Who is most likely to survive longest on a deserted island?', hiSpoken: 'सुनसान टापू पर सबसे ज़्यादा दिन कौन सर्वाइव कर पाएगा?', bnSpoken: 'নির্জন দ্বীপে কে সবচেয়ে বেশি দিন টিকে থাকতে পারবে?' },
    { id: 'ml11', prompt: 'Who is most likely to double-text before getting a reply?', enText: 'Who is most likely to send five messages before getting one reply?', hiSpoken: 'रिप्लाई आने से पहले ही लगातार मैसेज कौन भेजता है?', bnSpoken: 'রিপ্লাই আসার আগেই পরপর মেসেজ কে পাঠায়?' },
    { id: 'ml12', prompt: 'Who is most likely to book a spontaneous weekend trip?', enText: 'Who is most likely to plan a sudden spontaneous roadtrip?', hiSpoken: 'अचानक वीकेंड ट्रिप का प्लान कौन बना लेगा?', bnSpoken: 'হঠাৎ করে উইকেন্ড ট্রিপের প্ল্যান কে করে ফেলবে?' },
    { id: 'ml13', prompt: 'Who is most likely to take 50 photos to get one perfect selfie?', enText: 'Who is most likely to take fifty selfies for one perfect shot?', hiSpoken: 'एक परफेक्ट सेल्फी के लिए 50 फोटो कौन खींचेगा?', bnSpoken: 'একটা পারফেক্ট সেলফির জন্য ৫০টা ছবি কে তুলবে?' },
    { id: 'ml14', prompt: 'Who is most likely to keep calm in total chaos?', enText: 'Who stays calm when everything goes completely chaotic?', hiSpoken: 'पूरी अफरा-तफरी में भी सबसे शांत कौन रहता है?', bnSpoken: 'চরম ঝামেলার মধ্যেও কে সবচেয়ে শান্ত থাকে?' },
    { id: 'ml15', prompt: 'Who is most likely to remember every small birthday and anniversary?', enText: 'Who never forgets a single birthday or special date?', hiSpoken: 'हर छोटा बर्थडे और खास तारीख किसे हमेशा याद रहती है?', bnSpoken: 'সব জন্মদিন আর স্পেশাল তারিখ কার সবসময় মনে থাকে?' },
    { id: 'ml16', prompt: 'Who is most likely to challenge everyone to a Ludo rematch at 2 AM?', enText: 'Who is most likely to demand a Ludo rematch at two in the morning?', hiSpoken: 'रात 2 बजे लूडो का रीमैच सबसे पहले कौन मांगेगा?', bnSpoken: 'রাত ২টোয় লুডো রিম্যাচ সবার আগে কে চাইবে?' }
  ];

  const LOVE_METER_QUESTIONS = [
    { id: 'lm1', q: 'How fast do you reply to each other?', opts: [{ label: 'Instant Reply ⚡', pts: 20 }, { label: 'Within Minutes 💬', pts: 16 }, { label: 'Chaotic Timing 😂', pts: 12 }], enText: 'How fast do you reply to each other?', hiSpoken: 'आप दोनों एक-दूसरे को कितनी जल्दी रिप्लाई करते हैं?', bnSpoken: 'তোমরা একে অপরকে কত দ্রুত রিপ্লাই দাও?' },
    { id: 'lm2', q: 'Your shared humor level?', opts: [{ label: 'Telepathic Memes 😂', pts: 20 }, { label: 'Inside Jokes 24/7 🔥', pts: 18 }, { label: 'Roast Each Other 💀', pts: 15 }], enText: 'How strong is your shared humor level?', hiSpoken: 'आप दोनों का ह्यूमर और मज़ाक का लेवल कैसा है?', bnSpoken: 'তোমাদের দুজনের মজার আর হাসাহাসির লেভেল কেমন?' },
    { id: 'lm3', q: 'When drama strikes, how do you react?', opts: [{ label: 'Calm + Drama Balance 👑', pts: 20 }, { label: 'Team Up Instantly 🛡️', pts: 19 }, { label: 'Panic Together 😱', pts: 14 }], enText: 'When drama strikes, how does your duo react?', hiSpoken: 'जब कोई ड्रामा या टेंशन हो, तो आप दोनों कैसे रिएक्ट करते हैं?', bnSpoken: 'কোনো নাটকীয় পরিস্থিতি এলে তোমরা কীভাবে সামলাও?' },
    { id: 'lm4', q: 'Late-night talk duration?', opts: [{ label: '3+ Hours Non-Stop 🌙', pts: 20 }, { label: '1 Hour Daily ✨', pts: 17 }, { label: 'Short Sweet Calls 💖', pts: 14 }], enText: 'How long do your late-night conversations last?', hiSpoken: 'आपकी लेट-नाइट बातें कितनी देर तक चलती हैं?', bnSpoken: 'তোমাদের রাতের আড্ডা কতক্ষণ চলে?' },
    { id: 'lm5', q: 'Teamwork in party games?', opts: [{ label: 'Unstoppable Duo 🏆', pts: 20 }, { label: 'Fun Chaos Agents 🎉', pts: 17 }, { label: 'Friendly Rivals ⚔️', pts: 15 }], enText: 'How is your teamwork in party games?', hiSpoken: 'पार्टी गेम्स में आप दोनों की टीमवर्क कैसी है?', bnSpoken: 'পার্টি গেমসে তোমাদের টিমওয়ার্ক কেমন?' },
    { id: 'lm6', q: 'How well do you know each other’s food order?', opts: [{ label: 'Order Without Asking 🍕', pts: 20 }, { label: 'Know Top 3 Favorites 😋', pts: 17 }, { label: 'Still Guessing Daily 😅', pts: 13 }], enText: 'Can you guess your partner’s favorite food order instantly?', hiSpoken: 'क्या आप बिना पूछे अपने पार्टनर का फेवरेट खाना ऑर्डर कर सकते हैं?', bnSpoken: 'না জিজ্ঞাসা করেই কি পার্টনারের প্রিয় খাবার অর্ডার করতে পারো?' },
    { id: 'lm7', q: 'Music playlist compatibility?', opts: [{ label: 'Same Vibe 100% 🎧', pts: 20 }, { label: 'Mix of Two Worlds 🎶', pts: 17 }, { label: 'DJ Battle Every Time 🔊', pts: 14 }], enText: 'How well do your music playlists match?', hiSpoken: 'आप दोनों की म्यूज़िक प्लेलिस्ट कितनी मैच करती है?', bnSpoken: 'তোমাদের দুজনের গানের প্লেলিস্ট কতটা মেলে?' },
    { id: 'lm8', q: 'How do you handle a tiny disagreement?', opts: [{ label: 'Talk & Laugh It Off 💖', pts: 20 }, { label: 'Food Fixes Everything 🍔', pts: 18 }, { label: 'Dramatic Silent Mode 😤', pts: 13 }], enText: 'How quickly does your duo bounce back from a tiny argument?', hiSpoken: 'छोटी-सी नोकझोंक होने पर आप दोनों कैसे सुलझाते हैं?', bnSpoken: 'ছোটখাটো ঝগড়া হলে তোমরা কীভাবে মিটিয়ে নাও?' },
    { id: 'lm9', q: 'Secret keeping trust meter?', opts: [{ label: 'Vault Level Locked 🔐', pts: 20 }, { label: 'Bestie Certified 🛡️', pts: 18 }, { label: 'Spills With Memes 😂', pts: 13 }], enText: 'How strong is your secret-keeping trust?', hiSpoken: 'सीक्रेट रखने के मामले में आप दोनों का भरोसा कितना मजबूत है?', bnSpoken: 'গোপন কথা রাখার ব্যাপারে তোমাদের বিশ্বাস কতটা মজবুত?' },
    { id: 'lm10', q: 'Photo gallery of you two?', opts: [{ label: '100+ Cute & Goofy Pics 📸', pts: 20 }, { label: 'Best Highlights Only ✨', pts: 17 }, { label: 'All Chaotic Screenshots 😂', pts: 15 }], enText: 'What does your shared photo gallery look like?', hiSpoken: 'आप दोनों की फोटो गैलरी कैसी दिखती है?', bnSpoken: 'তোমাদের দুজনের ফটো গ্যালারি কেমন?' },
    { id: 'lm11', q: 'Support level during tough days?', opts: [{ label: 'Always First Call 🫂', pts: 20 }, { label: 'Instant Cheerleader 🌟', pts: 18 }, { label: 'Meme Therapy Squad 😂', pts: 16 }], enText: 'How does your duo show up on tough days?', hiSpoken: 'मुश्किल दिनों में आप दोनों एक-दूसरे का साथ कैसे देते हैं?', bnSpoken: 'কঠিন দিনে তোমরা কীভাবে একে অপরের পাশে থাকো?' },
    { id: 'lm12', q: 'Surprise gifting style?', opts: [{ label: 'Thoughtful & Personal 🎁', pts: 20 }, { label: 'Spontaneous Treats 🍫', pts: 18 }, { label: 'Last-Minute Legends 🏃', pts: 14 }], enText: 'What is your surprise gifting style?', hiSpoken: 'सरप्राइज़ गिफ्ट देने का आपका स्टाइल कैसा है?', bnSpoken: 'সারপ্রাইজ গিফট দেওয়ার স্টাইল কেমন তোমাদের?' },
    { id: 'lm13', q: 'Eye-contact telepathy in a crowd?', opts: [{ label: 'One Look Says Everything 👀', pts: 20 }, { label: 'Secret Signal Pros 🤫', pts: 18 }, { label: 'Texting Across Room 📱', pts: 15 }], enText: 'Can one glance across the room say everything?', hiSpoken: 'भीड़ में क्या एक नज़र से ही आप एक-दूसरे की बात समझ जाते हैं?', bnSpoken: 'ভিড়ের মধ্যে কি এক চোখের ইশারাতেই সব বুঝে যাও?' },
    { id: 'lm14', q: 'Roadtrip co-pilot vibe?', opts: [{ label: 'DJ + Snack Chief 🚗', pts: 20 }, { label: 'Window View Dreamer 🌄', pts: 17 }, { label: 'Sleeping Passenger 😴', pts: 14 }], enText: 'What is your duo’s roadtrip energy?', hiSpoken: 'रोडट्रिप पर आप दोनों की वाइब कैसी रहती है?', bnSpoken: 'রোডট্রিপে তোমাদের দুজনের এনার্জি কেমন থাকে?' },
    { id: 'lm15', q: 'Matching outfits or vibes?', opts: [{ label: 'Unplanned Twinning ✨', pts: 20 }, { label: 'Color Coordinated 🎨', pts: 18 }, { label: 'Opposite Aesthetics ⚡', pts: 15 }], enText: 'Do you ever match outfits without planning?', hiSpoken: 'क्या बिना प्लान किए भी आपके आउटफिट मैच हो जाते हैं?', bnSpoken: 'প্ল্যান না করেও কি তোমাদের পোশাক মিলে যায়?' }
  ];

  function evaluateMindSync(p1Choice, p2Choice) {
    const matched = Number(p1Choice) === Number(p2Choice);
    return {
      matched,
      syncDelta: matched ? 100 : 20,
      headline: matched ? '100% Soulmate Sync! 💖✨' : 'Haha! Totally Different Vibes! 😂'
    };
  }

  function resolveWheelWedge(finalAngleDeg, wedgeCount = TRUTH_DARE_WEDGES.length) {
    const count = Math.max(1, Number(wedgeCount) || 8);
    const slice = 360 / count;
    const norm = ((360 - (Number(finalAngleDeg) % 360)) + 360) % 360;
    return Math.floor(norm / slice) % count;
  }

  function calculateLoveVibeResult(answerPoints) {
    const arr = Array.isArray(answerPoints) ? answerPoints : [];
    const sum = arr.reduce((a, b) => a + Math.max(0, Number(b) || 0), 0);
    const maxPts = Math.max(1, arr.length * 20);
    const percent = Math.min(100, Math.max(40, Math.round((sum / maxPts) * 100)));
    let title = 'Chaos Besties';
    let badge = '⚡';
    if (percent >= 94) { title = 'Unstoppable Duo'; badge = '👑'; }
    else if (percent >= 84) { title = 'Certified Soulmates'; badge = '💖'; }
    else if (percent >= 74) { title = 'Calm King & Drama Queen'; badge = '🎭'; }
    else if (percent >= 64) { title = 'Partners in Crime'; badge = '🔥'; }
    return { percent, title, badge };
  }

  // ---------- 5. EXCLUSIVE GAME-LOCKED REWARDS ----------
  const EXCLUSIVE_REWARDS = {
    budget_clash: [
      { id: 'tag_tycoon_crown', kind: 'tag', value: 'Tycoon Crown', name: 'Tycoon Crown Badge', label: 'Tycoon Crown Badge', icon: '👑', unlockRule: 'Win a 3+ streak or ₹1 Cr Jackpot' },
      { id: 'frame_golden_vault', kind: 'frame', value: 'fx_golden_vault', name: 'Golden Vault Frame', label: 'Golden Vault Frame', icon: '🏆', unlockRule: 'Score 300+ pts or Jackpot in Budget Clash' }
    ],
    couple_arena: [
      { id: 'tag_soulmate', kind: 'tag', value: 'Soulmate', name: 'Soulmate Tag', label: 'Soulmate Tag', icon: '💖', unlockRule: 'Hit 60%+ Mind Sync or 85%+ Love Meter' },
      { id: 'tag_partner_crime', kind: 'tag', value: 'Partner in Crime', name: 'Partner in Crime Tag', label: 'Partner in Crime Tag', icon: '🔥', unlockRule: 'Complete any Couple Arena round' },
      { id: 'frame_neon_heart', kind: 'frame', value: 'fx_neon_heart', name: 'Neon Heart Frame', label: 'Neon Heart Frame', icon: '💘', unlockRule: 'Hit 80%+ Mind Sync or 90%+ Love Meter' }
    ]
  };

  function checkBudgetExclusiveUnlocks({ streak = 0, jackpots = 0, score = 0 } = {}) {
    const unlocked = [];
    if (streak >= 3 || jackpots >= 1) unlocked.push(EXCLUSIVE_REWARDS.budget_clash[0]);
    if (score >= 300 || jackpots >= 1) unlocked.push(EXCLUSIVE_REWARDS.budget_clash[1]);
    return unlocked;
  }

  function checkCoupleExclusiveUnlocks({ syncRate = 0, lovePercent = 0, completed = false } = {}) {
    const unlocked = [];
    if (completed) unlocked.push(EXCLUSIVE_REWARDS.couple_arena[1]);
    if (syncRate >= 60 || lovePercent >= 85) unlocked.push(EXCLUSIVE_REWARDS.couple_arena[0]);
    if (syncRate >= 80 || lovePercent >= 90) unlocked.push(EXCLUSIVE_REWARDS.couple_arena[2]);
    return unlocked;
  }

  // ---------- 6. VR SYNC, YOUTUBE & MODERATION PURE HELPERS ----------
  function parseYouTubeId(input) {
    const s = String(input || '').trim();
    if (!s) return '';
    if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
    try {
      const normalized = /^https?:\/\//i.test(s) ? s : 'https://' + s;
      const u = new URL(normalized);
      const host = u.hostname.replace(/^(www\.|m\.|music\.)/i, '').toLowerCase();
      if (host === 'youtu.be') {
        const seg = u.pathname.replace(/^\/+/, '').split('/')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(seg)) return seg;
      }
      if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        const vParam = u.searchParams.get('v');
        if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam;
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts.length >= 2 && ['embed', 'shorts', 'live', 'v'].includes(parts[0])) {
          if (/^[a-zA-Z0-9_-]{11}$/.test(parts[1])) return parts[1];
        }
      }
    } catch {}
    const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : '';
  }

  function parseVideoSource(input) {
    const s = String(input || '').trim();
    if (!s) return null;
    const ytId = parseYouTubeId(s);
    if (ytId) {
      return { kind: 'youtube', videoId: ytId, videoUrl: '' };
    }
    if (/^(https?:\/\/.+\.(mp4|webm|ogg|m4v)(\?.*)?$|blob:|data:video\/)/i.test(s)) {
      return { kind: 'direct', videoId: '', videoUrl: s };
    }
    return null;
  }

  function normalizeVideoSyncState(raw, fallbackVideoId = '') {
    const r = raw && typeof raw === 'object' ? raw : {};
    const videoUrl = String(r.videoUrl || '').trim();
    const videoId = String(r.videoId || fallbackVideoId || '').trim();
    const kind = r.kind === 'direct' || (!videoId && videoUrl) ? 'direct' : 'youtube';
    const seekSec = Math.max(0, Number(r.seekSec) || 0);
    const durationSec = Math.max(0, Number(r.durationSec) || 0);
    const playbackRate = Math.min(2, Math.max(0.5, Number(r.playbackRate) || 1));
    const updatedAt = Math.max(0, Number(r.updatedAt) || Date.now());
    const seq = Math.max(0, Math.floor(Number(r.seq) || 0));
    return {
      kind,
      videoId,
      videoUrl,
      playing: Boolean(r.playing),
      seekSec,
      durationSec,
      playbackRate,
      updatedAt,
      updatedBy: String(r.updatedBy || ''),
      seq
    };
  }

  function computeTargetVideoTime(videoSync, nowMs = Date.now(), clockOffsetMs = 0) {
    const vs = normalizeVideoSyncState(videoSync);
    let target = vs.seekSec;
    if (vs.playing) {
      const elapsedSec = Math.max(0, ((Number(nowMs) + Number(clockOffsetMs || 0)) - vs.updatedAt) / 1000);
      target = vs.seekSec + elapsedSec * vs.playbackRate;
    }
    if (vs.durationSec > 0) {
      target = Math.min(vs.durationSec, target);
    }
    return Math.max(0, Math.round(target * 100) / 100);
  }

  function shouldResyncVideoTime(localSec, targetSec, thresholdSec = 1.5) {
    const local = Number(localSec);
    const target = Number(targetSec);
    if (!Number.isFinite(local) || !Number.isFinite(target)) return true;
    return Math.abs(local - target) > Math.max(0.25, Number(thresholdSec) || 1.5);
  }

  function formatVideoClock(sec) {
    const total = Math.max(0, Math.floor(Number(sec) || 0));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  // ---------- 6B. ON-DEMAND TAB / VIEW LIFECYCLE MANAGER ----------
  function createViewLifecycleManager(initialTab = 'tools') {
    let activeTab = String(initialTab || 'tools');
    const mountedTabs = new Set();
    const dirtyTabs = new Set([activeTab]);

    return {
      getActiveTab: () => activeTab,
      isMounted: (tab) => mountedTabs.has(String(tab)),
      isDirty: (tab) => dirtyTabs.has(String(tab)),
      getMountedTabs: () => Array.from(mountedTabs),
      getDirtyTabs: () => Array.from(dirtyTabs),
      markDirty(tabs) {
        const list = Array.isArray(tabs) ? tabs : [tabs];
        let activeNeedsRender = false;
        list.forEach(t => {
          if (!t) return;
          const key = String(t);
          dirtyTabs.add(key);
          if (key === activeTab) activeNeedsRender = true;
        });
        return activeNeedsRender;
      },
      markRendered(tab) {
        const key = String(tab || activeTab);
        mountedTabs.add(key);
        dirtyTabs.delete(key);
      },
      switchTab(nextTab) {
        const prev = activeTab;
        const next = String(nextTab || 'tools');
        activeTab = next;
        const shouldRender = !mountedTabs.has(next) || dirtyTabs.has(next);
        return { prevTab: prev, nextTab: next, changed: prev !== next, shouldRender };
      }
    };
  }

  function canDeleteChatMessage({ msgUid, currentUid, isDev = false } = {}) {
    if (!currentUid) return false;
    if (isDev) return true;
    return Boolean(msgUid && String(msgUid) === String(currentUid));
  }

  function mergeRoomMessages(inlineMsgs, subcolMsgs, deletedIds) {
    const delSet = new Set(Array.isArray(deletedIds) ? deletedIds.map(String) : []);
    const byId = new Map();
    [...(Array.isArray(inlineMsgs) ? inlineMsgs : []), ...(Array.isArray(subcolMsgs) ? subcolMsgs : [])].forEach(m => {
      if (!m || !m.id) return;
      const id = String(m.id);
      if (delSet.has(id) || m.deleted) return;
      const prev = byId.get(id);
      if (!prev || Number(m.ts || 0) >= Number(prev.ts || 0)) {
        byId.set(id, { ...m, id });
      }
    });
    return [...byId.values()].sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0)).slice(-60);
  }

  function classifyCleanupUser(u, nowMs = Date.now()) {
    if (!u || !u.uid) return { useless: false, reason: 'Invalid' };
    const id = String(u.uid);
    const email = String(u.accountId || u.email || '').toLowerCase();
    if (email === 'soumitranext1@gmail.com' || email === 'soumitranext@gmail.com' || u.isDev) {
      return { useless: false, reason: 'Protected Owner' };
    }
    if (/^(bot_|demo_|fake_|test_)/i.test(id)) {
      return { useless: true, reason: 'Test / Bot ID' };
    }
    const lastSeen = Number(u.lastSeen || u.updatedAt || u.createdAt || 0);
    const ageDays = lastSeen > 0 ? Math.floor((nowMs - lastSeen) / 86400000) : 999;
    const isGuest = u.accountType !== 'account';
    const exp = Number(u.exp || 0);
    if (isGuest && ageDays >= 3) {
      return { useless: true, reason: `Inactive Guest (${ageDays}d)` };
    }
    if (isGuest && exp <= 20 && ageDays >= 1) {
      return { useless: true, reason: 'Low-Activity Guest' };
    }
    if (!isGuest && exp === 0 && ageDays >= 30) {
      return { useless: true, reason: `Dormant (${ageDays}d)` };
    }
    return { useless: false, reason: 'Active' };
  }

  // ---------- 7. CATEGORIZED LAUNCHER DEFINITIONS ----------
  const LAUNCHER_CATEGORIES = [
    { id: 'all', icon: '🔥', label: 'All' },
    { id: 'party', icon: '🎉', label: 'Party & Show' },
    { id: 'couple', icon: '❤️', label: 'Couple & Social' },
    { id: 'action', icon: '⚔️', label: '1v1 Action' },
    { id: 'brain', icon: '🧠', label: 'Brain & Quick' }
  ];

  const LAUNCHER_GAMES = [
    { id: 'budget_clash', name: 'Budget Clash', subtitle: 'Tricky ₹10 vs ₹1 Cr · 7s Timer', categories: ['all', 'party'], art: 'budget_clash', badge: 'HOT', featured: true, exclusiveKey: 'budget_clash', accent: '#f59e0b', accent2: '#7c2d12', baseOnline: 268, onlineBase: 268, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'couple_arena', name: 'Couple & Bestie Arena', subtitle: '4 Duo Party Modes', categories: ['all', 'couple'], art: 'couple_arena', badge: 'HOT', featured: true, exclusiveKey: 'couple_arena', accent: '#ec4899', accent2: '#701a75', baseOnline: 234, onlineBase: 234, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'ludo', name: 'Ludo Royal 3D', subtitle: 'Classic 2P / 4P Board', categories: ['all', 'party'], art: 'ludo', accent: '#ef4444', accent2: '#7c2d12', baseOnline: 214, onlineBase: 214, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'uno', name: 'UNO', subtitle: 'Wild Stacks & Jump-In', categories: ['all', 'party'], art: 'uno', accent: '#ef4444', accent2: '#1d4ed8', baseOnline: 196, onlineBase: 196, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'couple_mind_sync', name: 'Mind Sync', subtitle: 'Dil Ki Dhadkan Match', categories: ['couple'], art: 'mind_sync', exclusiveKey: 'couple_arena', accent: '#f43f5e', accent2: '#881337', baseOnline: 148, onlineBase: 148, badges: ['bot', 'invite'], launcher: 'couple_sub', parentGameId: 'couple_arena', subMode: 'mind_sync', initialSubMode: 'mind_sync' },
    { id: 'couple_truth_dare', name: 'Truth / Dare / Penalty', subtitle: '3D Voice Party Wheel', categories: ['couple'], art: 'truth_dare', exclusiveKey: 'couple_arena', accent: '#e11d48', accent2: '#4c1d95', baseOnline: 162, onlineBase: 162, badges: ['bot', 'invite'], launcher: 'couple_sub', parentGameId: 'couple_arena', subMode: 'truth_dare', initialSubMode: 'truth_dare' },
    { id: 'couple_most_likely', name: "Who's Most Likely?", subtitle: 'Duo Spotlight Vote', categories: ['couple'], art: 'most_likely', exclusiveKey: 'couple_arena', accent: '#db2777', accent2: '#581c87', baseOnline: 129, onlineBase: 129, badges: ['bot', 'invite'], launcher: 'couple_sub', parentGameId: 'couple_arena', subMode: 'most_likely', initialSubMode: 'most_likely' },
    { id: 'couple_love_meter', name: 'Love & Vibe Meter', subtitle: '0–100% Heart Gauge', categories: ['couple'], art: 'love_meter', exclusiveKey: 'couple_arena', accent: '#fb7185', accent2: '#831843', baseOnline: 154, onlineBase: 154, badges: ['bot', 'invite'], launcher: 'couple_sub', parentGameId: 'couple_arena', subMode: 'love_meter', initialSubMode: 'love_meter' },
    { id: 'pool_8ball', name: '8-Ball Pool', subtitle: 'Precision Cushion Physics', categories: ['all', 'action'], art: 'pool_8ball', accent: '#10b981', accent2: '#064e3b', baseOnline: 184, onlineBase: 184, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'jackaroo', name: 'Jackaroo', subtitle: 'Royal Card Marble Race', categories: ['all', 'action'], art: 'jackaroo', accent: '#d97706', accent2: '#7c2d12', baseOnline: 142, onlineBase: 142, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'chess_blitz', name: 'Chess Blitz', subtitle: '3m / 5m Speed Chess', categories: ['all', 'action'], art: 'chess_blitz', accent: '#f59e0b', accent2: '#312e81', baseOnline: 158, onlineBase: 158, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'trap_door', name: 'Trap Door Duel', subtitle: 'Mind-Game 1v1 Survival', categories: ['all', 'action'], art: 'trap_door', accent: '#f43f5e', accent2: '#4c1d95', baseOnline: 118, onlineBase: 118, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'tile_race', name: '60-Second Tile Race', subtitle: 'Hyper Tap Sprint', categories: ['all', 'action'], art: 'tile_race', accent: '#06b6d4', accent2: '#1e3a8a', baseOnline: 131, onlineBase: 131, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'pocket_territory', name: 'Pocket Territory', subtitle: 'Tactical Board Capture', categories: ['all', 'action'], art: 'pocket_territory', accent: '#3b82f6', accent2: '#065f46', baseOnline: 112, onlineBase: 112, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'mind_clash', name: 'Mind Clash 1v1', subtitle: 'Voice-Narrated Trivia Duel', categories: ['all', 'brain'], art: 'mind_clash', accent: '#8b5cf6', accent2: '#0f172a', baseOnline: 164, onlineBase: 164, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'number_match', name: 'Number Match', subtitle: 'Sum-10 Logic Board', categories: ['all', 'brain'], art: 'number_match', accent: '#6366f1', accent2: '#0f172a', baseOnline: 126, onlineBase: 126, badges: ['bot', 'coin', 'invite'], launcher: 'arena' },
    { id: 'speed_math', name: 'Speed Math', subtitle: 'Mental Arithmetic Sprint', categories: ['all', 'brain'], art: 'speed_math', accent: '#0ea5e9', accent2: '#1e3a8a', baseOnline: 94, onlineBase: 94, badges: ['bot'], launcher: 'page', href: 'speedmath.html' },
    { id: 'brain_puzzle', name: 'Brain Puzzle', subtitle: 'Pattern & Memory IQ', categories: ['all', 'brain'], art: 'brain_puzzle', accent: '#a855f7', accent2: '#3b0764', baseOnline: 89, onlineBase: 89, badges: ['bot'], launcher: 'page', href: 'brain-puzzle.html' },
    { id: 'word_duel', name: 'Word Duel', subtitle: 'Rapid Vocabulary Clash', categories: ['all', 'brain'], art: 'word_duel', accent: '#14b8a6', accent2: '#134e4a', baseOnline: 97, onlineBase: 97, badges: ['bot'], launcher: 'page', href: 'word-duel.html' },
    { id: 'trivia_rush', name: 'Trivia Rush', subtitle: 'EN / HI / BN Voice Quiz', categories: ['all', 'brain'], art: 'trivia_rush', accent: '#f97316', accent2: '#7c2d12', baseOnline: 138, onlineBase: 138, badges: ['bot'], launcher: 'page', href: 'trivia-rush.html' },
    { id: 'mcq_duel', name: '60s MCQ Duel', subtitle: 'Live 20-Coin Arena Sprint', categories: ['all', 'brain'], art: 'mcq_duel', accent: '#f43f5e', accent2: '#4c0519', baseOnline: 115, onlineBase: 115, badges: ['bot', 'coin', 'invite'], launcher: 'duel' }
  ];

  function filterLauncherGames(categoryId) {
    const cat = String(categoryId || 'all').toLowerCase();
    if (cat === 'all') return LAUNCHER_GAMES.filter(g => g.categories.includes('all'));
    return LAUNCHER_GAMES.filter(g => g.categories.includes(cat));
  }

  function getLivePlayerCount(game, seedTick) {
    const base = Number((game && (game.baseOnline || game.onlineBase)) || 95);
    const tick = typeof seedTick === 'number' ? seedTick : Math.floor(Date.now() / 45000);
    let hash = 0;
    const key = String((game && game.id) || 'g') + ':' + tick;
    for (let i = 0; i < key.length; i++) hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    const jitter = (Math.abs(hash) % 25) - 10;
    return Math.max(18, base + jitter);
  }

  return {
    DAILY_FREE_COIN_CAP,
    BUDGET_ROUND_TIMER_SEC,
    BUDGET_ITEMS,
    TRICKY_TEN_VS_CR_PAIRS,
    BUDGET_MODES,
    MIND_SYNC_PROMPTS,
    TRUTH_DARE_WEDGES,
    MOST_LIKELY_PROMPTS,
    LOVE_METER_QUESTIONS,
    EXCLUSIVE_REWARDS,
    GAME_EXCLUSIVE_REWARDS: EXCLUSIVE_REWARDS,
    LAUNCHER_CATEGORIES,
    LAUNCHER_GAMES,
    calcDailyFreeCoinGrant,
    validateShowBet,
    settleStrictGameReward,
    formatINR,
    shuffleArray,
    drawNonRepeatingBatch,
    loadSeenQuestionIds,
    saveSeenQuestionIds,
    drawPersistentQuestions,
    createTenVsCrRound,
    createAsliNakliRound,
    createSastaMehngaPair,
    evaluateClosestGuesses,
    applyBudgetLifeline,
    evaluateMindSync,
    resolveWheelWedge,
    pickTruthDareChallenge,
    calculateLoveVibeResult,
    checkBudgetExclusiveUnlocks,
    checkCoupleExclusiveUnlocks,
    parseYouTubeId,
    parseVideoSource,
    normalizeVideoSyncState,
    computeTargetVideoTime,
    shouldResyncVideoTime,
    formatVideoClock,
    createViewLifecycleManager,
    canDeleteChatMessage,
    mergeRoomMessages,
    classifyCleanupUser,
    filterLauncherGames,
    getLivePlayerCount
  };
})();

if (typeof window !== 'undefined') window.ShowGamesRules = ShowGamesRules;
if (typeof globalThis !== 'undefined') globalThis.ShowGamesRules = ShowGamesRules;
if (typeof module !== 'undefined' && module.exports) module.exports = ShowGamesRules;
