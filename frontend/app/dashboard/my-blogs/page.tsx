'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import ReactMarkdown from 'react-markdown'
import { ImageWithFallback } from '@/components/image-with-fallback'
import { Loader2 } from 'lucide-react'

interface GeneratedBlog {
  id: string
  title: string
  content: string
  image: string
  createdAt: string
  keywords: string[]
}

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState<GeneratedBlog[]>([])
  const [selectedBlog, setSelectedBlog] = useState<GeneratedBlog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const savedBlogs = JSON.parse(localStorage.getItem('generatedBlogs') || '[]')
    setBlogs(savedBlogs)
  }, [])

  const formatContent = (content: string) => {
    return content
      .replace(/^\*\*Title:\*\*.*?\n\n/, '')
      .replace(/^\*\*Keywords:\*\*.*?\n\n/, '')
      .replace(/^\*\*Number of Items:\*\*.*?\n\n/, '')
      .replace(/^\*\*Examples:\*\*.*?\n\n/, '')
      .replace(/^\*\*Media:\*\*.*?\n\n/, '')
      .replace(/^\*\*Links:\*\*.*?\n\n/, '')
      .replace(/\[Media:.*?\]/g, '')
      .replace(/\[Links:.*?\]/g, '')
  }

  const handleReadMore = (blog: GeneratedBlog) => {
    setSelectedBlog(blog)
    setIsDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Generated Blogs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Card key={blog.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{blog.title}</CardTitle>
            </CardHeader>
            
            <div className="w-full h-48 relative overflow-hidden rounded-t-lg">
              <ImageWithFallback
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.keywords.map((keyword, index) => (
                  <Badge key={`${keyword}-${index}`} variant="secondary" className="bg-purple-100 text-purple-800">
                    {keyword}
                  </Badge>
                ))}
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-h-48 overflow-y-auto">
                <ReactMarkdown
                  components={{
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-800 dark:text-purple-300">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-3 text-gray-700 dark:text-gray-300">
                        {children}
                      </p>
                    ),
                    em: ({ children }) => (
                      <em className="text-gray-600 dark:text-gray-400 italic">
                        {children}
                      </em>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900 dark:text-gray-100">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {formatContent(blog.content)}
                </ReactMarkdown>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {new Date(blog.createdAt).toLocaleDateString()}
              </span>
              <Button 
                variant="outline"
                onClick={() => handleReadMore(blog)}
              >
                Read More
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {blogs.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            <p>No blogs generated yet. Go to the dashboard to create your first blog!</p>
          </div>
        )}
      </div>

      {/* Full Blog Content Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">
              {selectedBlog?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="w-full h-64 relative overflow-hidden rounded-lg mb-6">
            <ImageWithFallback
              src={selectedBlog?.image || ''}
              alt={selectedBlog?.title || ''}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {selectedBlog?.keywords.map((keyword, index) => (
              <Badge 
                key={`dialog-${keyword}-${index}`} 
                variant="secondary" 
                className="bg-purple-100 text-purple-800"
              >
                {keyword}
              </Badge>
            ))}
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mt-6 mb-3 text-purple-800 dark:text-purple-300">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {children}
                  </p>
                ),
                em: ({ children }) => (
                  <em className="text-gray-600 dark:text-gray-400 italic">
                    {children}
                  </em>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900 dark:text-gray-100">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-4">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="mb-2 text-gray-700 dark:text-gray-300">
                    {children}
                  </li>
                ),
              }}
            >
              {formatContent(selectedBlog?.content || '')}
            </ReactMarkdown>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 

function GeneratingBlogLoader() {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full border-4 border-purple-200 opacity-20 animate-ping" />
            </div>
            <div className="relative flex items-center justify-center">
              <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Generating Your Blog
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please wait while we create your blog post...
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="h-1.5 w-64 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full animate-progress" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This may take a few moments
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 