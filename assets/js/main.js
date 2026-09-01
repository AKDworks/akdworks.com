const vantaBackground = document.querySelector("#vanta-background");
const vantaMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const synchronizedVantaTicks = () => (Date.now() / (1000 / 60)) % (Math.PI * 200);
const vantaPointerKey = "akdworks-vanta-pointer";
const vantaCameraKey = "akdworks-vanta-camera";
let activeVantaEffect = null;

const restoreVantaState = (effect) => {
  try {
    const pointer = JSON.parse(localStorage.getItem(vantaPointerKey));
    if (pointer && Number.isFinite(pointer.x) && Number.isFinite(pointer.y)) {
      effect.mouseX = pointer.x * effect.width;
      effect.mouseY = pointer.y * effect.height;
      effect.triggerMouseMove(effect.mouseX, effect.mouseY);
    }

    const camera = JSON.parse(localStorage.getItem(vantaCameraKey));
    if (camera && Number.isFinite(camera.x) && Number.isFinite(camera.y) && Number.isFinite(camera.z)) {
      effect.camera.position.set(camera.x, camera.y, camera.z);
    }
  } catch {}
};

const saveVantaCamera = () => {
  const camera = activeVantaEffect?.camera?.position;
  if (!camera) return;

  try {
    localStorage.setItem(vantaCameraKey, JSON.stringify({ x: camera.x, y: camera.y, z: camera.z }));
  } catch {}
};

const positionVantaGlobe = (effect) => {
  if (effect?.cont2) effect.cont2.position.x = window.innerWidth > 760 ? -6 : 0;
};

if (vantaBackground) {
  window.addEventListener(
    "pointermove",
    (event) => {
      try {
        localStorage.setItem(
          vantaPointerKey,
          JSON.stringify({ x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight }),
        );
      } catch {}
    },
    { passive: true },
  );

  window.addEventListener("pagehide", saveVantaCamera);
  window.addEventListener("resize", () => positionVantaGlobe(activeVantaEffect));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      saveVantaCamera();
      return;
    }

    if (activeVantaEffect) {
      activeVantaEffect.t = synchronizedVantaTicks();
      restoreVantaState(activeVantaEffect);
    }
  });
}

if (vantaBackground && window.VANTA?.GLOBE && !vantaMotionPreference.matches) {
  const effect = window.VANTA.GLOBE({
    el: vantaBackground,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200,
    minWidth: 200,
    scale: 1,
    scaleMobile: 1,
    backgroundColor: 0x23153c,
    color: 0x8894f2,
    color2: 0xffffff,
    size: 1,
  });

  effect.t = synchronizedVantaTicks();
  activeVantaEffect = effect;
  restoreVantaState(effect);
  positionVantaGlobe(effect);
  if (effect.cont2) effect.cont2.visible = document.body.classList.contains("home-page");
}

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");

if (menuBtn && nav) {
  const menuIcon = menuBtn.querySelector(".material-symbols-rounded");

  const setMenuOpen = (open, returnFocus = false) => {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (menuIcon) menuIcon.textContent = open ? "close" : "menu";

    if (!open && returnFocus) menuBtn.focus();
  };

  menuBtn.addEventListener("click", () => {
    setMenuOpen(!nav.classList.contains("is-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) return;
    if (!nav.contains(event.target) && !menuBtn.contains(event.target)) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenuOpen(false, true);
    }
  });

  window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
    if (event.matches) setMenuOpen(false);
  });
}

const getPageName = (url) => {
  const parts = url.pathname.split("/").filter(Boolean);
  return (parts[parts.length - 1] || "index").replace(/\.html$/, "");
};

const updateActiveNavigation = () => {
  const current = getPageName(location);
  document.querySelectorAll(".nav a[href]").forEach((link) => {
    const href = getPageName(new URL(link.href, location.href));
    const active = href === current;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

updateActiveNavigation();

if (vantaBackground) {
  const softPages = new Set(["index", "works", "about"]);
  let navigationRequest = null;

  const updatePageMetadata = (nextDocument) => {
    document.title = nextDocument.title;

    const description = nextDocument.querySelector('meta[name="description"]')?.content;
    const currentDescription = document.querySelector('meta[name="description"]');
    if (description && currentDescription) currentDescription.content = description;

    const canonical = nextDocument.querySelector('link[rel="canonical"]')?.href;
    const currentCanonical = document.querySelector('link[rel="canonical"]');
    if (canonical && currentCanonical) currentCanonical.href = canonical;
  };

  const loadSoftPage = async (url, pushState) => {
    navigationRequest?.abort();
    navigationRequest = new AbortController();

    try {
      const response = await fetch(url.href, { signal: navigationRequest.signal });
      if (!response.ok) throw new Error(String(response.status));

      const nextDocument = new DOMParser().parseFromString(await response.text(), "text/html");
      const nextMain = nextDocument.querySelector("main.page");
      const currentMain = document.querySelector("main.page");
      if (!nextMain || !currentMain) throw new Error("Missing page content");

      currentMain.replaceWith(nextMain);
      document.body.className = nextDocument.body.className;
      if (activeVantaEffect?.cont2) activeVantaEffect.cont2.visible = document.body.classList.contains("home-page");
      updatePageMetadata(nextDocument);

      if (pushState) history.pushState({}, "", response.url);
      updateActiveNavigation();
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch (error) {
      if (error.name === "AbortError") return;
      location.href = url.href;
    }
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;

    const url = new URL(link.href, location.href);
    const page = getPageName(url);
    if (url.origin !== location.origin || !softPages.has(page)) return;

    event.preventDefault();
    if (page === getPageName(location)) return;
    loadSoftPage(url, true);
  });

  window.addEventListener("popstate", () => {
    const url = new URL(location.href);
    if (softPages.has(getPageName(url))) loadSoftPage(url, false);
  });
}

const supportLinks = document.querySelectorAll(".support-link");

if (supportLinks.length) {
  const supportDialog = document.createElement("dialog");
  supportDialog.className = "external-link-dialog";
  supportDialog.setAttribute("aria-labelledby", "external-link-title");
  supportDialog.setAttribute("aria-describedby", "external-link-description");
  supportDialog.innerHTML = [
    '<div class="external-dialog-content">',
    '<h2 id="external-link-title">You’re leaving AKDworks</h2>',
    '<p id="external-link-description">You’re about to open Ko-fi in a new tab.</p>',
    '<div class="external-dialog-actions">',
    '<button class="btn external-dialog-cancel" type="button">Stay here</button>',
    '<a class="btn external-dialog-confirm" href="https://ko-fi.com/akdworks" target="_blank" rel="noopener noreferrer">Continue to Ko-fi</a>',
    "</div>",
    "</div>",
  ].join("");
  document.body.append(supportDialog);

  const cancelButton = supportDialog.querySelector(".external-dialog-cancel");
  const continueLink = supportDialog.querySelector(".external-dialog-confirm");
  let triggerLink = null;

  supportLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      triggerLink = link;
      continueLink.href = link.href;

      if (typeof supportDialog.showModal === "function") {
        supportDialog.showModal();
      } else if (window.confirm("You’re leaving AKDworks and opening Ko-fi in a new tab. Continue?")) {
        window.open(link.href, "_blank", "noopener,noreferrer");
      }
    });
  });

  cancelButton.addEventListener("click", () => supportDialog.close());
  continueLink.addEventListener("click", () => supportDialog.close());

  supportDialog.addEventListener("click", (event) => {
    if (event.target === supportDialog) supportDialog.close();
  });

  supportDialog.addEventListener("close", () => {
    triggerLink?.focus();
    triggerLink = null;
  });
}

const contactEmail = document.querySelector(".contact-email");
const contactEmailText = contactEmail?.querySelector(".contact-email-text");
const motionPermission = document.querySelector(".motion-permission");

if (contactEmail && contactEmailText) {
  const address = contactEmailText.textContent.trim();
  const characters = [...address];

  const colorForPosition = (position) => {
    const palette = [
      [105, 228, 155],
      [88, 184, 255],
      [141, 107, 255],
      [105, 228, 155],
    ];
    const wrapped = ((position % 1) + 1) % 1;
    const scaled = wrapped * 3;
    const segment = Math.min(2, Math.floor(scaled));
    const blend = scaled - segment;
    const from = palette[segment];
    const to = palette[segment + 1];
    const color = from.map((channel, index) => Math.round(channel + (to[index] - channel) * blend));

    return "rgb(" + color.join(", ") + ")";
  };

  contactEmailText.textContent = "";

  const letters = characters.map((character, index) => {
    const letter = document.createElement("span");
    const progress = characters.length > 1 ? index / (characters.length - 1) : 0;

    letter.className = "contact-letter";
    letter.textContent = character;
    letter.style.setProperty("--letter-color", colorForPosition(progress));
    contactEmailText.append(letter);

    return letter;
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canReactToPointer = !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (letters.length) {
    const states = letters.map(() => ({
      scale: 1,
      y: 0,
      targetScale: 1,
      targetY: 0,
    }));

    const emailMotion = {
      shiftX: 0,
      shiftY: 0,
      tiltX: 0,
      tiltY: 0,
      rotation: 0,
      skew: 0,
      targetShiftX: 0,
      targetShiftY: 0,
      targetTiltX: 0,
      targetTiltY: 0,
      targetRotation: 0,
      targetSkew: 0,
    };

    let centers = [];
    let flowPhase = 0;
    let previousFrameTime = performance.now();
    let orientationBaseline = null;
    let orientationStarted = false;

    const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    const shortestAngle = (value) => ((value + 180) % 360 + 360) % 360 - 180;

    const measureLetters = () => {
      centers = letters.map((letter) => {
        const rect = letter.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      });
    };

    const setMotionTargets = (horizontal, vertical) => {
      const x = clamp(horizontal, -1, 1);
      const y = clamp(vertical, -1, 1);
      const compact = window.innerWidth <= 760;

      emailMotion.targetShiftX = x * (compact ? 12 : 24);
      emailMotion.targetShiftY = y * (compact ? 7 : 14);
      emailMotion.targetTiltX = y * -4;
      emailMotion.targetTiltY = x * 7.2;
      emailMotion.targetRotation = x * 2.2;
      emailMotion.targetSkew = x * -1.2;
    };

    const resetMotionTargets = () => {
      states.forEach((state) => {
        state.targetScale = 1;
        state.targetY = 0;
      });

      setMotionTargets(0, 0);
    };

    const animateLetters = (timestamp) => {
      const elapsed = Math.min(40, timestamp - previousFrameTime);
      previousFrameTime = timestamp;
      flowPhase = (flowPhase + elapsed * 0.00024) % 1;

      states.forEach((state, index) => {
        state.scale += (state.targetScale - state.scale) * 0.2;
        state.y += (state.targetY - state.y) * 0.2;

        letters[index].style.setProperty("--letter-scale", state.scale.toFixed(3));
        letters[index].style.setProperty("--letter-y", state.y.toFixed(2) + "px");
      });

      emailMotion.shiftX += (emailMotion.targetShiftX - emailMotion.shiftX) * 0.2;
      emailMotion.shiftY += (emailMotion.targetShiftY - emailMotion.shiftY) * 0.2;
      emailMotion.tiltX += (emailMotion.targetTiltX - emailMotion.tiltX) * 0.2;
      emailMotion.tiltY += (emailMotion.targetTiltY - emailMotion.tiltY) * 0.2;
      emailMotion.rotation += (emailMotion.targetRotation - emailMotion.rotation) * 0.2;
      emailMotion.skew += (emailMotion.targetSkew - emailMotion.skew) * 0.2;

      contactEmail.style.setProperty("--email-shift-x", emailMotion.shiftX.toFixed(2) + "px");
      contactEmail.style.setProperty("--email-shift-y", emailMotion.shiftY.toFixed(2) + "px");
      contactEmail.style.setProperty("--email-tilt-x", emailMotion.tiltX.toFixed(3) + "deg");
      contactEmail.style.setProperty("--email-tilt-y", emailMotion.tiltY.toFixed(3) + "deg");
      contactEmail.style.setProperty("--email-rotation", emailMotion.rotation.toFixed(3) + "deg");
      contactEmail.style.setProperty("--email-skew", emailMotion.skew.toFixed(3) + "deg");

      letters.forEach((letter, index) => {
        const progress = letters.length > 1 ? index / (letters.length - 1) : 0;
        letter.style.setProperty("--letter-color", colorForPosition(progress * 1.1 - flowPhase));
      });

      requestAnimationFrame(animateLetters);
    };

    if (canReactToPointer) {
      const reactToPointer = (event) => {
        const fontSize = Number.parseFloat(getComputedStyle(contactEmail).fontSize);
        const reactionRadius = Math.max(100, fontSize * 1.8);
        const normalizedX = clamp(event.clientX / window.innerWidth * 2 - 1, -1, 1);
        const normalizedY = clamp(event.clientY / window.innerHeight * 2 - 1, -1, 1);

        setMotionTargets(normalizedX, normalizedY);

        centers.forEach((center, index) => {
          const horizontalDistance = event.clientX - center.x;
          const verticalDistance = (event.clientY - center.y) * 0.75;
          const distance = Math.hypot(horizontalDistance, verticalDistance);
          const linearInfluence = Math.max(0, 1 - distance / reactionRadius);
          const influence = linearInfluence * linearInfluence * (3 - 2 * linearInfluence);

          states[index].targetScale = 1 + influence * 0.5;
          states[index].targetY = -influence * 15;
        });
      };

      window.addEventListener("pointermove", reactToPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", resetMotionTargets);
    } else if (!reduceMotion && "DeviceOrientationEvent" in window) {
      const reactToOrientation = (event) => {
        if (event.beta === null || event.gamma === null) return;

        if (!orientationBaseline) {
          orientationBaseline = {
            beta: event.beta,
            gamma: event.gamma,
          };
          return;
        }

        const beta = clamp(shortestAngle(event.beta - orientationBaseline.beta) / 22, -1, 1);
        const gamma = clamp(shortestAngle(event.gamma - orientationBaseline.gamma) / 22, -1, 1);
        const screenAngle = ((Number(screen.orientation?.angle ?? window.orientation ?? 0) % 360) + 360) % 360;
        let horizontal = gamma;
        let vertical = beta;

        if (screenAngle === 90) {
          horizontal = beta;
          vertical = -gamma;
        } else if (screenAngle === 270) {
          horizontal = -beta;
          vertical = gamma;
        } else if (screenAngle === 180) {
          horizontal = -gamma;
          vertical = -beta;
        }

        setMotionTargets(horizontal, vertical);
      };

      const startOrientation = () => {
        if (orientationStarted) return;
        orientationStarted = true;
        orientationBaseline = null;
        window.addEventListener("deviceorientation", reactToOrientation, { passive: true });
      };

      const resetOrientationBaseline = () => {
        orientationBaseline = null;
        resetMotionTargets();
      };

      const orientationEvent = window.DeviceOrientationEvent;

      if (typeof orientationEvent?.requestPermission === "function" && motionPermission) {
        motionPermission.hidden = false;
        motionPermission.addEventListener("click", async () => {
          try {
            const permission = await orientationEvent.requestPermission();

            if (permission === "granted") {
              startOrientation();
              motionPermission.hidden = true;
            } else {
              motionPermission.textContent = "Motion unavailable";
              motionPermission.disabled = true;
            }
          } catch {
            motionPermission.textContent = "Motion unavailable";
            motionPermission.disabled = true;
          }
        });
      } else {
        startOrientation();
      }

      window.addEventListener("orientationchange", resetOrientationBaseline);
      screen.orientation?.addEventListener?.("change", resetOrientationBaseline);
    }

    window.addEventListener("resize", measureLetters);
    window.addEventListener("load", measureLetters);

    if (document.fonts?.ready) {
      document.fonts.ready.then(measureLetters);
    }

    measureLetters();
    requestAnimationFrame(animateLetters);
  }
}
