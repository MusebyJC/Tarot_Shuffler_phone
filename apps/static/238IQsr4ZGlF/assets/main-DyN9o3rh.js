(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))d(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&d(c)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function d(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();const p=["The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man","Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"],m=["Wands","Cups","Swords","Pentacles"],g=["Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King"],w={Wands:"🪄",Cups:"🏆",Swords:"⚔️",Pentacles:"⭐"},y=["🃏","🎩","🌙","👑","🏛️","⛪","❤️","🏇","🦁","🏔️","☸️","⚖️","🔗","💀","⚗️","😈","🗼","⭐","🌙","☀️","📯","🌍"];function v(){const e=[];return p.forEach((t,n)=>{e.push({name:t,type:"major",number:n,symbol:y[n]})}),m.forEach(t=>{g.forEach((n,d)=>{e.push({name:`${n} of ${t}`,type:"minor",suit:t,rank:d,symbol:w[t]})})}),e}function h(e){const t=e.map(n=>({...n,reversed:Math.random()<.5}));for(let n=t.length-1;n>0;n--){const d=Math.floor(Math.random()*(n+1));[t[n],t[d]]=[t[d],t[n]]}return t}let i=[],o=0,a=!1;function E(){i=h(v()),o=0,a=!1,T()}const f=document.getElementById("app");function T(){a=!1,f.innerHTML=`
    <div class="home">
      <div class="title-icon">🔮</div>
      <h1>TAROT</h1>
      <p class="subtitle">78 Cards · Reversals</p>
      <div class="deck-visual">
        <div class="deck-stack">
          <div class="deck-card dc1"></div>
          <div class="deck-card dc2"></div>
          <div class="deck-card dc3"></div>
        </div>
      </div>
      <button id="shuffleBtn" class="btn-shuffle">SHUFFLE DECK</button>
      <p class="hint">or press side button</p>
    </div>
  `,document.getElementById("shuffleBtn").addEventListener("click",u)}function u(){i=h(v()),o=0,b()}function b(){f.innerHTML=`
    <div class="shuffling">
      <div class="shuffle-anim">
        <div class="card-fly c1">🂠</div>
        <div class="card-fly c2">🂠</div>
        <div class="card-fly c3">🂠</div>
      </div>
      <p class="shuffle-text">Shuffling...</p>
    </div>
  `,setTimeout(()=>{a=!0,l(0)},1200)}function l(e){var c;if(e<0||e>=i.length)return;o=e;const t=i[e],n=t.type==="major",d=t.reversed?"reversed":"",s=t.reversed?"(Reversed)":"(Upright)",r=n?`Major Arcana · ${t.number}`:"Minor Arcana";f.innerHTML=`
    <div class="card-view">
      <div class="card-header">
        <span class="card-count">${e+1} / ${i.length}</span>
        <span class="card-type">${r}</span>
      </div>
      <div class="card-face ${d} ${n?"major":"minor-"+((c=t.suit)==null?void 0:c.toLowerCase())}">
        <div class="card-symbol">${t.symbol}</div>
        <div class="card-name">${t.name}</div>
        <div class="card-orientation ${t.reversed?"rev":"up"}">${s}</div>
      </div>
      <div class="card-nav">
        <button id="prevBtn" class="nav-btn" ${e===0?"disabled":""}>◀</button>
        <button id="reshuffleBtn" class="nav-btn reshuffle">↻</button>
        <button id="nextBtn" class="nav-btn" ${e===i.length-1?"disabled":""}>▶</button>
      </div>
    </div>
  `,document.getElementById("prevBtn").addEventListener("click",()=>l(e-1)),document.getElementById("nextBtn").addEventListener("click",()=>l(e+1)),document.getElementById("reshuffleBtn").addEventListener("click",u)}window.addEventListener("sideClick",()=>{u()});window.addEventListener("scrollDown",()=>{a&&o<i.length-1&&l(o+1)});window.addEventListener("scrollUp",()=>{a&&o>0&&l(o-1)});typeof PluginMessageHandler>"u"&&window.addEventListener("keydown",e=>{e.code==="Space"?(e.preventDefault(),window.dispatchEvent(new CustomEvent("sideClick"))):e.code==="ArrowDown"||e.code==="ArrowRight"?(e.preventDefault(),window.dispatchEvent(new CustomEvent("scrollDown"))):(e.code==="ArrowUp"||e.code==="ArrowLeft")&&(e.preventDefault(),window.dispatchEvent(new CustomEvent("scrollUp")))});document.addEventListener("DOMContentLoaded",E);
