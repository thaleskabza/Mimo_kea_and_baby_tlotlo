const sceneWrap  = document.getElementById("sceneWrap");
const scene      = document.getElementById("scene");
const particles  = document.getElementById("particles");
const storyText  = document.getElementById("storyText");
const pageNum    = document.getElementById("pageNum");
const pageTotal  = document.getElementById("pageTotal");
const dotsEl     = document.getElementById("dots");
const prevBtn    = document.getElementById("prevBtn");
const nextBtn    = document.getElementById("nextBtn");
const playBtn    = document.getElementById("playBtn");

const wait = ms => new Promise(r => setTimeout(r, ms));

function spawnParticles(x, y, emojis, count) {
 for (let i = 0; i < count; i++) {
	 const el = document.createElement("div");
	 el.className = "particle";
	 el.textContent = emojis[i % emojis.length];
	 el.style.left = (x + (Math.random() - .5) * 130) + "px";
	 el.style.top  = (y + (Math.random() - .5) * 80) + "px";
	 el.style.fontSize = (14 + Math.random() * 13) + "px";
	 particles.appendChild(el);
	 const a = el.animate([
		 { opacity: 0, transform: "scale(0) rotate(0deg) translateY(0)" },
		 { opacity: 1, transform: `scale(1.2) rotate(${Math.random()*200-100}deg) translateY(-${18+Math.random()*22}px)`, offset: .45 },
		 { opacity: 0, transform: `scale(.25) rotate(${Math.random()*360}deg) translateY(-${42+Math.random()*35}px)` }
	 ], { duration: 700 + Math.random() * 500, delay: i * 65, easing: "ease-out" });
	 a.onfinish = () => el.remove();
 }
}
const spawnStars  = (x, y, n) => spawnParticles(x, y, ["\u2728","\u2B50","\uD83C\uDF1F"], n);
const spawnHearts = (x, y, n) => spawnParticles(x, y, ["\uD83D\uDC95","\u2764\uFE0F","\uD83E\uDE77"], n);

function animateZzz(el, delay) {
 if (!el) return;
 el.animate([
	 { opacity: 0, transform: "translateY(0) scale(.4)" },
	 { opacity: 1, transform: "translateY(-10px) scale(.95)", offset: .15 },
	 { opacity: 1, transform: "translateY(-30px) scale(1)", offset: .4 },
	 { opacity: .5, transform: "translateY(-54px) scale(1.05)", offset: .72 },
	 { opacity: 0, transform: "translateY(-80px) scale(.6)" }
 ], { duration: 1400, delay: delay || 0, easing: "ease-out", fill: "forwards" });
}

const pages = [
 // ...existing pages array and logic from index.html...
];

let current = 0;
let playing = false;

function buildDots() {
 dotsEl.innerHTML = "";
 pages.forEach((_, i) => {
	 const d = document.createElement("button");
	 d.className = "dot" + (i === current ? " active" : "");
	 d.setAttribute("aria-label", "Page " + (i + 1));
	 d.addEventListener("click", () => { if (!playing) { current = i; renderPage(); } });
	 dotsEl.appendChild(d);
 });
}
function updateDots() {
 dotsEl.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === current));
}

function renderPage() {
 const p = pages[current];
 particles.innerHTML = "";

 sceneWrap.classList.remove("scene-enter");
 void sceneWrap.offsetWidth;
 sceneWrap.classList.add("scene-enter");

 p.build();

 storyText.className = "story text-enter";
 storyText.textContent = p.text;
 pageNum.textContent = String(current + 1);
 pageTotal.textContent = String(pages.length);

 prevBtn.disabled = current === 0;
 nextBtn.disabled = current === pages.length - 1;
 playBtn.disabled = false;
 playBtn.textContent = "\u25B6 Play";

 updateDots();
}

prevBtn.addEventListener("click", () => {
 if (current > 0 && !playing) { current--; renderPage(); }
});
nextBtn.addEventListener("click", () => {
 if (current < pages.length - 1 && !playing) { current++; renderPage(); }
});
document.addEventListener("keydown", e => {
 if (playing) return;
 if (e.key === "ArrowLeft" && current > 0) { current--; renderPage(); }
 if (e.key === "ArrowRight" && current < pages.length - 1) { current++; renderPage(); }
 if (e.key === " " || e.key === "Enter") { e.preventDefault(); playBtn.click(); }
});

playBtn.addEventListener("click", async () => {
 if (playing || playBtn.disabled) return;
 playing = true;
 playBtn.disabled = true;
 playBtn.textContent = "\u2728 Playing...";
 prevBtn.disabled = true;
 nextBtn.disabled = true;
 try {
	 await pages[current].play();
	 await wait(1200);
 } catch (e) {
	 console.warn("Anim error:", e);
 } finally {
	 playing = false;
	 playBtn.disabled = false;
	 playBtn.textContent = "\u25B6 Play";
	 prevBtn.disabled = current === 0;
	 nextBtn.disabled = current === pages.length - 1;
 }
});

buildDots();
renderPage();

