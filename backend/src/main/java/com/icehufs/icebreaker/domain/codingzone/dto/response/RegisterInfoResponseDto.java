package com.icehufs.icebreaker.domain.codingzone.dto.response;

public record RegisterInfoResponseDto(Integer registrationId, String userStudentNum, String userName, String userEmail,
                                      String className, Integer subjectId, String classTime, String assistantName, String attendance){
}
