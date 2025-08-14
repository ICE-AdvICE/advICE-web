import axios from "axios";
import { refreshTokenRequest } from "../../../shared/api/AuthApi";
const DOMAIN = process.env.REACT_APP_API_DOMAIN;
const API_DOMAIN = `${DOMAIN}/api/v1`;
const API_DOMAIN_ADMIN = `${DOMAIN}/api/admin`;

const DELETE_CLASS_URL = (classNum) =>
  `${DOMAIN}/api/admin/delete-class/${classNum}`;

// 매핑한 전체 과목 리스트 조회 API (subjectName + subjectId)
export const fetchAllSubjects = async (token, setCookie, navigate) => {
  try {
    const response = await axios.get(`${API_DOMAIN_ADMIN}/subjects`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    if (!error.response) {
      return {
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
      };
    }

    const { code } = error.response.data;

    if (code === "ATE") {
      console.warn(
        "🔄 전체 과목 리스트: Access Token 만료됨. 토큰 재발급 시도 중..."
      );
      const newToken = await refreshTokenRequest(setCookie, token, navigate);
      if (newToken?.accessToken) {
        return fetchAllSubjects(newToken.accessToken, setCookie, navigate);
      } else {
        setCookie("accessToken", "", { path: "/", expires: new Date(0) });
        navigate("/");
        return {
          code: "TOKEN_EXPIRED",
          message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        };
      }
    }

    return error.response.data;
  }
};

// 과목 ID -> 조교 리스트 조회 API
export const fetchAssistantsBySubjectId = async (
  subjectId,
  token,
  setCookie,
  navigate
) => {
  try {
    const response = await axios.get(
      `${API_DOMAIN_ADMIN}/subjects/${subjectId}/assistants`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    if (!error.response) {
      return {
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
      };
    }

    const { code } = error.response.data;

    if (code === "ATE") {
      console.warn(
        "🔄 조교 리스트: Access Token 만료됨. 토큰 재발급 시도 중..."
      );
      const newToken = await refreshTokenRequest(setCookie, token, navigate);
      if (newToken?.accessToken) {
        return fetchAssistantsBySubjectId(
          subjectId,
          newToken.accessToken,
          setCookie,
          navigate
        );
      } else {
        setCookie("accessToken", "", { path: "/", expires: new Date(0) });
        navigate("/");
        return {
          code: "TOKEN_EXPIRED",
          message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        };
      }
    }

    return error.response.data;
  }
};

//1. 코딩존 수업 + 기존의 조 등록 API
export const uploadClassForWeek = async (
  groupData,
  token,
  setCookie,
  navigate
) => {
  try {
    const response = await axios.post(
      `${API_DOMAIN_ADMIN}/codingzones/classes`,
      groupData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    if (!error.response) {
      return {
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
      };
    }

    const { code } = error.response.data;

    if (code === "ATE") {
      console.warn(
        "🔄 코딩존 수업 등록: Access Token 만료됨. 토큰 재발급 시도 중..."
      );
      const newToken = await refreshTokenRequest(setCookie, token, navigate);

      if (newToken?.accessToken) {
        return uploadClassForWeek(
          groupData,
          newToken.accessToken,
          setCookie,
          navigate
        );
      } else {
        setCookie("accessToken", "", { path: "/", expires: new Date(0) });
        navigate("/");
        return {
          code: "TOKEN_EXPIRED",
          message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        };
      }
    }

    return error.response.data;
  }
};

export const deleteSubjectMappingBySubjectId = async (
  subjectId,
  token,
  setCookie,
  navigate
) => {
  try {
    const response = await axios.delete(
      `${API_DOMAIN_ADMIN}/subjects/${subjectId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { code, message } = response.data || {};
    return { ok: code === "SU", code, message };
  } catch (error) {
    if (!error.response) {
      return {
        ok: false,
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
      };
    }

    const { code, message } = error.response.data || {};

    if (code === "ATE") {
      console.warn("🔄 매핑 삭제: Access Token 만료됨. 토큰 재발급 시도 중...");
      const newToken = await refreshTokenRequest(setCookie, token, navigate);
      if (newToken?.accessToken) {
        return deleteSubjectMappingBySubjectId(
          subjectId,
          newToken.accessToken,
          setCookie,
          navigate
        );
      } else {
        setCookie("accessToken", "", { path: "/", expires: new Date(0) });
        navigate("/");
        return {
          ok: false,
          code: "TOKEN_EXPIRED",
          message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        };
      }
    }

    return { ok: false, code, message };
  }
};

// 13. 등록된 특정 수업 삭제 API
export const deleteClass = async (classNum, token, setCookie, navigate) => {
  try {
    const response = await axios.delete(DELETE_CLASS_URL(classNum), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.code === "SU") {
      return true;
    }
  } catch (error) {
    if (!error.response) {
      return {
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
      };
    }

    const { code } = error.response.data;

    if (code === "ATE") {
      console.warn("🔄 수업 삭제: Access Token 만료됨. 토큰 재발급 시도 중...");
      const newToken = await refreshTokenRequest(setCookie, token, navigate);

      if (newToken?.accessToken) {
        return deleteClass(classNum, newToken.accessToken, setCookie, navigate);
      } else {
        setCookie("accessToken", "", { path: "/", expires: new Date(0) });
        navigate("/");
        return {
          code: "TOKEN_EXPIRED",
          message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        };
      }
    }

    switch (code) {
      case "AF":
        alert("권한이 없습니다.");
        break;
      case "NU":
        alert("로그인이 필요합니다.");
        break;
      case "DBE":
        console.log("데이터베이스에 문제가 발생했습니다.");
        break;
      default:
        console.log("예상치 못한 문제가 발생하였습니다.");
        break;
    }
    return false;
  }
};

// 날짜별 코딩존 과목 조회
export const fetchCodingzoneSubjectsByDate = async (
  dateYMD,
  token,
  setCookie,
  navigate
) => {
  try {
    const response = await axios.get(`${API_DOMAIN_ADMIN}/codingzones`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { date: dateYMD }, // ?date=YYYY-MM-DD
    });
    return response.data; // { code, message, data: { classes: { "1":"컴프", "2":"자료구조" } } }
  } catch (error) {
    if (!error.response) {
      return {
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
      };
    }
    const { code } = error.response.data || {};

    if (code === "ATE") {
      console.warn("🔄 날짜별 과목 조회: Access Token 만료. 재발급 시도...");
      const newToken = await refreshTokenRequest(setCookie, token, navigate);
      if (newToken?.accessToken) {
        return fetchCodingzoneSubjectsByDate(
          dateYMD,
          newToken.accessToken,
          setCookie,
          navigate
        );
      } else {
        setCookie("accessToken", "", { path: "/", expires: new Date(0) });
        navigate("/");
        return {
          code: "TOKEN_EXPIRED",
          message: "토큰 만료. 다시 로그인해주세요.",
        };
      }
    }
    return error.response.data;
  }
};
