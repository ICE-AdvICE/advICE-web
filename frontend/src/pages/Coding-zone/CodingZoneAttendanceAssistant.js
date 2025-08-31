import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import "../css/codingzone/codingzone-main.css";
import "../css/codingzone/codingzone_manager.css";
import "../css/codingzone/codingzone_attend.css";
import "../css/codingzone/CodingClassRegist.css";
import "../../shared/ui/boardbar/CodingZoneBoardbar.css";
import "../../widgets/CodingZone/SubjectClassesTable.css";
import { getCodingzoneReservedListByDate } from "../../features/api/Admin/Codingzone/ClassApi.js";
import { getczauthtypetRequest } from "../../shared/api/AuthApi.js";

import { toggleAttendanceByRegistNum } from "../../entities/api/CodingZone/AdminApi";
import InquiryModal from "./InquiryModal.js";
import { getczattendlistRequest } from "../../features/api/CodingzoneApi.js";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js"; //코딩존 네비게이션 바 컴포넌트
import Banner from "../../shared/ui/Banner/Banner"; // ✅ 추가(juhui): 공통 배너 컴포넌트 적용
import CodingZoneBoardbar from "../../shared/ui/boardbar/CodingZoneBoardbar.js"; //코딩존 보드 바(버튼 네개) 컴포넌트
import CalendarInput from "../../widgets/Calendar/CalendarInput"; // 캘린더 입력 컴포넌트

const CodingZoneAttendanceAssistant = () => {
  // 로딩 스피너 애니메이션 CSS 추가
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [attendList, setAttendList] = useState([]);
  const [reservedList, setReservedList] = useState([]);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [activeButton, setActiveButton] = useState("manage");

  const token = cookies.accessToken;
  const navigate = useNavigate();

  // 날짜 관련 상태 추가 (CalendarInput용)
  const dateToYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const [selectedDateYMD, setSelectedDateYMD] = useState(null);

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
    console.log("📡 데이터 요청 중:", selectedDateYMD);

    const response = await getCodingzoneReservedListByDate(
      token,
      selectedDateYMD,
      setCookie,
      navigate
    );

    if (response && response.code === "SU") {
      const data = response.data;
      if (Array.isArray(data)) {
        const sortedData = data.sort((a, b) =>
          a.classTime.localeCompare(b.classTime)
        );
        setReservedList(sortedData);
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

    try {
      const res = await toggleAttendanceByRegistNum(
        student.registrationId,
        token,
        setCookie,
        navigate
      );

      if (res?.code !== "SU") {
        if (res?.message) {
          alert(res.message);
        }
      } else {
        // 성공 시 즉시 UI 업데이트 (깜빡임 방지)
        setReservedList((prevList) =>
          prevList.map((s) =>
            s.registrationId === student.registrationId
              ? { ...s, attendance: target }
              : s
          )
        );
        console.log("✅ 출결 변경 성공!");
      }
    } catch (error) {
      alert("출결 처리 중 오류가 발생했습니다.");
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  // 과거 날짜와 오늘은 활성화, 미래 날짜만 비활성화
  // 날짜 기준으로만 비교 (시간은 무시)
  const canUpdateAttendance = (classDate) => {
    if (!classDate) {
      console.log("canUpdateAttendance: classDate가 null/undefined입니다.");
      return false;
    }

    const now = new Date();

    // 오늘 자정 (00:00:00)을 기준점으로 설정
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );

    // 선택된 날짜를 Date 객체로 변환
    const selectedDate = new Date(classDate + "T00:00:00");

    // 날짜 비교 (시간은 무시하고 날짜만 비교)
    const isFutureDate = selectedDate > todayStart;
    const isPastDate = selectedDate < todayStart;
    const isToday = selectedDate.getTime() === todayStart.getTime();

    console.log("canUpdateAttendance 디버깅:", {
      classDate: classDate,
      currentTime: now.toLocaleString(),
      todayStart: todayStart.toLocaleString(),
      selectedDate: selectedDate.toLocaleDateString(),
      isFutureDate: isFutureDate,
      isPastDate: isPastDate,
      isToday: isToday,
      selectedDateMs: selectedDate.getTime(),
      todayStartMs: todayStart.getTime(),
    });

    // 미래 날짜인 경우 비활성화
    if (isFutureDate) {
      console.log("미래 날짜 감지 - 출석/결석 버튼 비활성화:", classDate);
      return false;
    }

    // 과거 날짜인 경우 활성화
    if (isPastDate) {
      console.log("과거 날짜 - 출석/결석 버튼 활성화:", classDate);
      return true;
    }

    // 오늘 날짜인 경우: 항상 활성화
    if (isToday) {
      console.log("오늘 날짜 - 출석/결석 버튼 활성화:", classDate);
      return true;
    }

    return false;
  };

  const isWeekendYMD = (dateYMD) => {
    const date = new Date(dateYMD);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0: 일요일, 6: 토요일
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
            onChange={(date) => {
              // 빈 문자열이 전달되면 null로 변환하여 UI가 사라지지 않도록 함
              setSelectedDateYMD(date === "" ? null : date);
            }}
            disabledDates={isWeekendYMD}
            placeholder="날짜를 선택하세요"
            className="custom_manager_datepicker"
          />
        </div>
        <h3 className="date_manager_title">
          <span className="date_numbers">
            {selectedDateYMD
              ? `${selectedDateYMD.split("-")[0]}/${
                  selectedDateYMD.split("-")[1]
                }/${selectedDateYMD.split("-")[2]}`
              : "날짜를 선택하세요"}
          </span>
          <span className="reservation_text"> 예약 리스트</span>
        </h3>
        {/* ====== 과목 카드 그리드 (panel-gray 안) ====== */}
        {!selectedDateYMD ? (
          <div className="panel-gray" style={{ marginBottom: "100px" }}>
            <div className="panel-empty">
              조회하고자 하는 날짜를 입력해주세요.
            </div>
          </div>
        ) : reservedList.length === 0 ? (
          <div className="panel-gray" style={{ marginBottom: "100px" }}>
            <div className="panel-empty">
              현재 날짜에 등록된 코딩존이 없습니다.
            </div>
          </div>
        ) : (
          <div className="cz-table-shell">
            <div className="cz-table-scroll">
              <table className="cz-table">
                <thead>
                  <tr className="cz-table-header">
                    <th style={{ width: "25%" }}>시간</th>
                    <th style={{ width: "25%" }}>학생명</th>
                    <th style={{ width: "25%" }}>학번</th>
                    <th style={{ width: "25%" }}>출결</th>
                  </tr>
                </thead>
                <tbody>
                  {reservedList.map((student, index) => (
                    <tr key={index} className="clickable-row">
                      <td>{formatTime(student.classTime)}</td>
                      <td>{student.userName}</td>
                      <td>{student.userStudentNum}</td>
                      <td>
                        {(() => {
                          const canUpdate =
                            canUpdateAttendance(selectedDateYMD);

                          console.log("버튼 렌더링 디버깅:", {
                            selectedDateYMD,
                            canUpdate,
                            studentName: student.userName,
                            studentTime: student.classTime,
                          });

                          if (student.attendance === "1") {
                            return (
                              <>
                                <button
                                  className={
                                    canUpdate
                                      ? "btn_manager_attendance"
                                      : "btn_manager_attendance-disabled future-date"
                                  }
                                  onClick={(e) =>
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
                                      ? "btn_manager_absence-disabled"
                                      : "btn_manager_absence-disabled future-date"
                                  }
                                  onClick={(e) =>
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
                                      ? "btn_manager_attendance-disabled"
                                      : "btn_manager_attendance-disabled future-date"
                                  }
                                  onClick={(e) =>
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
                                      ? "btn_manager_absence"
                                      : "btn_manager_absence-disabled future-date"
                                  }
                                  onClick={(e) =>
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
                                      ? "btn_manager_attendance"
                                      : "btn_manager_attendance-disabled future-date"
                                  }
                                  onClick={(e) =>
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
                                      ? "btn_manager_absence"
                                      : "btn_manager_absence-disabled future-date"
                                  }
                                  onClick={(e) =>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingZoneAttendanceAssistant;
