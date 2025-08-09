package com.icehufs.icebreaker.domain.codingzone.dto.response;
public record CodingZoneClassInfoResponseDto(
        String classTime,
        String assistantName,
        String groupId,
        String classStatus,
        int classNum
) {}
