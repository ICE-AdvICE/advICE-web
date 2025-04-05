package com.icehufs.icebreaker.domain.article.service;

import org.springframework.http.ResponseEntity;

import com.icehufs.icebreaker.domain.article.dto.request.PatchArticleRequestDto;
import com.icehufs.icebreaker.domain.article.dto.request.PatchCommentRequestDto;
import com.icehufs.icebreaker.domain.article.dto.request.PostArticleRequestDto;
import com.icehufs.icebreaker.domain.article.dto.request.PostCommentRequestDto;
import com.icehufs.icebreaker.domain.article.dto.response.CheckArticleFavoriteResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.CheckOwnOfArticleResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.DeleteArticleAdminResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.DeleteArticleResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.DeleteCommentResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.GetArticleListResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.GetArticleResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.GetCommentListResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.GetRecentArticleNumDto;
import com.icehufs.icebreaker.domain.article.dto.response.GetUserArticleListResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.PatchArticleResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.PatchCommentResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.PostArticleResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.PostCommentResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.PutFavoriteResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.PutResolvedArticleResponseDto;

public interface ArticleService {

    ResponseEntity<? super PostArticleResponseDto> postArticle(PostArticleRequestDto dto, String email);
    ResponseEntity<? super PostArticleResponseDto> postArticleNotif(PostArticleRequestDto dto, String email);
    ResponseEntity<? super GetArticleResponseDto> getArticle(Integer articleNum);
    ResponseEntity<? super GetArticleListResponseDto> getArticleList();
    ResponseEntity<? super GetRecentArticleNumDto> getRecentArticleNum();
    ResponseEntity<? super GetUserArticleListResponseDto> getUserArticleList(String email);
    ResponseEntity<? super PatchArticleResponseDto> patchArticle(PatchArticleRequestDto dto, Integer articleNum, String email);
    ResponseEntity<? super CheckOwnOfArticleResponseDto> checkOwnArtcle(String email, Integer articleNum);
    ResponseEntity<? super DeleteArticleResponseDto> deleteArticle(Integer articleNum, String email);
    ResponseEntity<? super DeleteArticleAdminResponseDto> deleteArticleAdmin(Integer articleNum, String email);
    ResponseEntity<? super CheckArticleFavoriteResponseDto> checkFavorite(Integer articleNum, String email);
    ResponseEntity<? super PutResolvedArticleResponseDto> putResolv(Integer articleNum, String email);
    ResponseEntity<? super PutFavoriteResponseDto> putFavorite(Integer articleNum, String email);
    String postComment(PostCommentRequestDto dto, Integer articleNum, String email);
    ResponseEntity<? super GetCommentListResponseDto> GetCommentList(Integer articleNum);
    ResponseEntity<? super PatchCommentResponseDto> patchComment(PatchCommentRequestDto requestBody, Integer commentNumber, String email);
    ResponseEntity<? super DeleteCommentResponseDto> deleteComment(Integer commentNumber, String email);

}