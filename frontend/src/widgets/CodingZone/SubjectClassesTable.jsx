import React, { useEffect, useMemo, useState } from "react";
import { fetchClassesBySubjectAndDate } from "../../entities/api/CodingZone/AdminApi";
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
        <div className="cz-table-msg">
          해당 날짜에 등록된 코딩존이 없습니다.
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
                        disabled
                        title="조회 단계에서는 비활성화"
                      >
                        X
                      </button>
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
