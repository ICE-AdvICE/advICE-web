package com.icehufs.icebreaker.domain.codingzone.dto.response;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.codingzone.dto.object.CodingZoneClassListItem;
import com.icehufs.icebreaker.common.ResponseDto;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;

import lombok.Getter;

@Getter
public class GetListOfCodingZoneClassForNotLogInResponseDto extends ResponseDto{
    private List<CodingZoneClassListItem> classList;

    private GetListOfCodingZoneClassForNotLogInResponseDto(List<CodingZoneClass> CodingZoneClassListEntities){
        super(ResponseCode.SUCCESS, ResponseMessage.SUCCESS);
        this.classList = CodingZoneClassListItem.getList(CodingZoneClassListEntities);
    }

    public static ResponseEntity<GetListOfCodingZoneClassForNotLogInResponseDto> success(List<CodingZoneClass> CodingZoneClassListEntities){
        GetListOfCodingZoneClassForNotLogInResponseDto result = new GetListOfCodingZoneClassForNotLogInResponseDto(CodingZoneClassListEntities);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    public static ResponseEntity<ResponseDto> notExistUser (){
        ResponseDto result = new ResponseDto(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }

    public static ResponseEntity<ResponseDto> noExistArticle(){
        ResponseDto result = new ResponseDto(ResponseCode.NOT_EXISTED_ARTICLE, ResponseMessage.NOT_EXISTED_ARTICLE);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }
}