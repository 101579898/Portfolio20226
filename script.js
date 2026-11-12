// Grab the pieces of the page
const startScreen = document.getElementById("start");
const bootScreen = document.getElementById("boot");
const portfolio = document.getElementById("portfolio");
const startBtn = document.getElementById("startBtn");
const bootLog = document.getElementById("bootLog");
const bootTitle = document.getElementById("bootTitle");

// The text that "types" during boot. Edit these however you like.
const bootLines = [
  "system check ............ ok",
  "loading memory .......... ok",
  "loading example work .... ok",
  "data restoration in progress",
  "booting, please wait...",
];

startBtn.addEventListener("click", function () {
  // Swap start screen -> boot screen
  startScreen.classList.add("hidden");
  bootScreen.classList.remove("hidden");

  // Print one line every 400ms
  let i = 0;
  const timer = setInterval(function () {
    if (i < bootLines.length) {
      bootLog.textContent += bootLines[i] + "\n";
      i++;
    } else {
      clearInterval(timer);
      bootTitle.classList.remove("hidden"); // big glowing BOOTING...
      setTimeout(showPortfolio, 180);
    }
  }, 400);
});

function showPortfolio() {
  // Swap boot screen -> portfolio (CSS plays the power-on animation)
  bootScreen.classList.add("hidden");
  portfolio.classList.remove("hidden");
  staticSwitch.classList.remove("hidden"); // the switch only appears after boot
}


// ---------- STATIC SWITCH ----------
const staticSwitch = document.getElementById("staticSwitch");
const scanlines = document.querySelector(".scanlines");

staticSwitch.addEventListener("click", function () {
  const isOff = scanlines.classList.toggle("hidden"); // true when static is now hidden
  staticSwitch.classList.toggle("off", isOff);        // slide the knob
  staticSwitch.setAttribute("aria-pressed", !isOff);
});


// ---------- PIXEL PICTURES ----------
// Every <canvas class="pixel" data-src="img/..."> in the page is drawn as purple pixels.
document.querySelectorAll("canvas.pixel").forEach(function (pixelCanvas) {
  const picture = new Image();
  picture.onload = function () {
    const w = picture.width;
    const h = picture.height;
    const block = Math.round(w / 50);          // bigger number = smaller pixels

    // 1. Shrink the picture onto a tiny hidden canvas
    const small = document.createElement("canvas");
    small.width = Math.ceil(w / block);
    small.height = Math.ceil(h / block);
    small.getContext("2d").drawImage(picture, 0, 0, small.width, small.height);

    // 2. Stretch it back up without smoothing = chunky pixels, in grey
    const p = pixelCanvas.getContext("2d");
    pixelCanvas.width = w;
    pixelCanvas.height = h;
    p.imageSmoothingEnabled = false;
    p.filter = "grayscale(1) brightness(1.3)";
    p.drawImage(small, 0, 0, w, h);
    p.filter = "none";

    // 3. Tint it purple
    p.globalCompositeOperation = "multiply";
    p.fillStyle = "#b98cff";
    p.fillRect(0, 0, w, h);

    // 4. Keep see-through parts of the picture see-through
    p.globalCompositeOperation = "destination-in";
    p.drawImage(small, 0, 0, w, h);
  };
  picture.src = pixelCanvas.dataset.src;
});


// ---------- WORK PACK ----------
// Uses GSAP (loaded in index.html) for the smooth movement.

// Your projects: one card each. To add one, copy a block and change it.
//   image = picture on the front      link = what "Open project" opens
//   tags  = small line on the front   text = explanation on the back
const projects = [
  {
    title: "Myro Rebrand",
    tags: "Branding",
    image: "work/myro-rebrand.jpg",
    link: "work/myro-rebrand.pdf",
    text: "Example description. Say what the project was, what you did, and which tools you used.",
  },
  {
    title: "Example Work",
    tags: "Placeholder",
    image: "work/patrick.jpg",
    link: "work/patrick.jpg",
    text: "Example description. Say what the project was, what you did, and which tools you used.",
  },
];

const pack = document.getElementById("pack");
const packTop = document.getElementById("packTop");
const tearLine = document.getElementById("tearLine");
const cardsBox = document.getElementById("cards");
const openBtn = document.getElementById("openBtn");
const cardNav = document.getElementById("cardNav");
const cardCount = document.getElementById("cardCount");
const packHint = document.getElementById("packHint");

const order = [];      // the cards, order[0] is the one on top
let opened = false;
let busy = false;      // true while a card is flying away

// If the visitor has "reduce motion" turned on, make every animation near-instant
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.globalTimeline.timeScale(50);
}

document.getElementById("packInfo").textContent = projects.length + " CARDS INSIDE";

// The pack gently floats until it is opened
let floating = gsap.to(pack, { y: -12, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });


// --- Build one card per project ---
projects.forEach(function (project, i) {
  const card = document.createElement("article");
  card.className = "work-card";
  card.dataset.number = i + 1;
  card.innerHTML =
    '<div class="tilt"><div class="card-inner">' +
      '<div class="card-face">' +
        '<img src="' + project.image + '" alt="">' +
        "<h3>" + project.title + "</h3>" +
        "<p>" + project.tags + "</p>" +
        "<small>" + (i + 1) + "/" + projects.length + " · tap to flip</small>" +
        '<div class="sheen"></div>' +
      "</div>" +
      '<div class="card-face card-back">' +
        "<h3>" + project.title + "</h3>" +
        "<p>" + project.text + "</p>" +
        '<a href="' + project.link + '" target="_blank">Open project &gt;</a>' +
      "</div>" +
    "</div></div>";
  cardsBox.appendChild(card);
  order.push(card);
  addCardDrag(card);
});


// --- Put every card in its place in the stack ---
function layoutCards(time) {
  order.forEach(function (card, k) {          // k = how far down the stack (0 = top)
    gsap.set(card, { zIndex: order.length - k });
    gsap.to(card, {
      x: 0,
      y: k * 12,
      scale: 1 - k * 0.05,
      rotation: k === 0 ? 0 : (k % 2 ? 4 : -4),
      opacity: k > 2 ? 0 : 1,
      duration: time,
    });
  });
  cardCount.textContent = order[0].dataset.number + "/" + projects.length;
}


// --- Opening the pack ---
function openPack() {
  if (opened) return;
  opened = true;
  floating.kill();
  openBtn.classList.add("hidden");
  cardNav.classList.remove("hidden");
  packHint.textContent = "Drag a card sideways for the next one. Tap a card to flip it.";

  // Top strip flies off, pack drops away, cards rise up
  gsap.to(packTop, { x: 160, y: -200, rotation: 50, opacity: 0, duration: 0.7, ease: "power2.in" });
  gsap.to(pack, { y: 260, opacity: 0, duration: 0.6, delay: 0.5, onComplete: function () {
    pack.classList.add("hidden");
  }});
  cardsBox.classList.remove("hidden");
  gsap.set(order, { x: 0, y: 140, opacity: 0, scale: 0.8, rotation: 0 });
  gsap.delayedCall(0.5, function () { layoutCards(0.7); });
}

function resealPack() {
  opened = false;
  order.forEach(function (card) { card.classList.remove("flipped"); });
  cardsBox.classList.add("hidden");
  cardNav.classList.add("hidden");
  openBtn.classList.remove("hidden");
  pack.classList.remove("hidden");
  packHint.textContent = "Drag across the top of the pack to tear it open";
  tearLine.style.width = "0";
  gsap.set(packTop, { x: 0, y: 0, rotation: 0, opacity: 1 });
  gsap.fromTo(pack, { y: -200, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, onComplete: function () {
    floating = gsap.to(pack, { y: -12, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }});
}


// --- Tearing: drag sideways across the top strip ---
let tearStart = null;

packTop.addEventListener("pointerdown", function (e) {
  tearStart = e.clientX;
  packTop.setPointerCapture(e.pointerId);
});

packTop.addEventListener("pointermove", function (e) {
  if (tearStart === null) return;
  const dragged = e.clientX - tearStart;
  const amount = Math.min(1, Math.abs(dragged) / packTop.offsetWidth);   // 0 to 1
  tearLine.style.width = amount * 100 + "%";
  tearLine.style.left = dragged < 0 ? "auto" : "0";     // line grows from where you started
  tearLine.style.right = dragged < 0 ? "0" : "auto";
  if (amount > 0.85) {
    tearStart = null;
    openPack();
  }
});

function stopTear() {
  if (tearStart === null) return;      // let go too early: the line snaps back
  tearStart = null;
  tearLine.style.width = "0";
}
packTop.addEventListener("pointerup", stopTear);
packTop.addEventListener("pointercancel", stopTear);


// --- Swiping, tilting and flipping a card ---
function addCardDrag(card) {
  const tilt = card.querySelector(".tilt");
  let startX = null;
  let moved = false;

  card.addEventListener("pointerdown", function (e) {
    if (card !== order[0] || busy || e.target.closest("a")) return;
    startX = e.clientX;
    moved = false;
  });

  card.addEventListener("pointermove", function (e) {
    if (card !== order[0]) return;

    // Tilt toward the pointer and slide the shine across
    const box = card.getBoundingClientRect();
    const px = (e.clientX - box.left) / box.width - 0.5;    // -0.5 (left) to 0.5 (right)
    const py = (e.clientY - box.top) / box.height - 0.5;
    gsap.to(tilt, { rotateY: px * 20, rotateX: -py * 20, duration: 0.3 });
    card.style.setProperty("--sheen", 50 - px * 100 + "%");

    if (startX === null) return;
    const dragged = e.clientX - startX;
    if (!moved && Math.abs(dragged) > 6) {
      moved = true;
      card.setPointerCapture(e.pointerId);
    }
    if (moved) gsap.set(card, { x: dragged, rotation: dragged / 15 });
  });

  card.addEventListener("pointerup", function (e) {
    if (startX === null) return;
    const dragged = e.clientX - startX;
    startX = null;
    if (!moved) {
      card.classList.toggle("flipped");            // a tap flips the card
    } else if (Math.abs(dragged) > 90) {
      nextCard(dragged > 0 ? 1 : -1);              // far enough: go to the next card
    } else {
      layoutCards(0.4);                            // not far enough: snap back
    }
  });

  card.addEventListener("pointercancel", function () {
    startX = null;
    layoutCards(0.4);
  });

  card.addEventListener("pointerleave", function () {
    gsap.to(tilt, { rotateY: 0, rotateX: 0, duration: 0.5 });
  });
}

// Top card flies off to one side (1 = right, -1 = left) and goes to the bottom
function nextCard(direction) {
  if (busy) return;
  busy = true;
  const card = order[0];
  card.classList.remove("flipped");
  gsap.to(card, { x: direction * 420, rotation: direction * 25, opacity: 0, duration: 0.35, onComplete: function () {
    order.push(order.shift());
    busy = false;
    layoutCards(0.4);
  }});
}

// Bottom card comes back in from the left and lands on top
function prevCard() {
  if (busy) return;
  order[0].classList.remove("flipped");
  const card = order.pop();
  order.unshift(card);
  gsap.set(card, { x: -420, rotation: -25, opacity: 0 });
  layoutCards(0.45);
}

openBtn.addEventListener("click", openPack);
document.getElementById("nextBtn").addEventListener("click", function () { nextCard(-1); });
document.getElementById("prevBtn").addEventListener("click", prevCard);
document.getElementById("flipBtn").addEventListener("click", function () { order[0].classList.toggle("flipped"); });
document.getElementById("resealBtn").addEventListener("click", resealPack);
