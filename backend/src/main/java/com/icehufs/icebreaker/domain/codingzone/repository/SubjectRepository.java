package com.icehufs.icebreaker.domain.codingzone.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Integer> {

    boolean existsById(int subjectId);

    boolean existsBySubjectName(String subjectName);

    boolean existsByIdIsNotNull();

    Optional<Subject> findById(int subjectId);

}
