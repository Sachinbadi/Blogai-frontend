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
import axios from '@/lib/axios'

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
      // Update the API call to use the correct URL format
      const response = await axios.post(`/user/${encodeURIComponent(user.username)}/add-blog`, {
        title,
        content
      })

      toast({
        title: 'Success',
        description: 'Your blog post has been successfully created.'
      })

      // Clear form
      setTitle('')
      setContent('')

      // Navigate to dashboard or blog list
      router.push('/dashboard')

    } catch (error: any) {
      console.error('Error creating blog:', error.response || error)
      
      // Handle specific API error responses
      if (error.response?.data?.detail) {
        // Handle validation errors from backend
        if (typeof error.response.data.detail === 'object') {
          setErrors(error.response.data.detail)
        } else {
          setErrors({ _form: [error.response.data.detail] })
        }
      } else {
        // Handle unexpected errors
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive'
        })
      }
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                  Creating...
                </>
              ) : (
                'Create Blog Post'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 