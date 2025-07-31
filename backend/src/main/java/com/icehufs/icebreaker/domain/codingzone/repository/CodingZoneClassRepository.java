package com.icehufs.icebreaker.domain.codingzone.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;



@Repository
public interface CodingZoneClassRepository extends JpaRepository<CodingZoneClass, Integer> {
    
    CodingZoneClass findByClassNum(Integer classNum);  
    List<CodingZoneClass> findByGrade(int subjectId);
    List<CodingZoneClass> findByGradeAndClassDateBetween(Integer subjectId, String startDate, String endDate);

}
