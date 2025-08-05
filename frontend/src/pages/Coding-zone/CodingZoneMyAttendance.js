import React, { useEffect, useState } from "react";
import { getczauthtypetRequest } from "../../shared/api/AuthApi.js";
import { useCookies } from "react-cookie";
import "../css/codingzone/codingzone-main.css";
import "../css/codingzone/codingzone_attend.css";
import { useNavigate } from "react-router-dom";
import { getczattendlistRequest } from "../../features/api/CodingzoneApi.js";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js";
import CodingZoneBoardbar from "../../shared/ui/boardbar/CodingZoneBoardbar.js";

const CodingZoneMyAttendance = () => {
  const [attendList, setAttendList] = useState([]);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [showManageAllButton, setShowManageAllButton] = useState(false);
  const [showRegisterClassButton, setShowRegisterClassButton] = useState(false);
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const token = cookies.accessToken;
  const navigate = useNavigate();

  const [hasNavigated, setHasNavigated] = useState(false); // 중복 navigate 방지

  const handlecodingzonemanager = () =>
    navigate(`/coding-zone/Codingzone_Manager`);
  const handleFullManagement = () =>
    navigate(`/coding-zone/Codingzone_All_Attend`);
  const handleClassRegistration = () =>
    navigate(`/coding-zone/coding-class-regist`);

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month.toString().padStart(2, "0")}/${day
      .toString()
      .padStart(2, "0")}`;
  };

  const isFutureDate = (classDate, classTime) => {
    const now = new Date();
    const classDateTime = new Date(`${classDate}T${classTime}`);
    return classDateTime > now;
  };

  // ✅ 권한 체크
  useEffect(() => {
    const fetchAuthType = async () => {
      const response = await getczauthtypetRequest(token, setCookie, navigate);
      if (response) {
        if (response.code === "NU") {
          if (!hasNavigated) {
            alert("로그인 시간이 만료되었습니다. 다시 로그인 해주세요.");
            setHasNavigated(true);
            navigate("/");
          }
          return;
        }
        switch (response.code) {
          case "CA":
            setShowAdminButton(true);
            break;
          case "EA":
            setShowRegisterClassButton(true);
            setShowManageAllButton(true);
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
  }, [token, hasNavigated, navigate, setCookie]);

  // ✅ 출결 리스트 조회
  useEffect(() => {
    const fetchAttendList = async () => {
      const response = await getczattendlistRequest(token, setCookie, navigate);
      if (response) {
        if (response.code === "NU") {
          if (!hasNavigated) {
            alert("로그인 시간이 만료되었습니다. 다시 로그인 해주세요.");
            setHasNavigated(true);
            navigate("/");
          }
          return;
        } else if (response.code === "SU") {
          setAttendList(response.attendList);
        } else {
          console.error(response.message);
        }
      }
    };
    fetchAttendList();
  }, [token, hasNavigated, navigate, setCookie]);

  return (
    <div>
      <div className="codingzone-container">
        <CodingZoneNavigation />
        <div className="banner_img_container">
          <img src="/codingzone_attendance2.png" className="banner" />
        </div>
      </div>

      <div className="cza_button_container" style={{ textAlign: "center" }}>
        <CodingZoneBoardbar />
      </div>

      <div className="line-container1"></div>

      <div className="info-container">
        <div className="info_inner">
          <div className="info_date">날짜</div>
          <div className="info_time">시간</div>
          <div className="info_bar"></div>
          <div className="info_classname">과목명</div>
          <div className="info_assistant">조교</div>
          <div className="info_status">출결</div>
        </div>
      </div>

      <div className="line-container2"></div>

      <div className="info_data_container">
        {attendList.length > 0 ? (
          attendList.map((item, index) => (
            <div key={index}>
              <div className="info_data_inner">
                <div className="info_data_date">
                  {formatDate(item.classDate)}
                </div>
                <div className="info_data_time">
                  {formatTime(item.classTime)}
                </div>
                <div className="info_data_bar"></div>
                <div className="info_data_classname">{item.className}</div>
                <div className="info_data_assistant">{item.assistantName}</div>
                <div className="info_data_status">
                  {isFutureDate(item.classDate, item.classTime)
                    ? "진행중"
                    : item.attendance === "1"
                    ? "Y"
                    : "N"}
                </div>
              </div>
              <div className="hr-line"></div>
            </div>
          ))
        ) : (
          <div className="empty-list-message">
            신청한 수업 리스트가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingZoneMyAttendance;
