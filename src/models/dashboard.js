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


import { base } from '../utils/models';

export default base({
  namespace: 'dashboard',
  state: {
    getGlobalBrief: {
      numOfService: 0,
      numOfEndpoint: 0,
      numOfDatabase: 0,
      numOfCache: 0,
      numOfMQ: 0,
    },
    getAlarmTrend: {
      numOfAlarm: [],
    },
    getThermodynamic: {
      nodes: [],
      responseTimeStep: 0,
    },
    getTopNSlowEndpoint: [],
    getTopNServiceThroughput: [],
  },
  dataQuery: `
    query Dashboard($duration: Duration!) {
      getGlobalBrief(duration: $duration) {
        numOfService
        numOfEndpoint
        numOfDatabase
        numOfCache
        numOfMQ
      }
      getAlarmTrend(duration: $duration) {
        numOfAlarm
      }
      getThermodynamic(duration: $duration, metric: {
        name: "Endpoint_avg"
      }) {
        nodes
        responseTimeStep: axisYStep
      }
      getTopNSlowEndpoint: getTopN(duration: $duration, condition: {
        name: "slowEndpoint",
        topN: 10,
        order: DES,
        filterScope: ENDPOINT
      }) {
        key: id
        label: name
        value
      }
      getTopNServiceThroughput: getTopN(duration: $duration, condition: {
        name: "serviceThroughput",
        topN: 10,
        order: DES,
        filterScope: SERVICE
      }) {
        key: id
        label: name
        value
      }
    }
  `,
});
