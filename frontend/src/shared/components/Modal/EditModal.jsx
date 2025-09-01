import React, { useState, useEffect, useRef } from "react";
import "./EditModal.css";
import {
  fetchAssistantsBySubjectId,
  fetchAllSubjects,
  adminUpdateCodingzoneClassByClassNum,
} from "../../../entities/api/CodingZone/AdminApi";

function EditModal({
  isOpen,
  onClose,
  initialValues,
  onSubmit,
  subjectOptions = [],
  accessToken,
  onDirty,
  submitting,
}) {
  const busyRef = useRef(false); // 중복 제출 가드 (prop과 무관하게 동작)
  // 화면 표시용 폼 상태
  const [form, setForm] = useState({
    groupId: "",
    weekDay: "",
    classDate: "", // UI: "MM-DD"
    classTime: "", // UI: "HH:MM"
    assistantName: "",
    maximumNumber: "",
    className: "",
  });

  // 과목 옵션 정규화
  const normalizeSubjects = (opts) =>
    (Array.isArray(opts) ? opts : [])
      .map((s) => {
        const id = s?.id ?? s?.subjectId ?? s?.value ?? s?.key;
        const name = s?.name ?? s?.subjectName ?? s?.label ?? s?.text ?? "";
        return { id: id != null ? String(id) : "", name: String(name) };
      })
      .filter((x) => x.id && x.name);

  const [subjects, setSubjects] = useState(() =>
    normalizeSubjects(subjectOptions)
  );

  const normId = (v) => String(v ?? "").trim();
  const idEq = (a, b) => normId(a) === normId(b);
  const getId = (s) => String(s.id);
  const getName = (s) => String(s.name);

  // 모달 열릴 때 과목 목록 준비
  useEffect(() => {
    if (!isOpen) return;

    const normalized = normalizeSubjects(subjectOptions);
    if (normalized.length) {
      setSubjects(normalized);
      return;
    }

    let alive = true;
    (async () => {
      try {
        const res = await fetchAllSubjects(); // 공개 API라 토큰 없어도 OK
        if (!alive) return;
        if (res?.code === "SU" && Array.isArray(res.data)) {
          setSubjects(
            res.data.map((s) => ({
              id: String(s.subjectId),
              name: String(s.subjectName),
            }))
          );
        }
      } catch {}
    })();

    return () => {
      alive = false;
    };
  }, [isOpen, subjectOptions]);

  // 선택 키들
  const [subjectId, setSubjectId] = useState("");
  const [assistants, setAssistants] = useState([]);
  const [assistantsLoading, setAssistantsLoading] = useState(false);
  const [assistantsErr, setAssistantsErr] = useState("");
  const [didInit, setDidInit] = useState(false);

  const WEEK_OPTIONS = ["월요일", "화요일", "수요일", "목요일", "금요일"];
  const normalizeWeekDay = (d) => {
    const raw = (d ?? "").toString().trim();
    if (WEEK_OPTIONS.includes(raw)) return raw;
    const key = raw.replace(/\s+/g, "").toUpperCase();
    const map = {
      MON: "월요일",
      MONDAY: "월요일",
      TUE: "화요일",
      TUESDAY: "화요일",
      WED: "수요일",
      WEDNESDAY: "수요일",
      THU: "목요일",
      THURSDAY: "목요일",
      FRI: "금요일",
      FRIDAY: "금요일",
    };
    return map[key] ?? raw;
  };

  // YYYY-MM-DD → 요일
  const weekDayFromDate = (ymd) => {
    if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "";
    const d = new Date(`${ymd}T00:00:00`);
    const ko = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    return ko[d.getDay()];
  };

  const update = (k, v) =>
    setForm((p) => {
      const nv = typeof v === "string" ? v.trim() : v;
      return { ...p, [k]: nv };
    });

  const toApiDate = (mmdd) => {
    const [m, d] = (mmdd || "").split("-");
    const yyyy =
      initialValues?.classDate?.slice(0, 4) || new Date().getFullYear();
    return `${yyyy}-${String(m || "").padStart(2, "0")}-${String(
      d || ""
    ).padStart(2, "0")}`;
  };
  const toApiTime = (hhmm) => (hhmm?.length === 5 ? `${hhmm}:00` : hhmm || "");

  // 모달 열릴 때마다 init 플래그 리셋
  useEffect(() => {
    if (isOpen) setDidInit(false);
  }, [isOpen]);

  // 초기값 주입
  useEffect(() => {
    if (!isOpen || !initialValues || didInit) return;

    const initialSubjectId = (() => {
      if (initialValues.subjectId != null)
        return normId(initialValues.subjectId);
      return "";
    })();
    setSubjectId(initialSubjectId);

    setForm((prev) => ({
      ...prev,
      groupId: initialValues.groupId ?? prev.groupId,
      weekDay:
        normalizeWeekDay(initialValues.weekDay) ||
        weekDayFromDate(initialValues.classDate) ||
        prev.weekDay,
      classDate: initialValues.classDate
        ? initialValues.classDate.slice(5)
        : prev.classDate, // "YYYY-MM-DD" → "MM-DD"
      classTime: initialValues.classTime
        ? initialValues.classTime.slice(0, 5)
        : prev.classTime, // "HH:MM:SS" → "HH:MM"
      assistantName: initialValues.assistantName ?? prev.assistantName,
      maximumNumber:
        initialValues.maximumNumber != null
          ? String(initialValues.maximumNumber)
          : prev.maximumNumber,
      className: initialValues.className ?? prev.className,
    }));
    setDidInit(true);
    console.log(
      "[EditModal] didInit=TRUE initial form:",
      JSON.parse(
        JSON.stringify({
          formAfterInit: {
            groupId: form.groupId,
            weekDay: form.weekDay,
            classDate: form.classDate,
            classTime: form.classTime,
            assistantName: form.assistantName,
            maximumNumber: form.maximumNumber,
            className: form.className,
          },
          subjectIdInit: initialSubjectId,
        })
      )
    );
  }, [isOpen, initialValues, didInit, subjects, normalizeWeekDay]);

  // subjectId와 옵션 매칭 보정
  useEffect(() => {
    if (!isOpen || !initialValues) return;
    if (subjects.length === 0) return;
    const hasMatch = subjects.some((s) => idEq(getId(s), subjectId));
    if (!subjectId || !hasMatch) {
      if (initialValues.subjectId != null) {
        const sid = normId(initialValues.subjectId);
        const picked = subjects.find((s) => idEq(getId(s), sid));
        if (picked) {
          setSubjectId(getId(picked));
          return;
        }
      }
    }
  }, [isOpen, initialValues, subjectId, subjects]);

  // 과목별 조교 목록 로드
  useEffect(() => {
    const fetchAssistants = async (sid) => {
      if (!sid) {
        setAssistants([]);
        return;
      }
      try {
        setAssistantsLoading(true);
        setAssistantsErr("");
        const res = await fetchAssistantsBySubjectId(
          sid,
          accessToken,
          () => {},
          undefined
        );
        if (res?.code !== "SU")
          throw new Error(res?.message || "조교 목록 조회 실패");
        const names = Array.isArray(res.data?.assistantNames)
          ? res.data.assistantNames
          : [];
        setAssistants(names);
        // 과목 바꾼 직후 조교가 정확히 1명이라면 자동 선택 (유효성 경고 예방)
        if (names.length === 1) {
          update("assistantName", names[0]);
        }
      } catch (e) {
        setAssistants([]);
        setAssistantsErr(e.message || "조교 조회 중 오류");
      } finally {
        setAssistantsLoading(false);
      }
    };

    if (subjectId) fetchAssistants(subjectId);
  }, [subjectId, accessToken]);

  // submit
  const submit = async (e) => {
    console.log("submit 함수 호출됨!");
    e.preventDefault();
    if (busyRef.current) return; // 로컬 가드
    // 폼 DOM 기준으로 값 1차 확보 (렌더 타이밍 이슈 방지)
    const formElement = document.getElementById("edit-form");
    const fd = formElement ? new FormData(formElement) : new FormData();
    const assistantNameFromDom = (fd.get("assistantName") || "")
      .toString()
      .trim();
    const groupIdFromDom = (fd.get("groupId") || "")
      .toString()
      .trim()
      .toUpperCase();
    const maximumNumberFromDom = (fd.get("maximumNumber") || "")
      .toString()
      .trim();
    const classTimeFromDom = (fd.get("classTime") || "").toString().trim();
    const classDateFromDom = (fd.get("classDate") || "").toString().trim();
    // 상태와 DOM 중 우선순위: DOM 우선 → 없으면 상태
    const safeAssistantName =
      assistantNameFromDom || form.assistantName?.trim() || "";
    const safeGroupId = groupIdFromDom || form.groupId || "";
    const safeClassTime = classTimeFromDom || form.classTime || "";
    const safeClassDate = classDateFromDom || form.classDate || "";
    const safeMaximum = maximumNumberFromDom || form.maximumNumber || "";

    // 기본 유효성
    if (!subjectId) {
      alert("과목을 선택해 주세요.");
      return;
    }
    if (!safeClassDate?.match(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)) {
      alert("날짜는 MM-DD 형식으로 입력하세요. 예: 03-15");
      return;
    }
    if (!safeClassTime) {
      alert("시간을 선택해 주세요.");
      return;
    }
    if (!safeGroupId) {
      alert("조(A/B)를 선택해 주세요.");
      return;
    }
    if (!safeAssistantName) {
      alert("조교를 선택해 주세요.");
      return;
    }
    if (!safeMaximum) {
      alert("인원을 선택해 주세요.");
      return;
    }

    // 명세 일치 보정
    const apiDate = toApiDate(safeClassDate); // YYYY-MM-DD
    const koWeek = weekDayFromDate(apiDate); // 날짜 기준으로 고정
    if (["토요일", "일요일"].includes(koWeek)) {
      alert("주말 날짜는 선택할 수 없습니다.");
      return;
    }

    const picked = subjects.find((s) => idEq(getId(s), subjectId));
    const className =
      form.className?.trim() || picked?.name || initialValues?.className || "";

    const payload = {
      classDate: apiDate,
      weekDay: koWeek, // 날짜로부터 재계산
      classTime: toApiTime(safeClassTime), // HH:MM:SS
      subjectId: Number(subjectId),
      className, // 명세 필드
      assistantName: safeAssistantName,
      maximumNumber: parseInt(safeMaximum, 10),
      groupId: safeGroupId,
    };

    // ✅ 모든 유효성 검증 통과 후에만 바운스 가드 활성화
    busyRef.current = true;
    try {
      // 서버 응답을 먼저 확인
      const res = await adminUpdateCodingzoneClassByClassNum(
        initialValues.classNum,
        payload,
        accessToken,
        () => {},
        undefined
      );

      if (res?.ok) {
        // 성공한 경우에만 onSubmit 호출
        if (onSubmit) {
          await onSubmit(payload);
        }
      } else {
        // 실패한 경우: 적절한 메시지 표시
        if (res?.code === "NOT_MODIFIED_INFO") {
          alert("변경사항이 없습니다.");
        } else if (res?.code === "ALREADY_EXISTED_CLASS") {
          alert("이미 등록된 수업입니다.");
        } else {
          alert(res?.message || "수정에 실패했습니다.");
        }
      }
    } finally {
      busyRef.current = false;
    }
  };

  if (!isOpen) return null;

  console.log("EditModal 렌더링 중, isOpen:", isOpen);

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="edit-modal-header">
          <h2 className="edit-modal-title">AdvICE</h2>
          <button
            type="button"
            onClick={onClose}
            className="edit-modal-x-button"
            aria-label="닫기"
            title="닫기"
          >
            ✕
          </button>
        </div>

        {/* 바디 */}
        <div className="edit-modal-body">
          {/* 폼은 단 하나! */}
          <form id="edit-form" onSubmit={submit} noValidate>
            <div className="edit-table-container">
              <table className="edit-table">
                <thead>
                  <tr>
                    <th>조</th>
                    <th>요일</th>
                    <th>날짜</th>
                    <th>시간</th>
                    <th>과목명</th>
                    <th>조교명</th>
                    <th>인원</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/* 조 */}
                    <td>
                      <select
                        id="edit-groupId"
                        name="groupId"
                        value={form.groupId}
                        onChange={(e) => {
                          const next = (e.target.value || "")
                            .trim()
                            .toUpperCase();
                          console.log("[EditModal] groupId change ->", next);
                          update("groupId", next);
                        }}
                        required
                      >
                        <option value="" disabled>
                          {" "}
                          -{" "}
                        </option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                      </select>
                    </td>

                    {/* 요일 (표시 전용: 날짜로부터 자동 계산됨) */}
                    <td>
                      <input
                        type="text"
                        value={form.weekDay}
                        readOnly
                        title="날짜에 따라 자동으로 결정됩니다"
                      />
                    </td>

                    {/* 날짜 (MM-DD) */}
                    <td>
                      <input
                        type="text"
                        id="edit-classDate"
                        name="classDate"
                        placeholder="MM-DD"
                        value={form.classDate}
                        onChange={(e) => {
                          update("classDate", e.target.value);
                          // 날짜가 바뀌면 요일 자동 반영
                          const api = toApiDate(e.target.value);
                          update("weekDay", weekDayFromDate(api));
                        }}
                        pattern="^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$"
                        title="날짜는 MM-DD 형식으로 입력하세요. 예: 03-15"
                        required
                      />
                    </td>

                    {/* 시간 (HH:MM) */}
                    <td>
                      <select
                        id="edit-classTime"
                        name="classTime"
                        value={form.classTime}
                        onChange={(e) => {
                          update("classTime", e.target.value);
                        }}
                        required
                      >
                        <option value="" disabled>
                          시간 선택
                        </option>
                        {[
                          "09:00",
                          "10:00",
                          "11:00",
                          "12:00",
                          "13:00",
                          "14:00",
                          "15:00",
                          "16:00",
                          "17:00",
                          "18:00",
                          "19:00",
                          "20:00",
                        ].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* 과목 */}
                    <td>
                      <select
                        value={subjectId}
                        onChange={(e) => {
                          const sid = e.target.value;
                          setSubjectId(sid);
                          // 과목 바뀌면 조교 초기화 + 과목명 동기화
                          update("assistantName", "");
                          const picked = subjects.find((s) =>
                            idEq(getId(s), sid)
                          );
                          update("className", picked ? picked.name : "");
                        }}
                        required
                      >
                        <option value="" disabled>
                          과목 선택
                        </option>
                        {subjectId &&
                          !subjects.some((s) => idEq(getId(s), subjectId)) && (
                            <option value={subjectId}></option>
                          )}
                        {subjects.map((s) => (
                          <option key={getId(s)} value={getId(s)}>
                            {getName(s)}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* 조교 */}
                    <td>
                      <select
                        value={form.assistantName}
                        onChange={(e) => {
                          update("assistantName", e.target.value);
                        }}
                        id="edit-assistantName"
                        name="assistantName"
                        required
                      >
                        {/* 항상 명확한 placeholder 제공 (선택 전 value="") */}
                        <option value="" disabled>
                          {subjectId
                            ? "조교를 선택하세요"
                            : "과목을 먼저 선택하세요"}
                        </option>

                        {subjectId && assistantsLoading && (
                          <option value="" disabled>
                            조교 불러오는 중...
                          </option>
                        )}
                        {subjectId &&
                          !assistantsLoading &&
                          assistants.length === 0 && (
                            <option value="" disabled>
                              등록된 조교 없음
                            </option>
                          )}
                        {form.assistantName &&
                          !assistants.includes(form.assistantName) && (
                            <option value={form.assistantName}>
                              {form.assistantName} (현재값)
                            </option>
                          )}
                        {assistants.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* 인원 */}
                    <td>
                      <input
                        type="number"
                        id="edit-maximumNumber"
                        name="maximumNumber"
                        placeholder="인원 입력"
                        value={form.maximumNumber}
                        onChange={(e) => {
                          update("maximumNumber", e.target.value);
                        }}
                        min="1"
                        max="50"
                        required
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {assistantsErr && (
              <p className="form-error" style={{ marginTop: 8 }}>
                조교 목록을 불러오지 못했습니다: {assistantsErr}
              </p>
            )}
          </form>
        </div>

        {/* 푸터 */}
        <div className="edit-modal-footer">
          <img
            src="/header-name.png"
            alt="School Header"
            className="edit-modal-logo"
          />
          <button
            type="button"
            onClick={(e) => {
              console.log("수정 완료 버튼 직접 클릭됨!");
              submit(e);
            }}
            className="edit-modal-close-button"
          >
            수정 완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
