import type { NextApiRequest, NextApiResponse } from "next";

interface AnalyticsData {
  event: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  data?: Record<string, unknown>;
  userAgent: string;
  url: string;
  referrer?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const analyticsData: AnalyticsData = req.body;

    // Log analytics data (in production, you'd send this to a service like Mixpanel, Amplitude, etc.)
    console.log("📊 Analytics Event:", {
      event: analyticsData.event,
      userId: analyticsData.userId,
      sessionId: analyticsData.sessionId,
      timestamp: new Date(analyticsData.timestamp).toISOString(),
      data: analyticsData.data,
      userAgent: analyticsData.userAgent,
      url: analyticsData.url,
      referrer: analyticsData.referrer,
    });

    // Here you could:
    // 1. Send to a third-party analytics service
    // 2. Store in a database
    // 3. Send to a data warehouse
    // 4. Process for real-time dashboards

    // For now, we'll just acknowledge receipt
    res.status(200).json({
      success: true,
      message: "Analytics event recorded",
      event: analyticsData.event,
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record analytics event",
    });
  }
}
