import React, { useState,HTMLAttributes,useEffect } from 'react';
import './index.less';
import { dataType } from '../../../types';

interface SelectorProps {
  title: string;
  data: dataType[];
  className?: string;
  onChange?: (item: dataType) => void;
}

const Selector: React.FC<
  SelectorProps & Omit<HTMLAttributes<HTMLDivElement>, 'className'>
> = (props) => {
  const { title, className, data, onChange, ...restProps } = props;
  const [selected, setSelected] = useState<dataType>(data[0])
  useEffect(() => {
    onChange && onChange(data[0])
  }, [])
  return (
    <>
      <div className={'selector-wrap ' + (className as string)} {...restProps}>
        <div className="selector-title">
          <div className="selector-title-text">{title}</div>
        </div>
        {data.map((item, index) => {
          return (
            <li
              className={item.value===selected.value?"selector-item selected":"selector-item"}
              key={item + index.toString(10)}
              onClick={()=>{
                onChange && onChange(item)
                setSelected(item)
              }}
            >
              <div className="selector-item-text">{item.key}</div>
            </li>
          )
        })}
      </div>
    </>
  );
};

export default Selector;
