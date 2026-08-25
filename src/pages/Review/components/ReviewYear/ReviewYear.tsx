import React, { useCallback, useMemo } from 'react';
import { YearSeason } from '../../ReviewFitler.ts';
import './ReviewYear.less';
import { Select } from 'antd';
import { generateYears } from '../../../../utils/GetYearSeason/getReviewYear.ts';

type ReviewYearProps = {
  changeYear(value: YearSeason): void;
};

const ReviewYear: React.FC<ReviewYearProps> = ({ changeYear }) => {
  const years = useMemo(() => generateYears(), []);

  const handleChange = useCallback(
    (value: YearSeason) => {
      changeYear(value);
    },
    [changeYear],
  );

  return (
    <div className="reviewYear">
      {years && (
        <Select
          defaultValue={years[0].value}
          style={{ width: '80%' }}
          onSelect={(value: string) => {
            handleChange(value as YearSeason);
          }}
          options={years}
        />
      )}
    </div>
  );
};

export default ReviewYear;
