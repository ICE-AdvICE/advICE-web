// widgets/Calendar/CalendarGrid.jsx

// 달력의 헤더(이전/다음 달 버튼 + 달력 제목)와 그리드 관련 jsx
// - 그리드는 요일 라벨 7칸 + 날짜칸 6*7=42칸

// 특정 날짜가 선택 되면 활성화 -> 상위 컴포넌트(부모)에게 "YYYY-MM-DD" 형식으로 알려줌
// 특정 날짜 비활성화 (주말, 공휴일 등)

// 같은 날짜를 한번 더 선택하면 날짜 선택한거 취소하도록

import React, { useMemo } from "react";

// date.js에서 설정한 달력 유틸 함수
import {
  buildMonthCells,
  formatYMD,
  isDisabledDay,
  parseYMD,
  sameYMD,
  weekLabels,
  monthTitle,
} from "../../shared/lib/date";
import "./CalendarGrid.css";

// 입력 값(props)
export default function CalendarGrid({
  year, // 연도 예: 2025
  monthIndex, // 0~11 (0=1월 ~ 11=12월)
  selected, // "YYYY-MM-DD" | null (현재 선택된 날짜)
  onSelect, // 날짜 클릭 시 호출되는 함수 (부모로 전달)
  onPrevMonth, // 이전 달 버튼 클릭시
  onNextMonth, // 다음 달 버튼 클릭시
  minDate, // 최소 선택 가능 날짜 "YYYY-MM-DD"
  maxDate, // 최대 선택 가능 날짜 "YYYY-MM-DD"
  disabledDates, // 비활성 날짜 목록
  renderDay, // 날짜칸 커스터마이징 함수 (옵션)
}) {
  // 해당 연/월/주시작=일요일 (default) 기준으로 42칸 배열 만들기
  // 연,월이 바뀔 때만 다시 계산
  const cells = useMemo(
    () => buildMonthCells(year, monthIndex),
    [year, monthIndex]
  );
  const selectedDate = selected ? parseYMD(selected) : null; // 선택된 날짜 문자열 -> Date로 변환
  const viewDate = new Date(year, monthIndex, 1); // 제목
  const labels = weekLabels(); // 요일
  const PUB = process.env.PUBLIC_URL || "";

  return (
    <div className="cal">
      {/* 1. 헤더 */}
      <div className="cal__head">
        <span className="cal__title">{monthTitle(viewDate)}</span>
        <div className="paging_button">
          <button
            className="cal__nav"
            onClick={onPrevMonth}
            aria-label="이전 달"
          >
            <img
              src={`${PUB}/monthLeft.png`}
              alt=""
              width={20}
              height={20}
              draggable={false}
              onMouseEnter={(e) =>
                (e.currentTarget.src = `${PUB}/selectMonthLeft.png`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.src = `${PUB}/monthLeft.png`)
              }
              onFocus={(e) =>
                (e.currentTarget.src = `${PUB}/selectMonthLeft.png`)
              } // 키보드 포커스
              onBlur={(e) => (e.currentTarget.src = `${PUB}/monthLeft.png`)}
            />
          </button>
          <button
            className="cal__nav"
            onClick={onNextMonth}
            aria-label="다음 달"
          >
            <img
              src={`${PUB}/monthRight.png`}
              alt=""
              width={20}
              height={20}
              draggable={false}
              onMouseEnter={(e) =>
                (e.currentTarget.src = `${PUB}/selectMonthRight.png`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.src = `${PUB}/monthRight.png`)
              }
              onFocus={(e) =>
                (e.currentTarget.src = `${PUB}/selectMonthRight.png`)
              }
              onBlur={(e) => (e.currentTarget.src = `${PUB}/monthRight.png`)}
            />
          </button>
        </div>
      </div>

      {/* 2. 그리드 */}
      <div className="cal__grid">
        {/* 2-1. 요일 라벨 */}
        {labels.map((d) => (
          <div key={d} className="cal__dow" aria-hidden>
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          const empty = day == null;
          const d = empty ? null : new Date(year, monthIndex, day); // 날짜 객체
          const ymd = empty ? null : formatYMD(d); // "YYYY-MM-DD" 문자열로 변환
          // 빈칸이거나 날짜가 비활성 조건에 맞으면 true
          const disabled =
            empty || isDisabledDay(ymd, { minDate, maxDate, disabledDates });
          // 현재 칸의 날짜가 선택된 날짜와 같으면 true
          const selectedFlag = selectedDate && d && sameYMD(selectedDate, d);

          let content = day ?? "";
          if (!empty && renderDay) {
            // renderDay가 있으면 커스터마이징해서 표시
            content = renderDay({
              date: d,
              ymd,
              isSelected: !!selectedFlag,
              disabled,
            });
          }

          return (
            // 비활성 아니면 선택한 날짜를 부모로 전달
            // 달력의 각 날짜 칸을 실제 button요소로 만들어서 화면에 보여줌
            <button
              key={i}
              className={
                "cal__cell" +
                (empty ? " -empty" : "") + // empty(true) -> -empty 추가
                (selectedFlag ? " -sel" : "") + // selectedFlag (true) -> -sel 추가
                (disabled ? " -dis" : "") // disabled(true) -> -dis 추가
              }
              disabled={disabled} // true(비활성 조건)면 클릭 불가
              aria-selected={selectedFlag || undefined} // 버튼 선택 여부를 알려줌
              onClick={() => {
                if (disabled) return;
                // 이미 선택된 날을 다시 누르면 선택 해제(null), 아니면 해당 날짜 선택
                const next = selectedFlag ? null : ymd;
                onSelect?.(next);
              }} // 날짜 선택 여부를 부모에게 알려줌
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
