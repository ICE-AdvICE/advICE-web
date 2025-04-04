package com.icehufs.icebreaker.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {

	private final String code;         // 응답용 에러 코드 (예: "NE", "DE", "DBE")
	private final HttpStatus status;   // HTTP 상태 코드 (예: 400, 403, 500)

	public BusinessException(String code, String message, HttpStatus status) {
		super(message);
		this.code = code;
		this.status = status;
	}
}
