
import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, set, get, onValue, off, update, remove, push } from "firebase/database";

const firebaseConfig = { apiKey:"AIzaSyDRCtfuYrEdnuKUsWu_79NC6G_xGLznBJc", authDomain:"tttrt-b8c5a.firebaseapp.com", databaseURL:"https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app", projectId:"tttrt-b8c5a", storageBucket:"tttrt-b8c5a.firebasestorage.app", messagingSenderId:"975123752593", appId:"1:975123752593:web:e591e930af3a3e29568130" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const OWNER_USERNAME = "tsaxp";
const APP_BOT_ID = "bot_dfgfd_official";
const APP_BOT_USERNAME = "dfgfd";
const SUPPORT_ID = "support_official";
const APP_CHANNEL_ID = "channel_termeen_official";
const BOT_FATHER_ID = "bot_botfather_official";
const APP_CHANNEL_SUBS = 55000000;

const ACOLORS = ["#E57373","#4CAF50","#9C27B0","#FF9800","#00BCD4","#F44336","#2196F3","#FF5722","#607D8B","#795548"];
const rColor = s => ACOLORS[(s||"A").charCodeAt(0)%ACOLORS.length];
const uidGen = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36);
const nowStr = () => new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});
const nowFull = () => { const d=new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")} - ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };
const fmtSize = b => b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";
const fmtSubs = n => n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?(n/1000).toFixed(1)+"K":String(n);

const T = { bg:"#17212b", sidebar:"#0e1621", panel:"#182533", accent:"#2b5278", accentBtn:"#5288c1", text:"#e8f4fd", textSec:"#6b8ca4", msgOut:"#2b5278", msgIn:"#182533", border:"#0d1822", inputBg:"#1c2d3d", hover:"#1c2d3d", online:"#4dd67a", unread:"#5288c1", danger:"#e05c5c", gold:"#f0a040", verified:"#5288c1", tabBar:"#1c2733" };

function searchScore(item, q) {
  const name=(item.displayName||item.name||"").toLowerCase();
  const uname=(item.username||"").toLowerCase();
  if(uname===q||name===q) return 100;
  if(uname.startsWith(q)) return 90-uname.length;
  if(name.startsWith(q)) return 80-name.length;
  if(uname.includes(q)) return 60;
  if(name.includes(q)) return 50;
  return 0;
}

// Parse text for @mentions and make them blue+clickable
function ParsedText({text, onMentionClick, style}) {
  if(!text) return null;
  const parts = text.split(/(@[a-zA-Z][a-zA-Z0-9_]{4,})/g);
  return (
    <span style={style}>
      {parts.map((part,i) => {
        if(/^@[a-zA-Z][a-zA-Z0-9_]{4,}$/.test(part)) {
          return <span key={i} onClick={e=>{e.stopPropagation();onMentionClick&&onMentionClick(part.slice(1));}} style={{color:"#6ab3f3",cursor:"pointer",fontWeight:"600"}}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// Icons
const SVG = {
  send:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mic:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" stroke={c} strokeWidth="2"/><path d="M5 10C5 14.418 8.134 18 12 18C15.866 18 19 14.418 19 10" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="18" x2="12" y2="22" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  attach:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05L12.25 20.24C10.5 21.99 7.75 21.99 6 20.24C4.25 18.49 4.25 15.74 6 13.99L14.5 5.49C15.67 4.32 17.58 4.32 18.75 5.49C19.92 6.66 19.92 8.57 18.75 9.74L10.24 18.24C9.66 18.82 8.72 18.82 8.13 18.24C7.55 17.66 7.55 16.72 8.13 16.13L15.92 8.34" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={c} strokeWidth="2"/><path d="M21 21L16.65 16.65" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  menu:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  back:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  more:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill={c}/><circle cx="12" cy="12" r="1.5" fill={c}/><circle cx="12" cy="19" r="1.5" fill={c}/></svg>,
  call:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0111.2 18.9a19.5 19.5 0 01-7-7A19.79 19.79 0 011.13 4.18 2 2 0 013.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.41 9.9A16 16 0 0014.1 17.09l.95-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.42v-1.5z" stroke={c} strokeWidth="2"/></svg>,
  checks:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="18 6 9 17 4 12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 6 13 17" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  file:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="2"/></svg>,
  user:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke={c} strokeWidth="2"/></svg>,
  group:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  channel:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2L8 8H3l4.5 4.5-2 7L12 16l6.5 3.5-2-7L21 8h-5L12 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  settings:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={c} strokeWidth="2"/></svg>,
  saved:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  image:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke={c} strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" fill={c}/><path d="M21 15L16 10L5 21" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lock:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke={c} strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2"/></svg>,
  eyeOff:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  bot:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke={c} strokeWidth="2"/><circle cx="12" cy="7" r="3" stroke={c} strokeWidth="2"/><line x1="12" y1="2" x2="12" y2="4" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="8" cy="16" r="1.5" fill={c}/><circle cx="16" cy="16" r="1.5" fill={c}/></svg>,
  support:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  notification:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  contacts:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  edit:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14H6L5 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  crown:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M2 20h20M4 20L2 8l6 4 4-8 4 8 6-4-2 12H4z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pin:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 17v5M8 17h8M9 3h6l2 5-4 3v3H9V11L5 8l4-5z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  link:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  flag:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="4" y1="22" x2="4" y2="15" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  forward:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="15 17 20 12 15 7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 18v-2a4 4 0 014-4h12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  device:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke={c} strokeWidth="2"/><line x1="12" y1="18" x2="12.01" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  privacy:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  data:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="5" rx="9" ry="3" stroke={c} strokeWidth="2"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke={c} strokeWidth="2"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke={c} strokeWidth="2"/></svg>,
  theme:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke={c} strokeWidth="2"/><line x1="12" y1="1" x2="12" y2="3" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="21" x2="12" y2="23" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="12" x2="3" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="21" y1="12" x2="23" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  lang:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2"/><line x1="2" y1="12" x2="22" y2="12" stroke={c} strokeWidth="2"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={c} strokeWidth="2"/></svg>,
  key:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};
const Ic = ({n,s=20,c=T.textSec}) => SVG[n]?SVG[n](c,s):null;

// ── Avatar ──
const Av = ({name,color,size=46,online=false,verified=false,photo=null,fraud=false,onClick}) => (
  <div style={{position:"relative",flexShrink:0,cursor:onClick?"pointer":"default"}} onClick={onClick}>
    <div style={{width:size,height:size,borderRadius:"50%",background:photo?"transparent":(color||rColor(name||"?")),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:"800",color:"#fff",overflow:"hidden",border:fraud?`2px solid ${T.danger}`:"none"}}>
      {photo?<img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(name||"?").charAt(0).toUpperCase()}
    </div>
    {online&&<div style={{position:"absolute",bottom:1,right:1,width:size*0.26,height:size*0.26,borderRadius:"50%",background:T.online,border:`2px solid ${T.sidebar}`}}/>}
    {verified&&<div style={{position:"absolute",bottom:-2,left:-2,background:T.verified,borderRadius:"50%",width:size*0.32,height:size*0.32,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${T.sidebar}`}}><Ic n="check" s={size*0.18} c="#fff"/></div>}
  </div>
);

// ── Profile Viewer (Telegram-style) ──
function ProfileViewer({profile,onClose,onChat,currentUser,chats}) {
  if(!profile) return null;
  const isUser=profile.uid!=null;
  const mutualGroups=isUser?chats.filter(c=>c.type==="group"&&Array.isArray(c.members)&&c.members.includes(profile.uid)&&c.members.includes(currentUser?.uid)):[];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:T.sidebar,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:"480px",maxHeight:"85vh",overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
        {/* Hero */}
        <div style={{background:`linear-gradient(180deg,${profile.color||rColor(profile.name||profile.displayName||"?")} 0%,${T.sidebar} 100%)`,padding:"0 0 0 0",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:"12px",right:"12px",background:"rgba(0,0,0,0.3)",border:"none",borderRadius:"50%",width:"32px",height:"32px",color:"#fff",cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>✕</button>
          {/* Full width photo */}
          <div style={{width:"100%",height:"220px",background:profile.photoURL?"transparent":(profile.color||rColor(profile.name||profile.displayName||"?")),display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
            {profile.photoURL
              ? <img src={profile.photoURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <span style={{fontSize:"80px",fontWeight:"900",color:"rgba(255,255,255,0.8)"}}>{(profile.name||profile.displayName||"?").charAt(0).toUpperCase()}</span>
            }
            {/* Name overlay at bottom of photo */}
            <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.7))",padding:"20px 16px 12px"}}>
              <div style={{color:"#fff",fontSize:"20px",fontWeight:"800",display:"flex",alignItems:"center",gap:"7px"}}>
                {profile.name||profile.displayName}
                {(profile.verified||profile.isOfficial)&&<Ic n="check" s={18} c="#fff"/>}
                {profile.isFraud&&<span style={{background:T.danger,color:"#fff",fontSize:"10px",padding:"2px 6px",borderRadius:"5px",fontWeight:"700"}}>احتيال</span>}
              </div>
              {profile.username&&<div style={{color:"rgba(255,255,255,0.7)",fontSize:"13px"}}>@{profile.username}</div>}
            </div>
          </div>
        </div>
        {/* Info */}
        <div style={{overflowY:"auto",flex:1,padding:"12px 16px"}}>
          {profile.bio&&(
            <div style={{background:T.panel,borderRadius:"12px",padding:"12px",marginBottom:"10px"}}>
              <div style={{color:T.textSec,fontSize:"11px",marginBottom:"4px"}}>النبذة</div>
              <div style={{color:T.text,fontSize:"14px",lineHeight:"1.5"}}>{profile.bio}</div>
            </div>
          )}
          {isUser&&(
            <div style={{background:T.panel,borderRadius:"12px",padding:"12px",marginBottom:"10px"}}>
              <div style={{color:T.textSec,fontSize:"11px",marginBottom:"4px"}}>معلومات</div>
              {[
                {l:"اسم المستخدم",v:"@"+(profile.username||"—")},
                {l:"آخر ظهور",v:profile.lastSeen?new Date(profile.lastSeen).toLocaleDateString("ar-SA"):"—"},
              ].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${T.border}20`}}>
                  <span style={{color:T.textSec,fontSize:"12px"}}>{r.l}</span>
                  <span style={{color:T.text,fontSize:"12px",fontWeight:"600"}}>{r.v}</span>
                </div>
              ))}
            </div>
          )}
          {isUser&&mutualGroups.length>0&&(
            <div style={{background:T.panel,borderRadius:"12px",padding:"12px",marginBottom:"10px"}}>
              <div style={{color:T.textSec,fontSize:"11px",marginBottom:"8px"}}>مجموعات مشتركة ({mutualGroups.length})</div>
              {mutualGroups.slice(0,3).map(g=>(
                <div key={g.id} style={{display:"flex",alignItems:"center",gap:"8px",padding:"5px 0"}}>
                  <Av name={g.name} size={32} color={rColor(g.name)}/>
                  <div style={{color:T.text,fontSize:"13px"}}>{g.name}</div>
                </div>
              ))}
            </div>
          )}
          {!isUser&&profile.type==="channel"&&(
            <div style={{background:T.panel,borderRadius:"12px",padding:"12px",marginBottom:"10px"}}>
              <div style={{color:T.textSec,fontSize:"11px",marginBottom:"4px"}}>إحصائيات</div>
              <div style={{color:T.text,fontSize:"14px"}}>{fmtSubs(profile.subscribers||0)} مشترك</div>
            </div>
          )}
          {isUser&&onChat&&profile.uid!==currentUser?.uid&&(
            <button onClick={()=>{onChat(profile);onClose();}} style={{width:"100%",padding:"13px",background:T.accentBtn,border:"none",borderRadius:"12px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:"pointer",fontFamily:"inherit",marginTop:"8px"}}>
              💬 إرسال رسالة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Report Modal ──
function ReportModal({onClose,onReport}) {
  const [selected,setSelected]=useState("");
  const [note,setNote]=useState("");
  const reasons=["محتوى جنسي أو للبالغين","نشاطات إرهابية أو عنف","احتيال أو نصب","رسائل مزعجة (سبام)","مواد مسيئة أو تحرش","انتهاك حقوق الملكية","محتوى مضلل أو كاذب","شيء آخر"];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:700,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#1a2a3a",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:"480px",padding:"20px",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <span style={{color:T.text,fontSize:"17px",fontWeight:"800"}}>🚩 إرسال بلاغ</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={18}/></button>
        </div>
        <div style={{color:T.textSec,fontSize:"12px",marginBottom:"12px"}}>اختر سبب البلاغ:</div>
        <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"14px"}}>
          {reasons.map(r=>(
            <button key={r} onClick={()=>setSelected(r)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 14px",borderRadius:"11px",border:`1px solid ${selected===r?T.accentBtn:T.border}30`,background:selected===r?`${T.accentBtn}15`:"transparent",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"13.5px",textAlign:"right",transition:"all 0.2s"}}>
              <div style={{width:"18px",height:"18px",borderRadius:"50%",border:`2px solid ${selected===r?T.accentBtn:T.textSec}`,background:selected===r?T.accentBtn:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {selected===r&&<div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#fff"}}/>}
              </div>
              {r}
            </button>
          ))}
        </div>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="تفاصيل إضافية (اختياري)..." rows={3}
          style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:"12px",padding:"11px 14px",color:T.text,fontSize:"14px",outline:"none",direction:"rtl",fontFamily:"inherit",resize:"none",marginBottom:"12px",boxSizing:"border-box"}}/>
        <button onClick={()=>{if(selected)onReport(selected,note);}} disabled={!selected} style={{width:"100%",padding:"13px",background:selected?T.danger:`${T.danger}40`,border:"none",borderRadius:"12px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:selected?"pointer":"not-allowed",fontFamily:"inherit"}}>
          🚩 إرسال البلاغ
        </button>
      </div>
    </div>
  );
}

// ── Sessions Panel ──
function SessionsPanel({user,userData,db}) {
  const [sessions,setSessions]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(!user) return;
    const load=async()=>{
      const snap=await get(ref(db,`sessions/${user.uid}`));
      if(snap.exists()) setSessions(Object.values(snap.val()));
      else {
        // Create current session
        const sid=uidGen();
        const s={id:sid,device:"متصفح الويب",browser:navigator.userAgent.includes("Chrome")?"Chrome":navigator.userAgent.includes("Firefox")?"Firefox":"Safari",ip:"xxx.xxx.xxx",location:"—",loginTime:Date.now(),current:true};
        await set(ref(db,`sessions/${user.uid}/${sid}`),s);
        setSessions([s]);
      }
      setLoading(false);
    };
    load();
  },[user,db]);

  const removeSession=async(sid)=>{
    if(!window.confirm("إزالة هذه الجلسة؟")) return;
    await remove(ref(db,`sessions/${user.uid}/${sid}`));
    setSessions(p=>p.filter(s=>s.id!==sid));
    // Notify
    const botId=`bot_${user.uid}`;const nid=uidGen();
    await set(ref(db,`messages/${botId}/${nid}`),{id:nid,chatId:botId,text:`🔐 تم إنهاء جلسة من جهاز: ${sessions.find(s=>s.id===sid)?.device||"جهاز"}\n🕐 ${nowFull()}`,from:APP_BOT_ID,senderName:"DFGFD",time:nowStr(),type:"text",isOfficialBot:true,createdAt:Date.now()});
  };

  if(loading) return <div style={{padding:"40px",textAlign:"center",color:T.textSec}}>⟳ جاري التحميل...</div>;

  return (
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:"10px"}}>
      <div style={{color:T.textSec,fontSize:"12px",marginBottom:"4px"}}>الجلسات النشطة ({sessions.length})</div>
      {sessions.map(s=>(
        <div key={s.id} style={{background:T.panel,borderRadius:"14px",padding:"14px",border:`1px solid ${s.current?T.accentBtn:T.border}30`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{color:T.text,fontWeight:"700",fontSize:"14px",display:"flex",alignItems:"center",gap:"6px"}}>
                <Ic n="device" s={16} c={s.current?T.accentBtn:T.textSec}/>
                {s.device}
                {s.current&&<span style={{background:`${T.success}20`,color:T.success,fontSize:"10px",padding:"1px 6px",borderRadius:"5px",fontWeight:"700"}}>حالي</span>}
              </div>
              <div style={{color:T.textSec,fontSize:"12px",marginTop:"4px"}}>{s.browser} · {new Date(s.loginTime).toLocaleDateString("ar-SA")}</div>
              <div style={{color:T.textSec,fontSize:"11px"}}>{s.location||"الموقع غير معروف"}</div>
            </div>
            {!s.current&&(
              <button onClick={()=>removeSession(s.id)} style={{background:`${T.danger}15`,border:`1px solid ${T.danger}30`,borderRadius:"8px",padding:"6px 12px",color:T.danger,cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:"600"}}>إزالة</button>
            )}
          </div>
        </div>
      ))}
      <button onClick={async()=>{
        if(!window.confirm("إنهاء جميع الجلسات الأخرى؟")) return;
        const others=sessions.filter(s=>!s.current);
        for(const s of others) await remove(ref(db,`sessions/${user.uid}/${s.id}`));
        setSessions(p=>p.filter(s=>s.current));
        alert("✅ تم إنهاء جميع الجلسات الأخرى");
      }} style={{background:`${T.danger}12`,border:`1px solid ${T.danger}25`,borderRadius:"12px",padding:"12px",color:T.danger,cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"600",width:"100%"}}>
        إنهاء جميع الجلسات الأخرى
      </button>
    </div>
  );
}

// ── Modal ──
const Modal = ({title,children,onClose,width="440px"}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"16px"}} onClick={onClose}>
    <div style={{background:"#1a2a3a",borderRadius:"18px",padding:"24px",width,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.7)",border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <h3 style={{color:T.text,fontSize:"17px",fontWeight:"800"}}>{title}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={18}/></button>
      </div>
      {children}
    </div>
  </div>
);

const FInput = ({label,value,onChange,placeholder,type="text",autoFocus=false,onKeyDown}) => {
  const [show,setShow]=useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
      {label&&<label style={{color:T.textSec,fontSize:"12px",fontWeight:"600"}}>{label}</label>}
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        <input value={value} onChange={onChange} placeholder={placeholder} type={type==="password"&&show?"text":type} autoFocus={autoFocus} onKeyDown={onKeyDown}
          style={{background:T.inputBg,border:`1px solid ${T.border}44`,borderRadius:"12px",padding:`11px ${type==="password"?"40px":"14px"} 11px 14px`,color:T.text,fontSize:"15px",outline:"none",direction:"rtl",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}
          onFocus={e=>e.target.style.borderColor=T.accentBtn} onBlur={e=>e.target.style.borderColor=`${T.border}44`}/>
        {type==="password"&&<button onClick={()=>setShow(!show)} style={{position:"absolute",left:"12px",background:"none",border:"none",cursor:"pointer"}}><Ic n={show?"eyeOff":"eye"} s={16}/></button>}
      </div>
    </div>
  );
};

const PBtn = ({children,onClick,loading=false,color=T.accentBtn,disabled=false,style={}}) => (
  <button onClick={onClick} disabled={loading||disabled} style={{background:color,border:"none",borderRadius:"12px",padding:"13px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:(loading||disabled)?"not-allowed":"pointer",fontFamily:"inherit",width:"100%",opacity:(loading||disabled)?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",...style}}>
    {loading?<span style={{animation:"spin 0.8s linear infinite",display:"inline-block"}}>⟳</span>:children}
  </button>
);

const Toggle = ({checked,onChange}) => (
  <button onClick={onChange} style={{width:"44px",height:"24px",borderRadius:"12px",background:checked?T.accentBtn:"#3a4a5a",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
    <div style={{width:"18px",height:"18px",borderRadius:"50%",background:"#fff",position:"absolute",top:"3px",transition:"right 0.2s",right:checked?"3px":"23px"}}/>
  </button>
);

// Auth Screen
function AuthScreen() {
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({displayName:"",username:"",email:"",password:""});
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const F=k=>e=>setForm(p=>({...p,[k]:e.target.value}));

  const validate=()=>{
    if(mode==="register"){
      if(!form.displayName.trim()){setErr("أدخل اسمك الشخصي");return false;}
      if(!form.username.trim()){setErr("أدخل اسم المستخدم");return false;}
      if(form.username.trim().length<5){setErr("اسم المستخدم 5 أحرف على الأقل");return false;}
      if(/^\d/.test(form.username)){setErr("اسم المستخدم لا يبدأ برقم");return false;}
      if(!/^[a-zA-Z][a-zA-Z0-9_]{4,}$/.test(form.username)){setErr("حروف وأرقام وشرطة سفلية، يبدأ بحرف");return false;}
      if(form.password.length<6){setErr("كلمة المرور 6 أحرف على الأقل");return false;}
    }
    if(!form.email.trim()){setErr("أدخل البريد الإلكتروني");return false;}
    if(!form.password){setErr("أدخل كلمة المرور");return false;}
    return true;
  };

  const handleRegister=async()=>{
    if(!validate()) return;
    setLoading(true);setErr("");
    try {
      const [usSnap]=await Promise.all([get(ref(db,`usernames/${form.username.toLowerCase()}`))]);
      if(usSnap.exists()){setErr("اسم المستخدم مأخوذ مسبقاً");setLoading(false);return;}
      const cred=await createUserWithEmailAndPassword(auth,form.email,form.password);
      await updateProfile(cred.user,{displayName:form.displayName});
      const uid2=cred.user.uid;
      const userData={uid:uid2,displayName:form.displayName,username:form.username.toLowerCase(),email:form.email,bio:"",photoURL:"",verified:false,isBanned:false,isRestricted:false,isFraud:false,twoFactor:false,createdAt:Date.now(),lastSeen:Date.now(),color:rColor(form.displayName)};
      await set(ref(db,`users/${uid2}`),userData);
      await set(ref(db,`usernames/${form.username.toLowerCase()}`),uid2);
      // Create session
      const sid=uidGen();
      await set(ref(db,`sessions/${uid2}/${sid}`),{id:sid,device:"متصفح الويب",browser:"Chrome",ip:"xxx.xxx.xxx",location:"—",loginTime:Date.now(),current:true});
      // Saved
      const savedId=`saved_${uid2}`;
      await set(ref(db,`chats/${savedId}`),{id:savedId,type:"saved",name:"الرسائل المحفوظة",members:[uid2],createdAt:Date.now()});
      await set(ref(db,`userChats/${uid2}/${savedId}`),{chatId:savedId,lastMessage:"احفظ رسائلك هنا",lastTime:nowStr(),unread:0,order:Date.now()-3,type:"saved",name:"الرسائل المحفوظة",color:"#5288c1"});
      // DFGFD Bot
      const botChatId=`bot_${uid2}`;
      await set(ref(db,`chats/${botChatId}`),{id:botChatId,type:"official_bot",name:"DFGFD",username:APP_BOT_USERNAME,isOfficial:true,verified:true,members:[uid2,APP_BOT_ID],createdAt:Date.now(),photoURL:""});
      await set(ref(db,`userChats/${uid2}/${botChatId}`),{chatId:botChatId,lastMessage:"مرحباً بك في تيرمين ✈️",lastTime:nowStr(),unread:1,order:Date.now()-2,type:"official_bot",name:"DFGFD",verified:true,color:"#5288c1"});
      const wid=uidGen();
      await set(ref(db,`messages/${botChatId}/${wid}`),{id:wid,chatId:botChatId,text:`✈️ مرحباً ${form.displayName}!\n\nأنا DFGFD، المساعد الرسمي لتطبيق تيرمين.\n\n🆔 معرّفك: @${form.username.toLowerCase()}\n\nجميع بياناتك مشفّرة وآمنة. إذا حدثت أي تغييرات في حسابك ستصلك الإشعارات هنا! 🔔`,from:APP_BOT_ID,senderName:"DFGFD",time:nowStr(),type:"text",isOfficialBot:true,createdAt:Date.now()});
      // Support
      const supId=`support_${uid2}`;
      await set(ref(db,`chats/${supId}`),{id:supId,type:"support",name:"الدعم الفني",isOfficial:true,members:[uid2,SUPPORT_ID],createdAt:Date.now()});
      await set(ref(db,`userChats/${uid2}/${supId}`),{chatId:supId,lastMessage:"الدعم",lastTime:"",unread:0,order:Date.now()-1,type:"support",name:"الدعم الفني",color:"#4CAF50",subtitle:"الدعم"});
    } catch(e){
      const m={"auth/email-already-in-use":"البريد مستخدم بالفعل","auth/invalid-email":"بريد غير صالح","auth/weak-password":"كلمة المرور ضعيفة"};
      setErr(m[e.code]||e.message);
    }
    setLoading(false);
  };

  const handleLogin=async()=>{
    if(!validate()) return;
    setLoading(true);setErr("");
    try {
      const cred=await signInWithEmailAndPassword(auth,form.email,form.password);
      await update(ref(db,`users/${cred.user.uid}`),{lastSeen:Date.now()});
      // Update/create session
      const uid2=cred.user.uid;
      const sid=uidGen();
      await set(ref(db,`sessions/${uid2}/${sid}`),{id:sid,device:"متصفح الويب",browser:"Chrome",ip:"xxx.xxx.xxx",location:"—",loginTime:Date.now(),current:true});
      // Notify DFGFD
      const botId=`bot_${uid2}`;const nid=uidGen();
      await set(ref(db,`messages/${botId}/${nid}`),{id:nid,chatId:botId,text:`🔔 تسجيل دخول جديد\n📱 الجهاز: متصفح الويب\n🕐 ${nowFull()}\n\nإذا لم تكن أنت، قم بتغيير كلمة المرور فوراً!`,from:APP_BOT_ID,senderName:"DFGFD",time:nowStr(),type:"text",isOfficialBot:true,createdAt:Date.now()});
    } catch(e){
      const m={"auth/invalid-credential":"بيانات الدخول غير صحيحة","auth/user-not-found":"لا يوجد حساب","auth/wrong-password":"كلمة المرور خاطئة"};
      setErr(m[e.code]||e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl"}}>
      <div style={{width:"100%",maxWidth:"400px"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{fontSize:"64px",marginBottom:"12px"}}>✈️</div>
          <div style={{color:T.text,fontSize:"28px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div>
          <div style={{color:T.textSec,fontSize:"13px",marginTop:"6px"}}>تواصل أسرع · أسهل · أكثر أماناً</div>
        </div>
        <div style={{display:"flex",background:T.panel,borderRadius:"14px",padding:"4px",marginBottom:"22px",gap:"4px"}}>
          {[["login","تسجيل الدخول"],["register","إنشاء حساب"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setMode(k);setErr("");}} style={{flex:1,padding:"10px",borderRadius:"11px",border:"none",background:mode===k?T.accentBtn:"transparent",color:mode===k?"#fff":T.textSec,fontWeight:"700",fontSize:"14px",cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
        <div style={{background:T.sidebar,borderRadius:"18px",padding:"24px",border:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:"13px"}}>
          {mode==="register"&&<FInput label="الاسم الشخصي" value={form.displayName} onChange={F("displayName")} placeholder="اسمك الكامل" autoFocus/>}
          {mode==="register"&&<FInput label="اسم المستخدم (يبدأ بحرف، 5+ أحرف)" value={form.username} onChange={F("username")} placeholder="myusername"/>}
          <FInput label="البريد الإلكتروني" value={form.email} onChange={F("email")} placeholder="example@email.com" type="email" autoFocus={mode==="login"}/>
          <FInput label="كلمة المرور" value={form.password} onChange={F("password")} placeholder="••••••••" type="password" onKeyDown={e=>e.key==="Enter"&&(mode==="login"?handleLogin():handleRegister())}/>
          {err&&<div style={{background:`${T.danger}15`,border:`1px solid ${T.danger}30`,borderRadius:"10px",padding:"10px",color:T.danger,fontSize:"13px",textAlign:"center"}}>⚠️ {err}</div>}
          <PBtn onClick={mode==="login"?handleLogin:handleRegister} loading={loading}>{mode==="login"?"🔐 تسجيل الدخول":"✨ إنشاء حساب"}</PBtn>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0}`}</style>
    </div>
  );
}

// Settings Panel
function SettingsPanel({user,userData,setUserData,isOwner,openSupportChat,setModal,db}) {
  const [subTab,setSubTab]=useState(null);
  const [notifs,setNotifs]=useState({privateMsg:true,groups:true,channels:false,sounds:true});
  const [privacy,setPrivacy]=useState({phone:"nobody",photo:"everyone",lastSeen:"everyone"});
  const photoRef=useRef(null);

  const uploadPhoto=useCallback(file=>{
    if(!file||!user) return;
    const r=new FileReader();
    r.onload=async e=>{
      await update(ref(db,`users/${user.uid}`),{photoURL:e.target.result});
      const s=await get(ref(db,`users/${user.uid}`));
      if(s.exists())setUserData(s.val());
    };
    r.readAsDataURL(file);
  },[user,setUserData,db]);

  if(subTab==="sessions") return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:"10px",borderBottom:`1px solid ${T.border}`}}>
        <button onClick={()=>setSubTab(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="back" s={20}/></button>
        <span style={{color:T.text,fontWeight:"700",fontSize:"15px"}}>الجلسات النشطة</span>
      </div>
      <div style={{flex:1,overflowY:"auto"}}><SessionsPanel user={user} userData={userData} db={db}/></div>
    </div>
  );

  const SECTIONS=[
    {title:"الحساب",items:[
      {ic:"user",l:"تعديل الملف الشخصي",a:()=>setModal("editProfile")},
      {ic:"device",l:"الجلسات النشطة",sub:"عرض وإدارة جلساتك",a:()=>setSubTab("sessions")},
      {ic:"lock",l:"التحقق بخطوتين",sub:userData?.twoFactor?"مفعّل ✅":"معطّل",a:()=>setModal("twoFactor")},
      {ic:"key",l:"تغيير كلمة المرور",a:()=>setModal("changePass")},
    ]},
    {title:"الإشعارات",custom:()=>(
      <div style={{background:T.sidebar}}>
        {[{k:"privateMsg",l:"الرسائل الخاصة"},{k:"groups",l:"المجموعات"},{k:"channels",l:"القنوات"},{k:"sounds",l:"الأصوات"}].map(item=>(
          <div key={item.k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${T.border}15`}}>
            <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
              <div style={{width:"38px",height:"38px",borderRadius:"12px",background:`${T.accentBtn}20`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n="notification" s={18} c={T.accentBtn}/></div>
              <span style={{color:T.text,fontSize:"14.5px"}}>{item.l}</span>
            </div>
            <Toggle checked={notifs[item.k]} onChange={()=>setNotifs(p=>({...p,[item.k]:!p[item.k]}))}/>
          </div>
        ))}
      </div>
    )},
    {title:"الخصوصية والأمان",items:[
      {ic:"privacy",l:"رقم الهاتف",sub:privacy.phone==="nobody"?"لا أحد":"جهات الاتصال",a:()=>setPrivacy(p=>({...p,phone:p.phone==="nobody"?"contacts":"nobody"}))},
      {ic:"privacy",l:"الصورة الشخصية",sub:privacy.photo==="everyone"?"الجميع":"جهات الاتصال",a:()=>setPrivacy(p=>({...p,photo:p.photo==="everyone"?"contacts":"everyone"}))},
      {ic:"privacy",l:"آخر ظهور",sub:privacy.lastSeen==="everyone"?"الجميع":"لا أحد",a:()=>setPrivacy(p=>({...p,lastSeen:p.lastSeen==="everyone"?"nobody":"everyone"}))},
    ]},
    {title:"البيانات والتخزين",items:[
      {ic:"data",l:"استخدام البيانات",sub:"تلقائي"},
      {ic:"data",l:"إدارة التخزين",sub:"تنظيف الكاش"},
    ]},
    {title:"المظهر",items:[
      {ic:"theme",l:"الوضع الداكن",sub:"مفعّل"},
      {ic:"theme",l:"حجم الخط",sub:"متوسط"},
    ]},
    {title:"اللغة",items:[{ic:"lang",l:"لغة التطبيق",sub:"العربية"}]},
    {title:"الدعم",items:[
      {ic:"support",l:"الدعم الفني",a:openSupportChat},
      {ic:"privacy",l:"سياسة الخصوصية"},
    ]},
    ...(isOwner?[{title:"الإدارة",items:[{ic:"crown",l:"لوحة تحكم المالك",sub:"tsaxp",a:()=>window.open("/admin","_blank")}]}]:[]),
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",overflowY:"auto",height:"100%"}}>
      <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadPhoto(e.target.files[0])} onClick={e=>e.target.value=""}/>
      <div style={{background:`linear-gradient(160deg,${T.accent},#12243a)`,padding:"24px 16px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",flexShrink:0}}>
        <div style={{position:"relative",cursor:"pointer"}} onClick={()=>photoRef.current?.click()}>
          <Av name={userData?.displayName||""} color={userData?.color||rColor(userData?.displayName||"")} size={80} verified={userData?.verified} photo={userData?.photoURL}/>
          <div style={{position:"absolute",bottom:0,right:0,background:T.accentBtn,borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${T.accent}`,fontSize:"13px"}}>📷</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#fff",fontSize:"19px",fontWeight:"800",display:"flex",alignItems:"center",gap:"6px",justifyContent:"center"}}>
            {userData?.displayName}
            {userData?.verified&&<Ic n="check" s={15} c="#fff"/>}
            {isOwner&&<span style={{background:T.gold,color:"#000",fontSize:"9px",fontWeight:"800",borderRadius:"4px",padding:"1px 5px"}}>OWNER</span>}
          </div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:"13px"}}>@{userData?.username}</div>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:"12px",marginTop:"3px"}}>{userData?.bio||"لا توجد نبذة"}</div>
        </div>
      </div>
      {SECTIONS.map(group=>(
        <div key={group.title} style={{marginBottom:"6px"}}>
          <div style={{color:T.textSec,fontSize:"12px",fontWeight:"700",padding:"12px 16px 5px"}}>{group.title}</div>
          {group.custom?group.custom():group.items.map(item=>(
            <div key={item.l} onClick={item.a} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 16px",background:T.sidebar,cursor:item.a?"pointer":"default",borderBottom:`1px solid ${T.border}15`}}
              onMouseEnter={e=>{if(item.a)e.currentTarget.style.background=T.hover;}} onMouseLeave={e=>e.currentTarget.style.background=T.sidebar}>
              <div style={{width:"38px",height:"38px",borderRadius:"12px",background:`${T.accentBtn}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic n={item.ic} s={18} c={T.accentBtn}/></div>
              <div style={{flex:1}}>
                <div style={{color:T.text,fontSize:"14.5px"}}>{item.l}</div>
                {item.sub&&<div style={{color:T.textSec,fontSize:"12px"}}>{item.sub}</div>}
              </div>
              {item.a&&<Ic n="back" s={14} c={T.textSec}/>}
            </div>
          ))}
        </div>
      ))}
      <div style={{padding:"16px",textAlign:"center"}}>
        <button onClick={()=>signOut(auth)} style={{background:`${T.danger}15`,border:`1px solid ${T.danger}30`,borderRadius:"12px",padding:"13px",color:T.danger,cursor:"pointer",fontFamily:"inherit",fontWeight:"700",fontSize:"14px",width:"100%"}}>🚪 تسجيل الخروج</button>
        <div style={{color:T.textSec,fontSize:"11px",marginTop:"12px"}}>✈️ تيرمين v4.2</div>
      </div>
    </div>
  );
}

// ── MAIN APP ──
export default function App() {
  const [user,setUser]=useState(null);
  const [userData,setUserData]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [chats,setChats]=useState([]);
  const [activeChat,setActiveChat]=useState(null);
  const [activeChatData,setActiveChatData]=useState(null);
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [search,setSearch]=useState("");
  const [searchResults,setSearchResults]=useState([]);
  const [searchMode,setSearchMode]=useState(false);
  const [cachedUsers,setCachedUsers]=useState([]);
  const [cachedChats,setCachedChats]=useState([]);
  const [showMenu,setShowMenu]=useState(false);
  const [showSidebar,setShowSidebar]=useState(true);
  const [showEmoji,setShowEmoji]=useState(false);
  const [showInfo,setShowInfo]=useState(false);
  const [attachMenu,setAttachMenu]=useState(false);
  const [replyTo,setReplyTo]=useState(null);
  const [editingMsg,setEditingMsg]=useState(null);
  const [ctxMenu,setCtxMenu]=useState(null);
  const [modal,setModal]=useState(null);
  const [bottomTab,setBottomTab]=useState("chats");
  const [isMobile,setIsMobile]=useState(window.innerWidth<900);
  const [newForm,setNewForm]=useState({name:"",username:"",bio:"",photo:""});
  const [editProfile,setEditProfile]=useState({displayName:"",username:"",bio:"",photo:""});
  const [isOwner,setIsOwner]=useState(false);
  const [channelSettings,setChannelSettings]=useState(null);
  const [msgUnsub,setMsgUnsub]=useState(null);
  const [pinnedMsg,setPinnedMsg]=useState(null);
  const [profileViewer,setProfileViewer]=useState(null);
  const [reportTarget,setReportTarget]=useState(null);
  const [reactions,setReactions]=useState({});

  const endRef=useRef(null);
  const inputRef=useRef(null);
  const fileRef=useRef(null);
  const imgRef=useRef(null);

  // Init app data
  const initAppData=useCallback(async()=>{
    const chSnap=await get(ref(db,`chats/${APP_CHANNEL_ID}`));
    if(!chSnap.exists()){
      await set(ref(db,`chats/${APP_CHANNEL_ID}`),{id:APP_CHANNEL_ID,type:"channel",name:"تيرمين الرسمية",username:"termeen",bio:"القناة الرسمية لتطبيق تيرمين ✈️",verified:true,isOfficial:true,ownerId:"system",subscribers:APP_CHANNEL_SUBS,subscribersList:[],members:["system"],createdAt:Date.now(),photoURL:""});
      await set(ref(db,`chatUsernames/termeen`),APP_CHANNEL_ID);
    }
  },[]);

  useEffect(()=>{
    initAppData();
    const unsub=onAuthStateChanged(auth,async u=>{
      if(u){
        setUser(u);
        const snap=await get(ref(db,`users/${u.uid}`));
        if(snap.exists()){
          const d=snap.val();
          if(d.isBanned){await signOut(auth);setUser(null);setUserData(null);setAuthLoading(false);alert("تم حظر حسابك");return;}
          setUserData(d);
          setEditProfile({displayName:d.displayName||"",username:d.username||"",bio:d.bio||"",photo:d.photoURL||""});
          setIsOwner(d.username===OWNER_USERNAME);
        }
      } else {setUser(null);setUserData(null);setIsOwner(false);}
      setAuthLoading(false);
    });
    const onResize=()=>setIsMobile(window.innerWidth<900);
    window.addEventListener("resize",onResize);
    return()=>{unsub();window.removeEventListener("resize",onResize);};
  },[initAppData]);

  // Load chats
  useEffect(()=>{
    if(!user) return;
    const r=ref(db,`userChats/${user.uid}`);
    const unsub=onValue(r,async snap=>{
      if(!snap.exists()){setChats([]);return;}
      const raw=snap.val();
      const seen=new Set();
      const list=await Promise.all(Object.values(raw).map(async uc=>{
        const cid=uc.chatId;
        if(!cid||seen.has(cid)) return null;
        seen.add(cid);
        const cs=await get(ref(db,`chats/${cid}`));
        if(!cs.exists()) return null;
        return {...cs.val(),...uc,id:cid};
      }));
      setChats(list.filter(Boolean).sort((a,b)=>(b.order||0)-(a.order||0)));
    });
    return()=>off(r);
  },[user]);

  // Load messages + reactions
  useEffect(()=>{
    if(msgUnsub){msgUnsub();}
    if(!activeChat) return;
    const r=ref(db,`messages/${activeChat}`);
    const unsub=onValue(r,snap=>{
      if(!snap.exists()){setMessages([]);return;}
      const msgs=Object.values(snap.val()).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
      setMessages(msgs);
      // Find pinned
      const pinned=msgs.find(m=>m.pinned);
      setPinnedMsg(pinned||null);
    });
    setMsgUnsub(()=>()=>off(r));
    // Load reactions
    const rr=ref(db,`reactions/${activeChat}`);
    onValue(rr,snap=>{if(snap.exists())setReactions(snap.val());else setReactions({});});
    return()=>{off(r);off(rr);};
  },[activeChat]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  // Preload cache for instant search
  useEffect(()=>{
    if(!user) return;
    const loadCache=async()=>{
      const [uSnap,cSnap]=await Promise.all([get(ref(db,"users")),get(ref(db,"chats"))]);
      if(uSnap.exists()) setCachedUsers(Object.values(uSnap.val()));
      if(cSnap.exists()) setCachedChats(Object.values(cSnap.val()));
    };
    loadCache();
    const interval=setInterval(loadCache,30000);
    return()=>clearInterval(interval);
  },[user]);

  // Instant search
  useEffect(()=>{
    if(!search.trim()||!searchMode){setSearchResults([]);return;}
    const q=search.toLowerCase().replace("@","").trim();
    const results=[];
    cachedUsers.forEach(u=>{
      if(u.uid===user?.uid) return;
      const score=searchScore(u,q);
      if(score>0) results.push({...u,resultType:"user",_score:score});
    });
    cachedChats.forEach(c=>{
      if(!["channel","group","official_bot","bot"].includes(c.type)) return;
      const score=searchScore(c,q);
      if(score>0) results.push({...c,resultType:c.type,_score:score});
    });
    results.sort((a,b)=>b._score-a._score);
    setSearchResults(results.slice(0,25));
  },[search,searchMode,cachedUsers,cachedChats,user]);

  const openChat=useCallback(async(chatId,chatDataOverride=null)=>{
    setActiveChat(chatId);
    setShowInfo(false);setReplyTo(null);setEditingMsg(null);setShowMenu(false);setAttachMenu(false);
    setSearchMode(false);setSearch("");setModal(null);setCtxMenu(null);
    if(isMobile) setShowSidebar(false);
    const snap=await get(ref(db,`chats/${chatId}`));
    setActiveChatData(snap.exists()?snap.val():chatDataOverride);
    if(user) await update(ref(db,`userChats/${user.uid}/${chatId}`),{unread:0});
    setBottomTab("chats");
    setTimeout(()=>inputRef.current?.focus(),80);
  },[isMobile,user]);

  const openSupportChat=useCallback(async()=>{
    if(!user) return;
    const supId=`support_${user.uid}`;
    const snap=await get(ref(db,`chats/${supId}`));
    if(!snap.exists()){
      const cd={id:supId,type:"support",name:"الدعم الفني",isOfficial:true,members:[user.uid,SUPPORT_ID],createdAt:Date.now()};
      await set(ref(db,`chats/${supId}`),cd);
      await set(ref(db,`userChats/${user.uid}/${supId}`),{chatId:supId,lastMessage:"الدعم",lastTime:"",unread:0,order:Date.now(),type:"support",name:"الدعم الفني",color:"#4CAF50",subtitle:"الدعم"});
    }
    openChat(supId,{id:supId,type:"support",name:"الدعم الفني"});
  },[user,openChat]);

  const sendMessage=useCallback(async(overText=null,type="text",extra={})=>{
    const text=editingMsg?input.trim():(overText??input.trim());
    if(!text&&!extra.imageUrl&&!extra.fileName) return;
    if(!activeChat||!user||!userData) return;
    if(activeChatData?.type==="channel"&&activeChatData?.ownerId!==user.uid) return;
    // Edit mode
    if(editingMsg){
      await update(ref(db,`messages/${activeChat}/${editingMsg.id}`),{text,edited:true});
      setEditingMsg(null);setInput("");inputRef.current?.focus();return;
    }
    const msgId=uidGen();
    const msg={id:msgId,chatId:activeChat,text:text||"",from:user.uid,senderName:userData.displayName,senderUsername:userData.username,senderPhoto:userData.photoURL||"",senderColor:userData.color||rColor(userData.displayName),time:nowStr(),type,createdAt:Date.now(),replyTo:replyTo?{text:replyTo.text,sender:replyTo.senderName||"أنا",msgId:replyTo.id}:null,...extra};
    await set(ref(db,`messages/${activeChat}/${msgId}`),msg);
    const preview=type==="image"?"📷 صورة":type==="file"?`📎 ${msg.fileName}`:text;
    await update(ref(db,`userChats/${user.uid}/${activeChat}`),{lastMessage:preview,lastTime:nowStr(),order:Date.now()});
    if(activeChatData?.members){
      for(const mid of activeChatData.members){
        if(mid!==user.uid&&!mid.startsWith("bot_")&&mid!==SUPPORT_ID&&mid!==APP_BOT_ID){
          const mc=await get(ref(db,`userChats/${mid}/${activeChat}`));
          const u2c=mc.exists()?mc.val().unread||0:0;
          await update(ref(db,`userChats/${mid}/${activeChat}`),{lastMessage:preview,lastTime:nowStr(),unread:u2c+1,order:Date.now()});
        }
      }
    }
    // AI reply for support
    if(activeChatData?.type==="support"){
      setTimeout(async()=>{
        try {
          const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,system:"أنت مساعد دعم فني لتطبيق تيرمين. أجب باللغة العربية بشكل مفيد ومختصر. في نهاية ردك أضف: 'إذا أردت التحدث مع الدعم البشري اضغط زر التحويل في الأسفل.'",messages:[{role:"user",content:text}]})});
          const data=await res.json();
          const aiText=data.content?.[0]?.text||"شكراً لتواصلك! سيتم الرد قريباً.";
          const aiId=uidGen();
          await set(ref(db,`messages/${activeChat}/${aiId}`),{id:aiId,chatId:activeChat,text:aiText,from:SUPPORT_ID,senderName:"الدعم الفني",time:nowStr(),type:"text",isSupport:true,createdAt:Date.now()+500});
          await update(ref(db,`userChats/${user.uid}/${activeChat}`),{lastMessage:aiText.slice(0,50),lastTime:nowStr(),order:Date.now()+1});
          const tId=`ticket_${user.uid}`;
          await set(ref(db,`support/${tId}/info`),{userId:user.uid,username:userData.username,displayName:userData.displayName,status:"open",createdAt:Date.now()});
          const tmId=uidGen();await set(ref(db,`support/${tId}/messages/${tmId}`),{id:tmId,text,from:user.uid,time:nowStr(),createdAt:Date.now()});
          const trId=uidGen();await set(ref(db,`support/${tId}/messages/${trId}`),{id:trId,text:aiText,from:"ai_bot",time:nowStr(),createdAt:Date.now()+500});
        }catch{}
      },1200);
    }
    // BotFather
    if(activeChatData?.type==="official_bot"&&activeChatData?.username==="botfather") handleBotFatherMsg(text,activeChat);
    setInput("");setReplyTo(null);setShowEmoji(false);
    inputRef.current?.focus();
  },[input,activeChat,user,userData,replyTo,activeChatData,editingMsg]);

  const handleBotFatherMsg=useCallback(async(text,chatId)=>{
    const t=text.trim().toLowerCase();
    let reply="";
    if(t==="/start"||t==="مرحبا"||t==="hi"){
      reply="مرحباً! أنا BotFather ✈️\n\n/newbot — إنشاء بوت جديد\n/mybots — عرض بوتاتك\n\nاكتب الأمر للبدء!";
    } else if(t==="/newbot"||t.includes("جديد")){
      reply="أرسل اسم مستخدم للبوت:\n(يجب أن ينتهي بـ bot مثال: mybot_bot)";
    } else if(t.endsWith("bot")||t.endsWith("_bot")){
      const botUsername=t.replace("@","").toLowerCase();
      if(botUsername.length<5){reply="اسم البوت قصير جداً!"; }
      else {
        const token=`${Date.now()}:AAF${Math.random().toString(36).slice(2,20).toUpperCase()}`;
        const botId=uidGen();
        await set(ref(db,`bots/${botId}`),{id:botId,username:botUsername,name:botUsername,token,creatorId:user?.uid,createdAt:Date.now()});
        if(user?.uid) await set(ref(db,`userBots/${user.uid}/${botId}`),{id:botId,username:botUsername,token,createdAt:Date.now()});
        reply=`✅ تم إنشاء البوت!\n\n🤖 @${botUsername}\n🔑 التوكن:\n${token}\n\n⚠️ احتفظ بالتوكن في مكان آمن!`;
      }
    } else if(t==="/mybots"){
      if(user?.uid){
        const snap=await get(ref(db,`userBots/${user.uid}`));
        if(snap.exists()){
          const bots=Object.values(snap.val());
          reply=`🤖 بوتاتك (${bots.length}):\n\n${bots.map(b=>`• @${b.username}\n  ${b.token?.slice(0,25)}...`).join("\n\n")}`;
        } else reply="لا توجد بوتات. اكتب /newbot";
      }
    } else reply="أرسل /start للبدء\n/newbot — بوت جديد\n/mybots — بوتاتك";
    if(reply){
      setTimeout(async()=>{
        const rid=uidGen();
        await set(ref(db,`messages/${chatId}/${rid}`),{id:rid,chatId,text:reply,from:BOT_FATHER_ID,senderName:"BotFather",time:nowStr(),type:"text",isOfficialBot:true,createdAt:Date.now()+600});
        await update(ref(db,`userChats/${user?.uid}/${chatId}`),{lastMessage:reply.slice(0,40),lastTime:nowStr(),order:Date.now()+1});
      },800);
    }
  },[user]);

  const escalateToHuman=useCallback(async()=>{
    if(!activeChat||!user) return;
    const ticketNum=`TKT-${Date.now().toString().slice(-6)}`;
    const mid=uidGen();
    await set(ref(db,`messages/${activeChat}/${mid}`),{id:mid,chatId:activeChat,text:`📋 تم إرسال طلبك للدعم البشري.\n🎫 رقم الطلب: ${ticketNum}\nسيتم الرد قريباً ✅`,from:SUPPORT_ID,senderName:"الدعم الفني",time:nowStr(),type:"system_info",isSupport:true,createdAt:Date.now()});
    await update(ref(db,`support/ticket_${user.uid}/info`),{status:"awaiting_human",ticketNum});
  },[activeChat,user]);

  const addReaction=useCallback(async(msgId,emoji)=>{
    if(!user||!activeChat) return;
    const rPath=`reactions/${activeChat}/${msgId}/${emoji}`;
    const snap=await get(ref(db,rPath));
    if(snap.exists()){
      const users=snap.val();
      if(users[user.uid]){await remove(ref(db,`${rPath}/${user.uid}`));}
      else {await set(ref(db,`${rPath}/${user.uid}`),true);}
    } else {await set(ref(db,`${rPath}/${user.uid}`),true);}
    setCtxMenu(null);
  },[user,activeChat]);

  const pinMessage=useCallback(async(msg)=>{
    if(!activeChat) return;
    // Unpin all first
    const snap=await get(ref(db,`messages/${activeChat}`));
    if(snap.exists()){
      const batch=[];
      Object.values(snap.val()).forEach(m=>{if(m.pinned)batch.push(update(ref(db,`messages/${activeChat}/${m.id}`),{pinned:false}));});
      await Promise.all(batch);
    }
    // Pin this message
    await update(ref(db,`messages/${activeChat}/${msg.id}`),{pinned:true});
    setCtxMenu(null);
  },[activeChat]);

  const sendReport=useCallback(async(reason,note)=>{
    if(!user||!reportTarget) return;
    const rid=uidGen();
    await set(ref(db,`reports/${rid}`),{id:rid,reason,note,reporterId:user.uid,reporterUsername:userData?.username,targetType:reportTarget.type||"message",targetId:reportTarget.id,targetChatId:activeChat,createdAt:Date.now(),status:"pending"});
    setReportTarget(null);
    alert("✅ تم إرسال البلاغ. شكراً لمساعدتنا.");
  },[user,userData,reportTarget,activeChat]);

  const openMentionProfile=useCallback(async(username)=>{
    const snap=await get(ref(db,`usernames/${username.toLowerCase()}`));
    if(snap.exists()){
      const uid2=snap.val();
      const uSnap=await get(ref(db,`users/${uid2}`));
      if(uSnap.exists()) setProfileViewer(uSnap.val());
    } else {
      // Check if it's a channel/group
      const cSnap=await get(ref(db,`chatUsernames/${username.toLowerCase()}`));
      if(cSnap.exists()){
        const chatId=cSnap.val();
        const chSnap=await get(ref(db,`chats/${chatId}`));
        if(chSnap.exists()) setProfileViewer(chSnap.val());
      }
    }
  },[]);

  const handleFile=useCallback((file,isImg)=>{
    if(!file) return;
    const reader=new FileReader();
    reader.onload=e=>{
      if(isImg) sendMessage("","image",{imageUrl:e.target.result,fileName:file.name,fileSize:file.size});
      else sendMessage("","file",{fileName:file.name,fileSize:file.size,fileData:e.target.result});
    };
    reader.readAsDataURL(file);
    setAttachMenu(false);
  },[sendMessage]);

  const saveProfile=useCallback(async()=>{
    if(!user) return;
    if(editProfile.username!==userData?.username){
      if(editProfile.username.length<5){alert("اسم المستخدم 5 أحرف على الأقل");return;}
      if(/^\d/.test(editProfile.username)){alert("اسم المستخدم لا يبدأ برقم");return;}
      const [usSnap,cSnap]=await Promise.all([get(ref(db,`usernames/${editProfile.username.toLowerCase()}`)),get(ref(db,`chatUsernames/${editProfile.username.toLowerCase()}`))]);
      if((usSnap.exists()&&usSnap.val()!==user.uid)||cSnap.exists()){alert(`اسم المستخدم @${editProfile.username} مأخوذ مسبقاً`);return;}
      if(userData?.username) await remove(ref(db,`usernames/${userData.username}`));
      await set(ref(db,`usernames/${editProfile.username.toLowerCase()}`),user.uid);
    }
    await update(ref(db,`users/${user.uid}`),{displayName:editProfile.displayName,username:editProfile.username.toLowerCase(),bio:editProfile.bio,photoURL:editProfile.photo});
    await updateProfile(user,{displayName:editProfile.displayName});
    const snap=await get(ref(db,`users/${user.uid}`));
    if(snap.exists())setUserData(snap.val());
    setModal(null);
  },[user,userData,editProfile]);

  const createConvo=useCallback(async(type)=>{
    if(!newForm.name.trim()||!user||!userData) return;
    if(!newForm.username.trim()){alert("يجب إدخال اسم مستخدم");return;}
    if(newForm.username.length<5){alert("اسم المستخدم 5 أحرف على الأقل");return;}
    if(/^\d/.test(newForm.username)){alert("اسم المستخدم لا يبدأ برقم");return;}
    if(!/^[a-zA-Z][a-zA-Z0-9_]{4,}$/.test(newForm.username)){alert("حروف وأرقام فقط، يبدأ بحرف");return;}
    const [uCheck,cCheck]=await Promise.all([get(ref(db,`usernames/${newForm.username.toLowerCase()}`)),get(ref(db,`chatUsernames/${newForm.username.toLowerCase()}`))]);
    if(uCheck.exists()){alert(`اسم المستخدم @${newForm.username} مأخوذ مسبقاً`);return;}
    if(cCheck.exists()){alert(`اسم المستخدم @${newForm.username} مستخدم في قناة أو مجموعة أخرى`);return;}
    const chatId=uidGen();
    const chatData={id:chatId,type,name:newForm.name.trim(),username:newForm.username.toLowerCase(),bio:newForm.bio||"",photoURL:"",ownerId:user.uid,members:[user.uid],admins:[user.uid],verified:false,createdAt:Date.now(),...(type==="channel"?{subscribers:1,subscribersList:[user.uid]}:{})};
    await set(ref(db,`chats/${chatId}`),chatData);
    await set(ref(db,`chatUsernames/${newForm.username.toLowerCase()}`),chatId);
    await set(ref(db,`userChats/${user.uid}/${chatId}`),{chatId,lastMessage:"تم الإنشاء",lastTime:nowStr(),unread:0,order:Date.now(),...chatData});
    const wid=uidGen();
    await set(ref(db,`messages/${chatId}/${wid}`),{id:wid,chatId,text:`🎉 تم إنشاء ${type==="channel"?"القناة":"المجموعة"} "${newForm.name}"`,from:"system",time:nowStr(),type:"system",createdAt:Date.now()});
    setModal(null);setNewForm({name:"",username:"",bio:"",photo:""});
    openChat(chatId,chatData);
  },[newForm,user,userData,openChat]);

  const joinChannel=useCallback(async chat=>{
    if(!user) return;
    const chatId=chat.id||chat.chatId;
    const already=chats.find(c=>(c.id||c.chatId)===chatId);
    if(already){openChat(chatId,chat);return;}
    const newList=[...(chat.subscribersList||[])];
    if(!newList.includes(user.uid)) newList.push(user.uid);
    const newMembers=[...(chat.members||[])];
    if(!newMembers.includes(user.uid)) newMembers.push(user.uid);
    await update(ref(db,`chats/${chatId}`),{subscribers:newList.length,subscribersList:newList,members:newMembers});
    await set(ref(db,`userChats/${user.uid}/${chatId}`),{chatId,lastMessage:chat.lastMessage||"",lastTime:nowStr(),unread:0,order:Date.now(),...chat,id:chatId});
    openChat(chatId,{...chat,subscribers:newList.length,members:newMembers});
  },[user,chats,openChat]);

  const openPrivateChat=useCallback(async targetUser=>{
    if(!user||!targetUser?.uid||targetUser.uid===user.uid) return;
    const chatId=`pm_${[user.uid,targetUser.uid].sort().join("_")}`;
    const snap=await get(ref(db,`chats/${chatId}`));
    if(!snap.exists()){
      const cd={id:chatId,type:"private",name:targetUser.displayName,members:[user.uid,targetUser.uid],createdAt:Date.now(),color:targetUser.color||rColor(targetUser.displayName),photoURL:targetUser.photoURL||""};
      await set(ref(db,`chats/${chatId}`),cd);
      await set(ref(db,`userChats/${user.uid}/${chatId}`),{chatId,lastMessage:"",lastTime:"",unread:0,order:Date.now(),...cd});
      await set(ref(db,`userChats/${targetUser.uid}/${chatId}`),{chatId,lastMessage:"",lastTime:"",unread:0,order:Date.now(),...cd});
    }
    setSearchMode(false);setSearch("");setModal(null);setProfileViewer(null);
    openChat(chatId,snap.exists()?snap.val():{id:chatId,type:"private",name:targetUser.displayName,color:targetUser.color,photoURL:targetUser.photoURL});
  },[user,openChat]);

  const updateChannelSettings=useCallback(async()=>{
    if(!channelSettings) return;
    await update(ref(db,`chats/${channelSettings.id}`),{name:channelSettings.name,bio:channelSettings.bio||"",username:(channelSettings.username||"").toLowerCase(),photoURL:channelSettings.photoURL||"",permissions:channelSettings.permissions||{}});
    if(channelSettings.username) await set(ref(db,`chatUsernames/${channelSettings.username.toLowerCase()}`),channelSettings.id);
    const snap=await get(ref(db,`chats/${channelSettings.id}`));
    if(snap.exists()) setActiveChatData(snap.val());
    setModal(null);alert("✅ تم حفظ إعدادات القناة");
  },[channelSettings]);

  const openBotFather=useCallback(async()=>{
    if(!user) return;
    const bfId=`botfather_${user.uid}`;
    const snap=await get(ref(db,`chats/${bfId}`));
    if(!snap.exists()){
      const cd={id:bfId,type:"official_bot",name:"BotFather",username:"botfather",isOfficial:true,verified:true,members:[user.uid,BOT_FATHER_ID],createdAt:Date.now(),photoURL:""};
      await set(ref(db,`chats/${bfId}`),cd);
      await set(ref(db,`userChats/${user.uid}/${bfId}`),{chatId:bfId,lastMessage:"أنشئ بوتك الآن",lastTime:nowStr(),unread:1,order:Date.now(),type:"official_bot",name:"BotFather",verified:true,color:"#9C27B0"});
      const wid=uidGen();
      await set(ref(db,`messages/${bfId}/${wid}`),{id:wid,chatId:bfId,text:"مرحباً! أنا BotFather ✈️\n\n/newbot — إنشاء بوت (الاسم يجب أن ينتهي بـ bot)\n/mybots — عرض بوتاتك",from:BOT_FATHER_ID,senderName:"BotFather",time:nowStr(),type:"text",isOfficialBot:true,createdAt:Date.now()});
    }
    openChat(bfId,{id:bfId,type:"official_bot",name:"BotFather",username:"botfather",verified:true});
    setModal(null);setShowMenu(false);
  },[user,openChat]);

  const EMOJIS=["😀","😂","😍","😊","🥳","😎","🤩","😭","😤","🥺","❤️","🔥","💯","⭐","🎉","👍","👋","🙏","💪","✅","🚀","💡","🎵","🌟","😅","🤔","💬","📱","🎯","🏆","💎","🌈","🎁","🍕","☕","🌸","🦋","🎮","📸","🔑"];
  const REACT_EMOJIS=["❤️","👍","😂","😮","😢","🔥","🎉","👎"];

  const isChannel=activeChatData?.type==="channel";
  const isGroup=activeChatData?.type==="group";
  const isOfficialBot=activeChatData?.type==="official_bot";
  const isSaved=activeChatData?.type==="saved";
  const isSupport=activeChatData?.type==="support";
  const isMine=activeChatData?.ownerId===user?.uid;
  const canSend=!isChannel||(isChannel&&isMine);
  const chatName=activeChatData?.name||"محادثة";
  const chatType=activeChatData?.type;
  const isAdminOfChat=isMine||(activeChatData?.admins||[]).includes(user?.uid);

  // Context menu actions
  const ctxActions=ctxMenu?[
    {l:"↩ ردّ",ic:"back",a:()=>{setReplyTo(ctxMenu.msg);setCtxMenu(null);}},
    {l:"⎘ نسخ",a:()=>{navigator.clipboard?.writeText(ctxMenu.msg?.text||"");setCtxMenu(null);}},
    ...(ctxMenu.msg?.from===user?.uid&&!ctxMenu.msg?.isOfficialBot?[{l:"✏️ تعديل",a:()=>{setEditingMsg(ctxMenu.msg);setInput(ctxMenu.msg.text||"");setCtxMenu(null);inputRef.current?.focus();}}]:[]),
    ...(isAdminOfChat||ctxMenu.msg?.from===user?.uid?[{l:"📌 تثبيت",a:()=>pinMessage(ctxMenu.msg)}]:[]),
    {l:"🔗 نسخ الرابط",a:()=>{navigator.clipboard?.writeText(`Termin/${activeChatData?.username||activeChat}/${ctxMenu.msg?.id}`);setCtxMenu(null);alert("تم نسخ الرابط!");}},
    {l:"🔖 حفظ",a:async()=>{const s=chats.find(c=>c.type==="saved");if(s){const id=uidGen();await set(ref(db,`messages/${s.chatId||s.id}/${id}`),{...ctxMenu.msg,id,chatId:s.chatId||s.id,createdAt:Date.now()+1});}setCtxMenu(null);}},
    ...(isChannel||isGroup?[{l:"🚩 بلاغ",a:()=>{setReportTarget(ctxMenu.msg);setCtxMenu(null);},danger:true}]:[]),
    ...(ctxMenu.msg?.from===user?.uid?[{l:"🗑 حذف",a:async()=>{if(activeChat)await remove(ref(db,`messages/${activeChat}/${ctxMenu.msg.id}`));setCtxMenu(null);},danger:true}]:[]),
  ]:[];

  const renderSearch=()=>(
    <div style={{overflowY:"auto",flex:1}}>
      {!searchResults.length&&search.trim()&&<div style={{padding:"40px",textAlign:"center",color:T.textSec,fontSize:"14px"}}>لا توجد نتائج لـ "{search}"</div>}
      {searchResults.map((r,i)=>{
        const isU=r.resultType==="user";
        const isCh=r.resultType==="channel";
        const isBot=r.resultType==="official_bot"||r.resultType==="bot";
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${T.border}18`}}
            onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            onClick={()=>{
              if(isU){openPrivateChat(r);}
              else if(isCh){joinChannel(r);}
              else {openChat(r.id,r);}
              setSearchMode(false);setSearch("");
            }}>
            <Av name={r.name||r.displayName} color={r.color||rColor(r.name||r.displayName)} size={46} verified={r.verified} photo={r.photoURL} fraud={r.isFraud}
              onClick={e=>{e.stopPropagation();setProfileViewer(r);}}/>
            <div style={{flex:1}}>
              <div style={{color:T.text,fontWeight:"600",fontSize:"14.5px",display:"flex",alignItems:"center",gap:"5px"}}>
                {isCh&&<Ic n="channel" s={12} c={T.gold}/>}
                {r.resultType==="group"&&<Ic n="group" s={12} c={T.accentBtn}/>}
                {isBot&&<span style={{fontSize:"12px"}}>🤖</span>}
                {r.name||r.displayName}
                {(r.verified||r.isOfficial)&&<Ic n="check" s={12} c={T.verified}/>}
              </div>
              <div style={{color:T.textSec,fontSize:"12px"}}>@{r.username} · {isCh?`${fmtSubs(r.subscribers||0)} مشترك`:r.resultType==="group"?`${r.members?.length||0} عضو`:"مستخدم"}</div>
            </div>
            {isCh&&!chats.find(c=>(c.id||c.chatId)===r.id)&&(
              <button onClick={e=>{e.stopPropagation();joinChannel(r);}} style={{background:`${T.accentBtn}20`,border:`1px solid ${T.accentBtn}40`,borderRadius:"8px",padding:"6px 12px",color:T.accentBtn,cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:"600"}}>انضمام</button>
            )}
          </div>
        );
      })}
    </div>
  );

  if(authLoading) return (
    <div style={{height:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",fontFamily:"'Segoe UI',Tahoma,sans-serif"}}>
      <div style={{fontSize:"56px",animation:"spin 1.2s linear infinite"}}>✈️</div>
      <div style={{color:T.text,fontSize:"22px",fontWeight:"900"}}>تيرمين</div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0}`}</style>
    </div>
  );

  if(!user) return <AuthScreen/>;

  return (
    <div style={{display:"flex",height:"100vh",width:"100%",background:T.bg,fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl",overflow:"hidden"}}
      onClick={()=>{setShowMenu(false);setAttachMenu(false);setCtxMenu(null);setShowEmoji(false);}}>

      {/* Profile Viewer */}
      {profileViewer&&<ProfileViewer profile={profileViewer} onClose={()=>setProfileViewer(null)} onChat={openPrivateChat} currentUser={user} chats={chats}/>}

      {/* Report Modal */}
      {reportTarget&&<ReportModal onClose={()=>setReportTarget(null)} onReport={sendReport}/>}

      {/* SIDEBAR */}
      <div style={{width:showSidebar?(isMobile?"100%":"360px"):"0",minWidth:0,background:T.sidebar,borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden",transition:"width 0.25s",position:isMobile?"absolute":"relative",height:"100%",zIndex:isMobile?20:1}}>
        <div style={{padding:"10px 12px",display:"flex",alignItems:"center",gap:"8px",borderBottom:`1px solid ${T.border}`,background:T.sidebar,position:"relative",zIndex:50}}>
          {bottomTab==="chats"&&(<>
            <button onClick={e=>{e.stopPropagation();setShowMenu(!showMenu);}} style={{background:"none",border:"none",cursor:"pointer",padding:"6px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="menu" s={20}/></button>
            <div style={{flex:1,display:"flex",alignItems:"center",background:T.inputBg,borderRadius:"22px",padding:"7px 14px",gap:"8px"}} onClick={()=>setSearchMode(true)}>
              <Ic n="search" s={15}/>
              <input value={search} onChange={e=>{setSearch(e.target.value);setSearchMode(true);}} onFocus={()=>setSearchMode(true)} placeholder="بحث فوري..." style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"14px",flex:1,direction:"rtl",fontFamily:"inherit"}}/>
              {search&&<button onClick={()=>{setSearch("");setSearchMode(false);}} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={14}/></button>}
            </div>
          </>)}
          {bottomTab!=="chats"&&<div style={{flex:1,color:T.text,fontSize:"16px",fontWeight:"800",paddingRight:"6px"}}>{bottomTab==="settings"?"الإعدادات":bottomTab==="contacts"?"جهات الاتصال":""}</div>}
          {showMenu&&(
            <div style={{position:"absolute",top:"54px",right:"8px",background:"#1c2d3d",borderRadius:"13px",padding:"6px 0",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:300,minWidth:"210px",border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
              {[
                {n:"user",l:"محادثة جديدة",a:()=>{setModal("newChat");setShowMenu(false);}},
                {n:"group",l:"مجموعة جديدة",a:()=>{setModal("newGroup");setShowMenu(false);}},
                {n:"channel",l:"قناة جديدة",a:()=>{setModal("newChannel");setShowMenu(false);}},
                {n:"bot",l:"BotFather",a:openBotFather},
                {n:"saved",l:"رسائل محفوظة",a:()=>{const s=chats.find(c=>c.type==="saved");if(s)openChat(s.chatId||s.id,s);setShowMenu(false);}},
                {n:"support",l:"الدعم الفني",a:()=>{openSupportChat();setShowMenu(false);}},
                {n:"settings",l:"الإعدادات",a:()=>{setBottomTab("settings");setShowMenu(false);}},
                ...(isOwner?[{n:"crown",l:"لوحة الإدارة",a:()=>{window.open("/admin","_blank");setShowMenu(false);}}]:[]),
              ].map(item=>(
                <button key={item.l} onClick={item.a} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"11px 16px",background:"none",border:"none",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"14px"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <Ic n={item.n} s={18} c={T.accentBtn}/>{item.l}
                </button>
              ))}
            </div>
          )}
        </div>

        {bottomTab==="chats"&&!searchMode&&(
          <div style={{padding:"5px 14px 2px",display:"flex",alignItems:"center",gap:"7px"}}>
            <span style={{fontSize:"15px"}}>✈️</span>
            <span style={{color:T.accentBtn,fontWeight:"900",fontSize:"15px",letterSpacing:"1.5px"}}>تيرمين</span>
            {isOwner&&<span style={{background:T.gold,color:"#000",fontSize:"9px",fontWeight:"800",borderRadius:"4px",padding:"1px 5px"}}>OWNER</span>}
          </div>
        )}

        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          {bottomTab==="settings"&&<SettingsPanel user={user} userData={userData} setUserData={setUserData} isOwner={isOwner} openSupportChat={openSupportChat} setModal={setModal} db={db}/>}
          {bottomTab==="contacts"&&(
            <div style={{padding:"12px"}}>
              {chats.filter(c=>c.type==="private").map(c=>(
                <div key={c.id||c.chatId} onClick={()=>openChat(c.chatId||c.id,c)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px",borderRadius:"12px",cursor:"pointer",marginBottom:"4px"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <Av name={c.name} color={c.color||rColor(c.name)} size={44}/>
                  <div style={{color:T.text,fontWeight:"600",fontSize:"14px"}}>{c.name}</div>
                </div>
              ))}
            </div>
          )}
          {bottomTab==="chats"&&(searchMode&&search?renderSearch():(
            <div>
              {!chats.length&&<div style={{padding:"40px",textAlign:"center",color:T.textSec,fontSize:"14px"}}>لا توجد محادثات بعد</div>}
              {chats.map(chat=>{
                const cid=chat.id||chat.chatId;
                const isActive=activeChat===cid;
                const name=chat.name||"محادثة";
                const isOB=chat.type==="official_bot";
                const isSup=chat.type==="support";
                return (
                  <div key={cid} onClick={()=>openChat(cid,chat)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"9px 14px",cursor:"pointer",background:isActive?T.accent:"transparent",borderBottom:`1px solid ${T.border}18`}}
                    onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=T.hover;}} onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
                    <Av name={name} color={chat.color||rColor(name)} size={52} online={chat.type==="private"} verified={chat.verified||isOB} photo={chat.photoURL}
                      onClick={e=>{e.stopPropagation();setProfileViewer(chat.type==="private"?{displayName:name,username:chat.username,photoURL:chat.photoURL,color:chat.color,bio:""}:chat);}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{color:T.text,fontWeight:"600",fontSize:"15px",display:"flex",alignItems:"center",gap:"4px"}}>
                          {chat.type==="channel"&&<Ic n="channel" s={11} c={T.gold}/>}
                          {chat.type==="group"&&<Ic n="group" s={11} c={T.accentBtn}/>}
                          {chat.type==="saved"&&<Ic n="saved" s={11} c={T.accentBtn}/>}
                          {isOB&&<span style={{fontSize:"11px"}}>✈️</span>}
                          {isSup&&<span style={{fontSize:"11px"}}>🆘</span>}
                          <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"150px"}}>{name}</span>
                          {(chat.verified||isOB)&&<Ic n="check" s={11} c={T.verified}/>}
                        </span>
                        <span style={{color:T.textSec,fontSize:"11px",flexShrink:0}}>{chat.lastTime}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"2px"}}>
                        <span style={{color:T.textSec,fontSize:"13px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"180px"}}>{isSup?"الدعم":chat.lastMessage}</span>
                        {chat.unread>0&&<span style={{background:T.unread,color:"#fff",borderRadius:"12px",minWidth:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",padding:"0 5px"}}>{chat.unread>99?"99+":chat.unread}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {bottomTab==="chats"&&!searchMode&&(
          <div style={{padding:"8px 14px 5px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"flex-end",background:T.sidebar}}>
            <button onClick={e=>{e.stopPropagation();setModal("fabMenu");}} style={{background:T.accentBtn,border:"none",borderRadius:"50%",width:"46px",height:"46px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 14px rgba(82,136,193,0.45)"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              <Ic n="plus" s={22} c="#fff"/>
            </button>
          </div>
        )}

        <div style={{display:"flex",background:T.tabBar,borderTop:`1px solid ${T.border}`,padding:"6px 0"}}>
          {[{k:"chats",n:"menu",l:"المحادثات"},{k:"contacts",n:"contacts",l:"جهات الاتصال"},{k:"settings",n:"settings",l:"الإعدادات"}].map(tab=>(
            <button key={tab.k} onClick={()=>{setBottomTab(tab.k);setSearchMode(false);setSearch("");}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",background:"none",border:"none",cursor:"pointer",padding:"6px 4px"}}>
              <Ic n={tab.n} s={22} c={bottomTab===tab.k?T.accentBtn:T.textSec}/>
              <span style={{color:bottomTab===tab.k?T.accentBtn:T.textSec,fontSize:"10px",fontWeight:bottomTab===tab.k?"700":"400"}}>{tab.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {!activeChat?(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",padding:"40px"}}>
            <div style={{fontSize:"72px"}}>✈️</div>
            <div style={{textAlign:"center"}}>
              <div style={{color:T.text,fontSize:"26px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div>
              <div style={{color:T.textSec,fontSize:"13px",marginTop:"6px"}}>اختر محادثة للبدء</div>
            </div>
          </div>
        ):(
          <>
            {/* Header */}
            <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px",background:T.sidebar,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
              {isMobile&&<button onClick={()=>{setShowSidebar(true);setActiveChat(null);setActiveChatData(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px",display:"flex"}}><Ic n="back" s={22}/></button>}
              <div style={{display:"flex",alignItems:"center",gap:"11px",flex:1,cursor:"pointer"}} onClick={()=>setProfileViewer(activeChatData)}>
                <Av name={chatName} color={activeChatData?.color||rColor(chatName)} size={40} online={chatType==="private"} verified={activeChatData?.verified||isOfficialBot} photo={activeChatData?.photoURL}/>
                <div>
                  <div style={{color:T.text,fontWeight:"700",fontSize:"15px",display:"flex",alignItems:"center",gap:"5px"}}>
                    {chatName}
                    {(activeChatData?.verified||isOfficialBot)&&<Ic n="check" s={13} c={T.verified}/>}
                  </div>
                  <div style={{color:T.textSec,fontSize:"12px"}}>
                    {isSaved?"رسائلك المحفوظة":isSupport?"الدعم":isOfficialBot?"✈️ مساعد رسمي":isGroup?`${activeChatData?.members?.length||0} عضو`:isChannel?`${fmtSubs(activeChatData?.subscribers||0)} مشترك`:""}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:"2px"}}>
                {!isOfficialBot&&!isSaved&&!isSupport&&<button style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="call" s={20}/></button>}
                <button style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="search" s={20}/></button>
                <button onClick={e=>{e.stopPropagation();if(isChannel&&isMine){setChannelSettings({...activeChatData});setModal("channelSettings");}else setShowInfo(!showInfo);}} style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="more" s={20}/></button>
              </div>
            </div>

            {/* Pinned Message */}
            {pinnedMsg&&(
              <div style={{padding:"8px 14px",background:T.panel,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:"10px",cursor:"pointer"}} onClick={()=>{const el=document.getElementById(`msg_${pinnedMsg.id}`);el?.scrollIntoView({behavior:"smooth"});}}>
                <Ic n="pin" s={16} c={T.accentBtn}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:T.accentBtn,fontSize:"11px",fontWeight:"700"}}>رسالة مثبّتة</div>
                  <div style={{color:T.textSec,fontSize:"12.5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pinnedMsg.text}</div>
                </div>
                {isAdminOfChat&&<button onClick={e=>{e.stopPropagation();update(ref(db,`messages/${activeChat}/${pinnedMsg.id}`),{pinned:false});}} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={14}/></button>}
              </div>
            )}

            {/* Reply/Edit Banner */}
            {(replyTo||editingMsg)&&(
              <div style={{padding:"7px 16px",background:T.panel,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:"3px",height:"30px",background:editingMsg?T.gold:T.accentBtn,borderRadius:"2px",flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:editingMsg?T.gold:T.accentBtn,fontSize:"11.5px",fontWeight:"700"}}>{editingMsg?"✏️ تعديل الرسالة":(replyTo?.senderName||"أنت")}</div>
                  <div style={{color:T.textSec,fontSize:"12.5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{editingMsg?editingMsg.text:replyTo?.text}</div>
                </div>
                <button onClick={()=>{setReplyTo(null);setEditingMsg(null);setInput("");}} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={15}/></button>
              </div>
            )}

            {/* Messages */}
            <div style={{flex:1,overflowY:"auto",padding:"12px 16px",background:T.bg,display:"flex",flexDirection:"column",gap:"2px"}}>
              {!messages.length&&<div style={{margin:"auto",textAlign:"center",color:T.textSec}}><div style={{fontSize:"40px",marginBottom:"10px"}}>{isSaved?"🔖":isSupport?"🆘":isOfficialBot?"✈️":"👋"}</div><div style={{fontSize:"14px"}}>{isSaved?"لا توجد رسائل محفوظة":isSupport?"اكتب مشكلتك وسيرد الذكاء الاصطناعي فوراً":"ابدأ المحادثة!"}</div></div>}
              {messages.map((msg,idx)=>{
                const isMe=msg.from===user?.uid;
                const isSystem=msg.type==="system"||msg.type==="system_info";
                const isOB=msg.isOfficialBot||msg.from===APP_BOT_ID||msg.from===BOT_FATHER_ID;
                const isSup=msg.isSupport||msg.from===SUPPORT_ID;
                const showSender=!isMe&&isGroup&&(idx===0||messages[idx-1]?.from!==msg.from);
                const msgReactions=reactions[msg.id]||{};
                if(isSystem) return <div key={msg.id} id={`msg_${msg.id}`} style={{textAlign:"center",margin:"6px 0"}}><span style={{background:`${T.accentBtn}20`,color:T.textSec,borderRadius:"12px",padding:"4px 14px",fontSize:"12px"}}>{msg.text}</span></div>;
                return (
                  <div key={msg.id} id={`msg_${msg.id}`} style={{display:"flex",justifyContent:isMe?"flex-start":"flex-end",marginBottom:"2px",animation:"msgIn 0.2s ease"}}
                    onContextMenu={e=>{e.preventDefault();e.stopPropagation();setCtxMenu({x:Math.min(e.clientX,window.innerWidth-200),y:Math.min(e.clientY,window.innerHeight-300),msg});}}>
                    {/* Sender avatar for groups */}
                    {!isMe&&isGroup&&showSender&&(
                      <div style={{flexShrink:0,marginLeft:"6px",marginTop:"auto"}}>
                        <Av name={msg.senderName} color={msg.senderColor||rColor(msg.senderName)} size={28} photo={msg.senderPhoto} onClick={()=>{const u2=cachedUsers.find(u=>u.uid===msg.from);if(u2)setProfileViewer(u2);}}/>
                      </div>
                    )}
                    <div style={{maxWidth:"72%"}}>
                      <div style={{padding:"8px 11px 5px",borderRadius:isMe?"16px 16px 16px 4px":"16px 16px 4px 16px",background:isMe?T.msgOut:isOB||isSup?"#1a3040":T.msgIn,boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>
                        {showSender&&<div style={{color:msg.senderColor||T.accentBtn,fontSize:"12px",fontWeight:"700",marginBottom:"3px",cursor:"pointer"}} onClick={()=>{const u2=cachedUsers.find(u=>u.uid===msg.from);if(u2)setProfileViewer(u2);}}>{msg.senderName}</div>}
                        {(isOB||isSup)&&!isMe&&<div style={{color:T.gold,fontSize:"11px",fontWeight:"700",marginBottom:"3px",display:"flex",alignItems:"center",gap:"4px"}}><Ic n="check" s={11} c={T.gold}/>⭐ {msg.senderName}</div>}
                        {msg.replyTo&&<div style={{background:"rgba(255,255,255,0.07)",borderRadius:"8px",padding:"5px 10px",marginBottom:"6px",borderRight:`3px solid ${T.accentBtn}`}}><div style={{color:T.accentBtn,fontSize:"11px",fontWeight:"700"}}>{msg.replyTo.sender}</div><div style={{color:T.textSec,fontSize:"12px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"200px"}}>{msg.replyTo.text}</div></div>}
                        {msg.type==="image"&&<div style={{marginBottom:"4px"}}><img src={msg.imageUrl} alt="" style={{maxWidth:"240px",maxHeight:"280px",borderRadius:"10px",display:"block",width:"100%",objectFit:"cover"}}/>{msg.text&&<ParsedText text={msg.text} onMentionClick={openMentionProfile} style={{color:T.text,fontSize:"14px",display:"block",marginTop:"5px"}}/>}</div>}
                        {msg.type==="file"&&<a href={msg.fileData} download={msg.fileName} style={{display:"flex",alignItems:"center",gap:"10px",textDecoration:"none",background:"rgba(255,255,255,0.07)",borderRadius:"10px",padding:"10px 12px",marginBottom:"4px"}}><Ic n="file" s={26} c={T.accentBtn}/><div><div style={{color:T.text,fontSize:"13px",fontWeight:"600",wordBreak:"break-all"}}>{msg.fileName}</div><div style={{color:T.textSec,fontSize:"11px"}}>{fmtSize(msg.fileSize)}</div></div></a>}
                        {(msg.type==="text"||!msg.type)&&<ParsedText text={msg.text} onMentionClick={openMentionProfile} style={{color:T.text,fontSize:"14.5px",lineHeight:"1.55",wordBreak:"break-word",whiteSpace:"pre-wrap",display:"block"}}/>}
                        <div style={{display:"flex",justifyContent:"flex-start",alignItems:"center",gap:"4px",marginTop:"3px"}}>
                          <span style={{color:T.textSec,fontSize:"10.5px"}}>{msg.time}{msg.edited&&" (معدّل)"}</span>
                          {isMe&&<Ic n="checks" s={13} c={T.accentBtn}/>}
                          {msg.pinned&&<Ic n="pin" s={11} c={T.gold}/>}
                        </div>
                      </div>
                      {/* Reactions */}
                      {Object.keys(msgReactions).length>0&&(
                        <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginTop:"4px",justifyContent:isMe?"flex-start":"flex-end"}}>
                          {Object.entries(msgReactions).map(([emoji,users])=>{
                            const count=Object.keys(users).length;
                            const iReacted=users[user?.uid];
                            return count>0?(
                              <button key={emoji} onClick={()=>addReaction(msg.id,emoji)} style={{background:iReacted?`${T.accentBtn}30`:"rgba(255,255,255,0.08)",border:`1px solid ${iReacted?T.accentBtn:"rgba(255,255,255,0.12)"}`,borderRadius:"12px",padding:"3px 8px",cursor:"pointer",fontSize:"13px",color:T.text,display:"flex",alignItems:"center",gap:"4px"}}>
                                {emoji} <span style={{fontSize:"11px",color:iReacted?T.accentBtn:T.textSec}}>{count}</span>
                              </button>
                            ):null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef}/>
            </div>

            {/* Support escalate */}
            {isSupport&&(
              <div style={{padding:"8px 14px",background:T.panel,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"center"}}>
                <button onClick={escalateToHuman} style={{background:"rgba(77,214,122,0.15)",border:"1px solid rgba(77,214,122,0.4)",borderRadius:"10px",padding:"8px 20px",color:"#4dd67a",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700"}}>
                  📞 التحويل للدعم البشري
                </button>
              </div>
            )}

            {/* Input */}
            {canSend?(
              <div style={{padding:"9px 12px",background:T.sidebar,borderTop:`1px solid ${T.border}`,flexShrink:0,position:"relative"}}>
                {showEmoji&&(
                  <div style={{position:"absolute",bottom:"62px",right:"12px",background:"#1a2a3a",borderRadius:"14px",padding:"12px",display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:"4px",boxShadow:"0 8px 32px rgba(0,0,0,0.6)",zIndex:200,border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
                    {EMOJIS.map(e=><button key={e} onClick={()=>{setInput(p=>p+e);inputRef.current?.focus();}} style={{background:"none",border:"none",fontSize:"21px",cursor:"pointer",padding:"4px",borderRadius:"7px"}} onMouseEnter={ev=>ev.currentTarget.style.background=T.hover} onMouseLeave={ev=>ev.currentTarget.style.background="none"}>{e}</button>)}
                  </div>
                )}
                {attachMenu&&(
                  <div style={{position:"absolute",bottom:"62px",right:"52px",background:"#1c2d3d",borderRadius:"14px",padding:"10px 14px",display:"flex",gap:"12px",boxShadow:"0 8px 24px rgba(0,0,0,0.5)",zIndex:200,border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
                    {[{n:"image",l:"صورة",c:"#4CAF50",a:()=>{imgRef.current?.click();setAttachMenu(false);}},{n:"file",l:"ملف",c:"#2196F3",a:()=>{fileRef.current?.click();setAttachMenu(false);}}].map(b=>(
                      <button key={b.l} onClick={b.a} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"5px",background:"none",border:"none",cursor:"pointer",padding:"10px 12px",borderRadius:"10px"}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                        <Ic n={b.n} s={26} c={b.c}/><span style={{color:T.textSec,fontSize:"11px"}}>{b.l}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <button onClick={e=>{e.stopPropagation();setShowEmoji(!showEmoji);setAttachMenu(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:"6px",borderRadius:"50%",fontSize:"20px",flexShrink:0}}>😊</button>
                  {!isSaved&&!isOfficialBot&&<button onClick={e=>{e.stopPropagation();setAttachMenu(!attachMenu);setShowEmoji(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex",flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="attach" s={20}/></button>}
                  <div style={{flex:1,background:T.inputBg,borderRadius:"22px",padding:"8px 14px",border:editingMsg?`1px solid ${T.gold}`:"none"}}>
                    <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}if(e.key==="Escape"){setEditingMsg(null);setReplyTo(null);setInput("");}}}
                      placeholder={isSaved?"احفظ ملاحظاتك...":isChannel?"نشر في القناة...":isSupport?"اكتب مشكلتك...":isOfficialBot?"أرسل أمراً...":editingMsg?"تعديل الرسالة...":"اكتب رسالة..."} rows={1}
                      style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"14.5px",width:"100%",direction:"rtl",fontFamily:"inherit",resize:"none",lineHeight:"1.5",maxHeight:"90px",overflowY:"auto"}}/>
                  </div>
                  <button onClick={()=>input.trim()&&sendMessage()} style={{background:input.trim()?T.accentBtn:T.inputBg,border:"none",borderRadius:"50%",width:"42px",height:"42px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.2s",boxShadow:input.trim()?"0 4px 12px rgba(82,136,193,0.4)":"none"}}>
                    <Ic n={input.trim()?"send":"mic"} s={19} c={input.trim()?"#fff":T.textSec}/>
                  </button>
                </div>
                <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],true)} onClick={e=>e.target.value=""}/>
                <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],false)} onClick={e=>e.target.value=""}/>
              </div>
            ):(
              <div style={{padding:"13px",background:T.sidebar,borderTop:`1px solid ${T.border}`,textAlign:"center",color:T.textSec,fontSize:"13px"}}>📢 فقط صاحب القناة يمكنه النشر</div>
            )}
          </>
        )}
      </div>

      {/* Context Menu */}
      {ctxMenu&&(
        <div style={{position:"fixed",top:ctxMenu.y,left:ctxMenu.x,background:"#1c2d3d",borderRadius:"13px",padding:"5px 0",boxShadow:"0 8px 28px rgba(0,0,0,0.55)",zIndex:600,minWidth:"180px",border:`1px solid ${T.border}`,maxHeight:"400px",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
          {/* Quick reactions */}
          <div style={{display:"flex",gap:"4px",padding:"8px 10px",borderBottom:`1px solid ${T.border}20`}}>
            {REACT_EMOJIS.map(e=>(
              <button key={e} onClick={()=>addReaction(ctxMenu.msg?.id,e)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"20px",padding:"3px 4px",borderRadius:"8px"}} onMouseEnter={ev=>ev.currentTarget.style.background=T.hover} onMouseLeave={ev=>ev.currentTarget.style.background="none"}>{e}</button>
            ))}
          </div>
          {ctxActions.map(item=>(
            <button key={item.l} onClick={item.a} style={{display:"block",width:"100%",padding:"10px 16px",background:"none",border:"none",color:item.danger?T.danger:T.text,textAlign:"right",cursor:"pointer",fontFamily:"inherit",fontSize:"13.5px"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}>{item.l}</button>
          ))}
        </div>
      )}

      {/* FAB Menu */}
      {modal==="fabMenu"&&(
        <div style={{position:"fixed",inset:0,zIndex:500}} onClick={()=>setModal(null)}>
          <div style={{position:"absolute",bottom:"80px",left:"20px",background:"#1c2d3d",borderRadius:"14px",padding:"8px 0",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",border:`1px solid ${T.border}`,minWidth:"200px"}} onClick={e=>e.stopPropagation()}>
            {[{ic:"user",l:"محادثة جديدة",a:()=>setModal("newChat")},{ic:"group",l:"مجموعة جديدة",a:()=>setModal("newGroup")},{ic:"channel",l:"قناة جديدة",a:()=>setModal("newChannel")},{ic:"bot",l:"BotFather",a:openBotFather}].map(item=>(
              <button key={item.l} onClick={item.a} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"12px 16px",background:"none",border:"none",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"14px"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <Ic n={item.ic} s={18} c={T.accentBtn}/>{item.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {modal==="newChat"&&(
        <Modal title="محادثة جديدة" onClose={()=>setModal(null)}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setSearchMode(true);}} placeholder="@username أو الاسم" autoFocus
            style={{background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:"12px",padding:"11px 14px",color:T.text,fontSize:"15px",outline:"none",direction:"rtl",fontFamily:"inherit",width:"100%",marginBottom:"12px",boxSizing:"border-box"}}/>
          <div style={{maxHeight:"300px",overflowY:"auto"}}>
            {searchResults.filter(r=>r.resultType==="user"&&r.uid!==user?.uid).map(u2=>(
              <div key={u2.uid} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",cursor:"pointer",borderRadius:"10px",marginBottom:"4px"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                onClick={()=>openPrivateChat(u2)}>
                <Av name={u2.displayName} color={u2.color||rColor(u2.displayName)} size={38} verified={u2.verified} photo={u2.photoURL}/>
                <div><div style={{color:T.text,fontSize:"14px",fontWeight:"600"}}>{u2.displayName}</div><div style={{color:T.textSec,fontSize:"12px"}}>@{u2.username}</div></div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {(modal==="newGroup"||modal==="newChannel")&&(
        <Modal title={modal==="newGroup"?"مجموعة جديدة":"قناة جديدة"} onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <FInput label={modal==="newGroup"?"اسم المجموعة":"اسم القناة"} value={newForm.name} onChange={e=>setNewForm(p=>({...p,name:e.target.value}))} placeholder={modal==="newGroup"?"اسم المجموعة...":"اسم القناة..."} autoFocus/>
            <FInput label="اسم المستخدم (يبدأ بحرف، 5+ أحرف) *مطلوب*" value={newForm.username} onChange={e=>setNewForm(p=>({...p,username:e.target.value}))} placeholder={modal==="newGroup"?"group_name":"channel_name"}/>
            <FInput label="النبذة (اختياري)" value={newForm.bio} onChange={e=>setNewForm(p=>({...p,bio:e.target.value}))} placeholder="وصف..."/>
            <PBtn onClick={()=>createConvo(modal==="newGroup"?"group":"channel")}>{modal==="newGroup"?"إنشاء المجموعة":"إنشاء القناة"}</PBtn>
          </div>
        </Modal>
      )}

      {modal==="editProfile"&&(
        <Modal title="تعديل الملف الشخصي" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",alignItems:"center"}}>
            <div style={{position:"relative",cursor:"pointer"}} onClick={()=>{const inp=document.createElement("input");inp.type="file";inp.accept="image/*";inp.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setEditProfile(p=>({...p,photo:ev.target.result}));r.readAsDataURL(f);}};inp.click();}}>
              <Av name={editProfile.displayName||userData?.displayName} color={userData?.color||rColor(userData?.displayName||"")} size={72} photo={editProfile.photo}/>
              <div style={{position:"absolute",bottom:0,right:0,background:T.accentBtn,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px"}}>📷</div>
            </div>
            <div style={{width:"100%",display:"flex",flexDirection:"column",gap:"11px"}}>
              <FInput label="الاسم الشخصي" value={editProfile.displayName} onChange={e=>setEditProfile(p=>({...p,displayName:e.target.value}))} placeholder="اسمك..."/>
              <FInput label="اسم المستخدم (يبدأ بحرف، 5+ أحرف)" value={editProfile.username} onChange={e=>setEditProfile(p=>({...p,username:e.target.value}))} placeholder="username"/>
              <FInput label="النبذة الشخصية" value={editProfile.bio} onChange={e=>setEditProfile(p=>({...p,bio:e.target.value}))} placeholder="أخبرنا عن نفسك..."/>
            </div>
            <PBtn onClick={saveProfile}>💾 حفظ التغييرات</PBtn>
          </div>
        </Modal>
      )}

      {modal==="channelSettings"&&channelSettings&&(
        <Modal title="إعدادات القناة" onClose={()=>setModal(null)} width="460px">
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
              <div style={{position:"relative",cursor:"pointer"}} onClick={()=>{const inp=document.createElement("input");inp.type="file";inp.accept="image/*";inp.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=async ev=>{await update(ref(db,`chats/${channelSettings.id}`),{photoURL:ev.target.result});setChannelSettings(p=>({...p,photoURL:ev.target.result}));};r.readAsDataURL(f);}};inp.click();}}>
                <Av name={channelSettings.name} color={rColor(channelSettings.name)} size={72} photo={channelSettings.photoURL}/>
                <div style={{position:"absolute",bottom:0,right:0,background:T.accentBtn,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px"}}>📷</div>
              </div>
              <span style={{color:T.textSec,fontSize:"12px"}}>اضغط لتغيير الصورة (رفع من الهاتف)</span>
            </div>
            <FInput label="اسم القناة" value={channelSettings.name} onChange={e=>setChannelSettings(p=>({...p,name:e.target.value}))} placeholder="اسم القناة..."/>
            <FInput label="اسم المستخدم (@)" value={channelSettings.username||""} onChange={e=>setChannelSettings(p=>({...p,username:e.target.value}))} placeholder="channel_username"/>
            <FInput label="النبذة" value={channelSettings.bio||""} onChange={e=>setChannelSettings(p=>({...p,bio:e.target.value}))} placeholder="وصف القناة..."/>
            <div style={{background:T.inputBg,borderRadius:"12px",padding:"14px",border:`1px solid ${T.border}`}}>
              <div style={{color:T.textSec,fontSize:"12px",fontWeight:"700",marginBottom:"12px"}}>صلاحيات القناة</div>
              {[{k:"canComment",l:"السماح بالتعليقات"},{k:"canReactions",l:"السماح بالتفاعلات"},{k:"isPrivate",l:"قناة خاصة"}].map(perm=>(
                <div key={perm.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                  <span style={{color:T.text,fontSize:"14px"}}>{perm.l}</span>
                  <Toggle checked={!!((channelSettings.permissions||{})[perm.k])} onChange={()=>setChannelSettings(p=>({...p,permissions:{...(p.permissions||{}),[perm.k]:!((p.permissions||{})[perm.k])}}))}/>
                </div>
              ))}
            </div>
            <PBtn onClick={updateChannelSettings}>💾 حفظ إعدادات القناة</PBtn>
          </div>
        </Modal>
      )}

      {modal==="twoFactor"&&(
        <Modal title="التحقق بخطوتين" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",alignItems:"center",textAlign:"center"}}>
            <div style={{fontSize:"48px"}}>{userData?.twoFactor?"🔒":"🔓"}</div>
            <div style={{color:T.text,fontWeight:"700",fontSize:"15px"}}>التحقق بخطوتين {userData?.twoFactor?"مفعّل":"معطّل"}</div>
            <PBtn color={userData?.twoFactor?T.danger:T.gold} onClick={async()=>{
              const nv=!userData?.twoFactor;
              await update(ref(db,`users/${user.uid}`),{twoFactor:nv});
              const s=await get(ref(db,`users/${user.uid}`));if(s.exists())setUserData(s.val());
              const botId=`bot_${user.uid}`;const nid=uidGen();
              await set(ref(db,`messages/${botId}/${nid}`),{id:nid,chatId:botId,text:`🔐 تم ${nv?"تفعيل":"إلغاء"} التحقق بخطوتين\n🕐 ${nowFull()}`,from:APP_BOT_ID,senderName:"DFGFD",time:nowStr(),type:"text",isOfficialBot:true,createdAt:Date.now()});
              setModal(null);
            }}>{userData?.twoFactor?"🔓 إلغاء التفعيل":"🔒 تفعيل"}</PBtn>
          </div>
        </Modal>
      )}

      {modal==="changePass"&&(
        <Modal title="تغيير كلمة المرور" onClose={()=>setModal(null)}>
          <div style={{textAlign:"center",padding:"20px",color:T.textSec,fontSize:"14px",lineHeight:"1.7"}}>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>🔑</div>
            سيتم إرسال رابط إعادة التعيين إلى:<br/><strong style={{color:T.text}}>{user?.email}</strong>
          </div>
          <PBtn onClick={async()=>{const {sendPasswordResetEmail}=await import("firebase/auth");await sendPasswordResetEmail(auth,user?.email);alert("تم الإرسال! تحقق من بريدك.");setModal(null);}}>
            📧 إرسال رابط إعادة التعيين
          </PBtn>
        </Modal>
      )}

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.accent};border-radius:4px}
        @keyframes msgIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        textarea{scrollbar-width:none}textarea::-webkit-scrollbar{display:none}
        input::placeholder,textarea::placeholder{color:${T.textSec}}
        input,textarea,button{-webkit-tap-highlight-color:transparent}
      `}</style>
    </div>
  );
}
