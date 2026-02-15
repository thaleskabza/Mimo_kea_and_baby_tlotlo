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
const card       = document.querySelector(".card");

const wait = ms => new Promise(r => setTimeout(r, ms));

// Book flip animation
let flipping = false;
async function flipPage(direction) {
  if (flipping) return;
  flipping = true;

  const flipClass = direction === 'next' ? 'flip-next' : 'flip-prev';

  // Add flip animation to both sides
  sceneWrap.classList.add(flipClass);
  card.classList.add(flipClass);

  // Wait for half the animation, then change content
  await wait(350);

  // Update page content mid-flip
  const p = pages[current];
  particles.innerHTML = "";
  p.build();
  storyText.textContent = p.text;
  pageNum.textContent = String(current + 1);

  // Wait for animation to complete
  await wait(350);

  // Remove animation classes
  sceneWrap.classList.remove(flipClass);
  card.classList.remove(flipClass);

  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === pages.length - 1;
  updateDots();

  flipping = false;
}

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
  {
    text: "Once upon a time, there was a kind big sister named Kea and her baby sister, Tlotlo.",
    build() {
      scene.innerHTML = `
        <div class="character kea pop">👧<span class="label">Kea</span></div>
        <div class="character baby pop pop-d1">👶<span class="label">Baby Tlotlo</span></div>
      `;
    },
    async play() {
      const rect = scene.getBoundingClientRect();
      spawnStars(rect.width * 0.3, rect.height * 0.5, 6);
      await wait(400);
      spawnHearts(rect.width * 0.7, rect.height * 0.5, 5);
    }
  },
  {
    text: "Kea loved taking care of Baby Tlotlo. She would sing songs and make her laugh!",
    build() {
      scene.innerHTML = `
        <div class="character kea pop breathing">👧<span class="label">Kea</span></div>
        <div class="character baby pop pop-d1 bounce">👶<span class="label">Baby Tlotlo</span></div>
        <div class="speech pop pop-d2">🎵 La la la! 🎵</div>
      `;
    },
    async play() {
      const rect = scene.getBoundingClientRect();
      spawnHearts(rect.width * 0.5, rect.height * 0.4, 8);
      await wait(600);
      spawnStars(rect.width * 0.3, rect.height * 0.35, 5);
    }
  },
  {
    text: "One sunny day, Mum made them delicious warm drinks.",
    build() {
      scene.innerHTML = `
        <div class="character mum pop">👩<span class="label">Mum</span></div>
        <div class="cup c1 pop pop-d1">☕</div>
        <div class="cup c2 pop pop-d2">🍼</div>
      `;
    },
    async play() {
      const rect = scene.getBoundingClientRect();
      spawnStars(rect.width * 0.5, rect.height * 0.4, 7);
    }
  },
  {
    text: '"Here you go, my loves!" said Mum with a warm smile.',
    build() {
      scene.innerHTML = `
        <div class="character mum pop wiggle">👩<span class="label">Mum</span></div>
        <div class="character kea pop pop-d1">👧<span class="label">Kea</span></div>
        <div class="character baby pop pop-d2">👶<span class="label">Baby Tlotlo</span></div>
        <div class="speech pop pop-d3">Here you go, my loves! 💕</div>
      `;
    },
    async play() {
      const rect = scene.getBoundingClientRect();
      spawnHearts(rect.width * 0.5, rect.height * 0.3, 10);
    }
  },
  {
    text: "Kea helped Baby Tlotlo drink her warm milk. She was so happy!",
    build() {
      scene.innerHTML = `
        <div class="character kea pop">👧<span class="label">Kea</span></div>
        <div class="character baby pop pop-d1 bounce">👶<span class="label">Baby Tlotlo</span></div>
        <div class="cup c2 pop pop-d2">🍼</div>
      `;
    },
    async play() {
      const rect = scene.getBoundingClientRect();
      spawnHearts(rect.width * 0.5, rect.height * 0.5, 6);
      await wait(300);
      spawnStars(rect.width * 0.6, rect.height * 0.45, 4);
    }
  },
  {
    text: "After the warm drink, Baby Tlotlo started to feel very sleepy...",
    build() {
      scene.innerHTML = `
        <div class="character kea pop">👧<span class="label">Kea</span></div>
        <div class="character baby pop pop-d1">👶<span class="label">Baby Tlotlo</span></div>
        <div class="zzz" id="zzz1">z</div>
        <div class="zzz" id="zzz2">Z</div>
        <div class="zzz" id="zzz3">z</div>
      `;
    },
    async play() {
      animateZzz(document.getElementById("zzz1"), 0);
      animateZzz(document.getElementById("zzz2"), 300);
      animateZzz(document.getElementById("zzz3"), 600);
    }
  },
  {
    text: "Kea gently rocked Baby Tlotlo and whispered, 'Sleep tight, little one.'",
    build() {
      scene.innerHTML = `
        <div class="character kea pop breathing">👧<span class="label">Kea</span></div>
        <div class="character baby pop pop-d1">👶<span class="label">Baby Tlotlo</span></div>
        <div class="speech pop pop-d2">Sleep tight, little one 🌙</div>
        <div class="zzz" id="zzz1">z</div>
        <div class="zzz" id="zzz2">Z</div>
      `;
    },
    async play() {
      animateZzz(document.getElementById("zzz1"), 0);
      animateZzz(document.getElementById("zzz2"), 400);
      await wait(500);
      const rect = scene.getBoundingClientRect();
      spawnHearts(rect.width * 0.3, rect.height * 0.35, 5);
    }
  },
  {
    text: "And Baby Tlotlo fell fast asleep, dreaming happy dreams. The End! 💫",
    build() {
      scene.innerHTML = `
        <div class="character kea pop bounce">👧<span class="label">Kea</span></div>
        <div class="character baby pop pop-d1">👶<span class="label">Baby Tlotlo</span></div>
        <div class="zzz" id="zzz1">Z</div>
        <div class="zzz" id="zzz2">z</div>
        <div class="zzz" id="zzz3">Z</div>
      `;
    },
    async play() {
      animateZzz(document.getElementById("zzz1"), 0);
      animateZzz(document.getElementById("zzz2"), 250);
      animateZzz(document.getElementById("zzz3"), 500);
      await wait(700);
      const rect = scene.getBoundingClientRect();
      spawnStars(rect.width * 0.5, rect.height * 0.35, 12);
      spawnHearts(rect.width * 0.5, rect.height * 0.35, 8);
    }
  }
];

let current = 0;
let playing = false;

function buildDots() {
 dotsEl.innerHTML = "";
 pages.forEach((_, i) => {
	 const d = document.createElement("button");
	 d.className = "dot" + (i === current ? " active" : "");
	 d.setAttribute("aria-label", "Page " + (i + 1));
	 d.addEventListener("click", () => {
	   if (!playing && !flipping && i !== current) {
	     const direction = i > current ? 'next' : 'prev';
	     current = i;
	     flipPage(direction);
	   }
	 });
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
 if (current > 0 && !playing && !flipping) { current--; flipPage('prev'); }
});
nextBtn.addEventListener("click", () => {
 if (current < pages.length - 1 && !playing && !flipping) { current++; flipPage('next'); }
});
document.addEventListener("keydown", e => {
 if (playing || flipping) return;
 if (e.key === "ArrowLeft" && current > 0) { current--; flipPage('prev'); }
 if (e.key === "ArrowRight" && current < pages.length - 1) { current++; flipPage('next'); }
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

