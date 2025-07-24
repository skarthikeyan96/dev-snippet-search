import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, ChevronUp, Plus, X, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { algoliasearch } from "algoliasearch";
import instantsearch, { InstantSearch } from "instantsearch.js";
import {
  searchBox,
  hits,
  pagination,
  configure,
} from "instantsearch.js/es/widgets";

interface SearchHit {
  objectID: string;
  _highlightResult: {
    title?: { value: string };
    snippet?: { value: string };
    preview?: { value: string };
  };
  title: string;
  snippet: string;
  preview: string;
  tags: string[] | string;
  source: string;
  url: string;
}

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

export default function SnippetSearchApp() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInstanceRef = useRef<InstantSearch | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    snippet: "",
    tags: "",
    source: "",
    customSource: "",
  });
  const [tagChips, setTagChips] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

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

            const tagHTML = tagArray
              .map(
                (tag) =>
                  `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mr-2 mb-2">${tag}</span>`
              )
              .join("");

            const sourceText = hit.source || "Unknown Source";
            const titleText =
              hit._highlightResult.title?.value || hit.title || "";
            const snippetText =
              hit._highlightResult.snippet?.value || hit.snippet || "";
            const previewText =
              hit._highlightResult.preview?.value || hit.preview || "";

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

                  <div class="bg-gray-50 rounded-lg p-4 mb-4 font-mono text-sm overflow-x-auto">
                    <pre class="whitespace-pre-wrap">${snippetText}</pre>
                  </div>

                  <p class="text-gray-600 mb-4">${previewText}</p>

                  <div class="flex items-center justify-between">
                    <div class="flex flex-wrap gap-2">
                      ${tagHTML}
                    </div>
                    <a href="${hit.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
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
          link: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10",
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

  const addTagChip = () => {
    if (currentTag.trim() && !tagChips.includes(currentTag.trim())) {
      setTagChips([...tagChips, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTagChip = (tagToRemove: string) => {
    setTagChips(tagChips.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("Submitting snippet:", {
      ...formData,
      tags:
        tagChips.length > 0
          ? tagChips
          : formData.tags.split(",").map((t) => t.trim()),
    });

    // Reset form
    setFormData({
      title: "",
      snippet: "",
      tags: "",
      source: "",
      customSource: "",
    });
    setTagChips([]);
    setIsAdminOpen(false);
  };

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

        {/* Admin Panel */}
        <Collapsible
          open={isAdminOpen}
          onOpenChange={setIsAdminOpen}
          className="mb-8"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between mb-4 bg-transparent"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Snippet (Admin)
              </span>
              {isAdminOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card>
              <CardHeader>
                <CardTitle>Add New Snippet</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Title
                    </label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Enter snippet title"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="snippet"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Code Snippet
                    </label>
                    <Textarea
                      id="snippet"
                      value={formData.snippet}
                      onChange={(e) =>
                        setFormData({ ...formData, snippet: e.target.value })
                      }
                      placeholder="Paste your code snippet here..."
                      className="min-h-[120px] font-mono text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addTagChip())
                          }
                        />
                        <Button type="button" onClick={addTagChip} size="sm">
                          Add
                        </Button>
                      </div>
                      {tagChips.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tagChips.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {tag}
                              <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => removeTagChip(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Input
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                        placeholder="Or enter comma-separated tags"
                        className="text-sm text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="source"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Source
                    </label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) =>
                        setFormData({ ...formData, source: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dev.to">Dev.to</SelectItem>
                        <SelectItem value="hashnode">Hashnode</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="custom">Custom Source</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.source === "custom" && (
                      <Input
                        value={formData.customSource}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customSource: e.target.value,
                          })
                        }
                        placeholder="Enter custom source"
                        className="mt-2"
                      />
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Snippet
                  </Button>
                </form>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

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

          {/* Search Results */}
          <div id="algolia-hits"></div>

          {/* Pagination */}
          <div id="algolia-pagination"></div>
        </div>
      </div>
    </div>
  );
}
