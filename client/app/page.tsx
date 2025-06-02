"use client"

import { PromptInputWithActions } from "@/components/input"
import { useGraphStore } from '@/providers/graph-store-provider'


export default function Home() {

  const html = useGraphStore((s) => s.graphHtml)

  return (
    <main className="min-h-screen min-w-screen flex flex-col items-center justify-between bg-[#E2DEDA]">
      <nav>
        X-Files
      </nav>
      <div>
        {html ? (
          <div
            dangerouslySetInnerHTML={{ __html: html }}
            className="h-[800px] w-full"
          />
        ) : (
          <section className="w-full max-w-4xl mx-auto text-center py-20 px-4 flex flex-col items-center justify-end mt-[190px]">
            <h1 className="text-[60px] font-bold text-gray-900 mb-8 leading-[65px] tracking-[-2.5px]">
              uncover hidden patterns
              <br />
              in X profiles
            </h1>
            <p className="text-xl text-gray-600 mb-8 w-[80%] mx-auto tracking-[-1px]">
              we analyze top accounts, surface overlooked insights, and give you a map of what makes them work — no guesswork required.
            </p>
          </section>
        )}
      </div>
      <PromptInputWithActions />
    </main>
  );
}
