package com.icehufs.icebreaker.domain.codingzone.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.GroupInf;

@Repository
public interface GroupInfRepository extends JpaRepository<GroupInf, Integer> {

    List<GroupInf> findByGroupId(String groupId);

    Optional<GroupInf> findByClassNum(Integer classNum);

    void deleteByGroupId(String groupId);

    Optional<GroupInf> findByAssistantNameAndClassTimeAndClassName(String assistantName, String classTime, String className);

    void delete(GroupInf group);
}
