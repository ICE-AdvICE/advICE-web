// 날짜 기준 상태 계산 유틸 - 시간대 비교 없음.
// 오늘 < 수업날짜  → 예약대기
// 오늘 = 수업날짜  → 진행중
// 오늘 > 수업날짜  → 진행종료

export function ymd(dateLike) {
  // Date 또는 문자열(YYYY-MM-DD, YYYY/MM/DD 등)을 YYYY-MM-DD로 정규화
  if (!dateLike) return "";
  if (typeof dateLike === "string") {
    const m = dateLike.match(/^(\d{4})[./-]?(\d{1,2})[./-]?(\d{1,2})$/);
    if (m) {
      const y = m[1];
      const mo = m[2].padStart(2, "0");
      const d = m[3].padStart(2, "0");
      return `${y}-${mo}-${d}`;
    }
    const dt = new Date(dateLike);
    if (!Number.isNaN(dt.getTime())) return ymd(dt);
    return "";
  }
  const dt = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function computeStatusByDate({
  classDate, // "YYYY-MM-DD"
  now = new Date(), // 서버시간을 쓰고 싶으면 서버에서 받아온 now를 전달
}) {
  const target = ymd(classDate);
  if (!target) return "예약대기";

  const today = ymd(now);

  if (today < target) return "예약대기";
  if (today === target) return "진행중";
  return "진행종료";
}

// 표시에 쓸 시간대 텍스트(서버는 "HH:mm:ss"만 줌)
// 리스트에 시간 텍스트는 계속 보여줄 거라면 이 함수로 HH:mm으로 변환
export function formatHHmmRangeFromStart(classTime, durationMinutes = 60) {
  if (!classTime) return "-";
  const [h, m] = String(classTime).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "-";

  const start = new Date();
  start.setHours(h, m, 0, 0);

  const end = new Date(start);
  end.setMinutes(start.getMinutes() + durationMinutes);

  const hhmm = (dt) =>
    `${String(dt.getHours()).padStart(2, "0")}:${String(
      dt.getMinutes()
    ).padStart(2, "0")}`;
  return `${hhmm(start)} ~ ${hhmm(end)}`;
}
