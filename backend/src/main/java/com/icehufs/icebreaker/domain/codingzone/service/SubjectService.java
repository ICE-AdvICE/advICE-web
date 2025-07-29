package com.icehufs.icebreaker.domain.codingzone.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

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
    public PostSubjectMappingResponseDto  postMappingCodingZoneClass(List<PostSubjectMappingRequestDto> dto, String email){

        boolean existedUser = userRepository.existsByEmail(email);
        // 전역 처리로 사용자 계정 오류 예외처리
        if (!existedUser) throw new BusinessException("NOT_EXIST_USER", "사용자 계정이 존재하지 않습니다.", HttpStatus.NOT_FOUND); // 전역 예외처리로 중복 이메일 예외처리

        List<Integer> duplicatedIds = new ArrayList<>(); //중복 매핑 번호가 있을 경우, 중복된 매핑 번호가 담길 List
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
            throw new BusinessException("DUPLICATED_SUBJECTID_AND_SUBJECTNAME","이미 존재하는 코딩존 매핑 번호와 코딩존 교과목입니다. ", HttpStatus.CONFLICT);
        }

        else if (!duplicatedIds.isEmpty()) {
            throw new BusinessException("DUPLICATED_SUBJECTID","이미 존재하는 코딩존 매핑 번호입니다. ", HttpStatus.CONFLICT);
        }

        else if (!duplicatedNames.isEmpty()) {
            throw new BusinessException("DUPLICATED_SUBJECTNAME","이미 존재하는 코딩존 교과목 이름입니다. ", HttpStatus.CONFLICT);
        }


        for (PostSubjectMappingRequestDto requestDto : dto) {
            Subject subject = new Subject(requestDto.getSubjectId(), requestDto.getSubjectName());
            subjectRepository.save(subject);
        }

        return new PostSubjectMappingResponseDto("SU","코딩존 매핑을 성공했습니다!");
        
    }

    public List<SubjectResponseDto> getMappingCodingZoneClass(String email) {

        boolean existedUser = userRepository.existsByEmail(email);
        // 전역 처리로 사용자 계정 오류 예외처리
        if (!existedUser) throw new BusinessException("NOT_EXIST_USER", "사용자 계정이 존재하지 않습니다.", HttpStatus.NOT_FOUND); // 전역 예외처리로 중복 이메일 예외처리
        
        //아직 DB에 어떠한 매핑 정보도 없을 때, 예외 처리
        if (!subjectRepository.existsBySubjectIdIsNotNull())
            throw new BusinessException("NOT_EXIST_MAPPING", "아직 등록된 코딩존 교과목이 없습니다.", HttpStatus.NOT_FOUND);

        List<Subject> subjectList = subjectRepository.findAll();//DB에서 꺼내서 Entity 리스트로 만든다음에
        return subjectList.stream()
            .map(subject -> new SubjectResponseDto(subject.getSubjectId(), subject.getSubjectName())) //.map으로 Subject객체 하나를 SubjectDto로 변환
                .toList();  // 바꾼 SubjectDto를 리스트 구조로 바꾸고
                // 즉, 그 각각의 Subject Entity의 집합을 Dto 집합으로 바꾸는 과정임
    }
}

