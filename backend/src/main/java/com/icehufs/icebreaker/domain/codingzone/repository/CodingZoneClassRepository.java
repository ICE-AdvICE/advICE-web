package com.icehufs.icebreaker.domain.codingzone.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import com.icehufs.icebreaker.util.CodingZoneClassIdentityDto;

import io.lettuce.core.dynamic.annotation.Param;



@Repository
public interface CodingZoneClassRepository extends JpaRepository<CodingZoneClass, Integer> {
    
    CodingZoneClass findByClassNum(Integer classNum);  
    List<CodingZoneClass> findBySubjectId(int subjectId);
    List<CodingZoneClass> findBySubjectIdAndClassDateBetween(int subjectId, String startDate, String endDate);

    @Query("""
        SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
        FROM codingzoneclass c
        WHERE c.assistantName = :assistantName
        AND c.classDate = :classDate
        AND c.classTime = :classTime
        AND c.className = :className
        AND c.maximumNumber = :maximumNumber
        AND c.weekDay = :weekDay
        AND c.subjectId = :subjectId
        AND c.groupId = :groupId
    """)
    boolean existsByIdentity(
    @Param("assistantName") String assistantName,
    @Param("classDate") String classDate,
    @Param("classTime") String classTime,
    @Param("className") String className,
    @Param("maximumNumber") int maximumNumber,
    @Param("weekDay") String weekDay,
    @Param("subjectId") int subjectId,
    @Param("groupId") String groupId
);

}
