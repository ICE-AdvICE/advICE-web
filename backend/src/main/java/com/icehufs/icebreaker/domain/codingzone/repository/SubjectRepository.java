package com.icehufs.icebreaker.domain.codingzone.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Integer> {

    boolean existsBySubjectId(int subjectId);

    boolean existsBySubjectName(String subjectName);

    boolean existsBySubjectIdIsNotNull();

    // subjectId 오름차순 정렬 조회
    List<Subject> findAllByOrderBySubjectIdAsc();
}
