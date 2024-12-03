'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Blog {
  id: string
  title: string
  content: string
  image?: string
  keywords?: string[]
  createdAt: string
  isHtml?: boolean
}

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // Load blogs from localStorage
    const savedBlogs = JSON.parse(localStorage.getItem('generatedBlogs') || '[]')
    setBlogs(savedBlogs)
  }, [])

  const handleDelete = (id: string) => {
    const updatedBlogs = blogs.filter(blog => blog.id !== id)
    localStorage.setItem('generatedBlogs', JSON.stringify(updatedBlogs))
    setBlogs(updatedBlogs)
  }

  const handleBlogClick = (blog: Blog) => {
    setSelectedBlog(blog)
    setIsDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Blogs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Card 
            key={blog.id} 
            className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleBlogClick(blog)}
          >
            {blog.image && (
              <div className="w-full h-48 relative overflow-hidden rounded-t-lg">
                <ImageWithFallback
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {blog.keywords?.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            
            <CardContent>
              <div 
                className="prose max-w-none line-clamp-3"
                dangerouslySetInnerHTML={{ 
                  __html: blog.isHtml ? blog.content : blog.content.replace(/\n/g, '<br>') 
                }}
              />
            </CardContent>
            
            <CardFooter className="mt-auto pt-4 flex justify-between">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(blog.id)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No blogs yet. Start creating your first blog!</p>
        </div>
      )}

      {/* Full Blog Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBlog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-4">
                  {selectedBlog.title}
                </DialogTitle>
              </DialogHeader>

              {selectedBlog.image && (
                <div className="w-full h-64 relative overflow-hidden rounded-lg mb-6">
                  <ImageWithFallback
                    src={selectedBlog.image}
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedBlog.keywords?.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-purple-100 text-purple-900"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>

              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: selectedBlog.isHtml 
                    ? selectedBlog.content 
                    : selectedBlog.content.replace(/\n/g, '<br>') 
                }}
              />

              <div className="text-sm text-gray-500 mt-4">
                Created on: {new Date(selectedBlog.createdAt).toLocaleDateString()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 