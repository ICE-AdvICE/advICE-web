import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/codingzone/Codingzone_setting.css";
import "../css/codingzone/codingzone-main.css";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js";
import Banner from "../../shared/ui/Banner/Banner";
import CodingZoneBoardbar from "../../shared/ui/boardbar/CodingZoneBoardbar.js";
import { useCookies } from "react-cookie";
import { registerSubjectMapping } from "../../features/api/Admin/Codingzone/ClassApi.js";
import {
  fetchAllSubjects,
  deleteSubjectMappingBySubjectId,
} from "../../entities/api/CodingZone/AdminApi";
import {
  loadIdColorMap,
  saveIdColorMap,
  getCodingZoneColor,
} from "./subjectColors";

const ClassSetting = () => {
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const accessToken = cookies.accessToken;
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  // 삭제 핸들러
  const handleDeleteExisting = async (m) => {
    const ok = window.confirm(
      `[${m.subjectId}] [${m.subjectName}]를 정말 삭제하시겠습니까?\n\n` +
        "※ 안내: 삭제시 해당과목에 등록된 조교도 함께 삭제됩니다.\n조교 등록을 다시 해주세요."
    );
    if (!ok) return;

    // 타입 혼선 방지
    setDeletingId(String(m.subjectId));

    const result = await deleteSubjectMappingBySubjectId(
      Number(m.subjectId), // path param이면 숫자로
      accessToken,
      setCookie,
      navigate
    );

    setDeletingId(null);

    if (result?.ok) {
      // 즉시 UI 반영 (새로고침 필요 없음)
      setExistingMappings((prev) =>
        prev.filter((x) => String(x.subjectId) !== String(m.subjectId))
      );
      // 선택: 서버와 재동기화하고 싶으면 주석 해제
      // await loadMappings();
    } else if (result) {
      if (result.code === "DELETE_NOT_ALLOW") {
        alert(result.message);
      } else {
        alert(`삭제 실패: ${result.message || "알 수 없는 오류"}`);
      }
    } else {
      alert("삭제 실패: 알 수 없는 오류");
    }
  };

  // 기존(서버 저장된) 매핑 리스트
  const [existingMappings, setExistingMappings] = useState([]); // [{subjectId, subjectName}]
  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState([
    { id: Date.now(), codingZone: "1", subjectName: "" },
  ]);

  // 매핑 리스트 불러오기
  const loadMappings = async () => {
    try {
      setLoading(true);
      const res = await fetchAllSubjects(accessToken, setCookie, navigate);
      // 응답 형태에 맞춰 파싱 (배열이거나 {data:[...]}일 수 있음)
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setExistingMappings(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMappings();
  }, []);

  const handleAddRow = () => {
    setRows([...rows, { id: Date.now(), codingZone: "1", subjectName: "" }]);
  };

  const handleRemoveRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleChange = (id, field, value) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmit = async () => {
    const cleaned = rows
      .map((r) => ({ ...r, subjectName: r.subjectName.trim() }))
      .filter((r) => r.subjectName !== "");

    if (cleaned.length === 0) {
      alert("과목명이 입력되지 않았습니다.");
      return;
    }

    // ID→COLOR만 저장
    const idColor = loadIdColorMap();
    cleaned.forEach((r) => {
      const id = String(parseInt(r.codingZone, 10));
      const color = getCodingZoneColor(id);
      idColor[id] = color;
    });
    saveIdColorMap(idColor);

    // 백엔드로 보낼 payload 생성(색상 제외)
    const payload = cleaned.map((r) => ({
      subjectId: parseInt(r.codingZone, 10),
      subjectName: r.subjectName,
    }));

    const result = await registerSubjectMapping(
      payload,
      accessToken,
      setCookie,
      navigate
    );

    if (result.success) {
      alert("등록 완료!");
      setExistingMappings((prev) => [...prev, ...payload]);
      setRows([{ id: Date.now(), codingZone: "1", subjectName: "" }]); // 초기화
    } else {
      alert(`등록 실패: ${result.message}`);
    }
  };

  return (
    <div className="class-regist-main-container">
      <div className="codingzone-container">
        <CodingZoneNavigation />
        <Banner src="/codingzone_attendance4.png" />
        <div className="main-body-container">
          <div className="cza_button_container" style={{ textAlign: "center" }}>
            <CodingZoneBoardbar />
          </div>
          <div className="setting-label">
            <span className="column-label1">코딩존</span>
            <span className="column-label2">과목명</span>
          </div>
          <div className="setting-table-container">
            <table className="form-table">
              {/* 이미 등록된 매핑: 항상 리스트에 남김(읽기 전용) */}
              {loading ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center" }}>
                    불러오는 중…
                  </td>
                </tr>
              ) : (
                existingMappings.map((m) => (
                  <tr
                    key={`existing-${m.subjectId}`}
                    className="registered-row"
                  >
                    <td>
                      <input value={m.subjectId} disabled />
                    </td>
                    <td className="subject-cell">
                      <input value={m.subjectName} disabled />
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteExisting(m)}
                        disabled={String(deletingId) === String(m.subjectId)}
                      >
                        {deletingId === m.subjectId ? "삭제중…" : "X"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <select
                      value={row.codingZone}
                      onChange={(e) =>
                        handleChange(row.id, "codingZone", e.target.value)
                      }
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </td>
                  <td className="subject-cell">
                    <input
                      type="text"
                      placeholder="과목명을 입력해주세요.."
                      value={row.subjectName}
                      onChange={(e) =>
                        handleChange(row.id, "subjectName", e.target.value)
                      }
                    />
                    <button
                      className="delete-btn"
                      onClick={() => handleRemoveRow(row.id)}
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </table>

            <div className="button-group">
              <button className="add-btn" onClick={handleAddRow}>
                추가
              </button>
              <button className="submit-btn" onClick={handleSubmit}>
                등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSetting;
