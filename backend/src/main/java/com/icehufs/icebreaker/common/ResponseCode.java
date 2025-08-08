package com.icehufs.icebreaker.common;

public interface ResponseCode {
    // HTTP Status 200
    String SUCCESS = "SU";
    String CODING_ADMIN = "CA";
    String ENTIRE_ADMIN = "EA";

    // HTTP Status 400
    String VALIDATION_FAILED = "VF";
    String DUPLICATE_EMAIL = "DE";
    String NOT_EXISTED_USER = "NU";
    String NOT_EXISTED_ARTICLE = "NA";
    String NOT_EXISTED_COMMET = "NC";
    String FULL_CLASS = "FC";
    String ALREADY_RESERVE = "AR";
    String NOT_RESERVE_CLASS = "NR";
    String NOT_SIGNUP_USER = "NS";
    String PERMITTED_ERROR = "PE";
    String BAD_REQUEST = "BR";
    String ALREADY_EXISTED_CLASS = "ALREADY_EXISTED_CLASS";
    String NOT_MAPPED_CLASS = "NOT_MAPPED_CLASS";
    String ALREADY_EXISTED_CLASSMAPPING = "ALREADY_EXISTED_CLASSMAPPING";
    String ALREADY_EXISTED_NUMMAPPING = "ALREADY_EXISTED_NUMMAPPING";
    String ALREADY_EXISTED_MAPPINGSET = "ALREADY_EXISTED_MAPPINGSET";
    String NOT_ANY_MAPPINGSET = "NOT_ANY_MAPPINGSET";
    String NOT_WEEKDAY = "NOT_WEEKDAY";
    String TUTOR_NOT_FOUND = "TNF";
    String INVALID_SUBJECT_ID = "ISI";
    String DUPLICATE_PASSWORD = "DP";
    String NOT_FOUND_GROUP = "NOT_FOUND_GROUP";
    String NOT_MODIFIED_INFO = "NO_NEW_INFO";
    String ALREADY_POST_CLASS = "ALREADY_POST_CLASS";


    // HTTP Status 401
    String SIGN_IN_FAIL = "SF";
    String AUTHORIZATION_FAIL = "AF";

    // HTTP Status 403
    String NO_PERMISSION = "NP";
    String BANNED_USER = "BU";
    String ACCESS_TOKEN_EXPIRED = "ATE";

    // HTTP Status 404
    String SUCCESS_BUT_NOT = "SN";
    String WITHDRAWN_EMAIL = "WDE";

    // HTTP Status 500
    String MAIL_FAIL = "MF";
    String DATABASE_ERROR = "DBE";
    String INTERNAL_SERVER_ERROR = "ISE";

    String DOES_NOT_MATCH_EMAIL = "DNME";
}
