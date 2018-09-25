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
import { exec } from '../services/graphql';

const nodeMetricQuery = `
  query NodeMetric($duration: Duration!, $ids: [ID!]!) {
    sla: getValues(metric: {
      name: "service_relation_server_call_sla"
      ids: $ids
    }, duration: $duration) {
      values {
        id
        value
      }
    }
  }
`;

export default base({
  namespace: 'topology',
  state: {
    getGlobalTopology: {
      nodes: [],
      calls: [],
    },
    sla: {
      values: [],
    },
  },
  dataQuery: `
    query Topology($duration: Duration!) {
      getGlobalTopology(duration: $duration) {
        nodes {
          id
          name
          type
          isReal
        }
        calls {
          id
          source
          target
          callType
          detectPoint
        }
      }
    }
  `,
  effects: {
    *fetchNodeMetrics({ payload }, { call, put }) {
      const response = yield call(exec, { query: nodeMetricQuery, variables: payload.variables });
      if (!response.data) {
        return;
      }
      yield put({
        type: 'saveData',
        payload: response.data,
      });
    },
  },
  reducers: {
    filterApplication(preState, { payload: { aa } }) {
      const { variables } = preState;
      if (aa.length < 1) {
        const newVariables = { ...variables };
        delete newVariables.appRegExps;
        delete newVariables.appFilters;
        return {
          ...preState,
          variables: newVariables,
        };
      }
      return {
        ...preState,
        variables: {
          ...variables,
          appFilters: aa,
          appRegExps: aa.map((a) => {
            try {
              return new RegExp(a, 'i');
            } catch (e) {
              return null;
            }
          }),
        },
      };
    },
  },
});
