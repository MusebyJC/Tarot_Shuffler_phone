(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))a(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const m of r.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&a(m)}).observe(document,{childList:!0,subtree:!0});function s(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(t){if(t.ep)return;t.ep=!0;const r=s(t);fetch(t.href,r)}})();const g="https://lightseerstarot.com/wp-content/uploads/2019/07/",w="https://lightseerstarot.com/wp-content/uploads/2019/06/",E=[{name:"The Fool",num:"00",slug:"fool"},{name:"The Magician",num:"01",slug:"magician"},{name:"The High Priestess",num:"02",slug:"hp"},{name:"The Empress",num:"03",slug:"empress"},{name:"The Emperor",num:"04",slug:"emperor"},{name:"The Hierophant",num:"05",slug:"hierophant"},{name:"The Lovers",num:"06",slug:"lovers"},{name:"The Chariot",num:"07",slug:"chariot"},{name:"Strength",num:"08",slug:"strength"},{name:"The Hermit",num:"09",slug:"hermit"},{name:"Wheel of Fortune",num:"10",slug:"wheel"},{name:"Justice",num:"11",slug:"justice"},{name:"The Hanged Man",num:"12",slug:"hangedman"},{name:"Death",num:"13",slug:"death"},{name:"Temperance",num:"14",slug:"temperance"},{name:"The Devil",num:"15",slug:"devil"},{name:"The Tower",num:"16",slug:"tower"},{name:"The Star",num:"17",slug:"star"},{name:"The Moon",num:"18",slug:"moon"},{name:"The Sun",num:"19",slug:"sun"},{name:"Judgement",num:"20",slug:"judgement"},{name:"The World",num:"21",slug:"world"}],L=["wands","cups","swords","pentacles"],p={wands:"Wands",cups:"Cups",swords:"Swords",pentacles:"Pentacles"},T=[{name:"Ace",num:"01",prefix:"aceof"},{name:"Two",num:"02",prefix:"of"},{name:"Three",num:"03",prefix:"of"},{name:"Four",num:"04",prefix:"of"},{name:"Five",num:"05",prefix:"of"},{name:"Six",num:"06",prefix:"of"},{name:"Seven",num:"07",prefix:"of"},{name:"Eight",num:"08",prefix:"of"},{name:"Nine",num:"09",prefix:"of"},{name:"Ten",num:"10",prefix:"of"},{name:"Page",num:"11",prefix:"pageof"},{name:"Knight",num:"12",prefix:"knightof"},{name:"Queen",num:"13",prefix:"queenof"},{name:"King",num:"14",prefix:"kingof"}];function b(){const e=[];return E.forEach(n=>{e.push({name:n.name,type:"major",number:parseInt(n.num),image:`${g}${n.num}${n.slug}_250.jpg`})}),L.forEach(n=>{T.forEach(s=>{e.push({name:`${s.name} of ${p[n]}`,type:"minor",suit:p[n],image:`${w}${s.num}${s.prefix}${n}_250.jpg`})})}),e}function y(e){const n=e.map(s=>({...s,reversed:Math.random()<.5}));for(let s=n.length-1;s>0;s--){const a=Math.floor(Math.random()*(s+1));[n[s],n[a]]=[n[a],n[s]]}return n}let h=[],o=[],i=0,c=3,l="home";const $=[1,3,5,7,10];function S(){h=b(),o=[],i=0,l="home",v()}const f=document.getElementById("app");function v(){l="home",f.innerHTML=`
    <div class="home">
      <div class="title-icon">🔮</div>
      <h1>TAROT</h1>
      <p class="subtitle">Light Seer's Deck · 78 Cards</p>
      <div class="pull-selector">
        <p class="pull-label">Cards to pull</p>
        <div class="pull-options">
          ${$.map(e=>`
            <button class="pull-opt ${e===c?"active":""}" data-count="${e}">${e}</button>
          `).join("")}
        </div>
      </div>
      <button id="shuffleBtn" class="btn-shuffle">SHUFFLE & DRAW</button>
      <p class="hint">or press side button</p>
    </div>
  `,document.querySelectorAll(".pull-opt").forEach(e=>{e.addEventListener("click",()=>{c=parseInt(e.dataset.count),document.querySelectorAll(".pull-opt").forEach(n=>n.classList.remove("active")),e.classList.add("active")})}),document.getElementById("shuffleBtn").addEventListener("click",d)}function d(){o=y(h).slice(0,c),i=0,A()}function A(){f.innerHTML=`
    <div class="shuffling">
      <div class="shuffle-anim">
        <div class="card-fly c1">🂠</div>
        <div class="card-fly c2">🂠</div>
        <div class="card-fly c3">🂠</div>
      </div>
      <p class="shuffle-text">Drawing ${c} card${c>1?"s":""}...</p>
    </div>
  `,setTimeout(()=>{l="card",u(0)},1200)}function u(e){if(e<0||e>=o.length)return;i=e,l="card";const n=o[e],s=n.type==="major",a=n.reversed?"Reversed":"Upright",t=s?`Major Arcana · ${n.number}`:"Minor Arcana";f.innerHTML=`
    <div class="card-view">
      <div class="card-header">
        <span class="card-count">${e+1} / ${o.length}</span>
        <span class="card-type">${t}</span>
      </div>
      <div class="card-frame">
        <div class="card-img-wrap ${n.reversed?"reversed":""}">
          <img class="card-img" src="${n.image}" alt="${n.name}" onerror="this.parentElement.innerHTML='<div class=\\'card-fallback\\'>${n.name}</div>'" />
        </div>
      </div>
      <div class="card-info">
        <span class="card-name">${n.name}</span>
        <span class="card-orientation ${n.reversed?"rev":"up"}">${a}</span>
      </div>
      <div class="card-nav">
        <button id="prevBtn" class="nav-btn" ${e===0?"disabled":""}>◀</button>
        <button id="homeBtn" class="nav-btn home-btn">⌂</button>
        <button id="reshuffleBtn" class="nav-btn reshuffle">↻</button>
        <button id="nextBtn" class="nav-btn" ${e===o.length-1?"disabled":""}>▶</button>
      </div>
    </div>
  `,document.getElementById("prevBtn").addEventListener("click",()=>u(e-1)),document.getElementById("nextBtn").addEventListener("click",()=>u(e+1)),document.getElementById("reshuffleBtn").addEventListener("click",d),document.getElementById("homeBtn").addEventListener("click",v)}window.addEventListener("sideClick",()=>{d()});window.addEventListener("scrollDown",()=>{l==="card"&&i<o.length-1&&u(i+1)});window.addEventListener("scrollUp",()=>{l==="card"&&i>0&&u(i-1)});typeof PluginMessageHandler>"u"&&window.addEventListener("keydown",e=>{e.code==="Space"?(e.preventDefault(),window.dispatchEvent(new CustomEvent("sideClick"))):e.code==="ArrowDown"||e.code==="ArrowRight"?(e.preventDefault(),window.dispatchEvent(new CustomEvent("scrollDown"))):(e.code==="ArrowUp"||e.code==="ArrowLeft")&&(e.preventDefault(),window.dispatchEvent(new CustomEvent("scrollUp")))});document.addEventListener("DOMContentLoaded",S);
