package com.icehufs.icebreaker.domain.codingzone.dto.object;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReservedClassListItem {

    private Integer registrationId;
    private String userStudentNum;
    private String userName;
    private String userEmail;
    private String className;
    private int subjectId;
    private String classTime;
    private String assistantName;
    private String attendance;

    public ReservedClassListItem(ReservedClassListItem other){
        this.className = other.className;
        this.registrationId = other.registrationId;
        this.subjectId = other.subjectId;
        this.classTime = other.classTime;
        this.assistantName = other.assistantName;
        this.attendance = other.attendance;
        this.userStudentNum = other.userStudentNum;
        this.userName = other.userName;
        this.userEmail = other.userEmail;
    }

    public ReservedClassListItem(CodingZoneClass codingZoneClass, CodingZoneRegister codingZoneRegister){
        this.className = codingZoneClass.getClassName();
        this.registrationId = codingZoneRegister.getRegistrationId();
        this.classTime = codingZoneClass.getClassTime();
        this.assistantName = codingZoneClass.getAssistantName();
        this.attendance = codingZoneRegister.getAttendance();
        this.userStudentNum = codingZoneRegister.getUserStudentNum();
        this.userName = codingZoneRegister.getUserName();
        this.userEmail = codingZoneRegister.getUserEmail();
    }

    public static List<ReservedClassListItem> getList(List<ReservedClassListItem> reservedClassListItems) {
        List<ReservedClassListItem> list = new ArrayList<>();
        for (ReservedClassListItem item : reservedClassListItems) {
            list.add(new ReservedClassListItem(item));
        }
        return list;
    }


    
}
