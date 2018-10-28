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
import { List, Button } from 'antd';
import moment from 'moment';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
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
      <div style={{ display: 'flex', marginBottom: 15, alignItems: 'center', justifyContent: 'space-between' }}>
        <Ellipsis lines={1} tooltip style={{ width: '30%' }}>{(opName && opName.length > 0) ? opName.join(' ') : '' }</Ellipsis>
        <span style={{ width: '5%', paddingLeft: '1%', color: isError ? 'rgb(253, 67, 75)' : 'rgb(136, 192, 81)' }}> { !isError ? '正常' : '异常'} </span>
        <div className={styles.progressWrap} style={{ width: '40%', height: 15 }}>
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
        <span style={{ width: 'auto', paddingLeft: '2%', paddingRight: '2%', minWidth: 70 }} className={styles.duration}>{`${duration}ms`}</span>
        <span style={{ width: '15%', minWidth: 163 }} className={styles.startTime}>{moment(parseInt(start, 10)).format('YYYY-MM-DD HH:mm:ss.SSS')}</span>
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
        {traceIds.map((id) => { return <Button className="mr-sm" key={id} size="small" onClick={() => onClickTraceTag(id)}>{id}</Button>; })}
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
      <List
        className={styles.traceList}
        itemLayout="horizontal"
        size="small"
        dataSource={traces}
        loading={loading}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              // avatar={<Avatar
                // style={{ backgroundColor: item.isError ? '#fde3cf' :
                // '#1890ff', color: item.isError ? '#f56a00' : null, verticalAlign: 'middle' }}
                // icon={item.isError ? 'close' : 'check'}
              // />}
              title={this.renderOperationName(item.operationNames, item.duration,
                item.isError, maxDuration, item.start)}
              description={this.renderDescription(item.start, item.traceIds)}
            />
          </List.Item>
        )}
      />
    );
  }
}

export default TraceList;
