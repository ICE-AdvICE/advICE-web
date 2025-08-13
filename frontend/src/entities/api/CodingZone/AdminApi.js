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

// ✅ 14. 날짜(필수), 과목ID(정수, 필수)로 리스트 조회
// GET : 해당 날짜(date)에 과목ID(subjectId)가 있으면 수업 리스트 가져오기
// 응답 예시(통합): [{ classTime, assistantName, groupId, classNum, classStatus? }]
export const fetchCodingzonesByDate = async (
  date, // "YYYY-MM-DD"
  token, // Authorization: Bearer <token>
  setCookie, // 토큰 갱신/삭제
  navigate, // 페이지 이동
  subjectId // 과목 ID (정수; path param)
) => {
  // ---- 사전 검증 ----
  // 날짜 검증 -> UX 방지 + 불필요한 네트워크 요청 방지
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      code: "INVALID_DATE",
      message: "YYYY-MM-DD 형식의 날짜가 필요합니다.",
      data: null,
    };
  }

  // subjectId 문자열 -> 정수 반환, 문자열 "123"도 허용하되, 정수 변환 실패 시 막기
  const sid = typeof subjectId === "number" ? subjectId : Number(subjectId);
  if (!Number.isInteger(sid)) {
    return {
      code: "INVALID_SUBJECT",
      message: "subjectId는 정수여야 합니다.",
      data: null,
    };
  }

  try {
    // API 요청 URL
    // 쿼리 스트링으로 날짜 전달 : params : {date}
    // -> 경로에 과목 ID(정수), 쿼리에 날짜를 붙이는 REST API
    const url = `${API_DOMAIN_ADMIN}/subjects/${sid}/codingzones`;
    const res = await axios.get(url, {
      // get 요청
      headers: { Authorization: `Bearer ${token}` }, // 로그인 증명
      params: { date }, // -> ?date=YYYY-MM-DD
    });

    // 응답 해석(언래핑)
    const body = res?.data;
    if (body && typeof body === "object" && "code" in body) {
      return body;
    }
    // 혹시 래핑 없이 배열을 바로 준 경우: 명세 형식으로 래핑해서 반환
    // (message 문구는 필요시 바꿔도 됨)
    return {
      code: "SU",
      message: "코딩존 리스트 조회 성공.",
      data: body ?? null,
    };
  } catch (error) {
    if (!error.response) {
      return {
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
        data: null,
      };
    }

    const err = (typeof error.response.data === "object" &&
      error.response.data) || {
      code: "UNKNOWN",
      message: "요청 처리 중 오류가 발생했습니다.",
      data: null,
    };

    if (err.code === "ATE") {
      // 🔧 여기! 재시도 시 인자 순서 바르게
      const newToken = await refreshTokenRequest(setCookie, token, navigate);
      if (newToken?.accessToken) {
        return fetchCodingzonesByDate(
          date,
          newToken.accessToken, // token
          setCookie,
          navigate,
          sid // subjectId
        );
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      if (navigate) navigate("/");
      return {
        code: "TOKEN_EXPIRED",
        message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        data: null,
      };
    }

    return err;
  }
};

// ✅ 15. 코딩존 단건 수정 (PATCH)
export const updateCodingzone = async (
  classNum, // list 번호 (정수)
  patch, // 변경할 필드만 담은 객체 (예: { classTime: "14:00:00", maximumNumber: 8, ... })
  token,
  setCookie,
  navigate
) => {
  try {
    const res = await axios.patch(
      `${API_DOMAIN_ADMIN}/codingzones/classes/${classNum}`,
      patch,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 응답
    const body = res?.data;
    if (body && typeof body === "object" && "code" in body) {
      return body;
    }
    // 혹시 래핑 없이 왔다면 기본 성공 구조로 변환
    return {
      code: "SU",
      message: "코딩존 정보 수정 성공.",
      data: null,
    };
  } catch (error) {
    if (!error.response) {
      return {
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
        data: null,
      };
    }

    const err = (typeof error.response.data === "object" &&
      error.response.data) || {
      code: "UNKNOWN",
      message: "요청 처리 중 오류가 발생했습니다.",
      data: null,
    };

    if (err.code === "ATE") {
      console.warn("🔄 코딩존 수정: Access Token 만료됨. 재발급 시도...");
      const newToken = await refreshTokenRequest(setCookie, token, navigate);
      if (newToken?.accessToken) {
        return updateCodingzone(
          classNum,
          patch,
          newToken.accessToken,
          setCookie,
          navigate
        );
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      if (navigate) navigate("/");
      return {
        code: "TOKEN_EXPIRED",
        message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        data: null,
      };
    }

    return err;
  }
};
