import { apiClient, type ApiResponse } from './apiClient';

export interface KnowledgeUploadData {
  content: string;
  title: string;
  category?: string;
  source?: string;
  knowledgeType: 'text';
}

export interface Knowledge {
  id: string;
  content: string;
  title: string;
  category?: string;
  source?: string;
  knowledgeType: 'text';
  chunk?: any;
  uploaderId: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  isSync: boolean;
}

export interface KnowledgeSearchData {
  query: string;
  category?: string;
  limit?: number;
}

export interface KnowledgeFileUploadResponse {
  knowledge: Knowledge;
  fileName: string;
  fileSize: number;
  chunkCount: number;
}

export interface SearchResult {
  content: string;
  title: string;
  score: number;
  metadata: {
    category: string;
    source: string;
    createdAt?: string;
  };
}

class RagApiService {
  async storeKnowledge(data: KnowledgeUploadData): Promise<ApiResponse<{ knowledge: Knowledge }>> {
    return apiClient.request<ApiResponse<{ knowledge: Knowledge }>>('/rag/knowledge/document', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async storeKnowledgeFile(
    file: File,
    metadata: {
      title?: string;
      category?: string;
      source?: string;
      knowledgeType?: string;
    }
  ): Promise<ApiResponse<KnowledgeFileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata fields if provided
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.category) formData.append('category', metadata.category);
    if (metadata.source) formData.append('source', metadata.source);
    if (metadata.knowledgeType) formData.append('knowledgeType', metadata.knowledgeType);

    return apiClient.request<ApiResponse<KnowledgeFileUploadResponse>>('/rag/knowledge/document/file', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      headers: {},
    });
  }

  async searchKnowledge(data: KnowledgeSearchData): Promise<ApiResponse<{ 
    query: string;
    results: SearchResult[];
    count: number;
  }>> {
    return apiClient.request<ApiResponse<{ 
      query: string;
      results: SearchResult[];
      count: number;
    }>>('/vector/search-knowledge', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const ragApi = new RagApiService();