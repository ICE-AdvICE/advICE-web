package com.icehufs.icebreaker.domain.article.service.implement;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
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
import com.icehufs.icebreaker.common.ResponseDto;
import com.icehufs.icebreaker.domain.article.domain.entity.Article;
import com.icehufs.icebreaker.domain.article.domain.type.ArticleCategoryEnum;
import com.icehufs.icebreaker.domain.article.domain.entity.Comment;
import com.icehufs.icebreaker.domain.article.domain.entity.Favorite;
import com.icehufs.icebreaker.domain.article.repository.ArticleRepository;
import com.icehufs.icebreaker.domain.article.repository.ArtileListViewRepository;
import com.icehufs.icebreaker.domain.article.repository.CommentRepository;
import com.icehufs.icebreaker.domain.article.repository.FavoriteRepository;
import com.icehufs.icebreaker.domain.membership.repository.UserRepository;
import com.icehufs.icebreaker.domain.article.service.ArticleService;
import com.icehufs.icebreaker.exception.BusinessException;
import com.icehufs.icebreaker.util.EncryptionUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArticleServiceImplement implements ArticleService {

    private final ArtileListViewRepository artileListViewRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final FavoriteRepository favoriteRepository;
    
    @Override
    public ResponseEntity<? super PostArticleResponseDto> postArticle(PostArticleRequestDto dto, String email){
        try{
            // 사용자 계정이 존재하는지 확인하는 코드
            boolean existedEmail = userRepository.existsByEmail(email);
            if (!existedEmail) return PostArticleResponseDto.notExistUser();
            
            // 이메일 복호화 후 이메일 DB에 저장
            String encryptedEmail = EncryptionUtil.encrypt(email);
            Article articleEntity = new Article(dto, encryptedEmail); 

            //공지 게시글일때
            if (articleEntity.getCategory() == ArticleCategoryEnum.NOTIFICATION) return PostArticleResponseDto.validationFailed();

            articleRepository.save(articleEntity);

        }catch (Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return PostArticleResponseDto.success();
    }
    

    @Override
    public ResponseEntity<? super GetArticleResponseDto> getArticle(Integer articleNum) {
        Article articleEntity = null;

        try {
            articleEntity = articleRepository.findByArticleNum(articleNum);
            if (articleEntity == null) return GetArticleResponseDto.noExistArticle();
            articleEntity.IncreaseViewCount();
            articleRepository.save(articleEntity);
        } catch (Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetArticleResponseDto.success(articleEntity);
    }


    @Override
    public ResponseEntity<? super GetArticleListResponseDto> getArticleList() {
        List<Article> articleListViewEntities = new ArrayList<>();
        try{
            articleListViewEntities = artileListViewRepository.findAll();
        }catch(Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetArticleListResponseDto.success(articleListViewEntities);
    }

    @Override
    public ResponseEntity<? super GetRecentArticleNumDto> getRecentArticleNum() {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        long count = articleRepository.countByArticleDateAfter(oneWeekAgo);
        return GetRecentArticleNumDto.success(count);
    }


    @Override
    public ResponseEntity<? super PutFavoriteResponseDto> putFavorite(Integer articleNum, String email) {

        Article articleEntity = null;
        try {
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser) return PutFavoriteResponseDto.notExistUser();

            articleEntity = articleRepository.findByArticleNum(articleNum);
            if (articleEntity == null) return PutFavoriteResponseDto.noExistArticle();

            Favorite favorite = favoriteRepository.findByArticleNumAndUserEmail(articleNum, email);
            if (favorite == null){
                favorite = new Favorite(email, articleNum);
                favoriteRepository.save(favorite);
                articleEntity.IncreaseFavoriteCount();
            }
            else{
                favoriteRepository.delete(favorite);
                articleEntity.decreaseFavoriteCount();
            }
            articleRepository.save(articleEntity);
        }catch (Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return PutFavoriteResponseDto.success();
    }


    @Override
    public String postComment(PostCommentRequestDto dto, Integer articleNum, String email) {

        boolean existedArticle = articleRepository.existsByArticleNum(articleNum);
        if (!existedArticle) throw new BusinessException(ResponseCode.NOT_EXISTED_ARTICLE, ResponseMessage.NOT_EXISTED_ARTICLE, HttpStatus.BAD_REQUEST);

        // 사용자 계정이 존재하는지(로그인시간이 초과 됐는지) 확인하는 코드
        boolean existedUser = userRepository.existsByEmail(email);
        if(!existedUser) throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER, HttpStatus.UNAUTHORIZED);

        // 이메일 암호화 처리
        String encryptedEmail = EncryptionUtil.encrypt(email);
        Comment comment = new Comment(dto, articleNum, encryptedEmail);
        commentRepository.save(comment);

        return "성공적으로 댓글을 작성했습니다.";
    }


    @Override
    public ResponseEntity<? super GetCommentListResponseDto> GetCommentList(Integer articleNum) {
        List<Comment> resultSets = new ArrayList<>();

        try{
            boolean existedArticle = articleRepository.existsByArticleNum(articleNum);
            if(!existedArticle) return GetCommentListResponseDto.noExistArticle();

            resultSets = commentRepository.findByArticleNumOrderByWriteDatetimeDesc(articleNum);
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }

        return GetCommentListResponseDto.success(resultSets);
    }


    @Override
    public ResponseEntity<? super DeleteArticleResponseDto> deleteArticle(Integer articleNum, String email) {
        try{
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser) return DeleteArticleResponseDto.notExistUser();

            Article articleEntity = articleRepository.findByArticleNum(articleNum);
            if (articleEntity == null) return DeleteArticleResponseDto.noExistArticle();

            // 일치 여부를 확인하기 위한 게시글 이메일 복호화 처리
            String decryptedWriterEmail = EncryptionUtil.decrypt(articleEntity.getUserEmail());
            boolean isWriter = decryptedWriterEmail.equals(email);
            if (!isWriter) return DeleteArticleResponseDto.noPermission();

            commentRepository.deleteByArticleNum(articleNum);
            favoriteRepository.deleteByArticleNum(articleNum);

            articleRepository.delete(articleEntity);


        }catch(Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }

        return DeleteArticleResponseDto.success();
    }


    @Override
    public ResponseEntity<? super DeleteCommentResponseDto> deleteComment(Integer commentNumber, String email) {
        try{

            // 사용자 계정이 존재하는지(로그인시간이 초과 됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email); 
            if (!existedUser) return DeleteCommentResponseDto.notExistUser();

            // 댓글이 존재하지않는 경우
            Comment comment = commentRepository.findByCommentNumber(commentNumber);
            if (comment == null) return DeleteCommentResponseDto.noExistComment();

            // 일치 여부를 확인하기 위한 댓글 이메일 복호화 처리
            String decryptedWriterEmail = EncryptionUtil.decrypt(comment.getUserEmail());
            boolean isWriter = decryptedWriterEmail.equals(email);
            if (!isWriter) return DeleteArticleResponseDto.noPermission();

            commentRepository.delete(comment);


        }catch(Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }

        return DeleteCommentResponseDto.success();
    }


    @Override
    public ResponseEntity<? super PatchArticleResponseDto> patchArticle(PatchArticleRequestDto dto, Integer articleNum, String email) {
        try{
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser) return PatchArticleResponseDto.notExistUser();

            Article articleEntity = articleRepository.findByArticleNum(articleNum);
            if(articleEntity == null) return PatchArticleResponseDto.noExistArticle();

            // 일치 여부를 확인하기 위한 게시글 이메일 복호화 처리
            String decryptedWriterEmail = EncryptionUtil.decrypt(articleEntity.getUserEmail());
            boolean isWriter = decryptedWriterEmail.equals(email);
            if (!isWriter) return PatchArticleResponseDto.noPermission();

            articleEntity.patchArticle(dto);
            articleRepository.save(articleEntity);

        }catch(Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        
        return PatchArticleResponseDto.success();
    }


    @Override
    public ResponseEntity<? super PatchCommentResponseDto> patchComment(PatchCommentRequestDto dto, Integer commentNumber, String email){
        try{
            // 사용자 계정이 존재하는지(로그인시간이 초과 됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser) return PatchCommentResponseDto.notExistUser();

            Comment comment = commentRepository.findByCommentNumber(commentNumber);

            // 일치 여부를 확인하기 위한 댓글 이메일 복호화 처리
            String decryptedWriterEmail = EncryptionUtil.decrypt(comment.getUserEmail());
            boolean isWriter = decryptedWriterEmail.equals(email);
            if (!isWriter) return PatchArticleResponseDto.noPermission();

            comment.patchComment(dto);
            commentRepository.save(comment);

        }catch(Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        
        return PatchCommentResponseDto.success();
    }


    @Override
    public ResponseEntity<? super GetUserArticleListResponseDto> getUserArticleList(String email) {

        List<Article> articleListViewEntities = new ArrayList<>();

        try{

            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser) return GetUserArticleListResponseDto.noExistUser();

            String encryptedEmail = EncryptionUtil.encrypt(email);
            articleListViewEntities = artileListViewRepository.findByUserEmailOrderByArticleDateDesc(encryptedEmail);

        }catch(Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetUserArticleListResponseDto.success(articleListViewEntities);
    }

    @Override
    public ResponseEntity<? super CheckOwnOfArticleResponseDto> checkOwnArtcle(String email, Integer articleNum) {
        try{
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser) return CheckOwnOfArticleResponseDto.notExistUser();

            Article articleEntity = articleRepository.findByArticleNum(articleNum);
            if(articleEntity == null) return CheckOwnOfArticleResponseDto.noExistArticle();

            // 일치 여부를 확인하기 위한 게시글 이메일 복호화 처리
            String decryptedWriterEmail = EncryptionUtil.decrypt(articleEntity.getUserEmail());
            boolean isWriter = decryptedWriterEmail.equals(email);
            if (!isWriter) return CheckOwnOfArticleResponseDto.noPermission();

        }catch(Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        
        return CheckOwnOfArticleResponseDto.success();
    }
    
    @Override
    public ResponseEntity<? super CheckArticleFavoriteResponseDto> checkFavorite(Integer articleNum, String email) {
        try {
            Favorite favorite = favoriteRepository.findByArticleNumAndUserEmail(articleNum, email);
            if (favorite == null) return CheckArticleFavoriteResponseDto.notFavorite();

        }catch (Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return CheckArticleFavoriteResponseDto.success();
    }


    @Override
    public ResponseEntity<? super DeleteArticleAdminResponseDto> deleteArticleAdmin(Integer articleNum, String email) {
        try{
            // 사용자 계정이 존재하는지(로그인시간이 초과 됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser) return CheckOwnOfArticleResponseDto.notExistUser();

            Article articleEntity = articleRepository.findByArticleNum(articleNum);
            if (articleEntity == null) return DeleteArticleAdminResponseDto.noExistArticle();

            commentRepository.deleteByArticleNum(articleNum);
            favoriteRepository.deleteByArticleNum(articleNum);
            articleRepository.delete(articleEntity);

        }catch(Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }

        return DeleteArticleAdminResponseDto.success();
    }


    @Override
    public ResponseEntity<? super PutResolvedArticleResponseDto> putResolv(Integer articleNum, String email) {
        Article articleEntity = null;
        try {
            // 사용자 계정이 존재하는지(로그인시간이 초과 됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser) return CheckOwnOfArticleResponseDto.notExistUser();

            articleEntity = articleRepository.findByArticleNum(articleNum);
            if (articleEntity == null) return PutResolvedArticleResponseDto.noExistArticle();

            articleEntity.putResolv();
            articleRepository.save(articleEntity);

        }catch (Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return PutResolvedArticleResponseDto.success();
    }


    @Override
    public ResponseEntity<? super PostArticleResponseDto> postArticleNotif(PostArticleRequestDto dto, String email) {
        try{
            // 사용자 계정이 존재하는지(로그인시간이 초과 됐는지) 확인하는 코드
            boolean existedEmail = userRepository.existsByEmail(email);
            if (!existedEmail) return PostArticleResponseDto.notExistUser();

            // 이메일 암호화 처리
            String encryptedEmail = EncryptionUtil.encrypt(email);
            Article articleEntity = new Article(dto, encryptedEmail);

            //공지 게시글 아닐때
            if (articleEntity.getCategory() == ArticleCategoryEnum.GENERAL || articleEntity.getCategory() == ArticleCategoryEnum.REQUEST) {
                return PostArticleResponseDto.validationFailed();
            }

            articleRepository.save(articleEntity);

        }catch (Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return PostArticleResponseDto.success();
    }
}