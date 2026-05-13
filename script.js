const ctx = new (window.AudioContext || window.webkitAudioContext)();

// DOM Elements
const home = document.getElementById("home");
const homeStartBtn = document.getElementById("home-start-btn");
const homeRestartBtn = document.getElementById("home-restart-btn");

const input = document.getElementById("input");
const form = document.getElementById("form");

const cancelBtn = document.getElementById("cancel-btn");

const finishBtn = document.getElementById("finish-btn");
const restartBtn = document.getElementById("restart-btn");

const title = document.getElementById("title");
const titleImg = document.getElementById("title-img");

const inspectionInfo = document.getElementById("inspection-info");
const refSKU = document.getElementById("ref-sku");
const boxCount = document.getElementById("box-count");

const modalContainer = document.getElementById("modal-container");
const modal = document.getElementById("modal");
const modalAction = document.getElementById("modal-action");
const modalDeclineActionBtn = document.getElementById(
  "modal-decline-action-btn",
);
const modalAcceptActionBtn = document.getElementById("modal-accept-action-btn");

const toast = document.getElementById("toast");

const toggleList1 = document.querySelectorAll(".toggle-1");
const toggleList2 = document.querySelectorAll(".toggle-2");

var modalActionIsFinish = true;

// Listeners

// home
homeStartBtn.addEventListener("click", () => {
  toggleElements(["home"], "off");
  paintInput("default");
  resetInput();

  clearBoxCount();
  clearRefSKU();

  input.focus();
});

homeRestartBtn.addEventListener("click", () => {
  const referenceSKU = localStorage.getItem("referenceSKU");
  const boxCount = localStorage.getItem("boxCount");

  if (!referenceSKU) {
    playWarnSound();

    toast.style.top = "1rem";

    setTimeout(() => {
      toast.style.top = "-5rem";
    }, 2000);

    return;
  }

  initInspectionSound();

  paintInput("default");
  resetInput();
  input.placeholder = "Leia um código de barras...";

  setRefSKU(referenceSKU);
  setBoxCount(boxCount);

  setTimeout(() => {
    toggleListToggle(toggleList1, "off");
    toggleListToggle(toggleList2, "on");
    toggleElements(["home"], "off");
  }, 500);

  input.focus();
});

// main
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const value = e.target.elements[0].value;
  const error = validateSKU(value);
  const referenceSKU = localStorage.getItem("referenceSKU")
    ? localStorage.getItem("referenceSKU")
    : null;

  if (referenceSKU && !error && value !== referenceSKU) {
    // ON DIFFERENT SKU

    paintInput("red");
    input.placeholder = "A SKU é diferente da referência!";
    input.value = "";

    playErrorSound();

    return;
  } else if (referenceSKU && value == referenceSKU) {
    // ON SUCCESS

    paintInput("green");
    resetInput();

    input.placeholder = "Leia um código de barras...";

    setBoxCount(Number(localStorage.getItem("boxCount")) + 1);

    playBlipSound();

    return;
  }

  if (error) {
    // ON ANY OTHER ERROR/WARNING

    paintInput("red");
    input.placeholder = error;
    input.value = "";

    playWarnSound();

    return;
  }

  paintInput("green");

  setRefSKU(value);
  setBoxCount(1);

  initInspectionSound();

  setTimeout(() => {
    paintInput("default");
    toggleListToggle(toggleList1, "off");
    toggleListToggle(toggleList2, "on");

    resetInput();

    input.placeholder = "Leia um código de barras...";
  }, 500);
});

cancelBtn.addEventListener("click", () => {
  toggleElements(["home"], "on", "flex");
});

restartBtn.addEventListener("click", () => {
  setModalAction("reiniciar conferência");

  modalAcceptActionBtn.classList.remove("accent-btn");
  modalAcceptActionBtn.classList.add("red-btn");

  modalActionIsFinish = false;

  toggleElements(["modal-container"], "on", "flex");
});

finishBtn.addEventListener("click", () => {
  modalActionIsFinish = true;

  toggleElements(["modal-container"], "on", "flex");
});

modalDeclineActionBtn.addEventListener("click", () => {
  toggleElements(["modal-container"], "off");

  modalAcceptActionBtn.classList.remove("red-btn");
  modalAcceptActionBtn.classList.add("accent-btn");

  setModalAction("finalizar conferência");

  input.focus();
});

modalAcceptActionBtn.addEventListener("click", () => {
  toggleElements(["modal-container"], "off");

  modalAcceptActionBtn.classList.remove("red-btn");
  modalAcceptActionBtn.classList.add("accent-btn");

  setModalAction("finalizar conferência");

  if (!modalActionIsFinish) {
    resetInspectionSound();

    setBoxCount(1);

    resetInput();
    paintInput("default");

    input.placeholder = "Leia um código de barras...";
    input.focus();

    return;
  }

  endInspectionSound();

  setTimeout(() => {
    clearBoxCount();
    clearRefSKU();

    toggleElements(["home"], "on", "flex");

    toggleListToggle(toggleList1, "on");
    toggleListToggle(toggleList2, "off");
  }, 500);
});

// Functions

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

function toggleListToggle(elements, setting) {
  switch (setting) {
    case "on":
      elements.forEach((element) => {
        element.style.display = "block";
      });

      break;
    case "off":
      elements.forEach((element) => {
        element.style.display = "none";
      });

      break;
    default:
      console.error("Missing parameters");

      break;
  }
}

function toggleElements(idArray, setting, displayType = "block") {
  switch (setting) {
    case "on":
      idArray.forEach((elementID) => {
        document.getElementById(elementID).style.display = displayType;
      });

      break;
    case "off":
      idArray.forEach((elementID) => {
        document.getElementById(elementID).style.display = "none";
      });

      break;
    default:
      console.error("Missing parameters");

      break;
  }
}

function paintInput(color) {
  switch (color) {
    case "default":
      input.classList.remove("red-input", "green-input");

      break;
    case "red":
      input.classList.remove("green-input");
      input.classList.add("red-input");

      break;
    case "green":
      input.classList.remove("red-input");
      input.classList.add("green-input");

      break;
    default:
      console.error("Missing parameters");

      break;
  }
}

function resetInput() {
  input.placeholder = "Ex.: 24010221234";
  input.value = "";
}

function setRefSKU(code) {
  localStorage.setItem("referenceSKU", code);
  refSKU.innerHTML = code;
}

function clearRefSKU() {
  localStorage.removeItem("referenceSKU");
  refSKU.innerHTML = "";
}

function setBoxCount(number) {
  localStorage.setItem("boxCount", number);
  boxCount.innerHTML = number;
}

function clearBoxCount() {
  localStorage.removeItem("boxCount");
  boxCount.innerHTML = "";
}

function setModalAction(action) {
  modalAction.innerHTML = action;
  modalAcceptActionBtn.innerHTML = action;
}

// SFX >>>>

async function initInspectionSound() {
  await ctx.resume();
  const now = ctx.currentTime;

  clickySound(now, 1000);
  clickySound(now + 0.12, 1700);
  clickySound(now + 0.2, 2300);
}

async function resetInspectionSound() {
  await ctx.resume();
  const now = ctx.currentTime;

  clickySound(now, 2300);
  clickySound(now + 0.2, 1000);
}

function endInspectionSound() {
  const now = ctx.currentTime;

  pluckSound(now);
}

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

  o.frequency.setValueAtTime(783.99, time);
  o.frequency.setValueAtTime(622.25, time + 0.11);
  o.frequency.setValueAtTime(523.25, time + 0.23);

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

function playWarnSound() {
  const now = ctx.currentTime;

  warnSound(now);
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

function playErrorSound() {
  const now = ctx.currentTime;

  errorSound(now);
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

function playBlipSound() {
  const now = ctx.currentTime;

  blipSound(now);
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
