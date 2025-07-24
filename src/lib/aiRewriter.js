// Claude query rewriter for AI-powered search enhancement
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function rewriteQuery(originalQuery, context = {}) {
  try {
    const prompt = `You are a search query optimization expert. Your task is to rewrite the user's query to improve search results while maintaining the original intent.

Original Query: "${originalQuery}"
Context: ${JSON.stringify(context)}

Please provide:
1. A rewritten query that's optimized for search
2. A brief explanation of the changes made
3. Any additional search terms or filters that might be helpful

Format your response as JSON:
{
  "rewrittenQuery": "optimized query here",
  "explanation": "brief explanation",
  "suggestedFilters": ["filter1", "filter2"],
  "confidence": 0.95
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return {
          rewrittenQuery: originalQuery,
          explanation: 'Failed to parse AI response',
          suggestedFilters: [],
          confidence: 0.5
        };
      }
    }

    return {
      rewrittenQuery: originalQuery,
      explanation: 'No text response from AI',
      suggestedFilters: [],
      confidence: 0.5
    };
  } catch (error) {
    console.error('AI query rewriter error:', error);
    return {
      rewrittenQuery: originalQuery,
      explanation: 'AI service unavailable',
      suggestedFilters: [],
      confidence: 0.5
    };
  }
}

export async function enhanceSearchResults(results, originalQuery) {
  try {
    const prompt = `You are analyzing search results to provide insights and suggestions.

Original Query: "${originalQuery}"
Number of Results: ${results.length}

Please analyze these results and provide:
1. A summary of what was found
2. Suggestions for refining the search
3. Any patterns or insights from the results

Format your response as JSON:
{
  "summary": "brief summary",
  "suggestions": ["suggestion1", "suggestion2"],
  "insights": ["insight1", "insight2"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch (parseError) {
        console.error('Failed to parse AI analysis:', parseError);
        return {
          summary: 'Unable to analyze results',
          suggestions: [],
          insights: []
        };
      }
    }

    return {
      summary: 'No analysis available',
      suggestions: [],
      insights: []
    };
  } catch (error) {
    console.error('AI result enhancement error:', error);
    return {
      summary: 'AI service unavailable',
      suggestions: [],
      insights: []
    };
  }
}

export default {
  rewriteQuery,
  enhanceSearchResults
}; 