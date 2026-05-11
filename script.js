const ctx = new (window.AudioContext || window.webkitAudioContext)();
const refSKUForm = document.getElementById("ref-sku-form");
const refSKUInput = document.getElementById("ref-sku-input");
const refSKUMsg = document.getElementById("ref-sku-msg");
const refSKUDisplay = document.getElementById("ref-sku-display");
const newBarcodeForm = document.getElementById("new-barcode-form");
const newBarcodeInput = document.getElementById("new-barcode-input");
const boxCounter = document.getElementById("box-counter");
const cancelBtn = document.getElementById("cancel-btn");
const modalMask = document.getElementById("modal-mask");
const cancelModal = document.getElementById("cancel-modal");
const cancelModalDeclineActBtn = document.getElementById(
  "cancel-modal-decline-act-btn",
);
const cancelModalAcceptActBtn = document.getElementById(
  "cancel-modal-accept-act-btn",
);
const resetBtn = document.getElementById("reset-btn");
const resetModal = document.getElementById("reset-modal");
const resetModalDeclineActBtn = document.getElementById(
  "reset-modal-decline-act-btn",
);
const resetModalAcceptActBtn = document.getElementById(
  "reset-modal-accept-act-btn",
);
const finishBtn = document.getElementById("finish-btn");
const finishModal = document.getElementById("finish-modal");
const finishModalDeclineActBtn = document.getElementById(
  "finish-modal-decline-act-btn",
);
const finishModalAcceptActBtn = document.getElementById(
  "finish-modal-accept-act-btn",
);
const toast = document.getElementById("toast");

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

function pluckSound(time) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = "triangle";

  o.frequency.setValueAtTime(523.25, time);
  o.frequency.setValueAtTime(622.25, time + 0.11);
  o.frequency.setValueAtTime(783.99, time + 0.23);

  g.gain.setValueAtTime(0.4, time);
  g.gain.exponentialRampToValueAtTime(0.00001, time + 0.1);
  g.gain.setValueAtTime(0.4, time + 0.11);
  g.gain.exponentialRampToValueAtTime(0.00001, time + 0.22);
  g.gain.setValueAtTime(0.4, time + 0.23);
  g.gain.exponentialRampToValueAtTime(0.00001, time + 0.5);

  o.connect(g).connect(ctx.destination);

  o.start();
  o.stop(time + 0.5);
}

function warnSound(time) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = "triangle";

  o.frequency.setValueAtTime(557, time);
  o.frequency.exponentialRampToValueAtTime(257, time + 0.025);
  o.frequency.exponentialRampToValueAtTime(357, time + 0.3);

  g.gain.setValueAtTime(0.5, time);
  g.gain.exponentialRampToValueAtTime(0.3, time + 0.025);
  g.gain.exponentialRampToValueAtTime(0.00001, time + 0.3);

  o.connect(g).connect(ctx.destination);

  o.start();
  o.stop(time + 0.3);
}

function errorSound(time) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = "sawtooth";

  o.frequency.setValueAtTime(82.41, time);
  o.frequency.setValueAtTime(77.78, time + 0.21);

  g.gain.setValueAtTime(0.1, time);
  g.gain.setValueAtTime(0.00001, time + 0.1);
  g.gain.setValueAtTime(0.1, time + 0.2);

  o.connect(g).connect(ctx.destination);

  o.start();
  o.stop(time + 0.4);
}

function blipSound(time) {
  console.log("sdasd");
  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = "square";

  o.frequency.setValueAtTime(10500, time);
  o.frequency.exponentialRampToValueAtTime(2700, time + 0.0025);

  g.gain.setValueAtTime(0.1, time);
  g.gain.exponentialRampToValueAtTime(0.00001, time + 1);

  o.connect(g).connect(ctx.destination);

  o.start();
  o.stop(time + 1);
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

  if (barcode.length < 13 || barcode.length > 13) {
    return "A SKU deve ter exatamente 13 caracteres";
  }

  if (!pattern.test(barcode)) {
    return "Escaneie uma SKU válida";
  }

  return null;
}

function resetSKUInput() {
  refSKUInput.value = "";
  refSKUInput.classList.remove("red-input");
  refSKUInput.classList.remove("green-input");
  refSKUMsg.classList.remove("red");
  refSKUMsg.classList.remove("green");
  refSKUMsg.innerHTML =
    "Escaneie a <span class='bold'>SKU</span> de qualquer caixa do pallet para iniciar a conferência.";
}

function setReferenceSKU(code) {
  localStorage.setItem("referenceSKU", code);
  refSKUDisplay.innerHTML = code;
}

function clearReferenceSKU() {
  localStorage.removeItem("referenceSKU");
  refSKUDisplay.innerHTML = "";
}

function setBoxCounter(number) {
  localStorage.setItem("boxCount", number);
  boxCounter.innerHTML = number;
}

function clearBoxCounter() {
  localStorage.removeItem("boxCount");
  boxCounter.innerHTML = "";
}

// #init-prompt
document.getElementById("new-inspect-btn").addEventListener("click", () => {
  resetSKUInput();

  showElements(["set-sku-sect"]);
});

document
  .getElementById("resume-inspect-btn")
  .addEventListener("click", async () => {
    await ctx.resume();

    const now = ctx.currentTime;

    if (!localStorage.getItem("referenceSKU")) {
      warnSound(now);

      toast.style.top = "1rem";

      setTimeout(() => {
        toast.style.top = "-5rem";
      }, 2000);

      return;
    }

    clickySound(now, 1000);
    clickySound(now + 0.12, 1700);
    clickySound(now + 0.2, 2300);

    newBarcodeInput.value = "";
    newBarcodeInput.placeholder = "Leia um código de barras...";

    refSKUDisplay.innerHTML = localStorage.getItem("referenceSKU");
    boxCounter.innerHTML = localStorage.getItem("boxCount");
    showElements(["inspection-interface-sect"]);
  });

// #set-sku-sect
document.getElementById("cancel-set-sku-btn").addEventListener("click", () => {
  hideElements(["set-sku-sect"]);
});

refSKUForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const SKU = e.target.elements[0].value;

  const error = validateSKU(SKU);

  if (error) {
    refSKUInput.value = "";
    refSKUInput.classList.add("red-input");
    refSKUMsg.classList.add("red");
    refSKUMsg.innerHTML = error;
  } else {
    refSKUInput.classList.add("green-input");
    refSKUMsg.classList.add("green");
    refSKUMsg.innerHTML = "Aceito";
    newBarcodeInput.value = "";
    newBarcodeInput.placeholder = "Leia um código de barras...";

    await ctx.resume();

    const now = ctx.currentTime;

    clickySound(now, 1000);
    clickySound(now + 0.12, 1700);
    clickySound(now + 0.2, 2300);

    setReferenceSKU(SKU);
    setBoxCounter(1);

    setTimeout(() => {
      hideElements(["set-sku-sect"]);
      resetSKUInput();
      showElements(["inspection-interface-sect"]);
    }, 1500);
  }
});

// #inspection-interface-sect
newBarcodeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const currentReference = localStorage.getItem("referenceSKU");
  const barcode = e.target.elements[0].value;
  const now = ctx.currentTime;

  const error = validateSKU(barcode);

  if (error) {
    warnSound(now);

    newBarcodeInput.value = "";
    newBarcodeInput.placeholder = error;
    newBarcodeInput.classList.remove("green-input");
    newBarcodeInput.classList.add("red-input");

    return;
  } else if (barcode !== currentReference) {
    errorSound(now);

    newBarcodeInput.value = "";
    newBarcodeInput.placeholder = "A SKU é diferente da referência";
    newBarcodeInput.classList.remove("green-input");
    newBarcodeInput.classList.add("red-input");

    return;
  }

  blipSound(now);
  setBoxCounter(Number(localStorage.getItem("boxCount")) + 1);
  newBarcodeInput.classList.remove("red-input");
  newBarcodeInput.classList.add("green-input");
  newBarcodeInput.value = "";
});

cancelBtn.addEventListener("click", () => {
  modalMask.style.display = "flex";
  cancelModal.style.display = "flex";
});

cancelModalDeclineActBtn.addEventListener("click", () => {
  hideElements(["cancel-modal", "modal-mask"]);
});

cancelModalAcceptActBtn.addEventListener("click", async () => {
  await ctx.resume();

  const now = ctx.currentTime;

  clickySound(now, 2300);
  clickySound(now + 0.2, 1000);

  clearBoxCounter();
  clearReferenceSKU();
  hideElements(["inspection-interface-sect", "cancel-modal", "modal-mask"]);
});

resetBtn.addEventListener("click", () => {
  modalMask.style.display = "flex";
  resetModal.style.display = "flex";
});

resetModalDeclineActBtn.addEventListener("click", () => {
  hideElements(["reset-modal", "modal-mask"]);
});

resetModalAcceptActBtn.addEventListener("click", async () => {
  await ctx.resume();

  const now = ctx.currentTime;

  clickySound(now, 2300);
  clickySound(now + 0.2, 1000);

  newBarcodeInput.value = "";
  newBarcodeInput.placeholder = "Leia um código de barras...";

  clearBoxCounter();

  hideElements(["reset-modal", "modal-mask"]);

  setBoxCounter(1);
});

finishBtn.addEventListener("click", () => {
  modalMask.style.display = "flex";
  finishModal.style.display = "flex";
});

finishModalDeclineActBtn.addEventListener("click", () => {
  hideElements(["finish-modal", "modal-mask"]);
});

finishModalAcceptActBtn.addEventListener("click", () => {
  const now = ctx.currentTime;

  pluckSound(now);

  clearBoxCounter();
  clearReferenceSKU();

  hideElements(["finish-modal", "modal-mask", "inspection-interface-sect"]);
});
