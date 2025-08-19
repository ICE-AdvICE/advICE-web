package com.icehufs.icebreaker.domain.codingzone.service;

import com.icehufs.icebreaker.domain.auth.repostiory.AuthorityRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneClassRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneRegisterRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.GroupInfRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.SubjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SemesterMaintenanceService {

    private final CodingZoneClassRepository codingZoneClassRepository;
    private final CodingZoneRegisterRepository codingZoneRegisterRepository;
    private final GroupInfRepository groupInfRepository;
    private final AuthorityRepository authorityRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public void resetSemester() {

        codingZoneRegisterRepository.deleteAll();
        groupInfRepository.deleteAll();
        codingZoneClassRepository.deleteAll();
        authorityRepository.clearAllClassAssistantAuthority();
        subjectRepository.deleteAll();

    }

}



