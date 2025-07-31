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

    // 새로운 수업 등록 시 DB에 이미 있는 수업 정보 확인 과정에서 필요
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
