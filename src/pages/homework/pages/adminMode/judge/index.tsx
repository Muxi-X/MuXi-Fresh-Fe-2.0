import React, { useEffect, useState } from 'react';
import HomePreview from './homePreview';
import HomeComment from './comment';
import './index.less';
import WriteComment from './writeComment';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { backType, cmtType, CommentType, TableType, userTaskResponseType, userTaskType } from '../../../types';
import { message, Select } from 'antd';
import { get, post } from '../../../../../fetch.ts';

const HomeworkJudge: React.FC = () => {
  const [Comment, setComment] = useState<CommentType[]>([]);
  const [SubmitID, setSubmitID] = useState<string>('');
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const infoItem = JSON.parse(
    decodeURI(searchParams.get('infoItem') as string),
  ) as TableType;

  const [submissionInfo,setSubmissionInfo]=useState<userTaskType[]>([]);
  const [version,setVersion]=useState<number>(1);
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    
    if (!infoItem) {
      message.error('请先选择作业').then(null, null);
      setTimeout(() => {
        nav('/app/homework/admin/browse');
      }, 1000);
    }
    if (SubmitID) handleCommentRequest();
    else{
      get(
        `/task/submitted?user_id=${infoItem?.user_id}&assigned_task_id=${infoItem?.task_id}`,
      ).then((res: backType<userTaskResponseType>) => {
        console.log(res.data.submission_infos)

        setSubmissionInfo(res.data.submission_infos)
        setSubmitID(res.data.submission_infos.length>0?res.data.submission_infos[version-1].submission_id || "":"")
        
      }, null);
    }
    
  }, [SubmitID]);
  
  const handleCommentRequest = () => {
    get(`/task/submitted/${SubmitID}/comment`).then((res: backType<cmtType>) => {
      const comments = res.data?.comments;
      console.log("comments",comments);
      comments?setComment(comments):setComment([]);
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
  

  //切换版本(value是版本数，index是value-1)
  function onChangeVersion(value:number){
    setVersion(value)
    setSubmitID(submissionInfo.length>0?submissionInfo[value-1].submission_id || "":"")
  }

  var versionList=submissionInfo.map((_,index)=>{
    var num=index+1
    return {
      value:num,
      label:"提交"+num
    }
  })

  return (
    <div className="judge-wrap">
      <Select className='select' onChange={onChangeVersion} options={versionList} defaultValue={1}></Select>
      <div className="preview">
        <HomePreview  info={infoItem} version={version} submissionInfo={submissionInfo}></HomePreview>
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
          onCommentSuccess={handleCommentRequest}
        ></HomeComment>
      </div>
    </div>
  );
};

export default HomeworkJudge;