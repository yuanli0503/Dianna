/* ============================================================
   Basely · 品牌站交互
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var STILL = /still/.test(location.search);
  if (STILL) document.documentElement.classList.add("still");

  /* ---------------------------------------------------------------- nav */
  var nav = $("#nav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------- smooth anchors (offset for fixed nav) */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id === "#" || id.length < 2) return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    var top = el.getBoundingClientRect().top + window.scrollY - 78;
    window.scrollTo({ top: top, behavior: "smooth" });
    history.replaceState(null, "", id);
  });

  /* ---------------------------------------------------------------- reveal */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  $$(".reveal").forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
    io.observe(el);
  });

  // 兜底：无论 IntersectionObserver 是否可用，进入视口的内容都要显示
  function revealVisible() {
    var h = window.innerHeight;
    $$(".reveal:not(.in)").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < h * 0.94 && r.bottom > 0) el.classList.add("in");
    });
  }
  window.addEventListener("scroll", revealVisible, { passive: true });
  window.addEventListener("resize", revealVisible);
  window.addEventListener("load", revealVisible);
  setTimeout(revealVisible, 700);

  /* ---------------------------------------------------------------- split bar */
  var split = $("[data-split]");
  if (split) {
    var needEl = split.querySelector(".need");
    var wantEl = split.querySelector(".want");
    if (STILL) {
      needEl.style.width = "67%";
      wantEl.style.width = "33%";
    } else {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          needEl.style.width = "67%";
          wantEl.style.width = "33%";
          sio.disconnect();
        });
      }, { threshold: 0.4 });
      sio.observe(split);
    }
  }

  /* ---------------------------------------------------------------- pips */
  function pips(el, n, cls) {
    if (!el) return;
    var html = "";
    for (var i = 0; i < n; i++) html += '<i class="' + (cls || "") + '"></i>';
    el.innerHTML = html;
  }
  pips($("#pips-small"), 62);
  pips($("#pips-big"), 11);

  /* ---------------------------------------------------------------- IP tabs */
  var ipTabs = $("#ip-tabs");
  if (ipTabs) {
    $$("button", ipTabs).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", ipTabs).forEach(function (x) { x.classList.toggle("on", x === b); });
        var is3d = b.getAttribute("data-ip") === "3d";
        $("#ip-3d").hidden = !is3d;
        $("#ip-flat").hidden = is3d;
        $("#ip-main").src = is3d
          ? "penguin-3d-tall.png"
          : "penguin-flat-front.png";
      });
    });
  }

  /* ---------------------------------------------------------------- posters */
  var POSTERS = [
    { src: "poster-1.jpg", t: "伪刚需分层 · 它占了 25.3%" },
    { src: "poster-2.jpg", t: "小额高频 · 62 笔小钱" },
    { src: "poster-3.jpg", t: "人机分工 · 机器算，人判断" },
    { src: "poster-4.jpg", t: "不用你记 · 复用已有账单" },
    { src: "poster-5.jpg", t: "AI 周报 · 每周一次复盘" },
    { src: "poster-6.jpg", t: "心愿存钱罐 · 钱慢慢满上去" }
  ];
  var grid = $("#posters-grid");
  if (grid) {
    grid.innerHTML = POSTERS.map(function (p, i) {
      return (
        '<button class="poster reveal" data-i="' + i + '" aria-label="' + p.t + '">' +
        '<img src="' + p.src + '" alt="' + p.t + '" loading="lazy" /></button>'
      );
    }).join("");
    $$(".poster", grid).forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 60 + "ms";
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------------- lightbox */
  var lb = $("#lightbox");
  var lbImg = $("#lb-img");
  var lbCount = $("#lb-count");
  var idx = 0;

  function openLb(i) {
    idx = (i + POSTERS.length) % POSTERS.length;
    lbImg.src = POSTERS[idx].src;
    lbImg.alt = POSTERS[idx].t;
    lbCount.textContent = String(idx + 1).padStart(2, "0") + " / 06   " + POSTERS[idx].t;
    lb.classList.add("on");
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    lb.classList.remove("on");
    document.body.style.overflow = "";
  }
  document.addEventListener("click", function (e) {
    var p = e.target.closest(".poster");
    if (p) openLb(+p.getAttribute("data-i"));
  });
  $("#lb-close").addEventListener("click", closeLb);
  $("#lb-prev").addEventListener("click", function () { openLb(idx - 1); });
  $("#lb-next").addEventListener("click", function () { openLb(idx + 1); });
  lb.addEventListener("click", function (e) {
    if (e.target === lb) closeLb();
  });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("on")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") openLb(idx - 1);
    if (e.key === "ArrowRight") openLb(idx + 1);
  });
})();
