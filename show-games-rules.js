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

  // Tricky "₹10 vs ₹1 Cr" deceptive matchups (close/tricky visual decoys so players MUST think!)
  const TRICKY_TEN_VS_CR_PAIRS = [
    {
      budget: {
        id: 'decoy_watch', name: 'Gold-Plated Quartz Replica', price: 499, category: 'Lookalike', icon: 'watch',
        hint: 'One watch is a ₹499 street replica; the other is an authentic ₹1 Cr Tourbillon!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'swiss_watch')
    },
    {
      budget: {
        id: 'decoy_book', name: 'Spiral Sketch Notebook', price: 120, category: 'Campus', icon: 'notebook',
        hint: 'Both look like paper, but a graded First-Print Comic auctions for ₹48 Lakh!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'vintage_comic')
    },
    {
      budget: {
        id: 'decoy_gold_coin', name: 'Brass Souvenir Token', price: 80, category: 'Souvenir', icon: 'goldbar',
        hint: 'Do not judge by shine — one is an ₹80 souvenir token, the other is a ₹85 Lakh 1947 Proof Coin!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'vintage_coin_10')
    },
    {
      budget: {
        id: 'decoy_swiss', name: 'Swiss Automatic Diver', price: 175000, category: 'Mid-Luxury', icon: 'watch',
        hint: 'Both are real luxury items, but only ONE crosses the ₹1 Crore mark!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'emerald_necklace')
    },
    {
      budget: {
        id: 'decoy_bike', name: 'Carbon Road Bicycle', price: 118000, category: 'Pro Sport', icon: 'supercar',
        hint: 'Both are performance machines, yet one is ₹1.18 Lakh and the other is ₹1.32 Crore!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'supercar')
    },
    {
      budget: {
        id: 'decoy_ring', name: 'Titanium Fitness Ring', price: 17999, category: 'Smart Tech', icon: 'necklace',
        hint: 'Smart titanium wearable vs 24K Investment Gold Bullion Vault Set!'
      },
      jackpot: BUDGET_ITEMS.find(x => x.id === 'gold_bullion')
    }
  ];

  const BUDGET_MODES = [
    { id: 'ten_vs_cr', name: '₹10 vs ₹1 Cr', short: 'Tricky Decoys', icon: '🎭' },
    { id: 'asli_nakli', name: 'Asli vs Nakli', short: 'Tight Market Price', icon: '🏷️' },
    { id: 'sasta_mehnga', name: 'Sasta ya Mehnga', short: 'Close Higher/Lower', icon: '📈' },
    { id: 'closest_guess', name: 'Closest Guess Wins', short: 'Exact Price Duel', icon: '🎯' }
  ];

  function createTenVsCrRound(rng = Math.random) {
    const pick = TRICKY_TEN_VS_CR_PAIRS[Math.floor(rng() * TRICKY_TEN_VS_CR_PAIRS.length)] || TRICKY_TEN_VS_CR_PAIRS[0];
    const swap = rng() >= 0.5;
    const pair = swap ? [pick.jackpot, pick.budget] : [pick.budget, pick.jackpot];
    const jackpotIndex = swap ? 0 : 1;
    return {
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
    const pool = BUDGET_ITEMS.filter(i => !excludeIds.has(i.id));
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

  function createSastaMehngaPair(prevItem = null, rng = Math.random) {
    const anchor = prevItem || BUDGET_ITEMS[Math.floor(rng() * BUDGET_ITEMS.length)];
    // Prefer close, tricky challengers within 0.35x .. 2.8x of anchor price!
    const closePool = BUDGET_ITEMS.filter(i =>
      i.id !== anchor.id &&
      i.price !== anchor.price &&
      i.price >= anchor.price * 0.35 &&
      i.price <= anchor.price * 2.8
    );
    const fallbackPool = BUDGET_ITEMS.filter(i => i.id !== anchor.id && i.price !== anchor.price);
    const pool = closePool.length ? closePool : fallbackPool;
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

  // ---------- 4. COUPLE & BESTIE ARENA DATA & RULES ----------
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
    }
  ];

  const TRUTH_DARE_WEDGES = [
    {
      id: 'td1', kind: 'DARE', label: 'No Yes/No', color: '#ec4899',
      task: 'Talk on voice chat for 2 minutes without saying "Yes" or "No"!',
      enText: 'Dare! Talk on voice chat for two minutes without saying Yes or No!',
      hiSpoken: 'डेयर! वॉइस चैट पर दो मिनट तक बिना हाँ या ना कहे बात कीजिए!',
      bnSpoken: 'ডেয়ার! ভয়েস চ্যাটে দুই মিনিট হ্যাঁ বা না না বলে কথা বলো!'
    },
    {
      id: 'td2', kind: 'TRUTH', label: 'First Impression', color: '#8b5cf6',
      task: 'Share your honest first impression of your partner or bestie!',
      enText: 'Truth! Share your honest first impression of your partner or bestie!',
      hiSpoken: 'ट्रुथ! अपने पार्टनर या बेस्टी के बारे में आपका पहला इम्प्रेशन क्या था?',
      bnSpoken: 'ট্রুথ! তোমার পার্টনার বা বেস্টিকে প্রথম দেখে কী মনে হয়েছিল?'
    },
    {
      id: 'td3', kind: 'PENALTY', label: 'Sweet Penalty', color: '#f59e0b',
      task: 'Hum or sing 2 lines of a romantic or friendship song right now!',
      enText: 'Sweet Penalty! Hum or sing two lines of a romantic or friendship song!',
      hiSpoken: 'स्वीट पेनल्टी! अभी कोई प्यारा-सा दोस्ती या रोमांटिक गाना गुनगुनाइए!',
      bnSpoken: 'সুইট পেনাল্টি! এখনই বন্ধুত্ব বা ভালোবাসার গানের দুটো লাইন গেয়ে শোনাও!'
    },
    {
      id: 'td4', kind: 'DARE', label: '3 Compliments', color: '#ef4444',
      task: 'Give 3 rapid-fire genuine compliments in under 15 seconds!',
      enText: 'Dare! Give three rapid-fire genuine compliments in fifteen seconds!',
      hiSpoken: 'डेयर! पंद्रह सेकंड में अपने पार्टनर की तीन सच्ची तारीफें कीजिए!',
      bnSpoken: 'ডেয়ার! পনেরো সেকেন্ডের মধ্যে তিনটি সত্যিকারের প্রশংসা করো!'
    },
    {
      id: 'td5', kind: 'TRUTH', label: 'Secret Habit', color: '#6366f1',
      task: 'What is one funny habit of yours that almost nobody knows?',
      enText: 'Truth! Reveal one funny secret habit nobody knows about you!',
      hiSpoken: 'ट्रुथ! अपनी कोई एक मज़ेदार आदत बताइए जो शायद ही कोई जानता हो!',
      bnSpoken: 'ট্রুথ! নিজের এমন একটা মজার অভ্যাস বলো যা কেউ জানে না!'
    },
    {
      id: 'td6', kind: 'PENALTY', label: 'Emoji Story', color: '#f43f5e',
      task: 'Describe your bestie using ONLY 3 emojis — let them decode it!',
      enText: 'Sweet Penalty! Describe your bestie using only three emojis!',
      hiSpoken: 'स्वीट पेनल्टी! सिर्फ तीन इमोजी में अपने बेस्टी को बयान कीजिए!',
      bnSpoken: 'সুইট পেনাল্টি! মাত্র তিনটি ইমোজিতে তোমার বেস্টিকে বর্ণনা করো!'
    },
    {
      id: 'td7', kind: 'DARE', label: 'Movie Dialogue', color: '#db2777',
      task: 'Deliver a dramatic Bollywood or Hollywood dialogue with full energy!',
      enText: 'Dare! Deliver your best dramatic movie dialogue with full energy!',
      hiSpoken: 'डेयर! पूरे जोश के साथ अपना सबसे फिल्मी डायलॉग सुनाइए!',
      bnSpoken: 'ডেয়ার! পুরো এনার্জি দিয়ে একটা দারুণ সিনেমার ডায়লগ বলো!'
    },
    {
      id: 'td8', kind: 'TRUTH', label: 'Dream Memory', color: '#9333ea',
      task: 'What is your favorite shared memory or dream hangout spot?',
      enText: 'Truth! What is your favorite shared memory or dream hangout spot?',
      hiSpoken: 'ट्रुथ! आप दोनों की सबसे प्यारी याद या ड्रीम हैंगआउट जगह कौन-सी है?',
      bnSpoken: 'ট্রুথ! তোমাদের সবচেয়ে প্রিয় স্মৃতি বা স্বপ্নের আড্ডার জায়গা কোনটা?'
    }
  ];

  const MOST_LIKELY_PROMPTS = [
    {
      id: 'ml1', prompt: 'Who is most likely to forget where they kept their phone?',
      enText: 'Who is most likely to forget where they kept their phone?',
      hiSpoken: 'सबसे ज़्यादा चांस किसके हैं कि वो अपना फोन रखकर भूल जाए?',
      bnSpoken: 'কে সবচেয়ে বেশি নিজের ফোন কোথায় রেখেছে ভুলে যায়?'
    },
    {
      id: 'ml2', prompt: 'Who is most likely to start laughing during a serious moment?',
      enText: 'Who is most likely to start laughing during a serious moment?',
      hiSpoken: 'सीरियस मौके पर सबसे पहले हंसी किसे आ जाती है?',
      bnSpoken: 'সিরিয়াস মুহূর্তে সবার আগে কে হেসে ফেলে?'
    },
    {
      id: 'ml3', prompt: 'Who is most likely to plan a surprise midnight snack run?',
      enText: 'Who is most likely to plan a surprise midnight snack run?',
      hiSpoken: 'आधी रात को सरप्राइज़ स्नैक प्लान सबसे पहले कौन बनाता है?',
      bnSpoken: 'মাঝরাতে সারপ্রাইজ খাবার প্ল্যান সবার আগে কে করে?'
    },
    {
      id: 'ml4', prompt: 'Who is most likely to win a ₹1 Cr game show jackpot?',
      enText: 'Who is most likely to win a One Crore game show jackpot?',
      hiSpoken: 'एक करोड़ का गेम शो जैकपॉट जीतने के सबसे ज़्यादा चांस किसके हैं?',
      bnSpoken: 'এক কোটি টাকার গেম শো জ্যাকপট জেতার সম্ভাবনা কার সবচেয়ে বেশি?'
    },
    {
      id: 'ml5', prompt: 'Who is most likely to send 10 voice notes in a row?',
      enText: 'Who is most likely to send ten voice notes in a row?',
      hiSpoken: 'लगातार दस वॉइस नोट भेजने में सबसे आगे कौन रहता है?',
      bnSpoken: 'টানা দশটা ভয়েস নোট পাঠাতে কে সবচেয়ে ওস্তাদ?'
    }
  ];

  const LOVE_METER_QUESTIONS = [
    {
      id: 'lm1', q: 'How fast do you reply to each other?',
      opts: [{ label: 'Instant Reply ⚡', pts: 20 }, { label: 'Within Minutes 💬', pts: 16 }, { label: 'Chaotic Timing 😂', pts: 12 }],
      enText: 'Question 1: How fast do you reply to each other?',
      hiSpoken: 'सवाल एक: आप दोनों एक-दूसरे को कितनी जल्दी रिप्लाई करते हैं?',
      bnSpoken: 'প্রশ্ন এক: তোমরা একে অপরকে কত দ্রুত রিপ্লাই দাও?'
    },
    {
      id: 'lm2', q: 'Your shared humor level?',
      opts: [{ label: 'Telepathic Memes 😂', pts: 20 }, { label: 'Inside Jokes 24/7 🔥', pts: 18 }, { label: 'Roast Each Other 💀', pts: 15 }],
      enText: 'Question 2: How strong is your shared humor level?',
      hiSpoken: 'सवाल दो: आप दोनों का ह्यूमर और मज़ाक का लेवल कैसा है?',
      bnSpoken: 'প্রশ্ন দুই: তোমাদের দুজনের মজার আর হাসাহাসির লেভেল কেমন?'
    },
    {
      id: 'lm3', q: 'When drama strikes, how do you react?',
      opts: [{ label: 'Calm + Drama Balance 👑', pts: 20 }, { label: 'Team Up Instantly 🛡️', pts: 19 }, { label: 'Panic Together 😱', pts: 14 }],
      enText: 'Question 3: When drama strikes, how does your duo react?',
      hiSpoken: 'सवाल तीन: जब कोई ड्रामा या टेंशन हो, तो आप दोनों कैसे रिएक्ट करते हैं?',
      bnSpoken: 'প্রশ্ন তিন: কোনো নাটকীয় পরিস্থিতি এলে তোমরা কীভাবে সামলাও?'
    },
    {
      id: 'lm4', q: 'Late-night talk duration?',
      opts: [{ label: '3+ Hours Non-Stop 🌙', pts: 20 }, { label: '1 Hour Daily ✨', pts: 17 }, { label: 'Short Sweet Calls 💖', pts: 14 }],
      enText: 'Question 4: How long do your late-night conversations last?',
      hiSpoken: 'सवाल चार: आपकी लेट-नाइट बातें कितनी देर तक चलती हैं?',
      bnSpoken: 'প্রশ্ন চার: তোমাদের রাতের আড্ডা কতক্ষণ চলে?'
    },
    {
      id: 'lm5', q: 'Teamwork in party games?',
      opts: [{ label: 'Unstoppable Duo 🏆', pts: 20 }, { label: 'Fun Chaos Agents 🎉', pts: 17 }, { label: 'Friendly Rivals ⚔️', pts: 15 }],
      enText: 'Final Question: How is your teamwork in party games?',
      hiSpoken: 'आखिरी सवाल: पार्टी गेम्स में आप दोनों की टीमवर्क कैसी है?',
      bnSpoken: 'শেষ প্রশ্ন: পার্টি গেমসে তোমাদের টিমওয়ার্ক কেমন?'
    }
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
    createTenVsCrRound,
    createAsliNakliRound,
    createSastaMehngaPair,
    evaluateClosestGuesses,
    applyBudgetLifeline,
    evaluateMindSync,
    resolveWheelWedge,
    calculateLoveVibeResult,
    checkBudgetExclusiveUnlocks,
    checkCoupleExclusiveUnlocks,
    parseYouTubeId,
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
