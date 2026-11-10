import { Client } from '@elastic/elasticsearch';
import { config } from './env.js';

let esClient = null;

export const getElasticClient = () => {
  if (!esClient) {
    const options = {
      node: config.elasticsearch.node,
    };

    if (config.elasticsearch.username && config.elasticsearch.password) {
      options.auth = {
        username: config.elasticsearch.username,
        password: config.elasticsearch.password,
      };
    }

    esClient = new Client(options);
  }
  return esClient;
};

export const checkElasticConnection = async () => {
  try {
    const client = getElasticClient();
    const health = await client.cluster.health({});
    console.log(`[Elasticsearch] Cluster status: ${health.status}`);
    return true;
  } catch (error) {
    console.warn(`[Elasticsearch] Connection warning: ${error.message}`);
    return false;
  }
};

