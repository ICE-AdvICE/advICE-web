import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/codingzone/InquiryModal.module.css';
import { getCzAssistantsRequest } from '../../features/api/Admin/Codingzone/InquiryApi';

const InquiryModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate(); 
    const [subjects, setSubjects] = useState([]); // [{subjectName, assistants:[{email,studentNum,name}]}]
    const [status, setStatus] = useState('idle'); // idle | loading | success | empty | error
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAssistants();
        }
    }, [isOpen]);

    const fetchAssistants = async () => {
        setStatus('loading');
        setErrorMsg('');
        const response = await getCzAssistantsRequest();
        if (!response) {
          setStatus('error');
          setErrorMsg('네트워크 오류가 발생했습니다.');
          return;
        }
        if (response.code === 'SU' && Array.isArray(response.data)) {
          if (response.data.length === 0) {
            setSubjects([]);
            setStatus('empty');
          } else {
            setSubjects(response.data);
            setStatus('success');
          }
        } else if (response.code === 'NO_ANY_ASSISTANTS') {
          setSubjects([]);
          setStatus('empty');
          setErrorMsg('조교가 등록된 과목이 아직 없습니다.');
        } else {
          setStatus('error');
          setErrorMsg(response.message || '조회 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={isOpen ? styles.root : styles.rootDisable}>
            <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div className="loginHeaderContainer">
        <img src="/header-name.png" alt="로그인 로고" className="responsiveLogo" />
      </div>
                <div className={styles.close} onClick={onClose}>×</div>
                <div className={styles.title}><strong>과 사무실</strong></div>
                <div className={styles.modalBody}>
                    <strong>이메일:</strong> ice@hufs.ac.kr<br />
                    <strong>연락처:</strong> 031-330-4255
                </div>
                  <div className={styles.title}><strong>코딩존 조교</strong></div>
                <div className={styles.modalBody}>
                  {status === 'loading' && <div>불러오는 중...</div>}
                  {status === 'empty' && <div>{errorMsg || '표시할 과목이 없습니다.'}</div>}
                  {status === 'error' && <div style={{ color: '#d33' }}>{errorMsg}</div>}
                  {status === 'success' && subjects.map((s, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <strong>{s.subjectName}</strong>
                      <ul style={{ listStyleType: 'none', paddingLeft: 0, marginTop: 8 }}>
                        {s.assistants.map((a, idx) => (
                          <li key={idx}>
                            {a.name} ({a.email})
                            {/* 필요 시 학번 노출:  - {a.studentNum} */}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
            </div>
        </div>
    );
};

export default InquiryModal;