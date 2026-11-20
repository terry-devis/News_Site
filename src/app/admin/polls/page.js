"use client";

import React, { useState, useEffect } from "react";
import {
  Vote,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RotateCcw,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  X,
  FileText,
  Eye,
  Check,
} from "lucide-react";

export default function AdminPollsPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'reset' | 'delete', pollId }
  const [articles, setArticles] = useState([]);
  const [toast, setToast] = useState(null);

  // New Poll Form State
  const [questionUr, setQuestionUr] = useState("");
  const [questionEn, setQuestionEn] = useState("");
  const [options, setOptions] = useState([
    { id: "opt_1", label_ur: "", label_en: "" },
    { id: "opt_2", label_ur: "", label_en: "" },
  ]);
  const [targetStories, setTargetStories] = useState([]);
  const [storySearch, setStorySearch] = useState("");
  const [showStoryDropdown, setShowStoryDropdown] = useState(false);

  // Fetch Polls and Articles
  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/poll?all=true");
      const data = await res.json();
      if (data.polls) {
        setPolls(data.polls);
      }
    } catch (e) {
      console.error("Failed to fetch polls:", e);
      showToast("error", "Failed to load polls");
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles");
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (e) {
      console.error("Failed to load articles:", e);
    }
  };

  useEffect(() => {
    fetchPolls();
    fetchArticles();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Option handlers
  const handleAddOption = () => {
    const nextIdx = options.length + 1;
    setOptions([...options, { id: `opt_${Date.now()}`, label_ur: "", label_en: "" }]);
  };

  const handleRemoveOption = (indexToRemove) => {
    if (options.length <= 2) {
      showToast("error", "A poll must have at least 2 options.");
      return;
    }
    setOptions(options.filter((_, idx) => idx !== indexToRemove));
  };

  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  // Story selector handlers
  const handleSelectStory = (article) => {
    if (!targetStories.some((s) => s.id === article.id)) {
      setTargetStories([...targetStories, { id: article.id, title: article.title_en || article.title_ur }]);
    }
    setStorySearch("");
    setShowStoryDropdown(false);
  };

  const handleRemoveStory = (storyId) => {
    setTargetStories(targetStories.filter((s) => s.id !== storyId));
  };

  // Create Poll Submit
  const handleCreatePoll = async (e) => {
    e.preventDefault();

    if (!questionUr.trim() && !questionEn.trim()) {
      showToast("error", "Please provide at least an Urdu or English question.");
      return;
    }

    const validOptions = options.filter(
      (opt) => (opt.label_ur && opt.label_ur.trim()) || (opt.label_en && opt.label_en.trim())
    );

    if (validOptions.length < 2) {
      showToast("error", "Please enter labels for at least 2 options.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        action: "create",
        question_ur: questionUr.trim(),
        question_en: questionEn.trim(),
        options: validOptions.map((opt, i) => ({
          id: `opt_${i + 1}`,
          label_ur: opt.label_ur.trim(),
          label_en: opt.label_en.trim(),
        })),
        target_stories: targetStories.map((s) => s.id),
        target_story_title: targetStories.length > 0 ? targetStories[0].title : null,
        status: "open",
      };

      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "New poll published successfully!");
        setQuestionUr("");
        setQuestionEn("");
        setOptions([
          { id: "opt_1", label_ur: "", label_en: "" },
          { id: "opt_2", label_ur: "", label_en: "" },
        ]);
        setTargetStories([]);
        fetchPolls();
      } else {
        showToast("error", data.error || "Failed to create poll");
      }
    } catch (err) {
      showToast("error", "Network error creating poll");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Poll Status (Open / Close)
  const handleToggleStatus = async (poll) => {
    const newStatus = poll.status === "open" || poll.is_active ? "closed" : "open";
    setActionLoading(`toggle_${poll.id}`);
    try {
      const res = await fetch("/api/poll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: poll.id,
          status: newStatus,
          is_active: newStatus === "open",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Poll is now ${newStatus === "open" ? "Open for voting" : "Closed"}`);
        fetchPolls();
      } else {
        showToast("error", data.error || "Failed to update poll status");
      }
    } catch (err) {
      showToast("error", "Error toggling status");
    } finally {
      setActionLoading(null);
    }
  };

  // Reset Poll Votes (opens styled modal)
  const handleResetVotes = (pollId) => {
    setConfirmAction({ type: "reset", pollId });
  };

  // Simulate Vote (for quick test)
  const handleTestVote = async (pollId, optionId) => {
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "vote", pollId, optionId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPolls();
      }
    } catch (err) {
      console.error("Test vote error:", err);
    }
  };

  // Delete Poll (opens styled modal)
  const handleDeletePoll = (pollId) => {
    setConfirmAction({ type: "delete", pollId });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, pollId } = confirmAction;
    setActionLoading(`${type}_${pollId}`);
    try {
      const res =
        type === "reset"
          ? await fetch("/api/poll", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "reset", pollId }),
            })
          : await fetch(`/api/poll?id=${pollId}`, { method: "DELETE" });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", type === "reset" ? "Votes reset to 0." : "Poll deleted.");
        setConfirmAction(null);
        fetchPolls();
      } else {
        showToast("error", data.error || "Action failed");
      }
    } catch {
      showToast("error", "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const totalVotesAcrossPolls = polls.reduce((acc, p) => acc + (p.total_votes || 0), 0);
  const activePollsCount = polls.filter((p) => p.status === "open" || p.is_active).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-[#124e2b] text-white border border-[#0a2618]"
              : "bg-red-800 text-white border border-red-900"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e5e2da]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Polls</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {activePollsCount} Active
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Publish a reader poll; it shows on story pages and homepage widgets while open.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-gray-600 bg-white border border-[#e5e2da] rounded-lg px-3 py-1.5 shadow-xs flex items-center gap-3">
            <span>
              Total: <strong className="text-gray-900">{polls.length}</strong>
            </span>
            <span className="text-gray-300">|</span>
            <span>
              Votes Cast: <strong className="text-[#124e2b]">{totalVotesAcrossPolls.toLocaleString()}</strong>
            </span>
          </div>

          <button
            onClick={fetchPolls}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-[#e5e2da] rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
            title="Refresh polls list"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#124e2b]" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN (~42%): "NEW POLL" QUESTION & OPTIONS FORM */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 sticky top-6">
          <form
            onSubmit={handleCreatePoll}
            className="bg-white border border-[#e5e2da] rounded-xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">NEW POLL</span>
              <span className="text-[11px] text-gray-400">Bilingual Engine</span>
            </div>

            {/* Urdu Question */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">Question (Urdu)</label>
                <span className="text-[10px] font-nastaliq text-emerald-800">اردو سوال</span>
              </div>
              <textarea
                dir="rtl"
                rows={2}
                value={questionUr}
                onChange={(e) => setQuestionUr(e.target.value)}
                placeholder="سوال لکھیں..."
                className="w-full text-right font-nastaliq text-sm border border-[#e5e2da] rounded-lg p-2.5 bg-[#fcfbf9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b] focus:border-[#124e2b] transition-all resize-none leading-relaxed"
              />
              <p className="text-[11px] text-gray-400 italic">
                Leave blank to keep this poll off the Urdu edition.
              </p>
            </div>

            {/* English Question */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Question (English)</label>
              <textarea
                rows={2}
                value={questionEn}
                onChange={(e) => setQuestionEn(e.target.value)}
                placeholder="Where do you read the news most?"
                className="w-full text-sm border border-[#e5e2da] rounded-lg p-2.5 bg-[#fcfbf9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b] focus:border-[#124e2b] transition-all resize-none"
              />
              <p className="text-[11px] text-gray-400 italic">
                Leave blank to keep this poll off the English edition.
              </p>
            </div>

            {/* Dynamic Options Blocks */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Options ({options.length})
                </span>
                <span className="text-[11px] text-gray-400">Pair per option</span>
              </div>

              <div className="space-y-3">
                {options.map((opt, idx) => (
                  <div
                    key={opt.id || idx}
                    className="p-3 border border-[#e5e2da] rounded-lg bg-[#faf9f6]/60 space-y-2 relative group hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600">
                      <span>Option {idx + 1}</span>
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-0.5 rounded"
                          title="Remove this option"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Urdu Option Input */}
                    <input
                      type="text"
                      dir="rtl"
                      value={opt.label_ur}
                      onChange={(e) => handleOptionChange(idx, "label_ur", e.target.value)}
                      placeholder={`آپشن ${idx + 1} (اردو)`}
                      className="w-full text-right font-nastaliq text-xs border border-[#e5e2da] rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b] focus:border-[#124e2b]"
                    />

                    {/* English Option Input */}
                    <input
                      type="text"
                      value={opt.label_en}
                      onChange={(e) => handleOptionChange(idx, "label_en", e.target.value)}
                      placeholder={`Option ${idx + 1} (English)`}
                      className="w-full text-xs border border-[#e5e2da] rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b] focus:border-[#124e2b]"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddOption}
                className="w-full py-2 border border-dashed border-[#e5e2da] rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={13} />
                <span>+ Add option</span>
              </button>
            </div>

            {/* Story Placement / Show on */}
            <div className="space-y-1.5 pt-2 border-t border-[#f0ede6]">
              <label className="text-xs font-semibold text-gray-700">Show on</label>

              {/* Selected Stories Pills */}
              {targetStories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {targetStories.map((story) => (
                    <span
                      key={story.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#e8f1eb] text-[#124e2b] text-[11px] font-medium border border-[#cbe1d2]"
                    >
                      <FileText size={11} />
                      <span className="truncate max-w-[180px]">{story.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStory(story.id)}
                        className="hover:text-red-700 ml-0.5"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Autocomplete Input */}
              <div className="relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={storySearch}
                    onChange={(e) => {
                      setStorySearch(e.target.value);
                      setShowStoryDropdown(true);
                    }}
                    onFocus={() => setShowStoryDropdown(true)}
                    placeholder="Search a story by title…"
                    className="w-full text-xs border border-[#e5e2da] rounded-lg pl-8 pr-3 py-2 bg-[#fcfbf9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b] focus:border-[#124e2b]"
                  />
                  <Search size={13} className="absolute left-2.5 text-gray-400" />
                </div>

                {showStoryDropdown && storySearch.trim().length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-[#e5e2da] rounded-lg shadow-lg py-1 divide-y divide-gray-100">
                    {articles
                      .filter(
                        (a) =>
                          (a.title_en && a.title_en.toLowerCase().includes(storySearch.toLowerCase())) ||
                          (a.title_ur && a.title_ur.includes(storySearch))
                      )
                      .slice(0, 6)
                      .map((article) => (
                        <button
                          key={article.id}
                          type="button"
                          onClick={() => handleSelectStory(article)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#faf9f6] transition-colors flex items-center justify-between"
                        >
                          <div className="truncate pr-2">
                            <p className="font-medium text-gray-800 truncate">
                              {article.title_en || article.title_ur}
                            </p>
                            {article.title_ur && article.title_en && (
                              <p className="font-nastaliq text-[11px] text-gray-500 truncate" dir="rtl">
                                {article.title_ur}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">#{article.id}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-gray-400 leading-tight">
                {targetStories.length === 0
                  ? "No stories chosen — this poll runs on every story page. Pick the stories this poll belongs to, or leave it empty."
                  : `Targeted to ${targetStories.length} specific story.`}
              </p>
            </div>

            {/* Publish Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-[#124e2b] hover:bg-[#0a2618] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Publishing poll...</span>
                  </>
                ) : (
                  <>
                    <Vote size={14} />
                    <span>Publish poll</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN (~58%): LIVE & HISTORICAL POLLS WITH BARS  */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-medium">
            <span>
              All Published Polls (<strong>{polls.length}</strong>)
            </span>
            <span className="text-[11px]">Results update dynamically with reader votes</span>
          </div>

          {loading ? (
            <div className="bg-white border border-[#e5e2da] rounded-xl p-12 text-center text-gray-400 text-xs">
              <RefreshCw size={24} className="animate-spin mx-auto text-[#124e2b] mb-2" />
              Loading polls from database...
            </div>
          ) : polls.length === 0 ? (
            <div className="bg-white border border-dashed border-[#e5e2da] rounded-xl p-12 text-center text-gray-400 text-xs">
              <BarChart2 size={32} className="mx-auto text-gray-300 mb-2" />
              No polls published yet. Use the form on the left to create your first poll.
            </div>
          ) : (
            polls.map((poll) => {
              const isOpen = poll.status === "open" || poll.is_active;
              const missingUrdu = !poll.question_ur;
              const missingEnglish = !poll.question_en;
              const totalVotes = poll.total_votes || 0;

              return (
                <div
                  key={poll.id}
                  className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 transition-all ${
                    isOpen ? "border-[#cbe1d2] ring-1 ring-[#e2f0e6]" : "border-[#e5e2da] opacity-95"
                  }`}
                >
                  {/* Missing Edition Warning Badge */}
                  {missingUrdu && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>No Urdu question — hidden from the Urdu edition</span>
                    </div>
                  )}
                  {missingEnglish && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>No English question — hidden from the English edition</span>
                    </div>
                  )}

                  {/* Header Row: Question and Status Control */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      {/* Urdu Question */}
                      {poll.question_ur && (
                        <h3
                          dir="rtl"
                          className="font-nastaliq text-base sm:text-lg font-bold text-gray-900 leading-relaxed text-right"
                        >
                          {poll.question_ur}
                        </h3>
                      )}
                      {/* English Question */}
                      {poll.question_en && (
                        <h4 className="text-sm sm:text-base font-semibold text-gray-800 leading-snug">
                          {poll.question_en}
                        </h4>
                      )}
                    </div>

                    {/* Status Pill and Close/Reopen Toggle Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isOpen
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {isOpen ? "Open" : "Closed"}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(poll)}
                        disabled={actionLoading === `toggle_${poll.id}`}
                        className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-colors shadow-2xs ${
                          isOpen
                            ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                            : "bg-[#124e2b] text-white border-[#0a2618] hover:bg-[#0a2618]"
                        }`}
                      >
                        {actionLoading === `toggle_${poll.id}` ? (
                          <RefreshCw size={11} className="animate-spin" />
                        ) : isOpen ? (
                          "Close"
                        ) : (
                          "Reopen"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metadata Subline */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 pt-1 border-t border-[#f0ede6]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">
                        {totalVotes.toLocaleString()} {totalVotes === 1 ? "vote" : "votes"}
                      </span>
                      <span>•</span>
                      <span className="bg-[#f4f2ec] text-gray-700 px-2 py-0.5 rounded">
                        {poll.target_stories && poll.target_stories.length > 0
                          ? `${poll.target_stories.length} story: ${poll.target_story_title || "Targeted"}`
                          : "Shows on every story"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleResetVotes(poll.id)}
                        disabled={actionLoading === `reset_${poll.id}`}
                        className="text-gray-400 hover:text-amber-700 flex items-center gap-1 transition-colors"
                        title="Reset votes to 0"
                      >
                        <RotateCcw size={11} />
                        <span>Reset votes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePoll(poll.id)}
                        disabled={actionLoading === `delete_${poll.id}`}
                        className="text-gray-400 hover:text-red-700 flex items-center gap-1 transition-colors"
                        title="Delete poll"
                      >
                        <Trash2 size={11} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Option Percentage Bars */}
                  <div className="space-y-2 pt-1">
                    {(poll.options || []).map((opt) => {
                      const voteCount = opt.votes || 0;
                      const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                      return (
                        <div
                          key={opt.id}
                          className="relative overflow-hidden rounded-lg border border-[#e5e2da] bg-[#f7f5f0] p-2.5 transition-all"
                        >
                          {/* Soft Pale Sage-Green Fill Bar */}
                          <div
                            className="absolute inset-y-0 left-0 bg-[#d1e8d7] transition-all duration-500 ease-out"
                            style={{ width: `${percent}%` }}
                          />

                          {/* Relative Content on top */}
                          <div className="relative z-10 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {/* Urdu label */}
                              {opt.label_ur && (
                                <span
                                  dir="rtl"
                                  className="font-nastaliq text-xs font-semibold text-gray-900 truncate"
                                >
                                  {opt.label_ur}
                                </span>
                              )}
                              {/* English label */}
                              {opt.label_en && (
                                <span className="font-medium text-gray-700 truncate">{opt.label_en}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Quick Vote Test Button */}
                              {isOpen && (
                                <button
                                  type="button"
                                  onClick={() => handleTestVote(poll.id, opt.id)}
                                  className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-[10px] text-[#124e2b] bg-white border border-[#cbe1d2] hover:bg-[#124e2b] hover:text-white px-1.5 py-0.5 rounded transition-all"
                                  title="Test vote +1"
                                >
                                  +1
                                </button>
                              )}
                              <span className="font-bold text-gray-900">
                                {percent}% <span className="font-normal text-gray-500">· {voteCount}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Confirm Reset / Delete Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e2da] w-full max-w-md shadow-2xl p-5 space-y-4 rounded-xl">
            <h3 className="text-sm font-bold text-[#18221b]">
              {confirmAction.type === "reset" ? "Reset poll votes?" : "Delete this poll?"}
            </h3>
            <p className="text-xs text-[#5c635b] leading-relaxed">
              {confirmAction.type === "reset"
                ? "This will reset all vote counts for this poll to zero (0)."
                : "This will permanently delete the poll and its vote history. This cannot be undone."}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-3.5 py-2 text-xs font-semibold border border-[#e5e2da] bg-white text-[#5c635b] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(actionLoading)}
                onClick={executeConfirmAction}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-60 cursor-pointer"
              >
                {actionLoading ? "Processing..." : confirmAction.type === "reset" ? "Reset votes" : "Delete poll"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
