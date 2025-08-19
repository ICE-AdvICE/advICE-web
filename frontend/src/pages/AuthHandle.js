import React, { useState, useEffect } from "react";
import "./css/AuthHandle.css";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import {
  deprivePermission,
  grantPermission,
} from "../features/api/Admin/Codingzone/AuthApi";
import { fetchAllSubjects } from "../entities/api/CodingZone/AdminApi";

const AuthHandle = () => {
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [activeCategory, setActiveCategory] = useState("giveAuth");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const [mappedSubjects, setMappedSubjects] = useState([]);
  // 응답 안쪽 어디에 있든 첫 번째 배열을 찾아 반환
  const findFirstArray = (v) => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        const found = findFirstArray(v[k]);
        if (found) return found;
      }
    }
    return null;
  };

  // 서버 키 → 프론트 표준(subjectId/subjectName)으로 정규화
  const normalizeSubject = (m) => ({
    subjectId: String(
      m?.subjectId ??
        m?.subject_id ??
        m?.codingZone ??
        m?.zone ??
        m?.id ??
        m?.code ??
        m?.value ??
        ""
    ),
    subjectName: String(
      m?.subjectName ??
        m?.subject_name ??
        m?.name ??
        m?.title ??
        m?.label ??
        m?.text ??
        ""
    ),
  });

  const handleResponse = (response) => {
    alert(response.message);
    if (response.code === "ATE" || response.code === "TOKEN_EXPIRED") {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !role) {
      alert("모든 필드의 값을 입력해주세요.");
      return;
    }
    if (
      window.confirm(
        `정말 ${email} 사용자에게 선택하신 권한을 부여하시겠습니까?`
      )
    ) {
      try {
        const response = await grantPermission(
          email,
          role,
          cookies.accessToken,
          setCookie,
          navigate
        );
        handleResponse(response);
      } catch {
        alert("네트워크 상태를 확인해주세요.");
      }
    }
  };

  /** 권한 박탈 */
  const handleSubmit2 = async (e) => {
    e.preventDefault();
    if (!email || !role) {
      alert("모든 필드의 값을 입력해주세요.");
      return;
    }
    if (
      window.confirm(
        `정말 ${email} 사용자에게 선택하신 권한을 박탈하시겠습니까?`
      )
    ) {
      try {
        const response = await deprivePermission(
          email,
          role,
          cookies.accessToken,
          setCookie,
          navigate
        );
        handleResponse(response);
      } catch {
        alert("네트워크 상태를 확인해주세요.");
      }
    }
  };

  /** 과목 목록 불러오기 */
  useEffect(() => {
    if (!cookies.accessToken) return;

    const fetchSubjects = async () => {
      try {
        const res = await fetchAllSubjects(
          cookies.accessToken,
          setCookie,
          navigate
        );
        console.debug("[auth-handle] raw subjects:", res);

        // 1) 최상위가 배열
        if (Array.isArray(res)) {
          const list = res
            .map(normalizeSubject)
            .filter((s) => s.subjectId && s.subjectName);
          setMappedSubjects(list);
          return;
        }

        // 2) 객체라면: 안쪽 어디든 배열이 있으면 성공
        if (res && typeof res === "object") {
          const arr = findFirstArray(res);
          if (Array.isArray(arr)) {
            const list = arr
              .map(normalizeSubject)
              .filter((s) => s.subjectId && s.subjectName);
            setMappedSubjects(list);
            return;
          }

          // 3) 여기까지 왔으면 '진짜' 실패만 처리
          if ("code" in res) {
            // 등록된 매핑이 아직 없을 때
            if (res.code === "NOT_ANY_MAPPINGSET") {
              setMappedSubjects([]);
              return;
            }
            console.warn(
              "[auth-handle] subjects error:",
              res.code,
              res?.message
            );
          } else {
            console.warn("[auth-handle] unexpected shape (no array in object)");
          }
          setMappedSubjects([]);
          return;
        }

        // 4) 예상 못한 타입
        setMappedSubjects([]);
      } catch (e) {
        console.error("매핑된 과목 조회 실패:", e);
        setMappedSubjects([]);
      }
    };

    fetchSubjects();
  }, [cookies.accessToken]);

  return (
    <div className="main-container-AHpage">
      <div className="category-bar-AHpage">
        <button
          className={`category-button ${
            activeCategory === "giveAuth" ? "active" : ""
          }`}
          onClick={() => setActiveCategory("giveAuth")}
        >
          권한 부여
        </button>
        <span className="main-span2-AHpage"> | </span>
        <button
          className={`category-button ${
            activeCategory === "depriveAuth" ? "active" : ""
          }`}
          onClick={() => setActiveCategory("depriveAuth")}
        >
          권한 박탈
        </button>
      </div>
      <div className="container-AHpage">
        <form
          onSubmit={
            activeCategory === "giveAuth" ? handleSubmit : handleSubmit2
          }
        >
          <div className="input-mail-AHpage">
            <label htmlFor="mail" className="mail-label">
              메일
            </label>
            <input
              id="mail"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-auth-AHpage">
            <label htmlFor="category-of-auth" className="categori-label">
              권한 종류
            </label>
            <select
              id="category-of-auth"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">-- 권한을 선택하세요 --</option>
              <option value="ROLE_ADMIN1">익명게시판 관리자 권한</option>
              {mappedSubjects.map((subject) => (
                <option
                  key={subject.subjectId}
                  value={`ROLE_ADMINC${subject.subjectId}`}
                >
                  {subject.subjectName} 조교 권한
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="button-right-AHpage">
            등록
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthHandle;
