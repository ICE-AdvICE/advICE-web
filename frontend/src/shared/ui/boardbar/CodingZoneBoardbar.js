import "../../../pages/css/codingzone/codingzone-main.css";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { getczauthtypetRequest } from "../../api/AuthApi";

const ROUTES = {
  // ✅ 출결 공통 진입점 (AttendanceRouter가 EA/CA/학생으로 자동 분기)
  attendanceEntry: "/coding-zone/attendance",
  attendanceEA: "/coding-zone/attendance/ea",
  attendanceCA: "/coding-zone/attendance/ca",

  attendanceReal: "/coding-zone/Codingzone_Attendance_Real",
  // ✅ App.js와 경로 정확히 일치(소문자)
  classRegist: "/coding-zone/coding-class-regist",
  setting: "/coding-zone/Codingzone_Setting",
  // ✅ '출결 관리'도 공통 진입점으로 보냄 (EA/CA 모두 사용)
  manager: "/coding-zone/attendance",
  allAttend: "/coding-zone/Codingzone_All_Attend",
};

const CodingZoneBoardbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const token = cookies.accessToken;
  const authCode = (sessionStorage.getItem("czAuthCode") || "").toUpperCase();

  const [showAdminButton, setShowAdminButton] = useState(false);
  const [showManageAllButton, setShowManageAllButton] = useState(false);
  const [showRegisterClassButton, setShowRegisterClassButton] = useState(false);
  const [showSettingCodingZone, setShowSettingCodingZone] = useState(false);
  const [showCheckButton, setShowCheckButton] = useState(true);
  const [ready, setReady] = useState(false); // 로딩 완료 여부 (깜빡임 방지)

  // 권한 코드에 따라 버튼 상태 일괄 세팅
  const applyFlags = (code) => {
    // 초기화
    setShowAdminButton(false);
    setShowManageAllButton(false);
    setShowRegisterClassButton(false);
    setShowSettingCodingZone(false);
    setShowCheckButton(true);

    switch (code) {
      case "CA":
        setShowAdminButton(true);
        break;
      case "EA":
        setShowRegisterClassButton(true);
        setShowManageAllButton(true);
        setShowCheckButton(false);
        setShowSettingCodingZone(true);
        setShowAdminButton(true);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // 1) 캐시 먼저 반영(깜빡임 방지)
    const cached = sessionStorage.getItem("czAuthCode");
    if (cached) applyFlags(cached);

    // 2) 서버에서 최신 권한코드 갱신
    (async () => {
      const response = await getczauthtypetRequest(token, setCookie, navigate);

      if (response?.code === "NU") {
        alert("로그인이 필요합니다.");
        navigate("/");
        return;
      }

      if (response?.code) {
        sessionStorage.setItem("czAuthCode", response.code);
        applyFlags(response.code);
      }

      setReady(true);
    })();
  }, [token]); // navigate, setCookid deps제거 -> 불필요한 재실행 방지

  if (!ready && !sessionStorage.getItem("czAuthCode")) {
    return null;
  } // 로딩

  const getActiveButtonFromPath = () => {
    const p = location.pathname.toLowerCase();
    if (p.startsWith(ROUTES.classRegist.toLowerCase())) return "manage_class";
    if (p.startsWith(ROUTES.setting.toLowerCase())) return "setting";
    if (p.startsWith(ROUTES.manager.toLowerCase())) return "manage";
    if (p.startsWith(ROUTES.allAttend.toLowerCase())) return "manage_all";
    if (
      p.startsWith(ROUTES.attendanceEntry.toLowerCase()) ||
      p.startsWith(ROUTES.attendanceReal.toLowerCase())
    )
      return "check";
    return "";
  };

  const activeButton = getActiveButtonFromPath();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="main-body-container">
      <div
        className={`cza_button_container ${
          !showAdminButton && !showRegisterClassButton ? "student" : ""
        }`}
        style={{ textAlign: "center" }}
      >
        {showCheckButton && (
          <button
            className={`btn-attend ${
              !showAdminButton && !showRegisterClassButton ? "student" : ""
            } ${activeButton === "check" ? "active" : ""}`}
            onClick={() =>
              handleNavigation(
                authCode === "CA"
                  ? ROUTES.attendanceReal
                  : ROUTES.attendanceEntry
              )
            }
          >
            출결 확인
          </button>
        )}

        {showCheckButton && showAdminButton && !showRegisterClassButton && (
          <div className="divider"></div>
        )}

        {showRegisterClassButton && (
          <button
            className={`btn-attend ${
              activeButton === "manage_class" ? "active" : ""
            }`}
            onClick={() => handleNavigation(ROUTES.classRegist)}
          >
            수업 등록
          </button>
        )}

        {showSettingCodingZone && (
          <>
            <button
              className={`btn-attend ${
                activeButton === "setting" ? "active" : ""
              }`}
              onClick={() => handleNavigation(ROUTES.setting)}
            >
              코딩존 설정
            </button>
          </>
        )}

        {showSettingCodingZone && (showAdminButton || showManageAllButton) && (
          <div className="divider"></div>
        )}

        {showAdminButton && (
          <button
            className={`btn-attend ${
              activeButton === "manage" ? "active" : ""
            }`} // ✅ EA/CA 모두 공통 진입점으로 보내면 AttendanceRouter가 알아서 분기
            onClick={() => handleNavigation(ROUTES.attendanceEntry)}
          >
            출결 관리
          </button>
        )}

        {showManageAllButton && (
          <button
            className={`btn-attend ${
              activeButton === "manage_all" ? "active" : ""
            }`}
            onClick={() => handleNavigation(ROUTES.allAttend)}
          >
            전체 관리
          </button>
        )}
      </div>
    </div>
  );
};

export default CodingZoneBoardbar;
