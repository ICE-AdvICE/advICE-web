import React, { useEffect, useState } from 'react';

import { getczallattendRequest, downloadAttendanceExcel } from '../../features/api/Admin/Codingzone/ClassApi.js';
import { useCookies } from 'react-cookie';
import '../css/codingzone/codingzone-main.css';
import '../css/codingzone/codingzone_attend.css';
import '../css/codingzone/codingzone_all_attendance.css';
import { useNavigate } from 'react-router-dom';
import InquiryModal from './InquiryModal.js';
import { getczauthtypetRequest } from '../../shared/api/AuthApi.js';
import CodingZoneNavigation from '../../shared/ui/navigation/CodingZoneNavigation.js'; //코딩존 네이게이션 바 컴포넌트


const CodingZoneAttendanceManager = () => {
    const [authMessage, setAuthMessage] = useState('');
    const [showAdminButton, setShowAdminButton] = useState(false);
    const [showManageAllButton, setShowManageAllButton] = useState(false);
    const [showRegisterClassButton, setShowRegisterClassButton] = useState(false);
    const [cookies, setCookie] = useCookies(['accessToken']);
    const [activeButton, setActiveButton] = useState('manage_all');
    const [attendanceList, setAttendanceList] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState(1);
    const token = cookies.accessToken;
    const navigate = useNavigate();
    const [selectedButton, setSelectedButton] = useState('attendence');


    const handlecodingzonemanager = () => {
        navigate(`/coding-zone/Codingzone_Manager`);
    };


    const handleClassRegistration = () => {
        navigate(`/coding-zone/coding-class-regist`);
    };


    useEffect(() => {
        const fetchAuthType = async () => {
            const response = await getczauthtypetRequest(token, setCookie, navigate);
            if (response) {
                switch (response.code) {
                    case "CA":
                        setShowAdminButton(true);

                        break;
                    case "EA":
                        setShowRegisterClassButton(true);
                        setShowManageAllButton(true); // Also show '전체 관리' for EA
                        break;
                    case 'NU':
                        alert('로그인 시간이 만료되었습니다. 다시 로그인 해주세요.');
                        navigate('/');
                        break;
                    case 'DBE':
                        alert('데이터베이스 오류입니다.');
                        break;

                    default:
                        setShowAdminButton(false);
                        setShowManageAllButton(false);
                        setShowRegisterClassButton(false);
                        break;
                }
            }
        };

        fetchAuthType();
    }, [token, authMessage]);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            const response = await getczallattendRequest(token, setCookie, navigate);
            if (response && response.code === "SU") {
                // Filter data based on selected grade
                const filteredData = response.studentList.filter(student => student.grade === selectedGrade);
                setAttendanceList(filteredData);
            } else if (response && response.code === "NU") {
                navigate('/');
            }
            else {
                console.error(response?.message || "Failed to fetch attendance data.");
            }
        };

        fetchAttendanceData();
    }, [token, selectedGrade]);  // Add selectedGrade to dependency array

    const handleGradeChange = (grade) => {
        setSelectedGrade(grade);
    };

    const aggregateAttendanceData = (attendanceList) => {
        const aggregatedData = {};

        attendanceList.forEach((record) => {
            const key = record.userEmail; // 이메일 별로 집계
            if (!aggregatedData[key]) {
                aggregatedData[key] = {
                    userStudentNum: record.userStudentNum,
                    userName: record.userName,
                    userEmail: record.userEmail,
                    presentCount: 0,
                    absentCount: 0
                };
            }
            if (record.attendance === '0') {
                aggregatedData[key].absentCount++;
            } else {
                aggregatedData[key].presentCount++;
            }
        });

        return Object.values(aggregatedData);
    };

    const handleDownload = async () => {
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }
        await downloadAttendanceExcel(token, selectedGrade, setCookie, navigate);
    };


    return (
        <div>
            <div className="codingzone-container">
                <CodingZoneNavigation />

                <div className="banner_img_container">
                    <img src="/codingzone_attendance5.png" className="banner" />
                </div>
            </div>
            <div className="cza_button_container" style={{ textAlign: 'center' }}>
                <button
                    className={`btn-attend ${activeButton === 'check' ? 'active' : ''}`}
                    onClick={() => { setActiveButton('check'); navigate(`/coding-zone/Codingzone_Attendance`); }}
                >
                    출결 확인
                </button>
                {showRegisterClassButton && (
                    <>
                        <div className="divider"></div>
                        <button
                            className={`btn-attend ${activeButton === 'manage' ? 'active' : ''}`}
                            onClick={handleClassRegistration}
                        >
                            수업 등록
                        </button>
                    </>
                )}
                {showAdminButton && (
                    <>
                        <div className="divider"></div>
                        <button
                            className={`btn-attend ${activeButton === 'manage' ? 'active' : ''}`}
                            onClick={handlecodingzonemanager}
                        >
                            출결 관리
                        </button>
                    </>
                )}
                {showManageAllButton && (
                    <>
                        <div className="divider"></div>
                        <button
                            className={`btn-attend ${activeButton === 'manage_all' ? 'active' : ''}`}
                            onClick={() => setActiveButton('manage_all')}
                        >
                            전체 관리
                        </button>
                    </>
                )}
            </div>
            <div className="centered-content">
                <div className="allattendance_buttons">
                    <div className="grade-buttons">
                        <button
                            className={selectedGrade === 1 ? 'active' : ''}
                            onClick={() => handleGradeChange(1)}
                        >
                            코딩존1
                        </button>
                        <button
                            className={selectedGrade === 2 ? 'active' : ''}
                            onClick={() => handleGradeChange(2)}
                        >
                            코딩존2
                        </button>
                    </div>

                    <button className="download-button" onClick={handleDownload}>
                        <img src="/excell_img.png" alt="다운로드" className="download-icon" />
                        다운로드
                    </button>
                </div>

                <div className="line-container1">
                </div>

                <div className="info-all_container">
                    <div className="info_all_inner">
                        <div className="info_all_studentnum">학번</div>
                        <div className="info_all_name">이름</div>
                        <div className="info_all_emali">이메일</div>
                        <div className="info_all_bar"></div>
                        <div className="info_all_presentcount">출석</div>
                        <div className="info_all_absentcount">결석</div>
                    </div>
                </div>
                <div className="line-container2">
                </div>

                <div className="info_all_data_container">
                    {aggregateAttendanceData(attendanceList).map((student, index) => (
                        <div key={index}>
                            <div className="info_all_data_inner">
                                <div className="info_all_data_studentnum">{student.userStudentNum}</div>
                                <div className="info_all_data_name">{student.userName}</div>
                                <div className="info_all_data_email">
                                    {student.userEmail.split('@')[0]}
                                </div>
                                <div className="info_all_data_bar"></div>
                                <div className="info_all_data_presentcount">{student.presentCount}</div>
                                <div className="info_all_data_absentcount">{student.absentCount}</div>
                            </div>
                            <div className="hr-line"></div> {/* Horizontal line after each item */}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default CodingZoneAttendanceManager;
