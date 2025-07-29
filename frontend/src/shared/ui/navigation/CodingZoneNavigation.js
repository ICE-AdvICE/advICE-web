import React from 'react';
import InquiryModal from '../../../pages/Coding-zone/InquiryModal'; // 경로는 실제 구조에 따라 조정
import '../../../pages/css/codingzone/codingzone-main.css'

const CodingZoneNavigation = ({
  selectedButton,
  handleTabChange,
  handleOpenModal,
  showModal,
  handleCloseModal
}) => {
  return (
    <div className='select-container'>
      <span> | </span>
      <button
        onClick={() => handleTabChange('codingzone')}
        className={selectedButton === 'codingzone' ? 'selected' : ''}
      >
        코딩존 예약
      </button>
      <span> | </span>
      <button
        onClick={() => handleTabChange('attendence')}
        className={selectedButton === 'attendence' ? 'selected' : ''}
      >
        출결 관리
      </button>
      <span> | </span>
      <button
        onClick={handleOpenModal}
        className={selectedButton === 'inquiry' ? 'selected' : ''}
      >
        문의 하기
      </button>
      {showModal && <InquiryModal isOpen={showModal} onClose={handleCloseModal} />}
      <span> | </span>
    </div>
  );
};

export default CodingZoneNavigation;
