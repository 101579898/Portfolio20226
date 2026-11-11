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
      setTimeout(showPortfolio, 1800);
    }
  }, 400);
});

function showPortfolio() {
  // Swap boot screen -> portfolio (CSS plays the power-on animation)
  bootScreen.classList.add("hidden");
  portfolio.classList.remove("hidden");
}
