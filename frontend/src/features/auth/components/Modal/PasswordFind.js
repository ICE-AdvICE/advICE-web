import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { checkCertificationRequest,pwRequest } from '../../../../shared/api/EmailApi.js';
import { pwUpdateRequest } from '../../../../entities/api/UserApi.js';
const FindPasswordForm = ({ onClose }) => {
    const [userEmail, setUserEmail] = useState('');
    const [certificationNumber, setCertificationNumber] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isCertified, setIsCertified] = useState(false);
    const [cookies, setCookie] = useCookies(['accessToken']);
    const [isModalOpen, setIsModalOpen] = useState(true);
    const navigate = useNavigate();
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [countdown, setCountdown] = useState(60);


    useEffect(() => {
        const storedTime = localStorage.getItem('timerStart');
        if (storedTime) {
            const now = new Date().getTime();
            const timePassed = (now - parseInt(storedTime)) / 1000;
            const remainingTime = Math.floor(Math.max(60 - timePassed, 0));
            if (remainingTime > 0) {
                setCountdown(remainingTime);
                setButtonDisabled(true);
            } else {
                localStorage.removeItem('timerStart');
                setButtonDisabled(false);
            }
        }
    }, []);

    // 타이머 카운트다운
    useEffect(() => {
        let intervalId;
        if (buttonDisabled) {
            intervalId = setInterval(() => {
                setCountdown((c) => {
                    const nextCount = c - 1;
                    if (nextCount > 0) {
                        return nextCount;
                    } else {
                        clearInterval(intervalId);
                        setButtonDisabled(false);
                        localStorage.removeItem('timerStart');
                        return 60;
                    }
                });
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [buttonDisabled]);
    // 이메일로 인증번호 전송 요청
    const handleSendCertification = async () => {
        if (!buttonDisabled) {
            setButtonDisabled(true);
            localStorage.setItem('timerStart', new Date().getTime().toString());
            setCountdown(60); // 타이머 시작
            const requestBody = { email: userEmail };
            const response = await pwRequest(requestBody);
            if (response.code === 'SU') {
                alert('인증번호가 전송되었습니다. \n받은 인증번호를 입력해주세요.');
            } else if (response.code === 'NU') {
                alert('회원가입 된 계정이 아닙니다.');
                setButtonDisabled(false);
                localStorage.removeItem('timerStart');
            } else if (response.code === 'MF') {
                alert('메일전송에 실패 했습니다. \n다시 시도 해 주세요.');
                setButtonDisabled(false);
                localStorage.removeItem('timerStart');
            } else {
                alert('메일전송에 실패 했습니다. \n다시 시도 해 주세요.');
                setButtonDisabled(false);
                localStorage.removeItem('timerStart');
            }
        }
    };

    // 인증번호 확인
    const handleCertification = async () => {
        const requestBody = {
            email: userEmail,
            certificationNumber: certificationNumber
        };
        const response = await checkCertificationRequest(requestBody);
        if (response.code === 'SU') {
            setIsCertified(true);
            alert('인증이 성공적으로 완료되었습니다. \n이제 비밀번호를 변경할 수 있습니다.');
        } else {
            alert('인증번호가 잘못되었습니다. \n다시 시도해주세요.');
        }
    };

    // 비밀번호 변경
    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
    
        if (newPassword.length < 8 || newPassword.length > 20) {
            alert('비밀번호 길이를 8자 이상 20자 이하로 해주세요.');
            return;
        }
    
        const requestBody = {
            email: userEmail,
            password: newPassword
        };
    
        const response = await pwUpdateRequest(requestBody, cookies.accessToken, setCookie, navigate);
        
        if (response?.code === "SU") {
            alert('비밀번호 변경이 성공적으로 완료되었습니다.');
            onClose();
        } 
        else if (response?.code === "DP") {
            alert('현재 비밀번호와 변경하려는 비밀번호가 동일합니다.');
        }
        else {
            alert('오류가 발생했습니다. 다시 시도 해 주세요.');
        }
    };
    
    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <div className="loginHeaderContainer">
                <img src="header-name.png" alt="로그인 로고" className="responsiveLogo" />
            </div>
            <div className="pw_emailpost">
                <label htmlFor="user_email"></label>
                <input
                    type="text"
                    id="user_email"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    placeholder="학교 이메일"
                />
                <span className="pw_emailDomain">@hufs.ac.kr</span>
                <button type="button" className="findpasswordpost" onClick={handleSendCertification} disabled={buttonDisabled}>
                    요청
                </button>
            </div>
            {buttonDisabled && <span className="pw_countdown-timer">{countdown}초 후에 다시 시도 가능합니다.</span>}
            <div className="pw_emailcer">
                <label htmlFor="certificationNumber"></label>
                <input
                    type="text"
                    id="certificationNumber"
                    value={certificationNumber}
                    onChange={e => setCertificationNumber(e.target.value)}
                    placeholder="인증번호를 입력해주세요."
                />
                <button type="button" className="findpasswordpost" onClick={handleCertification}>인증</button>
            </div>
            {isCertified && (
                <>
                    <div className="pw_new">
                        <label htmlFor="newPassword"></label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호 입력"
                        />
                    </div>
                    <div className="pw_new_cer">
                        <label htmlFor="confirmPassword"></label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 재입력"
                        />
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <div className="pw-mismatch-error" style={{ color: 'red' }}>비밀번호가 일치하지 않습니다.</div>
                        )}
                    </div>
                    <button type="button" className="signupButton" onClick={handlePasswordChange}>비밀번호 변경</button>
                </>
            )}
        </form>
    );
};

export default FindPasswordForm;