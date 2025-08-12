package com.icehufs.icebreaker.domain.codingzone.repository;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;
import java.util.List;

@Repository
public interface CodingZoneRegisterRepository extends JpaRepository<CodingZoneRegister, Integer> {

    CodingZoneRegister findByCodingZoneClassAndUserEmail(CodingZoneClass codingZoneClass, String userEmail);
    CodingZoneRegister findByRegistrationId(Integer registrationId);
    List<CodingZoneRegister> findAllByCodingZoneClassIn(List<CodingZoneClass> codingZoneClasses);
    List<CodingZoneRegister> findByUserEmail(String userEmail);
    List<CodingZoneRegister> findAllByOrderByUserStudentNumAsc();
    List<CodingZoneRegister> findAllByCodingZoneClassInOrderByUserStudentNumAsc(List<CodingZoneClass> classes);
    List<CodingZoneRegister> findByCodingZoneClassClassNum(Integer classNum);
}
