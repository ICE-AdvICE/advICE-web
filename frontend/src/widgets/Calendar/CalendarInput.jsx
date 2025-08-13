// widgets/Calendar/CalendarInput.jsx
// 날짜 입력창 + 달력 팝오버 컴포넌트
/* - 입력창 버튼을 누르면 달력 팝오버가 열림 
   - 날짜를 고르면 선택값을 부모에게 전달한 뒤 팝오버를 닫음 
   - 바깥 클릭/ESC로 닫히게!
   - 이전/다음 달 버튼 -> 달력의 달이 바뀌고 onMonthChange 콜백 호출*/

import React, { useEffect, useMemo, useRef, useState } from "react";
import CalendarGrid from "./CalendarGrid";
import { parseYMD } from "../../shared/lib/date";
import "./CalendarInput.css";

export default function CalendarInput({
  value, // 선택 날짜 : 부모가 직접 관리 (controlled)
  defaultValue, // 선택 날짜 : 내부에서 관리 (uncontrolled)
  onChange, // 날짜 바뀔 때 부모에게 알림
  onOpenChange, // 팝오버 열리고 닫힐 때 알림
  onMonthChange, // 달 바뀔 때 알림
  minDate, // 선택 불가 조건 (달력으로 전달)
  maxDate, // 선택 불가 조건 (달력으로 전달)
  disabledDates, // 선택 불가 조건 (달력으로 전달)
  renderDay, // 각 날짜칸의 커스터마이징 (달력으로 전달)
  disabled = false, // 입력창 비활성화 (달력으로 전달)
  placeholder = "날짜 선택", // 표시용
  className = "", // 표시용
}) {
  // 1. controlled/uncontrolled (우리는 controlled 인듯)
  /* - 부모가 value -> 그대로 표시
     - 그렇지 않으면 내부 상태로 직접 보관해 표시 */
  const isControlled = value !== undefined; // null이어도 controlled 유지
  const [inner, setInner] = useState(defaultValue ?? null);
  const selected = isControlled ? value : inner;

  // 2. 팝오버 열림/닫힘
  /* - 버튼을 누르면 open 토글
     - 바뀐 상태를 부모에게 onOpenChange로 알려줌  */
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef(null);

  // 3. 보기(view) 월/연도 상태: 선택된 날짜가 있으면 그 달, 없으면 오늘
  //    - 컴포넌트 마운트 시 한 번만: 선택이 있으면 그 달, 없으면 오늘
  //    - 이후에는 선택 "발생" 시(=selected가 유효한 날짜가 될 때)만 해당 달로 스냅
  const [view, setView] = useState(() => parseYMD(selected) || new Date());
  useEffect(() => {
    if (!selected) return; // 선택 해제 시에는 그대로 유지
    const d = parseYMD(selected);
    if (!d) return;
    const next = new Date(d.getFullYear(), d.getMonth(), 1);
    setView(next); // 선택이 "변경"된 경우에만 스냅
  }, [selected]);

  // 4. 외부 클릭/ESC로 닫기
  // 팝오버가 열렸을 때만 이벤트를 달고, 닫히면 깔끔히 제거
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenSafe(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpenSafe(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const setOpenSafe = (v) => {
    setOpen(v);
    onOpenChange?.(v);
  };
  // 5. 달 넘기기
  // 이전/다음 달로 이동하고, 바뀐 연/월을 부모에게 알려줌
  const y = view.getFullYear();
  const m = view.getMonth();

  const goPrevMonth = () => {
    const next = new Date(y, m - 1, 1);
    setView(next);
    onMonthChange?.(next.getFullYear(), next.getMonth());
  };
  const goNextMonth = () => {
    const next = new Date(y, m + 1, 1);
    setView(next);
    onMonthChange?.(next.getFullYear(), next.getMonth());
  };

  // 6. 날짜 선택 처리
  /* - controlled이면 부모에게만 알림
     - uncontrolled이면 내부값 갱신 + 부모에게 알림 
     - 선택 후 팝오버 닫기 */
  const handleSelect = (next) => {
    if (isControlled) onChange?.(next);
    else {
      setInner(next);
      onChange?.(next);
    }
  };

  const displayText = selected ? selected.replaceAll("-", " / ") : "";
  // 왼쪽 아이콘
  const leftIconSrc =
    open || hover
      ? `${process.env.PUBLIC_URL}/select.png`
      : `${process.env.PUBLIC_URL}/none.png`;
  // 화살표 아이콘
  const arrowIconSrc =
    open || hover
      ? `${process.env.PUBLIC_URL}/selectedArrow.png`
      : `${process.env.PUBLIC_URL}/noneArrow.png`;

  return (
    <div className="calendar-input-wrap">
      <div className={`cal-input ${className}`} ref={ref}>
        {/* 1. 입력창 버튼 */}
        <button
          type="button"
          className={`cal-input__field ${open ? "open" : ""}`}
          onClick={() => !disabled && setOpenSafe(!open)}
          onMouseEnter={() => !disabled && setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <div className="cal-box">
            {/* 왼쪽 아이콘 */}
            <span className="cal-input__left-icon" aria-hidden>
              <img src={leftIconSrc} alt="" />
            </span>

            {/* 텍스트 영역 */}
            <div className="cal-input__text-wrap">
              <div className="cal-input__label">Select a day</div>
              <div className="cal-input__date">
                {displayText || "YYYY / MM / DD"}
              </div>
            </div>
          </div>

          {/* 오른쪽 화살표 아이콘 */}
          <span className="cal-input__icon-right">
            <img src={arrowIconSrc} alt="" />
          </span>
        </button>

        {/*2. 달력 팝오버 */}
        {open && (
          <div className="cal-popover" role="dialog" aria-label="날짜 선택">
            <CalendarGrid
              year={y}
              monthIndex={m}
              selected={selected}
              onSelect={handleSelect}
              onPrevMonth={goPrevMonth}
              onNextMonth={goNextMonth}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              renderDay={renderDay}
            />
          </div>
        )}
      </div>
    </div>
  );
}
