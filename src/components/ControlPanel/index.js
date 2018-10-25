import React from 'react';
import { DatePicker, Select } from 'antd';
import moment from 'moment';
import classNames from 'classnames';
import Cell from './Cell';
import styles from './index.less';

const { Option } = Select;
const { RangePicker } = DatePicker;
function onChange() {
  // console.warn('From: ', dates[0], ', to: ', dates[1]);
  // console.warn('From: ', dateStrings[0], ', to: ', dateStrings[1]);
}

function handleChange() {
  // console.log('下拉框的change事件');
}


const ControlPanel = () => {
  const firstLineTimeZones = [];
  const secondLineTimeZones = [];
  const temp = ['15分钟内', '30分钟内', '1小时内', '6小时内', '12小时内', '1天内',
    '2天内', '1周内', '2周内', '1月内', '半年内', '1年内'];
  // const activeIndex = 0;

  this.state = { activeIndex: 0 };
  for (let i = 0; i < temp.length; i += 1) {
    if (i <= 5) {
      firstLineTimeZones.push((<td className={this.state.activeIndex === i ? styles.active : ''} key={`${i}first_line`}><Cell key={`${i}first_line`} timeZone={temp[i]} /></td>));
    } else {
      secondLineTimeZones.push((<td className={this.state.activeIndex === i ? styles.active : ''} key={`${i}first_line`}><Cell key={`${i}second_line`} timeZone={temp[i]} /></td>));
    }
  }

  return (
    <div className={classNames('clearfix', styles.controlPanel)}>
      <div className={styles.timeZoneContainer}>
        <table className={styles.timeTable}>
          <tbody>
            <tr key="a">{firstLineTimeZones}</tr>
            <tr key="b">{secondLineTimeZones}</tr>
          </tbody>
        </table>
      </div>
      <div className={styles.datePickContaier}>
        <RangePicker
          style={{ width: '100%' }}
          ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }}
          onChange={onChange}
        />
      </div>
      <div className={styles.refreshControlContainer}>
        <span className="mr-md kk">定时刷新</span>
        <Select defaultValue="5s" onChange={handleChange} style={{ width: '70%' }}>
          <Option value="5s">5s</Option>
          <Option value="30s">30s</Option>
          <Option value="60s" disabled>60s</Option>
          <Option value="120s">120s</Option>
        </Select>
      </div>
    </div>


  );
};

const defaultEventArr = new Array(10);
defaultEventArr.fill(() => { });

ControlPanel.defaultProps = {
  timeZones: [
    ['15分钟内', '30分钟内', '1小时内', '6小时内', '12小时内', '1天内',
      '2天内', '1周内', '2周内', '1月内', '半年内', '1年内'],
  ],
  timeZoneEvents: defaultEventArr,
  activeIndex: 0,
};

ControlPanel.getInitialState = () => {
  return {
    activeIndex: 1,
  };
};

export default ControlPanel;

