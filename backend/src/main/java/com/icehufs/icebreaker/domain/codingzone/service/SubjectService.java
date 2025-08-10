package com.icehufs.icebreaker.domain.codingzone.service;

import java.util.*;
import java.util.stream.Collectors;
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
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    @Transactional
    public PostSubjectMappingResponseDto postMappingCodingZoneClass(List<PostSubjectMappingRequestDto> dto,
            String email) {

        boolean existedUser = userRepository.existsByEmail(email);
        if (!existedUser)
            throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER,HttpStatus.NOT_FOUND);

        Set<Integer> seenIds = new HashSet<>();
        Set<String>  seenNames = new HashSet<>();
        List<Integer> duplicatedIds = new ArrayList<>();
        List<String> duplicatedNames = new ArrayList<>();

        // 입력 리스트 중에서 중복 값 확인
        for (PostSubjectMappingRequestDto d : dto) {
            if (!seenIds.add(d.getSubjectId()))   duplicatedIds.add(d.getSubjectId());
            if (!seenNames.add(d.getSubjectName())) duplicatedNames.add(d.getSubjectName());
        }

        if (!duplicatedIds.isEmpty() && !duplicatedNames.isEmpty()) {
            throw new BusinessException(ResponseCode.DUPLICATED_MAPPING_SET,ResponseMessage.DUPLICATED_MAPPING_SET,HttpStatus.CONFLICT);
        }
        else if (!duplicatedIds.isEmpty()) {
            throw new BusinessException(ResponseCode.DUPLICATED_MAPPING_NUMBER,ResponseMessage.DUPLICATED_MAPPING_NUMBER,HttpStatus.CONFLICT);
        }
        else if (!duplicatedNames.isEmpty()) {
            throw new BusinessException(ResponseCode.DUPLICATED_MAPPING_CLASSNAME,ResponseMessage.DUPLICATED_MAPPING_CLASSNAME,HttpStatus.CONFLICT);
        }

        // DB 신규 등록 + DB 덮어씌우기
        Map<Integer, Subject> existingById = subjectRepository.findAllById(seenIds).stream()
                .collect(Collectors.toMap(Subject::getId, s -> s));

        int updatedMapping = 0;
        int createdMapping = 0;

        for (PostSubjectMappingRequestDto requestDto : dto) {
            Subject exist = existingById.get(requestDto.getSubjectId());
            // DB에 중복된 매핑 번호가 있을 때, 새로운 정보로 덮어쓰기
            if(exist != null) {
                exist.update(requestDto);
                updatedMapping++;
            }
            // DB에 중복된 매핑 번호가 없을 때, 모두 새로운 정보로 저장
            else {
                Subject subject = new Subject(requestDto.getSubjectId(), requestDto.getSubjectName());
                subjectRepository.save(subject);
                createdMapping++;
            }
        }

        if(updatedMapping > 0 && createdMapping == 0) { // DB에 덮어씌운 경우만
            return new PostSubjectMappingResponseDto(ResponseCode.SUCCESS_POST_MAPPING, ResponseMessage.SUCCESS_POST_MAPPING,null);
        }
        else if(updatedMapping == 0 && createdMapping > 0) { // 모두 신규 등록일 때
            return new PostSubjectMappingResponseDto(ResponseCode.SUCCESS_POST_MAPPING, ResponseMessage.SUCCESS_POST_MAPPING, null);
        } else { // 신규등록과 DB에 덮어씌운 경우 혼합
            return new PostSubjectMappingResponseDto(ResponseCode.SUCCESS_POST_MAPPING, ResponseMessage.SUCCESS_POST_MAPPING, null);
        }
    }


    public List<SubjectResponseDto> getMappingCodingZoneClass(String email) {

        boolean existedUser = userRepository.existsByEmail(email);
        // 전역 처리로 사용자 계정 오류 예외처리
        if (!existedUser)
            throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER,HttpStatus.NOT_FOUND);

        // 아직 DB에 어떠한 매핑 정보도 없을 때, 예외 처리
        if (!subjectRepository.existsByIdIsNotNull())
            throw new BusinessException(ResponseCode.NOT_ANY_MAPPINGSET, ResponseMessage.NOT_ANY_MAPPINGSET,HttpStatus.NOT_FOUND);

        List<Subject> subjectList = subjectRepository.findAll();
        return subjectList.stream()
                .map(subject -> new SubjectResponseDto(subject.getId(), subject.getSubjectName()))
                .toList();
    }
}
