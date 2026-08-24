import './ReviewGroupSelect.less';
import React, { useCallback, useMemo, useState } from 'react';
import { Group, ReviewFilter } from '../../ReviewFitler.ts';
import { ConfigProvider, Menu } from 'antd';

type ReviewGroupSelectProps = {
  reviewFilter: ReviewFilter;
  changeGroup(group: Group): void;
};

const ReviewGroupSelect: React.FC<ReviewGroupSelectProps> = ({
  reviewFilter,
  changeGroup,
}) => {
  const groups = useMemo(
    () => [Group.Product, Group.Frontend, Group.Backend, Group.Design, Group.Operation],
    [],
  );
  const chineseGroups: { [key in Group]: string } = {
    // Android: '安卓组',
    Backend: '后端组',
    Design: '设计组',
    Frontend: '前端组',
    Operation: '运营组',
    Product: '产品组',
  };

  const [selectedGroup, setSelectedGroup] = useState<Group>(reviewFilter.group);

  const handleChange = useCallback(
    (group: Group) => {
      setSelectedGroup(group);
      changeGroup(group);
    },
    [changeGroup],
  );

  return (
    <div className={'reviewGroupSelect'}>
      <div className={'reviewGroupSelectTitle'}>成员分组</div>
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemHeight: 76,
            },
          },
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedGroup]}
          onClick={(e) => handleChange(e.key as Group)}
          items={groups.map((group) => ({
            key: group,
            title: chineseGroups[group],
            label: <div className={'reviewGroups'}>{chineseGroups[group]}</div>,
          }))}
          style={{ height: '400px' }}
        />
      </ConfigProvider>
    </div>
  );
};

export default ReviewGroupSelect;
