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
import { Row, Col, Card, Icon, Radio, Select, Button } from 'antd';
import { ChartCard } from '../../components/Charts';
import { AppTopology } from '../../components/Topology';
import { Panel } from '../../components/Page';
// import ApplicationLitePanel from '../../components/ApplicationLitePanel';
import DescriptionList from '../../components/DescriptionList';
import { redirect } from '../../utils/utils';
import styles from './Topology.less';
import ControlPanel from '../../components/ControlPanel';


const { Description } = DescriptionList;
const { Option } = Select;

const colResponsiveProps = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  style: { marginTop: 8 },
};

const layouts = [
  {
    name: 'dagre',
    icon: 'img/icon/dagre.png',
    rankDir: 'LR',
    minLen: 4,
    animate: true,
  },
  {
    name: 'concentric',
    icon: 'img/icon/concentric.png',
    minNodeSpacing: 10,
    animate: true,
  },
  {
    name: 'cose-bilkent',
    icon: 'img/icon/cose.png',
    idealEdgeLength: 200,
    edgeElasticity: 0.1,
    randomize: false,
  },
];

const layoutButtonStyle = { height: '90%', verticalAlign: 'middle', paddingBottom: 2 };

@connect(state => ({
  topology: state.topology,
  duration: state.global.duration,
  globalVariables: state.global.globalVariables,
}))
export default class Topology extends PureComponent {
  static defaultProps = {
    graphHeight: 600,
  };
  constructor(props) {
    super(props);
    this.state = { displayModal: false };
  }
  handleChange = (variables) => {
    this.props.dispatch({
      type: 'topology/fetchData',
      payload: { variables },
    });
  }
  handleLayoutChange = ({ target: { value } }) => {
    this.props.dispatch({
      type: 'topology/saveData',
      payload: { layout: value },
    });
  }
  handleSelectedApplication = (appInfo) => {
    this.handleDisplayWayChange(true);
    if (appInfo) {
      this.props.dispatch({
        type: 'topology/saveData',
        payload: { appInfo },
      });
    } else {
      this.props.dispatch({
        type: 'topology/saveData',
        payload: { appInfo: null },
      });
    }
  }
  handleFilterApplication = (aa) => {
    this.props.dispatch({
      type: 'topology/filterApplication',
      payload: { aa },
    });
  }
  filter = () => {
    const { topology: { variables: { appRegExps }, data: { getClusterTopology } } } = this.props;
    if (!appRegExps) {
      return getClusterTopology;
    }
    const nn = getClusterTopology.nodes.filter(_ => appRegExps
      .findIndex(r => _.name.match(r)) > -1);
    const cc = getClusterTopology.calls.filter(_ => nn
      .findIndex(n => n.id === _.source || n.id === _.target) > -1);
    return {
      nodes: getClusterTopology.nodes.filter(_ => cc
        .findIndex(c => c.source === _.id || c.target === _.id) > -1),
      calls: cc,
    };
  }
  handleDisplayWayChange(flag) {
    this.setState({ displayModal: flag });
  }
  closeModal() {
    this.handleDisplayWayChange(false);
  }
  renderActions = () => {
    const { data: { appInfo } } = this.props.topology;
    return [
      <Icon type="appstore" onClick={() => redirect(this.props.history, '/monitor/application', { key: appInfo.id, label: appInfo.name })} />,
      <Icon
        type="exception"
        onClick={() => redirect(this.props.history, '/trace',
        { values: {
            applicationId: appInfo.id,
            duration: { ...this.props.duration, input: this.props.globalVariables.duration },
          },
          labels: { applicationId: appInfo.name },
        })}
      />,
      appInfo.isAlarm ? <Icon type="bell" onClick={() => redirect(this.props.history, '/monitor/alarm')} /> : null,
    ];
  }
  renderNodeType = (topologData) => {
    const typeMap = new Map();
    topologData.nodes.forEach((_) => {
      if (typeMap.has(_.type)) {
        typeMap.set(_.type, typeMap.get(_.type) + 1);
      } else {
        typeMap.set(_.type, 1);
      }
    });
    const result = [];
    typeMap.forEach((v, k) => result.push(<Description term={k}>{v}</Description>));
    // typeMap.forEach((v, k) => result.push(<div> <span> {k} </span> <span> {v} </span> </div>));
    return result;
  }
  renderNodeTypePanel = (topologData) => {
    const typeMap = new Map();
    topologData.nodes.forEach((_) => {
      if (typeMap.has(_.type)) {
        typeMap.set(_.type, typeMap.get(_.type) + 1);
      } else {
        typeMap.set(_.type, 1);
      }
    });
    const result = [];
    // typeMap.forEach((v, k) => result.push(<Description term={k}>{v}</Description>));
    let i = 0;
    typeMap.forEach((v, k) => {
      i += 1;
      result.push(
        <div key={`${i}node`} className={styles.nodeItem}>
          <span className={styles.text}> {k} </span>
          <span className={styles.value}> {v} </span>
        </div>);
    });

    return result;
  }
  render() {
    const { data, variables: { appFilters = [] } } = this.props.topology;
    const { layout = 0 } = data;
    const topologData = this.filter();
    return (
      <Panel globalVariables={this.props.globalVariables} onChange={this.handleChange}>
        <ControlPanel />
        <Row gutter={8}>
          <Col {...{ ...colResponsiveProps, xl: 24, lg: 24 }}>
            <ChartCard
              className={styles.topoWrapper}
            >
              <Select
                mode="tags"
                style={{ width: '100%', marginBottom: 20 }}
                placeholder="Filter application"
                onChange={this.handleFilterApplication}
                tokenSeparators={[',']}
                value={appFilters}
              >
                {data.getClusterTopology.nodes.filter(_ => _.sla)
                  .map(_ => <Option key={_.name}>{_.name}</Option>)}
              </Select>
              <Radio.Group
                value={layout}
                onChange={this.handleLayoutChange}
                size="normal"
                className="clearfix"
              >
                {layouts.map((_, i) => (
                  <Radio.Button value={i} key={_.name}>
                    <img src={_.icon} alt={_.name} style={layoutButtonStyle} />
                  </Radio.Button>))}
              </Radio.Group>
              {topologData.nodes.length > 0 ? (
                <AppTopology
                  height={this.props.graphHeight}
                  elements={topologData}
                  onSelectedApplication={this.handleSelectedApplication}
                  layout={layouts[layout]}
                />
              ) : null}
            </ChartCard>
          </Col>
          {this.state.displayModal ? <div className={styles.modalShadow} /> : null}
          {this.state.displayModal ? (
            <Col {...{ ...colResponsiveProps, xl: 6, lg: 8 }} className={styles.applicationModal}>
              {data.appInfo ? (
                <Card
                  title={data.appInfo.name}
                  bodyStyle={{ height: 568 }}
                  // actions={this.renderActions()}
                >
                  <span onClick={this.closeModal.bind(this, false)} className={styles.closeIcon}> <Icon type="close" theme="outlined" /> </span>
                  {/* <ApplicationLitePanel appInfo={data.appInfo} /> */}
                  <div className={styles.nodeItem}>
                    <span className={styles.text}> SLA </span>
                    <span className={styles.value}> {data.appInfo.sla} </span>
                  </div>
                  <div className={styles.nodeItem}>
                    <span className={styles.text}> Calls Per Minute </span>
                    <span className={styles.value}> {data.appInfo.cpm} </span>
                  </div>
                  <div className={styles.nodeItem}>
                    <span className={styles.text}> Avg Response Time </span>
                    <span className={styles.value}> {data.appInfo.avgResponseTime} </span>
                  </div>
                  <div className={styles.nodeItem}>
                    <span className={styles.text}> Total Server </span>
                    <span className={styles.value}> {data.appInfo.numOfServer} </span>
                  </div>
                  <hr className={styles.hLine} />
                  <Button onClick={() => redirect(this.props.history, '/monitor/application', { key: data.appInfo.id, label: data.appInfo.name })} style={{ marginTop: 15, width: '100%', backgroundColor: 'rgb(35, 121, 201)', color: 'white' }}>查看更多</Button>
                </Card>
            )
            : (
              <Card title="Overview" style={{ height: 672 }}>
                {/* <Select
                  mode="tags"
                  style={{ width: '100%', marginBottom: 20 }}
                  placeholder="Filter application"
                  onChange={this.handleFilterApplication}
                  tokenSeparators={[',']}
                  value={appFilters}
                >
                  {data.getClusterTopology.nodes.filter(_ => _.sla)
                    .map(_ => <Option key={_.name}>{_.name}</Option>)}
                </Select> */}
                {/* <div className={styles.modalShadow} /> */}
                <span onClick={this.closeModal.bind(this, false)} className={styles.closeIcon}> <Icon type="close" theme="outlined" /> </span>
                <DescriptionList layout="vertical" >
                  {/* <Description term="Total">{topologData.nodes.length}</Description> */}
                  <div key="total" className={styles.nodeItem}>
                    <span key="Total" className={styles.text}> Total </span>
                    <span key={topologData.nodes.length} className={styles.value}>
                      {topologData.nodes.length}
                    </span>
                  </div>
                  {this.renderNodeTypePanel(topologData)}
                </DescriptionList>
              </Card>
            )}
            </Col>
          ) : null
          }
        </Row>
      </Panel>
    );
  }
}
