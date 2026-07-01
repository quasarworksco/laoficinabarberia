(function () {
  const slider = document.getElementById("slider");
  if (!slider) return;

  const track = document.getElementById("slider-track");
  const slides = Array.from(track.children);
  const prevBtn = document.getElementById("slider-prev");
  const nextBtn = document.getElementById("slider-next");
  const dotsWrap = document.getElementById("slider-dots");
  const AUTOPLAY_MS = 5000;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let index = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir a la imagen ${i + 1}`);
    if (i === 0) dot.classList.add("is-active");
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    timer = setInterval(next, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  nextBtn.addEventListener("click", () => {
    next();
    startAutoplay();
  });

  prevBtn.addEventListener("click", () => {
    prev();
    startAutoplay();
  });

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);

  let touchStartX = null;
  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchend",
    (e) => {
      if (touchStartX === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) > 40) {
        deltaX < 0 ? next() : prev();
        startAutoplay();
      }
      touchStartX = null;
    },
    { passive: true }
  );

  update();
  startAutoplay();
})();
