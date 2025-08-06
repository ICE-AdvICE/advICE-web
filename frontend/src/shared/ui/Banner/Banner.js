import React from "react";
import "./Banner.css";

const Banner = ({ src, alt = "배너", className = "" }) => {
  return (
    <div className={`banner_img_container ${className}`}>
      <img src={src} alt={alt} className="banner" />
    </div>
  );
};

export default Banner;
