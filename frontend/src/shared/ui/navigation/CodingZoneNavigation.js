import InquiryModal from "../../../pages/Coding-zone/InquiryModal"; // 경로는 실제 구조에 따라 조정
import "../../../shared/ui/navigation/CodingZoneNavigation.css";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

const ROUTES = {
  codingzone: "/coding-zone",
  attendenceEntry: "/coding-zone/codingzone-attendance", // 분기용(필요시)
  attendenceReal: "/coding-zone/codingzone-attendance-real", // 학생용
  manager: "/coding-zone/codingzone-manager", // 조교용
  allAttend: "/coding-zone/codingzone-all-attend", // 과사 조교(EA)용
  classRegist: "/coding-zone/coding-class-regist", // 보드바-수업 등록 ㅇ
  setting: "/coding-zone/codingzone-setting", // 보드바-코딩존 설정
  attendanceBase: "/coding-zone/attendance",
  attendanceCA: "/coding-zone/attendance/ca", // 학생 조교
  attendanceEA: "/coding-zone/attendance/ea", // 과사 조교
};

const CodingZoneNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 초기 값을 경로 기반으로 계산
  const computeSelected = (path) => {
    const p = path.replace(/\/+$/, "").toLowerCase();
    const attendancePrefixes = [
      ROUTES.attendanceBase,
      ROUTES.attendanceCA,
      ROUTES.attendanceEA,
      ROUTES.allAttend,
      ROUTES.attendenceReal,
    ].map((s) => s.toLowerCase());

    const isAttendance =
      attendancePrefixes.some((prefix) => p.startsWith(prefix)) ||
      p.startsWith(ROUTES.classRegist.toLowerCase()) ||
      p.startsWith(ROUTES.setting.toLowerCase());
    return isAttendance ? "attendence" : "codingzone";
  };

  const [selectedButton, setSelectedButton] = useState(() =>
    computeSelected(location.pathname)
  );

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) return; // 모달 열려있으면 '문의하기' 유지
    setSelectedButton(computeSelected(location.pathname));
  }, [location.pathname, showModal]);

  const handleTabChange = (tab) => {
    if (tab === "attendence") {
      // 로그인 체크를 계속 쓰고 싶으면 아래 3줄 유지 (아니면 통째로 삭제)
      if (!document.cookie.includes("accessToken")) {
        alert("로그인 후 이용 가능합니다.");
        return;
      }
      navigate(ROUTES.attendenceEntry); // 권한 분기는 라우터에서 처리
    } else {
      navigate(ROUTES.codingzone);
    }
  };

  const handleOpenModal = () => {
    setSelectedButton("inquiry");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="select-container">
      <button
        onClick={() => handleTabChange("codingzone")}
        className={`cz-nav-btn btn-codingzone ${
          selectedButton === "codingzone" ? "selected" : ""
        }`}
      >
        코딩존 예약
      </button>

      <button
        onClick={() => handleTabChange("attendence")}
        className={`cz-nav-btn btn-attendence ${
          selectedButton === "attendence" ? "selected" : ""
        }`}
      >
        출결 관리
      </button>

      <button
        onClick={handleOpenModal}
        className={`cz-nav-btn btn-inquiry ${
          selectedButton === "inquiry" ? "selected" : ""
        }`}
      >
        문의 하기
      </button>
      {showModal && (
        <InquiryModal isOpen={showModal} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default CodingZoneNavigation;
