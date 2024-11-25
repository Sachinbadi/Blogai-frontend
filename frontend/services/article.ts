import axios from '@/lib/axios'

interface Article {
  id: string
  title: string
  content: string
  summary_result?: string
  keyword_result?: string[] | string
  description?: string
  image_url?: string
  author: string
  published: string
  source?: string
  link?: string
}

export async function getArticleById(id: string): Promise<Article> {
  try {
    const response = await axios.get(`/article/${id}`)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Article not found')
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid article ID')
    }
    throw new Error('Failed to fetch article')
  }
} 