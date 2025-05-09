package com.icehufs.icebreaker.exception;

import java.sql.SQLException;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.icehufs.icebreaker.util.ResponseDto;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ResponseDto<Void>> handleBusinessException(BusinessException e) {
		log.warn("[비즈니스 로직 에러 발생] {}", e.getMessage());
		return ResponseEntity
			.status(e.getStatus())
			.body(ResponseDto.fail(e.getCode(), e.getMessage()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ResponseDto<Void>> handleUnexpectedException(Exception e) {
		log.warn("[비즈니스에서 잡지 못하는 에러 발생] {}", e.getMessage());
		return ResponseEntity
			.status(HttpStatus.INTERNAL_SERVER_ERROR) // ex.getStatus()는 HttpStatus 반환하도록 정의
			.body(ResponseDto.fail("IE", "서버 내부 오류가 발생했습니다."));
	}

	@ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
	public ResponseEntity<ResponseDto<Void>> handleValidationException(Exception e){
		log.warn("[요청 HTTP BODY 검증 에러] {}", e.getMessage());

		return ResponseEntity
			.status(HttpStatus.BAD_REQUEST)
			.body(ResponseDto.fail("VF", "Validation failed."));
	}

	@ExceptionHandler({ DataAccessException.class, SQLException.class })
	public ResponseEntity<ResponseDto<Void>> handleDatabaseException(Exception e) {
		log.warn("[DB 에러] {}", e.getMessage());
		return ResponseEntity
			.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(ResponseDto.fail("DBE", "Database error."));
	}
}
