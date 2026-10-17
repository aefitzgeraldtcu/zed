const OUTCOMES = {
  Yunah:  { emoji:"🐯", title:"Yunah",  tag:"Low maintenance friend, high quality side quests.",
             text:"You are excellent at reading the room. You're great with people and love to be social, which is why you're definitely the planner of the group." },
  Minju:  { emoji:"🐰", title:"Minju", tag:"The resident shy girl.",
             text:"You're probably a little more on the quiet side. It's not that you don't love your friends, you're just very independent and need to take time on your own to recharge." },
  Moka:   { emoji:"🐹", title:"Moka",   tag:"Fashionable and iconic.",
             text:"You're one of those girls that is just effortlessly cool. You know what you like and aren't afraid to make a plan and go after it, but you never seem like you're trying too hard in the process." },
  Wonhee: { emoji:"🐥", title:"Wonhee",   tag:"Main character - no question.",
             text:"When you walk into a room, everyone notices. You're funny, bold, and you never give a bad take." },
  Iroha:  { emoji:"🦊", title:"Iroha",   tag:"Jack of all trades, master of fun.",
             text:"You might be one of the younger friends in your circle, but people underestimate how much you can handle. You're always working on something new, and love to show people new ways to be creative." }
};

const QUESTIONS = [
  { q:"It's Saturday morning. What's the plan?", a:[
    { t:"Sleep in, then do absolutely nothing", p:{Minju:2, Wonhee:1} },
    { t:"Farmers market, then brunch with friends", p:{Yunah:2, Iroha:1} },
    { t:"A new project I've been itching to start", p:{Iroha:2, Yunah:1} },
    { t:"A quiet coffee and a very good book", p:{Moka:2, Minju:1} } ]},
  { q:"Pick a group-chat role:", a:[
    { t:"The one who replies three days later", p:{Minju:2} },
    { t:"The one who plans everything", p:{Moka:2, Yunah:1} },
    { t:"The one who sends memes constantly", p:{Iroha:2} },
    { t:"The one with the perfectly worded take", p:{Wonhee:2} } ]},
  { q:"Your ideal vacation:", a:[
    { t:"Desert road trip, windows down", p:{Minju:2, Yunah:1} },
    { t:"Tropical resort with a jungle tour", p:{Yunah:2, Iroha:1} },
    { t:"A cozy cabin with no itinerary", p:{Wonhee:2, Moka:1} },
    { t:"A boutique hotel in a city I've researched for months", p:{Moka:2} } ]},
  { q:"How do you handle stress?", a:[
    { t:"Retreat and recharge alone", p:{Minju:2, Iroha:1} },
    { t:"Talk it out with someone", p:{Wonhee:2} },
    { t:"Make a plan and fix it", p:{Yunah:2} },
    { t:"Take a long bath, light a candle, reset", p:{Iroha:2, Moka:1} } ]},
  { q:"What would your friends say about you?", a:[
    { t:"\"Surprisingly tough.\"", p:{Iroha:2, Minju:1} },
    { t:"\"Impossible not to notice.\"", p:{Wonhee:2} },
    { t:"\"Gets along with everyone.\"", p:{Yunah:2} },
    { t:"\"Has impeccable taste.\"", p:{Moka:2} } ]}
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
  const recent = {...totals };
  answers.forEach((ai, qi) => {
    const pts = QUESTIONS[qi].a[ai].p;
    for (const k in pts) {
      totals[k] += pts[k];
      recent[k] += pts[k] * (qi + 1);
    }
  });
  return { totals, recent };
}

function finish(){
  const { totals, recent } = score();
  const sum = Object.values(totals).reduce((a,b)=>a+b,0) || 1;
  const ranked = Object.keys(totals).sort((a,b) => (totals[b] - totals[a]) || (recent[b] - recent[a]));
  const win = OUTCOMES[ranked[0]];
  $("rEmoji").textContent = win.emoji;
  $("rTitle").textContent = `You got ${win.title}!`;
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
  $("copyBtn").dataset.text = `My bias is ${win.title} ${win.emoji} — ${win.tag} Which Illit member is your favorite?`;
  $("copyBtn").textContent = "Copy my result";
  show("result");
  launchConfetti();
  playSong();
  $("rTitle").focus();
  $("rTitle").focus();
}

const song = new Audio("audio/results.mp3");
song.volume = 0.6;

function playSong(){
  song.currentTime = 0;
  song.play().catch(() => {});
  $("musicBtn").textContent = "Pause music";
}

function stopSong(){
  song.pause();
  song.currentTime = 0;
}

const canvas = $("confetti");
const ctx = canvas.getContext("2d");
let pieces = [], raf = null;

function launchConfetti(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const colors = ["#ff3d7f", "#ffd23f", "#6cd4ff", "#9b7bff", "#7be0a4"];
  pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    vx: -1 + Math.random() * 2,
    vy: 2 + Math.random() * 3,
    rot: Math.random() * Math.PI * 2,
    vr: -0.1 + Math.random() * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
  cancelAnimationFrame(raf);
  (function frame(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    pieces = pieces.filter(p => p.y < canvas.height + 20);
    if (pieces.length) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();
}

function stopConfetti(){
  cancelAnimationFrame(raf);
  pieces = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

$("musicBtn").onclick = () => {
  if (song.paused){ song.play().catch(() => {}); $("musicBtn").textContent = "Pause music"; }
  else { song.pause(); $("musicBtn").textContent = "Play music"; }
};

function restart(){ stopSong(); stopConfetti(); current = 0; answers = []; show("quiz"); render(); }

$("startBtn").onclick = restart;
$("retryBtn").onclick = restart;
$("backBtn").onclick = () => { if (current > 0){ current--; render(); } };
$("copyBtn").onclick = async e => {
  try { await navigator.clipboard.writeText(e.target.dataset.text); e.target.textContent = "Copied!"; }
  catch { e.target.textContent = "Copy not available"; }
};