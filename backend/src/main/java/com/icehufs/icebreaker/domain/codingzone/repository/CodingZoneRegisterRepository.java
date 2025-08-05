package com.icehufs.icebreaker.domain.codingzone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;
import java.util.List;

@Repository
public interface CodingZoneRegisterRepository extends JpaRepository<CodingZoneRegister, Integer> {

    CodingZoneRegister findByClassNumAndUserEmail(Integer classNum, String userEmail);
    CodingZoneRegister findByRegistrationId(Integer registrationId);
    List<CodingZoneRegister> findByClassNum(Integer classNum);
    List<CodingZoneRegister> findByClassNum(int classNum);
    List<CodingZoneRegister> findByUserEmail(String userEmail);
    List<CodingZoneRegister> findAllByOrderByUserStudentNumAsc();
    
    // subject 테이블과 codingzoneclass 테이블 쿼리 연결 작업이 이루어진 후에
    // 해당 쿼리도 수정할 수 있음 
    // CodingZoneServiceImplement.getAttend()/.getReservedClass()에 아래 쿼리가 사용되므로 추후에 수정 요망
    List<CodingZoneRegister> findByClassNumOrderByUserStudentNumAsc(Integer classNum); 
}
