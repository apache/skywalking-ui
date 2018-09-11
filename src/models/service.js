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

const optionsQuery = `
  query ServiceOption($duration: Duration!) {
    serviceId: getAllServices(duration: $duration) {
      key: id
      label: name
    }
  }
`;

const dataQuery = `
  query Service($serviceId: ID!, $duration: Duration!) {
    getSlowEndpoint: getTopN(duration: $duration, condition: {
      name: "slowEndpoint",
      topN: 10,
      order: DES,
      filterScope: ENDPOINT,
      filterId: $serviceId
    }) {
      key: id
      label: name
      value
    }
    getServiceInstanceThroughput: getTopN(duration: $duration, condition: {
      name: "serviceInstanceThroughtput",
      topN: 10,
      order: DES,
      filterScope: SERVICE_INSTANCE,
      filterId: $serviceId
    }) {
      key: id
      label: name
      value
    }
    getServiceInstances(duration: $duration, id: $serviceId) {
      key: id
      name
      attributes {
        name
        value
      }
      language
    }
    getServiceTopology(serviceId: $serviceId, duration: $duration) {
      nodes {
        id
        name
        type
        isReal
      }
      calls {
        source
        target
        callType
        cpm
      }
    }
  }
`;

const serviceInstanceQuery = `
query ServiceInstance($serviceInstanceId: ID!, $duration: Duration!) {
  getServiceInstanceResponseTimeTrend: getLinearIntValues(metric: {
    name: "serviceInstanceResponseTimeTrend"
    id: $serviceInstanceId
  }, duration: $duration) {
    values {
      value
    }
  }
  getServiceInstanceThroughputTrend: getLinearIntValues(metric: {
    name: "serviceInstanceThroughputTrend"
    id: $serviceInstanceId
  }, duration: $duration) {
    values {
      value
    }
  }
  getCPUTrend: getLinearIntValues(metric: {
    name: "CPUTrend"
    id: $serviceInstanceId
  }, duration: $duration) {
    values {
      value
    }
  }
  youngGCCount: getLinearIntValues(metric: {
    name: "youngGCCount"
    id: $serviceInstanceId
  }, duration: $duration) {
    values {
      value
    }
  }
  oldGCCount: getLinearIntValues(metric: {
    name: "oldGCCount"
    id: $serviceInstanceId
  }, duration: $duration) {
    values {
      value
    }
  }
  youngGCTime: getLinearIntValues(metric: {
    name: "youngGCTime"
    id: $serviceInstanceId
  }, duration: $duration) {
    values {
      value
    }
  }
  oldGCTime: getLinearIntValues(metric: {
    name: "oldGCTime"
    id: $serviceInstanceId
  }, duration: $duration) {
    values {
      value
    }
  }
  heap: getLinearIntValues(metric: {
    name: "heap"
    id: $serviceInstanceId
  }, duration: $duration) {
    values {
      value
    }
  }
  maxHeap: getLinearIntValues(metric: {
    name: "maxHeap"
    id: $serviceInstanceId
  }, duration: $duration) {
    values {
      value
    }
  }
  noheap: getLinearIntValues(metric: {
    name: "noheap"
    id: $serviceInstanceId
  }, duration: $duration) {
    values {
      value
    }
  }
  maxNoheap: getLinearIntValues(metric: {
    name: "maxNoheap"
    id: $serviceInstanceId
  }, duration: $duration) {
    values {
      value
    }
  }
}
`;

export default base({
  namespace: 'service',
  state: {
    allService: [],
    getSlowEndpoint: [],
    getServiceInstanceThroughput: [],
    getServiceTopology: {
      nodes: [],
      calls: [],
    },
    getServiceInstances: [],
    showServiceInstance: false,
    serviceInstanceInfo: {},
    getServiceInstanceResponseTimeTrend: {
      values: [],
    },
    getServiceInstanceThroughputTrend: {
      values: [],
    },
    getCPUTrend: {
      values: [],
    },
    heap: {
      values: [],
    },
    maxHeap: {
      values: [],
    },
    noheap: {
      values: [],
    },
    maxNoheap: {
      values: [],
    },
    youngGCCount: {
      values: [],
    },
    oldGCCount: {
      values: [],
    },
    youngGCTime: {
      values: [],
    },
    oldGCTime: {
      values: [],
    },
  },
  optionsQuery,
  dataQuery,
  effects: {
    *fetchServiceInstance({ payload }, { call, put }) {
      const { variables, serviceInstanceInfo } = payload;
      const response = yield call(exec, { variables, query: serviceInstanceQuery });
      if (!response.data) {
        return;
      }
      yield put({
        type: 'saveServiceInstance',
        payload: response.data,
        serviceInstanceInfo,
      });
    },
  },
  reducers: {
    saveService(preState, { payload }) {
      const { data } = preState;
      return {
        ...preState,
        data: {
          ...data,
          ...payload,
          serviceInstanceInfo: {},
          getServiceInstanceResponseTimeTrend: {
            values: [],
          },
          getServiceInstanceThroughputTrend: {
            values: [],
          },
          getCPUTrend: {
            values: [],
          },
          heap: {
            values: [],
          },
          maxHeap: {
            values: [],
          },
          noheap: {
            values: [],
          },
          maxNoheap: {
            values: [],
          },
          youngGCCount: {
            values: [],
          },
          oldGCCount: {
            values: [],
          },
          youngGCTime: {
            values: [],
          },
          oldGCTime: {
            values: [],
          },
        },
      };
    },
    saveServiceInstance(preState, { payload, serviceInstanceInfo }) {
      const { data } = preState;
      return {
        ...preState,
        data: {
          ...data,
          serviceInstanceInfo,
          ...payload,
        },
      };
    },
    showServiceInstance(preState) {
      const { data } = preState;
      return {
        ...preState,
        data: {
          ...data,
          showServiceInstance: true,
        },
      };
    },
    hideServiceInstance(preState) {
      const { data } = preState;
      return {
        ...preState,
        data: {
          ...data,
          showServiceInstance: false,
        },
      };
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, state }) => {
        if (pathname === '/monitor/service' && state) {
          dispatch({
            type: 'saveVariables',
            payload: {
              values: {
                serviceId: `${state.key}`,
              },
              labels: {
                serviceId: state.label,
              },
            },
          });
        }
      });
    },
  },
});
