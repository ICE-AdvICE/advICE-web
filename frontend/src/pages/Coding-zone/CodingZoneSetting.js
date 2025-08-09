import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/codingzone/Codingzone_setting.css";
import "../css/codingzone/codingzone-main.css";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js";
import Banner from "../../shared/ui/Banner/Banner";
import CodingZoneBoardbar from "../../shared/ui/boardbar/CodingZoneBoardbar.js";
import { useCookies } from "react-cookie";
import { registerSubjectMapping } from "../../features/api/Admin/Codingzone/ClassApi.js";
import {
  loadIdColorMap,
  saveIdColorMap,
  getCodingZoneColor,
} from "./subjectColors";

const ClassSetting = () => {
  const [cookies, setCookie] = useCookies(["accessToken"]); // ✅ 정의됨
  const accessToken = cookies.accessToken;
  const navigate = useNavigate(); // ✅ 정의됨

  const [rows, setRows] = useState([
    { id: Date.now(), codingZone: "1", subjectName: "" },
  ]);

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
      alert("과목명이 입력된 항목이 없습니다.");
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
          <div className="setting-category-bar">
            <div className="setting-label">
              <span className="column-label1">코딩존</span>
              <span className="column-label2">과목명</span>
            </div>
          </div>
          <div className="setting-table-container">
            <table className="form-table">
              <tbody>
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
              </tbody>
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
