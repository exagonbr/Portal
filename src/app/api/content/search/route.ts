import { NextResponse } from 'next/server';
import { ContentSearchResult, ContentMetadata } from '@/types/content';
import { s3Service } from '@/services/s3Service';

// Mock semantic search function - Replace with actual AI-powered search
async function semanticSearch(
  query: string,
  contents: ContentMetadata[]
): Promise<ContentSearchResult[]> {
  // Normalize query
  const normalizedQuery = query.toLowerCase();
  const queryWords = normalizedQuery.split(' ');

  // Calculate relevance scores and matched tags for each content
  const results = contents.map(content => {
    // Calculate text match score
    const titleScore = calculateTextMatchScore(content.title.toLowerCase(), queryWords);
    const descriptionScore = calculateTextMatchScore(content.description.toLowerCase(), queryWords);
    const tagScore = calculateTagMatchScore(content.tags, queryWords);

    // Find matched tags
    const matchedTags = content.tags.filter(tag =>
      queryWords.some(word => tag.toLowerCase().includes(word))
    );

    // Combine scores with weights
    const relevanceScore = (
      titleScore * 0.4 +
      descriptionScore * 0.3 +
      tagScore * 0.3
    );

    return {
      content,
      relevanceScore,
      matchedTags
    };
  });

  // Sort by relevance score
  return results
    .filter(result => result.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function calculateTextMatchScore(text: string, queryWords: string[]): number {
  const matches = queryWords.filter(word => text.includes(word));
  return matches.length / queryWords.length;
}

function calculateTagMatchScore(tags: string[], queryWords: string[]): number {
  const normalizedTags = tags.map(tag => tag.toLowerCase());
  const matches = queryWords.filter(word =>
    normalizedTags.some(tag => tag.includes(word))
  );
  return matches.length / queryWords.length;
}

export async function POST(request: Request) {
  try {
    const { query, type, tags } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Get all contents
    const contents = await s3Service.listContents();

    // Perform semantic search
    const searchResults = await semanticSearch(query, contents);

    // Apply additional filters if provided
    let filteredResults = searchResults;
    if (type) {
      filteredResults = filteredResults.filter(
        result => result.content.type === type
      );
    }
    if (tags && tags.length > 0) {
      filteredResults = filteredResults.filter(result =>
        tags.every(tag => result.content.tags.includes(tag))
      );
    }

    return NextResponse.json({
      results: filteredResults,
      totalResults: filteredResults.length
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
