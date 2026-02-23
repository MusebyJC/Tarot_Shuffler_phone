(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const d of r.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&s(d)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();const i="https://lightseerstarot.com/wp-content/uploads/2019/07/",O="https://lightseerstarot.com/wp-content/uploads/2019/06/",R=[{name:"The Fool",img:`${i}00fool_250.jpg`},{name:"The Magician",img:`${i}01magician_250.jpg`},{name:"The High Priestess",img:`${i}02hp_250.jpg`},{name:"The Empress",img:`${i}03empress_250.jpg`},{name:"The Emperor",img:`${i}04emperor_250.jpg`},{name:"The Hierophant",img:`${i}05hierophant_250.jpg`},{name:"The Lovers",img:`${i}06lovers_250.jpg`},{name:"The Chariot",img:`${i}07chariot_250.jpg`},{name:"Strength",img:`${i}08strength_250.jpg`},{name:"The Hermit",img:`${i}09hermit_250.jpg`},{name:"Wheel of Fortune",img:`${i}10wheel_250.jpg`},{name:"Justice",img:`${i}11justice_250.jpg`},{name:"The Hanged Man",img:`${i}12hangedman_250.jpg`},{name:"Death",img:`${i}13death_250.jpg`},{name:"Temperance",img:`${i}14temperance_250.jpg`},{name:"The Devil",img:`${i}15devil_250.jpg`},{name:"The Tower",img:`${i}16tower_250.jpg`},{name:"The Star",img:`${i}17star_250.jpg`},{name:"The Moon",img:`${i}18moon_250.jpg`},{name:"The Sun",img:`${i}19sun_250.jpg`},{name:"Judgement",img:`${i}20judgement_250.jpg`},{name:"The World",img:`${i}21world_250.jpg`}],H=["wands","cups","swords","pentacles"],M={wands:"Wands",cups:"Cups",swords:"Swords",pentacles:"Pentacles"},F=[{name:"Ace",num:"01",prefix:"aceof"},{name:"Two",num:"02",prefix:"of"},{name:"Three",num:"03",prefix:"of"},{name:"Four",num:"04",prefix:"of"},{name:"Five",num:"05",prefix:"of"},{name:"Six",num:"06",prefix:"of"},{name:"Seven",num:"07",prefix:"of"},{name:"Eight",num:"08",prefix:"of"},{name:"Nine",num:"09",prefix:"of"},{name:"Ten",num:"10",prefix:"of"},{name:"Page",num:"11",prefix:"pageof"},{name:"Knight",num:"12",prefix:"knightof"},{name:"Queen",num:"13",prefix:"queenof"},{name:"King",num:"14",prefix:"kingof"}];function W(){const e=[];return R.forEach((n,t)=>e.push({name:n.name,type:"major",number:t,image:n.img})),H.forEach(n=>{F.forEach(t=>{e.push({name:`${t.name} of ${M[n]}`,type:"minor",suit:M[n],image:`${O}${t.num}${t.prefix}${n}_250.jpg`})})}),e}const N=["The Fool","The Magician","The Great Mother","The Mother","The Father","The Shaman","Union","The Chariot","Abundance","The Hermit","Time","Creative Power","Sacrifice","Death","Source","Demon","Menhir","Star","The Night","The Sun","The Prey","The World"],U=[{key:"nature",display:"Nature"},{key:"souls",display:"Souls"},{key:"blood",display:"Blood"},{key:"jewels",display:"Jewels"}],J=["Child","Animal","Woman","Man"];function K(){const e=[];return N.forEach((n,t)=>e.push({name:n,type:"major",number:t,image:null})),U.forEach(n=>{for(let t=1;t<=10;t++)e.push({name:`${t} of ${n.display}`,type:"minor",suit:n.display,image:null});J.forEach(t=>e.push({name:`${t} of ${n.display}`,type:"minor",suit:n.display,image:null}))}),e}const q=["The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man","Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"],Q=["Wands","Cups","Swords","Pentacles"],V=["Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King"];function I(){const e=[];return q.forEach((n,t)=>e.push({name:n,type:"major",number:t,image:null})),Q.forEach(n=>{V.forEach(t=>e.push({name:`${t} of ${n}`,type:"minor",suit:n,image:null}))}),e}const Y=["The Fool","The Magus","The Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Adjustment","The Hermit","Fortune","Lust","The Hanged Man","Death","Art","The Devil","The Tower","The Star","The Moon","The Sun","The Aeon","The Universe"],G=["Wands","Cups","Swords","Disks"],z=["Princess","Prince","Queen","Knight"];function X(){const e=[];return Y.forEach((n,t)=>e.push({name:n,type:"major",number:t,image:null})),G.forEach(n=>{for(let t=1;t<=10;t++){const s=t===1?"Ace":["","","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten"][t];e.push({name:`${s} of ${n}`,type:"minor",suit:n,image:null})}z.forEach(t=>e.push({name:`${t} of ${n}`,type:"minor",suit:n,image:null}))}),e}const Z=["Le Mat","Le Bateleur","La Papesse","L'Impératrice","L'Empereur","Le Pape","L'Amoureux","Le Chariot","La Justice","L'Hermite","La Roue de Fortune","La Force","Le Pendu","L'Arcane sans Nom","Tempérance","Le Diable","La Maison Dieu","L'Étoile","La Lune","Le Soleil","Le Jugement","Le Monde"],ee=["Bâtons","Coupes","Épées","Deniers"],ne=["Valet","Cavalier","Reine","Roi"];function te(){const e=[];return Z.forEach((n,t)=>e.push({name:n,type:"major",number:t,image:null})),ee.forEach(n=>{for(let t=1;t<=10;t++){const s=t===1?"As":String(t);e.push({name:`${s} de ${n}`,type:"minor",suit:n,image:null})}ne.forEach(t=>e.push({name:`${t} de ${n}`,type:"minor",suit:n,image:null}))}),e}const h=[{id:"lightseer",name:"Light Seer's",thumb:"https://lightseerstarot.com/wp-content/uploads/2019/07/00fool_250.jpg",build:W,hasImages:!0},{id:"rws",name:"Rider-Waite",thumb:"https://www.bottomofthecup.com/cdn/shop/products/300-118_Rider_Waite_1.jpg?v=1500496505",build:I,hasImages:!1},{id:"thoth",name:"Thoth",thumb:"https://m.media-amazon.com/images/I/81J7TNOay-L._AC_UF1000,1000_QL80_.jpg",build:X,hasImages:!1},{id:"marseille",name:"Marseille",thumb:"https://tarotarts.com/cdn/shop/products/Golden_Tarot_of_Marseille_box_0fa9465d-0077-432e-8e30-eb52a72ecd71_385x600.png?v=1574070476",build:te,hasImages:!1},{id:"wildunknown",name:"Wild Unknown",thumb:"https://m.media-amazon.com/images/I/812VbDPXt8L._AC_UF1000,1000_QL80_.jpg",build:I,hasImages:!1},{id:"primordial",name:"Primordial",thumb:"https://gaia.llewellyn.com/product_images/1000/9780738766416.jpg",build:K,hasImages:!1}],se={};h.forEach(e=>se[e.id]=e);function D(){const e=new Uint32Array(1);return(window.crypto||window.msCrypto).getRandomValues(e),e[0]/4294967296}function ae(e){const n=e.map(t=>({...t,reversed:D()<.5}));for(let t=n.length-1;t>0;t--){const s=Math.floor(D()*(t+1));[n[t],n[s]]=[n[s],n[t]]}return n}async function ie(e){try{window.creationStorage&&await window.creationStorage.plain.setItem("tarot_session",btoa(JSON.stringify(e)))}catch{}}async function re(){try{if(window.creationStorage){const e=await window.creationStorage.plain.getItem("tarot_session");if(e)return JSON.parse(atob(e))}}catch{}return null}let m=0,E=[],k=[],o=[],l=3,p=0,u="picker";const _=[1,2,3,5,7,10],S=document.getElementById("app"),oe=["🥚","✨","🌍","🤱","👤","🔮","💞","☸️","🌾","🏔️","⏳","⚡","🗡️","💀","💧","👹","🪨","⭐","🌙","☀️","🦌","🌎"],de=["🃏","✨","🌙","👑","🏛️","📿","❤️","⚔️","🦁","🏔️","☸️","⚖️","🔄","💀","🏺","😈","🗼","⭐","🌙","☀️","📯","🌎"],ce={Wands:"🪄",Cups:"🏆",Swords:"⚔️",Pentacles:"⭐",Disks:"💿",Nature:"🌿",Souls:"👁️",Blood:"🩸",Jewels:"💎",Bâtons:"🪵",Coupes:"🏆",Épées:"⚔️",Deniers:"🪙"};function y(e,n){return e.type==="major"?n==="primordial"?oe[e.number]||"🔮":de[e.number]||"🔮":ce[e.suit]||"🃏"}async function le(){const e=await re();if(e&&e.deckIdx!==void 0&&h[e.deckIdx]&&(m=e.deckIdx,l=e.pullCount||3,e.drawnCards&&e.drawnCards.length>0)){o=e.drawnCards,p=e.viewIndex||0,E=h[m].build(),g(p);return}A()}const w=48;function A(){u="picker";const e=_.indexOf(l);S.innerHTML=`
    <div class="picker-screen">
      <div class="picker-title">🔮</div>
      <h1 class="picker-heading">TAROT</h1>
      <div class="picker-cols">
        <div class="picker-col">
          <div class="picker-label">DECK</div>
          <div class="wheel-mask">
            <div class="wheel-highlight"></div>
            <div class="wheel-scroll" id="deckWheel">
              <div class="wheel-pad"></div>
              ${h.map((s,a)=>`
                <div class="wheel-item" data-idx="${a}">
                  <img class="wheel-thumb" src="${s.thumb}" alt="" onerror="this.style.display='none'" />
                  <span class="wheel-text">${s.name}</span>
                </div>
              `).join("")}
              <div class="wheel-pad"></div>
            </div>
          </div>
        </div>
        <div class="picker-col picker-col-count">
          <div class="picker-label">CARDS</div>
          <div class="wheel-mask">
            <div class="wheel-highlight"></div>
            <div class="wheel-scroll" id="countWheel">
              <div class="wheel-pad"></div>
              ${_.map((s,a)=>`
                <div class="wheel-item wheel-item-count" data-idx="${a}">
                  <span class="wheel-num">${s}</span>
                </div>
              `).join("")}
              <div class="wheel-pad"></div>
            </div>
          </div>
        </div>
      </div>
      <button id="startBtn" class="btn-start">START DRAW</button>
    </div>
  `;const n=document.getElementById("deckWheel"),t=document.getElementById("countWheel");j(n,m,s=>{m=s}),j(t,e>=0?e:2,s=>{l=_[s]}),document.getElementById("startBtn").addEventListener("click",()=>{E=h[m].build(),L()})}function j(e,n,t){const s=e.querySelectorAll(".wheel-item"),a=s.length,r=n*w;e.scrollTop=r;let d=null;function $(){const v=e.scrollTop,c=Math.round(v/w),f=Math.max(0,Math.min(c,a-1));e.scrollTo({top:f*w,behavior:"smooth"}),b(f),t(f)}function b(v){s.forEach((c,f)=>{const T=Math.abs(f-v);c.classList.toggle("active",T===0),c.style.opacity=T===0?"1":T===1?"0.45":"0.2";const P=T===0?1:T===1?.88:.75;c.style.transform=`scale(${P})`})}e.addEventListener("scroll",()=>{clearTimeout(d);const v=e.scrollTop,c=Math.round(v/w),f=Math.max(0,Math.min(c,a-1));b(f),d=setTimeout($,120)},{passive:!0}),b(n),s.forEach((v,c)=>{v.addEventListener("click",()=>{e.scrollTo({top:c*w,behavior:"smooth"}),setTimeout(()=>{b(c),t(c)},200)})})}function L(){k=ae(E),o=[],p=0,S.innerHTML=`
    <div class="shuffling">
      <div class="shuffle-cards">
        <div class="scard s1"></div>
        <div class="scard s2"></div>
        <div class="scard s3"></div>
        <div class="scard s4"></div>
        <div class="scard s5"></div>
      </div>
    </div>
  `,setTimeout(()=>x(),1400)}function x(){u="grid";const e=o.length,n=l-e;S.innerHTML=`
    <div class="grid-screen">
      <div class="grid-header">
        <span class="grid-status">Pick ${n} card${n!==1?"s":""}</span>
        <span class="grid-count">${e}/${l}</span>
      </div>
      <div class="grid-wrap">
        <div class="grid">
          ${k.map((s,a)=>`<div class="grid-card ${o.some(d=>d._gridIdx===a)?"picked":""}" data-idx="${a}"></div>`).join("")}
        </div>
      </div>
      ${e===l?'<button id="viewSpreadBtn" class="btn-start">VIEW SPREAD</button>':'<p class="grid-hint">Tap cards to select</p>'}
    </div>
  `,e<l&&document.querySelectorAll(".grid-card:not(.picked)").forEach(s=>{s.addEventListener("click",()=>{const a=parseInt(s.dataset.idx);if(o.push({...k[a],_gridIdx:a}),s.classList.add("picked","just-picked"),o.length>=l)setTimeout(()=>x(),400);else{const r=l-o.length,d=document.querySelector(".grid-status"),$=document.querySelector(".grid-count");d&&(d.textContent=`Pick ${r} card${r!==1?"s":""}`),$&&($.textContent=`${o.length}/${l}`)}})});const t=document.getElementById("viewSpreadBtn");t&&t.addEventListener("click",C)}function C(){u="spread";const e=h[m];S.innerHTML=`
    <div class="spread-screen">
      <div class="spread-header">
        <span class="spread-title">${e.name} · ${o.length}-Card Spread</span>
      </div>
      <div class="spread-area">
        ${o.map((n,t)=>{const s=e.hasImages&&n.image;return`
            <div class="spread-card ${n.reversed?"reversed":""}" data-idx="${t}">
              ${s?`<img class="spread-img" src="${n.image}" alt="${n.name}" onerror="this.outerHTML='<div class=\\'spread-symbol\\'>${y(n,e.id)}</div>'" />`:`<div class="spread-symbol">${y(n,e.id)}</div>`}
              <div class="spread-label">${n.reversed?"↓":""}</div>
            </div>
          `}).join("")}
      </div>
      <div class="spread-nav">
        <button id="spreadDetailBtn" class="btn-start btn-sm">VIEW DETAILS</button>
        <button id="spreadHomeBtn" class="link-btn">↻ New Reading</button>
      </div>
    </div>
  `,document.querySelectorAll(".spread-card").forEach(n=>{n.addEventListener("click",()=>g(parseInt(n.dataset.idx)))}),document.getElementById("spreadDetailBtn").addEventListener("click",()=>g(0)),document.getElementById("spreadHomeBtn").addEventListener("click",A),B()}function g(e){if(e<0||e>=o.length)return;p=e,u="card";const n=o[e],t=h[m],s=n.reversed?"Reversed":"Upright",a=n.type==="major"?`Major · ${n.number}`:`Minor · ${n.suit||""}`,r=t.hasImages&&n.image;S.innerHTML=`
    <div class="card-view">
      <div class="card-header">
        <span class="card-count">${e+1} / ${o.length}</span>
        <span class="card-type">${a}</span>
      </div>
      <div class="card-frame">
        ${r?`<div class="card-img-wrap ${n.reversed?"reversed":""}">
               <img class="card-img" src="${n.image}" alt="${n.name}" onerror="this.parentElement.innerHTML='<div class=\\'card-fallback\\'>${y(n,t.id)}<br>${n.name}</div>'" />
             </div>`:`<div class="card-symbol-wrap ${n.reversed?"reversed":""}">
               <div class="card-big-symbol">${y(n,t.id)}</div>
             </div>`}
      </div>
      <div class="card-info">
        <span class="card-name">${n.name}</span>
        <span class="card-orientation ${n.reversed?"rev":"up"}">${s}</span>
      </div>
      <div class="card-nav">
        <button id="prevBtn" class="nav-btn" ${e===0?"disabled":""}>◀</button>
        <button id="spreadBtn" class="nav-btn home-btn">☰</button>
        <button id="reshuffleBtn" class="nav-btn reshuffle">↻</button>
        <button id="nextBtn" class="nav-btn" ${e===o.length-1?"disabled":""}>▶</button>
      </div>
    </div>
  `,document.getElementById("prevBtn").addEventListener("click",()=>g(e-1)),document.getElementById("nextBtn").addEventListener("click",()=>g(e+1)),document.getElementById("reshuffleBtn").addEventListener("click",L),document.getElementById("spreadBtn").addEventListener("click",C),B()}function B(){ie({deckIdx:m,pullCount:l,drawnCards:o.map(e=>({name:e.name,type:e.type,number:e.number,suit:e.suit,image:e.image,reversed:e.reversed})),viewIndex:p,timestamp:Date.now()})}window.addEventListener("sideClick",()=>{u==="picker"?(E=h[m].build(),L()):u==="spread"?g(0):u==="card"&&L()});window.addEventListener("scrollDown",()=>{u==="card"&&p<o.length-1&&g(p+1)});window.addEventListener("scrollUp",()=>{u==="card"&&p>0&&g(p-1)});typeof PluginMessageHandler>"u"&&window.addEventListener("keydown",e=>{e.code==="Space"?(e.preventDefault(),window.dispatchEvent(new CustomEvent("sideClick"))):e.code==="ArrowDown"||e.code==="ArrowRight"?(e.preventDefault(),window.dispatchEvent(new CustomEvent("scrollDown"))):(e.code==="ArrowUp"||e.code==="ArrowLeft")&&(e.preventDefault(),window.dispatchEvent(new CustomEvent("scrollUp")))});document.addEventListener("DOMContentLoaded",le);
