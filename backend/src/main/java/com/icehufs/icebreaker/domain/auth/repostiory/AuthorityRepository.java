package com.icehufs.icebreaker.domain.auth.repostiory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.icehufs.icebreaker.domain.auth.domain.entity.Authority;
import java.util.List;


@Repository
public interface AuthorityRepository extends JpaRepository<Authority, String> {
        Authority findByEmail(String email);
        List<Authority> findByRoleAdminC1(String roleAdminC1);
        List<Authority> findByRoleAdminC2(String roleAdminC2);
        List<Authority> findByRoleAdminC3(String roleAdminC3);
        List<Authority> findByRoleAdminC4(String roleAdminC4);
}