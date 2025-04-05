package com.icehufs.icebreaker.util;

import lombok.Getter;

@Getter
public class ResponseDto<T> {
	private final String code;
	private final String message;
	private T data;

	public ResponseDto(String code, String message, T data) {
		this.code = code;
		this.message = message;
		this.data = data;
	}

	public static <T> ResponseDto<T> success() {
		return new ResponseDto<>("SU", "Success.", null);
	}

	public static <T> ResponseDto<T> success(String message) {
		return new ResponseDto<>("SU", message, null);
	}

	public static <T> ResponseDto<T> success(T data) {
		return new ResponseDto<>("SU", "Success", data);
	}

	public static <T> ResponseDto<T> success(String message, T data) {
		return new ResponseDto<>("SU", message, data);
	}

	public static <T> ResponseDto<T> success(String code, String message) {
		return new ResponseDto<>(code, message, null);
	}

	public static <T> ResponseDto<T> fail(String code, String message) {
		return new ResponseDto<>(code, message, null);
	}

	public static <T> ResponseDto<T> fail(String code, String message, T data) {
		return new ResponseDto<>(code, message, data);
	}
}
