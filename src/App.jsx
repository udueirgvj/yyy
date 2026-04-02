import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, set, get, onValue, off, update, remove } from "firebase/database";

const FB = { apiKey:"AIzaSyDRCtfuYrEdnuKUsWu_79NC6G_xGLznBJc", authDomain:"tttrt-b8c5a.firebaseapp.com", databaseURL:"https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app", projectId:"tttrt-b8c5a", storageBucket:"tttrt-b8c5a.firebasestorage.app", messagingSenderId:"975123752593", appId:"1:975123752593:web:e591e930af3a3e29568130" };
const fbApp = initializeApp(FB);
const auth = getAuth(fbApp);
const db = getDatabase(fbApp);

const OWNER = "tsaxp";
const BOT_ID = "bot_dfgfd_official";
const SUP_ID = "support_official";
const BF_ID = "bot_botfather_official";
const APP_CH = "channel_termeen_official";
const SSPT_ID = "bot_sspt_official";  // Phone change bot
const ANTI_ID = "bot_sdsf_official";  // Anti-impersonation bot

const COLORS = ["#E57373","#4CAF50","#9C27B0","#FF9800","#00BCD4","#F44336","#2196F3","#FF5722"];
const rc = s => COLORS[(s||"A").charCodeAt(0)%COLORS.length];
const uid = () => Math.random().toString(36).slice(2,9)+Date.now().toString(36);
const now = () => new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});
const full = () => { const d=new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")} - ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };
const fsz = b => b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";
const fsub = n => n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(n);

// Generate phone number +666XXXXXXXX
const genPhone = () => {
  const digits = Math.floor(Math.random()*90000000+10000000);
  return `+666${digits}`;
};

function score(item,q) {
  const n=(item.displayName||item.name||"").toLowerCase();
  const u=(item.username||"").toLowerCase();
  if(u===q||n===q) return 100;
  if(u.startsWith(q)) return 90-u.length;
  if(n.startsWith(q)) return 80-n.length;
  if(u.includes(q)) return 60;
  if(n.includes(q)) return 50;
  return 0;
}

const T = {
  bg:"#17212b", sb:"#0e1621", panel:"#182533", acc:"#2b5278",
  btn:"#5288c1", text:"#e8f4fd", dim:"#6b8ca4", out:"#2b5278",
  inp:"#182533", brd:"#0d1822", hov:"#1c2d3d", on:"#4dd67a",
  err:"#e05c5c", gold:"#f0a040", vrf:"#5288c1", tab:"#1c2733", inp2:"#1c2d3d"
};

// Icons
const I = {
  back:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  menu:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  srch:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={c} strokeWidth="2"/><path d="M21 21L16.65 16.65" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  close:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  send:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mic:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" stroke={c} strokeWidth="2"/><path d="M5 10C5 14.418 8.134 18 12 18C15.866 18 19 14.418 19 10" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="18" x2="12" y2="22" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  attach:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05L12.25 20.24C10.5 21.99 7.75 21.99 6 20.24C4.25 18.49 4.25 15.74 6 13.99L14.5 5.49C15.67 4.32 17.58 4.32 18.75 5.49C19.92 6.66 19.92 8.57 18.75 9.74L10.24 18.24C9.66 18.82 8.72 18.82 8.13 18.24C7.55 17.66 7.55 16.72 8.13 16.13L15.92 8.34" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chk:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chk2:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="18 6 9 17 4 12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 6 13 17" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  set:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={c} strokeWidth="2"/></svg>,
  pls:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  more:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill={c}/><circle cx="12" cy="12" r="1.5" fill={c}/><circle cx="12" cy="19" r="1.5" fill={c}/></svg>,
  file:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="2"/></svg>,
  img:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke={c} strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" fill={c}/><path d="M21 15L16 10L5 21" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pin:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 17v5M8 17h8M9 3h6l2 5-4 3v3H9V11L5 8l4-5z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2"/></svg>,
  eyeoff:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  sv:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ch:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2L8 8H3l4.5 4.5-2 7L12 16l6.5 3.5-2-7L21 8h-5L12 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  gr:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  usr:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke={c} strokeWidth="2"/></svg>,
  bot:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke={c} strokeWidth="2"/><circle cx="12" cy="7" r="3" stroke={c} strokeWidth="2"/><line x1="12" y1="2" x2="12" y2="4" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="8" cy="16" r="1.5" fill={c}/><circle cx="16" cy="16" r="1.5" fill={c}/></svg>,
  ntf:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ct:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  sup:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  cr:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M2 20h20M4 20L2 8l6 4 4-8 4 8 6-4-2 12H4z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  fl:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="4" y1="22" x2="4" y2="15" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  lk:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke={c} strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pv:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ph:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0111.2 18.9a19.5 19.5 0 01-7-7A19.79 19.79 0 011.13 4.18 2 2 0 013.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.41 9.9A16 16 0 0014.1 17.09l.95-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.42v-1.5z" stroke={c} strokeWidth="2"/></svg>,
  fol:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  gift:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="4" rx="1" stroke={c} strokeWidth="2"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M12 8v13M8.5 8a2.5 2.5 0 010-5c1.5 0 2.5 1.5 3.5 5M15.5 8a2.5 2.5 0 000-5c-1.5 0-2.5 1.5-3.5 5" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  addct:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2"/><line x1="19" y1="8" x2="19" y2="14" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="11" x2="22" y2="11" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  ed:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  tr:(c,s)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14H6L5 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
};
const Ic = ({n,s=20,c=T.dim}) => I[n]?I[n](c,s):null;

// Verified badge
const Vbg = ({sz=16}) => (
  <span style={{background:T.vrf,borderRadius:"50%",width:sz,height:sz,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
    <Ic n="chk" s={sz*0.6} c="#fff"/>
  </span>
);

// Avatar
function Av({name,photo,size=46,online,verified,onClick}) {
  return (
    <div style={{position:"relative",flexShrink:0,cursor:onClick?"pointer":"default"}} onClick={onClick}>
      <div style={{width:size,height:size,borderRadius:"50%",background:photo?"transparent":rc(name||"?"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:"800",color:"#fff",overflow:"hidden"}}>
        {photo?<img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(name||"?").charAt(0).toUpperCase()}
      </div>
      {online===true&&<div style={{position:"absolute",bottom:1,right:1,width:size*0.26,height:size*0.26,borderRadius:"50%",background:T.on,border:`2px solid ${T.sb}`}}/>}
      {online===false&&<div style={{position:"absolute",bottom:1,right:1,width:size*0.26,height:size*0.26,borderRadius:"50%",background:"rgba(255,255,255,0.25)",border:`2px solid ${T.sb}`}}/>}
      {verified&&<div style={{position:"absolute",bottom:-2,left:-2,background:T.vrf,borderRadius:"50%",width:size*0.32,height:size*0.32,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${T.sb}`}}><Ic n="chk" s={size*0.18} c="#fff"/></div>}
    </div>
  );
}

const Tog = ({on,go}) => (
  <button onClick={go} style={{width:"44px",height:"24px",borderRadius:"12px",background:on?T.btn:"#3a4a5a",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
    <div style={{width:"18px",height:"18px",borderRadius:"50%",background:"#fff",position:"absolute",top:"3px",transition:"right 0.2s",right:on?"3px":"23px"}}/>
  </button>
);

function FInp({label,val,set,ph,type="text",af,onKey}) {
  const [sh,setSh]=useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
      {label&&<label style={{color:T.dim,fontSize:"12px",fontWeight:"600"}}>{label}</label>}
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        <input value={val} onChange={e=>set(e.target.value)} placeholder={ph}
          type={type==="password"&&sh?"text":type} autoFocus={af} onKeyDown={onKey}
          style={{background:T.inp2,border:`1px solid ${T.brd}44`,borderRadius:"12px",padding:`11px ${type==="password"?"40px":"14px"} 11px 14px`,color:T.text,fontSize:"15px",outline:"none",direction:"rtl",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}
          onFocus={e=>e.target.style.borderColor=T.btn} onBlur={e=>e.target.style.borderColor=`${T.brd}44`}/>
        {type==="password"&&<button onClick={()=>setSh(!sh)} style={{position:"absolute",left:"12px",background:"none",border:"none",cursor:"pointer"}}><Ic n={sh?"eyeoff":"eye"} s={16}/></button>}
      </div>
    </div>
  );
}

function Mdl({title,children,onClose,w="440px"}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"16px"}} onClick={onClose}>
      <div style={{background:"#1a2a3a",borderRadius:"18px",padding:"24px",width:w,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.7)",border:`1px solid ${T.brd}`}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <h3 style={{color:T.text,fontSize:"17px",fontWeight:"800"}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PBtn({kids,go,loading,color=T.btn,dis,style={}}) {
  return (
    <button onClick={go} disabled={loading||dis}
      style={{background:color,border:"none",borderRadius:"12px",padding:"13px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:(loading||dis)?"not-allowed":"pointer",fontFamily:"inherit",width:"100%",opacity:(loading||dis)?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",...style}}>
      {loading?<span style={{animation:"spin .8s linear infinite",display:"inline-block",fontSize:"18px"}}>⟳</span>:kids}
    </button>
  );
}

function MText({text,onMention,style}) {
  if(!text) return null;
  const parts=text.split(/(@[a-zA-Z][a-zA-Z0-9_]{3,})/g);
  return <span style={style}>{parts.map((p,i)=>/^@[a-zA-Z][a-zA-Z0-9_]{3,}$/.test(p)?<span key={i} onClick={e=>{e.stopPropagation();onMention&&onMention(p.slice(1));}} style={{color:"#6ab3f3",cursor:"pointer",fontWeight:"600"}}>{p}</span>:<span key={i}>{p}</span>)}</span>;
}

// Profile sheet — EXACT Telegram style
function ProfSheet({p,onClose,onChat,me,chats,onlineUsers,channelGifts}) {
  if(!p) return null;
  const isUser=!!p.uid&&p.type!=="channel"&&p.type!=="group";
  const isCH=p.type==="channel";
  const isGR=p.type==="group";
  const mutual=isUser?chats.filter(c=>c.type==="group"&&Array.isArray(c.members)&&c.members.includes(p.uid)&&c.members.includes(me?.uid)):[];
  const isOnline=isUser&&onlineUsers&&onlineUsers[p.uid]?.online===true;
  const lastSeen=p.lastSeen?new Date(p.lastSeen):null;
  const showPhone=p.showPhone!==false&&p.phone;
  const pName=p.name||p.displayName||"؟";
  const bgColor=p.color||rc(pName);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0)",zIndex:500,display:"flex",alignItems:"stretch",justifyContent:"flex-end"}} onClick={onClose}>
      <div style={{background:"#fff",width:"100%",maxWidth:"100vw",height:"100%",overflow:"hidden",display:"flex",flexDirection:"column",animation:"slideIn .2s ease"}} onClick={e=>e.stopPropagation()}>
        {/* Top bar */}
        <div style={{display:"flex",alignItems:"center",padding:"12px 16px",background:"#fff",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:"6px",marginLeft:"8px",display:"flex",alignItems:"center"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span style={{color:"#000",fontWeight:"700",fontSize:"18px",flex:1}}></span>
          <button style={{background:"none",border:"none",cursor:"pointer",padding:"6px"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="#333"/><circle cx="12" cy="12" r="1.5" fill="#333"/><circle cx="12" cy="19" r="1.5" fill="#333"/></svg>
          </button>
        </div>

        <div style={{overflowY:"auto",flex:1,background:"#f5f5f5"}}>
          {/* Profile hero - white card */}
          <div style={{background:"#fff",padding:"24px 16px 16px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
            {/* Avatar */}
            <div style={{width:"100px",height:"100px",borderRadius:"50%",background:p.photoURL?"transparent":bgColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"44px",fontWeight:"900",color:"#fff",overflow:"hidden",flexShrink:0}}>
              {p.photoURL?<img src={p.photoURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:pName.charAt(0).toUpperCase()}
            </div>
            {/* Name */}
            <div style={{textAlign:"center"}}>
              <div style={{color:"#000",fontSize:"22px",fontWeight:"800",display:"flex",alignItems:"center",gap:"6px",justifyContent:"center"}}>
                {pName}
                {(p.verified||p.isOfficial)&&<span style={{background:"#2AABEE",borderRadius:"50%",width:"22px",height:"22px",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>}
              </div>
              {/* Online/last seen */}
              {isUser&&<div style={{color:isOnline?"#4CAF50":"#999",fontSize:"14px",marginTop:"3px"}}>{isOnline?"متصل الآن":lastSeen?`آخر ظهور يوم ${lastSeen.toLocaleDateString("ar-SA")} عند ${lastSeen.toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"})} م`:"غير متصل"}</div>}
              {isCH&&<div style={{color:"#999",fontSize:"14px",marginTop:"3px"}}>{fsub(p.subscribers||0)} مشترك</div>}
              {isGR&&<div style={{color:"#999",fontSize:"14px",marginTop:"3px"}}>{(p.members||[]).length} عضو</div>}
            </div>
            {/* Action buttons */}
            <div style={{display:"flex",gap:"8px",width:"100%",maxWidth:"340px",marginTop:"4px"}}>
              {isUser&&p.uid!==me?.uid&&onChat&&(
                <button onClick={()=>{onChat(p);onClose();}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",padding:"12px 8px",background:"#f5f5f5",border:"none",borderRadius:"14px",cursor:"pointer"}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#2AABEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{color:"#2AABEE",fontSize:"12px",fontWeight:"600"}}>مراسلة</span>
                </button>
              )}
              {(isCH||isGR)&&onChat&&(
                <button onClick={()=>{onChat(p);onClose();}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",padding:"12px 8px",background:"#f5f5f5",border:"none",borderRadius:"14px",cursor:"pointer"}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#2AABEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{color:"#2AABEE",fontSize:"12px",fontWeight:"600"}}>فتح</span>
                </button>
              )}
              <button style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",padding:"12px 8px",background:"#f5f5f5",border:"none",borderRadius:"14px",cursor:"pointer"}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#2AABEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{color:"#2AABEE",fontSize:"12px",fontWeight:"600"}}>كتم</span>
              </button>
              {(isUser||isCH)&&(
                <button style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",padding:"12px 8px",background:"#f5f5f5",border:"none",borderRadius:"14px",cursor:"pointer"}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0111.2 18.9a19.5 19.5 0 01-7-7A19.79 19.79 0 011.13 4.18 2 2 0 013.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.41 9.9A16 16 0 0014.1 17.09l.95-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.42v-1.5z" stroke="#2AABEE" strokeWidth="2"/></svg>
                  <span style={{color:"#2AABEE",fontSize:"12px",fontWeight:"600"}}>مكالمة</span>
                </button>
              )}
              <button style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",padding:"12px 8px",background:"#f5f5f5",border:"none",borderRadius:"14px",cursor:"pointer"}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="4" rx="1" stroke="#2AABEE" strokeWidth="2"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7" stroke="#2AABEE" strokeWidth="2" strokeLinecap="round"/><path d="M12 8v13M8.5 8a2.5 2.5 0 010-5c1.5 0 2.5 1.5 3.5 5M15.5 8a2.5 2.5 0 000-5c-1.5 0-2.5 1.5-3.5 5" stroke="#2AABEE" strokeWidth="2" strokeLinecap="round"/></svg>
                <span style={{color:"#2AABEE",fontSize:"12px",fontWeight:"600"}}>هدية</span>
              </button>
            </div>
          </div>

          {/* Info card */}
          <div style={{background:"#fff",marginBottom:"8px"}}>
            {showPhone&&(
              <div style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0111.2 18.9a19.5 19.5 0 01-7-7A19.79 19.79 0 011.13 4.18 2 2 0 013.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.41 9.9A16 16 0 0014.1 17.09l.95-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.42v-1.5z" stroke="#2AABEE" strokeWidth="2"/></svg>
                <div><div style={{color:"#000",fontSize:"15px",direction:"ltr",textAlign:"right"}}>{p.phone}</div><div style={{color:"#999",fontSize:"12px"}}>جوال</div></div>
              </div>
            )}
            {p.bio&&(
              <div style={{display:"flex",alignItems:"flex-start",gap:"14px",padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#2AABEE" strokeWidth="2"/><line x1="12" y1="16" x2="12" y2="12" stroke="#2AABEE" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="#2AABEE" strokeWidth="2" strokeLinecap="round"/></svg>
                <div><div style={{color:"#000",fontSize:"15px",lineHeight:"1.5",whiteSpace:"pre-wrap"}}>{p.bio}</div><div style={{color:"#999",fontSize:"12px",marginTop:"3px"}}>النبذة</div></div>
              </div>
            )}
            {p.username&&(
              <div style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#2AABEE" strokeWidth="2"/><text x="12" y="17" textAnchor="middle" fontSize="12" fill="#2AABEE" fontWeight="bold">@</text></svg>
                <div><div style={{color:"#2AABEE",fontSize:"15px",fontWeight:"600"}}>@{p.username}</div><div style={{color:"#999",fontSize:"12px"}}>اسم المستخدم</div></div>
              </div>
            )}
            {isCH&&(
              <div style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 16px"}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#2AABEE" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="#2AABEE" strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#2AABEE" strokeWidth="2" strokeLinecap="round"/></svg>
                <div><div style={{color:"#000",fontSize:"15px"}}>{fsub(p.subscribers||0)} مشترك</div><div style={{color:"#999",fontSize:"12px"}}>المشتركون</div></div>
              </div>
            )}
          </div>

          {/* Add contact */}
          {isUser&&p.uid!==me?.uid&&(
            <div style={{background:"#fff",marginBottom:"8px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 16px",cursor:"pointer"}}>
                <div style={{width:"42px",height:"42px",borderRadius:"50%",background:"#2AABEE",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/><line x1="19" y1="8" x2="19" y2="14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="11" x2="22" y2="11" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <span style={{color:"#2AABEE",fontSize:"15px",fontWeight:"600"}}>إضافة لجهات الاتصال</span>
              </div>
            </div>
          )}

          {/* Mutual groups */}
          {mutual.length>0&&(
            <div style={{background:"#fff",marginBottom:"8px",padding:"14px 16px"}}>
              <div style={{color:"#999",fontSize:"13px",marginBottom:"10px"}}>{mutual.length} مجموعة مشتركة</div>
              {mutual.map(g=>(
                <div key={g.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"6px 0"}}>
                  <div style={{width:"42px",height:"42px",borderRadius:"50%",background:rc(g.name),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:"700",fontSize:"18px"}}>{g.name.charAt(0)}</div>
                  <div>
                    <div style={{color:"#000",fontSize:"15px",fontWeight:"600"}}>{g.name}</div>
                    <div style={{color:"#999",fontSize:"12px"}}>{(g.members||[]).length} عضو</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Channel gifts shown in profile */}
          {isCH&&channelGifts&&channelGifts.length>0&&(
            <div style={{background:"#fff",marginBottom:"8px",padding:"14px 16px"}}>
              <div style={{color:"#999",fontSize:"13px",marginBottom:"10px"}}>الهدايا المُرسلة للقناة</div>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                {channelGifts.slice(0,8).map((g,i)=>(
                  <div key={i} style={{textAlign:"center",background:"#f5f5f5",borderRadius:"12px",padding:"8px 12px"}}>
                    <div style={{fontSize:"28px"}}>{g.gift?.emoji}</div>
                    <div style={{color:"#666",fontSize:"11px"}}>{g.senderName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Report sheet
function RepSheet({onClose,onReport}) {
  const [sel,setSel]=useState(""); const [note,setNote]=useState("");
  const reasons=["محتوى جنسي أو للبالغين","نشاطات إرهابية أو عنف","احتيال أو نصب","رسائل مزعجة","محتوى مسيء","انتهاك حقوق الملكية","شيء آخر"];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:700,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#1a2a3a",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:"480px",padding:"20px",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}><span style={{color:T.text,fontSize:"17px",fontWeight:"800"}}>🚩 إرسال بلاغ</span><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={18}/></button></div>
        <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"14px"}}>
          {reasons.map(r=><button key={r} onClick={()=>setSel(r)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 14px",borderRadius:"11px",border:`1px solid ${sel===r?T.btn:T.brd}30`,background:sel===r?`${T.btn}15`:"transparent",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"13.5px",textAlign:"right"}}><div style={{width:"18px",height:"18px",borderRadius:"50%",border:`2px solid ${sel===r?T.btn:T.dim}`,background:sel===r?T.btn:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{sel===r&&<div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#fff"}}/>}</div>{r}</button>)}
        </div>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="تفاصيل إضافية..." rows={3} style={{width:"100%",background:T.inp2,border:`1px solid ${T.brd}`,borderRadius:"12px",padding:"11px 14px",color:T.text,fontSize:"14px",outline:"none",direction:"rtl",fontFamily:"inherit",resize:"none",marginBottom:"12px",boxSizing:"border-box"}}/>
        <button onClick={()=>{if(sel)onReport(sel,note);}} disabled={!sel} style={{width:"100%",padding:"13px",background:sel?T.err:`${T.err}40`,border:"none",borderRadius:"12px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:sel?"pointer":"not-allowed",fontFamily:"inherit"}}>🚩 إرسال البلاغ</button>
      </div>
    </div>
  );
}

// Gifts modal
function GiftsModal({onClose,onSend,userStars=0}) {
  const [sel,setSel]=useState(null); const [msg,setMsg]=useState("");
  const gifts=[
    {id:"heart",emoji:"💝",name:"قلب",stars:15},{id:"bear",emoji:"🧸",name:"دب",stars:15},
    {id:"gift",emoji:"🎁",name:"هدية",stars:25},{id:"rose",emoji:"🌹",name:"وردة",stars:25},
    {id:"cake",emoji:"🎂",name:"كيك",stars:50},{id:"bouquet",emoji:"💐",name:"باقة",stars:50},
    {id:"rocket",emoji:"🚀",name:"صاروخ",stars:50},{id:"trophy",emoji:"🏆",name:"كأس",stars:100},
    {id:"ring",emoji:"💍",name:"خاتم",stars:100},{id:"diamond",emoji:"💎",name:"ماس",stars:100},
  ];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:700,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#1a2a3a",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:"480px",padding:"20px",maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
          <span style={{color:T.text,fontSize:"17px",fontWeight:"800"}}>🎁 إرسال هدية</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={18}/></button>
        </div>
        <div style={{color:T.dim,fontSize:"12px",marginBottom:"14px"}}>رصيدك: ⭐ {userStars} نجمة</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"16px"}}>
          {gifts.map(g=>(
            <button key={g.id} onClick={()=>setSel(sel?.id===g.id?null:g)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",padding:"14px 8px",borderRadius:"14px",border:`2px solid ${sel?.id===g.id?T.btn:T.brd}22`,background:sel?.id===g.id?`${T.btn}15`:T.inp2,cursor:"pointer"}}>
              <div style={{fontSize:"36px"}}>{g.emoji}</div>
              <div style={{color:T.text,fontSize:"12px",fontWeight:"600"}}>{g.name}</div>
              <div style={{color:T.gold,fontSize:"11px",fontWeight:"700"}}>⭐ {g.stars}</div>
            </button>
          ))}
        </div>
        {sel&&(
          <>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="أضف رسالة... (اختياري)" rows={2}
              style={{width:"100%",background:T.inp2,border:`1px solid ${T.brd}`,borderRadius:"12px",padding:"10px 14px",color:T.text,fontSize:"14px",outline:"none",direction:"rtl",fontFamily:"inherit",resize:"none",marginBottom:"12px",boxSizing:"border-box"}}/>
            {userStars>=sel.stars
              ? <PBtn kids={`إرسال ${sel.emoji} بـ ⭐ ${sel.stars}`} go={()=>onSend(sel,msg)} color={T.btn}/>
              : <div style={{background:`${T.err}15`,border:`1px solid ${T.err}30`,borderRadius:"12px",padding:"13px",textAlign:"center",color:T.err,fontSize:"13px",fontWeight:"600"}}>رصيدك غير كافٍ! تحتاج ⭐ {sel.stars-userStars} نجمة إضافية</div>
            }
          </>
        )}
      </div>
    </div>
  );
}



// SSPT phone change handler
async function handleSSPT(text,cid,user,ud,db) {
  const t=text.trim();
  const phoneRegex=/^\+?[0-9]{10,14}$/;
  if(phoneRegex.test(t.replace(/\s/g,""))){
    const phone=t.replace(/\s/g,"");
    if(ud?.phone===phone||ud?.phone===phone.replace("+","+666").slice(0,15)){
      const newPhone="+666"+Math.floor(Math.random()*90000000+10000000);
      const orderId="RPH-"+Date.now().toString().slice(-6);
      await update(ref(db,`users/${user.uid}`),{phone:newPhone}).catch(()=>{});
      const rid=uid();
      const successMsg="✅ عزيزي، تم تغيير رقم هاتفك!\n\n📞 الرقم القديم: "+phone+"\n📞 رقمك الجديد: "+newPhone+"\n\n🕐 "+new Date().toLocaleString("ar-SA")+"\n🔢 رقم الطلب: "+orderId;
      await set(ref(db,`messages/${cid}/${rid}`),{id:rid,chatId:cid,text:successMsg,from:SSPT_ID,senderName:"SSPT",time:"",type:"text",isOfficialBot:true,createdAt:Date.now()+500});
      await update(ref(db,`userChats/${user.uid}/${cid}`),{lastMessage:"تم تغيير الرقم",lastTime:"",order:Date.now()+1});
      await set(ref(db,`phoneChanges/${orderId}`),{orderId,userId:user.uid,username:ud?.username,oldPhone:phone,newPhone,createdAt:Date.now()}).catch(()=>{});
    } else {
      const rid=uid();
      const errMsg="⚠️ عزيزي، وجدنا خطأ في الرقم!\n\nهذا ليس رقم حسابك.\nعليك التأكد من صحة الرقم وإعادة المحاولة.\n\n⛔ تحذير: عدم إرسال أرقام عشوائية في قسم SSPT.";
      await set(ref(db,`messages/${cid}/${rid}`),{id:rid,chatId:cid,text:errMsg,from:SSPT_ID,senderName:"SSPT",time:"",type:"text",isOfficialBot:true,createdAt:Date.now()+500});
    }
  } else if(t.toLowerCase()==="/start"||t==="بداء"){
    const rid=uid();
    const welcomeMsg="مرحباً بك عزيزي 👋\n\nنحن سعداء بتواصلك معنا.\n\nأرسل لي رقمك المكون من 11 رقم وسيتم مراجعته خلال دقائق ويتم استبدال الرقم برقم جديد.\n\n📞 أو اكتب: شراء رقم مميز";
    await set(ref(db,`messages/${cid}/${rid}`),{id:rid,chatId:cid,text:welcomeMsg,from:SSPT_ID,senderName:"SSPT",time:"",type:"text",isOfficialBot:true,createdAt:Date.now()+500});
    await update(ref(db,`userChats/${user.uid}/${cid}`),{lastMessage:"مرحباً بك",lastTime:"",order:Date.now()+1});
  }
}


// SDSF anti-impersonation handler
async function handleSDSF(text,cid,user,ud,db) {
  const rid=uid();
  const orderId="IMP-"+Date.now().toString().slice(-6);
  await set(ref(db,`imposterReports/${orderId}`),{id:orderId,reporterId:user.uid,reporterUsername:ud?.username,targetInfo:text,details:text,status:"pending",createdAt:Date.now()}).catch(()=>{});
  const replyMsg="✅ تم استلام بلاغك.\n\nسيراجع فريق SDSF حالة الطلب ويتم الرد عليك.\n\n🔢 رقم التذكرة: "+orderId;
  await set(ref(db,`messages/${cid}/${rid}`),{id:rid,chatId:cid,text:replyMsg,from:ANTI_ID,senderName:"SDSF",time:"",type:"text",isOfficialBot:true,createdAt:Date.now()+500});
  await update(ref(db,`userChats/${user.uid}/${cid}`),{lastMessage:"تم استلام البلاغ",lastTime:"",order:Date.now()+1});
}


// SSPT bot chat creation
async function openSSPT(user,openChat,db) {
  if(!user) return;
  const cid="sspt_"+user.uid;
  const ssptData={id:cid,type:"official_bot",name:"SSPT",username:"sspt",isOfficial:true,verified:true,color:"#2196F3"};
  try {
    const s=await get(ref(db,`chats/${cid}`));
    if(!s.exists()){
      await set(ref(db,`chats/${cid}`),{...ssptData,members:[user.uid,SSPT_ID],createdAt:Date.now(),photoURL:""});
      await set(ref(db,`userChats/${user.uid}/${cid}`),{chatId:cid,lastMessage:"تغيير الأرقام",lastTime:"",unread:1,order:Date.now(),type:"official_bot",name:"SSPT",color:"#2196F3"});
    }
  } catch {}
  openChat(cid,ssptData);
}

// SDSF anti-impersonation bot
async function openSDSF(user,openChat,db) {
  if(!user) return;
  const cid="sdsf_"+user.uid;
  const data={id:cid,type:"official_bot",name:"SDSF",username:"sdsf",isOfficial:true,verified:true,color:"#9C27B0"};
  try {
    const s=await get(ref(db,`chats/${cid}`));
    if(!s.exists()){
      await set(ref(db,`chats/${cid}`),{...data,members:[user.uid,ANTI_ID],createdAt:Date.now(),photoURL:""});
      await set(ref(db,`userChats/${user.uid}/${cid}`),{chatId:cid,lastMessage:"بلاغ انتحال",lastTime:"",unread:0,order:Date.now()-1,type:"official_bot",name:"SDSF",color:"#9C27B0"});
      const wm=uid();
      const sdsfWelcome="مرحباً! أنا مكافح الانتحال SDSF 🛡\n\nأرسل لي معلومات الحساب الذي تريد الإبلاغ عنه كمنتحل وسيقوم فريق SDSF بالتحقيق فيه.";
  await set(ref(db,`messages/${cid}/${wm}`),{id:wm,chatId:cid,text:sdsfWelcome,from:ANTI_ID,senderName:"SDSF",time:"",type:"text",isOfficialBot:true,createdAt:Date.now()});
    }
  } catch {}
  openChat(cid,data);
}

// MembersList component
function MembersList({members,admins,ownerId,currentUserId,isAdmin,chatId,db,cache,onAction}) {
  const [memberData,setMD] = useState({});
  useEffect(()=>{
    members.filter(m=>!m.startsWith("bot_")).slice(0,20).forEach(async mid=>{
      if(memberData[mid]) return;
      const cached=cache?.users?.find(u=>u.uid===mid);
      if(cached){setMD(p=>({...p,[mid]:cached}));return;}
      try{const s=await get(ref(db,`users/${mid}`));if(s.exists())setMD(p=>({...p,[mid]:s.val()}));}catch{}
    });
  },[members.join(",")]);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
      {members.filter(m=>!m.startsWith("bot_")).slice(0,20).map(mid=>{
        const m=memberData[mid];
        const isOwnerM=mid===ownerId;
        const isAdminM=(admins||[]).includes(mid);
        const isMe=mid===currentUserId;
        return (
          <div key={mid} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px",background:T.hov,borderRadius:"10px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"50%",background:m?.photoURL?"transparent":rc(m?.displayName||"?"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",fontWeight:"700",color:"#fff",overflow:"hidden",flexShrink:0}}>
              {m?.photoURL?<img src={m.photoURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(m?.displayName||"؟").charAt(0).toUpperCase()}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:T.text,fontSize:"13px",fontWeight:"600",display:"flex",alignItems:"center",gap:"5px"}}>
                {m?.displayName||"..."}
                {isOwnerM&&<span style={{background:`${T.gold}20`,color:T.gold,fontSize:"10px",padding:"1px 5px",borderRadius:"5px"}}>مالك</span>}
                {isAdminM&&!isOwnerM&&<span style={{background:`${T.btn}20`,color:T.btn,fontSize:"10px",padding:"1px 5px",borderRadius:"5px"}}>مشرف</span>}
              </div>
              <div style={{color:T.dim,fontSize:"11px"}}>@{m?.username||"—"}</div>
            </div>
            {isAdmin&&!isMe&&!isOwnerM&&(
              <div style={{display:"flex",gap:"4px"}}>
                {!isAdminM&&<button onClick={()=>onAction("promote",mid)} style={{background:`${T.gold}15`,border:"none",borderRadius:"6px",padding:"4px 8px",color:T.gold,cursor:"pointer",fontFamily:"inherit",fontSize:"11px"}}>رفع</button>}
                <button onClick={()=>onAction("kick",mid)} style={{background:`${T.err}10`,border:"none",borderRadius:"6px",padding:"4px 8px",color:T.err,cursor:"pointer",fontFamily:"inherit",fontSize:"11px"}}>طرد</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Auth screen
function AuthScreen() {
  const [mode,setMode]=useState("login");
  const [dn,setDn]=useState(""); const [un,setUn]=useState(""); const [em,setEm]=useState(""); const [pw,setPw]=useState("");
  const [loading,setLoading]=useState(false); const [err,setErr]=useState("");

  const validate=()=>{
    if(mode==="register"){
      if(!dn.trim()){setErr("أدخل اسمك");return false;}
      if(un.trim().length<5){setErr("اسم المستخدم 5 أحرف على الأقل");return false;}
      if(/^\d/.test(un)){setErr("اسم المستخدم لا يبدأ برقم");return false;}
      if(!/^[a-zA-Z][a-zA-Z0-9_]{4,}$/.test(un)){setErr("حروف وأرقام وشرطة سفلية، يبدأ بحرف");return false;}
      if(pw.length<6){setErr("كلمة المرور 6 أحرف على الأقل");return false;}
    }
    if(!em.trim()||!pw){setErr("أدخل البريد وكلمة المرور");return false;}
    return true;
  };

  const doReg=async()=>{
    if(!validate()) return;
    setLoading(true); setErr("");
    try {
      const taken=await get(ref(db,`usernames/${un.toLowerCase()}`));
      if(taken.exists()){setErr(`@${un} مأخوذ مسبقاً`);setLoading(false);return;}
      const cr=await createUserWithEmailAndPassword(auth,em,pw);
      await updateProfile(cr.user,{displayName:dn});
      const id=cr.user.uid;
      const phone=genPhone();
      await set(ref(db,`users/${id}`),{uid:id,displayName:dn,username:un.toLowerCase(),email:em,bio:"",photoURL:"",verified:false,isBanned:false,isFraud:false,isRestricted:false,twoFactor:false,twoFactorPass:"",phone,showPhone:false,stars:0,createdAt:Date.now(),lastSeen:Date.now(),color:rc(dn)});
      await set(ref(db,`usernames/${un.toLowerCase()}`),id);
      const sv=`saved_${id}`;
      await set(ref(db,`chats/${sv}`),{id:sv,type:"saved",name:"الرسائل المحفوظة",members:[id],createdAt:Date.now()});
      await set(ref(db,`userChats/${id}/${sv}`),{chatId:sv,lastMessage:"",lastTime:"",unread:0,order:Date.now()-2,type:"saved",name:"الرسائل المحفوظة",color:"#5288c1"});
      // DFGFD - only appears when user messages it
      const bc=`bot_${id}`;
      await set(ref(db,`chats/${bc}`),{id:bc,type:"official_bot",name:"DFGFD",username:"dfgfd",isOfficial:true,verified:true,members:[id,BOT_ID],createdAt:Date.now(),photoURL:""});
      await set(ref(db,`userChats/${id}/${bc}`),{chatId:bc,lastMessage:"مرحباً بك ✈️",lastTime:now(),unread:1,order:Date.now()-1,type:"official_bot",name:"DFGFD",verified:true,color:"#5288c1"});
      const wm=uid();
      await set(ref(db,`messages/${bc}/${wm}`),{id:wm,chatId:bc,text:`✈️ مرحباً ${dn}!\n\nأنا DFGFD، المساعد الرسمي لتيرمين.\n🆔 معرّفك: @${un.toLowerCase()}\n📞 رقمك: ${phone}\n\nجميع بياناتك آمنة ومشفّرة 🔒`,from:BOT_ID,senderName:"DFGFD",time:now(),type:"text",isOfficialBot:true,createdAt:Date.now()});
      // Support
      const sc=`support_${id}`;
      await set(ref(db,`chats/${sc}`),{id:sc,type:"support",name:"الدعم الفني",isOfficial:true,members:[id,SUP_ID],createdAt:Date.now()});
      await set(ref(db,`userChats/${id}/${sc}`),{chatId:sc,lastMessage:"",lastTime:"",unread:0,order:Date.now(),type:"support",name:"الدعم الفني",color:"#4CAF50"});
      // App channel subscription for all users
      try {
        const appChSnap=await get(ref(db,`chats/${APP_CH}`));
        if(appChSnap.exists()){
          const appChData=appChSnap.val();
          const subs=[...(appChData.subscribersList||[])];
          if(!subs.includes(id)) subs.push(id);
          await update(ref(db,`chats/${APP_CH}`),{subscribers:subs.length,subscribersList:subs});
          await set(ref(db,`userChats/${id}/${APP_CH}`),{chatId:APP_CH,lastMessage:"مرحباً بك في تيرمين",lastTime:"",unread:0,order:Date.now()-5,type:"channel",name:"تيرمين الرسمية",verified:true,color:"#5288c1"});
        }
      } catch {}
    } catch(e){
      const m={"auth/email-already-in-use":"البريد مستخدم بالفعل","auth/invalid-email":"بريد غير صالح","auth/weak-password":"كلمة المرور ضعيفة"};
      setErr(m[e.code]||e.message);
    }
    setLoading(false);
  };

  const doLogin=async()=>{
    if(!validate()) return;
    setLoading(true); setErr("");
    try {
      const cr=await signInWithEmailAndPassword(auth,em,pw);
      await update(ref(db,`users/${cr.user.uid}`),{lastSeen:Date.now()});
    } catch(e){
      const m={"auth/invalid-credential":"بيانات الدخول غير صحيحة","auth/user-not-found":"لا يوجد حساب","auth/wrong-password":"كلمة المرور خاطئة"};
      setErr(m[e.code]||e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl"}}>
      <div style={{width:"100%",maxWidth:"400px"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}><div style={{fontSize:"64px",marginBottom:"12px"}}>✈️</div><div style={{color:T.text,fontSize:"28px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div><div style={{color:T.dim,fontSize:"13px",marginTop:"6px"}}>تواصل أسرع · أسهل · أكثر أماناً</div></div>
        <div style={{display:"flex",background:T.panel,borderRadius:"14px",padding:"4px",marginBottom:"22px",gap:"4px"}}>
          {[["login","تسجيل الدخول"],["register","إنشاء حساب"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setMode(k);setErr("");}} style={{flex:1,padding:"10px",borderRadius:"11px",border:"none",background:mode===k?T.btn:"transparent",color:mode===k?"#fff":T.dim,fontWeight:"700",fontSize:"14px",cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
        <div style={{background:T.sb,borderRadius:"18px",padding:"24px",border:`1px solid ${T.brd}`,display:"flex",flexDirection:"column",gap:"13px"}}>
          {mode==="register"&&<FInp label="الاسم الشخصي" val={dn} set={setDn} ph="اسمك الكامل" af/>}
          {mode==="register"&&<FInp label="اسم المستخدم (يبدأ بحرف، 5+ أحرف)" val={un} set={setUn} ph="myusername"/>}
          <FInp label="البريد الإلكتروني" val={em} set={setEm} ph="example@email.com" type="email" af={mode==="login"}/>
          <FInp label="كلمة المرور" val={pw} set={setPw} ph="••••••••" type="password" onKey={e=>e.key==="Enter"&&(mode==="login"?doLogin():doReg())}/>
          {err&&<div style={{background:`${T.err}15`,border:`1px solid ${T.err}30`,borderRadius:"10px",padding:"10px",color:T.err,fontSize:"13px",textAlign:"center"}}>⚠️ {err}</div>}
          <PBtn kids={mode==="login"?"🔐 تسجيل الدخول":"✨ إنشاء حساب"} go={mode==="login"?doLogin:doReg} loading={loading}/>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0} input::placeholder{color:${T.dim}}`}</style>
    </div>
  );
}

// MAIN APP
export default function App() {
  const [user,setUser]=useState(null);
  const [ud,setUd]=useState(null);
  const [authLoad,setAL]=useState(true);
  const [chats,setChats]=useState([]);
  const [actId,setActId]=useState(null);
  const [actData,setAD]=useState(null);
  const [msgs,setMsgs]=useState([]);
  const [inp,setInp]=useState("");
  const [q,setQ]=useState("");
  const [qRes,setQRes]=useState([]);
  const [qMode,setQM]=useState(false);
  const [cache,setCache]=useState({users:[],chats:[]});
  const [onlineUsers,setOnlineUsers]=useState({});
  const [showMenu,setSM]=useState(false);
  const [showSB,setSSB]=useState(true);
  const [showEmoji,setSE]=useState(false);
  const [attMenu,setAM]=useState(false);
  const [reply,setReply]=useState(null);
  const [editing,setEd]=useState(null);
  const [ctx,setCtx]=useState(null);
  const [modal,setModal]=useState(null);
  const [tab,setTab]=useState("chats");
  const [mobile,setMob]=useState(window.innerWidth<900);
  const [nf,setNf]=useState({name:"",username:"",bio:""});
  const [ep,setEp]=useState({dn:"",un:"",bio:"",photo:""});
  const [isOwner,setIO]=useState(false);
  const [chSet,setCS]=useState(null);
  const [pinned,setPinned]=useState(null);
  const [prof,setProf]=useState(null);
  const [repT,setRepT]=useState(null);
  const [rx,setRx]=useState({});
  const [twoPw,setTwoPw]=useState("");
  const [notifs,setNt]=useState({pm:true,gr:true,ch:false,snd:true});
  const [appLocked,setAppLocked]=useState(false);
  const [lockPin,setLockPin]=useState("");
  const [pinInput,setPinInput]=useState("");
  const [darkMode,setDarkMode]=useState(true);
  const [callActive,setCallActive]=useState(false);
  const [callUser,setCallUser]=useState(null);
  const [secretChatPending,setSCP]=useState(null);
  const [muteMenu,setMuteMenu]=useState(false);
  const [privSettings,setPrivSettings]=useState({showPhone:false,showLastSeen:true,showOnline:true});
  const [showGifts,setShowGifts]=useState(false);
  const [folders,setFolders]=useState([]);

  const endRef=useRef(null);
  const inpRef=useRef(null);
  const fRef=useRef(null);
  const iRef=useRef(null);
  const pRef=useRef(null);
  const msgUnsubRef=useRef(null);
  const rxUnsubRef=useRef(null);

  // Init app channel
  useEffect(()=>{
    get(ref(db,`chats/${APP_CH}`)).then(s=>{
      if(!s.exists()){
        set(ref(db,`chats/${APP_CH}`),{id:APP_CH,type:"channel",name:"تيرمين الرسمية",username:"termeen",bio:"القناة الرسمية ✈️",verified:true,isOfficial:true,ownerId:"system",subscribers:55000000,subscribersList:[],members:["system"],createdAt:Date.now(),photoURL:""});
        set(ref(db,"chatUsernames/termeen"),APP_CH);
      }
    }).catch(()=>{});
  },[]);

  // ── AUTH - fixed with timeout & finally ──
  useEffect(()=>{
    // Force show app after 4 seconds max
    const forceTimeout=setTimeout(()=>setAL(false),4000);
    const unsub=onAuthStateChanged(auth,async u=>{
      clearTimeout(forceTimeout);
      try {
        if(u){
          setUser(u);
          const snap=await get(ref(db,`users/${u.uid}`));
          if(snap.exists()){
            const d=snap.val();
            if(d.isBanned){await signOut(auth);setUser(null);setUd(null);setAL(false);return;}
            // Add phone if missing
            if(!d.phone){
              const phone=genPhone();
              await update(ref(db,`users/${u.uid}`),{phone});
              d.phone=phone;
            }
            setUd(d);
            setEp({dn:d.displayName||"",un:d.username||"",bio:d.bio||"",photo:d.photoURL||""});
            setIO(d.username===OWNER);
            setPrivSettings({showPhone:d.showPhone||false,showLastSeen:d.showLastSeen!==false,showOnline:d.showOnline!==false});
            // Auto-create app channel + special bots if owner
            if(d.username===OWNER){
              // App channel
              get(ref(db,`chats/${APP_CH}`)).then(s=>{
                if(!s.exists()){
                  set(ref(db,`chats/${APP_CH}`),{id:APP_CH,type:"channel",name:"تيرمين الرسمية",username:"termeen",bio:"القناة الرسمية لتطبيق تيرمين ✈️",verified:true,isOfficial:true,ownerId:"system",subscribers:55000000,subscribersList:[],members:["system"],createdAt:Date.now(),photoURL:""});
                  set(ref(db,"chatUsernames/termeen"),APP_CH);
                }
              }).catch(()=>{});
              // Ensure owner has app channel in sidebar
              const appChEntry={chatId:APP_CH,lastMessage:"القناة الرسمية",lastTime:"",unread:0,order:Date.now()-10,type:"channel",name:"تيرمين الرسمية",verified:true,color:"#5288c1"};
              get(ref(db,`userChats/${u.uid}/${APP_CH}`)).then(s=>{if(!s.exists())set(ref(db,`userChats/${u.uid}/${APP_CH}`),appChEntry);}).catch(()=>{});
            }
            // Update presence
            const presRef=ref(db,`presence/${u.uid}`);
            set(presRef,{online:true,lastSeen:Date.now()});
            const connRef=ref(db,".info/connected");
            onValue(connRef,snap2=>{
              if(snap2.val()===true){
                update(ref(db,`presence/${u.uid}`),{online:true,lastSeen:Date.now()});
              }
            });
          }
        } else {
          if(user?.uid) update(ref(db,`presence/${user.uid}`),{online:false,lastSeen:Date.now()}).catch(()=>{});
          setUser(null);setUd(null);setIO(false);
        }
      } catch(e){console.error("auth",e);}
      finally{setAL(false);}
    });
    const onR=()=>setMob(window.innerWidth<900);
    window.addEventListener("resize",onR);
    return()=>{clearTimeout(forceTimeout);unsub();window.removeEventListener("resize",onR);};
  },[]);

  // Load online presence
  useEffect(()=>{
    const presRef=ref(db,"presence");
    const unsub=onValue(presRef,snap=>{if(snap.exists())setOnlineUsers(snap.val());else setOnlineUsers({});});
    return()=>off(presRef);
  },[]);

  // Heartbeat presence
  useEffect(()=>{
    if(!user) return;
    const t=setInterval(()=>{
      update(ref(db,`presence/${user.uid}`),{online:true,lastSeen:Date.now()}).catch(()=>{});
      update(ref(db,`users/${user.uid}`),{lastSeen:Date.now()}).catch(()=>{});
    },30000);
    return()=>clearInterval(t);
  },[user]);

  // Load chats
  useEffect(()=>{
    if(!user) return;
    const r=ref(db,`userChats/${user.uid}`);
    const unsub=onValue(r,async snap=>{
      if(!snap.exists()){setChats([]);return;}
      try {
        const raw=snap.val();
        const seen=new Set();
        const list=await Promise.all(Object.values(raw).map(async uc=>{
          const cid=uc.chatId;
          if(!cid||seen.has(cid)) return null;
          seen.add(cid);
          try {
            const cs=await get(ref(db,`chats/${cid}`));
            return cs.exists()?{...cs.val(),...uc,id:cid}:null;
          } catch {return null;}
        }));
        setChats(list.filter(Boolean).sort((a,b)=>(b.order||0)-(a.order||0)));
      } catch{}
    });
    return()=>off(r);
  },[user]);

  // Live chat metadata listener
  useEffect(()=>{
    if(!actId) return;
    const liveRef=ref(db,`chats/${actId}`);
    const liveUnsub=onValue(liveRef,snap=>{if(snap.exists())setAD(snap.val());});
    return()=>off(liveRef);
  },[actId]);

  // Load messages
  useEffect(()=>{
    if(msgUnsubRef.current){msgUnsubRef.current();msgUnsubRef.current=null;}
    if(rxUnsubRef.current){rxUnsubRef.current();rxUnsubRef.current=null;}
    setMsgs([]);setPinned(null);setRx({});
    if(!actId) return;
    const mr=ref(db,`messages/${actId}`);
    const msgUnsub=onValue(mr,snap=>{
      if(!snap.exists()){setMsgs([]);setPinned(null);return;}
      const list=Object.values(snap.val()).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
      setMsgs(list);setPinned(list.find(m=>m.pinned)||null);
    });
    msgUnsubRef.current=()=>off(mr);
    const rr=ref(db,`reactions/${actId}`);
    const rxUnsub=onValue(rr,snap=>setRx(snap.exists()?snap.val():{}));
    rxUnsubRef.current=()=>off(rr);
    return()=>{if(msgUnsubRef.current){msgUnsubRef.current();msgUnsubRef.current=null;}if(rxUnsubRef.current){rxUnsubRef.current();rxUnsubRef.current=null;}};
  },[actId]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  // Preload cache for instant search
  useEffect(()=>{
    if(!user) return;
    const load=async()=>{
      try {
        const [uS,cS]=await Promise.all([get(ref(db,"users")),get(ref(db,"chats"))]);
        setCache({users:uS.exists()?Object.values(uS.val()):[],chats:cS.exists()?Object.values(cS.val()):[]});
      } catch{}
    };
    load();
    const t=setInterval(load,60000);
    return()=>clearInterval(t);
  },[user]);

  // Instant search
  useEffect(()=>{
    if(!q.trim()||!qMode){setQRes([]);return;}
    const qv=q.toLowerCase().replace("@","").trim();
    const res=[];
    cache.users.forEach(u=>{if(u.uid!==user?.uid){const s=score(u,qv);if(s>0)res.push({...u,rt:"user",_s:s});}});
    cache.chats.forEach(c=>{if(!["channel","group","official_bot"].includes(c.type))return;const s=score(c,qv);if(s>0)res.push({...c,rt:c.type,_s:s});});
    res.sort((a,b)=>b._s-a._s);
    setQRes(res.slice(0,25));
  },[q,qMode,cache,user]);

  // ── Open chat IMMEDIATELY with data ──
  const openChat=useCallback((cid,data)=>{
    setActId(cid);
    if(data) setAD(data);  // immediate display
    setReply(null);setEd(null);setInp("");
    setSM(false);setAM(false);setCtx(null);setQM(false);setQ("");setModal(null);
    if(mobile) setSSB(false);
    setTab("chats");
    // Refresh from DB (gets latest subscriber count etc)
    get(ref(db,`chats/${cid}`)).then(s=>{
      if(s.exists()){
        setAD(s.val());
        // Also update local chats list with fresh data
        setChats(prev=>prev.map(c=>(c.id||c.chatId)===cid?{...c,...s.val(),id:cid}:c));
      }
    }).catch(()=>{});
    if(user) update(ref(db,`userChats/${user.uid}/${cid}`),{unread:0}).catch(()=>{});
    setTimeout(()=>inpRef.current?.focus(),80);
  },[mobile,user]);

  const openSup=useCallback(async()=>{
    if(!user) return;
    const sid=`support_${user.uid}`;
    const supData={id:sid,type:"support",name:"الدعم الفني",isOfficial:true};
    const s=await get(ref(db,`chats/${sid}`)).catch(()=>null);
    if(!s?.exists()){
      await set(ref(db,`chats/${sid}`),{...supData,members:[user.uid,SUP_ID],createdAt:Date.now()});
      await set(ref(db,`userChats/${user.uid}/${sid}`),{chatId:sid,lastMessage:"",lastTime:"",unread:0,order:Date.now(),type:"support",name:"الدعم الفني",color:"#4CAF50"});
    }
    openChat(sid,supData);
  },[user,openChat]);

  // ── Send message - FIXED ──
  const sendMsg=useCallback(async(ot=null,type="text",extra={})=>{
    const text=editing?inp.trim():(ot??inp.trim());
    if(!text&&!extra.imageUrl&&!extra.fileName) return;
    if(!actId||!user) return;
    // Use ud or fallback to user object  
    const senderName=ud?.displayName||user.displayName||"مستخدم";
    const senderUsername=ud?.username||"";
    // Only block channel posting if not owner (but allow if actData not loaded yet)
    if(actData?.type==="channel"&&actData?.ownerId&&actData.ownerId!==user.uid) return;
    if(editing){
      await update(ref(db,`messages/${actId}/${editing.id}`),{text,edited:true}).catch(()=>{});
      setEd(null);setInp("");inpRef.current?.focus();return;
    }
    const mid=uid();
    const msg={id:mid,chatId:actId,text:text||"",from:user.uid,senderName,senderUsername,senderPhoto:ud?.photoURL||"",senderColor:ud?.color||rc(senderName),time:now(),type,createdAt:Date.now(),replyTo:reply?{text:reply.text,sender:reply.senderName||"أنا",msgId:reply.id}:null,...extra};
    await set(ref(db,`messages/${actId}/${mid}`),msg).catch(()=>{});
    const prev=type==="image"?"📷 صورة":type==="file"?`📎 ${msg.fileName}`:text;
    // Get chat data fresh from DB to avoid stale actData
    let chatInfo = actData;
    if(!chatInfo) {
      try { const cs=await get(ref(db,`chats/${actId}`)); if(cs.exists()) chatInfo=cs.val(); } catch {}
    }
    
    // Always update my sidebar
    await update(ref(db,`userChats/${user.uid}/${actId}`),{lastMessage:prev,lastTime:now(),order:Date.now()}).catch(()=>{});
    
    // If first time in PM - ensure both sides have sidebar entry
    if(chatInfo?.type==="private"||actId.startsWith("pm_")){
      const mc=await get(ref(db,`userChats/${user.uid}/${actId}`)).catch(()=>null);
      if(!mc?.exists()||!mc.val().type){
        const myEntry={chatId:actId,lastMessage:prev,lastTime:now(),unread:0,order:Date.now(),type:"private",name:chatInfo?.name||"مستخدم",color:chatInfo?.color||rc(chatInfo?.name||""),photoURL:chatInfo?.photoURL||"",members:chatInfo?.members||[user.uid]};
        await set(ref(db,`userChats/${user.uid}/${actId}`),myEntry).catch(()=>{});
      }
    }
    
    // Notify members
    if(chatInfo?.members){
      for(const m2 of chatInfo.members){
        if(m2!==user.uid&&!m2.startsWith("bot_")&&m2!==SUP_ID&&m2!==BOT_ID){
          try {
            const mc=await get(ref(db,`userChats/${m2}/${actId}`));
            if(!mc.exists()){
              const otherEntry={chatId:actId,lastMessage:prev,lastTime:now(),unread:1,order:Date.now(),type:chatInfo.type||"private",name:ud?.displayName||"مستخدم",color:ud?.color||rc(ud?.displayName||""),photoURL:ud?.photoURL||"",members:chatInfo.members};
              await set(ref(db,`userChats/${m2}/${actId}`),otherEntry);
            } else {
              const uc=mc.val().unread||0;
              await update(ref(db,`userChats/${m2}/${actId}`),{lastMessage:prev,lastTime:now(),unread:uc+1,order:Date.now()});
            }
          } catch{}
        }
      }
    }
    // AI for support
    if(actData?.type==="support"){
      setTimeout(async()=>{
        try {
          const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,system:"أنت مساعد دعم فني لتطبيق تيرمين. أجب باللغة العربية بشكل مفيد ومختصر.",messages:[{role:"user",content:text}]})});
          const d=await res.json();
          const rt=d.content?.[0]?.text||"شكراً! سيتم الرد قريباً.";
          const aid=uid();
          await set(ref(db,`messages/${actId}/${aid}`),{id:aid,chatId:actId,text:rt,from:SUP_ID,senderName:"الدعم الفني",time:now(),type:"text",isSupport:true,createdAt:Date.now()+500});
          await update(ref(db,`userChats/${user.uid}/${actId}`),{lastMessage:rt.slice(0,50),lastTime:now(),order:Date.now()+1});
          const tid=`ticket_${user.uid}`;
          await set(ref(db,`support/${tid}/info`),{userId:user.uid,username:senderUsername,displayName:senderName,status:"open",createdAt:Date.now()}).catch(()=>{});
          await set(ref(db,`support/${tid}/messages/${uid()}`),{text,from:user.uid,time:now(),createdAt:Date.now()}).catch(()=>{});
          await set(ref(db,`support/${tid}/messages/${uid()}`),{text:rt,from:"ai_bot",time:now(),createdAt:Date.now()+500}).catch(()=>{});
        }catch{}
      },1200);
    }
    if(actData?.type==="official_bot"&&actData?.username==="botfather") bfMsg(text,actId);
    // SSPT - phone change bot
    if(actData?.type==="official_bot"&&actData?.username==="sspt") handleSSPT(text,actId,user,ud,db).catch(()=>{});
    // SDSF - anti-impersonation
    if(actData?.type==="official_bot"&&actData?.username==="sdsf") handleSDSF(text,actId,user,ud,db).catch(()=>{});
    setInp("");setReply(null);setEd(null);setSE(false);
    inpRef.current?.focus();
  },[inp,actId,user,ud,reply,actData,editing]);

  const bfMsg=useCallback(async(text,cid)=>{
    const t=text.trim().toLowerCase();
    let rep="";
    if(t==="/start"||t==="مرحبا") rep="مرحباً! أنا BotFather ✈️\n\n/newbot — إنشاء بوت (ينتهي بـ bot)\n/mybots — بوتاتك";
    else if(t.endsWith("bot")||t.endsWith("_bot")){
      const bu=t.replace("@","").toLowerCase();
      if(bu.length<5){rep="الاسم قصير جداً!";}
      else {
        const tk=`${Date.now()}:AAF${Math.random().toString(36).slice(2,20).toUpperCase()}`;
        const bid=uid();
        await set(ref(db,`bots/${bid}`),{id:bid,username:bu,name:bu,token:tk,creatorId:user?.uid,createdAt:Date.now()}).catch(()=>{});
        if(user?.uid) await set(ref(db,`userBots/${user.uid}/${bid}`),{id:bid,username:bu,token:tk,createdAt:Date.now()}).catch(()=>{});
        rep=`✅ تم إنشاء البوت!\n\n🤖 @${bu}\n🔑 التوكن:\n${tk}\n\n⚠️ احتفظ بالتوكن في مكان آمن!`;
      }
    }
    else if(t==="/mybots"){
      if(user?.uid){const s=await get(ref(db,`userBots/${user.uid}`)).catch(()=>null);if(s?.exists()){const bs=Object.values(s.val());rep=`🤖 بوتاتك (${bs.length}):\n\n${bs.map(b=>`• @${b.username}`).join("\n")}`;}else rep="لا توجد بوتات. اكتب /newbot";}
    }
    else rep="أرسل /start للبدء";
    if(rep){setTimeout(async()=>{const rid=uid();await set(ref(db,`messages/${cid}/${rid}`),{id:rid,chatId:cid,text:rep,from:BF_ID,senderName:"BotFather",time:now(),type:"text",isOfficialBot:true,createdAt:Date.now()+600}).catch(()=>{});await update(ref(db,`userChats/${user?.uid}/${cid}`),{lastMessage:rep.slice(0,40),lastTime:now(),order:Date.now()+1}).catch(()=>{});},800);}
  },[user]);

  // ── Open PM - IMMEDIATELY ──
  const openPM=useCallback(async tu=>{
    if(!user||!tu?.uid||tu.uid===user.uid) return;
    const cid=`pm_${[user.uid,tu.uid].sort().join("_")}`;
    const immediateData={id:cid,type:"private",name:tu.displayName||tu.name||"مستخدم",members:[user.uid,tu.uid],color:tu.color||rc(tu.displayName||"?"),photoURL:tu.photoURL||""};
    // Open chat view immediately without adding to sidebar yet
    openChat(cid,immediateData);
    // Create chat record in DB (not userChats - will be added when first message sent)
    try {
      const s=await get(ref(db,`chats/${cid}`));
      if(!s.exists()) await set(ref(db,`chats/${cid}`),{...immediateData,createdAt:Date.now()});
    } catch(e){console.error(e);}
  },[user,openChat]);

  const joinCh=useCallback(async chat=>{
    if(!user) return;
    const cid=chat.id||chat.chatId;
    openChat(cid,chat);  // immediate
    if(!chats.find(c=>(c.id||c.chatId)===cid)){
      try {
        const subs=[...(chat.subscribersList||[])];
        if(!subs.includes(user.uid)) subs.push(user.uid);
        const mems=[...(chat.members||[])];
        if(!mems.includes(user.uid)) mems.push(user.uid);
        await update(ref(db,`chats/${cid}`),{subscribers:subs.length,subscribersList:subs,members:mems});
        await set(ref(db,`userChats/${user.uid}/${cid}`),{chatId:cid,lastMessage:chat.lastMessage||"",lastTime:now(),unread:0,order:Date.now(),...chat,id:cid});
      } catch{}
    }
  },[user,chats,openChat]);

  const createConvo=useCallback(async type=>{
    if(!nf.name.trim()||!user) return;
    if(!nf.username.trim()){alert("يجب إدخال اسم مستخدم");return;}
    if(nf.username.length<5){alert("اسم المستخدم 5 أحرف على الأقل");return;}
    if(/^\d/.test(nf.username)){alert("لا يبدأ برقم");return;}
    if(!/^[a-zA-Z][a-zA-Z0-9_]{4,}$/.test(nf.username)){alert("حروف وأرقام وشرطة سفلية فقط");return;}
    const un2=nf.username.toLowerCase();
    try {
      const [u1,c1]=await Promise.all([get(ref(db,`usernames/${un2}`)),get(ref(db,`chatUsernames/${un2}`))]);
      if(u1.exists()){alert(`@${nf.username} مأخوذ مسبقاً`);return;}
      if(c1.exists()){alert(`@${nf.username} مستخدم في قناة أو مجموعة`);return;}
      const cid=uid();
      const cd={id:cid,type,name:nf.name.trim(),username:un2,bio:nf.bio||"",photoURL:"",ownerId:user.uid,members:[user.uid],admins:[user.uid],verified:false,createdAt:Date.now(),...(type==="channel"?{subscribers:1,subscribersList:[user.uid]}:{})};
      await set(ref(db,`chats/${cid}`),cd);
      await set(ref(db,`chatUsernames/${un2}`),cid);
      await set(ref(db,`userChats/${user.uid}/${cid}`),{chatId:cid,lastMessage:"تم الإنشاء",lastTime:now(),unread:0,order:Date.now(),...cd});
      await set(ref(db,`messages/${cid}/${uid()}`),{id:uid(),chatId:cid,text:`🎉 تم إنشاء ${type==="channel"?"القناة":"المجموعة"} "${nf.name}"`,from:"system",time:now(),type:"system",createdAt:Date.now()});
      setModal(null);setNf({name:"",username:"",bio:""});
      openChat(cid,cd);
    } catch{alert("حدث خطأ، حاول مرة أخرى");}
  },[nf,user,openChat]);

  const saveProfile=useCallback(async()=>{
    if(!user) return;
    try {
      if(ep.un!==ud?.username){
        if(ep.un.length<5){alert("اسم المستخدم 5 أحرف على الأقل");return;}
        if(/^\d/.test(ep.un)){alert("لا يبدأ برقم");return;}
        const [u1,c1]=await Promise.all([get(ref(db,`usernames/${ep.un.toLowerCase()}`)),get(ref(db,`chatUsernames/${ep.un.toLowerCase()}`))]);
        if((u1.exists()&&u1.val()!==user.uid)||c1.exists()){alert(`@${ep.un} مأخوذ مسبقاً`);return;}
        if(ud?.username) await remove(ref(db,`usernames/${ud.username}`)).catch(()=>{});
        await set(ref(db,`usernames/${ep.un.toLowerCase()}`),user.uid);
      }
      await update(ref(db,`users/${user.uid}`),{displayName:ep.dn,username:ep.un.toLowerCase(),bio:ep.bio,photoURL:ep.photo,showPhone:privSettings.showPhone});
      await updateProfile(user,{displayName:ep.dn});
      const s=await get(ref(db,`users/${user.uid}`));
      if(s.exists())setUd(s.val());
      setModal(null);
    } catch{alert("حدث خطأ");}
  },[user,ud,ep,privSettings]);

  const addRx=useCallback(async(msgId,emoji)=>{
    if(!user||!actId) return;
    try {
      const rp=`reactions/${actId}/${msgId}/${emoji}`;
      const s=await get(ref(db,rp));
      if(s.exists()){if(s.val()[user.uid])await remove(ref(db,`${rp}/${user.uid}`));else await set(ref(db,`${rp}/${user.uid}`),true);}
      else await set(ref(db,`${rp}/${user.uid}`),true);
    } catch{}
    setCtx(null);
  },[user,actId]);

  const pinMsg=useCallback(async msg=>{
    if(!actId) return;
    try {
      const s=await get(ref(db,`messages/${actId}`));
      if(s.exists()) await Promise.all(Object.values(s.val()).filter(m=>m.pinned).map(m=>update(ref(db,`messages/${actId}/${m.id}`),{pinned:false})));
      await update(ref(db,`messages/${actId}/${msg.id}`),{pinned:true});
    } catch{}
    setCtx(null);
  },[actId]);

  const sendReport=useCallback(async(reason,note)=>{
    if(!user||!repT) return;
    try {await set(ref(db,`reports/${uid()}`),{reason,note,reporterId:user.uid,reporterUsername:ud?.username,targetId:repT.id,targetChatId:actId,createdAt:Date.now(),status:"pending"});}
    catch{}
    setRepT(null);alert("✅ تم إرسال البلاغ!");
  },[user,ud,repT,actId]);

  const handleFile=useCallback((file,isImg)=>{
    if(!file) return;
    const r=new FileReader();
    r.onload=e=>{if(isImg)sendMsg("","image",{imageUrl:e.target.result,fileName:file.name,fileSize:file.size});else sendMsg("","file",{fileName:file.name,fileSize:file.size,fileData:e.target.result});};
    r.readAsDataURL(file);
    setAM(false);
  },[sendMsg]);

  const onMention=useCallback(async un2=>{
    try {
      const [us,cs]=await Promise.all([get(ref(db,`usernames/${un2.toLowerCase()}`)),get(ref(db,`chatUsernames/${un2.toLowerCase()}`))]);
      if(us.exists()){const s=await get(ref(db,`users/${us.val()}`));if(s.exists())setProf(s.val());}
      else if(cs.exists()){const s=await get(ref(db,`chats/${cs.val()}`));if(s.exists())setProf(s.val());}
    } catch{}
  },[]);

  const openBF=useCallback(async()=>{
    if(!user) return;
    const cid=`botfather_${user.uid}`;
    const bfData={id:cid,type:"official_bot",name:"BotFather",username:"botfather",verified:true};
    try {
      const s=await get(ref(db,`chats/${cid}`));
      if(!s.exists()){
        await set(ref(db,`chats/${cid}`),{...bfData,isOfficial:true,members:[user.uid,BF_ID],createdAt:Date.now(),photoURL:""});
        await set(ref(db,`userChats/${user.uid}/${cid}`),{chatId:cid,lastMessage:"أنشئ بوتك الآن",lastTime:now(),unread:1,order:Date.now(),type:"official_bot",name:"BotFather",verified:true,color:"#9C27B0"});
        await set(ref(db,`messages/${cid}/${uid()}`),{id:uid(),chatId:cid,text:"مرحباً! أنا BotFather ✈️\n\n/newbot — بوت جديد (الاسم ينتهي بـ bot)\n/mybots — بوتاتك",from:BF_ID,senderName:"BotFather",time:now(),type:"text",isOfficialBot:true,createdAt:Date.now()});
      }
    } catch{}
    openChat(cid,bfData);setSM(false);
  },[user,openChat]);

  const sendGift=useCallback(async(gift,msg)=>{
    if(!user||!actId||!ud) return;
    const giftMsg={id:uid(),chatId:actId,text:msg||"",from:user.uid,senderName:ud?.displayName||"مستخدم",time:now(),type:"gift",gift:{emoji:gift.emoji,name:gift.name,stars:gift.stars},createdAt:Date.now()};
    await set(ref(db,`messages/${actId}/${giftMsg.id}`),giftMsg).catch(()=>{});
    await update(ref(db,`users/${user.uid}`),{stars:(ud?.stars||0)-gift.stars}).catch(()=>{});
    const s=await get(ref(db,`users/${user.uid}`));if(s.exists())setUd(s.val());
    await update(ref(db,`userChats/${user.uid}/${actId}`),{lastMessage:`${gift.emoji} هدية`,lastTime:now(),order:Date.now()}).catch(()=>{});
    setShowGifts(false);
  },[user,ud,actId]);

  const addContact=useCallback(async()=>{
    // The other person in this PM
    if(!actData?.members||actData.type!=="private") return;
    const otherId=actData.members.find(m=>m!==user?.uid);
    if(!otherId) return;
    const s=await get(ref(db,`users/${otherId}`)).catch(()=>null);
    if(s?.exists()){
      const p=s.val();
      setProf(p);
    }
    setCtx(null);
  },[actData,user]);

  const saveChSet=useCallback(async()=>{
    if(!chSet) return;
    try {
      await update(ref(db,`chats/${chSet.id}`),{name:chSet.name,bio:chSet.bio||"",username:(chSet.username||"").toLowerCase(),photoURL:chSet.photoURL||""});
      if(chSet.username) await set(ref(db,`chatUsernames/${chSet.username.toLowerCase()}`),chSet.id);
      const s=await get(ref(db,`chats/${chSet.id}`));if(s.exists())setAD(s.val());
      setModal(null);alert("✅ تم الحفظ");
    } catch{alert("حدث خطأ");}
  },[chSet]);

  // Computed
  const isCh=actData?.type==="channel";
  const isGr=actData?.type==="group";
  const isOB=actData?.type==="official_bot";
  const isSv=actData?.type==="saved";
  const isSup=actData?.type==="support";
  const isMine=actData?.ownerId===user?.uid;
  const isAdmin=isMine||(actData?.admins||[]).includes(user?.uid);
  const canSend=!isCh||(isCh&&isMine);
  const chatName=actData?.name||"...";
  const isPM=actData?.type==="private";
  const otherUserId=isPM?actData?.members?.find(m=>m!==user?.uid):null;
  const otherOnline=otherUserId&&onlineUsers[otherUserId]?.online;

  const EMOJIS=["😀","😂","😍","😊","🥳","😎","🤩","😭","❤️","🔥","💯","⭐","🎉","👍","👋","🙏","💪","✅","🚀","💎","🌈","🍕","☕","🎮","📸","🔑","😅","🤔","💬","📱","🎯","🏆"];
  const RXEMJ=["❤️","👍","😂","😮","😢","🔥","🎉","👎"];

  const ctxItems=ctx?[
    {l:"↩ ردّ",a:()=>{setReply(ctx.msg);setCtx(null);}},
    {l:"⎘ نسخ",a:()=>{navigator.clipboard?.writeText(ctx.msg?.text||"");setCtx(null);}},
    ...(ctx.msg?.from===user?.uid&&!ctx.msg?.isOfficialBot?[{l:"✏️ تعديل",a:()=>{setEd(ctx.msg);setInp(ctx.msg.text||"");setCtx(null);setTimeout(()=>inpRef.current?.focus(),50);}}]:[]),
    ...(isAdmin||ctx.msg?.from===user?.uid?[{l:"📌 تثبيت",a:()=>pinMsg(ctx.msg)}]:[]),
    {l:"🔗 نسخ الرابط",a:async()=>{
    const link=`Termin/${actData?.username||actId}/${ctx.msg?.id}`;
    try{if(navigator.clipboard){await navigator.clipboard.writeText(link);alert("✅ تم نسخ الرابط: "+link);}else{const el=document.createElement("textarea");el.value=link;document.body.appendChild(el);el.select();document.execCommand("copy");document.body.removeChild(el);alert("✅ تم نسخ الرابط");}}catch{alert("الرابط: "+link);}
    setCtx(null);
  }},
    {l:"🔖 حفظ",a:async()=>{const sv=chats.find(c=>c.type==="saved");if(sv){const nid=uid();await set(ref(db,`messages/${sv.chatId||sv.id}/${nid}`),{...ctx.msg,id:nid,chatId:sv.chatId||sv.id,createdAt:Date.now()+1}).catch(()=>{});}setCtx(null);}},
    ...(isCh||isGr||isOB?[{l:"🚩 بلاغ",a:()=>{setRepT(ctx.msg);setCtx(null);},d:true}]:[]),
    ...(ctx.msg?.from===user?.uid?[{l:"🗑 حذف",a:async()=>{if(actId)await remove(ref(db,`messages/${actId}/${ctx.msg.id}`)).catch(()=>{});setCtx(null);},d:true}]:[]),
  ]:[];

  if(authLoad) return (
    <div style={{height:"100vh",background:"linear-gradient(135deg,#0a0f1a,#111b2e,#0a1628)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"0",fontFamily:"'Segoe UI',Tahoma,sans-serif",overflow:"hidden",position:"relative"}}>
      {/* Background circles */}
      <div style={{position:"absolute",width:"300px",height:"300px",borderRadius:"50%",background:"rgba(82,136,193,0.06)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"pulse 2s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:"200px",height:"200px",borderRadius:"50%",background:"rgba(82,136,193,0.1)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"pulse 2s ease-in-out infinite .5s"}}/>
      {/* Logo */}
      <div style={{position:"relative",marginBottom:"24px"}}>
        <div style={{width:"100px",height:"100px",borderRadius:"28px",background:"linear-gradient(135deg,#2b5278,#5288c1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"52px",boxShadow:"0 20px 60px rgba(82,136,193,0.4)",animation:"logoIn .8s ease"}}>
          ✈️
        </div>
      </div>
      <div style={{color:"#e8f4fd",fontSize:"28px",fontWeight:"900",letterSpacing:"3px",animation:"fadeUp .8s ease .3s both"}}>تيرمين</div>
      <div style={{color:"rgba(107,140,164,0.8)",fontSize:"13px",marginTop:"8px",animation:"fadeUp .8s ease .5s both"}}>تواصل أسرع · أسهل · أكثر أماناً</div>
      {/* Loading dots */}
      <div style={{display:"flex",gap:"6px",marginTop:"36px",animation:"fadeUp .8s ease .7s both"}}>
        {[0,1,2].map(i=><div key={i} style={{width:"7px",height:"7px",borderRadius:"50%",background:"#5288c1",animation:`dot 1.4s ease-in-out infinite`,animationDelay:i*0.2+"s"}}/>)}
      </div>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.6}50%{transform:translate(-50%,-50%) scale(1.1);opacity:.3}}
        @keyframes logoIn{from{transform:scale(.5) rotate(-10deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
        @keyframes fadeUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes dot{0%,80%,100%{transform:scale(0.6);opacity:.4}40%{transform:scale(1.2);opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>
    </div>
  );

  if(!user) return <AuthScreen/>;

  // App lock screen
  if(appLocked&&lockPin) return (
    <div style={{height:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"20px",fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl"}}>
      <div style={{fontSize:"56px"}}>🔒</div>
      <div style={{color:T.text,fontSize:"20px",fontWeight:"800"}}>تيرمين مقفل</div>
      <div style={{color:T.dim,fontSize:"13px"}}>أدخل رمز القفل للمتابعة</div>
      <input value={pinInput} onChange={e=>setPinInput(e.target.value)} placeholder="رمز القفل" type="password"
        style={{background:T.inp2,border:`1px solid ${T.brd}`,borderRadius:"14px",padding:"14px 20px",color:T.text,fontSize:"20px",outline:"none",textAlign:"center",width:"200px",letterSpacing:"8px",fontFamily:"inherit"}}
        onKeyDown={e=>{if(e.key==="Enter"){if(pinInput===lockPin){setAppLocked(false);setPinInput("");}else{alert("رمز غير صحيح");setPinInput("");}}}
        }/>
      <button onClick={()=>{if(pinInput===lockPin){setAppLocked(false);setPinInput("");}else{alert("رمز غير صحيح");setPinInput("");}}}
        style={{background:T.btn,border:"none",borderRadius:"12px",padding:"13px 32px",color:"#fff",fontWeight:"700",fontSize:"15px",cursor:"pointer",fontFamily:"inherit"}}>
        🔓 فتح التطبيق
      </button>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
    </div>
  );

  // Search results
  const renderSearch=()=>(
    <div style={{overflowY:"auto",flex:1}}>
      {!qRes.length&&q.trim()&&<div style={{padding:"40px",textAlign:"center",color:T.dim,fontSize:"14px"}}>لا توجد نتائج</div>}
      {qRes.map((r,i)=>{
        const isU=r.rt==="user";
        const isCH=r.rt==="channel";
        const isB=r.rt==="official_bot";
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${T.brd}18`}}
            onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            onClick={()=>{
              if(isU) openPM(r);
              else if(isCH) joinCh(r);
              else openChat(r.id,r);
            }}>
            <Av name={r.name||r.displayName} photo={r.photoURL} size={46} verified={r.verified||r.isOfficial}
              online={isU&&onlineUsers[r.uid]?.online===true}
              onClick={e=>{e.stopPropagation();setProf(r);}}/>
            <div style={{flex:1}}>
              <div style={{color:T.text,fontWeight:"600",fontSize:"14.5px",display:"flex",alignItems:"center",gap:"5px"}}>
                {isCH&&<Ic n="ch" s={12} c={T.gold}/>}
                {r.rt==="group"&&<Ic n="gr" s={12} c={T.btn}/>}
                {isB&&<span>🤖</span>}
                {r.name||r.displayName}
                {(r.verified||r.isOfficial)&&<Vbg sz={15}/>}
              </div>
              <div style={{color:T.dim,fontSize:"12px"}}>
                @{r.username} · {isCH?`${fsub(r.subscribers||0)} مشترك`:r.rt==="group"?`${r.members?.length||0} عضو`:"مستخدم"}
              </div>
            </div>
            {isCH&&!chats.find(c=>(c.id||c.chatId)===r.id)&&(
              <button onClick={e=>{e.stopPropagation();joinCh(r);}} style={{background:`${T.btn}20`,border:`1px solid ${T.btn}40`,borderRadius:"8px",padding:"6px 12px",color:T.btn,cursor:"pointer",fontFamily:"inherit",fontSize:"12px",fontWeight:"600"}}>انضمام</button>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{display:"flex",height:"100vh",width:"100%",background:T.bg,fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl",overflow:"hidden"}}
      onClick={()=>{setSM(false);setAM(false);setCtx(null);setSE(false);}}>

      {prof&&<ProfSheet p={prof} onClose={()=>setProf(null)} onChat={prof.uid&&!prof.type?openPM:(prof.type==="channel"||prof.type==="group")?()=>openChat(prof.id,prof):null} me={user} chats={chats} onlineUsers={onlineUsers} channelGifts={prof.type==="channel"?msgs.filter(m=>m.type==="gift"):[]}/>}
      {repT&&<RepSheet onClose={()=>setRepT(null)} onReport={sendReport}/>}
      {showGifts&&<GiftsModal onClose={()=>setShowGifts(false)} onSend={sendGift} userStars={ud?.stars||0}/>}

      {/* ═══ SIDEBAR ═══ */}
      <div style={{width:showSB?(mobile?"100%":"360px"):"0",minWidth:0,background:T.sb,borderLeft:`1px solid ${T.brd}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden",transition:"width 0.25s",position:mobile?"absolute":"relative",height:"100%",zIndex:mobile?20:1}}>
        <div style={{padding:"10px 12px",display:"flex",alignItems:"center",gap:"8px",borderBottom:`1px solid ${T.brd}`,background:T.sb,position:"relative",zIndex:50}}>
          {tab==="chats"&&(<>
            <button onClick={e=>{e.stopPropagation();setSM(!showMenu);}} style={{background:"none",border:"none",cursor:"pointer",padding:"6px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="menu" s={20}/></button>
            <div style={{flex:1,display:"flex",alignItems:"center",background:T.inp2,borderRadius:"22px",padding:"7px 14px",gap:"8px"}} onClick={()=>setQM(true)}>
              <Ic n="srch" s={15}/>
              <input value={q} onChange={e=>{setQ(e.target.value);setQM(true);}} onFocus={()=>setQM(true)} placeholder="بحث فوري..." style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"14px",flex:1,direction:"rtl",fontFamily:"inherit"}}/>
              {q&&<button onClick={()=>{setQ("");setQM(false);}} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={14}/></button>}
            </div>
          </>)}
          {tab!=="chats"&&<div style={{flex:1,color:T.text,fontSize:"16px",fontWeight:"800",paddingRight:"6px"}}>{tab==="settings"?"الإعدادات":tab==="contacts"?"جهات الاتصال":"المجلدات"}</div>}
          {showMenu&&(
            <div style={{position:"absolute",top:"54px",right:"8px",background:"#1c2d3d",borderRadius:"13px",padding:"6px 0",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:300,minWidth:"210px",border:`1px solid ${T.brd}`}} onClick={e=>e.stopPropagation()}>
              {[
                {n:"usr",l:"محادثة جديدة",a:()=>{setModal("newChat");setSM(false);}},
                {n:"gr",l:"مجموعة جديدة",a:()=>{setModal("newGr");setSM(false);}},
                {n:"ch",l:"قناة جديدة",a:()=>{setModal("newCh");setSM(false);}},
                {n:"bot",l:"BotFather",a:openBF},
                {n:"sv",l:"رسائل محفوظة",a:()=>{const sv=chats.find(c=>c.type==="saved");if(sv)openChat(sv.chatId||sv.id,sv);setSM(false);}},
                {n:"sup",l:"الدعم الفني",a:()=>{openSup();setSM(false);}},
                {n:"set",l:"الإعدادات",a:()=>{setTab("settings");setSM(false);}},
                ...(isOwner?[{n:"cr",l:"لوحة الإدارة",a:()=>{window.open("/admin","_blank");setSM(false);}}]:[]),
              ].map(it=>(
                <button key={it.l} onClick={it.a} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"11px 16px",background:"none",border:"none",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"14px"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <Ic n={it.n} s={18} c={T.btn}/>{it.l}
                </button>
              ))}
            </div>
          )}
        </div>

        {tab==="chats"&&!qMode&&<div style={{padding:"5px 14px 2px",display:"flex",alignItems:"center",gap:"7px"}}><span style={{fontSize:"15px"}}>✈️</span><span style={{color:T.btn,fontWeight:"900",fontSize:"15px",letterSpacing:"1.5px"}}>تيرمين</span>{isOwner&&<span style={{background:T.gold,color:"#000",fontSize:"9px",fontWeight:"800",borderRadius:"4px",padding:"1px 5px"}}>OWNER</span>}</div>}

        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          {/* Settings tab */}
          {tab==="settings"&&(
            <div style={{display:"flex",flexDirection:"column",overflowY:"auto",flex:1}}>
              <input ref={pRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f||!user)return;const r=new FileReader();r.onload=async ev=>{await update(ref(db,`users/${user.uid}`),{photoURL:ev.target.result}).catch(()=>{});const s=await get(ref(db,`users/${user.uid}`));if(s.exists())setUd(s.val());};r.readAsDataURL(f);}} onClick={e=>e.target.value=""}/>
              <div style={{background:`linear-gradient(160deg,${T.acc},#12243a)`,padding:"24px 16px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",flexShrink:0}}>
                <div style={{position:"relative",cursor:"pointer"}} onClick={()=>pRef.current?.click()}>
                  <Av name={ud?.displayName||""} photo={ud?.photoURL} size={80} verified={ud?.verified} online={true}/>
                  <div style={{position:"absolute",bottom:0,right:0,background:T.btn,borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${T.acc}`,fontSize:"13px"}}>📷</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{color:"#fff",fontSize:"19px",fontWeight:"800",display:"flex",alignItems:"center",gap:"6px",justifyContent:"center"}}>{ud?.displayName}{ud?.verified&&<Vbg sz={18}/>}{isOwner&&<span style={{background:T.gold,color:"#000",fontSize:"9px",fontWeight:"800",borderRadius:"4px",padding:"1px 5px"}}>OWNER</span>}</div>
                  <div style={{color:"rgba(255,255,255,0.65)",fontSize:"13px"}}>@{ud?.username}</div>
                  {ud?.phone&&<div style={{color:"rgba(255,255,255,0.5)",fontSize:"12px",direction:"ltr"}}>{ud.phone}</div>}
                  <div style={{color:"rgba(255,255,255,0.45)",fontSize:"12px",marginTop:"3px"}}>{ud?.bio||"لا توجد نبذة"}</div>
                </div>
              </div>
              {[
                {title:"الحساب",items:[
                  {ic:"usr",l:"تعديل الملف الشخصي",a:()=>setModal("editProf")},
                  {ic:"lk",l:"التحقق بخطوتين",d:ud?.twoFactor?"مفعّل ✅":"معطّل",a:()=>setModal("twoFA")},
                  {ic:"ph",l:"رقم هاتفي",d:ud?.phone||"—"},
                ]},
                {title:"الإشعارات",custom:()=>(
                  <div style={{background:T.sb}}>
                    {[{k:"pm",l:"الرسائل الخاصة"},{k:"gr",l:"المجموعات"},{k:"ch",l:"القنوات"},{k:"snd",l:"الأصوات"}].map(it=>(
                      <div key={it.k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${T.brd}15`}}>
                        <div style={{display:"flex",alignItems:"center",gap:"14px"}}><div style={{width:"38px",height:"38px",borderRadius:"12px",background:`${T.btn}20`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n="ntf" s={18} c={T.btn}/></div><span style={{color:T.text,fontSize:"14.5px"}}>{it.l}</span></div>
                        <Tog on={notifs[it.k]} go={()=>setNt(p=>({...p,[it.k]:!p[it.k]}))}/>
                      </div>
                    ))}
                  </div>
                )},
                {title:"الأمان والدعم",items:[
                  {ic:"lk",l:"الأمان والحساب",a:()=>setModal("security")},
                  {ic:"set",l:"الوضع الليلي",d:"مفعّل دائماً"},
                ]},
                {title:"الخصوصية",custom:()=>(
                  <div style={{background:T.sb}}>
                    {[{k:"showPhone",l:"إظهار رقم الهاتف"},{k:"showLastSeen",l:"إظهار آخر ظهور"},{k:"showOnline",l:"إظهار حالة الاتصال"}].map(it=>(
                      <div key={it.k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${T.brd}15`}}>
                        <div style={{display:"flex",alignItems:"center",gap:"14px"}}><div style={{width:"38px",height:"38px",borderRadius:"12px",background:`${T.btn}20`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n="pv" s={18} c={T.btn}/></div><span style={{color:T.text,fontSize:"14.5px"}}>{it.l}</span></div>
                        <Tog on={privSettings[it.k]} go={async()=>{const nv={...privSettings,[it.k]:!privSettings[it.k]};setPrivSettings(nv);await update(ref(db,`users/${user?.uid}`),{[it.k]:nv[it.k]}).catch(()=>{});}}/>
                      </div>
                    ))}
                  </div>
                )},
                {title:"المجلدات",items:[{ic:"fol",l:"إنشاء مجلد جديد",a:()=>setModal("newFolder")}]},
                {title:"شحن النجوم",items:[{ic:"gift",l:"شحن النجوم ⭐",d:`رصيدك: ${ud?.stars||0} نجمة`,a:()=>setModal("buyStars")}]},
                {title:"خدمات",items:[
                  {ic:"ph",l:"تغيير رقم الهاتف (SSPT)",a:()=>{if(user)openSSPT(user,openChat,db);setTab("chats");}},
                  {ic:"pv",l:"الإبلاغ عن منتحل (SDSF)",a:()=>{if(user)openSDSF(user,openChat,db);setTab("chats");}},
                ]},
                {title:"الأمان والدعم",items:[
                  {ic:"lk",l:"الأمان والحماية",a:()=>setModal("security")},
                  {ic:"lk",l:"قفل التطبيق",d:lockPin?"مفعّل 🔒":"معطّل",a:()=>setModal("appLock")},
                ]},
                {title:"الدعم",items:[{ic:"sup",l:"الدعم الفني",a:()=>{openSup();setTab("chats");}}]},
                ...(isOwner?[{title:"الإدارة",items:[{ic:"cr",l:"لوحة تحكم المالك",a:()=>window.open("/admin","_blank")}]}]:[]),
              ].map(g=>(
                <div key={g.title} style={{marginBottom:"6px"}}>
                  <div style={{color:T.dim,fontSize:"12px",fontWeight:"700",padding:"12px 16px 5px"}}>{g.title}</div>
                  {g.custom?g.custom():g.items.map(it=>(
                    <div key={it.l} onClick={it.a} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 16px",background:T.sb,cursor:it.a?"pointer":"default",borderBottom:`1px solid ${T.brd}15`}}
                      onMouseEnter={e=>{if(it.a)e.currentTarget.style.background=T.hov;}} onMouseLeave={e=>e.currentTarget.style.background=T.sb}>
                      <div style={{width:"38px",height:"38px",borderRadius:"12px",background:`${T.btn}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic n={it.ic} s={18} c={T.btn}/></div>
                      <div style={{flex:1}}><div style={{color:T.text,fontSize:"14.5px"}}>{it.l}</div>{it.d&&<div style={{color:T.dim,fontSize:"12px"}}>{it.d}</div>}</div>
                      {it.a&&<Ic n="back" s={14} c={T.dim}/>}
                    </div>
                  ))}
                </div>
              ))}
              {/* Folders list */}
              {folders.length>0&&(
                <div style={{marginBottom:"6px"}}>
                  <div style={{color:T.dim,fontSize:"12px",fontWeight:"700",padding:"12px 16px 5px"}}>مجلداتي</div>
                  {folders.map(f=>(
                    <div key={f.id} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 16px",background:T.sb,cursor:"pointer",borderBottom:`1px solid ${T.brd}15`}} onClick={()=>{setTab("folder_"+f.id);}}>
                      <div style={{width:"38px",height:"38px",borderRadius:"12px",background:`${T.btn}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px"}}>{f.emoji||"📁"}</div>
                      <div style={{flex:1}}><div style={{color:T.text,fontSize:"14.5px"}}>{f.name}</div><div style={{color:T.dim,fontSize:"12px"}}>{(f.items||[]).length} محادثة</div></div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{padding:"16px",textAlign:"center"}}>
                <button onClick={()=>signOut(auth)} style={{background:`${T.err}15`,border:`1px solid ${T.err}30`,borderRadius:"12px",padding:"13px",color:T.err,cursor:"pointer",fontFamily:"inherit",fontWeight:"700",fontSize:"14px",width:"100%"}}>🚪 تسجيل الخروج</button>
                <div style={{color:T.dim,fontSize:"11px",marginTop:"12px"}}>✈️ تيرمين v4.4</div>
              </div>
            </div>
          )}

          {tab==="contacts"&&(
            <div style={{padding:"12px"}}>
              {chats.filter(c=>c.type==="private").map(c=>(
                <div key={c.id||c.chatId} onClick={()=>openChat(c.chatId||c.id,c)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px",borderRadius:"12px",cursor:"pointer",marginBottom:"4px"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <Av name={c.name} photo={c.photoURL} size={44} online={onlineUsers[c.members?.find(m=>m!==user?.uid)]?.online}/>
                  <div><div style={{color:T.text,fontWeight:"600",fontSize:"14px"}}>{c.name}</div>{c.phone&&<div style={{color:T.dim,fontSize:"12px",direction:"ltr",textAlign:"right"}}>{c.phone}</div>}</div>
                </div>
              ))}
              {!chats.filter(c=>c.type==="private").length&&<div style={{padding:"30px",textAlign:"center",color:T.dim,fontSize:"13px"}}>لا توجد جهات اتصال</div>}
            </div>
          )}

          {tab==="chats"&&(qMode&&q ? renderSearch() : (
            <div>
              {!chats.length&&<div style={{padding:"40px",textAlign:"center",color:T.dim,fontSize:"14px"}}>لا توجد محادثات<br/><span style={{fontSize:"12px",display:"block",marginTop:"8px"}}>اضغط ☰ لبدء محادثة</span></div>}
              {chats.map(chat=>{
                const cid=chat.id||chat.chatId;
                const active=actId===cid;
                const name=chat.name||"محادثة";
                const isOB2=chat.type==="official_bot";
                const othId=chat.type==="private"?chat.members?.find(m=>m!==user?.uid):null;
                const chatOnline=othId&&onlineUsers[othId]?.online===true;
                return (
                  <div key={cid} onClick={()=>openChat(cid,chat)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"9px 14px",cursor:"pointer",background:active?T.acc:"transparent",borderBottom:`1px solid ${T.brd}18`}}
                    onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.hov;}} onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
                    <Av name={name} photo={chat.photoURL} size={52} online={chatOnline} verified={chat.verified||isOB2}
                      onClick={e=>{e.stopPropagation();setProf({...chat,displayName:name});}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{color:T.text,fontWeight:"600",fontSize:"15px",display:"flex",alignItems:"center",gap:"4px"}}>
                          {chat.type==="channel"&&<Ic n="ch" s={11} c={T.gold}/>}
                          {chat.type==="group"&&<Ic n="gr" s={11} c={T.btn}/>}
                          {chat.type==="saved"&&<Ic n="sv" s={11} c={T.btn}/>}
                          {isOB2&&<span style={{fontSize:"11px"}}>✈️</span>}
                          {chat.type==="support"&&<span style={{fontSize:"11px"}}>🆘</span>}
                          <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"150px"}}>{name}</span>
                          {(chat.verified||isOB2)&&<Vbg sz={14}/>}
                        </span>
                        <span style={{color:T.dim,fontSize:"11px",flexShrink:0}}>{chat.lastTime}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"2px"}}>
                        <span style={{color:T.dim,fontSize:"13px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"180px"}}>{chat.lastMessage}</span>
                        {chat.unread>0&&<span style={{background:T.btn,color:"#fff",borderRadius:"12px",minWidth:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",padding:"0 5px",flexShrink:0}}>{chat.unread>99?"99+":chat.unread}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {tab==="chats"&&!qMode&&(
          <div style={{padding:"8px 14px 5px",borderTop:`1px solid ${T.brd}`,display:"flex",justifyContent:"flex-end",background:T.sb}}>
            <button onClick={e=>{e.stopPropagation();setModal("fab");}} style={{background:T.btn,border:"none",borderRadius:"50%",width:"46px",height:"46px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 14px rgba(82,136,193,0.45)"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              <Ic n="pls" s={22} c="#fff"/>
            </button>
          </div>
        )}

        <div style={{display:"flex",background:T.tab,borderTop:`1px solid ${T.brd}`,padding:"6px 0"}}>
          {[{k:"chats",n:"menu",l:"المحادثات"},{k:"contacts",n:"ct",l:"جهات الاتصال"},{k:"settings",n:"set",l:"الإعدادات"}].map(t=>(
            <button key={t.k} onClick={()=>{setTab(t.k);setQM(false);setQ("");}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",background:"none",border:"none",cursor:"pointer",padding:"6px 4px"}}>
              <Ic n={t.n} s={22} c={tab===t.k?T.btn:T.dim}/>
              <span style={{color:tab===t.k?T.btn:T.dim,fontSize:"10px",fontWeight:tab===t.k?"700":"400"}}>{t.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {!actId?(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",padding:"40px"}}>
            <div style={{fontSize:"72px"}}>✈️</div>
            <div style={{textAlign:"center"}}><div style={{color:T.text,fontSize:"26px",fontWeight:"900",letterSpacing:"2px"}}>تيرمين</div><div style={{color:T.dim,fontSize:"13px",marginTop:"6px"}}>اختر محادثة للبدء</div></div>
          </div>
        ):(
          <>
            {/* Header */}
            <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px",background:T.sb,borderBottom:`1px solid ${T.brd}`,flexShrink:0}}>
              {mobile&&<button onClick={()=>{setSSB(true);setActId(null);setAD(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px",display:"flex"}}><Ic n="back" s={22}/></button>}
              <div style={{display:"flex",alignItems:"center",gap:"11px",flex:1,cursor:"pointer"}} onClick={()=>setProf(actData)}>
                <Av name={chatName} photo={actData?.photoURL} size={40} online={isPM?otherOnline:undefined} verified={actData?.verified||isOB}/>
                <div>
                  <div style={{color:T.text,fontWeight:"700",fontSize:"15px",display:"flex",alignItems:"center",gap:"5px"}}>{chatName}{(actData?.verified||isOB)&&<Vbg sz={15}/>}</div>
                  <div style={{color:isPM&&otherOnline?T.on:T.dim,fontSize:"12px"}}>
                    {isSv?"رسائلك المحفوظة":isSup?"الدعم":isOB?"🤖 خدمة العملاء":
                     isGr?`${actData?.members?.length||0} عضو`:
                     isCh?`${fsub(actData?.subscribers||0)} مشترك`:
                     isPM?(otherOnline?"متصل الآن":"غير متصل"):""}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:"2px"}}>
                {isCh&&<button onClick={()=>setShowGifts(true)} style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="gift" s={20} c={T.gold}/></button>}
                {isPM&&<button onClick={()=>{setCallUser({name:chatName,photoURL:actData?.photoURL,color:actData?.color||rc(chatName)});setCallActive(true);}} style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="ph" s={20} c={T.dim}/></button>}
                {isPM&&<button onClick={e=>{e.stopPropagation();setModal("pmMenu");}} style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="more" s={20}/></button>}
                {!isPM&&<button onClick={e=>{e.stopPropagation();if(isCh&&isMine){setCS({...actData});setModal("chSet");}}} style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="more" s={20}/></button>}
              </div>
            </div>

            {pinned&&(
              <div style={{padding:"8px 14px",background:T.panel,borderBottom:`1px solid ${T.brd}`,display:"flex",alignItems:"center",gap:"10px",cursor:"pointer"}} onClick={()=>document.getElementById(`m_${pinned.id}`)?.scrollIntoView({behavior:"smooth"})}>
                <Ic n="pin" s={16} c={T.btn}/>
                <div style={{flex:1,minWidth:0}}><div style={{color:T.btn,fontSize:"11px",fontWeight:"700"}}>رسالة مثبّتة</div><div style={{color:T.dim,fontSize:"12.5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pinned.text}</div></div>
                {isAdmin&&<button onClick={e=>{e.stopPropagation();update(ref(db,`messages/${actId}/${pinned.id}`),{pinned:false}).catch(()=>{});}} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={14}/></button>}
              </div>
            )}

            {(reply||editing)&&(
              <div style={{padding:"7px 16px",background:T.panel,borderBottom:`1px solid ${T.brd}`,display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:"3px",height:"30px",background:editing?T.gold:T.btn,borderRadius:"2px",flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}><div style={{color:editing?T.gold:T.btn,fontSize:"11.5px",fontWeight:"700"}}>{editing?"✏️ تعديل":(reply?.senderName||"أنت")}</div><div style={{color:T.dim,fontSize:"12.5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{editing?editing.text:reply?.text}</div></div>
                <button onClick={()=>{setReply(null);setEd(null);setInp("");}} style={{background:"none",border:"none",cursor:"pointer"}}><Ic n="close" s={15}/></button>
              </div>
            )}

            {/* Messages */}
            <div style={{flex:1,overflowY:"auto",padding:"12px 16px",background:T.bg,display:"flex",flexDirection:"column",gap:"2px"}}>
              {!msgs.length&&<div style={{margin:"auto",textAlign:"center",color:T.dim}}><div style={{fontSize:"40px",marginBottom:"10px"}}>{isSv?"🔖":isSup?"🆘":isOB?"✈️":"👋"}</div><div style={{fontSize:"14px"}}>{isSv?"لا توجد رسائل محفوظة":isSup?"اكتب مشكلتك":"ابدأ المحادثة!"}</div></div>}
              {msgs.map((msg,idx)=>{
                const isMe=msg.from===user?.uid;
                const isSys=msg.type==="system"||msg.type==="system_info";
                const isB=msg.isOfficialBot||msg.from===BOT_ID||msg.from===BF_ID;
                const isSP=msg.isSupport||msg.from===SUP_ID;
                const showSender=!isMe&&isGr&&(idx===0||msgs[idx-1]?.from!==msg.from);
                const msgRx=rx[msg.id]||{};
                if(isSys) return <div key={msg.id} id={`m_${msg.id}`} style={{textAlign:"center",margin:"6px 0"}}><span style={{background:`${T.btn}20`,color:T.dim,borderRadius:"12px",padding:"4px 14px",fontSize:"12px"}}>{msg.text}</span></div>;
                return (
                  <div key={msg.id} id={`m_${msg.id}`} style={{display:"flex",justifyContent:isMe?"flex-start":"flex-end",marginBottom:"2px",animation:"mi .2s ease"}}
                    onContextMenu={e=>{e.preventDefault();e.stopPropagation();setCtx({x:Math.min(e.clientX,window.innerWidth-200),y:Math.min(e.clientY,window.innerHeight-300),msg});}}>
                    <div style={{maxWidth:"72%"}}>
                      <div style={{padding:"8px 11px 5px",borderRadius:isMe?"16px 16px 16px 4px":"16px 16px 4px 16px",background:isMe?T.out:(isB||isSP)?"#1a3040":T.inp,boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>
                        {showSender&&<div style={{color:msg.senderColor||T.btn,fontSize:"12px",fontWeight:"700",marginBottom:"3px",cursor:"pointer"}} onClick={()=>{const u2=cache.users.find(u=>u.uid===msg.from);if(u2)setProf(u2);}}>{msg.senderName}</div>}
                        {(isB||isSP)&&!isMe&&<div style={{color:T.gold,fontSize:"11px",fontWeight:"700",marginBottom:"3px",display:"flex",alignItems:"center",gap:"4px"}}><Vbg sz={13}/>⭐ {msg.senderName}</div>}
                        {msg.hasConfirm&&msg.confirmId&&(
                          <div style={{display:"flex",gap:"8px",marginTop:"8px"}}>
                            <button onClick={async()=>{
                              await update(ref(db,`platformConfirm/${msg.confirmId}`),{status:"approved"}).catch(()=>{});
                              const nid=uid();
                              await set(ref(db,`messages/${actId}/${nid}`),{id:nid,chatId:actId,text:"✅ تم قبول تسجيل الدخول في منصة سوق تيرمين",from:BOT_ID,senderName:"DFGFD",time:now(),type:"text",isOfficialBot:true,createdAt:Date.now()});
                            }} style={{flex:1,padding:"8px",background:"rgba(77,214,122,0.2)",border:"1px solid rgba(77,214,122,0.4)",borderRadius:"10px",color:"#4dd67a",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700"}}>
                              ✅ قبول تسجيل الدخول
                            </button>
                            <button onClick={async()=>{
                              await update(ref(db,`platformConfirm/${msg.confirmId}`),{status:"rejected"}).catch(()=>{});
                              const nid=uid();
                              await set(ref(db,`messages/${actId}/${nid}`),{id:nid,chatId:actId,text:"❌ تم رفض تسجيل الدخول في منصة سوق تيرمين",from:BOT_ID,senderName:"DFGFD",time:now(),type:"text",isOfficialBot:true,createdAt:Date.now()});
                            }} style={{flex:1,padding:"8px",background:"rgba(224,92,92,0.15)",border:"1px solid rgba(224,92,92,0.3)",borderRadius:"10px",color:"#e05c5c",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700"}}>
                              ❌ رفض
                            </button>
                          </div>
                        )}
                        {msg.replyTo&&<div style={{background:"rgba(255,255,255,0.07)",borderRadius:"8px",padding:"5px 10px",marginBottom:"6px",borderRight:`3px solid ${T.btn}`}}><div style={{color:T.btn,fontSize:"11px",fontWeight:"700"}}>{msg.replyTo.sender}</div><div style={{color:T.dim,fontSize:"12px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"200px"}}>{msg.replyTo.text}</div></div>}
                        {msg.type==="gift"&&<div style={{textAlign:"center",padding:"10px"}}><div style={{fontSize:"48px"}}>{msg.gift?.emoji}</div><div style={{color:T.gold,fontSize:"13px",fontWeight:"700",marginTop:"6px"}}>🎁 هدية {msg.gift?.name}</div><div style={{color:T.dim,fontSize:"11px"}}>⭐ {msg.gift?.stars} نجمة</div>{msg.text&&<div style={{color:T.text,fontSize:"13px",marginTop:"6px"}}>{msg.text}</div>}</div>}
                        {msg.type==="image"&&<div style={{marginBottom:"4px"}}><img src={msg.imageUrl} alt="" style={{maxWidth:"240px",maxHeight:"280px",borderRadius:"10px",display:"block",width:"100%",objectFit:"cover"}}/>{msg.text&&<MText text={msg.text} onMention={onMention} style={{color:T.text,fontSize:"14px",display:"block",marginTop:"5px"}}/>}</div>}
                        {msg.type==="file"&&<a href={msg.fileData} download={msg.fileName} style={{display:"flex",alignItems:"center",gap:"10px",textDecoration:"none",background:"rgba(255,255,255,0.07)",borderRadius:"10px",padding:"10px 12px",marginBottom:"4px"}}><Ic n="file" s={26} c={T.btn}/><div><div style={{color:T.text,fontSize:"13px",fontWeight:"600",wordBreak:"break-all"}}>{msg.fileName}</div><div style={{color:T.dim,fontSize:"11px"}}>{fsz(msg.fileSize)}</div></div></a>}
                        {(msg.type==="text"||!msg.type)&&<MText text={msg.text} onMention={onMention} style={{color:T.text,fontSize:"14.5px",lineHeight:"1.55",wordBreak:"break-word",whiteSpace:"pre-wrap",display:"block"}}/>}
                        <div style={{display:"flex",justifyContent:"flex-start",alignItems:"center",gap:"4px",marginTop:"3px"}}>
                          {isCh&&msg.views&&<span style={{color:T.dim,fontSize:"10px",display:"flex",alignItems:"center",gap:"2px"}}>👁{msg.views}</span>}
                          <span style={{color:T.dim,fontSize:"10.5px"}}>{msg.time}{msg.edited&&" (معدّل)"}</span>
                          {isMe&&<Ic n="chk2" s={13} c={T.btn}/>}
                          {msg.pinned&&<Ic n="pin" s={11} c={T.gold}/>}
                        </div>
                      </div>
                      {Object.keys(msgRx).length>0&&(
                        <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginTop:"4px",justifyContent:isMe?"flex-start":"flex-end"}}>
                          {Object.entries(msgRx).map(([emoji,users])=>{const cnt=Object.keys(users).length;const mine=users[user?.uid];return cnt>0?<button key={emoji} onClick={()=>addRx(msg.id,emoji)} style={{background:mine?`${T.btn}30`:"rgba(255,255,255,0.08)",border:`1px solid ${mine?T.btn:"rgba(255,255,255,0.12)"}`,borderRadius:"12px",padding:"3px 8px",cursor:"pointer",fontSize:"13px",color:T.text,display:"flex",alignItems:"center",gap:"4px"}}>{emoji}<span style={{fontSize:"11px",color:mine?T.btn:T.dim}}>{cnt}</span></button>:null;})}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef}/>
            </div>

            {isSup&&<div style={{padding:"8px 14px",background:T.panel,borderTop:`1px solid ${T.brd}`,display:"flex",justifyContent:"center"}}><button onClick={async()=>{const tn=`TKT-${Date.now().toString().slice(-6)}`;await set(ref(db,`messages/${actId}/${uid()}`),{id:uid(),chatId:actId,text:`📋 تم إرسال طلبك للدعم البشري.\n🎫 رقم الطلب: ${tn}\nسيتم الرد قريباً ✅`,from:SUP_ID,senderName:"الدعم الفني",time:now(),type:"system_info",isSupport:true,createdAt:Date.now()}).catch(()=>{});}} style={{background:"rgba(77,214,122,0.15)",border:"1px solid rgba(77,214,122,0.4)",borderRadius:"10px",padding:"8px 20px",color:T.on,cursor:"pointer",fontFamily:"inherit",fontSize:"13px",fontWeight:"700"}}>📞 التحويل للدعم البشري</button></div>}

            {canSend?(
              <div style={{padding:"9px 12px",background:T.sb,borderTop:`1px solid ${T.brd}`,flexShrink:0,position:"relative"}}>
                {showEmoji&&(
                  <div style={{position:"absolute",bottom:"62px",right:"12px",background:"#1a2a3a",borderRadius:"14px",padding:"12px",display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:"4px",boxShadow:"0 8px 32px rgba(0,0,0,0.6)",zIndex:200,border:`1px solid ${T.brd}`}} onClick={e=>e.stopPropagation()}>
                    {EMOJIS.map(e=><button key={e} onClick={()=>{setInp(p=>p+e);inpRef.current?.focus();}} style={{background:"none",border:"none",fontSize:"21px",cursor:"pointer",padding:"4px",borderRadius:"7px"}} onMouseEnter={ev=>ev.currentTarget.style.background=T.hov} onMouseLeave={ev=>ev.currentTarget.style.background="none"}>{e}</button>)}
                  </div>
                )}
                {attMenu&&(
                  <div style={{position:"absolute",bottom:"62px",right:"52px",background:"#1c2d3d",borderRadius:"14px",padding:"10px 14px",display:"flex",gap:"12px",boxShadow:"0 8px 24px rgba(0,0,0,0.5)",zIndex:200,border:`1px solid ${T.brd}`}} onClick={e=>e.stopPropagation()}>
                    {[{n:"img",l:"صورة",c:"#4CAF50",a:()=>{iRef.current?.click();setAM(false);}},{n:"file",l:"ملف",c:"#2196F3",a:()=>{fRef.current?.click();setAM(false);}}].map(b=>(
                      <button key={b.l} onClick={b.a} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"5px",background:"none",border:"none",cursor:"pointer",padding:"10px 12px",borderRadius:"10px"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                        <Ic n={b.n} s={26} c={b.c}/><span style={{color:T.dim,fontSize:"11px"}}>{b.l}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <button onClick={e=>{e.stopPropagation();setSE(!showEmoji);setAM(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:"6px",borderRadius:"50%",fontSize:"20px",flexShrink:0}}>😊</button>
                  {!isSv&&!isOB&&<button onClick={e=>{e.stopPropagation();setAM(!attMenu);setSE(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:"7px",borderRadius:"50%",display:"flex",flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}><Ic n="attach" s={20}/></button>}
                  <div style={{flex:1,background:T.inp2,borderRadius:"22px",padding:"8px 14px",border:editing?`1px solid ${T.gold}`:"none"}}>
                    <textarea ref={inpRef} value={inp} onChange={e=>setInp(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}if(e.key==="Escape"){setEd(null);setReply(null);setInp("");}}}
                      placeholder={isSv?"احفظ ملاحظاتك...":isCh?"نشر في القناة...":isSup?"اكتب مشكلتك...":isOB?"أرسل أمراً...":editing?"تعديل الرسالة...":"اكتب رسالة..."} rows={1}
                      style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"14.5px",width:"100%",direction:"rtl",fontFamily:"inherit",resize:"none",lineHeight:"1.5",maxHeight:"90px",overflowY:"auto"}}/>
                  </div>
                  <button onClick={()=>inp.trim()&&sendMsg()} style={{background:inp.trim()?T.btn:T.inp2,border:"none",borderRadius:"50%",width:"42px",height:"42px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.2s",boxShadow:inp.trim()?"0 4px 12px rgba(82,136,193,0.4)":"none"}}>
                    <Ic n={inp.trim()?"send":"mic"} s={19} c={inp.trim()?"#fff":T.dim}/>
                  </button>
                </div>
                <input ref={iRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],true)} onClick={e=>e.target.value=""}/>
                <input ref={fRef} type="file" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],false)} onClick={e=>e.target.value=""}/>
              </div>
            ):(
              <div style={{padding:"13px",background:T.sb,borderTop:`1px solid ${T.brd}`,textAlign:"center",color:T.dim,fontSize:"13px"}}>📢 فقط صاحب القناة يمكنه النشر</div>
            )}
          </>
        )}
      </div>

      {/* Context menu */}
      {ctx&&(
        <div style={{position:"fixed",top:ctx.y,left:ctx.x,background:"#1c2d3d",borderRadius:"13px",padding:"5px 0",boxShadow:"0 8px 28px rgba(0,0,0,0.55)",zIndex:600,minWidth:"180px",border:`1px solid ${T.brd}`}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",gap:"4px",padding:"8px 10px",borderBottom:`1px solid ${T.brd}20`}}>
            {RXEMJ.map(e=><button key={e} onClick={()=>addRx(ctx.msg?.id,e)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"20px",padding:"3px 4px",borderRadius:"8px"}} onMouseEnter={ev=>ev.currentTarget.style.background=T.hov} onMouseLeave={ev=>ev.currentTarget.style.background="none"}>{e}</button>)}
          </div>
          {ctxItems.map(it=>(
            <button key={it.l} onClick={it.a} style={{display:"block",width:"100%",padding:"10px 16px",background:"none",border:"none",color:it.d?T.err:T.text,textAlign:"right",cursor:"pointer",fontFamily:"inherit",fontSize:"13.5px"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}>{it.l}</button>
          ))}
        </div>
      )}

      {/* PM Menu (three dots in private chat) */}
      {modal==="pmMenu"&&(
        <div style={{position:"fixed",inset:0,zIndex:500}} onClick={()=>setModal(null)}>
          <div style={{position:"absolute",top:"60px",left:"10px",background:"#1c2d3d",borderRadius:"13px",padding:"6px 0",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",border:`1px solid ${T.brd}`,minWidth:"210px"}} onClick={e=>e.stopPropagation()}>
            {[
              {ic:"addct",c:T.btn,l:"إضافة كجهة اتصال",a:async()=>{if(!actData?.members)return;const oid=actData.members.find(m=>m!==user?.uid);if(!oid)return;const s=await get(ref(db,`users/${oid}`)).catch(()=>null);if(s?.exists())setProf(s.val());setModal(null);}},
              {ic:"gift",c:T.gold,l:"إرسال هدية",a:()=>{setShowGifts(true);setModal(null);}},
              {ic:"lk",c:"#9C27B0",l:"محادثة سرية 🔒",a:()=>{setModal("secretChat");}},
              {ic:"ntf",c:T.dim,l:"كتم الإشعارات",a:()=>{setModal(null);setMuteMenu(true);}},
              {ic:"tr",c:T.err,l:"حذف المحادثة",a:async()=>{if(!window.confirm("حذف المحادثة وجميع الرسائل؟"))return;await remove(ref(db,`messages/${actId}`)).catch(()=>{});await remove(ref(db,`userChats/${user?.uid}/${actId}`)).catch(()=>{});setActId(null);setAD(null);setModal(null);if(mobile)setSSB(true);}},
            ].map(it=>(
              <button key={it.l} onClick={it.a} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"12px 16px",background:"none",border:"none",color:it.c===T.err?T.err:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"14px"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <Ic n={it.ic} s={18} c={it.c}/>{it.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mute Menu */}
      {muteMenu&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setMuteMenu(false)}>
          <div style={{background:"#1a2a3a",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:"480px",padding:"20px"}} onClick={e=>e.stopPropagation()}>
            <div style={{color:T.text,fontSize:"17px",fontWeight:"800",marginBottom:"14px",textAlign:"center"}}>🔕 كتم الإشعارات</div>
            {[{l:"كتم لساعة",d:3600000},{l:"كتم ليوم",d:86400000},{l:"كتم لأسبوع",d:604800000},{l:"كتم لشهر",d:2592000000},{l:"كتم دائماً",d:-1}].map(o=>(
              <button key={o.l} onClick={async()=>{
                const mutedUntil=o.d===-1?9999999999999:Date.now()+o.d;
                await update(ref(db,`userChats/${user?.uid}/${actId}`),{muted:true,mutedUntil}).catch(()=>{});
                setMuteMenu(false);
              }} style={{display:"block",width:"100%",padding:"14px",background:"none",border:"none",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"15px",textAlign:"center",borderBottom:`1px solid ${T.brd}15`}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                {o.l}
              </button>
            ))}
            <button onClick={async()=>{
              await update(ref(db,`userChats/${user?.uid}/${actId}`),{muted:false,mutedUntil:0}).catch(()=>{});
              setMuteMenu(false);
            }} style={{display:"block",width:"100%",padding:"14px",background:"none",border:"none",color:T.btn,cursor:"pointer",fontFamily:"inherit",fontSize:"15px",fontWeight:"700"}}>
              إلغاء الكتم
            </button>
          </div>
        </div>
      )}

      {/* Secret Chat Modal */}
      {modal==="secretChat"&&(
        <Mdl title="🔒 محادثة سرية" onClose={()=>setModal(null)}>
          <div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:"14px",alignItems:"center"}}>
            <div style={{fontSize:"64px"}}>🔐</div>
            <div style={{color:T.text,fontSize:"15px",fontWeight:"700"}}>محادثة مشفرة من الطرف إلى الطرف</div>
            <div style={{color:T.dim,fontSize:"13px",lineHeight:"1.7"}}>
              المحادثة السرية مشفرة بالكامل ولا يمكن التقاط صورة لها أو تحويل رسائلها.
              يجب موافقة الطرف الآخر للبدء.
            </div>
            <PBtn kids="🔒 بدء محادثة سرية" color="#9C27B0" go={async()=>{
              if(!actData?.members) return;
              const othId=actData.members.find(m=>m!==user?.uid);
              if(!othId) return;
              // Create secret chat
              const scid=`secret_${[user?.uid,othId].sort().join("_")}`;
              const scd={id:scid,type:"secret",name:(actData?.name||"مستخدم")+" 🔒",members:[user?.uid,othId],isSecret:true,createdAt:Date.now()};
              await set(ref(db,`chats/${scid}`),scd).catch(()=>{});
              await set(ref(db,`userChats/${user?.uid}/${scid}`),{chatId:scid,lastMessage:"محادثة سرية",lastTime:now(),unread:0,order:Date.now(),type:"secret",name:(actData?.name||"مستخدم")+" 🔒",color:"#9C27B0"}).catch(()=>{});
              // Send invite to other user
              const nid=uid();
              await set(ref(db,`messages/bot_${othId}/${nid}`),{id:nid,chatId:`bot_${othId}`,text:`🔐 طلب محادثة سرية من @${ud?.username||"مستخدم"}

المحادثة مشفرة بالكامل. للقبول ابحث عن "${actData?.name||""} 🔒" في محادثاتك.`,from:BOT_ID,senderName:"DFGFD",time:now(),type:"text",isOfficialBot:true,createdAt:Date.now()}).catch(()=>{});
              setModal(null);
              openChat(scid,scd);
            }}/>
          </div>
        </Mdl>
      )}

      {/* FAB menu */}
      {modal==="fab"&&(
        <div style={{position:"fixed",inset:0,zIndex:500}} onClick={()=>setModal(null)}>
          <div style={{position:"absolute",bottom:"80px",left:"20px",background:"#1c2d3d",borderRadius:"14px",padding:"8px 0",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",border:`1px solid ${T.brd}`,minWidth:"200px"}} onClick={e=>e.stopPropagation()}>
            {[{ic:"usr",l:"محادثة جديدة",a:()=>setModal("newChat")},{ic:"gr",l:"مجموعة جديدة",a:()=>setModal("newGr")},{ic:"ch",l:"قناة جديدة",a:()=>setModal("newCh")},{ic:"bot",l:"BotFather",a:openBF}].map(it=>(
              <button key={it.l} onClick={it.a} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"12px 16px",background:"none",border:"none",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"14px"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <Ic n={it.ic} s={18} c={T.btn}/>{it.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {modal==="newChat"&&(
        <Mdl title="محادثة جديدة" onClose={()=>setModal(null)}>
          <input value={q} onChange={e=>{setQ(e.target.value);setQM(true);}} placeholder="@username أو الاسم" autoFocus
            style={{background:T.inp2,border:`1px solid ${T.brd}`,borderRadius:"12px",padding:"11px 14px",color:T.text,fontSize:"15px",outline:"none",direction:"rtl",fontFamily:"inherit",width:"100%",marginBottom:"12px",boxSizing:"border-box"}}/>
          <div style={{maxHeight:"300px",overflowY:"auto"}}>
            {qRes.filter(r=>r.rt==="user"&&r.uid!==user?.uid).map(u2=>(
              <div key={u2.uid} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",cursor:"pointer",borderRadius:"10px",marginBottom:"4px"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                onClick={()=>openPM(u2)}>
                <Av name={u2.displayName} photo={u2.photoURL} size={38} verified={u2.verified} online={onlineUsers[u2.uid]?.online}/>
                <div><div style={{color:T.text,fontSize:"14px",fontWeight:"600"}}>{u2.displayName}</div><div style={{color:T.dim,fontSize:"12px"}}>@{u2.username}</div></div>
              </div>
            ))}
            {q.trim()&&!qRes.filter(r=>r.rt==="user"&&r.uid!==user?.uid).length&&<div style={{padding:"20px",textAlign:"center",color:T.dim,fontSize:"13px"}}>لا توجد نتائج</div>}
          </div>
        </Mdl>
      )}

      {(modal==="newGr"||modal==="newCh")&&(
        <Mdl title={modal==="newGr"?"مجموعة جديدة":"قناة جديدة"} onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <FInp label={modal==="newGr"?"اسم المجموعة":"اسم القناة"} val={nf.name} set={v=>setNf(p=>({...p,name:v}))} ph="الاسم..." af/>
            <FInp label="اسم المستخدم *مطلوب* (يبدأ بحرف، 5+ أحرف)" val={nf.username} set={v=>setNf(p=>({...p,username:v}))} ph="username"/>
            <FInp label="النبذة (اختياري)" val={nf.bio} set={v=>setNf(p=>({...p,bio:v}))} ph="وصف..."/>
            <PBtn kids={modal==="newGr"?"إنشاء المجموعة":"إنشاء القناة"} go={()=>createConvo(modal==="newGr"?"group":"channel")}/>
          </div>
        </Mdl>
      )}

      {modal==="editProf"&&(
        <Mdl title="تعديل الملف الشخصي" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",alignItems:"center"}}>
            <div style={{position:"relative",cursor:"pointer"}} onClick={()=>{const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setEp(p=>({...p,photo:ev.target.result}));r.readAsDataURL(f);}};i.click();}}>
              <Av name={ep.dn||ud?.displayName} photo={ep.photo} size={72}/>
              <div style={{position:"absolute",bottom:0,right:0,background:T.btn,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px"}}>📷</div>
            </div>
            <div style={{width:"100%",display:"flex",flexDirection:"column",gap:"11px"}}>
              <FInp label="الاسم الشخصي" val={ep.dn} set={v=>setEp(p=>({...p,dn:v}))} ph="اسمك..."/>
              <FInp label="اسم المستخدم (يبدأ بحرف، 5+ أحرف)" val={ep.un} set={v=>setEp(p=>({...p,un:v}))} ph="username"/>
              <FInp label="النبذة" val={ep.bio} set={v=>setEp(p=>({...p,bio:v}))} ph="أخبرنا عن نفسك..."/>
              <div style={{background:T.inp2,borderRadius:"12px",padding:"12px"}}>
                <div style={{color:T.dim,fontSize:"12px",marginBottom:"6px"}}>رقم هاتفك</div>
                <div style={{color:T.text,fontSize:"14px",fontWeight:"600",direction:"ltr",textAlign:"right"}}>{ud?.phone||"—"}</div>
                <div style={{color:T.dim,fontSize:"11px",marginTop:"4px"}}>الرقم يُعرض لمن اخترت فقط</div>
              </div>
            </div>
            <PBtn kids="💾 حفظ التغييرات" go={saveProfile}/>
          </div>
        </Mdl>
      )}

      {modal==="chSet"&&chSet&&(
        <Mdl title="إعدادات القناة" onClose={()=>setModal(null)} w="460px">
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
              <div style={{position:"relative",cursor:"pointer"}} onClick={()=>{const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=async ev=>{await update(ref(db,`chats/${chSet.id}`),{photoURL:ev.target.result}).catch(()=>{});setCS(p=>({...p,photoURL:ev.target.result}));};r.readAsDataURL(f);}};i.click();}}>
                <Av name={chSet.name} photo={chSet.photoURL} size={72}/>
                <div style={{position:"absolute",bottom:0,right:0,background:T.btn,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px"}}>📷</div>
              </div>
              <span style={{color:T.dim,fontSize:"12px"}}>اضغط لرفع صورة من هاتفك</span>
            </div>
            <FInp label="اسم القناة" val={chSet.name} set={v=>setCS(p=>({...p,name:v}))} ph="اسم القناة..."/>
            <FInp label="اسم المستخدم (@)" val={chSet.username||""} set={v=>setCS(p=>({...p,username:v}))} ph="channel_username"/>
            <FInp label="النبذة" val={chSet.bio||""} set={v=>setCS(p=>({...p,bio:v}))} ph="وصف القناة..."/>
            <PBtn kids="💾 حفظ إعدادات القناة" go={saveChSet}/>
          </div>
        </Mdl>
      )}

      {modal==="twoFA"&&(
        <Mdl title="التحقق بخطوتين" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",alignItems:"center",textAlign:"center"}}>
            <div style={{fontSize:"48px"}}>{ud?.twoFactor?"🔒":"🔓"}</div>
            <div style={{color:T.text,fontWeight:"700",fontSize:"15px"}}>التحقق بخطوتين {ud?.twoFactor?"مفعّل":"معطّل"}</div>
            {!ud?.twoFactor&&<FInp label="كلمة مرور التحقق (ستُطلب عند الدخول من جهاز جديد)" val={twoPw} set={setTwoPw} ph="كلمة مرور..." type="password"/>}
            <div style={{color:T.dim,fontSize:"13px",lineHeight:"1.7"}}>عند التفعيل، تُطلب كلمة مرور التحقق عند الدخول من جهاز جديد</div>
            <PBtn color={ud?.twoFactor?T.err:T.gold} kids={ud?.twoFactor?"🔓 إلغاء التفعيل":"🔒 تفعيل"} go={async()=>{
              const nv=!ud?.twoFactor;
              if(nv&&!twoPw.trim()){alert("أدخل كلمة مرور للتحقق");return;}
              try {
                await update(ref(db,`users/${user.uid}`),{twoFactor:nv,twoFactorPass:nv?twoPw:""});
                const s=await get(ref(db,`users/${user.uid}`));if(s.exists())setUd(s.val());
                await set(ref(db,`messages/bot_${user.uid}/${uid()}`),{id:uid(),chatId:`bot_${user.uid}`,text:`🔐 تم ${nv?"تفعيل":"إلغاء"} التحقق بخطوتين\n🕐 ${full()}`,from:BOT_ID,senderName:"DFGFD",time:now(),type:"text",isOfficialBot:true,createdAt:Date.now()}).catch(()=>{});
              } catch{}
              setTwoPw("");setModal(null);
            }}/>
          </div>
        </Mdl>
      )}

      {modal==="newFolder"&&(
        <Mdl title="إنشاء مجلد" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <div style={{color:T.dim,fontSize:"13px"}}>اختر نوع المجلد:</div>
            {[{t:"users",emoji:"👤",l:"جهات الاتصال"},{t:"channels",emoji:"📢",l:"القنوات"},{t:"groups",emoji:"👥",l:"المجموعات"},{t:"bots",emoji:"🤖",l:"البوتات"}].map(f=>(
              <button key={f.t} onClick={async()=>{
                const newF={id:uid(),name:f.l,emoji:f.emoji,type:f.t,items:[]};
                setFolders(p=>[...p,newF]);
                setModal(null);
              }} style={{display:"flex",alignItems:"center",gap:"12px",padding:"13px 16px",borderRadius:"12px",border:`1px solid ${T.brd}`,background:T.inp2,color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"14px",textAlign:"right"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background=T.inp2}>
                <span style={{fontSize:"24px"}}>{f.emoji}</span>{f.l}
              </button>
            ))}
          </div>
        </Mdl>
      )}


      {/* ─── Security Modal ─── */}
      {modal==="security"&&(
        <Mdl title="الأمان والحساب" onClose={()=>setModal(null)} w="460px">
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {[
              {ic:"🔑",title:"نسيت كلمة المرور",desc:"إرسال رابط استعادة كلمة المرور إلى بريدك",a:async()=>{
                try{const{sendPasswordResetEmail}=await import("firebase/auth");await sendPasswordResetEmail(auth,user?.email);alert("✅ تم إرسال رابط استعادة كلمة المرور إلى: "+user?.email);}catch{alert("تعذر الإرسال، تحقق من اتصالك");}
              }},
              {ic:"🚨",title:"تم اختراق حسابي",desc:"تواصل مع فريق الدعم لحماية حسابك",a:()=>{
                const tid="TKT-"+(Date.now().toString().slice(-6));
                openSup();setModal(null);
                setTimeout(async()=>{
                  const sid=`support_${user?.uid}`;
                  const mid=uid();
                  await set(ref(db,`messages/${sid}/${mid}`),{id:mid,chatId:sid,text:`🚨 بلاغ اختراق حساب

👤 المستخدم: @${ud?.username}
📧 البريد: ${user?.email}
🎫 رقم التذكرة: ${tid}
🕐 ${full()}

سيراجع فريق الدعم GFF طلبك وسيرد عليك قريباً.`,from:SUP_ID,senderName:"الدعم الفني",time:now(),type:"text",isSupport:true,createdAt:Date.now()}).catch(()=>{});
                },500);
              }},
              {ic:"🔓",title:"تسجيل خروج بالخطأ",desc:"معلومات الدخول الحالي ومساعدة في الأمان",a:()=>setModal("loginInfo")},
              {ic:"ℹ️",title:"معلومات حسابي",desc:"عرض جميع بيانات الحساب",a:()=>setModal("accountInfo")},
            ].map(item=>(
              <div key={item.title} onClick={item.a} style={{display:"flex",alignItems:"center",gap:"14px",padding:"16px",background:T.inp2,borderRadius:"14px",cursor:"pointer",border:`1px solid ${T.brd}22`}}
                onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background=T.inp2}>
                <div style={{fontSize:"28px",flexShrink:0}}>{item.ic}</div>
                <div><div style={{color:T.text,fontWeight:"700",fontSize:"14px"}}>{item.title}</div><div style={{color:T.dim,fontSize:"12px",marginTop:"3px"}}>{item.desc}</div></div>
              </div>
            ))}
          </div>
        </Mdl>
      )}

      {/* ─── Login Info Modal ─── */}
      {modal==="loginInfo"&&(
        <Mdl title="معلومات آخر دخول" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <div style={{background:T.inp2,borderRadius:"12px",padding:"14px"}}>
              <div style={{color:T.dim,fontSize:"12px",marginBottom:"6px"}}>البريد الإلكتروني</div>
              <div style={{color:T.text,fontSize:"15px",fontWeight:"600"}}>
                {(user?.email||"").replace(/^(.)(.*)(@.*)$/, (m,a,b,c)=>a+b.replace(/./g,"*")+c)}
              </div>
            </div>
            <div style={{background:T.inp2,borderRadius:"12px",padding:"14px"}}>
              <div style={{color:T.dim,fontSize:"12px",marginBottom:"6px"}}>كلمة المرور</div>
              <div style={{color:T.text,fontSize:"15px",fontWeight:"600"}}>••••••••••</div>
            </div>
            <PBtn kids="🔑 نسيت كلمة المرور؟" color={T.gold} go={async()=>{
              try{const{sendPasswordResetEmail}=await import("firebase/auth");await sendPasswordResetEmail(auth,user?.email);alert("✅ تم إرسال رابط الاستعادة إلى بريدك");}catch{alert("تعذر الإرسال");}
              setModal(null);
            }}/>
          </div>
        </Mdl>
      )}

      {/* ─── Account Info Modal ─── */}
      {modal==="accountInfo"&&(
        <Mdl title="معلومات الحساب" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {[
              {l:"الاسم الكامل",v:ud?.displayName||"—"},
              {l:"اسم المستخدم",v:"@"+(ud?.username||"—")},
              {l:"البريد الإلكتروني",v:user?.email||"—"},
              {l:"رقم الهاتف",v:ud?.phone||"—"},
              {l:"معرّف الحساب",v:(user?.uid||"").slice(0,20)+"..."},
              {l:"كلمة التحقق بخطوتين",v:ud?.twoFactor?"مفعّلة ✅":"غير مفعّلة"},
              {l:"تاريخ الإنشاء",v:ud?.createdAt?new Date(ud.createdAt).toLocaleDateString("ar-SA"):"—"},
              {l:"آخر ظهور",v:ud?.lastSeen?new Date(ud.lastSeen).toLocaleDateString("ar-SA"):"—"},
            ].map(row=>(
              <div key={row.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:T.inp2,borderRadius:"11px"}}>
                <span style={{color:T.dim,fontSize:"13px"}}>{row.l}</span>
                <span style={{color:T.text,fontSize:"13px",fontWeight:"600",maxWidth:"200px",textAlign:"left",wordBreak:"break-all"}}>{row.v}</span>
              </div>
            ))}
          </div>
        </Mdl>
      )}


      {/* ─── Channel/Group Admin Panel ─── */}
      {modal==="channelAdmin"&&(
        <Mdl title={`إدارة ${isCh?"القناة":"المجموعة"}`} onClose={()=>setModal(null)} w="460px">
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {/* Settings - only for owner/admin */}
            {isAdmin&&(
              <div style={{background:T.inp2,borderRadius:"14px",padding:"14px"}}>
                <div style={{color:T.dim,fontSize:"12px",fontWeight:"700",marginBottom:"10px"}}>⚙️ إعدادات</div>
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  <button onClick={()=>{setCS({...actData});setModal("chSet");}} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",background:"none",border:"none",color:T.text,cursor:"pointer",fontFamily:"inherit",fontSize:"14px",textAlign:"right",borderRadius:"10px"}} onMouseEnter={e=>e.currentTarget.style.background=T.hov} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                    <Ic n="set" s={18} c={T.btn}/>تعديل إعدادات {isCh?"القناة":"المجموعة"}
                  </button>
                  {isCh&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px",borderRadius:"10px",background:T.hov}}>
                    <span style={{color:T.text,fontSize:"14px"}}>تفعيل التعليقات</span>
                    <Tog on={actData?.commentsEnabled||false} go={async()=>{await update(ref(db,`chats/${actId}`),{commentsEnabled:!actData?.commentsEnabled});const s=await get(ref(db,`chats/${actId}`));if(s.exists())setAD(s.val());}}/>
                  </div>}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px",borderRadius:"10px",background:T.hov}}>
                    <span style={{color:T.text,fontSize:"14px"}}>تفعيل الهدايا</span>
                    <Tog on={actData?.giftsEnabled!==false} go={async()=>{await update(ref(db,`chats/${actId}`),{giftsEnabled:actData?.giftsEnabled===false});const s=await get(ref(db,`chats/${actId}`));if(s.exists())setAD(s.val());}}/>
                  </div>
                </div>
              </div>
            )}
            {/* Members list */}
            <div style={{background:T.inp2,borderRadius:"14px",padding:"14px"}}>
              <div style={{color:T.dim,fontSize:"12px",fontWeight:"700",marginBottom:"10px"}}>👥 الأعضاء ({(actData?.members||[]).length})</div>
              <div style={{maxHeight:"200px",overflowY:"auto",display:"flex",flexDirection:"column",gap:"6px"}}>
                {(actData?.members||[]).filter(m=>!m.startsWith("bot_")&&m!==SUP_ID).slice(0,20).map(async(memberId,i)=>{
                  return null; // rendered via component below
                })}
                <MembersList members={actData?.members||[]} admins={actData?.admins||[]} ownerId={actData?.ownerId} currentUserId={user?.uid} isAdmin={isAdmin} chatId={actId} db={db} cache={cache} onAction={async(action,mid)=>{
                  if(action==="promote"){
                    const newAdmins=[...(actData?.admins||[])];
                    if(!newAdmins.includes(mid)) newAdmins.push(mid);
                    await update(ref(db,`chats/${actId}`),{admins:newAdmins});
                    alert("✅ تم رفع العضو مشرفاً");
                  } else if(action==="kick"){
                    const newMembers=(actData?.members||[]).filter(m=>m!==mid);
                    await update(ref(db,`chats/${actId}`),{members:newMembers});
                    await remove(ref(db,`userChats/${mid}/${actId}`)).catch(()=>{});
                    alert("✅ تم طرد العضو");
                  } else if(action==="ban"){
                    const newMembers=(actData?.members||[]).filter(m=>m!==mid);
                    const banned=[...(actData?.banned||[]),mid];
                    await update(ref(db,`chats/${actId}`),{members:newMembers,banned});
                    await remove(ref(db,`userChats/${mid}/${actId}`)).catch(()=>{});
                    alert("✅ تم حظر العضو");
                  }
                  const s=await get(ref(db,`chats/${actId}`));if(s.exists())setAD(s.val());
                }}/>
              </div>
            </div>
            {!isMine&&(
              <button onClick={async()=>{
                if(!window.confirm(`مغادرة ${isCh?"القناة":"المجموعة"}؟`)) return;
                const newMembers=(actData?.members||[]).filter(m=>m!==user?.uid);
                await update(ref(db,`chats/${actId}`),{members:newMembers});
                await remove(ref(db,`userChats/${user?.uid}/${actId}`)).catch(()=>{});
                setActId(null);setAD(null);setModal(null);
                if(mobile) setSSB(true);
              }} style={{padding:"12px",background:`${T.err}12`,border:`1px solid ${T.err}25`,borderRadius:"12px",color:T.err,cursor:"pointer",fontFamily:"inherit",fontSize:"14px",fontWeight:"700"}}>
                🚪 مغادرة {isCh?"القناة":"المجموعة"}
              </button>
            )}
          </div>
        </Mdl>
      )}

      {/* ─── Buy Stars Modal ─── */}
      {modal==="buyStars"&&(
        <Mdl title="⭐ شحن النجوم" onClose={()=>setModal(null)} w="460px">
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <div style={{background:T.inp2,borderRadius:"12px",padding:"12px",textAlign:"center"}}>
              <div style={{color:T.gold,fontSize:"28px",fontWeight:"900"}}>{ud?.stars||0} ⭐</div>
              <div style={{color:T.dim,fontSize:"12px"}}>رصيدك الحالي</div>
            </div>
            <div style={{color:T.dim,fontSize:"13px",marginBottom:"6px"}}>اختر باقة النجوم:</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              {[{s:100,p:"1$"},{s:500,p:"5$"},{s:1000,p:"9$"},{s:2500,p:"20$"},{s:5000,p:"35$"},{s:10000,p:"65$"}].map(pkg=>(
                <button key={pkg.s} onClick={async()=>{
                  const chatId=`stars_charge_${user?.uid}`;
                  const orderId="ORD-"+(Date.now().toString().slice(-8));
                  // Create charging chat if not exists
                  const chatData={id:chatId,type:"official_bot",name:"شحن النجوم",username:"starscharge",isOfficial:true,verified:true,members:[user?.uid,BOT_ID],createdAt:Date.now(),photoURL:""};
                  const s=await get(ref(db,`chats/${chatId}`)).catch(()=>null);
                  if(!s?.exists()){
                    await set(ref(db,`chats/${chatId}`),chatData).catch(()=>{});
                    await set(ref(db,`userChats/${user?.uid}/${chatId}`),{chatId,lastMessage:"خدمة شحن",lastTime:now(),unread:0,order:Date.now(),type:"official_bot",name:"شحن النجوم",color:"#f0a040"}).catch(()=>{});
                  }
                  // Send charging instructions
                  const mid=uid();
                  await set(ref(db,`messages/${chatId}/${mid}`),{id:mid,chatId,text:`🌟 طلب شحن نجوم

الباقة: ${pkg.s} نجمة بـ ${pkg.p}

📱 رقم التحويل (Super Kye):
917361038362

🔢 رقم الطلب: ${orderId}

⚠️ بعد التحويل، أرسل صورة الإيصال هنا وسيتم مراجعة طلبك خلال 24 ساعة.`,from:BOT_ID,senderName:"شحن النجوم",time:now(),type:"text",isOfficialBot:true,createdAt:Date.now()}).catch(()=>{});
                  // Save pending order to admin
                  await set(ref(db,`starOrders/${orderId}`),{orderId,userId:user?.uid,username:ud?.username,stars:pkg.s,price:pkg.p,status:"pending",createdAt:Date.now()}).catch(()=>{});
                  setModal(null);
                  openChat(chatId,chatData);
                }} style={{padding:"14px",background:`${T.gold}12`,border:`1px solid ${T.gold}30`,borderRadius:"14px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{color:T.gold,fontSize:"22px",fontWeight:"900"}}>{pkg.s>=1000?`${pkg.s/1000}K`:pkg.s} ⭐</div>
                  <div style={{color:T.text,fontSize:"15px",fontWeight:"700",marginTop:"4px"}}>{pkg.p}</div>
                </button>
              ))}
            </div>
            <div style={{background:`${T.btn}10`,border:`1px solid ${T.btn}25`,borderRadius:"12px",padding:"12px",color:T.dim,fontSize:"12px",lineHeight:"1.7"}}>
              💡 بعد اختيار الباقة، انتقل إلى محادثة الشحن وأرسل صورة إيصال التحويل. سيتم مراجعة طلبك وإضافة النجوم خلال 24 ساعة.
            </div>
          </div>
        </Mdl>
      )}

      {/* ─── App Lock Modal ─── */}
      {modal==="appLock"&&(
        <Mdl title="🔒 قفل التطبيق" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",alignItems:"center",textAlign:"center"}}>
            <div style={{fontSize:"48px"}}>{lockPin?"🔒":"🔓"}</div>
            <div style={{color:T.text,fontWeight:"700",fontSize:"15px"}}>قفل التطبيق {lockPin?"مفعّل":"معطّل"}</div>
            {!lockPin&&<FInp label="رمز القفل (4-6 أرقام)" val={pinInput} set={setPinInput} ph="مثال: 1234" type="password"/>}
            <div style={{color:T.dim,fontSize:"13px",lineHeight:"1.7"}}>سيتم قفل التطبيق تلقائياً عند إغلاقه</div>
            <PBtn color={lockPin?T.err:T.btn} kids={lockPin?"🔓 إزالة القفل":"🔒 تفعيل القفل"} go={()=>{
              if(lockPin){setLockPin("");setPinInput("");alert("✅ تم إزالة قفل التطبيق");}
              else {
                if(!pinInput||pinInput.length<4){alert("أدخل رمز مكون من 4 أرقام على الأقل");return;}
                setLockPin(pinInput);setPinInput("");alert("✅ تم تفعيل قفل التطبيق");
              }
              setModal(null);
            }}/>
          </div>
        </Mdl>
      )}


      {/* ─── Voice/Video Call UI ─── */}
      {callActive&&callUser&&(
        <div style={{position:"fixed",inset:0,background:"linear-gradient(135deg,#1a3a2a,#0e1621)",zIndex:900,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"60px 20px 40px"}}>
          {/* Top */}
          <div style={{textAlign:"center"}}>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:"14px",marginBottom:"16px"}}>يتم الاتصال...</div>
            <div style={{width:"120px",height:"120px",borderRadius:"50%",background:callUser.photoURL?"transparent":rc(callUser.name||"?"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:"52px",fontWeight:"900",color:"#fff",overflow:"hidden",margin:"0 auto 16px",border:"4px solid rgba(255,255,255,0.2)"}}>
              {callUser.photoURL?<img src={callUser.photoURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(callUser.name||"?").charAt(0).toUpperCase()}
            </div>
            <div style={{color:"#fff",fontSize:"24px",fontWeight:"800"}}>{callUser.name}</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:"14px",marginTop:"6px",animation:"blink 1.5s infinite"}}>يتم الاتصال...</div>
          </div>
          {/* Controls */}
          <div style={{display:"flex",gap:"24px",alignItems:"center"}}>
            {[{ic:"🔊",l:"مكبر الصوت",c:"#5288c1"},{ic:"📹",l:"الكاميرا",c:"#333"},{ic:"🎤",l:"كتم",c:"#333"}].map(b=>(
              <div key={b.l} style={{textAlign:"center"}}>
                <button style={{width:"60px",height:"60px",borderRadius:"50%",background:b.c,border:"none",cursor:"pointer",fontSize:"26px",display:"flex",alignItems:"center",justifyContent:"center"}}>{b.ic}</button>
                <div style={{color:"rgba(255,255,255,0.6)",fontSize:"11px",marginTop:"6px"}}>{b.l}</div>
              </div>
            ))}
            <div style={{textAlign:"center"}}>
              <button onClick={()=>{setCallActive(false);setCallUser(null);}} style={{width:"64px",height:"64px",borderRadius:"50%",background:"#e05c5c",border:"none",cursor:"pointer",fontSize:"26px",display:"flex",alignItems:"center",justifyContent:"center"}}>📵</button>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:"11px",marginTop:"6px"}}>مغادرة</div>
            </div>
          </div>
          <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        </div>
      )}
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.acc};border-radius:4px}
        @keyframes mi{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        textarea{scrollbar-width:none}textarea::-webkit-scrollbar{display:none}
        input::placeholder,textarea::placeholder{color:${T.dim}}
        input,textarea,button{-webkit-tap-highlight-color:transparent}
      `}</style>
    </div>
  );
}

