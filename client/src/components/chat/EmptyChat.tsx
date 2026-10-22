import type { CSSProperties } from "react";
import Seal from "@/components/brand/Seal";

const at = (i: number) => ({ "--i": i, "--base": "450ms" }) as CSSProperties;

const EmptyChat = () => {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="max-w-md text-center">
        <Seal size={64} animate delay={350} className="mx-auto" />
        <p className="reveal eyebrow mt-8" style={at(0)}>Welcome to SwiftChat</p>
        <h2 className="reveal mt-3 font-display text-5xl leading-[0.95] tracking-tight" style={at(1)}>
          Nothing on the line <span className="italic text-shu">yet.</span>
        </h2>
        <p className="reveal mt-4 text-sm text-paper-dim" style={at(2)}>
          Select a conversation to start chatting in real time.
        </p>
      </div>
    </div>
  )
}

export default EmptyChat
