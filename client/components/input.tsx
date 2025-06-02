"use client"

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "./ui/prompt-input"
import { Button } from "./ui/button" 
import { ArrowUp, Paperclip, Square, X } from "lucide-react"
import { useRef, useState } from "react"
import { useGraphStore } from '@/providers/graph-store-provider'

/**
 * This component renders a prompt input with actions.
 * It allows the user to input text and attach files.
 * It also displays the attached files below the input.
 * When the user submits the form, it will display a loading state
 * and then reset the input and attached files after 2 seconds.
 */
export function PromptInputWithActions() {
  const [input, setInput] = useState("") // input text
  const [isLoading, setIsLoading] = useState(false) // loading state
  const [files, setFiles] = useState<File[]>([]) // attached files
  const uploadInputRef = useRef<HTMLInputElement>(null) // reference to the file input
  const setGraphHtml = useGraphStore((s) => s.setGraphHtml)

  /**
   * Handles the form submission.
   * If there is input text or attached files, it will display a loading state
   * and then reset the input and attached files after 2 seconds.
   */

  const handleSubmit = async () => {
    if (!input.trim() && files.length === 0) return;
  
    setIsLoading(true);
  
    try {
      const payload = {
        text: input.trim()
      };
  
      const response = await fetch("http://localhost:7000/graph/json", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server responded with:', response.status, errorText);
        throw new Error(`Request failed with status ${response.status}`);
      }
  
      const graphData = await response.json();
      console.log('Received graph data:', graphData);
      // Process the graph data as needed
      // For example: setGraphData(graphData);
      setInput("");
      setFiles([]);
    } catch (err) {
      console.error("Failed to generate graph:", err);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handles the file input change event.
   * It adds the new files to the list of attached files.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  /**
   * Handles the file removal event.
   * It removes the file from the list of attached files
   * and resets the file input.
   */
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    if (uploadInputRef?.current) {
      uploadInputRef.current.value = ""
    }
  }

  return (
    <PromptInput
      value={input}
      onValueChange={setInput}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      className="
                 bg-[#D0CDC9] 
                 w-full max-w-[960px] h-[135px] mb-[12px]
                 flex flex-col justify-between 
                 border border-black border-[1.6px]"
    >
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="bg-secondary flex items-center gap-2 rounded-[860px] px-3 py-2 text-sm"
            >
              <Paperclip className="size-4" />
              <span className="max-w-[120px] truncate">{file.name}</span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="hover:bg-secondary/50 rounded-full p-1"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <PromptInputTextarea 
        className="flex-1 text-lg placeholder:text-lg placeholder:text-black placeholder:opacity-70 [&>textarea]:text-lg [&>textarea]:leading-6" 
        placeholder="Paste X profile link here..."
      />
      <PromptInputActions className="flex items-center justify-between gap-2">
        <div className="relative rounded-full w-[140px] h-[48px] ml-1 flex items-center justify-center gap-2 px-4 bg-[#D0CDC9] text-black border border-black border-[1.6px] transition-colors cursor-pointer">
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 cursor-pointer"
            title="X Profile"
          >
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden flex items-center"
              id="file-upload"
            />
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </label>
        </div>

        <Button
          variant="default"
          size="icon"
          className="rounded-full w-[140px] h-[48px]"
          onClick={handleSubmit}
          title={isLoading ? "Stop generation" : "Send message"}
        >
          <span className="font-medium text-[18px]">Analyze</span>
          {isLoading ? (
            <Square className="size-5 fill-current" />
          ) : (
            <ArrowUp className="size-5" />
          )}
        </Button>
      </PromptInputActions>
    </PromptInput>
  )
}
