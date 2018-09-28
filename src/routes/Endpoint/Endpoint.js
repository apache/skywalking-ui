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
import { connect } from 'dva';
import { Row, Col, Form, Button, Icon, Select } from 'antd';
import {
  ChartCard, MiniArea, MiniBar, Sankey,
} from 'components/Charts';
import { axisY } from '../../utils/time';
import { avgTS } from '../../utils/utils';
import { Panel, Search } from '../../components/Page';
import TraceList from '../../components/Trace/TraceList';
import TraceTimeline from '../Trace/TraceTimeline';

const { Item: FormItem } = Form;
const { Option } = Select;

@connect(state => ({
  endpoint: state.endpoint,
  duration: state.global.duration,
  globalVariables: state.global.globalVariables,
  loading: state.loading.models.endpoint,
}))
@Form.create({
  mapPropsToFields(props) {
    const { variables: { values, labels } } = props.endpoint;
    return {
      serviceId: Form.createFormField({
        value: { key: values.serviceId ? values.serviceId : '', label: labels.serviceId ? labels.serviceId : '' },
      }),
      endpointId: Form.createFormField({
        value: { key: values.endpointId ? values.endpointId : '', label: labels.endpointId ? labels.endpointId : '' },
      }),
    };
  },
})
export default class Endpoint extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'endpoint/initOptions',
      payload: { variables: this.props.globalVariables, reducer: 'saveServiceInfo' },
    });
  }

  componentWillUpdate(nextProps) {
    if (nextProps.globalVariables.duration === this.props.globalVariables.duration) {
      return;
    }
    this.props.dispatch({
      type: 'endpoint/initOptions',
      payload: { variables: nextProps.globalVariables, reducer: 'saveServiceInfo' },
    });
  }

  handleServiceSelect = (selected) => {
    this.props.dispatch({
      type: 'endpoint/save',
      payload: {
        variables: {
          values: { serviceId: selected.key, endpointId: null },
          labels: { serviceId: selected.label, endpointId: null },
        },
        data: {
          serviceInfo: { serviceId: selected.key },
        },
      },
    });
  }

  handleSelect = (selected) => {
    this.props.dispatch({
      type: 'endpoint/save',
      payload: {
        variables: {
          values: { endpointId: selected.key },
          labels: { endpointId: selected.label },
        },
        data: {
          endpointInfo: selected,
        },
      },
    });
  }

  handleChange = (variables) => {
    const { variables: { values } } = this.props.endpoint;
    if (!values.serviceId) {
      return;
    }
    const { key: endpointId, label: endpointName, duration } = variables;
    if (!endpointId) {
      return;
    }
    this.props.dispatch({
      type: 'endpoint/fetchData',
      payload: { variables: {
        endpointId,
        duration,
        traceCondition: {
          endpointId: parseInt(values.endpointId, 10),
          endpointName: endpointName,
          queryDuration: duration,
          traceState: 'ALL',
          queryOrder: 'BY_DURATION',
          paging: {
            pageNum: 1,
            pageSize: 20,
            needTotal: false,
          },
        },
      } },
    });
  }

  handleShowTrace = (traceId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'endpoint/fetchSpans',
      payload: { variables: { traceId } },
    });
  }

  handleGoBack = () => {
    this.props.dispatch({
      type: 'endpoint/hideTimeline',
    });
  }

  edgeWith = edge => edge.cpm;

  renderPanel = () => {
    const { endpoint, duration } = this.props;
    const { variables: { values }, data } = endpoint;
    const { getEndpointResponseTimeTrend, getEndpointThroughputTrend,
      getEndpointSLATrend, getEndpointTopology, queryBasicTraces } = data;
    if (!values.endpointId) {
      return null;
    }
    return (
      <Panel
        variables={data.endpointInfo}
        globalVariables={this.props.globalVariables}
        onChange={this.handleChange}
      >
        <Row gutter={8}>
          <Col xs={24} sm={24} md={24} lg={8} xl={8} style={{ marginTop: 8 }}>
            <ChartCard
              title="Avg Throughput"
              total={`${avgTS(getEndpointThroughputTrend.values)} cpm`}
              contentHeight={46}
            >
              <MiniArea
                color="#975FE4"
                data={axisY(duration, getEndpointThroughputTrend.values)}
              />
            </ChartCard>
          </Col>
          <Col xs={24} sm={24} md={24} lg={8} xl={8} style={{ marginTop: 8 }}>
            <ChartCard
              title="Avg Response Time"
              total={`${avgTS(getEndpointResponseTimeTrend.values)} ms`}
              contentHeight={46}
            >
              <MiniArea
                data={axisY(duration, getEndpointResponseTimeTrend.values)}
              />
            </ChartCard>
          </Col>
          <Col xs={24} sm={24} md={24} lg={8} xl={8} style={{ marginTop: 8 }}>
            <ChartCard
              title="Avg SLA"
              total={`${(avgTS(getEndpointSLATrend.values) / 100).toFixed(2)} %`}
            >
              <MiniBar
                animate={false}
                height={46}
                data={axisY(duration, getEndpointSLATrend.values,
                  ({ x, y }) => ({ x, y: y / 100 }))}
              />
            </ChartCard>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ marginTop: 8 }}>
            <ChartCard
              title="Top 20 Slow Traces"
            >
              <TraceList
                data={queryBasicTraces.traces}
                onClickTraceTag={this.handleShowTrace}
                loading={this.props.loading}
              />
            </ChartCard>
          </Col>
        </Row>
        {this.renderSankey(getEndpointTopology)}
      </Panel>
    );
  }

  renderSankey = (data) => {
    if (data.nodes.length < 2) {
      return <span style={{ display: 'none' }} />;
    }
    const nodesMap = new Map();
    data.nodes.forEach((_, i) => {
      nodesMap.set(`${_.id}`, i);
    });
    const nData = {
      nodes: data.nodes,
      edges: data.calls
        .filter(_ => nodesMap.has(`${_.source}`) && nodesMap.has(`${_.target}`))
        .map(_ =>
          ({ ..._, value: (this.edgeWith(_) < 1 ? 1000 : this.edgeWith(_)), source: nodesMap.get(`${_.source}`), target: nodesMap.get(`${_.target}`) })),
    };
    return (
      <Row gutter={8}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ marginTop: 8 }}>
          <ChartCard
            title="Dependency Map"
            contentHeight={200}
          >
            <Sankey
              data={nData}
              edgeTooltip={['target*source*cpm', (target, source, cpm) => {
                return {
                  name: `${source.name} to ${target.name} </span>`,
                  value: `${cpm} cpm`,
                };
              }]}
              edgeColor="#bbb"
            />
          </ChartCard>
        </Col>
      </Row>);
  }

  render() {
    const { form, endpoint } = this.props;
    const { getFieldDecorator } = form;
    const { variables: { options }, data } = endpoint;
    const { showTimeline, queryTrace, currentTraceId } = data;
    return (
      <div>
        {showTimeline ? (
          <Row type="flex" justify="start">
            <Col style={{ marginBottom: 24 }}>
              <Button ghost type="primary" size="small" onClick={() => { this.handleGoBack(); }}>
                <Icon type="left" />Go back
              </Button>
            </Col>
          </Row>
      ) : null}
        <Row type="flex" justify="start">
          <Col span={showTimeline ? 0 : 24}>
            <Form layout="inline">
              <FormItem>
                {getFieldDecorator('serviceId')(
                  <Select
                    showSearch
                    optionFilterProp="children"
                    style={{ width: 200 }}
                    placeholder="Select a service"
                    labelInValue
                    onSelect={this.handleServiceSelect.bind(this)}
                  >
                    {options.serviceId && options.serviceId.map(service =>
                      <Option key={service.key} value={service.key}>{service.label}</Option>)}
                  </Select>
                )}
              </FormItem>
              {data.serviceInfo ? (
                <FormItem>
                  {getFieldDecorator('endpointId')(
                    <Search
                      placeholder="Search a endpoint"
                      onSelect={this.handleSelect.bind(this)}
                      url="/graphql"
                      variables={data.serviceInfo}
                      query={`
                        query SearchEndpoint($serviceId: ID!, $keyword: String!) {
                          searchEndpoint(serviceId: $serviceId, keyword: $keyword, limit: 10) {
                            key: id
                            label: name
                          }
                        }
                      `}
                    />
                  )}
                </FormItem>
              ) : null}
            </Form>
            {this.renderPanel()}
          </Col>
          <Col span={showTimeline ? 24 : 0}>
            {showTimeline ? (
              <TraceTimeline
                trace={{ data: { queryTrace, currentTraceId } }}
              />
            ) : null}
          </Col>
        </Row>
      </div>
    );
  }
}
