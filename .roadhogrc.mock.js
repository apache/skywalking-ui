import mockjs from 'mockjs';
import fs from 'fs';
import { delay } from 'roadhog-api-doc';
import { getTopology } from './mock/topology';
import { getAllApplication, getApplication } from './mock/application';
import { searchServer, getServer } from './mock/server';
import { searchService, getService } from './mock/service';
import { getAlarm, getNoticeAlarm, AlarmTrend } from './mock/alarm';
import { getAllApplication as getAllApplicationForTrace, getTrace, getSpans } from './mock/trace'
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { graphql } from 'graphql';
import { ClusterBrief } from './mock/metadata';
import { Thermodynamic } from './mock/metric';
import { getTopN } from './mock/aggregation';

const noMock = process.env.NO_MOCK === 'true';

const resolvers = {
  Query: {
    getTopN
  }
}

const schema = makeExecutableSchema({ typeDefs: [
  fs.readFileSync('query-protocol/common.graphqls', 'utf8'),
  fs.readFileSync('query-protocol/metadata.graphqls', 'utf8'),
  fs.readFileSync('query-protocol/alarm.graphqls', 'utf8'),
  fs.readFileSync('query-protocol/metric.graphqls', 'utf8'),
  fs.readFileSync('query-protocol/aggregation.graphqls', 'utf8'),
], resolvers });

addMockFunctionsToSchema({ schema, mocks: {
  ClusterBrief, Thermodynamic, AlarmTrend
}, preserveResolvers: true });

const proxy = {
  'POST /api/graphql': (req, res) => {
    const { query: source, variables: variableValues } = req.body;
    graphql({ schema, source, variableValues }).then((result) => res.send(result));
  },
  'POST /api/topology': getTopology,
  'POST /api/application/options': getAllApplication,
  'POST /api/application': getApplication,
  'POST /api/server/search': searchServer,
  'POST /api/server': getServer,
  'POST /api/service/search': searchService,
  'POST /api/service': getService,
  'POST /api/service/options': getAllApplication,
  'POST /api/alarm': getAlarm,
  'POST /api/notice': getNoticeAlarm,
  'POST /api/trace/options': getAllApplicationForTrace,
  'POST /api/trace': getTrace,
  'POST /api/spans': getSpans,
  'POST /api/login/account': (req, res) => {
    const { password, userName } = req.body;
    if (password === '888888' && userName === 'admin') {
      res.send({
        status: 'ok',
        currentAuthority: 'admin',
      });
      return;
    }
    res.send({
      status: 'error',
      currentAuthority: 'guest',
    });
  },
};

export default noMock ? {} : delay(proxy, 1000);
