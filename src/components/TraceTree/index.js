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

import React, { Component } from 'react';
import { Button } from 'antd';
import './style.less';
import Tree from './d3-trace';

const ButtonGroup = Button.Group;

export default class Trace extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    this.changeTree();
    window.addEventListener('resize', this.resize);
  }

  destroyed() {
    window.removeEventListener('resize', this.resize);
  }

  traverseTree(node, spanId, segmentId, data) {
    if (!node) return;
    if(node.spanId === spanId && node.segmentId === segmentId) {node.children.push(data);return;}
    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i+=1) {
          this.traverseTree(node.children[i],spanId,segmentId,data);
      }
    }
  }

  changeTree() {
    const propsData = this.props;
    this.segmentId = [];
    const segmentGroup = {}
    const segmentIdGroup = []
    const [...treeData] = propsData.data;
    const [...rowData] = propsData.data;
    this.traceId = propsData.data[0].traceId;
    treeData.forEach(i => {
      /* eslint-disable */
      if(i.endpointName) {
        i.label = i.endpointName;
        i.content = i.endpointName;
      } else {
        i.label = 'no operation name';
      }
      i.duration = i.endTime - i.startTime;
      i.spanSegId = `${i.segmentId},${i.spanId}`
      i.parentSpanSegId = i.parentSpanId === -1 ? null :  `${i.segmentId},${i.spanId}`
      i.children = [];
      if(segmentGroup[i.segmentId] === undefined){
        segmentIdGroup.push(i.segmentId);
        segmentGroup[i.segmentId] = [];
        segmentGroup[i.segmentId].push(i);
      }else{
        segmentGroup[i.segmentId].push(i);
      }
    });
    segmentIdGroup.forEach(id => {
      const currentSegment = segmentGroup[id].sort((a,b) => b.parentSpanId-a.parentSpanId);
      currentSegment.forEach(s =>{
        const index = currentSegment.findIndex(i => i.spanId === s.parentSpanId);
        if(index !== -1){
          currentSegment[index].children.push(s);
          currentSegment[index].children.sort((a, b) => a.spanId - b.spanId );
        }
      })
      segmentGroup[id] = currentSegment[currentSegment.length-1]
    })
    segmentIdGroup.forEach(id => {
      segmentGroup[id].refs.forEach(ref => {
        if(ref.traceId === this.traceId) {
          this.traverseTree(segmentGroup[ref.parentSegmentId],ref.parentSpanId,ref.parentSegmentId,segmentGroup[id])
        };
      })
    })
    for (const i in segmentGroup) {
      if(segmentGroup[i].refs.length ===0 )
      this.segmentId.push(segmentGroup[i]);
    }
    this.topSlow = [];
    this.topChild = [];

    this.collapse(this.segmentId[0]);
    this.topSlowMax = this.topSlow.sort().reverse()[0];
    this.topSlowMin = this.topSlow.sort().reverse()[4];

    this.topChildMax = this.topChild.sort().reverse()[0];
    this.topChildMin = this.topChild.sort().reverse()[4];
    this.tree = new Tree(this.echartsElement, propsData.showSpanModal, this.topSlowMax,this.topSlowMin,this.topChildMax,this.topChildMin)
    this.tree.init({label:`${this.traceId}`, children: this.segmentId}, rowData);
    this.tree.draw();
    this.resize = this.tree.resize.bind(this.tree);
  }
  collapse(d) {
    if(d.children){
      const dur = d.endTime - d.startTime;
      d.children.forEach(i => dur - i.endTime + i.startTime)
      d.dur = dur;
      this.topSlow.push(dur);
      this.topChild.push(d.children.length);
      d.childrenLength = d.children.length
      d.children.forEach((i) => this.collapse(i));
    }
  }
  
  render() {
    const newStyle = {
      height: 800,
      // ...style,
    };
    return (
      <div>
        <ButtonGroup>
            <Button onClick={() => {this.tree.setDefault();}}>Default</Button>
            <Button onClick={() => {this.tree.topSlow();}}>TopSlow 5</Button>
            <Button onClick={() => {this.tree.topChild();}}>TopSpan 5</Button>
        </ButtonGroup>
        <div
          ref={(e) => { this.echartsElement = e; }}
          style={newStyle}
          className="trace-tree"
        />
      </div>
    )
  }
}
