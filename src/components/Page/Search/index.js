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
import { Select, Spin } from 'antd';
import debounce from 'lodash.debounce';
import request from '../../../utils/request';

const { Option } = Select;

export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.originFetchServer = this.fetchServer;
    this.fetchServer = debounce(this.fetchServer, 800);
  }

  state = {
    data: [],
    fetching: false,
  };

  componentDidMount() {
    const {...propsData} = this.props;
    if (propsData.variables && Object.keys(propsData.variables).length > 0) {
      this.originFetchServer('', propsData.value.key);
    }
  }

  componentDidUpdate(prevProps) {
    const {...propsData} = this.props;
    if (prevProps.variables !== propsData.variables) {
      this.originFetchServer('', propsData.value.key);
    }
  }

  fetchServer = (value, key) => {
    if (value === undefined) {
      return;
    }
    const { url, query, variables = {}, transform } = this.props;
    const {...stateData} = this.state;
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ data: [], fetching: true });
    request(`/api${url}`, {
      method: 'POST',
      body: {
        variables: {
          ...variables,
          keyword: value,
        },
        query,
      },
    }).then(body => {
      if (!body.data || fetchId !== this.lastFetchId) {
        // for fetch callback order
        return;
      }
      const list = body.data[Object.keys(body.data)[0]];
      this.setState({ data: transform ? list.map(transform) : list, fetching: false });
      if (stateData.data.length < 1) {
        return;
      }
      if (!key) {
        this.handleSelect(stateData.data[0]);
        return;
      }
      const option = stateData.data.find(_ => _.key === key);
      if (!option) {
        this.handleSelect(stateData.data[0]);
      }
    });
  };

  handleSelect = value => {
    const { onSelect } = this.props;
    const { ...stateData } = this.state;
    const selected = stateData.data.find(_ => _.key === value.key);
    onSelect(selected);
  };

  render() {
    const { placeholder, value } = this.props;
    const { ...stateData } = this.state;
    return (
      <Select
        showSearch
        style={{ width: 600 }}
        placeholder={placeholder}
        notFoundContent={stateData.fetching ? <Spin size="small" /> : null}
        filterOption={false}
        labelInValue
        onSelect={this.handleSelect.bind(this)}
        onSearch={this.fetchServer}
        value={value}
      >
        {stateData.data.map(_ => {
          return (
            <Option key={_.key} value={_.key}>
              {_.label}
            </Option>
          );
        })}
      </Select>
    );
  }
}
