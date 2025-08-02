import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Banner.css";

const BannerSlider = () => {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
  };

  return (
    <Slider {...sliderSettings}>
      <div className="codingzone-top-container">
        <picture>
          <source srcSet="/codingzone_main_v5.webp" type="image/webp" />
          <img
            src="/codingzone_main_v5.png"
            alt="코딩존 메인 이미지 1"
            className="codingzonetop2-image"
            loading="eager"
          />
        </picture>
      </div>
      <div className="codingzone-top-container">
        <picture>
          <source srcSet="/coding-zone-main2.webp" type="image/webp" />
          <img
            src="/coding-zone-main2.png"
            alt="코딩존 메인 이미지 2"
            className="codingzonetop2-image"
          />
        </picture>
      </div>
      <div className="codingzone-top-container">
        <picture>
          <source srcSet="/coding-zone-main3.webp" type="image/webp" />
          <img
            src="/coding-zone-main3.png"
            alt="코딩존 메인 이미지 3"
            className="codingzonetop2-image"
          />
        </picture>
      </div>
    </Slider>
  );
};

export default BannerSlider;
