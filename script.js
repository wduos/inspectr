const ctx = new (window.AudioContext || window.webkitAudioContext)();
const refSKUForm = document.getElementById("ref-sku-form");
const refSKUInput = document.getElementById("ref-sku-input");
const refSKUMsg = document.getElementById("ref-sku-msg");

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

function validateSKU(barcode) {
  const pattern = /^\(240\)\d{8}$/;

  if (!barcode) {
    return "A SKU é obrigatória";
  }

  if (!pattern.test(barcode)) {
    return "Escaneie uma SKU válida";
  }

  if (barcode.length < 13 || barcode.length > 13) {
    return "A SKU deve ter exatamente 13 caracteres";
  }

  return null;
}

function resetSKUInput() {
  refSKUInput.value = "";
  refSKUInput.classList.remove("red-input");
  refSKUMsg.classList.remove("red");
  refSKUMsg.innerHTML =
    "Escaneie a <span class='bold'>SKU</span> de qualquer caixa do pallet para iniciar a conferência.";
}

// #init-prompt
document
  .getElementById("new-inspect-btn")
  .addEventListener("click", async () => {
    await ctx.resume();

    const now = ctx.currentTime;

    clickySound(now, 1000);
    clickySound(now + 0.12, 1700);
    clickySound(now + 0.2, 2300);

    resetSKUInput();

    showElements(["set-sku-sect"]);
  });

document.getElementById("resume-inspect-btn").addEventListener("click", () => {
  console.log(localStorage.getItem("referenceSKU")); //temp
});

// #set-sku-sect
document
  .getElementById("cancel-set-sku-btn")
  .addEventListener("click", async () => {
    await ctx.resume();

    const now = ctx.currentTime;

    clickySound(now, 2300);
    clickySound(now + 0.2, 1000);

    hideElements(["set-sku-sect"]);
  });

refSKUForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const SKU = e.target.elements[0].value;

  const error = validateSKU(SKU);

  if (error) {
    refSKUInput.value = "";
    refSKUInput.classList.add("red-input");
    refSKUMsg.classList.add("red");
    refSKUMsg.innerHTML = error;
  } else {
    resetSKUInput();
  }

  localStorage.setItem("referenceSKU", SKU);
});
