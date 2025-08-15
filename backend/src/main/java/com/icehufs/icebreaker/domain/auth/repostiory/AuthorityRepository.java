package com.icehufs.icebreaker.domain.auth.repostiory;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("""
        select a from authority a
        where a.roleAdmin1 = :role
           or a.roleAdminC1 = :role
           or a.roleAdminC2 = :role
           or a.roleAdminC3 = :role
           or a.roleAdminC4 = :role
    """)
    List<Authority> findAllByRoleValue(@Param("role") String role);

    @Modifying
    @Transactional
    @Query("""
        UPDATE authority a
           SET a.roleAdminC1 = NULL,
               a.roleAdminC2 = NULL,
               a.roleAdminC3 = NULL,
               a.roleAdminC4 = NULL
    """)
    void clearAllClassAssistantAuthority();

    @Query("SELECT a FROM authority a WHERE " +
        "( :role = 'ROLE_ADMINC1' AND a.roleAdminC1 = :role ) OR " +
        "( :role = 'ROLE_ADMINC2' AND a.roleAdminC2 = :role ) OR " +
        "( :role = 'ROLE_ADMINC3' AND a.roleAdminC3 = :role ) OR " +
        "( :role = 'ROLE_ADMINC4' AND a.roleAdminC4 = :role )")
    List<Authority> findByRole(@Param("role") String role);
}
