import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import LoginForm from "../../../features/auth/components/Modal/LoginForm.js";
import SignUpinfoForm from "../../../features/auth/components/Modal/Signup.js";
import MypageForm from "../../../features/auth/components/Modal/Mypage.js";
import MyModal from "../../../shared/components/BaseModal.js";
import { useCookies } from "react-cookie";
import { logoutRequest } from "../../../entities/api/UserApi.js";
import { useLocation } from "react-router-dom"; // 현재 경로 파악용 (익명게시판 페이지 여부 판단)

const NavBar = () => {
  const [modal, setModal] = useState({
    login: false,
    signup: false,
    mypage: false,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);
  const navigate = useNavigate();
  // 경로가 '/article-main'으로 시작하면 익명게시판 페이지로 간주
  const location = useLocation();
  const isArticlePage = location.pathname.startsWith("/article-main");

  useEffect(() => {
    const token = cookies.accessToken;
    setIsLoggedIn(!!token);
  }, [cookies.accessToken]);

  const openModal = (type) => setModal((prev) => ({ ...prev, [type]: true }));
  const closeModal = (type) => setModal((prev) => ({ ...prev, [type]: false }));

  const handleLogout = async () => {
    const accessToken = cookies.accessToken;
    if (!accessToken) {
      alert("로그인된 상태가 아닙니다.");
      return;
    }

    try {
      const response = await logoutRequest(accessToken, setCookie, navigate);

      if (response.code === "SU") {
        // setCookie 사용하여 accessToken과 refreshToken 삭제
        setCookie("accessToken", "", { path: "/", expires: new Date(0) });
        setCookie("refreshToken", "", { path: "/", expires: new Date(0) });

        setIsLoggedIn(false);
        closeModal("mypage");
        alert("로그아웃되었습니다.");
        navigate("/");
      } else {
        alert(`로그아웃 실패: ${response.message}`);
      }
    } catch (error) {
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    // 게시판 페이지일 때만 별도 스타일 클래스 적용
    <nav className={`navbar ${isArticlePage ? "article-navbar" : ""}`}>
      <div className="header-container">
        <Link className="header-school" to="/">
          <img src="/header-name.png" alt="School Header" />
        </Link>
        <ul className="navbar-nav">
          <li className="nav-item">
            <div className="nav-actions">
              {isLoggedIn ? (
                <>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    to="#"
                    aria-expanded={modal.mypage}
                    data-open={modal.mypage}
                    style={{ marginRight: "20px" }}
                    onClick={() => openModal("mypage")}
                  >
                    MyPage
                  </NavLink>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    to="#"
                    style={{ marginRight: "20px" }} // 스타일 동일하게 추가
                    onClick={handleLogout}
                  >
                    Log Out
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    to="#"
                    aria-expanded={modal.login}
                    data-open={modal.login}
                    style={{ marginRight: "20px" }}
                    onClick={() => openModal("login")}
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    to="#"
                    aria-expanded={modal.signup}
                    data-open={modal.signup}
                    style={{ marginRight: "20px" }}
                    onClick={() => openModal("signup")}
                  >
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>
          </li>
        </ul>
      </div>
      <MyModal
        open={modal.login}
        onCancel={() => closeModal("login")}
        footer={[]}
      >
        <LoginForm
          onLogin={(loginSuccess) => {
            closeModal("login");
            if (loginSuccess) setIsLoggedIn(true);
          }}
          closeModal={() => closeModal("login")}
        />
      </MyModal>

      <MyModal
        open={modal.signup}
        onCancel={() => closeModal("signup")}
        footer={[]}
      >
        <SignUpinfoForm closeModal={() => closeModal("signup")} />
      </MyModal>

      <MyModal
        open={modal.mypage}
        onCancel={() => closeModal("mypage")}
        footer={[]}
      >
        <MypageForm
          modal={modal} // ✅ 추가: modal 상태 전달
          closeModal={() => closeModal("mypage")}
        />
      </MyModal>
    </nav>
  );
};

export default NavBar;
