import React, { useState, useEffect } from "react";
import { getAnalytics } from "../lib/analytics";

interface UserAnalyticsProps {
  savedSnippetsCount: number;
}

export default function UserAnalytics({
  savedSnippetsCount,
}: UserAnalyticsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [analytics, setAnalytics] = useState<{
    userBehavior: {
      searchQueries: string[];
      modalInteractions: number;
    };
    performanceMetrics: {
      pageLoadTime: number;
    } | null;
  } | null>(null);

  useEffect(() => {
    const updateAnalytics = () => {
      const analyticsInstance = getAnalytics();
      const summary = analyticsInstance.getAnalyticsSummary();
      setAnalytics({
        userBehavior: summary.userBehavior,
        performanceMetrics: summary.performanceMetrics,
      });
    };

    updateAnalytics();
  }, []);

  if (!analytics) return null;

  const totalSearches = analytics.userBehavior.searchQueries.length;
  const totalInteractions = analytics.userBehavior.modalInteractions;

  return (
    <>
      {/* User Stats Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
        title="Your Usage Stats"
      >
        📈
      </button>

      {/* User Stats Modal */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Your Usage Stats</h2>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* Saved Snippets */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        Saved Snippets
                      </h3>
                      <p className="text-sm text-blue-700">
                        Your personal collection
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {savedSnippetsCount}
                    </div>
                  </div>
                </div>

                {/* Search Activity */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-900">Searches</h3>
                      <p className="text-sm text-green-700">
                        Queries performed
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {totalSearches}
                    </div>
                  </div>
                </div>

                {/* Interactions */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-purple-900">
                        Interactions
                      </h3>
                      <p className="text-sm text-purple-700">
                        Modal opens & actions
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {totalInteractions}
                    </div>
                  </div>
                </div>

                {/* Performance */}
                {analytics.performanceMetrics && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-orange-900">
                          Performance
                        </h3>
                        <p className="text-sm text-orange-700">
                          Page load time
                        </p>
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {analytics.performanceMetrics.pageLoadTime.toFixed(0)}ms
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Notice */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 text-center">
                    💡 These stats are stored locally on your device and are not
                    shared with anyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
