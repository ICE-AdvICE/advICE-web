import axios from 'axios';

const DOMAIN = process.env.REACT_APP_API_DOMAIN; 
const GET_CZ_ASSISTANTS = () => `${DOMAIN}/api/v1/coding-zone/assistants`;
//21. 코딩존 조교 정보 반환 API
export const getCzAssistantsRequest =  async () => {
    try {
        const { data } = await axios.get(GET_CZ_ASSISTANTS());
        return data; // { code, message, data: [...] }
    } catch (error) {
        if (!error.response || !error.response.data) return null;
        return error.response.data;
    }
};
