import InquiryModal from "../../../pages/Coding-zone/InquiryModal"; // 경로는 실제 구조에 따라 조정
import "../../../pages/css/codingzone/codingzone-main.css";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

const CodingZoneNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedButton, setSelectedButton] = useState("codingzone");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (location.pathname === "/coding-zone") {
      setSelectedButton("codingzone");
    } else if (
      location.pathname.includes("/coding-zone/Codingzone_Attendance")
    ) {
      setSelectedButton("attendence");
    }
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    if (tab === "attendence" && !document.cookie.includes("accessToken")) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    setSelectedButton(tab);
    if (tab === "codingzone") {
      navigate("/coding-zone");
    } else if (tab === "attendence") {
      navigate("/coding-zone/Codingzone_Attendance");
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
      <span> | </span>
      <button
        onClick={() => handleTabChange("codingzone")}
        className={selectedButton === "codingzone" ? "selected" : ""}
      >
        코딩존 예약
      </button>
      <span> | </span>
      <button
        onClick={() => handleTabChange("attendence")}
        className={selectedButton === "attendence" ? "selected" : ""}
      >
        출결 관리
      </button>
      <span> | </span>
      <button
        onClick={handleOpenModal}
        className={selectedButton === "inquiry" ? "selected" : ""}
      >
        문의 하기
      </button>
      {showModal && (
        <InquiryModal isOpen={showModal} onClose={handleCloseModal} />
      )}
      <span> | </span>
    </div>
  );
};

export default CodingZoneNavigation;
