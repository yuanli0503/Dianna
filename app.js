/* ============================================================
   Basely · 基线 —— App 原型交互
   纯原生 JS：数据来自 data.js，改一笔账全站同步。
   只记录支出；不做收入侧。
   ============================================================ */
(function () {
  "use strict";

  var B = window.BASELY;
  var DEMO = !!window.__BASELY_DEMO__;   // 体验版：从空数据开始
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var STILL = /still/.test(location.search);
  if (STILL) document.documentElement.classList.add("still");

  /* ---------------------------------------------------------------- helpers */
  function fmt(n) {
    n = Math.round(n * 100) / 100;
    var s = (Math.abs(n) % 1 === 0 ? Math.abs(n).toFixed(0) : Math.abs(n).toFixed(2).replace(/0$/, ""));
    s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (n < 0 ? "-" : "") + s;
  }
  function yuan(n) { return "¥" + fmt(n); }
  function pct(a, b) { return b ? Math.round((a / b) * 1000) / 10 : 0; }
  function weekday(dateStr) {
    return "周" + "日一二三四五六"[new Date(dateStr + "T00:00:00").getDay()];
  }
  function mmdd(d) { return d.slice(5).replace("-", "月") + "日"; }

  var state = {
    view: "home",
    stack: [],
    range: "week",
    filter: "all",
    add: { cat: "food", amount: "", judge: null, userJudge: false, date: "2024-10-13", account: "微信钱包", keypad: true },
    wishes: [
      { id: "w1", title: "换一台相机", target: 8000, base: 3200, deadline: "明年 6 月" },
      { id: "w2", title: "买房首付", target: 300000, base: 24000, deadline: "5 年后" },
      { id: "w3", title: "带爸妈旅行", target: 6000, base: 1200, deadline: "今年底" }
    ],
    activeWish: "w1",
    savings: [],
    budget: { month: B.budget.month, cats: { food: 40, travel: 20, shopping: 30, fun: 10 } }
  };

  var TABS = ["home", "records", "charts", "me"];
  var NAMES = {
    home: "首页", records: "账单", add: "添加记账", category: "分类",
    charts: "统计", ai: "AI 助手", me: "我的", settings: "设置",
    achievements: "成就", plan: "预算计划", budget: "预算设置", wish: "心愿存钱罐"
  };

  /* ---------------------------------------------------------------- 本地持久化 */
  var STORE_KEY = window.__BASELY_STORE_KEY__ || "basely.state.v4";
  var restored = false;

  function loadSaved() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var s = JSON.parse(raw);
      if (s && s.records && (DEMO || s.records.length >= B.records.length)) {
        B.records.length = 0;
        s.records.forEach(function (r) { B.records.push(r); });
        restored = true;
      }
      if (s && Array.isArray(s.savings)) state.savings = s.savings;
      if (s && Array.isArray(s.wishes) && s.wishes.length) state.wishes = s.wishes;
      if (s && s.activeWish) state.activeWish = s.activeWish;
      if (s && s.budget && s.budget.cats) state.budget = s.budget;
    } catch (e) {}
  }

  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        records: B.records,
        savings: state.savings,
        wishes: state.wishes,
        activeWish: state.activeWish,
        budget: state.budget,
        v: 4
      }));
    } catch (e) {}
  }

  /* ---------------------------------------------------------------- data */
  function spent() { return B.records; }
  function sumOf(list) { return list.reduce(function (s, r) { return s + r.amount; }, 0); }
  function totalSpend() { return sumOf(spent()); }
  function isWant(r) { return r.judged === "need" ? false : r.amount > r.base; }
  function totalPremium() {
    return spent().reduce(function (s, r) { return s + (isWant(r) ? r.amount - r.base : 0); }, 0);
  }
  function catSpend(id) { return sumOf(spent().filter(function (r) { return r.cat === id; })); }
  function catById(id) {
    return B.categories.filter(function (c) { return c.id === id; })[0] || B.categories[7];
  }
  function todayRecs() { return spent().filter(function (r) { return r.date === "2024-10-13"; }); }
  function weekRecs() { return spent().filter(function (r) { return r.date >= "2024-10-07"; }); }

  /* ---------------------------------------------------------------- toast */
  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("on"); }, 1900);
  }

  /* ---------------------------------------------------------------- mascot */
  var POSES = {
    home: "pos-act-rest", records: "pos-idle-ledger", add: "pos-idle-note",
    category: "pos-idle-ledger", charts: "pos-act-work", ai: "pos-act-wave",
    me: "pos-act-rest", wish: "pos-idle-coffee", budget: "pos-act-rest",
    achievements: "pos-act-wave", plan: "pos-act-work", settings: "pos-act-rest"
  };
  var TIPS = {
    home: ["记一笔？", "点我看看这周", "存钱罐又满了一点"],
    records: ["每一笔都能改判", "要我帮你找找溢价吗"],
    add: ["这笔姓生活还是姓爱好？", "慢慢输，不着急"],
    category: ["餐饮的溢价最多", "要不要设个爱好预算"],
    charts: ["这周伪刚需 29.7%", "看看趋势？"],
    ai: ["我在听～", "想问什么都可以"],
    me: ["连续记账 7 天啦", "要不要看看成就"],
    wish: ["钱是慢慢满上去的", "再存一点？"],
    budget: ["超了只提示，不拦你", "刚需先锁死"],
    achievements: ["再坚持 23 天", "你很棒"],
    plan: ["本月还剩 ¥1,000", "要不要调一调"],
    settings: ["隐私优先", "随时可以撤销授权"]
  };
  var mascotTimer, tipTimer;

  function setMascot(view) {
    var m = $("#mascot");
    if (!m) return;
    var pose = POSES[view] || "pos-act-rest";
    $("#mascot-img").src = "" + pose + ".webp";
    m.setAttribute("data-pose", pose);
    m.classList.remove("cheer");
    // 交互动作：切换页面时用「过渡状态」挥一下
    if (!STILL && view !== "ai") {
      m.classList.add("wave-once");
      setTimeout(function () { m.classList.remove("wave-once"); }, 700);
    }
    clearTimeout(tipTimer);
    m.classList.remove("show-tip");
    if (STILL) return;
    tipTimer = setTimeout(function () {
      var list = TIPS[view] || TIPS.home;
      $("#mascot-tip").textContent = list[Math.floor(Math.random() * list.length)];
      m.classList.add("show-tip");
      clearTimeout(mascotTimer);
      mascotTimer = setTimeout(function () { m.classList.remove("show-tip"); }, 4200);
    }, 900);
  }

  function mascotSay(text, ms) {
    var m = $("#mascot");
    if (!m) return;
    $("#mascot-tip").textContent = text;
    m.classList.add("show-tip");
    clearTimeout(mascotTimer);
    mascotTimer = setTimeout(function () { m.classList.remove("show-tip"); }, ms || 2600);
  }

  function mascotCheer(text) {
    var m = $("#mascot");
    if (!m) return;
    m.classList.remove("cheer");
    void m.offsetWidth;
    m.classList.add("cheer");
    mascotSay(text || "记下啦！", 2400);
    setTimeout(function () { m.classList.remove("cheer"); }, 900);
  }

  /* ---------------------------------------------------------------- router */
  function show(name, opts) {
    opts = opts || {};
    if (!NAMES[name]) return;
    var current = state.view;
    if (current !== name && !opts.replace) {
      if (TABS.indexOf(current) === -1 && current !== "add") state.stack.push(current);
      else state.stack = [];
    }
    state.view = name;
    $$(".view").forEach(function (v) { v.classList.remove("active"); });
    var view = $("#v-" + name);
    if (view) {
      view.classList.add("active");
      view.scrollTop = 0;
    }
    var isTab = TABS.indexOf(name) > -1;
    $("#tabbar").classList.toggle("hide", !isTab);
    $("#app").setAttribute("data-view", name);
    $$(".tab").forEach(function (t) {
      t.classList.toggle("on", t.getAttribute("data-tab") === name);
    });
    if (name === "records") renderRecords();
    if (name === "category") renderCategoryGrid();
    if (name === "charts") renderCharts();
    if (name === "plan") renderPlan();
    if (name === "add") resetAdd();
    if (name === "ai") ensureChat();
    if (name === "wish") renderWish();
    if (name === "home") renderHome();
    setMascot(name);
  }
  function back() {
    var prev = state.stack.pop();
    show(prev || "home", { replace: true });
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-go],[data-tab],[data-act]");
    if (!t) return;
    if (t.hasAttribute("data-go")) {
      show(t.getAttribute("data-go"));
      return;
    }
    if (t.hasAttribute("data-tab")) { show(t.getAttribute("data-tab")); return; }
    var act = t.getAttribute("data-act");
    if (act === "toast") toast(t.getAttribute("data-msg") || "演示原型");
    else if (act === "back") back();
    else if (act === "close-add") { show("home", { replace: true }); }
    else if (act === "save-record") saveRecord();
    else if (act === "save-budget") toast("预算已保存，超限只提示不拦截");
    else if (act === "keypad-hide") setKeypad(false);
  });

  /* ---------------------------------------------------------------- home */
  function renderHome() {
    var total = totalSpend();
    var prem = totalPremium();
    var need = total - prem;

    $("#home-total").textContent = fmt(total);
    $("#home-meta").innerHTML =
      '<div><div class="k">刚需 · 基线以下</div><div class="v">' + yuan(need) + "</div></div>" +
      '<div><div class="k">伪刚需 · 溢价</div><div class="v">' + yuan(prem) + "</div></div>" +
      '<div><div class="k">日均支出</div><div class="v">' + yuan(total / 30) + "</div></div>";

    var p1 = pct(need, total), p2 = pct(prem, total);
    $(".total-card .stack-bar .need").style.width = p1 + "%";
    $(".total-card .stack-bar .want").style.width = p2 + "%";
    $("#home-legend").innerHTML =
      '<span><i></i> 刚需 ' + yuan(need) + " · " + p1 + "%</span>" +
      '<span><i class="y"></i> 伪刚需 ' + yuan(prem) + " · " + p2 + "%</span>";

    renderWishCard();
    renderHomeBudgets();
    renderHomeToday();

    var foodPrem = spent().filter(function (r) { return r.cat === "food"; })
      .reduce(function (s, r) { return s + (isWant(r) ? r.amount - r.base : 0); }, 0);
    $("#ai-tip").textContent = "本月餐饮溢价 " + yuan(foodPrem) + "，占餐饮 " +
      Math.round(pct(foodPrem, catSpend("food"))) + "% 哦～ 要不要看看？";
  }

  function renderWishCard() {
    var el = $("#wish-home");
    if (!el) return;
    var w = activeWish();
    if (!w) {
      el.innerHTML =
        '<div class="jar-mini"><i style="height:0%"></i></div>' +
        '<div class="wh-info">' +
        '<div class="wh-t">还没有心愿</div>' +
        '<div class="wh-s">写下第一个心愿，再慢慢存</div>' +
        '<div class="wh-bar"><i style="width:0%"></i></div>' +
        "</div>" +
        '<span class="wh-go">去写</span>';
      return;
    }
    var saved = wishSaved(w.id);
    var target = w.target;
    var p = Math.round((saved / target) * 100);
    el.innerHTML =
      '<div class="jar-mini"><i style="height:' + p + '%"></i></div>' +
      '<div class="wh-info">' +
      '<div class="wh-t">' + w.title + '<span class="chip yellow" style="height:19px">还差 ' + yuan(target - saved) + "</span></div>" +
      '<div class="wh-s">已存 ' + p + "% · " + yuan(saved) + " / " + yuan(target) + "</div>" +
      '<div class="wh-bar"><i style="width:' + p + '%"></i></div>' +
      "</div>" +
      '<span class="wh-go">存一笔</span>';
  }

  function renderHomeBudgets() {
    var rows = B.categories.slice(0, 3).map(function (c) {
      var used = catSpend(c.id);
      var ratio = Math.min(100, Math.round(pct(used, c.budget)));
      return (
        '<div class="budget-row" data-go="budget" style="cursor:pointer">' +
        '<img class="cat-icon" src="' + c.icon + '" alt="" />' +
        '<div class="info">' +
        '<div class="t"><span>' + c.name + "</span><b>" + yuan(used) + "</b></div>" +
        '<div class="s">已用 ' + ratio + "% · 剩余 " + (100 - ratio) + "%</div>" +
        '<div class="mini-bar"><i class="' + (ratio > 90 ? "warn" : "") + '" style="width:' + ratio + '%"></i></div>' +
        "</div></div>"
      );
    });
    $("#home-budgets").innerHTML = rows.join("");
  }

  function renderHomeToday() {
    $("#home-today").innerHTML = todayRecs().slice(0, 3).map(recRow).join("") ||
      '<div class="empty-hint">今天还没有记账</div>';
  }

  function recRow(r) {
    var c = catById(r.cat);
    var want = isWant(r);
    return (
      '<button class="rec-item" data-rec="' + r.id + '">' +
      '<img class="cat-icon" src="' + c.icon + '" alt="" />' +
      '<div class="mid"><div class="t">' + r.title +
      (want ? '<span class="tag want">伪刚需</span>' : '<span class="tag need">刚需</span>') +
      '</div><div class="s"><span>' + r.place + "</span><span>" + r.time + "</span></div></div>" +
      '<div class="amt">-' + yuan(r.amount) +
      (want ? "<small>高于基线 " + yuan(r.amount - r.base) + "</small>" : "<small>基线内</small>") +
      "</div></button>"
    );
  }

  /* ---------------------------------------------------------------- records */
  function renderRecords() {
    var list = spent();
    var headNum = $("#v-records b.num");
    if (headNum) headNum.textContent = yuan(sumOf(spent()));
    if (state.filter === "need") list = list.filter(function (r) { return !isWant(r); });
    if (state.filter === "want") list = list.filter(function (r) { return isWant(r); });
    var groups = {};
    list.forEach(function (r) { (groups[r.date] = groups[r.date] || []).push(r); });
    var dates = Object.keys(groups).sort().reverse();
    var html = dates.map(function (d) {
      var daySum = sumOf(groups[d]);
      return (
        '<div class="day-head"><div><b>' + mmdd(d) + "</b>" + weekday(d) +
        '</div><div class="sum">-' + yuan(daySum) + "</div></div>" +
        groups[d].map(recRow).join("")
      );
    }).join("");
    $("#rec-list").innerHTML = html || '<div class="empty-hint">这里还没有记录</div>';
  }

  $$("#rec-filter button").forEach(function (b) {
    b.addEventListener("click", function () {
      state.filter = b.getAttribute("data-filter");
      $$("#rec-filter button").forEach(function (x) { x.classList.toggle("on", x === b); });
      renderRecords();
    });
  });

  /* ---------------------------------------------------------------- record sheet */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-rec]");
    if (!btn) return;
    openRecord(btn.getAttribute("data-rec"));
  });

  function openRecord(id) {
    var r = B.records.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    var c = catById(r.cat);
    var over = Math.max(0, r.amount - r.base);
    var sheet = $("#sheet");
    sheet.innerHTML =
      '<div class="grab"></div>' +
      '<div class="detail-amt"><img src="' + c.icon + '" alt="" style="width:46px;margin:0 auto 6px" />' +
      '<div class="t">' + r.title + " · " + r.place + "</div>" +
      '<div class="v">-' + yuan(r.amount) + "</div>" +
      '<div style="font-size:11px;color:var(--ink-3)">' + mmdd(r.date) + " " + r.time + " · 微信钱包</div></div>" +
      '<div style="font-size:12px;color:var(--ink-2);margin-bottom:8px">这笔钱姓什么？改判后立即生效。</div>' +
      '<div class="judge-row">' +
      '<button data-j="need" class="' + (!isWant(r) ? "on" : "") + '">生活（刚需）<small>基线 ' + yuan(r.base) + "</small></button>" +
      '<button data-j="want" class="' + (isWant(r) ? "on want" : "") + '">爱好（伪刚需）<small>高出 ' + yuan(over) + "</small></button>" +
      "</div>" +
      '<div class="note">机器算出这笔比你的基线高 ' + yuan(over) + "，但它无权判断这是浪费还是热爱 —— 这个判断归你。</div>" +
      '<div class="btn ghost" style="margin-top:14px" data-act="close-sheet">完成</div>';

    openSheet();
    $$("[data-j]", sheet).forEach(function (b) {
      b.addEventListener("click", function () {
        var j = b.getAttribute("data-j");
        r.judged = j;
        persist();
        openRecord(r.id);
        renderHome();
        renderRecords();
        renderCharts();
        if (j === "need") mascotSay("好，那这笔算生活", 2200);
        else mascotSay("记在爱好上啦", 2200);
        toast(j === "need" ? "已改判为生活 · 溢价归零" : "已改判为爱好 · 计入溢价");
      });
    });
  }

  function openSheet() {
    $("#mask").classList.add("on");
    $("#sheet").classList.add("on");
    var app = document.querySelector(".app");
    if (app) app.classList.add("sheet-open");
  }
  function closeSheet() {
    $("#mask").classList.remove("on");
    $("#sheet").classList.remove("on");
    var app = document.querySelector(".app");
    if (app) app.classList.remove("sheet-open");
  }
  $("#mask").addEventListener("click", closeSheet);
  document.addEventListener("click", function (e) {
    if (e.target.closest('[data-act="close-sheet"]')) closeSheet();
  });

  /* ---------------------------------------------------------------- category */
  function renderCategoryGrid() {
    var total = totalSpend();
    $("#cat-grid").innerHTML = B.categories.map(function (c) {
      var a = catSpend(c.id);
      var p = a ? pct(a, total) : 0;
      return (
        '<div class="cat-cell ' + (a ? "" : "empty") + '">' +
        '<img src="' + c.icon + '" alt="" />' +
        '<div class="n">' + c.name + "</div>" +
        '<div class="a">' + (a ? yuan(a) : "¥0") + "</div>" +
        '<div class="p">' + (a ? p.toFixed(1) + "%" : "未记账") + "</div>" +
        "</div>"
      );
    }).join("");
  }

  /* ---------------------------------------------------------------- charts */
  function stackedWeek(recs) {
    var days = ["10-07", "10-08", "10-09", "10-10", "10-11", "10-12", "10-13"];
    var data = days.map(function (d) {
      var rs = recs.filter(function (r) { return r.date.slice(5) === d; });
      var want = rs.reduce(function (s, r) { return s + (isWant(r) ? r.amount - r.base : 0); }, 0);
      var all = sumOf(rs);
      return { d: d, need: all - want, want: want, all: all };
    });
    var W = 340, H = 168, padL = 22, padB = 20, padT = 10;
    var max = Math.max.apply(null, data.map(function (x) { return x.all; })) || 1;
    max = Math.ceil(max / 50) * 50;
    var innerW = W - padL - 4, innerH = H - padB - padT;
    var bw = 16, gap = innerW / data.length;
    var bars = data.map(function (x, i) {
      var cx = padL + gap * i + gap / 2;
      var hAll = (x.all / max) * innerH;
      var hWant = (x.want / max) * innerH;
      var y = padT + innerH - hAll;
      return (
        '<rect class="bar-rect" x="' + (cx - bw / 2) + '" y="' + y + '" width="' + bw + '" height="' + hAll +
        '" rx="5" fill="#57a6fe" opacity=".92"></rect>' +
        '<rect class="bar-rect" x="' + (cx - bw / 2) + '" y="' + y + '" width="' + bw + '" height="' + hWant +
        '" rx="5" fill="#fed984"></rect>' +
        '<text x="' + cx + '" y="' + (H - 5) + '" text-anchor="middle">' + x.d.slice(3) + "</text>"
      );
    }).join("");
    var grid = [0, 0.5, 1].map(function (k) {
      var y = padT + innerH * (1 - k);
      return '<line x1="' + padL + '" x2="' + W + '" y1="' + y + '" y2="' + y + '" stroke="#eef3f9" stroke-width="1"/>' +
        '<text x="' + (padL - 6) + '" y="' + (y + 3) + '" text-anchor="end">' + Math.round(max * k) + "</text>";
    }).join("");
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '">' + grid + bars + "</svg>";
  }

  function monthLine(history) {
    var W = 340, H = 168, padL = 30, padR = 12, padT = 16, padB = 22;
    var innerW = W - padL - padR, innerH = H - padT - padB;
    var max = 3000;
    var pts = history.map(function (x, i) {
      return { x: padL + (innerW / (history.length - 1)) * i, y: padT + innerH - (x.v / max) * innerH, v: x.v, m: x.m };
    });
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + p.x + " " + p.y; }).join(" ");
    var area = line + " L" + pts[pts.length - 1].x + " " + (padT + innerH) + " L" + pts[0].x + " " + (padT + innerH) + " Z";
    var dots = pts.map(function (p, i) {
      var last = i === pts.length - 1;
      return '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + (last ? 5 : 3.5) + '" fill="' + (last ? "#57a6fe" : "#fff") +
        '" stroke="#57a6fe" stroke-width="2.4"/>' +
        '<text x="' + p.x + '" y="' + (H - 6) + '" text-anchor="middle">' + p.m + "</text>";
    }).join("");
    var lastP = pts[pts.length - 1];
    return (
      '<svg class="chart" viewBox="0 0 ' + W + " " + H + '">' +
      '<defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#57a6fe" stop-opacity=".28"/>' +
      '<stop offset="1" stop-color="#57a6fe" stop-opacity="0"/></linearGradient></defs>' +
      [0, 0.5, 1].map(function (k) {
        var y = padT + innerH * (1 - k);
        return '<line x1="' + padL + '" x2="' + W + '" y1="' + y + '" y2="' + y + '" stroke="#eef3f9"/>' +
          '<text x="' + (padL - 6) + '" y="' + (y + 3) + '" text-anchor="end">' + fmt(max * k) + "</text>";
      }).join("") +
      '<path d="' + area + '" fill="url(#ga)"/>' +
      '<path d="' + line + '" fill="none" stroke="#57a6fe" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      dots +
      '<g><rect x="' + (lastP.x - 34) + '" y="' + (lastP.y - 30) + '" width="68" height="22" rx="8" fill="#57a6fe"/>' +
      '<text x="' + lastP.x + '" y="' + (lastP.y - 15) + '" text-anchor="middle" fill="#fff" style="font-size:11px;font-weight:700">¥' +
      fmt(lastP.v) + "</text></g>" +
      "</svg>"
    );
  }

  function donut(recs) {
    var total = sumOf(recs);
    var rows = B.categories.map(function (c) {
      return { c: c, v: sumOf(recs.filter(function (r) { return r.cat === c.id; })) };
    })
      .filter(function (x) { return x.v > 0; })
      .sort(function (a, b) { return b.v - a.v; });
    var size = 132, thick = 17, r = (size - thick) / 2, C = 2 * Math.PI * r;
    var colors = ["#57a6fe", "#9fcbff", "#fed984", "#ffc27a", "#8fd3c0", "#b9c3d2"];
    var offset = 0;
    var arcs = rows.map(function (x, i) {
      var len = (x.v / total) * C;
      var el = '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + colors[i % colors.length] +
        '" stroke-width="' + thick + '" stroke-linecap="round" stroke-dasharray="' + Math.max(0, len - 3) + " " + C + '"' +
        ' stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 ' + size / 2 + " " + size / 2 + ')"></circle>';
      offset += len;
      return el;
    }).join("");
    var legend = rows.map(function (x, i) {
      return '<div class="row"><i style="background:' + colors[i % colors.length] + '"></i><span class="n">' + x.c.name +
        '</span><span class="v">' + Math.round(pct(x.v, total)) + "%</span></div>";
    }).join("");
    return (
      '<div class="donut-wrap"><svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#f2f6fa" stroke-width="' + thick + '"/>' +
      arcs +
      '<text x="50%" y="47%" text-anchor="middle" class="donut-center" style="font-size:17px">' + yuan(total) + "</text>" +
      '<text x="50%" y="60%" text-anchor="middle" style="font-size:9px;fill:#8c99ad">总支出</text>' +
      "</svg><div class=\"donut-legend\">" + legend + "</div></div>"
    );
  }

  function renderCharts() {
    var week = state.range === "week";
    var recs = week ? weekRecs() : spent();
    var total = sumOf(recs);
    var prem = recs.reduce(function (s, r) { return s + (isWant(r) ? r.amount - r.base : 0); }, 0);
    var need = total - prem;

    $("#ch-label").textContent = week ? "本周总支出" : "本月总支出";
    $("#ch-total").textContent = fmt(total);

    var delta;
    if (week) {
      var prev = spent().filter(function (r) { return r.date < "2024-10-07"; });
      var prevAvg = sumOf(prev) / 6;
      delta = prevAvg ? ((total / 7 - prevAvg) / prevAvg) * 100 : null;
    } else {
      var h = B.history;
      var lastV = h[h.length - 1].v, prevV = h[h.length - 2].v;
      delta = prevV ? ((lastV - prevV) / prevV) * 100 : null;
    }
    if (delta == null || !isFinite(delta) || !total) {
      $("#ch-delta").textContent = "—";
      $("#ch-delta").style.color = "#9aa7b8";
    } else {
      var down = delta < 0;
      $("#ch-delta").textContent = (down ? "↓ " : "↑ ") + Math.abs(delta).toFixed(1) + "%";
      $("#ch-delta").style.color = down ? "#3aa269" : "#d98324";
    }
    $("#ch-delta").style.color = down ? "#3aa269" : "#d98324";
    $("#ch-need").style.width = pct(need, total) + "%";
    $("#ch-want").style.width = pct(prem, total) + "%";
    $("#ch-need-pct").textContent = pct(need, total) + "%";
    $("#ch-want-pct").textContent = pct(prem, total) + "%";
    $("#ch-trend").innerHTML = week ? stackedWeek(spent()) : monthLine(B.history);
    $("#ch-donut").innerHTML = donut(recs);

    var top = B.categories.map(function (c) { return { c: c, v: catSpend(c.id) }; })
      .sort(function (a, b) { return b.v - a.v; })[0];
    var topPct = Math.round(pct(top.v, totalSpend()));
    var topPrem = spent().filter(function (r) { return r.cat === top.c.id; })
      .reduce(function (s, r) { return s + (isWant(r) ? r.amount - r.base : 0); }, 0);
    $("#ch-comment").innerHTML = '<div class="nm">平平：</div>' +
      (week ? "本周" + top.c.name + "占了 <b>" + topPct + "%</b>，" : "本月" + top.c.name + "占了 <b>" + topPct + "%，") +
      "伪刚需 <b>" + yuan(topPrem) + "</b>。要不要给它单独设一条「爱好预算」？";
  }

  $$("#chart-seg button").forEach(function (b) {
    b.addEventListener("click", function () {
      state.range = b.getAttribute("data-range");
      $$("#chart-seg button").forEach(function (x) { x.classList.toggle("on", x === b); });
      renderCharts();
    });
  });

  /* ---------------------------------------------------------------- plan */
  function renderPlan() {
    var total = totalSpend();
    $("#plan-rows").innerHTML = B.categories.slice(0, 3).map(function (c) {
      var used = catSpend(c.id);
      var p = pct(used, c.budget);
      return (
        '<div class="budget-row" style="padding:12px 0">' +
        '<img class="cat-icon" src="' + c.icon + '" alt="" />' +
        '<div class="info"><div class="t"><span>' + c.name + "</span><b>" + yuan(used) + "</b></div>" +
        '<div class="s">预算 ' + yuan(c.budget) + " · 占本月 " + Math.round(pct(used, total)) + "%</div>" +
        '<div class="mini-bar"><i class="' + (p > 90 ? "warn" : "") + '" style="width:' + Math.min(100, p) + '%"></i></div>' +
        "</div></div>"
      );
    }).join("");
  }

  /* ---------------------------------------------------------------- add flow */
  function resetAdd() {
    state.add = { cat: "food", amount: "", judge: null, userJudge: false, date: "2024-10-13", account: "微信钱包", keypad: true };
    $("#add-amount").innerHTML = '<span class="u">¥</span>0<span class="caret"></span>';
    $("#add-amount").classList.add("zero");
    $("#add-note").value = "";
    $("#baseline").classList.remove("show");
    $("#add-date").textContent = "10月13日 · 今天";
    $("#add-account").textContent = "微信钱包";
    renderAddCats();
    setKeypad(true);
    document.getElementById("add-pad").scrollTop = 0;
  }

  function setKeypad(open) {
    state.add.keypad = open;
    $("#app").classList.toggle("keypad-open", open);
    $("#keypad").classList.toggle("open", open);
    if (!open) {
      var pad = $("#add-pad");
      pad.scrollTop = pad.scrollHeight;
    }
  }

  function renderAddCats() {
    $("#add-cats").innerHTML = B.categories.map(function (c) {
      return (
        '<button class="add-cat ' + (c.id === state.add.cat ? "on" : "") + '" data-cat="' + c.id + '">' +
        '<img src="' + c.icon + '" alt="" /><span>' + c.name + "</span></button>"
      );
    }).join("");
  }

  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-cat]");
    if (c) {
      state.add.cat = c.getAttribute("data-cat");
      renderAddCats();
      updateBaseline();
    }
    var k = e.target.closest("[data-k]");
    if (k) keypad(k.getAttribute("data-k"));
    var j = e.target.closest("#baseline [data-judge]");
    if (j) {
      state.add.judge = j.getAttribute("data-judge");
      state.add.userJudge = true;
      $$("#baseline [data-judge]").forEach(function (b) { b.classList.toggle("on", b === j); });
    }
    if (e.target.closest("#amount-line")) {
      if (!state.add.keypad) setKeypad(true);
    }
    var pick = e.target.closest("[data-pick]");
    if (pick) openPicker(pick.getAttribute("data-pick"));
  });

  var BASE = { food: 13, daily: 26, travel: 9, shopping: 45, fun: 30, leisure: 25, medical: 40, study: 35 };

  function keypad(key) {
    var a = state.add.amount;
    if (key === "del") a = a.slice(0, -1);
    else if (key === ".") { if (a.indexOf(".") === -1) a = (a || "0") + "."; }
    else {
      if (a.indexOf(".") > -1 && a.split(".")[1].length >= 2) return;
      if (a.replace(".", "").length >= 6) return;
      a = a === "0" ? key : a + key;
    }
    state.add.amount = a;
    var val = parseFloat(a || "0");
    $("#add-amount").innerHTML = '<span class="u">¥</span>' + (a || "0") + '<span class="caret"></span>';
    $("#add-amount").classList.toggle("zero", !val);
    updateBaseline();
  }

  function updateBaseline() {
    var val = parseFloat(state.add.amount || "0");
    var base = BASE[state.add.cat] || 0;
    var card = $("#baseline");
    if (!val) { card.classList.remove("show"); return; }
    card.classList.add("show");
    var gap = Math.max(0, val - base);
    $("#bl-base").textContent = yuan(base);
    $("#bl-gap").textContent = yuan(gap);
    var auto = gap > 0 ? "want" : "need";
    if (!state.add.userJudge) state.add.judge = auto;
    $$("#baseline [data-judge]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-judge") === state.add.judge);
    });
  }

  /* ---------------------------------------------------------------- pickers */
  var DATES = [
    ["2024-10-13", "10月13日 · 今天"],
    ["2024-10-12", "10月12日 · 昨天"],
    ["2024-10-11", "10月11日 · 前天"],
    ["2024-10-10", "10月10日"]
  ];
  var ACCOUNTS = ["微信钱包", "支付宝", "银行卡", "现金"];

  function openPicker(kind) {
    var sheet = $("#sheet");
    if (kind === "date") {
      sheet.innerHTML =
        '<div class="grab"></div><h4>选择日期</h4>' +
        '<div class="pick-list">' +
        DATES.map(function (d) {
          return '<button class="pick-item ' + (state.add.date === d[0] ? "on" : "") + '" data-set-date="' + d[0] +
            '"><span>' + d[1] + "</span>" + (state.add.date === d[0] ? '<svg><use href="#i-check" /></svg>' : "") + "</button>";
        }).join("") +
        "</div>";
      openSheet();
      $$("[data-set-date]", sheet).forEach(function (b) {
        b.addEventListener("click", function () {
          state.add.date = b.getAttribute("data-set-date");
          var hit = DATES.filter(function (d) { return d[0] === state.add.date; })[0];
          $("#add-date").textContent = hit ? hit[1] : mmdd(state.add.date);
          closeSheet();
        });
      });
    } else {
      sheet.innerHTML =
        '<div class="grab"></div><h4>选择账户</h4>' +
        '<div class="pick-list">' +
        ACCOUNTS.map(function (a) {
          return '<button class="pick-item ' + (state.add.account === a ? "on" : "") + '" data-set-acc="' + a +
            '"><span>' + a + "</span>" + (state.add.account === a ? '<svg><use href="#i-check" /></svg>' : "") + "</button>";
        }).join("") +
        "</div>";
      openSheet();
      $$("[data-set-acc]", sheet).forEach(function (b) {
        b.addEventListener("click", function () {
          state.add.account = b.getAttribute("data-set-acc");
          $("#add-account").textContent = state.add.account;
          closeSheet();
        });
      });
    }
  }

  function saveRecord() {
    var val = parseFloat(state.add.amount || "0");
    if (!val) {
      toast("先输入金额吧～");
      setKeypad(true);
      return;
    }
    var base = BASE[state.add.cat] || 0;
    var rec = {
      id: "u" + Date.now(),
      date: state.add.date,
      time: "14:32",
      cat: state.add.cat,
      title: $("#add-note").value || (catById(state.add.cat).name + "支出"),
      place: catById(state.add.cat).name + " · " + state.add.account,
      amount: val,
      base: Math.min(base, val),
      judged: state.add.judge === "need" ? "need" : null
    };
    B.records.unshift(rec);
    persist();
    mascotCheer(isWant(rec) ? "记下啦，这笔算爱好" : "记下啦！");
    toast("已记下这笔 " + yuan(val) + " · " + (isWant(rec) ? "计入伪刚需" : "刚需"));
    show("home", { replace: true });
  }

  /* ---------------------------------------------------------------- AI chat */
  var chatReady = false;
  var chatHistory = [];
  var lastReply = "";
  var LLM = { ready: false, model: "" };

  function ensureChat() {
    if (chatReady) return;
    chatReady = true;
    probeLLM();
    if (!spent().length) {
      // 空账本（体验版默认就是这个状态）
      addMsg("ai", "嗨，我是平平～<br />你还没有记过账，账本干干净净的。<br />要不要先记一笔试试？");
      addMsg("ai", "记完我就能告诉你：这个月花在哪、刚需和伪刚需各占多少。<br />点下面的 ＋ 就能开始。");
      return;
    }
    addMsg("ai", "嗨，我是平平～<br />今天你花了 <b>" + yuan(sumOf(todayRecs())) + "</b>，主要是餐饮和出行。<br />想先聊哪一块？");
    var top = B.categories.map(function (c) { return { c: c, v: catSpend(c.id) }; })
      .sort(function (a, b) { return b.v - a.v; })[0];
    addMsg("ai", "本月 <b>" + top.c.name + "</b> 花得最多（" + yuan(top.v) + "，" +
      Math.round(pct(top.v, totalSpend())) + "%），其中伪刚需 <b>" + yuan(totalPremium()) +
      "</b>。<br />要不要我帮你看看到底是哪几笔？");
  }

  function nowTime() {
    var d = new Date();
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function formatReply(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\n/g, "<br />");
  }

  function addMsg(who, html) {
    var el = document.createElement("div");
    el.className = "msg " + (who === "me" ? "me" : "");
    el.innerHTML =
      (who === "ai" ? '<div class="ava"><img src="avatar-flat.png" alt=""></div>' : "") +
      '<div class="col"><div class="bubble">' + html + '</div><div class="msg-time">' + nowTime() + "</div></div>";
    $("#chat-scroll").appendChild(el);
    $("#chat-scroll").scrollTop = $("#chat-scroll").scrollHeight;
  }

  function showTyping() {
    var el = document.createElement("div");
    el.className = "msg";
    el.innerHTML = '<div class="ava"><img src="avatar-flat.png" alt=""></div>' +
      '<div class="col"><div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div></div>';
    $("#chat-scroll").appendChild(el);
    $("#chat-scroll").scrollTop = $("#chat-scroll").scrollHeight;
    return el;
  }

  function setAIStatus(mode, label) {
    var el = $("#ai-status");
    if (!el) return;
    el.textContent = "平平 · " + label;
    el.className = mode === "ok" ? "ok" : "warn";
  }

  function probeLLM() {
    if (location.protocol === "file:") {
      setAIStatus("local", "本地回复");
      return;
    }
    fetch("/api/health")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        LLM.ready = !!(d && d.ok);
        LLM.model = (d && d.model) || "";
        setAIStatus(LLM.ready ? "ok" : "local", LLM.ready ? LLM.model || "在线" : "本地回复");
      })
      .catch(function () { setAIStatus("local", "本地回复"); });
  }

  function callLLM(messages) {
    return new Promise(function (resolve, reject) {
      if (location.protocol === "file:") return reject(new Error("file:// 需要通过本地服务打开"));
      var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 30000);
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages }),
        signal: ctrl ? ctrl.signal : undefined
      })
        .then(function (r) {
          clearTimeout(timer);
          if (!r.ok) throw new Error("http " + r.status);
          return r.json();
        })
        .then(function (d) {
          if (d && d.reply) resolve(d.reply);
          else reject(new Error(d && d.error ? d.error : "empty"));
        })
        .catch(function (e) { clearTimeout(timer); reject(e); });
    });
  }

  function systemPrompt() {
    var total = totalSpend();
    var prem = totalPremium();
    return [
      "你是「平平」，一只企鹅，是记账 App「基线 Basely」里的 AI 记账助手。",
      "性格平和、温暖、不评判、有点小幽默。中文口语，一次只说 1–3 句，不要列表、不要 markdown 标题。",
      "核心原则：只呈现事实，绝不指责用户乱花钱；这笔钱算生活还是算爱好，判断权永远在用户。",
      "用户数据：本月总支出 ¥" + total + "，刚需 ¥" + (total - prem) + "，伪刚需 ¥" + prem + "（占 " + pct(prem, total) + "%）。",
      "分类：餐饮 ¥" + catSpend("food") + "，日用 ¥" + catSpend("daily") + "，出行 ¥" + catSpend("travel") + "。",
      "心愿：" + activeWish().title + "，目标 ¥" + activeWish().target + "，已存 ¥" + wishSaved(state.activeWish) + "。",
      "回答时优先引用上面这些真实数字。如果用户聊别的，也可以简短回应，再自然地把话题带回记账。"
    ].join("\n");
  }

  var FALLBACKS = [
    "我在听～ 你可以问我「这个月钱花哪了」「餐饮涨了吗」，或者直接说一件今天花钱的事。",
    "嗯，我记下了。想让我从哪个角度看看？总支出、餐饮溢价，还是心愿进度？",
    "这个我可以陪你聊。不过我更好奇：今天有什么想记下来的花销吗？"
  ];

  function pick(list) {
    var l = list.filter(function (x) { return x !== lastReply; });
    var s = (l.length ? l : list)[Math.floor(Math.random() * (l.length ? l.length : list.length))];
    lastReply = s;
    return s;
  }

  function localReply(q) {
    var total = totalSpend();
    var prem = totalPremium();
    var food = catSpend("food");
    var foodPrem = spent().filter(function (r) { return r.cat === "food"; })
      .reduce(function (s, r) { return s + (isWant(r) ? r.amount - r.base : 0); }, 0);
    var saved = wishSaved(state.activeWish);

    if (/^(你好|您好|hi|hello|嗨|在吗|平平|哈喽|早|晚上好)/i.test(q)) {
      return pick([
        "嗨，我在的～ 今天花了 " + yuan(sumOf(todayRecs())) + "，要不要一起看看钱都去哪儿了？",
        "你好呀！我正守着你的账单。想先听哪一块：餐饮、这周趋势，还是心愿进度？"
      ]);
    }
    if (/你是谁|叫什么|介绍|你能|会什么|帮助|怎么用/.test(q)) {
      return pick([
        "我是平平，一只帮你记账的企鹅。你负责判断这笔钱姓生活还是姓爱好，我负责算差额、盯预算。",
        "我做的事很具体：把每笔支出和你的基线比一比，告诉你溢价多少；剩下的判断，都归你。"
      ]);
    }
    if (/预算|分配|设个|设置/.test(q)) {
      return "可以这样分：刚需先锁死 —— 餐饮 40%、交通 20%；剩下的 40% 留给购物和娱乐。超了只提示、不拦截，随时能改。";
    }
    if (/心愿|存钱|相机|首付|存一|攒/.test(q)) {
      var left = Math.max(0, activeWish().target - saved);
      return "「" + activeWish().title + "」已经存了 <b>" + yuan(saved) + "</b>，还差 <b>" + yuan(left) +
        "</b>。<br />按每月省下 " + yuan(prem) + " 的速度，大约 " + Math.ceil(left / Math.max(prem, 1)) + " 个月就能到。";
    }
    if (/餐饮|吃|外卖|咖啡|饭|奶茶/.test(q)) {
      return "本月餐饮 <b>" + yuan(food) + "</b>，其中 <b>" + yuan(foodPrem) + "</b> 在基线以上（" +
        Math.round(pct(foodPrem, food)) + "%）。<br />不是说你花错了 —— 只是这些钱，值得你自己认账。";
    }
    if (/这周|本周|趋势|分析|统计/.test(q)) {
      return "本周花了 <b>" + yuan(sumOf(weekRecs())) + "</b>，伪刚需 <b>" + yuan(prem) +
        "</b>，主要来自两次打车和一次火锅。刚需那部分很稳，不用省。";
    }
    if (/刚需|伪刚需|基线|改判|归属/.test(q)) {
      return "分界线以下叫刚需 —— 单价和频次长期稳定；以上是伪刚需，也就是被爱好重新定价的那部分。<br />同一笔钱算哪边，你说了算，随时能改判。";
    }
    if (/谢谢|感谢|辛苦|好的|嗯|哈哈/.test(q)) {
      return pick(["不客气～ 记账这件事，慢一点也没关系。", "嘿，能帮上就好。记得对自己宽容一点。"]);
    }
    return pick(FALLBACKS);
  }

  function sendChat(text) {
    text = (text || "").trim();
    if (!text) return;
    addMsg("me", esc(text));
    $("#chat-text").value = "";
    chatHistory.push({ role: "user", content: text });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);

    var typing = showTyping();
    var messages = [{ role: "system", content: systemPrompt() }].concat(chatHistory.slice(-8));

    callLLM(messages)
      .then(function (reply) {
        typing.remove();
        var clean = String(reply).trim();
        chatHistory.push({ role: "assistant", content: clean });
        addMsg("ai", formatReply(clean));
        setAIStatus("ok", LLM.model || "在线");
      })
      .catch(function () {
        setTimeout(function () {
          typing.remove();
          var reply = localReply(text);
          chatHistory.push({ role: "assistant", content: reply });
          addMsg("ai", reply);
          setAIStatus("local", "本地回复");
        }, 420);
      });
  }

  $("#chat-send").addEventListener("click", function () { sendChat($("#chat-text").value); });
  $("#chat-text").addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendChat(this.value);
  });
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-say]");
    if (c) { show("ai"); sendChat(c.getAttribute("data-say")); }
  });

  /* ---------------------------------------------------------------- budget sliders */
  $$("[data-slider]").forEach(function (s) {
    s.addEventListener("input", function () {
      var k = s.getAttribute("data-slider");
      state.budget.cats[k] = +s.value;
      var money = Math.round((+s.value / 100) * state.budget.month);
      $('[data-pct="' + k + '"]').textContent = s.value + "%";
      $('[data-money="' + k + '"]').textContent = yuan(money);
      var needSum = Math.round(((state.budget.cats.food + state.budget.cats.travel) / 100) * state.budget.month);
      var wantSum = Math.round(((state.budget.cats.shopping + state.budget.cats.fun) / 100) * state.budget.month);
      $("#bg-need-sum").textContent = yuan(needSum) + " / " + yuan(state.budget.month);
      $("#bg-want-sum").textContent = yuan(wantSum) + " / " + yuan(state.budget.month);
      persist();
    });
  });

  /* ---------------------------------------------------------------- wish */
  function activeWish() {
    return state.wishes.filter(function (w) { return w.id === state.activeWish; })[0] || state.wishes[0] || null;
  }

  function wishSaved(id) {
    var w = state.wishes.filter(function (x) { return x.id === id; })[0];
    if (!w) return 0;
    return w.base + state.savings
      .filter(function (s) { return s.wishId === id; })
      .reduce(function (a, b) { return a + b.amount; }, 0);
  }

  function setBottleLevel(p) {
    if (!$("#star-rect")) return;
    var level = 244 - (172 * p) / 100;
    $("#star-rect").style.transform = "translateY(" + level.toFixed(1) + "px)";
    if ($("#star-surface")) {
      $("#star-surface").style.transform = "translateY(" + (level - 4).toFixed(1) + "px)";
    }
  }

  function renderWish() {
    var w = activeWish();
    var card = document.querySelector(".jar-card");

    // 还没有心愿：瓶子留着做展示，输入区收起
    if (!w) {
      if (card) card.classList.add("no-wish");
      if ($("#wish-title")) $("#wish-title").textContent = "还没有心愿";
      if ($("#wish-target")) $("#wish-target").textContent = "¥0";
      if ($("#wish-saved")) $("#wish-saved").textContent = "¥0";
      if ($("#wish-left")) $("#wish-left").textContent = "¥0";
      if ($("#star-pct")) $("#star-pct").textContent = "0%";
      if ($("#star-sub")) $("#star-sub").textContent = "还没开始";
      var editBtn = $(".wish-edit");
      if (editBtn) editBtn.style.display = "none";
      setBottleLevel(0);
      renderWishList();
      renderWishLog();
      renderWishCard();
      return;
    }

    if (card) card.classList.remove("no-wish");
    var editBtn2 = $(".wish-edit");
    if (editBtn2) editBtn2.style.display = "";

    var saved = wishSaved(w.id);
    var target = w.target;
    var p = Math.max(0, Math.min(100, Math.round((saved / target) * 100)));

    if ($("#wish-title")) $("#wish-title").textContent = w.title;
    if ($("#wish-target")) $("#wish-target").textContent = yuan(target);
    if ($("#wish-saved")) $("#wish-saved").textContent = yuan(saved);
    if ($("#wish-left")) $("#wish-left").textContent = yuan(Math.max(0, target - saved));
    if ($("#star-pct")) $("#star-pct").textContent = p + "%";
    if ($("#star-sub")) $("#star-sub").textContent = "已存 " + yuan(saved);
    setBottleLevel(p);

    renderWishList();
    renderWishLog();
    renderWishCard();
  }

  var WISH_ICONS = ["#i-target", "#i-gift", "#i-heart"];
  var editingWishId = null;

  /* 心愿的创建 / 编辑 / 删除 */
  function openWishEditor(id) {
    var w = id ? state.wishes.filter(function (x) { return x.id === id; })[0] : null;
    editingWishId = w ? w.id : null;
    $("#sheet").innerHTML =
      '<div class="grab"></div>' +
      "<h4>" + (w ? "编辑心愿" : "写下第一个心愿") + "</h4>" +
      '<div class="wish-form">' +
      '<label>心愿名称<input id="wf-title" maxlength="16" placeholder="比如：换一台相机" value="' + esc(w ? w.title : "") + '" /></label>' +
      '<label>目标金额<input id="wf-target" type="number" inputmode="decimal" min="1" placeholder="比如：8000" value="' + (w ? w.target : "") + '" /></label>' +
      '<label>期限<input id="wf-deadline" maxlength="12" placeholder="比如：今年底" value="' + esc(w ? w.deadline : "") + '" /></label>' +
      "</div>" +
      '<div class="wish-form-actions">' +
      (w ? '<button class="wf-del" data-act="wish-wf-del">删除</button>' : "") +
      '<button class="wf-save" data-act="wish-wf-save">' + (w ? "保存" : "创建心愿") + "</button>" +
      "</div>";
    openSheet();
    setTimeout(function () { var t = $("#wf-title"); if (t) t.focus(); }, 240);
  }

  function saveWishForm() {
    var title = (($("#wf-title") || {}).value || "").trim();
    var target = Math.round(Number((($("#wf-target") || {}).value || "0")));
    var deadline = (($("#wf-deadline") || {}).value || "").trim() || "未设期限";
    if (!title) { toast("给心愿起个名字吧"); if ($("#wf-title")) $("#wf-title").focus(); return; }
    if (!target || target <= 0) { toast("填一个目标金额"); if ($("#wf-target")) $("#wf-target").focus(); return; }

    var created = false;
    if (editingWishId) {
      var w = state.wishes.filter(function (x) { return x.id === editingWishId; })[0];
      if (w) { w.title = title; w.target = target; w.deadline = deadline; }
      toast("心愿已更新");
    } else {
      var id = "w" + Date.now();
      state.wishes.push({ id: id, title: title, target: target, base: 0, deadline: deadline });
      state.activeWish = id;
      created = true;
      toast("心愿已创建 · " + title);
    }
    persist();
    closeSheet();
    renderWish();
    renderHome();
    if (created) mascotSay("新心愿记下啦，慢慢存就好", 2400);
  }

  function deleteWish() {
    if (!editingWishId) return;
    state.wishes = state.wishes.filter(function (x) { return x.id !== editingWishId; });
    state.savings = state.savings.filter(function (s) { return s.wishId !== editingWishId; });
    if (state.activeWish === editingWishId) {
      state.activeWish = state.wishes[0] ? state.wishes[0].id : null;
    }
    editingWishId = null;
    persist();
    closeSheet();
    renderWish();
    renderHome();
    toast("心愿已删除");
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest('[data-act="wish-new"]')) { openWishEditor(null); return; }
    if (e.target.closest('[data-act="wish-edit"]')) {
      var w = activeWish();
      if (w) openWishEditor(w.id);
      return;
    }
    if (e.target.closest('[data-act="wish-wf-save"]')) { saveWishForm(); return; }
    if (e.target.closest('[data-act="wish-wf-del"]')) { deleteWish(); return; }
  });

  function renderWishList() {
    var box = $("#wish-list");
    if (!box) return;
    if (!state.wishes.length) {
      box.innerHTML =
        '<div class="wish-empty">' +
        '<img class="we-img" src="pos-idle-note.webp" alt="" />' +
        '<div class="we-t">还没有心愿</div>' +
        '<p class="we-d">开始写下你的第一个心愿吧~</p>' +
        '<button class="we-btn" data-act="wish-new">写下第一个心愿</button>' +
        "</div>";
      return;
    }
    box.innerHTML = state.wishes.map(function (w, i) {
      var saved = wishSaved(w.id);
      var p = Math.max(0, Math.min(100, Math.round((saved / w.target) * 100)));
      var on = w.id === state.activeWish;
      return '<button class="wish-row' + (on ? " on" : "") + '" data-wish="' + w.id + '">' +
        '<span class="wi-ic t' + (i % 3) + '"><svg><use href="' + WISH_ICONS[i % 3] + '" /></svg></span>' +
        '<span class="wi-body">' +
        '<span class="wi-t">' + w.title + (on ? '<i class="wi-badge">当前</i>' : "") + "</span>" +
        '<span class="wi-s">' + w.deadline + " · 已存 " + yuan(saved) + " / " + yuan(w.target) + "</span>" +
        '<span class="wi-bar"><i style="width:' + p + '%"></i></span>' +
        "</span>" +
        '<span class="wi-pct">' + p + "%</span>" +
        "</button>";
    }).join("");
  }

  function renderWishLog() {
    var box = $("#wish-log");
    if (!box) return;
    var head = box.previousElementSibling;
    if (head && head.classList.contains("sec-head")) {
      head.style.display = state.savings.length ? "" : "none";
      box.style.display = state.savings.length ? "" : "none";
    }
    var list = state.savings.slice().reverse().slice(0, 6);
    var count = $("#wish-count");
    if (count) count.textContent = "共 " + state.savings.length + " 笔";
    if (!list.length) {
      box.innerHTML = '<div class="wish-empty">还没有存入记录，存第一笔试试</div>';
      return;
    }
    box.innerHTML = list.map(function (x) {
      var d = new Date(x.ts);
      var when = (d.getMonth() + 1) + "月" + d.getDate() + "日 " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
      var out = x.amount < 0;
      var wish = state.wishes.filter(function (w) { return w.id === x.wishId; })[0];
      return '<div class="wish-log-row">' +
        '<span class="ic' + (out ? " out" : "") + '"><svg><use href="#i-' + (out ? "arrow-up" : "coin") + '" /></svg></span>' +
        '<span class="t">' + (out ? "取出" : "存入") + " · " + esc(wish ? wish.title : "心愿") +
        "<small>" + when + "</small></span>" +
        '<span class="amt' + (out ? " out" : "") + '">' + (out ? "-" : "+") + yuan(Math.abs(x.amount)) + "</span>" +
        "</div>";
    }).join("");
  }

  function addSaving(amount) {
    amount = Math.round(Number(amount) * 100) / 100;
    if (!amount || amount <= 0) return false;
    var w = activeWish();
    if (!w) { toast("先写下一个心愿吧~"); return false; }
    var left = w.target - wishSaved(w.id);
    if (left <= 0) {
      toast("「" + w.title + "」已经满了，换一个心愿吧");
      return false;
    }
    if (amount > left) {
      toast("只差 " + yuan(left) + " 就满了，先存这么多");
      amount = left;
    }
    state.savings.push({ id: "s" + Date.now(), ts: Date.now(), amount: amount, wishId: w.id });
    persist();
    renderWish();
    mascotCheer("又近了一点");
    toast("已存入 " + yuan(amount) + " · " + w.title + " " + Math.round((wishSaved(w.id) / w.target) * 100) + "%");
    return true;
  }

  function withdrawSaving(amount) {
    var w = activeWish();
    if (!w) { toast("还没有心愿可以取"); return false; }
    var saved = wishSaved(w.id) - w.base;
    amount = Math.min(amount, Math.max(0, saved));
    if (!amount || amount <= 0) {
      toast("这个心愿还没有可取的存入");
      return false;
    }
    state.savings.push({ id: "s" + Date.now(), ts: Date.now(), amount: -amount, wishId: w.id });
    persist();
    renderWish();
    mascotSay("取出来也没关系，需要的时候就要用", 2600);
    toast("已取出 " + yuan(amount));
    return true;
  }

  function openWithdraw() {
    var w = activeWish();
    if (!w) { toast("还没有心愿可取出"); return; }
    var canOut = Math.max(0, wishSaved(w.id) - w.base);
    var sheet = $("#sheet");
    sheet.innerHTML =
      '<div class="grab"></div><h4>取出金额 · ' + esc(w.title) + "</h4>" +
      '<div class="pick-list">' +
      [100, 500, 1000].filter(function (n) { return n <= canOut; }).map(function (n) {
        return '<button class="pick-item" data-wd="' + n + '"><span>取出 ¥' + fmt(n) + "</span></button>";
      }).join("") +
      (canOut > 0 ? '<button class="pick-item" data-wd="' + canOut + '"><span>全部取出（' + yuan(canOut) + "）</span></button>" : "") +
      (canOut > 0 ? "" : '<div class="wish-empty">这个心愿还没有可取的存入</div>') +
      "</div>";
    openSheet();
    $$("[data-wd]", sheet).forEach(function (b) {
      b.addEventListener("click", function () {
        withdrawSaving(+b.getAttribute("data-wd"));
        closeSheet();
      });
    });
  }

  document.addEventListener("click", function (e) {
    var row = e.target.closest("[data-wish]");
    if (row) {
      state.activeWish = row.getAttribute("data-wish");
      persist();
      renderWish();
      var w = activeWish();
      mascotSay("换成「" + w.title + "」啦", 1800);
      return;
    }
    var q = e.target.closest("[data-wish-quick]");
    if (q) {
      var input = $("#wish-amount");
      var typed = input ? parseFloat(input.value || "0") : 0;
      addSaving((typed || 0) + (+q.getAttribute("data-wish-quick")));
      if (input) input.value = "";
      return;
    }
    if (e.target.closest('[data-act="wish-save"]')) {
      var v = parseFloat(($("#wish-amount") || {}).value || "0");
      if (!v) { if ($("#wish-amount")) $("#wish-amount").focus(); toast("先输入要存的金额"); return; }
      if (addSaving(v) && $("#wish-amount")) $("#wish-amount").value = "";
      return;
    }
    if (e.target.closest('[data-act="wish-withdraw"]')) { openWithdraw(); return; }
  });

  /* ---------------------------------------------------------------- misc */
  document.addEventListener("click", function (e) {
    var sw = e.target.closest("[data-toggle]");
    if (sw) {
      sw.classList.toggle("on");
      toast(sw.classList.contains("on") ? "通知已开启" : "通知已关闭");
    }
    if (e.target.closest("#mascot")) {
      var m = $("#mascot");
      m.classList.add("pop");
      setTimeout(function () { m.classList.remove("pop"); }, 420);
      if (state.view === "ai") {
        $("#chat-text").focus();
        mascotSay("我在听～", 1800);
      } else {
        mascotSay("来啦～", 1200);
        setTimeout(function () { show("ai"); }, 220);
      }
    }
  });

  (function greet() {
    var h = new Date().getHours();
    var text = h < 6 ? "夜深了，今天的账记完了吗？" : h < 11 ? "早上好！今天也要好好记账呀～" : h < 14 ? "中午好！吃完饭记得记一笔～" : h < 19 ? "下午好！今天的钱花得还顺心吗？" : "晚上好！睡前把今天的花销理一理～";
    if (STILL) text = "早上好！今天也要好好记账呀～";
    var el = $("#greet-text");
    if (el) el.textContent = text;
  })();

  /* ---------------------------------------------------------------- 桌面适配 */
  var fitMode = "fit";
  var FORCE_ONE = /[?&]zoom=1/.test(location.search);
  function applyFit() {
    var stage = document.querySelector("#stage") || document.querySelector(".stage");
    var btn = $("#fit-btn");
    if (!stage) return;
    if (FORCE_ONE || window.innerWidth <= 560) {
      stage.style.transform = "";
      if (btn) btn.style.display = "none";
      return;
    }
    if (btn) btn.style.display = "";
    var s = 1;
    if (fitMode === "fit") {
      s = Math.min(0.9, (window.innerHeight - 40) / stage.offsetHeight, (window.innerWidth - 40) / stage.offsetWidth);
      s = Math.max(0.55, s);
    }
    stage.style.transform = "scale(" + s.toFixed(3) + ")";
    document.body.classList.toggle("zoom-one", fitMode === "one");
    if (btn) btn.textContent = fitMode === "fit" ? "100% 大小" : "适应窗口";
  }
  if ($("#fit-btn")) {
    $("#fit-btn").addEventListener("click", function () {
      fitMode = fitMode === "fit" ? "one" : "fit";
      applyFit();
    });
  }
  function scheduleFit() {
    clearTimeout(window.__fitT);
    window.__fitT = setTimeout(applyFit, 120);
  }
  window.addEventListener("resize", scheduleFit);
  window.addEventListener("load", function () {
    applyFit();
    setTimeout(applyFit, 200);
    setTimeout(applyFit, 900);
  });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", scheduleFit);
  // 字体、图片加载完成后布局可能变化，再兜底几次
  setTimeout(applyFit, 400);
  setTimeout(applyFit, 1500);

  /* ---------------------------------------------------------------- boot */
  loadSaved();
  if (!restored) B.records.forEach(function (r) { if (r.amount > r.base) r.judged = null; });
  // 体验版首次进入：清空示例数据，只留下空状态
  if (DEMO && !restored) {
    B.records.length = 0;
    state.savings = [];
    state.wishes = [];
    state.activeWish = null;
  }
  renderHome();
  renderWish();
  applyFit();
  var initial = (location.hash || "#home").slice(1);
  show(NAMES[initial] ? initial : "home", { replace: true });

  // 截图 / 演示钩子：app.html?demo=1#add 预填一笔 ¥32 的咖啡
  if (initial === "add" && /demo/.test(location.search)) {
    keypad("3");
    keypad("2");
    $("#add-note").value = "下午的咖啡";
    if (/closed/.test(location.search)) setKeypad(false);
  }

  window.__basely = { show: show, state: state, setKeypad: setKeypad };
})();
