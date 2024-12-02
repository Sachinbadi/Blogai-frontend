'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Bold, Italic, Link, List, ListOrdered, Quote, Undo, Redo, Copy, Save, Share2 } from 'lucide-react'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { cn } from '@/lib/utils'
import { ErrorBoundary } from '@/components/error-boundary'
import { useToast } from '@/components/ui/use-toast'
import {
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  LinkedinIcon
} from 'next-share'

interface BlogEditorDialogProps {
  open: boolean
  onOpenChange: { (open: boolean): void }
  initialContent: {
    title: string
    content: string
    image?: string
    keywords?: string[]
  }
  SaveId: string
}

// Add proper error type
interface EditorError extends Error {
  code?: string
  message: string
}

export function BlogEditorDialog({
  open,
  onOpenChange,
  initialContent,
  SaveId
}: BlogEditorDialogProps) {
  const { toast } = useToast()

  const onSave = useCallback((content: typeof initialContent) => {
    window.dispatchEvent(new CustomEvent(SaveId, { detail: content }))
  }, [SaveId])

  const [content, setContent] = useState({
    title: initialContent.title || '',
    content: initialContent.content || '',
    image: initialContent.image || '',
    keywords: initialContent.keywords || []
  })
  const [isCopied, setIsCopied] = useState(false)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false
  })
  const editorRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<EditorError | null>(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  // Improve error handling utility
  const throwAsyncError = useCallback((error: unknown) => {
    const editorError: EditorError = error instanceof Error ? error : new Error('Unknown error occurred')
    setError(editorError)
  }, [])

  // Function to apply active formats
  const applyActiveFormats = () => {
    const selection = window.getSelection()
    if (!selection?.rangeCount) return
    
    const range = selection.getRangeAt(0)
    if (range.collapsed) {
      const span = document.createElement('span')
      if (activeFormats.bold) span.style.fontWeight = 'bold'
      if (activeFormats.italic) span.style.fontStyle = 'italic'
      
      range.insertNode(span)
      range.setStart(span, 0)
      range.setEnd(span, 0)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }

  // Handle format toggle
  const handleFormatToggle = (format: 'bold' | 'italic') => {
    setActiveFormats(prev => ({
      ...prev,
      [format]: !prev[format]
    }))

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      if (selection.toString().length > 0) {
        const range = selection.getRangeAt(0)
        const span = document.createElement('span')
        span.style[format === 'bold' ? 'fontWeight' : 'fontStyle'] = format === 'bold' ? 'bold' : 'italic'
        
        range.surroundContents(span)
      }
    }

    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  // Improve content change handler with proper types
  const handleContentChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    try {
      if (!editorRef.current) return
      
      const target = e.currentTarget
      if (!(target instanceof HTMLDivElement)) return
      
      setContent(prev => ({
        ...prev,
        content: target.innerHTML
      }))
    } catch (err) {
      throwAsyncError(err)
    }
  }, [throwAsyncError])

  // Separate cursor management into its own effect
  useEffect(() => {
    const selection = window.getSelection()
    if (!selection?.rangeCount) return
    
    const range = selection.getRangeAt(0)
    selection.removeAllRanges()
    selection.addRange(range)
  }, [content.content])

  // Improve key handler with proper event typing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!editorRef.current) return
    
    if (e.key.length === 1 || e.key === 'Space' || e.key === 'Enter') {
      e.preventDefault()
      
      const selection = window.getSelection()
      if (!selection) return
      
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null
      if (!range) return
      
      // Create text node with proper type checking
      const text = e.key === 'Space' ? ' ' : e.key
      const textNode = document.createTextNode(text)
      
      if (activeFormats.bold || activeFormats.italic) {
        const span = document.createElement('span')
        if (activeFormats.bold) span.style.fontWeight = 'bold'
        if (activeFormats.italic) span.style.fontStyle = 'italic'
        span.appendChild(textNode)
        
        range.insertNode(span)
        range.setStartAfter(span)
        range.setEndAfter(span)
      } else {
        range.insertNode(textNode)
        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
      }
      
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      
      if (editorRef.current) {
        setContent(prev => ({
          ...prev,
          content: editorRef.current?.innerHTML || prev.content
        }))
      }
    }
  }

  // Improve paste handler with proper type checking
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!editorRef.current) return
    
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    const selection = window.getSelection()
    if (!selection) return
    
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null
    if (!range) return
    
    const span = document.createElement('span')
    if (activeFormats.bold) span.style.fontWeight = 'bold'
    if (activeFormats.italic) span.style.fontStyle = 'italic'
    span.textContent = text
    
    range.deleteContents()
    range.insertNode(span)
    
    range.setStartAfter(span)
    range.setEndAfter(span)
    selection.removeAllRanges()
    selection.addRange(range)

    if (editorRef.current) {
      setContent(prev => ({
        ...prev,
        content: editorRef.current?.innerHTML || prev.content
      }))
    }
  }

  const handleCopy = async () => {
    if (editorRef.current) {
      await navigator.clipboard.writeText(editorRef.current.innerText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  // Handle selection formatting
  const handleSelectionFormat = (format: string) => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    if (!selectedText) return

    switch (format) {
      case 'link':
        const url = prompt('Enter URL:', 'https://')
        if (url) {
          document.execCommand('createLink', false, url)
        }
        break
      case 'quote':
        document.execCommand('formatBlock', false, 'blockquote')
        break
      case 'bullet':
        document.execCommand('insertUnorderedList', false)
        break
      case 'number':
        document.execCommand('insertOrderedList', false)
        break
    }
  }

  // Focus handler to maintain formatting state
  const handleFocus = () => {
    applyActiveFormats()
  }

  // Click handler to maintain formatting state
  const handleClick = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && selection.toString() === '') {
      applyActiveFormats()
    }
  }

  // Add useEffect to maintain formatting state
  useEffect(() => {
    if (editorRef.current) {
      const handleSelectionChange = () => {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          if (range.collapsed) {
            applyActiveFormats()
          }
        }
      }

      document.addEventListener('selectionchange', handleSelectionChange)
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange)
      }
    }
  }, [activeFormats])

  // Add save handler
  const handleSave = useCallback(() => {
    try {
      if (!editorRef.current) {
        throw new Error('Editor reference not found')
      }
      
      if (!content.title.trim()) {
        throw new Error('Title is required')
      }
      
      onSave({
        ...content,
        content: editorRef.current.innerHTML
      })
      
      // Close the dialog after saving
      onOpenChange(false)
      
      // Show success toast
      toast({
        title: "Success",
        description: "Blog saved successfully!",
      })
    } catch (err) {
      throwAsyncError(err)
    }
  }, [content, onSave, throwAsyncError, onOpenChange])

  // Add share and save handler
  const handleShareAndSave = useCallback(() => {
    try {
      if (!editorRef.current) {
        throw new Error('Editor reference not found')
      }
      
      if (!content.title.trim()) {
        throw new Error('Title is required')
      }
      
      // First save the blog
      onSave({
        ...content,
        content: editorRef.current.innerHTML
      })
      
      // Then open share dialog
      setIsShareDialogOpen(true)
      
      // Show success toast
      toast({
        title: "Success",
        description: "Blog saved and ready to share!",
      })
    } catch (err) {
      throwAsyncError(err)
    }
  }, [content, onSave, throwAsyncError])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ErrorBoundary
        fallback={
          <DialogContent className="max-w-4xl">
            <div className="p-4 text-red-600">
              <h3 className="font-semibold">Error</h3>
              <p>{error?.message || 'An unknown error occurred'}</p>
            </div>
          </DialogContent>
        }
      >
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <div className="flex-none p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2 flex-1">
                <Input
                  id="title"
                  value={content.title}
                  onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                  className="text-2xl font-bold border-none focus:ring-0 px-0"
                />
                <div className="flex flex-wrap gap-2">
                  {content.keywords?.map((keyword, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={handleSave}
                  className="bg-white hover:bg-white-600 text-black"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleShareAndSave}
                  className="bg-black hover:bg-black-600 text-white"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share & Save
                </Button>
              </div>
            </div>
            
            {content.image && (
              <div className="w-full max-h-48 overflow-hidden rounded-md">
                <ImageWithFallback
                  src={content.image}
                  alt="Blog featured image"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex-none p-2 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleFormatToggle('bold')}
                className={cn(
                  activeFormats.bold && "bg-purple-100 text-purple-900"
                )}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleFormatToggle('italic')}
                className={cn(
                  activeFormats.italic && "bg-purple-100 text-purple-900"
                )}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSelectionFormat('link')}>
                <Link className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSelectionFormat('quote')}>
                <Quote className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSelectionFormat('bullet')}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSelectionFormat('number')}>
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="border-l mx-2 h-6" />
              <Button variant="ghost" size="sm" disabled>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled>
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-grow p-6 pb-20 overflow-hidden">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={handleFocus}
              onClick={handleClick}
              className="w-full h-full outline-none border rounded-md p-6 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: content.content }}
              style={{ 
                minHeight: '300px',
                marginBottom: '2rem'
              }}
            />
          </div>
        </DialogContent>
      </ErrorBoundary>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Blog</DialogTitle>
            <DialogDescription>Choose how you'd like to share this blog post.</DialogDescription>
          </DialogHeader>
          
          {/* Add social media buttons */}
          <div className="flex justify-center gap-4 py-4 border-b">
            <FacebookShareButton
              url={window.location.href}
              quote={content.title}
            >
              <FacebookIcon size={40} round />
            </FacebookShareButton>
            
            <LinkedinShareButton
              url={window.location.href}
              title={content.title}
            >
              <LinkedinIcon size={40} round />
            </LinkedinShareButton>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
} 