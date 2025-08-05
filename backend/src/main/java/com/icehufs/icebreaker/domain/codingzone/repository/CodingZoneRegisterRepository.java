package com.icehufs.icebreaker.domain.codingzone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;
import java.util.List;

@Repository
public interface CodingZoneRegisterRepository extends JpaRepository<CodingZoneRegister, Integer> {

    CodingZoneRegister findByClassNumAndUserEmail(Integer classNum, String userEmail);
    CodingZoneRegister findByRegistrationId(Integer registrationId);
    List<CodingZoneRegister> findBySubjectId(int subjectId);
    List<CodingZoneRegister> findByUserEmail(String userEmail);
    List<CodingZoneRegister> findAllByOrderByUserStudentNumAsc();
    List<CodingZoneRegister> findBySubjectIdOrderByUserStudentNumAsc(int subjectId);
}