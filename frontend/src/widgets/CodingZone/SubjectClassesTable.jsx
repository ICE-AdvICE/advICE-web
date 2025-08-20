import React, { useEffect, useMemo, useState } from "react";
import {
  fetchClassesBySubjectAndDate,
  adminDeleteCodingzoneClassByClassNum,
} from "../../entities/api/CodingZone/AdminApi";
import {
  computeStatusByDate,
  formatHHmmRangeFromStart,
} from "../../shared/lib/codingzoneStatus";
import "./SubjectClassesTable.css";

export default function SubjectClassesTable({
  selectedDateYMD, // "YYYY-MM-DD"
  selectedSubjectId, // string | number
  selectedSubjectName, // 화면 표기용
  accessToken,
  setCookie,
  navigate,
  onEmptyAfterDelete,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
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
          setRows(Array.isArray(res.data) ? res.data : []);
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
  }, [selectedDateYMD, selectedSubjectId, accessToken, setCookie, navigate]);
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
    return rows.map((r) => {
      const curr = toNum(r.currentNumber);
      const max = toNum(r.maximumNumber);
      return {
        id: r.classNum, // 고유키
        timeText: formatHHmmRangeFromStart(r.classTime), // "HH:mm ~ HH:mm"
        assistantName: r.assistantName || "-",
        groupName: r.groupId || "-",
        subjectName: selectedSubjectName || "-",
        status: computeStatusByDate({ classDate: selectedDateYMD }), // 🔹 날짜 기준 상태
        currentNumber: curr ?? 0,
        maximumNumber: max, // null이면 미표시용
        capacityText: `${curr ?? 0} / ${max ?? "-"}`, // 항상 "current / maximum"
      };
    });
  }, [rows, selectedDateYMD, selectedSubjectName]);

  if (!selectedSubjectId || !selectedDateYMD) return null;

  return (
    <section className="cz-table-wrap">
      <h3 className="cz-table-title">
        <span className="subject-name">{selectedSubjectName}</span>
        <span className="title-label"> 코딩존 등록 현황</span>
      </h3>

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
                          disabled
                          title="조회 단계에서는 비활성화"
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
    </section>
  );
}

function StatusBadge({ text }) {
  const statusClass =
    text === "진행중" ? "running" : text === "진행종료" ? "done" : "wait"; // 예약대기
  return <span className={`cz-badge ${statusClass}`}>{text}</span>;
}
