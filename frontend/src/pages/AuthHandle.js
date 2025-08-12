import React, { useState, useEffect } from "react";
import "./css/AuthHandle.css";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import {
  deprivePermission,
  grantPermission,
} from "../features/api/Admin/Codingzone/AuthApi";

import { getSubjectMappingList } from "../features/api/Admin/Codingzone/ClassApi";

const AuthHandle = () => {
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [activeCategory, setActiveCategory] = useState("giveAuth");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const [mappedSubjects, setMappedSubjects] = useState([]);

 
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
    if (window.confirm(`정말 ${email} 사용자에게 선택하신 권한을 부여하시겠습니까?`)) {
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
    if (window.confirm(`정말 ${email} 사용자에게 선택하신 권한을 박탈하시겠습니까?`)) {
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
    const fetchSubjects = async () => {
      const result = await getSubjectMappingList(
        cookies.accessToken,
        setCookie,
        navigate
      );
      if (result.success) {
        setMappedSubjects(result.subjectList);
      } else {
        console.warn("매핑된 과목 조회 실패:", result.message);
      }
    };
    fetchSubjects();
  }, [cookies.accessToken, setCookie, navigate]);

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
