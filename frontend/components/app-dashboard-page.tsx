'use client'

import React from 'react'
import { useState, useEffect } from 'react'
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
import { Moon, Sun, User, Settings, Search, Bell, Home, BookOpen, PenTool, Share2, LogOut } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useRouter } from 'next/navigation'

interface Blog {
  id: number
  title: string
  description: string
  fullDescription: string
  image: string
  author: string
  date: string
}

const blogs: Blog[] = [
  {
    id: 1,
    title: 'The Future of Natural Language Processing',
    description: 'Explore the latest advancements in NLP and how they\'re shaping the future of AI-driven communication.',
    fullDescription: 'Natural Language Processing (NLP) is rapidly evolving, with new models and techniques emerging that promise to revolutionize how machines understand and generate human language. This blog post delves into cutting-edge developments such as GPT-3 and its successors, exploring their potential applications in areas like automated content creation, advanced chatbots, and real-time language translation. We\'ll also discuss the ethical implications of these powerful language models and what the future might hold for NLP technology.',
    image: 'https://trellis.net/wp-content/uploads/2024/10/EverestLabsAIrobotLRSChicagoOct2024-rotated.jpg',
    author: 'Dr. Emily Chen',
    date: '2023-05-15'
  },
  {
    id: 2,
    title: 'Machine Learning in Healthcare: A Game Changer',
    description: 'Discover how AI and machine learning are transforming the healthcare industry, from diagnosis to treatment.',
    fullDescription: 'Artificial Intelligence and Machine Learning are making significant inroads in healthcare, offering the potential to revolutionize patient care, drug discovery, and hospital operations. This comprehensive blog post examines real-world applications of AI in healthcare, including early disease detection using computer vision, personalized treatment plans powered by predictive analytics, and AI-assisted surgery. We\'ll also address challenges such as data privacy concerns and the need for interpretable AI in critical healthcare decisions, providing a balanced view of this exciting and rapidly evolving field.',
    image: 'https://www.coindesk.com/resizer/i0oYiLoZ3wLdkmFpJ8DXHH_FVuA=/1200x0/cloudfront-us-east-1.images.arcpublishing.com/coindesk/KGWCLTT6ANHQXHLAXCSEOCPCII.jpg',
    author: 'Dr. Michael Johnson',
    date: '2023-05-20'
  },
  {
    id: 3,
    title: 'Ethical AI: Ensuring Responsible Development',
    description: 'An in-depth look at the ethical considerations in AI development and implementation.',
    fullDescription: 'As AI systems become more prevalent and powerful, ensuring their ethical development and deployment is crucial. This blog post explores the key ethical challenges facing the AI industry, including bias in machine learning models, privacy concerns with data collection and use, and the potential societal impacts of AI-driven automation. We\'ll discuss frameworks for responsible AI development, such as the IEEE\'s Ethically Aligned Design, and examine case studies of both successful and problematic AI implementations. The post will also cover emerging regulations and standards aimed at governing AI development, and offer practical guidelines for developers and organizations to create AI systems that are not only powerful but also fair, transparent, and beneficial to society.',
    image: 'https://www.coindesk.com/resizer/fSN4SY3qOIopjz9ne7id7Ee59VU=/1200x0/cloudfront-us-east-1.images.arcpublishing.com/coindesk/CVWGUEAC3VFJ5KOX5YRGLQVMUE.jpg',
    author: 'Prof. Sarah Lee',
    date: '2023-05-25'
  },
  {
    id: 4,
    title: 'AI in Cybersecurity: The Next Frontier',
    description: 'Explore the role of AI in enhancing cybersecurity and protecting against emerging threats.',
    fullDescription: 'As cyber threats continue to evolve, Artificial Intelligence is becoming a crucial tool in the fight against cybercrime. This blog post delves into the applications of AI in cybersecurity, including threat detection, incident response, and predictive analytics. We\'ll discuss how AI-powered systems can help identify vulnerabilities, detect anomalies, and respond to attacks in real-time, as well as the challenges and limitations of relying on AI for cybersecurity.',
    image: 'https://www.coindesk.com/resizer/Viw_a7aQH_7Ke3FuUcCr3ZsjzAY=/800x600/cloudfront-us-east-1.images.arcpublishing.com/coindesk/KGWCLTT6ANHQXHLAXCSEOCPCII.jpg',
    author: 'Dr. James Smith',
    date: '2023-06-01'
  },
  {
    id: 5,
    title: 'Computer Vision: Unlocking AI\'s Visual Potential',
    description: 'Discover the latest advancements in computer vision and its applications across industries.',
    fullDescription: 'Computer Vision is a rapidly advancing field within Artificial Intelligence, enabling machines to interpret and understand visual data from images and videos. This blog post explores the current state of computer vision, including its applications in areas like object detection, facial recognition, and image classification. We\'ll also discuss the potential applications of computer vision in industries such as healthcare, retail, and transportation, as well as the challenges and limitations of this technology.',
    image: 'https://ai-image-link-5.com',
    author: 'Dr. Rachel Patel',
    date: '2023-06-05'
  },
  {
    id: 6,
    title: 'AI in Finance: Revolutionizing the Industry',
    description: 'Explore the impact of AI on the finance industry, from trading to risk management.',
    fullDescription: 'Artificial Intelligence is transforming the finance industry, offering the potential to revolutionize trading, risk management, and customer service. This blog post examines real-world applications of AI in finance, including algorithmic trading, fraud detection, and personalized financial advice. We\'ll also discuss the challenges and limitations of AI in finance, such as data privacy concerns and the need for human oversight in critical financial decisions.',
    image: 'https://ai-image-link-6.com',
    author: 'Dr. John Doe',
    date: '2023-06-10'
  },
  {
    id: 7,
    title: 'AI in Education: Enhancing Learning Experiences',
    description: 'Discover how AI is being used to personalize education and improve student outcomes.',
    fullDescription: 'Artificial Intelligence is being used to personalize education, offering the potential to revolutionize teaching, learning, and assessment. This blog post examines real-world applications of AI in education, including personalized learning paths, automated grading, and intelligent tutoring systems. We\'ll also discuss the challenges and limitations of AI in education, such as data privacy concerns and the need for human oversight in critical educational decisions.',
    image: 'https://ai-image-link-7.com',
    author: 'Dr. Jane Smith',
    date: '2023-06-15'
  },
  {
    id: 8,
    title: 'AI in Retail: Transforming the Shopping Experience',
    description: 'Explore the impact of AI on the retail industry, from personalized recommendations to supply chain optimization.',
    fullDescription: 'Artificial Intelligence is transforming the retail industry, offering the potential to revolutionize customer service, inventory management, and marketing. This blog post examines real-world applications of AI in retail, including personalized product recommendations, demand forecasting, and dynamic pricing. We\'ll also discuss the challenges and limitations of AI in retail, such as data privacy concerns and the need for human oversight in critical retail decisions.',
    image: 'https://ai-image-link-8.com',
    author: 'Dr. Alex Johnson',
    date: '2023-06-20'
  },
  {
    id: 9,
    title: 'AI in Transportation: Shaping the Future of Mobility',
    description: 'Discover how AI is being used to improve transportation, from autonomous vehicles to traffic management.',
    fullDescription: 'Artificial Intelligence is being used to improve transportation, offering the potential to revolutionize safety, efficiency, and accessibility. This blog post examines real-world applications of AI in transportation, including autonomous vehicles, predictive maintenance, and dynamic routing. We\'ll also discuss the challenges and limitations of AI in transportation, such as data privacy concerns and the need for human oversight in critical transportation decisions.',
    image: 'https://ai-image-link-9.com',
    author: 'Dr. Sarah Johnson',
    date: '2023-06-25'
  },
  {
    id: 10,
    title: 'AI in Agriculture: Feeding the Future',
    description: 'Explore the impact of AI on agriculture, from precision farming to crop disease detection.',
    fullDescription: 'Artificial Intelligence is being used to improve agriculture, offering the potential to revolutionize productivity, sustainability, and food security. This blog post examines real-world applications of AI in agriculture, including precision farming, crop disease detection, and yield prediction. We\'ll also discuss the challenges and limitations of AI in agriculture, such as data privacy concerns and the need for human oversight in critical agricultural decisions.',
    image: 'https://ai-image-link-10.com',
    author: 'Dr. Michael Smith',
    date: '2023-06-30'
  },
  {
    id: 11,
    title: 'AI in Entertainment: Redefining Creativity',
    description: 'Discover how AI is being used to create new forms of entertainment, from music to visual arts.',
    fullDescription: 'Artificial Intelligence is being used to create new forms of entertainment, offering the potential to revolutionize the creative process and audience engagement. This blog post examines real-world applications of AI in entertainment, including AI-generated music, deepfake technology, and interactive storytelling. We\'ll also discuss the challenges and limitations of AI in entertainment, such as ethical concerns and the need for human oversight in critical creative decisions.',
    image: 'https://ai-image-link-11.com',
    author: 'Dr. Michael Johnson',
    date: '2023-07-05'
  },
  {
    id: 12,
    title: 'AI in Energy: Powering the Future',
    description: 'Explore the impact of AI on the energy industry, from renewable energy to grid management.',
    fullDescription: 'Artificial Intelligence is being used to improve the energy industry, offering the potential to revolutionize sustainability, efficiency, and reliability. This blog post examines real-world applications of AI in energy, including renewable energy forecasting, smart grid management, and energy demand prediction. We\'ll also discuss the challenges and limitations of AI in energy, such as data privacy concerns and the need for human oversight in critical energy decisions.',
    image: 'https://ai-image-link-12.com',
    author: 'Dr. Michael Johnson',
    date: '2023-07-10'
  },
  {
    id: 13,
    title: 'AI in Marketing: Personalizing the Customer Journey',
    description: 'Discover how AI is being used to revolutionize marketing, from personalized ads to predictive analytics.',
    fullDescription: 'Artificial Intelligence is being used to revolutionize marketing, offering the potential to revolutionize customer engagement, lead generation, and sales. This blog post examines real-world applications of AI in marketing, including personalized ads, predictive analytics, and chatbots. We\'ll also discuss the challenges and limitations of AI in marketing, such as data privacy concerns and the need for human oversight in critical marketing decisions.',
    image: 'https://ai-image-link-13.com',
    author: 'Dr. Michael Johnson',
    date: '2023-07-15'
  },
  {
    id: 14,
    title: 'AI in Gaming: Redefining Interactive Entertainment',
    description: 'Explore the impact of AI on the gaming industry, from procedural generation to player behavior prediction.',
    fullDescription: 'Artificial Intelligence is being used to revolutionize the gaming industry, offering the potential to revolutionize game design, player experience, and game development. This blog post examines real-world applications of AI in gaming, including procedural generation, player behavior prediction, and game testing. We\'ll also discuss the challenges and limitations of AI in gaming, such as ethical concerns and the need for human oversight in critical gaming decisions.',
    image: 'https://ai-image-link-14.com',
    author: 'Dr. Michael Johnson',
    date: '2023-07-20'
  },
  {
    id: 15,
    title: 'AI in Real Estate: Transforming Property Management',
    description: 'Discover how AI is being used to revolutionize real estate, from property valuation to tenant management.',
    fullDescription: 'Artificial Intelligence is being used to revolutionize the real estate industry, offering the potential to revolutionize property management, property valuation, and tenant experience. This blog post examines real-world applications of AI in real estate, including property price prediction, tenant screening, and property maintenance. We\'ll also discuss the challenges and limitations of AI in real estate, such as data privacy concerns and the need for human oversight in critical real estate decisions.',
    image: 'https://ai-image-link-15.com',
    author: 'Dr. Michael Johnson',
    date: '2023-07-25'
  }
]

export function DashboardPage() {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleShareClick = (e: React.MouseEvent, blog: Blog) => {
    e.stopPropagation()
    setSelectedBlog(blog)
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
    router.push('/auth')
  }

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
            <Link href="/dashboard/my-blogs" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200">
              <BookOpen className="mr-3 h-5 w-5" />
              My Blogs
            </Link>
            <Link href="/dashboard/create" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200">
              <PenTool className="mr-3 h-5 w-5" />
              Create Blog
            </Link>
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
                <Input type="search" placeholder="Search blogs..." className="pl-10 w-64 dark:bg-gray-700 dark:text-white" />
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
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">John Doe</p>
                      <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferences</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Card key={blog.id} className="transition-all duration-300 hover:shadow-lg hover:scale-105 dark:bg-gray-800 overflow-hidden cursor-pointer" onClick={() => handleBlogClick(blog)}>
                  <CardHeader className="p-0">
                    <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
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
            </div>
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
          <form className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" defaultValue={selectedBlog?.title} />
            </div>
            <div>
              <Label htmlFor="takeaways">Key Takeaways</Label>
              <Textarea id="takeaways" placeholder="Enter key takeaways..." />
            </div>
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select>
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
              <Select>
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
          </form>
          <DialogFooter>
            <Button type="submit">Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blog Detail Dialog */}
      <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBlog?.title}</DialogTitle>
            <DialogDescription>
              
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                <span>{selectedBlog?.author}</span>
                <span>{selectedBlog?.date}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <img src={selectedBlog?.image} alt={selectedBlog?.title} className="w-full h-64 object-cover rounded-md" />
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
    </div>
  )
}