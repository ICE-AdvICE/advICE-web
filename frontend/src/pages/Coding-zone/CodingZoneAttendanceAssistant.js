import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import "../css/codingzone/codingzone-main.css";
import "../css/codingzone/codingzone_manager.css";
import "../css/codingzone/codingzone_attend.css";
import "../css/codingzone/CodingClassRegist.css";
import "../../shared/ui/boardbar/CodingZoneBoardbar.css";
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
import CodingZoneBoardbar from "../../shared/ui/boardbar/CodingZoneBoardbar.js"; //코딩존 보드 바(버튼 네개) 컴포넌트
import CalendarInput from "../../widgets/Calendar/CalendarInput";
import { isWeekendYMD } from "../../shared/lib/date";

const CodingZoneAttendanceAssistant = () => {
  const [attendList, setAttendList] = useState([]);
  const [reservedList, setReservedList] = useState([]);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [activeButton, setActiveButton] = useState("manage");
  const token = cookies.accessToken;
  const navigate = useNavigate();

  const dateToYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const [selectedDateYMD, setSelectedDateYMD] = useState(dateToYMD(new Date()));

  useEffect(() => {
    fetchAuthType();
    fetchAttendList();
  }, [token]);

  useEffect(() => {
    fetchReservedList();
  }, [token, selectedDateYMD]);

  const fetchAuthType = async () => {
    const response = await getczauthtypetRequest(token, setCookie, navigate);
    if (response) {
      switch (response.code) {
        case "NU":
          alert("로그인이 필요합니다. 다시 로그인 해주세요.");
          navigate("/");
          break;

        case "DBE":
          alert("데이터베이스 오류입니다.");
          break;

        case "SU":
        case "EA":
        case "CA":
          // SU, EA, CA 모두 권한이 있는 상태입니다.
          setShowAdminButton(true);
          break;

        default:
          alert("알 수 없는 오류가 발생했습니다. 다시 로그인 해주세요.");
          navigate("/");
          break;
      }
    } else {
      alert("서버로부터 응답이 없습니다. 관리자에게 문의하세요.");
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
    const formattedDate = selectedDateYMD || dateToYMD(new Date());
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
        <CodingZoneBoardbar />
      </div>

      <div className="reserved_manager-list-container">
        <div className="czm_manager_container">
          <CalendarInput
            value={selectedDateYMD}
            onChange={setSelectedDateYMD} // 같은 날짜 다시 클릭하면 null로 해제됨
            disabledDates={isWeekendYMD} // 주말 비활성
            placeholder="날짜를 선택하세요"
            className="custom_manager_datepicker" // 기존 클래스 재사용 가능
          />
        </div>

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
