"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Search,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Tag,
  ArrowUpRight,
  Layers,
} from "lucide-react";

interface LinkItem {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  tags: string[];
  is_read: boolean;
  created_at: string;
}

export default function Dashboard() {
  // 1. Added isLoaded to track when Clerk is finished initializing
  const { getToken, isSignedIn, isLoaded } = useAuth(); 
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // 2. Initialized as false to avoid unnecessary "true -> false" flips
  const [isFetching, setIsFetching] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 3. Only run the effect if Clerk is loaded and user is signed in
    if (!isLoaded || !isSignedIn) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setError(null);
        setIsFetching(true); // Start fetching state here
        const token = await getToken();
        if (!token) throw new Error("No authentication token available");

        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (selectedTag) params.append("tag", selectedTag);
        if (showUnreadOnly) params.append("unread", "true");

        const res = await fetch(`/api/links?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch links: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setLinks(data);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed fetching links:", err);
          setError(err instanceof Error ? err.message : "Failed to load links");
        }
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedTag, showUnreadOnly, isSignedIn, isLoaded, getToken]);

  const refetch = async () => {
    if (!isSignedIn) return;
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("No authentication token");

      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedTag) params.append("tag", selectedTag);
      if (showUnreadOnly) params.append("unread", "true");

      const res = await fetch(`/api/links?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch links: ${res.status}`);
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error("Failed fetching links:", err);
      setError(err instanceof Error ? err.message : "Failed to load links");
    }
  };

  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (!isSignedIn) {
      setError("Please sign in to save links");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");

      const res = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save link: ${res.status}`);
      }

      setUrlInput("");
      await refetch();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save link");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReadStatus = async (id: number, currentStatus: boolean) => {
    if (!isSignedIn) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");

      const res = await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_read: !currentStatus }),
      });

      if (!res.ok) throw new Error(`Failed to update status: ${res.status}`);

      await refetch();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const deleteLink = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الرابط؟")) return;
    if (!isSignedIn) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");

      const res = await fetch(`/api/links/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to delete link: ${res.status}`);

      await refetch();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete link");
    }
  };

  const allTags = Array.from(new Set(links.flatMap((l) => l.tags || [])));

  // 4. Combined logic for showing the loader:
  // Show loader if Clerk isn't ready OR if we are currently fetching links for the first time
  if (!isLoaded || (isFetching && links.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-zinc-400">جاري تحميل روابطك...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">
          {error}
          <button
            onClick={() => setError(null)}
            className="mr-4 underline hover:no-underline"
          >
            إغلاق
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmitLink}
        className="relative w-full max-w-3xl mx-auto shadow-2xl shadow-indigo-500/5 rounded-2xl"
      >
        <input
          type="url"
          placeholder="أدخل رابط موقع لحفظه..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          required
          className="saas-input w-full pl-32 pr-6 py-4 rounded-2xl text-base sm:text-lg font-['Inter'] shadow-sm"
          dir="ltr"
          disabled={isLoading || !isSignedIn}
        />
        <button
          type="submit"
          disabled={isLoading || !isSignedIn}
          className="absolute left-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span className="hidden sm:inline text-sm">جاري...</span>
            </>
          ) : (
            <>
              <Plus size={18} />
              <span className="hidden sm:inline text-sm">حفظ</span>
            </>
          )}
        </button>
      </form>

      {!isSignedIn && (
        <div className="text-center py-12 bg-zinc-900/50 rounded-3xl border border-zinc-800/50">
          <p className="text-zinc-400">يرجى تسجيل الدخول لحفظ وعرض روابطك</p>
        </div>
      )}

      {isSignedIn && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                placeholder="البحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="saas-input w-full pr-10 pl-4 py-2.5 rounded-xl text-sm"
              />
            </div>

            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                showUnreadOnly
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
              }`}
            >
              {showUnreadOnly ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              {showUnreadOnly ? "غير المقروءة فقط" : "عرض الكل"}
            </button>
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
              <span className="text-sm text-zinc-500 flex items-center gap-1.5 whitespace-nowrap pl-2">
                <Tag size={14} /> الوسوم:
              </span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  !selectedTag
                    ? "bg-zinc-100 text-zinc-900"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                الكل
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap font-['Inter'] transition-colors ${
                    selectedTag === tag
                      ? "bg-indigo-500 text-white"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {links.length === 0 && !isFetching ? (
            <div className="text-center py-24 bg-zinc-900/50 rounded-3xl border border-zinc-800/50 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600 mb-2">
                <Layers size={24} />
              </div>
              <h3 className="text-zinc-300 font-medium">لا توجد روابط هنا</h3>
              <p className="text-zinc-500 text-sm max-w-sm">
                قم بلصق رابط في الأعلى لحفظه والعودة إليه لاحقاً. ستتم قراءة تفاصيل الرابط تلقائياً.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {links.map((link) => (
                <div
                  key={link.id}
                  className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col group hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 ${
                    link.is_read ? "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0" : ""
                  }`}
                >
                  <div className="relative h-44 bg-zinc-800 overflow-hidden">
                    <img
                      src={
                        link.thumbnail ||
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
                      }
                      alt={link.title || "Thumbnail"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />

                    {link.is_read && (
                      <div className="absolute top-3 right-3 bg-zinc-900/90 backdrop-blur-md text-zinc-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-zinc-700/50">
                        <CheckCircle2 size={12} className="text-indigo-400" /> مقروء
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-grow flex flex-col gap-2">
                    <div
                      className="text-[11px] font-medium font-['Inter'] text-indigo-400 truncate direction-ltr text-left"
                      dir="ltr"
                    >
                      {(() => {
                        try { return new URL(link.url).hostname; } 
                        catch (_) { return link.url; }
                      })()}
                    </div>
                    
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-zinc-100 leading-tight hover:text-indigo-400 transition-colors line-clamp-2"
                    >
                      {link.title || "رابط بدون عنوان"}
                    </a>
                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed mt-1">
                      {link.description || "لا يوجد وصف متاح لهذا الرابط."}
                    </p>
                  </div>

                  <div className="px-5 py-4 border-t border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleReadStatus(link.id, link.is_read)}
                        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                          link.is_read
                            ? "text-indigo-400 hover:bg-indigo-500/10"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                        }`}
                        aria-label={link.is_read ? "وضع كغير مقروء" : "وضع كمقروء"}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center"
                        aria-label="حذف الرابط"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                      aria-label="فتح الرابط"
                    >
                      <ArrowUpRight size={18} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}