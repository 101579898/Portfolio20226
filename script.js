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


// ---------- WORK VIEWER ----------

// Your projects. To add one, copy a line and change it.
//   image = the picture shown in the viewer
//   link  = what opens when you click it
const projects = [
  { title: "Myro Rebrand", image: "work/myro-rebrand.jpg", link: "work/myro-rebrand.pdf" },
  { title: "Example Work", image: "work/patrick.jpg",      link: "work/patrick.jpg" },
];

const workLink = document.getElementById("workLink");
const workTitle = document.getElementById("workTitle");
const nextBtn = document.getElementById("nextBtn");
const canvas = document.getElementById("workCanvas");
const ctx = canvas.getContext("2d");
const img = new Image();

let current = 0;       // which project is showing
let reveal = 0;        // 0 = fully pixelated, 1 = clear image
let hovering = false;

function showProject() {
  const project = projects[current];
  workTitle.textContent = (current + 1) + "/" + projects.length + "  " + project.title;
  workLink.href = project.link;
  img.src = project.image;
}

// When the picture has loaded, start it fully pixelated
img.onload = function () {
  canvas.width = img.width;
  canvas.height = img.height;
  reveal = 0;
  draw();
};

function draw() {
  const w = canvas.width;
  const h = canvas.height;

  // Size of one "pixel" block: big when hidden, 1 when revealed
  const block = Math.round(1 + (1 - reveal) * (w / 45));
  const smallW = Math.ceil(w / block);
  const smallH = Math.ceil(h / block);

  // Draw the image tiny, then stretch it back up without smoothing = pixels
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = false;
  ctx.filter = "grayscale(" + (1 - reveal) + ")";
  ctx.drawImage(img, 0, 0, smallW, smallH);
  ctx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, w, h);
  ctx.filter = "none";

  // Pink tint that fades away as the image is revealed
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 1 - reveal;
  ctx.fillStyle = "#ff5fc0";
  ctx.fillRect(0, 0, w, h);
}

// Runs every frame: slowly reveal while hovering, re-pixelate when not
function animate() {
  const target = hovering ? 1 : 0;
  if (reveal !== target && img.complete) {
    reveal += hovering ? 0.015 : -0.04;
    reveal = Math.max(0, Math.min(1, reveal));
    draw();
  }
  requestAnimationFrame(animate);
}

workLink.addEventListener("mouseenter", function () { hovering = true; });
workLink.addEventListener("mouseleave", function () { hovering = false; });

nextBtn.addEventListener("click", function () {
  current = (current + 1) % projects.length; // loops back to the first
  showProject();
});

showProject();
animate();
