import React, { useEffect, useState } from "react";
import { getczauthtypetRequest } from "../../shared/api/AuthApi.js";
import { useCookies } from "react-cookie";
import "../css/codingzone/codingzone-main.css";
import "../css/codingzone/codingzone_attend.css";

import { useNavigate, useLocation } from "react-router-dom";
import InquiryModal from "./InquiryModal.js";
import { getczattendlistRequest } from "../../features/api/CodingzoneApi.js";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js"; //코딩존 네이게이션 바 컴포넌트
import Banner from "../../shared/ui/Banner/Banner"; // ✅ 추가(juhui): 공통 배너 컴포넌트 적용
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
    navigate(`/coding-zone/codingzone-manager`);
  const handleFullManagement = () =>
    navigate(`/coding-zone/codingzone-all-attend`);
  const handleClassRegistration = () =>
    navigate(`/coding-zone/coding-class-regist`);

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const startTime = `${hours}:${minutes}`;

    // 시작시간에서 1시간을 더해서 끝시간 계산
    const endHours = parseInt(hours) + 1;
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes}`;

    return `${startTime}~${endTime}`;
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
        <Banner src="/codingzone_attendance2.png" />
        {/* ✅ 추가(juhui) : 기존 이미지 태그를 Banner 컴포넌트로 대체하여 코드 모듈화 및 재사용성 향상 */}
      </div>

      <div className="cza_button_container" style={{ textAlign: "center" }}>
        <CodingZoneBoardbar />
      </div>

      {/* 실제 table 태그를 사용한 출결 관리 표 */}
      <div
        className="manager-table-card"
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginBottom: "100px",
        }}
      >
        {attendList.length > 0 ? (
          <table className="manager-table" style={{ width: "1100px" }}>
            <thead>
              <tr>
                <th style={{ width: "12%" }}>날짜</th>
                <th style={{ width: "19.9%" }}>시간</th>
                <th style={{ width: "32%" }}>과목명</th>
                <th style={{ width: "15%" }}>조교</th>
                <th style={{ width: "15%" }}>출결</th>
              </tr>
            </thead>
            <tbody>
              {attendList.map((item, index) => (
                <tr key={index}>
                  <td>{formatDate(item.classDate)}</td>
                  <td>{formatTime(item.classTime)}</td>
                  <td>{item.className}</td>
                  <td>{item.assistantName}</td>
                  <td>
                    {isFutureDate(item.classDate, item.classTime) ? (
                      <span
                        style={{
                          backgroundColor: "#f0f0f0",
                          color: "#052940",
                          padding: "10px 29px",
                          borderRadius: "10px",
                          fontSize: "15px",
                          fontWeight: "600",
                        }}
                      >
                        진행중
                      </span>
                    ) : item.attendance === "1" ? (
                      <span
                        style={{
                          backgroundColor: "#1CFF8A",
                          color: "#052940",
                          padding: "10px 29px",
                          borderRadius: "10px",
                          fontSize: "15px",
                          fontWeight: "600",
                        }}
                      >
                        출석
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: "#FF6969",
                          color: "#ffffff",
                          padding: "10px 29px",
                          borderRadius: "10px",
                          fontSize: "15px",
                          fontWeight: "600",
                        }}
                      >
                        결석
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="panel-gray">
            <div className="panel-empty">신청한 수업 리스트가 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingZoneMyAttendance;
