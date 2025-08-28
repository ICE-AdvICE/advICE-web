import React, { useState, useEffect, useMemo } from "react";
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
import { getcodingzoneListRequest } from "../../features/api/CodingzoneApi.js";
import { fetchAttendCountBySubject } from "../../entities/api/CodingZone/AdminApi";
import { fetchAllSubjects as fetchAllSubjectsAdmin } from "../../entities/api/CodingZone/AdminApi";
import {
  deleteCodingZoneClass,
  reserveCodingZoneClass,
} from "../../entities/api/CodingZone/StudentApi.js";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js"; //코딩존 네이게이션 바 컴포넌트
import BannerSlider from "../../shared/ui/Banner/BannerSlider"; // ✅ 추가(juhui): 슬라이더 컴포넌트
import CalendarInput from "../../widgets/Calendar/CalendarInput"; // 달력
import { isWeekendYMD } from "../../shared/lib/date"; // 달력
import { getColorById, saveNameIdMap } from "../Coding-zone/subjectColors";
import {
  fetchCodingzoneSubjectsByDate,
  fetchSubjectsPublic,
  fetchClassListBySubjectForUser,
  fetchClassListBySubjectPublic,
} from "../../entities/api/CodingZone/AdminApi";
import { getczattendlistRequest } from "../../features/api/CodingzoneApi.js";
import SubjectCard from "../../widgets/subjectCard/subjectCard.js";
import SubjectClassesTable from "../../widgets/CodingZone/SubjectClassesTable";
import { adminDeleteCodingzoneClassByClassNum } from "../../entities/api/CodingZone/AdminApi.js";

// ★★★ 학생 표의 "상태" 칸(예약 가능/불가/내 예약) 렌더 + hover 시 텍스트 변경 + 클릭으로 예약/취소
const ReserveCell = ({
  cls,
  mine,
  onToggle,
  loggedIn,
  disabledBySameSubject,
}) => {
  const [hover, setHover] = useState(false);
  const isFull = (cls.currentNumber ?? 0) >= (cls.maximumNumber ?? 0);

  // 비로그인 사용자는 라벨 고정 및 비상호작용 + 커스텀 툴팁 표시
  if (!loggedIn) {
    const tooltipText = isFull
      ? "정원이 마감되어 예약할 수 없습니다."
      : "로그인 후 이용 가능합니다.";
    return (
      <span
        className={`czp-tag ${isFull ? "full" : "ok"}`}
        style={{ position: "relative", display: "inline-block" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {isFull ? "정원 마감" : "예약 가능"}
        {hover && (
          <span
            style={{
              position: "absolute",
              top: "-36px" /* 버튼 위쪽에 표시 */,
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              background: "rgba(0,0,0,0.8)",
              color: "#fff",
              fontSize: "12px",
              padding: "6px 8px",
              borderRadius: "4px",
              zIndex: 1000,
              pointerEvents: "none",
            }}
          >
            {tooltipText}
          </span>
        )}
      </span>
    );
  }

  // 예약불가(정원 초과/중복 제한) + 내가 예약한 수업은 예외로 취소 가능
  if ((isFull || disabledBySameSubject) && !mine) {
    const tooltipText = disabledBySameSubject
      ? "이미 진행 중인 예약이 있습니다."
      : "정원이 마감되어 예약할 수 없습니다.";
    return (
      <span
        className={`czp-tag ${disabledBySameSubject ? "disabled" : "full"}`}
        style={{ position: "relative", display: "inline-block" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {disabledBySameSubject ? "예약 불가" : "정원 마감"}
        {hover && (
          <span
            style={{
              position: "absolute",
              top: "-36px",
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              background: "rgba(0,0,0,0.8)",
              color: "#fff",
              fontSize: "12px",
              padding: "6px 8px",
              borderRadius: "4px",
              zIndex: 1000,
              pointerEvents: "none",
            }}
          >
            {tooltipText}
          </span>
        )}
      </span>
    );
  }

  // 라벨 구성: hover 시 문구 변경
  const label = mine
    ? hover
      ? "예약 취소"
      : "내 예약"
    : hover
    ? "예약하기"
    : "예약 가능";
  // 내 예약이면 정원과 무관하게 취소 가능해야 하므로 항상 clickable 처리
  const className = `czp-tag ${mine ? "my" : "ok"} clickable`;

  const handleClick = () => {
    // handleToggleReservation는 isReserved로 분기하므로 넘겨줌
    onToggle({ ...cls, isReserved: !!mine });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <span
      className={className}
      role="button"
      tabIndex={0}
      aria-pressed={mine}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
      onKeyDown={onKeyDown}
    >
      {label}
    </span>
  );
};

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
  const [refreshing, setRefreshing] = useState(false);
  const [allSubjects, setAllSubjects] = useState([]); // 전체 과목 매핑(항상 노출용)
  // ===== 일반학생 subjectId 기반 흐름 =====
  const [publicSubjects, setPublicSubjects] = useState([]); // [{subjectId, subjectName}]
  const [selectedSubjectIdPub, setSelectedSubjectIdPub] = useState(null);
  const [selectedSubjectNamePub, setSelectedSubjectNamePub] = useState("");
  const [classListPub, setClassListPub] = useState([]); // 선택 과목 수업 리스트
  const [loadingPub, setLoadingPub] = useState(false);
  const [bannerPub, setBannerPub] = useState(null); // "UNAVAILABLE" | "EMPTY" | null
  const [myReservedPub, setMyReservedPub] = useState(0);
  const [selectedDayPub, setSelectedDayPub] = useState("");
  // 세션 고정: 예약 메타를 저장해 과목 전환 간 일관성 유지
  const RESERVED_META_KEY = "czp_reserved_meta"; // 배열 형태로 저장 [{classNum, subjectId, classDate, classTime, weekDay}]
  const readReservedMetas = () => {
    try {
      const raw = sessionStorage.getItem(RESERVED_META_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object" && parsed.classNum)
        return [parsed];
      return [];
    } catch {
      return [];
    }
  };
  const writeReservedMetas = (metas) => {
    try {
      sessionStorage.setItem(RESERVED_META_KEY, JSON.stringify(metas));
    } catch {}
  };
  const addReservedMeta = (meta) => {
    const list = readReservedMetas();
    if (!list.some((m) => Number(m.classNum) === Number(meta.classNum))) {
      const next = [...list, meta];
      writeReservedMetas(next);
      setReservedMetas(next);
    }
  };
  const removeReservedMetaByClassNum = (classNum) => {
    const list = readReservedMetas();
    const next = list.filter((m) => Number(m.classNum) !== Number(classNum));
    writeReservedMetas(next);
    setReservedMetas(next);
  };
  const clearReservedMeta = () => {
    try {
      sessionStorage.removeItem(RESERVED_META_KEY);
      setReservedMetas([]);
    } catch {}
  };

  // 모든 코딩존 관련 sessionStorage 데이터 정리
  const clearAllCodingZoneStorage = () => {
    try {
      sessionStorage.removeItem(RESERVED_META_KEY);
      sessionStorage.removeItem("cz_admin_seed");
      setReservedMetas([]);
    } catch {}
  };
  const readReservedMeta = () => {
    const list = readReservedMetas();
    return list.length ? list[0] : null;
  };
  // 내 예약 상세 메타(과목/요일/시간) — 다른 과목 충돌 판정에 사용
  const [myReservedSubjectId, setMyReservedSubjectId] = useState(null);
  const [myReservedWeekDay, setMyReservedWeekDay] = useState("");
  const [myReservedClassTime, setMyReservedClassTime] = useState("");
  const [reservedMetas, setReservedMetas] = useState([]);

  useEffect(() => {
    setReservedMetas(readReservedMetas());

    // 컴포넌트 언마운트 시 sessionStorage 정리
    return () => {
      clearAllCodingZoneStorage();
    };
  }, []);

  // 로그인 상태에서 서버의 전체 예약 리스트와 세션 메타 동기화
  useEffect(() => {
    const token = cookies.accessToken;
    if (!token) {
      // 토큰이 없으면 예약 메타데이터 초기화
      clearAllCodingZoneStorage();
      return;
    }
    (async () => {
      const res = await getczattendlistRequest(token, setCookie, navigate);
      if (res?.code === "SU") {
        const list = res.attendList || [];
        const metas = list.map((it) => ({
          classNum: Number(it.registrationId) ? undefined : undefined, // placeholder; classNum 모르면 보수적으로 유지
          subjectId: undefined,
          classDate: String(it.classDate || ""),
          classTime: String(it.classTime || ""),
          weekDay: "", // 요일은 표 렌더링 시 비교에서 사용하지 않음(같은 과목 주차는 classDate 기준)
        }));
        // 새로운 사용자로 로그인했을 때 기존 sessionStorage 데이터 완전 정리
        clearAllCodingZoneStorage();
        // 서버에서 받은 예약 데이터로 새로 설정
        writeReservedMetas(metas);
        setReservedMetas(metas);
      }
    })();
  }, [cookies.accessToken]);
  const formatHHmmRangeFromStart = (startTime) => {
    if (!startTime) return "";
    const [hh, mm] = startTime.split(":").map(Number);
    const startHHmm = `${String(hh).padStart(2, "0")}:${String(mm).padStart(
      2,
      "0"
    )}`;
    const endH = (hh + 1) % 24; // 24시 넘어가면 00시로
    const endHHmm = `${String(endH).padStart(2, "0")}:${String(mm).padStart(
      2,
      "0"
    )}`;
    return `${startHHmm} ~ ${endHHmm}`;
  };

  const filterByDayPub = (day) => {
    setSelectedDayPub((prev) => (prev === day ? "" : day));
  };
  // ★ 과목 선택 해제 (그리드로 되돌아오기)
  const clearSubjectSelection = () => {
    // 과목 선택 해제 + 필요 시 시드(subjectId) 카드 주입
    setSelectedSubjectId(null);
    setSelectedSubjectName("");
    try {
      const raw = sessionStorage.getItem("cz_admin_seed");
      if (!raw) return;
      const obj = JSON.parse(raw);
      const key = String(obj?.k || "");
      const idx = key.lastIndexOf("-");
      const sid = idx > 0 ? key.slice(0, idx) : "";
      const date = idx > 0 ? key.slice(idx + 1) : "";
      if (date && date === selectedDateYMD && sid) {
        const src = allSubjects.find((s) => String(s.id) === sid);
        const nameToUse = src ? src.name : sid;
        setSubjects((prev) => {
          if (prev.some((p) => String(p.id) === sid)) return prev;
          return [...prev, { id: sid, name: nameToUse }];
        });
      }
    } catch {}
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

  // ★ 동일 주차 판별: ISO 주차 키(YYYY-WW) 계산
  const getIsoWeekKey = (dateStr) => {
    if (!dateStr) return null;
    const d0 = new Date(dateStr);
    if (Number.isNaN(d0.getTime())) return null;
    const d = new Date(Date.UTC(d0.getFullYear(), d0.getMonth(), d0.getDate()));
    const dayNum = d.getUTCDay() || 7; // 1..7 (월=1, 일=7)
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // 해당 주의 목요일
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, "0")}`;
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
      // 토큰이 없어지면 (로그아웃) sessionStorage 정리
      clearAllCodingZoneStorage();
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
      } else {
        // 토큰이 없으면 사용자 역할 초기화
        setIsAdmin(false);
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, [cookies.accessToken]);
  // 👇 비관리자(학생)용 과목 목록 조회 (/api/v1/subjects)
  useEffect(() => {
    if (isAdmin) return; // EA는 달력 기반 별도 흐름
    (async () => {
      const res = await fetchSubjectsPublic();
      if (res?.code === "SU") {
        const list = res?.data?.subjectList ?? [];
        setPublicSubjects(list);
        // 과목명→ID 맵 로컬스토리지 저장 (다른 화면에서 getColorByName 사용 가능)
        const nameIdMap = {};
        for (const s of list) {
          const id = String(s.subjectId ?? s.id ?? "");
          const nm = String(s.subjectName ?? s.name ?? "").trim();
          if (id && nm) nameIdMap[nm] = id;
        }
        saveNameIdMap(nameIdMap);
      } else {
        setPublicSubjects([]);
      }
    })();
  }, [isAdmin]);

  // EA: 전체 과목 매핑을 한 번 가져와 항상 드롭다운에 사용
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        let list = [];
        // 1) 관리자용 전체 과목 시도
        if (cookies.accessToken) {
          const res1 = await fetchAllSubjectsAdmin(
            cookies.accessToken,
            setCookie,
            navigate
          );
          if (res1?.code === "SU") {
            const arr1 = Array.isArray(res1.data)
              ? res1.data
              : Array.isArray(res1.data?.subjectList)
              ? res1.data.subjectList
              : [];
            list = arr1
              .map((s) => ({
                id: String(s.subjectId ?? s.id ?? s.value ?? s.key ?? ""),
                name: String(
                  s.subjectName ?? s.name ?? s.label ?? s.text ?? ""
                ),
              }))
              .filter((x) => x.id && x.name);
          }
        }
        // 2) 실패/빈 결과면 퍼블릭 과목으로 폴백
        if (!list.length) {
          const res2 = await fetchSubjectsPublic();
          if (res2?.code === "SU") {
            const arr2 = Array.isArray(res2.data)
              ? res2.data
              : Array.isArray(res2.data?.subjectList)
              ? res2.data.subjectList
              : [];
            list = arr2
              .map((s) => ({
                id: String(s.subjectId ?? s.id ?? ""),
                name: String(s.subjectName ?? s.name ?? ""),
              }))
              .filter((x) => x.id && x.name);
          }
        }
        setAllSubjects(list);
      } catch {
        setAllSubjects([]);
      }
    })();
  }, [isAdmin, cookies.accessToken, setCookie, navigate]);

  // ★ 학생/비로그인: 과목 목록 로드 후 첫 번째 과목을 기본 선택
  useEffect(() => {
    if (isAdmin) return; // 관리자 흐름 제외
    if (selectedSubjectIdPub) return; // 이미 선택되어 있으면 패스
    if (!publicSubjects || publicSubjects.length === 0) return;
    const first = publicSubjects[0];
    const sid = first.subjectId ?? first.id;
    const sname = first.subjectName ?? first.name;
    if (sid) {
      handlePickSubjectPublic(sid, sname);
    }
  }, [isAdmin, publicSubjects, selectedSubjectIdPub]);

  // 요일과 슬라이더 설정을 상수로 정의
  const daysOfWeek = ["월요일", "화요일", "수요일", "목요일", "금요일"];

  // [과사 권한이 있는 계정] 삭제 버튼
  const handleDelete = async (classNum) => {
    const token = cookies.accessToken;
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    const result = await adminDeleteCodingzoneClassByClassNum(
      classNum,
      token,
      setCookie,
      navigate
    );
    if (result.ok) {
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
      switch (result.code) {
        case "ALREADY_RESERVED_CLASS":
          alert("이미 예약자가 있는 수업은 삭제할 수 없습니다.");
          break;
        case "AF":
          alert("권한이 없습니다.");
          break;
        case "DBE":
          alert("데이터베이스 오류가 발생했습니다.");
          break;
        case "TOKEN_EXPIRED":
          break;
        default:
          alert(result.message ?? "수업 삭제에 실패했습니다.");
      }
    }
  };

  const refetchSubjectsForDate = async () => {
    if (!selectedDateYMD || !isAdmin) return;
    try {
      setRefreshing(true);
      const res = await fetchCodingzoneSubjectsByDate(
        selectedDateYMD,
        cookies.accessToken,
        setCookie,
        navigate
      );
      if (res?.code === "SU") {
        const classesMap = res.data?.classes ?? {};
        const subs = Object.entries(classesMap).map(([id, name]) => ({
          id: String(id),
          name: String(name),
        }));
        setSubjects(subs);
      } else {
        setSubjects([]);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleEmptyAfterDelete = async () => {
    setSelectedSubjectId(null);
    setSelectedSubjectName("");
    await refetchSubjectsForDate();
  };
  // 시간 문자열을 분 단위 숫자로 변환하여 정렬
  const timeToNumber = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };
  // 수업 목록을 요일과 시간 순으로 정렬 (카드뷰 용)
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
        // 세션 저장된 메타 기준으로 화면 표시 고정
        const meta = readReservedMeta();
        setMyReservedPub(meta?.classNum ? Number(meta.classNum) : 0);
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

  // 표용 정렬/필터 결과 (항상 호출되도록 컴포넌트 최상단에서 useMemo 사용)
  const sortedClassListPub = useMemo(() => {
    const base = Array.isArray(classListPub) ? [...classListPub] : [];
    if (!selectedDayPub) {
      return base.sort((a, b) => {
        const dayComparison =
          daysOfWeek.indexOf(a.weekDay) - daysOfWeek.indexOf(b.weekDay);
        if (dayComparison !== 0) return dayComparison;
        return (
          timeToNumber(a.classTime || "") - timeToNumber(b.classTime || "")
        );
      });
    }
    const filtered = base.filter(
      (cls) =>
        (cls.weekDay || "").toLowerCase() === selectedDayPub.toLowerCase()
    );
    return filtered.sort(
      (a, b) =>
        timeToNumber(a.classTime || "") - timeToNumber(b.classTime || "")
    );
  }, [classListPub, selectedDayPub]);

  // 출석 횟수 (과목별): 과목 선택 시마다 최신화
  useEffect(() => {
    const token = cookies.accessToken;
    if (!token || !selectedSubjectIdPub) {
      setAttendanceCount(0); // 과목 미선택/비로그인 시 0 표시
      return;
    }

    const fetchAttendance = async () => {
      const res = await fetchAttendCountBySubject(
        selectedSubjectIdPub,
        token,
        setCookie,
        navigate
      );
      // (신) 서버가 data에 숫자 그대로 반환
      if (res?.code === "SU") {
        setAttendanceCount(Number(res.data ?? 0));
      } else if (res?.code === "TOKEN_EXPIRED") {
        // 로그아웃 처리됨
        setAttendanceCount(0);
      } else {
        // 그 외 실패는 조용히 0 처리
        setAttendanceCount(0);
      }
    };

    fetchAttendance();

    // 출결 업데이트 이벤트 감지하여 즉시 갱신 (단, 버튼이 활성화된 경우만)
    const handleAttendanceUpdate = (event) => {
      if (event.detail.subjectId === selectedSubjectIdPub) {
        // 현재 시간이 수업 시작 시간 이후인지 확인
        const now = new Date();
        const classDateTime = new Date(
          `${event.detail.classDate}T${event.detail.classTime}`
        );
        const canUpdate = now >= classDateTime;

        if (canUpdate) {
          console.log(
            "출결 업데이트 감지 (버튼 활성화 상태), 출석률 즉시 갱신"
          );
          fetchAttendance();
        } else {
          console.log(
            "출결 업데이트 감지 (버튼 비활성화 상태), 출석률 갱신 건너뜀"
          );
        }
      }
    };

    window.addEventListener("attendanceUpdated", handleAttendanceUpdate);

    return () => {
      window.removeEventListener("attendanceUpdated", handleAttendanceUpdate);
    };
  }, [cookies.accessToken, selectedSubjectIdPub]);

  // 예약 기능 토글
  const handleToggleReservation = async (classItem) => {
    const token = cookies.accessToken;
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    // 예약 전 사전 충돌 검사: 세션 배열 기준(여러 건 고려)
    if (!classItem.isReserved) {
      const metas = reservedMetas.length
        ? reservedMetas
        : (() => {
            const m = readReservedMeta();
            return m ? [m] : [];
          })();
      if (metas.length) {
        const rowSubject = String(
          classItem.subjectId ?? classItem.subject_id ?? ""
        );
        for (const m of metas) {
          const mySubject = String(m.subjectId ?? "");
          if (mySubject && rowSubject && mySubject !== rowSubject) {
            const sameDay =
              String(m.weekDay || "").toLowerCase() ===
              String(classItem.weekDay || "").toLowerCase();
            const sameTime =
              String(m.classTime || "") === String(classItem.classTime || "");
            if (sameDay && sameTime) {
              alert("다른 과목에서 같은 시간에 이미 예약 중입니다.");
              return;
            }
          } else if (mySubject && rowSubject && mySubject === rowSubject) {
            const myWeek = getIsoWeekKey(m.classDate);
            const rowWeek = getIsoWeekKey(classItem.classDate);
            if (
              myWeek &&
              rowWeek &&
              myWeek === rowWeek &&
              Number(m.classNum || -1) !== Number(classItem.classNum)
            ) {
              alert("같은 과목에서 같은 주차에는 하나만 예약할 수 있습니다.");
              return;
            }
          }
        }
      }
    }
    // 동시성 동기화를 위한 과목 리스트 재조회 함수
    const refetchClassListForCurrentSubject = async () => {
      if (!selectedSubjectIdPub) return fetchData();
      const api = token
        ? fetchClassListBySubjectForUser
        : fetchClassListBySubjectPublic;
      const res = await api(selectedSubjectIdPub, token);
      if (!res) return;
      const list = res.data?.classList ?? [];
      const registed =
        typeof res.data?.registedClassNum === "number"
          ? res.data.registedClassNum
          : 0;
      if (res.code === "SU") {
        setClassListPub(Array.isArray(list) ? list : []);
        setMyReservedPub(registed);
      }
    };
    try {
      let result;
      // 이미 내 예약 → 취소
      if (classItem.isReserved) {
        result = await deleteCodingZoneClass(
          token,
          classItem.classNum,
          setCookie,
          navigate
        );
        switch (result?.code) {
          case "SU":
            alert("예약 취소가 완료되었습니다.");
            setUserReservedClass(null);
            // ▼ 학생용 표라면: 새로고침 없이 즉시 반영
            if (selectedSubjectIdPub) {
              // 현재 행 인원 -1
              setClassListPub((prev) =>
                prev.map((c) =>
                  c.classNum === classItem.classNum
                    ? {
                        ...c,
                        currentNumber: Math.max(0, (c.currentNumber ?? 0) - 1),
                        isReserved: false,
                        mine: false,
                        reserved: false,
                      }
                    : c
                )
              );
              // 내 예약 해제 (복수 예약 메타에서도 제거)
              removeReservedMetaByClassNum(classItem.classNum);
              setMyReservedPub(0);
              setMyReservedSubjectId(null);
              setMyReservedWeekDay("");
              setMyReservedClassTime("");
              // 정합성 확보를 위해 서버 값으로 재동기화
              await refetchClassListForCurrentSubject();
            } else {
              // 카드뷰(기존 흐름)는 그대로 refetch
              await fetchData();
            }
            break;
          case "NR":
            alert("예약되지 않은 수업입니다.");
            break;
          case "TOKEN_EXPIRED":
          case "ATE":
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            break;
          case "DBE":
            alert("데이터베이스 오류가 발생했습니다.");
            break;
          default:
            alert(result?.message ?? "예약 취소에 실패했습니다.");
        }
      }
      // 신규 예약
      else {
        result = await reserveCodingZoneClass(
          token,
          classItem.classNum,
          setCookie,
          navigate
        );
        switch (result?.code) {
          case "SU":
            alert("예약이 완료되었습니다.");
            // ▼ 학생용 표라면: 새로고침 없이 즉시 반영
            if (selectedSubjectIdPub) {
              setClassListPub((prev) =>
                prev.map((c) => {
                  // 방금 예약한 행: 인원 +1 및 내 예약 표시
                  if (c.classNum === classItem.classNum) {
                    return {
                      ...c,
                      currentNumber: (c.currentNumber ?? 0) + 1,
                      isReserved: true,
                      mine: true,
                      reserved: true,
                    };
                  }
                  // 이전 예약은 유지 (복수 예약 허용 UI) → 변경 없음
                  return c;
                })
              );
              // 내 예약 대상 갱신 + 메타 추가(복수 저장)
              addReservedMeta({
                classNum: classItem.classNum,
                subjectId: selectedSubjectIdPub,
                classDate: String(classItem.classDate || ""),
                classTime: String(classItem.classTime || ""),
                weekDay: String(classItem.weekDay || ""),
              });
              setMyReservedPub(classItem.classNum);
              setMyReservedSubjectId(String(selectedSubjectIdPub));
              setMyReservedWeekDay(String(classItem.weekDay || ""));
              setMyReservedClassTime(String(classItem.classTime || ""));
              // 정합성 확보를 위해 서버 값으로 재동기화(동시성 케이스 대비)
              await refetchClassListForCurrentSubject();
            } else {
              // 카드뷰(기존 흐름)는 그대로 refetch
              await fetchData();
            }
            break;
          case "FC":
            alert("예약 가능한 인원이 꽉 찼습니다.");
            // 동시성: 다른 사용자에 의해 정원 마감 → 즉시 재조회로 버튼 상태 동기화
            await refetchClassListForCurrentSubject();
            break;
          case "AR":
            alert("이미 예약한 수업이 있습니다.");
            // 서버 기준으로 내 예약 대상이 바뀌었을 수 있으니 재조회로 동기화
            await refetchClassListForCurrentSubject();
            break;
          case "TOKEN_EXPIRED":
          case "ATE":
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            break;
          case "DBE":
            alert("데이터베이스 오류가 발생했습니다.");
            break;
          default:
            alert(result?.message ?? "예약에 실패했습니다.");
        }
      }
    } catch (error) {
      alert("예약 처리 중 오류가 발생했습니다.");
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

  // 👇 학생: 과목 선택 핸들러 (subjectId 기준으로 리스트 조회)
  const handlePickSubjectPublic = async (subjectId, subjectName) => {
    setSelectedSubjectIdPub(subjectId);
    setSelectedSubjectNamePub(subjectName);
    setLoadingPub(true);
    setBannerPub(null);
    setClassListPub([]);
    // 기존 복수 예약 메타는 유지하여 다른 과목 전환 시에도 '내 예약' 표시 유지
    const metas = readReservedMetas();
    setReservedMetas(metas);
    setSelectedDayPub("");

    const token = cookies.accessToken;
    const api = token
      ? fetchClassListBySubjectForUser
      : fetchClassListBySubjectPublic;
    const res = await api(subjectId, token);
    setLoadingPub(false);

    if (!res) return;
    const code = res.code;
    // ✅ 서버 응답은 { code, message, data: { classList: [], registedClassNum: 0 } } 형태
    const list = res.data?.classList ?? [];
    const registed =
      typeof res.data?.registedClassNum === "number"
        ? res.data.registedClassNum
        : 0;

    if (code === "SU") {
      const normalized = Array.isArray(list) ? list : [];
      setClassListPub(normalized);
      // 세션의 복수 예약 메타를 우선 적용하여 해당 과목의 '내 예약' 표시
      const metas = readReservedMetas();
      setReservedMetas(metas);
      const mineInThisSubject = metas.find(
        (m) => String(m.subjectId) === String(subjectId)
      );
      if (mineInThisSubject) {
        setMyReservedPub(Number(mineInThisSubject.classNum));
        setMyReservedSubjectId(String(mineInThisSubject.subjectId));
        setMyReservedWeekDay(String(mineInThisSubject.weekDay || ""));
        setMyReservedClassTime(String(mineInThisSubject.classTime || ""));
      } else {
        setMyReservedPub(registed);
        const mineRow = normalized.find((r) => r.classNum === registed);
        if (mineRow) {
          setMyReservedSubjectId(subjectId);
          setMyReservedWeekDay(String(mineRow.weekDay || ""));
          setMyReservedClassTime(String(mineRow.classTime || ""));
        }
      }
      // 성공인데 리스트가 비면 EMPTY 배너로 정리
      if (!list.length) setBannerPub("EMPTY");
      return;
    }
    if (code === "CLASS_UNAVAILABLE_PERIOD") {
      setBannerPub("UNAVAILABLE");
      return;
    }
    if (code === "NOT_FOUND_CLASS" || code === "NA") {
      setBannerPub("EMPTY");
      return;
    }
    setBannerPub("EMPTY");
  };

  /*출석률 체크바 */
  const renderAttendanceProgress = (count) => {
    // 출석 횟수가 음수면 0으로 처리
    const safeCount = Math.max(0, count);
    const cappedCount = Math.min(safeCount, 4);
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

  // 날짜 변경 시에도 과목 선택은 유지 (요청사항 반영)

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
          let subs = Object.entries(classesMap).map(([id, name]) => ({
            id: String(id),
            name: String(name),
          }));
          // 선택된 과목이 목록에 없으면 동적으로 추가(카드 보이도록)
          if (selectedSubjectId) {
            const exist = subs.some(
              (s) => String(s.id) === String(selectedSubjectId)
            );
            if (!exist) {
              // allSubjects에서 이름 찾고, 없으면 기존 상태에서 찾기
              const src =
                allSubjects.find(
                  (s) => String(s.id) === String(selectedSubjectId)
                ) ||
                subjects.find(
                  (s) => String(s.id) === String(selectedSubjectId)
                );
              const nameToUse = src
                ? src.name
                : String(selectedSubjectName || selectedSubjectId);
              subs = [
                ...subs,
                { id: String(selectedSubjectId), name: nameToUse },
              ];
            }
          }
          setSubjects(subs);
          // 선택 과목은 유지. 빈 결과라도 당장 초기화하지 않음(편집 직후 레이스 방지)
        } else {
          // 실패 시에도: 시드/선택 과목을 카드에 노출하여 바로 선택 가능하게 함
          let subs = [];
          try {
            const raw = sessionStorage.getItem("cz_admin_seed");
            if (raw) {
              const obj = JSON.parse(raw);
              const key = String(obj?.k || "");
              const idx = key.lastIndexOf("-");
              const sidStr = idx > 0 ? key.slice(0, idx) : ""; // subjectId
              const ymd = idx > 0 ? key.slice(idx + 1) : ""; // date
              if (ymd === selectedDateYMD && sidStr) {
                const src = allSubjects.find((s) => String(s.id) === sidStr);
                subs = [{ id: sidStr, name: src ? src.name : sidStr }];
              }
            }
          } catch {}
          if (!subs.length && selectedSubjectId) {
            const src =
              allSubjects.find(
                (s) => String(s.id) === String(selectedSubjectId)
              ) ||
              subjects.find((s) => String(s.id) === String(selectedSubjectId));
            const nameToUse = src
              ? src.name
              : String(selectedSubjectName || selectedSubjectId);
            subs = [{ id: String(selectedSubjectId), name: nameToUse }];
          }
          setSubjects(subs);
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
    selectedSubjectName,
    allSubjects,
  ]); // ★ NEW

  return (
    <div className="codingzone-container">
      <CodingZoneNavigation />
      <BannerSlider />
      <div className="codingzone-body-container">
        {/* 상단: 출석률 (오른쪽 정렬) — 과목 선택 전에는 숨김 */}
        {!isAdmin && selectedSubjectIdPub && (
          <div className="cz-topbar">
            <Link
              to="/coding-zone/codingzone-attendance"
              className="cz-count-container"
            >
              {cookies.accessToken && renderAttendanceProgress(attendanceCount)}
            </Link>
          </div>
        )}
        {/* 하단: 과목칩(중앙) 또는 EA 달력 */}
        <div className="cz-category-top">
          {isAdmin ? (
            <div className="cz-date-picker">
              <CalendarInput
                value={selectedDateYMD}
                onChange={(ymd) => {
                  // 빈 값(해제) 처리: 상태를 명확히 초기화
                  if (!ymd) {
                    setSelectedDateYMD("");
                    setSelectedDate(null);
                    return;
                  }

                  // 날짜가 변경되면 과목 선택 초기화
                  if (ymd !== selectedDateYMD) {
                    setSelectedSubjectId(null);
                    setSelectedSubjectName("");
                  }

                  setSelectedDateYMD(ymd);
                  try {
                    const d = new Date(ymd);
                    if (!Number.isNaN(d.getTime())) setSelectedDate(d);
                  } catch {}
                }}
                disabledDates={isWeekendYMD}
                placeholder="조회할 날짜를 선택하세요"
              />
            </div>
          ) : (
            <div className="czp-subject-bar">
              {publicSubjects.map((s) => {
                const sid = s.subjectId ?? s.id;
                const active = selectedSubjectIdPub === sid;
                const color = getColorById(sid, "#475569");
                return (
                  <button
                    key={sid}
                    type="button"
                    className={`czp-chip ${active ? "active" : ""}`}
                    style={{
                      backgroundColor: active ? color : "#EFEFEF",
                      color: active ? "#FFFFFF" : "#ADACAC",
                      border: "none",
                    }}
                    onClick={() =>
                      handlePickSubjectPublic(sid, s.subjectName ?? s.name)
                    }
                  >
                    {s.subjectName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ▼ 추가: 학생 전용 요일바 (과목 선택 후 표시) */}
        {!isAdmin && selectedSubjectIdPub && (
          <div className="czp-weekbar" role="tablist" aria-label="요일 필터">
            {["월요일", "화요일", "수요일", "목요일", "금요일"].map((d, i) => (
              <React.Fragment key={d}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedDayPub === d}
                  className={`weekbtn ${selectedDayPub === d ? "active" : ""}`}
                  onClick={() => filterByDayPub(d)}
                >
                  {d}
                </button>
                {i < 4 && <span className="sep" aria-hidden="true" />}
              </React.Fragment>
            ))}{" "}
          </div>
        )}

        {isAdmin &&
          (!selectedDateYMD ? (
            <div className="panel-block panel-gray">
              <div className="panel-empty">
                조회하고자 하는 날짜를 입력해주세요.
              </div>
            </div>
          ) : selectedSubjectId ? (
            <div className="cz-fixed-panel">
              <div className="cz-fixed-body">
                <SubjectClassesTable
                  key={`admin-${selectedSubjectId || "none"}`}
                  selectedDateYMD={selectedDateYMD}
                  selectedSubjectId={selectedSubjectId}
                  selectedSubjectName={selectedSubjectName}
                  accessToken={cookies.accessToken}
                  setCookie={setCookie}
                  navigate={navigate}
                  subjectOptions={allSubjects}
                  onEmptyAfterDelete={handleEmptyAfterDelete}
                  onDateChanged={(nextYMD, nextSubjectId, seed) => {
                    // 날짜가 바뀌면 새 날짜로 즉시 이동 + 필요 시 과목도 동기화
                    try {
                      const d = new Date(nextYMD);
                      if (!Number.isNaN(d.getTime())) setSelectedDate(d);
                    } catch {}
                    setSelectedDateYMD(nextYMD);
                    if (
                      nextSubjectId &&
                      String(nextSubjectId) !== String(selectedSubjectId)
                    ) {
                      setSelectedSubjectId(String(nextSubjectId));
                      const hit = subjects.find(
                        (s) => String(s.id) === String(nextSubjectId)
                      );
                      if (hit) setSelectedSubjectName(hit.name);
                      else {
                        // 날짜별 과목 목록에 없으면 동적으로 추가하여 바로 이동 가능하게 함
                        const src = allSubjects.find(
                          (s) => String(s.id) === String(nextSubjectId)
                        );
                        const nameToUse = src
                          ? src.name
                          : String(nextSubjectId);
                        setSubjects((prev) => {
                          const exists = prev.some(
                            (p) => String(p.id) === String(nextSubjectId)
                          );
                          if (exists) return prev;
                          return [
                            ...prev,
                            { id: String(nextSubjectId), name: nameToUse },
                          ];
                        });
                        setSelectedSubjectName(nameToUse);
                      }
                    }
                    // 서버가 아직 비어 있어도 사용자에게 변경이 보이도록 시드 1건 전달
                    if (seed) {
                      // 시드는 해당 테이블로 내려보낸다: SubjectClassesTable props에 seedRows 추가 필요
                      // 현재 SubjectClassesTable 인스턴스는 key로 재마운트되므로 seedRows 전달 포함
                      // 이 콜백에서는 상태만 준비하면 됨
                      // 상태 보관은 간단히 sessionStorage를 사용해 전달
                      try {
                        sessionStorage.setItem(
                          "cz_admin_seed",
                          JSON.stringify({
                            k: `${String(
                              nextSubjectId || selectedSubjectId
                            )}-${nextYMD}`,
                            row: seed,
                          })
                        );
                      } catch {}
                    }
                  }}
                  seedRows={(() => {
                    try {
                      const raw = sessionStorage.getItem("cz_admin_seed");
                      if (!raw) return [];
                      const obj = JSON.parse(raw);
                      const expectedKey = `${String(
                        selectedSubjectId
                      )}-${selectedDateYMD}`;
                      if (obj?.k === expectedKey && obj?.row) {
                        // 일회성으로 소비하고 제거
                        sessionStorage.removeItem("cz_admin_seed");
                        return [obj.row];
                      }
                    } catch {}
                    return [];
                  })()}
                />
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
          ) : (
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
          ))}
        {!isAdmin && (
          <>
            {/* ① 과목칩이 있을 때: 선택 전이면 문구만 노출 */}
            {publicSubjects.length > 0 && !selectedSubjectIdPub && (
              <div className="panel-block panel-gray">
                <div className="panel-empty">
                  예약하고자 하는 코딩존을 선택해주세요.
                </div>
              </div>
            )}

            {/* 과목 버튼이 아예 없을 때만 안내 이미지 표시 */}
            {publicSubjects.length === 0 && (
              <img
                src="/Codingzone-noregist.png"
                alt="예약 안내 이미지"
                className="czp-guide-image"
              />
            )}

            {/* ② 로딩 중: 회색 패널로 로딩 표시 (표 헤더 깜빡임 방지) */}
            {selectedSubjectIdPub && loadingPub && (
              <div className="panel-block panel-gray">
                <div className="panel-empty">불러오는 중…</div>
              </div>
            )}

            {/* ③ 선택했지만 조회 불가/없음: 회색 패널로 메시지 */}
            {selectedSubjectIdPub &&
              !loadingPub &&
              bannerPub === "UNAVAILABLE" && (
                <div className="panel-block panel-gray">
                  <div className="panel-empty">현재 예약 시간이 아닙니다.</div>
                </div>
              )}
            {selectedSubjectIdPub && !loadingPub && bannerPub === "EMPTY" && (
              <div className="panel-block panel-gray">
                <div className="panel-empty">해당 코딩존 수업이 없습니다.</div>
              </div>
            )}

            {/* ④ 리스트(표): 로딩 끝 + 성공 + 실제 데이터가 있을 때만 렌더 */}
            {selectedSubjectIdPub &&
              !loadingPub &&
              !bannerPub &&
              classListPub.length > 0 && (
                <section className="czp-table-wrap">
                  <div className="czp-table-shell">
                    <div className="czp-table-scroll">
                      <table className="czp-table">
                        <thead>
                          <tr
                            style={{
                              backgroundColor: getColorById(
                                selectedSubjectIdPub,
                                "#475569"
                              ),
                              color: "#FFFFFF",
                            }}
                          >
                            <th>요일</th>
                            <th>시간</th>
                            <th>수업명</th>
                            <th>조교</th>
                            <th>인원</th>
                            <th>상태</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedClassListPub.map((cls) => {
                            // '내 예약'은: (1) 내가 예약한 classNum과 동일하고 (2) subjectId가 확실히 일치할 때만 표시
                            const myRow = Array.isArray(classListPub)
                              ? classListPub.find(
                                  (r) => r.classNum === myReservedPub
                                )
                              : undefined;
                            // 복수 예약: reservedMetas에 해당 classNum이 있으면 모두 "내 예약"
                            // 또는 서버 registedClassNum과 일치하면 "내 예약"
                            const mine =
                              reservedMetas.some(
                                (m) =>
                                  Number(m.classNum) === Number(cls.classNum)
                              ) ||
                              (typeof myReservedPub === "number" &&
                                myReservedPub === cls.classNum);
                            // 비활성화 규칙:
                            // - 다른 과목이면서 (요일 AND 시간) 둘 다 같으면 비활성화
                            // - 같은 과목이면 기존 로직(같은 주) 유지
                            const disabledBySameSubject =
                              !mine &&
                              (reservedMetas.length > 0 || !!myReservedPub) &&
                              (() => {
                                const rowSubject = String(
                                  cls.subjectId ?? cls.subject_id ?? ""
                                );
                                const metas = reservedMetas.length
                                  ? reservedMetas
                                  : (() => {
                                      const m = readReservedMeta();
                                      if (m) return [m];
                                      const r = Array.isArray(classListPub)
                                        ? classListPub.find(
                                            (r) => r.classNum === myReservedPub
                                          )
                                        : undefined;
                                      if (r)
                                        return [
                                          {
                                            classNum: r.classNum,
                                            subjectId:
                                              r.subjectId ?? r.subject_id,
                                            classDate: String(
                                              r.classDate || ""
                                            ),
                                            classTime: String(
                                              r.classTime || ""
                                            ),
                                            weekDay: String(r.weekDay || ""),
                                          },
                                        ];
                                      return [];
                                    })();
                                if (!rowSubject || metas.length === 0)
                                  return false;
                                for (const m of metas) {
                                  const mSubject = String(m.subjectId || "");
                                  if (!mSubject) continue;
                                  if (mSubject !== rowSubject) {
                                    const sameDay =
                                      String(m.weekDay || "").toLowerCase() ===
                                      String(cls.weekDay || "").toLowerCase();
                                    const sameTime =
                                      String(m.classTime || "") ===
                                      String(cls.classTime || "");
                                    if (sameDay && sameTime) return true;
                                  } else {
                                    const mWeek = getIsoWeekKey(m.classDate);
                                    const rWeek = getIsoWeekKey(cls.classDate);
                                    if (
                                      mWeek &&
                                      rWeek &&
                                      mWeek === rWeek &&
                                      Number(m.classNum || -1) !==
                                        Number(cls.classNum)
                                    )
                                      return true;
                                  }
                                }
                                return false;
                              })();
                            return (
                              <tr
                                key={`${cls.classNum}-${
                                  cls.subjectId ?? cls.subject_id ?? ""
                                }-${cls.classDate ?? ""}-${
                                  cls.classTime ?? ""
                                }`}
                              >
                                <td>{cls.weekDay}</td>
                                <td>
                                  {formatHHmmRangeFromStart(cls.classTime)}
                                </td>
                                <td>{cls.className}</td>
                                <td>{cls.assistantName}</td>
                                <td>
                                  {cls.currentNumber} / {cls.maximumNumber}
                                </td>
                                <td>
                                  <ReserveCell
                                    cls={cls}
                                    mine={mine}
                                    onToggle={handleToggleReservation}
                                    loggedIn={!!cookies.accessToken}
                                    disabledBySameSubject={
                                      disabledBySameSubject
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default CodingMain;
