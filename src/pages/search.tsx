import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Search, Zap, Bookmark, X, ExternalLink } from "lucide-react";
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
import { useToast } from "../hooks/use-toast";
import { Toaster } from "../components/ui/toaster";
import { getAnalytics } from "../lib/analytics";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import UserAnalytics from "../components/UserAnalytics";

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

// localStorage key for saved snippets
const SAVED_SNIPPETS_KEY = "dev-snippet-search-saved-snippets";

// localStorage utility functions
const saveSnippetsToStorage = (snippets: SearchHit[]) => {
  try {
    localStorage.setItem(SAVED_SNIPPETS_KEY, JSON.stringify(snippets));
  } catch (error) {
    console.error("Error saving snippets to localStorage:", error);
  }
};

const loadSnippetsFromStorage = (): SearchHit[] => {
  try {
    const saved = localStorage.getItem(SAVED_SNIPPETS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading snippets from localStorage:", error);
    return [];
  }
};

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

  // State for saved snippets - start with empty array to avoid hydration mismatch
  const [savedSnippets, setSavedSnippets] = useState<SearchHit[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const { toast } = useToast();
  const analytics = getAnalytics();

  // Load from localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    const saved = loadSnippetsFromStorage();
    setSavedSnippets(saved);
    setIsHydrated(true);

    // Track page view
    analytics.trackEvent("page_view", {
      page: "/search",
      savedSnippetsCount: saved.length,
    });
  }, [analytics]);

  // Save to localStorage whenever savedSnippets changes (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveSnippetsToStorage(savedSnippets);
    }
  }, [savedSnippets, isHydrated]);

  // Make analytics available globally for inline handlers
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { analytics: typeof analytics }).analytics =
        analytics;
    }
  }, [analytics]);

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

            // Check if snippet is saved (only after hydration)
            const isSaved =
              isHydrated &&
              savedSnippets.some((saved) => saved.objectID === hit.objectID);

            return `
              <div class="hover:shadow-lg transition-shadow rounded-lg border bg-card text-card-foreground shadow-sm">
                <div class="p-4 sm:p-6">
                  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <h3 class="text-lg sm:text-xl font-semibold text-gray-900 flex-1">${titleText}</h3>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class="text-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gray-100 text-gray-700">
                        ${sourceText}
                      </span>
                      <button 
                        class="text-gray-400 hover:text-gray-600 p-1 bookmark-btn ${
                          isSaved ? "text-blue-600 hover:text-blue-700" : ""
                        }" 
                        data-object-id="${hit.objectID}"
                        data-saved="${isSaved}"
                        title="${
                          isSaved ? "Remove from saved" : "Save snippet"
                        }"
                      >
                        <svg class="w-4 h-4 ${
                          isSaved ? "fill-current" : ""
                        }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 text-sm overflow-x-auto prose prose-sm max-w-none">
                    <div class="whitespace-pre-wrap">${cleanSnippetText}</div>
                  </div>

                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div class="flex flex-wrap gap-1 sm:gap-2">
                      ${tagArray
                        .map(
                          (tag) =>
                            `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">${parseMarkdownInTag(
                              tag
                            )}</span>`
                        )
                        .join("")}
                    </div>
                    <a href="${
                      hit.url
                    }" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 self-start sm:self-auto" onclick="window.analytics && window.analytics.trackExternalLink('${
              hit.url
            }', '${hit.source}')">
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
          root: "flex justify-center items-center gap-1 sm:gap-2 mt-8",
          list: "flex gap-1 sm:gap-2",
          item: "",
          link: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-8 w-8 sm:h-10 sm:w-10",
          selectedItem: "",
          disabledItem: "opacity-50 pointer-events-none",
          previousPageItem: "",
          nextPageItem: "",
        },
      }),
    ]);

    search.start();
    searchInstanceRef.current = search;

    // Add event listener for bookmark buttons
    const handleBookmarkClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const bookmarkBtn = target.closest(".bookmark-btn") as HTMLElement;

      if (bookmarkBtn) {
        const objectId = bookmarkBtn.getAttribute("data-object-id");
        const isSaved = bookmarkBtn.getAttribute("data-saved") === "true";

        if (objectId) {
          // Find the snippet in search results
          const snippet =
            searchInstanceRef.current?.helper?.lastResults?.hits.find(
              (hit: SearchHit) => hit.objectID === objectId
            );

          if (snippet) {
            if (isSaved) {
              // Remove from saved snippets
              setSavedSnippets((prev) =>
                prev.filter((saved) => saved.objectID !== objectId)
              );
              bookmarkBtn.setAttribute("data-saved", "false");
              bookmarkBtn.classList.remove(
                "text-blue-600",
                "hover:text-blue-700"
              );
              bookmarkBtn.classList.add("text-gray-400", "hover:text-gray-600");
              bookmarkBtn.setAttribute("title", "Save snippet");
              const svg = bookmarkBtn.querySelector("svg");
              if (svg) svg.classList.remove("fill-current");

              // Track analytics
              analytics.trackSnippetSave(objectId, "unsave");

              // Show toast
              toast({
                title: "Snippet removed",
                description:
                  "Snippet has been removed from your saved collection.",
              });
            } else {
              // Add to saved snippets
              setSavedSnippets((prev) => [...prev, snippet]);
              bookmarkBtn.setAttribute("data-saved", "true");
              bookmarkBtn.classList.remove(
                "text-gray-400",
                "hover:text-gray-600"
              );
              bookmarkBtn.classList.add("text-blue-600", "hover:text-blue-700");
              bookmarkBtn.setAttribute("title", "Remove from saved");
              const svg = bookmarkBtn.querySelector("svg");
              if (svg) svg.classList.add("fill-current");

              // Track analytics
              analytics.trackSnippetSave(objectId, "save");

              // Show toast
              toast({
                title: "Snippet saved!",
                description: "Snippet has been added to your saved collection.",
              });
            }
          }
        }
      }
    };

    // Listen for clicks on bookmark buttons
    document.addEventListener("click", handleBookmarkClick);

    return () => {
      search.dispose();
      document.removeEventListener("click", handleBookmarkClick);
    };
  }, [savedSnippets, toast, isHydrated]);

  const handleRemoveSavedSnippet = (snippet: SearchHit) => {
    setSavedSnippets((prev) =>
      prev.filter((saved) => saved.objectID !== snippet.objectID)
    );

    // Track analytics
    analytics.trackSnippetSave(snippet.objectID, "unsave");

    toast({
      title: "Snippet removed",
      description: "Snippet has been removed from your saved collection.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Snippet Search
          </h1>
          <p className="text-gray-600">
            Discover and manage code snippets from across the web
          </p>
          {isHydrated && savedSnippets.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setShowSavedModal(true);
                  analytics.trackModalInteraction("saved_snippets", "open");
                }}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>
                  {savedSnippets.length} snippet
                  {savedSnippets.length !== 1 ? "s" : ""} saved
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Search Interface */}
        <div ref={searchContainerRef} className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <div id="algolia-searchbox"></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1">
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

        {/* Saved Snippets Modal */}
        {showSavedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                  Saved Snippets ({savedSnippets.length})
                </h2>
                <button
                  onClick={() => {
                    setShowSavedModal(false);
                    analytics.trackModalInteraction("saved_snippets", "close");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                {savedSnippets.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No saved snippets
                    </h3>
                    <p className="text-gray-500">
                      Start saving snippets to build your personal collection
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {savedSnippets.map((snippet) => {
                      // Normalize tags: always array
                      const tagArray = Array.isArray(snippet.tags)
                        ? snippet.tags
                        : typeof snippet.tags === "string"
                        ? snippet.tags.split(",").map((tag) => tag.trim())
                        : [];

                      // Decode HTML entities and clean up the content
                      const decodedSnippetText = decode(snippet.snippet);
                      const cleanSnippetText = decodedSnippetText
                        .replace(/<img[^>]*>/g, "")
                        .replace(/<[^>]*>/g, "")
                        .replace(/\s+/g, " ")
                        .trim();

                      return (
                        <div
                          key={snippet.objectID}
                          className="hover:shadow-lg transition-shadow rounded-lg border bg-card text-card-foreground shadow-sm border-l-4 border-l-blue-500"
                        >
                          <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1">
                                {snippet.title}
                              </h3>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gray-100 text-gray-700">
                                  {snippet.source}
                                </span>
                                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800">
                                  Saved
                                </span>
                                <button
                                  className="text-blue-600 hover:text-blue-700 p-1"
                                  onClick={() =>
                                    handleRemoveSavedSnippet(snippet)
                                  }
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 text-sm overflow-x-auto prose prose-sm max-w-none">
                              <div className="whitespace-pre-wrap">
                                {cleanSnippetText}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {tagArray.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                    dangerouslySetInnerHTML={{
                                      __html: parseMarkdownInTag(tag),
                                    }}
                                  />
                                ))}
                              </div>
                              <a
                                href={snippet.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() =>
                                  analytics.trackExternalLink(
                                    snippet.url,
                                    snippet.source
                                  )
                                }
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 self-start sm:self-auto"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Read more
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toaster */}
        <Toaster />

        {/* Analytics Dashboard */}
        <AnalyticsDashboard />

        {/* User Analytics */}
        <UserAnalytics savedSnippetsCount={savedSnippets.length} />
      </div>
    </div>
  );
}
