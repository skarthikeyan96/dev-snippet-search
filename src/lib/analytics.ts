// Lightweight Analytics System for SnippetSearch
// Tracks user behavior, performance metrics, and usage patterns

interface AnalyticsEvent {
  event: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  data?: Record<string, unknown>;
  userAgent: string;
  url: string;
  referrer?: string;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  searchResponseTime: number;
  bundleSize: number;
  deviceType: "mobile" | "desktop" | "tablet";
  browser: string;
  os: string;
}

interface UserBehavior {
  searchQueries: string[];
  savedSnippets: number;
  sourcesFiltered: string[];
  paginationUsage: number;
  modalInteractions: number;
}

class Analytics {
  private sessionId: string;
  private userId: string;
  private events: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetrics | null = null;
  private userBehavior: UserBehavior = {
    searchQueries: [],
    savedSnippets: 0,
    sourcesFiltered: [],
    paginationUsage: 0,
    modalInteractions: 0,
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getOrCreateUserId();
    this.initializeAnalytics();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem("snippet-search-user-id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("snippet-search-user-id", userId);
    }
    return userId;
  }

  private initializeAnalytics(): void {
    // Track page load performance
    this.trackPageLoad();

    // Track device and browser info
    this.trackDeviceInfo();

    // Track initial page view
    this.trackEvent("page_view", {
      page: window.location.pathname,
      referrer: document.referrer,
    });
  }

  private trackPageLoad(): void {
    if (typeof window !== "undefined" && "performance" in window) {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.performanceMetrics = {
          pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          searchResponseTime: 0, // Will be updated during search
          bundleSize: this.getBundleSize(),
          deviceType: this.getDeviceType(),
          browser: this.getBrowser(),
          os: this.getOS(),
        };
      }
    }
  }

  private getBundleSize(): number {
    // Estimate bundle size based on performance entries
    const resources = performance.getEntriesByType("resource");
    const totalSize = resources.reduce((acc, resource) => {
      const resourceEntry = resource as PerformanceResourceTiming;
      return acc + (resourceEntry.transferSize || 0);
    }, 0);
    return Math.round(totalSize / 1024); // Convert to KB
  }

  private getDeviceType(): "mobile" | "desktop" | "tablet" {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      return /tablet|ipad/i.test(userAgent) ? "tablet" : "mobile";
    }
    return "desktop";
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  }

  private getOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iOS")) return "iOS";
    return "Unknown";
  }

  private trackDeviceInfo(): void {
    this.trackEvent("device_info", {
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    });
  }

  public trackEvent(event: string, data?: Record<string, unknown>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
    };

    this.events.push(analyticsEvent);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Analytics Event:", analyticsEvent);
    }

    // Send to analytics endpoint if available
    this.sendToAnalytics(analyticsEvent);
  }

  public trackSearch(
    query: string,
    resultsCount: number,
    responseTime: number
  ): void {
    this.userBehavior.searchQueries.push(query);
    if (this.performanceMetrics) {
      this.performanceMetrics.searchResponseTime = responseTime;
    }

    this.trackEvent("search", {
      query,
      resultsCount,
      responseTime,
      totalSearches: this.userBehavior.searchQueries.length,
    });
  }

  public trackSnippetSave(snippetId: string, action: "save" | "unsave"): void {
    if (action === "save") {
      this.userBehavior.savedSnippets++;
    } else {
      this.userBehavior.savedSnippets = Math.max(
        0,
        this.userBehavior.savedSnippets - 1
      );
    }

    this.trackEvent("snippet_action", {
      action,
      snippetId,
      totalSaved: this.userBehavior.savedSnippets,
    });
  }

  public trackSourceFilter(source: string, action: "add" | "remove"): void {
    if (
      action === "add" &&
      !this.userBehavior.sourcesFiltered.includes(source)
    ) {
      this.userBehavior.sourcesFiltered.push(source);
    } else if (action === "remove") {
      this.userBehavior.sourcesFiltered =
        this.userBehavior.sourcesFiltered.filter((s) => s !== source);
    }

    this.trackEvent("source_filter", {
      source,
      action,
      activeFilters: this.userBehavior.sourcesFiltered,
    });
  }

  public trackPagination(page: number): void {
    this.userBehavior.paginationUsage++;
    this.trackEvent("pagination", {
      page,
      totalPaginationUsage: this.userBehavior.paginationUsage,
    });
  }

  public trackModalInteraction(
    modalType: "saved_snippets",
    action: "open" | "close"
  ): void {
    this.userBehavior.modalInteractions++;
    this.trackEvent("modal_interaction", {
      modalType,
      action,
      totalModalInteractions: this.userBehavior.modalInteractions,
    });
  }

  public trackExternalLink(url: string, source: string): void {
    this.trackEvent("external_link", {
      url,
      source,
    });
  }

  public trackError(error: string, context?: Record<string, unknown>): void {
    this.trackEvent("error", {
      error,
      context,
    });
  }

  private async sendToAnalytics(event: AnalyticsEvent): Promise<void> {
    try {
      // Send to our analytics API endpoint
      await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error("Failed to send analytics event:", error);
    }
  }

  public getAnalyticsSummary(): {
    sessionId: string;
    userId: string;
    events: AnalyticsEvent[];
    performanceMetrics: PerformanceMetrics | null;
    userBehavior: UserBehavior;
  } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      events: this.events,
      performanceMetrics: this.performanceMetrics,
      userBehavior: this.userBehavior,
    };
  }

  public exportAnalytics(): string {
    return JSON.stringify(this.getAnalyticsSummary(), null, 2);
  }
}

// Create singleton instance
let analyticsInstance: Analytics | null = null;

export const getAnalytics = (): Analytics => {
  if (typeof window === "undefined") {
    // Server-side rendering - return a mock instance
    const mockAnalytics = {
      trackEvent: () => {},
      trackSearch: () => {},
      trackSnippetSave: () => {},
      trackSourceFilter: () => {},
      trackPagination: () => {},
      trackModalInteraction: () => {},
      trackExternalLink: () => {},
      trackError: () => {},
      getAnalyticsSummary: () => ({
        sessionId: "server",
        userId: "server",
        events: [],
        performanceMetrics: null,
        userBehavior: {
          searchQueries: [],
          savedSnippets: 0,
          sourcesFiltered: [],
          paginationUsage: 0,
          modalInteractions: 0,
        },
      }),
      exportAnalytics: () => "{}",
    };
    return mockAnalytics as unknown as Analytics;
  }

  if (!analyticsInstance) {
    analyticsInstance = new Analytics();
  }
  return analyticsInstance;
};

// Performance monitoring utilities
export const trackPerformance = (metric: string, value: number): void => {
  const analytics = getAnalytics();
  analytics.trackEvent("performance", {
    metric,
    value,
  });
};

// Error tracking utility
export const trackError = (
  error: Error,
  context?: Record<string, unknown>
): void => {
  const analytics = getAnalytics();
  analytics.trackError(error.message, {
    stack: error.stack,
    ...context,
  });
};

export default getAnalytics;
