package com.icehufs.icebreaker.domain.codingzone.dto.object;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;


import java.util.ArrayList;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CodingZoneClassListItem {
    
    private int classNum;
    private String assistantName;
    private String classTime;
    private String classDate;
    private int currentNumber;
    private int maximumNumber;
    private String className;
    private String weekDay;
    private int subjectId;

    public CodingZoneClassListItem(CodingZoneClass codingZoneClass){
        this.classNum = codingZoneClass.getClassNum();
        this.assistantName = codingZoneClass.getAssistantName();
        this.classTime = codingZoneClass.getClassTime();
        this.weekDay = codingZoneClass.getWeekDay();
        this.maximumNumber = codingZoneClass.getMaximumNumber();
        this.className = codingZoneClass.getClassName();
        this.subjectId = codingZoneClass.getSubject().getId();
        this.classDate = codingZoneClass.getClassDate();
        this.currentNumber = codingZoneClass.getCurrentNumber();
    }

    public static List<CodingZoneClassListItem> getList(List<CodingZoneClass> CodingZoneClassListEntities){
        List<CodingZoneClassListItem> list = new ArrayList<>();
        for (CodingZoneClass codingZoneClass: CodingZoneClassListEntities){
            CodingZoneClassListItem codingZoneClassListItem = new CodingZoneClassListItem(codingZoneClass);
            list.add(codingZoneClassListItem);
        }
        return list;
    }
}
