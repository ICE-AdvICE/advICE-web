import React, { useState, useEffect } from "react";
import "../css/codingzone/codingzone-main.css";
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

  return (
    <div className="codingzone-container">
      <CodingZoneNavigation />
      <BannerSlider />
      <div className="codingzone-body-container">
        <div className="cz-category-top">
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
          <Link
            to="/coding-zone/Codingzone_Attendance"
            className="cz-count-container"
          >
            {token && renderAttendanceProgress(attendanceCount)}
          </Link>
        </div>
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
      </div>
    </div>
  );
};

export default CodingMain;
