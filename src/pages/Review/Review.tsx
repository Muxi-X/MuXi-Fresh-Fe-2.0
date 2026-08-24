import './Review.less';
import { useEffect, useState } from 'react';
import { post, postBlob } from '../../fetch.ts';
import { ReviewList, ReviewRow } from './ReviewList.ts';
import ReviewYear from './components/ReviewYear/ReviewYear.tsx';
import { Group, ReviewFilter, Season, YearSeason } from './ReviewFitler.ts';
import ReviewGroupSelect from './components/ReviewGroupSelect/ReviewGroupSelect.tsx';
import ReviewTable from './components/ReviewTable/ReviewTable.tsx';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCurrentSeason } from '../../utils/GetYearSeason/getReviewYear.ts';

const PAGE_SIZE = 20;

const Review = () => {
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>({
    grade: '',
    group: Group.Product,
    school: '',
    season: getCurrentSeason(),
    status: '',
    year: new Date().getFullYear(),
  });
  const [reviewList, setReviewList] = useState<ReviewRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  const navigate = useNavigate();

  const changeYear = (value: YearSeason) => {
    if (value) {
      setReviewFilter((preReviewFilter) => ({
        ...preReviewFilter,
        year: Number(value.slice(0, 4)),
        season: value.slice(4) as Season,
      }));
      setPage(1);
    }
  };

  const changeGroup = (group: Group) => {
    setReviewFilter((preReviewFilter) => ({
      ...preReviewFilter,
      group: group,
    }));
    setPage(1);
  };

  useEffect(() => {
    setLoading(true);
    post('/review/', { ...reviewFilter, page, page_size: PAGE_SIZE })
      .then((r: ReviewList) => {
        const { rows, total } = r.data;
        setReviewList(rows);
        setTotal(total);
        setLoading(false);
      })
      .catch((e: Error) => {
        setLoading(false);
        if (Number(e.message) === 10003) {
          void message.error('您无此权限，请退出！').then(() => {
            navigate('/app');
          });
        } else {
          void message.error('获取审阅列表失败，请稍后重试');
          console.error(e);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewFilter, page]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const filter = {
        year: reviewFilter.year,
        season: reviewFilter.season,
        grade: reviewFilter.grade,
        school: reviewFilter.school,
        status: reviewFilter.status,
        ...(reviewFilter.group ? { group: reviewFilter.group } : {}),
      };
      const blob = await postBlob('/review/export', filter);
      // 当前 postBlob 仅返回 Blob，无法读取 Content-Disposition，采用安全的兜底文件名
      const fileName = `review_${Date.now()}.xlsx`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      void message.error(`导出失败${msg ? `：${msg}` : '，请稍后重试'}`);
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={'reviewContent'}>
      <div className={'reviewGroup'}>
        <ReviewYear changeYear={changeYear} />
        <ReviewGroupSelect reviewFilter={reviewFilter} changeGroup={changeGroup} />
      </div>
      <div className={'reviewList'}>
        <div className={'reviewListHeader'}>
          <Button type="primary" loading={exporting} onClick={() => void handleExport()}>
            导出 Excel
          </Button>
        </div>
        <ReviewTable
          reviewList={reviewList}
          loading={loading}
          total={total}
          current={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default Review;
