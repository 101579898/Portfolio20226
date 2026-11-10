// The lines that type out while "booting". Edit freely.
const bootLines = [
  "DESIGNATION: PORTFOLIO - 0X0010010",
  "MEMORY CHECK [AUTO RUN COMPLETE]",
  "LOADING STRING \"EXAMPLE WORK\"...",
  "DATA RESTORATION IN PROGRESS",
  "ENTERING SAFE MODE... SUCCESS",
  "BOOTING, PLEASE WAIT..."
];

// Show one screen and hide the others
function show(id) {
  document.querySelectorAll(".screen").forEach(function (screen) {
    screen.classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}

document.getElementById("start").addEventListener("click", function () {
  show("boot");

  const log = document.getElementById("log");
  let i = 0;

  // Add one boot line every 400ms
  const timer = setInterval(function () {
    log.textContent += "> " + bootLines[i] + "\n";
    i++;

    if (i === bootLines.length) {
      clearInterval(timer);
      document.getElementById("rebooting").classList.remove("hidden");

      // After "REBOOTING..." the portfolio opens
      setTimeout(function () { show("portfolio"); }, 1500);
    }
  }, 400);
});
