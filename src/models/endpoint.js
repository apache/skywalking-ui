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


import { base, saveOptionsInState } from '../utils/models';
import { exec } from '../services/graphql';

const optionsQuery = `
  query ServiceOption($duration: Duration!) {
    serviceId: getAllServices(duration: $duration) {
      key: id
      label: name
    }
  }
`;

const dataQuery = `
  query Endpoint($endpointId: ID!, $duration: Duration!, $traceCondition: TraceQueryCondition!) {
    getEndpointResponseTimeTrend: getLinearIntValues(metric: {
      name: "endpointResponseTimeTrend"
      id: $endpointId
    }, duration: $duration) {
      values {
        value
      }
    }
    getEndpointThroughputTrend: getLinearIntValues(metric: {
      name: "endpointResponseTimeTrend"
      id: $endpointId
    }, duration: $duration) {
      values {
        value
      }
    }
    getEndpointSLATrend: getLinearIntValues(metric: {
      name: "endpointResponseTimeTrend"
      id: $endpointId
    }, duration: $duration) {
      values {
        value
      }
    }
    queryBasicTraces(condition: $traceCondition) {
      traces {
        key: segmentId
        operationNames
        duration
        start
        isError
        traceIds
      }
      total
    }
  }
`;


const spanQuery = `query Spans($traceId: ID!) {
  queryTrace(traceId: $traceId) {
    spans {
      traceId
      segmentId
      spanId
      parentSpanId
      refs {
        traceId
        parentSegmentId
        parentSpanId
        type
      }
      serviceCode
      startTime
      endTime
      operationName
      type
      peer
      component
      isError
      layer
      tags {
        key
        value
      }
      logs {
        time
        data {
          key
          value
        }
      }
    }
  }
}`;

export default base({
  namespace: 'endpoint',
  state: {
    getEndpointResponseTimeTrend: {
      values: [],
    },
    getEndpointThroughputTrend: {
      values: [],
    },
    getEndpointSLATrend: {
      values: [],
    },
    getEndpointTopology: {
      nodes: [],
      calls: [],
    },
    queryBasicTraces: {
      traces: [],
      total: 0,
    },
  },
  dataQuery,
  optionsQuery,
  effects: {
    *fetchSpans({ payload }, { call, put }) {
      const response = yield call(exec, { query: spanQuery, variables: payload.variables });
      yield put({
        type: 'saveSpans',
        payload: response,
        traceId: payload.variables.traceId,
      });
    },
  },
  reducers: {
    saveSpans(state, { payload, traceId }) {
      const { data } = state;
      return {
        ...state,
        data: {
          ...data,
          queryTrace: payload.data.queryTrace,
          currentTraceId: traceId,
          showTimeline: true,
        },
      };
    },
    saveServiceInfo(preState, { payload: allOptions }) {
      const rawState = saveOptionsInState(null, preState, { payload: allOptions });
      const { data } = rawState;
      if (data.serviceInfo) {
        return rawState;
      }
      const { variables: { values } } = rawState;
      if (!values.serviceId) {
        return rawState;
      }
      return {
        ...rawState,
        data: {
          ...data,
          serviceInfo: { serviceId: values.serviceId },
        },
      };
    },
    hideTimeline(state) {
      const { data } = state;
      return {
        ...state,
        data: {
          ...data,
          showTimeline: false,
        },
      };
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, state }) => {
        if (pathname === '/monitor/endpoint' && state) {
          dispatch({
            type: 'saveVariables',
            payload: {
              values: {
                endpointId: state.key,
                serviceId: state.serviceId,
              },
              labels: {
                endpointId: state.label,
                serviceId: state.serviceName,
              },
            },
          });
          dispatch({
            type: 'saveData',
            payload: {
              serviceInfo: { serviceId: state.serviceId },
              endpointInfo: { key: state.key, label: state.label },
            },
          });
        }
      });
    },
  },
});
