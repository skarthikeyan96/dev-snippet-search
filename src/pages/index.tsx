"use client";

import Link from "next/link";
import {
  Search,
  Code,
  Bookmark,
  Zap,
  ArrowRight,
  Github,
  Star,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                SnippetSearch
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/search">
                <Button variant="ghost">Search</Button>
              </Link>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
                onClick={() => {
                  window.open(
                    "https://github.com/skarthikeyan96/dev-snippet-search",
                    "_blank"
                  );
                }}
              >
                <Github className="w-4 h-4" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Discover and save code snippets
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find & Save
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Code Snippets
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The ultimate platform for developers to find, save, and organize
            code snippets from across the web. Powered by advanced search and
            built for productivity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/search">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Start Searching
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage code snippets
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From discovery to organization, we&apos;ve got you covered with
              powerful features designed for developers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Powerful Search
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Find exactly what you need with our advanced search powered by
                  Algolia. Search by language, framework, or functionality with
                  instant results.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                  <Bookmark className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Save & Organize
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Build your personal collection of code snippets. Save,
                  categorize, and access your favorite snippets anytime,
                  anywhere.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Clean Display
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Beautiful and clean code display with proper formatting. Code
                  is displayed exactly as you&apos;d expect in your favorite
                  editor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to boost your development workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join developers who are using SnippetSearch to find, save, and
            organize their code snippets.
          </p>
          <Link href="/search">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                SnippetSearch
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/search"
                className="hover:text-white transition-colors"
              >
                Search
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                About
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Privacy
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SnippetSearch. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
