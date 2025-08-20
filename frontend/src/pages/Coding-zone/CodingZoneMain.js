import React, { useState, useEffect } from "react";
import "../css/codingzone/codingzone-main.css";
import "../css/codingzone/codingzone_attend.css";
import { useCookies } from "react-cookie";
import CzCard from "../../widgets/layout/CzCard/czCard";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { deleteClass } from "../../entities/api/CodingZone/AdminApi.js";
import { checkAdminType } from "../../features/api/Admin/UserApi.js";
import { getAvailableClassesForNotLogin } from "../../features/api/Admin/Codingzone/ClassApi.js";
import InquiryModal from "./InquiryModal";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import {
  getAttendanceCount,
  getcodingzoneListRequest,
} from "../../features/api/CodingzoneApi.js";
import {
  deleteCodingZoneClass,
  reserveCodingZoneClass,
} from "../../entities/api/CodingZone/StudentApi.js";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js"; //코딩존 네이게이션 바 컴포넌트
import BannerSlider from "../../shared/ui/Banner/BannerSlider"; // ✅ 추가(juhui): 슬라이더 컴포넌트
import CalendarInput from "../../widgets/Calendar/CalendarInput"; // 달력
import { isWeekendYMD } from "../../shared/lib/date"; // 달력
import { getColorById } from "../Coding-zone/subjectColors";
import { fetchCodingzoneSubjectsByDate } from "../../entities/api/CodingZone/AdminApi";
import SubjectCard from "../../widgets/subjectCard/subjectCard.js";
import SubjectClassesTable from "../../widgets/CodingZone/SubjectClassesTable";

const ClassList = ({
  userReservedClass,
  onDeleteClick,
  classList,
  handleCardClick,
  handleToggleReservation,
  isAdmin,
}) => {
  return (
    <div className="cz-card">
      {classList.map((classItem) => (
        <CzCard
          key={classItem.classNum}
          isAdmin={isAdmin}
          onDeleteClick={() => onDeleteClick(classItem.classNum)}
          assistantName={classItem.assistantName}
          classTime={classItem.classTime}
          className={classItem.className}
          weekDay={classItem.weekDay}
          classDate={classItem.classDate}
          currentNumber={classItem.currentNumber}
          maximumNumber={classItem.maximumNumber}
          category={`[${classItem.grade}학년]`}
          onClick={() => handleCardClick(classItem)}
          onReserveClick={() => handleToggleReservation(classItem)}
          isReserved={classItem.isReserved}
          disableReserveButton={
            userReservedClass &&
            userReservedClass.classNum !== classItem.classNum &&
            userReservedClass.grade === classItem.grade
          }
        />
      ))}
    </div>
  );
};

const CodingMain = () => {
  const [classList, setClassList] = useState([]);
  const [grade, setGrade] = useState(1);
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [originalClassList, setOriginalClassList] = useState([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedZone, setSelectedZone] = useState(1);
  const [userReservedClass, setUserReservedClass] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [isRendered, setIsRendered] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showNoClassesImage, setShowNoClassesImage] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // 달력
  const [subjects, setSubjects] = useState([]); // ★ NEW [{id, name}]
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false); // ★ NEW
  const [selectedSubjectId, setSelectedSubjectId] = useState(null); // ★ NEW
  const [selectedDateYMD, setSelectedDateYMD] = useState(""); // ★ NEW: YYYY-MM-DD 문자열
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [backIcon, setBackIcon] = useState("/leftnone.png");

  // ★ 과목 선택 해제 (그리드로 되돌아오기)
  const clearSubjectSelection = () => {
    setSelectedSubjectId(null);
    setSelectedSubjectName("");
  };

  // ★ NEW: 날짜 -> YYYY-MM-DD
  // 기존 dateToYMD를 아래로 교체
  const dateToYMD = (val) => {
    if (!val) return "";

    // 이미 YYYY-MM-DD 형태면 그대로 정규화해서 반환
    if (typeof val === "string") {
      // 2025-8-3, 2025/8/3, 20250803 모두 허용
      const m = val.match(/^(\d{4})[./-]?(\d{1,2})[./-]?(\d{1,2})$/);
      if (m) {
        const y = m[1];
        const mo = m[2].padStart(2, "0");
        const d = m[3].padStart(2, "0");
        return `${y}-${mo}-${d}`;
      }
      // 그 외 문자열은 Date 파싱 시도
      const dt = new Date(val);
      if (!Number.isNaN(dt.getTime())) {
        return dateToYMD(dt); // 재귀로 포맷
      }
      return "";
    }

    // 숫자(timestamp) 또는 Date 객체 처리
    const dt = val instanceof Date ? val : new Date(val);
    if (Number.isNaN(dt.getTime())) return "";

    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const count = subjects.length; // ★ NEW
  const gridClass =
    count === 4
      ? "subject-grid cols-2x2"
      : count === 3
      ? "subject-grid layout-3"
      : count === 2
      ? "subject-grid cols-2"
      : "subject-grid cols-1"; // 1개

  useEffect(() => {
    if (cookies.accessToken) {
      setIsRendered(true);
    } else {
      setIsRendered(false);
    }
  }, [cookies.accessToken]);

  // 로그인 여부와 관리자 유형을 확인하는 부분을 하나의 useEffect로 정리
  useEffect(() => {
    const fetchUserRole = async () => {
      const token = cookies.accessToken;
      if (token) {
        const response = await checkAdminType(token, setCookie, navigate);
        if (response === "EA") {
          setIsAdmin(true);
        } else if (response === "SU") {
          setUserRole("SU");
        } else if (response === "CA") {
          setUserRole("CA");
        }
      }
    };
    fetchUserRole();
  }, [cookies.accessToken]);

  // 요일과 슬라이더 설정을 상수로 정의
  const daysOfWeek = ["월요일", "화요일", "수요일", "목요일", "금요일"];

  // [과사 권한이 있는 계정] 삭제 버튼
  const handleDelete = async (classNum) => {
    const token = cookies.accessToken;
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    const result = await deleteClass(classNum, token, setCookie, navigate);
    if (result) {
      alert("수업이 삭제되었습니다.");
      setClassList((prevClassList) => {
        const updatedList = prevClassList.filter(
          (item) => item.classNum !== classNum
        );
        if (updatedList.length === 0) {
          setShowNoClassesImage(true);
        } else {
          setShowNoClassesImage(false);
        }
        return updatedList;
      });
    } else {
      alert("수업 삭제에 실패했습니다.");
    }
  };

  // 시간 문자열을 분 단위 숫자로 변환하여 정렬
  const timeToNumber = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };
  // 수업 목록을 요일과 시간 순으로 정렬
  const sortClassList = (classList) => {
    return classList.sort((a, b) => {
      const dayComparison =
        daysOfWeek.indexOf(a.weekDay) - daysOfWeek.indexOf(b.weekDay);
      if (dayComparison !== 0) {
        return dayComparison;
      }
      return timeToNumber(a.classTime) - timeToNumber(b.classTime);
    });
  };
  const days = [
    { name: "월요일", label: "Mon" },
    { name: "화요일", label: "Tue" },
    { name: "수요일", label: "Wed" },
    { name: "목요일", label: "Thu" },
    { name: "금요일", label: "Fri" },
  ];

  // 요일 필터링 기능
  const filterByDay = (day) => {
    if (selectedDay === day) {
      setClassList(originalClassList);
      setSelectedDay("");
    } else {
      const filteredData = originalClassList.filter((classItem) => {
        return classItem.weekDay.toLowerCase() === day.toLowerCase();
      });
      setClassList(filteredData);
      setSelectedDay(day);
    }
  };

  const token = cookies.accessToken;
  /// 코딩존 수업 데이터를 가져오는 useEffect
  const fetchData = async () => {
    try {
      let classes = [];
      if (cookies.accessToken) {
        const response = await getcodingzoneListRequest(
          cookies.accessToken,
          grade,
          setCookie,
          navigate
        );
        if (response) {
          if (response.registedClassNum !== 0) {
            classes = response.classList.map((classItem) => ({
              ...classItem,
              isReserved: classItem.classNum === response.registedClassNum,
            }));
            const reservedClass = classes.find(
              (classItem) => classItem.isReserved
            );
            if (reservedClass) {
              setUserReservedClass(reservedClass);
            }
          } else {
            classes = response.classList.map((classItem) => ({
              ...classItem,
              isReserved: false,
            }));
          }
        }
      } else {
        const response = await getAvailableClassesForNotLogin(grade);
        if (response && response.length > 0) {
          classes = response.map((classItem) => ({
            ...classItem,
            isReserved: undefined,
          }));
        }
      }
      if (classes.length > 0) {
        const sortedClasses = sortClassList(classes);
        setOriginalClassList(sortedClasses);
        setClassList(sortedClasses);
        setShowNoClassesImage(false);
      } else {
        setOriginalClassList([]);
        setClassList([]);
        setShowNoClassesImage(true);
      }
    } catch (error) {
      alert("수업 데이터를 불러오는 중 오류가 발생했습니다.");
      setOriginalClassList([]);
      setClassList([]);
      setShowNoClassesImage(true);
    }
  };
  useEffect(() => {
    fetchData();
  }, [cookies.accessToken, grade]);

  // 출석 횟수
  useEffect(() => {
    const fetchAttendance = async () => {
      const token = cookies.accessToken;
      if (token) {
        const count = await getAttendanceCount(
          token,
          grade,
          setCookie,
          navigate
        );
        setAttendanceCount(count);
      }
    };
    fetchAttendance();
  }, [cookies.accessToken, grade]);

  // 예약 기능 토글
  const handleToggleReservation = async (classItem) => {
    const token = cookies.accessToken;
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      let result;
      if (classItem.isReserved) {
        result = await deleteCodingZoneClass(
          token,
          classItem.classNum,
          setCookie,
          navigate
        );
        if (result === true) {
          alert("예약 취소가 완료되었습니다.");
          setUserReservedClass(null);
          await fetchData();
        }
      } else {
        result = await reserveCodingZoneClass(
          token,
          classItem.classNum,
          setCookie,
          navigate
        );

        if (result === "FC") {
          alert("예약 가능한 인원이 꽉 찼습니다.");
          await fetchData();
        } else if (result === true) {
          alert("예약이 완료되었습니다.");
          await fetchData();
        } else {
          alert("예약에 실패했습니다.");
        }
      }
    } catch (error) {
      alert("예약 처리 중 오류가 발생했습니다.");
      await fetchData();
    }
  };

  const handleCardClick = (classItem) => {};
  // 수업 목록 업데이트
  const updateClassItem = (classNum, isReserved, newCurrentNumber) => {
    const updatedList = classList.map((item) =>
      item.classNum === classNum
        ? { ...item, isReserved, currentNumber: newCurrentNumber }
        : item
    );
    setClassList(updatedList);
  };

  /*출석률 체크바 */
  const renderAttendanceProgress = (count) => {
    const cappedCount = Math.min(count, 4);
    const percentage = (cappedCount / 4) * 100;
    return (
      <div className="attendance-progress-container">
        <span className="attendance-label">출석률({percentage}%)</span>
        <div
          className="attendance-progress-bar"
          aria-label={`출석 ${percentage}% 완료`}
        >
          <div
            className="attendance-progress-fill"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // ★ NEW: selectedDate(달력 값) → YYYY-MM-DD 문자열 동기화
  useEffect(() => {
    setSelectedDateYMD(dateToYMD(selectedDate));
  }, [selectedDate]);

  // ★ NEW: 날짜가 바뀌면 선택된 과목 초기화 (다른 날짜의 stale subjectId 방지)
  useEffect(() => {
    setSelectedSubjectId(null);
    setSelectedSubjectName("");
  }, [selectedDateYMD]);

  // ★ NEW: EA + 날짜 선택 시 과목 목록 조회
  useEffect(() => {
    if (!isAdmin) return; // EA만 조회
    if (!selectedDateYMD) {
      setSubjects([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setIsSubjectsLoading(true);
        const res = await fetchCodingzoneSubjectsByDate(
          selectedDateYMD,
          cookies.accessToken,
          setCookie,
          navigate
        );
        if (cancelled) return;
        if (res?.code === "SU") {
          const classesMap = res.data?.classes ?? {};
          const subs = Object.entries(classesMap).map(([id, name]) => ({
            id: String(id),
            name: String(name),
          }));
          setSubjects(subs);
          // ★ NEW: 현재 선택된 과목이 목록에 없으면 선택 해제
          if (
            subs.length > 0 &&
            selectedSubjectId &&
            !subs.some((s) => String(s.id) === String(selectedSubjectId))
          ) {
            setSelectedSubjectId(null);
            setSelectedSubjectName("");
          }
        } else {
          setSubjects([]);
          setSelectedSubjectId(null);
          setSelectedSubjectName("");
        }
      } finally {
        if (!cancelled) setIsSubjectsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    isAdmin,
    selectedDateYMD,
    cookies.accessToken,
    setCookie,
    navigate,
    selectedSubjectId,
  ]); // ★ NEW

  return (
    <div className="codingzone-container">
      <CodingZoneNavigation />
      <BannerSlider />
      <div className="codingzone-body-container">
        <div className="cz-category-top">
          {isAdmin ? (
            // 과사 조교(EA)에게만 달력 표시
            <div className="cz-date-picker">
              <CalendarInput
                value={selectedDate}
                onChange={setSelectedDate}
                disabledDates={isWeekendYMD} // 주말 비활성
                placeholder="조회할 날짜를 선택하세요"
              />
            </div>
          ) : (
            // 학생 조교/일반 학생에게는 기존 버튼 표시
            <div className="cz-category-date">
              <button
                className={`cz-1 ${selectedZone === 1 ? "selected" : ""}`}
                onClick={() => {
                  setGrade(1);
                  setSelectedZone(1);
                  setSelectedDay("");
                  setClassList(originalClassList);
                }}
              >
                코딩존 1
              </button>
              <button
                className={`cz-2 ${selectedZone === 2 ? "selected" : ""}`}
                onClick={() => {
                  setGrade(2);
                  setSelectedZone(2);
                  setSelectedDay("");
                  setClassList(originalClassList);
                }}
              >
                코딩존 2
              </button>
            </div>
          )}
          {!isAdmin && (
            <Link
              to="/coding-zone/Codingzone_Attendance"
              className="cz-count-container"
            >
              {cookies.accessToken && renderAttendanceProgress(attendanceCount)}
            </Link>
          )}
        </div>

        {isAdmin &&
          (!selectedDateYMD ? (
            <div className="panel-block panel-gray">
              <div className="panel-empty">
                조회하고자 하는 날짜를 입력해주세요.
              </div>
            </div>
          ) : isSubjectsLoading ? (
            <div className="panel-block panel-gray">
              <div className="panel-empty">과목을 불러오는 중…</div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="panel-block panel-gray">
              <div className="panel-empty">
                현재 날짜에 등록된 코딩존이 없습니다.
              </div>
            </div>
          ) : !selectedSubjectId ? (
            <div className="panel-block panel-gray">
              <div className={`panel-inner ${gridClass}`}>
                <div className="subject-grid-inner">
                  {subjects.slice(0, 4).map((s) => (
                    <SubjectCard
                      key={s.id}
                      title={s.name}
                      color={getColorById(s.id)}
                      onClick={() => {
                        setSelectedSubjectId(s.id);
                        setSelectedSubjectName(s.name);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="cz-fixed-panel">
              <div className="cz-fixed-body">
                <button
                  className="return return-back"
                  type="button"
                  onClick={clearSubjectSelection}
                  onMouseEnter={() => setBackIcon("/left.png")}
                  onMouseLeave={() => setBackIcon("/leftnone.png")}
                  onMouseDown={() => setBackIcon("/left.png")}
                  onMouseUp={() => setBackIcon("/left.png")}
                  onFocus={() => setBackIcon("/left.png")}
                  onBlur={() => setBackIcon("/leftnone.png")}
                >
                  <img
                    src={backIcon}
                    alt="뒤로가기"
                    className="btn-icon"
                    draggable="false"
                  />
                  과목 다시 선택하기
                </button>

                <SubjectClassesTable
                  selectedDateYMD={selectedDateYMD}
                  selectedSubjectId={selectedSubjectId}
                  selectedSubjectName={selectedSubjectName}
                  accessToken={cookies.accessToken}
                  setCookie={setCookie}
                  navigate={navigate}
                />
              </div>
            </div>
          ))}
        {!isAdmin && (
          <div className="codingzone-date">
            {days.map((day, index) => (
              <React.Fragment key={day.name}>
                <button
                  onClick={() => filterByDay(day.name)}
                  className={selectedDay === day.name ? "selected" : ""}
                >
                  <p>{day.label}</p>
                </button>
                {index < days.length - 1 && <span> | </span>}
              </React.Fragment>
            ))}
          </div>
        )}
        {!isAdmin && (
          <div className="category-name-container">
            <div className="codingzone-title">
              <p className="weekDay">요일</p>
              <p className="weekDate">날짜</p>
              <p className="weekTime">시간</p>
              <p className="card-hidden-space"></p>
              <p className="weeksubject">과목명</p>
              <p className="weekperson">조교</p>
              <p className="weekcount">인원</p>
              {(cookies.accessToken || isAdmin) && isRendered && (
                <p className="registerbutton"></p>
              )}
            </div>
          </div>
        )}
        {!isAdmin && (
          <div className="codingzone-list">
            {/* 항상 렌더되도록 유지하고, show/hide는 CSS 클래스 이름으로 제어 */}
            <picture
              className={`no-classes-image ${
                showNoClassesImage ? "visible" : "hidden"
              }`}
            >
              <source srcSet="/Codingzone-noregist.webp" type="image/webp" />
              <img
                src="/Codingzone-noregist.png"
                alt="수업이 없습니다"
                className="no-classes-img"
                width="600"
                height="260"
                loading="eager"
                decoding="sync"
              />
            </picture>
            {/* 수업이 있을 경우에만 ClassList 보여줌 */}
            {!showNoClassesImage && (
              <ClassList
                classList={classList}
                handleCardClick={handleCardClick}
                handleToggleReservation={handleToggleReservation}
                isAdmin={isAdmin}
                onDeleteClick={handleDelete}
                userReservedClass={userReservedClass}
                token={token}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingMain;
