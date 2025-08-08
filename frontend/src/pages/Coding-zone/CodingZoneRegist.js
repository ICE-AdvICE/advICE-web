import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/codingzone/CodingClassRegist.css";
import { useCookies } from "react-cookie";
import InquiryModal from "./InquiryModal";
import "../css/codingzone/codingzone-main.css";
import { resetCodingZoneData } from "../../features/api/Admin/Codingzone/ClassApi";
import {
  fetchGroupClasses,
  uploadClassForWeek,
} from "../../entities/api/CodingZone/AdminApi";
import { getczauthtypetRequest } from "../../shared/api/AuthApi";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js"; //코딩존 네이게이션 바 컴포넌트
import Banner from "../../shared/ui/Banner/Banner"; // ✅ 추가(juhui): 공통 배너 컴포넌트 적용
import CodingZoneBoardbar from "../../shared/ui/boardbar/CodingZoneBoardbar.js"; //코딩존 보드 바(버튼 네개) 컴포넌트

const CodingZoneRegist = () => {
  const [boxes, setBoxes] = useState([
    { day: "", time: "", assistant: "", className: "", grade: "", maxPers: "" },
  ]);
  const [boxes2, setBoxes2] = useState([]);
  const [groupId, setGroupId] = useState("A");
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [activeCategory, setActiveCategory] = useState("registerClass");
  const [authMessage, setAuthMessage] = useState("");
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [showManageAllButton, setShowManageAllButton] = useState(false);
  const [showRegisterClassButton, setShowRegisterClassButton] = useState(false);
  const token = cookies.accessToken;
  const [activeButton, setActiveButton] = useState("manage_class");
  const navigate = useNavigate();

  const handlecodingzonemanager = () => {
    navigate(`/coding-zone/Codingzone_Manager`);
  };

  const handleFullManagement = () => {
    navigate(`/coding-zone/Codingzone_All_Attend`);
  };

  const handleClassRegistration = () => {
    navigate(`/coding-zone/Class_Registration`);
  };

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
            setShowManageAllButton(true); // Also show '전체 관리' for EA
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
        handleCategoryClick("registerClass");
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

  const removeBox = (index) => {
    setBoxes((currentBoxes) => currentBoxes.filter((_, i) => i !== index));
  };

  //수업 등록을 위한 functions
  const addBox2 = () => {
    setBoxes2([
      ...boxes2,
      {
        day: "",
        date: "",
        time: "",
        assistant: "",
        className: "",
        grade: "",
        maxPers: "",
      },
    ]);
  };

  const handleChange2 = (index, field, value) => {
    const newBoxes2 = [...boxes2];
    newBoxes2[index][field] = value;
    setBoxes2(newBoxes2);
  };

  const handleSubmit2 = async () => {
    const allFilled = boxes2.every((box) =>
      Object.values(box).every(
        (value) =>
          value.trim() !== "" && (box.date ? isValidDate(box.date) : true)
      )
    );
    if (!allFilled) {
      alert(
        "입력하지 않은 정보가 있거나, 정보 형식이 잘못되었습니다. 다시 확인해 주세요."
      );
      return;
    }
    const currentYear = new Date().getFullYear();
    const formattedData = boxes2.map((box) => {
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
        grade: parseInt(box.grade),
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
    setBoxes2((currentBoxes) => currentBoxes.filter((_, i) => i !== index));
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

  //조 정보 등록과 수업 등록 페이지
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
                <p className="assistent2">조교</p>
              </div>
              <div className="part2-element-title2">
                <p className="className2">과목명</p>
              </div>
              <div className="part3-element-title2">
                <p className="grade2">코딩존</p>
                <p className="maxPers2">인원</p>
              </div>
            </div>
            <div className="separator"></div>
          </div>
          <div className="class-input-container">
            {boxes2.map((box, index) => (
              <div key={index} className="class-input-box">
                <select
                  className="Day-input"
                  value={box.day}
                  onChange={(e) => handleChange2(index, "day", e.target.value)}
                >
                  <option value="">Day</option>
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
                  onChange={(e) => handleChange2(index, "date", e.target.value)}
                />
                <select
                  className="Time-input"
                  value={box.time}
                  onChange={(e) => handleChange2(index, "time", e.target.value)}
                >
                  <option value="">Time</option>
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
                <input
                  className="Assistant-input"
                  placeholder="Assistant"
                  value={box.assistant}
                  onChange={(e) =>
                    handleChange2(index, "assistant", e.target.value)
                  }
                />
                <input
                  className="ClassName-input"
                  placeholder="Class Name"
                  value={box.className}
                  onChange={(e) =>
                    handleChange2(index, "className", e.target.value)
                  }
                />
                <select
                  className="Grade-input"
                  value={box.grade}
                  onChange={(e) =>
                    handleChange2(index, "grade", e.target.value)
                  }
                >
                  <option value="">코딩존</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
                <input
                  className="MaxPers-input"
                  type="number"
                  placeholder="MaxPer"
                  min="1"
                  step="1"
                  value={box.maxPers}
                  onChange={(e) =>
                    handleChange2(index, "maxPers", e.target.value)
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
              <button onClick={addBox2} class="custom-btn btn-5">
                추가
              </button>
            </div>
            <div className="class-submit-button">
              <button onClick={handleSubmit2}>등록</button>
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
        {/* ✅ 추가(juhui) : 기존 이미지 태그를 Banner 컴포넌트로 대체하여 코드 모듈화 및 재사용성 향상 */}
        <div className="main-body-container">
          <div className="cza_button_container" style={{ textAlign: "center" }}>
            <CodingZoneBoardbar />
          </div>
          <div className="category-bar">
            <div className="inner-category-bar">
              <button
                className={`category-button ${
                  activeCategory === "registerGroupInfo" ? "active" : ""
                }`}
                onClick={() => handleCategoryClick("registerGroupInfo")}
              >
                조 정보 등록
              </button>
              <span className="main-span2"> | </span>
              <button
                className={`category-button ${
                  activeCategory === "registerClass" ? "active" : ""
                }`}
                onClick={() => refreshPage()}
              >
                수업 등록
              </button>
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
