import "../../../pages/css/codingzone/codingzone-main.css";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { getczauthtypetRequest } from "../../api/AuthApi";

const CodingZoneBoardbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const token = cookies.accessToken;

  const [showAdminButton, setShowAdminButton] = useState(false);
  const [showManageAllButton, setShowManageAllButton] = useState(false);
  const [showRegisterClassButton, setShowRegisterClassButton] = useState(false);
  const [showSettingCodingZone, setShowSettingCodingZone] = useState(false);
  const [showCheckButton, setShowCheckButton] = useState(true);

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
            setShowCheckButton(false);
            setShowSettingCodingZone(true);
            setShowAdminButton(true);
            break;
          case "NU":
            alert("로그인이 필요합니다.");
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
  }, [token, navigate, setCookie]);

  // URL 경로로부터 activeButton 상태 자동 설정
  const getActiveButtonFromPath = () => {
    const path = location.pathname;
    if (path.includes("coding-class-regist")) return "manage_class";
    if (path.includes("Codingzone_Setting")) return "setting";
    if (path.includes("Codingzone_Manager")) return "manage";
    if (path.includes("Codingzone_All_Attend")) return "manage_all";
    if (path.includes("Codingzone_Attendance")) return "check";
    return "";
  };

  const activeButton = getActiveButtonFromPath();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="main-body-container">
      <div className="cza_button_container" style={{ textAlign: "center" }}>
        {showCheckButton && (
          <button
            className={`btn-attend ${activeButton === "check" ? "active" : ""}`}
            onClick={() =>
              handleNavigation("/coding-zone/Codingzone_Attendance")
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
            onClick={() => handleNavigation("/coding-zone/coding-class-regist")}
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
              onClick={() =>
                handleNavigation("/coding-zone/Codingzone_Setting")
              }
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
            }`}
            onClick={() => handleNavigation("/coding-zone/Codingzone_Manager")}
          >
            출결 관리
          </button>
        )}

        {showManageAllButton && (
          <button
            className={`btn-attend ${
              activeButton === "manage_all" ? "active" : ""
            }`}
            onClick={() =>
              handleNavigation("/coding-zone/Codingzone_All_Attend")
            }
          >
            전체 관리
          </button>
        )}
      </div>
    </div>
  );
};

export default CodingZoneBoardbar;
