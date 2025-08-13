// Calendar에 사용됨
// YYYY-MM-DD <-> Date 변환, 월 그리드 계산, 비교/ 비활성 로직

/* 1. API에서 "2025-08-12" 받음 -> parseYMD로 Date 객체 변환
   2. Date 객체로 요일, 다음날 계산
   3. 계산한 날짜를 다시 "YYYY-MM-DD" 문자열로 만들어서 API 보냄
   
   - BackEnd : JSON에는 Date 객체 개념이 없어서 텍스트로 전달해야 함
   - FrontEnd : 날짜 계산을 위해 Date 객체 필요*/

// 1. 문자열 "YYYY-MM-DD" -> 자바스크립트 Date 객체로 변환
export function parseYMD(ymd) {
  if (!ymd) return null; // 값이 없으면 null 반환
  const [Y, M, D] = ymd.split("-").map(Number); // "2024-07-16" -> ["2024","07","16"] 숫자로 변환
  return new Date(Y, M - 1, D); //JS에서 월은 0부터 시작하므로 -1
}

// 2. Date 객체 -> "YYYY-MM-DD" 문자열로 변환
export function formatYMD(date) {
  const Y = date.getFullYear(); // 년도
  const M = String(date.getMonth() + 1).padStart(2, "0"); // 월
  const D = String(date.getDate()).padStart(2, "0"); // 일
  return `${Y}-${M}-${D}`; // "YYYY-MM-DD" 형식으로 합침
}

// 3. 두 Date 객체가 같은 날짜인지 확인
// 오늘 날짜 표시, 선택 날짜 표시, 달력 셀 계산에 필요
export function sameYMD(a, b) {
  if (!a || !b) return false; // 둘 중 하나라도 없으면 false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// 4. 같은 날짜 문자열끼리 비교 및 결과
export function compareYMD(aYmd, bYmd) {
  if (aYmd === bYmd) return 0;
  return aYmd < bYmd ? -1 : 1;
  // 같으면 0, a가 작으면 -1, a가 크면 1 반환
}

// 5. 월 그리드 (일요일 시작 고정)
export function buildMonthCells(year, monthIndex) {
  const first = new Date(year, monthIndex, 1); // 월의 처음 날짜
  const startIdx = first.getDay(); // 요일 (0 = 일요일 ~ 6 = 토요일)

  const days = new Date(year, monthIndex + 1, 0).getDate(); // 그 달의 총 일 수
  const cells = Array.from({ length: startIdx }, () => null); // 이전 달의 끝 날짜들이 차지할 공간 = 빈칸(null)
  for (let d = 1; d <= days; d++) cells.push(d); // 날짜 넣기
  return cells;
}

// 6. 요일 이름 배열 생성 (영어로 고정)
export function weekLabels() {
  return ["S", "M", "T", "W", "T", "F", "S"];
}

// 7. 주말인지 판별
/* - 달력 UI에서 주말 날자를 회색 처리/클릭 불가 처리
   - API 호출 전 주말이면 호출 안하고 에러 메시지 표시
   - 등록 페이지에서 주말 예약 차단*/
export const isWeekendYMD = (ymd) => {
  const d = parseYMD(ymd);
  const day = d.getDay(); // 요일 (0=일 ~ 6=토)
  return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)이면 true
};

// 7-1. 날짜가 선택 불가능한지 확인 (코딩존 등록 조회 페이지에는 필요 없음, 코딩존 등록 페이지에는 필요할 듯)
// 주말 옵션, 날짜 범위 제한, 특정 휴무일 날짜 비활성화
export function isDisabledDay(
  ymd,
  { minDate, maxDate, disabledDates, disableWeekends = false }
) {
  // 주말 자동 비활성화
  if (disableWeekends && isWeekendYMD(ymd)) return true;
  // minDate, maxDate(매개변수)는 본인이 담당한 페이지에 맞게 부모 컴포넌트에서 설정해야함
  if (minDate && compareYMD(ymd, minDate) < 0) return true; // 최소 날짜보다 작으면 비활성
  if (maxDate && compareYMD(ymd, maxDate) > 0) return true; // 최소 날짜보다 크면 활성
  if (!disabledDates) return false;
  if (Array.isArray(disabledDates)) return disabledDates.includes(ymd);
  if (typeof disabledDates === "function") return !!disabledDates(ymd);
  return false;
}

// 8. 월+연도 제목을 문자열로 반환 (달력 상단 타이틀 용)
// monthTitle(new Date(2025, 6, 1)); -> July 2025
export function monthTitle(date) {
  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// 9. 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환 (옵션)
export function todayYMD() {
  return formatYMD(new Date());
}
