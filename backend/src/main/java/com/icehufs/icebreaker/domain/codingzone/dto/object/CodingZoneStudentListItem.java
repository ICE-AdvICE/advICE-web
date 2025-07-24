package com.icehufs.icebreaker.domain.codingzone.dto.object;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CodingZoneStudentListItem {

    private Integer registrationId;
    private String userStudentNum;
    private String userName;
    private String userEmail;
    private String className;
    private String classDate;
    private String classTime;
    private String assistantName;
    private String attendance;
    private int subjectId;

    public CodingZoneStudentListItem(CodingZoneStudentListItem other){
        this.className = other.className;
        this.registrationId = other.registrationId;
        this.classDate = other.classDate;
        this.classTime = other.classTime;
        this.assistantName = other.assistantName;
        this.attendance = other.attendance;
        this.userStudentNum = other.userStudentNum;
        this.userName = other.userName;
        this.userEmail = other.userEmail;
        this.subjectId = other.getSubjectId();
    }

    public CodingZoneStudentListItem(CodingZoneClass codingZoneClass, CodingZoneRegister codingZoneRegister){
        this.className = codingZoneClass.getClassName();
        this.registrationId = codingZoneRegister.getRegistrationId();
        this.classDate = codingZoneClass.getClassDate();
        this.classTime = codingZoneClass.getClassTime();
        this.assistantName = codingZoneClass.getAssistantName();
        this.attendance = codingZoneRegister.getAttendance();
        this.userStudentNum = codingZoneRegister.getUserStudentNum();
        this.userName = codingZoneRegister.getUserName();
        this.userEmail = codingZoneRegister.getUserEmail();
        this.subjectId = codingZoneClass.getSubjectId();
    }

    public static List<CodingZoneStudentListItem> getList(List<CodingZoneStudentListItem> codingZoneStudentListItems) {
        List<CodingZoneStudentListItem> list = new ArrayList<>();
        for (CodingZoneStudentListItem item : codingZoneStudentListItems) {
            list.add(new CodingZoneStudentListItem(item));
        }
        return list;
    }
}
