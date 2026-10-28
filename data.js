/* Basely · 数据层（模拟数据，与设计稿口径一致）
   月度：餐饮 1000 / 日用 600 / 出行 400，合计 2000
   溢价：330 / 96 / 80，合计 506 = 25.3%  */
window.BASELY = (function () {
  var categories = [
    { id: "food", name: "餐饮", icon: "cat-food.png", amount: 1000, budget: 1200, tone: "blue" },
    { id: "daily", name: "日用", icon: "cat-home.png", amount: 600, budget: 700, tone: "blue" },
    { id: "travel", name: "出行", icon: "cat-transport.png", amount: 400, budget: 500, tone: "blue" },
    { id: "shopping", name: "购物", icon: "cat-shopping.png", amount: 0, budget: 300, tone: "yellow" },
    { id: "fun", name: "娱乐", icon: "cat-fun.png", amount: 0, budget: 300, tone: "yellow" },
    { id: "leisure", name: "休闲", icon: "cat-other.png", amount: 0, budget: 200, tone: "yellow" },
    { id: "medical", name: "医疗", icon: "cat-medical.png", amount: 0, budget: 200, tone: "blue" },
    { id: "study", name: "学习", icon: "cat-study.png", amount: 0, budget: 200, tone: "blue" }
  ];

  var records = [
  {
    "id": "r50",
    "date": "2024-10-13",
    "time": "18:49",
    "cat": "food",
    "title": "便利店饭团",
    "place": "餐饮 · 便利店",
    "amount": 13,
    "base": 13
  },
  {
    "id": "r88",
    "date": "2024-10-13",
    "time": "18:33",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r1",
    "date": "2024-10-13",
    "time": "14:32",
    "cat": "food",
    "title": "瑞幸咖啡",
    "place": "餐饮 · 咖啡",
    "amount": 32,
    "base": 13
  },
  {
    "id": "r8",
    "date": "2024-10-13",
    "time": "12:40",
    "cat": "daily",
    "title": "蓝瓶便利店",
    "place": "日用 · 便利店",
    "amount": 45,
    "base": 26
  },
  {
    "id": "r49",
    "date": "2024-10-13",
    "time": "12:16",
    "cat": "food",
    "title": "自选窗口",
    "place": "餐饮 · 食堂",
    "amount": 15,
    "base": 15
  },
  {
    "id": "r12",
    "date": "2024-10-13",
    "time": "08:30",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 15,
    "base": 6
  },
  {
    "id": "r87",
    "date": "2024-10-13",
    "time": "08:13",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r48",
    "date": "2024-10-13",
    "time": "07:50",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 8,
    "base": 8
  },
  {
    "id": "r60",
    "date": "2024-10-12",
    "time": "20:10",
    "cat": "daily",
    "title": "超市采购",
    "place": "日用 · 超市",
    "amount": 71,
    "base": 71
  },
  {
    "id": "r2",
    "date": "2024-10-12",
    "time": "19:21",
    "cat": "food",
    "title": "外卖 · 海底捞",
    "place": "餐饮 · 外卖",
    "amount": 134,
    "base": 45
  },
  {
    "id": "r86",
    "date": "2024-10-12",
    "time": "18:37",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r9",
    "date": "2024-10-12",
    "time": "16:15",
    "cat": "daily",
    "title": "超市采购",
    "place": "日用 · 超市",
    "amount": 78,
    "base": 45
  },
  {
    "id": "r94",
    "date": "2024-10-12",
    "time": "12:25",
    "cat": "travel",
    "title": "公交出行",
    "place": "出行 · 通勤",
    "amount": 4,
    "base": 4
  },
  {
    "id": "r47",
    "date": "2024-10-12",
    "time": "12:11",
    "cat": "food",
    "title": "食堂午餐",
    "place": "餐饮 · 食堂",
    "amount": 16,
    "base": 16
  },
  {
    "id": "r62",
    "date": "2024-10-12",
    "time": "10:15",
    "cat": "daily",
    "title": "收纳盒",
    "place": "日用 · 家居",
    "amount": 29,
    "base": 29
  },
  {
    "id": "r85",
    "date": "2024-10-12",
    "time": "08:19",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r46",
    "date": "2024-10-12",
    "time": "07:51",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 8,
    "base": 8
  },
  {
    "id": "r45",
    "date": "2024-10-11",
    "time": "18:48",
    "cat": "food",
    "title": "食堂晚餐",
    "place": "餐饮 · 食堂",
    "amount": 13,
    "base": 13
  },
  {
    "id": "r84",
    "date": "2024-10-11",
    "time": "18:30",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r99",
    "date": "2024-10-11",
    "time": "16:14",
    "cat": "travel",
    "title": "共享单车",
    "place": "出行 · 骑行",
    "amount": 2,
    "base": 2
  },
  {
    "id": "r59",
    "date": "2024-10-11",
    "time": "15:45",
    "cat": "daily",
    "title": "洗护补充装",
    "place": "日用 · 个护",
    "amount": 46,
    "base": 46
  },
  {
    "id": "r3",
    "date": "2024-10-11",
    "time": "12:40",
    "cat": "food",
    "title": "午餐 · 日料",
    "place": "餐饮 · 堂食",
    "amount": 58,
    "base": 18
  },
  {
    "id": "r44",
    "date": "2024-10-11",
    "time": "12:16",
    "cat": "food",
    "title": "食堂午餐",
    "place": "餐饮 · 食堂",
    "amount": 14,
    "base": 14
  },
  {
    "id": "r13",
    "date": "2024-10-11",
    "time": "09:12",
    "cat": "travel",
    "title": "公交出行",
    "place": "出行 · 通勤",
    "amount": 8,
    "base": 3
  },
  {
    "id": "r83",
    "date": "2024-10-11",
    "time": "08:12",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r43",
    "date": "2024-10-11",
    "time": "07:50",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 8,
    "base": 8
  },
  {
    "id": "r14",
    "date": "2024-10-10",
    "time": "22:10",
    "cat": "travel",
    "title": "打车回家",
    "place": "出行 · 打车",
    "amount": 46,
    "base": 12
  },
  {
    "id": "r4",
    "date": "2024-10-10",
    "time": "20:05",
    "cat": "food",
    "title": "肯德基",
    "place": "餐饮 · 快餐",
    "amount": 49,
    "base": 30
  },
  {
    "id": "r42",
    "date": "2024-10-10",
    "time": "18:43",
    "cat": "food",
    "title": "食堂晚餐",
    "place": "餐饮 · 食堂",
    "amount": 13,
    "base": 13
  },
  {
    "id": "r82",
    "date": "2024-10-10",
    "time": "18:31",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r58",
    "date": "2024-10-10",
    "time": "18:20",
    "cat": "daily",
    "title": "便利店日用",
    "place": "日用 · 便利店",
    "amount": 26,
    "base": 26
  },
  {
    "id": "r93",
    "date": "2024-10-10",
    "time": "12:25",
    "cat": "travel",
    "title": "公交出行",
    "place": "出行 · 通勤",
    "amount": 4,
    "base": 4
  },
  {
    "id": "r41",
    "date": "2024-10-10",
    "time": "12:11",
    "cat": "food",
    "title": "食堂晚餐",
    "place": "餐饮 · 食堂",
    "amount": 12,
    "base": 12
  },
  {
    "id": "r81",
    "date": "2024-10-10",
    "time": "08:13",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r40",
    "date": "2024-10-10",
    "time": "07:54",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 10,
    "base": 10
  },
  {
    "id": "r80",
    "date": "2024-10-09",
    "time": "18:35",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r98",
    "date": "2024-10-09",
    "time": "16:18",
    "cat": "travel",
    "title": "共享单车",
    "place": "出行 · 骑行",
    "amount": 2,
    "base": 2
  },
  {
    "id": "r5",
    "date": "2024-10-09",
    "time": "15:10",
    "cat": "food",
    "title": "茶颜悦色",
    "place": "餐饮 · 奶茶",
    "amount": 25,
    "base": 13
  },
  {
    "id": "r39",
    "date": "2024-10-09",
    "time": "12:10",
    "cat": "food",
    "title": "食堂午餐",
    "place": "餐饮 · 食堂",
    "amount": 13,
    "base": 13
  },
  {
    "id": "r10",
    "date": "2024-10-09",
    "time": "10:30",
    "cat": "daily",
    "title": "洗发水",
    "place": "日用 · 个护",
    "amount": 89,
    "base": 55
  },
  {
    "id": "r79",
    "date": "2024-10-09",
    "time": "08:16",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r38",
    "date": "2024-10-09",
    "time": "07:57",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 10,
    "base": 10
  },
  {
    "id": "r15",
    "date": "2024-10-08",
    "time": "21:30",
    "cat": "travel",
    "title": "打车 · 雨天",
    "place": "出行 · 打车",
    "amount": 52,
    "base": 20
  },
  {
    "id": "r37",
    "date": "2024-10-08",
    "time": "18:49",
    "cat": "food",
    "title": "自选窗口",
    "place": "餐饮 · 食堂",
    "amount": 18,
    "base": 18
  },
  {
    "id": "r78",
    "date": "2024-10-08",
    "time": "18:36",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r92",
    "date": "2024-10-08",
    "time": "12:22",
    "cat": "travel",
    "title": "公交出行",
    "place": "出行 · 通勤",
    "amount": 4,
    "base": 4
  },
  {
    "id": "r36",
    "date": "2024-10-08",
    "time": "12:18",
    "cat": "food",
    "title": "自选窗口",
    "place": "餐饮 · 食堂",
    "amount": 15,
    "base": 15
  },
  {
    "id": "r57",
    "date": "2024-10-08",
    "time": "09:50",
    "cat": "daily",
    "title": "电池",
    "place": "日用 · 杂货",
    "amount": 12,
    "base": 12
  },
  {
    "id": "r77",
    "date": "2024-10-08",
    "time": "08:14",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r35",
    "date": "2024-10-08",
    "time": "07:51",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r6",
    "date": "2024-10-07",
    "time": "19:30",
    "cat": "food",
    "title": "寿司外卖",
    "place": "餐饮 · 外卖",
    "amount": 68,
    "base": 35
  },
  {
    "id": "r34",
    "date": "2024-10-07",
    "time": "18:45",
    "cat": "food",
    "title": "食堂晚餐",
    "place": "餐饮 · 食堂",
    "amount": 13,
    "base": 13
  },
  {
    "id": "r76",
    "date": "2024-10-07",
    "time": "18:30",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r56",
    "date": "2024-10-07",
    "time": "17:25",
    "cat": "daily",
    "title": "牙刷",
    "place": "日用 · 个护",
    "amount": 13,
    "base": 13
  },
  {
    "id": "r97",
    "date": "2024-10-07",
    "time": "16:12",
    "cat": "travel",
    "title": "共享单车",
    "place": "出行 · 骑行",
    "amount": 2,
    "base": 2
  },
  {
    "id": "r33",
    "date": "2024-10-07",
    "time": "12:12",
    "cat": "food",
    "title": "食堂午餐",
    "place": "餐饮 · 食堂",
    "amount": 14,
    "base": 14
  },
  {
    "id": "r75",
    "date": "2024-10-07",
    "time": "08:10",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r32",
    "date": "2024-10-07",
    "time": "07:51",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 10,
    "base": 10
  },
  {
    "id": "r55",
    "date": "2024-10-06",
    "time": "21:40",
    "cat": "daily",
    "title": "湿巾",
    "place": "日用 · 消耗",
    "amount": 18,
    "base": 18
  },
  {
    "id": "r74",
    "date": "2024-10-06",
    "time": "18:33",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r11",
    "date": "2024-10-06",
    "time": "15:00",
    "cat": "daily",
    "title": "香薰蜡烛",
    "place": "日用 · 家居",
    "amount": 58,
    "base": 48
  },
  {
    "id": "r91",
    "date": "2024-10-06",
    "time": "12:20",
    "cat": "travel",
    "title": "公交出行",
    "place": "出行 · 通勤",
    "amount": 4,
    "base": 4
  },
  {
    "id": "r31",
    "date": "2024-10-06",
    "time": "12:17",
    "cat": "food",
    "title": "食堂午餐",
    "place": "餐饮 · 食堂",
    "amount": 15,
    "base": 15
  },
  {
    "id": "r73",
    "date": "2024-10-06",
    "time": "08:10",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r30",
    "date": "2024-10-06",
    "time": "07:51",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r7",
    "date": "2024-10-05",
    "time": "19:40",
    "cat": "food",
    "title": "火锅 · 聚餐",
    "place": "餐饮 · 聚餐",
    "amount": 198,
    "base": 80
  },
  {
    "id": "r29",
    "date": "2024-10-05",
    "time": "18:46",
    "cat": "food",
    "title": "自选窗口",
    "place": "餐饮 · 食堂",
    "amount": 18,
    "base": 18
  },
  {
    "id": "r72",
    "date": "2024-10-05",
    "time": "18:31",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r96",
    "date": "2024-10-05",
    "time": "16:10",
    "cat": "travel",
    "title": "共享单车",
    "place": "出行 · 骑行",
    "amount": 2,
    "base": 2
  },
  {
    "id": "r28",
    "date": "2024-10-05",
    "time": "12:10",
    "cat": "food",
    "title": "自选窗口",
    "place": "餐饮 · 食堂",
    "amount": 18,
    "base": 18
  },
  {
    "id": "r54",
    "date": "2024-10-05",
    "time": "10:15",
    "cat": "daily",
    "title": "垃圾袋",
    "place": "日用 · 消耗",
    "amount": 15,
    "base": 15
  },
  {
    "id": "r71",
    "date": "2024-10-05",
    "time": "08:16",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r27",
    "date": "2024-10-05",
    "time": "07:54",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r26",
    "date": "2024-10-04",
    "time": "18:49",
    "cat": "food",
    "title": "自选窗口",
    "place": "餐饮 · 食堂",
    "amount": 16,
    "base": 16
  },
  {
    "id": "r70",
    "date": "2024-10-04",
    "time": "18:30",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r61",
    "date": "2024-10-04",
    "time": "16:40",
    "cat": "daily",
    "title": "洗洁精",
    "place": "日用 · 清洁",
    "amount": 22,
    "base": 22
  },
  {
    "id": "r53",
    "date": "2024-10-04",
    "time": "12:30",
    "cat": "daily",
    "title": "牙膏",
    "place": "日用 · 个护",
    "amount": 19,
    "base": 19
  },
  {
    "id": "r90",
    "date": "2024-10-04",
    "time": "12:21",
    "cat": "travel",
    "title": "公交出行",
    "place": "出行 · 通勤",
    "amount": 4,
    "base": 4
  },
  {
    "id": "r25",
    "date": "2024-10-04",
    "time": "12:10",
    "cat": "food",
    "title": "自选窗口",
    "place": "餐饮 · 食堂",
    "amount": 16,
    "base": 16
  },
  {
    "id": "r69",
    "date": "2024-10-04",
    "time": "08:12",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r24",
    "date": "2024-10-04",
    "time": "07:51",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r52",
    "date": "2024-10-03",
    "time": "19:05",
    "cat": "daily",
    "title": "洗衣液",
    "place": "日用 · 清洁",
    "amount": 40,
    "base": 40
  },
  {
    "id": "r68",
    "date": "2024-10-03",
    "time": "18:33",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r95",
    "date": "2024-10-03",
    "time": "16:12",
    "cat": "travel",
    "title": "共享单车",
    "place": "出行 · 骑行",
    "amount": 2,
    "base": 2
  },
  {
    "id": "r23",
    "date": "2024-10-03",
    "time": "12:12",
    "cat": "food",
    "title": "便利店饭团",
    "place": "餐饮 · 便利店",
    "amount": 12,
    "base": 12
  },
  {
    "id": "r67",
    "date": "2024-10-03",
    "time": "08:13",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r22",
    "date": "2024-10-03",
    "time": "07:52",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r21",
    "date": "2024-10-02",
    "time": "18:41",
    "cat": "food",
    "title": "食堂晚餐",
    "place": "餐饮 · 食堂",
    "amount": 13,
    "base": 13
  },
  {
    "id": "r66",
    "date": "2024-10-02",
    "time": "18:34",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r89",
    "date": "2024-10-02",
    "time": "12:29",
    "cat": "travel",
    "title": "公交出行",
    "place": "出行 · 通勤",
    "amount": 4,
    "base": 4
  },
  {
    "id": "r20",
    "date": "2024-10-02",
    "time": "12:14",
    "cat": "food",
    "title": "食堂晚餐",
    "place": "餐饮 · 食堂",
    "amount": 14,
    "base": 14
  },
  {
    "id": "r51",
    "date": "2024-10-02",
    "time": "11:20",
    "cat": "daily",
    "title": "纸巾",
    "place": "日用 · 消耗",
    "amount": 19,
    "base": 19
  },
  {
    "id": "r65",
    "date": "2024-10-02",
    "time": "08:10",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r19",
    "date": "2024-10-02",
    "time": "07:58",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 8,
    "base": 8
  },
  {
    "id": "r18",
    "date": "2024-10-01",
    "time": "18:48",
    "cat": "food",
    "title": "食堂晚餐",
    "place": "餐饮 · 食堂",
    "amount": 14,
    "base": 14
  },
  {
    "id": "r64",
    "date": "2024-10-01",
    "time": "18:33",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 9,
    "base": 9
  },
  {
    "id": "r17",
    "date": "2024-10-01",
    "time": "12:10",
    "cat": "food",
    "title": "便利店饭团",
    "place": "餐饮 · 便利店",
    "amount": 14,
    "base": 14
  },
  {
    "id": "r63",
    "date": "2024-10-01",
    "time": "08:10",
    "cat": "travel",
    "title": "地铁出行",
    "place": "出行 · 通勤",
    "amount": 20,
    "base": 20
  },
  {
    "id": "r16",
    "date": "2024-10-01",
    "time": "07:53",
    "cat": "food",
    "title": "食堂早餐",
    "place": "餐饮 · 早餐",
    "amount": 10,
    "base": 10
  }
];

  var history = [
    { m: "7月", v: 1680 },
    { m: "8月", v: 1860 },
    { m: "9月", v: 2180 },
    { m: "10月", v: 2000 }
  ];

  var user = {
    name: "平平的主人",
    handle: "basely_2024",
    level: "Lv3 记账达人",
    days: 128,
    streak: 7,
    monthSaved: 506
  };

  var budget = {
    month: 3000,
    used: 2000,
    needPct: 60,
    wantPct: 40,
    needTotal: 1800,
    wantTotal: 1200,
    cats: { food: 1200, travel: 600, shopping: 900, fun: 300 }
  };

  var wish = {
    title: "换一台相机",
    target: 8000,
    saved: 3200,
    deadline: "明年 6 月",
    others: [
      { title: "买房首付", target: 300000, saved: 24000, deadline: "5 年后" },
      { title: "带爸妈旅行", target: 6000, saved: 1200, deadline: "今年底" }
    ]
  };

  return { categories: categories, records: records, history: history, user: user, budget: budget, wish: wish };
})();
