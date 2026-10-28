/* ===============================================================
   basely 体验版 —— 资料编辑 + 新手指引
   依赖：app.js 已经跑起来（DOM 就绪）
   =============================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var PROFILE_KEY = "basely.demo.profile";

  var DEFAULTS = {
    name: "平平的主人",
    quote: "记录每一笔\n都是更好的自己！",
    avatar: "avatar-flat.png"
  };

  var AVATARS = [
    "avatar-flat.png",
    "avatar3d-happy.png",
    "avatar3d-love.png",
    "avatar3d-calm.png",
    "avatar3d-surprise.png"
  ];

  function loadProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return Object.assign({}, DEFAULTS);
      var p = JSON.parse(raw);
      return Object.assign({}, DEFAULTS, p || {});
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }
  function saveProfile(p) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    } catch (e) {}
  }

  var profile = loadProfile();

  /* ---------------------------------------------------- 渲染资料 */
  function renderProfile() {
    var head = $(".profile-head");
    if (!head) return;
    var img = head.querySelector(".ava img");
    if (img && img.getAttribute("src") !== profile.avatar) img.setAttribute("src", profile.avatar);
    var nm = head.querySelector(".nm");
    if (nm) nm.textContent = profile.name;
    var q = head.querySelector(".quote");
    if (q) q.innerHTML = profile.quote.replace(/\n/g, "<br />");
  }

  /* 我的页里的数字跟着真实数据走（体验版从 0 开始） */
  function syncMeNumbers() {
    var total = ($("#home-total") || {}).textContent || "0";
    var delta = $("#home-delta");
    if (delta) delta.style.display = "none"; // 新账本没有“较上月”
    var v = $$("#v-me .stat-duo .v");
    if (v[0]) v[0].innerHTML = "0<small>天</small>";
    if (v[1]) v[1].textContent = "¥" + total;
    var sub = $$("#v-me .stat-duo .sub");
    if (sub[0]) sub[0].innerHTML = '<span class="chip green" style="height:18px;font-size:9.5px">今天开始</span>';
    if (sub[1]) sub[1].innerHTML = '较上月 <span class="up">—</span>';
    // 预算剩余：体验版没有任何支出
    var left = $$("#v-me .sec-head .more");
    left.forEach(function (el) {
      if (/剩余/.test(el.textContent)) el.textContent = "剩余 100%";
    });
    // 预算条：没有支出就都是 0
    $$("#v-me .budget-row").forEach(function (row) {
      var bar = row.querySelector(".mini-bar i");
      if (bar) bar.style.width = "0%";
      var b = row.querySelector(".t b");
      if (b) b.textContent = "¥0 / " + b.textContent.split("/")[1].trim();
    });
  }

  /* ---------------------------------------------------- 编辑面板 */
  function buildEditor() {
    var app = $(".app");
    if (!app || $("#edit-mask")) return;

    var mask = document.createElement("div");
    mask.className = "edit-mask";
    mask.id = "edit-mask";

    var sheet = document.createElement("div");
    sheet.className = "edit-sheet";
    sheet.id = "edit-sheet";
    sheet.innerHTML =
      '<h3>编辑资料</h3>' +
      '<div class="edit-field"><label>昵称</label><input id="ed-name" maxlength="12" placeholder="给自己起个名字" /></div>' +
      '<div class="edit-field"><label>签名</label><input id="ed-quote" maxlength="24" placeholder="一句话介绍自己" /></div>' +
      '<div class="edit-field"><label>头像</label><div class="edit-avas" id="ed-avas"></div></div>' +
      '<div class="edit-actions">' +
      '<button class="ghost" id="ed-cancel">取消</button>' +
      '<button class="primary" id="ed-save">保存</button>' +
      "</div>";

    app.appendChild(mask);
    app.appendChild(sheet);

    var picked = profile.avatar;

    function paintAvas() {
      var box = $("#ed-avas");
      box.innerHTML = "";
      AVATARS.forEach(function (src) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = src === picked ? "on" : "";
        b.innerHTML = '<img src="' + src + '" alt="" />';
        b.addEventListener("click", function () {
          picked = src;
          paintAvas();
        });
        box.appendChild(b);
      });
    }

    function open() {
      picked = profile.avatar;
      $("#ed-name").value = profile.name;
      $("#ed-quote").value = profile.quote.replace(/\n/g, " ");
      paintAvas();
      mask.classList.add("on");
      sheet.classList.add("on");
    }
    function close() {
      mask.classList.remove("on");
      sheet.classList.remove("on");
    }

    $("#ed-cancel").addEventListener("click", close);
    mask.addEventListener("click", close);
    $("#ed-save").addEventListener("click", function () {
      profile.name = ($("#ed-name").value || "").trim() || DEFAULTS.name;
      var q = ($("#ed-quote").value || "").trim();
      profile.quote = q ? q : DEFAULTS.quote;
      profile.avatar = picked;
      saveProfile(profile);
      renderProfile();
      close();
      toast("资料已保存");
    });

    // 头像右上角一个小铅笔徽标，点头像或徽标都能编辑
    var head = $(".profile-head");
    var ava = head && head.querySelector(".ava");
    if (ava && !ava.querySelector(".profile-edit-btn")) {
      var btn = document.createElement("button");
      btn.className = "profile-edit-btn";
      btn.type = "button";
      btn.setAttribute("aria-label", "编辑资料");
      btn.innerHTML = "✎";
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        open();
      });
      ava.appendChild(btn);
      ava.style.cursor = "pointer";
      ava.addEventListener("click", open);
      var nm = head.querySelector(".nm");
      if (nm) {
        nm.style.cursor = "pointer";
        nm.addEventListener("click", open);
      }
    }
  }

  function toast(msg) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("on"); }, 1800);
  }

  /* ---------------------------------------------------- 应用指引 */
  var TOUR = [
    {
      sel: ".total-card",
      title: "支出总览",
      text: "这一块是本月花了多少。上面是总额，下面拆成「刚需」和「伪刚需」两条，蓝色是生活，黄色是热爱。点一下能看分类占比和周/月趋势。"
    },
    {
      sel: "#wish-home",
      title: "心愿存钱罐",
      text: "想要的东西放这里，变成一个个小目标。点进去写下第一个心愿，存多少都行、随时能取，瓶子会跟着满起来。"
    },
    {
      sel: "#home-today",
      title: "今日账单",
      text: "今天记的每一笔都在这儿，每笔都带「刚需 / 伪刚需」标签。点「查看全部」能筛选、也能改归属。"
    },
    {
      sel: '.tabbar [data-tab="home"]',
      title: "首页",
      text: "支出、心愿、预算、今日账单都在这一屏。想快速看今天的状态，回到这里就行。"
    },
    {
      sel: '.tabbar [data-tab="records"]',
      title: "账单",
      text: "所有流水都在这，可以按月、按类目、按「刚需 / 伪刚需」筛选，也能点开某一笔改归属。"
    },
    {
      sel: '.tabbar [data-tab="charts"]',
      title: "图表",
      text: "周趋势、月趋势、分类占比，还有最重要的溢价率——这一个月你为热爱多花了多少，一眼看清。"
    },
    {
      sel: '.tabbar [data-tab="me"]',
      title: "我的",
      text: "资料、预算、成就都在这儿。头像和昵称都能改，右上角还能进设置。"
    },
    {
      sel: null,
      title: "完成啦",
      text: "指引就到这里啦！有需要记得来找我哦~",
      final: true
    }
  ];

  var tour = { i: 0, layer: null, ring: null, card: null, busy: false };

  function appBox() {
    var app = $(".app");
    var r = app.getBoundingClientRect();
    var scale = r.width / app.offsetWidth || 1;
    return { r: r, scale: scale, w: app.offsetWidth, h: app.offsetHeight, app: app };
  }

  function placeCard(top, bottom) {
    var card = tour.card;
    var box = appBox();
    card.style.top = "";
    card.style.bottom = "";
    if (bottom != null) card.style.bottom = bottom + "px";
    else card.style.top = top + "px";
  }

  function scrollIntoViewOnly(t) {
    var view = t.closest ? t.closest(".view") : null;
    if (view) {
      var tr = t.getBoundingClientRect();
      var vr = view.getBoundingClientRect();
      var delta = tr.top - vr.top - Math.max(0, (vr.height - tr.height) / 2);
      if (tr.top < vr.top + 12 || tr.bottom > view.offsetHeight + view.scrollTop + vr.top) {
        view.scrollTop += delta;
      }
    }
    // 兜底：任何情况下都把文档滚动归零
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  function showStep(i) {
    tour.i = i;
    var step = TOUR[i];
    var box = appBox();
    var ring = tour.ring;

    // 最后一步：没有目标，整屏变暗
    if (!step.sel) {
      ring.classList.add("no-target");
      ring.style.left = "0px";
      ring.style.top = "0px";
      ring.style.width = "0px";
      ring.style.height = "0px";
      placeCard(null, 120);
    } else {
      var t = $(step.sel);
      if (!t) {
        // 目标不存在就跳到下一步
        return i + 1 < TOUR.length ? showStep(i + 1) : finish();
      }
      // 只滚视图容器，绝不动整个页面（否则遮罩会错位、面板会被顶出来）
      scrollIntoViewOnly(t);
      var tr = t.getBoundingClientRect();
      var left = (tr.left - box.r.left) / box.scale;
      var top = (tr.top - box.r.top) / box.scale;
      var w = tr.width / box.scale;
      var h = tr.height / box.scale;
      var pad = 6;
      ring.classList.remove("no-target");
      ring.style.left = Math.max(4, left - pad) + "px";
      ring.style.top = Math.max(4, top - pad) + "px";
      ring.style.width = Math.min(box.w - 8, w + pad * 2) + "px";
      ring.style.height = Math.min(box.h - 8, h + pad * 2) + "px";

      // 卡片放在目标上方或下方
      var spaceBelow = box.h - (top + h);
      var cardH = 168;
      if (spaceBelow > cardH + 20) placeCard(top + h + 14, null);
      else if (top > cardH + 20) placeCard(top - cardH - 14, null);
      else placeCard(null, 120);
    }

    // 文案
    tour.card.querySelector(".t").textContent = step.title;
    tour.card.querySelector(".d").textContent = step.text;
    tour.card.querySelector(".step").textContent = step.final ? "完成" : i + 1 + " / " + (TOUR.length - 1);
    tour.card.querySelector(".next").textContent = step.final ? "开始体验" : "下一步";
    var dots = tour.card.querySelector(".dots");
    dots.innerHTML = "";
    for (var d = 0; d < TOUR.length; d++) {
      var dot = document.createElement("i");
      if (d === i) dot.className = "on";
      dots.appendChild(dot);
    }
  }

  function next() {
    if (tour.busy) return;
    tour.busy = true;
    setTimeout(function () { tour.busy = false; }, 260);
    if (tour.i + 1 < TOUR.length) showStep(tour.i + 1);
    else finish();
  }

  function finish() {
    if (!tour.layer) return;
    tour.layer.remove();
    tour.layer = null;
    try { sessionStorage.setItem("basely.demo.tour", "1"); } catch (e) {}
  }

  function startTour() {
    var app = $(".app");
    if (!app || tour.layer) return;

    var layer = document.createElement("div");
    layer.className = "tour-layer";
    layer.innerHTML =
      '<div class="tour-ring"></div>' +
      '<div class="tour-hit"></div>' +
      '<div class="tour-card">' +
      '<div class="row">' +
      '<div class="pv"><img src="avatar-flat.png" alt="" /></div>' +
      '<div class="tx"><div class="t"></div><div class="d"></div></div>' +
      "</div>" +
      '<div class="dots"></div>' +
      '<div class="foot">' +
      '<span class="step"></span>' +
      '<div class="btns"><button class="skip" type="button">跳过</button>' +
      '<button class="next" type="button">下一步</button></div>' +
      "</div>" +
      "</div>";
    app.appendChild(layer);

    tour.layer = layer;
    tour.ring = layer.querySelector(".tour-ring");
    tour.card = layer.querySelector(".tour-card");

    layer.querySelector(".tour-hit").addEventListener("click", next);
    layer.querySelector(".next").addEventListener("click", next);
    layer.querySelector(".skip").addEventListener("click", function (e) {
      e.stopPropagation();
      finish();
    });

    showStep(0);
  }

  /* ---------------------------------------------------- 启动 */
  function boot() {
    renderProfile();
    buildEditor();
    syncMeNumbers();

    // 首页数字变化时，我的页跟着更新
    var total = $("#home-total");
    if (total) {
      new MutationObserver(syncMeNumbers).observe(total, { childList: true, characterData: true, subtree: true });
    }

    // 每次打开都弹指引（“跳过”只影响这一次）
    setTimeout(function () {
      var homeTab = $('.tabbar [data-tab="home"]');
      if (homeTab && !$("#v-home").classList.contains("active")) homeTab.click();
      setTimeout(startTour, 420);
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 260); });
  } else {
    setTimeout(boot, 260);
  }

  window.__BASELY_DEMO_TOUR__ = startTour; // 方便手动重放
})();
