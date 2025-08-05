package com.icehufs.icebreaker.domain.codingzone.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.Subject;
import com.icehufs.icebreaker.domain.codingzone.dto.request.PostSubjectMappingRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.PostSubjectMappingResponseDto;
import com.icehufs.icebreaker.domain.codingzone.repository.SubjectRepository;
import com.icehufs.icebreaker.domain.membership.repository.UserRepository;
import com.icehufs.icebreaker.exception.BusinessException;
import com.icehufs.icebreaker.util.SubjectResponseDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    @Transactional
    public PostSubjectMappingResponseDto postMappingCodingZoneClass(List<PostSubjectMappingRequestDto> dto,
            String email) {

        boolean existedUser = userRepository.existsByEmail(email);
        // 전역 처리로 사용자 계정 오류 예외처리
        if (!existedUser)
            throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER,HttpStatus.NOT_FOUND);

        List<Integer> duplicatedIds = new ArrayList<>(); // 중복 매핑 번호가 있을 경우, 중복된 매핑 번호가 담길 List
        List<String> duplicatedNames = new ArrayList<>(); // 중복 교과목 이름이 있을 경우,중복된 과목명이 담길 List

        for (PostSubjectMappingRequestDto requestDto : dto) {
            // 매핑 번호 중복 확인
            if (subjectRepository.existsBySubjectId(requestDto.getSubjectId())) {
                duplicatedIds.add(requestDto.getSubjectId());
            }
            // 매핑 과목명 중복 확인
            if (subjectRepository.existsBySubjectName(requestDto.getSubjectName())) {
                duplicatedNames.add(requestDto.getSubjectName());
            }
        }

        if (!duplicatedIds.isEmpty() && !duplicatedNames.isEmpty()) {
            throw new BusinessException(ResponseCode.ALREADY_EXISTED_MAPPINGSET,ResponseMessage.ALREADY_EXISTED_MAPPSET,HttpStatus.CONFLICT);
        }

        else if (!duplicatedIds.isEmpty()) {
            throw new BusinessException(ResponseCode.ALREADY_EXISTED_NUMMAPPING,ResponseMessage.ALREADY_EXISTED_NUMMAPP,HttpStatus.CONFLICT);
        }

        else if (!duplicatedNames.isEmpty()) {
            throw new BusinessException(ResponseCode.ALREADY_EXISTED_CLASSMAPPING,ResponseMessage.ALREADY_EXISTED_CLASSMAPP,HttpStatus.CONFLICT);
        }

        for (PostSubjectMappingRequestDto requestDto : dto) {
            Subject subject = new Subject(requestDto.getSubjectId(), requestDto.getSubjectName());
            subjectRepository.save(subject);
        }

        return new PostSubjectMappingResponseDto(ResponseCode.SUCCESS, ResponseMessage.SUCCESS_CLASS_CREATE);

    }

    public List<SubjectResponseDto> getMappingCodingZoneClass(String email) {

        boolean existedUser = userRepository.existsByEmail(email);
        // 전역 처리로 사용자 계정 오류 예외처리
        if (!existedUser)
            throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER,HttpStatus.NOT_FOUND);

        // 아직 DB에 어떠한 매핑 정보도 없을 때, 예외 처리
        if (!subjectRepository.existsBySubjectIdIsNotNull())
            throw new BusinessException(ResponseCode.NOT_ANY_MAPPINGSET, ResponseMessage.NOT_ANY_MAPPINGSET,HttpStatus.NOT_FOUND);

        List<Subject> subjectList = subjectRepository.findAll();// DB에서 꺼내서 Entity 리스트로 만든다음에
        return subjectList.stream()
                .map(subject -> new SubjectResponseDto(subject.getId(), subject.getSubjectName()))
                .toList(); // 바꾼 SubjectDto를 리스트 구조로 바꾸고
        // 즉, 그 각각의 Subject Entity의 집합을 Dto 집합으로 바꾸는 과정임
    }
}
