import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/codingzone/CodingClassRegist.css";
import { useCookies } from "react-cookie";
import InquiryModal from "./InquiryModal";
import "../css/codingzone/codingzone-main.css";
import { resetCodingZoneData } from "../../features/api/Admin/Codingzone/ClassApi";
import {
  fetchAllSubjects,
  uploadClassForWeek,
  fetchAssistantsBySubjectId,
} from "../../entities/api/CodingZone/AdminApi";
import { getczauthtypetRequest } from "../../shared/api/AuthApi";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js"; //코딩존 네이게이션 바 컴포넌트
import Banner from "../../shared/ui/Banner/Banner"; // ✅ 추가(juhui): 공통 배너 컴포넌트 적용
import CodingZoneBoardbar from "../../shared/ui/boardbar/CodingZoneBoardbar.js"; //코딩존 보드 바(버튼 네개) 컴포넌트
import AlertModal from "../../shared/components/Modal/AlertModal.js";

const CodingZoneRegist = () => {
  const [boxes, setBoxes] = useState([]);
  const [groupId, setGroupId] = useState("A");
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [activeCategory, setActiveCategory] = useState("registerClass");
  const [authMessage, setAuthMessage] = useState("");
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [showManageAllButton, setShowManageAllButton] = useState(false);
  const [showRegisterClassButton, setShowRegisterClassButton] = useState(false);
  const token = cookies.accessToken;
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [assistantOptionsMap, setAssistantOptionsMap] = useState({});
  const [assistantLoading, setAssistantLoading] = useState({});
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // MM-DD → 요일 자동 계산 함수
  const weekDayFromDate = (mmdd) => {
    if (!mmdd || !/^\d{2}-\d{2}$/.test(mmdd)) return "";
    const currentYear = new Date().getFullYear();
    const [month, day] = mmdd.split("-");
    const date = new Date(`${currentYear}-${month}-${day}T00:00:00`);
    const ko = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    return ko[date.getDay()];
  };

  function getDefaultRow() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${month}-${day}`; // MM-DD
    const weekDay = weekDayFromDate(formattedDate); // 요일 자동 계산

    return {
      day: weekDay, // 날짜에 맞는 요일 자동 설정
      date: formattedDate,
      time: "",
      className: "",
      assistant: "",
      maxPers: "",
      subjectId: "",
    };
  }

  // 응답 안쪽에 숨어있는 "첫 번째 배열"을 찾아 반환
  const findFirstArray = (v) => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        const found = findFirstArray(v[k]);
        if (found) return found;
      }
    }
    return null;
  };

  // 서버 키 → 프론트 표준 키(subjectId/subjectName)로 정규화
  const normalizeSubject = (m) => ({
    subjectId: String(
      m?.subjectId ??
        m?.subject_id ??
        m?.codingZone ??
        m?.zone ??
        m?.id ??
        m?.code ??
        m?.value ??
        ""
    ),
    subjectName: String(
      m?.subjectName ??
        m?.subject_name ??
        m?.name ??
        m?.title ??
        m?.label ??
        m?.text ??
        ""
    ),
  });

  //과목에 해당하는 조교 불러오기
  const handleSubjectChange = async (rowIndex, subjectId) => {
    const selected = subjects.find(
      (s) => String(s.subjectId) === String(subjectId)
    );
    const subjectName = selected?.subjectName || "";

    handleChange(rowIndex, "subjectId", subjectId);
    handleChange(rowIndex, "className", subjectName);
    handleChange(rowIndex, "assistant", "");

    if (!subjectId) {
      setAssistantOptionsMap((prev) => ({ ...prev, [rowIndex]: [] }));
      return;
    }

    try {
      setAssistantLoading((prev) => ({ ...prev, [rowIndex]: true }));
      const res = await fetchAssistantsBySubjectId(
        subjectId,
        cookies.accessToken,
        setCookie,
        navigate
      );

      if (res?.code === "SU" && Array.isArray(res.data?.assistantNames)) {
        setAssistantOptionsMap((prev) => ({
          ...prev,
          [rowIndex]: res.data.assistantNames,
        }));
      } else {
        setAssistantOptionsMap((prev) => ({ ...prev, [rowIndex]: [] }));
      }
    } catch (err) {
      console.error("조교 목록 불러오기 실패:", err);
      setAssistantOptionsMap((prev) => ({ ...prev, [rowIndex]: [] }));
    } finally {
      setAssistantLoading((prev) => ({ ...prev, [rowIndex]: false }));
    }
  };

  // 컴포넌트 마운트 시 초기 행 추가
  useEffect(() => {
    if (boxes.length === 0) {
      setBoxes([getDefaultRow()]);
    }
  }, []);

  useEffect(() => {
    if (!cookies.accessToken) return; // 토큰 준비 전 호출 방지

    const loadSubjects = async () => {
      try {
        const res = await fetchAllSubjects(
          cookies.accessToken,
          setCookie,
          navigate
        );

        console.debug("[subjects] raw response:", res);
        // 1) 최상위가 배열
        if (Array.isArray(res)) {
          const list = res
            .map(normalizeSubject)
            .filter((s) => s.subjectId && s.subjectName);
          setSubjects(list);
          return;
        }

        // 2) 객체라면: 안쪽 어디든 배열이 있으면 성공으로 간주
        if (res && typeof res === "object") {
          const arr = findFirstArray(res);
          if (Array.isArray(arr)) {
            const list = arr
              .map(normalizeSubject)
              .filter((s) => s.subjectId && s.subjectName);
            console.debug("[subjects] parsed list:", list);
            setSubjects(list);
            return;
          }

          // 3) 여기까지 왔으면 '진짜' 실패 코드만 처리
          if ("code" in res) {
            if (res.code === "NOT_ANY_MAPPINGSET") {
              setSubjects([]); // 등록된 과목 없음(정상)
              return;
            }
            console.warn("[subjects] load error:", res.code, res?.message);
          } else {
            console.warn("[subjects] unexpected shape with no array");
          }
          setSubjects([]);
          return;
        }

        // 4) 예상 못한 타입
        setSubjects([]);
      } catch (e) {
        console.error("과목 목록 불러오기 실패:", e);
        setSubjects([]);
      }
    };

    loadSubjects();
  }, [cookies.accessToken]); // setCookie/navigate는 의존성에서 빼세요(불필요 재호출 방지)

  useEffect(() => {
    const fetchAuthType = async () => {
      const response = await getczauthtypetRequest(token, setCookie, navigate);
      if (response) {
        switch (response.code) {
          case "CA":
            setShowAdminButton(true);
            break;
          case "EA":
            setShowRegisterClassButton(true);
            setShowManageAllButton(true);
            break;
          case "NU":
            alert("로그인 시간이 만료되었습니다. 다시 로그인 해주세요.");
            navigate("/");
            break;
          default:
            setShowAdminButton(false);
            setShowManageAllButton(false);
            setShowRegisterClassButton(false);
            break;
        }
      }
    };

    fetchAuthType();
  }, [token, authMessage]);

  //수업 등록 API 응답 함수
  const handleuploadClassForWeekResponse = (response) => {
    if (!response) {
      alert("오류 발생: 네트워크 상태를 확인해주세요.");
      return;
    }
    const { code, message } = response;
    switch (code) {
      case "SU":
        // 커스텀 모달로 성공 메시지 표시
        setAlertMessage(
          "입력하신 정보가 성공적으로 등록되었습니다.<br style={{ marginBottom: '8px' }}/>등록 현황은 코딩존 예약 페이지에서 확인하실 수 있습니다."
        );
        setAlertModalOpen(true);
        break;
      case "AF":
        alert("권한이 없습니다.");
        break;
      case "NU":
        alert("로그인 시간이 만료되었습니다. 다시 로그인 해주세요.");
        navigate("/");
        break;
      case "DBE":
        alert("데이터베이스 오류입니다.");
        break;
      default:
        alert("오류 발생: " + message);
        break;
    }
  };

  //학기 초기화 API 응답 함수
  const handleResetResponse = (response) => {
    if (!response) {
      alert("오류 발생: 네트워크 상태를 확인해주세요.");
      return;
    }
    const { code, message } = response;
    switch (code) {
      case "SU":
        alert("학기 초기화가 성공적으로 완료되었습니다.");
        refreshPage(); // 페이지 새로고침으로 UI를 업데이트
        break;
      case "AF":
        alert("권한이 없습니다.");
        break;
      case "NU":
        alert("로그인 시간이 만료되었습니다. 다시 로그인 해주세요.");
        navigate("/");
        break;
      case "DBE":
        alert("데이터베이스 오류입니다.");
        break;
      default:
        alert("오류 발생: " + message);
        break;
    }
  };

  //새로고침 함수
  const refreshPage = () => {
    window.location.reload();
  };

  //수업 등록을 위한 functions
  const addBox = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${month}-${day}`; // MM-DD 형식
    const weekDay = weekDayFromDate(formattedDate); // 요일 자동 계산

    setBoxes([
      ...boxes,
      {
        day: weekDay, // 날짜에 맞는 요일 자동 설정
        date: formattedDate,
        time: "",
        className: "",
        assistant: "",
        maxPers: "",
        subjectId: "",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const newBoxes = [...boxes];
    newBoxes[index][field] = value;

    // 날짜가 변경되면 요일도 자동으로 업데이트
    if (field === "date" && value) {
      const weekDay = weekDayFromDate(value);
      newBoxes[index].day = weekDay;
    }

    setBoxes(newBoxes);
  };

  const handleSubmit = async () => {
    const allFilled = boxes.every((box) =>
      Object.values(box).every(
        (value) =>
          value.trim() !== "" && (box.date ? isValidDate(box.date) : true)
      )
    );
    if (!allFilled) {
      alert(
        "입력하지 않은 정보가 있거나, 입력 형식이 잘못되었습니다. 다시 확인해 주세요."
      );
      return;
    }
    const currentYear = new Date().getFullYear();
    const formattedData = boxes.map((box) => {
      const dateParts = box.date ? box.date.split("-") : ["01", "01"];
      const [month, day] = dateParts;
      const formattedDate = `${currentYear}-${month.padStart(
        2,
        "0"
      )}-${day.padStart(2, "0")}`;

      return {
        assistantName: box.assistant,
        classDate: formattedDate,
        classTime: box.time,
        className: box.className,
        maximumNumber: parseInt(box.maxPers),
        weekDay: box.day,
        subjectId: parseInt(box.subjectId),
        groupId: groupId,
        currentNumber: 0,
      };
    });
    const response = await uploadClassForWeek(
      formattedData,
      cookies.accessToken,
      setCookie,
      navigate
    );
    handleuploadClassForWeekResponse(response);
  };

  const removeBox2 = (index) => {
    setBoxes((currentBoxes) => currentBoxes.filter((_, i) => i !== index));
  };

  //학기 초가화 버튼을 위한 function
  const handleResetSemester = async () => {
    // 사용자에게 확인 받기
    if (window.confirm("정말 코딩존 관련 모든 정보를 초기화하시겠습니까?")) {
      const response = await resetCodingZoneData(
        cookies.accessToken,
        setCookie,
        navigate
      );
      handleResetResponse(response);
    } else {
    }
  };

  // 날짜 등록 칸에서 맞는 유형인지 확인 함수
  const isValidDate = (date) => {
    if (!date) return true; // 입력 값이 비어있으면 유효한 것으로 간주합니다.
    const regex = /^(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/; // 'MM-DD' 형식 검사
    if (!regex.test(date)) {
      return false;
    }

    const [month, day] = date.split("-").map(Number); // 문자열을 숫자로 변환
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }
    return true;
  };

  //수업 등록 페이지
  const renderActiveSection = () => {
    if (activeCategory === "registerClass") {
      return (
        <>
          {/* 버튼들을 표 바로 위에 배치 */}
          <div className="table-controls">
            <button className={`reset-button`} onClick={handleResetSemester}>
              학기 초기화
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className={`Agroup-button ${groupId === "A" ? "active" : ""}`}
                onClick={() => setGroupId("A")}
              >
                A 조
              </button>
              <button
                className={`Bgroup-button ${groupId === "B" ? "active" : ""}`}
                onClick={() => setGroupId("B")}
              >
                B 조
              </button>
            </div>
          </div>

          {/* 실제 table 태그를 사용한 수업 등록 표 */}
          <div
            className="regist-table-card"
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              marginBottom: "100px",
            }}
          >
            <table className="regist-table" style={{ width: "1100px" }}>
              <thead>
                <tr>
                  <th style={{ width: "12%" }}>요일</th>
                  <th style={{ width: "12%" }}>날짜</th>
                  <th style={{ width: "12%" }}>시간</th>
                  <th style={{ width: "32%" }}>과목명</th>
                  <th style={{ width: "20%" }}>조교</th>
                  <th style={{ width: "12%" }}>인원</th>
                  <th style={{ width: "5%" }}></th>
                </tr>
              </thead>
              <tbody>
                {boxes.map((box, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        className="Day-input"
                        type="text"
                        placeholder="요일"
                        value={box.day}
                        onChange={(e) =>
                          handleChange(index, "day", e.target.value)
                        }
                        style={{
                          width: "90%",
                          padding: "11px 8px",
                          border: "1px solid #cfd8e3",
                          borderRadius: "5px",
                          fontSize: "14px",
                          textAlign: "center",
                        }}
                        readOnly // 자동 계산되므로 읽기 전용
                      />
                    </td>
                    <td>
                      <input
                        className={`Date-input ${
                          box.date && !isValidDate(box.date)
                            ? "invalid-date"
                            : ""
                        }`}
                        placeholder="ex) 03-17"
                        value={box.date}
                        onChange={(e) =>
                          handleChange(index, "date", e.target.value)
                        }
                        style={{
                          width: "90%",
                          padding: "11px 8px",
                          border: "1px solid #cfd8e3",
                          borderRadius: "5px",
                          fontSize: "14px",
                          textAlign: "center",
                        }}
                      />
                    </td>
                    <td>
                      <select
                        className="Time-input"
                        value={box.time}
                        onChange={(e) =>
                          handleChange(index, "time", e.target.value)
                        }
                        style={{
                          width: "90%",
                          padding: "12px 8px",
                          border: "1px solid #cfd8e3",
                          borderRadius: "5px",
                          fontSize: "14px",
                          paddingLeft: "9px",
                          paddingRight: "9px",
                          textAlign: "center",
                        }}
                      >
                        <option value="">시간 선택</option>
                        <option value="09:00:00">09:00</option>
                        <option value="10:00:00">10:00</option>
                        <option value="11:00:00">11:00</option>
                        <option value="12:00:00">12:00</option>
                        <option value="13:00:00">13:00</option>
                        <option value="14:00:00">14:00</option>
                        <option value="15:00:00">15:00</option>
                        <option value="16:00:00">16:00</option>
                        <option value="17:00:00">17:00</option>
                        <option value="18:00:00">18:00</option>
                        <option value="19:00:00">19:00</option>
                        <option value="20:00:00">20:00</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="ClassName-input"
                        value={box.subjectId || ""}
                        onChange={(e) =>
                          handleSubjectChange(index, e.target.value)
                        }
                        style={{
                          width: "90%",
                          padding: "12px 8px",
                          border: "1px solid #cfd8e3",
                          borderRadius: "5px",
                          fontSize: "14px",
                          paddingLeft: "9px",
                          paddingRight: "9px",
                          textAlign: "center",
                        }}
                      >
                        <option value="">과목 선택</option>
                        {subjects.map((subject) => (
                          <option
                            key={subject.subjectId}
                            value={subject.subjectId}
                          >
                            {subject.subjectName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="Assistant-input"
                        value={box.assistant || ""}
                        onChange={(e) =>
                          handleChange(index, "assistant", e.target.value)
                        }
                        disabled={!box.subjectId || assistantLoading[index]}
                        style={{
                          width: "90%",
                          padding: "12px 8px",
                          border: "1px solid #cfd8e3",
                          borderRadius: "5px",
                          fontSize: "14px",
                          paddingLeft: "9px",
                          paddingRight: "9px",
                          textAlign: "center",
                        }}
                      >
                        {!box.subjectId ? (
                          <option value="">먼저 과목을 선택하세요</option>
                        ) : assistantLoading[index] ? (
                          <option value="">불러오는 중...</option>
                        ) : (assistantOptionsMap[index] || []).length === 0 ? (
                          <option value="">해당 과목의 조교가 없습니다</option>
                        ) : (
                          <>
                            <option value="">조교 선택</option>
                            {(assistantOptionsMap[index] || []).map(
                              (name, i) => (
                                <option key={i} value={name}>
                                  {name}
                                </option>
                              )
                            )}
                          </>
                        )}
                      </select>
                    </td>
                    <td>
                      <input
                        className="MaxPers-input"
                        type="number"
                        placeholder="MaxPer"
                        min="1"
                        step="1"
                        value={box.maxPers}
                        onChange={(e) =>
                          handleChange(index, "maxPers", e.target.value)
                        }
                        style={{
                          width: "90%",
                          padding: "11px 8px",
                          border: "1px solid #cfd8e3",
                          borderRadius: "5px",
                          fontSize: "14px",
                          textAlign: "center",
                        }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => removeBox2(index)}
                        className="custom-btn btn-6"
                      >
                        <span className="delete-icon">X</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 추가와 등록 버튼을 표의 우측 하단에 배치 */}
          <div className="table-action-buttons">
            <button onClick={addBox} className="custom-btn btn-5">
              추가
            </button>
            <button onClick={handleSubmit} className="custom-btn btn-submit">
              등록
            </button>
          </div>
        </>
      );
    }
    return null;
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
          {renderActiveSection()}
        </div>
      </div>

      {/* AlertModal 추가 */}
      {alertModalOpen && (
        <AlertModal
          isOpen={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
        >
          {alertMessage}
        </AlertModal>
      )}
    </div>
  );
};

export default CodingZoneRegist;
