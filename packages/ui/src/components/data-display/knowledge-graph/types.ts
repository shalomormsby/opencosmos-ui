export type KnowledgeNodeType = 'entity' | 'concept' | 'connection'
export type KnowledgeConfidence = 'high' | 'medium' | 'speculative' | 'pending'

export interface KnowledgeNode {
  id: string
  title: string
  type: KnowledgeNodeType
  domain: string
  confidence: KnowledgeConfidence
  connectionCount: number
  summary: string
  vibrancy: number
  x: number
  y: number
}

export interface KnowledgeLink {
  source: string
  target: string
  label?: string
  tentative?: boolean
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[]
  links: KnowledgeLink[]
  generatedAt: number
}

export interface KnowledgePreviewData {
  nodes: Array<Pick<KnowledgeNode, 'id' | 'x' | 'y' | 'connectionCount' | 'domain'>>
  generatedAt: number
}

export interface KnowledgeGraphProps {
  data: KnowledgeGraphData
  onNodeClick?: (nodeId: string) => void
  pendingNodes?: KnowledgeNode[]
  ambient?: boolean
  className?: string
}
