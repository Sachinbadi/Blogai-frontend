'use client'

import React from 'react'
import { useState, useEffect, useCallback, FormEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Moon, Sun, User, Settings, Search, Bell, Home, BookOpen, PenTool, Share2, LogOut, Filter, ImageOff, Plus, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useRouter } from 'next/navigation'
import AuthService from '@/services/auth'
import axios from '@/lib/axios'
import { useToast } from '@/components/ui/use-toast'

interface Blog {
  id: string
  title: string
  description: string
  fullDescription: string
  image: string
  author: string
  date: string
  link?: string
  source?: string
}

interface User {
  name: string
  email: string
}

interface ShareFormData {
  blogId: string
  title: string
  takeaways: string
  tone: string
  writingStyle: string
}

interface FilterState {
  author: string
  date: string
  xmlUrl: string
}

interface XmlUrlRequest {
  urls: { [key: string]: string }
}

interface XmlUrlData {
  url: string
  domain: string
}

type UrlEntry = {
  url: string
  domain: string
}

function ImageWithFallback({ src, alt, className }: { src: string, alt: string, className?: string }) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setError(false)
    setLoading(true)
  }, [src])

  // Default image URL - replace with your actual default image
  const defaultImage = 'https://via.placeholder.com/400x300?text=No+Image'

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
        <img 
          src={defaultImage}
          alt="Default"
          className={className}
          onError={() => setError(true)}
        />
      </div>
    )
  }

  return error ? (
    <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
      <img 
        src={defaultImage}
        alt="Default"
        className={className}
      />
    </div>
  ) : (
    <div className="relative">
      {loading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  )
}

export function DashboardPage() {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    author: 'all',
    date: 'all',
    xmlUrl: 'all'
  })
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([])
  const [shareFormData, setShareFormData] = useState<ShareFormData>({
    blogId: '',
    title: '',
    takeaways: '',
    tone: '',
    writingStyle: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allArticles, setAllArticles] = useState<Blog[]>([])
  const [isAddUrlsDialogOpen, setIsAddUrlsDialogOpen] = useState(false)
  const [urlEntries, setUrlEntries] = useState<UrlEntry[]>([{ url: '', domain: '' }])
  const [addUrlsError, setAddUrlsError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [xmlUrls, setXmlUrls] = useState<XmlUrlData[]>([])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    const user = AuthService.getUser()
    if (user) {
      setCurrentUser({
        name: user.username,
        email: `${user.username}` // Update this if you store email
      })
    }
  }, [])

  const handleShareClick = (e: React.MouseEvent, blog: Blog) => {
    e.stopPropagation()
    setSelectedBlog(blog)
    setShareFormData({
      ...shareFormData,
      blogId: blog.id,
      title: blog.title
    })
    setIsShareDialogOpen(true)
  }

  const handleBlogClick = (blog: Blog) => {
    setSelectedBlog(blog)
    setIsBlogDialogOpen(true)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = () => {
    AuthService.logout()
    router.push('/auth')
  }

  const applyFilters = useCallback(async () => {
    setIsLoading(true)
    try {
      let filtered = [...allArticles]

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(blog => {
          return (
            blog.title.toLowerCase().includes(query) ||
            blog.description.toLowerCase().includes(query) ||
            blog.fullDescription.toLowerCase().includes(query) ||
            blog.author.toLowerCase().includes(query)
          )
        })
      }

      if (filters.author !== 'all') {
        filtered = filtered.filter(blog => blog.author === filters.author)
      }

      if (filters.date !== 'all') {
        const now = new Date()
        filtered = filtered.filter(blog => {
          const blogDate = new Date(blog.date)
          switch (filters.date) {
            case 'last-week':
              return (now.getTime() - blogDate.getTime()) <= 7 * 24 * 60 * 60 * 1000
            case 'last-month':
              return (now.getTime() - blogDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
            case 'last-year':
              return (now.getTime() - blogDate.getTime()) <= 365 * 24 * 60 * 60 * 1000
            default:
              return true
          }
        })
      }

      if (filters.xmlUrl !== 'all') {
        // Fetch XML URLs to get the URL for selected domain
        const xmlUrlsResponse = await axios.get('/xml/get-urls')
        const selectedXmlUrl = xmlUrlsResponse.data.find((x: XmlUrlData) => x.domain === filters.xmlUrl)
        
        if (selectedXmlUrl) {
          filtered = filtered.filter(article => {
            return article.source === selectedXmlUrl.url
          })
        }
      }

      setFilteredBlogs(filtered)
    } catch (error) {
      setError('Failed to apply filters')
    } finally {
      setIsLoading(false)
      setIsFilterOpen(false)
    }
  }, [filters, searchQuery, allArticles])

  const handleShareSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await axios.post('/api/blogs/share', shareFormData)
      
      // Close dialog and show success message
      setIsShareDialogOpen(false)
      
      // Reset form
      setShareFormData({
        blogId: '',
        title: '',
        takeaways: '',
        tone: '',
        writingStyle: ''
      })
      
      // You can add a toast notification here for success
      
    } catch (error) {
      console.error('Error sharing blog:', error)
      // You can add error handling/toast here
    }
  }

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('/article')
        const articles = response.data.map((article: any) => ({
          id: article.id,
          title: article.title,
          description: article.summary || article.description || '',
          fullDescription: article.content || article.fullDescription || '',
          image: article.image_url || '',
          author: article.author || 'Unknown',
          date: new Date(article.published).toLocaleDateString(),
          source: article.source || 'Unknown'
        }))
        setAllArticles(articles)
        setFilteredBlogs(articles)
      } catch (error) {
        console.error('Error fetching articles:', error)
        setError('Failed to load articles')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const handleAddUrls = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setAddUrlsError(null)

    try {
      const hasEmptyFields = urlEntries.some(entry => !entry.url || !entry.domain)
      if (hasEmptyFields) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all URL and domain fields",
        })
        setAddUrlsError('All fields are required')
        setIsSubmitting(false)
        return
      }

      const urlsObject = urlEntries.reduce((acc, entry) => {
        if (entry.url && entry.domain) {
          acc[entry.url.trim()] = entry.domain.trim()
        }
        return acc
      }, {} as { [key: string]: string })

      const response = await axios.post('/xml/add-urls', {
        urls: urlsObject
      })

      if (response.data.errors) {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.errors.join(', '),
        })
        setAddUrlsError(response.data.errors.join('\n'))
      } else {
        toast({
          title: "Success",
          description: `Successfully added ${Object.keys(urlsObject).length} URLs`,
        })
        setIsAddUrlsDialogOpen(false)
        setUrlEntries([{ url: '', domain: '' }])
        
        // Immediately fetch updated XML URLs
        const xmlUrlsResponse = await axios.get('/xml/get-urls')
        setXmlUrls(xmlUrlsResponse.data)
        
        // Refresh articles list
        const articlesResponse = await axios.get('/article')
        const articles = articlesResponse.data.map((article: any) => ({
          id: article.id,
          title: article.title,
          description: article.summary || article.description || '',
          fullDescription: article.content || article.fullDescription || '',
          image: article.image_url || '',
          author: article.author || 'Unknown',
          date: new Date(article.published).toLocaleDateString(),
          source: article.source || 'Unknown',
          link: article.link || ''
        }))
        setAllArticles(articles)
        setFilteredBlogs(articles)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to add URLs. Please try again.'
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
      setAddUrlsError(errorMessage)
      console.error('Error adding URLs:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUrlEntryChange = (index: number, field: keyof UrlEntry, value: string) => {
    const newEntries = [...urlEntries]
    newEntries[index][field] = value
    setUrlEntries(newEntries)
  }

  const addUrlEntry = () => {
    setUrlEntries([...urlEntries, { url: '', domain: '' }])
  }

  const removeUrlEntry = (index: number) => {
    if (urlEntries.length > 1) {
      const newEntries = urlEntries.filter((_, i) => i !== index)
      setUrlEntries(newEntries)
    }
  }

  useEffect(() => {
    const fetchXmlUrls = async () => {
      try {
        const response = await axios.get('/xml/get-urls')
        setXmlUrls(response.data)
      } catch (error) {
        console.error('Error fetching XML URLs:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch XML URLs",
        })
      }
    }

    const fetchInitialArticles = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('/article')
        const articles = response.data.map((article: any) => ({
          id: article.id,
          title: article.title,
          description: article.summary || article.description || '',
          fullDescription: article.content || article.fullDescription || '',
          image: article.image_url || '',
          author: article.author || 'Unknown',
          date: new Date(article.published).toLocaleDateString(),
          source: article.source || 'Unknown',
          link: article.link || ''
        }))
        setAllArticles(articles)
        setFilteredBlogs(articles)
      } catch (error) {
        console.error('Error fetching articles:', error)
        setError('Failed to load articles')
      } finally {
        setIsLoading(false)
      }
    }

    fetchXmlUrls()
    fetchInitialArticles()
  }, [])

  const fetchArticlesByXmlUrl = async (xmlUrl: string) => {
    try {
      setIsLoading(true)
      const response = await axios.get('/article', {
        params: { xml_url: xmlUrl }
      })
      const articles = response.data.map((article: any) => ({
        id: article.id,
        title: article.title,
        description: article.summary || article.description || '',
        fullDescription: article.content || article.fullDescription || '',
        image: article.image_url || '',
        author: article.author || 'Unknown',
        date: new Date(article.published).toLocaleDateString(),
        source: article.source || 'Unknown',
        link: article.link || ''
      }))
      setAllArticles(articles)
      setFilteredBlogs(articles)
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch articles for selected source",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update the pollXmlUrls function
  const pollXmlUrls = async () => {
    try {
      const response = await axios.get('/xml/get-urls')
      const newXmlUrls = response.data
      
      // Check if there are any changes to the XML URLs
      const hasChanges = JSON.stringify(newXmlUrls) !== JSON.stringify(xmlUrls)
      
      if (hasChanges) {
        setXmlUrls(newXmlUrls)
        // Only show toast when there are actual changes
        if (newXmlUrls.length > xmlUrls.length) {
          toast({
            title: "Source List Updated",
            description: "New sources have been added to the filter options.",
          })
        }
      }
    } catch (error) {
      console.error('Error polling XML URLs:', error)
    }
  }

  // Add a useEffect for polling
  useEffect(() => {
    // Initial fetch
    const fetchXmlUrls = async () => {
      try {
        const response = await axios.get('/xml/get-urls')
        setXmlUrls(response.data)
      } catch (error) {
        console.error('Error fetching XML URLs:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch XML URLs",
        })
      }
    }

    fetchXmlUrls()

    // Set up polling interval (every 30 seconds)
    const pollInterval = setInterval(pollXmlUrls, 30000)

    // Cleanup function
    return () => {
      clearInterval(pollInterval)
    }
  }, []) // Empty dependency array means this effect runs once on mount

  // Add a new function for handling search
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredBlogs(allArticles)
      return
    }

    const filtered = allArticles.filter(blog => {
      const searchStr = query.toLowerCase()
      return (
        blog.title.toLowerCase().includes(searchStr) ||
        blog.description.toLowerCase().includes(searchStr) ||
        blog.fullDescription.toLowerCase().includes(searchStr) ||
        blog.author.toLowerCase().includes(searchStr)
      )
    })
    setFilteredBlogs(filtered)
  }, [allArticles])

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Dashboard</h2>
          <nav className="space-y-2">
            <Link 
              href="/dashboard" 
              className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <Home className="mr-3 h-5 w-5" />
              Home
            </Link>
            <Link 
              href="/dashboard/my-blogs" 
              className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <BookOpen className="mr-3 h-5 w-5" />
              My Blogs
            </Link>
            <Link 
              href="/dashboard/create" 
              className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <PenTool className="mr-3 h-5 w-5" />
              Create Blog
            </Link>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="w-full flex items-center py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <Filter className="mr-3 h-5 w-5" />
              Filter Blogs
            </button>
            <button
              onClick={() => setIsAddUrlsDialogOpen(true)}
              className="w-full flex items-center py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <Plus className="mr-3 h-5 w-5" />
              Add RSS/XML URLs
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Navbar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">BlogHub</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input 
                  type="search" 
                  placeholder="Search blogs..." 
                  className="pl-10 w-64 dark:bg-gray-700 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearch(e.target.value)
                  }}
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={toggleDarkMode} className="bg-transparent border-gray-200 dark:border-gray-700">
                      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle dark mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-transparent border-gray-200 dark:border-gray-700">
                      <Bell className="h-[1.2rem] w-[1.2rem]" />
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10">
                        {currentUser?.name?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser?.name || 'Guest'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.email || 'guest@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Blog grid */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <Card key={blog.id} className="transition-all duration-300 hover:shadow-lg hover:scale-105 dark:bg-gray-800 overflow-hidden cursor-pointer" onClick={() => handleBlogClick(blog)}>
                    <CardHeader className="p-0">
                      <ImageWithFallback
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                      />
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg font-semibold mb-2 dark:text-white">{blog.title}</CardTitle>
                      <CardDescription className="text-sm dark:text-gray-300 mb-4">{blog.description}</CardDescription>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>{blog.author}</span>
                        <span>{blog.date}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <Button variant="outline" size="sm" onClick={(e) => handleShareClick(e, blog)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleBlogClick(blog)}>
                        Read More
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                {filteredBlogs.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                    <p>No blogs match your filter criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Blog</DialogTitle>
            <DialogDescription>Fill out the details to share this blog post.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleShareSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={shareFormData.title}
                onChange={(e) => setShareFormData({
                  ...shareFormData,
                  title: e.target.value
                })}
              />
            </div>
            <div>
              <Label htmlFor="takeaways">Key Takeaways</Label>
              <Textarea 
                id="takeaways" 
                placeholder="Enter key takeaways..."
                value={shareFormData.takeaways}
                onChange={(e) => setShareFormData({
                  ...shareFormData,
                  takeaways: e.target.value
                })}
              />
            </div>
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={shareFormData.tone}
                onValueChange={(value) => setShareFormData({
                  ...shareFormData,
                  tone: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="writing-style">Writing Style</Label>
              <Select
                value={shareFormData.writingStyle}
                onValueChange={(value) => setShareFormData({
                  ...shareFormData,
                  writingStyle: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select writing style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="narrative">Narrative</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Share</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Blog Detail Dialog */}
      <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBlog?.title}</DialogTitle>
            <DialogDescription className="mt-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{selectedBlog?.author}</span>
              <span>{selectedBlog?.date}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ImageWithFallback
              src={selectedBlog?.image ?? ''}
              alt={selectedBlog?.title ?? ''}
              className="w-full h-64 object-cover rounded-md"
            />
            <p className="text-sm dark:text-gray-300">{selectedBlog?.fullDescription}</p>
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button 
              onClick={(e) => selectedBlog && handleShareClick(e, selectedBlog)} 
              className="flex items-center"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={() => setIsBlogDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Blogs</DialogTitle>
            <DialogDescription>
              Select criteria to filter the blog posts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Author Filter */}
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Select
                value={filters.author}
                onValueChange={(value) => setFilters({ ...filters, author: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {Array.from(new Set(allArticles.map(blog => blog.author))).map(author => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Select
                value={filters.date}
                onValueChange={(value) => setFilters({ ...filters, date: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* XML URL Filter */}
            <div className="space-y-2">
              <Label htmlFor="xmlUrl">Source Domain</Label>
              <Select
                value={filters.xmlUrl}
                onValueChange={(value) => {
                  setFilters({ ...filters, xmlUrl: value })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {xmlUrls.map((xmlUrl) => (
                    <SelectItem key={xmlUrl.url} value={xmlUrl.domain}>
                      {xmlUrl.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({ 
                  author: 'all', 
                  date: 'all', 
                  xmlUrl: 'all' 
                })
              }}
            >
              Reset
            </Button>
            <Button onClick={() => {
              applyFilters()
              setIsFilterOpen(false)
            }}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add RSS/XML URLs Dialog */}
      <Dialog open={isAddUrlsDialogOpen} onOpenChange={setIsAddUrlsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add RSS/XML URLs</DialogTitle>
            <DialogDescription>
              Enter the URLs of RSS/XML feeds you want to add.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUrls} className="space-y-4">
            {urlEntries.map((entry, index) => (
              <div key={index}>
                <Label htmlFor={`url-${index}`}>URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id={`url-${index}`}
                    placeholder="URL"
                    value={entry.url}
                    onChange={(e) => handleUrlEntryChange(index, 'url', e.target.value)}
                  />
                  <Input
                    id={`domain-${index}`}
                    placeholder="Domain"
                    value={entry.domain}
                    onChange={(e) => handleUrlEntryChange(index, 'domain', e.target.value)}
                  />
                  <Button variant="outline" size="icon" onClick={() => removeUrlEntry(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addUrlEntry}>
              Add URL
            </Button>
            <DialogFooter>
              <Button type="submit">Add URLs</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}