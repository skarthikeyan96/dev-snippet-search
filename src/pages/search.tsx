import type React from "react";
import { useEffect, useRef } from "react";
import { Search, Zap } from "lucide-react";
import { algoliasearch } from "algoliasearch";
import instantsearch, { InstantSearch } from "instantsearch.js";
import {
  searchBox,
  hits,
  pagination,
  configure,
  refinementList,
} from "instantsearch.js/es/widgets";
import { decode } from "he";

interface SearchHit {
  objectID: string;
  _highlightResult: {
    title?: { value: string };
    snippet?: { value: string };
  };
  title: string;
  snippet: string;
  tags: string[] | string;
  source: string;
  url: string;
}

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

// Simple markdown parser for tags
const parseMarkdownInTag = (tag: string): string => {
  return (
    tag
      // Bold text: **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      // Italic text: *text* or _text_
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Inline code: `code`
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>'
      )
      // Links: [text](url)
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // Strikethrough: ~~text~~
      .replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>')
  );
};

export default function SnippetSearchApp() {
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInstanceRef = useRef<InstantSearch | null>(null);

  // Initialize Algolia search
  useEffect(() => {
    if (!searchContainerRef.current) return;

    const search = instantsearch({
      indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!,
      searchClient,
    });

    search.addWidgets([
      searchBox({
        container: "#algolia-searchbox",
        placeholder: "Search snippets...",
        cssClasses: {
          root: "relative",
          form: "relative",
          input:
            "w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg bg-white",
          submit:
            "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
          reset:
            "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600",
        },
      }),
      refinementList({
        container: "#algolia-filters",
        attribute: "source",
        cssClasses: {
          root: "mb-4",
          list: "flex flex-wrap gap-2",
          item: "",
          label: "flex items-center gap-2",
          checkbox: "rounded border-gray-300",
          count: "text-xs text-gray-500",
        },
      }),
      hits({
        container: "#algolia-hits",
        cssClasses: {
          root: "space-y-6",
          list: "space-y-6",
          item: "",
        },
        templates: {
          item: (hit: SearchHit) => {
            // Normalize tags: always array
            const tagArray = Array.isArray(hit.tags)
              ? hit.tags
              : typeof hit.tags === "string"
              ? hit.tags.split(",").map((tag) => tag.trim())
              : [];

            const sourceText = hit.source || "Unknown Source";
            const titleText =
              hit._highlightResult.title?.value || hit.title || "";
            const snippetText =
              hit._highlightResult.snippet?.value || hit.snippet || "";

            // Decode HTML entities and clean up the content
            const decodedSnippetText = decode(snippetText);

            // Remove HTML tags and extract clean text for display
            const cleanSnippetText = decodedSnippetText
              .replace(/<img[^>]*>/g, "") // Remove image tags
              .replace(/<[^>]*>/g, "") // Remove all other HTML tags
              .replace(/\s+/g, " ") // Normalize whitespace
              .trim();

            console.log("Original:", snippetText);
            console.log("Decoded:", decodedSnippetText);
            console.log("Clean:", cleanSnippetText);

            return `
              <div class="hover:shadow-lg transition-shadow rounded-lg border bg-card text-card-foreground shadow-sm">
                <div class="p-6">
                  <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-semibold text-gray-900">${titleText}</h3>
                    <div class="flex items-center gap-2">
                      <span class="text-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        ${sourceText}
                      </span>
                      <button class="text-gray-400 hover:text-gray-600 p-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4 mb-4 text-sm overflow-x-auto prose prose-sm max-w-none">
                    <div class="whitespace-pre-wrap">${cleanSnippetText}</div>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex flex-wrap gap-2">
                      ${tagArray
                        .map(
                          (tag) =>
                            `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mr-2 mb-2">${parseMarkdownInTag(
                              tag
                            )}</span>`
                        )
                        .join("")}
                    </div>
                    <a href="${
                      hit.url
                    }" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      Read more
                    </a>
                  </div>
                </div>
              </div>
            `;
          },
          empty: `
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <h3 class="text-xl font-medium text-gray-900 mb-2">No snippets found</h3>
              <p class="text-gray-500">Try adjusting your search terms or browse all snippets</p>
            </div>
          `,
        },
      }),
      configure({
        hitsPerPage: 4,
      }),
      pagination({
        container: "#algolia-pagination",
        cssClasses: {
          root: "flex justify-center items-center gap-2 mt-8",
          list: "flex gap-1",
          item: "",
          link: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-10 w-10",
          selectedItem: "",
          disabledItem: "opacity-50 pointer-events-none",
          previousPageItem: "",
          nextPageItem: "",
        },
      }),
    ]);

    search.start();
    searchInstanceRef.current = search;

    return () => {
      search.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Snippet Search
          </h1>
          <p className="text-gray-600">
            Discover and manage code snippets from across the web
          </p>
        </div>

        {/* Search Interface */}
        <div ref={searchContainerRef} className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <div id="algolia-searchbox"></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-500">Search powered by Algolia</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>Powered by</span>
                <Zap className="w-3 h-3" />
                <span className="font-medium">Algolia</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div id="algolia-filters"></div>

          {/* Search Results */}
          <div id="algolia-hits"></div>

          {/* Pagination */}
          <div id="algolia-pagination"></div>
        </div>
      </div>
    </div>
  );
}
