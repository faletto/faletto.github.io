// Note: This is a reimplementation of the background from https://github.com/CuB3y0nd/entropic
(() => {
  const config = {
    enable: true,
    chars: [".", ":", "*", "+", "x", "#", "@"],
    mobileBreakpoint: 820,
    contentSafeWidth: 1180,
    pointerInfluenceRadius: 160,
    driftX: [-0.08, 0.08],
    driftY: [0.16, 0.62],
    speed: [0.014, 0.05],
    contexts: {
      home: {
        desktopCount: 86,
        mobileCount: 36,
        opacity: [0.18, 0.68],
        pointerScale: 1.05
      },
      volume: {
        desktopCount: 72,
        mobileCount: 30,
        opacity: [0.14, 0.6],
        pointerScale: 0.9
      },
      article: {
        desktopCount: 56,
        mobileCount: 22,
        opacity: [0.12, 0.5],
        pointerScale: 0.74
      }
    }
  };

  const particleLayerClass = "ascii-particles";
  const frameMsByContext = {
    home: { desktop: 42, mobile: 50 },
    volume: { desktop: 52, mobile: 66 },
    article: { desktop: 78, mobile: 88 }
  };
  const tapInfluenceMs = 620;
  const tapFrameMs = 42;
  const tapForceScale = 1.62;
  const tapRadiusScale = 1.42;

  if (
    !config.enable ||
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  if (document.querySelector(`.${particleLayerClass}`)) {
    return;
  }

  const context = particleContext();
  const mobile = isMobileParticleViewport();
  const saveData = prefersReducedData();
  const lowPower = saveData || lowPowerDevice();
  const frameMs = frameMsByContext[context][mobile ? "mobile" : "desktop"] * (lowPower ? 1.15 : 1);
  const countScale = saveData ? 0.45 : lowPower ? 0.68 : 1;
  const profile = {
    context,
    frameMs,
    countScale,
    pointerEnabled: !mobile && !lowPower,
    tapEnabled: mobile || lowPower
  };

  const layer = document.createElement("div");
  layer.className = particleLayerClass;
  layer.dataset.particleContext = profile.context;
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);

  const particles = createParticles(layer, particleCount(profile), profile.context);
  const pointer = {
    x: Number.NaN,
    y: Number.NaN,
    forceScale: 1,
    radiusScale: 1,
    startedAt: 0,
    durationMs: 0
  };

  let animationId = 0;
  let lastFrameTime = 0;
  let running = true;

  const frame = (time) => {
    animationId = 0;

    if (!running) {
      return;
    }

    if (!document.body.contains(layer)) {
      running = false;
      animationId = 0;
      return;
    }

    const elapsedMs = lastFrameTime === 0 ? profile.frameMs : Math.min(96, Math.max(1, time - lastFrameTime));
    lastFrameTime = time;
    animateParticles(
      particles,
      pointer,
      time,
      elapsedMs / profile.frameMs,
      elapsedMs / pointerFrameMs(profile, pointer)
    );
    animationId = window.requestAnimationFrame(frame);
  };

  const start = () => {
    if (animationId === 0) {
      running = true;
      lastFrameTime = 0;
      animationId = window.requestAnimationFrame(frame);
    }
  };

  const stop = () => {
    running = false;
    if (animationId !== 0) {
      window.cancelAnimationFrame(animationId);
      animationId = 0;
    }
    lastFrameTime = 0;
  };

  start();

  const reset = () => {
    for (const particle of particles) {
      resetParticle(particle, true);
    }
  };

  window.addEventListener("resize", reset, { passive: true });
  window.addEventListener("orientationchange", reset, { passive: true });

  if (profile.pointerEnabled) {
    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.forceScale = 1;
        pointer.radiusScale = 1;
        pointer.startedAt = 0;
        pointer.durationMs = 0;
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      () => {
        pointer.x = Number.NaN;
        pointer.y = Number.NaN;
        pointer.startedAt = 0;
        pointer.durationMs = 0;
      },
      { passive: true }
    );
  }

  if (profile.tapEnabled) {
    let tapTimeout = 0;

    window.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "mouse") {
          return;
        }

        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.forceScale = tapForceScale;
        pointer.radiusScale = tapRadiusScale;
        pointer.startedAt = performance.now();
        pointer.durationMs = tapInfluenceMs;
        window.clearTimeout(tapTimeout);
        tapTimeout = window.setTimeout(() => {
          pointer.x = Number.NaN;
          pointer.y = Number.NaN;
          pointer.forceScale = 1;
          pointer.radiusScale = 1;
          pointer.startedAt = 0;
          pointer.durationMs = 0;
        }, tapInfluenceMs);
      },
      { passive: true }
    );
  }

  window.addEventListener("beforeunload", stop);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      start();
      return;
    }

    stop();
  });

  function createParticles(layerNode, count, particleContextValue) {
    return Array.from({ length: count }, () => {
      const element = document.createElement("span");
      element.textContent = sample(config.chars);
      layerNode.append(element);

      const particle = {
        element,
        x: 0,
        y: 0,
        driftX: 0,
        driftY: 0,
        opacity: 0,
        phase: 0,
        speed: 0,
        context: particleContextValue
      };

      resetParticle(particle, true);
      return particle;
    });
  }

  function animateParticles(particleList, pointerState, time, motionStep, pointerStep) {
    for (const particle of particleList) {
      particle.x += particle.driftX * motionStep;
      particle.y += particle.driftY * motionStep;
      applyPointerInfluence(particle, pointerState, pointerStep);
      particle.phase += particle.speed * motionStep;

      const flicker = 0.72 + Math.sin(time * 0.0017 + particle.phase) * 0.28;
      particle.element.style.opacity = (particle.opacity * flicker).toFixed(3);
      particle.element.style.transform = `translate3d(${particle.x.toFixed(2)}px, ${particle.y.toFixed(2)}px, 0)`;

      if (
        particle.y < -24 ||
        particle.y > window.innerHeight + 24 ||
        particle.x < -24 ||
        particle.x > window.innerWidth + 24
      ) {
        resetParticle(particle, false);
      }
    }
  }

  function resetParticle(particle, anywhere) {
    const side = randomInt(0, 3);
    const fromEdge = !anywhere && side;
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);

    particle.x =
      fromEdge === 1
        ? width + randomBetween(4, 20)
        : fromEdge === 2
          ? -randomBetween(4, 20)
          : randomParticleX(width, particle.context);
    particle.y =
      fromEdge === 3 ? height + randomBetween(4, 20) : fromEdge ? randomBetween(0, height) : randomBetween(0, height);
    particle.driftX = randomBetween(...config.driftX);
    particle.driftY = randomBetween(...config.driftY);
    particle.opacity = randomParticleOpacity(particle.context);
    particle.phase = randomBetween(0, Math.PI * 2);
    particle.speed = randomBetween(...config.speed);
    particle.element.textContent = sample(config.chars);
  }

  function particleCount(profileValue) {
    const contextConfig = config.contexts[profileValue.context];
    const baseCount = mobile ? contextConfig.mobileCount : contextConfig.desktopCount;
    return Math.max(4, Math.round(baseCount * profileValue.countScale));
  }

  function particleContext() {
    if (document.querySelector(".home-shell")) {
      return "home";
    }

    if (document.querySelector(".volume-wrap")) {
      return "volume";
    }

    return "article";
  }

  function pointerFrameMs(profileValue, pointerState) {
    return pointerActive(pointerState) ? Math.min(profileValue.frameMs, tapFrameMs) : profileValue.frameMs;
  }

  function pointerActive(pointerState) {
    if (!Number.isFinite(pointerState.x) || !Number.isFinite(pointerState.y)) {
      return false;
    }

    if (pointerState.durationMs === 0) {
      return true;
    }

    return performance.now() - pointerState.startedAt < pointerState.durationMs;
  }

  function isMobileParticleViewport() {
    return window.matchMedia(`(max-width: ${config.mobileBreakpoint}px), (pointer: coarse)`).matches;
  }

  function lowPowerDevice() {
    const navigatorInfo = navigator;
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory = navigatorInfo.deviceMemory ?? 8;
    return cores <= 4 || memory <= 4;
  }

  function prefersReducedData() {
    return navigator.connection?.saveData === true;
  }

  function randomParticleX(width, particleContextValue) {
    return randomBetween(0, width);
  }

  function randomParticleOpacity(particleContextValue) {
    return randomBetween(...config.contexts[particleContextValue].opacity);
  }

  function applyPointerInfluence(particle, pointerState, pointerStep) {
    if (!pointerActive(pointerState)) {
      return;
    }

    const dx = particle.x - pointerState.x;
    const dy = particle.y - pointerState.y;
    const distance = Math.hypot(dx, dy);
    const falloff = pointerFalloff(pointerState);
    const radius = config.pointerInfluenceRadius * pointerState.radiusScale * (0.72 + falloff * 0.28);

    if (distance > radius) {
      return;
    }

    const force = (1 - distance / radius) ** 2;
    const contextScale = config.contexts[particle.context].pointerScale * pointerState.forceScale * falloff;
    const unitX = distance > 0 ? dx / distance : Math.cos(particle.phase);
    const unitY = distance > 0 ? dy / distance : Math.sin(particle.phase);

    particle.x += unitX * force * contextScale * 1.8 * pointerStep;
    particle.y += unitY * force * contextScale * 1.2 * pointerStep;
    particle.phase += force * contextScale * 0.08 * pointerStep;
  }

  function pointerFalloff(pointerState) {
    if (pointerState.durationMs === 0) {
      return 1;
    }

    const elapsed = Math.max(0, performance.now() - pointerState.startedAt);
    const progress = Math.min(1, elapsed / pointerState.durationMs);
    return (1 - progress) ** 1.4;
  }

  function sample(items) {
    return items[randomInt(0, items.length - 1)] ?? items[0];
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomInt(min, max) {
    return Math.floor(randomBetween(min, max + 1));
  }

  function maybe(probability) {
    return Math.random() < probability;
  }
})();