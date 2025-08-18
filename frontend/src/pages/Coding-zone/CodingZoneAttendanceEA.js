//과사 조교님 버전 출결관리
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
import {
  fetchCodingzoneSubjectsByDate,
  fetchClassesBySubjectAndDate,
  fetchApplicantsByClassNum,
  toggleAttendanceByRegistNum,
} from "../../entities/api/CodingZone/AdminApi";
import SubjectCard from "../../widgets/subjectCard/subjectCard.js";
import { getColorById } from "../Coding-zone/subjectColors";

const CodingZoneAttendanceAssistant = () => {
  const [attendList, setAttendList] = useState([]);

  const [reservedList, setReservedList] = useState([]);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [activeButton, setActiveButton] = useState("manage");
  const token = cookies.accessToken;
  const navigate = useNavigate();
  // 날짜에 해당하는 과목 목록 상태
  const [subjects, setSubjects] = useState([]); // [{ id, name }]
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  // 과목/조교 선택 상태 (지금은 디자인 단계라 기본 null 유지)
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedAssistantId, setSelectedAssistantId] = useState(null);
  // ▼ 과목 선택 → 수업 리스트 표시용
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [classes, setClasses] = useState([]); // [{classTime, assistantName, groupId, classStatus, classNum}]

  const [isClassesLoading, setIsClassesLoading] = useState(false);

  const [selectedClassNum, setSelectedClassNum] = useState(null); // ★ 클릭된 수업
  const [students, setStudents] = useState([]); // ★ 학생 리스트
  const [isStudentsLoading, setIsStudentsLoading] = useState(false); // ★ 학생 로딩

  const count = subjects.length;
  const gridClass =
    count === 4
      ? "subject-grid cols-2x2"
      : count === 3
      ? "subject-grid layout-3"
      : count === 2
      ? "subject-grid cols-2"
      : "subject-grid cols-1"; // 1개
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

  // 날짜가 바뀌면 과목 선택/표 상태 초기화(= 카드 그리드로 복귀)
  useEffect(() => {
    setSelectedSubjectId(null);
    setSelectedSubjectName("");
    setSelectedAssistantId(null);
    setClasses([]);
    setSelectedClassNum(null);
    setStudents([]);
  }, [selectedDateYMD]);

  useEffect(() => {
    if (!selectedSubjectId || !selectedDateYMD) {
      setClasses([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsClassesLoading(true);
      const res = await fetchClassesBySubjectAndDate(
        selectedSubjectId,
        selectedDateYMD,
        token,
        setCookie,
        navigate
      );
      if (cancelled) return;

      if (res?.code === "SU") {
        // 시간 오름차순 정렬
        const sorted = (res.data ?? [])
          .slice()
          .sort((a, b) =>
            String(a.classTime).localeCompare(String(b.classTime))
          );
        setClasses(sorted);
      } else {
        setClasses([]);
        // 필요 시 메시지 처리: res?.message
      }
      setIsClassesLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSubjectId, selectedDateYMD, token, setCookie, navigate]);

  useEffect(() => {
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
          token,
          setCookie,
          navigate
        );

        if (cancelled) return;

        if (res && res.code === "SU") {
          const classesMap = res.data?.classes ?? {};
          // {"1":"컴프", "2":"자료구조"} → [{id:"1", name:"컴프"}, ...]
          const subs = Object.entries(classesMap).map(([id, name]) => ({
            id: String(id),
            name: String(name),
          }));
          setSubjects(subs);
        } else {
          setSubjects([]);
        }
      } finally {
        if (!cancelled) setIsSubjectsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDateYMD, token, setCookie, navigate]);

  // 과목 클릭 → 해당 과목 수업 조회 → 가장 이른 수업 자동 선택 → 학생 목록 페이지로 전환
  const handleSubjectClick = async (subject) => {
    setSelectedSubjectId(subject.id);
    setSelectedSubjectName(subject.name);
    setSelectedClassNum(null); // 학생 표 초기화
    setStudents([]);
    setIsClassesLoading(true);
    const res = await fetchClassesBySubjectAndDate(
      subject.id,
      selectedDateYMD,
      token,
      setCookie,
      navigate
    );
    setIsClassesLoading(false);

    if (
      res?.code !== "SU" ||
      !Array.isArray(res.data) ||
      res.data.length === 0
    ) {
      setClasses([]);
      setSelectedClassNum(null);
      setStudents([]);
      alert("해당 과목에 등록된 코딩존이 없습니다.");
      return;
    }

    const sorted = res.data
      .slice()
      .sort((a, b) => String(a.classTime).localeCompare(String(b.classTime)));
    setClasses(sorted);

    // ★ 가장 이른 시간의 수업으로 바로 이동
    const first = sorted[0];
    setSelectedClassNum(first.classNum);
    await loadStudents(first.classNum, first.classTime);
  };

  // 수업 클릭 → 학생 리스트 로드   // ★ 새 추가
  const handleClassClick = async (c) => {
    setSelectedClassNum(c.classNum);
    await loadStudents(c.classNum, c.classTime);
  };

  // 학생 리스트 로드
  const loadStudents = async (classNum, fallbackTime = "") => {
    setIsStudentsLoading(true);
    const res = await fetchApplicantsByClassNum(
      classNum,
      token,
      setCookie,
      navigate
    );
    if (res?.code === "SU") {
      const raw = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.studentList)
        ? res.studentList
        : Array.isArray(res?.data?.studentList)
        ? res.data.studentList
        : [];
      const list = raw.map((it) => ({
        userName: it.userName,
        userStudentNum: it.userStudentNum,
        attendance: String(it.attendance ?? ""), // "1" | "0" | ""
        registrationId: it.registrationId ?? it.registerId,
        classTime: it.classTime ?? fallbackTime,
      }));
      list.sort((a, b) =>
        String(a.classTime).localeCompare(String(b.classTime))
      );
      setStudents(list);
    } else {
      setStudents([]);
    }
    setIsStudentsLoading(false);
  };

  // 출결 토글(버튼)
  const handleToggleAttendance = async (e, student, target) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if ((student.attendance ?? "") === target) return; // 같은 상태면 무시
    const res = await toggleAttendanceByRegistNum(
      student.registrationId,
      token,
      setCookie,
      navigate
    );
    if (res?.code === "SU" && selectedClassNum) {
      await loadStudents(selectedClassNum);
    } else if (res?.message) {
      alert(res.message);
    }
  };
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
        {/* ====== 과목 카드 그리드 (panel-gray 안) ====== */}
        {!selectedSubjectId && (
          <div className="panel-gray">
            {!selectedDateYMD ? (
              <div className="panel-empty">
                조회하고자 하는 날짜를 입력해주세요.
              </div>
            ) : isSubjectsLoading ? (
              <div className="panel-empty">과목을 불러오는 중…</div>
            ) : subjects.length === 0 ? (
              <div className="panel-empty">
                현재 날짜에 등록된 코딩존이 없습니다.
              </div>
            ) : (
              <div className={`panel-inner ${gridClass}`}>
                <div className="subject-grid-inner">
                  {subjects.slice(0, 4).map((s) => (
                    <SubjectCard
                      key={s.id}
                      title={s.name}
                      color={getColorById(s.id)}
                      onClick={(e) => {
                        e?.preventDefault?.();
                        e?.stopPropagation?.();
                        handleSubjectClick(s);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* 2) 수업 리스트 */}
        {selectedSubjectId && !selectedClassNum && (
          <div className="cz-classes">
            <div className="cz-classes-title">
              <strong className="subject-name">{selectedSubjectName}</strong>{" "}
              코딩존 현황
            </div>

            <div className="cz-classes-back">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setSelectedSubjectId(null);
                  setSelectedSubjectName("");
                  setClasses([]);
                  setSelectedClassNum(null);
                  setStudents([]);
                }}
              >
                ← 뒤로가기
              </button>
            </div>

            <div className="manager-table-card">
              {isClassesLoading ? (
                <div className="panel-gray">
                  <div className="panel-empty" style={{ margin: 0 }}>
                    수업을 불러오는 중…
                  </div>
                </div>
              ) : classes.length === 0 ? (
                <div className="panel-gray">
                  <div className="panel-empty" style={{ margin: 0 }}>
                    해당 과목에 등록된 코딩존이 없습니다.
                  </div>
                </div>
              ) : (
                <table className="manager-table">
                  <thead>
                    <tr>
                      <th style={{ width: "33%" }}>조교명</th>
                      <th style={{ width: "20%" }}>조 정보</th>
                      <th>시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((c) => (
                      <tr
                        key={c.classNum}
                        className={`clickable-row ${
                          selectedClassNum === c.classNum ? "is-active" : ""
                        }`}
                        onClick={() => handleClassClick(c)} // ★ 수업 클릭 → 학생 리스트
                      >
                        <td>{c.assistantName || "-"}</td>
                        <td>{c.groupId || "-"}</td>
                        <td>{formatTime(c.classTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        {/* 3) 학생 리스트: 수업을 고른 뒤에 보임 */} {/* ★ 추가 */}
        {selectedSubjectId && selectedClassNum && (
          <div className="cz-classes">
            <div className="cz-classes-title">
              <strong className="subject-name">{selectedSubjectName}</strong>{" "}
              코딩존 수강 학생 현황
            </div>

            <div className="cz-classes-back">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  // ← 수업 목록으로
                  setSelectedClassNum(null);
                  setStudents([]);
                }}
              >
                ← 뒤로가기
              </button>
            </div>

            <div className="manager-table-card">
              <table className="manager-table students-table">
                <thead>
                  <tr>
                    <th style={{ width: "33%" }}>이름</th>
                    <th style={{ width: "27%" }}>학번</th>
                    <th>출결</th>
                  </tr>
                </thead>

                <tbody>
                  {isStudentsLoading ? (
                    <tr>
                      <td colSpan={3}>
                        <div className="panel-empty" style={{ margin: 0 }}>
                          학생을 불러오는 중…
                        </div>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={3}>
                        <div className="panel-student" style={{ margin: 0 }}>
                          예약된 리스트가 없습니다.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    students.map((st, i) => (
                      <tr key={i}>
                        <td>{st.userName}</td>
                        <td>{st.userStudentNum}</td>
                        <td>
                          {st.attendance === "1" ? (
                            <>
                              <button
                                className="btn_manager_attendance"
                                disabled
                              >
                                출석
                              </button>
                              <button
                                className="btn_manager_absence-disabled"
                                onClick={(e) =>
                                  handleToggleAttendance(e, st, "0")
                                }
                              >
                                결석
                              </button>
                            </>
                          ) : st.attendance === "0" ? (
                            <>
                              <button
                                className="btn_manager_attendance-disabled"
                                onClick={(e) =>
                                  handleToggleAttendance(e, st, "1")
                                }
                              >
                                출석
                              </button>
                              <button className="btn_manager_absence" disabled>
                                결석
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn_manager_attendance-disabled"
                                onClick={() => handleToggleAttendance(st, "1")}
                              >
                                출석
                              </button>
                              <button
                                className="btn_manager_absence-disabled"
                                onClick={() => handleToggleAttendance(st, "0")}
                              >
                                결석
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
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
