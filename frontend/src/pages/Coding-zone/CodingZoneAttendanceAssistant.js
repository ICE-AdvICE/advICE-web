import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/codingzone/codingzone-main.css";
import "../css/codingzone/codingzone_manager.css";
import "../css/codingzone/codingzone_attend.css";
import "../css/codingzone/CodingClassRegist.css";
import "../../shared/ui/boardbar/CodingZoneBoardbar.css";
import { getCodingzoneReservedListByDate } from "../../features/api/Admin/Codingzone/ClassApi.js";
import { getczauthtypetRequest } from "../../shared/api/AuthApi.js";

import { toggleAttendanceByRegistNum } from "../../entities/api/CodingZone/AdminApi";
import InquiryModal from "./InquiryModal.js";
import { getczattendlistRequest } from "../../features/api/CodingzoneApi.js";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js"; //코딩존 네비게이션 바 컴포넌트
import Banner from "../../shared/ui/Banner/Banner"; // ✅ 추가(juhui): 공통 배너 컴포넌트 적용
import CodingZoneBoardbar from "../../shared/ui/boardbar/CodingZoneBoardbar.js"; //코딩존 보드 바(버튼 네개) 컴포넌트

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
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const response = await getCodingzoneReservedListByDate(
      token,
      formattedDate,
      setCookie,
      navigate
    );
    if (response && response.code === "SU") {
      // response.data가 배열인지 확인
      const data = response.data;
      if (Array.isArray(data)) {
        setReservedList(
          data.sort((a, b) => a.classTime.localeCompare(b.classTime))
        );
      } else {
        console.error("response.data is not an array:", data);
        setReservedList([]);
      }
    } else if (response && response.code === "NU") {
      setReservedList([]);
    } else {
      console.error(response.message);
      setReservedList([]);
    }
  };

  const handleAttendanceUpdate = async (student, target) => {
    const current = String(student.attendance ?? "");
    if (current === target) return; // 이미 같은 상태면 무시

    // 낙관적 업데이트: UI를 먼저 업데이트
    const previousAttendance = student.attendance;
    setReservedList((prevList) =>
      prevList.map((s) =>
        s.registrationId === student.registrationId
          ? { ...s, attendance: target }
          : s
      )
    );

    try {
      const res = await toggleAttendanceByRegistNum(
        student.registrationId,
        token,
        setCookie,
        navigate
      );

      if (res?.code !== "SU") {
        // API 실패 시 원래 상태로 되돌리기
        setReservedList((prevList) =>
          prevList.map((s) =>
            s.registrationId === student.registrationId
              ? { ...s, attendance: previousAttendance }
              : s
          )
        );

        if (res?.message) {
          alert(res.message);
        }
      }
    } catch (error) {
      // 에러 발생 시 원래 상태로 되돌리기
      setReservedList((prevList) =>
        prevList.map((s) =>
          s.registrationId === student.registrationId
            ? { ...s, attendance: previousAttendance }
            : s
        )
      );
      alert("출결 처리 중 오류가 발생했습니다.");
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  // 과거 날짜와 오늘은 활성화, 미래 날짜만 비활성화
  const canUpdateAttendance = (classDate) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 오늘 자정

    // 날짜를 YYYY-MM-DD 형식의 문자열로 변환하여 비교
    const classDateStr = classDate.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];

    console.log("canUpdateAttendance 디버깅:", {
      classDate: classDateStr,
      today: todayStr,
      classDateType: typeof classDateStr,
      todayType: typeof todayStr,
    });

    // 미래 날짜만 비활성화 (과거 날짜와 오늘은 활성화)
    const isFutureDate = classDateStr > todayStr;

    console.log("날짜 비교 결과:", {
      classDate: classDateStr,
      today: todayStr,
      isFuture: isFutureDate,
    });

    if (isFutureDate) {
      console.log("미래 날짜 감지 - 출석/결석 버튼 비활성화:", classDateStr);
      return false;
    }

    console.log("과거/오늘 날짜 - 출석/결석 버튼 활성화:", classDateStr);
    return true;
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
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              const utcDate = new Date(
                Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
              );
              const koreaDate = new Date(
                utcDate.getTime() + 9 * 60 * 60 * 1000
              ); // Correctly adjust for Korean timezone

              console.log("DatePicker onChange:", {
                originalDate: date,
                utcDate,
                koreaDate,
                formattedDate: koreaDate.toISOString().split("T")[0],
              });

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
                      {(() => {
                        const canUpdate = canUpdateAttendance(selectedDate);

                        if (student.attendance === "1") {
                          return (
                            <>
                              <button
                                className={
                                  canUpdate
                                    ? "btn_manager_attendance-selected"
                                    : "btn_manager_attendance-disabled"
                                }
                                onClick={() =>
                                  canUpdate
                                    ? handleAttendanceUpdate(student, "1")
                                    : null
                                }
                                disabled={!canUpdate}
                                title={
                                  !canUpdate
                                    ? "수업 날짜 이전에는 출석 처리를 할 수 없습니다."
                                    : ""
                                }
                              >
                                출석
                              </button>
                              <button
                                className={
                                  canUpdate
                                    ? "btn_manager_absence-unselected"
                                    : "btn_manager_absence-disabled"
                                }
                                onClick={() =>
                                  canUpdate
                                    ? handleAttendanceUpdate(student, "0")
                                    : null
                                }
                                disabled={!canUpdate}
                                title={
                                  !canUpdate
                                    ? "수업 날짜 이전에는 출석 처리를 할 수 없습니다."
                                    : ""
                                }
                              >
                                결석
                              </button>
                            </>
                          );
                        } else if (student.attendance === "0") {
                          return (
                            <>
                              <button
                                className={
                                  canUpdate
                                    ? "btn_manager_attendance-unselected"
                                    : "btn_manager_attendance-disabled"
                                }
                                onClick={() =>
                                  canUpdate
                                    ? handleAttendanceUpdate(student, "1")
                                    : null
                                }
                                disabled={!canUpdate}
                                title={
                                  !canUpdate
                                    ? "수업 날짜 이전에는 출석 처리를 할 수 없습니다."
                                    : ""
                                }
                              >
                                출석
                              </button>
                              <button
                                className={
                                  canUpdate
                                    ? "btn_manager_absence-selected"
                                    : "btn_manager_absence-disabled"
                                }
                                onClick={() =>
                                  canUpdate
                                    ? handleAttendanceUpdate(student, "0")
                                    : null
                                }
                                disabled={!canUpdate}
                                title={
                                  !canUpdate
                                    ? "수업 날짜 이전에는 출석 처리를 할 수 없습니다."
                                    : ""
                                }
                              >
                                결석
                              </button>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <button
                                className={
                                  canUpdate
                                    ? "btn_manager_attendance-unselected"
                                    : "btn_manager_attendance-disabled"
                                }
                                onClick={() =>
                                  canUpdate
                                    ? handleAttendanceUpdate(student, "1")
                                    : null
                                }
                                disabled={!canUpdate}
                                title={
                                  !canUpdate
                                    ? "수업 날짜 이전에는 출석 처리를 할 수 없습니다."
                                    : ""
                                }
                              >
                                출석
                              </button>
                              <button
                                className={
                                  canUpdate
                                    ? "btn_manager_absence-unselected"
                                    : "btn_manager_absence-disabled"
                                }
                                onClick={() =>
                                  canUpdate
                                    ? handleAttendanceUpdate(student, "0")
                                    : null
                                }
                                disabled={!canUpdate}
                                title={
                                  !canUpdate
                                    ? "수업 날짜 이전에는 출석 처리를 할 수 없습니다."
                                    : ""
                                }
                              >
                                결석
                              </button>
                            </>
                          );
                        }
                      })()}
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
