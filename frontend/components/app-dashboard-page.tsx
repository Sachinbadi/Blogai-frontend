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
import { Moon, Sun, User, Settings, Search, Bell, Home, BookOpen, PenTool, Share2, LogOut, Filter, ImageOff, Plus, X, ExternalLink, Globe, Mail, FileText, Check, Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useRouter } from 'next/navigation'
import AuthService from '@/services/auth'
import axios from '@/lib/axios'
import { useToast } from '@/components/ui/use-toast'
 import { getArticleById } from '@/services/article'
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  LinkedinIcon
} from 'next-share'


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
  keyword_result?: string[] | string
  scrape_result?: string
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
  keyword: string
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

interface DetailedBlog extends Blog {
  content: string
  summary_result?: string
  published?: string
  keyword_result?: string[] | string
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

const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword || keyword === 'all') return text
  
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
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
    xmlUrl: 'all',
    keyword: 'all'
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
  const [detailedBlog, setDetailedBlog] = useState<DetailedBlog | null>(null)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [activeShareCard, setActiveShareCard] = useState<string | null>(null)
  const [isKeywordOpen, setIsKeywordOpen] = useState(false)
  const [keywordSearch, setKeywordSearch] = useState('')
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([])
  const [isRagDialogOpen, setIsRagDialogOpen] = useState(false)
  const [ragResponse, setRagResponse] = useState<{ title: string; description: string } | null>(null)
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [showGeneratingLoader, setShowGeneratingLoader] = useState(false)

  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])

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
    if (blog.link) {
      window.open(blog.link, '_blank', 'noopener,noreferrer')
    } else {
      toast({
        title: 'Error',
        description: 'Article link not available',
        variant: 'destructive'
      })
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = () => {
    AuthService.logout()
    router.push('/auth')
  }

  const getAllKeywords = useCallback(() => {
    const keywordSet = new Set<string>()
    
    allArticles.forEach(article => {
      // Extract words from title and description
      const text = `${article.title} ${article.description}`.toLowerCase()
      
      // Remove special characters and split into words
      const words = text
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && // Filter out short words
          !['the', 'and', 'for', 'that', 'with', 'this', 'from'].includes(word) // Filter out common words
        )
      
      // Add each word to the set
      words.forEach(word => {
        if (word) keywordSet.add(word)
      })

      // Also add multi-word phrases that might be important
      const phrases = text.match(/([A-Z][a-z]+\s){1,3}[A-Z][a-z]+/g) || []
      phrases.forEach(phrase => {
        if (phrase) keywordSet.add(phrase.toLowerCase())
      })
    })
    
    const sortedKeywords = Array.from(keywordSet).sort()
    console.log('Extracted keywords:', sortedKeywords)
    return sortedKeywords
  }, [allArticles])

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
        const selectedXmlUrl = xmlUrls.find((x: XmlUrlData) => x.domain === filters.xmlUrl)
        
        if (selectedXmlUrl) {
          filtered = filtered.filter(article => {
            return article.source === selectedXmlUrl.url
          })
        }
      }

      if (filters.keyword !== 'all') {
        filtered = filtered.filter(article => {
          const text = `${article.title} ${article.description}`.toLowerCase()
          return text.includes(filters.keyword.toLowerCase())
        })
      }

      setFilteredBlogs(filtered)
    } catch (error) {
      setError('Failed to apply filters')
    } finally {
      setIsLoading(false)
      setIsFilterOpen(false)
    }
  }, [filters, searchQuery, allArticles, xmlUrls])

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
          id: article.ID,
          title: article.title,
          description: article.description || '',
          image: article.image_url || '',
          date: new Date(article.published).toLocaleDateString(),
          source: article.source || '',
          link: article.link || '',
          scrape_result: article.scrape_result
        }))
        
        console.log('Processed articles:', articles)
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
        
        // Update xmlUrls state with the new URLs
        const newXmlUrls = Object.entries(urlsObject).map(([url, domain]) => ({
          url,
          domain: domain as string
        }))
        setXmlUrls(prev => [...prev, ...newXmlUrls])
        
        // Refresh articles list
        const articlesResponse = await axios.get('/article')
        const articles = articlesResponse.data.map((article: any) => ({
          id: article.id || article._id,
          title: article.title,
          description: article.description,
          image: article.image_url || '',
          date: new Date(article.published).toLocaleDateString(),
          source: article.source || '',
          link: article.link || '',
          scrape_result: article.scrape_result
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

    fetchXmlUrls()
  }, [])

  const fetchArticlesByXmlUrl = async (xmlUrl: string) => {
    try {
      setIsLoading(true)
      const response = await axios.get('/article', {
        params: { xml_url: xmlUrl }
      })
      const articles = response.data.map((article: any) => ({
        id: article.ID,
        title: article.title,
        description: article.summary || article.description || '',
        fullDescription: article.content || article.fullDescription || '',
        image: article.image_url || '',
        author: article.author || '',
        date: new Date(article.published).toLocaleDateString(),
        source: article.source || '',
        link: article.link || '',
        scrape_result: article.scrape_result
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

  const handleShareOption = (option: string) => {
    switch(option) {
      case 'social':
        // Handle social media sharing
        break
      case 'blog':
        // Handle blog sharing
        break
      case 'newsletter':
        // Handle newsletter sharing
        break
      case 'rag':
        // Handle RAG sharing
        break
    }
    setShowShareOptions(false)
  }

  const updateKeywordSuggestions = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      setKeywordSuggestions([])
      return
    }

    const allKeywords = getAllKeywords()
    console.log('Search term:', searchTerm)
    console.log('Available keywords:', allKeywords)
    
    const matchingKeywords = allKeywords.filter(keyword =>
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    console.log('Matching keywords:', matchingKeywords)
    setKeywordSuggestions(matchingKeywords)
  }, [getAllKeywords])

  const handleRagStorage = async (blog: Blog) => {
    try {
      const articleData = {
        id: blog.id,
        title: blog.title,
        description: blog.description,
        content: blog.description,
        source: blog.link,
        published_date: blog.date,
        scrape_result: blog.scrape_result
      }

      console.log('Sending article data to RAG:', articleData)
      
      const response = await axios.post('/rag/store-article', articleData)
      console.log('RAG storage response:', response.data)
      
      setRagResponse({
        title: 'Success',
        description: 'Article successfully added to RAG system'
      })
      
    } catch (error: any) {
      console.error('Error storing article in RAG:', error)
      setRagResponse({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to store article in RAG system'
      })
    } finally {
      setIsRagDialogOpen(true)
    }
  }

  const handleAddToBlog = (e: React.MouseEvent, blogId: string) => {
    e.stopPropagation()
    
    // Toggle selection instead of using setTimeout
    setSelectedArticleIds(prev => {
      if (prev.includes(blogId)) {
        return prev.filter(id => id !== blogId)
      }
      return [...prev, blogId]
    })
    
    // Store the ID (you can modify this to store wherever needed)
    console.log('Stored article ID:', blogId)
  }

  const handleGenerateBlog = async () => {
    if (selectedArticleIds.length === 0) {
      toast({
        title: "No Articles Selected",
        description: "Please select at least one article to generate a blog.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setShowGeneratingLoader(true)

    try {
      const response = await axios.post('/blog/generate-blog', {
        article_ids: selectedArticleIds
      })
      
      if (response.data.status === 'success') {
        const generatedBlog = {
          id: Date.now().toString(),
          title: extractTitle(response.data.blog_post),
          content: response.data.blog_post,
          image: response.data.image_path,
          createdAt: new Date().toISOString(),
          keywords: extractKeywords(response.data.blog_post)
        }

        const existingBlogs = JSON.parse(localStorage.getItem('generatedBlogs') || '[]')
        localStorage.setItem('generatedBlogs', JSON.stringify([...existingBlogs, generatedBlog]))

        toast({
          title: "Success",
          description: "Blog generated successfully!",
        })
        
        setSelectedArticleIds([])
        router.push('/dashboard/my-blogs')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate blog",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setShowGeneratingLoader(false)
    }
  }

  // Helper function to extract title from the blog post
  const extractTitle = (blogPost: string): string => {
    const titleMatch = blogPost.match(/\*\*Title:\*\* (.*?)\n/)
    return titleMatch ? titleMatch[1] : 'Untitled Blog'
  }

  // Helper function to extract keywords from the blog post
  const extractKeywords = (blogPost: string): string[] => {
    const keywordsMatch = blogPost.match(/\*\*Keywords:\*\* (.*?)\n/)
    if (keywordsMatch) {
      return keywordsMatch[1].split(', ')
    }
    return []
  }

  return (
    <div className="flex h-screen">
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

        {/* Filter Bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>

                {/* Active Filters Display */}
                <div className="flex items-center space-x-2">
                  {filters.author !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Author: {filters.author}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, author: 'all' }))}
                      />
                    </Badge>
                  )}
                  {filters.date !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Date: {filters.date.replace('-', ' ')}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, date: 'all' }))}
                      />
                    </Badge>
                  )}
                  {filters.xmlUrl !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Source: {filters.xmlUrl}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, xmlUrl: 'all' }))}
                      />
                    </Badge>
                  )}
                  {filters.keyword !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Keyword: {filters.keyword}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, keyword: 'all' }))}
                      />
                    </Badge>
                  )}
                </div>
              </div>

              {/* Reset Filters */}
              {(filters.author !== 'all' || filters.date !== 'all' || filters.xmlUrl !== 'all' || filters.keyword !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setFilters({ 
                      author: 'all', 
                      date: 'all', 
                      xmlUrl: 'all',
                      keyword: 'all'
                    })
                    applyFilters()
                  }}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
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
                  <Card 
                    key={blog.id} 
                    className={`flex flex-col h-full transition-all duration-300 hover:shadow-lg relative 
                      ${selectedArticleIds.includes(blog.id) 
                        ? 'transform scale-95 opacity-80' 
                        : 'hover:scale-105'
                      } dark:bg-gray-800`}
                  >
                    {selectedArticleIds.includes(blog.id) && (
                      <div className="absolute -top-2 -right-2 z-10 bg-purple-500 text-white rounded-full p-2 shadow-lg">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    {/* Image Section - Fixed height with proper containment */}
                    <div className="w-full h-48 relative overflow-hidden rounded-t-lg">
                      <ImageWithFallback
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>

                    {/* Content Section - Flexible height with padding */}
                    <div className="flex flex-col h-full">
                      <CardContent className="flex-grow p-4">
                        <CardTitle 
                          className="text-lg font-semibold mb-2 dark:text-white line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: filters.keyword !== 'all' 
                              ? highlightKeyword(blog.title, filters.keyword)
                              : blog.title
                          }}
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                          {blog.description}
                        </p>
                      </CardContent>

                      {/* Buttons Section - Fixed height with padding */}
                      <CardFooter className="p-4 flex flex-col space-y-2">
                        {/* First row of buttons */}
                        <div className="w-full grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleBlogClick(blog)}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Read More
                          </Button>
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareClick(e, blog);
                            }}
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </Button>
                        </div>

                        {/* Second row - Add to RAG button */}
                        <Button 
                          variant="secondary"
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRagStorage(blog);
                          }}
                        >
                          Add to RAG
                        </Button>

                        {/* Third row - Add to Blog button */}
                        <Button 
                          variant="secondary"
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                          onClick={(e) => handleAddToBlog(e, blog.id)}
                        >
                          {selectedArticleIds.includes(blog.id) ? 'Added to Blog' : 'Add to Blog'}
                        </Button>
                      </CardFooter>
                    </div>
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
            <DialogDescription>Choose how you'd like to share this blog post.</DialogDescription>
          </DialogHeader>
          
          {/* Add social media buttons at the top */}
          <div className="flex justify-center gap-4 py-4 border-b">
            <FacebookShareButton
              url={selectedBlog?.link || shareUrl}
              quote={selectedBlog?.title}
            >
              <FacebookIcon size={40} round />
            </FacebookShareButton>
            
            <LinkedinShareButton
              url={selectedBlog?.link || shareUrl}
              title={selectedBlog?.title}
            >
              <LinkedinIcon size={40} round />
            </LinkedinShareButton>
          </div>

        </DialogContent>
      </Dialog>

      {/* Blog Detail Dialog */}
      <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBlog?.title}</DialogTitle>
            <DialogDescription className="mt-2 flex justify-end text-sm text-gray-500 dark:text-gray-400">
              {detailedBlog?.published && (
                <span>Published: {new Date(detailedBlog.published).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ImageWithFallback
              src={selectedBlog?.image ?? ''}
              alt={selectedBlog?.title ?? ''}
              className="w-full h-64 object-cover rounded-md"
            />
            {detailedBlog ? (
              <div className="space-y-4">
                {/* Summary Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Summary</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {detailedBlog.summary_result || 'No summary available'}
                  </p>
                </div>
                
                {/* Keywords Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {detailedBlog?.keyword_result ? (
                      Array.isArray(detailedBlog.keyword_result) && detailedBlog.keyword_result.length > 0 ? (
                        detailedBlog.keyword_result.map((keyword, index) => (
                          <span 
                            key={`${keyword}-${index}`}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <span key="no-keywords" className="text-sm text-gray-500 dark:text-gray-400">
                          No keywords available
                        </span>
                      )
                    ) : (
                      <span key="no-keywords-null" className="text-sm text-gray-500 dark:text-gray-400">
                        No keywords available
                      </span>
                    )}
                  </div>
                </div>

                {/* Share Options Section */}
                <div className="space-y-2">
                  <Button
                    key="share-options-button"
                    variant="outline"
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="w-full flex items-center justify-center"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Options
                  </Button>
                  
                  {showShareOptions && (
                    <div className="space-y-2">
                      <Button
                        key="social-share"
                        variant="secondary"
                        onClick={() => handleShareOption('social')}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Post on Social Media
                      </Button>
                      <Button
                        key="blog-share"
                        variant="secondary"
                        onClick={() => handleShareOption('blog')}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Add to a Blog
                      </Button>
                      <Button
                        key="newsletter-share"
                        variant="secondary"
                        onClick={() => handleShareOption('newsletter')}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Add to a Newsletter
                      </Button>
                      <Button
                        key="rag-share"
                        variant="secondary"
                        onClick={() => handleShareOption('rag')}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Add to a RAG
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            )}
          </div>
          <DialogFooter>
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
                defaultValue={filters.author}
                onValueChange={(value) => setFilters(prev => ({ ...prev, author: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {Array.from(new Set(allArticles.map(blog => blog.author)))
                    .filter(Boolean)
                    .map(author => (
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
                defaultValue={filters.date}
                onValueChange={(value) => setFilters(prev => ({ ...prev, date: value }))}
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
                defaultValue={filters.xmlUrl}
                onValueChange={(value) => setFilters(prev => ({ ...prev, xmlUrl: value }))}
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

            {/* Keyword Filter */}
            <div className="space-y-2">
              <Label htmlFor="keyword">Keyword</Label>
              <div className="relative">
                <Input
                  placeholder="Type to search keywords..."
                  value={keywordSearch}
                  onChange={(e) => {
                    const value = e.target.value
                    console.log('Keyword search input:', value)
                    setKeywordSearch(value)
                    updateKeywordSuggestions(value)
                  }}
                  className="mb-2"
                  onFocus={() => {
                    // Show all keywords when input is focused
                    if (!keywordSearch) {
                      const allKeywords = getAllKeywords()
                      setKeywordSuggestions(allKeywords)
                    }
                  }}
                />
                {keywordSearch && keywordSuggestions.length > 0 && (
                  <div className="absolute z-[100] w-full bg-white dark:bg-gray-800 mt-1 rounded-md border shadow-lg">
                    <div className="max-h-[200px] overflow-y-auto py-1">
                      {keywordSuggestions.map((keyword) => (
                        <div
                          key={keyword}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            console.log('Selected keyword:', keyword)
                            setFilters(prev => ({ ...prev, keyword }))
                            setKeywordSearch('')
                            setKeywordSuggestions([])
                            applyFilters()
                          }}
                        >
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Show "No keywords found" message when there are no matches */}
                {keywordSearch && keywordSuggestions.length === 0 && (
                  <div className="absolute z-50 w-full bg-white dark:bg-gray-800 mt-1 rounded-md border shadow-lg p-3">
                    No keywords found
                  </div>
                )}
                <div className="mt-2">
                  <div className="text-sm font-medium mb-2">Selected Keywords:</div>
                  <div className="flex flex-wrap gap-2">
                    {filters.keyword !== 'all' && (
                      <Badge 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {filters.keyword}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => {
                            setFilters(prev => ({ ...prev, keyword: 'all' }))
                            setKeywordSearch('')
                          }}
                        />
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({ 
                  author: 'all', 
                  date: 'all', 
                  xmlUrl: 'all',
                  keyword: 'all'
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

      {/* Add RAG Response Dialog */}
      <Dialog open={isRagDialogOpen} onOpenChange={setIsRagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ragResponse?.title}</DialogTitle>
            <DialogDescription>
              {ragResponse?.description}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Floating button for generating blog */}
      {selectedArticleIds.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button 
            size="lg"
            className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg"
            onClick={handleGenerateBlog}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full" />
                Generating...
              </>
            ) : (
              <>
                Generate Blog ({selectedArticleIds.length})
              </>
            )}
          </Button>
        </div>
      )}

      {showGeneratingLoader && <GeneratingBlogLoader />}
    </div>
  )
}