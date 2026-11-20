import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, setDoc, deleteDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyA5rrpi1fe6YCkLkBxUVz3vJNDlcUTiRHA",
  authDomain: "study-game-8ce0c.firebaseapp.com",
  projectId: "study-game-8ce0c",
  storageBucket: "study-game-8ce0c.firebasestorage.app",
  messagingSenderId: "1042366074383",
  appId: "1:1042366074383:web:a53806b5d7dcc621e89d7a",
  measurementId: "G-XKEH13E1DC"
};

export const DEV_LOGIN_ID = "soumitranext1@gmail.com";
export const DEV_LOGIN_PASS = "7908368702003";
export const DEV_UID = "DEV_SUDIPTA_99";
export const DEV_AVATAR = "👑";
export const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const ls = {
  get(k, d) {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }
    catch { return d; }
  },
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch {}
  }
};

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

export const today = () => new Date().toISOString().slice(0, 10);
export const calcLevel = exp => Math.max(1, Math.floor(Number(exp || 0) / 100) + 1);

export function fmtNum(n) {
  const v = Number(n || 0), abs = Math.abs(v);
  if (abs >= 1e9) return (v / 1e9).toFixed(abs % 1e9 === 0 ? 0 : 1).replace(/\.0$/, "") + "B";
  if (abs >= 1e6) return (v / 1e6).toFixed(abs % 1e6 === 0 ? 0 : 1).replace(/\.0$/, "") + "M";
  return String(Math.round(v));
}

export function calcStreak(days) {
  const set = new Set(days || []);
  let n = 0;
  const d = new Date();
  while (set.has(d.toISOString().slice(0, 10))) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}

export function getGuestUid() {
  let g = localStorage.getItem("sg_guest_uid");
  if (!g) {
    g = "SG" + Math.floor(10000000 + Math.random() * 89999999);
    localStorage.setItem("sg_guest_uid", g);
  }
  return g;
}

export function getActiveUid() {
  const g = getGuestUid();
  const u = localStorage.getItem("sg_uid") || g;
  localStorage.setItem("sg_uid", u);
  return u;
}

export function isDevAccount(u) {
  return Boolean(u && (u.uid === DEV_UID || String(u.accountId || "").toLowerCase() === DEV_LOGIN_ID));
}

export function freshDefaultProfile(targetUid, guestId = getGuestUid()) {
  const isGuest = targetUid === guestId;
  return {
    uid: targetUid,
    name: isGuest ? ("Guest " + targetUid.slice(-4)) : ("Player " + targetUid.slice(-4)),
    bio: "",
    hobbies: "",
    avatar: "🦊",
    frame: "none",
    banner: "bn-aurora",
    textStyle: "",
    bioStyle: "",
    msgStyle: "",
    tags: [isGuest ? "Guest Pass" : "Newbie"],
    accountType: isGuest ? "guest" : "account",
    accountId: "",
    coins: 50,
    exp: 0,
    dailyCoinsByDay: {},
    claimedByDay: {},
    friends: [],
    tempUnlocks: {},
    done: {},
    unreadFrom: {},
    activeDays: [today()],
    referredBy: "",
    referralRewardClaimed: false,
    lastLoginBonusDay: "",
    poemReqDay: "",
    usageSec: 0,
    banned: false
  };
}

export function normalizeProfile(raw, targetUid, guestId = getGuestUid()) {
  const base = freshDefaultProfile(targetUid, guestId);
  const p = { ...base, ...(raw || {}), uid: targetUid };
  ["dailyCoinsByDay", "claimedByDay", "tempUnlocks", "unreadFrom", "done"].forEach(k => {
    if (!p[k] || typeof p[k] !== "object" || Array.isArray(p[k])) p[k] = {};
  });
  p.friends = Array.isArray(p.friends) ? p.friends : [];
  p.activeDays = Array.isArray(p.activeDays) ? p.activeDays : [];
  if (!p.activeDays.includes(today())) p.activeDays.push(today());
  p.coins = Number(p.coins || 0);
  p.exp = Number(p.exp || 0);
  p.streakDays = calcStreak(p.activeDays);

  if (isDevAccount(p)) {
    p.avatar = DEV_AVATAR;
    p.frame = "dev";
    p.tags = ["Developer", "LVL 99"];
    if (!p.banner || p.banner === "bn-aurora") p.banner = "bn-dev";
  } else {
    const live = k => Number(p.tempUnlocks[k] || 0) > Date.now();
    if (p.avatar === DEV_AVATAR) p.avatar = "🦊";
    if (p.frame === "dev" || (p.frame && p.frame !== "none" && !live("frame:" + p.frame))) p.frame = "none";
    if (p.banner === "bn-dev" || (p.banner !== "bn-aurora" && !live("banner:" + p.banner))) p.banner = "bn-aurora";
    if (p.textStyle && !live("text:" + p.textStyle)) p.textStyle = "";
    if (p.msgStyle && !live("msg:" + p.msgStyle)) p.msgStyle = "";
    if (p.bioStyle && !live("bio:" + p.bioStyle)) p.bioStyle = "";
    p.tags = (Array.isArray(p.tags) ? p.tags : []).filter(t => ["Guest Pass", "Newbie"].includes(t) || live("tag:" + t)).slice(0, 3);
    if (!p.tags.length) p.tags = [targetUid === guestId ? "Guest Pass" : "Newbie"];
  }
  return p;
}

export function openCleanPage(href, returnTab = "tools") {
  try { sessionStorage.setItem("sg_return", returnTab); } catch {}
  history.replaceState(null, "", location.pathname);
  location.assign(href);
}

export function createDbClient() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    return {
      db,
      ready: true,
      col: name => collection(db, name),
      docRef: (colName, id) => doc(db, colName, id),
      getDoc,
      setDoc,
      deleteDoc,
      onSnapshot
    };
  } catch {
    return { db: null, ready: false };
  }
}
