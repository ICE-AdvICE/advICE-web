import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fetchClassesBySubjectAndDate,
  adminDeleteCodingzoneClassByClassNum,
  adminUpdateCodingzoneClassByClassNum,
} from "../../entities/api/CodingZone/AdminApi";
import {
  computeStatusByDate,
  formatHHmmRangeFromStart,
} from "../../shared/lib/codingzoneStatus";
import "./SubjectClassesTable.css";
import EditModal from "../../shared/components/Modal/EditModal.jsx";
import AlertModal from "../../shared/components/Modal/AlertModal.js";

export default function SubjectClassesTable({
  selectedDateYMD, // "YYYY-MM-DD"
  selectedSubjectId, // string | number
  selectedSubjectName, // 화면 표기용
  accessToken,
  setCookie,
  navigate,
  subjectOptions = [],
  onEmptyAfterDelete,
  onDateChanged,
  seedRows = [],
  isEditing = false, // 수정 중인지 여부
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const inFlightRef = useRef(false);

  useEffect(() => {
    // 일반적인 데이터 로딩 로직

    let ignore = false;
    const run = async () => {
      if (!selectedDateYMD || !selectedSubjectId) return;
      setLoading(true);
      setErr("");
      try {
        const res = await fetchClassesBySubjectAndDate(
          selectedSubjectId,
          selectedDateYMD,
          accessToken,
          setCookie,
          navigate
        );
        if (ignore) return;
        if (res?.code === "SU") {
          const next = Array.isArray(res.data) ? res.data : [];
          if (next.length > 0) {
            setRows(next);
          } else {
            // SU지만 빈 배열이면, 시드가 있으면 유지하고 에러 메시지도 숨김
            if (!(Array.isArray(seedRows) && seedRows.length > 0)) {
              setRows([]);
            }
          }
        } else {
          setRows([]);
          setErr(res?.message || "목록 조회 실패");
        }
      } catch {
        if (!ignore) {
          setRows([]);
          setErr("네트워크/서버 오류");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [
    selectedSubjectId,
    selectedDateYMD,
    accessToken,
    setCookie,
    navigate,
    seedRows,
  ]);

  // 날짜가 변경될 때 과목 선택 초기화 (단, 과목이 이미 선택된 상태가 아닐 때만)
  useEffect(() => {
    if (typeof onEmptyAfterDelete === "function" && !selectedSubjectId) {
      onEmptyAfterDelete();
    }
  }, [selectedDateYMD, onEmptyAfterDelete, selectedSubjectId]);

  // 강력 새로고침: 현재 날짜/과목 기준으로 서버에서 다시 불러오기
  const reloadRows = async ({ silent = false } = {}) => {
    if (!selectedDateYMD || !selectedSubjectId) return;
    if (inFlightRef.current) return;
    try {
      inFlightRef.current = true;
      if (!silent) setLoading(true);
      const res = await fetchClassesBySubjectAndDate(
        selectedSubjectId,
        selectedDateYMD,
        accessToken,
        setCookie,
        navigate
      );
      if (res?.code === "SU") {
        const next = Array.isArray(res.data) ? res.data : [];
        // 서버가 아직 빈 상태면, 시드가 있으면 유지하여 사용자가 즉시 결과를 볼 수 있게 함
        if (
          next.length === 0 &&
          Array.isArray(seedRows) &&
          seedRows.length > 0
        ) {
          setRows(seedRows);
          if (!silent) setErr("");
        } else {
          setRows(next);
          if (!silent) setErr("");
        }
      } else {
        // 실패 시에도 시드가 있으면 시드 유지
        if (Array.isArray(seedRows) && seedRows.length > 0) {
          setRows(seedRows);
          if (!silent) setErr("");
        } else {
          setRows([]);
          if (!silent) setErr(res?.message || "목록 조회 실패");
        }
      }
    } catch {
      // 네트워크 오류 시에도 시드가 있으면 시드 유지
      if (Array.isArray(seedRows) && seedRows.length > 0) {
        setRows(seedRows);
        if (!silent) setErr("");
      } else {
        setRows([]);
        if (!silent) setErr("네트워크/서버 오류");
      }
    } finally {
      if (!silent) setLoading(false);
      inFlightRef.current = false;
    }
  };

  // 서버 재조회 재시도 (간헐적 캐시/레이스 상황 대비)
  const reloadRowsWithRetry = async (retries = 2, delayMs = 250) => {
    for (let i = 0; i <= retries; i++) {
      await reloadRows({ silent: i > 0 });
      // 성공: 에러 메시지 없고, rows가 배열이면 종료
      if (!err) return;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  };

  // 주기적 자동 새로고침 (사용자 개입 없이 최신 상태 유지)
  useEffect(() => {
    const POLL_MS = 10000; // 10초 간격으로 폴링 간격 늘림
    let timer = null;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        reloadRows({ silent: true });
      }, POLL_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    start();
    return () => stop();
  }, [selectedDateYMD, selectedSubjectId, accessToken]);

  // 화면 재포커스/가시화 시 즉시 새로고침
  useEffect(() => {
    const onFocus = () => reloadRows();
    const onVisible = () => {
      if (!document.hidden) reloadRows();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [selectedDateYMD, selectedSubjectId]);
  // 행 단위 삭제 핸들러
  const handleRowDelete = async (row) => {
    if (!window.confirm("해당 수업을 삭제하시겠습니까?")) return;
    const res = await adminDeleteCodingzoneClassByClassNum(
      row.id,
      accessToken,
      setCookie,
      navigate
    );
    if (res.ok) {
      // 성공하면 현재 rows 상태에서 삭제한 행 제거
      setRows((prev) => {
        const next = prev.filter((it) => it.classNum !== row.id);
        // ✅ 다음 상태가 0개일 때에만 부모에 알림(과목선택으로 돌아갈 준비)
        if (next.length === 0 && typeof onEmptyAfterDelete === "function") {
          onEmptyAfterDelete();
        }
        return next;
      });
      alert("삭제되었습니다.");
    } else {
      switch (res.code) {
        case "ALREADY_RESERVED_CLASS":
          alert("이미 예약자가 있어 삭제할 수 없습니다.");
          break;
        case "AF":
          alert("권한이 없습니다.");
          break;
        case "DBE":
          alert("데이터베이스 오류가 발생했습니다.");
          break;
        default:
          alert(res.message ?? "삭제 실패");
      }
    }
  };

  const view = useMemo(() => {
    const toNum = (v) => {
      if (v === null || v === undefined) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const timeToMinutes = (t) => {
      if (!t) return 0;
      const [hh, mm] = String(t)
        .split(":")
        .map((x) => parseInt(x, 10));
      return (
        (Number.isFinite(hh) ? hh : 0) * 60 + (Number.isFinite(mm) ? mm : 0)
      );
    };
    const sorted = [...rows].sort(
      (a, b) => timeToMinutes(a.classTime) - timeToMinutes(b.classTime)
    );
    return sorted.map((r) => {
      const curr = toNum(r.currentNumber);
      const max = toNum(r.maximumNumber);
      // 날짜+시간 기준 상태 계산: 오늘이면 시간대 반영, 과거/미래는 날짜로 판정
      const computeStatus = () => {
        const today = new Date();
        const toYMD = (d) => {
          const y = d.getFullYear();
          const m2 = String(d.getMonth() + 1).padStart(2, "0");
          const d2 = String(d.getDate()).padStart(2, "0");
          return `${y}-${m2}-${d2}`;
        };
        const todayYMD = toYMD(today);
        if (todayYMD < selectedDateYMD) return "예약대기";
        if (todayYMD > selectedDateYMD) return "진행종료";
        // 오늘 = 선택 날짜 → 시간 비교
        const [hh, mm] = String(r.classTime || "00:00")
          .split(":")
          .map((x) => parseInt(x, 10));
        const startMinutes =
          (Number.isFinite(hh) ? hh : 0) * 60 + (Number.isFinite(mm) ? mm : 0);
        const nowMinutes = today.getHours() * 60 + today.getMinutes();
        if (nowMinutes < startMinutes) return "예약대기";
        if (nowMinutes < startMinutes + 60) return "진행중"; // 기본 60분 수업 가정
        return "진행종료";
      };
      const statusText = computeStatus();
      return {
        id: r.classNum, // 고유키
        timeText: formatHHmmRangeFromStart(r.classTime), // "HH:mm ~ HH:mm"
        assistantName: r.assistantName || "-",
        groupName: r.groupId || "-",
        subjectName: selectedSubjectName || "-",
        status: statusText,
        _raw: {
          classNum: r.classNum,
          classDate: selectedDateYMD,
          weekDay: "",
          classTime: r.classTime,
          className: r.className,
          assistantName: r.assistantName,
          maximumNumber: r.maximumNumber,
          groupId: r.groupId,
          subjectId: selectedSubjectId,
        },
        currentNumber: curr ?? 0,
        maximumNumber: max, // null이면 미표시용
        capacityText: `${curr ?? 0} / ${max ?? "-"}`, // 항상 "current / maximum"
      };
    });
  }, [rows, selectedDateYMD, selectedSubjectName, selectedSubjectId]);

  // 모달 관련 함수들을 useCallback으로 최적화
  const handleCloseAlertModal = useCallback(() => {
    setAlertModalOpen(false);
    // 성공 모달이었다면 리스트만 새로고침
    if (alertMessage.includes("수정이 완료되었습니다")) {
      reloadRows();
    }
  }, [alertMessage, reloadRows]);

  if (!selectedSubjectId || !selectedDateYMD) return null;

  return (
    <section className="cz-table-wrap">
      <h3 className="cz-table-title">
        <span className="subject-name">{selectedSubjectName}</span>
        <span className="title-label"> 코딩존 등록 현황</span>
      </h3>

      {/* 과목 다시 선택하기 버튼 - 로딩 완료 후에만 표시 */}
      {!loading && (
        <div style={{ textAlign: "left", marginBottom: "15px" }}>
          <button
            className="return return-back"
            type="button"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
              // 부모 컴포넌트에 과목 선택 해제 요청
              if (typeof onEmptyAfterDelete === "function") {
                onEmptyAfterDelete();
              }
            }}
          >
            <img
              src={isHovered ? "/left.png" : "/leftnone.png"}
              alt="뒤로가기"
              className="btn-icon"
              draggable="false"
            />
            과목 다시 선택하기
          </button>
        </div>
      )}

      {loading && <div className="cz-table-msg">불러오는 중…</div>}
      {err && !loading && <div className="cz-table-msg error">{err}</div>}
      {!loading && !err && view.length === 0 && (
        <div className="panel-block panel-gray">
          <div className="panel-empty">
            현재 날짜에 등록된 코딩존이 없습니다.
          </div>
        </div>
      )}

      {!loading && view.length > 0 && (
        <div className="cz-table-shell">
          <div className="cz-table-scroll">
            <table className="cz-table">
              <thead>
                <tr className="cz-table-header">
                  <th>시간</th>
                  <th>조교명</th>
                  <th>조 정보</th>
                  <th>인원</th>
                  <th>등록상태</th>
                  <th></th> {/* ← 삭제(X) */}
                </tr>
              </thead>
              <tbody>
                {view.map((r) => (
                  <tr key={r.id}>
                    <td>{r.timeText}</td>
                    <td>{r.assistantName}</td>
                    <td>{r.groupName}</td>
                    <td>
                      <span
                        className={
                          r.maximumNumber !== null &&
                          r.currentNumber >= r.maximumNumber
                            ? "cz-capacity full"
                            : "cz-capacity"
                        }
                      >
                        {r.capacityText}
                      </span>
                    </td>
                    <td className="cz-actions">
                      <div className="cz-actions-inner">
                        <StatusBadge text={r.status} />
                        <button
                          className="cz-btn"
                          disabled={
                            r.status === "진행중" || r.status === "진행종료"
                          }
                          title={
                            r.status === "진행중" || r.status === "진행종료"
                              ? "진행중/진행종료 수업은 수정할 수 없습니다."
                              : "수정하기"
                          }
                          onClick={() => {
                            console.log("=== 수정하기 버튼 클릭됨! ===");
                            console.log(
                              "수정하기 버튼 클릭됨! r._raw:",
                              r._raw
                            );
                            setEditSubmitting(false);
                            setEditTarget(r._raw);
                            setEditOpen(true);
                            console.log("모달 열기 완료");
                          }}
                        >
                          수정 하기
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className="cz-btn cz-btn-danger"
                        disabled={
                          r.status === "진행중" || r.status === "진행종료"
                        }
                        title={
                          r.status === "진행중" || r.status === "진행종료"
                            ? "진행중/진행종료 수업은 삭제할 수 없습니다."
                            : "삭제"
                        }
                        onClick={() => handleRowDelete(r)}
                        aria-label="삭제"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {editOpen && (
        <EditModal
          key={editTarget ? editTarget.classNum : "none"}
          isOpen={editOpen}
          onClose={() => {
            setEditSubmitting(false);
            setEditOpen(false);
            setEditTarget(null);
          }}
          initialValues={editTarget}
          onSubmit={async (payload) => {
            console.log("=== onSubmit 함수 시작! ===");
            console.log("payload:", payload);
            if (!editTarget?.classNum) return;

            const newDate = payload?.classDate || selectedDateYMD;
            const dateChanged = String(newDate) !== String(selectedDateYMD);
            const subjectChanged =
              payload?.subjectId &&
              String(payload.subjectId) !== String(selectedSubjectId);

            // 프론트엔드에서 중복 검사 (조, 날짜, 시간, 과목명, 조교명만 - 인원수 제외)
            const isDuplicate = rows.some(
              (row) =>
                row.classNum !== editTarget.classNum && // 자기 자신 제외
                row.groupId === payload.groupId &&
                row.classDate === payload.classDate &&
                row.classTime === payload.classTime &&
                row.subjectId === payload.subjectId &&
                row.assistantName === payload.assistantName
            );

            // 중복이면 바로 alert 표시하고 종료
            if (isDuplicate) {
              setTimeout(() => {
                alert("이미 등록된 수업입니다.");
                // alert 닫힌 후 리스트 새로고침
                setTimeout(() => reloadRows({ silent: true }), 100);
              }, 100);
              return;
            }

            // 서버 응답을 먼저 확인
            setEditSubmitting(true);
            let res = null;
            try {
              res = await adminUpdateCodingzoneClassByClassNum(
                editTarget.classNum,
                payload,
                accessToken,
                setCookie,
                navigate
              );

              // 수정 모달 먼저 닫기
              setEditOpen(false);
              setEditTarget(null);

              // 서버 응답에 따라 적절한 처리
              if (res?.ok) {
                // 성공한 경우에만 UI 업데이트 및 성공 모달 표시
                if (dateChanged || subjectChanged) {
                  // 날짜나 과목이 변경된 경우: 현재 페이지에서 제거
                  setRows((prev) =>
                    prev.filter((it) => it.classNum !== editTarget.classNum)
                  );

                  // 약간의 지연 후 성공 모달 표시
                  setTimeout(() => {
                    setAlertMessage(
                      "수정이 완료되었습니다.<br style={{ marginBottom: '8px' }}/>변경사항을 확인하고 싶으시다면 변경된 날짜/과목으로 이동해주세요."
                    );
                    setAlertModalOpen(true);
                  }, 100);
                } else {
                  // 동일 날짜/과목: 현재 리스트 항목만 갱신
                  setRows((prev) =>
                    prev.map((it) =>
                      it.classNum === editTarget.classNum
                        ? {
                            ...it,
                            classDate: payload.classDate,
                            classTime: payload.classTime,
                            assistantName: payload.assistantName,
                            maximumNumber: payload.maximumNumber,
                            groupId: payload.groupId,
                            className: payload.className,
                          }
                        : it
                    )
                  );

                  // 약간의 지연 후 성공 모달 표시
                  setTimeout(() => {
                    setAlertMessage("수정이 완료되었습니다.");
                    setAlertModalOpen(true);
                  }, 100);
                }
              } else {
                // 실패한 경우: JavaScript 내장 alert만 사용 (모달은 표시하지 않음)
                setTimeout(() => {
                  if (res?.code === "NOT_MODIFIED_INFO") {
                    alert("변경사항이 없습니다.");
                    // alert 닫힌 후 리스트 새로고침
                    setTimeout(() => reloadRows({ silent: true }), 100);
                  } else if (res?.code === "ALREADY_EXISTED_CLASS") {
                    alert("이미 등록된 수업입니다.");
                    // alert 닫힌 후 리스트 새로고침
                    setTimeout(() => reloadRows({ silent: true }), 100);
                  } else {
                    alert(res?.message || "수정에 실패했습니다.");
                    // alert 닫힌 후 리스트 새로고침
                    setTimeout(() => reloadRows({ silent: true }), 100);
                  }
                }, 100);
              }
            } catch (error) {
              console.warn("[Edit] 네트워크/서버 오류", error);

              // 수정 모달 먼저 닫기
              setEditOpen(false);
              setEditTarget(null);

              // JavaScript 내장 alert 사용
              alert("수정 중 오류가 발생했습니다.");
            } finally {
              setEditSubmitting(false);
              // 성공한 경우에만 조용한 재조회로 서버 상태와 맞춤
              if (res?.ok) {
                setTimeout(() => reloadRows({ silent: true }), 300);
              }
            }
          }}
          subjectOptions={subjectOptions}
          accessToken={accessToken}
          submitting={editSubmitting}
        />
      )}

      {/* AlertModal 추가 - 조건부 렌더링으로 성능 최적화 */}
      {alertModalOpen && (
        <AlertModal
          isOpen={alertModalOpen}
          onClose={handleCloseAlertModal}
          title="AdvICE"
          confirmText="확인"
          onConfirm={handleCloseAlertModal}
        >
          {alertMessage}
        </AlertModal>
      )}
    </section>
  );
}

function StatusBadge({ text }) {
  const statusClass =
    text === "진행중" ? "running" : text === "진행종료" ? "done" : "wait"; // 예약대기
  return <span className={`cz-badge ${statusClass}`}>{text}</span>;
}
