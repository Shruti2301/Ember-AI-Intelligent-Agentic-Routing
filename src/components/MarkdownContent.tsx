"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Play, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const RUNNABLE_LANGUAGES = new Set(["javascript", "js", "typescript", "ts"]);

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={cn(
        "p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white",
        className
      )}
      title="Copy code"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const lang = language || "text";
  const canRun = RUNNABLE_LANGUAGES.has(lang.toLowerCase());
  const [output, setOutput] = useState<string | null>(null);
  const [showOutput, setShowOutput] = useState(false);

  // Run untrusted (model-generated) code inside a sandboxed iframe. The iframe
  // has `sandbox="allow-scripts"` WITHOUT `allow-same-origin`, so it runs at a
  // null origin: it cannot read this page's localStorage (where the BYOK API key
  // lives), cookies, or the DOM. A hard timeout tears it down so an infinite loop
  // can't hang the tab.
  const run = () => {
    setShowOutput(true);
    setOutput("Running…");

    const runnable =
      lang.toLowerCase() === "typescript" || lang.toLowerCase() === "ts"
        ? code.replace(/:\s*[\w<>\[\]|&]+(?=\s*[,)=])/g, "").replace(/:\s*[\w<>\[\]|&]+\[\]/g, "")
        : code;

    const nonce = `run-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";

    let settled = false;

    const onMessage = (e: MessageEvent) => {
      if (settled || !e.data || e.data.nonce !== nonce) return;
      settled = true;
      const out = String(e.data.output ?? "").slice(0, 10_000);
      setOutput(out || "(no output)");
      cleanup();
    };

    function cleanup() {
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
      iframe.remove();
    }

    window.addEventListener("message", onMessage);

    // The sandboxed program: capture console.*, run the code, post results back.
    const program =
      "const logs=[];" +
      "const j=(a)=>a.map(x=>{try{return typeof x==='string'?x:JSON.stringify(x)}catch{return String(x)}}).join(' ');" +
      "const console={log:(...a)=>logs.push(j(a)),error:(...a)=>logs.push('Error: '+j(a)),warn:(...a)=>logs.push('Warn: '+j(a)),info:(...a)=>logs.push(j(a))};" +
      "let out;try{(new Function('console',CODE))(console);out=logs.join('\\n');}catch(e){out=(logs.length?logs.join('\\n')+'\\n':'')+String(e&&e.message||e);}" +
      "parent.postMessage({nonce:NONCE,output:out},'*');";

    iframe.srcdoc =
      "<!doctype html><html><body><script>" +
      "const CODE=" + JSON.stringify(runnable) + ";" +
      "const NONCE=" + JSON.stringify(nonce) + ";" +
      program +
      "<\/script></body></html>";

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      setOutput("Timed out (possible infinite loop).");
      cleanup();
    }, 3000);

    document.body.appendChild(iframe);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[#2a2a4a] not-prose">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#12121f] border-b border-[#2a2a4a]">
        <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono">{lang}</span>
        <div className="flex items-center gap-0.5">
          {canRun && (
            <button
              type="button"
              onClick={run}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              title="Run code"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
          <CopyButton text={code} />
        </div>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={RUNNABLE_LANGUAGES.has(lang.toLowerCase()) ? "javascript" : lang}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.8125rem", padding: "1rem" }}
      >
        {code}
      </SyntaxHighlighter>
      {showOutput && (
        <div className="border-t border-[#2a2a4a]">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#12121f] text-white/80 text-[10px] uppercase tracking-wide">
            <Terminal className="w-3 h-3" />
            Output
            <button
              type="button"
              onClick={() => setShowOutput(false)}
              className="ml-auto text-white/50 hover:text-white text-xs normal-case"
            >
              Hide
            </button>
          </div>
          <pre className="text-xs text-[#e0e0e0] bg-[#0d0d18] p-3 font-mono whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-[#333]",
        "prose-headings:text-[#222] prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-p:leading-relaxed prose-li:leading-relaxed",
        "prose-strong:text-[#222] prose-code:text-[#FF7A6E] prose-code:bg-[#FFF9F5] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:p-0 prose-pre:bg-transparent",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const code = String(children).replace(/\n$/, "");

            if (match) {
              return <CodeBlock language={match[1]} code={code} />;
            }

            return (
              <code className={codeClassName} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
