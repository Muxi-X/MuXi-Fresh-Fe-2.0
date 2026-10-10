import React, { useState } from 'react';
import { TaskInfoType } from '../../../types';
import { postWithMsg } from '../../../../../fetch.ts';
import { message, UploadProps } from 'antd';
import { root } from '../../../utils/deData.ts';
import FileLink from '../../../components/files';
import Uploader from '../../../components/upload';
import CodePenInput from '../../../components/codepen';
import { isCodePenUrl } from '../../../utils/codepen';
import {
  isValidAttachmentUrl,
  normalizeAttachmentUrls,
} from '../../../utils/attachmentUrls';

interface SubmitBeforeJudgeMobileProps {
  currentTaskID: string | undefined;
  currentTaskInfo: TaskInfoType | undefined;
  uploadHistory: string[] | undefined;
  group?: string;
}
const SubmitCompMobile: React.FC<SubmitBeforeJudgeMobileProps> = (props) => {
  const [formData, setFormData] = useState<string[]>();
  const [uploadPending, setUploadPending] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const { currentTaskInfo, uploadHistory, currentTaskID, group } = props;
  const handleSubmit = () => {
    if (!currentTaskID) {
      message.error('暂时还没有作业哦').then(null, null);
      return;
    }
    if (uploadPending) {
      message.error('附件仍在上传，请稍后提交').then(null, null);
      return;
    }
    if (uploadFailed) {
      message.error('存在上传失败的附件，请删除失败项或重新上传').then(null, null);
      return;
    }
    const urls = formData ?? [];
    if (urls.some((url) => !isValidAttachmentUrl(url))) {
      message.error('存在无效附件，请重新上传').then(null, null);
      return;
    }
    if (group === 'Frontend' && (!formData?.[0] || !isCodePenUrl(formData[0]))) {
      message.error('请填写正确的 CodePen 链接').then(null, null);
      return;
    }
    postWithMsg(`/task/submitted`, {
      assignedTaskID: currentTaskID,
      urls,
    })
      .then(() => {
        message.success('提交成功').then(null, null);
      })
      .catch((error: unknown) => {
        message
          .error(error instanceof Error ? error.message : '提交失败')
          .then(null, null);
      });
  };

  const handleChangeUpload = (e: UploadProps['fileList']) => {
    setUploadPending(Boolean(e?.some((item) => item.status === 'uploading')));
    setUploadFailed(Boolean(e?.some((item) => item.status === 'error')));
    setFormData(normalizeAttachmentUrls(e, root));
  };
  return (
    <>
      <div className={'mobile-bef-wrap'}>
        <div className="user-mobile-submit">
          <div className={'task-title-wrap-mobile'}>
            <div className={'img-wrap '}>
              <img
                alt={''}
                src={'https://s2.loli.net/2023/08/31/C3fgIyNxX6sAkRF.png'}
                className={'task-title-mobile-img'}
              ></img>
            </div>
            <h3>{currentTaskInfo?.title_text}</h3>
          </div>
          <div className={'textbox-mobile'}>{[currentTaskInfo?.content]}</div>
          <FileLink
            className="file-file-mobile"
            title={'附件:'}
            data={currentTaskInfo?.urls}
          ></FileLink>
        </div>
        <div className="user-mobile-submit">
          <div className="user-mobile-drop">
            {group === 'Frontend' ? (
              <>
                <CodePenInput
                  defaultValue={uploadHistory?.[0] || ''}
                  onChange={(url) => setFormData(url ? [url] : [''])}
                />
              </>
            ) : (
              <>
                {'作业附件 :'}
                <Uploader
                  mobile
                  onChange={handleChangeUpload}
                  defaultList={uploadHistory}
                ></Uploader>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="user-submit-button" onClick={handleSubmit}>
        提交作业
      </div>
    </>
  );
};
export default SubmitCompMobile;
