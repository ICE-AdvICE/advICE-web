import axios from 'axios';
import { refreshTokenRequest } from '../../../../shared/api/AuthApi';
const DOMAIN = process.env.REACT_APP_API_DOMAIN;
const API_DOMAIN = `${DOMAIN}/api/v1`;

const API_DOMAIN_ADMIN = `${DOMAIN}/api/admin`;
const authorization = (accessToken) => {
    return { headers: { Authorization: `Bearer ${accessToken}` } }
};
const GET_AVAILABLE_CLASSES_FOR_NOT_LOGIN_URL = (grade) => `${API_DOMAIN}/coding-zone/class-list/for-not-login/${grade}`;
const GET_CZ_ALL_ATTEND = () => `${DOMAIN}/api/admin/student-list`;

//6. 학기 초기화 API
export const resetCodingZoneData = async (token, setCookie, navigate) => {
    try {
        const response = await axios.delete(`${API_DOMAIN_ADMIN}/delete-allinf`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.code === "SU") {
            return response.data;
        }
    } catch (error) {
        if (!error.response) {
            return { code: 'NETWORK_ERROR', message: '네트워크 상태를 확인해주세요.' };
        }

        const { code } = error.response.data;

        if (code === "ATE") {
            console.warn(" 학기 초기화: Access Token 만료됨. 토큰 재발급 시도 중...");
            const newToken = await refreshTokenRequest(setCookie, token, navigate);

            if (newToken?.accessToken) {

                return resetCodingZoneData(newToken.accessToken, setCookie, navigate);
            } else {

                setCookie('accessToken', '', { path: '/', expires: new Date(0) });
                navigate('/');
                return { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다. 다시 로그인해주세요.' };
            }
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
                break;
        }
    }
    return { code: 'ERROR', message: '학기 초기화 실패' };
};
/*
//13. 해당 학기에 출/결한 모든 학생들 리스트로 반환 API
export const getczallattendRequest = async (accessToken, setCookie, navigate) => {
    try {
        const response = await axios.get(GET_CZ_ALL_ATTEND(), authorization(accessToken));
        return response.data;
    } catch (error) {
        if (!error.response || !error.response.data) return null;

        const { code } = error.response.data;

        if (code === "ATE") {
            console.warn("출결 목록 조회: Access Token 만료됨. 토큰 재발급 시도 중...");
            const newToken = await refreshTokenRequest(setCookie, accessToken, navigate);

            if (newToken?.accessToken) {

                return getczallattendRequest(newToken.accessToken, setCookie, navigate);
            } else {

                setCookie('accessToken', '', { path: '/', expires: new Date(0) });
                navigate('/');
                return { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다. 다시 로그인해주세요.' };
            }
        }

        return error.response.data;
    }
};
*/

// 9. 선택 학년의 예약 가능한 수업 리스트로 반환 API (ForNotLogIn)
export const getAvailableClassesForNotLogin = async (grade) => {
    try {
        const response = await axios.get(GET_AVAILABLE_CLASSES_FOR_NOT_LOGIN_URL(grade));
        if (response.data.code === "SU") {
            return response.data.classList;
        } else {
            console.log(response.data.message);
            return [];
        }
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
                    break;
            }
        }
        return [];
    }
};
// 14.특정 날짜에 1학년/2학년 코딩존 수업 예약한 학생들 리스트로 반환 API
export const getczreservedlistRequest = async (accessToken, classDate, setCookie, navigate) => {
    try {
        const response = await axios.get(`${API_DOMAIN}/coding-zone/reserved-list/${classDate}`, authorization(accessToken));
        return response.data;
    } catch (error) {
        if (!error.response || !error.response.data) return null;

        const { code } = error.response.data;

        if (code === "ATE") {
            console.warn("특정 날짜 예약된 학생 목록 조회: Access Token 만료됨. 토큰 재발급 시도 중...");
            const newToken = await refreshTokenRequest(setCookie, accessToken, navigate);

            if (newToken?.accessToken) {

                return getczreservedlistRequest(newToken.accessToken, classDate, setCookie, navigate);
            } else {

                setCookie('accessToken', '', { path: '/', expires: new Date(0) });
                navigate('/');
                return { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다. 다시 로그인해주세요.' };
            }
        }

        return error.response.data;
    }
};

//16. 해당 학기 모든 학생들의 출결 정보를 Excel 파일로 반환하는 API 
export const downloadAttendanceExcel = async (accessToken, grade, setCookie, navigate) => {
    try {
        const response = await axios.get(`${API_DOMAIN_ADMIN}/excel/attendance/grade${grade}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `코딩존${grade}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (error) {
        if (!error.response) {
            alert("다운로드 실패: 네트워크 상태를 확인해주세요.");
            return;
        }

        const { code } = error.response.data;

        if (code === "ATE") {
            console.warn(" 출결 Excel 다운로드: Access Token 만료됨. 토큰 재발급 시도 중...");
            const newToken = await refreshTokenRequest(setCookie, accessToken, navigate);

            if (newToken?.accessToken) {

                return downloadAttendanceExcel(newToken.accessToken, grade, setCookie, navigate);
            } else {

                setCookie('accessToken', '', { path: '/', expires: new Date(0) });
                navigate('/');
                return;
            }
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
                break;
        }
    }
};

//과목명과 코딩존 번호 매핑 API
export const registerSubjectMapping = async (mappings, accessToken, setCookie, navigate) => {
    try {
      const response = await axios.post(`${API_DOMAIN_ADMIN}/subjects`,mappings,
        authorization(accessToken)
      );
  
      if (response.data.code === 'SUCCESS_POST_MAPPING') {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      if (!error.response || !error.response.data) {
        return { success: false, message: '네트워크 오류 또는 서버 응답 없음' };
      }
  
      const { code } = error.response.data;
  
      // 토큰 만료 처리
      if (code === 'ATE') {
        console.warn('코딩존 매핑: Access Token 만료됨. 토큰 재발급 시도 중...');
        const newToken = await refreshTokenRequest(setCookie, accessToken, navigate);
  
        if (newToken?.accessToken) {
          return registerSubjectMapping(mappings, newToken.accessToken, setCookie, navigate);
        } else {
          setCookie('accessToken', '', { path: '/', expires: new Date(0) });
          navigate('/');
          return { success: false, message: '토큰이 만료되었습니다. 다시 로그인해주세요.' };
        }
      }
  
      switch (code) {
        case 'AF':
          return { success: false, message: '권한이 없습니다.' };
        case 'DBE':
          return { success: false, message: '데이터베이스 오류가 발생했습니다.' };
        case 'DUPLICATED_MAPPING_SET':
          return { success: false, message: '이미 존재하는 코딩존 매핑 번호와 교과목입니다.' };
        case 'DUPLICATED_MAPPING_NUMBER':
          return { success: false, message: '이미 존재하는 subjectId입니다.' };
        case 'DUPLICATED_MAPPING_CLASSNAME':
          return { success: false, message: '이미 존재하는 subjectName입니다.' };
        default:
          return { success: false, message: '예상치 못한 오류가 발생했습니다.' };
      }
    }
  };
  //과목명과 코딩존 번호 매핑불러오는 api
  export const getSubjectMappingList = async (accessToken, setCookie, navigate) => {
    console.log("getSubjectMappingList 호출됨, accessToken:", accessToken);
    try {
      const response = await axios.get(
        `${API_DOMAIN_ADMIN}/subjects`, authorization(accessToken)
      );
  
      if (response.data.code === 'SU') {
        return {
          success: true,
          message: response.data.message,
          subjectList: Array.isArray(response.data.data) ? response.data.data : []
        };
      } else {
        return { success: false, message: response.data.message, subjectList: [] };
      }
    } catch (error) {
      if (!error.response || !error.response.data) {
        return {
          success: false,
          message: '네트워크 오류 또는 서버 응답 없음',
          subjectList: []
        };
      }
  
      const { code } = error.response.data;
  
      // 토큰 만료 처리
      if (code === 'ATE') {
        console.warn('코딩존 매핑 조회: Access Token 만료됨. 토큰 재발급 시도 중...');
        const newToken = await refreshTokenRequest(setCookie, accessToken, navigate);
  
        if (newToken?.accessToken) {
          return getSubjectMappingList(newToken.accessToken, setCookie, navigate);
        } else {
          setCookie('accessToken', '', { path: '/', expires: new Date(0) });
          navigate('/');
          return {
            success: false,
            message: '토큰이 만료되었습니다. 다시 로그인해주세요.',
            subjectList: []
          };
        }
      }
  
      switch (code) {
        case 'AF':
          return { success: false, message: '권한이 없습니다.', subjectList: [] };
        case 'DBE':
          return { success: false, message: '데이터베이스 오류가 발생했습니다.', subjectList: [] };
        case 'NOT_ANY_MAPPINGSET':
          return { success: false, message: '등록된 매핑 정보가 없습니다.', subjectList: [] };
        default:
          return { success: false, message: '예상치 못한 오류가 발생했습니다.', subjectList: [] };
      }
    }
  };


  export const getEntireAttendanceBySubject = async (accessToken, subjectId, setCookie, navigate) => {
  const url = `${API_DOMAIN_ADMIN}/entire-attendance/${subjectId}`;
  try {
    if (subjectId == null || Number.isNaN(Number(subjectId))) {
      return { code: "INVALID_SUBJECT_ID", message: "유효하지 않은 과목 ID", data: null };
    }
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
      timeout: 15000,
    });
    return res.data;
  } catch (error) {
    if (!error.response) {
      return { code: "NETWORK_ERROR", message: "네트워크 상태를 확인해주세요.", data: null };
    }
    if (!error.response.data) {
      return { code: "SERVER_ERROR", message: `서버 오류(${error.response.status})`, data: null };
    }

    const { code, message } = error.response.data;

    if (code === "ATE") {
      const next = await refreshTokenRequest(setCookie, accessToken, navigate);
      if (next?.accessToken) {
        return getEntireAttendanceBySubject(next.accessToken, subjectId, setCookie, navigate);
      }
      setCookie("accessToken", "", { path: "/", expires: new Date(0) });
      navigate("/");
      return { code: "TOKEN_EXPIRED", message: "토큰이 만료되었습니다. 다시 로그인해주세요.", data: null };
    }

    return { code: code ?? "UNKNOWN_ERROR", message: message ?? "알 수 없는 오류", data: null };
  }
};