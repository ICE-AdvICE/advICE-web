package com.icehufs.icebreaker.domain.membership.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.icehufs.icebreaker.domain.membership.domain.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByEmail(String email);
    User findByEmail(String email);
}