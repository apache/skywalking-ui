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

/* eslint-disable */
import * as d3 from 'd3';

export default class TraceMap {
  constructor(el) {
    this.type = {
      MQ: '#bf99f8',
      Http: '#72a5fd',
      Database: '#ff6732',
      Unknown: '#ffc107',
      Cache: '#00bcd4',
      RPCFramework: '#ee4395',
    };
    this.el = el;
    this.width = el.clientWidth;
    this.height = el.clientHeight;
    this.treemap = d3.tree().size([this.height * 0.7, this.width]);
    this.svg = '';
    this.timeGroup = '';
    this.root = '';
    this.i = 0;
    this.j = 0;
  }
  resize() {
    d3.select(this.el)
      .select('svg')
      .remove();
    this.width = this.el.clientWidth;
    this.height = this.el.clientHeight;
    this.draw(this.data,this.row,this.showSpanModal);
  }
  draw(data, row, showSpanModal) {
    this.showSpanModal = showSpanModal;
    this.row = row;
    this.data = data;
    this.min = d3.min(this.row.map(i => i.startTime));
    this.max = d3.max(this.row.map(i => i.endTime - this.min));
    this.list = Array.from(new Set(this.row.map(i => i.serviceCode)));
    this.sequentialScale = d3
      .scaleSequential()
      .domain([0, this.list.length])
      .interpolator(d3.interpolateCool);
    this.xScale = d3
      .scaleLinear()
      .range([0, this.width - 10])
      .domain([0, this.max]);
    this.xAxis = d3.axisTop(this.xScale).tickFormat(d => {
      if (d === 0) return 0;
      if (d >= 1000) return d / 1000 + 's';
      return d + ' ms';
    });

    this.body = d3
      .select(this.el)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    this.timeGroup = this.body.append('g').attr('transform', d => 'translate(5,30)');
    const main = this.body
      .append('g')
      .attr('transform', d => 'translate(0,' + this.row.length * 9 + ')');
    this.svg = main.append('g');
    this.root = d3.hierarchy(this.data, d => d.children);
    this.root.x0 = this.height / 2;
    this.root.y0 = 0;
    this.body
      .append('g')
      .attr('transform', `translate(5,20)`)
      .call(this.xAxis);
    this.update(this.root);
  }
  update(source) {
    const treeData = this.treemap(this.root);
    const nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);
    let index = -1;
    nodes.forEach(function(d) {
      d.y = d.depth * 200;
      d.timeX = ++index * 7;
    });

    this.body.call(this.getZoomBehavior(this.svg));

    const node = this.svg.selectAll('g.node').data(nodes, d => {
      return d.id || (d.id = ++this.i);
    });
    const timeNode = this.timeGroup.selectAll('g.time').data(nodes, d => {
      return d.id || (d.id = ++this.j);
    });

    // time
    const timeEnter = timeNode
      .enter()
      .append('g')
      .attr('class', 'time')
      .attr('transform', d => 'translate(' + 0 + ',' + d.timeX + ')');
    timeEnter
      .append('rect')
      .attr('height', 5)
      .attr('width', d => {
        if (!d.data.endTime || !d.data.startTime) return 0;
        return this.xScale(d.data.endTime - d.data.startTime) + 1;
      })
      .attr('rx', 2)
      .attr('ry', 2)
      .attr(
        'x',
        d => (!d.data.endTime || !d.data.startTime ? 0 : this.xScale(d.data.startTime - this.min))
      )
      .attr('y', -3)
      .style('fill', d => `${this.sequentialScale(this.list.indexOf(d.data.serviceCode))}`);
    var timeUpdate = timeEnter.merge(timeNode);

    timeUpdate
      .transition()
      .duration(600)
      .attr('transform', function(d) {
        return 'translate(' + 0 + ',' + d.timeX + ')';
      });
    const timeExit = timeNode
      .exit()
      .transition()
      .duration(600)
      .attr('transform', function(d) {
        return 'translate(' + 0 + ',' + 8 + ')';
      })
      .remove();
    // node
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', function(d) {
        return 'translate(' + source.y0 + ',' + source.x0 + ')';
      });
    nodeEnter
      .append('rect')
      .attr('class', 'block')
      .attr('x', '0')
      .attr('y', '-16')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', d => (d.data.isError ? '#ff57221a' : '#f7f7f7'))
      .attr('stroke', d => (d.data.isError ? '#ff5722aa' : '#e4e4e4'))
      .on('click', (d, i) => {
        this.showSpanModal(
          d.data,
          { width: '100%', top: -10, left: '0' },
          d3.select(nodeEnter._groups[0][i]).append('rect')
        );
      })
      .on('mouseenter', function(currNode, i) {
        d3.select(nodeEnter._groups[0][i])
          .select('g')
          .attr('opacity', 1);
      })
      .on('mouseleave', function(currNode, i) {
        d3.select(nodeEnter._groups[0][i])
          .select('g')
          .attr('opacity', 0);
      });

    const tooltip = nodeEnter
      .append('g')
      .attr('opacity', 0)
      .attr('transform', function(d) {
        return 'translate(0,-40)';
      });

    tooltip
      .append('rect')
      .attr('class', 'tooltip-box')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', function(d) {
        return d.data.label.length * 6 + 20;
      });
    tooltip
      .append('text')
      .attr('dy', 14)
      .attr('fill', '#fafafa')
      .attr('dx', 10)
      .text(function(d) {
        return d.data.label;
      });
    nodeEnter
      .append('text')
      .attr('dy', -4)
      .attr('x', 5)
      .attr('text-anchor', function(d) {
        return 'start';
      })
      .text(function(d) {
        return d.data.label.length > 23 ? d.data.label.slice(0, 23) : d.data.label;
      })
      .on('click', (d, i) => {
        this.showSpanModal(
          d.data,
          { width: '100%', top: -10, left: '0' },
          d3.select(nodeEnter._groups[0][i]).append('rect')
        );
        d3.event.stopPropagation();
      })
      .on('mouseenter', function(currNode, i) {
        d3.select(nodeEnter._groups[0][i])
          .select('g')
          .attr('opacity', 1);
      })
      .on('mouseleave', function(currNode, i) {
        d3.select(nodeEnter._groups[0][i])
          .select('g')
          .attr('opacity', 0);
      });

    nodeEnter
      .append('text')
      .attr('dy', 12)
      .attr('x', 8)
      .attr('text-anchor', function(d) {
        return 'start';
      })
      .attr('fill', d => {
        return this.type[d.data.layer];
      })
      .attr('stroke', d => {
        return this.type[d.data.layer];
      })
      .text(function(d) {
        return d.data.layer;
      })
      .on('click', (d, i) => {
        this.showSpanModal(
          d.data,
          { width: '100%', top: -10, left: '0' },
          d3.select(nodeEnter._groups[0][i]).append('rect')
        );
        d3.event.stopPropagation();
      })
      .on('mouseenter', function(currNode, i) {
        d3.select(nodeEnter._groups[0][i])
          .select('g')
          .attr('opacity', 1);
      })
      .on('mouseleave', function(currNode, i) {
        d3.select(nodeEnter._groups[0][i])
          .select('g')
          .attr('opacity', 0);
      });

    nodeEnter
      .append('text')
      .attr('dy', 12)
      .attr('x', 70)
      .attr('text-anchor', function(d) {
        return 'start';
      })
      .text(function(d) {
        return d.data.endTime ? d.data.endTime - d.data.startTime + ' ms' : d.data.traceId;
      })
      .on('click', (d, i) => {
        this.showSpanModal(
          d.data,
          { width: '100%', top: -10, left: '0' },
          d3.select(nodeEnter._groups[0][i]).append('rect')
        );
        d3.event.stopPropagation();
      })
      .on('mouseenter', function(currNode, i) {
        d3.select(nodeEnter._groups[0][i])
          .select('g')
          .attr('opacity', 1);
      })
      .on('mouseleave', function(currNode, i) {
        d3.select(nodeEnter._groups[0][i])
          .select('g')
          .attr('opacity', 0);
      });

    nodeEnter
      .append('circle')
      .attr('class', 'node')
      .attr('r', 4)
      .attr('cx', '150')
      .style('fill', function(d) {
        return d._children ? '#8543e0aa' : '#fff';
      })
      .on('click', click);

    var nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
      .transition()
      .duration(600)
      .attr('transform', function(d) {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    nodeUpdate
      .select('circle.node')
      .attr('r', 4)
      .attr('cx', '156')
      .style('fill', function(d) {
        return d._children ? '#8543e0aa' : '#fff';
      })
      .attr('cursor', 'pointer');

    var nodeExit = node
      .exit()
      .transition()
      .duration(600)
      .attr('transform', function(d) {
        return 'translate(' + source.y + ',' + source.x + ')';
      })
      .remove();

    nodeExit.select('circle').attr('r', 0);

    nodeExit.select('text').style('fill-opacity', 0);

    const link = this.svg.selectAll('path.link').data(links, function(d) {
      return d.id;
    });

    const linkEnter = link
      .enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('d', function(d) {
        const o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });

    const linkUpdate = linkEnter.merge(link);

    linkUpdate
      .transition()
      .duration(600)
      .attr('d', function(d) {
        return diagonal(d, d.parent);
      });

    link
      .exit()
      .transition()
      .duration(600)
      .attr('d', function(d) {
        var o = { x: source.x, y: source.y };
        return diagonal(o, o);
      })
      .remove();

    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    function diagonal(s, d) {
      return `M ${s.y} ${s.x}
      L  ${d.y + 158} ${d.x}`;
    }
    const that = this;
    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      that.update(d);
    }
  }
  getZoomBehavior(g) {
    return d3
      .zoom()
      .scaleExtent([0.3, 10])
      .on('zoom', () => {
        g.attr(
          'transform',
          `translate(${d3.event.transform.x},${d3.event.transform.y})scale(${d3.event.transform.k})`
        );
      });
  }
}
