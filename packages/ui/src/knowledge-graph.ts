// Subpath entry point: @opencosmos/ui/knowledge-graph
// Isolated so consumers who don't use it pay zero bundle cost.
// Peer deps required: sigma@^3.0.2, graphology@^0.26.0, @react-sigma/core@^5.0.0

export { KnowledgeGraph } from './components/data-display/knowledge-graph/KnowledgeGraph'
export type {
  KnowledgeGraphData,
  KnowledgeNode,
  KnowledgeLink,
  KnowledgeGraphProps,
  KnowledgePreviewData,
} from './components/data-display/knowledge-graph/types'
export { DOMAIN_COLORS } from './components/data-display/knowledge-graph/constants'
