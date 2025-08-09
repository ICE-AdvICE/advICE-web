package com.icehufs.icebreaker.domain.codingzone.dto.request;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.validation.annotation.Validated;

import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
public class CodingZoneClassUpdateRequestDto {

    @NotBlank
    private String assistantName;

    @NotBlank
    private String classTime;

    @NotBlank
    private String classDate;

    @NotBlank
    private String weekDay;

    @NotNull
    private String groupId;

    @NotNull
    @Min(1)
    private Integer maximumNumber;

    @NotNull
    private String className;

    @NotNull
    private int subjectId;

    public boolean isSameEntity(CodingZoneClass codingZoneClass) {
        return Objects.equals(this.assistantName, codingZoneClass.getAssistantName()) &&
                Objects.equals(this.classTime, codingZoneClass.getClassTime()) &&
                Objects.equals(this.classDate, codingZoneClass.getClassDate()) &&
                Objects.equals(this.maximumNumber, codingZoneClass.getMaximumNumber()) &&
                Objects.equals(this.className, codingZoneClass.getClassName()) &&
                Objects.equals(this.weekDay, codingZoneClass.getWeekDay());
    }
}

