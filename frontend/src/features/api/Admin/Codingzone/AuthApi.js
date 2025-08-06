import axios from 'axios';
import { refreshTokenRequest } from '../../../../shared/api/AuthApi';

const DOMAIN = process.env.REACT_APP_API_DOMAIN;
const API_DOMAIN_ADMIN = `${DOMAIN}/api/admin`;

// 권한 부여 API (ATE 처리 추가)
export const grantPermission = async (email, role, token, setCookie, navigate) => {
    try {
        const response = await axios.patch(`${API_DOMAIN_ADMIN}/authorities`, { email, role }, {
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
            console.warn("권한 부여: Access Token 만료됨. 토큰 재발급 시도 중...");
            const newToken = await refreshTokenRequest(setCookie, token, navigate);

            if (newToken?.accessToken) {

                return grantPermission(email, role, newToken.accessToken, setCookie, navigate);
            } else {

                setCookie('accessToken', '', { path: '/', expires: new Date(0) });
                navigate('/');
                return { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다. 다시 로그인해주세요.' };
            }
        }

        return error.response.data;
    }
};

// 권한 박탈 API (ATE 처리 추가)
export const deprivePermission = async (email, role, token, setCookie, navigate) => {
    try {
        const response = await axios.patch(`${API_DOMAIN_ADMIN}/deprivation`, { email, role }, {
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
            console.warn("🔄 권한 박탈: Access Token 만료됨. 토큰 재발급 시도 중...");
            const newToken = await refreshTokenRequest(setCookie, token, navigate);

            if (newToken?.accessToken) {

                return deprivePermission(email, role, newToken.accessToken, setCookie, navigate);
            } else {

                setCookie('accessToken', '', { path: '/', expires: new Date(0) });
                navigate('/');
                return { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다. 다시 로그인해주세요.' };
            }
        }

        return error.response.data;
    }
};
