import axios from 'axios';
import { refreshTokenRequest } from '../../../shared/api/AuthApi';
const DOMAIN = process.env.REACT_APP_API_DOMAIN;
const API_DOMAIN = `${DOMAIN}/api/v1`;
const API_DOMAIN_ADMIN = `${DOMAIN}/api/admin`;



const DELETE_CLASS_URL = (classNum) => `${DOMAIN}/api/admin/delete-class/${classNum}`;

//2. 특정 (A/B)조의 정보 등록 API
export const uploadGroupData = async (groupData, token, setCookie, navigate) => {
    try {
        const response = await axios.post(`${API_DOMAIN_ADMIN}/upload-group`, groupData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    } catch (error) {
        if (!error.response) {
            return { code: 'NETWORK_ERROR', message: '네트워크 상태를 확인해주세요.' };
        }

        const { code } = error.response.data;

        if (code === "ATE") {
            console.warn("🔄 (A/B)조 정보 등록: Access Token 만료됨. 토큰 재발급 시도 중...");
            const newToken = await refreshTokenRequest(setCookie, token, navigate);

            if (newToken?.accessToken) {
                return uploadGroupData(groupData, newToken.accessToken, setCookie, navigate);
            } else {
                setCookie('accessToken', '', { path: '/', expires: new Date(0) });
                navigate('/');
                return { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다. 다시 로그인해주세요.' };
            }
        }

        return error.response.data;
    }
};

//3. 특정 (A/B)조의 정보 반환 API
export const fetchGroupClasses = async (groupId, token, setCookie, navigate) => {
    try {
        const response = await axios.get(`${API_DOMAIN_ADMIN}/get-group/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    } catch (error) {
        if (!error.response) {
            return { code: 'NETWORK_ERROR', message: '네트워크 상태를 확인해주세요.' };
        }

        const { code } = error.response.data;

        if (code === "ATE") {
            console.warn("🔄 (A/B)조 정보 반환: Access Token 만료됨. 토큰 재발급 시도 중...");
            const newToken = await refreshTokenRequest(setCookie, token, navigate);

            if (newToken?.accessToken) {
                return fetchGroupClasses(groupId, newToken.accessToken, setCookie, navigate);
            } else {
                setCookie('accessToken', '', { path: '/', expires: new Date(0) });
                navigate('/');
                return { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다. 다시 로그인해주세요.' };
            }
        }

        return error.response.data;
    }
};


//1. 코딩존 수업 등록 API
export const uploadClassForWeek = async (groupData, token, setCookie, navigate) => {
    try {
        const response = await axios.post(`${API_DOMAIN_ADMIN}/codingzones/classes`, groupData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    } catch (error) {
        if (!error.response) {
            return { code: 'NETWORK_ERROR', message: '네트워크 상태를 확인해주세요.' };
        }

        const { code } = error.response.data;

        if (code === "ATE") {
            console.warn("🔄 코딩존 수업 등록: Access Token 만료됨. 토큰 재발급 시도 중...");
            const newToken = await refreshTokenRequest(setCookie, token, navigate);

            if (newToken?.accessToken) {
                return uploadClassForWeek(groupData, newToken.accessToken, setCookie, navigate);
            } else {
                setCookie('accessToken', '', { path: '/', expires: new Date(0) });
                navigate('/');
                return { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다. 다시 로그인해주세요.' };
            }
        }

        return error.response.data;
    }
};

// 13. 등록된 특정 수업 삭제 API
export const deleteClass = async (classNum, token, setCookie, navigate) => {
    try {
        const response = await axios.delete(DELETE_CLASS_URL(classNum), {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.code === "SU") {
            return true;
        }
    } catch (error) {
        if (!error.response) {
            return { code: 'NETWORK_ERROR', message: '네트워크 상태를 확인해주세요.' };
        }

        const { code } = error.response.data;

        if (code === "ATE") {
            console.warn("🔄 수업 삭제: Access Token 만료됨. 토큰 재발급 시도 중...");
            const newToken = await refreshTokenRequest(setCookie, token, navigate);

            if (newToken?.accessToken) {
                return deleteClass(classNum, newToken.accessToken, setCookie, navigate);
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
