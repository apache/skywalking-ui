/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { PureComponent } from 'react';
import { List, Button, Icon } from 'antd';
import moment from 'moment';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import classNames from 'classnames';
import styles from './index.less';


class TraceList extends PureComponent {
  // renderOperationName = (opName, duration, isError, maxDuration) => {
  //   return (
  //     <div className={styles.progressWrap}>
  //       <div
  //         className={styles.progress}
  //         style={{
  //           backgroundColor: isError ? '#fde3cf' : '#87CEFA',
  //           width: `${(duration * 100) / maxDuration}%`,
  //           height: 25,
  //         }}
  //       />
  //       <div className={styles.mainInfo}>
  //         <Ellipsis length={100} tooltip
  // style={{ width: 'initial' }}>
  // {(opName && opName.length > 0) ? opName.join(' ') : '' }</Ellipsis>
  //         <span className={styles.duration}>{`${duration}ms`}</span>
  //       </div>
  //     </div>);
  // }
  renderOperationName = (opName, duration, isError, maxDuration, start) => {
    return (
      <div className={styles.traceListItem} style={{ display: 'flex', marginBottom: 15, alignItems: 'center', justifyContent: 'space-between' }}>
        <Ellipsis className={styles.name} lines={1} tooltip >{(opName && opName.length > 0) ? opName.join(' ') : '' }</Ellipsis>
        <span className={styles.status} style={{ color: isError ? 'rgb(253, 67, 75)' : 'rgb(136, 192, 81)' }}> { !isError ? '正常' : '异常'} </span>
        <div className={classNames(styles.progressWrap, styles.progressBar)} style={{ width: '40%', height: 15 }}>
          <div
            className={styles.progress}
            style={{
              backgroundColor: isError ? 'rgb(253, 67, 75)' : 'rgb(136, 192, 81)',
              width: `${(duration * 100) / maxDuration}%`,
              height: 15,
            }}
          />
          <div className={styles.mainInfo} />
        </div>
        <span className={classNames(styles.duration, styles.averageTime)}>{`${duration}ms`}</span>
        <span className={classNames(styles.startTime, styles.timeStamp)}>{moment(parseInt(start, 10)).format('YYYY-MM-DD HH:mm:ss.SSS')}</span>
      </div>);
  }
  // renderDescription = (start, traceIds) => {
  //   const { onClickTraceTag } = this.props;
  //   return (
  //     <div>
  //       {traceIds.map((id) =>
  // { return <Button key={id}
  // size="small" onClick={() => onClickTraceTag(id)}>{id}</Button>; })}
  //       <span className={styles.startTime}>
  // {moment(parseInt(start, 10)).format('YYYY-MM-DD HH:mm:ss.SSS')}</span>
  //     </div>
  //   );
  // }
  renderDescription = (start, traceIds) => {
    const { onClickTraceTag } = this.props;
    return (
      <div>
        {traceIds.map((id) => { return <Button style={{ backgroundColor: 'rgb(240, 242, 245)' }} className="mr-sm" key={id} size="small" onClick={() => onClickTraceTag(id)}>{id}</Button>; })}
      </div>
    );
  }
  render() {
    const { data: traces, loading } = this.props;
    let maxDuration = 0;
    traces.forEach((item) => {
      if (item.duration > maxDuration) {
        maxDuration = item.duration;
      }
    });
    return (
      <div>
        <div className={styles.traceListHead}>
          <p>耗时Top20</p>
          <div style={{ borderBottom: '1px solid #ddd',
            display: 'flex',
            paddingBottom: 15,
            justifyContent: 'space-between' }}
          >
            <span style={{ width: '30%' }}> 类型 </span>
            <span style={{ width: '5%' }}> 状态<Icon className="pointer" type="down" theme="outlined" /> </span>
            <span style={{ width: '40%' }} />
            <span style={{ minWidth: 70 }} > 平均时长 </span>
            <span style={{ width: 163 }} />
          </div>
        </div>
        <List
          className={styles.traceList}
          itemLayout="horizontal"
          size="small"
          dataSource={traces}
          loading={loading}
          renderItem={item => (
            <List.Item style={{ paddingBottom: 20 }}>
              <List.Item.Meta
                title={this.renderOperationName(item.operationNames, item.duration,
                  item.isError, maxDuration, item.start)}
                description={this.renderDescription(item.start, item.traceIds)}
              />
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export default TraceList;

