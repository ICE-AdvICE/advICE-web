package com.icehufs.icebreaker.domain.codingzone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import io.lettuce.core.dynamic.annotation.Param;

@Repository
public interface CodingZoneClassRepository extends JpaRepository<CodingZoneClass, Integer> {

    List<CodingZoneClass> findAllBySubjectId(int subjectId);

    CodingZoneClass findByClassNum(Integer classNum);

    List<CodingZoneClass> findBySubjectIdAndClassDateBetween(int subjectId, String startDate, String endDate);

    boolean existsBySubjectId(Integer subjectId);

    List<CodingZoneClass> findAllByClassDate(String classDate);

    List<CodingZoneClass> findBySubject_IdAndClassDate(int subjectId, String classDate);

    // 새로운 수업 등록 시 DB에 이미 있는 수업 정보 확인 과정에서 필요
    // classNumber와 currentNumber 제외하고 가져와야 함
    @Query("""
                SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
                FROM codingzoneclass c
                WHERE c.assistantName = :assistantName
                AND c.classDate = :classDate
                AND c.classTime = :classTime
                AND c.className = :className
                AND c.maximumNumber = :maximumNumber
                AND c.weekDay = :weekDay
                AND c.subject.id = :subjectId
            """)
    boolean existsByIdentity(
            @Param("assistantName") String assistantName,
            @Param("classDate") String classDate,
            @Param("classTime") String classTime,
            @Param("className") String className,
            @Param("maximumNumber") int maximumNumber,
            @Param("weekDay") String weekDay,
            @Param("subjectId") int subjectId);

    @Query(value = """
        SELECT * FROM codingzoneclass c
        WHERE c.subject_id = :subjectId
        AND STR_TO_DATE(CONCAT(c.class_date, ' ', c.class_time), '%Y-%m-%d %H:%i') < NOW()
        """, nativeQuery = true)
    List<CodingZoneClass> findPastClassesBySubjectId(@Param("subjectId") int subjectId);        

}
