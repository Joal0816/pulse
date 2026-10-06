"use client";

import React, { useState } from "react";
import { Check, Copy, Code2, Globe } from "lucide-react";
import { MonitoredSite } from "@/lib/types";

interface SnippetModalProps {
  site?: MonitoredSite;
  onClose: () => void;
}

export function SnippetModal({ site, onClose }: SnippetModalProps) {
  const [copied, setCopied] = useState(false);
  const siteId = site ? site.id : "YOUR_SITE_ID";

  const snippetCode = `<!-- Pulse Telemetry Tracking Snippet -->
<script
  defer
  src="https://pulse.joalvergs.tech/p.js"
  data-site="${siteId}"
></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1622] border border-[#1c2a3d] rounded-xl max-w-xl w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2a3d]">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">
              Installation Snippet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1 rounded bg-[#152030] border border-[#1c2a3d]"
          >
            ESC
          </button>
        </div>

        <div className="py-4 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Embed this lightweight (0.8 KB, zero-dependency, privacy-preserving) script in the <code className="text-cyan-300 bg-[#080c12] px-1.5 py-0.5 rounded font-mono text-[11px]">&lt;head&gt;</code> or bottom of <code className="text-cyan-300 bg-[#080c12] px-1.5 py-0.5 rounded font-mono text-[11px]">&lt;body&gt;</code> of {site ? <span className="font-semibold text-white">{site.name}</span> : "your website"}.
          </p>

          <div className="relative bg-[#080c12] border border-[#1c2a3d] rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre className="text-cyan-300 select-all">{snippetCode}</pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-sans font-medium rounded bg-[#1c2a3d] hover:bg-cyan-600/30 text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2 text-xs text-slate-400 border-t border-[#1c2a3d]/60 pt-3">
            <div className="font-medium text-slate-200">How it works:</div>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Zero cookies, zero localStorage personal fingerprints, 100% GDPR/ePrivacy compliant.</li>
              <li>Tracks real visits, pageviews, referrers, device types and viewport size.</li>
              <li>Automatic Single-Page-App (SPA) route change tracking via History API listeners.</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#1c2a3d] hover:bg-[#25364d] text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
