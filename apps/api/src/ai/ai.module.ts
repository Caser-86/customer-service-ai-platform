import { Module } from '@nestjs/common';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { MockAiProvider } from './providers/mock-ai.provider';
import { OpenAiCompatibleProvider } from './providers/openai-compatible.provider';
import { VectorSearchService } from './vector-search.service';

@Module({
  providers: [
    AiOrchestratorService,
    MockAiProvider,
    OpenAiCompatibleProvider,
    VectorSearchService
  ],
  exports: [AiOrchestratorService, VectorSearchService]
})
export class AiModule {}
