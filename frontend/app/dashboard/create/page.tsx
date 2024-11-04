'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import AuthService from '@/services/auth'

interface CreateBlogError {
  title?: string[]
  content?: string[]
  _form?: string[]
}

export default function CreateBlogPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<CreateBlogError>({})
  const router = useRouter()
  const { toast } = useToast()

  // Check authentication on mount
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/auth')
      return
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const user = AuthService.getUser()

    if (!user?.username) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a blog post',
        variant: 'destructive'
      })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${user.username}/add-blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors(errorData.detail || { _form: ['Failed to create blog post'] })
        toast({
          title: 'Error',
          description: 'Failed to create blog post. Please try again.',
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Your blog post has been successfully created.'
      })
      router.push('/dashboard')
      router.refresh()

    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
          <CardDescription>Fill out the form below to create a new blog post.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the blog post title"
                required
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <p id="title-error" className="text-sm text-red-500">
                  {errors.title.join(', ')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog post content here"
                required
                className="min-h-[200px]"
                aria-invalid={!!errors.content}
                aria-describedby={errors.content ? 'content-error' : undefined}
              />
              {errors.content && (
                <p id="content-error" className="text-sm text-red-500">
                  {errors.content.join(', ')}
                </p>
              )}
            </div>
            {errors._form && (
              <p className="text-sm text-red-500">
                {errors._form.join(', ')}
              </p>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full"
            >
              {isSubmitting ? 'Creating...' : 'Create Blog Post'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 