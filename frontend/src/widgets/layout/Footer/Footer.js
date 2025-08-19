import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <nav className="footer">
      <div className="footer-container">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src="/logo_foot.png" className="footer-image" />
          </div>
          <div className="footer-address">
            <p>
              <span>
                <strong>글로벌캠퍼스 </strong>
                17035 경기도 용인시 처인구 모현읍 외대로 81 한국외국어대학교
                공과대학 정보통신공학과
              </span>
            </p>
            <p>
              <span>
                <strong>Tel. </strong>
                031-330-4255
              </span>
              <span>
                <strong> e-mail. </strong>
                ice@hufs.ac.kr
              </span>
            </p>
            <p>
              <span>
                <strong>DEVELOPED BY. </strong>
                YUNBEEN LEE, SUNGHYUN DO, JINWOO KIM, JUNSEO PARK, <br />
                DAYOUNG PARK, EUIHYUN LEE, JUHUI KIM and HYEWON LEE
              </span>
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Footer;
