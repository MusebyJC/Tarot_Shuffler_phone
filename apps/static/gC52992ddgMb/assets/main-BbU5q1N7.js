(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))d(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&d(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function d(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();const a="https://lightseerstarot.com/wp-content/uploads/2019/07/",j="https://lightseerstarot.com/wp-content/uploads/2019/06/",B=[{name:"The Fool",img:`${a}00fool_250.jpg`},{name:"The Magician",img:`${a}01magician_250.jpg`},{name:"The High Priestess",img:`${a}02hp_250.jpg`},{name:"The Empress",img:`${a}03empress_250.jpg`},{name:"The Emperor",img:`${a}04emperor_250.jpg`},{name:"The Hierophant",img:`${a}05hierophant_250.jpg`},{name:"The Lovers",img:`${a}06lovers_250.jpg`},{name:"The Chariot",img:`${a}07chariot_250.jpg`},{name:"Strength",img:`${a}08strength_250.jpg`},{name:"The Hermit",img:`${a}09hermit_250.jpg`},{name:"Wheel of Fortune",img:`${a}10wheel_250.jpg`},{name:"Justice",img:`${a}11justice_250.jpg`},{name:"The Hanged Man",img:`${a}12hangedman_250.jpg`},{name:"Death",img:`${a}13death_250.jpg`},{name:"Temperance",img:`${a}14temperance_250.jpg`},{name:"The Devil",img:`${a}15devil_250.jpg`},{name:"The Tower",img:`${a}16tower_250.jpg`},{name:"The Star",img:`${a}17star_250.jpg`},{name:"The Moon",img:`${a}18moon_250.jpg`},{name:"The Sun",img:`${a}19sun_250.jpg`},{name:"Judgement",img:`${a}20judgement_250.jpg`},{name:"The World",img:`${a}21world_250.jpg`}],C=["wands","cups","swords","pentacles"],E={wands:"Wands",cups:"Cups",swords:"Swords",pentacles:"Pentacles"},A=[{name:"Ace",num:"01",prefix:"aceof"},{name:"Two",num:"02",prefix:"of"},{name:"Three",num:"03",prefix:"of"},{name:"Four",num:"04",prefix:"of"},{name:"Five",num:"05",prefix:"of"},{name:"Six",num:"06",prefix:"of"},{name:"Seven",num:"07",prefix:"of"},{name:"Eight",num:"08",prefix:"of"},{name:"Nine",num:"09",prefix:"of"},{name:"Ten",num:"10",prefix:"of"},{name:"Page",num:"11",prefix:"pageof"},{name:"Knight",num:"12",prefix:"knightof"},{name:"Queen",num:"13",prefix:"queenof"},{name:"King",num:"14",prefix:"kingof"}];function M(){const e=[];return B.forEach((t,n)=>{e.push({name:t.name,type:"major",number:n,image:t.img})}),C.forEach(t=>{A.forEach(n=>{e.push({name:`${n.name} of ${E[t]}`,type:"minor",suit:E[t],image:`${j}${n.num}${n.prefix}${t}_250.jpg`})})}),e}const D=["The Fool","The Magician","The Great Mother","The Mother","The Father","The Shaman","Union","The Chariot","Abundance","The Hermit","Time","Creative Power","Sacrifice","Death","Source","Demon","Menhir","Star","The Night","The Sun","The Prey","The World"],P=[{key:"nature",display:"Nature"},{key:"souls",display:"Souls"},{key:"blood",display:"Blood"},{key:"jewels",display:"Jewels"}],x=["Child","Animal","Woman","Man"],O="https://cdn.shopify.com/s/files/1/0899/5985/8525/files/s9znE2mZ0k-__57_20_4.jpg?v=1744074830&width=800&height=600";function F(){const e=[];return D.forEach((t,n)=>{e.push({name:t,type:"major",number:n,image:null})}),P.forEach(t=>{for(let n=1;n<=10;n++)e.push({name:`${n} of ${t.display}`,type:"minor",suit:t.display,image:null});x.forEach(n=>{e.push({name:`${n} of ${t.display}`,type:"minor",suit:t.display,image:null})})}),e}const u={lightseer:{id:"lightseer",name:"Light Seer's",thumb:"https://lightseerstarot.com/wp-content/uploads/2019/07/00fool_250.jpg",back:"https://m.media-amazon.com/images/I/81cldPj0CLL._AC_UF1000,1000_QL80_.jpg",build:M,hasImages:!0},primordial:{id:"primordial",name:"Primordial",thumb:"https://gaia.llewellyn.com/product_images/1000/9780738766416.jpg",back:O,build:F,hasImages:!1}};function k(){const e=new Uint32Array(1);return(window.crypto||window.msCrypto).getRandomValues(e),e[0]/4294967296}function H(e){const t=e.map(n=>({...n,reversed:k()<.5}));for(let n=t.length-1;n>0;n--){const d=Math.floor(k()*(n+1));[t[n],t[d]]=[t[d],t[n]]}return t}async function N(e){try{if(window.creationStorage){const t=btoa(JSON.stringify(e));await window.creationStorage.plain.setItem("tarot_session",t)}}catch{}}async function R(){try{if(window.creationStorage){const e=await window.creationStorage.plain.getItem("tarot_session");if(e)return JSON.parse(atob(e))}}catch{}return null}let m="lightseer",$=[],w=[],r=[],c=3,p=0,o="deckpicker";const U=[1,3,5,7,10],g=document.getElementById("app"),q=["🥚","✨","🌍","🤱","👤","🔮","💞","☸️","🌾","🏔️","⏳","⚡","🗡️","💀","💧","👹","🪨","⭐","🌙","☀️","🦌","🌎"],J={Nature:"🌿",Souls:"👁️",Blood:"🩸",Jewels:"💎"};function h(e){return e.type==="major"?q[e.number]||"🔮":J[e.suit]||"🃏"}async function W(){const e=await R();if(e&&e.deckId&&u[e.deckId]&&(m=e.deckId,c=e.pullCount||3,e.drawnCards&&e.drawnCards.length>0)){r=e.drawnCards,p=e.viewIndex||0,$=u[m].build(),o="card",f(p);return}T()}function T(){o="deckpicker",g.innerHTML=`
    <div class="deck-picker">
      <div class="dp-title">🔮</div>
      <h1 class="dp-heading">TAROT</h1>
      <p class="dp-sub">Choose your deck</p>
      <div class="dp-decks">
        ${Object.values(u).map(e=>`
          <button class="dp-deck ${e.id===m?"active":""}" data-id="${e.id}">
            <img class="dp-thumb" src="${e.thumb}" alt="${e.name}" onerror="this.style.display='none'" />
            <span class="dp-name">${e.name}</span>
          </button>
        `).join("")}
      </div>
      <button id="dpContinue" class="btn-shuffle">CONTINUE</button>
    </div>
  `,document.querySelectorAll(".dp-deck").forEach(e=>{e.addEventListener("click",()=>{m=e.dataset.id,document.querySelectorAll(".dp-deck").forEach(t=>t.classList.remove("active")),e.classList.add("active")})}),document.getElementById("dpContinue").addEventListener("click",()=>{$=u[m].build(),b()})}function b(){o="home";const e=u[m];g.innerHTML=`
    <div class="home">
      <h2 class="home-deck-name">${e.name}</h2>
      <p class="subtitle">78 Cards · Reversals</p>
      <div class="pull-selector">
        <p class="pull-label">Cards to pull</p>
        <div class="pull-options">
          ${U.map(t=>`
            <button class="pull-opt ${t===c?"active":""}" data-count="${t}">${t}</button>
          `).join("")}
        </div>
      </div>
      <button id="shuffleBtn" class="btn-shuffle">SHUFFLE & DRAW</button>
      <p class="hint">or press side button</p>
      <button id="backBtn" class="link-btn">← Change deck</button>
    </div>
  `,document.querySelectorAll(".pull-opt").forEach(t=>{t.addEventListener("click",()=>{c=parseInt(t.dataset.count),document.querySelectorAll(".pull-opt").forEach(n=>n.classList.remove("active")),t.classList.add("active")})}),document.getElementById("shuffleBtn").addEventListener("click",v),document.getElementById("backBtn").addEventListener("click",T)}function v(){w=H($),r=[],p=0,K()}function K(){g.innerHTML=`
    <div class="shuffling">
      <div class="shuffle-anim">
        <div class="card-fly c1">🂠</div>
        <div class="card-fly c2">🂠</div>
        <div class="card-fly c3">🂠</div>
      </div>
      <p class="shuffle-text">Shuffling...</p>
    </div>
  `,setTimeout(()=>L(),1200)}function L(){o="grid";const e=r.length,t=c-e;g.innerHTML=`
    <div class="grid-screen">
      <div class="grid-header">
        <span class="grid-status">Pick ${t} card${t!==1?"s":""}</span>
        <span class="grid-count">${e}/${c}</span>
      </div>
      <div class="grid-wrap">
        <div class="grid">
          ${w.map((d,s)=>`<div class="grid-card ${r.some(l=>l._gridIdx===s)?"picked":""}" data-idx="${s}"></div>`).join("")}
        </div>
      </div>
      ${e===c?`
        <button id="viewSpreadBtn" class="btn-shuffle">VIEW SPREAD</button>
      `:`
        <p class="grid-hint">Tap cards to select</p>
      `}
    </div>
  `,e<c&&document.querySelectorAll(".grid-card:not(.picked)").forEach(d=>{d.addEventListener("click",()=>{const s=parseInt(d.dataset.idx),i={...w[s],_gridIdx:s};if(r.push(i),d.classList.add("picked","just-picked"),r.length>=c)setTimeout(()=>L(),400);else{const l=document.querySelector(".grid-status"),y=document.querySelector(".grid-count"),S=c-r.length;l&&(l.textContent=`Pick ${S} card${S!==1?"s":""}`),y&&(y.textContent=`${r.length}/${c}`)}})});const n=document.getElementById("viewSpreadBtn");n&&n.addEventListener("click",_)}function _(){o="spread";const e=u[m];g.innerHTML=`
    <div class="spread-screen">
      <div class="spread-header">
        <span class="spread-title">${e.name} · ${r.length}-Card Spread</span>
      </div>
      <div class="spread-area">
        ${r.map((t,n)=>{const d=e.hasImages&&t.image;return`
            <div class="spread-card ${t.reversed?"reversed":""}" data-idx="${n}">
              ${d?`<img class="spread-img" src="${t.image}" alt="${t.name}" onerror="this.outerHTML='<div class=\\'spread-symbol\\'>${h(t)}</div>'" />`:`<div class="spread-symbol">${h(t)}</div>`}
              <div class="spread-label">${t.reversed?"↓":""}</div>
            </div>
          `}).join("")}
      </div>
      <div class="spread-nav">
        <button id="spreadDetailBtn" class="btn-shuffle btn-sm">VIEW DETAILS</button>
        <button id="spreadHomeBtn" class="link-btn">↻ New Reading</button>
      </div>
    </div>
  `,document.querySelectorAll(".spread-card").forEach(t=>{t.addEventListener("click",()=>{const n=parseInt(t.dataset.idx);f(n)})}),document.getElementById("spreadDetailBtn").addEventListener("click",()=>f(0)),document.getElementById("spreadHomeBtn").addEventListener("click",b),I()}function f(e){if(e<0||e>=r.length)return;p=e,o="card";const t=r[e],n=u[m],d=t.type==="major",s=t.reversed?"Reversed":"Upright",i=d?`Major · ${t.number}`:`Minor · ${t.suit||""}`,l=n.hasImages&&t.image;g.innerHTML=`
    <div class="card-view">
      <div class="card-header">
        <span class="card-count">${e+1} / ${r.length}</span>
        <span class="card-type">${i}</span>
      </div>
      <div class="card-frame">
        ${l?`<div class="card-img-wrap ${t.reversed?"reversed":""}">
               <img class="card-img" src="${t.image}" alt="${t.name}" onerror="this.parentElement.innerHTML='<div class=\\'card-fallback\\'>${h(t)}<br>${t.name}</div>'" />
             </div>`:`<div class="card-symbol-wrap ${t.reversed?"reversed":""}">
               <div class="card-big-symbol">${h(t)}</div>
             </div>`}
      </div>
      <div class="card-info">
        <span class="card-name">${t.name}</span>
        <span class="card-orientation ${t.reversed?"rev":"up"}">${s}</span>
      </div>
      <div class="card-nav">
        <button id="prevBtn" class="nav-btn" ${e===0?"disabled":""}>◀</button>
        <button id="spreadBtn" class="nav-btn home-btn">☰</button>
        <button id="reshuffleBtn" class="nav-btn reshuffle">↻</button>
        <button id="nextBtn" class="nav-btn" ${e===r.length-1?"disabled":""}>▶</button>
      </div>
    </div>
  `,document.getElementById("prevBtn").addEventListener("click",()=>f(e-1)),document.getElementById("nextBtn").addEventListener("click",()=>f(e+1)),document.getElementById("reshuffleBtn").addEventListener("click",v),document.getElementById("spreadBtn").addEventListener("click",_),I()}function I(){N({deckId:m,pullCount:c,drawnCards:r.map(e=>({name:e.name,type:e.type,number:e.number,suit:e.suit,image:e.image,reversed:e.reversed})),viewIndex:p,timestamp:Date.now()})}window.addEventListener("sideClick",()=>{o==="deckpicker"?($=u[m].build(),b()):o==="home"?v():o==="spread"?f(0):o==="card"&&v()});window.addEventListener("scrollDown",()=>{o==="card"&&p<r.length-1&&f(p+1)});window.addEventListener("scrollUp",()=>{o==="card"&&p>0&&f(p-1)});typeof PluginMessageHandler>"u"&&window.addEventListener("keydown",e=>{e.code==="Space"?(e.preventDefault(),window.dispatchEvent(new CustomEvent("sideClick"))):e.code==="ArrowDown"||e.code==="ArrowRight"?(e.preventDefault(),window.dispatchEvent(new CustomEvent("scrollDown"))):(e.code==="ArrowUp"||e.code==="ArrowLeft")&&(e.preventDefault(),window.dispatchEvent(new CustomEvent("scrollUp")))});document.addEventListener("DOMContentLoaded",W);
