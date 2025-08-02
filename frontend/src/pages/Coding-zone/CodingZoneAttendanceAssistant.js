import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/codingzone/codingzone-main.css";
import "../css/codingzone/codingzone_manager.css";
import { getczreservedlistRequest } from "../../features/api/Admin/Codingzone/ClassApi.js";
import { getczauthtypetRequest } from "../../shared/api/AuthApi.js";
import {
  putczattendc1Request,
  putczattendc2Request,
} from "../../features/api/Admin/Codingzone/AttendanceApi.js";
import InquiryModal from "./InquiryModal.js";
import { getczattendlistRequest } from "../../features/api/CodingzoneApi.js";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js"; //코딩존 네이게이션 바 컴포넌트
import Banner from "../../shared/ui/Banner/Banner"; // ✅ 추가(juhui): 공통 배너 컴포넌트 적용

const CodingZoneAttendanceAssistant = () => {
  const [attendList, setAttendList] = useState([]);
  const [reservedList, setReservedList] = useState([]);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [activeButton, setActiveButton] = useState("manage");
  const token = cookies.accessToken;
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentDate = new Date(selectedDate);
      console.log("Checking date:", now, currentDate); // Debugging log
    }, 10000); // Check every 10 seconds for debugging

    return () => clearInterval(timer); // Clear the timer when the component unmounts
  }, [selectedDate]);

  useEffect(() => {
    fetchAuthType();
    fetchAttendList();
  }, [token]);

  useEffect(() => {
    fetchReservedList();
  }, [token, selectedDate]);

  const fetchAuthType = async () => {
    const response = await getczauthtypetRequest(token, setCookie, navigate);
    if (response) {
      switch (response.code) {
        case "SU":
        case "EA":
        case "NU":
          alert("로그인 시간이 만료되었습니다. 다시 로그인 해주세요.");
          navigate("/");
          break;
        case "DBE":
          break;
        case "CA":
          setShowAdminButton(true);
          break;
        default:
          setShowAdminButton(false);
          break;
      }
    }
  };

  const fetchAttendList = async () => {
    const response = await getczattendlistRequest(token, setCookie, navigate);
    if (response && response.code === "SU") {
      setAttendList(response.attendList);
    } else if (response && response.code === "NU") {
    } else {
      console.error(response.message);
    }
  };

  const fetchReservedList = async () => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const response = await getczreservedlistRequest(
      token,
      formattedDate,
      setCookie,
      navigate
    );
    if (response && response.code === "SU") {
      setReservedList(
        response.studentList.sort((a, b) =>
          a.classTime.localeCompare(b.classTime)
        )
      );
    } else if (response && response.code === "NU") {
    } else {
      console.error(response.message);
      setReservedList([]);
    }
  };

  const handleAttendanceUpdate = async (student, newState) => {
    const method =
      student.grade === 1 ? putczattendc1Request : putczattendc2Request;
    const response = await method(
      student.registrationId,
      token,
      setCookie,
      navigate
    );
    if (response.code === "SU") {
      alert("처리가 완료되었습니다.");
      fetchReservedList(); // 새로고침 기능
    } else if (response && response.code === "NU") {
    } else {
      alert("오류가 발생했습니다. 다시 시도 해 주세요.");
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  return (
    <div>
      <div className="codingzone-container">
        <CodingZoneNavigation />
        <Banner src="/codingzone_attendance3.png" />
        {/* ✅ 추가(juhui) : 기존 이미지 태그를 Banner 컴포넌트로 대체하여 코드 모듈화 및 재사용성 향상 */}
      </div>
      <div className="cza_button_container" style={{ textAlign: "center" }}>
        <button
          className={`btn-attend ${activeButton === "check" ? "active" : ""}`}
          onClick={() => {
            setActiveButton("check");
            navigate("/coding-zone/Codingzone_Attendance");
          }}
        >
          출결 확인
        </button>
        {showAdminButton && (
          <>
            <div className="divider"></div>
            <button
              className={`btn-attend ${
                activeButton === "manage" ? "active" : ""
              }`}
              onClick={() => setActiveButton("manage")}
            >
              출결 관리
            </button>
          </>
        )}
      </div>

      <div className="reserved_manager-list-container">
        <div className="czm_manager_container">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              const utcDate = new Date(
                Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
              );
              const koreaDate = new Date(
                utcDate.getTime() + 9 * 60 * 60 * 1000
              ); // Correctly adjust for Korean timezone
              setSelectedDate(koreaDate);
            }}
            dateFormat="yyyy/MM/dd"
            className="custom_manager_datepicker"
          />
        </div>
        <h3 className="date_manager_title">
          {`${selectedDate.getFullYear()}/${
            selectedDate.getMonth() + 1
          }/${selectedDate.getDate()} 예약 리스트`}
        </h3>

        <div className="line-manager-container1">{/* 실선 영역 */}</div>

        <div className="info-manager-container">
          <div className="info_manager_inner">
            <div className="info_manager_name">이름</div>
            <div className="info_manager_studentnum ">학번</div>
            <div className="info_manager_bar"></div>
            <div className="info_manager_time ">시간</div>
            <div className="info_manager_status">출결</div>
          </div>
        </div>
        <div className="line-manager-container2">{/* 실선 영역 */}</div>

        <div className="info_manager_container">
          {reservedList.length > 0 ? (
            reservedList.map((student, index, array) => {
              const isNextTimeBlockDifferent =
                index === array.length - 1 ||
                student.classTime !== array[index + 1].classTime;
              return (
                <div key={index}>
                  <div className="info_manager_data_inner">
                    <div className="info_manager_data_name">
                      {student.userName}
                    </div>
                    <div className="info_manager_data_studentnum">
                      {student.userStudentNum}
                    </div>
                    <div className="info_manager_data_bar"></div>
                    <div className="info_manager_data_time">
                      {formatTime(student.classTime)}
                    </div>
                    <div className="info_manager_data_status">
                      {student.attendance === "1" ? (
                        <button className="btn_manager_attendance" disabled>
                          출석
                        </button>
                      ) : (
                        <button
                          className="btn_manager_attendance-disabled"
                          onClick={() => handleAttendanceUpdate(student, "1")}
                        >
                          출석
                        </button>
                      )}
                      {student.attendance === "0" ? (
                        <button className="btn_manager_absence" disabled>
                          결석
                        </button>
                      ) : (
                        <button
                          className="btn_manager_absence-disabled"
                          onClick={() => handleAttendanceUpdate(student, "0")}
                        >
                          결석
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    className={
                      isNextTimeBlockDifferent
                        ? "hr_manager_line_thick"
                        : "hr_manager_line"
                    }
                  ></div>
                </div>
              );
            })
          ) : (
            <p className="no-reservations">예약된 리스트가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingZoneAttendanceAssistant;
