import React, {useState, useEffect, CSSProperties} from 'react';
import './index.less';
import Selector from '../selector';
import UploadSection from '../uploadWrap';
import axiosInstance from '../../../services/interceptor';
import { taskListType, dataType, choiceType } from '../../../types';
import { message } from 'antd';
interface HomeworkSubmitProps {
    title?: string,
    choice?: choiceType,
    button_title?: string,
    className?: string,
    style?: CSSProperties
}
export const defData: dataType[] = [{
  key: '产品组', 
  value:"Product"
},{
  key: '设计组',
  value: "Design"
},{
  key:"前端组",
  value:'Frontend'
},{
  key:'后端组',
  value:'Backend'
}, {
  key:'安卓组',
  value:'Android'
}
]
const HomeworkSubmit: React.FC<HomeworkSubmitProps> = (props) => {
  const [selected, setselected] = useState<dataType>()
  const [loading, setLoading] = useState<boolean>(true)
  const [taskList, setTaskList] = useState<taskListType[]>([])
  const {title,button_title,choice, ...restProps} = props
  useEffect(() => {
    handleChange(defData[0])
  }, [])
  const handleSubmit = (query: any) => {
    axiosInstance.post(`/task/assigned?group=${selected?.value}`,query )
    .then(res=>{
      message.success('提交成功')
    }).catch(err=>{
      message.error(`提交失败:${err}`)
    });
  };
  const handleChange = (item: dataType) => {
    setselected(item)
    setLoading(true)
    axiosInstance.get(`/task/assigned/list?group=${item.value}`)
    .then(res=>{
      setTimeout(() => {
        setLoading(false)
      }, 200);
      if(res.data.data.titles)  {
        setTaskList(res.data.data.titles)
      } else {
        setTaskList([{id:'',text:'暂时没有作业'}])
      }
    })
  }
  return (
    <div id="homework-edit-wrap" {...restProps}>
      <Selector
        title="组别选择"
        data={defData}
        className="selector-edit"
        onChange={(item)=>handleChange(item as dataType)}
      ></Selector>
      <UploadSection  onSubmit={handleSubmit} choice={choice?choice:'edit'}  title={title?title:"修改作业"} button_title={button_title?button_title:"确认修改"} taskList={taskList} loading={loading}></UploadSection>
    </div>
  );
};

export default HomeworkSubmit;
