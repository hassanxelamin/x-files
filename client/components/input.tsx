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
    if (!input.trim() && files.length === 0) return
  
    setIsLoading(true)
  
    try {
      let formData = new FormData()
      if (input.trim()) formData.append("text", input)
      if (files.length > 0) formData.append("file", files[0]) // just first file
  
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'text/html',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server responded with:', response.status, errorText)
        throw new Error(`Request failed with status ${response.status}`)
      }
  
      const html = await response.text()
      console.log('Received HTML response:', html.substring(0, 100) + '...')
      setGraphHtml(html)
      setInput("")
      setFiles([])
    } catch (err) {
      console.error("Failed to generate graph:", err)
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false)
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
      className="w-full max-w-(--breakpoint-md)"
    >
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
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

      <PromptInputTextarea placeholder="Ask me anything..." />
      <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
        <div className="relative">
          <label
            htmlFor="file-upload"
            className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl"
            title="Attach files"
          >
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <Paperclip className="text-primary size-5" />
          </label>
        </div>

        <Button
          variant="default"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleSubmit}
          title={isLoading ? "Stop generation" : "Send message"}
        >
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
