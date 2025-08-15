package com.icehufs.icebreaker.domain.codingzone.dto.object;

public record SubjectAttendanceListItem(
    String userStudentNum,
    String userName,
    String userEmail,
    int attendance,
    int absence
) {}