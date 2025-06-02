"use client"

import { PromptInputWithActions } from "@/components/input"
import { useGraphStore } from '@/providers/graph-store-provider'


export default function Home() {

  const html = useGraphStore((s) => s.graphHtml)

  return (
    <main className="min-h-screen min-w-screen flex flex-col items-center justify-between p-16">
      <nav>
        X-Files
      </nav>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="h-[800px] w-full"
      />
      <PromptInputWithActions />
    </main>
  );
}
