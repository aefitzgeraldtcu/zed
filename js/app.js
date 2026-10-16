alert("app.js is loaded");
const OUTCOMES = {
  cactus:  { emoji:"🌵", title:"Cactus",  tag:"Low maintenance, high attitude.",
             text:"You thrive on independence and a bit of neglect. You have boundaries, a sharp sense of humor, and you bloom exactly when you decide to." },
  monstera:{ emoji:"🌴", title:"Monstera", tag:"The main character.",
             text:"You take up space and everyone notices. You love growth, big plans, and the occasional dramatic new leaf. Bring a trellis." },
  pothos:  { emoji:"🌿", title:"Pothos",   tag:"Easygoing and everyone's favorite.",
             text:"You adapt to anything and make every room feel friendlier. People think you're effortless. You are, mostly." },
  orchid:  { emoji:"🌺", title:"Orchid",   tag:"Elegant, particular, worth it.",
             text:"You know what you like and you're not shy about it. You do your best work with the right conditions, and the results are stunning." }
};

const QUESTIONS = [
  { q:"It's Saturday morning. What's the plan?", a:[
    { t:"Sleep in, then do absolutely nothing", p:{cactus:2, pothos:1} },
    { t:"Farmers market, then brunch with friends", p:{pothos:2, monstera:1} },
    { t:"A new project I've been itching to start", p:{monstera:2, cactus:1} },
    { t:"A quiet coffee and a very good book", p:{orchid:2, cactus:1} } ]},
  { q:"Pick a group-chat role:", a:[
    { t:"The one who replies three days later", p:{cactus:2} },
    { t:"The one who plans everything", p:{monstera:2, orchid:1} },
    { t:"The one who sends memes constantly", p:{pothos:2} },
    { t:"The one with the perfectly worded take", p:{orchid:2} } ]},
  { q:"Your ideal vacation:", a:[
    { t:"Desert road trip, windows down", p:{cactus:2, monstera:1} },
    { t:"Tropical resort with a jungle tour", p:{monstera:2, pothos:1} },
    { t:"A cozy cabin with no itinerary", p:{pothos:2, cactus:1} },
    { t:"A boutique hotel in a city I've researched for months", p:{orchid:2} } ]},
  { q:"How do you handle stress?", a:[
    { t:"Retreat and recharge alone", p:{cactus:2, orchid:1} },
    { t:"Talk it out with someone", p:{pothos:2} },
    { t:"Make a plan and fix it", p:{monstera:2} },
    { t:"Take a long bath, light a candle, reset", p:{orchid:2, pothos:1} } ]},
  { q:"What would your friends say about you?", a:[
    { t:"\"Surprisingly tough.\"", p:{cactus:2} },
    { t:"\"Impossible not to notice.\"", p:{monstera:2} },
    { t:"\"Gets along with everyone.\"", p:{pothos:2} },
    { t:"\"Has impeccable taste.\"", p:{orchid:2} } ]}
];

/* ---------- LOGIC ---------- */
const $ = id => document.getElementById(id);
let current = 0, answers = [];  // answers[i] = index of option chosen

function show(id){ ["start","quiz","result"].forEach(s => $(s).hidden = s !== id); }

function render(){
  const item = QUESTIONS[current];
  $("count").textContent = `Question ${current+1} of ${QUESTIONS.length}`;
  $("bar").style.width = (current / QUESTIONS.length * 100) + "%";
  $("question").textContent = item.q;
  $("backBtn").hidden = current === 0;
  const box = $("options"); box.innerHTML = "";
  item.a.forEach((opt, i) => {
    const b = document.createElement("button");
    b.className = "opt" + (answers[current] === i ? " picked" : "");
    b.textContent = opt.t;
    b.onclick = () => choose(i);
    box.appendChild(b);
  });
  $("question").focus({preventScroll:true});
}

function choose(i){
  answers[current] = i;
  if (current < QUESTIONS.length - 1){ current++; render(); }
  else finish();
}

function score(){
  const totals = Object.fromEntries(Object.keys(OUTCOMES).map(k => [k,0]));
  answers.forEach((ai, qi) => {
    const pts = QUESTIONS[qi].a[ai].p;
    for (const k in pts) totals[k] += pts[k];
  });
  return totals;
}

function finish(){
  const totals = score();
  const sum = Object.values(totals).reduce((a,b)=>a+b,0) || 1;
  // sort by points; on a tie, the outcome listed first in OUTCOMES wins
  const ranked = Object.keys(totals).sort((a,b) => totals[b] - totals[a]);
  const win = OUTCOMES[ranked[0]];
  $("rEmoji").textContent = win.emoji;
  $("rTitle").textContent = `You're a ${win.title}!`;
  $("rTag").textContent = win.tag;
  $("rText").textContent = win.text;
  const bars = $("bars"); bars.innerHTML = "";
  ranked.forEach((k, idx) => {
    const pct = Math.round(totals[k] / sum * 100);
    const row = document.createElement("div");
    row.className = "bar" + (idx === 0 ? " win" : "");
    row.innerHTML = `<span>${OUTCOMES[k].emoji} ${OUTCOMES[k].title}</span><div class="track"><div class="fill"></div></div><span>${pct}%</span>`;
    bars.appendChild(row);
    requestAnimationFrame(() => requestAnimationFrame(() => row.querySelector(".fill").style.width = pct + "%"));
  });
  $("copyBtn").dataset.text = `I'm a ${win.title} ${win.emoji} — ${win.tag} Which houseplant are you?`;
  $("copyBtn").textContent = "Copy my result";
  show("result");
  $("rTitle").focus();
}

function restart(){ current = 0; answers = []; show("quiz"); render(); }

$("startBtn").onclick = restart;
$("retryBtn").onclick = restart;
$("backBtn").onclick = () => { if (current > 0){ current--; render(); } };
$("copyBtn").onclick = async e => {
  try { await navigator.clipboard.writeText(e.target.dataset.text); e.target.textContent = "Copied!"; }
  catch { e.target.textContent = "Copy not available"; }
};