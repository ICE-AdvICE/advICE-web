package com.icehufs.icebreaker.domain.codingzone.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.DayOfWeek;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassAssignRequestDto;
import com.icehufs.icebreaker.exception.BusinessException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Entity(name = "codingzoneclass")
@Table(name = "codingzoneclass")
public class CodingZoneClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_num")
    private int classNum;

    @Column(name = "assistant_name")
    private String assistantName;

    @Column(name = "class_time")
    private String classTime;

    @Column(name = "class_date")
    private String classDate;

    @Column(name = "current_number")
    private int currentNumber;

    @Column(name = "maximum_number")
    private int maximumNumber;

    @Column(name = "class_name")
    private String className;

    @Column(name = "week_day")
    private String weekDay;

    @Column(name = "subject_id")
    private int subjectId;

    @Column(name = "group_id")
    private String groupId;

    public CodingZoneClass(CodingZoneClassAssignRequestDto dto) {

        isDateWeekend(dto.getClassDate());
        this.assistantName = dto.getAssistantName();
        this.classTime = dto.getClassTime();
        this.classDate = dto.getClassDate();
        this.currentNumber = 0;
        this.maximumNumber = dto.getMaximumNumber();
        this.className = dto.getClassName();
        this.weekDay = dto.getWeekDay();
        this.subjectId = dto.getSubjectId();
        this.groupId = dto.getGroupId();
    }

    public void increaseNum(Integer maximumNumberInCLass) {
        if (this.currentNumber > maximumNumberInCLass) {
            throw new BusinessException(ResponseCode.FULL_CLASS, ResponseMessage.FULL_CLASS, HttpStatus.BAD_REQUEST);
        }
        this.currentNumber++;
    }

    public void decreaseCurrentNum() {
        if (this.currentNumber < 0) {
            throw new BusinessException(ResponseCode.INTERNAL_SERVER_ERROR, ResponseMessage.INTERNAL_SERVER_ERROR,
                    HttpStatus.BAD_REQUEST);
        }
        this.currentNumber--;
    }

    // Dto로 받은 날짜가 주말이면 예외처리
    private void isDateWeekend(String dateString) { // Entity 생성 시에만 사용되므로(외부 사용 X)private 설정
        LocalDate date = LocalDate.parse(dateString);
        DayOfWeek day = date.getDayOfWeek();
        if ((day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY))
            throw new BusinessException("BR", "입력한 날짜는 주말입니다, 다시 입력해주세요.", HttpStatus.BAD_REQUEST);
    }
}
