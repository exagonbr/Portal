'use client';

import { useState } from 'react';
import { ContentMetadata, ContentSearchResult } from '@/types/content';
import OpenAI from "openai";
import {responseStatus} from "@openai/Responses/ResponseStatus"

interface SearchResponse {
  results: ContentSearchResult[];
  totalResults: number;
}

const openai = new OpenAI({
  apiKey: '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',
});


export default function ContentSearch() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ContentSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setSearching(true);
      setError(null);

      const response = await openai.responses.create({
        model: "gpt-4.1",
        input: query,
        text: {
          "format": {
            "type": "text"
          }
        },
        reasoning: {},
        tools: [],
        temperature: 1,
        max_output_tokens: 2048,
        top_p: 1,
        store: true
      });

      if (response.status != responseStatus.completed ) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar conteúdo com IA..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">
              search
            </span>
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className={`px-4 py-2 rounded-lg text-white ${
              searching || !query.trim()
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {error ? (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map(({ content, relevanceScore, matchedTags }) => (
            <div
              key={content.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-start p-4 gap-4">
                {/* Thumbnail */}
                <div className="w-32 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={content.thumbnail || '/placeholder-thumbnail.png'}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-lg truncate">
                      {content.title}
                    </h3>
                    <span className="flex-shrink-0 text-sm text-gray-500">
                      Relevância: {(relevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {content.description}
                  </p>

                  {/* Matched Tags */}
                  {matchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {matchedTags.map(tag => (
                        <span
                          key={tag}
                          className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Other Tags */}
                  {content.tags.filter(tag => !matchedTags.includes(tag)).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {content.tags
                        .filter(tag => !matchedTags.includes(tag))
                        .map(tag => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t px-4 py-2 bg-gray-50 flex justify-end gap-2">
                <button
                  onClick={() => window.open(content.url, '_blank')}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Visualizar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : query && !searching ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum resultado encontrado
        </div>
      ) : null}
    </div>
  );
}
