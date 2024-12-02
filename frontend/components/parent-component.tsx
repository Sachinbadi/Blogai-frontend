'use client'
import { useCallback, useState, useEffect } from 'react'
import { BlogEditorDialog } from '@/components/blog-editor-dialog'
import { nanoid } from 'nanoid'

interface BlogContent {
  title: string
  content: string
  image?: string
  keywords?: string[]
}

export const ParentComponent = () => {
  const [open, setOpen] = useState(false)
  const initialContent = {
    title: '',
    content: '',
    image: '',
    keywords: []
  }
  
  const handleOpenChange = useCallback((open: boolean) => {
    setOpen(open)
  }, [])

  const handleSave = useCallback((content: BlogContent) => {
    // Add your save logic here
    console.log('Saving:', content)
    setOpen(false)
  }, [])

  const saveId = 'blog-save-' + nanoid()

  return (
    <BlogEditorDialog
      open={open}
      onOpenChange={handleOpenChange}
      initialContent={initialContent}
      SaveId={saveId}
    />
  )
} 