const ctx = new (window.AudioContext || window.webkitAudioContext)();

const refSKUForm = document.getElementById("ref-sku-form");
const refSKUInput = document.getElementById("ref-sku-input");
const refSKUMsg = document.getElementById("ref-sku-msg");
const scanCodeForm = document.getElementById("scan-code-form");
const scanCodeInput = document.getElementById("scan-code-input");
const scanCodeSubmit = document.getElementById("scan-code-submit");
const refSKUDisplay = document.getElementById("ref-sku-display");
const boxCounterDisplay = document.getElementById("box-counter-display");
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

// #init-prompt-sect
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

    resetScanCodeInput();

    refSKUDisplay.innerHTML = localStorage.getItem("referenceSKU");
    boxCounterDisplay.innerHTML = localStorage.getItem("boxCount");
    showElements(["inspection-interface-sect"]);

    clickySound(now, 1000);
    clickySound(now + 0.12, 1700);
    clickySound(now + 0.2, 2300);
  });

// #set-sku-sect
refSKUForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  await ctx.resume();
  const now = ctx.currentTime;
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

    resetScanCodeInput();

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
scanCodeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const currentReference = localStorage.getItem("referenceSKU");
  const barcode = e.target.elements[0].value;
  const now = ctx.currentTime;

  const error = validateSKU(barcode);

  scanCodeInput.focus();

  if (error) {
    warnSound(now);

    scanCodeInput.value = "";
    scanCodeInput.placeholder = error;

    tintScanCodeForm("red");

    return;
  } else if (barcode !== currentReference) {
    errorSound(now);

    scanCodeInput.value = "";
    scanCodeInput.placeholder = "A SKU é diferente da referência";

    tintScanCodeForm("red");

    return;
  }

  blipSound(now);
  setBoxCounter(Number(localStorage.getItem("boxCount")) + 1);

  tintScanCodeForm("green");
  resetScanCodeInput();
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

  tintScanCodeForm();

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

  tintScanCodeForm();

  resetScanCodeInput();
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

  setTimeout(() => {
    tintScanCodeForm();

    clearBoxCounter();
    clearReferenceSKU();

    hideElements(["finish-modal", "modal-mask", "inspection-interface-sect"]);
  }, 500);
});

function validateSKU(code) {
  const pattern = /^240\d{8}$/;

  if (!code) {
    return "A SKU é obrigatória";
  }

  if (code.length < 11 || code.length > 11) {
    return "A SKU deve ter 11 caracteres";
  }

  if (!pattern.test(code)) {
    return "Escaneie uma SKU válida";
  }

  return null;
}

// SFX >>>>

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

// <<<< SFX

// UI manipulation >>>>

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

function resetSKUInput() {
  refSKUInput.value = "";
  refSKUInput.classList.remove("red-input");
  refSKUInput.classList.remove("green-input");
  refSKUMsg.classList.remove("red");
  refSKUMsg.classList.remove("green");
  refSKUMsg.innerHTML =
    "Escaneie a SKU de qualquer caixa do pallet para iniciar a conferência.";
}

function resetScanCodeInput() {
  scanCodeInput.value = "";
  scanCodeInput.placeholder = "Leia um código de barras...";
}

function tintScanCodeForm(color) {
  switch (color) {
    case "red":
      scanCodeInput.classList.remove("green-input");
      scanCodeInput.classList.add("red-input");
      scanCodeSubmit.style.backgroundColor = "var(--red)";

      break;
    case "green":
      scanCodeInput.classList.remove("red-input");
      scanCodeInput.classList.add("green-input");
      scanCodeSubmit.style.backgroundColor = "var(--green)";

      break;
    default:
      scanCodeInput.classList.remove("red-input", "green-input");
      scanCodeSubmit.style.backgroundColor = "var(--accent)";
  }
}

// <<<< UI manipulation

// localStorage stuff >>>>

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
  boxCounterDisplay.innerHTML = number;
}

function clearBoxCounter() {
  localStorage.removeItem("boxCount");
  boxCounterDisplay.innerHTML = "";
}

// <<<< localStorage stuff
