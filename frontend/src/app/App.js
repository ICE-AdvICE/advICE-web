import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import Main from "../pages/HomePage/HomePage";
import ArticleMain from "../pages/ArticlePage/ArticleMain";
import CodingMain from "../pages/Coding-zone/CodingZoneMain";
import EditPage from "../pages/ArticlePage/Components/EditPage";
import CodingClassRegist from "../pages/Coding-zone/CodingZoneRegist";
import CodingZoneAttendanceAssistant from "../pages/Coding-zone/CodingZoneAttendanceAssistant";
import CodingZoneMyAttendance from "../pages/Coding-zone/CodingZoneMyAttendance";
import CodingZoneAttendanceManager from "../pages/Coding-zone/CodingZoneAttendanceManager";
import NavBar from "../widgets/layout/Header/Navbar";
import Footer from "../widgets/layout/Footer/Footer";
import CreatePage from "../pages/ArticlePage/Components/CreatePage";
import ShowPage from "../pages/ArticlePage/Components/ShowPage";
import AuthHandle from "../pages/AuthHandle";

import { getczauthtypetRequest } from "../shared/api/AuthApi"; // 권한 확인 API
import { useCookies } from "react-cookie";

function CodingZoneDefault() {
  const [authType, setAuthType] = useState(null);
  const [cookies] = useCookies(["accessToken"]);
  const token = cookies.accessToken;
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const fetchAuthType = async () => {
      const res = await getczauthtypetRequest(token);
      if (res) setAuthType(res.code); // 예: "EA", "CA", "ST"
      setLoading(false);
    };
    fetchAuthType();
  }, [token]);

  // 로딩 중에는 로딩 화면 표시
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>로딩 중...</div>
    );
  }

  // 과사 조교(EA) → 수업 등록 페이지
  if (authType === "EA") {
    return <Navigate to="/coding-zone/coding-class-regist" replace />;
  }

  // 코딩존 조교(CA), 일반 학생 → 출결 확인 페이지
  return <Navigate to="/coding-zone/Codingzone_Attendance_Real" replace />;
}

const App = () => {
  const location = useLocation();
  const hideFooterPaths = ["/", "/auth-handle"]; // Footer를 숨길 페이지 설정

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/auth-handle" element={<AuthHandle />} />
        <Route path="/article-main" element={<ArticleMain />} />
        <Route path="/article-main/create" element={<CreatePage />} />
        <Route path="/article-main/:articleNum/edit" element={<EditPage />} />
        <Route path="/article-main/:articleNum" element={<ShowPage />} />
        <Route path="/coding-zone" element={<CodingMain />} />

        <Route
          path="/coding-zone/coding-class-regist"
          element={<CodingClassRegist />}
        />
        <Route
          path="/coding-zone/Codingzone_Manager"
          element={<CodingZoneAttendanceAssistant />}
        />

        {/*기본 진입 시 권한별 분기 */}
        <Route
          path="/coding-zone/Codingzone_Attendance"
          element={<CodingZoneDefault />}
        />

        {/* 실제 출결확인 페이지 */}
        <Route
          path="/coding-zone/Codingzone_Attendance_Real"
          element={<CodingZoneMyAttendance />}
        />

        <Route
          path="/coding-zone/Codingzone_All_Attend"
          element={<CodingZoneAttendanceManager />}
        />
      </Routes>

      {!hideFooterPaths.includes(location.pathname) && <Footer />}
    </>
  );
};

export default App;
