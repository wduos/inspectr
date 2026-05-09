const ctx = new (window.AudioContext || window.webkitAudioContext)();

function clickySound(time, freq) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = "triangle";

  o.frequency.setValueAtTime(freq, time);
  o.frequency.exponentialRampToValueAtTime(100, time + 0.02);

  g.gain.setValueAtTime(1, time);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.02);

  o.connect(g).connect(ctx.destination);

  o.start(time);
  o.stop(time + 0.03);
}

function errorSound(time) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = "square";

  o.frequency.setValueAtTime(200, time);
  o.frequency.exponentialRampToValueAtTime(50, time + 0.05);

  g.gain.setValueAtTime(0.1, time);
  g.gain.exponentialRampToValueAtTime(0.03, time + 0.05);

  o.connect(g).connect(ctx.destination);

  o.start();
  o.stop(time + 0.3);
}

function hideElements(elementIDs) {
  elementIDs.forEach((elementID) => {
    const el = document.getElementById(elementID);
    el.style.display = "none";
  });
}

function showElements(elementIDs) {
  elementIDs.forEach((elementID) => {
    const el = document.getElementById(elementID);
    el.style.display = "block";
  });
}

document
  .getElementById("new-inspect-btn")
  .addEventListener("click", async () => {
    await ctx.resume();

    const now = ctx.currentTime;

    clickySound(now, 1000);
    clickySound(now + 0.12, 1700);

    showElements(["new-inspect-modal-mask", "new-inspect-modal"]);
  });
