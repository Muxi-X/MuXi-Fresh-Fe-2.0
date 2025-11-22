import React, { useEffect, useState } from 'react';
import HomePreview from './homePreview';
import HomeComment from './comment';
import './index.less';
import WriteComment from './writeComment';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { backType, cmtType, CommentType, TableType } from '../../../types';
import { message } from 'antd';
import { get, post } from '../../../../../fetch.ts';

const HomeworkJudge: React.FC = () => {
  const [Comment, setComment] = useState<CommentType[]>([]);
  const [SubmitID, setSubmitID] = useState<string>('');
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const infoItem = JSON.parse(
    decodeURI(searchParams.get('infoItem') as string),
  ) as TableType;
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (SubmitID) handleCommentRequest();
    if (!infoItem) {
      message.error('请先选择作业').then(null, null);
      setTimeout(() => {
        nav('/app/homework/admin/browse');
      }, 1000);
    }
  }, [SubmitID]);
  const handleCommentRequest = () => {
    get(`/task/submitted/${SubmitID}/comment`).then((res: backType<cmtType>) => {
      const comments = res.data?.comments.reverse();
      console.log(comments);
      comments && setComment(comments);
    }, null);
  };
  const handleSubmit = (e: string) => {
    post(`/task/submitted/${SubmitID}/comment`, {
      content: e,
    }).then(() => {
      message.success('评论已提交').then(null, null);
      handleCommentRequest();
    }, null);
  };
  const handleGetSubmittion = (str: string) => {
    setSubmitID(str);
  };
  return (
    <div className="judge-wrap">
      <div className="preview">
        <HomePreview getSubmittionID={handleGetSubmittion} info={infoItem}></HomePreview>
      </div>
      <div className="comment-write">
        <WriteComment
          style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
          onCommentSubmit={handleSubmit}
        ></WriteComment>
        <HomeComment
          style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
          CommentData={Comment}
          SubmitId={SubmitID}
        ></HomeComment>
      </div>
    </div>
  );
};

export default HomeworkJudge;
