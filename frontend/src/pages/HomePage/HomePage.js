import React, { useEffect, useState } from 'react';
import '../css/MainPage/MainPage.css';
import { AppInstallPrompt } from '../../shared/ui/AppInstallPrompt'; 

import { useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";
import { getMypageRequest, refreshTokenRequest } from '../../shared/api/AuthApi.js';
import { getRecentArticleRequest } from '../../entities/api/ArticleApi.js'; // import the new API

const HomePage = () => {
  const [cookies, setCookie] = useCookies(['accessToken']);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [recentArticleNum, setRecentArticleNum] = useState(0); // state for recent article number
  const token = cookies.accessToken;
  const handleMoreClick = () => {
    navigate('/article-main');
  };
  const handlereservationClick = () => {
    window.location.href = 'https://open.kakao.com/o/giOS427b';
  };
  const handlefeedbackClick = () => {
    window.location.href = 'https://open.kakao.com/o/swnIYgKg';
  };
  
  



  useEffect(() => {
    const fetchRecentArticleNum = async () => {
      const result = await getRecentArticleRequest();
      if (result && result.code === "SU" && result.recentArticleNum >= 1) {
        setRecentArticleNum(result.recentArticleNum);
      } else {
        setRecentArticleNum(0);
      }
    };

    fetchRecentArticleNum();
  }, []);

  const handlecodingzone = () => {
    navigate('/coding-zone');
  };

  return (
    <div className="main-container">
      <div className="header">
        <h1>AdvICE</h1>
        <p className="department-info">
          This is an integrated service for students in the Department of Information and Communication Engineering.<br />
          Try the coding zone reservation, anonymous bulletin board, and study room reservation service for the Department of Information and Communication Engineering.
          <br />Try your best rather than be the best.
        </p>
      </div>
      <div className="buttons-container">
        <div className="service-box coding-box">
          <p>정보통신공학과에서 운영하는 <br />코딩존 예약/관리 시스템 입니다.</p>
          <button onClick={handlecodingzone} className="btn coding">Coding Zone</button>
        </div>
        <div className="service-box icebreaker-box">
          {recentArticleNum > 0 && (
            <div className="recent-article-badge">
              +{recentArticleNum}
            </div>
          )}
          <p>ICEbreaker 익명게시판을 통해<br /> 학과 사람들과 소통해 보세요.</p>
          <button onClick={handleMoreClick} className="btn icebreaker">ICEbreaker</button>
        </div>
        <div className="service-box study-box">
          <p>정보통신공학과 스터디룸<br /> 예약 오픈채팅방 입니다.</p>
          <button onClick={handlereservationClick} className="btn study">Study Room</button>
        </div>
      </div>
      <div className='feedback-container'>
        <button onClick={handlefeedbackClick} className="feedback-btn">
          서비스 이용하시는데 불편한 점이나 요청사항이 있으신가요?
        </button>
      </div>
       <AppInstallPrompt />
    </div>
  );
};

export default HomePage;