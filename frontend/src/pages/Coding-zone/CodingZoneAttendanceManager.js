import React, { useEffect, useState } from "react";

import {
  getEntireAttendanceBySubject,
  downloadAttendanceExcelBySubject,
} from "../../features/api/Admin/Codingzone/ClassApi.js";
import { useCookies } from "react-cookie";
import "../css/codingzone/codingzone-main.css";
import "../css/codingzone/codingzone_attend.css";
import "../css/codingzone/codingzone_all_attendance.css";
import "../../shared/ui/boardbar/CodingZoneBoardbar.css";
import { useNavigate } from "react-router-dom";
import InquiryModal from "./InquiryModal.js";
import { getczauthtypetRequest } from "../../shared/api/AuthApi.js";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js"; //코딩존 네이게이션 바 컴포넌트
import Banner from "../../shared/ui/Banner/Banner"; // ✅ 추가(juhui): 공통 배너 컴포넌트 적용
import CodingZoneBoardbar from "../../shared/ui/boardbar/CodingZoneBoardbar.js"; //코딩존 보드 바(버튼 네개) 컴포넌트
import { fetchAllSubjects } from "../../entities/api/CodingZone/AdminApi.js"; //(NEW)수업 매핑 정보 API 연동

const CodingZoneAttendanceManager = () => {
  const [authMessage, setAuthMessage] = useState("");
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [showManageAllButton, setShowManageAllButton] = useState(false);
  const [showRegisterClassButton, setShowRegisterClassButton] = useState(false);
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [activeButton, setActiveButton] = useState("manage_all");
  const [attendanceList, setAttendanceList] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const token = cookies.accessToken;
  const navigate = useNavigate();
  const [selectedButton, setSelectedButton] = useState("attendence");

    // 과목 목록/선택 상태
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

    // 로딩/오류
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  


  const handlecodingzonemanager = () => {
    navigate(`/coding-zone/Codingzone_Manager`);
  };

  const handleClassRegistration = () => {
    navigate(`/coding-zone/coding-class-regist`);
  };

  useEffect(() => {
    const fetchAuthType = async () => {
      const response = await getczauthtypetRequest(token, setCookie, navigate);
      if (response) {
        switch (response.code) {
          case "CA":
            setShowAdminButton(true);

            break;
          case "EA":
            setShowRegisterClassButton(true);
            setShowManageAllButton(true); // Also show '전체 관리' for EA
            break;
          case "NU":
            alert("로그인 시간이 만료되었습니다. 다시 로그인 해주세요.");
            navigate("/");
            break;
          case "DBE":
            alert("데이터베이스 오류입니다.");
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
  }, [token, authMessage]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErrMsg("");

      const res = await fetchAllSubjects(token, setCookie, navigate);
      setLoading(false);

      if (!res) return;

      // 1) 실제로 배열로 바로 내려오는 경우 (예: [{subjectId, subjectName}, ...])
      if (Array.isArray(res)) {
        console.log("[/subjects] array response:", res);
        setSubjects(res);
        setSelectedSubjectId(res.length > 0 ? Number(res[0].subjectId) : null);
        return;
      }

      // 2) 문서대로 code/data 래핑되어 오는 경우
      if (res.code === "SU") {
        const list = res.data?.subjectList ?? [];
        console.log("[/subjects] wrapped response:", list);
        setSubjects(list);
        setSelectedSubjectId(list.length > 0 ? Number(list[0].subjectId) : null);
      } else if (res.code === "AF") {
        setErrMsg("권한이 없습니다.");
      } else if (res.code === "NOT_ANY_MAPPINGSET") {
        setErrMsg("등록된 코딩존 과목이 없습니다.");
        setSubjects([]);
        setSelectedSubjectId(null);
      } else if (res.code === "DBE") {
        setErrMsg("데이터베이스 오류입니다.");
      } else if (res.code === "NETWORK_ERROR") {
        setErrMsg(res.message || "네트워크 오류입니다.");
      } else {
        setErrMsg(res.message || "알 수 없는 오류가 발생했습니다.");
      }
    };

    run();
  }, [token, setCookie, navigate]);
  

  // 선택 과목 출결 로딩
  useEffect(() => {
    const run = async () => {
      if (!selectedSubjectId) {
        setAttendanceList([]);
        return;
      }

      console.log("[CALL] /admin/entire-attendance/", selectedSubjectId, "token?", !!token);

      setLoadingAttendance(true);
      setErrMsg("");

      const res = await getEntireAttendanceBySubject(token, selectedSubjectId, setCookie, navigate);

      setLoadingAttendance(false);

      if (!res) return;

      if (res.code === "SU") {
        console.log("✅ 학생 리스트 응답", res.data?.studentList);
        setAttendanceList(res.data?.studentList ?? []);
      } else if (res.code === "NO_ANY_ATTENDANCE") {
        setAttendanceList([]);
        setErrMsg("해당 과목에 등록된 출결 정보가 아직 없습니다.");
      } else if (res.code === "AF") {
        setErrMsg("권한이 없습니다.");
      } else if (res.code === "DBE") {
        setErrMsg("데이터베이스 오류입니다.");
      } else if (res.code === "NETWORK_ERROR") {
        setErrMsg(res.message || "네트워크 오류입니다.");
      } else if (res.code === "TOKEN_EXPIRED") {
        // 재발급 실패로 홈 이동된 상태
        return;
      } else {
        setErrMsg(res.message || "알 수 없는 오류가 발생했습니다.");
      }
    };

    run();
  }, [token, selectedSubjectId, setCookie, navigate]);


  

  const handleDownload = async () => {
    if (!token) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
   if (!selectedSubjectId) {
    alert("과목을 선택해주세요.");
    return;
   }

   const selected = subjects.find(
     (s) => Number(s.subjectId) === Number(selectedSubjectId)
   );
   const subjectName = selected?.subjectName || `codingzone_${selectedSubjectId}`;
   await downloadAttendanceExcelBySubject(
     token,
     Number(selectedSubjectId),
     subjectName,              
     setCookie,
     navigate
   );
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
      <div className="centered-content">
        <div className="allattendance_buttons">
          <div className="subject-buttons">
            {subjects.map((s) => (
              <button
                key={s.subjectId}
                className={`subject-button ${selectedSubjectId === s.subjectId ? "active" : ""}`}
                onClick={() => setSelectedSubjectId(s.subjectId)}
              >
                {s.subjectName}
              </button>
            ))}
            {loading && <span style={{ marginLeft: 12, color: "#666" }}>불러오는 중…</span>}
          </div>

          <button className="download-button" onClick={handleDownload}>
            <img
              src="/excell_img.png"
              alt="다운로드"
              className="download-icon"
            />
            다운로드
          </button>
        </div>

        <div className="line-container1"></div>

        <div className="info-all_container">
          <div className="info_all_inner">
            <div className="info_all_studentnum">학번</div>
            <div className="info_all_name">이름</div>
            <div className="info_all_emali">이메일</div>
            <div className="info_all_bar"></div>
            <div className="info_all_presentcount">출석</div>
            <div className="info_all_absentcount">결석</div>
          </div>
        </div>
        <div className="line-container2"></div>

       <div className="info_all_data_container">
          {loadingAttendance && (
            <div style={{ textAlign: "center", color: "#777", padding: "24px 0" }}>
              출결 불러오는 중…
            </div>
          )}

          {!loadingAttendance && attendanceList.length === 0 && !errMsg && (
            <div style={{ textAlign: "center", color: "#777", padding: "24px 0" }}>
              표시할 출결 정보가 없습니다.
            </div>
          )}

          {attendanceList.map((student, index) => (
            <div key={index}>
              <div className="info_all_data_inner">
                <div className="info_all_data_studentnum">{student.userStudentNum}</div>
                <div className="info_all_data_name">{student.userName}</div>
                <div className="info_all_data_email">
                  {(student.userEmail || "").split("@")[0]}
                </div>
                <div className="info_all_data_bar"></div>
                <div className="info_all_data_presentcount">{student.attendance}</div>
                <div className="info_all_data_absentcount">{student.absence}</div>
              </div>
              <div className="hr-line"></div>{" "}
              {/* Horizontal line after each item */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodingZoneAttendanceManager;
