/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import React from 'react';
import { Icon } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

const Trend = ({ colorful = true, flag, children, className, ...rest }) => {
  const classString = classNames(styles.trendItem, {
    [styles.trendItemGrey]: !colorful,
  }, className);
  return (
    <div
      {...rest}
      className={classString}
      title={typeof children === 'string' ? children : ''}
    >
      <span className={styles.value}>{children}</span>
      {flag && <span className={styles[flag]}><Icon type={`caret-${flag}`} /></span>}
    </div>
  );
};

export default Trend;
