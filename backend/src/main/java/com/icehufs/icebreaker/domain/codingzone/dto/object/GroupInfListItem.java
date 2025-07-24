package com.icehufs.icebreaker.domain.codingzone.dto.object;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.GroupInf;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.ArrayList;
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GroupInfListItem {
    
    private int classNum;
    private String assistantName; // 조교 이름
    private String groupId; // A,B 조
    private String classTime; // 수업 시작 시간
    private String weekDay; //요일
    private int maximumNumber; //최대인원
    private String className; //과목명
    private int subjectId; //학년

    public GroupInfListItem(GroupInf groupInfListEntity) {
        this.classNum = groupInfListEntity.getClassNum();
        this.assistantName = groupInfListEntity.getAssistantName();
        this.groupId = groupInfListEntity.getGroupId();
        this.classTime = groupInfListEntity.getClassTime();
        this.weekDay = groupInfListEntity.getWeekDay();
        this.maximumNumber = groupInfListEntity.getMaximumNumber();
        this.className = groupInfListEntity.getClassName();
        this.subjectId = groupInfListEntity.getSubjectId();
    }

    public static List<GroupInfListItem> getList(List<GroupInf> groupInfListEntities){
        List<GroupInfListItem> list = new ArrayList<>();
        for (GroupInf groupInfListEntity: groupInfListEntities){
            GroupInfListItem groupInfListItem = new GroupInfListItem(groupInfListEntity);
            list.add(groupInfListItem);
        }
        return list;
    }

}
