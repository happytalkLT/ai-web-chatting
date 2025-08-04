const EmbeddingUtil = require("../../utils/embedding");
const QdrantService = require("../qdrant-service");
const MySQLDatabaseService = require('../mysql-database');

const searchHappytalkGuide = async ({query}) => {
  console.log({query})
  // 검색 쿼리를 임베딩으로 변환
  const queryEmbedding = await EmbeddingUtil.createEmbedding(query, 'RETRIEVAL_QUERY');

  // 관련 지식 검색
  const results = await QdrantService.searchKnowledge(
    queryEmbedding,
    null,
    10
  );
  const knowledge = await Promise.all(results.map(async (search) => {
    const knowledge = await MySQLDatabaseService.findSearchedKnowledge(search.metadata.knowledgeId);
    return {content: knowledge.content, title: knowledge.title, id: knowledge.id};
  }));

  if (!knowledge) {
    return  {message: 'No knowledge found'};
  }
  return knowledge
}
module.exports = searchHappytalkGuide;
