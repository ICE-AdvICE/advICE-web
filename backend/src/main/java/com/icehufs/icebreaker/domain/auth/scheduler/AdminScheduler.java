package com.icehufs.icebreaker.domain.auth.scheduler;


import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.icehufs.icebreaker.domain.auth.domain.entity.Authority;
import com.icehufs.icebreaker.domain.auth.repostiory.AuthorityRepository;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AdminScheduler {

    private final AuthorityRepository authorityRepository;

    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정에 실행
    @Transactional
    public void cleanupOldUsers() {
        LocalDateTime now = LocalDateTime.now();
        List<Authority> userAuthorities = authorityRepository.findAll(); // 모든 사용자를 반환

        for (Authority authority : userAuthorities) {
            authority.autoRevokeExpiredRoles(now);
        }
    }
}