"use client";
import React, { useState, useEffect } from "react";
import { Vote, CheckCircle2, BarChart2, Loader2 } from "lucide-react";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function PollWidget() {
  const { isUrdu, isEnglish } = useSiteLanguage();
  const [poll, setPoll] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPoll() {
      try {
        const res = await fetch("/api/poll");
        const data = await res.json();
        if (data.poll) {
          setPoll(data.poll);
          const voteKey = `afadiat_poll_${data.poll.id}`;
          if (typeof window !== "undefined" && localStorage.getItem(voteKey)) {
            setHasVoted(true);
          }
        }
      } catch (e) {
        console.error("Poll fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadPoll();
  }, []);

  const handleVote = async () => {
    if (!selectedOpt || submitting || !poll) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selectedOpt }),
      });
      const data = await res.json();
      if (data.poll) {
        setPoll(data.poll);
        setHasVoted(true);
        if (typeof window !== "undefined") {
          localStorage.setItem(`afadiat_poll_${data.poll.id}`, selectedOpt);
        }
      }
    } catch (e) {
      console.error("Vote submission error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !poll || !poll.is_active) {
    return null;
  }

  const question = isEnglish ? (poll.question_en || poll.question_ur) : (poll.question_ur || poll.question_en);
  const totalVotes = poll.total_votes || 1;

  return (
    <div className="border border-[#dcd8cd] bg-[#efeee9] p-4 shadow-xs">
      {/* Header */}
      <div className="border-b-2 border-emerald-700 pb-2 mb-3 flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 font-sans flex items-center gap-1.5">
          <Vote size={16} className="text-emerald-800" />
          <span>{isUrdu ? "رائے شماری" : "Public Opinion Poll"}</span>
        </h3>
        <span className="text-[10px] bg-emerald-800/10 text-emerald-900 font-bold px-1.5 py-0.5 rounded font-sans">
          {poll.total_votes} {isUrdu ? "ووٹ" : "votes"}
        </span>
      </div>

      {/* Question */}
      <h4 className={`text-xs sm:text-sm font-bold text-gray-900 leading-snug mb-3 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
        {question}
      </h4>

      {/* Poll Options or Results */}
      {!hasVoted ? (
        <div className="space-y-2">
          {poll.options.map((opt) => (
            <label
              key={opt.id}
              onClick={() => setSelectedOpt(opt.id)}
              className={`flex items-center gap-2.5 p-2 rounded cursor-pointer border transition text-xs select-none ${
                selectedOpt === opt.id
                  ? "border-emerald-700 bg-white font-bold text-emerald-900 shadow-2xs"
                  : "border-[#dcd8cd] bg-[#f7f6f3] hover:bg-white text-gray-800"
              }`}
            >
              <input
                type="radio"
                name="daily_poll_opt"
                value={opt.id}
                checked={selectedOpt === opt.id}
                onChange={() => setSelectedOpt(opt.id)}
                className="text-emerald-700 focus:ring-emerald-600 size-3.5"
              />
              <span className={isUrdu ? "urdu-body text-xs" : "font-sans text-xs"}>
                {isEnglish ? (opt.label_en || opt.label_ur) : (opt.label_ur || opt.label_en)}
              </span>
            </label>
          ))}

          <button
            type="button"
            onClick={handleVote}
            disabled={!selectedOpt || submitting}
            className="w-full mt-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-gray-400 text-white font-bold text-xs py-2 px-3 transition font-sans flex items-center justify-center gap-1.5 shadow-2xs"
          >
            {submitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>{isUrdu ? "ووٹ درج ہو رہا ہے..." : "Recording Vote..."}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                <span>{isUrdu ? "ووٹ درج کریں" : "Submit Your Vote"}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-2.5 pt-1">
          {poll.options.map((opt) => {
            const pct = Math.round(((opt.votes || 0) / totalVotes) * 100);
            return (
              <div key={opt.id} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-sans">
                  <span className="font-semibold text-gray-800">
                    {isEnglish ? (opt.label_en || opt.label_ur) : (opt.label_ur || opt.label_en)}
                  </span>
                  <span className="font-bold text-emerald-900">{pct}% ({opt.votes || 0})</span>
                </div>
                <div className="w-full h-2 bg-[#dcd8cd]/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 transition-all duration-700 rounded-full"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}

          <div className="pt-2 border-t border-[#dcd8cd] flex items-center justify-between text-[10px] text-gray-500 font-sans">
            <span className="text-emerald-800 font-bold flex items-center gap-1">
              <CheckCircle2 size={11} />
              <span>{isUrdu ? "آپ کا ووٹ شمار ہو چکا ہے" : "Your vote was recorded"}</span>
            </span>
            <span>کل رائے: {poll.total_votes}</span>
          </div>
        </div>
      )}
    </div>
  );
}
