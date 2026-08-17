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

const current = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "");
document.querySelectorAll(".nav a[href]").forEach((link) => {
  const href = new URL(link.href, location.href).pathname.split("/").pop().replace(/\.html$/, "");
  if (href === current) {
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  }
});

const contactEmail = document.querySelector(".contact-email");
const contactEmailText = contactEmail?.querySelector(".contact-email-text");

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

    return `rgb(${color.join(", ")})`;
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

  const canReactToPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canReactToPointer && !reduceMotion) {
    const states = letters.map(() => ({
      scale: 1,
      y: 0,
      targetScale: 1,
      targetY: 0,
    }));

    const emailMotion = {
      tiltX: 0,
      tiltY: 0,
      rotation: 0,
      skew: 0,
      targetTiltX: 0,
      targetTiltY: 0,
      targetRotation: 0,
      targetSkew: 0,
      gradientShift: 0,
      targetGradientShift: 0,
    };

    let centers = [];
    let emailBounds = null;
    let flowPhase = 0;
    let previousFrameTime = performance.now();

    const measureLetters = () => {
      emailBounds = contactEmail.getBoundingClientRect();
      centers = letters.map((letter) => {
        const rect = letter.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      });
    };

    const animateLetters = (timestamp) => {
      const elapsed = Math.min(40, timestamp - previousFrameTime);
      previousFrameTime = timestamp;
      flowPhase = (flowPhase + elapsed * 0.00004) % 1;

      states.forEach((state, index) => {
        state.scale += (state.targetScale - state.scale) * 0.2;
        state.y += (state.targetY - state.y) * 0.2;

        letters[index].style.setProperty("--letter-scale", state.scale.toFixed(3));
        letters[index].style.setProperty("--letter-y", `${state.y.toFixed(2)}px`);
      });

      emailMotion.tiltX += (emailMotion.targetTiltX - emailMotion.tiltX) * 0.14;
      emailMotion.tiltY += (emailMotion.targetTiltY - emailMotion.tiltY) * 0.14;
      emailMotion.rotation += (emailMotion.targetRotation - emailMotion.rotation) * 0.14;
      emailMotion.skew += (emailMotion.targetSkew - emailMotion.skew) * 0.14;
      emailMotion.gradientShift += (emailMotion.targetGradientShift - emailMotion.gradientShift) * 0.08;

      contactEmail.style.setProperty("--email-tilt-x", `${emailMotion.tiltX.toFixed(3)}deg`);
      contactEmail.style.setProperty("--email-tilt-y", `${emailMotion.tiltY.toFixed(3)}deg`);
      contactEmail.style.setProperty("--email-rotation", `${emailMotion.rotation.toFixed(3)}deg`);
      contactEmail.style.setProperty("--email-skew", `${emailMotion.skew.toFixed(3)}deg`);

      letters.forEach((letter, index) => {
        const progress = letters.length > 1 ? index / (letters.length - 1) : 0;
        const colorPosition = progress * 1.15 + flowPhase + emailMotion.gradientShift;
        letter.style.setProperty("--letter-color", colorForPosition(colorPosition));
      });

      requestAnimationFrame(animateLetters);
    };

    const reactToPointer = (event) => {
      if (!emailBounds) measureLetters();

      const fontSize = Number.parseFloat(getComputedStyle(contactEmail).fontSize);
      const reactionRadius = Math.max(100, fontSize * 1.8);
      const normalizedX = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
      const normalizedY = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));

      emailMotion.targetTiltX = normalizedY * -2.2;
      emailMotion.targetTiltY = normalizedX * 4.2;
      emailMotion.targetRotation = normalizedX * 1.65;
      emailMotion.targetSkew = normalizedX * -0.8;
      emailMotion.targetGradientShift = normalizedX * 0.48 + normalizedY * 0.26;

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

    const resetPointerMotion = () => {
      states.forEach((state) => {
        state.targetScale = 1;
        state.targetY = 0;
      });

      emailMotion.targetTiltX = 0;
      emailMotion.targetTiltY = 0;
      emailMotion.targetRotation = 0;
      emailMotion.targetSkew = 0;
      emailMotion.targetGradientShift = 0;
    };

    window.addEventListener("pointermove", (event) => {
      if (!emailBounds) measureLetters();
      reactToPointer(event);
    }, { passive: true });

    document.documentElement.addEventListener("pointerleave", resetPointerMotion);

    window.addEventListener("resize", measureLetters);
    window.addEventListener("load", measureLetters);

    if (document.fonts?.ready) {
      document.fonts.ready.then(measureLetters);
    }

    measureLetters();
    requestAnimationFrame(animateLetters);
  }
}
