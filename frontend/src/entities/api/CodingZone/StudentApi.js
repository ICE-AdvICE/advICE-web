import axios from "axios";
import { refreshTokenRequest } from "../../../shared/api/AuthApi";
const DOMAIN = process.env.REACT_APP_API_DOMAIN;
const API_DOMAIN = `${DOMAIN}/api/v1`;
const API_DOMAIN_ADMIN = `${DOMAIN}/api/admin`;
const RESERVE_CODING_ZONE_CLASS_URL = (classNum) =>
  `${API_DOMAIN}/coding-zone/reserve-class/${classNum}`;
const DELETE_CODING_ZONE_CLASS_URL = (classNum) =>
  `${API_DOMAIN}/coding-zone/cence-class/${classNum}`;

const authorization = (accessToken) => {
  return { headers: { Authorization: `Bearer ${accessToken}` } };
};

//새로고침 함수
const refreshPage = () => {
  window.location.reload();
};
// 1. 코딩존 수업 예약 API (NEW)
export const reserveCodingZoneClass = async (
  token,
  classNum,
  setCookie,
  navigate
) => {
  try {
    const response = await axios.post(
      RESERVE_CODING_ZONE_CLASS_URL(classNum),
      null,
      authorization(token)
    );
    // 기대: { code:"SU", message:"Success." }
    return response.data ?? { code: "UNKNOWN", message: "No body" };
  } catch (error) {
    if (!error.response) {
      alert("네트워크 오류가 발생하였습니다.");
      return { code: "NETWORK_ERROR", message: "네트워크 오류" };
    }
    const { code, message } = error.response.data ?? {};
    if (code === "ATE") {
      console.warn(
        "코딩존 수업 예약: Access Token 만료됨. 토큰 재발급 시도 중..."
      );
      const newToken = await refreshTokenRequest(setCookie, token, navigate);
      if (newToken?.accessToken) {
        return reserveCodingZoneClass(
          newToken.accessToken,
          classNum,
          setCookie,
          navigate
        );
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      navigate("/");
      return { code: "TOKEN_EXPIRED", message: "토큰 만료" };
    }
    // FC, AR, DBE 등 그대로 전달
    return {
      code: code ?? "UNKNOWN_ERROR",
      message: message ?? "알 수 없는 오류",
    };
  }
};

//2. 코딩존 수업 예약 취소 API (NEW)
export const deleteCodingZoneClass = async (
  token,
  classNum,
  setCookie,
  navigate
) => {
  try {
    const response = await axios.delete(
      DELETE_CODING_ZONE_CLASS_URL(classNum),
      authorization(token)
    );
    // 기대: { code:"SU", message:"Success." }
    return response.data ?? { code: "UNKNOWN", message: "No body" };
  } catch (error) {
    if (!error.response) {
      alert("네트워크 오류가 발생하였습니다.");
      return { code: "NETWORK_ERROR", message: "네트워크 오류" };
    }
    const { code, message } = error.response.data ?? {};
    if (code === "ATE") {
      console.warn(
        "코딩존 수업 예약 취소: Access Token 만료됨. 토큰 재발급 시도 중..."
      );
      const newToken = await refreshTokenRequest(setCookie, token, navigate);
      if (newToken?.accessToken) {
        return deleteCodingZoneClass(
          newToken.accessToken,
          classNum,
          setCookie,
          navigate
        );
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      navigate("/");
      return { code: "TOKEN_EXPIRED", message: "토큰 만료" };
    }
    // NR, DBE 등 그대로 전달
    return {
      code: code ?? "UNKNOWN_ERROR",
      message: message ?? "알 수 없는 오류",
    };
  }
};
