const STORAGE_KEY = "ace-racer-ai-tool-data";
const AI_KEY = "ace-racer-ai-tool-ai";
const CREATOR_KEY = "ace-racer-ai-tool-creators";
const GROUPS_KEY = STORAGE_KEY + "-groups";
const GROUPS_RECOVERY_KEY = GROUPS_KEY + "-recovered-20260629";
const DESKTOP_PET_KEY = STORAGE_KEY + "-desktop-pets";
const API_BASE = window.location.protocol.startsWith("http") ? "" : "http://127.0.0.1:4175";
const USE_PROJECT_BACKUP = window.location.protocol.startsWith("http");
let allowProjectLibraryWrite = !USE_PROJECT_BACKUP;
let READ_ONLY_MODE = false;
let STATIC_HOSTING_MODE = false;
const GITHUB_PAGES_CDN_BASE = "https://cdn.jsdelivr.net/gh/ruotun/ace-racer-ai-tool@main/";
const STATIC_ASSET_BASE = window.location.hostname.endsWith("github.io") ? GITHUB_PAGES_CDN_BASE : "";

function staticAssetUrl(value) {
  const src = String(value || "").trim();
  if (!src || /^(data:|blob:|https?:\/\/|\/\/)/i.test(src)) return src;
  const clean = src.replace(/^\.\//, "");
  if (STATIC_ASSET_BASE && (/^(data|assets)\//.test(clean) || /\.(js|css|json)$/i.test(clean))) return STATIC_ASSET_BASE + clean;
  return src;
}

function clearProjectBrowserCache(key) {
  if (!USE_PROJECT_BACKUP) return;
  try { localStorage.removeItem(key); } catch {}
}
async function loadAppConfig() {
  if (!window.location.protocol.startsWith("http")) return;
  try {
    const response = await fetch(API_BASE + "/api/config", { cache: "no-store" });
    if (!response.ok) throw new Error("api config unavailable");
    const config = await response.json();
    READ_ONLY_MODE = Boolean(config.readOnly);
    document.body?.classList.toggle("read-only-mode", READ_ONLY_MODE);
  } catch {
    STATIC_HOSTING_MODE = true;
    READ_ONLY_MODE = true;
    document.body?.classList.add("read-only-mode", "static-hosting-mode");
  }
}
async function fetchProjectJson(apiPath, staticPath) {
  if (!STATIC_HOSTING_MODE && window.location.protocol.startsWith("http")) {
    try {
      const response = await fetch(API_BASE + apiPath, { cache: "no-store" });
      if (response.ok) return response.json();
      if (response.status === 404 || response.status === 405) STATIC_HOSTING_MODE = true;
    } catch {
      STATIC_HOSTING_MODE = true;
    }
  }
  const response = await fetch(staticAssetUrl(staticPath), { cache: "no-store" });
  if (!response.ok) throw new Error("static data unavailable: " + staticPath);
  return response.json();
}
function isReadOnlyMode() {
  return READ_ONLY_MODE;
}
function showReadOnlyNotice() {
  setStatus("公网只读模式：当前页面只允许浏览、搜索和排序，不能编辑或写入数据。", "error");
}

const typeNames = { car: "车辆", part: "芯片/装备", track: "赛道/模式", skill: "技能/特性" };
const abilityTypes = ["", "技能", "被动", "SP"];
const rarityOptions = ["", "耀世珍藏", "传说", "史诗", "稀有", "普通"];
const vehicleCategories = ["", "竞速", "干扰", "辅助", "天平"];
const vehiclePositions = ["竞速", "干扰", "辅助"];
const trackSpecialtyOptions = ["", "山路", "城市", "场地"];
const supportCategoryOptions = ["能量辅助", "增益辅助", "长图辅助", "短图辅助"];
const vehicleRelationConfigs = [
  { key: "recommendedTeammates", field: "推荐队友车辆", reasonField: "推荐队友车辆原因", title: "推荐队友车辆" },
  { key: "notRecommendedTeammates", field: "不推荐队友车辆", reasonField: "不推荐队友车辆原因", title: "不推荐队友车辆" },
  { key: "counteredOpponents", field: "克制对手车辆", reasonField: "克制对手车辆原因", title: "克制对手车辆" },
  { key: "countersByOpponents", field: "被对手车辆克制", reasonField: "被对手车辆克制原因", title: "被对手车辆克制" },
];
const mixedBattleSpRelationConfig = { key: "mixedBattleSp", title: "混斗推荐搭配 SP" };
const vehicleRelationStorageConfigs = [...vehicleRelationConfigs, mixedBattleSpRelationConfig];
const vehicleRelationSyncTargets = {
  recommendedTeammates: "recommendedTeammates",
  notRecommendedTeammates: "notRecommendedTeammates",
  counteredOpponents: "countersByOpponents",
  countersByOpponents: "counteredOpponents",
};
const genderOptions = ["未知", "男", "女"];
const specialLegendaryBackgroundCars = ["侧翼刀锋", "禅", "保时捷911gt2rs", "五菱宏光miniev"];
const classificationIconBase = "./assets/classification-icons/";
const classificationIconVersion = "?v=20260621-restored-detail-icons";
function classificationIcon(name) { return classificationIconBase + name + classificationIconVersion; }
const positionIconMap = {
  竞速: classificationIcon("position-speed.png"),
  干扰: classificationIcon("position-interference.png"),
  辅助: classificationIcon("position-support.png"),
  天平: classificationIcon("position-balance.png"),
};
const trackIconMap = {
  山路: classificationIcon("track-mountain.png"),
  城市: classificationIcon("track-city.png"),
  场地: classificationIcon("track-field.png"),
};
const pinyinMap = window.ACE_RACER_PINYIN_MAP || {};
const goalProfiles = {
  speed: ["竞速", "速度", "加速", "氮气", "直线", "冲刺", "极速", "漂移", "涡轮"],
  control: ["干扰", "控制", "减速", "封路", "反制", "压制", "追击"],
  support: ["辅助", "团队", "充能", "增益", "保护", "回复", "领跑"],
  balanced: ["稳定", "综合", "容错", "弯道", "操控", "泛用", "排位"],
};
const sampleData = [{ id: crypto.randomUUID(), name: "示例竞速车", type: "car", role: "竞速", tags: ["氮气", "加速", "直线"], description: "适合持续加速和直线爆发，推荐搭配提升氮气效率和极速的芯片。", details: { stats: { 极速: "225km/h" }, skills: [{ name: "示例技能", desc: "获得加速。" }], coreAbilityNames: ["示例技能"], abilityLabels: {} } }];
const speedSheetFields = ["出场赛季", "位置", "场地适用", "稀有度", "梯度排行", "干扰距离", "辅助距离", "特殊备注", "特殊备注（被动对于自身增益）", "RECU", "技能简介", "技能对于自身", "推荐队友车辆", "推荐队友车辆原因", "推荐队友车辆原因（技能或者被动或者SP对于队友增益）", "不推荐队友车辆", "不推荐队友车辆原因", "克制对手车辆", "克制对手车辆原因", "被对手车辆克制", "被对手车辆克制原因", "推荐使用地图", "赋能推荐", "芯片推荐", "基础极速", "基础动力", "基础耐久", "基础氮气充能", "基础起步充能", "基础氮气时长", "基础蓝氮极速", "基础紫氮极速", "蓝喷涡轮时长", "紫喷涡轮时长", "蓝喷涡轮极速", "紫喷涡轮极速", "技能极速提升", "大招持续时间"];
const speedSheetHiddenDisplayFields = ["位置", "场地适用", "稀有度", "推荐队友车辆原因", "推荐队友车辆原因（技能或者被动或者SP对于队友增益）", "不推荐队友车辆原因", "克制对手车辆原因", "被对手车辆克制原因"];
const speedSheetReasonFields = ["推荐队友车辆原因", "推荐队友车辆原因（技能或者被动或者SP对于队友增益）", "不推荐队友车辆原因", "克制对手车辆原因", "被对手车辆克制原因"];
const speedSheetPerformanceFields = ["基础极速", "基础动力", "基础耐久", "基础氮气充能", "基础起步充能", "基础氮气时长", "基础蓝氮极速", "基础紫氮极速", "蓝喷涡轮时长", "紫喷涡轮时长", "蓝喷涡轮极速", "紫喷涡轮极速"];
const speedSheetSkillBoostFields = ["技能极速提升", "大招持续时间"];
const speedSheetEditablePerformanceFields = [...speedSheetPerformanceFields, ...speedSheetSkillBoostFields];
const recoveredBackupGroups = [
  { id: "4e654912-9e3e-4719-a6ff-edbc31fb3026", name: "扰流三兄弟", type: "name", carIds: ["gamekee-662307", "speed-sheet-莲花gt430", "gamekee-663735"] },
  { id: "eabd5122-d583-42d7-9f20-0399899ae5a7", name: "大众兔子300阵容", type: "lineup", carIds: ["gamekee-663308", "gamekee-661988", "gamekee-662124"] },
];
const PERFORMANCE_STATS_VERSION = 6;
const PERFORMANCE_STATS_KEY = STORAGE_KEY + "-performance-stats-v6";
const PERFORMANCE_RADAR_MODE_KEY = STORAGE_KEY + "-performance-radar-mode";
const performanceRadarMetrics = [
  { key: "topSpeed", label: "极速", unit: "km/h", field: "极速", sheetField: "基础极速" },
  { key: "power", label: "动力", unit: "", field: "动力", sheetField: "基础动力" },
  { key: "durability", label: "耐久", unit: "", field: "耐久", sheetField: "基础耐久" },
  { key: "nitroCharge", label: "氮气充能", unit: "%", field: "氮气充能", sheetField: "基础氮气充能" },
  { key: "startCharge", label: "起步充能", unit: "%", field: "起步充能", sheetField: "基础起步充能" },
  { key: "nitroDuration", label: "氮气时长", unit: "秒", field: "氮气时长", sheetField: "基础氮气时长" },
  { key: "blueNitroTopSpeed", label: "蓝色氮气极速", unit: "km/h", field: "氮气极速", sheetField: "基础蓝氮极速", splitIndex: 0 },
  { key: "purpleNitroTopSpeed", label: "紫色氮气极速", unit: "km/h", field: "氮气极速", sheetField: "基础紫氮极速", splitIndex: 1 },
  { key: "blueTurboDuration", label: "蓝色涡轮时长", unit: "秒", field: "涡轮时长", sheetField: "蓝喷涡轮时长", splitIndex: 0 },
  { key: "purpleTurboDuration", label: "紫色涡轮时长", unit: "秒", field: "涡轮时长", sheetField: "紫喷涡轮时长", splitIndex: 1 },
  { key: "blueTurboTopSpeed", label: "蓝色涡轮极速", unit: "km/h", field: "涡轮极速", sheetField: "蓝喷涡轮极速", splitIndex: 0 },
  { key: "purpleTurboTopSpeed", label: "紫色涡轮极速", unit: "km/h", field: "涡轮极速", sheetField: "紫喷涡轮极速", splitIndex: 1 },
];
const performanceCompositeMetric = { key: "overallScore", label: "综合分", unit: "" };
const performanceOpenTopSpeedMetric = { key: "openTopSpeed", label: "开大极速", unit: "km/h", field: "技能极速提升", sheetField: "技能极速提升" };
const performanceUltimateDurationMetric = { key: "ultimateDuration", label: "大招持续时间", unit: "秒", field: "大招持续时间", sheetField: "大招持续时间" };
const performanceSkillBoostEditMetrics = [
  { key: "skillTopSpeedBoost", label: "技能极速提升", unit: "km/h", field: "技能极速提升", sheetField: "技能极速提升" },
  performanceUltimateDurationMetric,
];
const performanceSortMetrics = [performanceCompositeMetric, ...performanceRadarMetrics, performanceOpenTopSpeedMetric, performanceUltimateDurationMetric];
let backupSaveTimer = null;
let creatorBackupSaveTimer = null;
let desktopPetBackupSaveTimer = null;
let performanceStatsCache = loadPerformanceStatsCache();
let performanceRadarMode = loadPerformanceRadarMode();
let items = loadItems().map(normalizeRecord);
let activeDetailId = null;
let uiEditItemId = null;
let uiEditDraft = null;
let pendingUiTarget = null;
let vehicleDriveAnchorDrag = null;
let sheetEditItemId = null;
let sheetEditDraft = null;
let creators = loadCreators().map(normalizeCreator);
var activeGroupEdit = "";
var activeGroupCarSearch = "";
let groups = loadGroups();
let activeDesktopPetId = "";
let desktopPets = loadDesktopPets().map(normalizeDesktopPet);
if (!activeDesktopPetId) activeDesktopPetId = desktopPets[0]?.id || "";
let pendingDesktopPetStateId = "";
let pendingDesktopPetChromaPickStateId = "";
let pendingDesktopPetDriveAnchorPick = null;
let activeDesktopPetDriveAnchorEditor = null;
let desktopPetDriveAnchorDrag = null;
let activeCreatorId = null;
let activeLibraryBranch = "cars";
let activeSupportCategoryFilter = "";
let detailHistory = [];

function $(id) { return document.getElementById(id); }
function normalizeText(value) { return String(value || "").trim(); }
function splitTags(value) { return normalizeText(value).split(/[，,、\s]+/).map((tag) => tag.trim()).filter(Boolean); }
function inferType(record) {
  const text = [record.type, record.category, record.name, record.role, record.description, record.tags].flat().join(" ").toLowerCase();
  if (/赛道|地图|模式|track|map/.test(text)) return "track";
  if (/芯片|装备|配件|part|gear|module/.test(text)) return "part";
  if (/技能|被动|特性|skill/.test(text)) return "skill";
  return "car";
}
function speedSheetRows() {
  return [
    ...(Array.isArray(window.ACE_RACER_SPEED_CAR_ROWS) ? window.ACE_RACER_SPEED_CAR_ROWS : []),
    ...(Array.isArray(window.ACE_RACER_INTERFERENCE_CAR_ROWS) ? window.ACE_RACER_INTERFERENCE_CAR_ROWS : []),
    ...(Array.isArray(window.ACE_RACER_SUPPORT_CAR_ROWS) ? window.ACE_RACER_SUPPORT_CAR_ROWS : []),
  ];
}
function formatSheetValue(value) { return value === undefined || value === null || value === "" ? "-" : String(value); }
function meaningfulValue(value) {
  const text = normalizeText(value);
  return text && text !== "-" && text !== "未识别" && text !== "未选择" ? text : "";
}
function compactObjectValues(object) {
  return Object.fromEntries(Object.entries(object || {}).filter(([, value]) => meaningfulValue(value)));
}
function normalizeMatchName(value) {
  return normalizeText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[·\s\-_/／\\（）()【】\[\]：:，,。！!？?]/g, "");
}
const vehicleAliasKeyGroups = [
  ["布加迪lvn", "布加迪lavoiturenoire", "布加迪黑夜之声", "lvn黑夜之声"],
  ["梅赛德斯silverarrow", "梅赛德斯奔驰silverarrow"],
  ["王牌速面", "王牌素面", "acevan", "王牌挂面"],
  ["兰博基尼huracansto"],
  ["梅赛德斯amgc63coupe", "梅赛德斯amgc63scoupe"],
  ["阿斯顿马丁瓦尔基里", "阿斯顿马丁valkyrieamrpro", "女武神", "valkurieamrpro"],
  ["保时捷taycanturbos", "保时捷taycanturbs"],
  ["雪佛兰c8", "雪佛兰corvettec8"],
  ["雪佛兰zr1", "雪佛兰corvettezr1"],
  ["道奇挑战者392", "道奇challengersrt392"],
  ["福特focusrs", "福特foucsrs", "福特小飞机"],
];
function canonicalVehicleAliasKey(value) {
  const key = normalizeMatchName(value);
  const group = vehicleAliasKeyGroups.find((aliases) => aliases.includes(key));
  return group ? group[0] : key;
}
function nameParts(value) {
  const text = normalizeText(value);
  return text.split(/[\/／、,，]/).map((part) => part.trim()).filter(Boolean);
}
function primaryNameFromName(value) {
  return nameParts(value)[0] || normalizeText(value);
}
function aliasesFromName(value) {
  const text = normalizeText(value);
  return [...new Set([...nameParts(text), text].filter(Boolean))];
}
function sheetSourceKey(item) {
  return normalizeMatchName(item?.details?.speedSheetSourceName || "");
}
function carsRepresentSameVehicle(left, right) {
  const leftSource = sheetSourceKey(left);
  const rightSource = sheetSourceKey(right);
  if (leftSource && rightSource && leftSource === rightSource) return true;
  const leftKeys = vehicleNameAliases(left).map(canonicalVehicleAliasKey).filter(Boolean);
  const rightKeys = vehicleNameAliases(right).map(canonicalVehicleAliasKey).filter(Boolean);
  if (leftKeys.some((key) => rightKeys.includes(key))) return true;
  return namesMatch(left?.name, right?.name);
}
function vehicleNameAliases(item) {
  return [...new Set([
    ...aliasesFromName(item?.details?.speedSheetSourceName || ""),
    ...aliasesFromName(item?.name || ""),
  ].filter(Boolean))];
}
function displayVehicleName(item) {
  return primaryNameFromName(item?.details?.speedSheetSourceName || "") || primaryNameFromName(item?.name || "") || "未命名赛车";
}
function compactSearchText(value) {
  return normalizeText(value).toLowerCase().replace(/\s+/g, "");
}
function pinyinForText(value) {
  let full = "";
  let initials = "";
  for (const char of normalizeText(value)) {
    const py = pinyinMap[char];
    if (py) {
      full += py;
      initials += py[0];
    } else if (/[a-z0-9]/i.test(char)) {
      const lower = char.toLowerCase();
      full += lower;
      initials += lower;
    }
  }
  return { full, initials };
}
function searchTokensForText(value) {
  const text = normalizeText(value).toLowerCase();
  const compact = compactSearchText(value);
  const pinyin = pinyinForText(value);
  return [...new Set([text, compact, pinyin.full, pinyin.initials].filter(Boolean))];
}
function sheetRowAliases(row) {
  return [...new Set([...(Array.isArray(row?._aliases) ? row._aliases : []), ...aliasesFromName(row?.["赛车名称"] || "")].filter(Boolean))];
}
function namesMatch(left, right) {
  const leftKeys = aliasesFromName(left).map(canonicalVehicleAliasKey).filter(Boolean);
  const rightKeys = aliasesFromName(right).map(canonicalVehicleAliasKey).filter(Boolean);
  return leftKeys.some((key) => rightKeys.includes(key));
}
function findSpeedSheetRowByName(name) {
  const targetKeys = aliasesFromName(name).map(canonicalVehicleAliasKey).filter(Boolean);
  if (!targetKeys.length) return null;
  return speedSheetRows().find((row) => sheetRowAliases(row).map(canonicalVehicleAliasKey).some((alias) => targetKeys.includes(alias))) || null;
}
function speedSheetDetails(row) {
  const details = {};
  speedSheetFields.forEach((field) => { details[field] = formatSheetValue(row?.[field]); });
  return details;
}
function mergeSheetDetails(base, existing, preserveEmpty = false) {
  const merged = { ...base };
  Object.entries(existing || {}).forEach(([key, value]) => {
    if (preserveEmpty || (value !== undefined && value !== null && value !== "" && value !== "-")) merged[key] = value;
  });
  return merged;
}
function cleanNumberText(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(4)).toString() : "";
}
function lastNumberBeforeUnit(text, unitPattern) {
  const source = normalizeText(text).replace(/，/g, ",");
  const unitMatch = source.match(unitPattern);
  if (!unitMatch) return "";
  const beforeUnit = source.slice(0, unitMatch.index).split(/[（(]/)[0];
  const matches = beforeUnit.match(/-?(?:\d+(?:\.\d+)?|\.\d+)/g);
  return matches?.length ? cleanNumberText(matches[matches.length - 1]) : "";
}
function formatBoostFieldValue(value, unit) {
  const clean = cleanNumberText(value);
  return clean ? clean + unit : "";
}
function skillCandidateText(skill) {
  return [skill?.name, skill?.desc, skill?.values].filter(Boolean).join(" ");
}
function orderedSkillBoostCandidates(item) {
  const skills = Array.isArray(item.details?.skills) ? item.details.skills : [];
  const labels = item.details?.abilityLabels || {};
  const coreNames = new Set(item.details?.coreAbilityNames || []);
  const groups = [
    skills.filter((skill) => labels[skill.name] === "技能"),
    skills.filter((skill) => coreNames.has(skill.name) && labels[skill.name] !== "被动"),
    skills.filter((skill) => labels[skill.name] !== "被动"),
    skills,
  ];
  const seen = new Set();
  return groups.flat().filter((skill) => {
    const key = skill.name || skillCandidateText(skill);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).flatMap((skill) => {
    const values = normalizeText(skill.values);
    const fullText = skillCandidateText(skill);
    return [values, fullText].filter((text, index, list) => text && list.indexOf(text) === index);
  });
}
function extractDurationFromText(text, preferredIndex = 0) {
  const durationLabel = "(?:加速时长|加速时间|加速持续时间|持续加速时长|极速时长|最大持续时间|基础持续时间|穿梭持续时间|极限持续持续时间|大招持续时间|持续时间)";
  const durationPattern = new RegExp(durationLabel + "\\s*[:：]?\\s*([^。；\\n]{0,90}?秒)", "g");
  const findDuration = (source, takeLast = false) => {
    const results = [];
    let match;
    while ((match = durationPattern.exec(source))) {
      const value = lastNumberBeforeUnit(match[1], /秒/);
      if (value) results.push(value);
    }
    const fallbackPattern = /持续\s*(?:#desc\[[^\]]+\])?\s*([^。；\n]{0,50}?秒)/g;
    while ((match = fallbackPattern.exec(source))) {
      const value = lastNumberBeforeUnit(match[1], /秒/);
      if (value) results.push(value);
    }
    return takeLast ? results[results.length - 1] : results[0];
  };
  const after = text.slice(Math.max(0, preferredIndex), preferredIndex + 260);
  const afterValue = findDuration(after);
  if (afterValue) return afterValue;
  const around = text.slice(Math.max(0, preferredIndex - 160), preferredIndex + 80);
  return findDuration(around, true) || "";
}
function boostMatchPriority(label, value) {
  if (/闪现距离|巡航速度|氮气|涡轮|记录上限/.test(label)) return -1;
  let priority = 1;
  if (/终阶|最大|上限/.test(label)) priority += 4;
  if (/基础|穿梭|幽灵|极限|技能/.test(label)) priority += 3;
  if (/极速提升|速度提升/.test(label)) priority += 2;
  if (/额外/.test(label)) priority -= 1;
  return priority + Math.min(Number(value) || 0, 200) / 1000;
}
function extractSkillBoostFromText(text) {
  const source = normalizeText(text).replace(/#(?:desc|tips)\[[^\]]*\]/g, "");
  if (!source) return null;
  const candidates = [];
  const segmentPattern = /([^：:\n。；]{0,24}(?:极速提升|速度提升|额外极速|基础极速|穿梭极速|幽灵极速|终阶极速|极限氮气极速)[^：:\n。；]{0,16})[：:]\s*([^：:\n。；]{0,100}?km\/?h)/gi;
  let match;
  while ((match = segmentPattern.exec(source))) {
    const label = match[1] || "";
    const value = lastNumberBeforeUnit(match[2], /km\/?h/i);
    const priority = boostMatchPriority(label, value);
    const contextBefore = source.slice(Math.max(0, match.index - 48), match.index);
    const contextAround = source.slice(Math.max(0, match.index - 48), match.index + match[0].length + 90);
    const duration = extractDurationFromText(source, match.index);
    if (!value || priority < 0) continue;
    if (/被动|本局内/.test(contextBefore) && !extractDurationFromText(source, match.index)) continue;
    if (!duration && /本局内|上限|每次使用|叠加|被动/.test(contextAround)) continue;
    candidates.push({ value, index: match.index, priority, duration });
  }
  if (!candidates.length) {
    const fallbackPattern = /(?:极速提升|速度提升|极速额外提升|极速\+)\s*([^。；\n]{0,48}?km\/?h)/gi;
    while ((match = fallbackPattern.exec(source))) {
      const value = lastNumberBeforeUnit(match[1], /km\/?h/i);
      const contextBefore = source.slice(Math.max(0, match.index - 48), match.index);
      const contextAround = source.slice(Math.max(0, match.index - 48), match.index + match[0].length + 90);
      const duration = extractDurationFromText(source, match.index);
      if (!value) continue;
      if (/被动|本局内/.test(contextBefore) && !extractDurationFromText(source, match.index)) continue;
      if (/光影|巡航速度|生成位置|闪现距离|范围/.test(match[1])) continue;
      if (!duration && /本局内|上限|每次使用|叠加|被动/.test(contextAround)) continue;
      candidates.push({ value, index: match.index, priority: 2 + Math.min(Number(value) || 0, 200) / 1000, duration });
    }
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.priority - a.priority);
  const selected = candidates[0];
  return {
    boost: formatBoostFieldValue(selected.value, "km/h"),
    duration: formatBoostFieldValue(selected.duration || extractDurationFromText(source, selected.index), "秒"),
  };
}
function extractVehicleSkillBoostData(item) {
  if (!item || item.type !== "car" || carPosition(item) !== "竞速") return {};
  for (const text of orderedSkillBoostCandidates(item)) {
    const result = extractSkillBoostFromText(text);
    if (result?.boost) return result;
  }
  return {};
}
function applySkillBoostData(record) {
  if (!record || record.type !== "car") return record;
  record.details = record.details || {};
  record.details.speedSheet = record.details.speedSheet || speedSheetDetails(null);
  if (record.details.skillBoostManual || carPosition(record) !== "竞速") return record;
  const extracted = extractVehicleSkillBoostData(record);
  if (extracted.boost) record.details.speedSheet["技能极速提升"] = extracted.boost;
  else record.details.speedSheet["技能极速提升"] = "-";
  if (extracted.duration) record.details.speedSheet["大招持续时间"] = extracted.duration;
  else record.details.speedSheet["大招持续时间"] = "-";
  return record;
}
function normalizeVehicleRarity(value) {
  const text = normalizeText(value).replace("臻藏", "珍藏");
  if (!text || text === "-") return "";
  if (rarityOptions.includes(text)) return text;
  if (text.includes("耀世")) return "耀世珍藏";
  if (text.includes("传说")) return "传说";
  if (text.includes("史诗")) return "史诗";
  if (text.includes("稀有")) return "稀有";
  if (text.includes("普通")) return "普通";
  return "";
}
function applySpeedSheetData(record, forcedRow = null) {
  const row = forcedRow || findSpeedSheetRowByName(record.name);
  record.details = record.details || {};
  const existingSheet = record.details.speedSheet && typeof record.details.speedSheet === "object" ? record.details.speedSheet : {};
  const existingSourceName = normalizeText(record.details.speedSheetSourceName || "");
  record.details.speedSheet = mergeSheetDetails(speedSheetDetails(row), existingSheet, Boolean(record.details.speedSheetManual));
  record.details.speedSheetSourceName = record.details.speedSheetManual && existingSourceName ? existingSourceName : (row?.["赛车名称"] || existingSourceName);
  if (!row) return record;
  record.role = record.role || meaningfulValue(row["位置"]);
  record.tags = [...new Set([...(record.tags || []), row["位置"], row["场地适用"], row["稀有度"], row["梯度排行"]].filter(Boolean).map(String))];
  record.details.carMeta = normalizeCarMeta({
    ...compactObjectValues({ rarity: normalizeVehicleRarity(row["稀有度"]), category: row["位置"], trackSpecialty: row["场地适用"] }),
    ...compactObjectValues(record.details.carMeta || {}),
  });
  return record;
}
function normalizeRecord(record) {
  const details = record.details && typeof record.details === "object" ? record.details : {};
  details.attrs = details.attrs || {};
  details.stats = details.stats || {};
  details.skills = Array.isArray(details.skills) ? details.skills : [];
  details.coreAbilityNames = Array.isArray(details.coreAbilityNames) ? details.coreAbilityNames : inferCoreAbilityNames(details.skills);
  details.abilityLabels = mergeAbilityLabels(defaultAbilityLabels(details.coreAbilityNames), details.abilityLabels || {});
  details.carMeta = normalizeCarMeta({ category: details.attrs["定位"], trackSpecialty: details.attrs["赛道专精"], ...compactObjectValues(details.carMeta || record.carMeta || {}) });
  details.supportCategories = Array.isArray(details.supportCategories) ? details.supportCategories.filter((value) => supportCategoryOptions.includes(value)) : [];
  details.vehicleRelations = normalizeVehicleRelations(details.vehicleRelations || record.vehicleRelations || {});
  details.driveAnchor = normalizeVehicleDriveAnchor(details.driveAnchor || record.driveAnchor);
  details.coreAbilities = details.coreAbilityNames.map((name) => ({ name, category: details.abilityLabels[name] || "" }));
  const tags = Array.isArray(record.tags) ? record.tags : splitTags(record.tags || record.tag || "");
  const normalized = {
    id: record.id || crypto.randomUUID(),
    name: normalizeText(record.name || record.名称 || record.title || record.标题 || "未命名资料"),
    type: ["car", "part", "track", "skill"].includes(record.type) ? record.type : inferType(record),
    role: normalizeText(record.role || record.定位 || record.category || record.类型 || ""),
    tags: [...new Set(tags.filter(Boolean))],
    description: normalizeText(record.description || record.desc || record.描述 || record.content || record.内容 || ""),
    source: normalizeText(record.source || record.来源 || ""),
    image: normalizeText(record.image || record.thumb || ""),
    images: Array.isArray(record.images) ? record.images : [],
    details,
  };
  return normalized.type === "car" ? applySkillBoostData(applySpeedSheetData(normalized)) : normalized;
}
function inferCoreAbilityNames(skills) {
  const names = skills.map((skill) => skill.name).filter(Boolean);
  const markerIndex = names.findIndex((name) => name.includes("竞速级氮气支架"));
  if (markerIndex <= 0) return names.slice(0, Math.min(3, names.length));
  return names.slice(Math.max(0, markerIndex - 3), markerIndex);
}
function defaultAbilityLabels(names) {
  if (!Array.isArray(names) || !names.length) return {};
  if (names.length === 2) return { [names[0]]: "技能", [names[1]]: "被动" };
  if (names.length >= 3) return { [names[0]]: "SP", [names[1]]: "技能", [names[2]]: "被动" };
  return { [names[0]]: "技能" };
}
function mergeAbilityLabels(defaults, existing) {
  const labels = { ...defaults };
  Object.entries(existing || {}).forEach(([name, label]) => { if (label) labels[name] = label; });
  return labels;
}
function normalizeVehicleCategory(value) {
  const text = meaningfulValue(value).replace(/位$/u, "");
  if (text.includes("天平")) return "天平";
  if (text.includes("竞速")) return "竞速";
  if (text.includes("干扰")) return "干扰";
  if (text.includes("辅助")) return "辅助";
  return "";
}
function normalizeCarMeta(meta) {
  const source = meta && typeof meta === "object" ? meta : {};
  const category = normalizeVehicleCategory(source.category);
  const mainPosition = vehiclePositions.includes(source.mainPosition) ? source.mainPosition : "";
  const includedPositions = Array.isArray(source.includedPositions) ? source.includedPositions.filter((value) => vehiclePositions.includes(value)) : [];
  const trackText = normalizeText(source.trackSpecialty).replace("山地", "山路");
  const trackSpecialty = trackSpecialtyOptions.includes(trackText) ? trackText : "";
  return {
    rarity: normalizeVehicleRarity(source.rarity),
    category,
    trackSpecialty,
    mainPosition: category === "天平" ? mainPosition : "",
    includedPositions: category === "天平" ? [...new Set(includedPositions)] : [],
  };
}
function normalizeVehicleDriveAnchor(anchor) {
  const source = anchor && typeof anchor === "object" ? anchor : {};
  const x = Number(source.x);
  const y = Number(source.y);
  return {
    x: Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 50,
    y: Number.isFinite(y) ? Math.max(0, Math.min(100, y)) : 50,
  };
}
function normalizeVehicleRelations(value) {
  const source = value && typeof value === "object" ? { ...value } : {};
  if (Array.isArray(source.pairedByTeammates)) {
    source.recommendedTeammates = [...(Array.isArray(source.recommendedTeammates) ? source.recommendedTeammates : []), ...source.pairedByTeammates];
  }
  return Object.fromEntries(vehicleRelationStorageConfigs.map((config) => {
    const entries = Array.isArray(source[config.key]) ? source[config.key] : [];
    const normalized = entries.map((entry) => {
      const rawType = typeof entry === "object" ? entry?.type : "";
      const rawId = normalizeText(typeof entry === "string" ? entry : entry?.id);
  const type = rawType === "supportCategory" || rawId.startsWith("support:") ? "supportCategory" : rawType === "group" || rawId.startsWith("group:") ? "group" : "car";
  const id = type === "supportCategory" ? rawId.replace(/^support:/, "") : type === "group" ? rawId.replace(/^group:/, "") : rawId;
      return {
        type,
        id,
        reason: normalizeText(typeof entry === "object" ? entry?.reason : ""),
        syncKey: normalizeText(typeof entry === "object" ? entry?.syncKey : ""),
        detached: Boolean(typeof entry === "object" && entry?.detached),
      };
    }).filter((entry) => entry.id);
    return [config.key, normalized.filter((entry, index, list) => list.findIndex((other) => other.id === entry.id && other.type === entry.type) === index)];
  }));
}
function loadItems() {
  if (USE_PROJECT_BACKUP) { clearProjectBrowserCache(STORAGE_KEY); return []; }
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function isInlineImageData(value) {
  return typeof value === "string" && /^data:image\//i.test(value);
}
function stripInlineImagesForBrowserStorage(value) {
  if (isInlineImageData(value)) return "";
  if (Array.isArray(value)) return value.map(stripInlineImagesForBrowserStorage).filter((entry) => entry !== "");
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, stripInlineImagesForBrowserStorage(entry)]));
  }
  return value;
}
function saveItems() {
  if (isReadOnlyMode()) return false;
  scheduleLibraryBackup(0);
  if (USE_PROJECT_BACKUP) return true;
  const browserItems = stripInlineImagesForBrowserStorage(items);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(browserItems));
    return true;
  } catch (error) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(browserItems));
      setUiEditStatus("已保存到项目本地文件；浏览器缓存已自动瘦身。", "success");
      return true;
    } catch (secondError) {
      setUiEditStatus("资料已保留在当前页面，并正在写入项目本地文件；浏览器缓存空间仍然不足。", "error");
      return false;
    }
  }
}
function scheduleLibraryBackup(delay = 250) {
  if (isReadOnlyMode()) return;
  if (!location.protocol.startsWith("http")) return;
  if (USE_PROJECT_BACKUP && !allowProjectLibraryWrite) return;
  window.clearTimeout(backupSaveTimer);
  backupSaveTimer = window.setTimeout(() => {
    fetch(API_BASE + "/api/library-data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, replace: true }) }).catch(() => {});
  }, delay);
}
async function restoreItemsFromBackup() {
  try {
    const payload = await fetchProjectJson("/api/library-data", "./data/library-data.json");
    const backupItems = Array.isArray(payload.items) ? payload.items : [];
    const normalizedBackup = backupItems.map(normalizeRecord).filter((item) => item.id || item.name);
    if (!normalizedBackup.length) { if (items.length) { allowProjectLibraryWrite = true; scheduleLibraryBackup(); } return; }
    const itemKey = (item) => item.id ? item.id : item.type + ":" + item.name;
    const merged = new Map(normalizedBackup.map((item) => [itemKey(item), item]));
    items.map(normalizeRecord).filter((item) => item.id || item.name).forEach((item) => {
      const key = itemKey(item);
      const existing = merged.get(key);
      if (!existing || JSON.stringify(item).length > JSON.stringify(existing).length) merged.set(key, item);
    });
    items = migrateVehicleRecords(Array.from(merged.values()));
    allowProjectLibraryWrite = true;
    if (!USE_PROJECT_BACKUP) saveItems();
  } catch {}
}
function loadCreators() {
  if (USE_PROJECT_BACKUP) { clearProjectBrowserCache(CREATOR_KEY); return []; }
  try { return JSON.parse(localStorage.getItem(CREATOR_KEY) || "[]"); } catch { return []; }
}
function saveCreators() {
  if (isReadOnlyMode()) return;
  if (!USE_PROJECT_BACKUP) localStorage.setItem(CREATOR_KEY, JSON.stringify(creators));
  scheduleCreatorBackup();
}
function normalizeGroupRecord(group) {
  return {
    id: normalizeText(group?.id || crypto.randomUUID()),
    name: normalizeText(group?.name || "未命名组合"),
    carIds: Array.isArray(group?.carIds) ? group.carIds.map((id) => normalizeText(id)).filter(Boolean) : [],
    type: group?.type === "lineup" ? "lineup" : "name",
  };
}
function mergeRecoveredGroups(list) {
  const merged = new Map((Array.isArray(list) ? list : []).map((group) => normalizeGroupRecord(group)).filter((group) => group.id).map((group) => [group.id, group]));
  recoveredBackupGroups.map(normalizeGroupRecord).forEach((group) => {
    if (!merged.has(group.id)) merged.set(group.id, group);
  });
  return Array.from(merged.values());
}
function loadGroups() {
  try {
    const stored = JSON.parse(localStorage.getItem(GROUPS_KEY) || "[]");
    if (!localStorage.getItem(GROUPS_RECOVERY_KEY)) {
      const recovered = mergeRecoveredGroups(stored);
      localStorage.setItem(GROUPS_KEY, JSON.stringify(recovered));
      localStorage.setItem(GROUPS_RECOVERY_KEY, "1");
      return recovered;
    }
    return (Array.isArray(stored) ? stored : []).map(normalizeGroupRecord);
  } catch {
    return mergeRecoveredGroups([]);
  }
}
function saveGroups() { if (isReadOnlyMode()) return; try { localStorage.setItem(GROUPS_KEY, JSON.stringify(groups)); } catch {} }
function loadDesktopPets() {
  if (USE_PROJECT_BACKUP) { clearProjectBrowserCache(DESKTOP_PET_KEY); return []; }
  try {
    const raw = JSON.parse(localStorage.getItem(DESKTOP_PET_KEY) || "{}");
    if (Array.isArray(raw)) return raw;
    activeDesktopPetId = raw.activePetId || activeDesktopPetId;
    return Array.isArray(raw.pets) ? raw.pets : [];
  } catch { return []; }
}
function normalizeDesktopPet(pet) {
  const states = Array.isArray(pet?.states) ? pet.states : [];
  const normalizedStates = states.map((state) => ({
    id: state.id || crypto.randomUUID(),
    name: normalizeText(state.name || "待机"),
    trigger: normalizeText(state.trigger || state.kind || "idle"),
    image: normalizeText(state.image || ""),
    message: normalizeText(state.message || ""),
    transparentImage: normalizeText(state.transparentImage || ""),
    assembledImage: normalizeText(state.assembledImage || ""),
    frames: Array.isArray(state.frames) ? state.frames.map((frame) => normalizeText(frame)).filter(Boolean).slice(0, 16) : [],
    duration: Math.max(480, Number(state.duration) || 1200),
    assembledAt: normalizeText(state.assembledAt || ""),
  }));
  const fallbackStates = normalizedStates.length ? normalizedStates : [
    { id: crypto.randomUUID(), name: "待机", trigger: "idle", image: "", message: "我在这里。点我可以问资料库。" },
    { id: crypto.randomUUID(), name: "开心", trigger: "happy", image: "", message: "找到资料啦。" },
    { id: crypto.randomUUID(), name: "思考", trigger: "thinking", image: "", message: "让我查一下资料库。" },
    { id: crypto.randomUUID(), name: "睡觉", trigger: "sleep", image: "", message: "先休息一下。" },
  ];
  return {
    id: pet?.id || crypto.randomUUID(),
    name: normalizeText(pet?.name || "资料库桌宠"),
    persona: normalizeText(pet?.persona || "温柔、简洁、只根据当前资料库回答。"),
    activeStateId: pet?.activeStateId || fallbackStates[0]?.id || "",
    states: fallbackStates,
  };
}
function desktopPetPayload() {
  return { activePetId: activeDesktopPetId, pets: desktopPets.map(normalizeDesktopPet) };
}
function saveDesktopPets() {
  if (isReadOnlyMode()) return;
  desktopPets = desktopPets.map(normalizeDesktopPet);
  if (!USE_PROJECT_BACKUP) {
    try { localStorage.setItem(DESKTOP_PET_KEY, JSON.stringify(desktopPetPayload())); } catch {}
  }
  scheduleDesktopPetBackup();
}
function scheduleDesktopPetBackup(delay = 250) {
  if (isReadOnlyMode()) return;
  if (!location.protocol.startsWith("http")) return;
  window.clearTimeout(desktopPetBackupSaveTimer);
  desktopPetBackupSaveTimer = window.setTimeout(() => {
    fetch(API_BASE + "/api/desktop-pets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(desktopPetPayload()) }).catch(() => {});
  }, delay);
}
async function restoreDesktopPetsFromBackup() {
  if (isReadOnlyMode() || STATIC_HOSTING_MODE) return;
  try {
    const payload = await fetchProjectJson("/api/desktop-pets", "./data/desktop-pets.json");
    const backupPets = Array.isArray(payload.pets) ? payload.pets.map(normalizeDesktopPet) : [];
    if (!backupPets.length) { saveDesktopPets(); return; }
    const merged = new Map(desktopPets.map((pet) => [pet.id, pet]));
    backupPets.forEach((pet) => merged.set(pet.id, pet));
    desktopPets = Array.from(merged.values()).map(normalizeDesktopPet);
    activeDesktopPetId = payload.activePetId || activeDesktopPetId || desktopPets[0]?.id || "";
    saveDesktopPets();
    renderDesktopPetManager();
  } catch {}
}
function activeDesktopPet() {
  return desktopPets.find((pet) => pet.id === activeDesktopPetId) || desktopPets[0] || null;
}
function setDesktopPetStatus(message, type = "") {
  const node = $("desktopPetStatus");
  if (!node) return;
  node.textContent = message;
  node.className = "status-text" + (type ? " " + type : "");
}
function createDesktopPet() {
  const pet = normalizeDesktopPet({ name: "资料库桌宠" });
  desktopPets.push(pet);
  activeDesktopPetId = pet.id;
  saveDesktopPets();
  renderDesktopPetManager();
  setDesktopPetStatus("已创建新桌宠。先给她改个名字，再拖入动作图片。", "success");
}
function deleteDesktopPet(petId) {
  if (!confirm("确定删除这个桌宠？")) return;
  desktopPets = desktopPets.filter((pet) => pet.id !== petId);
  activeDesktopPetId = desktopPets[0]?.id || "";
  saveDesktopPets();
  renderDesktopPetManager();
}
function addDesktopPetAction() {
  const pet = activeDesktopPet();
  if (!pet) { createDesktopPet(); return; }
  const state = { id: crypto.randomUUID(), name: "新动作", trigger: "custom", image: "", message: "" };
  pet.states.push(state);
  pet.activeStateId = state.id;
  saveDesktopPets();
  renderDesktopPetManager();
}
function deleteDesktopPetAction(stateId) {
  const pet = activeDesktopPet();
  if (!pet) return;
  pet.states = pet.states.filter((state) => state.id !== stateId);
  if (!pet.states.length) pet.states = normalizeDesktopPet({ name: pet.name, persona: pet.persona }).states;
  pet.activeStateId = pet.states[0]?.id || "";
  saveDesktopPets();
  renderDesktopPetManager();
}
function desktopPetImagePreview(state) {
  if (!state.image) return '<div class="desktop-pet-placeholder">拖入图片</div>';
  return '<img src="' + escapeHtml(state.image) + '" alt="' + escapeHtml(state.name) + '" />';
}
function renderDesktopPetManager() {
  if (isReadOnlyMode()) return;
  const list = $("desktopPetList");
  const actions = $("desktopPetActions");
  if (!list || !actions) return;
  if (!desktopPets.length) createDesktopPet();
  const pet = activeDesktopPet();
  if ($("desktopPetName")) $("desktopPetName").value = pet?.name || "";
  if ($("desktopPetPersona")) $("desktopPetPersona").value = pet?.persona || "";
  list.innerHTML = desktopPets.map((entry) => {
    const imageState = entry.states.find((state) => state.image) || entry.states[0] || {};
    return '<button class="desktop-pet-card' + (entry.id === activeDesktopPetId ? ' active' : '') + '" data-pet-id="' + escapeHtml(entry.id) + '">' +
      '<span class="desktop-pet-card-art">' + desktopPetImagePreview(imageState) + '</span>' +
      '<strong>' + escapeHtml(entry.name) + '</strong>' +
      '<small>' + entry.states.length + ' 个状态</small>' +
      '</button>';
  }).join("");
  if (!pet) { actions.innerHTML = '<p class="desc">还没有桌宠。</p>'; return; }
  actions.innerHTML = pet.states.map((state, index) => {
    const isActive = state.id === pet.activeStateId;
    return '<article class="desktop-pet-action' + (isActive ? ' active' : '') + '" data-state-id="' + escapeHtml(state.id) + '">' +
      '<button type="button" class="desktop-pet-drop" data-pet-upload="' + escapeHtml(state.id) + '">' + desktopPetImagePreview(state) + '</button>' +
      '<div class="desktop-pet-action-fields">' +
      '<label>状态名<input class="desktop-pet-state-name" data-state-id="' + escapeHtml(state.id) + '" value="' + escapeHtml(state.name) + '" /></label>' +
      '<label>触发类型<select class="desktop-pet-state-trigger" data-state-id="' + escapeHtml(state.id) + '">' +
      ["idle", "happy", "thinking", "sleep", "walk", "custom"].map((trigger) => '<option value="' + trigger + '"' + (state.trigger === trigger ? ' selected' : '') + '>' + trigger + '</option>').join("") +
      '</select></label>' +
      '<label class="wide">互动台词<input class="desktop-pet-state-message" data-state-id="' + escapeHtml(state.id) + '" value="' + escapeHtml(state.message) + '" placeholder="点到这个状态时说什么" /></label>' +
      '</div>' +
      '<div class="desktop-pet-action-buttons">' +
      '<button class="desktop-pet-set-active" data-state-id="' + escapeHtml(state.id) + '">' + (isActive ? '默认状态' : '设为默认') + '</button>' +
      '<button class="desktop-pet-pick-image" data-state-id="' + escapeHtml(state.id) + '">选择图片</button>' +
      '<button class="desktop-pet-remove-action" data-state-id="' + escapeHtml(state.id) + '"' + (pet.states.length <= 1 ? ' disabled' : '') + '>删除</button>' +
      '</div>' +
      '</article>';
  }).join("");
}
function updateDesktopPetForm() {
  const pet = activeDesktopPet();
  if (!pet) return;
  pet.name = normalizeText($("desktopPetName")?.value || pet.name) || "资料库桌宠";
  pet.persona = normalizeText($("desktopPetPersona")?.value || pet.persona);
  saveDesktopPets();
  renderDesktopPetManager();
}
function updateDesktopPetState(stateId, patch) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state) return;
  Object.assign(state, patch);
  saveDesktopPets();
}
async function uploadDesktopPetImage(file, stateId) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state || !file) return;
  setDesktopPetStatus("正在保存桌宠图片...");
  try {
    const dataUrl = await readFileAsDataUrl(file);
    const imageSrc = await persistUploadedUiImage(dataUrl, "desktop-pet");
    state.image = imageSrc;
    pet.activeStateId = state.id;
    saveDesktopPets();
    renderDesktopPetManager();
    setDesktopPetStatus("图片已加入动作：" + state.name, "success");
  } catch (error) {
    setDesktopPetStatus("图片保存失败：" + error.message, "error");
  }
}
function openDesktopPetWindow() {
  const pet = activeDesktopPet();
  if (!pet) { createDesktopPet(); return; }
  saveDesktopPets();
  const url = "./pet.html?pet=" + encodeURIComponent(pet.id) + "&v=" + Date.now();
  const popup = window.open(url, "ace-racer-desktop-pet-" + pet.id, "popup=yes,width=420,height=560,left=120,top=120");
  if (!popup) setDesktopPetStatus("浏览器阻止了弹窗。请允许本站弹窗后再点一次打开桌宠。", "error");
}
function desktopPetDefaultStates() {
  return [
    { id: crypto.randomUUID(), name: "待机", trigger: "idle", image: "", message: "我在这里。点我可以问资料库。", transparentImage: "", assembledImage: "", frames: [], duration: 1400, assembledAt: "" },
    { id: crypto.randomUUID(), name: "开心", trigger: "happy", image: "", message: "找到资料啦。", transparentImage: "", assembledImage: "", frames: [], duration: 820, assembledAt: "" },
    { id: crypto.randomUUID(), name: "思考", trigger: "thinking", image: "", message: "让我查一下资料库。", transparentImage: "", assembledImage: "", frames: [], duration: 1180, assembledAt: "" },
    { id: crypto.randomUUID(), name: "睡觉", trigger: "sleep", image: "", message: "先休息一下。", transparentImage: "", assembledImage: "", frames: [], duration: 1800, assembledAt: "" },
  ];
}
function desktopPetFrameDuration(trigger) {
  const durations = { idle: 1500, happy: 780, thinking: 1120, sleep: 1900, walk: 820, custom: 1240 };
  return durations[trigger] || durations.custom;
}
function normalizeDesktopPetState(state) {
  return {
    id: state?.id || crypto.randomUUID(),
    name: normalizeText(state?.name || "待机"),
    trigger: normalizeText(state?.trigger || state?.kind || "idle"),
    image: normalizeText(state?.image || ""),
    message: normalizeText(state?.message || ""),
    transparentImage: normalizeText(state?.transparentImage || ""),
    assembledImage: normalizeText(state?.assembledImage || ""),
    frames: Array.isArray(state?.frames) ? state.frames.map((frame) => normalizeText(frame)).filter(Boolean).slice(0, 16) : [],
    duration: Math.max(480, Number(state?.duration) || desktopPetFrameDuration(state?.trigger || "idle")),
    assembledAt: normalizeText(state?.assembledAt || ""),
  };
}
function normalizeDesktopPet(pet) {
  const states = Array.isArray(pet?.states) ? pet.states.map(normalizeDesktopPetState) : [];
  const fallbackStates = states.length ? states : desktopPetDefaultStates();
  return {
    id: pet?.id || crypto.randomUUID(),
    name: normalizeText(pet?.name || "资料库桌宠"),
    persona: normalizeText(pet?.persona || "温柔、简洁、只根据当前资料库回答。"),
    assembledAt: normalizeText(pet?.assembledAt || ""),
    activeStateId: pet?.activeStateId || fallbackStates[0]?.id || "",
    states: fallbackStates,
  };
}
function desktopPetPayload() {
  return { activePetId: activeDesktopPetId, pets: desktopPets.map(normalizeDesktopPet) };
}
function setDesktopPetStatus(message, type = "") {
  const node = $("desktopPetStatus");
  if (!node) return;
  node.textContent = message;
  node.className = "status-text" + (type ? " " + type : "");
}
function createDesktopPet() {
  const pet = normalizeDesktopPet({ name: "资料库桌宠" });
  desktopPets.push(pet);
  activeDesktopPetId = pet.id;
  saveDesktopPets();
  renderDesktopPetManager();
  setDesktopPetStatus("已创建新桌宠。先给她改个名字，再拖入动作图片。", "success");
}
function deleteDesktopPet(petId) {
  if (!confirm("确定删除这个桌宠？")) return;
  desktopPets = desktopPets.filter((pet) => pet.id !== petId);
  activeDesktopPetId = desktopPets[0]?.id || "";
  saveDesktopPets();
  renderDesktopPetManager();
}
function addDesktopPetAction() {
  const pet = activeDesktopPet();
  if (!pet) { createDesktopPet(); return; }
  const state = normalizeDesktopPetState({ id: crypto.randomUUID(), name: "新动作", trigger: "custom", image: "", message: "" });
  pet.states.push(state);
  pet.activeStateId = state.id;
  saveDesktopPets();
  renderDesktopPetManager();
}
function deleteDesktopPetAction(stateId) {
  const pet = activeDesktopPet();
  if (!pet) return;
  pet.states = pet.states.filter((state) => state.id !== stateId);
  if (!pet.states.length) pet.states = desktopPetDefaultStates();
  pet.activeStateId = pet.states[0]?.id || "";
  saveDesktopPets();
  renderDesktopPetManager();
}
function desktopPetImagePreview(state) {
  const src = state?.assembledImage || state?.transparentImage || state?.image || "";
  if (!src) return '<div class="desktop-pet-placeholder">拖入图片</div>';
  return '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(state?.name || "桌宠动作") + '" />';
}
function renderDesktopPetManager() {
  if (isReadOnlyMode()) return;
  const list = $("desktopPetList");
  const actions = $("desktopPetActions");
  if (!list || !actions) return;
  if (!desktopPets.length) createDesktopPet();
  const pet = activeDesktopPet();
  if ($("desktopPetName")) $("desktopPetName").value = pet?.name || "";
  if ($("desktopPetPersona")) $("desktopPetPersona").value = pet?.persona || "";
  list.innerHTML = desktopPets.map((entry) => {
    const imageState = entry.states.find((state) => state.assembledImage || state.transparentImage || state.image) || entry.states[0] || {};
    const assembledCount = entry.states.filter((state) => Array.isArray(state.frames) && state.frames.length).length;
    return '<button class="desktop-pet-card' + (entry.id === activeDesktopPetId ? ' active' : '') + '" data-pet-id="' + escapeHtml(entry.id) + '">' +
      '<span class="desktop-pet-card-art">' + desktopPetImagePreview(imageState) + '</span>' +
      '<strong>' + escapeHtml(entry.name) + '</strong>' +
      '<small>' + entry.states.length + ' 个状态 · ' + assembledCount + ' 个已组装</small>' +
      '</button>';
  }).join("");
  if (!pet) { actions.innerHTML = '<p class="desc">还没有桌宠。</p>'; return; }
  actions.innerHTML = pet.states.map((state) => {
    const isActive = state.id === pet.activeStateId;
    const frameCount = Array.isArray(state.frames) ? state.frames.length : 0;
    const badgeClass = frameCount ? "" : (state.image ? " muted" : " warning");
    const badgeText = frameCount ? "已组装 " + frameCount + " 帧" : (state.image ? "待组装" : "待素材");
    return '<article class="desktop-pet-action' + (isActive ? ' active' : '') + '" data-state-id="' + escapeHtml(state.id) + '">' +
      '<div class="desktop-pet-drop-wrap">' +
      '<button type="button" class="desktop-pet-drop" data-pet-upload="' + escapeHtml(state.id) + '">' + desktopPetImagePreview(state) + '</button>' +
      '<span class="desktop-pet-frame-badge' + badgeClass + '">' + escapeHtml(badgeText) + '</span>' +
      '</div>' +
      '<div class="desktop-pet-action-fields">' +
      '<label>状态名<input class="desktop-pet-state-name" data-state-id="' + escapeHtml(state.id) + '" value="' + escapeHtml(state.name) + '" /></label>' +
      '<label>触发类型<select class="desktop-pet-state-trigger" data-state-id="' + escapeHtml(state.id) + '">' +
      ["idle", "happy", "thinking", "sleep", "walk", "custom"].map((trigger) => '<option value="' + trigger + '"' + (state.trigger === trigger ? ' selected' : '') + '>' + trigger + '</option>').join("") +
      '</select></label>' +
      '<label class="wide">互动台词<input class="desktop-pet-state-message" data-state-id="' + escapeHtml(state.id) + '" value="' + escapeHtml(state.message) + '" placeholder="点到这个状态时说什么" /></label>' +
      '</div>' +
      '<div class="desktop-pet-action-buttons">' +
      '<button class="desktop-pet-set-active" data-state-id="' + escapeHtml(state.id) + '">' + (isActive ? '默认状态' : '设为默认') + '</button>' +
      '<button class="desktop-pet-pick-image" data-state-id="' + escapeHtml(state.id) + '">选择图片</button>' +
      '<button class="desktop-pet-remove-action" data-state-id="' + escapeHtml(state.id) + '"' + (pet.states.length <= 1 ? ' disabled' : '') + '>删除</button>' +
      '</div>' +
      '</article>';
  }).join("");
}
function updateDesktopPetForm() {
  const pet = activeDesktopPet();
  if (!pet) return;
  pet.name = normalizeText($("desktopPetName")?.value || pet.name) || "资料库桌宠";
  pet.persona = normalizeText($("desktopPetPersona")?.value || pet.persona);
  saveDesktopPets();
  renderDesktopPetManager();
}
function resetDesktopPetAssemblyState(state) {
  state.transparentImage = "";
  state.assembledImage = "";
  state.frames = [];
  state.assembledAt = "";
}
function updateDesktopPetState(stateId, patch) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state) return;
  if (patch.trigger && patch.trigger !== state.trigger) resetDesktopPetAssemblyState(state);
  Object.assign(state, patch);
  saveDesktopPets();
}
async function uploadDesktopPetImage(file, stateId) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state || !file) return;
  setDesktopPetStatus("正在保存桌宠素材...");
  try {
    const dataUrl = await readFileAsDataUrl(file);
    const imageSrc = await persistUploadedUiImage(dataUrl, "desktop-pet");
    state.image = imageSrc;
    resetDesktopPetAssemblyState(state);
    pet.activeStateId = state.id;
    saveDesktopPets();
    renderDesktopPetManager();
    setDesktopPetStatus("素材已加入动作：" + state.name + "。点击“组装桌宠”会自动抠除白底并生成动态帧。", "success");
  } catch (error) {
    setDesktopPetStatus("图片保存失败：" + error.message, "error");
  }
}
function openDesktopPetWindow() {
  const pet = activeDesktopPet();
  if (!pet) { createDesktopPet(); return; }
  saveDesktopPets();
  const url = "./pet.html?pet=" + encodeURIComponent(pet.id) + "&v=" + Date.now();
  const popup = window.open(url, "ace-racer-desktop-pet-" + pet.id, "popup=yes,width=440,height=580,left=120,top=120");
  if (!popup) setDesktopPetStatus("浏览器阻止了弹窗。请允许本站弹窗后再点一次打开桌宠。", "error");
}
function desktopPetMotionFrames(trigger) {
  const motions = {
    idle: [
      { y: 0, scale: 1, rotate: 0 },
      { y: -4, scale: 1.01, rotate: -0.4 },
      { y: -7, scale: 1.016, rotate: 0 },
      { y: -4, scale: 1.01, rotate: 0.4 },
      { y: 0, scale: 1, rotate: 0 },
      { y: 3, scale: 0.995, rotate: 0 },
    ],
    happy: [
      { y: 0, scale: 1, rotate: 0 },
      { y: -12, scale: 1.035, rotate: -2.5 },
      { y: -4, scale: 1.02, rotate: 2.5 },
      { y: -10, scale: 1.035, rotate: -1.5 },
      { y: 0, scale: 1, rotate: 1 },
      { y: 4, scale: 0.985, rotate: 0 },
    ],
    thinking: [
      { y: 0, scale: 1, rotate: -1.5 },
      { y: -3, scale: 1.005, rotate: -3 },
      { y: 0, scale: 1, rotate: -1 },
      { y: -2, scale: 1.006, rotate: 1.2 },
      { y: 0, scale: 1, rotate: 0 },
    ],
    sleep: [
      { y: 2, scale: 0.995, rotate: 0 },
      { y: 0, scale: 1.004, rotate: 0 },
      { y: -2, scale: 1.01, rotate: 0 },
      { y: 0, scale: 1.004, rotate: 0 },
    ],
    walk: [
      { x: -6, y: 0, scale: 1, rotate: -2 },
      { x: 2, y: -7, scale: 1.02, rotate: 2 },
      { x: 7, y: 0, scale: 1, rotate: 2 },
      { x: -1, y: -6, scale: 1.02, rotate: -2 },
    ],
    custom: [
      { y: 0, scale: 1, rotate: 0 },
      { y: -4, scale: 1.012, rotate: -0.8 },
      { y: 0, scale: 1, rotate: 0.8 },
      { y: 3, scale: 0.996, rotate: 0 },
    ],
  };
  return motions[trigger] || motions.custom;
}
function loadDesktopPetImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("桌宠素材无法读取")));
    image.src = src;
  });
}
function isDesktopPetWhiteBackgroundPixel(data, index) {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = data[index + 3];
  if (a < 8) return true;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return r > 214 && g > 214 && b > 214 && spread < 42;
}
async function stripDesktopPetWhiteBackground(src) {
  const image = await loadDesktopPetImage(src);
  const maxSize = 760;
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height);
  const data = pixels.data;
  const visited = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const key = y * width + x;
    if (visited[key]) return;
    const index = key * 4;
    if (!isDesktopPetWhiteBackgroundPixel(data, index)) return;
    visited[key] = 1;
    stack.push(key);
  };
  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }
  while (stack.length) {
    const key = stack.pop();
    const x = key % width;
    const y = Math.floor(key / width);
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  for (let key = 0; key < visited.length; key += 1) {
    if (!visited[key]) continue;
    data[key * 4 + 3] = 0;
  }
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const key = y * width + x;
      if (visited[key]) continue;
      const edge = visited[key - 1] || visited[key + 1] || visited[key - width] || visited[key + width];
      if (!edge) continue;
      const index = key * 4;
      if (isDesktopPetWhiteBackgroundPixel(data, index)) data[index + 3] = Math.min(data[index + 3], 96);
    }
  }
  context.putImageData(pixels, 0, 0);
  return await canvasToDataUrl(canvas, "image/png");
}
async function buildDesktopPetAnimationFrames(src, trigger) {
  const image = await loadDesktopPetImage(src);
  const maxWidth = 430;
  const maxHeight = 500;
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const scale = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);
  const drawWidth = Math.max(1, Math.round(naturalWidth * scale));
  const drawHeight = Math.max(1, Math.round(naturalHeight * scale));
  const padX = Math.max(22, Math.round(drawWidth * 0.13));
  const padY = Math.max(26, Math.round(drawHeight * 0.13));
  const canvas = document.createElement("canvas");
  canvas.width = drawWidth + padX * 2;
  canvas.height = drawHeight + padY * 2;
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  const frames = [];
  for (const frame of desktopPetMotionFrames(trigger)) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2 + (frame.x || 0), canvas.height / 2 + (frame.y || 0));
    context.rotate(((frame.rotate || 0) * Math.PI) / 180);
    context.scale(frame.scale || 1, frame.scale || 1);
    context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    context.restore();
    frames.push(await canvasToDataUrl(canvas, "image/png"));
  }
  return frames;
}
function setDesktopPetAssemblyProgress(steps, currentIndex) {
  const wrapper = $("desktopPetAssembly");
  const bar = $("desktopPetProgressBar");
  const list = $("desktopPetProgressSteps");
  if (!wrapper || !bar || !list) return;
  wrapper.classList.remove("hidden");
  const safeSteps = steps.length ? steps : ["等待组装"];
  const percent = Math.round(Math.min(1, Math.max(0, (currentIndex + 1) / safeSteps.length)) * 100);
  bar.style.width = percent + "%";
  list.innerHTML = safeSteps.map((step, index) => {
    const className = index < currentIndex ? "done" : (index === currentIndex ? "active" : "");
    return '<li class="' + className + '">' + escapeHtml(step) + '</li>';
  }).join("");
}
async function assembleDesktopPet() {
  const pet = activeDesktopPet();
  if (!pet) { createDesktopPet(); return; }
  const states = pet.states.filter((state) => state.image);
  if (!states.length) {
    setDesktopPetStatus("请先给至少一个动作拖入图片素材。", "error");
    return;
  }
  const steps = states.flatMap((state) => [
    state.name + "：抠除白底",
    state.name + "：生成动作帧",
    state.name + "：保存动态素材",
  ]).concat(["写入桌宠配置"]);
  let stepIndex = 0;
  setDesktopPetStatus("正在组装桌宠...");
  setDesktopPetAssemblyProgress(steps, stepIndex);
  try {
    for (const state of states) {
      setDesktopPetAssemblyProgress(steps, stepIndex);
      const transparentDataUrl = await stripDesktopPetWhiteBackground(state.image);
      state.transparentImage = await persistUploadedUiImage(transparentDataUrl, "desktop-pet");
      stepIndex += 1;
      setDesktopPetAssemblyProgress(steps, stepIndex);
      const frameDataUrls = await buildDesktopPetAnimationFrames(state.transparentImage, state.trigger);
      stepIndex += 1;
      setDesktopPetAssemblyProgress(steps, stepIndex);
      const savedFrames = [];
      for (const frameDataUrl of frameDataUrls) {
        savedFrames.push(await persistUploadedUiImage(frameDataUrl, "desktop-pet"));
      }
      state.frames = savedFrames;
      state.assembledImage = savedFrames[0] || state.transparentImage;
      state.duration = desktopPetFrameDuration(state.trigger);
      state.assembledAt = new Date().toISOString();
      stepIndex += 1;
    }
    pet.assembledAt = new Date().toISOString();
    setDesktopPetAssemblyProgress(steps, steps.length - 1);
    saveDesktopPets();
    renderDesktopPetManager();
    setDesktopPetStatus("组装完成。打开桌宠后会自动播放动态效果，切换动作也会过渡。", "success");
  } catch (error) {
    setDesktopPetStatus("组装失败：" + error.message, "error");
  }
}
function hatchPetRows() {
  return [
    { row: 0, trigger: "idle", name: "待机", frames: 6, durations: [280, 110, 110, 140, 140, 320], message: "我在这里。点我可以问资料库。" },
    { row: 1, trigger: "running-right", name: "向右拖动", frames: 8, durations: [120, 120, 120, 120, 120, 120, 120, 220], message: "我跟着你走。" },
    { row: 2, trigger: "running-left", name: "向左拖动", frames: 8, durations: [120, 120, 120, 120, 120, 120, 120, 220], message: "往这边也可以。" },
    { row: 3, trigger: "waving", name: "挥手", frames: 4, durations: [140, 140, 140, 280], message: "你好呀。" },
    { row: 4, trigger: "jumping", name: "跳跃", frames: 5, durations: [140, 140, 140, 140, 280], message: "收到。" },
    { row: 5, trigger: "failed", name: "失败", frames: 8, durations: [140, 140, 140, 140, 140, 140, 140, 240], message: "这次没找到合适结果。" },
    { row: 6, trigger: "waiting", name: "等待", frames: 6, durations: [150, 150, 150, 150, 150, 260], message: "我在等你的下一步。" },
    { row: 7, trigger: "running", name: "处理中", frames: 6, durations: [120, 120, 120, 120, 120, 220], message: "我正在处理资料。" },
    { row: 8, trigger: "review", name: "审阅", frames: 6, durations: [150, 150, 150, 150, 150, 280], message: "我来仔细看看。" },
  ];
}
function hatchPetRowByTrigger(trigger) {
  return hatchPetRows().find((row) => row.trigger === trigger) || hatchPetRows()[0];
}
function legacyHatchTrigger(trigger) {
  const map = { happy: "waving", thinking: "running", sleep: "sleep-loop", walk: "running-right", custom: "review" };
  return map[trigger] || trigger || "idle";
}
function desktopPetDefaultStates() {
  return hatchPetRows().map((row) => ({
    id: row.trigger,
    row: row.row,
    name: row.name,
    trigger: row.trigger,
    image: "",
    message: row.message,
    transparentImage: "",
    assembledImage: "",
    frames: [],
    durations: row.durations,
    frameCount: row.frames,
    duration: row.durations.reduce((sum, value) => sum + value, 0),
    assembledAt: "",
    sourceKind: "material",
  }));
}
function desktopPetFrameDuration(trigger) {
  return hatchPetRowByTrigger(legacyHatchTrigger(trigger)).durations.reduce((sum, value) => sum + value, 0);
}
function normalizeDesktopPetState(state) {
  const trigger = legacyHatchTrigger(normalizeText(state?.trigger || state?.kind || "idle"));
  const spec = hatchPetRowByTrigger(trigger);
  return {
    id: state?.id || spec.trigger,
    row: Number.isFinite(Number(state?.row)) ? Number(state.row) : spec.row,
    name: normalizeText(state?.name || spec.name),
    trigger: spec.trigger,
    image: normalizeText(state?.image || ""),
    message: normalizeText(state?.message || spec.message),
    transparentImage: normalizeText(state?.transparentImage || ""),
    assembledImage: normalizeText(state?.assembledImage || ""),
    frames: Array.isArray(state?.frames) ? state.frames.map((frame) => normalizeText(frame)).filter(Boolean).slice(0, spec.frames) : [],
    durations: Array.isArray(state?.durations) && state.durations.length ? state.durations.map((value) => Math.max(60, Number(value) || 120)).slice(0, spec.frames) : spec.durations,
    frameCount: spec.frames,
    duration: Math.max(360, Number(state?.duration) || spec.durations.reduce((sum, value) => sum + value, 0)),
    assembledAt: normalizeText(state?.assembledAt || ""),
    sourceKind: normalizeText(state?.sourceKind || "material"),
  };
}
function normalizeDesktopPet(pet) {
  const incoming = Array.isArray(pet?.states) ? pet.states.map(normalizeDesktopPetState) : [];
  const byTrigger = new Map();
  incoming.forEach((state) => {
    if (!byTrigger.has(state.trigger)) byTrigger.set(state.trigger, state);
  });
  const states = hatchPetRows().map((row) => {
    const existing = byTrigger.get(row.trigger);
    return normalizeDesktopPetState(existing || {
      id: row.trigger,
      row: row.row,
      name: row.name,
      trigger: row.trigger,
      message: row.message,
      durations: row.durations,
    });
  });
  return {
    id: pet?.id || crypto.randomUUID(),
    name: normalizeText(pet?.name || "资料库桌宠"),
    persona: normalizeText(pet?.persona || "温柔、简洁、只根据当前资料库回答。"),
    assembledAt: normalizeText(pet?.assembledAt || ""),
    activeStateId: pet?.activeStateId || states[0]?.id || "",
    states,
    hatchPet: pet?.hatchPet && typeof pet.hatchPet === "object" ? pet.hatchPet : null,
    spritesheetImage: normalizeText(pet?.spritesheetImage || ""),
    petJson: pet?.petJson && typeof pet.petJson === "object" ? pet.petJson : null,
  };
}
function desktopPetPayload() {
  return { activePetId: activeDesktopPetId, pets: desktopPets.map(normalizeDesktopPet) };
}
function setDesktopPetStatus(message, type = "") {
  const node = $("desktopPetStatus");
  if (!node) return;
  node.textContent = message;
  node.className = "status-text" + (type ? " " + type : "");
}
function createDesktopPet() {
  const pet = normalizeDesktopPet({ name: "资料库桌宠" });
  desktopPets.push(pet);
  activeDesktopPetId = pet.id;
  saveDesktopPets();
  renderDesktopPetManager();
  setDesktopPetStatus("已创建新桌宠。按 hatch-pet 的 9 个标准动作上传素材或动作条。", "success");
}
function addDesktopPetAction() {
  setDesktopPetStatus("hatch-pet 桌宠使用固定 9 个标准动作行。请在对应动作行里上传素材或动作条。", "success");
}
function deleteDesktopPetAction(stateId) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state) return;
  state.image = "";
  resetDesktopPetAssemblyState(state);
  saveDesktopPets();
  renderDesktopPetManager();
}
function desktopPetImagePreview(state) {
  const src = state?.assembledImage || state?.transparentImage || state?.image || "";
  if (!src) return '<div class="desktop-pet-placeholder">上传素材<br/>或动作条</div>';
  return '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(state?.name || "桌宠动作") + '" />';
}
function renderDesktopPetManager() {
  if (isReadOnlyMode()) return;
  const list = $("desktopPetList");
  const actions = $("desktopPetActions");
  if (!list || !actions) return;
  if (!desktopPets.length) createDesktopPet();
  const pet = activeDesktopPet();
  if ($("desktopPetName")) $("desktopPetName").value = pet?.name || "";
  if ($("desktopPetPersona")) $("desktopPetPersona").value = pet?.persona || "";
  list.innerHTML = desktopPets.map((entry) => {
    const imageState = entry.states.find((state) => state.assembledImage || state.transparentImage || state.image) || entry.states[0] || {};
    const assembledCount = entry.states.filter((state) => Array.isArray(state.frames) && state.frames.length >= (state.frameCount || 1)).length;
    const atlasLabel = entry.spritesheetImage ? " · atlas 已生成" : "";
    return '<button class="desktop-pet-card' + (entry.id === activeDesktopPetId ? ' active' : '') + '" data-pet-id="' + escapeHtml(entry.id) + '">' +
      '<span class="desktop-pet-card-art">' + desktopPetImagePreview(imageState) + '</span>' +
      '<strong>' + escapeHtml(entry.name) + '</strong>' +
      '<small>hatch-pet · ' + assembledCount + '/9 动作' + atlasLabel + '</small>' +
      '</button>';
  }).join("");
  if (!pet) { actions.innerHTML = '<p class="desc">还没有桌宠。</p>'; return; }
  actions.innerHTML = pet.states.map((state) => {
    const isActive = state.id === pet.activeStateId;
    const frameCount = Array.isArray(state.frames) ? state.frames.length : 0;
    const needed = state.frameCount || hatchPetRowByTrigger(state.trigger).frames;
    const badgeClass = frameCount >= needed ? "" : (state.image ? " muted" : " warning");
    const sourceText = state.sourceKind === "row-strip" ? "动作条" : "单图素材";
    const badgeText = frameCount >= needed ? "已组装 " + frameCount + "/" + needed + " 帧" : (state.image ? "待组装 · " + sourceText : "待素材");
    return '<article class="desktop-pet-action' + (isActive ? ' active' : '') + '" data-state-id="' + escapeHtml(state.id) + '">' +
      '<div class="desktop-pet-drop-wrap">' +
      '<button type="button" class="desktop-pet-drop" data-pet-upload="' + escapeHtml(state.id) + '">' + desktopPetImagePreview(state) + '</button>' +
      '<span class="desktop-pet-frame-badge' + badgeClass + '">' + escapeHtml(badgeText) + '</span>' +
      '</div>' +
      '<div class="desktop-pet-action-fields">' +
      '<label>动作行<input class="desktop-pet-state-name" data-state-id="' + escapeHtml(state.id) + '" value="' + escapeHtml(state.name) + '" /></label>' +
      '<label>hatch-pet 状态<select class="desktop-pet-state-trigger" data-state-id="' + escapeHtml(state.id) + '">' +
      hatchPetRows().map((row) => '<option value="' + row.trigger + '"' + (state.trigger === row.trigger ? ' selected' : '') + '>' + row.row + ' · ' + row.trigger + '</option>').join("") +
      '</select></label>' +
      '<label class="wide">互动台词<input class="desktop-pet-state-message" data-state-id="' + escapeHtml(state.id) + '" value="' + escapeHtml(state.message) + '" placeholder="点到这个动作时说什么" /></label>' +
      '<p class="desktop-pet-contract-note">第 ' + state.row + ' 行 · 需要 ' + needed + ' 帧 · 上传单图会自动生成，上传横向动作条会按格切帧。</p>' +
      '</div>' +
      '<div class="desktop-pet-action-buttons">' +
      '<button class="desktop-pet-set-active" data-state-id="' + escapeHtml(state.id) + '">' + (isActive ? '默认状态' : '设为默认') + '</button>' +
      '<button class="desktop-pet-pick-image" data-state-id="' + escapeHtml(state.id) + '">上传素材</button>' +
      '<button class="desktop-pet-remove-action" data-state-id="' + escapeHtml(state.id) + '">清空</button>' +
      '</div>' +
      '</article>';
  }).join("");
}
function updateDesktopPetForm() {
  const pet = activeDesktopPet();
  if (!pet) return;
  pet.name = normalizeText($("desktopPetName")?.value || pet.name) || "资料库桌宠";
  pet.persona = normalizeText($("desktopPetPersona")?.value || pet.persona);
  saveDesktopPets();
  renderDesktopPetManager();
}
function resetDesktopPetAssemblyState(state) {
  state.transparentImage = "";
  state.assembledImage = "";
  state.frames = [];
  state.assembledAt = "";
  state.sourceKind = state.sourceKind || "material";
}
function updateDesktopPetState(stateId, patch) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state) return;
  if (patch.trigger && patch.trigger !== state.trigger) {
    const spec = hatchPetRowByTrigger(legacyHatchTrigger(patch.trigger));
    patch.trigger = spec.trigger;
    patch.row = spec.row;
    patch.frameCount = spec.frames;
    patch.durations = spec.durations;
    patch.duration = spec.durations.reduce((sum, value) => sum + value, 0);
    resetDesktopPetAssemblyState(state);
  }
  Object.assign(state, patch);
  saveDesktopPets();
}
async function detectHatchPetSourceKind(dataUrl, state) {
  try {
    const image = await loadDesktopPetImage(dataUrl);
    const spec = hatchPetRowByTrigger(state.trigger);
    const ratio = (image.naturalWidth || image.width) / Math.max(1, image.naturalHeight || image.height);
    return ratio >= Math.max(2.1, spec.frames * 0.55) ? "row-strip" : "material";
  } catch {
    return "material";
  }
}
async function uploadDesktopPetImage(file, stateId) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state || !file) return;
  setDesktopPetStatus("正在保存 hatch-pet 素材...");
  try {
    const dataUrl = await readFileAsDataUrl(file);
    state.sourceKind = await detectHatchPetSourceKind(dataUrl, state);
    const imageSrc = await persistUploadedUiImage(dataUrl, "desktop-pet");
    state.image = imageSrc;
    resetDesktopPetAssemblyState(state);
    state.sourceKind = await detectHatchPetSourceKind(dataUrl, state);
    pet.activeStateId = state.id;
    saveDesktopPets();
    renderDesktopPetManager();
    const kindText = state.sourceKind === "row-strip" ? "动作条" : "单图素材";
    setDesktopPetStatus("已加入 " + state.name + " 的" + kindText + "。点击“组装桌宠”会按 hatch-pet 规格生成图集。", "success");
  } catch (error) {
    setDesktopPetStatus("图片保存失败：" + error.message, "error");
  }
}
function openDesktopPetWindow() {
  const pet = activeDesktopPet();
  if (!pet) { createDesktopPet(); return; }
  saveDesktopPets();
  const url = "./pet.html?pet=" + encodeURIComponent(pet.id) + "&v=" + Date.now();
  const popup = window.open(url, "ace-racer-desktop-pet-" + pet.id, "popup=yes,width=440,height=580,left=120,top=120");
  if (!popup) setDesktopPetStatus("浏览器阻止了弹窗。请允许本站弹窗后再点一次打开桌宠。", "error");
}
function hatchPetMotionFrames(trigger) {
  const base = {
    idle: [
      { y: 2, scale: 0.998, rotate: 0 },
      { y: 0, scale: 1.004, rotate: -0.3 },
      { y: -3, scale: 1.008, rotate: 0 },
      { y: -2, scale: 1.006, rotate: 0.3 },
      { y: 0, scale: 1.002, rotate: 0 },
      { y: 2, scale: 0.998, rotate: 0 },
    ],
    "running-right": [
      { x: -8, y: 1, scale: 1, rotate: -2 },
      { x: -5, y: -5, scale: 1.018, rotate: 2 },
      { x: -1, y: 0, scale: 1, rotate: 1 },
      { x: 3, y: -6, scale: 1.018, rotate: -2 },
      { x: 7, y: 0, scale: 1, rotate: 2 },
      { x: 4, y: -4, scale: 1.014, rotate: -1 },
      { x: 0, y: 1, scale: 1, rotate: 1 },
      { x: -4, y: 0, scale: 0.998, rotate: 0 },
    ],
    "running-left": [
      { x: 8, y: 1, scale: 1, rotate: 2, flipX: true },
      { x: 5, y: -5, scale: 1.018, rotate: -2, flipX: true },
      { x: 1, y: 0, scale: 1, rotate: -1, flipX: true },
      { x: -3, y: -6, scale: 1.018, rotate: 2, flipX: true },
      { x: -7, y: 0, scale: 1, rotate: -2, flipX: true },
      { x: -4, y: -4, scale: 1.014, rotate: 1, flipX: true },
      { x: 0, y: 1, scale: 1, rotate: -1, flipX: true },
      { x: 4, y: 0, scale: 0.998, rotate: 0, flipX: true },
    ],
    waving: [
      { y: 0, scale: 1, rotate: 0 },
      { y: -4, scale: 1.016, rotate: -3 },
      { y: -5, scale: 1.02, rotate: 3 },
      { y: 0, scale: 1, rotate: 0 },
    ],
    jumping: [
      { y: 4, scale: 0.985, rotate: 0 },
      { y: -7, scale: 1.015, rotate: -1 },
      { y: -18, scale: 1.028, rotate: 0 },
      { y: -7, scale: 1.015, rotate: 1 },
      { y: 3, scale: 0.992, rotate: 0 },
    ],
    failed: [
      { y: 0, scale: 1, rotate: 0 },
      { y: 3, scale: 0.99, rotate: -2 },
      { y: 5, scale: 0.982, rotate: 2 },
      { y: 4, scale: 0.986, rotate: -1 },
      { y: 6, scale: 0.978, rotate: 1 },
      { y: 5, scale: 0.982, rotate: -1 },
      { y: 3, scale: 0.99, rotate: 0 },
      { y: 0, scale: 1, rotate: 0 },
    ],
    waiting: [
      { y: 0, scale: 1, rotate: 0 },
      { y: -2, scale: 1.004, rotate: -1 },
      { y: -4, scale: 1.008, rotate: -2 },
      { y: -2, scale: 1.004, rotate: 1 },
      { y: 0, scale: 1, rotate: 0 },
      { y: 2, scale: 0.998, rotate: 0 },
    ],
    running: [
      { y: 0, scale: 1, rotate: -1 },
      { y: -2, scale: 1.006, rotate: -2 },
      { y: -3, scale: 1.01, rotate: 1 },
      { y: -1, scale: 1.004, rotate: 2 },
      { y: 0, scale: 1, rotate: 0 },
      { y: 1, scale: 0.998, rotate: -1 },
    ],
    review: [
      { y: 0, scale: 1, rotate: -1 },
      { y: -2, scale: 1.004, rotate: -2.5 },
      { y: -1, scale: 1.002, rotate: -1.5 },
      { y: 0, scale: 1, rotate: 1 },
      { y: -2, scale: 1.004, rotate: 2 },
      { y: 0, scale: 1, rotate: 0 },
    ],
  };
  return base[trigger] || base.idle;
}
function isHatchPetBackgroundPixel(data, index) {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = data[index + 3];
  if (a < 8) return true;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const nearWhite = r > 214 && g > 214 && b > 214 && spread < 46;
  const chromaGreen = g > 150 && r < 120 && b < 150 && g > r * 1.35 && g > b * 1.35;
  return nearWhite || chromaGreen;
}
function cleanupHatchPetCell(canvas) {
  const width = canvas.width;
  const height = canvas.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const pixels = context.getImageData(0, 0, width, height);
  const data = pixels.data;
  const visited = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const key = y * width + x;
    if (visited[key]) return;
    if (!isHatchPetBackgroundPixel(data, key * 4)) return;
    visited[key] = 1;
    stack.push(key);
  };
  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }
  while (stack.length) {
    const key = stack.pop();
    const x = key % width;
    const y = Math.floor(key / width);
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  for (let key = 0; key < visited.length; key += 1) {
    if (!visited[key]) continue;
    const index = key * 4;
    data[index] = 0;
    data[index + 1] = 0;
    data[index + 2] = 0;
    data[index + 3] = 0;
  }
  context.putImageData(pixels, 0, 0);
}
function drawImageIntoHatchCell(context, image, motion, sourceRect) {
  const cellWidth = 192;
  const cellHeight = 208;
  const sx = sourceRect?.sx || 0;
  const sy = sourceRect?.sy || 0;
  const sw = sourceRect?.sw || (image.naturalWidth || image.width);
  const sh = sourceRect?.sh || (image.naturalHeight || image.height);
  const baseScale = motion.fitFull ? Math.min(192 / sw, 208 / sh) : Math.min(1, 172 / sw, 190 / sh);
  const scale = baseScale * (motion.scale || 1);
  const drawWidth = Math.max(1, Math.round(sw * scale));
  const drawHeight = Math.max(1, Math.round(sh * scale));
  context.save();
  context.translate(cellWidth / 2 + (motion.x || 0), cellHeight / 2 + (motion.y || 0));
  context.rotate(((motion.rotate || 0) * Math.PI) / 180);
  context.scale(motion.flipX ? -1 : 1, 1);
  context.drawImage(image, sx, sy, sw, sh, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  context.restore();
}
async function buildHatchPetFramesFromMaterial(src, state) {
  const image = await loadDesktopPetImage(src);
  const frames = [];
  for (const motion of hatchPetMotionFrames(state.trigger)) {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 208;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    drawImageIntoHatchCell(context, image, motion);
    cleanupHatchPetCell(canvas);
    frames.push(await canvasToDataUrl(canvas, "image/png"));
  }
  return frames.slice(0, state.frameCount || hatchPetRowByTrigger(state.trigger).frames);
}
async function extractHatchPetFramesFromStrip(src, state) {
  const image = await loadDesktopPetImage(src);
  const spec = hatchPetRowByTrigger(state.trigger);
  const frameCount = spec.frames;
  const frameWidth = (image.naturalWidth || image.width) / frameCount;
  const frameHeight = image.naturalHeight || image.height;
  const frames = [];
  for (let index = 0; index < frameCount; index += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 208;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    drawImageIntoHatchCell(context, image, { scale: 1, fitFull: true }, { sx: index * frameWidth, sy: 0, sw: frameWidth, sh: frameHeight });
    cleanupHatchPetCell(canvas);
    frames.push(await canvasToDataUrl(canvas, "image/png"));
  }
  return frames;
}
async function firstHatchPetFrameFromStrip(src, state) {
  const image = await loadDesktopPetImage(src);
  const spec = hatchPetRowByTrigger(state.trigger);
  const frameWidth = (image.naturalWidth || image.width) / spec.frames;
  const frameHeight = image.naturalHeight || image.height;
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 208;
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  drawImageIntoHatchCell(context, image, { fitFull: true }, { sx: 0, sy: 0, sw: frameWidth, sh: frameHeight });
  cleanupHatchPetCell(canvas);
  return await canvasToDataUrl(canvas, "image/png");
}
async function mirrorHatchPetFrames(frameDataUrls) {
  const mirrored = [];
  for (const src of frameDataUrls) {
    const image = await loadDesktopPetImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 208;
    const context = canvas.getContext("2d");
    context.translate(192, 0);
    context.scale(-1, 1);
    context.drawImage(image, 0, 0, 192, 208);
    mirrored.push(await canvasToDataUrl(canvas, "image/png"));
  }
  return mirrored;
}
async function composeHatchPetAtlas(frameMap) {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 1872;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const spec of hatchPetRows()) {
    const frames = frameMap.get(spec.trigger) || [];
    for (let column = 0; column < Math.min(8, frames.length); column += 1) {
      const image = await loadDesktopPetImage(frames[column]);
      context.drawImage(image, column * 192, spec.row * 208, 192, 208);
    }
  }
  const webp = await canvasToDataUrl(canvas, "image/webp", 0.9);
  return webp && webp.startsWith("data:image/webp") ? webp : await canvasToDataUrl(canvas, "image/png");
}
function setDesktopPetAssemblyProgress(steps, currentIndex) {
  const wrapper = $("desktopPetAssembly");
  const bar = $("desktopPetProgressBar");
  const list = $("desktopPetProgressSteps");
  if (!wrapper || !bar || !list) return;
  wrapper.classList.remove("hidden");
  const safeSteps = steps.length ? steps : ["等待组装"];
  const percent = Math.round(Math.min(1, Math.max(0, (currentIndex + 1) / safeSteps.length)) * 100);
  bar.style.width = percent + "%";
  list.innerHTML = safeSteps.map((step, index) => {
    const className = index < currentIndex ? "done" : (index === currentIndex ? "active" : "");
    return '<li class="' + className + '">' + escapeHtml(step) + '</li>';
  }).join("");
}
async function assembleDesktopPet() {
  const pet = activeDesktopPet();
  if (!pet) { createDesktopPet(); return; }
  pet.states = normalizeDesktopPet(pet).states;
  const sourceState = pet.states.find((state) => state.image);
  if (!sourceState) {
    setDesktopPetStatus("请先至少上传一张素材。单图素材和横向动作条都可以。", "error");
    return;
  }
  const steps = hatchPetRows().flatMap((row) => [
    row.name + "：准备素材",
    row.name + "：生成 " + row.frames + " 帧",
    row.name + "：保存动作图",
  ]).concat(["合成 hatch-pet 图集", "写入 pet.json"]);
  let stepIndex = 0;
  const frameMap = new Map();
  setDesktopPetStatus("正在按 hatch-pet 规格组装桌宠...");
  setDesktopPetAssemblyProgress(steps, stepIndex);
  try {
    for (const spec of hatchPetRows()) {
      const state = pet.states.find((entry) => entry.trigger === spec.trigger);
      const hasOwnSource = Boolean(state?.image);
      const fallback = hasOwnSource ? state : sourceState;
      setDesktopPetAssemblyProgress(steps, stepIndex);
      let workingSource = fallback.image;
      let useKind = fallback.sourceKind;
      if (!hasOwnSource && fallback.sourceKind === "row-strip") {
        workingSource = await firstHatchPetFrameFromStrip(fallback.image, fallback);
        useKind = "material";
      }
      if (useKind !== "row-strip") {
        const transparentDataUrl = await stripDesktopPetWhiteBackground(workingSource);
        state.transparentImage = await persistUploadedUiImage(transparentDataUrl, "desktop-pet");
        workingSource = state.transparentImage;
      }
      stepIndex += 1;
      setDesktopPetAssemblyProgress(steps, stepIndex);
      let frameDataUrls;
      if (spec.trigger === "running-left" && !state.image && frameMap.has("running-right")) {
        frameDataUrls = await mirrorHatchPetFrames(frameMap.get("running-right"));
      } else if (useKind === "row-strip") {
        frameDataUrls = await extractHatchPetFramesFromStrip(workingSource, state);
      } else {
        frameDataUrls = await buildHatchPetFramesFromMaterial(workingSource, state);
      }
      frameMap.set(spec.trigger, frameDataUrls);
      stepIndex += 1;
      setDesktopPetAssemblyProgress(steps, stepIndex);
      const savedFrames = [];
      for (const frameDataUrl of frameDataUrls) {
        savedFrames.push(await persistUploadedUiImage(frameDataUrl, "desktop-pet"));
      }
      state.frames = savedFrames;
      state.assembledImage = savedFrames[0] || state.transparentImage || state.image;
      state.durations = spec.durations;
      state.duration = spec.durations.reduce((sum, value) => sum + value, 0);
      state.frameCount = spec.frames;
      state.row = spec.row;
      state.assembledAt = new Date().toISOString();
      stepIndex += 1;
    }
    setDesktopPetAssemblyProgress(steps, stepIndex);
    const atlasDataUrl = await composeHatchPetAtlas(frameMap);
    pet.spritesheetImage = await persistUploadedUiImage(atlasDataUrl, "desktop-pet");
    pet.hatchPet = { version: "hatch-pet-contract-v1", cellWidth: 192, cellHeight: 208, columns: 8, rows: 9, atlasWidth: 1536, atlasHeight: 1872, states: hatchPetRows() };
    stepIndex += 1;
    setDesktopPetAssemblyProgress(steps, stepIndex);
    const petId = (pet.name || "desktop-pet").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "") || pet.id;
    pet.petJson = {
      id: petId,
      displayName: pet.name || "资料库桌宠",
      description: pet.persona || "基于当前资料库回答问题的桌宠。",
      spritesheetPath: pet.spritesheetImage || "spritesheet.webp",
    };
    pet.assembledAt = new Date().toISOString();
    setDesktopPetAssemblyProgress(steps, steps.length - 1);
    saveDesktopPets();
    renderDesktopPetManager();
    setDesktopPetStatus("hatch-pet 组装完成：已生成 9 行动作、标准图集和 pet.json 数据。", "success");
  } catch (error) {
    setDesktopPetStatus("组装失败：" + error.message, "error");
  }
}
function renderGroupsBranch() {
  var q = ($("search")?.value||"").trim().toLowerCase();
  var f = groups.filter(function(g){return!q||g.name.toLowerCase().includes(q);});
  var items2 = items.filter(function(e){return e.type==="car";});
  function renderGroupCard(g){
    var ids = g.carIds||[];
    var thumbs = ids.map(function(cid){var ci=findItemById(cid);if(!ci)return"";var cn=displayVehicleName(ci);return'<div class="group-tooltip-car" data-item-id="'+escapeHtml(ci.id)+'">'+renderImageWithFallback([ci.image,ci.images],"",cn,"无图")+'<span>'+escapeHtml(cn)+'</span></div>';}).filter(Boolean).join("");
    var typeSel = activeGroupEdit===g.id?'<select data-group-id="'+escapeHtml(g.id)+'" class="group-type-select" style="width:100%;box-sizing:border-box;padding:4px 8px;border:1px solid var(--accent);border-radius:4px;font-size:12px"><option value="name"'+(g.type!=='lineup'?' selected':'')+'">名字组合</option><option value="lineup"'+(g.type==='lineup'?' selected':'')+'">阵容组合</option></select>':'';
    var nameHtml = activeGroupEdit===g.id?'<div style="display:grid;gap:6px;width:100%"><div style="display:flex;align-items:center;gap:6px">'+(g.type==='lineup'?'<span style="display:inline-block;background:#6c5ce7;color:#fff;font-size:10px;font-weight:800;padding:1px 4px;border-radius:3px;margin-right:4px;vertical-align:middle">阵</span>':'')+'<input class="group-name-input" data-group-id="'+escapeHtml(g.id)+'" value="'+escapeHtml(g.name)+'" style="flex:1;width:100%;box-sizing:border-box;font-size:15px;font-weight:700;padding:6px 8px;border:1px solid var(--accent);border-radius:4px" />' + '</div>' + typeSel + '</div>':(g.type==='lineup'?'<span style="display:inline-block;background:#6c5ce7;color:#fff;font-size:10px;font-weight:800;padding:1px 4px;border-radius:3px;margin-right:4px;vertical-align:middle">阵</span>':'')+'<h4 style="display:inline;font-size:15px">'+escapeHtml(g.name)+'</h4>';
    var carQ = (activeGroupEdit===g.id?(activeGroupCarSearch||""):"").toLowerCase();
    var filteredCars = carQ ? items2.filter(function(car){return carMatchesSearch(car, activeGroupCarSearch);}) : items2;
    var searchHtml = activeGroupEdit===g.id?'<input class="group-car-search" data-group-id="'+escapeHtml(g.id)+'" placeholder="搜索车辆..." value="'+escapeHtml(activeGroupCarSearch||"")+'" style="width:100%;margin-bottom:6px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-size:13px" />':"";
    var checkboxes = filteredCars.map(function(car){var ck=ids.includes(car.id)?' checked':'';return'<label class="group-car-option"><input type="checkbox" class="group-car-cb" data-group-id="'+escapeHtml(g.id)+'" data-car-id="'+escapeHtml(car.id)+'"'+ck+'/><span>'+escapeHtml(displayVehicleName(car))+'</span></label>';}).join("");
    var disp = activeGroupEdit===g.id?'':'display:none';
    return'<div class="group-card" data-group-id="'+escapeHtml(g.id)+'"><div>'+nameHtml+'<span style="font-size:12px;color:var(--muted)">'+ids.length+' 辆车</span><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">'+thumbs+'</div></div><div class="group-card-actions"><button class="edit-group-btn" data-group-id="'+escapeHtml(g.id)+'">编辑</button><button class="remove-group-btn" data-group-id="'+escapeHtml(g.id)+'">删除</button></div><div class="group-car-selector" style="grid-column:1/-1;margin-top:8px;'+disp+'">'+searchHtml+checkboxes+'</div></div>';
  }
  var nameC = f.filter(function(g){return g.type!=='lineup';}).map(renderGroupCard).join("");
  var lineupC = f.filter(function(g){return g.type==='lineup';}).map(renderGroupCard).join("");
  var groupsHtml="";
  if(nameC)groupsHtml+='<section class="group-editor"><h3>名字组合</h3><div class="group-list">'+nameC+'</div></section>';
  if(lineupC)groupsHtml+='<section class="group-editor"><h3>阵容组合</h3><div class="group-list">'+lineupC+'</div></section>';
  return'<section class="group-editor"><h3>创建组合</h3><div class="group-toolbar"><input id="newGroupName" placeholder="输入组合名称" style="flex:1" /><select id="newGroupType" style="padding:4px 6px;border:1px solid var(--line);border-radius:4px;font-size:13px"><option value="name">名字组合</option><option value="lineup">阵容组合</option></select><button id="createGroupBtn">创建</button></div></section>'+(groupsHtml||'<p class="desc" style="margin:20px 0">还没有组合。创建后点击"编辑"可从车库选车。</p>');
}
function scheduleCreatorBackup() {
  if (isReadOnlyMode()) return;
  if (!location.protocol.startsWith("http")) return;
  window.clearTimeout(creatorBackupSaveTimer);
  creatorBackupSaveTimer = window.setTimeout(() => {
    fetch(API_BASE + "/api/creator-data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creators, replace: true }) }).catch(() => {});
  }, 250);
}
async function restoreCreatorsFromBackup() {
  try {
    const payload = await fetchProjectJson("/api/creator-data", "./data/creator-data.json");
    const backupCreators = Array.isArray(payload.creators) ? payload.creators : [];
    if (!backupCreators.length) { scheduleCreatorBackup(); return; }
    const merged = new Map(creators.map((creator) => [creatorAccountKey(normalizeCreator(creator)), normalizeCreator(creator)]));
    backupCreators.map(normalizeCreator).forEach((creator) => {
      const key = creatorAccountKey(creator);
      const existing = merged.get(key);
      if (!existing || JSON.stringify(creator).length > JSON.stringify(existing).length) merged.set(key, creator);
    });
    creators = Array.from(merged.values()).map(normalizeCreator);
    saveCreators();
  } catch {}
}
function loadAiConfig() { try { return JSON.parse(localStorage.getItem(AI_KEY) || "{}"); } catch { return {}; } }
function saveAiConfig(config) { localStorage.setItem(AI_KEY, JSON.stringify(config)); }
function setStatus(message, type = "") { const node = $("urlStatus"); node.textContent = message; node.className = "status-text" + (type ? " " + type : ""); }
function proxyImage(src) {
  const staticSrc = staticAssetUrl(src);
  if (staticSrc !== src) return staticSrc;
  if (!src || !/^https?:\/\//i.test(src)) return src;
  if (STATIC_HOSTING_MODE) return src;
  try {
    const url = new URL(src);
    if (/reca\.seimu\.cn$/i.test(url.hostname)) return src;
  } catch {}
  return API_BASE + "/api/image?src=" + encodeURIComponent(src);
}
function uniqueImageSources(...values) {
  const out = [];
  const push = (value) => {
    if (!value) return;
    if (Array.isArray(value)) { value.forEach(push); return; }
    const src = normalizeText(value);
    if (src && !out.includes(src)) out.push(src);
  };
  values.forEach(push);
  return out;
}
function renderImageWithFallback(candidates, className = "", alt = "", fallbackText = "暂无图片", dataset = {}) {
  const originals = uniqueImageSources(candidates).filter(Boolean);
  const sources = originals.map(proxyImage);
  if (!sources.length) return '<div class="image-fallback">' + escapeHtml(fallbackText) + '</div>';
  const classAttr = className ? ' class="' + escapeHtml(className) + '"' : "";
  const dataAttrs = Object.entries(dataset).map(([key, value]) => value == null || value === "" ? "" : ' data-' + key + '="' + escapeHtml(value) + '"').join("");
  return '<img' + classAttr + ' src="' + escapeHtml(sources[0]) + '" alt="' + escapeHtml(alt) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-image-index="0" data-image-candidates="' + escapeHtml(JSON.stringify(sources)) + '" data-image-originals="' + escapeHtml(JSON.stringify(originals)) + '"' + dataAttrs + ' />';
}
function handleImageLoadError(img) {
  if (!img?.dataset?.imageCandidates) return;
  let candidates = [];
  try { candidates = JSON.parse(img.dataset.imageCandidates || "[]"); } catch { candidates = []; }
  const nextIndex = Number(img.dataset.imageIndex || 0) + 1;
  if (candidates[nextIndex]) {
    img.dataset.imageIndex = String(nextIndex);
    img.src = candidates[nextIndex];
    return;
  }
  const fallback = document.createElement("div");
  fallback.className = "image-fallback";
  fallback.textContent = img.alt ? "图片加载失败" : "图";
  img.replaceWith(fallback);
}
function handleImageLoadSuccess(img) {
  if (!img?.dataset?.imageOriginals || !img.dataset.imageItemId) return;
  const index = Number(img.dataset.imageIndex || 0);
  let originals = [];
  try { originals = JSON.parse(img.dataset.imageOriginals || "[]"); } catch { originals = []; }
  const stableSrc = originals[index];
  if (!stableSrc) return;
  const target = uiEditDraft?.id === img.dataset.imageItemId ? uiEditDraft : items.find((entry) => entry.id === img.dataset.imageItemId);
  if (!target) return;
  if (img.dataset.imageKind === "vehicle" && target.image !== stableSrc) {
    target.image = stableSrc;
    target.images = uniqueImageSources(stableSrc, target.images);
    if (target !== uiEditDraft) saveItems();
  }
  if (img.dataset.imageKind === "skill") {
    const skill = target.details?.skills?.[Number(img.dataset.skillIndex)];
    if (skill && skill.icon !== stableSrc) {
      skill.icon = stableSrc;
      skill.images = uniqueImageSources(stableSrc, skill.images);
      if (target !== uiEditDraft) saveItems();
    }
  }
}
function extractVehicleImportUrl(text) {
  const matches = String(text || "").match(/https?:\/\/[^\s"'<>]+/gi) || [];
  const cleaned = matches.map((value) => value.replace(/[),;，。；、]+$/g, ""));
  return cleaned.find((value) => {
    try {
      const url = new URL(value);
      const isGamekee = /gamekee\.com$/i.test(url.hostname) && (/\/aceracer\/\d+\.html$/i.test(url.pathname) || /\/v1\/content\/detail\/\d+$/i.test(url.pathname));
      const isReca = /reca\.seimu\.cn$/i.test(url.hostname) && /\/ace-racer\/vehicles\/\d+$/i.test(url.pathname);
      return isGamekee || isReca;
    } catch { return false; }
  }) || "";
}
function cloneData(value) { return JSON.parse(JSON.stringify(value)); }
function isRecaImportUrl(value) {
  try {
    const url = new URL(value);
    return /reca\.seimu\.cn$/i.test(url.hostname) && /\/ace-racer\/vehicles\/\d+$/i.test(url.pathname);
  } catch { return false; }
}
function recaAsset(src) {
  const clean = normalizeText(src);
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith("/ace-racer/")) return "https://reca.seimu.cn" + clean;
  if (clean.startsWith("/")) return "https://reca.seimu.cn/ace-racer" + clean;
  return "https://reca.seimu.cn/ace-racer/rk-assets/" + clean.replace(/\.(png|webp|jpg|jpeg)$/i, "") + ".png";
}
function formatRecaNumber(value, suffix = "") {
  if (value === undefined || value === null || value === "") return "";
  const numeric = Number(value);
  const text = Number.isFinite(numeric) ? Number(numeric.toFixed(4)).toString() : normalizeText(value);
  return text ? text + suffix : "";
}
function formatRecaRatio(value) {
  if (value === undefined || value === null || value === "") return "";
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Number((numeric / 100).toFixed(4)).toString() + "%" : normalizeText(value);
}
function joinRecaPair(left, right) {
  return [left, right].map(meaningfulValue).filter(Boolean).join("/");
}
function recaBaseLevelDetail(item) {
  const details = item?.level_details || {};
  return details?.[item?.id] || details?.[String(item?.id)] || Object.values(details)[0] || {};
}
function recaPerformanceSheet(item) {
  const detail = recaBaseLevelDetail(item);
  const metrics = detail.metrics || {};
  const nitro = metrics.nitro || {};
  const turbo = metrics.turbo || {};
  return compactObjectValues({
    基础极速: formatRecaNumber(item.stats?.speed_limit, "km/h"),
    基础动力: formatRecaNumber(item.stats?.speedup_ratio),
    基础耐久: formatRecaNumber(item.max_durability),
    基础氮气充能: formatRecaRatio(item.stats?.charge?.ace_charge),
    基础起步充能: formatRecaRatio(metrics.start_energy?.total_ratio ?? metrics.start_energy?.current_ratio ?? metrics.start_energy?.base_ratio),
    基础氮气时长: formatRecaNumber(nitro.blue?.duration ?? nitro.purple?.duration, "秒"),
    基础蓝氮极速: formatRecaNumber(nitro.blue?.speed, "km/h"),
    基础紫氮极速: formatRecaNumber(nitro.purple?.speed, "km/h"),
    蓝喷涡轮时长: formatRecaNumber(turbo.blue?.duration, "秒"),
    紫喷涡轮时长: formatRecaNumber(turbo.purple?.duration, "秒"),
    蓝喷涡轮极速: formatRecaNumber(turbo.blue?.speed, "km/h"),
    紫喷涡轮极速: formatRecaNumber(turbo.purple?.speed, "km/h"),
  });
}
function richTextPlain(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value.raw === "string") return value.raw;
  if (typeof value.html === "string") return value.html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
  return normalizeText(value);
}
function parseRecaVehiclePayload(payload, sourceUrl) {
  const item = payload.item || payload.data || payload;
  if (!item?.id) throw new Error("RECA 没有返回车辆详情数据");
  const rich = item.rich_text || {};
  const ultimate = item.skills?.ultimate || {};
  const skillName = ultimate.name || item.skill_simple_desc || "技能";
  const featureDesc = richTextPlain(rich.feature_desc) || item.skill_simple_desc || item.summary || "";
  const passiveName = rich.special_passive_skill_title || "被动";
  const passiveDesc = richTextPlain(rich.special_passive_skill_desc || rich.passive_skill_desc || rich.passive_skill_rich_desc);
  const spDesc = richTextPlain(rich.sp_skill_desc);
  const spName = rich.sp_skill_title || "SP";
  const skillIcon = recaAsset(ultimate.icon_static || ultimate.icons?.static || ultimate.icons?.normal || ultimate.icon || "");
  const passiveIcon = recaAsset(rich.special_passive_skill_icon || rich.upgrade_level_icon || "");
  const spIcon = recaAsset(rich.sp_skill_icon || "");
  const skills = [];
  if (spDesc) skills.push({ name: spName, desc: spDesc, values: "", icon: spIcon, images: [spIcon].filter(Boolean) });
  if (skillName || featureDesc) skills.push({ name: skillName, desc: featureDesc, values: "", icon: skillIcon, images: [skillIcon].filter(Boolean) });
  if (passiveDesc) skills.push({ name: passiveName, desc: passiveDesc, values: "", icon: passiveIcon, images: [passiveIcon].filter(Boolean) });
  const coreNames = skills.map((skill) => skill.name).filter(Boolean);
  const abilityLabels = defaultAbilityLabels(coreNames);
  const position = normalizeVehicleCategory(item.position || item.positionLabel || item.racing_role_name);
  const track = normalizeText(item.specialization).replace("山地", "山路");
  const attrs = compactObjectValues({
    厂商: item.manufacturer,
    定位: position ? position + "位" : item.position,
    赛道专精: track,
    稀有度: item.quality,
    出场赛季: item.seasonCode || item.releaseText,
    获取方式: item.obtain,
  });
  const performanceSheet = recaPerformanceSheet(item);
  const stats = compactObjectValues({
    极速: performanceSheet["基础极速"],
    动力: performanceSheet["基础动力"],
    耐久: performanceSheet["基础耐久"],
    氮气充能: performanceSheet["基础氮气充能"],
    起步充能: performanceSheet["基础起步充能"],
    氮气时长: performanceSheet["基础氮气时长"],
    氮气极速: joinRecaPair(performanceSheet["基础蓝氮极速"], performanceSheet["基础紫氮极速"]),
    涡轮时长: joinRecaPair(performanceSheet["蓝喷涡轮时长"], performanceSheet["紫喷涡轮时长"]),
    涡轮极速: joinRecaPair(performanceSheet["蓝喷涡轮极速"], performanceSheet["紫喷涡轮极速"]),
    漂移充能系数: item.stats?.charge?.drift_charge_energy_coef,
  });
  const cover = recaAsset(item.cover || item.coverFallback || "");
  const share = recaAsset(item.share_image || item.share_image_advance || "");
  const images = uniqueImageSources(cover, share);
  const tags = [...new Set([position, track, item.quality, item.seasonCode, ...(item.tags || []).map((tag) => tag.text || tag.name || "")].filter(Boolean).map(String))];
  const description = [item.summary, item.description, featureDesc].filter(Boolean).join("\n");
  return {
    id: "reca-" + item.id,
    name: item.name || item.display_name || "未命名车辆",
    type: "car",
    role: attrs["定位"] || "车辆",
    tags,
    description,
    source: sourceUrl,
    image: images[0] || "",
    images,
    details: {
      reca_id: item.id,
      attrs,
      stats,
      skills,
      coreAbilityNames: coreNames,
      abilityLabels,
      coreAbilities: coreNames.map((abilityName) => ({ name: abilityName, category: abilityLabels[abilityName] || "" })),
      carMeta: normalizeCarMeta({ rarity: item.quality || "", category: position, trackSpecialty: track }),
      speedSheet: {
        出场赛季: item.seasonCode || item.releaseText || "-",
        位置: attrs["定位"] || "-",
        场地适用: track || "-",
        稀有度: item.quality || "-",
        ...performanceSheet,
      },
      updated_at: payload.cache?.updatedAt || new Date().toISOString(),
      imageCandidates: images.length,
      rawSource: "RECA",
    },
  };
}
async function importRecaVehicleFromBrowser(urlText) {
  const url = new URL(urlText);
  const id = url.pathname.match(/\/ace-racer\/vehicles\/(\d+)$/i)?.[1];
  if (!id) throw new Error("没有从 RECA 地址里识别到车辆 ID");
  const response = await fetch("https://reca.seimu.cn/api/public/vehicles/" + id, { headers: { Accept: "application/json,text/plain,*/*" } });
  if (!response.ok) throw new Error("RECA 接口返回 HTTP " + response.status);
  return parseRecaVehiclePayload(await response.json(), url.href);
}

function parseCsv(text) {
  const rows = []; let row = []; let cell = ""; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]; const next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (cell || row.length) { row.push(cell); rows.push(row); } row = []; cell = ""; if (char === "\r" && next === "\n") i += 1; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift()?.map((header) => header.trim()) || [];
  return rows.filter((cells) => cells.some((value) => value.trim())).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
}
function parsePlainText(text) {
  return text.split(/\n\s*\n+/).map((chunk) => chunk.trim()).filter(Boolean).map((chunk) => {
    const lines = chunk.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const name = (lines[0] || "未命名资料").replace(/[:：].*$/, "").trim();
    return normalizeRecord({ name, description: lines.join(" ") });
  });
}
function parseInput(text, mode) {
  const raw = text.trim(); if (!raw) return [];
  if (mode === "json" || (mode === "auto" && /^[\[{]/.test(raw))) {
    const data = JSON.parse(raw); const records = Array.isArray(data) ? data : Object.values(data).flat();
    return records.filter((value) => value && typeof value === "object").map(normalizeRecord);
  }
  if (mode === "csv" || (mode === "auto" && raw.split(/\r?\n/)[0]?.includes(","))) return parseCsv(raw).map(normalizeRecord);
  return parsePlainText(raw);
}
function mergeImportedSkillImages(freshSkills, existingSkills) {
  const byName = new Map((existingSkills || []).map((skill) => [skill.name, skill]));
  return (freshSkills || []).map((skill) => {
    const existing = byName.get(skill.name);
    if (!existing) return skill;
    return { ...skill, icon: existing.icon || skill.icon, images: uniqueImageSources(existing.icon, existing.images, skill.icon, skill.images) };
  });
}
function mergeSupplementalSkillsPreferIncoming(freshSkills, existingSkills) {
  if (!Array.isArray(freshSkills) || !freshSkills.length) return existingSkills || [];
  const used = new Set();
  const existingByName = new Map((existingSkills || []).map((skill) => [skill.name, skill]));
  const merged = freshSkills.map((skill) => {
    const existing = existingByName.get(skill.name);
    if (existing) used.add(existing.name);
    return existing ? { ...existing, ...skill, icon: skill.icon || existing.icon, images: uniqueImageSources(skill.icon, skill.images, existing.icon, existing.images) } : skill;
  });
  (existingSkills || []).forEach((skill) => {
    if (!used.has(skill.name)) merged.push(skill);
  });
  return merged;
}
function preferredMergedVehicleName(main, other) {
  const mainIsSheet = String(main?.id || "").startsWith("speed-sheet-");
  const otherIsSheet = String(other?.id || "").startsWith("speed-sheet-");
  if (mainIsSheet && !otherIsSheet) return other.name || main.name;
  if (otherIsSheet && !mainIsSheet) return main.name || other.name;
  return main.name || other.name;
}
function mergeRecordData(base, incoming) {
  const left = normalizeRecord(base);
  const right = normalizeRecord(incoming);
  const leftSize = JSON.stringify(left).length;
  const rightSize = JSON.stringify(right).length;
  const main = rightSize > leftSize ? right : left;
  const other = main === right ? left : right;
  const details = { ...(other.details || {}), ...(main.details || {}) };
  const baseSheet = speedSheetDetails(null);
  const otherManual = Boolean(other.details?.speedSheetManual);
  const mainManual = Boolean(main.details?.speedSheetManual);
  details.speedSheet = mainManual
    ? mergeSheetDetails(baseSheet, main.details?.speedSheet || {}, true)
    : mergeSheetDetails(mergeSheetDetails(baseSheet, other.details?.speedSheet || {}, otherManual), main.details?.speedSheet || {}, false);
  details.speedSheetManual = otherManual || mainManual;
  details.speedSheetSourceName = meaningfulValue(main.details?.speedSheetSourceName) || meaningfulValue(other.details?.speedSheetSourceName) || "";
  details.attrs = { ...(other.details?.attrs || {}), ...(main.details?.attrs || {}) };
  details.stats = { ...(other.details?.stats || {}), ...(main.details?.stats || {}) };
  details.abilityLabels = { ...(other.details?.abilityLabels || {}), ...(main.details?.abilityLabels || {}) };
  details.supportCategories = [...new Set([...(other.details?.supportCategories || []), ...(main.details?.supportCategories || [])].filter((value) => supportCategoryOptions.includes(value)))];
  details.vehicleRelations = normalizeVehicleRelations(vehicleRelationStorageConfigs.reduce((relations, config) => {
    relations[config.key] = [...(other.details?.vehicleRelations?.[config.key] || []), ...(main.details?.vehicleRelations?.[config.key] || [])];
    return relations;
  }, {}));
  details.skills = (main.details?.skills || []).length >= (other.details?.skills || []).length ? (main.details?.skills || []) : (other.details?.skills || []);
  details.carMeta = normalizeCarMeta({ ...compactObjectValues(other.details?.carMeta || {}), ...compactObjectValues(main.details?.carMeta || {}) });
  return normalizeRecord({
    ...other,
    ...main,
    id: main.id || other.id,
    name: preferredMergedVehicleName(main, other),
    role: main.role || other.role,
    tags: [...new Set([...(other.tags || []), ...(main.tags || [])])],
    description: (main.description || "").length >= (other.description || "").length ? main.description : other.description,
    source: main.source || other.source,
    image: main.image || other.image,
    images: uniqueImageSources(main.image, main.images, other.image, other.images),
    details,
  });
}
function mergeObjectPreferIncoming(base, incoming) {
  const merged = { ...(base || {}) };
  Object.entries(incoming || {}).forEach(([key, value]) => {
    if (meaningfulValue(value)) merged[key] = value;
  });
  return merged;
}
function mergeSupplementalRecordData(base, incoming) {
  const left = normalizeRecord(base);
  const right = normalizeRecord(incoming);
  const incomingRawSheet = incoming?.details?.speedSheet && typeof incoming.details.speedSheet === "object" ? incoming.details.speedSheet : {};
  const details = { ...(left.details || {}), ...(right.details || {}) };
  const leftManual = Boolean(left.details?.speedSheetManual);
  const rightManual = Boolean(incoming?.details?.speedSheetManual);
  details.attrs = mergeObjectPreferIncoming(left.details?.attrs, right.details?.attrs);
  details.stats = mergeObjectPreferIncoming(left.details?.stats, right.details?.stats);
  details.speedSheet = mergeSheetDetails(mergeSheetDetails(speedSheetDetails(null), left.details?.speedSheet || {}, leftManual), incomingRawSheet, false);
  details.speedSheetManual = leftManual || rightManual;
  details.speedSheetSourceName = meaningfulValue(right.details?.speedSheetSourceName) || meaningfulValue(left.details?.speedSheetSourceName) || right.name || left.name;
  details.abilityLabels = mergeObjectPreferIncoming(left.details?.abilityLabels, right.details?.abilityLabels);
  details.supportCategories = [...new Set([...(left.details?.supportCategories || []), ...(right.details?.supportCategories || [])].filter((value) => supportCategoryOptions.includes(value)))];
  details.vehicleRelations = normalizeVehicleRelations(vehicleRelationStorageConfigs.reduce((relations, config) => {
    relations[config.key] = [...(left.details?.vehicleRelations?.[config.key] || []), ...(right.details?.vehicleRelations?.[config.key] || [])];
    return relations;
  }, {}));
  details.skills = mergeSupplementalSkillsPreferIncoming(right.details?.skills || [], left.details?.skills || []);
  details.coreAbilityNames = (right.details?.coreAbilityNames || []).length ? right.details.coreAbilityNames : (left.details?.coreAbilityNames || []);
  details.carMeta = normalizeCarMeta({ ...compactObjectValues(left.details?.carMeta || {}), ...compactObjectValues(right.details?.carMeta || {}) });
  details.driveAnchor = left.details?.driveAnchor || right.details?.driveAnchor;
  return normalizeRecord({
    ...left,
    ...right,
    id: left.id || right.id,
    name: right.name || left.name,
    role: right.role || left.role,
    tags: [...new Set([...(left.tags || []), ...(right.tags || [])])],
    description: meaningfulValue(right.description) || left.description,
    source: right.source || left.source,
    image: right.image || left.image,
    images: uniqueImageSources(right.image, right.images, left.image, left.images),
    details,
  });
}
function dedupeItemRecords(records) {
  const out = [];
  records.map(normalizeRecord).forEach((record) => {
    const index = out.findIndex((item) => item.type === record.type && (record.type === "car" ? carsRepresentSameVehicle(item, record) : item.name === record.name));
    if (index >= 0) out[index] = mergeRecordData(out[index], record);
    else out.push(record);
  });
  return out;
}
function addRecords(records) {
  if (isReadOnlyMode()) { showReadOnlyNotice(); return []; }
  const byKey = new Map(items.map((item) => [item.type + ":" + item.name, item]));
  const added = [];
  records.map(normalizeRecord).forEach((record) => {
    const existing = byKey.get(record.type + ":" + record.name) || Array.from(byKey.values()).find((item) => item.type === record.type && record.type === "car" && carsRepresentSameVehicle(item, record));
    if (existing) {
      const freshImage = record.image;
      record.id = existing.id || record.id;
      record.image = existing.image || record.image;
      record.images = uniqueImageSources(record.image, existing.images, freshImage, record.images);
      record.details.skills = mergeImportedSkillImages(record.details.skills || [], existing.details?.skills || []);
    }
    if (existing?.details?.abilityLabels) record.details.abilityLabels = { ...record.details.abilityLabels, ...existing.details.abilityLabels };
    if (existing?.details?.carMeta) record.details.carMeta = { ...record.details.carMeta, ...existing.details.carMeta };
    record.details.carMeta = normalizeCarMeta(record.details.carMeta);
    if (existing && existing.name !== record.name) byKey.delete(existing.type + ":" + existing.name);
    byKey.set(record.type + ":" + record.name, record);
    added.push(record);
  });
  items = Array.from(byKey.values());
  saveItems();
  render();
  return added;
}
function itemMatchesSheetRow(item, row) {
  if (!item || item.type !== "car") return false;
  const rowSource = normalizeMatchName(row?.["赛车名称"] || "");
  const itemSource = sheetSourceKey(item);
  if (rowSource && itemSource && rowSource === itemSource) return true;
  return aliasesFromName(row?.["赛车名称"] || "").some((alias) => vehicleNameAliases(item).some((name) => namesMatch(name, alias)));
}
function migrateVehicleRecords(records) {
  return dedupeItemRecords(records).reduce((out, record) => {
    if (record.type !== "car") {
      out.push(record);
      return out;
    }
    const index = out.findIndex((item) => item.type === "car" && carsRepresentSameVehicle(item, record));
    if (index >= 0) out[index] = mergeRecordData(out[index], record);
    else out.push(record);
    return out;
  }, []);
}
function buildSpeedSheetRecord(row) {
  const aliases = sheetRowAliases(row);
  const name = aliases[0] || row["赛车名称"] || "未命名赛车";
  return normalizeRecord({
    id: "speed-sheet-" + normalizeMatchName(name),
    name,
    type: "car",
    role: row["位置"] || "竞速",
    tags: [row["位置"], row["场地适用"], row["稀有度"], row["梯度排行"]].filter(Boolean),
    description: "来自竞速车表格的补充资料。",
    details: {
      speedSheet: speedSheetDetails(row),
      speedSheetSourceName: row["赛车名称"] || name,
      carMeta: normalizeCarMeta({ rarity: normalizeVehicleRarity(row["稀有度"]), category: row["位置"], trackSpecialty: row["场地适用"] }),
      skills: [],
    },
  });
}
function initializeSpeedSheetData() {
  const rows = speedSheetRows();
  if (!rows.length) return;
  items = items.map((item) => item.type === "car" ? applySpeedSheetData(item) : item);
  const missing = rows.filter((row) => !items.some((item) => itemMatchesSheetRow(item, row)));
  if (missing.length) items.push(...missing.map(buildSpeedSheetRecord));
  items = migrateVehicleRecords(items);
  saveItems();
}
function focusImportedItem(itemId) {
  if (!itemId) return;
  if ($("search")) $("search").value = "";
  if ($("positionFilter")) $("positionFilter").value = "all";
  if ($("rarityFilter")) $("rarityFilter").value = "all";
  if ($("seasonFilter")) $("seasonFilter").value = "all";
  render();
  requestAnimationFrame(() => {
    const card = Array.from(document.querySelectorAll(".item-card")).find((node) => node.dataset.itemId === itemId);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("item-card-highlight");
    window.setTimeout(() => card.classList.remove("item-card-highlight"), 1800);
  });
}
function findBlankVehicle() {
  const blankKey = normalizeMatchName("空白");
  return items.find((item) => item.type === "car" && normalizeMatchName(displayVehicleName(item)) === blankKey);
}
function createBlankVehicleRecord() {
  return normalizeRecord({
    id: "blank-car-" + crypto.randomUUID(),
    name: "空白",
    type: "car",
    role: "",
    tags: [],
    description: "",
    image: "",
    images: [],
    details: {
      attrs: {},
      stats: {},
      skills: [],
      coreAbilityNames: [],
      abilityLabels: {},
      coreAbilities: [],
      carMeta: normalizeCarMeta({}),
      speedSheet: speedSheetDetails(null),
      speedSheetSourceName: "空白",
      speedSheetManual: true,
      supportCategories: [],
      vehicleRelations: normalizeVehicleRelations({}),
      driveAnchor: normalizeVehicleDriveAnchor({}),
    },
  });
}
function addOrOpenBlankVehicle() {
  if (isReadOnlyMode()) { showReadOnlyNotice(); return; }
  let blank = findBlankVehicle();
  const created = !blank;
  if (!blank) {
    blank = createBlankVehicleRecord();
    items.push(blank);
    saveItems();
  }
  activateView("library");
  setLibraryBranch("cars");
  focusImportedItem(blank.id);
  requestAnimationFrame(() => {
    openDetail(blank.id);
    enterSheetEditMode();
  });
  setStatus(created ? "已增加空白车辆，可直接编辑后保存。" : "已跳转到已有空白车辆。", "success");
}
async function fetchVehicleImportPayload(url) {
  const response = await fetch(API_BASE + "/api/import-gamekee?url=" + encodeURIComponent(url));
  const payload = await response.json();
  if (!response.ok || !payload.record) {
    if (isRecaImportUrl(url)) return { record: await importRecaVehicleFromBrowser(url) };
    throw new Error(payload.error || "识别失败");
  }
  return payload;
}
function findSupplementVehicleTarget(record) {
  const normalized = normalizeRecord(record);
  return items.find((item) => item.type === "car" && carsRepresentSameVehicle(item, normalized))
    || items.find((item) => item.type === "car" && namesMatch(displayVehicleName(item), normalized.name));
}
function applySelectedImportRarity(record) {
  const selectedRarity = $("importRarity")?.value || "";
  if (!selectedRarity || !record) return record;
  record.details = record.details || {};
  record.details.carMeta = normalizeCarMeta({ ...(record.details.carMeta || {}), rarity: selectedRarity });
  record.details.speedSheet = { ...(record.details.speedSheet || {}), 稀有度: selectedRarity };
  return record;
}
async function importGamekeeUrl() {
  if (isReadOnlyMode()) { showReadOnlyNotice(); return; }
  const url = $("gamekeeUrl").value.trim();
  if (!url) { setStatus("请先粘贴车辆详情页地址。", "error"); return; }
  setStatus("正在识别车辆页面...", "");
  try {
    const payload = await fetchVehicleImportPayload(url);
    applySelectedImportRarity(payload.record);
    const added = addRecords([payload.record]);
    const imported = added[0];
    focusImportedItem(imported?.id);
    setStatus("已识别并入库：" + payload.record.name + "。提取了 " + Object.keys(payload.record.details?.stats || {}).length + " 个性能项、" + (payload.record.details?.skills || []).length + " 个技能词条。", "success");
  } catch (error) {
    setStatus("导入失败：" + error.message + "。请确认是支持的车辆详情页，并从本地服务地址打开本工具。", "error");
  }
}
async function supplementVehicleUrl() {
  if (isReadOnlyMode()) { showReadOnlyNotice(); return; }
  const url = $("gamekeeUrl").value.trim();
  if (!url) { setStatus("请先粘贴要补充的车辆详情页地址。", "error"); return; }
  setStatus("正在识别并补充已有车辆资料...", "");
  try {
    const payload = await fetchVehicleImportPayload(url);
    applySelectedImportRarity(payload.record);
    const target = findSupplementVehicleTarget(payload.record);
    if (!target) {
      setStatus("没有在车库中找到同名车辆。请先用“识别车辆信息”新增车辆，再使用“补充资料”。", "error");
      return;
    }
    const merged = mergeSupplementalRecordData(target, payload.record);
    items = items.map((item) => item.id === target.id ? merged : item);
    saveItems();
    render();
    focusImportedItem(merged.id);
    const performanceCount = speedSheetPerformanceFields.filter((field) => meaningfulValue(payload.record.details?.speedSheet?.[field])).length;
    setStatus("已补充资料：" + displayVehicleName(merged) + "。更新了 " + performanceCount + " 个性能排名字段。", "success");
  } catch (error) {
    setStatus("补充资料失败：" + error.message + "。请确认是支持的车辆详情页。", "error");
  }
}
async function importCurrentOrClipboardGamekeeUrl() {
  setStatus("正在读取当前页面或剪贴板里的车辆地址...", "");
  const currentUrl = extractVehicleImportUrl(window.location.href);
  let clipboardText = "";
  if (!currentUrl && navigator.clipboard?.readText) {
    try { clipboardText = await navigator.clipboard.readText(); } catch {}
  }
  const url = currentUrl || extractVehicleImportUrl(clipboardText);
  if (!url) {
    setStatus("没有读取到支持的车辆详情地址。请先在 Microsoft Edge 复制当前车辆页面地址，再点击这个按钮。", "error");
    return;
  }
  $("gamekeeUrl").value = url;
  await importGamekeeUrl();
}
function carPosition(item) {
  const meta = normalizeCarMeta(item.details?.carMeta || {});
  const sheet = item.details?.speedSheet || {};
  const attrs = item.details?.attrs || {};
  return meta.category
    || normalizeVehicleCategory(sheet["位置"])
    || normalizeVehicleCategory(attrs["定位"])
    || normalizeVehicleCategory(item.role)
    || normalizeVehicleCategory((item.tags || []).join(" "))
    || "未分类";
}
function carTrackSpecialty(item) {
  const meta = normalizeCarMeta(item.details?.carMeta || {});
  const sheet = item.details?.speedSheet || {};
  const attrs = item.details?.attrs || {};
  const candidates = [meta.trackSpecialty, sheet["场地适用"], attrs["赛道专精"], item.description, (item.tags || []).join(" ")];
  for (const value of candidates) {
    const text = meaningfulValue(value).replace("山地", "山路");
    const found = trackSpecialtyOptions.find((option) => option && text.includes(option));
    if (found) return found;
  }
  return "";
}
function carRarity(item) {
  const meta = normalizeCarMeta(item.details?.carMeta || {});
  return meta.rarity || "未选择车辆稀有度";
}
function compactVehicleName(value) {
  return normalizeText(value).toLowerCase().replace(/[\s·\-_/（）()]/g, "");
}
function isSpecialLegendaryBackgroundCar(item) {
  const name = compactVehicleName(item.name);
  return specialLegendaryBackgroundCars.some((entry) => {
    const compact = compactVehicleName(entry);
    return name.includes(compact) || compact.includes(name);
  });
}
function vehicleRarityBackgroundClass(item) {
  if (isSpecialLegendaryBackgroundCar(item)) return "vehicle-bg-legendary-special";
  const rarity = carRarity(item);
  if (rarity === "耀世珍藏") return "vehicle-bg-world";
  if (rarity === "传说") return "vehicle-bg-legendary";
  if (rarity === "史诗") return "vehicle-bg-epic";
  if (rarity === "稀有") return "vehicle-bg-rare";
  if (rarity === "普通") return "vehicle-bg-common";
  return "vehicle-bg-default";
}
function carSeasonText(item) {
  const value = formatSheetValue(item.details?.speedSheet?.["出场赛季"]);
  return value === "-" ? "" : value;
}
function carSeasonNumber(item) {
  const text = carSeasonText(item);
  const match = text.match(/S\s*(\d+)/i);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}
function carSeasonFilterValue(item) {
  const number = carSeasonNumber(item);
  return Number.isFinite(number) ? "S" + number : "";
}
function carSearchText(item) {
  const sheet = item.details?.speedSheet || {};
  const nameSearch = vehicleNameAliases(item).flatMap(searchTokensForText).join(" ");
  return [nameSearch, item.role, item.description, item.tags?.join(" "), carPosition(item), carRarity(item), carSeasonText(item), sheet["稀有度"], sheet["梯度排行"], sheet["推荐队友车辆"], sheet["推荐使用地图"], sheet["赋能推荐"]].join(" ").toLowerCase();
}
function carMatchesSearch(item, query) {
  const raw = normalizeText(query).toLowerCase();
  if (!raw) return true;
  const compact = compactSearchText(raw);
  const haystack = carSearchText(item);
  return haystack.includes(raw) || (compact && haystack.includes(compact));
}
function uniqueCarRarities(list) {
  const knownOrder = ["耀世珍藏", "传说", "史诗", "稀有", "普通"];
  const values = [...new Set(list.map(carRarity).filter(Boolean))];
  return [...knownOrder.filter((value) => values.includes(value)), ...values.filter((value) => !knownOrder.includes(value))];
}
function updateRarityFilterOptions(cars) {
  const select = $("rarityFilter");
  if (!select) return;
  const current = select.value || "all";
  select.innerHTML = '<option value="all">全部稀有度</option>' + ["耀世珍藏", "传说", "史诗", "稀有", "普通"].map((value) => '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>').join("");
  select.value = Array.from(select.options).some((option) => option.value === current) ? current : "all";
}
function updateSeasonFilterOptions(cars) {
  const select = $("seasonFilter");
  if (!select) return;
  const current = select.value || "all";
  const maxSeason = cars.reduce((max, item) => {
    const season = carSeasonNumber(item);
    return Number.isFinite(season) ? Math.max(max, season) : max;
  }, 0);
  const options = ['<option value="all">全部赛季</option>'];
  for (let season = 1; season <= maxSeason; season += 1) {
    const value = "S" + season;
    const seasonCars = cars.filter((item) => carSeasonFilterValue(item) === value);
    const speed = seasonCars.filter((item) => carPosition(item) === "竞速").length;
    const interference = seasonCars.filter((item) => carPosition(item) === "干扰").length;
    const support = seasonCars.filter((item) => carPosition(item) === "辅助").length;
    options.push('<option value="' + value + '">' + value + '：总' + seasonCars.length + '辆，竞速' + speed + '辆，干扰' + interference + '辆，辅助' + support + '辆</option>');
  }
  select.innerHTML = options.join("");
  select.value = Array.from(select.options).some((option) => option.value === current) ? current : "all";
}
function performanceMetricByKey(key) {
  return performanceSortMetrics.find((metric) => metric.key === key) || null;
}
function performanceSortValue(item, metricKey) {
  const metric = performanceMetricByKey(metricKey);
  if (!metric) return null;
  const cached = Number(performanceStatsCache?.version === PERFORMANCE_STATS_VERSION ? performanceStatsCache.metrics?.[metric.key]?.values?.[item.id] : NaN);
  if (Number.isFinite(cached)) return cached;
  if (metric.key === performanceCompositeMetric.key) return null;
  const data = vehiclePerformanceData(item, item.details?.stats || {});
  if (metric.key === performanceOpenTopSpeedMetric.key) return openTopSpeedNumber(item, data);
  return normalizePerformanceNumberForMetric(metric, performanceMetricRawValue(item, metric, data));
}
function comparePerformanceSort(a, b, metricKey, direction = "desc") {
  const av = performanceSortValue(a, metricKey);
  const bv = performanceSortValue(b, metricKey);
  const aMissing = !Number.isFinite(av);
  const bMissing = !Number.isFinite(bv);
  if (aMissing !== bMissing) return aMissing ? 1 : -1;
  if (!aMissing && av !== bv) return direction === "asc" ? av - bv : bv - av;
  return displayVehicleName(a).localeCompare(displayVehicleName(b), "zh-Hans-CN");
}
function compareCars(a, b, mode, sortOptions = {}) {
  if (sortOptions.performanceKey) return comparePerformanceSort(a, b, sortOptions.performanceKey, sortOptions.performanceDirection || "desc");
  if (mode === "alpha") return a.name.localeCompare(b.name, "zh-Hans-CN");
  if (mode === "seasonAsc" || mode === "seasonDesc") {
    const as = carSeasonNumber(a);
    const bs = carSeasonNumber(b);
    const aMissing = !Number.isFinite(as);
    const bMissing = !Number.isFinite(bs);
    if (aMissing !== bMissing) return aMissing ? 1 : -1;
    if (as !== bs) return mode === "seasonAsc" ? as - bs : bs - as;
    return a.name.localeCompare(b.name, "zh-Hans-CN");
  }
  return a.name.localeCompare(b.name, "zh-Hans-CN");
}
function groupBy(list, getter) {
  const map = new Map();
  list.forEach((item) => {
    const key = getter(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}
function renderVehicleIconCard(item) {
  const displayName = displayVehicleName(item);
  const titleName = vehicleNameAliases(item).join(" / ") || displayName;
  const image = renderImageWithFallback([item.image, item.images], "vehicle-icon-image", displayName, "无图", { "image-item-id": item.id, "image-kind": "vehicle" });
  const meta = [carSeasonText(item) || "赛季-", item.details?.speedSheet?.["梯度排行"] || "-"].filter(Boolean).join(" · ");
  const bgClass = vehicleRarityBackgroundClass(item);
  const badges = renderVehicleInfoBadges(item);
  return '<article class="item-card vehicle-icon-card" data-item-id="' + escapeHtml(item.id) + '" tabindex="0" title="' + escapeHtml(titleName) + '"><div class="vehicle-icon-art ' + bgClass + '">' + image + badges + '</div><div class="vehicle-icon-name">' + escapeHtml(displayName) + '</div><div class="vehicle-icon-meta">' + escapeHtml(meta) + '</div></article>';
}
function renderVehicleInfoBadges(item) {
  const position = carPosition(item);
  const track = carTrackSpecialty(item);
  const entries = [
    track && trackIconMap[track] ? { src: trackIconMap[track], label: track } : null,
    position && positionIconMap[position] ? { src: positionIconMap[position], label: position } : null,
  ].filter(Boolean);
  if (!entries.length) return "";
  return '<div class="vehicle-info-badges">' + entries.map((entry) => '<span class="vehicle-info-badge" title="' + escapeHtml(entry.label) + '"><img src="' + escapeHtml(entry.src) + '" alt="' + escapeHtml(entry.label) + '" /></span>').join("") + '</div>';
}
function renderRarityGroups(cars, sortMode, sortOptions = {}) {
  const rarityGroups = groupBy(cars, carRarity);
  return uniqueCarRarities(cars).map((rarity) => {
    const entries = (rarityGroups.get(rarity) || []).slice().sort((a, b) => compareCars(a, b, sortMode, sortOptions));
    return '<section class="vehicle-rarity-group"><div class="vehicle-rarity-head"><h4>' + escapeHtml(rarity) + '</h4><span>' + entries.length + ' 辆</span></div><div class="vehicle-icon-grid">' + entries.map(renderVehicleIconCard).join("") + '</div></section>';
  }).join("");
}
function renderPerformanceSortedVehicleGroup(cars, sortOptions) {
  const metric = performanceMetricByKey(sortOptions.performanceKey);
  if (!metric) return "";
  const entries = cars.slice().sort((a, b) => compareCars(a, b, "alpha", sortOptions));
  const directionText = sortOptions.performanceDirection === "asc" ? "升序" : "降序";
  return '<section class="vehicle-position-group vehicle-all-position-group performance-sorted-group"><header class="vehicle-position-head"><h3>性能排序 · ' + escapeHtml(performanceMetricLabel(metric)) + ' · ' + escapeHtml(directionText) + '</h3><span>' + entries.length + ' 辆</span></header><div class="vehicle-rarity-group"><div class="vehicle-icon-grid">' + entries.map(renderVehicleIconCard).join("") + '</div></div></section>';
}
function renderVehicleGroups(cars, sortMode, positionFilter = "all", sortOptions = {}) {
  if (!cars.length) return '<section class="panel"><p class="desc">没有符合筛选条件的赛车。</p></section>';
  if (sortOptions.performanceKey) return renderPerformanceSortedVehicleGroup(cars, sortOptions);
  if (positionFilter === "all") return '<section class="vehicle-position-group vehicle-all-position-group">' + renderRarityGroups(cars, sortMode, sortOptions) + '</section>';
  const positionOrder = ["竞速", "干扰", "辅助", "天平", "未分类"];
  const positions = groupBy(cars, carPosition);
  return Array.from(positions.keys()).sort((a, b) => {
    const ai = positionOrder.indexOf(a);
    const bi = positionOrder.indexOf(b);
    return (ai >= 0 ? ai : 999) - (bi >= 0 ? bi : 999) || a.localeCompare(b, "zh-Hans-CN");
  }).map((position) => {
    const positionCars = positions.get(position) || [];
    const rarityHtml = renderRarityGroups(positionCars, sortMode, sortOptions);
    return '<section class="vehicle-position-group"><header class="vehicle-position-head"><h3>' + escapeHtml(position) + '</h3><span>' + positionCars.length + ' 辆</span></header>' + rarityHtml + '</section>';
  }).join("");
}
function carSupportCategories(item) {
  return Array.isArray(item.details?.supportCategories) ? item.details.supportCategories.filter((value) => supportCategoryOptions.includes(value)) : [];
}
function renderSupportCategorySummary(cars) {
  return '<div class="support-category-summary">' + supportCategoryOptions.map((category) => {
    const selected = cars.filter((item) => carSupportCategories(item).includes(category));
    const names = selected.map((item) => '<span class="support-name-chip">' + escapeHtml(displayVehicleName(item)) + '</span>').join("");
    return '<section class="support-category-panel"><div class="support-category-head"><h3>' + escapeHtml(category) + '</h3><span>' + selected.length + ' 辆</span></div><div class="support-name-list">' + (names || '<span class="support-empty">未选择</span>') + '</div></section>';
  }).join("") + '</div>';
}
function renderSupportClassCard(item) {
  const displayName = displayVehicleName(item);
  const titleName = vehicleNameAliases(item).join(" / ") || displayName;
  const image = renderImageWithFallback([item.image, item.images], "vehicle-icon-image", displayName, "无图", { "image-item-id": item.id, "image-kind": "vehicle" });
  const meta = [carSeasonText(item) || "赛季-", item.details?.speedSheet?.["梯度排行"] || "-"].filter(Boolean).join(" · ");
  const bgClass = vehicleRarityBackgroundClass(item);
  const badges = renderVehicleInfoBadges(item);
  const selected = carSupportCategories(item);
  const controls = supportCategoryOptions.map((category) => {
    const checked = selected.includes(category) ? " checked" : "";
    return '<label class="support-check"><input class="support-class-checkbox" type="checkbox" data-item-id="' + escapeHtml(item.id) + '" data-support-category="' + escapeHtml(category) + '"' + checked + ' />' + escapeHtml(category) + '</label>';
  }).join("");
  return '<article class="item-card vehicle-icon-card support-class-card" data-item-id="' + escapeHtml(item.id) + '" tabindex="0" title="' + escapeHtml(titleName) + '"><div class="vehicle-icon-art ' + bgClass + '">' + image + badges + '</div><div class="vehicle-icon-name">' + escapeHtml(displayName) + '</div><div class="vehicle-icon-meta">' + escapeHtml(meta) + '</div><div class="support-check-row">' + controls + '</div></article>';
}
function renderSupportBranch(cars, sortMode, query) {
  const supportCars = cars.filter((item) => carPosition(item) === "辅助");
  const categoryFiltered = activeSupportCategoryFilter ? supportCars.filter((item) => carSupportCategories(item).includes(activeSupportCategoryFilter)) : supportCars;
  const filtered = categoryFiltered.filter((item) => carMatchesSearch(item, query)).slice().sort((a, b) => compareCars(a, b, sortMode));
  const cards = filtered.map(renderSupportClassCard).join("");
  const filterText = activeSupportCategoryFilter ? '<button type="button" id="clearSupportCategoryFilter">全部辅助</button>' : '';
  const title = activeSupportCategoryFilter || "辅助";
  return '<section class="support-classifier">' + renderSupportCategorySummary(supportCars) + '<section class="vehicle-position-group"><header class="vehicle-position-head"><h3>' + escapeHtml(title) + '</h3><div class="support-filter-head">' + filterText + '<span>' + filtered.length + ' / ' + categoryFiltered.length + ' 辆</span></div></header><div class="vehicle-rarity-group"><div class="vehicle-icon-grid support-icon-grid">' + (cards || '<p class="desc">没有符合搜索条件的辅助车。</p>') + '</div></div></section></section>';
}
function mixedBattlePairs(cars) {
  return cars.flatMap((base) => {
    const relations = normalizeVehicleRelations(base.details?.vehicleRelations || {})[mixedBattleSpRelationConfig.key] || [];
    return relations.map((relation) => {
      const sp = relation.type === "car" ? findItemById(relation.id) : null;
      return sp ? { base, sp, relation } : null;
    }).filter(Boolean);
  });
}
function mixedBattlePairMatches(pair, query) {
  const raw = normalizeText(query);
  if (!raw) return true;
  return carMatchesSearch(pair.base, raw) || carMatchesSearch(pair.sp, raw) || normalizeText(pair.relation.reason).toLowerCase().includes(raw.toLowerCase());
}
function renderMixedBattlePairVehicle(item, label, isSp = false) {
  const name = displayVehicleName(item);
  const image = renderImageWithFallback([item.image, item.images], "mixed-battle-car-image", name, "无图", { "image-item-id": item.id, "image-kind": "vehicle" });
  const meta = [carRarity(item), carPosition(item), carSeasonText(item)].filter(Boolean).join(" · ");
  const wrapperClass = isSp ? " mixed-battle-sp-car" : "";
  return '<button type="button" class="mixed-battle-car' + wrapperClass + '" data-mixed-car-id="' + escapeHtml(item.id) + '"><span class="mixed-battle-role">' + escapeHtml(label) + '</span><span class="vehicle-icon-art ' + vehicleRarityBackgroundClass(item) + '">' + image + renderVehicleInfoBadges(item) + '</span><strong>' + escapeHtml(name) + '</strong><small>' + escapeHtml(meta || "-") + '</small></button>';
}
function renderMixedBattleBranch(cars, sortMode, query) {
  const pairs = mixedBattlePairs(cars)
    .filter((pair) => mixedBattlePairMatches(pair, query))
    .sort((a, b) => compareCars(a.base, b.base, sortMode) || compareCars(a.sp, b.sp, sortMode));
  const cards = pairs.map((pair) => {
    const reason = normalizeText(pair.relation.reason);
    return '<article class="mixed-battle-pair-card"><div class="mixed-battle-pair">' + renderMixedBattlePairVehicle(pair.base, "本体") + '<span class="mixed-battle-plus">+</span>' + renderMixedBattlePairVehicle(pair.sp, "SP", true) + '</div>' + (reason ? '<p class="mixed-battle-reason" title="' + escapeHtml(reason) + '">' + escapeHtml(reason) + '</p>' : '') + '</article>';
  }).join("");
  return '<section class="vehicle-position-group mixed-battle-branch"><header class="vehicle-position-head"><h3>赛道模式 · 混乱激斗</h3><span>' + pairs.length + ' 组</span></header><div class="vehicle-rarity-group"><div class="mixed-battle-grid">' + (cards || '<p class="desc">还没有配置混斗 SP 搭配。</p>') + '</div></div></section>';
}
function render() {
  const query = $("search").value.trim();
  const position = $("positionFilter")?.value || "all";
  const rarity = $("rarityFilter")?.value || "all";
  const season = $("seasonFilter")?.value || "all";
  const sortMode = $("sortMode")?.value || "position";
  const performanceSortKey = activeLibraryBranch === "cars" ? ($("performanceSortMetric")?.value || "") : "";
  const performanceSortDirection = $("performanceSortDirection")?.value || "desc";
  const sortOptions = { performanceKey: performanceSortKey, performanceDirection: performanceSortDirection };
  const cars = items.filter((item) => item.type === "car");
  updateRarityFilterOptions(cars);
  updateSeasonFilterOptions(cars);
  $("view-library")?.classList.toggle("support-branch-active", activeLibraryBranch === "support");
  $("view-library")?.classList.toggle("mode-branch-active", activeLibraryBranch === "mixedBattle");
  if ($("search")) $("search").placeholder = activeLibraryBranch === "support" ? "搜索辅助车名称、别称、拼音、赛季" : activeLibraryBranch === "mixedBattle" ? "搜索混斗本体车、SP 车、原因" : "搜索赛车名称、定位、稀有度、赛季";
  const filtered = cars.filter((item) => carMatchesSearch(item, query) && (position === "all" || carPosition(item) === position) && (rarity === "all" || carRarity(item) === rarity) && (season === "all" || carSeasonFilterValue(item) === season));
  $("statItems").textContent = items.length;
  $("statCars").textContent = cars.length;
  $("statTracks").textContent = items.filter((item) => item.type === "track").length;
  $("libraryList").innerHTML = activeLibraryBranch === "groups" ? renderGroupsBranch() : activeLibraryBranch === "support" ? renderSupportBranch(cars, sortMode, query) : activeLibraryBranch === "mixedBattle" ? renderMixedBattleBranch(cars, sortMode, query) : renderVehicleGroups(filtered, sortMode, position, sortOptions);
}
function renderItemCard(item) {
  const tags = item.tags.slice(0, 14).map((tag) => '<span class="tag">' + escapeHtml(tag) + '</span>').join("");
  const stats = item.details?.stats || {}; const statPairs = Object.entries(stats).slice(0, 4);
  const meta = statPairs.length ? '<dl class="meta-list">' + statPairs.map(([k, v]) => '<div><dt>' + escapeHtml(k) + '</dt><dd>' + escapeHtml(v) + '</dd></div>').join("") + '</dl>' : "";
  const image = renderImageWithFallback([item.image, item.images], "item-image", item.name, "暂无图片", { "image-item-id": item.id, "image-kind": "vehicle" });
  const classified = Object.values(item.details?.abilityLabels || {}).filter(Boolean).length;
  const carMeta = normalizeCarMeta(item.details?.carMeta || {});
  const metaText = [carMeta.rarity, carMeta.category, carMeta.trackSpecialty ? "赛道专精：" + carMeta.trackSpecialty : "", carMeta.category === "天平" && carMeta.mainPosition ? "主位置：" + carMeta.mainPosition : "", carMeta.category === "天平" && carMeta.includedPositions.length ? "包含：" + carMeta.includedPositions.join("、") : ""].filter(Boolean).join(" · ") || "车辆分类未设置";
  return '<article class="item-card" data-item-id="' + escapeHtml(item.id) + '" tabindex="0">' + image + '<div class="item-content"><div class="item-head"><h3>' + escapeHtml(item.name) + '</h3><span class="type-pill type-' + item.type + '">' + (typeNames[item.type] || item.type) + '</span></div><p class="desc">' + escapeHtml(item.role || "未设置定位") + '</p><p class="desc">' + escapeHtml(metaText) + '</p><p class="desc">核心能力已分类：' + classified + ' / ' + (item.details?.coreAbilityNames?.length || 0) + '</p><p class="desc">' + escapeHtml(shorten(item.description || "暂无描述", 130)) + '</p>' + meta + '<div class="tags">' + (tags || '<span class="tag">无标签</span>') + '</div></div></article>';
}
function openDetail(itemId, options = {}) {
  if (options.pushHistory && activeDetailId && activeDetailId !== itemId) detailHistory.push(activeDetailId);
  activeDetailId = itemId;
  const item = items.find((entry) => entry.id === itemId);
  if (!item) return;
  const displayItem = sheetEditItemId === itemId && sheetEditDraft ? sheetEditDraft : (uiEditItemId === itemId && uiEditDraft ? uiEditDraft : item);
  $("detailTitle").textContent = displayItem.type === "car" ? displayVehicleName(displayItem) : displayItem.name;
  $("detailSubtitle").textContent = [displayItem.role, sheetEditItemId === itemId ? "正在编辑资料" : (uiEditItemId === itemId ? "正在编辑 UI" : "")].filter(Boolean).join(" · ");
  $("detailBody").innerHTML = renderDetail(displayItem);
  syncDetailHeader();
  $("detailModal").classList.remove("hidden");
}
function closeDetail() { activeDetailId = null; detailHistory = []; uiEditItemId = null; uiEditDraft = null; pendingUiTarget = null; sheetEditItemId = null; sheetEditDraft = null; $("detailModal").classList.add("hidden"); syncDetailHeader(); }
function activateView(viewName) {
  document.querySelectorAll(".nav-button").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  document.querySelectorAll(".view").forEach((item) => item.classList.toggle("active", item.id === "view-" + viewName));
}
function openVehicleFromUrlParam() {
  const params = new URLSearchParams(window.location.search);
  const vehicleId = params.get("openVehicle");
  if (!vehicleId) return;
  const item = items.find((entry) => entry.id === vehicleId && entry.type === "car") || items.find((entry) => entry.id === vehicleId);
  if (!item) return;
  activeLibraryBranch = "cars";
  activateView("library");
  if ($("search")) $("search").value = "";
  render();
  openDetail(item.id);
  params.delete("openVehicle");
  const nextQuery = params.toString();
  const nextUrl = window.location.pathname + (nextQuery ? "?" + nextQuery : "") + window.location.hash;
  window.history.replaceState({}, "", nextUrl);
}
function openRelatedVehicleDetail(itemId) { openDetail(itemId, { pushHistory: true }); }
function backDetail() {
  const previous = detailHistory.pop();
  if (previous) openDetail(previous);
}
function renderRelationDiagram(item, heroImage) {
  var cfgList = [{key:"recommendedTeammates",label:"推荐队友车辆",lineClass:"relation-line-green",cssClass:"corner-tl",labelClass:"corner-label-green"},{key:"notRecommendedTeammates",label:"不推荐队友车辆",lineClass:"relation-line-red",cssClass:"corner-tr",labelClass:"corner-label-red"},{key:"counteredOpponents",label:"克制对手车辆",lineClass:"relation-line-green",cssClass:"corner-bl",labelClass:"corner-label-green"},{key:"countersByOpponents",label:"被对手车辆克制",lineClass:"relation-line-red",cssClass:"corner-br",labelClass:"corner-label-red"}];
  var allRel = normalizeVehicleRelations(item.details&&item.details.vehicleRelations||{});
  var corners = "";
  for(var ci=0;ci<cfgList.length;ci++){var cfg=cfgList[ci];var rels=allRel[cfg.key]||[];var cards=[];for(var ri=0;ri<rels.length;ri++){var r=rels[ri];var isCat=r.type==="supportCategory";var isGrp=r.type==="group";var carItem=(isCat||isGrp)?null:findItemById(r.id);var name=isCat?r.id:(isGrp?(function(){var gg=groups.find(function(g){return g.id===r.id;});return gg?gg.name:r.id;})():(carItem?displayVehicleName(carItem):r.id));var imgHtml;if(isCat){imgHtml='<div class="corner-car-thumb image-fallback" style="display:grid;place-items:center;background:#eaf7f1;color:#12805a;font-size:18px;font-weight:900;width:52px;height:32px;border-radius:4px;">辅</div>';}else if(isGrp){var gd=groups.find(function(g){return g.id===r.id;});imgHtml='<div class="corner-car-thumb image-fallback" style="display:flex;align-items:center;justify-content:center;background:#f0eefc;color:#6c5ce7;font-size:18px;font-weight:900;width:52px;height:32px;border-radius:4px;">'+(function(){if(gd&&gd.type==='lineup')return '<span style="display:inline-block;background:#6c5ce7;color:#fff;font-size:9px;font-weight:800;padding:0 2px;border-radius:2px;line-height:14px;margin-right:1px">阵</span>'+escapeHtml((gd&&gd.name)?gd.name.charAt(0):'');return escapeHtml((gd&&gd.name)?gd.name.charAt(0):'组')})()+'</div>';var gc=(gd?gd.carIds||[]:[]).map(function(cid){var ci=findItemById(cid);if(!ci)return"";var cn=displayVehicleName(ci);return'<div class="group-tooltip-car" data-item-id="'+escapeHtml(ci.id)+'">'+renderImageWithFallback([ci.image,ci.images],"",cn,"无图")+'<span>'+escapeHtml(cn)+'</span></div>';}).filter(Boolean).join("");if(gc)imgHtml+='<div class="group-tooltip"><div class="group-tooltip-title">'+escapeHtml(gd?gd.name:name)+'</div><div class="group-tooltip-cars">'+gc+'</div></div>';}else if(carItem){imgHtml=renderImageWithFallback([carItem.image,carItem.images],"corner-car-thumb",name,"无图");}else{imgHtml='<div class="image-fallback corner-car-thumb">无图</div>';}cards.push('<div class="corner-car'+(isGrp?' group-car':'')+'" data-item-id="'+escapeHtml(r.id)+'" data-relation-type="'+(isCat?"supportCategory":isGrp?"group":"car")+'" title="'+escapeHtml(name)+(r.reason?': '+r.reason:'')+'">'+imgHtml+'<span class="corner-car-name">'+escapeHtml(name)+'</span></div>');}
  var bodyHtml=cards.length>0?cards.join(""):'<div class="corner-empty">暂未设置</div>';corners+='<div class="diagram-corner '+cfg.cssClass+'"><div class="corner-label '+cfg.labelClass+'">'+escapeHtml(cfg.label)+'</div><div class="corner-cars">'+bodyHtml+'</div></div>';}
  var svg="";var dm={"corner-tl":["18%","18%"],"corner-tr":["82%","18%"],"corner-bl":["18%","82%"],"corner-br":["82%","82%"]};for(var si=0;si<cfgList.length;si++){var sc=cfgList[si];var xy=dm[sc.cssClass];svg+='<line class="'+sc.lineClass+'" x1="'+xy[0]+'" y1="'+xy[1]+'" x2="50%" y2="50%" />';}
  return '<div class="relation-diagram-wrapper"><svg class="relation-svg-lines" viewBox="0 0 100 100" preserveAspectRatio="none">'+svg+'</svg><div class="diagram-center">'+heroImage+'</div>'+corners+'</div>';
}
function renderDetail(item) {
 const details = item.details || {};
  const attrs = details.attrs || {};
  const stats = details.stats || {};
  const skills = details.skills || [];
  const coreNames = details.coreAbilityNames || inferCoreAbilityNames(skills);
  const gallery = [item.image, ...(item.images || [])].filter(Boolean);
  const editing = Boolean((uiEditItemId === item.id && uiEditDraft) || (sheetEditItemId === item.id && sheetEditDraft));
  const heroImage = renderVehicleUi(item, gallery, item.name, editing, item.id);
  const editNotice = editing ? '<p class="edit-notice">编辑资料模式：点击车辆图片或任意技能图标可上传替换；保存资料后才会写入资料库。</p>' : '';
  const editStatus = editing ? '<p id="imageReloadStatus" class="status-text"></p>' : '';
  return renderRelationDiagram(item, heroImage) + editNotice + editStatus + renderSpeedSheetSection(item) + renderMixedBattleSpSection(item) + renderCarClassSection(item) + renderAbilityClassifier(item, coreNames, skills) + renderKvSection("基础信息", attrs) + renderPerformanceSection(item, stats) + renderSkillsSection(skills, editing, item.id);
}
function renderVehicleUi(item, candidates, name, editing, itemId) {
  const image = renderImageWithFallback(candidates, "", name, "暂无图片", { "image-item-id": itemId, "image-kind": "vehicle" });
  const driveAnchor = normalizeVehicleDriveAnchor(item.details?.driveAnchor);
  const driveAnchorHtml = editing ? '<button type="button" class="vehicle-drive-anchor-point" data-vehicle-anchor-point="1" style="left:' + driveAnchor.x + '%;top:' + driveAnchor.y + '%" title="桌宠开车车辆对齐点"></button>' : "";
  const art = '<div class="vehicle-detail-art ' + vehicleRarityBackgroundClass(item) + '">' + image + renderVehicleInfoBadges(item) + driveAnchorHtml + '<div class="vehicle-detail-rarity">' + escapeHtml(carRarity(item)) + '</div></div>';
  if (!editing) return art;
  return '<div class="ui-upload-target vehicle-ui-target detail-vehicle-upload" data-ui-target="vehicle" role="button" tabindex="0">' + art +
    '<div class="vehicle-drive-anchor-editor">' +
    '<strong>桌宠开车对齐点</strong>' +
    '<label>X<input class="vehicle-drive-anchor-input vehicle-drive-anchor-x" type="number" min="0" max="100" step="1" value="' + Math.round(driveAnchor.x) + '" /></label>' +
    '<label>Y<input class="vehicle-drive-anchor-input vehicle-drive-anchor-y" type="number" min="0" max="100" step="1" value="' + Math.round(driveAnchor.y) + '" /></label>' +
    '</div>' +
    '<span>点击上传车辆 UI</span></div>';
}
function speedSheetDisplayFieldsForItem(item) {
 const hidden = new Set([...speedSheetHiddenDisplayFields, ...speedSheetEditablePerformanceFields]);
  hidden.add("推荐队友车辆");
  hidden.add("不推荐队友车辆");
  hidden.add("克制对手车辆");
  hidden.add("被对手车辆克制");
  const position = carPosition(item);
  if (position !== "天平") {
    if (position === "辅助" || position === "竞速") hidden.add("干扰距离");
    if (position === "干扰" || position === "竞速") hidden.add("辅助距离");
  }
  return speedSheetFields.filter((field) => !hidden.has(field));
}
function vehiclePerformanceData(item, stats) {
  const data = item.details?.speedSheet || {};
  const row = findSpeedSheetRowByName(item.details?.speedSheetSourceName || item.name) || findSpeedSheetRowByName(item.name);
  const out = { ...(stats || {}) };
  speedSheetEditablePerformanceFields.forEach((field) => {
    const savedValue = meaningfulValue(data[field]);
    const sheetValue = meaningfulValue(row?.[field]);
    if (!meaningfulValue(out[field])) out[field] = savedValue || sheetValue || "-";
  });
  return out;
}
function loadPerformanceStatsCache() {
  try {
    const cache = JSON.parse(localStorage.getItem(PERFORMANCE_STATS_KEY) || "null");
    return cache && cache.version === PERFORMANCE_STATS_VERSION && cache.metrics ? cache : null;
  } catch {
    return null;
  }
}
function savePerformanceStatsCache(cache) {
  try { localStorage.setItem(PERFORMANCE_STATS_KEY, JSON.stringify(cache)); } catch {}
}
function loadPerformanceRadarMode() {
  try {
    const value = localStorage.getItem(PERFORMANCE_RADAR_MODE_KEY) || "closed";
    return ["closed", "open", "all"].includes(value) ? value : "closed";
  } catch {
    return "closed";
  }
}
function savePerformanceRadarMode(value) {
  performanceRadarMode = ["closed", "open", "all"].includes(value) ? value : "closed";
  try { localStorage.setItem(PERFORMANCE_RADAR_MODE_KEY, performanceRadarMode); } catch {}
}
function splitPerformanceValue(value, index) {
  const text = meaningfulValue(value);
  if (!text) return "";
  let slashIndex = -1;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== "/" && text[i] !== "／") continue;
    const before = text.slice(Math.max(0, i - 2), i).toLowerCase();
    const after = text.slice(i + 1, i + 2).toLowerCase();
    if (before === "km" && after === "h") continue;
    slashIndex = i;
    break;
  }
  if (slashIndex < 0) return index === 0 ? text : "";
  return meaningfulValue(index === 0 ? text.slice(0, slashIndex) : text.slice(slashIndex + 1));
}
function performanceMetricRawValue(item, metric, data) {
  const stats = item.details?.stats || {};
  const mapped = meaningfulValue(data?.[metric.sheetField] ?? stats?.[metric.sheetField]);
  if (mapped) return mapped;
  const direct = meaningfulValue(stats?.[metric.field] ?? data?.[metric.field]);
  if (!direct) return "";
  if (Number.isInteger(metric.splitIndex)) return splitPerformanceValue(direct, metric.splitIndex);
  return direct;
}
function parsePerformanceNumber(value) {
  const text = meaningfulValue(value);
  if (!text) return null;
  const normalized = text
    .replace(/，/g, ",")
    .replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2")
    .replace(/,/g, "");
  const matches = normalized.match(/-?(?:\d+(?:\.\d+)?|\.\d+)/g);
  if (!matches || !matches.length) return null;
  const sum = matches.reduce((total, part) => total + Number(part), 0);
  return Number.isFinite(sum) ? sum : null;
}
function parseLastPerformanceNumber(value) {
  const text = meaningfulValue(value);
  if (!text) return null;
  const normalized = text
    .replace(/，/g, ",")
    .replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2")
    .replace(/,/g, "");
  const matches = normalized.match(/-?(?:\d+(?:\.\d+)?|\.\d+)/g);
  if (!matches || !matches.length) return null;
  const valueNumber = Number(matches[matches.length - 1]);
  return Number.isFinite(valueNumber) ? valueNumber : null;
}
function isSkillBoostPerformanceMetric(metric) {
  return speedSheetSkillBoostFields.includes(metric?.sheetField) || metric?.key === "skillTopSpeedBoost" || metric?.key === "ultimateDuration";
}
function normalizePerformanceNumberForMetric(metric, raw) {
  const value = isSkillBoostPerformanceMetric(metric) ? parseLastPerformanceNumber(raw) : parsePerformanceNumber(raw);
  if (!Number.isFinite(value)) return null;
  const text = meaningfulValue(raw);
  if (metric?.unit === "%" && value > 0 && value < 1 && !text.includes("%")) return value * 100;
  return value;
}
function formatNormalizedPerformanceDisplay(metric, raw, value) {
  const text = meaningfulValue(raw);
  if (!text) return "";
  if (metric?.unit === "%" && Number.isFinite(value) && !text.includes("%")) {
    const parsed = parsePerformanceNumber(text);
    if (Number.isFinite(parsed) && parsed > 0 && parsed < 1) return Number(value.toFixed(4)).toString() + "%";
  }
  return text;
}
function performanceMetricLabel(metric) {
  return metric.unit ? metric.label + "（" + metric.unit + "）" : metric.label;
}
function performanceMetricDisplayNumber(value, unit = "") {
  const text = cleanNumberText(value);
  return text ? text + unit : "";
}
function skillBoostRawValue(item, data) {
  return meaningfulValue(data?.["技能极速提升"]) || meaningfulValue(item.details?.speedSheet?.["技能极速提升"]) || "";
}
function ultimateDurationRawValue(item, data) {
  return meaningfulValue(data?.["大招持续时间"]) || meaningfulValue(item.details?.speedSheet?.["大招持续时间"]) || "";
}
function openTopSpeedNumber(item, data) {
  if (carPosition(item) !== "竞速") return null;
  const topSpeedMetric = performanceRadarMetrics[0];
  const base = normalizePerformanceNumberForMetric(topSpeedMetric, performanceMetricRawValue(item, topSpeedMetric, data));
  const boost = normalizePerformanceNumberForMetric(performanceSkillBoostEditMetrics[0], skillBoostRawValue(item, data));
  if (!Number.isFinite(base) || !Number.isFinite(boost)) return null;
  return base + boost;
}
function buildPerformanceMetricRecord(metric, metricValues) {
  const sorted = metricValues.slice().sort((a, b) => b.value - a.value);
  const rankForValue = new Map();
  const countForValue = new Map();
  sorted.forEach((entry, index) => {
    if (!rankForValue.has(entry.value)) rankForValue.set(entry.value, index + 1);
    countForValue.set(entry.value, (countForValue.get(entry.value) || 0) + 1);
  });
  const ranks = {};
  const ties = {};
  const values = {};
  const displayValues = {};
  metricValues.forEach((entry) => {
    ranks[entry.id] = rankForValue.get(entry.value);
    ties[entry.id] = countForValue.get(entry.value) || 1;
    values[entry.id] = entry.value;
    displayValues[entry.id] = entry.raw;
  });
  return {
    key: metric.key,
    label: metric.label,
    unit: metric.unit || "",
    field: metric.field || "",
    min: metricValues.length ? Math.min(...metricValues.map((entry) => entry.value)) : null,
    max: metricValues.length ? Math.max(...metricValues.map((entry) => entry.value)) : null,
    total: metricValues.length,
    ranks,
    ties,
    values,
    displayValues,
  };
}
function computePerformanceCompositeRecord(cars, metrics) {
  const metricCount = performanceRadarMetrics.length;
  const values = cars.map((car) => {
    const ratios = performanceRadarMetrics.map((metric) => {
      const record = metrics[metric.key] || {};
      const value = Number(record.values?.[car.id]);
      const max = Number(record.max);
      return Number.isFinite(value) && Number.isFinite(max) && max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
    });
    const normalizedArea = ratios.reduce((total, ratio, index) => total + ratio * ratios[(index + 1) % metricCount], 0) / metricCount;
    const score = Number((normalizedArea * 100).toFixed(2));
    return { id: car.id, name: displayVehicleName(car), value: score, raw: score.toFixed(2) };
  });
  return buildPerformanceMetricRecord(performanceCompositeMetric, values);
}
function computePerformanceStatsDatabase() {
  items = items.map((entry) => entry.type === "car" ? applySkillBoostData(entry) : entry);
  const cars = items.filter((entry) => entry.type === "car");
  const metrics = {};
  performanceRadarMetrics.forEach((metric) => {
    const metricValues = [];
    cars.forEach((car) => {
      const data = vehiclePerformanceData(car, car.details?.stats || {});
      const raw = performanceMetricRawValue(car, metric, data);
      const value = normalizePerformanceNumberForMetric(metric, raw);
      if (Number.isFinite(value)) metricValues.push({ id: car.id, name: displayVehicleName(car), value, raw: formatNormalizedPerformanceDisplay(metric, raw, value) || String(value) });
    });
    metrics[metric.key] = buildPerformanceMetricRecord(metric, metricValues);
  });
  const openTopSpeedValues = [];
  const ultimateDurationValues = [];
  cars.forEach((car) => {
    const data = vehiclePerformanceData(car, car.details?.stats || {});
    const openSpeed = openTopSpeedNumber(car, data);
    if (Number.isFinite(openSpeed)) {
      openTopSpeedValues.push({ id: car.id, name: displayVehicleName(car), value: openSpeed, raw: performanceMetricDisplayNumber(openSpeed, "km/h") });
    }
    const durationRaw = ultimateDurationRawValue(car, data);
    const duration = normalizePerformanceNumberForMetric(performanceUltimateDurationMetric, durationRaw);
    if (Number.isFinite(duration)) {
      ultimateDurationValues.push({ id: car.id, name: displayVehicleName(car), value: duration, raw: formatNormalizedPerformanceDisplay(performanceUltimateDurationMetric, durationRaw, duration) || performanceMetricDisplayNumber(duration, "秒") });
    }
  });
  metrics[performanceOpenTopSpeedMetric.key] = buildPerformanceMetricRecord(performanceOpenTopSpeedMetric, openTopSpeedValues);
  metrics[performanceUltimateDurationMetric.key] = buildPerformanceMetricRecord(performanceUltimateDurationMetric, ultimateDurationValues);
  metrics[performanceCompositeMetric.key] = computePerformanceCompositeRecord(cars, metrics);
  return { version: PERFORMANCE_STATS_VERSION, builtAt: new Date().toISOString(), carCount: cars.length, metrics };
}
function buildPerformanceStatsDatabase() {
  if (isReadOnlyMode()) { showReadOnlyNotice(); return; }
  const cars = items.filter((entry) => entry.type === "car");
  if (!cars.length) {
    setStatus("资料库里还没有车辆，无法计算性能排名。", "error");
    return;
  }
  performanceStatsCache = computePerformanceStatsDatabase();
  saveItems();
  savePerformanceStatsCache(performanceStatsCache);
  const metricCount = performanceRadarMetrics.filter((metric) => performanceStatsCache.metrics?.[metric.key]?.total).length;
  const openCount = performanceStatsCache.metrics?.[performanceOpenTopSpeedMetric.key]?.total || 0;
  setStatus("性能排名已计算：" + cars.length + " 辆车，" + metricCount + " 个基础指标，" + openCount + " 辆竞速车开大极速，并生成综合分。", "success");
  if (activeDetailId) openDetail(activeDetailId);
}
function ensurePerformanceStatsCache() {
  const carCount = items.filter((entry) => entry.type === "car").length;
  const needsRebuild = !performanceStatsCache
    || performanceStatsCache.version !== PERFORMANCE_STATS_VERSION
    || performanceStatsCache.carCount !== carCount
    || !performanceStatsCache.metrics?.[performanceOpenTopSpeedMetric.key]
    || !performanceStatsCache.metrics?.[performanceUltimateDurationMetric.key];
  if (!needsRebuild) return;
  performanceStatsCache = computePerformanceStatsDatabase();
  savePerformanceStatsCache(performanceStatsCache);
}
function performanceMetricDisplayValue(item, metric, data, record) {
  const cached = meaningfulValue(record?.displayValues?.[item.id]);
  if (cached) return cached;
  if (metric.key === performanceOpenTopSpeedMetric.key) {
    const value = openTopSpeedNumber(item, data);
    return Number.isFinite(value) ? performanceMetricDisplayNumber(value, "km/h") : "-";
  }
  const raw = performanceMetricRawValue(item, metric, data);
  const value = normalizePerformanceNumberForMetric(metric, raw);
  return formatNormalizedPerformanceDisplay(metric, raw, value) || raw || "-";
}
function performanceRankText(record, itemId) {
  const rank = record?.ranks?.[itemId];
  if (!rank) return "未排名";
  const prefix = Number(record?.ties?.[itemId] || 1) > 1 ? "并列第 " : "第 ";
  return prefix + rank + " / " + (record.total || 0);
}
function performanceGradeForRank(record, itemId) {
  const rank = Number(record?.ranks?.[itemId]);
  const total = Number(record?.total);
  if (!Number.isFinite(rank) || !Number.isFinite(total) || rank <= 0 || total <= 0) return { label: "-", className: "performance-grade-missing" };
  const bucket = Math.min(4, Math.max(0, Math.floor(((rank - 1) / total) * 5)));
  return [
    { label: "S", className: "performance-grade-s" },
    { label: "A", className: "performance-grade-a" },
    { label: "B", className: "performance-grade-b" },
    { label: "C", className: "performance-grade-c" },
    { label: "D", className: "performance-grade-d" },
  ][bucket];
}
function normalizePerformanceRadarMode(mode) {
  return ["closed", "open", "all"].includes(mode) ? mode : "closed";
}
function renderPerformanceRadarModeControl(mode) {
  const options = [
    ["closed", "未开大"],
    ["open", "开大"],
    ["all", "全部"],
  ].map(([value, label]) => '<option value="' + value + '"' + (mode === value ? " selected" : "") + '>' + label + '</option>').join("");
  return '<label class="performance-radar-mode-control"><span>图表模式</span><select id="performanceRadarMode">' + options + '</select></label>';
}
function renderUltimateDurationAnnotation(item, data, cache, center) {
  const record = cache.metrics?.[performanceUltimateDurationMetric.key] || {};
  const value = performanceMetricDisplayValue(item, performanceUltimateDurationMetric, data, record);
  const rank = performanceRankText(record, item.id);
  if ((!value || value === "-") && rank === "未排名") return "";
  return '<g class="performance-radar-duration-label"><text x="' + center + '" y="39" text-anchor="middle">大招持续时间 ' + escapeHtml(value || "-") + '</text><text x="' + center + '" y="56" text-anchor="middle">' + escapeHtml(rank) + '</text></g>';
}
function renderPerformanceRadarSvg(item, data, cache, mode = "closed") {
  mode = normalizePerformanceRadarMode(mode);
  const size = 720;
  const center = size / 2;
  const maxRadius = 212;
  const gradeRadius = 238;
  const labelRadius = 266;
  const count = performanceRadarMetrics.length;
  const pointFor = (angle, radius) => ({
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  });
  const angles = performanceRadarMetrics.map((_, index) => -Math.PI / 2 + (Math.PI * 2 * index) / count);
  const polygonForRadius = (radius) => angles.map((angle) => {
    const point = pointFor(angle, radius);
    return point.x.toFixed(1) + "," + point.y.toFixed(1);
  }).join(" ");
  const grid = [0.25, 0.5, 0.75, 1].map((ratio) => '<polygon class="performance-radar-grid-ring" points="' + polygonForRadius(maxRadius * ratio) + '"></polygon>').join("");
  const axes = angles.map((angle) => {
    const end = pointFor(angle, maxRadius);
    return '<line class="performance-radar-axis" x1="' + center + '" y1="' + center + '" x2="' + end.x.toFixed(1) + '" y2="' + end.y.toFixed(1) + '"></line>';
  }).join("");
  const gradeDefs = '<defs>' +
    '<linearGradient id="performance-grade-world" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff3a3"/><stop offset="48%" stop-color="#8ee8ff"/><stop offset="100%" stop-color="#fca5ff"/></linearGradient>' +
    '<linearGradient id="performance-grade-legendary" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff1a6"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>' +
    '<linearGradient id="performance-grade-epic" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f0abfc"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient>' +
    '<linearGradient id="performance-grade-rare" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#93c5fd"/><stop offset="100%" stop-color="#2563eb"/></linearGradient>' +
    '<linearGradient id="performance-grade-common" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e5e7eb"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>' +
    '</defs>';
  const basePoints = performanceRadarMetrics.map((metric, index) => {
    const record = cache.metrics?.[metric.key] || {};
    const value = Number(record.values?.[item.id]);
    const max = Number(record.max);
    let ratio = 0;
    if (Number.isFinite(value) && Number.isFinite(max) && max > 0) {
      ratio = value / max;
    }
    ratio = Math.max(0, Math.min(1, ratio));
    const point = pointFor(angles[index], maxRadius * ratio);
    return { metric, record, value, point };
  });
  const openTopSpeedRecord = cache.metrics?.[performanceOpenTopSpeedMetric.key] || {};
  const baseTopSpeedRecord = cache.metrics?.[performanceRadarMetrics[0].key] || {};
  const openTopSpeedValue = Number(openTopSpeedRecord.values?.[item.id]);
  const baseTopSpeedMax = Number(baseTopSpeedRecord.max);
  const openTopSpeedRatio = Number.isFinite(openTopSpeedValue) && Number.isFinite(baseTopSpeedMax) && baseTopSpeedMax > 0 ? Math.max(0, openTopSpeedValue / baseTopSpeedMax) : null;
  const openTopSpeedPoint = Number.isFinite(openTopSpeedRatio) ? pointFor(angles[0], maxRadius * openTopSpeedRatio) : null;
  const openPoints = basePoints.map((entry, index) => index === 0 && openTopSpeedPoint ? { ...entry, metric: performanceOpenTopSpeedMetric, record: openTopSpeedRecord, value: openTopSpeedValue, point: openTopSpeedPoint } : entry);
  const baseShape = basePoints.map((entry) => entry.point.x.toFixed(1) + "," + entry.point.y.toFixed(1)).join(" ");
  const openShape = openPoints.map((entry) => entry.point.x.toFixed(1) + "," + entry.point.y.toFixed(1)).join(" ");
  const shapeLayer = mode === "open" && openTopSpeedPoint
    ? '<polygon class="performance-radar-shape performance-radar-shape-open" points="' + openShape + '"></polygon>'
    : mode === "all" && openTopSpeedPoint
      ? '<polygon class="performance-radar-shape performance-radar-shape-base" points="' + baseShape + '"></polygon><polygon class="performance-radar-shape performance-radar-shape-open" points="' + openShape + '"></polygon>'
      : '<polygon class="performance-radar-shape" points="' + baseShape + '"></polygon>';
  const compositeRecord = cache.metrics?.[performanceCompositeMetric.key] || {};
  const compositeScore = meaningfulValue(compositeRecord.displayValues?.[item.id]) || "-";
  const compositeRank = performanceRankText(compositeRecord, item.id);
  const centerScore = '<g class="performance-radar-center-score"><text x="' + center + '" y="' + (center - 7) + '" text-anchor="middle">' + escapeHtml(compositeScore) + '</text><text x="' + center + '" y="' + (center + 13) + '" text-anchor="middle">' + escapeHtml(compositeRank) + '</text></g>';
  const pointGroups = performanceRadarMetrics.map((metric, index) => {
    const usingOpenTopSpeed = index === 0 && mode === "open" && openTopSpeedPoint;
    const labelMetric = usingOpenTopSpeed ? performanceOpenTopSpeedMetric : metric;
    const record = usingOpenTopSpeed ? openTopSpeedRecord : (cache.metrics?.[metric.key] || {});
    const dataPoint = usingOpenTopSpeed ? openTopSpeedPoint : basePoints[index].point;
    const gradePoint = pointFor(angles[index], gradeRadius);
    const grade = performanceGradeForRank(record, item.id);
    const labelPoint = pointFor(angles[index], labelRadius);
    const anchor = labelPoint.x < center - 16 ? "end" : (labelPoint.x > center + 16 ? "start" : "middle");
    const valueText = performanceMetricDisplayValue(item, labelMetric, data, record);
    const rankText = performanceRankText(record, item.id);
    const y = labelPoint.y + (labelPoint.y < center - labelRadius * 0.65 ? -8 : 0);
    return '<g class="performance-radar-point-group" data-metric="' + escapeHtml(labelMetric.key) + '"><circle class="performance-radar-hit" cx="' + dataPoint.x.toFixed(1) + '" cy="' + dataPoint.y.toFixed(1) + '" r="17"></circle><circle class="performance-radar-dot' + (usingOpenTopSpeed ? ' performance-radar-dot-open' : '') + '" cx="' + dataPoint.x.toFixed(1) + '" cy="' + dataPoint.y.toFixed(1) + '" r="4.8"></circle><g class="performance-radar-grade ' + grade.className + '" transform="translate(' + gradePoint.x.toFixed(1) + ' ' + gradePoint.y.toFixed(1) + ')"><rect x="-15" y="-11" width="30" height="22" rx="7"></rect><text y="1" text-anchor="middle" dominant-baseline="middle">' + escapeHtml(grade.label) + '</text></g><text class="performance-radar-label" x="' + labelPoint.x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="' + anchor + '"><tspan x="' + labelPoint.x.toFixed(1) + '" dy="0">' + escapeHtml(performanceMetricLabel(labelMetric)) + '</tspan><tspan x="' + labelPoint.x.toFixed(1) + '" dy="15">' + escapeHtml(valueText) + '</tspan><tspan x="' + labelPoint.x.toFixed(1) + '" dy="15">' + escapeHtml(rankText) + '</tspan></text></g>';
  }).join("");
  const openTopSpeedAnnotation = mode === "all" && openTopSpeedPoint ? '<g class="performance-radar-open-label"><circle class="performance-radar-dot performance-radar-dot-open" cx="' + openTopSpeedPoint.x.toFixed(1) + '" cy="' + openTopSpeedPoint.y.toFixed(1) + '" r="5.2"></circle><text x="' + center + '" y="78" text-anchor="middle"><tspan x="' + center + '" dy="0">开大极速</tspan><tspan x="' + center + '" dy="16">' + escapeHtml(performanceMetricDisplayValue(item, performanceOpenTopSpeedMetric, data, openTopSpeedRecord)) + '</tspan><tspan x="' + center + '" dy="16">' + escapeHtml(performanceRankText(openTopSpeedRecord, item.id)) + '</tspan></text></g>' : "";
  const durationAnnotation = mode !== "closed" ? renderUltimateDurationAnnotation(item, data, cache, center) : "";
  return '<div class="performance-radar-chart" aria-label="性能十二边形强度图"><svg class="performance-radar-svg" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" preserveAspectRatio="xMidYMid meet" role="img">' + gradeDefs + grid + axes + shapeLayer + centerScore + durationAnnotation + pointGroups + openTopSpeedAnnotation + '</svg></div>';
}
function renderPerformanceRadarSection(item, data) {
  const cache = performanceStatsCache?.version === PERFORMANCE_STATS_VERSION ? performanceStatsCache : null;
  const mode = normalizePerformanceRadarMode(performanceRadarMode);
  const builtAt = cache?.builtAt ? new Date(cache.builtAt).toLocaleString("zh-CN", { hour12: false }) : "";
  const rows = performanceRadarMetrics.map((metric) => {
    const record = cache?.metrics?.[metric.key] || {};
    const value = performanceMetricDisplayValue(item, metric, data, record);
    const rank = cache ? performanceRankText(record, item.id) : "未计算";
    return '<div class="kv performance-kv performance-radar-metric"><dt>' + escapeHtml(performanceMetricLabel(metric)) + '</dt><dd><span class="performance-radar-value">' + formatDetailValue(value) + '</span><span class="performance-radar-rank">' + escapeHtml(rank) + '</span></dd></div>';
  }).join("");
  if (!cache) {
    return '<section class="detail-section performance-radar-section"><div class="performance-radar-head"><h3>性能数据</h3><div class="performance-radar-head-actions">' + renderPerformanceRadarModeControl(mode) + '<span class="performance-radar-badge muted">未计算排名</span></div></div><p class="desc">在车辆导入面板点击“计算性能排名”后，会生成全车最高/最低值、并列排名和十二边形强度图。</p><dl class="kv-grid performance-radar-list">' + rows + '</dl></section>';
  }
  const chart = renderPerformanceRadarSvg(item, data, cache, mode);
  const badge = '已计算 ' + (cache.carCount || 0) + ' 辆' + (builtAt ? ' · ' + builtAt : '');
  return '<section class="detail-section performance-radar-section"><div class="performance-radar-head"><h3>性能数据</h3><div class="performance-radar-head-actions">' + renderPerformanceRadarModeControl(mode) + '<span class="performance-radar-badge">' + escapeHtml(badge) + '</span></div></div><div class="performance-radar-layout">' + chart + '<dl class="kv-grid performance-radar-list">' + rows + '</dl></div></section>';
}
function buildPerformanceEditEntries(item, data) {
  const stats = item.details?.stats || {};
  const covered = new Set();
  [...performanceRadarMetrics, ...performanceSkillBoostEditMetrics].forEach((metric) => {
    covered.add(metric.field);
    if (metric.sheetField) covered.add(metric.sheetField);
  });
  const primary = [...performanceRadarMetrics, ...performanceSkillBoostEditMetrics].map((metric) => {
    const value = performanceMetricRawValue(item, metric, data) || "-";
    return {
      key: metric.key,
      label: performanceMetricLabel(metric),
      value,
      field: metric.field,
      sheetField: metric.sheetField || "",
      splitIndex: Number.isInteger(metric.splitIndex) ? metric.splitIndex : "",
      primary: true,
    };
  });
  const extraKeys = [];
  Object.keys(stats || {}).forEach((key) => {
    if (!covered.has(key) && !extraKeys.includes(key)) extraKeys.push(key);
  });
  Object.keys(data || {}).forEach((key) => {
    if (!covered.has(key) && !extraKeys.includes(key)) extraKeys.push(key);
  });
  const extra = extraKeys.map((key) => ({
    key,
    label: key,
    value: meaningfulValue(stats?.[key]) || meaningfulValue(data?.[key]) || "-",
    field: key,
    sheetField: "",
    splitIndex: "",
    primary: false,
  }));
  return { primary, extra };
}
function renderPerformanceEditField(entry) {
  const className = entry.primary ? "sheet-edit-field performance-edit-field performance-primary-field" : "sheet-edit-field performance-edit-field performance-extra-field";
  const attrs = [
    'class="performance-field-input"',
    'data-performance-field="' + escapeHtml(entry.field) + '"',
    entry.sheetField ? 'data-performance-sheet-field="' + escapeHtml(entry.sheetField) + '"' : '',
    entry.splitIndex !== "" ? 'data-performance-split-index="' + escapeHtml(entry.splitIndex) + '"' : '',
  ].filter(Boolean).join(" ");
  const emptyAttrs = [
    'type="button"',
    'class="performance-field-empty"',
    'data-performance-field="' + escapeHtml(entry.field) + '"',
    entry.sheetField ? 'data-performance-sheet-field="' + escapeHtml(entry.sheetField) + '"' : '',
    entry.splitIndex !== "" ? 'data-performance-split-index="' + escapeHtml(entry.splitIndex) + '"' : '',
  ].filter(Boolean).join(" ");
  return '<div class="' + className + '"><label><span>' + escapeHtml(entry.label) + '</span><div><input ' + attrs + ' value="' + escapeHtml(entry.value) + '" /><button ' + emptyAttrs + '>-</button></div></label></div>';
}
function renderPerformanceSection(item, stats) {
  const data = vehiclePerformanceData(item, stats);
  const editing = sheetEditItemId === item.id && sheetEditDraft;
  const entries = Object.entries(data || {}).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!entries.length && !editing) return '';
  if (!editing) return renderPerformanceRadarSection(item, data);
  const editEntries = buildPerformanceEditEntries(item, data);
  const primaryRows = editEntries.primary.map(renderPerformanceEditField).join("");
  const extraRows = editEntries.extra.length ? '<div class="sheet-edit-subhead performance-extra-subhead">额外性能数据</div>' + editEntries.extra.map(renderPerformanceEditField).join("") : "";
  return '<section class="detail-section performance-edit-section"><h3>性能数据</h3><div class="sheet-edit-grid performance-edit-grid">' + primaryRows + extraRows + '</div></section>';
}
function renderSpeedSheetSection(item) {
  const data = item.details?.speedSheet || speedSheetDetails(null);
  const sourceName = item.details?.speedSheetSourceName || "未匹配到表格车辆";
  const editing = sheetEditItemId === item.id && sheetEditDraft;
  if (editing) {
    const sourceInput = '<label class="sheet-edit-field sheet-source-name-field"><span>赛车名称/别称（用 / 分隔）</span><div><input id="sheetSourceNameInput" value="' + escapeHtml(sourceName === "未匹配到表格车辆" ? "" : sourceName) + '" placeholder="主名称/别称1/别称2" /></div></label>';
    const fields = speedSheetFields.filter((field) => !speedSheetEditablePerformanceFields.includes(field) && !speedSheetReasonFields.includes(field)).map((field) => {
      const value = data[field] || "-";
      const relationConfig = vehicleRelationConfigs.find((config) => config.field === field);
      const relationBlock = relationConfig ? renderVehicleRelationBlock(item, relationConfig) : "";
      const className = relationConfig ? "sheet-edit-field sheet-relation-edit-field" : "sheet-edit-field";
      return '<div class="' + className + '"><label><span>' + escapeHtml(field) + '</span><div><input class="sheet-field-input" data-sheet-field="' + escapeHtml(field) + '" value="' + escapeHtml(value) + '" /><button type="button" class="sheet-field-empty" data-sheet-field="' + escapeHtml(field) + '">-</button></div></label>' + relationBlock + '</div>';
  }).join("");
    return '<section class="detail-section speed-sheet-section"><h3>车辆表格资料</h3><p class="desc">正在编辑：' + escapeHtml(sourceName) + '。赛车名称/别称会参与搜索；输入具体数值，或点字段右侧的 “-” 设置为未赋值。</p><div class="sheet-edit-grid">' + sourceInput + fields + '</div></section>';
  }
  const relationDisplayFields = speedSheetDisplayFieldsForItem(item);
  const rows = relationDisplayFields.map((field) => {
    const relationConfig = vehicleRelationConfigs.find((config) => config.field === field);
    const relationBlock = relationConfig ? renderVehicleRelationBlock(item, relationConfig) : "";
    const className = (relationConfig ? "kv relation-kv" : "kv") + (field === "推荐使用地图" ? " full-row-kv" : "");
    const rawValue = data[field] || "-";
    return '<div class="' + className + '"><dt>' + escapeHtml(field) + '</dt><dd>' + (rawValue ? formatDetailValue(rawValue) : "") + relationBlock + '</dd></div>';
  }).join("");
  return '<section class="detail-section speed-sheet-section"><h3>车辆表格资料</h3><p class="desc">表格匹配：' + escapeHtml(sourceName) + '</p><dl class="kv-grid speed-sheet-grid">' + rows + '</dl></section>';
}
function findItemById(itemId) {
  return items.find((entry) => entry.id === itemId);
}
function renderVehicleRelationBlock(item, config) {
  const relations = normalizeVehicleRelations(item.details?.vehicleRelations || {})[config.key] || [];
  const editing = sheetEditItemId === item.id && sheetEditDraft;
  const selected = relations.map((relation) => {
    const isSupportCategory = relation.type === "supportCategory";
    const isGroup = relation.type === "group";
    var groupData;
    var related;
    var name;
    var image;
    if (isSupportCategory) {
      related = null;
      name = relation.id;
      image = '<div class="relation-category-icon relation-car-image">辅</div>';
    } else if (isGroup) {
      groupData = groups.find(function(g){return g.id === relation.id;});
      related = null;
      name = groupData ? groupData.name : relation.id;
      image = '<div class="relation-category-icon relation-car-image" style="background:#f0eefc;color:#6c5ce7;font-weight:900;font-size:16px;display:grid;place-items:center;">'+escapeHtml(groupData ? groupData.name.charAt(0) : '组')+'</div>';
    } else {
      related = findItemById(relation.id);
      name = related ? displayVehicleName(related) : relation.id;
      image = related ? renderImageWithFallback([related.image, related.images], "relation-car-image", name, "无图", { "image-item-id": related.id, "image-kind": "vehicle" }) : '<div class="image-fallback relation-car-image">无图</div>';
    }
    const typeAttr = isSupportCategory ? "supportCategory" : isGroup ? "group" : "car";
    const syncText = editing && relation.syncKey && !relation.detached ? '<small class="relation-sync-note">同步</small>' : "";
    const syncButton = editing && !isSupportCategory && !isGroup && vehicleRelationSyncTargets[config.key] ? '<button type="button" class="relation-sync-btn" data-relation-key="' + escapeHtml(config.key) + '" data-relation-type="' + typeAttr + '" data-related-id="' + escapeHtml(relation.id) + '">同步</button>' : "";
    const reasonEditor = editing ? '<label class="relation-reason-field">原因<textarea class="relation-reason-input" data-relation-key="' + escapeHtml(config.key) + '" data-relation-type="' + typeAttr + '" data-related-id="' + escapeHtml(relation.id) + '" placeholder="写这个车出现在这里的原因">' + escapeHtml(relation.reason || "") + '</textarea></label>' : "";
    const actions = editing ? '<div class="relation-entry-actions">' + syncButton + '<button type="button" class="relation-remove-btn" data-relation-key="' + escapeHtml(config.key) + '" data-relation-type="' + typeAttr + '" data-related-id="' + escapeHtml(relation.id) + '">移除</button></div>' : "";
    if (isGroup && !editing && groupData) {
      var groupCarsHtml = (groupData.carIds || []).map(function(cid) {
        var ci = findItemById(cid);
        if (!ci) return "";
        var cn = displayVehicleName(ci);
        var cs = ci.image || (Array.isArray(ci.images) ? ci.images[0] : null) || "";
        return '<div class="relation-group-car" data-item-id="'+escapeHtml(ci.id)+'">'+
          renderImageWithFallback([ci.image, ci.images], "relation-group-car-img", cn, "无图") +
          '<span>'+escapeHtml(cn)+'</span></div>';
      }).filter(Boolean).join("");
      return '<div class="relation-entry relation-entry-readonly relation-entry-group" data-relation-key="'+escapeHtml(config.key)+'" data-relation-type="group" data-related-id="'+escapeHtml(relation.id)+'">'+
        '<div class="relation-group-box"><div style="font-size:12px;font-weight:800;color:var(--text);padding:6px 8px;border-bottom:1px solid var(--line);margin-bottom:6px">'+(groupData.type==='lineup'?'<span style="display:inline-block;background:#6c5ce7;color:#fff;font-size:10px;font-weight:800;padding:1px 4px;border-radius:3px;margin-right:4px;vertical-align:middle">阵</span>':'')+escapeHtml(groupData.name)+' ('+escapeHtml((groupData.carIds||[]).length)+' 辆)</div><div class="relation-group-cars-row">'+groupCarsHtml+'</div></div>'+
        '</div>';
    }
    return '<div class="relation-entry' + (editing ? '' : ' relation-entry-readonly') + '" data-relation-key="' + escapeHtml(config.key) + '" data-relation-type="' + typeAttr + '" data-related-id="' + escapeHtml(relation.id) + '"><button type="button" class="relation-car-card" data-relation-key="' + escapeHtml(config.key) + '" data-relation-type="' + typeAttr + '" data-related-id="' + escapeHtml(relation.id) + '" title="' + escapeHtml(relation.reason || "未填写原因") + '">' + image + '<span>' + escapeHtml(name) + '</span>' + syncText + '</button>' + reasonEditor + actions + '</div>';
  }).join("");
  const addRow = editing ? '<div class="relation-add-row"><button type="button" class="relation-add-btn" data-relation-key="' + escapeHtml(config.key) + '">增加</button><div class="relation-picker hidden" data-relation-key="' + escapeHtml(config.key) + '"><input class="relation-search-input" data-relation-key="' + escapeHtml(config.key) + '" placeholder="搜索车辆名称、别称或拼音" /><div class="relation-suggestions" data-relation-key="' + escapeHtml(config.key) + '"></div></div></div>' : "";
  return '<div class="vehicle-relation-block' + (editing ? '' : ' vehicle-relation-readonly') + '" data-relation-key="' + escapeHtml(config.key) + '"><div class="relation-list">' + (selected || '<p class="relation-empty">还没有选择车辆。</p>') + '</div>' + addRow + '</div>';
}
function renderMixedBattleSpSection(item) {
  const relations = normalizeVehicleRelations(item.details?.vehicleRelations || {})[mixedBattleSpRelationConfig.key] || [];
  const editing = sheetEditItemId === item.id && sheetEditDraft;
  if (!editing && !relations.length) return "";
  return '<section class="detail-section mixed-battle-detail-section"><h3>混斗推荐搭配 SP</h3>' + renderVehicleRelationBlock(item, mixedBattleSpRelationConfig) + '</section>';
}
function renderCarClassSection(item) {
  const meta = normalizeCarMeta(item.details?.carMeta || {});
  const rarityOptionsHtml = rarityOptions.map((value) => '<option value="' + escapeHtml(value) + '"' + (meta.rarity === value ? ' selected' : '') + '>' + escapeHtml(value || "未选择") + '</option>').join("");
  const categoryOptionsHtml = vehicleCategories.map((value) => '<option value="' + escapeHtml(value) + '"' + (meta.category === value ? ' selected' : '') + '>' + escapeHtml(value || "未选择") + '</option>').join("");
  const trackOptionsHtml = trackSpecialtyOptions.map((value) => '<option value="' + escapeHtml(value) + '"' + (meta.trackSpecialty === value ? ' selected' : '') + '>' + escapeHtml(value || "未选择") + '</option>').join("");
  const mainOptionsHtml = [''].concat(vehiclePositions).map((value) => '<option value="' + escapeHtml(value) + '"' + (meta.mainPosition === value ? ' selected' : '') + '>' + escapeHtml(value || "未选择") + '</option>').join("");
  const includedHtml = vehiclePositions.map((value) => '<label class="check-option"><input type="checkbox" class="car-included-position" data-position="' + escapeHtml(value) + '"' + (meta.includedPositions.includes(value) ? ' checked' : '') + ' />' + escapeHtml(value) + '</label>').join("");
  return '<section class="detail-section"><h3>车辆分类信息</h3><p class="desc">车辆类别会优先从基础信息里的“定位”识别，赛道专精会优先从基础信息里的“赛道专精”识别。</p><div class="car-class-grid" data-item-id="' + escapeHtml(item.id) + '"><label>车辆稀有度<select id="carRaritySelect">' + rarityOptionsHtml + '</select></label><label>车辆类别<select id="carCategorySelect">' + categoryOptionsHtml + '</select></label><label>赛道专精<select id="carTrackSpecialtySelect">' + trackOptionsHtml + '</select></label><div class="balance-fields' + (meta.category === "天平" ? '' : ' hidden') + '"><label>主位置<select id="carMainPositionSelect">' + mainOptionsHtml + '</select></label><div><p class="field-label">包含位置</p><div class="check-row">' + includedHtml + '</div></div></div></div></section>';
}
function renderAbilityClassifier(item, coreNames, skills) {
  if (!coreNames.length) return '<section class="detail-section"><h3>核心能力分类</h3><p class="desc">没有识别到“竞速级氮气支架”前的技能词条。可重新导入该车详情页后再看。</p></section>';
  const labels = item.details?.abilityLabels || {};
  const editing = sheetEditItemId === item.id && sheetEditDraft;
  const rows = coreNames.map((name) => {
    const skill = skills.find((entry) => entry.name === name) || { name, desc: "" };
    const label = labels[name] || "未选择";
    const labelBadge = '<span class="ability-kind">' + escapeHtml(label) + '</span>';
    if (!editing) return '<div class="ability-row readonly"><div>' + labelBadge + '<h4>' + escapeHtml(skill.name) + '</h4><p>' + escapeHtml(skill.desc || skill.values || "暂无说明") + '</p></div></div>';
    const options = abilityTypes.map((type) => '<option value="' + escapeHtml(type) + '"' + (labels[name] === type ? ' selected' : '') + '>' + escapeHtml(type || "未选择") + '</option>').join("");
    return '<div class="ability-row"><div>' + labelBadge + '<h4>' + escapeHtml(skill.name) + '</h4><p>' + escapeHtml(skill.desc || skill.values || "暂无说明") + '</p></div><label>分类<select class="ability-select" data-item-id="' + escapeHtml(item.id) + '" data-ability-name="' + escapeHtml(skill.name) + '">' + options + '</select></label></div>';
  }).join("");
  const desc = editing ? '<p class="desc">编辑资料时可以调整每个核心能力属于技能、被动还是 SP。</p>' : '';
  return '<section class="detail-section"><h3>核心能力分类</h3>' + desc + '<div class="ability-list">' + rows + '</div></section>';
}
function renderKvSection(title, data) {
  const entries = Object.entries(data || {}).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!entries.length) return '';
  return '<section class="detail-section"><h3>' + escapeHtml(title) + '</h3><dl class="kv-grid">' + entries.map(([key, value]) => {
    const breakBefore = key === speedSheetPerformanceFields[0] ? '<div class="kv-row-break" aria-hidden="true"></div>' : '';
    const className = speedSheetPerformanceFields.includes(key) ? "kv performance-kv" : "kv";
    return breakBefore + '<div class="' + className + '"><dt>' + escapeHtml(key) + '</dt><dd>' + formatDetailValue(value) + '</dd></div>';
  }).join("") + '</dl></section>';
}
function formatDetailValue(value) {
  let html = escapeHtml(value).replace(/\n/g, "<br>");
  html = html
    .replace(/○/g, chipIcon("circle", "圆形"))
    .replace(/◇/g, chipIcon("diamond", "菱形"))
    .replace(/△/g, chipIcon("triangle-down", "三角形"))
    .replace(/◣/g, chipIcon("hexagon", "六边形"))
    .replace(/V(?=型|[:：]|$)/g, chipIcon("v", "V 型"));
  return html;
}
function chipIcon(kind, title) {
  const paths = {
    circle: '<circle cx="10" cy="10" r="7.4"></circle>',
    diamond: '<path d="M10 2.5 17.5 10 10 17.5 2.5 10Z"></path>',
    "triangle-down": '<path d="M2.8 4.2h14.4L10 16.8Z"></path>',
    hexagon: '<path d="M6 2.8h8l4 7.2-4 7.2H6L2 10Z"></path>',
    v: '<path d="M3.2 4.2 10 16.2 16.8 4.2"></path>',
  };
  return '<svg class="chip-symbol chip-' + kind + '" viewBox="0 0 20 20" role="img" aria-label="' + escapeHtml(title) + '">' + paths[kind] + '</svg>';
}
function renderSkillsSection(skills, editing = false, itemId = "") {
  if (!skills.length) return '';
  return '<section class="detail-section"><h3>全部技能词条</h3><div class="skill-list">' + skills.map((skill, index) => {
    const icon = renderImageWithFallback([skill.icon, skill.images], "", skill.name || "", "图", { "image-item-id": itemId, "image-kind": "skill", "skill-index": index });
    const iconCell = editing ? '<div class="ui-upload-target skill-ui-target" data-ui-target="skill" data-skill-index="' + index + '" role="button" tabindex="0">' + icon + '<span>上传</span></div>' : icon;
    return '<div class="skill-row">' + iconCell + '<div><h4>' + escapeHtml(skill.name || "未命名词条") + '</h4><p>' + escapeHtml(skill.desc || "暂无说明") + '</p>' + (skill.values ? '<p>' + escapeHtml(skill.values) + '</p>' : '') + '</div></div>';
  }).join("") + '</div></section>';
}
async function reloadImagesForItem(itemId) {
  const item = items.find((entry) => entry.id === itemId);
  if (!item || !item.source) {
    const status = $("imageReloadStatus");
    if (status) status.textContent = "没有来源地址，无法重新检索。";
    return;
  }
  const status = $("imageReloadStatus");
  if (status) status.textContent = "正在重新检索图片...";
  try {
    const response = await fetch(API_BASE + "/api/import-gamekee?url=" + encodeURIComponent(item.source));
    const payload = await response.json();
    if (!response.ok || !payload.record) throw new Error(payload.error || "重新检索失败");
    const fresh = normalizeRecord(payload.record);
    applyFreshImages(item, fresh);
    saveItems();
    render();
    openDetail(itemId);
    const nextStatus = $("imageReloadStatus");
    if (nextStatus) nextStatus.textContent = "图片 UI 已重新加载。";
  } catch (error) {
    if (status) status.textContent = "重新加载失败：" + error.message;
  }
}
function mergeSkillIcons(currentSkills, freshSkills) {
  const byName = new Map(freshSkills.map((skill) => [skill.name, skill]));
  return currentSkills.map((skill) => {
    const fresh = byName.get(skill.name);
    return fresh ? { ...skill, icon: fresh.icon || skill.icon, images: uniqueImageSources(skill.icon, skill.images, fresh.icon, fresh.images) } : skill;
  });
}
function syncDetailHeader() {
  const editing = Boolean(activeDetailId && uiEditItemId === activeDetailId && uiEditDraft);
  const sheetEditing = Boolean(activeDetailId && sheetEditItemId === activeDetailId && sheetEditDraft);
  if ($("detailBackBtn")) $("detailBackBtn").classList.toggle("hidden", !detailHistory.length);
  if ($("editUiBtn")) $("editUiBtn").classList.toggle("hidden", true);
  if ($("editSheetBtn")) $("editSheetBtn").classList.toggle("hidden", sheetEditing || editing || !activeDetailId);
  if ($("resetUiEdit")) $("resetUiEdit").classList.toggle("hidden", !(editing || sheetEditing));
  ["saveUiEdit", "cancelUiEdit"].forEach((id) => { if ($(id)) $(id).classList.toggle("hidden", true); });
  ["saveSheetEdit", "cancelSheetEdit"].forEach((id) => { if ($(id)) $(id).classList.toggle("hidden", !sheetEditing); });
}
function enterUiEditMode() {
  if (isReadOnlyMode()) { showReadOnlyNotice(); return; }
  const item = items.find((entry) => entry.id === activeDetailId);
  if (!item) return;
  uiEditItemId = item.id;
  uiEditDraft = cloneData(item);
  pendingUiTarget = null;
  openDetail(item.id);
}
function saveUiEditMode() {
  if (isReadOnlyMode()) { showReadOnlyNotice(); cancelUiEditMode(); return; }
  if (!uiEditDraft || !uiEditItemId) return;
  const index = items.findIndex((entry) => entry.id === uiEditItemId);
  if (index < 0) return;
  items[index] = normalizeRecord(uiEditDraft);
  saveItems();
  const savedId = uiEditItemId;
  uiEditItemId = null;
  uiEditDraft = null;
  pendingUiTarget = null;
  render();
  openDetail(savedId);
}
function cancelUiEditMode() {
  const itemId = uiEditItemId;
  uiEditItemId = null;
  uiEditDraft = null;
  pendingUiTarget = null;
  if (itemId) openDetail(itemId);
}
function enterSheetEditMode() {
  if (isReadOnlyMode()) { showReadOnlyNotice(); return; }
  const item = items.find((entry) => entry.id === activeDetailId);
  if (!item) return;
  sheetEditItemId = item.id;
  sheetEditDraft = cloneData(item);
  sheetEditDraft.details = sheetEditDraft.details || {};
  sheetEditDraft.details.speedSheet = speedSheetDetails(sheetEditDraft.details.speedSheet || {});
  uiEditItemId = item.id;
  uiEditDraft = sheetEditDraft;
  pendingUiTarget = null;
  openDetail(item.id);
}
function saveSheetEditMode() {
  if (isReadOnlyMode()) { showReadOnlyNotice(); cancelSheetEditMode(); return; }
  if (!sheetEditDraft || !sheetEditItemId) return;
  const index = items.findIndex((entry) => entry.id === sheetEditItemId);
  if (index < 0) return;
  try {
    sheetEditDraft.details = sheetEditDraft.details || {};
    sheetEditDraft.details.speedSheet = speedSheetDetails(sheetEditDraft.details.speedSheet || {});
    sheetEditDraft.details.speedSheetManual = true;
    const sourceName = primaryNameFromName(sheetEditDraft.details.speedSheetSourceName || "");
    if (sourceName) sheetEditDraft.name = sourceName;
    sheetEditDraft = applySpeedSheetData(sheetEditDraft);
    items[index] = normalizeRecord(sheetEditDraft);
    saveItems();
    const savedId = sheetEditItemId;
    sheetEditItemId = null;
    sheetEditDraft = null;
    uiEditItemId = null;
    uiEditDraft = null;
    pendingUiTarget = null;
    render();
    openDetail(savedId);
  } catch (error) {
    if (error?.name !== "QuotaExceededError") setUiEditStatus(error?.message || "保存资料失败", "error");
  }
}
function cancelSheetEditMode() {
  const itemId = sheetEditItemId;
  sheetEditItemId = null;
  sheetEditDraft = null;
  uiEditItemId = null;
  uiEditDraft = null;
  pendingUiTarget = null;
  if (itemId) openDetail(itemId);
}
function updateSheetDraftField(field, value) {
  if (!sheetEditDraft) return;
  sheetEditDraft.details = sheetEditDraft.details || {};
  sheetEditDraft.details.speedSheet = sheetEditDraft.details.speedSheet || speedSheetDetails(null);
  sheetEditDraft.details.speedSheet[field] = normalizeText(value) || "-";
}
function updateSheetDraftSourceName(value) {
  if (!sheetEditDraft) return;
  sheetEditDraft.details = sheetEditDraft.details || {};
  sheetEditDraft.details.speedSheetSourceName = normalizeText(value);
}
function updatePerformanceDraftField(field, value, options = {}) {
  if (!sheetEditDraft) return;
  sheetEditDraft.details = sheetEditDraft.details || {};
  sheetEditDraft.details.stats = sheetEditDraft.details.stats || {};
  sheetEditDraft.details.speedSheet = sheetEditDraft.details.speedSheet || speedSheetDetails(null);
  const nextValue = normalizeText(value) || "-";
  const sheetField = normalizeText(options.sheetField || "");
  const hasSplit = options.splitIndex !== undefined && options.splitIndex !== null && options.splitIndex !== "";
  if (speedSheetSkillBoostFields.includes(sheetField) || speedSheetSkillBoostFields.includes(field)) {
    sheetEditDraft.details.skillBoostManual = true;
  }
  if (sheetField) {
    sheetEditDraft.details.speedSheet[sheetField] = nextValue;
    if (!hasSplit) sheetEditDraft.details.stats[field] = nextValue;
    return;
  }
  if (speedSheetEditablePerformanceFields.includes(field)) sheetEditDraft.details.speedSheet[field] = nextValue;
  else sheetEditDraft.details.stats[field] = nextValue;
}
function setUiEditStatus(message, type = "") {
  const status = $("imageReloadStatus");
  if (!status) return;
  status.textContent = message;
  status.className = "status-text" + (type ? " " + type : "");
}
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("读取图片失败")));
    reader.readAsDataURL(file);
  });
}
function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("图片格式无法读取")));
    image.src = dataUrl;
  });
}
function canvasToDataUrl(canvas, type, quality) {
  return new Promise((resolve) => {
    if (!canvas.toBlob) {
      resolve(canvas.toDataURL(type, quality));
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(canvas.toDataURL(type, quality));
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result || "")));
      reader.readAsDataURL(blob);
    }, type, quality);
  });
}
async function optimizeUploadedUiImage(file, targetType) {
  const rawDataUrl = await readFileAsDataUrl(file);
  const image = await loadImageFromDataUrl(rawDataUrl);
  const isSkill = targetType === "skill";
  const maxWidth = isSkill ? 320 : 960;
  const maxHeight = isSkill ? 320 : 540;
  const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  const webp = await canvasToDataUrl(canvas, "image/webp", isSkill ? 0.82 : 0.78);
  if (webp && webp.startsWith("data:image/webp")) return webp;
  return await canvasToDataUrl(canvas, "image/png");
}
async function persistUploadedUiImage(dataUrl, targetType) {
  if (!isInlineImageData(dataUrl) || !location.protocol.startsWith("http")) return dataUrl;
  try {
    const response = await fetch(API_BASE + "/api/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl, targetType }),
    });
    const payload = await response.json();
    if (response.ok && payload.src) return payload.src;
  } catch {}
  return dataUrl;
}
function applyFreshImages(target, fresh) {
  const mergedImages = uniqueImageSources(target.image, target.images, fresh.image, fresh.images);
  target.image = fresh.image || target.image || mergedImages[0] || "";
  target.images = mergedImages;
  target.details = target.details || {};
  target.details.skills = mergeSkillIcons(target.details.skills || [], fresh.details?.skills || []);
  target.details.imageReloadedAt = new Date().toISOString();
}
async function resetUiEditFromSource() {
  if (!uiEditDraft || !uiEditDraft.source) { setUiEditStatus("没有来源地址，无法重新抓取。", "error"); return; }
  setUiEditStatus("正在重新抓取 UI...");
  try {
    const response = await fetch(API_BASE + "/api/import-gamekee?url=" + encodeURIComponent(uiEditDraft.source));
    const payload = await response.json();
    if (!response.ok || !payload.record) throw new Error(payload.error || "重新抓取失败");
    applyFreshImages(uiEditDraft, normalizeRecord(payload.record));
    openDetail(uiEditItemId);
    setUiEditStatus("已重新抓取到编辑草稿，保存后才会写入。", "success");
  } catch (error) {
    setUiEditStatus("重新抓取失败：" + error.message, "error");
  }
}
function pickUiUploadTarget(targetNode) {
  if (!uiEditDraft) return;
  pendingUiTarget = { type: targetNode.dataset.uiTarget, skillIndex: Number(targetNode.dataset.skillIndex) };
  $("uiImageInput").click();
}
function applyUploadedUiImage(dataUrl) {
  if (!uiEditDraft || !pendingUiTarget) return;
  if (pendingUiTarget.type === "vehicle") {
    const previous = uiEditDraft.image;
    uiEditDraft.image = dataUrl;
    const images = Array.isArray(uiEditDraft.images) ? [...uiEditDraft.images] : [];
    const replaceIndex = previous ? images.indexOf(previous) : -1;
    if (replaceIndex >= 0) images[replaceIndex] = dataUrl;
    else if (images.length) images[0] = dataUrl;
    else images.push(dataUrl);
    uiEditDraft.images = images;
  }
  if (pendingUiTarget.type === "skill") {
    uiEditDraft.details = uiEditDraft.details || {};
    uiEditDraft.details.skills = Array.isArray(uiEditDraft.details.skills) ? uiEditDraft.details.skills : [];
    const skill = uiEditDraft.details.skills[pendingUiTarget.skillIndex];
    if (skill) skill.icon = dataUrl;
  }
  pendingUiTarget = null;
  openDetail(uiEditItemId);
}
function updateVehicleDriveAnchor(patch, shouldRender = false) {
  const target = uiEditDraft || sheetEditDraft;
  if (!target) return;
  target.details = target.details || {};
  const current = normalizeVehicleDriveAnchor(target.details.driveAnchor);
  target.details.driveAnchor = normalizeVehicleDriveAnchor({ ...current, ...patch });
  if (shouldRender) {
    openDetail(activeDetailId || target.id);
    return;
  }
  syncVehicleDriveAnchorDom(target.details.driveAnchor);
}
function syncVehicleDriveAnchorDom(point) {
  const anchor = normalizeVehicleDriveAnchor(point);
  const pointNode = document.querySelector(".vehicle-drive-anchor-point");
  if (pointNode) {
    pointNode.style.left = anchor.x + "%";
    pointNode.style.top = anchor.y + "%";
  }
  const xInput = document.querySelector(".vehicle-drive-anchor-x");
  const yInput = document.querySelector(".vehicle-drive-anchor-y");
  if (xInput) xInput.value = String(Math.round(anchor.x));
  if (yInput) yInput.value = String(Math.round(anchor.y));
}
function updateVehicleDriveAnchorFromEvent(stage, event) {
  if (!stage) return false;
  const rect = stage.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
  const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
  updateVehicleDriveAnchor({ x, y }, false);
  return true;
}
function updateCarMetaFromDetail() {
  if (!activeDetailId) return;
  const item = items.find((entry) => entry.id === activeDetailId);
  const target = sheetEditItemId === activeDetailId && sheetEditDraft ? sheetEditDraft : item;
  if (!target) return;
  const category = $("carCategorySelect")?.value || "";
  const meta = {
    rarity: $("carRaritySelect")?.value || "",
    category,
    trackSpecialty: $("carTrackSpecialtySelect")?.value || "",
    mainPosition: category === "天平" ? ($("carMainPositionSelect")?.value || "") : "",
    includedPositions: category === "天平" ? Array.from(document.querySelectorAll(".car-included-position:checked")).map((node) => node.dataset.position) : [],
  };
  target.details = target.details || {};
  target.details.carMeta = normalizeCarMeta(meta);
  if (target === item) {
    saveItems();
    render();
  } else {
    uiEditDraft = target;
  }
  openDetail(activeDetailId);
}
function updateAbilityLabel(itemId, abilityName, label) {
  const item = items.find((entry) => entry.id === itemId);
  const target = sheetEditItemId === itemId && sheetEditDraft ? sheetEditDraft : item;
  if (!target) return;
  target.details = target.details || {};
  target.details.abilityLabels = target.details.abilityLabels || {};
  target.details.abilityLabels[abilityName] = label;
  target.details.coreAbilities = (target.details.coreAbilityNames || []).map((name) => ({ name, category: target.details.abilityLabels[name] || "" }));
  if (target === item) saveItems();
  render();
}

function normalizeCreator(record) {
  const raw = record.raw || {};
  let name = normalizeText(record.name || "未识别昵称");
  let profileName = normalizeText(record.profileName || record.name || "未识别昵称");
  let forceProfileName = Boolean(record.forceProfileName);
  const sharedName = normalizeText(raw.sharedName || "");
  const rawProfileName = normalizeText(raw?.userInfo?.name || raw?.apiUserInfo?.nickname || raw?.pageData?.name || "");
  if (forceProfileName && sharedName && rawProfileName && rawProfileName !== sharedName && profileName === sharedName) {
    name = rawProfileName;
    profileName = rawProfileName;
    forceProfileName = false;
  }
  const platform = normalizeText(record.platform || "未知");
  const userId = normalizeText(record.userId || "");
  const handle = normalizeText(record.handle || "");
  if (platform === "快手" && profileName.includes("神剑大帝") && name && name !== "神剑大帝" && userId !== "2345821144" && handle !== "shenjiandadi") {
    profileName = name;
    forceProfileName = false;
  }
  if (platform === "抖音" && handle === "MS4wLjABAAAASLOMWjMHISZXxbcnhcsPwihdsRlXholVvxeXMxMRoO5TarNHPWbuMpnRMWSJmjDP") {
    name = "神剑大帝";
    profileName = "神剑大帝（shenjiandadi）";
    forceProfileName = true;
  }
  if (
    (platform === "抖音" && handle === "MS4wLjABAAAAMsWra3sI9ENfn7Jt84NNPhO6gicFgZSjzvFZBN6QU9mRSA6YBTleufi3GctUlYRi") ||
    (platform === "快手" && (userId === "1951462286" || handle === "ace-racer"))
  ) {
    profileName = "王牌竞速手游";
    forceProfileName = true;
  }
  return {
    id: record.id || crypto.randomUUID(),
    name,
    profileName,
    platform,
    avatar: normalizeText(record.avatar || ""),
    followerText: normalizeText(record.followerText || "未识别"),
    followerCount: typeof record.followerCount === "number" ? record.followerCount : null,
    followerApproximate: Boolean(record.followerApproximate),
    followerManualNumber: normalizeText(record.followerManualNumber || ""),
    followerManualUnit: record.followerManualUnit === "w" ? "w" : "none",
    manualUserId: normalizeText(record.manualUserId || ""),
    gender: genderOptions.includes(record.gender) ? record.gender : "未知",
    displayNamePlatform: ["抖音", "快手"].includes(record.displayNamePlatform) ? record.displayNamePlatform : "",
    displayAvatarPlatform: ["抖音", "快手"].includes(record.displayAvatarPlatform) ? record.displayAvatarPlatform : "",
    forceProfileName,
    userId,
    handle,
    source: normalizeText(record.source || ""),
    resolvedUrl: normalizeText(record.resolvedUrl || ""),
    importedAt: record.importedAt || new Date().toISOString(),
    raw,
  };
}
function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < String(value || "").length; index += 1) {
    hash ^= String(value || "").charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
function extractSharedCreatorName(text) {
  const value = normalizeText(text);
  const patterns = [
    /还是「([^」]+)」最好玩了/,
    /还是“([^”]+)”最好玩了/,
    /还是"([^"]+)"最好玩了/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}
function extractUrlFromText(text) {
  const value = normalizeText(text);
  const match = value.match(/https?:\/\/[^\s"'<>，。；;、]+/i);
  return match ? match[0].replace(/[),，。；;、]+$/g, "") : value;
}
function detectCreatorPlatformFromText(text) {
  const value = normalizeText(text).toLowerCase();
  if (value.includes("kuaishou") || value.includes("kwai") || value.includes("快手")) return "快手";
  if (value.includes("douyin") || value.includes("抖音")) return "抖音";
  return "未知";
}
function buildSharedCreatorFallback(sourceText) {
  const sharedName = extractSharedCreatorName(sourceText);
  const platform = detectCreatorPlatformFromText(sourceText);
  if (!sharedName || platform !== "快手") return null;
  const source = extractUrlFromText(sourceText);
  return normalizeCreator({
    id: "creator-kuaishou-shared-" + hashString(source || sharedName),
    platform,
    name: sharedName,
    profileName: sharedName,
    forceProfileName: true,
    followerText: "未识别",
    followerCount: null,
    source,
    raw: { sharedName, sourceText, fallbackOnly: true },
  });
}
function applySharedCreatorName(creator, sourceText) {
  const sharedName = extractSharedCreatorName(sourceText);
  if (sharedName && creator?.platform === "快手" && isGenericCreatorName(creator.name)) {
    creator.name = sharedName;
    creator.profileName = sharedName;
    creator.forceProfileName = true;
    creator.raw = { ...(creator.raw || {}), sharedName };
  }
  return creator;
}
function setCreatorStatus(message, type = "") { const node = $("creatorStatus"); if (!node) return; node.textContent = message; node.className = "status-text" + (type ? " " + type : ""); }
async function importCreatorUrls() {
  const input = $("creatorUrls").value.trim();
  const urls = input.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (!urls.length) { setCreatorStatus("请先粘贴一个或多个主页链接。", "error"); return; }
  setCreatorStatus("正在识别 " + urls.length + " 个主页链接...", "");
  const imported = [];
  const failed = [];
  for (const url of urls) {
    try {
      const response = await fetch(API_BASE + "/api/import-creator?url=" + encodeURIComponent(url));
      const payload = await response.json();
      if (!response.ok || !payload.creator) throw new Error(payload.error || "识别失败");
      imported.push(normalizeCreator(applySharedCreatorName(payload.creator, url)));
    } catch (error) {
      const fallback = buildSharedCreatorFallback(url);
      if (fallback) {
        imported.push(fallback);
      } else {
        failed.push(url + "：" + error.message);
      }
    }
  }
  if (imported.length) addCreators(imported);
  setCreatorStatus("成功导入 " + imported.length + " 个" + (failed.length ? "，失败 " + failed.length + " 个。" : "。"), failed.length ? "error" : "success");
}
function creatorUrlObject(value) {
  try { return value ? new URL(value) : null; } catch { return null; }
}
function creatorKuaishouPathHandle(url) {
  const profile = url?.pathname?.match(/\/profile\/([^/?#]+)/);
  if (profile) return decodeURIComponent(profile[1]);
  const fwUser = url?.pathname?.match(/\/fw\/user\/([^/?#]+)/);
  if (fwUser) return decodeURIComponent(fwUser[1]);
  return "";
}
function creatorKuaishouUrlIdentity(creator) {
  if (normalizeText(creator?.platform || "") !== "快手") return "";
  const rawTargetId = Array.isArray(creator?.raw?.targetIds) ? normalizeText(creator.raw.targetIds.find(Boolean) || "") : "";
  if (rawTargetId) return "target:" + rawTargetId.toLowerCase();
  for (const value of [creator?.resolvedUrl, creator?.source]) {
    const url = creatorUrlObject(normalizeText(value || ""));
    if (!url) continue;
    const targetId = normalizeText(url.searchParams.get("shareObjectId") || url.searchParams.get("principalId") || "");
    if (targetId) return "target:" + targetId.toLowerCase();
    const handle = normalizeText(creatorKuaishouPathHandle(url));
    if (handle) return "handle:" + handle.toLowerCase();
  }
  return "";
}
function creatorAccountIdentity(creator) {
  return creatorKuaishouUrlIdentity(creator) || normalizeText(creator?.userId || creator?.handle || creator?.resolvedUrl || creator?.source || creator?.id || "");
}
function creatorAccountKey(creator) {
  const platform = normalizeText(creator?.platform || "未知");
  const identity = creatorAccountIdentity(creator);
  if (identity) return platform + ":" + identity;
  return platform + ":new:" + hashString([creator?.name, creator?.profileName, creator?.importedAt || Date.now()].join("|"));
}
function isGenericCreatorName(name) { return !name || /^(未识别昵称|抖音博主|快手博主|快手APP|快手主页|快手|未知)$/.test(name); }
function creatorHasFollowerData(creator) {
  return Boolean(
    typeof creator?.followerCount === "number" ||
    parseFollowerDisplayText(creator?.followerText) ||
    normalizeText(creator?.followerText || "") && normalizeText(creator?.followerText || "") !== "未识别"
  );
}
function creatorSameAccount(left, right) {
  if (!left || !right) return false;
  if (normalizeText(left.platform || "未知") !== normalizeText(right.platform || "未知")) return false;
  const leftUrlIdentity = creatorKuaishouUrlIdentity(left);
  const rightUrlIdentity = creatorKuaishouUrlIdentity(right);
  if (leftUrlIdentity || rightUrlIdentity) return Boolean(leftUrlIdentity && rightUrlIdentity && leftUrlIdentity === rightUrlIdentity);
  const pairs = [
    ["userId", left.userId, right.userId],
    ["handle", left.handle, right.handle],
    ["source", left.source, right.source],
    ["resolvedUrl", left.resolvedUrl, right.resolvedUrl],
  ];
  return pairs.some(([, a, b]) => normalizeText(a || "") && normalizeText(a || "") === normalizeText(b || ""));
}
function mergeCreatorRecord(existing, incoming) {
  const old = normalizeCreator(existing);
  const fresh = normalizeCreator(incoming);
  const merged = { ...old, ...fresh };
  if (!fresh.avatar) merged.avatar = old.avatar;
  if (!creatorHasFollowerData(fresh)) {
    merged.followerText = old.followerText;
    merged.followerCount = old.followerCount;
    merged.followerApproximate = old.followerApproximate;
  }
  if (old.followerManualNumber) {
    merged.followerManualNumber = old.followerManualNumber;
    merged.followerManualUnit = old.followerManualUnit;
  }
  merged.displayNamePlatform = old.displayNamePlatform || fresh.displayNamePlatform;
  merged.displayAvatarPlatform = old.displayAvatarPlatform || fresh.displayAvatarPlatform;
  merged.manualUserId = old.manualUserId || fresh.manualUserId;
  merged.gender = old.gender && old.gender !== "未知" ? old.gender : fresh.gender;
  merged.profileName = fresh.forceProfileName ? fresh.profileName : (old.profileName || fresh.profileName);
  merged.forceProfileName = Boolean(old.forceProfileName || fresh.forceProfileName);
  if (isGenericCreatorName(fresh.name)) merged.name = old.name;
  return merged;
}
function disambiguateForcedProfileName(creator) {
  const base = normalizeText(creator.profileName || creator.name || "快手博主");
  const suffix = normalizeText(creator.handle || creator.userId || hashString(creator.source || creator.resolvedUrl || creator.id));
  return suffix ? base + "（" + suffix + "）" : base + "（新账号）";
}
function addCreators(records) {
  const byKey = new Map(creators.map((creator) => [creatorAccountKey(creator), creator]));
  records.map(normalizeCreator).forEach((creator) => {
    if (creator.forceProfileName) {
      const sameProfile = creators.filter((entry) => (entry.profileName || entry.name) === creator.profileName);
      const samePlatformProfile = sameProfile.filter((entry) => entry.platform === creator.platform);
      if (samePlatformProfile.length && !samePlatformProfile.some((entry) => creatorSameAccount(entry, creator))) {
        creator.profileName = disambiguateForcedProfileName(creator);
        creator.forceProfileName = false;
      }
    }
    const directKey = creatorAccountKey(creator);
    let existingKey = directKey;
    let existing = byKey.get(directKey);
    if (!existing) {
      const matched = Array.from(byKey.entries()).find(([, entry]) => creatorSameAccount(entry, creator));
      if (matched) { existingKey = matched[0]; existing = matched[1]; }
    }
    if (existing) {
      creator = mergeCreatorRecord(existing, creator);
    }
    if (existingKey !== directKey) byKey.delete(existingKey);
    byKey.set(directKey, creator);
  });
  creators = Array.from(byKey.values());
  saveCreators();
  renderCreators();
}
function displayFollower(creator) {
  const count = followerCountValue(creator);
  if (count) return displayCount(count) + (creator?.followerApproximate && !hasManualFollower(creator) ? "+" : "");
  return creator.followerText && creator.followerText !== "未识别" ? normalizeFollowerText(creator.followerText) : "未识别";
}
function displayCreatorId(creator) { return normalizeText(creator.manualUserId || creator.userId) || "未识别"; }
function hasManualFollower(creator) { return Boolean(normalizeText(creator?.followerManualNumber || "")); }
function trimNumber(value) { return Number(value.toFixed(4)).toString(); }
function normalizeFollowerText(text) {
  const parsed = parseFollowerDisplayText(text);
  return parsed ? displayCount(parsed) : normalizeText(text).replace(/万/g, "w");
}
function parseFollowerDisplayText(text) {
  const match = normalizeText(text).replace(/,/g, "").match(/([\d.]+)\s*(万|w|W|亿)?/);
  if (!match) return 0;
  let count = Number(match[1]);
  if (!Number.isFinite(count)) return 0;
  const unit = match[2] || "";
  if (unit === "万" || unit.toLowerCase() === "w") count *= 10000;
  if (unit === "亿") count *= 100000000;
  return Math.round(count);
}
function followerCountValue(creator) {
  if (!creator) return 0;
  const raw = normalizeText(creator.followerManualNumber);
  if (raw) {
    const numeric = Number(raw.replace(/,/g, ""));
    if (Number.isFinite(numeric)) return creator.followerManualUnit === "w" ? Math.round(numeric * 10000) : Math.round(numeric);
  }
  if (typeof creator.followerCount === "number") return creator.followerCount;
  return parseFollowerDisplayText(creator.followerText);
}
function displayCount(count) {
  if (!count) return "未识别";
  if (count >= 10000) return trimNumber(count / 10000) + "w";
  return String(Math.round(count));
}
function creatorImportedTime(creator, fallback = 0) {
  const time = Date.parse(creator?.importedAt || "");
  return Number.isFinite(time) ? time : fallback;
}
function earliestCreatorAccount(accounts) {
  return accounts.slice().sort((a, b) => creatorImportedTime(a, a._importOrder || 0) - creatorImportedTime(b, b._importOrder || 0))[0] || null;
}
function creatorAccountForPlatform(accounts, platform) {
  return accounts.find((account) => account.platform === platform) || null;
}
function profileDisplaySource(accounts, kind) {
  const field = kind === "avatar" ? "displayAvatarPlatform" : "displayNamePlatform";
  return accounts.find((account) => account[field])?.[field] || "";
}
function profileDisplayAccount(accounts, kind) {
  const source = profileDisplaySource(accounts, kind);
  if (source) return creatorAccountForPlatform(accounts, source) || earliestCreatorAccount(accounts);
  return earliestCreatorAccount(accounts);
}
function profileDisplayAvatarAccount(accounts) {
  const account = profileDisplayAccount(accounts, "avatar");
  if (account?.avatar) return account;
  return accounts.find((entry) => entry.avatar) || account || null;
}
function creatorProfiles() {
  const groups = new Map();
  creators.forEach((creator, index) => {
    const account = normalizeCreator(creator);
    account._importOrder = index;
    const key = account.profileName || account.name || creatorAccountKey(account);
    if (!groups.has(key)) groups.set(key, { id: key, groupName: key, name: key, accounts: [] });
    groups.get(key).accounts.push(account);
  });
  return Array.from(groups.values()).map((profile) => {
    profile.defaultAccount = earliestCreatorAccount(profile.accounts);
    profile.displayNamePlatform = profileDisplaySource(profile.accounts, "name");
    profile.displayAvatarPlatform = profileDisplaySource(profile.accounts, "avatar");
    profile.displayNameAccount = profileDisplayAccount(profile.accounts, "name");
    profile.displayAvatarAccount = profileDisplayAvatarAccount(profile.accounts);
    profile.name = profile.displayNameAccount?.name || profile.groupName || profile.id;
    profile.avatar = profile.displayAvatarAccount?.avatar || "";
    profile.accounts.sort((a, b) => ["抖音", "快手", "未知"].indexOf(a.platform) - ["抖音", "快手", "未知"].indexOf(b.platform));
    profile.gender = profile.accounts.find((account) => account.gender && account.gender !== "未知")?.gender || "未知";
    profile.douyin = profile.accounts.find((account) => account.platform === "抖音") || null;
    profile.kuaishou = profile.accounts.find((account) => account.platform === "快手") || null;
    profile.totalFollowers = followerCountValue(profile.douyin) + followerCountValue(profile.kuaishou);
    return profile;
  });
}
function selectorForAccount(accountId, className) { return "." + className + '[data-account-id="' + accountId.replaceAll('"', '\\"') + '"]'; }
function renderCreators() {
  const list = $("creatorList");
  if (!list) return;
  const query = ($("creatorSearch")?.value || "").trim().toLowerCase();
  const platform = $("creatorPlatformFilter")?.value || "all";
  const sortRule = $("creatorSortRule")?.value || "all";
  const filtered = creatorProfiles().filter((profile) => {
    const haystack = [profile.name, ...profile.accounts.flatMap((account) => [account.name, account.platform, account.userId, account.handle, account.source, account.resolvedUrl])].join(" ").toLowerCase();
    return !query || haystack.includes(query);
  }).sort((a, b) => creatorSortScore(b, sortRule) - creatorSortScore(a, sortRule));
  list.innerHTML = filtered.length ? filtered.map((profile) => renderCreatorRow(profile, platform)).join("") : '<section class="panel"><p class="desc">还没有导入博主。粘贴快手或抖音主页链接后点击识别。</p></section>';
}
function creatorSortScore(profile, rule) {
  if (rule === "抖音") return followerCountValue(profile.douyin);
  if (rule === "快手") return followerCountValue(profile.kuaishou);
  return profile.totalFollowers || 0;
}
function renderCreatorSlot(profile, platform, account) {
  const slotClass = platform === "抖音" ? "douyin-slot" : "kuaishou-slot";
 if (!account) return '<button class="creator-platform-cell creator-platform-missing ' + slotClass + '" data-profile-id="' + escapeHtml(profile.id) + '" data-missing-platform="' + escapeHtml(platform) + '"><strong>' + escapeHtml(platform) + '</strong><span>未导入</span><span>点击识别' + escapeHtml(platform) + '</span></button>';
  return '<div class="creator-platform-cell ' + slotClass + '" data-creator-url="' + escapeHtml(account.source||account.resolvedUrl||'') + '"><strong>' + escapeHtml(account.platform) + '</strong><span>粉丝：' + escapeHtml(displayFollower(account)) + '</span><span>ID：' + escapeHtml(displayCreatorId(account)) + '</span></div>';
}
function renderCreatorRow(profile, platformFilter = "all") {
  const avatar = profile.avatar ? '<img class="creator-avatar" src="' + escapeHtml(proxyImage(profile.avatar)) + '" alt="' + escapeHtml(profile.name) + '" />' : '<div class="creator-avatar empty">无头像</div>';
  const slots = [
    platformFilter !== "快手" ? renderCreatorSlot(profile, "抖音", profile.douyin) : "",
    platformFilter !== "抖音" ? renderCreatorSlot(profile, "快手", profile.kuaishou) : "",
  ].join("");
  return '<article class="creator-row creator-row-wide" data-creator-id="' + escapeHtml(profile.id) + '" tabindex="0">' + avatar + '<div><h3>' + escapeHtml(profile.name) + ' <span class="creator-total">全部粉丝：' + escapeHtml(displayCount(profile.totalFollowers)) + '</span> <span class="creator-gender">' + escapeHtml(profile.gender) + '</span></h3><div class="creator-platforms">' + slots + '</div></div><div class="creator-row-actions"><button class="refresh-creator-profile" data-profile-id="' + escapeHtml(profile.id) + '">刷新粉丝</button><span class="type-pill">查看</span></div></article>';
}
function openCreatorDetail(creatorId) {
  activeCreatorId = creatorId;
  const profile = creatorProfiles().find((entry) => entry.id === creatorId);
  if (!profile) return;
  $("creatorDetailTitle").textContent = profile.name;
  $("creatorDetailSubtitle").textContent = profile.accounts.map((account) => account.platform + "粉丝：" + displayFollower(account)).join(" · ");
  $("creatorDetailBody").innerHTML = renderCreatorDetail(profile);
  $("creatorDetailModal").classList.remove("hidden");
}
function closeCreatorDetail() { activeCreatorId = null; $("creatorDetailModal").classList.add("hidden"); }
function renderDisplaySourceOptions(profile, selected, kind) {
  const defaultAccount = kind === "avatar" ? profile.displayAvatarAccount : profile.displayNameAccount;
  const defaultLabel = defaultAccount ? "默认（" + defaultAccount.platform + "）" : "默认";
  const options = ['<option value=""' + (!selected ? ' selected' : '') + '>' + escapeHtml(defaultLabel) + '</option>'];
  profile.accounts.forEach((account) => {
    const label = account.platform + (kind === "avatar" ? (account.avatar ? "头像" : "头像（无头像）") : "昵称：" + account.name);
    options.push('<option value="' + escapeHtml(account.platform) + '"' + (selected === account.platform ? ' selected' : '') + '>' + escapeHtml(label) + '</option>');
  });
  return options.join("");
}
function renderCreatorDisplayControls(profile) {
  return '<div class="creator-display-controls"><label>外部昵称<select class="creator-display-source" data-display-kind="name" data-profile-id="' + escapeHtml(profile.id) + '">' + renderDisplaySourceOptions(profile, profile.displayNamePlatform, "name") + '</select></label><label>外部头像<select class="creator-display-source" data-display-kind="avatar" data-profile-id="' + escapeHtml(profile.id) + '">' + renderDisplaySourceOptions(profile, profile.displayAvatarPlatform, "avatar") + '</select></label></div>';
}
function renderCreatorDetail(profile) {
  const avatarImage = profile.avatar ? '<img class="creator-detail-avatar" src="' + escapeHtml(proxyImage(profile.avatar)) + '" alt="' + escapeHtml(profile.name) + '" />' : '<div class="creator-detail-avatar empty">无头像</div>';
  const avatar = '<div class="creator-avatar-editor"><button class="creator-avatar-refresh" data-profile-id="' + escapeHtml(profile.id) + '" title="点击后按下方链接识别头像">' + avatarImage + '<span>识别头像</span></button><input class="creator-avatar-url" data-profile-id="' + escapeHtml(profile.id) + '" placeholder="粘贴链接后点头像" /></div>';
  const genderHtml = genderOptions.map((value) => '<option value="' + escapeHtml(value) + '"' + (profile.gender === value ? ' selected' : '') + '>' + escapeHtml(value) + '</option>').join("");
  const accounts = ["抖音", "快手"].map((platform) => {
    const creator = platform === "抖音" ? profile.douyin : profile.kuaishou;
    if (!creator) return '<section class="detail-section creator-account-panel missing-account-panel"><div class="creator-account-head"><h3>' + escapeHtml(platform) + '账号</h3><button class="import-missing-creator" data-profile-id="' + escapeHtml(profile.id) + '" data-missing-platform="' + escapeHtml(platform) + '">识别' + escapeHtml(platform) + '</button></div><div class="creator-inline-import"><input class="creator-profile-import-url" data-profile-id="' + escapeHtml(profile.id) + '" data-missing-platform="' + escapeHtml(platform) + '" placeholder="粘贴' + escapeHtml(platform) + '主页或分享链接" /><button class="import-missing-creator" data-profile-id="' + escapeHtml(profile.id) + '" data-missing-platform="' + escapeHtml(platform) + '">导入到此人</button></div><p class="desc">这里导入会直接归到当前这个人名下，平台昵称不同也会合并。</p></section>';
    const rows = { 平台: creator.platform, 识别昵称: creator.name, 识别粉丝: normalizeFollowerText(creator.followerText || "未识别"), 当前显示粉丝: displayFollower(creator), 用户ID: displayCreatorId(creator) };
    const accountAvatar = creator.avatar ? '<img class="creator-account-avatar" src="' + escapeHtml(proxyImage(creator.avatar)) + '" alt="' + escapeHtml(creator.name) + '" />' : '<div class="creator-account-avatar empty">无头像</div>';
    const accountIdentity = '<div class="creator-account-identity">' + accountAvatar + '<div><strong>' + escapeHtml(creator.name) + '</strong><span>' + escapeHtml(creator.platform) + ' · 粉丝：' + escapeHtml(displayFollower(creator)) + '</span></div></div>';
    return '<section class="detail-section creator-account-panel" data-account-id="' + escapeHtml(creator.id) + '"><div class="creator-account-head"><div><h3>' + escapeHtml(creator.platform) + '账号</h3>' + accountIdentity + '</div><div class="creator-account-actions"><button class="reload-creator-account" data-account-id="' + escapeHtml(creator.id) + '">重新载入</button><button class="delete-creator-account" data-account-id="' + escapeHtml(creator.id) + '">删除</button></div></div><div class="creator-inline-import"><input class="creator-account-import-url" data-account-id="' + escapeHtml(creator.id) + '" placeholder="粘贴新的' + escapeHtml(creator.platform) + '主页或分享链接" /><button class="import-existing-creator" data-account-id="' + escapeHtml(creator.id) + '">导入覆盖此账号</button></div><div class="creator-follower-edit"><label>粉丝数量<input class="creator-follower-number" data-account-id="' + escapeHtml(creator.id) + '" value="' + escapeHtml(creator.followerManualNumber || "") + '" placeholder="例如 9500 或 12.5" /></label><label>单位<select class="creator-follower-unit" data-account-id="' + escapeHtml(creator.id) + '"><option value="none"' + (creator.followerManualUnit !== "w" ? ' selected' : '') + '>不加w</option><option value="w"' + (creator.followerManualUnit === "w" ? ' selected' : '') + '>加w</option></select></label><label>ID<input class="creator-user-id" data-account-id="' + escapeHtml(creator.id) + '" value="' + escapeHtml(creator.manualUserId || "") + '" placeholder="' + escapeHtml(creator.userId || "未识别时可手动填写") + '" /></label><p class="desc" data-current-follower="' + escapeHtml(creator.id) + '">当前显示：' + escapeHtml(displayFollower(creator)) + '</p></div>' + renderKvSection("识别信息", rows) + '</section>';
  }).join("");
  return '<div class="creator-detail-head">' + avatar + '<div><label>合并分组名<input id="creatorProfileNameInput" data-profile-id="' + escapeHtml(profile.id) + '" value="' + escapeHtml(profile.groupName || profile.id) + '" /></label><label class="creator-gender-field">性别<select id="creatorGenderSelect" data-profile-id="' + escapeHtml(profile.id) + '">' + genderHtml + '</select></label>' + renderCreatorDisplayControls(profile) + '<p class="desc">同一行汇总抖音和快手账号；可分别选择外部列表显示哪一个平台的昵称和头像。</p></div></div>' + accounts;
}
function updateCreatorAccount(accountId, refreshDetail = true) {
  const creator = creators.find((entry) => entry.id === accountId);
  if (!creator) return;
  const numberInput = document.querySelector(selectorForAccount(accountId, "creator-follower-number"));
  const unitInput = document.querySelector(selectorForAccount(accountId, "creator-follower-unit"));
  const idInput = document.querySelector(selectorForAccount(accountId, "creator-user-id"));
  let manualNumber = normalizeText(numberInput?.value || "");
  let manualUnit = unitInput?.value === "w" ? "w" : "none";
  const numeric = Number(manualNumber.replace(/,/g, ""));
  if (manualNumber && Number.isFinite(numeric) && manualUnit !== "w" && numeric >= 10000) {
    manualNumber = trimNumber(numeric / 10000);
    manualUnit = "w";
    if (numberInput) numberInput.value = manualNumber;
    if (unitInput) unitInput.value = "w";
  }
  creator.followerManualNumber = manualNumber;
  creator.followerManualUnit = manualUnit;
  if (manualNumber) creator.followerApproximate = false;
  creator.manualUserId = normalizeText(idInput?.value || "");
  saveCreators();
  renderCreators();
  if (refreshDetail && activeCreatorId) {
    openCreatorDetail(activeCreatorId);
  } else if (activeCreatorId) {
    const current = document.querySelector('[data-current-follower="' + accountId.replaceAll('"', '\\"') + '"]');
    if (current) current.textContent = "当前显示：" + displayFollower(creator);
    const profile = creatorProfiles().find((entry) => entry.id === activeCreatorId);
    if (profile) $("creatorDetailSubtitle").textContent = profile.accounts.map((account) => account.platform + "粉丝：" + displayFollower(account)).join(" · ");
  }
}
function updateCreatorGender(profileId, gender) {
  creatorProfiles().find((profile) => profile.id === profileId)?.accounts.forEach((account) => {
    const stored = creators.find((creator) => creator.id === account.id);
    if (stored) stored.gender = genderOptions.includes(gender) ? gender : "未知";
  });
  saveCreators();
  renderCreators();
  if (activeCreatorId) openCreatorDetail(activeCreatorId);
}
function updateCreatorProfileName(profileId, nextName) {
  const name = normalizeText(nextName);
  if (!name) return;
  const profile = creatorProfiles().find((entry) => entry.id === profileId);
  if (!profile) return;
  profile.accounts.forEach((account) => {
    const stored = creators.find((creator) => creator.id === account.id);
    if (stored) { stored.profileName = name; stored.forceProfileName = true; }
  });
  activeCreatorId = name;
  saveCreators();
  renderCreators();
  openCreatorDetail(name);
}
function updateCreatorDisplaySource(profileId, kind, platform) {
  const profile = creatorProfiles().find((entry) => entry.id === profileId);
  if (!profile) return;
  const field = kind === "avatar" ? "displayAvatarPlatform" : "displayNamePlatform";
  const value = ["抖音", "快手"].includes(platform) ? platform : "";
  profile.accounts.forEach((account) => {
    const stored = creators.find((creator) => creator.id === account.id);
    if (stored) stored[field] = value;
  });
  saveCreators();
  renderCreators();
  openCreatorDetail(profile.id);
}
async function importCreatorIntoProfile(profileId, expectedPlatform, urlOverride = "") {
  const profile = creatorProfiles().find((entry) => entry.id === profileId);
  const input = normalizeText(urlOverride || $("creatorUrls")?.value || "");
  if (!profile) { setCreatorStatus("没有找到要补充的平台所属博主。", "error"); return; }
  if (!input) { setCreatorStatus("请先填写" + expectedPlatform + "主页或分享链接。", "error"); return; }
  setCreatorStatus("正在为 " + profile.name + " 识别" + expectedPlatform + "账号...", "");
  try {
    const response = await fetch(API_BASE + "/api/import-creator?url=" + encodeURIComponent(input.split(/\n+/)[0]));
    const payload = await response.json();
    if (!response.ok || !payload.creator) throw new Error(payload.error || "识别失败");
    const creator = normalizeCreator(applySharedCreatorName(payload.creator, input));
    if (creator.platform !== expectedPlatform) throw new Error("这个链接识别为" + creator.platform + "，不是" + expectedPlatform);
    creator.profileName = profile.groupName || profile.id;
    creator.gender = profile.gender;
    creator.displayNamePlatform = profile.displayNamePlatform;
    creator.displayAvatarPlatform = profile.displayAvatarPlatform;
    creator.forceProfileName = true;
    addCreators([creator]);
    setCreatorStatus("已把" + expectedPlatform + "账号补充到 " + profile.name + "。", "success");
    openCreatorDetail(profile.id);
  } catch (error) {
    setCreatorStatus("补充失败：" + error.message, "error");
  }
}
async function importCreatorOverAccount(accountId) {
  const current = creators.find((entry) => entry.id === accountId);
  if (!current) return;
  const input = normalizeText(document.querySelector(selectorForAccount(accountId, "creator-account-import-url"))?.value || "");
  if (!input) { setCreatorStatus("请先在这个账号块里粘贴链接。", "error"); return; }
  const profileName = current.profileName || current.name;
  try {
    const response = await fetch(API_BASE + "/api/import-creator?url=" + encodeURIComponent(input));
    const payload = await response.json();
    if (!response.ok || !payload.creator) throw new Error(payload.error || "识别失败");
    const fresh = normalizeCreator(applySharedCreatorName(payload.creator, input));
    if (fresh.platform !== current.platform) throw new Error("这个链接识别为" + fresh.platform + "，不是" + current.platform);
    fresh.profileName = profileName;
    fresh.followerManualNumber = current.followerManualNumber;
    fresh.followerManualUnit = current.followerManualUnit;
    fresh.manualUserId = current.manualUserId;
    fresh.gender = current.gender;
    fresh.displayNamePlatform = current.displayNamePlatform;
    fresh.displayAvatarPlatform = current.displayAvatarPlatform;
    fresh.forceProfileName = true;
    creators = creators.filter((entry) => entry.id !== current.id);
    addCreators([fresh]);
    setCreatorStatus("已导入覆盖这个" + current.platform + "账号。", "success");
    openCreatorDetail(profileName);
  } catch (error) {
    setCreatorStatus("导入失败：" + error.message, "error");
  }
}
async function importAvatarForProfile(profileId, urlOverride = "") {
  const profile = creatorProfiles().find((entry) => entry.id === profileId);
  if (!profile) return;
  const input = normalizeText(urlOverride || document.querySelector('.creator-avatar-url[data-profile-id="' + profileId.replaceAll('"', '\\"') + '"]')?.value || "");
  if (!input) { setCreatorStatus("请先在头像下方粘贴抖音或快手链接。", "error"); return; }
  try {
    const response = await fetch(API_BASE + "/api/import-creator?url=" + encodeURIComponent(input));
    const payload = await response.json();
    if (!response.ok || !payload.creator) throw new Error(payload.error || "识别失败");
    const fresh = normalizeCreator(applySharedCreatorName(payload.creator, input));
    if (!fresh.avatar) throw new Error("这个链接没有识别到头像");
    const profileGroupName = profile.groupName || profile.id;
    const target = creators.find((entry) => (entry.profileName || entry.name) === profileGroupName && entry.platform === fresh.platform);
    if (!target) {
      addCreators([fresh]);
      setCreatorStatus("这个链接识别到的是新博主，已单独导入，没有覆盖 " + profile.name + "。", "success");
      return;
    }
    if (!creatorSameAccount(target, fresh) && (target.userId || target.handle || target.source || target.resolvedUrl)) {
      throw new Error("链接和当前" + target.platform + "账号不一致，已阻止覆盖。");
    }
    const profileName = target.profileName;
    const forceProfileName = target.forceProfileName;
    Object.assign(target, mergeCreatorRecord(target, fresh));
    target.profileName = profileName;
    target.forceProfileName = forceProfileName;
    saveCreators();
    renderCreators();
    openCreatorDetail(profile.id);
    setCreatorStatus("头像已更新。", "success");
  } catch (error) {
    setCreatorStatus("头像识别失败：" + error.message, "error");
  }
}
async function reloadCreatorAccount(accountId) {
  const current = creators.find((entry) => entry.id === accountId);
  if (!current || !current.source) { setCreatorStatus("这个账号没有可重新载入的来源链接。", "error"); return; }
  setCreatorStatus("正在重新载入" + current.platform + "账号...", "");
  try {
    const response = await fetch(API_BASE + "/api/import-creator?url=" + encodeURIComponent(current.source));
    const payload = await response.json();
    if (!response.ok || !payload.creator) throw new Error(payload.error || "重新载入失败");
    const fresh = normalizeCreator(payload.creator);
    fresh.profileName = current.profileName || current.name;
    fresh.manualUserId = current.manualUserId;
    fresh.gender = current.gender;
    fresh.forceProfileName = true;
    if (fresh.platform !== current.platform) throw new Error("平台不匹配");
    if (!creatorSameAccount(current, fresh) && (fresh.userId || fresh.handle || fresh.resolvedUrl)) throw new Error("账号不匹配，已阻止覆盖");
    const profileName = current.profileName;
    const forceProfileName = current.forceProfileName;
    Object.assign(current, mergeCreatorRecord(current, fresh));
    current.profileName = profileName;
    current.forceProfileName = forceProfileName;
    current.importedAt = new Date().toISOString();
    saveCreators();
    renderCreators();
    setCreatorStatus("已重新载入" + current.platform + "账号。", "success");
    if (activeCreatorId) openCreatorDetail(activeCreatorId);
  } catch (error) {
    setCreatorStatus("重新载入失败：" + error.message, "error");
  }
}
async function refreshCreatorProfile(profileId) {
  const profile = creatorProfiles().find((entry) => entry.id === profileId);
  if (!profile) return;
  const accounts = profile.accounts.filter((account) => account.source);
  if (!accounts.length) { setCreatorStatus("这个博主没有可刷新的原始导入链接。", "error"); return; }
  setCreatorStatus("正在刷新 " + profile.name + " 的实时粉丝量...", "");
  let success = 0;
  let failed = 0;
  for (const account of accounts) {
    const current = creators.find((entry) => entry.id === account.id);
    if (!current?.source) { failed += 1; continue; }
    try {
      const response = await fetch(API_BASE + "/api/import-creator?url=" + encodeURIComponent(current.source));
      const payload = await response.json();
      if (!response.ok || !payload.creator) throw new Error(payload.error || "刷新失败");
      const fresh = normalizeCreator(payload.creator);
      if (fresh.platform !== current.platform) throw new Error("平台不匹配");
      if (!creatorSameAccount(current, fresh) && (fresh.userId || fresh.handle || fresh.resolvedUrl)) throw new Error("账号不匹配");
      const profileName = current.profileName;
      const forceProfileName = current.forceProfileName;
      Object.assign(current, mergeCreatorRecord(current, fresh));
      current.profileName = profileName;
      current.forceProfileName = forceProfileName;
      current.importedAt = new Date().toISOString();
      success += 1;
    } catch {
      failed += 1;
    }
  }
  saveCreators();
  renderCreators();
  if (activeCreatorId === profileId) openCreatorDetail(profileId);
  setCreatorStatus("刷新完成：" + success + " 个账号已更新" + (failed ? "，" + failed + " 个失败。" : "。"), failed ? "error" : "success");
}
function deleteCreatorAccount(accountId) {
  const current = creators.find((entry) => entry.id === accountId);
  if (!current) return;
  if (!confirm("确定删除这个" + current.platform + "账号？")) return;
  const profileId = activeCreatorId;
  creators = creators.filter((entry) => entry.id !== accountId);
  saveCreators();
  renderCreators();
  const profile = creatorProfiles().find((entry) => entry.id === profileId);
  if (profile) openCreatorDetail(profile.id);
  else closeCreatorDetail();
}

function shorten(value, max) { return value.length > max ? value.slice(0, max) + "..." : value; }
function safeJson(value) { return JSON.stringify(value, (key, val) => typeof val === "string" && val.startsWith("data:image/") ? "[本地上传图片]" : val, null, 2); }
function escapeHtml(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function scoreItem(item, goal, need, preferred, excluded) {
  const targetWords = [...goalProfiles[goal], ...splitTags(need), ...splitTags(preferred)]; const text = [item.name, item.role, item.description, item.tags.join(" ")].join(" ");
  if (excluded.some((term) => term && text.includes(term))) return -999; let score = 0;
  targetWords.forEach((word) => { if (!word) return; if (item.name.includes(word)) score += 8; if (item.role.includes(word)) score += 6; if (item.tags.includes(word)) score += 5; if (item.description.includes(word)) score += 3; });
  if (item.type === "car") score += 4; if (item.type === "part" || item.type === "skill") score += 2; return score;
}
function recommend() {
  const goal = $("goal").value; const need = $("trackNeed").value; const preferred = $("preferredCar").value; const excluded = splitTags($("excludeTerms").value);
  const scored = items.map((item) => ({ item, score: scoreItem(item, goal, need, preferred, excluded) })).filter((entry) => entry.score > -999).sort((a, b) => b.score - a.score);
  const cars = scored.filter((entry) => entry.item.type === "car").slice(0, 3); const parts = scored.filter((entry) => entry.item.type === "part" || entry.item.type === "skill").slice(0, 6); const tracks = scored.filter((entry) => entry.item.type === "track").slice(0, 2);
  const groups = cars.length ? cars : scored.slice(0, 3);
  $("recommendations").innerHTML = groups.length ? groups.map((entry, index) => renderRecommendation(entry, parts.slice(index, index + 3), tracks, goal, need)).join("") : '<section class="panel"><p class="desc">资料库还不够生成推荐。先导入车辆、芯片、技能或赛道资料。</p></section>';
}
function renderRecommendation(carEntry, parts, tracks, goal, need) {
  const names = parts.map((entry) => entry.item.name).join(" + ") || "暂无可匹配芯片/技能"; const trackNames = tracks.map((entry) => entry.item.name).join("、") || need || "通用场景";
  return '<article class="recommend-card"><h3>' + escapeHtml(carEntry.item.name) + ' <span class="score">匹配度 ' + Math.max(1, carEntry.score) + '</span></h3><p class="desc">搭配：' + escapeHtml(names) + '</p><p class="desc">适用：' + escapeHtml(trackNames) + '</p><p class="desc">推荐方向是' + escapeHtml({ speed: "竞速冲线", control: "干扰压制", support: "团队辅助", balanced: "综合稳定" }[goal]) + (need ? '，场景偏向' + escapeHtml(need) : '') + '。</p></article>';
}
function buildAiMessages() { return [{ role: "system", content: $("systemPrompt").value || defaultPrompt() }, { role: "user", content: JSON.stringify({ game: "王牌竞速", target: $("goal").value, track_or_mode: $("trackNeed").value, data: items.slice(0, 80), task: "请给出 3 套可解释搭配，说明车辆、芯片/技能、适用场景、优点、短板和需要补充的数据。" }, null, 2) }]; }
function defaultPrompt() { return "你是王牌竞速资料搭配助手。只能基于用户提供的资料分析，不要编造不存在的车辆、芯片、技能或数值。输出要简洁、可执行，并指出资料不足之处。"; }
async function runAi() { const config = loadAiConfig(); if (!config.apiBase || !config.modelName || !config.apiKey) { $("aiOutput").textContent = "请先填写 API 地址、模型和 API Key。"; return; } $("aiOutput").textContent = "正在请求 AI..."; try { const response = await fetch(config.apiBase, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + config.apiKey }, body: JSON.stringify({ model: config.modelName, messages: buildAiMessages(), temperature: 0.4 }) }); if (!response.ok) throw new Error("HTTP " + response.status); const data = await response.json(); $("aiOutput").textContent = data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2); } catch (error) { $("aiOutput").textContent = "AI 请求失败：" + error.message; } }
function setLibraryBranch(branch) {
  activeLibraryBranch = branch === "support" || branch === "mixedBattle" ? branch : "cars";
  activeLibraryBranch = branch === "support" || branch === "mixedBattle" || branch === "groups" ? branch : "cars";
  if (activeLibraryBranch !== "support" && activeLibraryBranch !== "groups") activeSupportCategoryFilter = "";
  document.querySelectorAll(".library-branch-button").forEach((button) => button.classList.toggle("active", button.dataset.libraryBranch === activeLibraryBranch));
  render();
}
function openSupportCategory(category) {
  if (!supportCategoryOptions.includes(category)) return;
  activeSupportCategoryFilter = category;
  setLibraryBranch("support");
  closeDetail();
}
function updateSupportCategory(itemId, category, checked) {
  if (isReadOnlyMode()) { showReadOnlyNotice(); return; }
  if (!supportCategoryOptions.includes(category)) return;
  const item = items.find((entry) => entry.id === itemId && entry.type === "car");
  if (!item) return;
  item.details = item.details || {};
  const current = new Set(carSupportCategories(item));
  if (checked) current.add(category);
  else current.delete(category);
  item.details.supportCategories = [...current];
  saveItems();
  render();
}
function currentRelationEntries(item, relationKey) {
  item.details = item.details || {};
  item.details.vehicleRelations = normalizeVehicleRelations(item.details.vehicleRelations || {});
  item.details.vehicleRelations[relationKey] = item.details.vehicleRelations[relationKey] || [];
  return item.details.vehicleRelations[relationKey];
}
function activeRelationItem() {
  if (activeDetailId && sheetEditItemId === activeDetailId && sheetEditDraft) return sheetEditDraft;
  return findItemById(activeDetailId);
}
function finishRelationEdit(item, shouldSave = true) {
  if (!item) return;
  if (sheetEditItemId === item.id && sheetEditDraft) {
    openDetail(item.id);
    return;
  }
  if (shouldSave) saveItems();
  openDetail(item.id);
}
function relationEntryMatches(entry, type, id) {
  return (entry.type || "car") === type && entry.id === id;
}
function relationSyncKey(leftId, rightId, leftKey, rightKey) {
  return [leftId, rightId].sort().join("::relation-sync::") + "::" + leftKey + "::" + rightKey;
}
function findRelationEntry(item, relationKey, type, id) {
  return currentRelationEntries(item, relationKey).find((entry) => relationEntryMatches(entry, type, id));
}
function relationEntryLooksLikeItem(entry, item) {
  if (!entry || !item || (entry.type || "car") !== "car") return false;
  if (entry.id === item.id) return true;
  const entryKey = normalizeMatchName(entry.id);
  if (!entryKey) return false;
  return vehicleNameAliases(item).map(normalizeMatchName).some((nameKey) => nameKey && nameKey === entryKey);
}
function findOrRepairRelationEntry(item, relationKey, relatedItem) {
  const entries = currentRelationEntries(item, relationKey);
  let entry = entries.find((value) => relationEntryMatches(value, "car", relatedItem.id));
  if (!entry) entry = entries.find((value) => relationEntryLooksLikeItem(value, relatedItem));
  if (entry) {
    entry.type = "car";
    entry.id = relatedItem.id;
  }
  return entry;
}
function currentRelationReasonInput(relationKey, relatedId, relationType) {
  return Array.from(document.querySelectorAll(".relation-reason-input")).find((input) => input.dataset.relationKey === relationKey && input.dataset.relatedId === relatedId && (input.dataset.relationType || "car") === relationType);
}
function syncVehicleRelation(relationKey, relatedId, relationType = "car") {
  const item = activeRelationItem();
  const related = relationType === "car" ? findItemById(relatedId) : null;
  const targetKey = vehicleRelationSyncTargets[relationKey];
  if (!item || !related || !targetKey) return;
  const entry = findRelationEntry(item, relationKey, "car", relatedId);
  if (!entry) return;
  const input = currentRelationReasonInput(relationKey, relatedId, relationType);
  if (input) entry.reason = normalizeText(input.value);
  const syncKey = relationSyncKey(item.id, related.id, relationKey, targetKey);
  related.details = related.details || {};
  const targetRelations = normalizeVehicleRelations(related.details.vehicleRelations || {});
  const targetEntries = targetRelations[targetKey] || [];
  let targetEntry = targetEntries.find((value) => relationEntryMatches(value, "car", item.id)) || targetEntries.find((value) => relationEntryLooksLikeItem(value, item));
  if (!targetEntry) {
    targetEntry = { type: "car", id: item.id, reason: entry.reason || "", syncKey, detached: false };
    targetEntries.push(targetEntry);
  } else {
    targetEntry.type = "car";
    targetEntry.id = item.id;
    targetEntry.reason = entry.reason || "";
    targetEntry.syncKey = syncKey;
    targetEntry.detached = false;
  }
  targetRelations[targetKey] = targetEntries.filter((value, index, list) => list.findIndex((other) => (other.type || "car") === (value.type || "car") && other.id === value.id) === index);
  related.details.vehicleRelations = targetRelations;
  entry.syncKey = syncKey;
  entry.detached = false;
  item.details.vehicleRelations = normalizeVehicleRelations(item.details.vehicleRelations || {});
  item.details.vehicleRelations[relationKey] = currentRelationEntries(item, relationKey);
  if (sheetEditItemId === item.id && sheetEditDraft) {
    sheetEditDraft = item;
    uiEditDraft = item;
    items = items.map((candidate) => candidate.id === related.id ? related : candidate);
  } else {
    items = items.map((candidate) => candidate.id === item.id ? item : candidate.id === related.id ? related : candidate);
  }
  saveItems();
  openDetail(item.id);
}
function renderRelationSuggestions(relationKey, query) {
  if (!activeDetailId) return;
  const item = activeRelationItem();
  if (!item) return;
  const container = document.querySelector('.relation-suggestions[data-relation-key="' + relationKey + '"]');
  if (!container) return;
  const selectedKeys = new Set(currentRelationEntries(item, relationKey).map((entry) => (entry.type || "car") + ":" + entry.id));
  const cars = items.filter((entry) => entry.type === "car" && entry.id !== activeDetailId);
  const raw = normalizeText(query);
  const categorySuggestions = relationKey === "recommendedTeammates"
    ? supportCategoryOptions.filter((category) => !selectedKeys.has("supportCategory:" + category) && (!raw || category.includes(raw)))
    : [];
  var groupSuggestions = groups.filter(function(g){return!selectedKeys.has("group:"+g.id)&&(!raw||g.name.includes(raw));}).map(function(g){return'<button type="button" class="relation-suggestion relation-category-suggestion" data-relation-key="'+escapeHtml(relationKey)+'" data-relation-type="group" data-related-id="'+escapeHtml(g.id)+'"><span>'+escapeHtml(g.name)+'</span><small>组合</small></button>';}).join("");
  var groupsHtml = groupSuggestions || "";
  const matches = cars.filter((entry) => !selectedKeys.has("car:" + entry.id) && (!raw || carMatchesSearch(entry, raw))).sort((a, b) => compareCars(a, b, "alpha")).slice(0, 30);
  const categoryHtml = categorySuggestions.map((category) => {
    const count = items.filter((entry) => entry.type === "car" && carPosition(entry) === "辅助" && carSupportCategories(entry).includes(category)).length;
    return '<button type="button" class="relation-suggestion relation-category-suggestion" data-relation-key="' + escapeHtml(relationKey) + '" data-relation-type="supportCategory" data-related-id="' + escapeHtml(category) + '"><span>' + escapeHtml(category) + '</span><small>辅助泛类 · ' + count + ' 辆</small></button>';
  }).join("");
  const carHtml = matches.map((entry) => {
    const name = displayVehicleName(entry);
    const meta = [carRarity(entry), carPosition(entry), carSeasonText(entry)].filter(Boolean).join(" · ");
    return '<button type="button" class="relation-suggestion" data-relation-key="' + escapeHtml(relationKey) + '" data-relation-type="car" data-related-id="' + escapeHtml(entry.id) + '"><span>' + escapeHtml(name) + '</span><small>' + escapeHtml(meta) + '</small></button>';
  }).join("");
  container.innerHTML = categoryHtml || groupsHtml || carHtml ? categoryHtml + groupsHtml + carHtml : '<p class="relation-empty">没有搜到可添加的车辆。</p>';
}
function toggleRelationPicker(relationKey) {
  const picker = document.querySelector('.relation-picker[data-relation-key="' + relationKey + '"]');
  if (!picker) return;
  picker.classList.toggle("hidden");
  const input = picker.querySelector(".relation-search-input");
  if (!picker.classList.contains("hidden")) {
    if (input) {
      input.value = "";
      input.focus();
    }
    renderRelationSuggestions(relationKey, "");
  }
}
function addVehicleRelation(relationKey, relatedId, relationType = "car") {
  const item = activeRelationItem();
  const related = relationType === "car" ? findItemById(relatedId) : null;
  if (!item || (relationType === "car" && !related)) return;
  const entries = currentRelationEntries(item, relationKey);
  if (!entries.some((entry) => relationEntryMatches(entry, relationType, relatedId))) entries.push({ type: relationType, id: relatedId, reason: "", syncKey: "", detached: false });
  item.details.vehicleRelations[relationKey] = entries;
  if (sheetEditItemId === item.id && sheetEditDraft) {
    sheetEditDraft = item;
    uiEditDraft = item;
    finishRelationEdit(item, false);
    return;
  }
  finishRelationEdit(item, true);
}
function removeVehicleRelation(relationKey, relatedId, relationType = "car") {
  const item = activeRelationItem();
  if (!item) return;
  const entries = currentRelationEntries(item, relationKey).filter((entry) => !relationEntryMatches(entry, relationType, relatedId));
  item.details.vehicleRelations[relationKey] = entries;
  if (sheetEditItemId === item.id && sheetEditDraft) {
    sheetEditDraft = item;
    uiEditDraft = item;
    finishRelationEdit(item, false);
    return;
  }
  finishRelationEdit(item, true);
}
function updateVehicleRelationReason(relationKey, relatedId, reason, relationType = "car") {
  const item = activeRelationItem();
  if (!item) return;
  const entries = currentRelationEntries(item, relationKey);
  const entry = entries.find((value) => relationEntryMatches(value, relationType, relatedId));
  if (!entry) return;
  const nextReason = normalizeText(reason);
  entry.reason = nextReason;
  if (sheetEditItemId === item.id && sheetEditDraft) {
    sheetEditDraft = item;
    uiEditDraft = item;
  } else {
    saveItems();
  }
  const card = document.querySelector('.relation-car-card[data-relation-key="' + relationKey + '"][data-relation-type="' + relationType + '"][data-related-id="' + relatedId + '"]');
  if (card) card.setAttribute("title", entry.reason || "未填写原因");
}

document.querySelectorAll(".nav-button").forEach((button) => { button.addEventListener("click", () => { document.querySelectorAll(".nav-button").forEach((item) => item.classList.remove("active")); document.querySelectorAll(".view").forEach((item) => item.classList.remove("active")); button.classList.add("active"); $("view-" + button.dataset.view).classList.add("active"); if (button.dataset.view === "desktop-pet") renderDesktopPetManager(); }); });
document.querySelectorAll(".library-branch-button").forEach((button) => { button.addEventListener("click", () => setLibraryBranch(button.dataset.libraryBranch)); });
if ($("toggleVehicleImport")) $("toggleVehicleImport").addEventListener("click", () => {
  $("vehicleImportPanel")?.classList.toggle("hidden");
});
$("importGamekeeUrl").addEventListener("click", importGamekeeUrl);
if ($("supplementVehicleUrl")) $("supplementVehicleUrl").addEventListener("click", supplementVehicleUrl);
if ($("addBlankVehicle")) $("addBlankVehicle").addEventListener("click", addOrOpenBlankVehicle);
if ($("buildPerformanceStats")) $("buildPerformanceStats").addEventListener("click", buildPerformanceStatsDatabase);
$("gamekeeUrl").addEventListener("keydown", (event) => { if (event.key === "Enter") importGamekeeUrl(); });
document.addEventListener("change", (event) => {
  if (event.target?.id === "performanceRadarMode") {
    savePerformanceRadarMode(event.target.value);
    if (activeDetailId) openDetail(activeDetailId);
  }
});
document.addEventListener("error", (event) => {
  if (event.target instanceof HTMLImageElement && event.target.dataset.imageCandidates) handleImageLoadError(event.target);
}, true);
document.addEventListener("load", (event) => {
  if (event.target instanceof HTMLImageElement && event.target.dataset.imageOriginals) handleImageLoadSuccess(event.target);
}, true);
$("libraryList").addEventListener("change", (event) => {
  if (event.target.classList.contains("support-class-checkbox")) updateSupportCategory(event.target.dataset.itemId, event.target.dataset.supportCategory, event.target.checked);
  if (event.target.classList.contains("group-car-cb")) {
    var inp = event.target;
    if (!inp || !inp.dataset.groupId) return;
    var gp = groups.find(function(x){return x.id===inp.dataset.groupId;});
    if(!gp) return;
    var cid = inp.dataset.carId;
    if(inp.checked){if(!gp.carIds.includes(cid))gp.carIds.push(cid);}
    else{gp.carIds=gp.carIds.filter(function(x){return x!==cid;});}
    saveGroups();
  }
});
$("libraryList").addEventListener("click", (event) => {
  const createBtn = event.target.closest("#createGroupBtn");
  if (createBtn) { const nm = $("newGroupName")?.value.trim(); if (!nm) { alert("请输入组合名称"); return; } groups.push({ id: crypto.randomUUID(), name: nm, carIds: [], type: ($('newGroupType')?.value||'name') }); saveGroups(); if ($("newGroupName")) $("newGroupName").value = ""; render(); return; }
  const editGrp = event.target.closest(".edit-group-btn");
  if (editGrp) { activeGroupEdit = activeGroupEdit === editGrp.dataset.groupId ? "" : editGrp.dataset.groupId; render(); return; }
  const removeGrp = event.target.closest(".remove-group-btn");
  if (removeGrp) { if (confirm("确定删除这个组合？")) { groups = groups.filter((x) => x.id !== removeGrp.dataset.groupId); saveGroups(); render(); } return; }
  const clearSupport = event.target.closest("#clearSupportCategoryFilter");
  if (clearSupport) { activeSupportCategoryFilter = ""; render(); return; }
  const mixedBattleCar = event.target.closest(".mixed-battle-car");
  if (mixedBattleCar) { openDetail(mixedBattleCar.dataset.mixedCarId); return; }
  if (event.target.closest(".support-check")) return;
  const card = event.target.closest(".item-card");
  const groupTooltipCar = event.target.closest(".group-tooltip-car");
  if (groupTooltipCar && groupTooltipCar.dataset.itemId) { openDetail(groupTooltipCar.dataset.itemId); return; }
  if (card) openDetail(card.dataset.itemId);
});
$("libraryList").addEventListener("keydown", (event) => { if (event.key !== "Enter") return; const card = event.target.closest(".item-card"); if (card) openDetail(card.dataset.itemId); });
$("closeDetail").addEventListener("click", closeDetail);
if ($("detailBackBtn")) $("detailBackBtn").addEventListener("click", backDetail);
if ($("editUiBtn")) $("editUiBtn").addEventListener("click", enterUiEditMode);
if ($("editSheetBtn")) $("editSheetBtn").addEventListener("click", enterSheetEditMode);
$("resetUiEdit").addEventListener("click", resetUiEditFromSource);
if ($("saveUiEdit")) $("saveUiEdit").addEventListener("click", saveUiEditMode);
if ($("cancelUiEdit")) $("cancelUiEdit").addEventListener("click", cancelUiEditMode);
if ($("saveSheetEdit")) $("saveSheetEdit").addEventListener("click", saveSheetEditMode);
if ($("cancelSheetEdit")) $("cancelSheetEdit").addEventListener("click", cancelSheetEditMode);
$("uiImageInput").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    setUiEditStatus("正在处理图片...");
    const targetType = pendingUiTarget?.type || "vehicle";
    const dataUrl = await optimizeUploadedUiImage(file, targetType);
    const imageSrc = await persistUploadedUiImage(dataUrl, targetType);
    applyUploadedUiImage(imageSrc);
    setUiEditStatus("图片已加入编辑草稿，点击保存资料后生效。", "success");
  } catch (error) {
    setUiEditStatus("图片处理失败：" + error.message, "error");
  } finally {
    event.target.value = "";
  }
});
$("detailModal").addEventListener("click", (event) => { if (event.target.dataset.closeDetail) closeDetail(); });
$("detailBody").addEventListener("click", (event) => {
  if (event.target.closest(".vehicle-drive-anchor-point, .vehicle-drive-anchor-editor")) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const uploadTarget = event.target.closest(".ui-upload-target");
  if (uploadTarget) { pickUiUploadTarget(uploadTarget); return; }
  const relationCard = event.target.closest(".relation-car-card");
  if (relationCard) {
    if (relationCard.dataset.relationType === "supportCategory") openSupportCategory(relationCard.dataset.relatedId);
    else if (relationCard.dataset.relationType === "group") { var grp2 = groups.find(function(g){return g.id===relationCard.dataset.relatedId;}); if(grp2){activeLibraryBranch="groups";closeDetail();render();} }
    else openRelatedVehicleDetail(relationCard.dataset.relatedId);
    return;
  }
  const tooltipCar = event.target.closest(".group-tooltip-car");
  if (tooltipCar) { openRelatedVehicleDetail(tooltipCar.dataset.itemId); return; }
  const relationGroupCar = event.target.closest(".relation-group-car");
  if (relationGroupCar && relationGroupCar.dataset.itemId) { openRelatedVehicleDetail(relationGroupCar.dataset.itemId); return; }
  const cornerCar = event.target.closest(".corner-car");
  if (cornerCar) {
    if (cornerCar.dataset.relationType === "supportCategory") openSupportCategory(cornerCar.dataset.itemId);
    else if (cornerCar.dataset.relationType === "group") { var grp2 = groups.find(function(g){return g.id===cornerCar.dataset.itemId;}); if(grp2){activeLibraryBranch="groups";closeDetail();render();} }
    else openRelatedVehicleDetail(cornerCar.dataset.itemId);
    return;
  }
  const relationAdd = event.target.closest(".relation-add-btn");
  if (relationAdd) { toggleRelationPicker(relationAdd.dataset.relationKey); return; }
  const relationSuggestion = event.target.closest(".relation-suggestion");
  if (relationSuggestion) { addVehicleRelation(relationSuggestion.dataset.relationKey, relationSuggestion.dataset.relatedId, relationSuggestion.dataset.relationType || "car"); return; }
  const relationSync = event.target.closest(".relation-sync-btn");
  if (relationSync) { syncVehicleRelation(relationSync.dataset.relationKey, relationSync.dataset.relatedId, relationSync.dataset.relationType || "car"); return; }
  const relationRemove = event.target.closest(".relation-remove-btn");
  if (relationRemove) { removeVehicleRelation(relationRemove.dataset.relationKey, relationRemove.dataset.relatedId, relationRemove.dataset.relationType || "car"); return; }
  const button = event.target.closest(".reload-images-btn");
  if (button) reloadImagesForItem(button.dataset.itemId);
  const emptyField = event.target.closest(".sheet-field-empty");
  if (emptyField) {
    updateSheetDraftField(emptyField.dataset.sheetField, "-");
    const input = emptyField.parentElement?.querySelector(".sheet-field-input");
    if (input) input.value = "-";
  }
  const performanceEmptyField = event.target.closest(".performance-field-empty");
  if (performanceEmptyField) {
    updatePerformanceDraftField(performanceEmptyField.dataset.performanceField, "-", { sheetField: performanceEmptyField.dataset.performanceSheetField || "", splitIndex: performanceEmptyField.dataset.performanceSplitIndex || "" });
    const input = performanceEmptyField.parentElement?.querySelector(".performance-field-input");
    if (input) input.value = "-";
  }
});
$("detailBody").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target.closest(".vehicle-drive-anchor-point, .vehicle-drive-anchor-editor")) return;
  const uploadTarget = event.target.closest(".ui-upload-target");
  if (uploadTarget) { event.preventDefault(); pickUiUploadTarget(uploadTarget); }
});
$("detailBody").addEventListener("change", (event) => {
  if (event.target.classList.contains("ability-select")) {
    updateAbilityLabel(event.target.dataset.itemId, event.target.dataset.abilityName, event.target.value);
    if (activeDetailId) openDetail(activeDetailId);
    return;
  }
  if (event.target.classList.contains("relation-reason-input")) {
    updateVehicleRelationReason(event.target.dataset.relationKey, event.target.dataset.relatedId, event.target.value, event.target.dataset.relationType || "car");
    return;
  }
  if (["carRaritySelect", "carCategorySelect", "carTrackSpecialtySelect", "carMainPositionSelect"].includes(event.target.id) || event.target.classList.contains("car-included-position")) {
    updateCarMetaFromDetail();
  }
});
$("detailBody").addEventListener("input", (event) => {
  if (event.target.classList.contains("sheet-field-input")) updateSheetDraftField(event.target.dataset.sheetField, event.target.value);
  if (event.target.classList.contains("performance-field-input")) updatePerformanceDraftField(event.target.dataset.performanceField, event.target.value, { sheetField: event.target.dataset.performanceSheetField || "", splitIndex: event.target.dataset.performanceSplitIndex || "" });
  if (event.target.id === "sheetSourceNameInput") updateSheetDraftSourceName(event.target.value);
  if (event.target.classList.contains("relation-search-input")) renderRelationSuggestions(event.target.dataset.relationKey, event.target.value);
  if (event.target.classList.contains("vehicle-drive-anchor-input")) {
    const x = document.querySelector(".vehicle-drive-anchor-x")?.value;
    const y = document.querySelector(".vehicle-drive-anchor-y")?.value;
    updateVehicleDriveAnchor({ x, y }, false);
  }
});
$("detailBody").addEventListener("pointerdown", (event) => {
  const point = event.target.closest(".vehicle-drive-anchor-point");
  if (!point) return;
  const stage = point.closest(".vehicle-detail-art");
  if (!stage) return;
  event.preventDefault();
  event.stopPropagation();
  vehicleDriveAnchorDrag = { stage, pointerId: event.pointerId };
  point.setPointerCapture?.(event.pointerId);
  updateVehicleDriveAnchorFromEvent(stage, event);
});
$("detailBody").addEventListener("pointermove", (event) => {
  if (!vehicleDriveAnchorDrag || vehicleDriveAnchorDrag.pointerId !== event.pointerId) return;
  event.preventDefault();
  updateVehicleDriveAnchorFromEvent(vehicleDriveAnchorDrag.stage, event);
});
$("detailBody").addEventListener("pointerup", (event) => {
  if (!vehicleDriveAnchorDrag || vehicleDriveAnchorDrag.pointerId !== event.pointerId) return;
  event.target.releasePointerCapture?.(event.pointerId);
  vehicleDriveAnchorDrag = null;
});
$("detailBody").addEventListener("pointercancel", (event) => {
  if (!vehicleDriveAnchorDrag || vehicleDriveAnchorDrag.pointerId !== event.pointerId) return;
  vehicleDriveAnchorDrag = null;
});
if ($("importCreators")) $("importCreators").addEventListener("click", importCreatorUrls);
if ($("creatorSearch")) $("creatorSearch").addEventListener("input", renderCreators);
if ($("creatorPlatformFilter")) $("creatorPlatformFilter").addEventListener("change", renderCreators);
if ($("creatorSortRule")) $("creatorSortRule").addEventListener("change", renderCreators);
if ($("clearCreators")) $("clearCreators").addEventListener("click", () => { if (!confirm("确定清空博主库？")) return; creators = []; saveCreators(); renderCreators(); });
if ($("creatorList")) $("creatorList").addEventListener("click", (event) => {
  const refresh = event.target.closest(".refresh-creator-profile");
  if (refresh) { event.stopPropagation(); refreshCreatorProfile(refresh.dataset.profileId); return; }
  const missing = event.target.closest(".creator-platform-missing");
  if (missing) { event.stopPropagation(); importCreatorIntoProfile(missing.dataset.profileId, missing.dataset.missingPlatform); return; }
  const cell = event.target.closest(".creator-platform-cell");
  if (cell && cell.dataset.creatorUrl) { event.stopPropagation(); window.open(cell.dataset.creatorUrl, '_blank'); return; }
  const row = event.target.closest(".creator-row");
  if (row) openCreatorDetail(row.dataset.creatorId);
});
if ($("creatorList")) $("creatorList").addEventListener("keydown", (event) => { if (event.key !== "Enter") return; const row = event.target.closest(".creator-row"); if (row) openCreatorDetail(row.dataset.creatorId); });
if ($("closeCreatorDetail")) $("closeCreatorDetail").addEventListener("click", closeCreatorDetail);
if ($("creatorDetailModal")) $("creatorDetailModal").addEventListener("click", (event) => { if (event.target.dataset.closeCreator) closeCreatorDetail(); });
if ($("creatorDetailBody")) $("creatorDetailBody").addEventListener("click", (event) => {
  const avatar = event.target.closest(".creator-avatar-refresh");
  if (avatar) { importAvatarForProfile(avatar.dataset.profileId); return; }
  const missing = event.target.closest(".import-missing-creator");
  if (missing) {
    const panel = missing.closest(".creator-account-panel");
    const inlineUrl = normalizeText(panel?.querySelector(".creator-profile-import-url")?.value || "");
    importCreatorIntoProfile(missing.dataset.profileId, missing.dataset.missingPlatform, inlineUrl);
    return;
  }
  const importExisting = event.target.closest(".import-existing-creator");
  if (importExisting) { importCreatorOverAccount(importExisting.dataset.accountId); return; }
  const reload = event.target.closest(".reload-creator-account");
  if (reload) { reloadCreatorAccount(reload.dataset.accountId); return; }
  const remove = event.target.closest(".delete-creator-account");
  if (remove) deleteCreatorAccount(remove.dataset.accountId);
});
if ($("creatorDetailBody")) $("creatorDetailBody").addEventListener("change", (event) => {
  if (event.target.id === "creatorProfileNameInput") {
    updateCreatorProfileName(event.target.dataset.profileId, event.target.value);
    return;
  }
  if (event.target.id === "creatorGenderSelect") {
    updateCreatorGender(event.target.dataset.profileId, event.target.value);
    return;
  }
  if (event.target.classList.contains("creator-display-source")) {
    updateCreatorDisplaySource(event.target.dataset.profileId, event.target.dataset.displayKind, event.target.value);
    return;
  }
  const accountId = event.target.dataset.accountId;
  if (accountId && (event.target.classList.contains("creator-follower-number") || event.target.classList.contains("creator-follower-unit") || event.target.classList.contains("creator-user-id"))) updateCreatorAccount(accountId);
});
if ($("creatorDetailBody")) $("creatorDetailBody").addEventListener("input", (event) => {
  const accountId = event.target.dataset.accountId;
  if (accountId && (event.target.classList.contains("creator-follower-number") || event.target.classList.contains("creator-user-id"))) updateCreatorAccount(accountId, false);
});
$("parseInput").addEventListener("click", () => { try { addRecords(parseInput($("rawInput").value, $("importType").value)); $("rawInput").value = ""; } catch (error) { alert("识别失败：" + error.message); } });
$("fileInput").addEventListener("change", async (event) => { const file = event.target.files[0]; if (!file) return; const text = await file.text(); const ext = file.name.split(".").pop().toLowerCase(); try { addRecords(parseInput(text, ext === "json" || ext === "csv" ? ext : "auto")); } catch (error) { alert("文件导入失败：" + error.message); } event.target.value = ""; });
$("addItem").addEventListener("click", () => { const record = normalizeRecord({ name: $("itemName").value, type: $("itemType").value, role: $("itemRole").value, tags: splitTags($("itemTags").value), description: $("itemDesc").value }); if (!record.name || record.name === "未命名资料") { alert("请先填写名称。"); return; } addRecords([record]); ["itemName", "itemRole", "itemTags", "itemDesc"].forEach((id) => ($(id).value = "")); });
$("loadSample").addEventListener("click", () => addRecords(sampleData));
$("exportData").addEventListener("click", () => { const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "ace-racer-data.json"; link.click(); URL.revokeObjectURL(url); });
if ($("clearData")) $("clearData").addEventListener("click", () => { if (!confirm("确定清空本地资料库？")) return; items = []; saveItems(); render(); });
function hatchPetMotionFrames(trigger) {
  const count = hatchPetRowByTrigger(legacyHatchTrigger(trigger)).frames;
  return Array.from({ length: count }, (_, index) => ({ index }));
}
function drawStableHatchBase(context, image) {
  drawImageIntoHatchCell(context, image, { scale: 1 });
}
function drawBlinkCue(context, amount) {
  if (!amount) return;
  context.save();
  context.fillStyle = "rgba(25,30,42," + (amount >= 2 ? "0.82" : "0.42") + ")";
  const h = amount >= 2 ? 5 : 3;
  context.beginPath();
  context.ellipse(78, 83, 17, h, 0, 0, Math.PI * 2);
  context.ellipse(116, 83, 17, h, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}
async function buildHatchPetFramesFromMaterial(src, state) {
  const image = await loadDesktopPetImage(src);
  const spec = hatchPetRowByTrigger(state.trigger);
  const blinkPattern = state.trigger === "idle" ? [0, 0, 1, 2, 1, 0] : Array.from({ length: spec.frames }, () => 0);
  const frames = [];
  const motions = typeof hatchPetMotionFrames === "function" ? hatchPetMotionFrames(state.trigger) : Array.from({ length: spec.frames }, () => ({ scale: 1 }));
  for (let index = 0; index < spec.frames; index += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 208;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    if (typeof drawImageIntoHatchCell === "function") {
      drawImageIntoHatchCell(context, image, motions[index] || motions[motions.length - 1] || { scale: 1 });
    } else {
      drawStableHatchBase(context, image);
    }
    drawBlinkCue(context, blinkPattern[index] || 0);
    frames.push(await canvasToDataUrl(canvas, "image/png"));
  }
  return frames;
}
async function openDesktopPetWindow() {
  const pet = activeDesktopPet();
  if (!pet) { createDesktopPet(); return; }
  saveDesktopPets();
  setDesktopPetStatus("正在召唤系统桌宠...");
  try {
    const response = await fetch(API_BASE + "/api/launch-desktop-pet?pet=" + encodeURIComponent(pet.id), { method: "POST" });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "启动失败");
    setDesktopPetStatus("桌宠已召唤。她现在是系统置顶透明窗口，可以拖到任意位置。", "success");
  } catch (error) {
    setDesktopPetStatus("系统桌宠启动失败，已退回网页预览：" + error.message, "error");
    const url = "./pet.html?pet=" + encodeURIComponent(pet.id) + "&v=" + Date.now();
    window.open(url, "ace-racer-desktop-pet-" + pet.id, "popup=yes,width=440,height=580,left=120,top=120");
  }
}
function desktopPetExtraActionSpecs() {
  return [
    { row: 9, trigger: "drag-up", name: "向上拖动", frames: 6, durations: [120, 120, 120, 120, 120, 220], message: "往上走也可以。" },
    { row: 10, trigger: "drag-down", name: "向下拖动", frames: 6, durations: [120, 120, 120, 120, 120, 220], message: "我跟着下来了。" },
    { row: 11, trigger: "petting", name: "摸摸", frames: 5, durations: [120, 120, 150, 150, 260], message: "嗯，我在。" },
    { row: -1, trigger: "sleep-enter", name: "进入睡眠", frames: 4, durations: [180, 180, 220, 360], message: "我要睡啦。" },
    { row: -1, trigger: "sleep-loop", name: "睡觉循环", frames: 6, durations: [260, 260, 300, 300, 340, 420], message: "Zzz..." },
    { row: -1, trigger: "sleep-wake", name: "睡醒", frames: 4, durations: [180, 160, 160, 260], message: "醒啦。" },
    { row: -1, trigger: "drive-enter", name: "进入驾驶", frames: 4, durations: [150, 150, 180, 260], message: "准备开车。" },
    { row: -1, trigger: "drive-loop", name: "开车", frames: 6, durations: [120, 120, 120, 120, 120, 160], message: "出发。" },
    { row: -1, trigger: "drive-loop-right", name: "向右开车", frames: 6, durations: [120, 120, 120, 120, 120, 160], message: "向右出发。" },
    { row: -1, trigger: "random", name: "待机随机", frames: 5, durations: [140, 140, 160, 160, 260], message: "" },
    { row: -1, trigger: "petting-hand", name: "摸摸手势", frames: 4, durations: [90, 90, 90, 180], message: "" },
  ];
}
function desktopPetActionSpecs() {
  return hatchPetRows().concat(desktopPetExtraActionSpecs());
}
function hatchPetRowByTrigger(trigger) {
  const value = legacyHatchTrigger(normalizeText(trigger || "idle"));
  return desktopPetActionSpecs().find((row) => row.trigger === value) || desktopPetActionSpecs()[0];
}
function desktopPetSpecForTrigger(trigger, state) {
  const value = normalizeText(trigger || state?.trigger || "idle");
  const mapped = legacyHatchTrigger(value);
  const known = desktopPetActionSpecs().find((row) => row.trigger === mapped || row.trigger === value);
  if (known) return known;
  const frameTarget = Math.max(1, Math.min(48, Number(state?.frameTarget) || Number(state?.frameCount) || 4));
  return {
    row: Number.isFinite(Number(state?.row)) ? Number(state.row) : 99,
    trigger: value || "custom",
    name: normalizeText(state?.name || "自定义动作"),
    frames: frameTarget,
    durations: desktopPetFillDurations(state?.durations, frameTarget),
    message: normalizeText(state?.message || ""),
    custom: true,
  };
}
function desktopPetFillDurations(durations, count) {
  const safeCount = Math.max(1, Math.min(48, Number(count) || 1));
  const list = Array.isArray(durations) ? durations.map((value) => Math.max(60, Number(value) || 140)).filter(Boolean) : [];
  const filled = list.slice(0, safeCount);
  while (filled.length < safeCount) filled.push(filled[filled.length - 1] || 140);
  return filled;
}
function desktopPetNormalizeSettings(settings) {
  return {
    scale: Math.max(60, Math.min(180, Number(settings?.scale) || 100)),
    sharpness: Math.max(1, Math.min(3, Number(settings?.sharpness) || 2)),
    speed: Math.max(50, Math.min(200, Number(settings?.speed) || 100)),
    vehicleScale: Math.max(40, Math.min(500, Number(settings?.vehicleScale) || 100)),
  };
}
function desktopPetSharpnessLabel(value) {
  const level = Math.max(1, Math.min(3, Number(value) || 2));
  return level === 1 ? "柔和" : level === 3 ? "最清晰" : "高清";
}
function normalizeDesktopPetChromaKey(chroma) {
  const color = normalizeText(chroma?.color || "#ffffff");
  return {
    enabled: Boolean(chroma?.enabled),
    color: /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : "#ffffff",
    tolerance: Math.max(0, Math.min(180, Number(chroma?.tolerance) || 42)),
  };
}
function normalizeDesktopPetActionSpeed(value) {
  return Math.max(25, Math.min(300, Number(value) || 100));
}
function normalizeDesktopPetRandomRate(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}
function normalizeDesktopPetDriveAnchors(anchors, count) {
  const total = Math.max(1, Math.min(48, Number(count) || 1));
  const source = Array.isArray(anchors) ? anchors : [];
  const output = [];
  for (let index = 0; index < total; index += 1) {
    const point = source[index] || {};
    output.push({
      x: Math.max(0, Math.min(100, Number(point.x) || 50)),
      y: Math.max(0, Math.min(100, Number(point.y) || 58)),
    });
  }
  return output;
}
function desktopPetTargetFrameCount(state) {
  const spec = desktopPetSpecForTrigger(state?.trigger, state);
  return Math.max(1, Math.min(48, Number(state?.frameTarget) || Number(state?.frameCount) || spec.frames || 1));
}
function desktopPetManualFrames(state) {
  return Array.isArray(state?.manualFrames) ? state.manualFrames.map((frame) => normalizeText(frame)).filter(Boolean).slice(0, 48) : [];
}
function desktopPetStateFramesForPlayback(state) {
  const target = desktopPetTargetFrameCount(state);
  const manual = desktopPetManualFrames(state);
  const generated = Array.isArray(state?.frames) ? state.frames.map((frame) => normalizeText(frame)).filter(Boolean) : [];
  if (state?.chromaKey?.enabled && generated.length) return generated.slice(0, target);
  if (manual.length) return manual.slice(0, target);
  if (generated.length) return generated.slice(0, target);
  const single = [state?.assembledImage, state?.image].map((src) => normalizeText(src)).find(Boolean);
  return single ? [single] : [];
}
function normalizeDesktopPetState(state) {
  const rawTrigger = normalizeText(state?.trigger || state?.kind || "idle");
  const spec = desktopPetSpecForTrigger(rawTrigger, state);
  const manualFrames = desktopPetManualFrames(state);
  const savedFrames = Array.isArray(state?.frames) ? state.frames.map((frame) => normalizeText(frame)).filter(Boolean).slice(0, 48) : [];
  const frameTarget = Math.max(1, Math.min(48, Number(state?.frameTarget) || manualFrames.length || savedFrames.length || spec.frames || 1));
  const durations = desktopPetFillDurations(state?.durations || spec.durations, frameTarget);
  return {
    id: normalizeText(state?.id || spec.trigger || crypto.randomUUID()),
    row: Number.isFinite(Number(state?.row)) ? Number(state.row) : spec.row,
    name: normalizeText(state?.name || spec.name),
    trigger: spec.trigger,
    image: normalizeText(state?.image || ""),
    message: normalizeText(state?.message || spec.message || ""),
    transparentImage: normalizeText(state?.transparentImage || ""),
    assembledImage: normalizeText(state?.assembledImage || ""),
    frames: savedFrames.slice(0, frameTarget),
    manualFrames,
    frameTarget,
    durations,
    frameCount: frameTarget,
    duration: Math.max(240, Number(state?.duration) || durations.reduce((sum, value) => sum + value, 0)),
    assembledAt: normalizeText(state?.assembledAt || ""),
    sourceKind: normalizeText(state?.sourceKind || (manualFrames.length ? "manual-sequence" : "material")),
    chromaKey: normalizeDesktopPetChromaKey(state?.chromaKey),
    speedPercent: normalizeDesktopPetActionSpeed(state?.speedPercent),
    randomRate: normalizeDesktopPetRandomRate(state?.randomRate),
    driveAnchors: normalizeDesktopPetDriveAnchors(state?.driveAnchors, frameTarget),
  };
}
function desktopPetDefaultStates() {
  return desktopPetActionSpecs().map((row) => normalizeDesktopPetState({
    id: row.trigger,
    row: row.row,
    name: row.name,
    trigger: row.trigger,
    message: row.message,
    durations: row.durations,
    frameTarget: row.frames,
    frameCount: row.frames,
    sourceKind: "material",
  }));
}
function normalizeDesktopPet(pet) {
  const incoming = Array.isArray(pet?.states) ? pet.states.map(normalizeDesktopPetState) : [];
  const byTrigger = new Map();
  incoming.forEach((state) => {
    if (!byTrigger.has(state.trigger)) byTrigger.set(state.trigger, state);
  });
  const baseStates = desktopPetActionSpecs().map((row) => {
    const existing = byTrigger.get(row.trigger);
    return normalizeDesktopPetState(existing || {
      id: row.trigger,
      row: row.row,
      name: row.name,
      trigger: row.trigger,
      message: row.message,
      durations: row.durations,
      frameTarget: row.frames,
      frameCount: row.frames,
    });
  });
  const customStates = incoming.filter((state) => !desktopPetActionSpecs().some((row) => row.trigger === state.trigger));
  const states = baseStates.concat(customStates);
  return {
    id: pet?.id || crypto.randomUUID(),
    name: normalizeText(pet?.name || "资料库桌宠"),
    persona: normalizeText(pet?.persona || "温柔、简洁，只根据当前资料库回答。"),
    assembledAt: normalizeText(pet?.assembledAt || ""),
    activeStateId: pet?.activeStateId || states[0]?.id || "",
    states,
    settings: desktopPetNormalizeSettings(pet?.settings),
    hatchPet: pet?.hatchPet && typeof pet.hatchPet === "object" ? pet.hatchPet : null,
    spritesheetImage: normalizeText(pet?.spritesheetImage || ""),
    petJson: pet?.petJson && typeof pet.petJson === "object" ? pet.petJson : null,
  };
}
function desktopPetFrameDuration(trigger) {
  const spec = desktopPetSpecForTrigger(trigger);
  return desktopPetFillDurations(spec.durations, spec.frames).reduce((sum, value) => sum + value, 0);
}
function updateDesktopPetSettingsUi(pet) {
  const settings = desktopPetNormalizeSettings(pet?.settings);
  const scale = $("desktopPetScale");
  const sharpness = $("desktopPetSharpness");
  const speed = $("desktopPetSpeed");
  const vehicleScale = $("desktopPetVehicleScale");
  if (scale) scale.value = String(settings.scale);
  if (sharpness) sharpness.value = String(settings.sharpness);
  if (speed) speed.value = String(settings.speed);
  if (vehicleScale) vehicleScale.value = String(settings.vehicleScale);
  if ($("desktopPetScaleValue")) $("desktopPetScaleValue").textContent = settings.scale + "%";
  if ($("desktopPetSharpnessValue")) $("desktopPetSharpnessValue").textContent = desktopPetSharpnessLabel(settings.sharpness);
  if ($("desktopPetSpeedValue")) $("desktopPetSpeedValue").textContent = settings.speed + "%";
  if ($("desktopPetVehicleScaleValue")) $("desktopPetVehicleScaleValue").textContent = settings.vehicleScale + "%";
}
function updateDesktopPetSettings() {
  const pet = activeDesktopPet();
  if (!pet) return;
  pet.settings = desktopPetNormalizeSettings({
    scale: $("desktopPetScale")?.value,
    sharpness: $("desktopPetSharpness")?.value,
    speed: $("desktopPetSpeed")?.value,
    vehicleScale: $("desktopPetVehicleScale")?.value,
  });
  saveDesktopPets();
  updateDesktopPetSettingsUi(pet);
}
function createDesktopPet() {
  if (isReadOnlyMode()) { showReadOnlyNotice(); return; }
  const pet = normalizeDesktopPet({ name: "资料库桌宠" });
  desktopPets.push(pet);
  activeDesktopPetId = pet.id;
  saveDesktopPets();
  renderDesktopPetManager();
  setDesktopPetStatus("已创建新桌宠。每个动作都可以上传多张序列帧，组装后会在桌面窗口播放。", "success");
}
function addDesktopPetAction() {
  const pet = activeDesktopPet();
  if (!pet) { createDesktopPet(); return; }
  const id = crypto.randomUUID();
  pet.states.push(normalizeDesktopPetState({
    id,
    row: 99,
    name: "自定义动作 " + (pet.states.length + 1),
    trigger: "custom-" + id.slice(0, 8),
    message: "",
    frameTarget: 4,
    durations: [140, 140, 140, 220],
    sourceKind: "manual-sequence",
  }));
  saveDesktopPets();
  renderDesktopPetManager();
  setDesktopPetStatus("已加入自定义动作。上传多张图片后可拖动缩略图调整顺序。", "success");
}
function deleteDesktopPetAction(stateId) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state) return;
  if (desktopPetActionSpecs().some((row) => row.trigger === state.trigger)) {
    state.image = "";
    resetDesktopPetAssemblyState(state, true);
  } else {
    pet.states = pet.states.filter((entry) => entry.id !== stateId);
  }
  saveDesktopPets();
  renderDesktopPetManager();
}
function desktopPetImagePreview(state) {
  const src = desktopPetStateFramesForPlayback(state)[0] || "";
  if (!src) return '<div class="desktop-pet-placeholder">上传序列帧<br/>或拖入图片</div>';
  return '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(state?.name || "桌宠动作") + '" />';
}
function desktopPetTriggerOptions(state) {
  const builtin = desktopPetActionSpecs().map((row) => '<option value="' + escapeHtml(row.trigger) + '"' + (state.trigger === row.trigger ? ' selected' : '') + '>' + escapeHtml(row.row + " · " + row.name) + '</option>').join("");
  if (desktopPetActionSpecs().some((row) => row.trigger === state.trigger)) return builtin;
  return builtin + '<option value="' + escapeHtml(state.trigger) + '" selected>' + escapeHtml("自定义 · " + state.trigger) + '</option>';
}
function desktopPetFrameStripHtml(state) {
  const manual = desktopPetManualFrames(state);
  const generated = Array.isArray(state.frames) ? state.frames.map((frame) => normalizeText(frame)).filter(Boolean) : [];
  const editable = manual.length > 0;
  const frames = editable ? manual : generated;
  if (!frames.length) return '<div class="desktop-pet-frame-strip empty" data-state-id="' + escapeHtml(state.id) + '">拖入或选择多张图片作为序列帧</div>';
  return '<div class="desktop-pet-frame-strip" data-state-id="' + escapeHtml(state.id) + '">' + frames.map((src, index) => (
    '<button type="button" class="desktop-pet-frame-thumb" draggable="' + (editable ? 'true' : 'false') + '" data-state-id="' + escapeHtml(state.id) + '" data-frame-index="' + index + '">' +
    '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(state.name + " frame " + (index + 1)) + '" />' +
    '<span class="desktop-pet-frame-index">' + (index + 1) + '</span>' +
    (editable ? '<span class="desktop-pet-remove-frame" data-state-id="' + escapeHtml(state.id) + '" data-frame-index="' + index + '">×</span>' : '') +
    '</button>'
  )).join("") + '</div>';
}
function desktopPetDriveAnchorPanelHtml(state) {
  if (state.trigger !== "drive-loop") return "";
  const target = desktopPetTargetFrameCount(state);
  const frames = desktopPetStateFramesForPlayback(state);
  const anchors = normalizeDesktopPetDriveAnchors(state.driveAnchors, target);
  const editorActive = activeDesktopPetDriveAnchorEditor?.stateId === state.id;
  const selectedIndex = editorActive ? Math.max(0, Math.min(target - 1, Number(activeDesktopPetDriveAnchorEditor?.frameIndex) || 0)) : 0;
  const selectedPoint = anchors[selectedIndex] || { x: 50, y: 58 };
  const selectedFrame = frames[selectedIndex] || frames[0] || "";
  const frameButtons = frames.length ? frames.map((src, index) => (
    '<button type="button" class="desktop-pet-drive-anchor-frame' + (index === selectedIndex ? ' active' : '') + '" data-state-id="' + escapeHtml(state.id) + '" data-frame-index="' + index + '">' +
    '<img src="' + escapeHtml(src) + '" alt="drive frame ' + (index + 1) + '" />' +
    '<span>' + (index + 1) + '</span>' +
    '</button>'
  )).join("") : '<span class="desktop-pet-drive-anchor-empty">请先上传开车序列帧。</span>';
  const editorHtml = editorActive ? (
    '<div class="desktop-pet-drive-anchor-editor">' +
    '<div class="desktop-pet-drive-anchor-frames">' + frameButtons + '</div>' +
    '<div class="desktop-pet-drive-anchor-stage" data-state-id="' + escapeHtml(state.id) + '" data-frame-index="' + selectedIndex + '">' +
    (selectedFrame ? '<img src="' + escapeHtml(selectedFrame) + '" alt="drive anchor editor" />' : '<div class="desktop-pet-drive-anchor-empty">没有可定位的帧。</div>') +
    '<span class="desktop-pet-drive-anchor-point" style="left:' + selectedPoint.x + '%;top:' + selectedPoint.y + '%"></span>' +
    '</div>' +
    '<div class="desktop-pet-drive-anchor-values">' +
    '<strong>第 ' + (selectedIndex + 1) + ' 帧</strong>' +
    '<label>X<input class="desktop-pet-drive-anchor-x" data-state-id="' + escapeHtml(state.id) + '" data-frame-index="' + selectedIndex + '" type="number" min="0" max="100" step="1" value="' + Math.round(selectedPoint.x) + '" /></label>' +
    '<label>Y<input class="desktop-pet-drive-anchor-y" data-state-id="' + escapeHtml(state.id) + '" data-frame-index="' + selectedIndex + '" type="number" min="0" max="100" step="1" value="' + Math.round(selectedPoint.y) + '" /></label>' +
    '</div>' +
    '</div>'
  ) : "";
  return '<div class="desktop-pet-drive-anchor-panel wide">' +
    '<div class="desktop-pet-drive-anchor-toolbar"><strong>车辆图中心点</strong><button type="button" class="desktop-pet-drive-anchor-open" data-state-id="' + escapeHtml(state.id) + '">' + (editorActive ? '追踪模式已开启' : '定点追踪模式') + '</button></div>' +
    '<span>开车序列帧按“向左”处理；组装时会自动镜像生成向右关键帧。追踪模式里拖动蓝点或输入 X/Y，可以定位每一帧赛车图中心。</span>' +
    editorHtml +
    '<div class="desktop-pet-drive-anchor-grid">' + anchors.map((point, index) => (
      '<div class="desktop-pet-drive-anchor-row">' +
      '<em>' + (index + 1) + '</em>' +
      '<label>X<input class="desktop-pet-drive-anchor-x" data-state-id="' + escapeHtml(state.id) + '" data-frame-index="' + index + '" type="number" min="0" max="100" step="1" value="' + Math.round(point.x) + '" /></label>' +
      '<label>Y<input class="desktop-pet-drive-anchor-y" data-state-id="' + escapeHtml(state.id) + '" data-frame-index="' + index + '" type="number" min="0" max="100" step="1" value="' + Math.round(point.y) + '" /></label>' +
      '<button type="button" class="desktop-pet-drive-anchor-pick" data-state-id="' + escapeHtml(state.id) + '" data-frame-index="' + index + '">定点</button>' +
      '</div>'
    )).join("") + '</div>' +
    '</div>';
}
function renderDesktopPetManager() {
  if (isReadOnlyMode()) return;
  const list = $("desktopPetList");
  const actions = $("desktopPetActions");
  if (!list || !actions) return;
  if (!desktopPets.length) createDesktopPet();
  const pet = activeDesktopPet();
  if ($("desktopPetName")) $("desktopPetName").value = pet?.name || "";
  if ($("desktopPetPersona")) $("desktopPetPersona").value = pet?.persona || "";
  updateDesktopPetSettingsUi(pet);
  list.innerHTML = desktopPets.map((entry) => {
    const normalized = normalizeDesktopPet(entry);
    const imageState = normalized.states.find((state) => desktopPetStateFramesForPlayback(state).length) || normalized.states[0] || {};
    const assembledCount = normalized.states.filter((state) => desktopPetStateFramesForPlayback(state).length >= 1).length;
    const atlasLabel = normalized.spritesheetImage ? " · atlas 已生成" : "";
    return '<button class="desktop-pet-card' + (entry.id === activeDesktopPetId ? ' active' : '') + '" data-pet-id="' + escapeHtml(entry.id) + '">' +
      '<span class="desktop-pet-card-art">' + desktopPetImagePreview(imageState) + '</span>' +
      '<strong>' + escapeHtml(normalized.name) + '</strong>' +
      '<small>' + assembledCount + '/' + normalized.states.length + ' 动作' + atlasLabel + '</small>' +
      '</button>';
  }).join("");
  if (!pet) { actions.innerHTML = '<p class="desc">还没有桌宠。</p>'; return; }
  actions.innerHTML = pet.states.map((state) => {
    const isActive = state.id === pet.activeStateId;
    const playbackFrames = desktopPetStateFramesForPlayback(state);
    const manualCount = desktopPetManualFrames(state).length;
    const target = desktopPetTargetFrameCount(state);
    const badgeClass = playbackFrames.length >= target ? "" : (playbackFrames.length ? " muted" : " warning");
    const badgeText = playbackFrames.length ? "序列帧 " + playbackFrames.length + "/" + target : "待上传序列帧";
    const sourceText = manualCount ? "手动序列帧" : (state.sourceKind === "generated-sequence" ? "自动生成" : (state.sourceKind === "row-strip" ? "动作条" : "单图/待生成"));
    const chroma = normalizeDesktopPetChromaKey(state.chromaKey);
    const speedPercent = normalizeDesktopPetActionSpeed(state.speedPercent);
    const randomRate = normalizeDesktopPetRandomRate(state.randomRate);
    return '<article class="desktop-pet-action' + (isActive ? ' active' : '') + '" data-state-id="' + escapeHtml(state.id) + '">' +
      '<div class="desktop-pet-drop-wrap">' +
      '<button type="button" class="desktop-pet-drop" data-pet-upload="' + escapeHtml(state.id) + '">' + desktopPetImagePreview(state) + '</button>' +
      '<span class="desktop-pet-frame-badge' + badgeClass + '">' + escapeHtml(badgeText) + '</span>' +
      '</div>' +
      '<div class="desktop-pet-action-fields">' +
      '<label>动作名<input class="desktop-pet-state-name" data-state-id="' + escapeHtml(state.id) + '" value="' + escapeHtml(state.name) + '" /></label>' +
      '<label>触发方式<select class="desktop-pet-state-trigger" data-state-id="' + escapeHtml(state.id) + '">' + desktopPetTriggerOptions(state) + '</select></label>' +
      '<label class="wide">互动台词<input class="desktop-pet-state-message" data-state-id="' + escapeHtml(state.id) + '" value="' + escapeHtml(state.message) + '" placeholder="触发这个动作时说什么" /></label>' +
      '<div class="desktop-pet-frame-control wide">' +
      '<label>帧数<input class="desktop-pet-frame-target" data-state-id="' + escapeHtml(state.id) + '" type="number" min="1" max="48" value="' + target + '" /></label>' +
      desktopPetFrameStripHtml(state) +
      '</div>' +
      desktopPetDriveAnchorPanelHtml(state) +
      '<div class="desktop-pet-motion-panel wide">' +
      '<label>动作速率 <span>' + speedPercent + '%</span><input class="desktop-pet-state-speed" data-state-id="' + escapeHtml(state.id) + '" type="range" min="25" max="300" step="5" value="' + speedPercent + '" /></label>' +
      '<label>待机随机率 <span>' + randomRate + '</span><input class="desktop-pet-random-rate" data-state-id="' + escapeHtml(state.id) + '" type="range" min="0" max="100" step="1" value="' + randomRate + '" /></label>' +
      '</div>' +
      '<div class="desktop-pet-chroma-panel wide' + (chroma.enabled ? ' enabled' : '') + '">' +
      '<label class="desktop-pet-chroma-toggle"><input class="desktop-pet-chroma-enabled" data-state-id="' + escapeHtml(state.id) + '" type="checkbox"' + (chroma.enabled ? ' checked' : '') + ' />色度抠图</label>' +
      '<label>目标色<input class="desktop-pet-chroma-color" data-state-id="' + escapeHtml(state.id) + '" type="color" value="' + escapeHtml(chroma.color) + '" /></label>' +
      '<button type="button" class="desktop-pet-chroma-pick" data-state-id="' + escapeHtml(state.id) + '">吸管取色</button>' +
      '<label class="desktop-pet-chroma-range">容差 <span>' + chroma.tolerance + '</span><input class="desktop-pet-chroma-tolerance" data-state-id="' + escapeHtml(state.id) + '" type="range" min="0" max="180" value="' + chroma.tolerance + '" /></label>' +
      '</div>' +
      '<p class="desktop-pet-contract-note">' + escapeHtml(sourceText) + ' · 拖动缩略图调整顺序；桌宠会按从左到右播放。上传透明 PNG 会原样保存，缺失动作会在组装时自动生成。</p>' +
      '</div>' +
      '<div class="desktop-pet-action-buttons">' +
      '<button class="desktop-pet-set-active" data-state-id="' + escapeHtml(state.id) + '">' + (isActive ? '默认状态' : '设为默认') + '</button>' +
      '<button class="desktop-pet-pick-image" data-state-id="' + escapeHtml(state.id) + '">上传序列帧</button>' +
      '<button class="desktop-pet-remove-action" data-state-id="' + escapeHtml(state.id) + '">' + (desktopPetActionSpecs().some((row) => row.trigger === state.trigger) ? '清空' : '删除') + '</button>' +
      '</div>' +
      '</article>';
  }).join("");
}
function resetDesktopPetAssemblyState(state, clearManual = false) {
  state.transparentImage = "";
  state.assembledImage = "";
  state.frames = clearManual || state?.chromaKey?.enabled ? [] : desktopPetStateFramesForPlayback(state);
  state.assembledAt = "";
  if (clearManual) {
    state.manualFrames = [];
    state.frameTarget = desktopPetSpecForTrigger(state.trigger, state).frames;
    state.sourceKind = "material";
  }
}
function updateDesktopPetState(stateId, patch) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state) return;
  if (patch.trigger && patch.trigger !== state.trigger) {
    const spec = desktopPetSpecForTrigger(patch.trigger, state);
    patch.trigger = spec.trigger;
    patch.row = spec.row;
    patch.frameCount = desktopPetTargetFrameCount({ ...state, ...patch });
    patch.durations = desktopPetFillDurations(state.durations || spec.durations, patch.frameCount);
    patch.duration = patch.durations.reduce((sum, value) => sum + value, 0);
    resetDesktopPetAssemblyState(state, false);
  }
  Object.assign(state, patch);
  saveDesktopPets();
}
function markDesktopPetChromaDirty(state) {
  state.frames = [];
  state.transparentImage = "";
  state.assembledImage = "";
  state.assembledAt = "";
}
function updateDesktopPetChromaKey(stateId, patch, shouldRender = false) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state) return;
  state.chromaKey = normalizeDesktopPetChromaKey({ ...(state.chromaKey || {}), ...patch });
  markDesktopPetChromaDirty(state);
  saveDesktopPets();
  if (shouldRender) renderDesktopPetManager();
}
function desktopPetHexToRgb(hex) {
  const match = normalizeText(hex).match(/^#?([0-9a-f]{6})$/i);
  if (!match) return { r: 255, g: 255, b: 255 };
  const value = Number.parseInt(match[1], 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}
async function applyDesktopPetChromaKey(src, chromaInput) {
  const chroma = normalizeDesktopPetChromaKey(chromaInput);
  if (!chroma.enabled || !src) return src;
  const image = await loadDesktopPetImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const target = desktopPetHexToRgb(chroma.color);
  const tolerance = Math.max(0, Math.min(180, Number(chroma.tolerance) || 0));
  const feather = Math.max(8, tolerance * 0.35);
  for (let index = 0; index < data.length; index += 4) {
    const dr = data[index] - target.r;
    const dg = data[index + 1] - target.g;
    const db = data[index + 2] - target.b;
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);
    if (distance <= tolerance) data[index + 3] = 0;
    else if (distance <= tolerance + feather) data[index + 3] = Math.round(data[index + 3] * ((distance - tolerance) / feather));
  }
  context.putImageData(imageData, 0, 0);
  return canvasToDataUrl(canvas, "image/png");
}
async function applyDesktopPetChromaKeyFrames(frames, state) {
  const chroma = normalizeDesktopPetChromaKey(state?.chromaKey);
  if (!chroma.enabled) return frames;
  const output = [];
  for (const frame of frames) output.push(await applyDesktopPetChromaKey(frame, chroma));
  return output;
}
async function mirrorDesktopPetFrame(src) {
  const image = await loadDesktopPetImage(src);
  const width = Math.max(1, image.naturalWidth || image.width || 192);
  const height = Math.max(1, image.naturalHeight || image.height || 208);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, width, height);
  context.translate(width, 0);
  context.scale(-1, 1);
  context.drawImage(image, 0, 0, width, height);
  return canvasToDataUrl(canvas, "image/png");
}
async function mirrorDesktopPetFrames(frames) {
  const output = [];
  for (const frame of frames) output.push(await mirrorDesktopPetFrame(frame));
  return output;
}
function mirrorDesktopPetDriveAnchors(anchors, count) {
  return normalizeDesktopPetDriveAnchors(anchors, count).map((point) => ({
    x: Math.max(0, Math.min(100, 100 - Number(point.x || 50))),
    y: Math.max(0, Math.min(100, Number(point.y || 58))),
  }));
}
function syncDesktopPetManualFrames(state) {
  const frames = desktopPetManualFrames(state);
  state.manualFrames = frames;
  state.frameTarget = Math.max(1, Math.min(48, Number(state.frameTarget) || frames.length || desktopPetSpecForTrigger(state.trigger, state).frames));
  const chromaEnabled = normalizeDesktopPetChromaKey(state.chromaKey).enabled;
  state.frames = chromaEnabled ? [] : frames.slice(0, state.frameTarget);
  state.assembledImage = chromaEnabled ? "" : (state.frames[0] || "");
  state.transparentImage = chromaEnabled ? "" : (state.frames[0] || "");
  state.image = frames[0] || "";
  state.sourceKind = frames.length ? "manual-sequence" : "material";
  state.frameCount = state.frameTarget;
  state.durations = desktopPetFillDurations(state.durations, state.frameTarget);
  state.duration = state.durations.reduce((sum, value) => sum + value, 0);
  state.assembledAt = new Date().toISOString();
}
function updateDesktopPetFrameTarget(stateId, value, shouldRender = true) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state) return;
  state.frameTarget = Math.max(1, Math.min(48, Number(value) || 1));
  state.frameCount = state.frameTarget;
  state.durations = desktopPetFillDurations(state.durations, state.frameTarget);
  state.driveAnchors = normalizeDesktopPetDriveAnchors(state.driveAnchors, state.frameTarget);
  state.frames = normalizeDesktopPetChromaKey(state.chromaKey).enabled ? [] : desktopPetStateFramesForPlayback(state).slice(0, state.frameTarget);
  saveDesktopPets();
  if (shouldRender) renderDesktopPetManager();
}
function updateDesktopPetDriveAnchor(stateId, frameIndex, patch, shouldRender = false) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  const index = Number(frameIndex);
  if (!state || !Number.isFinite(index)) return;
  state.driveAnchors = normalizeDesktopPetDriveAnchors(state.driveAnchors, desktopPetTargetFrameCount(state));
  if (!state.driveAnchors[index]) return;
  state.driveAnchors[index] = {
    x: Math.max(0, Math.min(100, Number(patch.x ?? state.driveAnchors[index].x) || 0)),
    y: Math.max(0, Math.min(100, Number(patch.y ?? state.driveAnchors[index].y) || 0)),
  };
  saveDesktopPets();
  if (shouldRender) renderDesktopPetManager();
}
function removeDesktopPetFrame(stateId, frameIndex) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  const index = Number(frameIndex);
  if (!state || !Number.isFinite(index)) return;
  state.manualFrames = desktopPetManualFrames(state);
  if (index < 0 || index >= state.manualFrames.length) return;
  state.manualFrames.splice(index, 1);
  syncDesktopPetManualFrames(state);
  saveDesktopPets();
  renderDesktopPetManager();
}
function moveDesktopPetFrame(stateId, fromIndex, toIndex) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  const from = Number(fromIndex);
  let to = Number(toIndex);
  if (!state || !Number.isFinite(from) || !Number.isFinite(to)) return;
  state.manualFrames = desktopPetManualFrames(state);
  if (from < 0 || from >= state.manualFrames.length) return;
  to = Math.max(0, Math.min(state.manualFrames.length - 1, to));
  if (from === to) return;
  const frame = state.manualFrames.splice(from, 1)[0];
  state.manualFrames.splice(to, 0, frame);
  syncDesktopPetManualFrames(state);
  saveDesktopPets();
  renderDesktopPetManager();
}
async function uploadDesktopPetImage(filesOrFile, stateId) {
  if (isReadOnlyMode()) { showReadOnlyNotice(); return; }
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state || !filesOrFile) return;
  const files = Array.isArray(filesOrFile) ? filesOrFile : (typeof filesOrFile.length === "number" && !filesOrFile.name ? Array.from(filesOrFile) : [filesOrFile]);
  const images = files.filter((file) => file && (!file.type || file.type.startsWith("image/"))).slice(0, 48);
  if (!images.length) return;
  setDesktopPetStatus("正在保存 " + images.length + " 张序列帧...");
  try {
    state.manualFrames = desktopPetManualFrames(state);
    for (const file of images) {
      const dataUrl = await readFileAsDataUrl(file);
      const imageSrc = await persistUploadedUiImage(dataUrl, "desktop-pet");
      state.manualFrames.push(imageSrc);
    }
    state.frameTarget = state.manualFrames.length;
    syncDesktopPetManualFrames(state);
    pet.activeStateId = state.id;
    saveDesktopPets();
    renderDesktopPetManager();
    setDesktopPetStatus("已加入 " + state.name + " 的 " + images.length + " 张序列帧。按住缩略图可以调整顺序。", "success");
  } catch (error) {
    setDesktopPetStatus("图片保存失败：" + error.message, "error");
  }
}
async function assembleDesktopPet() {
  const pet = activeDesktopPet();
  if (!pet) { createDesktopPet(); return; }
  const normalized = normalizeDesktopPet(pet);
  pet.states = normalized.states;
  pet.settings = normalized.settings;
  const sourceState = pet.states.find((state) => state.trigger !== "petting-hand" && (desktopPetManualFrames(state).length || desktopPetStateFramesForPlayback(state).length || state.image));
  if (!sourceState) {
    setDesktopPetStatus("请先至少给一个动作上传图片或序列帧。", "error");
    return;
  }
  const steps = pet.states.flatMap((state) => [
    state.name + "：准备素材",
    state.name + "：整理序列帧",
    state.name + "：写入动作",
  ]).concat(["合成 hatch-pet 图集", "写入 pet.json"]);
  let stepIndex = 0;
  const frameMap = new Map();
  setDesktopPetStatus("正在组装桌宠序列帧...");
  setDesktopPetAssemblyProgress(steps, stepIndex);
  try {
    for (const state of pet.states) {
      const spec = desktopPetSpecForTrigger(state.trigger, state);
      setDesktopPetAssemblyProgress(steps, stepIndex);
      const manualFrames = desktopPetManualFrames(state);
      let frameDataUrls = [];
      if (manualFrames.length) {
        frameDataUrls = manualFrames.slice(0, desktopPetTargetFrameCount(state));
        if (normalizeDesktopPetChromaKey(state.chromaKey).enabled) {
          const keyedFrames = await applyDesktopPetChromaKeyFrames(frameDataUrls, state);
          const savedKeyedFrames = [];
          for (const frameDataUrl of keyedFrames) savedKeyedFrames.push(await persistUploadedUiImage(frameDataUrl, "desktop-pet"));
          frameDataUrls = savedKeyedFrames;
        }
        stepIndex += 2;
        setDesktopPetAssemblyProgress(steps, stepIndex);
      } else if (state.trigger === "petting-hand") {
        frameDataUrls = [];
        stepIndex += 2;
        setDesktopPetAssemblyProgress(steps, stepIndex);
      } else {
        const sourceFrame = state.image || desktopPetStateFramesForPlayback(state)[0] || desktopPetStateFramesForPlayback(sourceState)[0] || sourceState.image || "";
        if (sourceFrame) {
          frameDataUrls = await buildHatchPetFramesFromMaterial(sourceFrame, state);
          frameDataUrls = await applyDesktopPetChromaKeyFrames(frameDataUrls, state);
          stepIndex += 1;
          setDesktopPetAssemblyProgress(steps, stepIndex);
          const savedFrames = [];
          for (const frameDataUrl of frameDataUrls) {
            savedFrames.push(await persistUploadedUiImage(frameDataUrl, "desktop-pet"));
          }
          frameDataUrls = savedFrames;
          stepIndex += 1;
        } else {
          frameDataUrls = [];
          stepIndex += 2;
        }
        setDesktopPetAssemblyProgress(steps, stepIndex);
      }
      const target = desktopPetTargetFrameCount(state);
      state.frames = frameDataUrls.slice(0, target);
      state.assembledImage = state.frames[0] || state.image || "";
      state.durations = desktopPetFillDurations(spec.durations || state.durations, Math.max(1, state.frames.length || target));
      state.duration = state.durations.reduce((sum, value) => sum + value, 0);
      state.frameCount = target;
      state.row = spec.row;
      state.assembledAt = new Date().toISOString();
      state.sourceKind = manualFrames.length ? "manual-sequence" : (state.frames.length ? "generated-sequence" : "material");
      if (spec.row >= 0 && spec.row < 9 && state.frames.length) frameMap.set(spec.trigger, state.frames);
      stepIndex += 1;
    }
    const driveLeft = pet.states.find((state) => state.trigger === "drive-loop");
    const driveRight = pet.states.find((state) => state.trigger === "drive-loop-right");
    if (driveLeft && driveRight && !desktopPetManualFrames(driveRight).length) {
      const leftFrames = desktopPetStateFramesForPlayback(driveLeft);
      if (leftFrames.length) {
        const target = desktopPetTargetFrameCount(driveRight);
        const mirroredFrames = (await mirrorDesktopPetFrames(leftFrames)).slice(0, target);
        const savedFrames = [];
        for (const frameDataUrl of mirroredFrames) {
          savedFrames.push(await persistUploadedUiImage(frameDataUrl, "desktop-pet"));
        }
        driveRight.frames = savedFrames;
        driveRight.assembledImage = savedFrames[0] || "";
        driveRight.transparentImage = savedFrames[0] || "";
        driveRight.driveAnchors = mirrorDesktopPetDriveAnchors(driveLeft.driveAnchors, target);
        driveRight.durations = desktopPetFillDurations(driveLeft.durations || driveRight.durations, target);
        driveRight.duration = driveRight.durations.reduce((sum, value) => sum + value, 0);
        driveRight.frameCount = target;
        driveRight.assembledAt = new Date().toISOString();
        driveRight.sourceKind = "mirrored-sequence";
      }
    }
    setDesktopPetAssemblyProgress(steps, stepIndex);
    const atlasDataUrl = await composeHatchPetAtlas(frameMap);
    pet.spritesheetImage = await persistUploadedUiImage(atlasDataUrl, "desktop-pet");
    pet.hatchPet = { version: "hatch-pet-contract-v1", cellWidth: 192, cellHeight: 208, columns: 8, rows: 9, atlasWidth: 1536, atlasHeight: 1872, states: hatchPetRows() };
    stepIndex += 1;
    setDesktopPetAssemblyProgress(steps, stepIndex);
    const petId = (pet.name || "desktop-pet").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "") || pet.id;
    pet.petJson = {
      id: petId,
      displayName: pet.name || "资料库桌宠",
      description: pet.persona || "基于当前资料库回答问题的桌宠。",
      spritesheetPath: pet.spritesheetImage || "spritesheet.webp",
    };
    pet.assembledAt = new Date().toISOString();
    setDesktopPetAssemblyProgress(steps, steps.length - 1);
    saveDesktopPets();
    renderDesktopPetManager();
    setDesktopPetStatus("组装完成。手动序列帧会按你设置的顺序播放，上下拖动和摸摸状态已写入桌宠。", "success");
  } catch (error) {
    setDesktopPetStatus("组装失败：" + error.message, "error");
  }
}
async function pickDesktopPetChromaColor(stateId) {
  const pet = activeDesktopPet();
  const state = pet?.states.find((entry) => entry.id === stateId);
  if (!state) return;
  pendingDesktopPetChromaPickStateId = stateId;
  updateDesktopPetChromaKey(stateId, { enabled: true }, true);
  setDesktopPetStatus("已进入吸管取色：请直接点击该动作的大图或缩略图取背景色。", "success");
}
function desktopPetRgbToHex(r, g, b) {
  return "#" + [r, g, b].map((value) => Math.max(0, Math.min(255, Number(value) || 0)).toString(16).padStart(2, "0")).join("");
}
async function sampleDesktopPetChromaColorFromEvent(event) {
  if (!pendingDesktopPetChromaPickStateId) return false;
  const imageNode = event.target.closest?.(".desktop-pet-drop img, .desktop-pet-frame-thumb img");
  if (!imageNode) return false;
  event.preventDefault();
  event.stopPropagation();
  const stateId = pendingDesktopPetChromaPickStateId;
  pendingDesktopPetChromaPickStateId = "";
  try {
    const image = await loadDesktopPetImage(imageNode.currentSrc || imageNode.src);
    const rect = imageNode.getBoundingClientRect();
    const naturalWidth = image.naturalWidth || image.width || 1;
    const naturalHeight = image.naturalHeight || image.height || 1;
    const x = Math.max(0, Math.min(naturalWidth - 1, Math.floor(((event.clientX - rect.left) / Math.max(1, rect.width)) * naturalWidth)));
    const y = Math.max(0, Math.min(naturalHeight - 1, Math.floor(((event.clientY - rect.top) / Math.max(1, rect.height)) * naturalHeight)));
    const canvas = document.createElement("canvas");
    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const data = context.getImageData(x, y, 1, 1).data;
    const color = desktopPetRgbToHex(data[0], data[1], data[2]);
    updateDesktopPetChromaKey(stateId, { enabled: true, color }, true);
    setDesktopPetStatus("已取色 " + color + "，点击“组装桌宠”后会用这个颜色重新生成扣图帧。", "success");
  } catch (error) {
    setDesktopPetStatus("吸管取色失败：" + error.message, "error");
  }
  return true;
}
function sampleDesktopPetDriveAnchorFromEvent(event) {
  if (!pendingDesktopPetDriveAnchorPick) return false;
  const thumb = event.target.closest?.(".desktop-pet-frame-thumb");
  const imageNode = event.target.closest?.(".desktop-pet-frame-thumb img");
  if (!thumb || !imageNode) return false;
  const stateId = pendingDesktopPetDriveAnchorPick.stateId;
  const frameIndex = Number(pendingDesktopPetDriveAnchorPick.frameIndex);
  if (thumb.dataset.stateId !== stateId || Number(thumb.dataset.frameIndex) !== frameIndex) return false;
  event.preventDefault();
  event.stopPropagation();
  pendingDesktopPetDriveAnchorPick = null;
  const rect = imageNode.getBoundingClientRect();
  const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100));
  const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100));
  updateDesktopPetDriveAnchor(stateId, frameIndex, { x, y }, true);
  setDesktopPetStatus("已记录第 " + (frameIndex + 1) + " 帧车辆图中心点：" + Math.round(x) + "%, " + Math.round(y) + "%。", "success");
  return true;
}
function syncDesktopPetDriveAnchorEditorDom(root, frameIndex, point) {
  const panel = root?.closest?.(".desktop-pet-drive-anchor-panel") || root;
  if (!panel) return;
  const pointNode = panel.querySelector(".desktop-pet-drive-anchor-point");
  if (pointNode) {
    pointNode.style.left = point.x + "%";
    pointNode.style.top = point.y + "%";
  }
  panel.querySelectorAll(".desktop-pet-drive-anchor-x").forEach((input) => {
    if (Number(input.dataset.frameIndex) === Number(frameIndex)) input.value = String(Math.round(point.x));
  });
  panel.querySelectorAll(".desktop-pet-drive-anchor-y").forEach((input) => {
    if (Number(input.dataset.frameIndex) === Number(frameIndex)) input.value = String(Math.round(point.y));
  });
}
function updateDesktopPetDriveAnchorFromStage(stage, event) {
  if (!stage) return false;
  const rect = stage.getBoundingClientRect();
  const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100));
  const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100));
  const frameIndex = Number(stage.dataset.frameIndex);
  activeDesktopPetDriveAnchorEditor = { stateId: stage.dataset.stateId, frameIndex };
  updateDesktopPetDriveAnchor(stage.dataset.stateId, frameIndex, { x, y }, false);
  syncDesktopPetDriveAnchorEditorDom(stage, frameIndex, { x, y });
  return true;
}
function syncDesktopPetDriveAnchorInput(input) {
  const panel = input?.closest?.(".desktop-pet-drive-anchor-panel");
  if (!panel) return;
  const frameIndex = Number(input.dataset.frameIndex);
  const xInput = Array.from(panel.querySelectorAll(".desktop-pet-drive-anchor-x")).find((entry) => Number(entry.dataset.frameIndex) === frameIndex);
  const yInput = Array.from(panel.querySelectorAll(".desktop-pet-drive-anchor-y")).find((entry) => Number(entry.dataset.frameIndex) === frameIndex);
  if (!xInput || !yInput) return;
  syncDesktopPetDriveAnchorEditorDom(panel, frameIndex, {
    x: Math.max(0, Math.min(100, Number(xInput.value) || 50)),
    y: Math.max(0, Math.min(100, Number(yInput.value) || 58)),
  });
}
var desktopPetFrameDrag = null;
if ($("createDesktopPet")) $("createDesktopPet").addEventListener("click", createDesktopPet);
if ($("openDesktopPet")) $("openDesktopPet").addEventListener("click", openDesktopPetWindow);
if ($("assembleDesktopPet")) $("assembleDesktopPet").addEventListener("click", assembleDesktopPet);
if ($("addDesktopPetAction")) $("addDesktopPetAction").addEventListener("click", addDesktopPetAction);
if ($("desktopPetName")) $("desktopPetName").addEventListener("change", updateDesktopPetForm);
if ($("desktopPetPersona")) $("desktopPetPersona").addEventListener("change", updateDesktopPetForm);
if ($("desktopPetList")) $("desktopPetList").addEventListener("click", (event) => {
  const card = event.target.closest(".desktop-pet-card");
  if (!card) return;
  activeDesktopPetId = card.dataset.petId;
  saveDesktopPets();
  renderDesktopPetManager();
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("click", (event) => {
  if (sampleDesktopPetDriveAnchorFromEvent(event)) return;
  if (pendingDesktopPetChromaPickStateId && event.target.closest?.(".desktop-pet-drop img, .desktop-pet-frame-thumb img")) {
    sampleDesktopPetChromaColorFromEvent(event);
    return;
  }
  const anchorOpen = event.target.closest(".desktop-pet-drive-anchor-open");
  if (anchorOpen) {
    activeDesktopPetDriveAnchorEditor = { stateId: anchorOpen.dataset.stateId, frameIndex: 0 };
    renderDesktopPetManager();
    return;
  }
  const anchorFrame = event.target.closest(".desktop-pet-drive-anchor-frame");
  if (anchorFrame) {
    activeDesktopPetDriveAnchorEditor = { stateId: anchorFrame.dataset.stateId, frameIndex: Number(anchorFrame.dataset.frameIndex) || 0 };
    renderDesktopPetManager();
    return;
  }
  const anchorPick = event.target.closest(".desktop-pet-drive-anchor-pick");
  if (anchorPick) {
    pendingDesktopPetDriveAnchorPick = { stateId: anchorPick.dataset.stateId, frameIndex: Number(anchorPick.dataset.frameIndex) };
    setDesktopPetStatus("请点击“开车”动作第 " + (Number(anchorPick.dataset.frameIndex) + 1) + " 帧缩略图，记录车辆图中心点。", "success");
    return;
  }
  const chromaPick = event.target.closest(".desktop-pet-chroma-pick");
  if (chromaPick) { pickDesktopPetChromaColor(chromaPick.dataset.stateId); return; }
  const pick = event.target.closest(".desktop-pet-pick-image, .desktop-pet-drop");
  if (pick) { pendingDesktopPetStateId = pick.dataset.stateId || pick.dataset.petUpload || ""; $("desktopPetImageInput")?.click(); return; }
  const setActive = event.target.closest(".desktop-pet-set-active");
  if (setActive) { const pet = activeDesktopPet(); if (pet) { pet.activeStateId = setActive.dataset.stateId; saveDesktopPets(); renderDesktopPetManager(); } return; }
  const remove = event.target.closest(".desktop-pet-remove-action");
  if (remove) { deleteDesktopPetAction(remove.dataset.stateId); return; }
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("input", (event) => {
  const stateId = event.target.dataset.stateId;
  if (!stateId) return;
  if (event.target.classList.contains("desktop-pet-frame-target")) { updateDesktopPetFrameTarget(stateId, event.target.value, false); return; }
  if (event.target.classList.contains("desktop-pet-state-speed")) {
    const state = activeDesktopPet()?.states.find((entry) => entry.id === stateId);
    if (state) {
      state.speedPercent = normalizeDesktopPetActionSpeed(event.target.value);
      const label = event.target.closest("label")?.querySelector("span");
      if (label) label.textContent = state.speedPercent + "%";
      saveDesktopPets();
    }
    return;
  }
  if (event.target.classList.contains("desktop-pet-random-rate")) {
    const state = activeDesktopPet()?.states.find((entry) => entry.id === stateId);
    if (state) {
      state.randomRate = normalizeDesktopPetRandomRate(event.target.value);
      const label = event.target.closest("label")?.querySelector("span");
      if (label) label.textContent = state.randomRate;
      saveDesktopPets();
    }
    return;
  }
  if (event.target.classList.contains("desktop-pet-drive-anchor-x")) {
    updateDesktopPetDriveAnchor(stateId, event.target.dataset.frameIndex, { x: event.target.value }, false);
    syncDesktopPetDriveAnchorInput(event.target);
    return;
  }
  if (event.target.classList.contains("desktop-pet-drive-anchor-y")) {
    updateDesktopPetDriveAnchor(stateId, event.target.dataset.frameIndex, { y: event.target.value }, false);
    syncDesktopPetDriveAnchorInput(event.target);
    return;
  }
  if (event.target.classList.contains("desktop-pet-chroma-color")) { updateDesktopPetChromaKey(stateId, { color: event.target.value, enabled: true }, false); return; }
  if (event.target.classList.contains("desktop-pet-chroma-tolerance")) {
    const label = event.target.closest(".desktop-pet-chroma-range")?.querySelector("span");
    if (label) label.textContent = event.target.value;
    updateDesktopPetChromaKey(stateId, { tolerance: event.target.value }, false);
    return;
  }
  if (event.target.classList.contains("desktop-pet-state-name")) updateDesktopPetState(stateId, { name: normalizeText(event.target.value) || "未命名动作" });
  if (event.target.classList.contains("desktop-pet-state-message")) updateDesktopPetState(stateId, { message: normalizeText(event.target.value) });
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("change", (event) => {
  if (event.target.classList.contains("desktop-pet-state-trigger")) { updateDesktopPetState(event.target.dataset.stateId, { trigger: event.target.value }); renderDesktopPetManager(); }
  if (event.target.classList.contains("desktop-pet-frame-target")) { updateDesktopPetFrameTarget(event.target.dataset.stateId, event.target.value, true); }
  if (event.target.classList.contains("desktop-pet-state-speed")) { updateDesktopPetState(event.target.dataset.stateId, { speedPercent: normalizeDesktopPetActionSpeed(event.target.value) }); }
  if (event.target.classList.contains("desktop-pet-random-rate")) { updateDesktopPetState(event.target.dataset.stateId, { randomRate: normalizeDesktopPetRandomRate(event.target.value) }); }
  if (event.target.classList.contains("desktop-pet-chroma-enabled")) { updateDesktopPetChromaKey(event.target.dataset.stateId, { enabled: event.target.checked }, true); }
  if (event.target.classList.contains("desktop-pet-chroma-color")) { updateDesktopPetChromaKey(event.target.dataset.stateId, { color: event.target.value, enabled: true }, true); }
  if (event.target.classList.contains("desktop-pet-chroma-tolerance")) { updateDesktopPetChromaKey(event.target.dataset.stateId, { tolerance: event.target.value }, true); }
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("pointerdown", (event) => {
  const stage = event.target.closest(".desktop-pet-drive-anchor-stage");
  if (!stage) return;
  event.preventDefault();
  desktopPetDriveAnchorDrag = {
    stage,
    pointerId: event.pointerId,
    stateId: stage.dataset.stateId,
    frameIndex: Number(stage.dataset.frameIndex) || 0,
  };
  stage.setPointerCapture?.(event.pointerId);
  updateDesktopPetDriveAnchorFromStage(stage, event);
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("pointermove", (event) => {
  if (!desktopPetDriveAnchorDrag || desktopPetDriveAnchorDrag.pointerId !== event.pointerId) return;
  event.preventDefault();
  updateDesktopPetDriveAnchorFromStage(desktopPetDriveAnchorDrag.stage, event);
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("pointerup", (event) => {
  if (!desktopPetDriveAnchorDrag || desktopPetDriveAnchorDrag.pointerId !== event.pointerId) return;
  desktopPetDriveAnchorDrag.stage?.releasePointerCapture?.(event.pointerId);
  desktopPetDriveAnchorDrag = null;
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("pointercancel", (event) => {
  if (!desktopPetDriveAnchorDrag || desktopPetDriveAnchorDrag.pointerId !== event.pointerId) return;
  desktopPetDriveAnchorDrag = null;
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("dragover", (event) => {
  const drop = event.target.closest(".desktop-pet-drop");
  if (!drop) return;
  event.preventDefault();
  drop.classList.add("dragging");
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("dragleave", (event) => {
  const drop = event.target.closest(".desktop-pet-drop");
  if (drop) drop.classList.remove("dragging");
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("drop", (event) => {
  const drop = event.target.closest(".desktop-pet-drop");
  if (!drop) return;
  event.preventDefault();
  drop.classList.remove("dragging");
  const files = Array.from(event.dataTransfer?.files || []);
  uploadDesktopPetImage(files, drop.dataset.petUpload);
});
if ($("desktopPetImageInput")) $("desktopPetImageInput").addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []);
  uploadDesktopPetImage(files, pendingDesktopPetStateId);
  event.target.value = "";
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("click", (event) => {
  const removeFrame = event.target.closest(".desktop-pet-remove-frame");
  if (removeFrame) {
    event.preventDefault();
    event.stopPropagation();
    removeDesktopPetFrame(removeFrame.dataset.stateId, removeFrame.dataset.frameIndex);
  }
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("dragstart", (event) => {
  const thumb = event.target.closest(".desktop-pet-frame-thumb");
  if (!thumb || thumb.getAttribute("draggable") !== "true") return;
  desktopPetFrameDrag = { stateId: thumb.dataset.stateId, frameIndex: Number(thumb.dataset.frameIndex) };
  thumb.classList.add("dragging");
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(desktopPetFrameDrag));
  }
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("dragend", (event) => {
  const thumb = event.target.closest(".desktop-pet-frame-thumb");
  if (thumb) thumb.classList.remove("dragging");
  document.querySelectorAll(".desktop-pet-frame-strip.drag-target").forEach((node) => node.classList.remove("drag-target"));
  desktopPetFrameDrag = null;
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("dragover", (event) => {
  const strip = event.target.closest(".desktop-pet-frame-strip");
  if (!strip || !desktopPetFrameDrag) return;
  event.preventDefault();
  strip.classList.add("drag-target");
});
if ($("desktopPetActions")) $("desktopPetActions").addEventListener("drop", (event) => {
  const strip = event.target.closest(".desktop-pet-frame-strip");
  if (!strip || !desktopPetFrameDrag) return;
  event.preventDefault();
  strip.classList.remove("drag-target");
  const thumb = event.target.closest(".desktop-pet-frame-thumb");
  const targetIndex = thumb ? Number(thumb.dataset.frameIndex) : 999;
  if (desktopPetFrameDrag.stateId === strip.dataset.stateId) {
    moveDesktopPetFrame(strip.dataset.stateId, desktopPetFrameDrag.frameIndex, targetIndex);
  }
});
if ($("desktopPetScale")) $("desktopPetScale").addEventListener("input", updateDesktopPetSettings);
if ($("desktopPetSharpness")) $("desktopPetSharpness").addEventListener("input", updateDesktopPetSettings);
if ($("desktopPetSpeed")) $("desktopPetSpeed").addEventListener("input", updateDesktopPetSettings);
if ($("desktopPetVehicleScale")) $("desktopPetVehicleScale").addEventListener("input", updateDesktopPetSettings);
$("search").addEventListener("input", render);
["positionFilter", "rarityFilter", "seasonFilter", "sortMode", "performanceSortMetric", "performanceSortDirection"].forEach((id) => { if ($(id)) $(id).addEventListener("change", render); });
$("runRecommend").addEventListener("click", recommend);
$("saveAi").addEventListener("click", () => { saveAiConfig({ apiBase: $("apiBase").value.trim(), modelName: $("modelName").value.trim(), apiKey: $("apiKey").value.trim() }); alert("AI 设置已保存到当前浏览器本地。"); });
$("testAi").addEventListener("click", runAi);

if ($("libraryList")) $("libraryList").addEventListener("input", function(ev) { var gs = ev.target.closest(".group-car-search"); if (gs) { activeGroupCarSearch = gs.value; var q = gs.value.toLowerCase().trim(); var card = gs.closest(".group-card"); if (card) { var options = card.querySelectorAll(".group-car-option"); Array.from(options).forEach(function(opt) { var label = opt.querySelector("span"); if (label) { opt.style.display = label.textContent.toLowerCase().includes(q) ? "" : "none"; } }); } } });

  if ($("libraryList")) $("libraryList").addEventListener("change", function(ev) { var inp = ev.target.closest(".group-name-input"); if (inp) { var grp = groups.find(function(g){return g.id===inp.dataset.groupId;}); if(grp && inp.value.trim()){grp.name=inp.value.trim();saveGroups();render();} } var gts = ev.target.closest(".group-type-select"); if (gts) { var grp = groups.find(function(g){return g.id===gts.dataset.groupId;}); if(grp){grp.type=gts.value;saveGroups();render();} } });
(async () => {
  await loadAppConfig();
  if (!USE_PROJECT_BACKUP && !isReadOnlyMode()) initializeSpeedSheetData();
  const restoreTasks = [restoreItemsFromBackup(), restoreCreatorsFromBackup()];
  if (!isReadOnlyMode()) restoreTasks.push(restoreDesktopPetsFromBackup());
  await Promise.all(restoreTasks);
})().finally(() => {
  items = migrateVehicleRecords(items);
  if (!USE_PROJECT_BACKUP && !isReadOnlyMode()) saveItems();
  ensurePerformanceStatsCache();
  renderCreators();
  if (!isReadOnlyMode()) renderDesktopPetManager();
  const aiConfig = loadAiConfig(); $("apiBase").value = aiConfig.apiBase || "https://api.openai.com/v1/chat/completions"; $("modelName").value = aiConfig.modelName || "gpt-4.1-mini"; $("apiKey").value = aiConfig.apiKey || ""; $("systemPrompt").value = defaultPrompt(); render(); openVehicleFromUrlParam();
});
