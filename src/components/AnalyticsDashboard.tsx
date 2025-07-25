import React, { useState, useEffect } from "react";
import { getAnalytics } from "../lib/analytics";

interface AnalyticsSummary {
  sessionId: string;
  userId: string;
  events: Array<{
    event: string;
    timestamp: number;
    data?: Record<string, unknown>;
  }>;
  performanceMetrics: {
    pageLoadTime: number;
    searchResponseTime: number;
    bundleSize: number;
    deviceType: "mobile" | "desktop" | "tablet";
    browser: string;
    os: string;
  } | null;
  userBehavior: {
    searchQueries: string[];
    savedSnippets: number;
    sourcesFiltered: string[];
    paginationUsage: number;
    modalInteractions: number;
  };
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  useEffect(() => {
    const updateAnalytics = () => {
      const analyticsInstance = getAnalytics();
      setAnalytics(analyticsInstance.getAnalyticsSummary());
    };

    // Update analytics every 5 seconds
    const interval = setInterval(updateAnalytics, 5000);
    updateAnalytics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  // Check if user is in developer mode (localStorage flag or URL parameter)
  useEffect(() => {
    const checkDeveloperMode = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isDev =
        urlParams.get("dev") === "true" ||
        localStorage.getItem("snippet-search-dev-mode") === "true";
      setIsDeveloperMode(isDev);
    };

    checkDeveloperMode();
  }, []);

  // Don't show anything if not in developer mode
  if (!isDeveloperMode) return null;

  if (!analytics) return null;

  const eventCounts = analytics.events.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentEvents = analytics.events
    .slice(-10)
    .reverse()
    .map((event) => ({
      ...event,
      time: new Date(event.timestamp).toLocaleTimeString(),
    }));

  return (
    <>
      {/* Developer Mode Indicator */}
      <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
        DEV MODE
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Developer Analytics Dashboard"
      >
        📊
      </button>

      {/* Dashboard Modal */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-bold">
                  Developer Analytics Dashboard
                </h2>
                <p className="text-sm text-gray-600">
                  Session data for development purposes only
                </p>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Privacy Notice:</strong> This dashboard shows your
                  session data for development purposes. No data is shared with
                  third parties. You can disable developer mode by removing the
                  URL parameter or clearing localStorage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Session Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Session Info</h3>
                  <p className="text-sm text-gray-600">
                    User ID: {analytics.userId.slice(0, 8)}...
                  </p>
                  <p className="text-sm text-gray-600">
                    Session: {analytics.sessionId.slice(0, 8)}...
                  </p>
                </div>

                {/* Performance Metrics */}
                {analytics.performanceMetrics && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Performance</h3>
                    <p className="text-sm text-gray-600">
                      Load Time:{" "}
                      {analytics.performanceMetrics.pageLoadTime.toFixed(2)}ms
                    </p>
                    <p className="text-sm text-gray-600">
                      Bundle Size: {analytics.performanceMetrics.bundleSize}KB
                    </p>
                    <p className="text-sm text-gray-600">
                      Device: {analytics.performanceMetrics.deviceType}
                    </p>
                  </div>
                )}

                {/* User Behavior */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">User Behavior</h3>
                  <p className="text-sm text-gray-600">
                    Searches: {analytics.userBehavior.searchQueries.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    Saved: {analytics.userBehavior.savedSnippets}
                  </p>
                  <p className="text-sm text-gray-600">
                    Modal Opens: {analytics.userBehavior.modalInteractions}
                  </p>
                </div>
              </div>

              {/* Event Counts */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Event Counts</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(eventCounts).map(([event, count]) => (
                    <div
                      key={event}
                      className="bg-gray-100 p-2 rounded text-center"
                    >
                      <div className="font-semibold">{count}</div>
                      <div className="text-xs text-gray-600">{event}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Events */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Recent Events</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {recentEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0"
                    >
                      <div>
                        <span className="font-medium">{event.event}</span>
                        {event.data && (
                          <span className="text-sm text-gray-600 ml-2">
                            {JSON.stringify(event.data).slice(0, 50)}...
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {event.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Queries */}
              {analytics.userBehavior.searchQueries.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Search Queries</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {analytics.userBehavior.searchQueries.map(
                      (query, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2 text-sm"
                        >
                          {query}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(analytics, null, 2);
                    const dataBlob = new Blob([dataStr], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `analytics-${Date.now()}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Export Data
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem("snippet-search-dev-mode");
                    window.location.reload();
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Disable Dev Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
