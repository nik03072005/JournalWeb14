'use client';
import axios from "axios";
import Navbar from "./Navbar";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BookOpen, Database, FileText, Clock, ArrowRight } from "lucide-react";
import useAuthStore from '@/utility/justAuth';
import ProfileDropdown from './ProfileDropdown';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    articles: 0,
    books: 0,
    journals: 0,
    loading: true
  });
  const [animatedNumbers, setAnimatedNumbers] = useState({
    articles: 0,
    books: 0,
    journals: 0
  });

  const { isLoggedIn, logout } = useAuthStore();

  // Browse options for desktop menu only
  const browseOptions = [
    'Book', 'Book Chapters', 'Conference Proceeding', 'Dissertation',
    'Magazine', 'Manuscript', 'Newspaper', 'Question Papers', 'Research Papers', 'Thesis'
  ];

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    try {
      logout();
      localStorage.clear();
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  }, [logout]);

  // Animated counter while loading
  useEffect(() => {
    let interval;
    if (stats.loading) {
      interval = setInterval(() => {
        setAnimatedNumbers(prev => ({
          articles: Math.floor(Math.random() * 999999) + 100000,
          books: Math.floor(Math.random() * 99999) + 10000,
          journals: Math.floor(Math.random() * 9999) + 1000
        }));
      }, 150);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [stats.loading]);

  // Number formatting
  const formatNumber = (num) => {
    if (num >= 100000) return Math.floor(num / 100000) + "L+";
    if (num >= 1000) return Math.floor(num / 1000) + "K+";
    return num + "+";
  };

  // Data fetching functions
  const fetchDOAJCount = async () => {
    try {
      const response = await axios.get('/api/doaj-stats');
      return {
        articles: response.data?.articles || 0,
        journals: response.data?.journals || 0,
        total: response.data?.total || 0
      };
    } catch {
      return { articles: 0, journals: 0, total: 0 };
    }
  };

  const fetchLocalCount = async () => {
    try {
      const response = await axios.get(`/api/journal`);
      const journals = response.data?.journals || [];
      const articleCount = journals.filter(j => j.type && !j.type.toLowerCase().includes('book')).length;
      const bookCount = journals.filter(j => j.type && j.type.toLowerCase().includes('book')).length;
      return { articles: articleCount, books: bookCount, total: journals.length };
    } catch {
      return { articles: 0, books: 0, total: 0 };
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const [doajData, localData] = await Promise.all([
        fetchDOAJCount(),
        fetchLocalCount()
      ]);
      setStats({
        articles: localData.articles + doajData.articles,
        books: localData.books,
        journals: doajData.journals,
        loading: false
      });
    } catch {
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <>
      <div
        className="h-[80vh] relative overflow-hidden flex flex-col"
        style={{
          backgroundImage: "url('/library.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Dark overlay for better text visibility - covers entire image */}
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        
        <div className="relative z-10">
          <Navbar />
        </div>

        {/* Content container */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center">
          <div className="flex flex-col text-center px-6 sm:px-8 lg:px-12 mx-auto max-w-5xl py-12">
            <div className="w-full">
              {/* Content Section */}
              <div className="mb-10">
                <p className="text-base md:text-lg text-white font-semibold mb-4 drop-shadow-lg shadow-white/30" style={{textShadow: '0 0 25px rgba(255,255,255,0.8), 0 0 50px rgba(255,255,255,0.5), 2px 2px 4px rgba(0,0,0,0.8)'}}>
                  Discover the Future of Learning
                </p>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg" style={{textShadow: '0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.8)'}}>
                  Welcome to Kamargaon College
                </h1>

                <p className="text-sm md:text-base text-white font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-md" style={{textShadow: '0 0 20px rgba(255,255,255,0.7), 0 0 40px rgba(255,255,255,0.4), 2px 2px 4px rgba(0,0,0,0.7)'}}>
                  Access millions of academic resources, research papers, and digital collections.
                  Your gateway to unlimited knowledge in the digital age.
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar - Integrated into content */}
          <div className="w-full max-w-3xl mx-auto px-4 mt-8">
            <div className="flex w-full bg-white rounded-lg overflow-hidden shadow-xl mb-4">
              <input
                type="text"
                placeholder="Search books, articles, research papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    window.location.href = `/search/${encodeURIComponent(searchTerm.trim())}`;
                  }
                }}
                className="px-4 py-2.5 w-full text-gray-800 placeholder-gray-500 focus:outline-none text-sm md:text-base"
                aria-label="Search for academic resources"
              />
              <Link
                href={searchTerm.trim() ? `/search/${encodeURIComponent(searchTerm.trim())}` : "#"}
                className={`px-5 py-2.5 text-black hover:text-gray-700 transition-all font-bold text-sm md:text-base ${
                  !searchTerm.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Submit search"
              >
                SEARCH
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/advanceSearch"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-lg hover:shadow-xl font-medium text-xs"
                aria-label="Advanced Search"
              >
                Advance Search
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Half on image, half hanging below */}
      <div className="relative z-20 -mt-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 bg-white shadow-xl rounded-lg overflow-hidden">
            {/* Articles */}
            <div className="py-8 px-3 sm:px-4 text-center">
              <div className="text-blue-500 text-3xl mb-3">
                <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1">
                {stats.loading ? formatNumber(animatedNumbers.articles) : "115L+"}
              </h3>
              <p className="text-gray-600 text-xs md:text-sm font-medium">Articles</p>
            </div>
            {/* Books */}
            <div className="py-8 px-3 sm:px-4 text-center border-l border-gray-200">
              <div className="text-blue-500 text-3xl mb-3">
                <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1">
                {stats.loading ? formatNumber(animatedNumbers.books) : "0+"}
              </h3>
              <p className="text-gray-600 text-xs md:text-sm font-medium">Books</p>
            </div>
            {/* Journals */}
            <div className="py-6 px-3 sm:px-4 text-center border-l border-gray-200">
              <div className="text-blue-500 text-3xl mb-2">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                {stats.loading ? formatNumber(animatedNumbers.journals) : "21K+"}
              </h3>
              <p className="text-gray-600 text-xs md:text-sm font-medium">Journals</p>
            </div>
            {/* Access */}
            <div className="py-6 px-3 sm:px-4 text-center border-l border-gray-200">
              <div className="text-blue-500 text-3xl mb-2">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                24/7
              </h3>
              <p className="text-gray-600 text-xs md:text-sm font-medium">Access Always Available</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}