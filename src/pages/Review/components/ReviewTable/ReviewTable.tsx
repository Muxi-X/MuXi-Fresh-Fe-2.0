import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './ReviewTable.less';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { AdmissionStatus, ReviewRow, Gender } from '../../ReviewList.ts';
import { Link } from 'react-router-dom';
import { message, Select, Table } from 'antd';
import { post } from '../../../../fetch.ts';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

type ReviewTableProps = {
  reviewList: ReviewRow[];
  loading: boolean;
};
const ReviewTable: React.FC<ReviewTableProps> = ({ reviewList, loading }) => {
  const [reviewTable, setReviewTable] = useState(reviewList);
  useEffect(() => {
    setReviewTable(reviewList);
  }, [reviewList]);

  // 缓存grader过滤器
  const graderFilters = useMemo(() => {
    // 对reviewTable中的grader进行去重和映射操作
    return (
      reviewTable &&
      [...new Set(reviewTable.map((r) => r.grader))].map((grader) => ({
        text: grader,
        value: grader,
      }))
    );
  }, [reviewTable]);

  // 缓存gender过滤器
  const genderFilters = useMemo(() => {
    return (
      reviewTable &&
      [...new Set(reviewTable.map((r) => r.gender))].map((gender) => ({
        text: Gender[gender as unknown as keyof typeof Gender],
        value: gender,
      }))
    );
  }, [reviewTable]);

  // 缓存school过滤器
  const schoolFilters = useMemo(() => {
    // 对reviewTable中的school进行去重和映射操作
    return (
      reviewTable &&
      [...new Set(reviewTable.map((r) => r.school))].map((school) => ({
        text: school,
        value: school,
      }))
    );
  }, [reviewTable]);

  const groupFilters = useMemo(() => {
    // 对reviewTable中的group进行去重和映射操作
    return (
      reviewTable &&
      [...new Set(reviewTable.map((r) => r.group))].map((group) => ({
        text: group,
        value: group,
      }))
    );
  }, [reviewTable]);

  // 缓存admission_status过滤器
  const admissionStatusFilters = useMemo(() => {
    // 对reviewTable中的admission_status进行去重和映射操作
    return (
      reviewTable &&
      [...new Set(reviewTable.map((r) => r.admission_status))].map(
        (admission_status) => ({
          text: admission_status,
          value: admission_status,
        }),
      )
    );
  }, [reviewTable]);

  // 切换组别时清空筛选和排序和页数
  const [filter, setFilter] = useState<Record<string, FilterValue | null>>({});
  const [sorted, setSorted] = useState<SorterResult<ReviewRow>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const handleChange: TableProps<ReviewRow>['onChange'] = (
    pagination,
    filters,
    sorter,
  ) => {
    console.log(filters);
    setFilter(filters);
    setSorted(sorter as SorterResult<ReviewRow>);
    setCurrentPage(pagination.current as number);
  };
  useEffect(() => {
    setFilter({});
    setSorted({});
    setCurrentPage(1);
  }, [reviewList]);

  const columns: ColumnsType<ReviewRow> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, 'zh-CN'),
      sortOrder: sorted.columnKey === 'name' ? sorted.order : null,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      filters: genderFilters,
      filteredValue: filter.gender || null,
      onFilter: (value, record) => record.gender === value,
      filterSearch: false,
      render: (_, record) => Gender[record.gender as unknown as keyof typeof Gender],
    },
    {
      title: '年级',
      dataIndex: 'grader',
      key: 'grader',
      filters: graderFilters,
      filteredValue: filter.grader || null,
      onFilter: (value, record) => record.grader.indexOf(value as string) === 0,
      filterSearch: true,
      sorter: (a, b) => Number(a.grader) - Number(b.grader),
      sortOrder: sorted.columnKey === 'grader' ? sorted.order : null,
    },
    {
      title: '学院',
      dataIndex: 'school',
      key: 'school',
      filters: schoolFilters,
      filteredValue: filter.school || null,
      onFilter: (value, record) => record.school.indexOf(value as string) === 0,
      filterSearch: true,
      sorter: (a, b) => a.school.localeCompare(b.school, 'zh-CN'),
      sortOrder: sorted.columnKey === 'school' ? sorted.order : null,
    },
    {
      title: '组别',
      dataIndex: 'group',
      key: 'group',
      filters: groupFilters,
      filteredValue: filter.group || null,
      onFilter: (value, record) => record.group.indexOf(value as string) === 0,
      filterSearch: true,
      sorter: (a, b) => a.school.localeCompare(b.school, 'zh-CN'),
      sortOrder: sorted.columnKey === 'group' ? sorted.order : null,
    },
    {
      title: '报名表',
      dataIndex: 'form_id',
      key: 'form_id',
      render: (_, record: ReviewRow) => (
        <Link to={`/app/form/${record.user_id}/${record.form_id}`} target={'_blank'}>
          查看报名表
        </Link>
      ),
    },
    {
      title: '测验',
      dataIndex: 'exam_status',
      key: 'exam_status',
      render: (_, record: ReviewRow) => (
        <div>
          {record.exam_status === '已提交' ? (
            <Link to={`/app/test/${record.user_id}`} target={'_blank'}>
              已提交
            </Link>
          ) : (
            '未提交'
          )}
        </div>
      ),
    },
    {
      title: '面试评价',
      key: 'interview_evaluation',
      render: (_, record: ReviewRow) => (
        <Link
          // to={`http://localhost:3000/quicknew?title=${record.name}面试评价`}
          to={`https://forum.muxistudio.xyz/quicknew?title=${record.name}面试评价`}
          target="_blank"
        >
          去填写面评
        </Link>
      ),
    },
    {
      title: '录取状态',
      dataIndex: 'admission_status',
      key: 'admission_status',
      filters: admissionStatusFilters,
      filteredValue: filter.admission_status || null,
      onFilter: (value, record) => record.admission_status.indexOf(value as string) === 0,
      filterSearch: true,
      sorter: (a, b) => a.admission_status.localeCompare(b.admission_status, 'zh-CN'),
      sortOrder: sorted.columnKey === 'admission_status' ? sorted.order : null,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Select
          defaultValue={record.admission_status}
          style={{ width: '80%' }}
          onSelect={(value: AdmissionStatus) => {
            changeAdmissionStatus(value, record.schedule_id);
          }}
          options={[
            { value: '已报名', label: '已报名' },
            { value: '实习期', label: '实习期' },
            { value: '已转正', label: '已转正' },
          ]}
        />
      ),
    },
  ];

  const changeAdmissionStatus = useCallback(
    (admissionStatus: AdmissionStatus, scheduleId: string) => {
      post('/review/admission_status', {
        schedule_id: scheduleId,
        new_status: admissionStatus,
      }).then(
        () => {
          message.success('录取状态更新成功').then(
            () => {
              // 使用setReviewTable来更新reviewTable状态
              setReviewTable((prevReviewTable) => {
                return prevReviewTable.map((e) => {
                  if (e.schedule_id === scheduleId) {
                    return { ...e, admission_status: admissionStatus };
                  } else {
                    return e;
                  }
                });
              });
            },
            (e) => {
              console.error(e);
            },
          );
        },
        (e) => {
          void message.error('录取状态更新失败，请稍后重试');
          console.error(e);
        },
      );
    },
    [setReviewTable],
  );

  return (
    <div className="review-table-container">
      <Table
        bordered={true}
        loading={loading}
        columns={columns}
        dataSource={reviewTable}
        onChange={handleChange}
        pagination={{
          position: ['bottomCenter'],
          pageSize: 10,
          showSizeChanger: false,
          current: currentPage,
        }}
        rowKey={(r) => r.schedule_id}
      />
    </div>
  );
};

export default ReviewTable;
