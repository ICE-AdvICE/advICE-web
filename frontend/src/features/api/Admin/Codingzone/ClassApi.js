// api/admin/codingZoneAdminApi.js
import axios from "axios";
import { refreshTokenRequest } from "../../../../shared/api/AuthApi";

const DOMAIN = process.env.REACT_APP_API_DOMAIN;
const API_DOMAIN = `${DOMAIN}/api/v1`;
const API_DOMAIN_ADMIN = `${DOMAIN}/api/admin`;
const API_DOMAIN_ADMINS = `${DOMAIN}/api/admins`;

// 공통 헤더
const authorization = (accessToken) => ({
  headers: { Authorization: `Bearer ${accessToken}` },
});

// URL 헬퍼
const GET_AVAILABLE_CLASSES_FOR_NOT_LOGIN_URL = (grade) =>
  `${API_DOMAIN}/coding-zone/class-list/for-not-login/${grade}`;
const GET_CZ_ALL_ATTEND = () => `${DOMAIN}/api/admin/student-list`;
const GET_CZ_RESERVED_BY_DATE_URL = (date) =>
  `${API_DOMAIN_ADMINS}/codingzones?date=${date}`;

/* -------------------------------------------
 * 1) 학기 초기화 (신규/구버전 엔드포인트 자동 폴백)
 *    - 우선 /semester 사용
 *    - 404(또는 NotFound 계열)면 /delete-allinf 폴백
 * ------------------------------------------- */
export const resetCodingZoneData = async (token, setCookie, navigate) => {
  const tryDelete = async (url) =>
    axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });

  const handleTokenExpired = async () => {
    console.warn("학기 초기화: Access Token 만료됨. 토큰 재발급 시도 중...");
    const newToken = await refreshTokenRequest(setCookie, token, navigate);
    if (newToken?.accessToken) {
      return resetCodingZoneData(newToken.accessToken, setCookie, navigate);
    }
    setCookie("accessToken", "", { path: "/", expires: new Date(0) });
    navigate("/");
    return {
      code: "TOKEN_EXPIRED",
      message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
      data: null,
    };
  };

  try {
    // 1차: /semester
    const res1 = await tryDelete(`${API_DOMAIN_ADMIN}/semester`);
    const { code, message, data } = res1?.data ?? {};
    if (code === "SU") return { code, message, data: data ?? null };
  } catch (error) {
    if (!error.response) {
      return {
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
        data: null,
      };
    }
    const { status, data } = error.response;
    const errCode = data?.code;

    if (errCode === "ATE") return handleTokenExpired();

    // 존재하지 않거나 미지원이면 2차 시도
    const isNotFoundish = status === 404 || errCode === "NOT_FOUND";
    if (!isNotFoundish) {
      switch (errCode) {
        case "AF":
          alert("권한이 없습니다.");
          break;
        case "DBE":
          console.log("데이터베이스 오류가 발생했습니다.");
          break;
        default:
          console.log("예상치 못한 오류 발생.");
      }
      return { code: "ERROR", message: "학기 초기화 실패", data: null };
    }
  }

  // 2차: /delete-allinf 폴백
  try {
    const res2 = await axios.delete(`${API_DOMAIN_ADMIN}/delete-allinf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { code, message, data } = res2?.data ?? {};
    if (code === "SU") return { code, message, data: data ?? null };
  } catch (error) {
    if (!error.response) {
      return {
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
        data: null,
      };
    }
    const { code } = error.response.data || {};
    if (code === "ATE") {
      return await (async () => {
        const newToken = await refreshTokenRequest(setCookie, token, navigate);
        if (newToken?.accessToken) {
          return resetCodingZoneData(newToken.accessToken, setCookie, navigate);
        }
        setCookie("accessToken", "", { path: "/", expires: new Date(0) });
        navigate("/");
        return {
          code: "TOKEN_EXPIRED",
          message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
          data: null,
        };
      })();
    }
    switch (code) {
      case "AF":
        alert("권한이 없습니다.");
        break;
      case "DBE":
        console.log("데이터베이스 오류가 발생했습니다.");
        break;
      default:
        console.log("예상치 못한 오류 발생.");
    }
  }
  return { code: "ERROR", message: "학기 초기화 실패", data: null };
};

/* -------------------------------------------
 * 2) 출결 전체 목록 (학기 내 전원)
 * ------------------------------------------- */
export const getczallattendRequest = async (
  accessToken,
  setCookie,
  navigate
) => {
  try {
    const response = await axios.get(
      GET_CZ_ALL_ATTEND(),
      authorization(accessToken)
    );
    return response.data;
  } catch (error) {
    if (!error.response || !error.response.data) return null;
    const { code } = error.response.data;

    if (code === "ATE") {
      console.warn("출결 목록 조회: AT 만료 → 재발급 시도");
      const next = await refreshTokenRequest(
        setCookie,
        accessToken,
        navigate
      );
      if (next?.accessToken) {
        return getczallattendRequest(next.accessToken, setCookie, navigate);
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      navigate("/");
      return {
        code: "TOKEN_EXPIRED",
        message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
      };
    }
    return error.response.data;
  }
};

/* -------------------------------------------
 * 3) 비로그인: 예약 가능 수업 리스트 (학년별)
 * ------------------------------------------- */
export const getAvailableClassesForNotLogin = async (grade) => {
  try {
    const response = await axios.get(
      GET_AVAILABLE_CLASSES_FOR_NOT_LOGIN_URL(grade)
    );
    if (response.data.code === "SU") {
      return response.data.classList;
    }
    console.log(response.data.message);
    return [];
  } catch (error) {
    if (error.response) {
      switch (error.response.data.code) {
        case "NU":
          console.log("사용자가 존재하지 않습니다.");
          break;
        case "NA":
          console.log("등록된 수업이 없습니다.");
          break;
        case "DBE":
          console.log("데이터베이스에 문제가 발생했습니다.");
          break;
        default:
          console.log("예상치 못한 문제가 발생하였습니다.");
      }
    }
    return [];
  }
};

/* -------------------------------------------
 * 4) 출결 엑셀 다운로드 (학년별)
 * ------------------------------------------- */
export const downloadAttendanceExcel = async (
  accessToken,
  grade,
  setCookie,
  navigate
) => {
  try {
    const response = await axios.get(
      `${API_DOMAIN_ADMIN}/excel/attendance/grade${grade}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `코딩존${grade}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (!error.response) {
      alert("다운로드 실패: 네트워크 상태를 확인해주세요.");
      return;
    }
    const { code } = error.response.data || {};
    if (code === "ATE") {
      console.warn("출결 Excel 다운로드: AT 만료 → 재발급 시도");
      const next = await refreshTokenRequest(setCookie, accessToken, navigate);
      if (next?.accessToken) {
        return downloadAttendanceExcel(
          next.accessToken,
          grade,
          setCookie,
          navigate
        );
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      navigate("/");
      return;
    }
    switch (code) {
      case "AF":
        alert("권한이 없습니다. 학과 조교 권한이 필요합니다.");
        break;
      case "ISE":
        alert("서버 문제로 인해 파일 생성에 실패했습니다. 다시 시도해주세요.");
        break;
      case "DBE":
        alert("데이터베이스 오류가 발생했습니다. 관리자에게 문의하세요.");
        break;
      default:
        alert("다운로드 실패: 네트워크 상태를 확인해주세요.");
    }
  }
};
//과목명과 코딩존 번호 매핑불러오는 api
export const getSubjectMappingList = async (
  accessToken,
  setCookie,
  navigate
) => {
  console.log("📌 getSubjectMappingList 호출됨, accessToken:", accessToken);
  try {
    const response = await axios.get(
      `${API_DOMAIN_ADMIN}/subjects`,
      authorization(accessToken)
    );

    if (response.data.code === "SU") {
      return {
        success: true,
        message: response.data.message,
        subjectList: Array.isArray(response.data.data)
          ? response.data.data
          : [],
      };
    } else {
      return {
        success: false,
        message: response.data.message,
        subjectList: [],
      };
    }
  } catch (error) {
    if (!error.response || !error.response.data) {
      return {
        success: false,
        message: "네트워크 오류 또는 서버 응답 없음",
        subjectList: [],
      };
    }

/* -------------------------------------------
 * 5) 출결 엑셀 다운로드 (과목별)
 * ------------------------------------------- */
export const downloadAttendanceExcelBySubject = async (
  accessToken,
  subjectId,
  subjectName,
  setCookie,
  navigate
) => {
  // 파일명 안전 처리
  const sanitize = (name) =>
    (name || "").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim();

  try {
    if (subjectId == null || Number.isNaN(Number(subjectId))) {
      alert("유효하지 않은 과목입니다.");
      return;
    }
    const res = await axios.get(
      `${API_DOMAIN_ADMIN}/entire-attendance/${subjectId}/export`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: "blob",
        withCredentials: true,
        timeout: 30000,
      }
    );
    const safeName = sanitize(subjectName) || `codingzone_${subjectId}`;
    const filename = `${safeName}_출석부.xlsx`;

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (!error.response) {
      alert("다운로드 실패: 네트워크 상태를 확인해주세요.");
      return;
    }
    if (!error.response.data) {
      alert(`서버 오류(${error.response.status})`);
      return;
    }
    const { code, message } = error.response.data;
    if (code === "ATE") {
      const next = await refreshTokenRequest(setCookie, accessToken, navigate);
      if (next?.accessToken) {
        return downloadAttendanceExcelBySubject(
          next.accessToken,
          subjectId,
          subjectName,
          setCookie,
          navigate
        );
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      navigate("/");
      return;
    }
    switch (code) {
      case "AF":
        alert("권한이 없습니다. 학과 조교 권한이 필요합니다.");
        break;
      case "DBE":
        alert("데이터베이스 오류가 발생했습니다. 관리자에게 문의하세요.");
        break;
      case "NO_ANY_ATTENDANCE":
        alert("해당 과목의 출결 데이터가 없습니다.");
        break;
      default:
        alert(message || "다운로드 실패: 다시 시도해주세요.");
    }
  }
};

/* -------------------------------------------
 * 6) 과목명 ↔ 코딩존 번호 매핑 등록
 * ------------------------------------------- */
export const registerSubjectMapping = async (
  mappings,
  accessToken,
  setCookie,
  navigate
) => {
  try {
    const response = await axios.post(
      `${API_DOMAIN_ADMIN}/subjects`,
      mappings,
      authorization(accessToken)
    );
    if (response.data.code === "SUCCESS_POST_MAPPING") {
      return { success: true, message: response.data.message };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    if (!error.response || !error.response.data) {
      return { success: false, message: "네트워크 오류 또는 서버 응답 없음" };
    }
    const { code } = error.response.data;
    if (code === "ATE") {
      console.warn("코딩존 매핑: AT 만료 → 재발급 시도");
      const next = await refreshTokenRequest(setCookie, accessToken, navigate);
      if (next?.accessToken) {
        return registerSubjectMapping(mappings, next.accessToken, setCookie, navigate);
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      navigate("/");
      return { success: false, message: "토큰이 만료되었습니다. 다시 로그인해주세요." };
    }
    switch (code) {
      case "AF":
        return { success: false, message: "권한이 없습니다." };
      case "DBE":
        return { success: false, message: "데이터베이스 오류가 발생했습니다." };
      case "DUPLICATED_MAPPING_SET":
        return { success: false, message: "이미 존재하는 코딩존 매핑 번호와 교과목입니다." };
      case "DUPLICATED_MAPPING_NUMBER":
        return { success: false, message: "이미 존재하는 subjectId입니다." };
      case "DUPLICATED_MAPPING_CLASSNAME":
        return { success: false, message: "이미 존재하는 subjectName입니다." };
      default:
        return { success: false, message: "예상치 못한 오류가 발생했습니다." };
    }
  }
};

/* -------------------------------------------
 * 7) 과목명 ↔ 코딩존 번호 매핑 조회
 * ------------------------------------------- */
export const getSubjectMappingList = async (
  accessToken,
  setCookie,
  navigate
) => {
  console.log("📌 getSubjectMappingList 호출됨, accessToken:", accessToken);
  try {
    const response = await axios.get(
      `${API_DOMAIN_ADMIN}/subjects`,
      authorization(accessToken)
    );
    if (response.data.code === "SU") {
      return {
        success: true,
        message: response.data.message,
        subjectList: Array.isArray(response.data.data) ? response.data.data : [],
      };
    }
    return { success: false, message: response.data.message, subjectList: [] };
  } catch (error) {
    if (!error.response || !error.response.data) {
      return {
        success: false,
        message: "네트워크 오류 또는 서버 응답 없음",
        subjectList: [],
      };
    }
    const { code } = error.response.data;
    if (code === "ATE") {
      console.warn("코딩존 매핑 조회: AT 만료 → 재발급 시도");
      const next = await refreshTokenRequest(setCookie, accessToken, navigate);
      if (next?.accessToken) {
        return getSubjectMappingList(next.accessToken, setCookie, navigate);
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      navigate("/");
      return {
        success: false,
        message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        subjectList: [],
      };
    }
    switch (code) {
      case "AF":
        return { success: false, message: "권한이 없습니다.", subjectList: [] };
      case "DBE":
        return {
          success: false,
          message: "데이터베이스 오류가 발생했습니다.",
          subjectList: [],
        };
      case "NOT_ANY_MAPPINGSET":
        return {
          success: false,
          message: "등록된 매핑 정보가 없습니다.",
          subjectList: [],
        };
      default:
        return {
          success: false,
          message: "예상치 못한 오류가 발생했습니다.",
          subjectList: [],
        };
    }
  }
};

/* -------------------------------------------
 * 8-A) 특정 날짜 예약 학생 목록 (신규 adminS 쿼리 파라미터 방식)
 *     GET /api/admins/codingzones?date=YYYY-MM-DD
 * ------------------------------------------- */
export const getCodingzoneReservedListByDate = async (
  accessToken,
  classDate, // "YYYY-MM-DD"
  setCookie,
  navigate
) => {
  try {
    const response = await axios.get(
      GET_CZ_RESERVED_BY_DATE_URL(classDate),
      authorization(accessToken)
    );
    return response.data; // BE 포맷(code/message/data) 그대로
  } catch (error) {
    if (!error.response || !error.response.data) {
      return {
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
        data: null,
      };
    }
    const { code } = error.response.data;
    if (code === "ATE") {
      console.warn("특정 날짜 예약 학생 목록 조회: AT 만료 → 재발급 시도");
      const next = await refreshTokenRequest(setCookie, accessToken, navigate);
      if (next?.accessToken) {
        return getCodingzoneReservedListByDate(
          next.accessToken,
          classDate,
          setCookie,
          navigate
        );
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      navigate("/");
      return {
        code: "TOKEN_EXPIRED",
        message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        data: null,
      };
    }
    return {
      ...error.response.data,
      data: error.response.data?.data ?? null,
    };
  }
};

/* -------------------------------------------
 * 8-B) 특정 날짜 예약 학생 목록 (구버전 v1 Path 방식)
 *     GET /api/v1/coding-zone/reserved-list/{YYYY-MM-DD}
 * ------------------------------------------- */
export const getczreservedlistRequest = async (
  accessToken,
  classDate,
  setCookie,
  navigate
) => {
  try {
    const response = await axios.get(
      `${API_DOMAIN}/coding-zone/reserved-list/${classDate}`,
      authorization(accessToken)
    );
    return response.data;
  } catch (error) {
    if (!error.response || !error.response.data) return null;
    const { code } = error.response.data;

    if (code === "ATE") {
      console.warn("특정 날짜 예약된 학생 목록 조회: AT 만료 → 재발급 시도");
      const next = await refreshTokenRequest(setCookie, accessToken, navigate);
      if (next?.accessToken) {
        return getczreservedlistRequest(
          next.accessToken,
          classDate,
          setCookie,
          navigate
        );
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      navigate("/");
      return {
        code: "TOKEN_EXPIRED",
        message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
      };
    }
    return error.response.data;
  }
};

/* -------------------------------------------
 * 9) 과목별 전체 출결 JSON (조회)
 * ------------------------------------------- */
export const getEntireAttendanceBySubject = async (
  accessToken,
  subjectId,
  setCookie,
  navigate
) => {
  const url = `${API_DOMAIN_ADMIN}/entire-attendance/${subjectId}`;
  try {
    if (subjectId == null || Number.isNaN(Number(subjectId))) {
      return {
        code: "INVALID_SUBJECT_ID",
        message: "유효하지 않은 과목 ID",
        data: null,
      };
    }
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
      timeout: 15000,
    });
    return res.data;
  } catch (error) {
    if (!error.response) {
      return {
        code: "NETWORK_ERROR",
        message: "네트워크 상태를 확인해주세요.",
        data: null,
      };
    }
    if (!error.response.data) {
      return {
        code: "SERVER_ERROR",
        message: `서버 오류(${error.response.status})`,
        data: null,
      };
    }
    const { code, message } = error.response.data;
    if (code === "ATE") {
      const next = await refreshTokenRequest(setCookie, accessToken, navigate);
      if (next?.accessToken) {
        return getEntireAttendanceBySubject(
          next.accessToken,
          subjectId,
          setCookie,
          navigate
        );
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      navigate("/");
      return {
        code: "TOKEN_EXPIRED",
        message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        data: null,
      };
    }
    return {
      code: code ?? "UNKNOWN_ERROR",
      message: message ?? "알 수 없는 오류",
      data: null,
    };
  }
};
