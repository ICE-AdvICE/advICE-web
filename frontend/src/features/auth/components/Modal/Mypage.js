import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { checkuserbanRequest } from '../../../api/ArticleApi.js';
import MyModal from '../../../../shared/components/BaseModal.js';
import FindpasswordForm from './PasswordFind.js';
import './modules.css';
import { useNavigate } from 'react-router-dom';
import { getczauthtypetRequest, getMypageRequest } from '../../../../shared/api/AuthApi.js';
import { deleteUserRequest, updateMypageUserRequest, logoutRequest} from '../../../../entities/api/UserApi.js';

const MypageForm = ({ closeModal, modal }) => {
    const [userDetails, setUserDetails] = useState({
        email: '',
        studentNum: '',
        name: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [authType, setAuthType] = useState('');
    const [cookies, setCookie] = useCookies(['accessToken']);
    const navigate = useNavigate();
    const [modalOpenfind, setModalOpenfind] = useState(false);

    const handleLogout = async () => {
        const result = await logoutRequest(cookies.accessToken, setCookie, navigate);
        
        if (result?.code === "SU" || result?.code === "RF_FAIL") {
            console.log("로그아웃 완료, 메인 페이지로 이동");
    
            setCookie('accessToken', '', { path: '/', expires: new Date(0) });
            setCookie('refreshToken', '', { path: '/', expires: new Date(0) });
    
            navigate('/'); // 로그아웃 후 메인 페이지로 이동
            window.location.reload(); // 새로고침하여 NavBar 상태 반영
        } else {
            alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };
    

    useEffect(() => {
        const fetchUserData = async () => {
            if (modal.mypage) { //modal이 props로 전달되었으므로 사용 가능
                const userDetailsData = await getMypageRequest(cookies.accessToken, setCookie, navigate, closeModal);
                if (userDetailsData?.code === "SU") {
                    const userData = userDetailsData.data;  // 새로 추가된 data 필드
                    setUserDetails({
                        email: userData.email,
                        studentNum: userData.studentNum,
                        name: userData.name
                    });
                }
    
                const authTypeData = await getczauthtypetRequest(cookies.accessToken, setCookie, navigate, closeModal);
                if (authTypeData?.code === "EA") {
                    setAuthType(authTypeData.code);
                }
            }
        };
    
        fetchUserData();
    }, [modal.mypage, cookies.accessToken, navigate, closeModal]); 
    
    

    const handleGrantPermissions = () => {
        closeModal();
        setTimeout(() => {
            navigate('/auth-handle');
        }, 100);
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("정말로 계정을 삭제하시겠습니까?")) {
            const banCheck = await checkuserbanRequest(userDetails.email, cookies.accessToken);
            if (banCheck.banReason) {
                alert(`계정 삭제가 불가능합니다. 정지 사유: ${banCheck.banReason}`);
            } else {
                const result = await deleteUserRequest(cookies.accessToken, setCookie, navigate);
                if (result?.code === "SU") {
                    alert("계정이 성공적으로 삭제되었습니다.");
                    handleLogout(); // ✅ 탈퇴 후 자동 로그아웃 처리
                } else {
                    alert(`오류 발생: ${result?.message}`);
                }
            }
        }
    };

    const handleUpdateUserDetails = async () => {
        const updatedUserDetails = { ...userDetails }; // 현재 입력된 정보를 저장
    
        const result = await updateMypageUserRequest(updatedUserDetails, cookies.accessToken, setCookie, navigate);
        if (result?.code === "SU") {
            alert("정보가 성공적으로 업데이트되었습니다.");
            setEditMode(false);
            setUserDetails(updatedUserDetails); // 업데이트 성공 후 상태 유지
        } else {
            alert(`Error: ${result?.message}`);
        }
    };
    

    const handleFindpassword = (e) => {
        e.preventDefault();
        setModalOpenfind(true);
    };

    const handleNumberInput = (e) => {
        const value = e.target.value;
        setUserDetails({ ...userDetails, studentNum: value.replace(/[^0-9]/g, '') });
    };

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <div className="loginHeaderContainer">
                <img src="header-name.png" alt="로그인 로고" className="responsiveLogo" />
            </div>
            <div className="mypage_icelogo">
                <img src="favicon.png" alt="정보통신공학과 로고" style={{ width: '150px', height: 'auto' }} />
            </div>
            <div className="mypage_component">
                <p>메일: {userDetails.email}</p>
                <p>학번: {userDetails.studentNum}</p>
                <p>이름: {userDetails.name}</p>
            </div>
            <button className="findPasswordButton" onClick={handleFindpassword}>비밀번호 재설정</button>
            <div className="mypage_buttons">
                {authType === "EA" && (
                    <button type="button" onClick={handleGrantPermissions}>권한 부여</button>
                )}
                <button type="button" onClick={() => setEditMode(true)}>정보 수정</button>
                <button type="button" onClick={handleLogout}>로그아웃</button>
            </div>
            <div className="mypage_delete_user_container">
                <button className="mypage_delete_user" onClick={handleDeleteAccount}>회원 탈퇴</button>
            </div>

            {editMode && (
                <MyModal open={editMode} onCancel={() => setEditMode(false)} footer={[]}>
                    <div className="loginHeaderContainer">
                        <img src="header-name.png" alt="로그인 로고" style={{ width: '220px', height: 'auto' }} />
                    </div>
                    <div>
                        <label>이름:</label>
                        <input
                            value={userDetails.name}
                            onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                            className="mypage_update_name"
                        />
                        <label>학번:</label>
                        <input
                            value={userDetails.studentNum}
                            onChange={handleNumberInput}
                            className="mypage_update_studentNum"
                        />
                        <button type="button" className="mypage_update-button" onClick={handleUpdateUserDetails}>수정 완료</button>
                    </div>
                </MyModal>
            )}

            <MyModal
                open={modalOpenfind}
                width={500}
                header={[]}
                onCancel={() => setModalOpenfind(false)}
                footer={[]}
            >
                <FindpasswordForm onLogin={handleFindpassword} onClose={() => setModalOpenfind(false)} />
            </MyModal>
        </form>
    );
};

export default MypageForm;
