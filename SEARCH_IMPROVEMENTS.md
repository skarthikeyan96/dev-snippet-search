# Search Improvements Documentation

This document outlines all the improvements made to the snippet search functionality and data scraping system.

## 1. Markdown Support for Tags

### **Implementation:**

- Added custom markdown parser function `parseMarkdownInTag()` in `src/pages/search.tsx`
- Supports bold (`**text**`, `__text__`), italic (`*text*`, `_text_`), inline code (`` `code` ``), links (`[text](url)`), and strikethrough (`~~text~~`)

### **Code Example:**

```typescript
const parseMarkdownInTag = (tag: string): string => {
  return tag
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>'
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    .replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>');
};
```

### **Reason:**

Initially attempted to use `react-markdown` with `ReactDOM.render`, but this approach was incompatible with InstantSearch.js string templates and deprecated in React 18. The custom regex-based parser provides better performance and compatibility.

## 2. Tailwind Typography Integration

### **Implementation:**

- Added `@tailwindcss/typography` plugin to `tailwind.config.ts`
- Applied `prose prose-sm max-w-none` classes to snippet content containers

### **Benefits:**

- Professional typography styling for markdown content
- Consistent spacing, line heights, and text formatting
- Better readability for code snippets and text content

### **Code Example:**

```typescript
// tailwind.config.ts
import typography from "@tailwindcss/typography";

const config: Config = {
  plugins: [tailwindcssAnimate, typography],
};
```

## 3. HTML Content Processing

### **Implementation:**

- Integrated `he` library for HTML entity decoding
- Added content cleaning pipeline to remove HTML tags and normalize whitespace
- Specifically removes `<img>` tags and other HTML elements

### **Code Example:**

```typescript
import { decode } from "he";

const decodedSnippetText = decode(snippetText);
const cleanSnippetText = decodedSnippetText
  .replace(/<img[^>]*>/g, "") // Remove image tags
  .replace(/<[^>]*>/g, "") // Remove all other HTML tags
  .replace(/\s+/g, " ") // Normalize whitespace
  .trim();
```

### **Reason:**

Scraped content often contains HTML-encoded entities and raw HTML tags that break the display. This processing ensures clean, readable text output.

## 4. Content Structure Simplification

### **Changes:**

- Removed redundant `previewText` variable and `preview` field from `SearchHit` interface
- Consolidated to single `snippetText` field for cleaner data structure
- Simplified template rendering logic

### **Benefits:**

- Reduced data redundancy
- Cleaner code structure
- Better performance with less data processing

## 5. Enhanced Data Scraping System

### **New Sources:**

- **Dev.to API**: Direct API integration for reliable content
- **Hashnode RSS**: RSS feed parsing for Hashnode articles
- **Alternative RSS Feeds**: CSS-Tricks, Smashing Magazine, Web Design Ledger, UX Movement, UX Planet

### **Improvements:**

- **Rate Limiting**: Added delays between requests to respect API limits
- **Error Handling**: Comprehensive try-catch blocks with logging
- **Data Normalization**: Consistent tag formatting and content structure
- **Fallback Mechanisms**: Multiple sources for better content diversity

### **Code Example:**

```javascript
// Enhanced error handling and rate limiting
for (const source of sources) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limiting
    const data = await fetchData(source);
    // Process and normalize data
  } catch (error) {
    console.error(`Error fetching from ${source}:`, error);
    // Continue with other sources
  }
}
```

## 6. Toast Notifications System

### **Implementation:**

- Created custom toast hook (`src/hooks/use-toast.ts`) inspired by react-hot-toast
- Built toast UI components using Radix UI primitives
- Integrated toast feedback for bookmark actions

### **Features:**

- **Success notifications**: "Snippet saved! Snippet has been added to your saved collection."
- **Removal notifications**: "Snippet removed. Snippet has been removed from your saved collection."
- **Auto-dismiss**: Toasts automatically disappear after a set time
- **Accessible**: Built with Radix UI for proper accessibility

### **Code Example:**

```typescript
const { toast } = useToast();

// When saving a snippet
toast({
  title: "Snippet saved!",
  description: "Snippet has been added to your saved collection.",
});

// When removing a snippet
toast({
  title: "Snippet removed",
  description: "Snippet has been removed from your saved collection.",
});
```

## 7. Saved Snippets Modal

### **Implementation:**

- Added modal interface for viewing saved snippets
- Clickable saved count in header opens modal
- Full snippet management within modal

### **Features:**

- **Modal View**: Clean, responsive modal for saved snippets
- **Real-time Count**: Shows current number of saved snippets
- **Remove Functionality**: Direct removal from modal with toast feedback
- **Full Content Display**: Shows complete snippet content with formatting
- **External Links**: "Read more" buttons to original articles

### **Code Example:**

```typescript
const [showSavedModal, setShowSavedModal] = useState(false);

// Clickable saved count
<button
  onClick={() => setShowSavedModal(true)}
  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
>
  <Bookmark className="w-4 h-4" />
  <span>
    {savedSnippets.length} snippet{savedSnippets.length !== 1 ? "s" : ""} saved
  </span>
</button>;
```

## 8. Bookmark Functionality

### **Implementation:**

- Bookmark buttons on each search result
- Visual feedback (blue when saved, gray when not)
- Tooltips for better UX
- Seamless integration with Algolia search

### **Features:**

- **Visual States**: Filled bookmark icon when saved, outline when not
- **Tooltips**: "Save snippet" / "Remove from saved" on hover
- **Toast Feedback**: Immediate notification of actions
- **State Persistence**: Maintains saved state across search interactions

## 9. localStorage Persistence

### **Implementation:**

- Added localStorage functionality to persist saved snippets across page refreshes
- Automatic saving and loading of saved snippets
- Error handling for localStorage operations
- SSR-safe implementation with window checks

### **Features:**

- **Persistent Storage**: Saved snippets survive page refreshes and browser restarts
- **Automatic Sync**: Changes are immediately saved to localStorage
- **Error Handling**: Graceful fallback if localStorage is unavailable
- **SSR Compatible**: Safe for server-side rendering with window checks

### **Code Example:**

```typescript
// localStorage key for saved snippets
const SAVED_SNIPPETS_KEY = "dev-snippet-search-saved-snippets";

// Save to localStorage
const saveSnippetsToStorage = (snippets: SearchHit[]) => {
  try {
    localStorage.setItem(SAVED_SNIPPETS_KEY, JSON.stringify(snippets));
  } catch (error) {
    console.error("Error saving snippets to localStorage:", error);
  }
};

// Load from localStorage
const loadSnippetsFromStorage = (): SearchHit[] => {
  try {
    const saved = localStorage.getItem(SAVED_SNIPPETS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading snippets from localStorage:", error);
    return [];
  }
};

// Initialize state from localStorage
const [savedSnippets, setSavedSnippets] = useState<SearchHit[]>(() => {
  if (typeof window !== "undefined") {
    return loadSnippetsFromStorage();
  }
  return [];
});

// Auto-save when state changes
useEffect(() => {
  if (typeof window !== "undefined") {
    saveSnippetsToStorage(savedSnippets);
  }
}, [savedSnippets]);
```

### **Benefits:**

- **Data Persistence**: Users don't lose their saved snippets on page refresh
- **Cross-Session Storage**: Snippets persist across browser sessions
- **No Backend Required**: Pure client-side storage solution
- **Fast Access**: Immediate loading of saved state
- **Reliable**: Error handling ensures app doesn't break if localStorage fails

## Dependencies Added

### **New Packages:**

```json
{
  "@tailwindcss/typography": "^0.5.10",
  "he": "^1.2.0",
  "@types/he": "^1.2.3",
  "fast-xml-parser": "^4.3.2",
  "@radix-ui/react-toast": "^1.1.5",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

### **Removed Packages:**

```json
{
  "react-markdown": "removed - incompatible with InstantSearch.js"
}
```

## Search Result Structure

### **Current Interface:**

```typescript
interface SearchHit {
  objectID: string;
  _highlightResult: {
    title?: { value: string };
    snippet?: { value: string };
  };
  title: string;
  snippet: string; // Cleaned and decoded content
  tags: string[] | string;
  source: string;
  url: string;
}
```

## Benefits Summary

1. **Better Content Quality**: HTML cleaning and entity decoding
2. **Enhanced UX**: Toast notifications and modal interface
3. **Improved Accessibility**: Radix UI components and proper ARIA labels
4. **Content Diversity**: Multiple scraping sources
5. **Performance**: Optimized rendering and data processing
6. **Maintainability**: Cleaner code structure and better error handling
7. **User Engagement**: Bookmark functionality and saved snippets management
8. **Data Persistence**: localStorage ensures saved snippets survive page refreshes

## Future Considerations

1. **Enhanced Persistence**: Consider IndexedDB for larger storage capacity
2. **Search Filters**: Add filtering by saved status
3. **Export Functionality**: Allow users to export saved snippets
4. **Categories**: Add categorization for saved snippets
5. **Sharing**: Enable sharing of snippet collections
6. **Advanced Search**: Implement search within saved snippets
7. **Offline Support**: Cache functionality for offline access
8. **Sync**: Consider cloud sync for cross-device access
9. **Backup**: Add backup/restore functionality for saved snippets

## Technical Notes

- **Import Paths**: Used relative paths instead of `@` alias for better compatibility
- **TypeScript**: Proper typing throughout the application
- **Error Boundaries**: Comprehensive error handling in scraping and UI
- **Performance**: Optimized re-renders and efficient state management
- **Accessibility**: WCAG compliant components and interactions
- **Storage**: localStorage with fallback error handling
- **SSR Safety**: Window checks for server-side rendering compatibility
