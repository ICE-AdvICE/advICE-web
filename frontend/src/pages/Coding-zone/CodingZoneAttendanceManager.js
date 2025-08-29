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
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js";
import Banner from "../../shared/ui/Banner/Banner";
import CodingZoneBoardbar from "../../shared/ui/boardbar/CodingZoneBoardbar.js";
import { fetchAllSubjects } from "../../entities/api/CodingZone/AdminApi.js";
import SubjectCard from "../../widgets/subjectCard/subjectCard.js";
import { getColorById } from "../Coding-zone/subjectColors";

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
    navigate(`/coding-zone/codingzone-manager`);
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
            setShowManageAllButton(true);
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

      if (Array.isArray(res)) {
        console.log("[/subjects] array response:", res);
        setSubjects(res);
        setSelectedSubjectId(res.length > 0 ? Number(res[0].subjectId) : null);
        return;
      }

      if (res.code === "SU") {
        const list = res.data?.subjectList ?? [];
        console.log("[/subjects] wrapped response:", list);
        setSubjects(list);
        setSelectedSubjectId(
          list.length > 0 ? Number(list[0].subjectId) : null
        );
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

  useEffect(() => {
    const run = async () => {
      if (!selectedSubjectId) {
        setAttendanceList([]);
        return;
      }

      console.log(
        "[CALL] /admin/entire-attendance/",
        selectedSubjectId,
        "token?",
        !!token
      );

      setLoadingAttendance(true);
      setErrMsg("");

      const res = await getEntireAttendanceBySubject(
        token,
        selectedSubjectId,
        setCookie,
        navigate
      );

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
    const subjectName =
      selected?.subjectName || `codingzone_${selectedSubjectId}`;
    await downloadAttendanceExcelBySubject(
      token,
      Number(selectedSubjectId),
      subjectName,
      setCookie,
      navigate
    );
  };

  // 과목 그리드 레이아웃 계산
  const gridClass = subjects.length <= 2 ? "cols-2" : "cols-2x2";

  return (
    <div>
      <div className="codingzone-container">
        <CodingZoneNavigation />
        <Banner src="/codingzone_attendance3.png" />
      </div>
      <div className="cza_button_container" style={{ textAlign: "center" }}>
        <CodingZoneBoardbar />
      </div>
      <div className="centered-content">
        <div className="allattendance_buttons">
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

        {/* 학생 예약페이지와 동일한 과목 선택 구조 */}
        {loading ? (
          <div className="panel-block panel-gray">
            <div className="panel-empty">과목을 불러오는 중…</div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="panel-block panel-gray">
            <div className="panel-empty">등록된 코딩존 과목이 없습니다.</div>
          </div>
        ) : (
          <div className="czp-subject-bar">
            {subjects.map((s) => {
              const sid = s.subjectId;
              const active = selectedSubjectId === sid;
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
                  onClick={() => setSelectedSubjectId(sid)}
                >
                  {s.subjectName}
                </button>
              );
            })}
          </div>
        )}

        {/* 출결 정보 테이블 - 일반 학생과 동일한 구조 */}
        {selectedSubjectId && (
          <section className="czp-table-wrap">
            <div className="czp-table-shell">
              <div className="czp-table-scroll">
                <table className="czp-table" style={{ width: "1100px" }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: getColorById(
                          selectedSubjectId,
                          "#475569"
                        ),
                        color: "#FFFFFF",
                      }}
                    >
                      <th>학번</th>
                      <th>이름</th>
                      <th>이메일</th>
                      <th>출석</th>
                      <th>결석</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAttendance ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="panel-empty" style={{ margin: 0 }}>
                            출결 불러오는 중…
                          </div>
                        </td>
                      </tr>
                    ) : attendanceList.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="panel-student" style={{ margin: 0 }}>
                            표시할 출결 정보가 없습니다.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      attendanceList.map((student, index) => (
                        <tr key={index}>
                          <td>{student.userStudentNum}</td>
                          <td>{student.userName}</td>
                          <td>{(student.userEmail || "").split("@")[0]}</td>
                          <td>{student.attendance}</td>
                          <td>{student.absence}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CodingZoneAttendanceManager;
