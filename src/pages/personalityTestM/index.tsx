import React, { useState, useEffect } from 'react';
import { post, get } from '../../fetch';
import './index.less';
import * as echarts from 'echarts';
import { Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { debounce } from '../../utils/Debounce/debounce.ts';

const TestM: React.FC = () => {
  const navigate = useNavigate();
  const [doneOrNot, setdone] = useState(false);
  const [loading, setloading] = useState(true);
  const [name, setname] = useState<string>('');
  const [user_idself, setuser_idself] = useState('');
  const [score, setscore] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [pageNum, setPageNum] = useState(0); //页数
  const [textarr, setTextarr] = useState<string[]>([]);
  const [answerSheet, setanswersheet] = useState<string[]>(Array(64).fill(''));
  const [issueNum, setissuenum] = useState(0);
  const turnNext = () => {
    setPageNum(pageNum + 1); //换页函数
  };
  const backPage = () => {
    setPageNum(pageNum - 1);
  };
  interface Choiceitem {
    data: string;
    number: number;
  }
  interface PostSheet {
    choice: Choiceitem[];
  }
  interface response {
    code: number;
    data: {
      flag: boolean;
    };
  }
  interface FormData {
    code: number;
    data: {
      avatar: string;
      extra_question: string;
      gender: string;
      grade: string;
      group: string;
      knowledge: string;
      major: string;
      phone: string;
      reason: string;
      self_intro: string;
      form_id: string;
    };
  }
  const strnumber =
    '1 2 3 4 8 10 29 30 33 35 36 51 52 55 58 61 63 64 76 77 78 79 80 82 83 84 89 101 102 103 104 105 108 109 110 111 113 114 127 128 130 132 134 135 136 139 151 152 153 156 158 159 160 161 164 177 178 179 182 183 184 185 186 187';
  const numberforEach = strnumber.split(' ');
  async function submit() {
    const postSheet: PostSheet = {
      choice: [],
    };
    for (let index = 0; index < numberforEach.length; index++) {
      const newChoice: Choiceitem = {
        data: answerSheet[index],
        number: +numberforEach[index],
      };

      postSheet.choice.push(newChoice);
    }
    const submitRes = post(`/user/test/`, postSheet);
    await submitRes
      .then((data: response) => {
        if (data.code == 0) {
          void message.success('完成做答^_^');
        }
      })
      .catch((e) => console.error(e));
    const checkRes = post(`/user/test/result?user_id=myself`);
    checkRes
      .then((data: tesResModel) => {
        if (data.code == 200) {
          localStorage.removeItem(`${data.data.user_id}-tempAnswer`);
          localStorage.removeItem(`tempAnswer`);
          setdone(true);
          setname(data.data.name);
          setscore([
            data.data.le_qun_xing,
            data.data.cong_hui_xing,
            data.data.wen_ding_xing,
            data.data.xing_fen_fen_xing,
            data.data.you_heng_xing,
            data.data.jiao_ji_xing,
            data.data.huai_yi_xing,
          ]);
        }
      })
      .catch((e) => console.error(e));
  }
  useEffect(() => {
    const fetchTextFile = async () => {
      try {
        const response = await fetch('/test-new.txt');
        const content = await response.text();
        const contentarr = content.split(/\s/);
        const contentarrNew = contentarr.filter((item) => {
          return item !== '';
        });
        setTextarr(contentarrNew);
      } catch (error) {
        console.log('Error reading text file:', error);
      }
    };
    // eslint-disable-next-line
    fetchTextFile();
    const formdata = get(`/form/view?entry_form_id=myself`);
    formdata
      .then((data: FormData) => {
        if (data.code != 200) {
          void message.info('先填写完报名表再来吧');
          setTimeout(() => {
            navigate('/app');
          }, 1000);
        }
      })
      .catch((data: FormData) => {
        if (data.code != 200) {
          void message.info('先填写完报名表再来吧');
          setTimeout(() => {
            navigate('/app');
          }, 1000);
        }
      })
      .catch((e) => console.error(e));

    const getRes = post(`/user/test/result?user_id=myself`);
    getRes
      .then((data: tesResModel) => {
        const temp = localStorage.getItem(`${data.data.user_id}-tempAnswer`);
        if (temp) setanswersheet(JSON.parse(temp) as string[]);
        setloading(false);
        setuser_idself(data.data.user_id);
        if (data.data.choice.length != 0) {
          setdone(true);
          setname(data.data.name);
          setscore([
            data.data.le_qun_xing,
            data.data.cong_hui_xing,
            data.data.wen_ding_xing,
            data.data.xing_fen_fen_xing,
            data.data.you_heng_xing,
            data.data.jiao_ji_xing,
            data.data.huai_yi_xing,
          ]);
        }
      })
      .catch((e) => {
        setloading(false);
        console.error(e);
      });
  }, [navigate]);
  useEffect(() => {
    localStorage.setItem(`${user_idself}-tempAnswer`, JSON.stringify(answerSheet));
  }, [user_idself, answerSheet]);
  const element: JSX.Element[] = [];
  element[0] = (
    <div className="page_testM">
      <img
        src="https://muxi-fresh.muxixyz.com/fe-static/back2.png"
        className="returnBtn_testM"
        onClick={() => navigate('/app')}
        alt=""
      />
      <div className="top_title_testM">入职测验</div>
      <div className="mainbox_testM">
        <img
          src="https://muxi-fresh.muxixyz.com/fe-static/light.png"
          className="lightImg_testM"
          alt=""
        />
        <div className="lightTitle_testM">前言</div>
        <div className="lightDetail_testM">
          &nbsp;本测验将会测验您的职业性格特点，以了解您的性格与您的意愿职位之间的符合程度。本测验由卡特尔16PF测验改编而成，请受测者在测验过程中尽量保证连续性，本测验的结果仅将作为录取过程中的参考，因此请按照自己的真实想法进行填写，同时在测验过程中请仔细读题，在理解题目之后再作答，以防出现不符合您真实情况的测验结果。本测验共64题，预计用时7~9分钟,测验结果只能提交一次，请在确认后提交。
        </div>
        <button className="change_next_testM" onClick={turnNext}>
          开始测试
        </button>
      </div>
    </div>
  );
  element[1] = (
    <div className="page_testM">
      <img
        src="https://muxi-fresh.muxixyz.com/fe-static/backBlack.png"
        className="returnBtn_testM"
        alt=""
        onClick={backPage}
      />
      <div className="answerbox_testM">
        <span className="questionList_testM">
          Qusetion{' '}
          <span style={{ color: '#FFC93F', fontSize: '5vw' }}>{issueNum + 1}</span>
          /64
        </span>
        <div className="questionContent_testM">{textarr[issueNum * 4]}</div>
        <div
          className="answerchoice_testM"
          style={{ backgroundColor: answerSheet[issueNum] == 'A' ? '#FFC93F' : '' }}
          onClick={() => {
            setanswersheet((pre) => {
              const newarr = [...pre];
              newarr[issueNum] = 'A';
              return newarr;
            });
          }}
        >
          {textarr[issueNum * 4 + 1]}
        </div>
        <div
          className="answerchoice_testM"
          style={{ backgroundColor: answerSheet[issueNum] == 'B' ? '#FFC93F' : '' }}
          onClick={() => {
            setanswersheet((pre) => {
              const newarr = [...pre];
              newarr[issueNum] = 'B';
              return newarr;
            });
          }}
        >
          {textarr[issueNum * 4 + 2]}
        </div>
        <div
          className="answerchoice_testM"
          style={{ backgroundColor: answerSheet[issueNum] == 'C' ? '#FFC93F' : '' }}
          onClick={() => {
            setanswersheet((pre) => {
              const newarr = [...pre];
              newarr[issueNum] = 'C';
              return newarr;
            });
          }}
        >
          {textarr[issueNum * 4 + 3]}
        </div>
        <div className="turnContralbox_testM">
          <div
            className="turnQuestion_testM"
            style={
              issueNum == 0
                ? { backgroundColor: '#DADADA' }
                : { border: '2px #FFC93F solid' }
            }
            onClick={() => {
              if (issueNum != 0) {
                setissuenum(issueNum - 1);
              }
            }}
          >
            上一题
          </div>
          <div
            className="turnQuestion_testM"
            style={
              answerSheet[issueNum] == ''
                ? { backgroundColor: '#DADADA' }
                : { backgroundColor: '#FFC93F' }
            }
            onClick={() => {
              if (answerSheet[issueNum] != '' && issueNum != 63) {
                setissuenum(issueNum + 1);
              } else if (issueNum == 63 && answerSheet[issueNum] != '') {
                debounce(() => {
                  submit().catch((e) => console.error(e));
                }, 400);
              }
            }}
          >
            {issueNum == 63 ? '提交' : '下一题'}
          </div>
        </div>
      </div>
    </div>
  );
  interface tesResModel {
    data: testRes;
    msg: string;
    code: number;
  }
  interface testRes {
    user_id: string;
    choice: string[];
    cong_hui_xing: number;
    gender: string;
    grade: string;
    huai_yi_xing: number;
    jiao_ji_xing: number;
    le_qun_xing: number;
    major: string;
    name: string;
    wen_ding_xing: number;
    xing_fen_fen_xing: number;
    you_heng_xing: number;
  }

  function TestRes(paras: testRes) {
    useEffect(() => {
      type EChartsOption = echarts.EChartsOption;

      const chartDom = document.getElementById('main_testM')!;
      const myChart = echarts.init(chartDom);
      const option: EChartsOption = {
        title: {
          text: '测试雷达图',
        },
        legend: {
          data: [`${paras.name}的测试结果`],
        },
        radar: {
          // shape: 'circle',
          indicator: [
            { name: '乐群性', max: 12 },
            { name: '聪慧性', max: 10 },
            { name: '稳定性', max: 20 },
            { name: '兴奋性', max: 20 },
            { name: '有恒性', max: 14 },
            { name: '交际性', max: 20 },
            { name: '怀疑性', max: 14 },
          ],
        },
        series: [
          {
            name: 'Budget vs spending',
            type: 'radar',
            data: [
              {
                value: [
                  paras.le_qun_xing,
                  paras.cong_hui_xing,
                  paras.wen_ding_xing,
                  paras.xing_fen_fen_xing,
                  paras.you_heng_xing,
                  paras.jiao_ji_xing,
                  paras.huai_yi_xing,
                ],
                name: `${paras.name}的测试结果`,
              },
            ],
          },
        ],
      };

      option && myChart.setOption(option);
    });

    return (
      <div className="page_testM_res">
        <div className="top_title_testM">测试结果</div>
        <div className="mainbox_testM">
          <div id="main_testM" style={{ width: '95vw', height: '50vh' }}></div>
          <div className="resultbox_testM">
            <div className="result_detailM">
              乐群性:<span>{paras.le_qun_xing}</span>/12
            </div>
            <div className="result_detailM">
              聪慧性:<span>{paras.cong_hui_xing}</span>/10
            </div>
            <div className="result_detailM">
              稳定性:<span>{paras.wen_ding_xing}</span>/20
            </div>
            <div className="result_detailM">
              兴奋性:<span>{paras.xing_fen_fen_xing}</span>/20
            </div>
            <div className="result_detailM">
              有恒性:<span>{paras.you_heng_xing}</span>/14
            </div>
            <div className="result_detailM">
              交际性:<span>{paras.jiao_ji_xing}</span>/20
            </div>
            <div className="result_detailM">
              怀疑性:<span>{paras.huai_yi_xing}</span>/14
            </div>
          </div>
          <div className="returntoHome" onClick={() => navigate('/app')}>
            返回主页
          </div>
          {/*返回写在这 */}
        </div>
      </div>
    );
  }
  const loadingpage = (
    <div className="page_testM">
      <Spin size="large" style={{ marginBottom: '60vh' }} />
    </div>
  );

  return loading ? (
    loadingpage
  ) : !doneOrNot ? (
    <div>{element[pageNum]}</div>
  ) : (
    <TestRes
      choice={[]}
      cong_hui_xing={score[1]}
      gender={''}
      grade={''}
      huai_yi_xing={score[6]}
      jiao_ji_xing={score[5]}
      le_qun_xing={score[0]}
      major={''}
      name={name}
      wen_ding_xing={score[2]}
      xing_fen_fen_xing={score[3]}
      you_heng_xing={score[4]}
      user_id={''}
    ></TestRes>
  );
};
export default TestM;
