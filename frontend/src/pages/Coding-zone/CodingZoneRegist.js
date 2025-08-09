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

  useEffect(() => {
    const loadSubjects = async () => {
      const res = await fetchAllSubjects(
        cookies.accessToken,
        setCookie,
        navigate
      );
      if (res?.code === "SU" && Array.isArray(res.data)) {
        setSubjects(res.data); // [{subjectId, subjectName}, ...]
      } else {
        alert("과목 목록을 불러오지 못했습니다.");
      }
    };
    loadSubjects();
  }, [cookies.accessToken, setCookie, navigate]);

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
        alert("성공적으로 등록되었습니다.");
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
    setBoxes([
      ...boxes,
      {
        day: "",
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
          <div className="main-category-name-container2">
            <div className="separator2"></div>
            <div className="element-title2">
              <div className="part1-element-title2">
                <p className="weekDay2">요일</p>
                <p className="classDate2">날짜</p>
                <p className="weekTime2">시간</p>
              </div>
              <div className="part2-element-title2">
                <p className="className2">과목명</p>
              </div>
              <div className="part3-element-title2">
                <p className="assistent2">조교</p>
                <p className="maxPers2">인원</p>
              </div>
            </div>
            <div className="separator"></div>
          </div>
          <div className="class-input-container">
            {boxes.map((box, index) => (
              <div key={index} className="class-input-box">
                <select
                  className="Day-input"
                  value={box.day}
                  onChange={(e) => handleChange(index, "day", e.target.value)}
                >
                  <option value="">요일 선택</option>
                  <option value="월요일">MON</option>
                  <option value="화요일">TUE</option>
                  <option value="수요일">WED</option>
                  <option value="목요일">THU</option>
                  <option value="금요일">FRI</option>
                </select>
                <input
                  className={`Date-input ${
                    box.date && !isValidDate(box.date) ? "invalid-date" : ""
                  }`}
                  placeholder="ex) 03-17"
                  value={box.date}
                  onChange={(e) => handleChange(index, "date", e.target.value)}
                />
                <select
                  className="Time-input"
                  value={box.time}
                  onChange={(e) => handleChange(index, "time", e.target.value)}
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
                <select
                  className="ClassName-input"
                  value={box.subjectId || ""}
                  onChange={(e) => handleSubjectChange(index, e.target.value)}
                >
                  <option value="">과목 선택</option>
                  {subjects.map((subject) => (
                    <option key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
                <select
                  className="Assistant-input"
                  value={box.assistant || ""}
                  onChange={(e) =>
                    handleChange(index, "assistant", e.target.value)
                  }
                  disabled={!box.subjectId || assistantLoading[index]}
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
                      {(assistantOptionsMap[index] || []).map((name, i) => (
                        <option key={i} value={name}>
                          {name}
                        </option>
                      ))}
                    </>
                  )}
                </select>

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
                />
                <button
                  onClick={() => removeBox2(index)}
                  class="custom-btn btn-6"
                >
                  X
                </button>
              </div>
            ))}
          </div>
          <div className="button-area2">
            <div>
              <button onClick={addBox} class="custom-btn btn-5">
                추가
              </button>
            </div>
            <div className="class-submit-button">
              <button onClick={handleSubmit}>등록</button>
            </div>
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
          <div className="category-bar">
            <div className="inner-category-bar">
              <span className="main-span2"></span>
              <button className={`reset-button`} onClick={handleResetSemester}>
                학기 초기화
              </button>
            </div>
            <div className="inner-category-bar2">
              <button
                className={`Agroup-button ${groupId === "A" ? "active" : ""}`}
                onClick={() => setGroupId("A")}
              >
                A 조
              </button>
              <span className="main-span2"> | </span>
              <button
                className={`Bgroup-button ${groupId === "B" ? "active" : ""}`}
                onClick={() => setGroupId("B")}
              >
                B 조
              </button>
            </div>
          </div>
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default CodingZoneRegist;
