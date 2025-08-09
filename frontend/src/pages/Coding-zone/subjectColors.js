// 로컬스토리지 키
const KEY_ID_COLOR = "subjectIdColorMap";
const KEY_NAME_ID = "subjectNameToIdMap";

// 기본 색 매핑
const DEFAULT_ID_COLOR = {
  1: "#1A3F57", // 빨강
  2: "#76B6B8", // 파랑
  3: "#C9A981", // 초록
  4: "#6E6E6D", // 노랑
};

const safeParse = (s, fallback = {}) => {
  try {
    return JSON.parse(s) || fallback;
  } catch {
    return fallback;
  }
};
const norm = (name) => (name || "").trim();

export function loadIdColorMap() {
  const saved = safeParse(localStorage.getItem(KEY_ID_COLOR));
  // 저장된 게 없으면 기본값 제공
  return { ...DEFAULT_ID_COLOR, ...saved };
}
export function saveIdColorMap(map) {
  localStorage.setItem(KEY_ID_COLOR, JSON.stringify(map || {}));
}

export function loadNameIdMap() {
  return safeParse(localStorage.getItem(KEY_NAME_ID));
}
export function saveNameIdMap(map) {
  localStorage.setItem(KEY_NAME_ID, JSON.stringify(map || {}));
}

// ID로 색 얻기
export function getColorById(subjectId, defaultColor = "#A0A0A0") {
  const idColor = loadIdColorMap();
  return idColor?.[String(subjectId)] || defaultColor;
}

// 과목명으로(ID 역추적 후) 색 얻기 — 출결관리에서 사용
export function getColorByName(subjectName, defaultColor = "#A0A0A0") {
  const nameId = loadNameIdMap();
  const idColor = loadIdColorMap();
  const id = nameId?.[norm(subjectName)];
  return (id && idColor?.[String(id)]) || defaultColor;
}

// 현재 ID의 색(저장된 값 없으면 기본값) 가져오기
export function getCodingZoneColor(id) {
  return getColorById(id);
}
