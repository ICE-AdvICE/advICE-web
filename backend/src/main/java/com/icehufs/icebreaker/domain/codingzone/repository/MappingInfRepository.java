package com.icehufs.icebreaker.domain.codingzone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.icehufs.icebreaker.domain.codingzone.domain.MappingInf;

public interface MappingInfRepository extends JpaRepository<MappingInf, Integer>{
  
    boolean existsBySubjectId(Integer subjectId);
}
