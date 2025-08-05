package com.icehufs.icebreaker.domain.codingzone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.Subject;

import java.util.List;

@Repository
public interface CodingZoneRegisterRepository extends JpaRepository<CodingZoneRegister, Integer> {

    CodingZoneRegister findByClassNumAndUserEmail(Integer classNum, String userEmail);
    CodingZoneRegister findByRegistrationId(Integer registrationId);
    List<CodingZoneRegister> findByClassNum(Integer classNum);
    List<CodingZoneRegister> findByClassNum(int classNum);
    List<CodingZoneRegister> findByUserEmail(String userEmail);
    List<CodingZoneRegister> findAllByOrderByUserStudentNumAsc();
    
    // codingzoneclass와 codingzoneregister 쿼리 연결
    // codingzoneclass로 부터 grade -> classNum 필드값 추출
    // classNum으로 부터 codingzoneregister 객체 추출
    List<CodingZoneRegister> findByClassNumOrderByUserStudentNumAsc(Integer classNum); 
}