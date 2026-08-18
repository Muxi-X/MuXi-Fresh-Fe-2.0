import React, { useMemo } from 'react';
import { Select } from 'antd';
import { generateYears } from '../../../../utils/GetYearSeason/getReviewYear';
import './index.less';

export type SemesterValue = {
  year: number;
  semester: string;
};

interface SemesterSelectorProps {
  value: SemesterValue;
  onChange: (value: SemesterValue) => void;
  className?: string;
}

// generateYears 的 value 形如 `${year}${season}`（season 为 spring/autumn），
// 拆分成后端 `/list/selected` 需要的 year + semester。
const parseYearSeason = (value: string): SemesterValue => {
  const year = Number(value.slice(0, 4));
  const semester = value.slice(4);
  return { year, semester };
};

const SemesterSelector: React.FC<SemesterSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const options = useMemo(() => generateYears(), []);
  const currentValue = `${value.year}${value.semester}`;

  return (
    <div className={`semester-selector ${className || ''}`}>
      <div className="semester-selector-title">选择学期</div>
      <Select
        value={currentValue}
        onChange={(v) => onChange(parseYearSeason(v))}
        options={options}
        className="semester-selector-select"
      />
    </div>
  );
};

export default SemesterSelector;
