package com.icehufs.icebreaker.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResponseDto { //모든 response에 대한 code와 message 구현

    private String code;
    private String message;

    public ResponseDto() {
        this.code = ResponseCode.SUCCESS;
        this.message = ResponseMessage.SUCCESS;
    }

    public ResponseDto(String response) {
        this.code = ResponseCode.SUCCESS;
        this.message = response;
    }

    public static ResponseEntity<ResponseDto> databaseError(){
    ResponseDto responseBody = new  ResponseDto(ResponseCode.DATABASE_ERROR, ResponseMessage.DATABASE_ERROR);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseBody);
    }

    public static ResponseEntity<ResponseDto> validationFailed(){
    ResponseDto responseBody = new  ResponseDto(ResponseCode.VALIDATION_FAILED, ResponseMessage.VALIDATION_FAILED);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
    }
    
}
