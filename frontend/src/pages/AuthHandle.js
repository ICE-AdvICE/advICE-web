import React, { useState, useEffect } from "react";
import "./css/AuthHandle.css";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import {
  deprivePermission,
  grantPermission,
} from "../features/api/Admin/Codingzone/AuthApi";

const AuthHandle = () => {
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [activeCategory, setActiveCategory] = useState("giveAuth");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !role) {
      alert("모든 필드의 값을 입력해주세요.");
      return;
    }
    const confirmMessage = `정말 ${email} 사용자에게 선택하신 권한을 부여하시겠습니까?`;
    if (window.confirm(confirmMessage)) {
      try {
        const response = await grantPermission(
          email,
          role,
          cookies.accessToken,
          setCookie,
          navigate
        );
        handleResponse(response);
      } catch (error) {
        alert("네트워크 상태를 확인해주세요.");
      }
    }
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    if (!email || !role) {
      alert("모든 필드의 값을 입력해주세요.");
      return;
    }
    const confirmMessage = `정말 ${email} 사용자에게 선택하신 권한을 박탈하시겠습니까?`;
    if (window.confirm(confirmMessage)) {
      try {
        const response = await deprivePermission(
          email,
          role,
          cookies.accessToken,
          setCookie,
          navigate
        );
        handleResponse2(response);
      } catch (error) {
        alert("네트워크 상태를 확인해주세요.");
      }
    }
  };

  const handleResponse = (response) => {
    const { code, message } = response;
    switch (code) {
      case "SU":
        alert("성공적으로 권한이 부여되었습니다.");
        break;
      case "NU":
        alert("로그인 시간이 만료되었습니다. 다시 로그인 해주세요.");
        navigate("/");
        break;
      case "AF":
        alert("권한이 없습니다.");
        break;
      case "NS":
        alert("회원가입이 안된 사용자입니다.");
        break;
      case "PE":
        alert("해당 사용자가 이미 부여받은 권한입니다.");
        break;
      case "DBE":
        alert("데이터베이스 오류입니다.");
        break;
      default:
        alert("오류 발생: " + message);
        break;
    }
  };
  const handleResponse2 = (response) => {
    const { code, message } = response;
    switch (code) {
      case "SU":
        alert("성공적으로 권한이 박탈되었습니다.");
        break;
      case "NU":
        alert("로그인 시간이 만료되었습니다. 다시 로그인 해주세요.");
        navigate("/");
        break;
      case "AF":
        alert("권한이 없습니다.");
        break;
      case "NS":
        alert("회원가입이 안된 사용자입니다.");
        break;
      case "PE":
        alert("해당 사용자가 이미 박탈된 권한입니다.");
        break;
      case "DBE":
        alert("데이터베이스 오류입니다.");
        break;
      default:
        alert("오류 발생: " + message);
        break;
    }
  };

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
              <option value=""></option>
              <option value="ROLE_ADMIN1">익명게시판 관리자 권한</option>
              <option value="ROLE_ADMINC1">코딩존1 조교 권한</option>
              <option value="ROLE_ADMINC2">코딩존2 조교 권한</option>
              <option value="ROLE_ADMINC3">코딩존3 조교 권한</option>
              <option value="ROLE_ADMINC4">코딩존4 조교 권한</option>
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
