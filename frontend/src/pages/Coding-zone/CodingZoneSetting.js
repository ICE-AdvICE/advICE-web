import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/codingzone/CodingClassRegist.css";
import "../css/codingzone/codingzone_boardbar.css"; // 추가한 css
import { useCookies } from "react-cookie";
import InquiryModal from "./InquiryModal";
import "../css/codingzone/codingzone-main.css";
import { resetCodingZoneData } from "../../features/api/Admin/Codingzone/ClassApi";
import {
  uploadGroupData,
  fetchGroupClasses,
  uploadClassForWeek,
  settingCodingzone, // 코딩존 매핑..
  fetchSettingClasses, // 코딩존 매핑 정보 조회
} from "../../entities/api/CodingZone/AdminApi";
import { getczauthtypetRequest } from "../../shared/api/AuthApi";

const CodingZoneSetting = () => {
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
  const [showRegisterClassButton, setShowRegisterClassButton] = useState(false); // 수업 등록
  const [showCheckButton, setShowCheckButton] = useState(true); // 출결 확인 기본값 true
  const [showSettingCodingZone, setShowSettingCodingZone] = useState(false); // ✅코딩존 설정(NEW)

  const token = cookies.accessToken;
  const [activeButton, setActiveButton] = useState("manage_class");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedButton, setSelectedButton] = useState("attendence");

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlecodingzone = () => {
    setSelectedButton("codingzone");
    navigate("/coding-zone");
  };

  const handlecodingzonesetting = () => {
    navigate(`/coding-zone/Codingzone_Setting`);
  }; // ✅코딩존 설정(NEW)

  const handlecodingzoneattendence = () => {
    // 얘 뭥니?
    const token = cookies.accessToken;
    if (!token) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    setSelectedButton("attendence");
    navigate(`/coding-zone/Codingzone_Attendance`);
  };

  const handleInquiry = () => {
    setSelectedButton("attendence");
  };

  const handlecodingzonemanager = () => {
    navigate(`/coding-zone/Codingzone_Manager`);
  };

  const handleFullManagement = () => {
    navigate(`/coding-zone/Codingzone_All_Attend`);
  };

  const handleClassRegistration = () => {
    navigate(`/coding-zone/coding-class-regist`);
  };

  useEffect(() => {
    loadSettingClasses();
  }, [groupId]);

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
            setShowCheckButton(false); // ❌ 출결 확인 숨김
            setShowSettingCodingZone(true); // ✅ EA에게 코딩존 설정 보이게
            setShowAdminButton(true); // ✅ EA도 출결 관리 가능하게
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

  //수업 매핑
  const handleSettingcdzResponse = (response) => {
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

  //매핑 정보 등록 버튼 함수(모든 필드 채워져있는지 확인 -> 열린 박스들을 닫기 위해 새로 고침)
  const handleButtonClick = () => {
    // 모든 필드가 채워져 있는지 검사
    const allFilled = boxes.every((box) =>
      Object.values(box).every((value) => value.trim() !== "")
    );
    if (!allFilled) {
      alert("입력하지 않은 정보가 있습니다. 확인해 주세요.");
      return;
    }
    handleSubmit();

    //정상적으로 등록 됐다는 alert를 닫을 시간 제공위해 100밀리초 후에 새로고침
    setTimeout(() => {
      refreshPage();
    }, 100);
  };

  //등록된 매핑 정보 반환 API 응답 함수
  const loadSettingClasses = async () => {
    const data = await fetchSettingClasses(
      groupId,
      cookies.accessToken,
      setCookie,
      navigate
    );
    if (!data) {
      alert("오류 발생: 네트워크 상태를 확인해주세요.");
      return;
    }
    const { code, message } = data;
    switch (code) {
      case "SU":
        setBoxes2(
          data.boxes.map((box) => ({
            subjectId: box.id,
            subjectName: box.name,
          }))
        );
        break;
      case "AF":
        alert("권한이 없습니다.");
        break;
      case "NU":
        alert("로그인 시간이 만료되었습니다. 다시 로그인 해주세요.");
        navigate("/");
        break;
      case "NA":
        setBoxes2([
          {
            id: "",
            name: "",
          },
        ]);
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

  const addBox = () => {
    setBoxes([
      ...boxes,
      {
        id: "",
        name: "",
      },
    ]);
  };

  // 수정
  const handleSubmit = async () => {
    const formattedData = boxes.map((box) => ({
      subjectId: box.id,
      subjectName: box.name,
    }));
    const response = await settingCodingzone(
      formattedData,
      cookies.accessToken,
      setCookie,
      navigate
    );
    handleSettingcdzResponse(response);
  };

  const removeBox = (index) => {
    setBoxes((currentBoxes) => currentBoxes.filter((_, i) => i !== index));
  };

  //조 정보 등록과 수업 등록 페이지 이동 function
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  //조 정보 등록과 수업 등록 페이지
  const renderActiveSection = () => {
    if (activeCategory === "registerGroupInfo") {
      return (
        <>
          <div className="main-category-name-container">
            <div className="separator"></div>
            <div className="element-title">
              <div className="part1-element-title">
                <p className="weekDay">요일</p>
                <p className="weekTime">시간</p>
                <p className="assistent">조교</p>
              </div>
              <div className="part2-element-title">
                <p className="className">과목명</p>
              </div>
              <div className="part3-element-title">
                <p className="grade">코딩존</p>
                <p className="maxPers">인원</p>
              </div>
            </div>
            <div className="separator"></div>
          </div>
          <div className="class-input-container">
            {boxes.map((box, index) => (
              <div key={index} className="class-input-box">
                <select>
                  <option value="">Day</option>
                  <option value="월요일">MON</option>
                  <option value="화요일">TUE</option>
                  <option value="수요일">WED</option>
                  <option value="목요일">THU</option>
                  <option value="금요일">FRI</option>
                </select>

                <button
                  onClick={() => removeBox(index)}
                  class="custom-btn btn-6"
                >
                  X
                </button>
              </div>
            ))}
          </div>
          <div className="button-area">
            <div>
              <button onClick={addBox} class="custom-btn btn-5">
                추가
              </button>
            </div>
            <div className="class-submit-button">
              <button onClick={handleButtonClick}>등록</button>
            </div>
          </div>
        </>
      );
    } else if (activeCategory === "registerClass") {
    }
    return null;
  };

  return (
    <div className="class-regist-main-container">
      <div className="codingzone-container">
        <div className="select-container">
          <span> | </span>
          <button
            onClick={handlecodingzone}
            className={selectedButton === "codingzone" ? "selected" : ""}
          >
            코딩존 예약
          </button>
          <span> | </span>
          <button
            onClick={handlecodingzoneattendence}
            className={selectedButton === "attendence" ? "selected" : ""}
          >
            출결 관리
          </button>
          <span> | </span>
          <button
            onClick={() => {
              handleInquiry();
              handleOpenModal();
            }}
            className={selectedButton === "inquiry" ? "selected" : ""}
          >
            문의 하기
          </button>
          {showModal && (
            <InquiryModal isOpen={showModal} onClose={handleCloseModal} />
          )}
          <span> | </span>
        </div>
        <div className="banner_img_container">
          <img src="/codingzone_attendance4.png" className="banner" />
        </div>
        <div className="main-body-container">
          <div className="cza_button_container" style={{ textAlign: "center" }}>
            {showCheckButton && (
              <button
                className={`btn-attend ${
                  activeButton === "check" ? "active" : ""
                }`}
                onClick={() => {
                  setActiveButton("check");
                  handlecodingzoneattendence();
                }}
              >
                출결 확인
              </button>
            )}
            {/* CA 권한용 divider: 출결 확인 | 출결 관리 */}
            {showCheckButton && showAdminButton && !showRegisterClassButton && (
              <div className="divider"></div>
            )}
            {showRegisterClassButton && (
              <>
                <button
                  className={`btn-attend ${
                    activeButton === "manage_class" ? "active" : ""
                  }`}
                  onClick={handleClassRegistration}
                >
                  수업 등록
                </button>
              </>
            )}
            {showSettingCodingZone && (
              <>
                <button
                  className={`btn-attend ${
                    activeButton === "setting" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveButton("setting");
                    handlecodingzonesetting();
                  }}
                >
                  코딩존 설정
                </button>
              </>
            )}{" "}
            {/**✅코딩존 설정(NEW) */}
            {/* EA 권한용 divider: 코딩존 설정 | 출결 관리 */}
            {showSettingCodingZone &&
              (showAdminButton || showManageAllButton) && (
                <div className="divider"></div>
              )}
            {showAdminButton && (
              <>
                <button
                  className={`btn-attend ${
                    activeButton === "manage" ? "active" : ""
                  }`}
                  onClick={handlecodingzonemanager}
                >
                  출결 관리
                </button>
              </>
            )}
            {showManageAllButton && (
              <>
                <button
                  className={`btn-attend ${
                    activeButton === "manage_all" ? "active" : ""
                  }`}
                  onClick={handleFullManagement}
                >
                  전체 관리
                </button>
              </>
            )}
          </div>
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default CodingZoneSetting;
