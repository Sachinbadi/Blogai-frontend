interface User {
  id: string
  username: string
}

interface AuthResponse {
  user: User
  message: string
}

class AuthService {
  private static TOKEN_KEY = 'auth_token'
  private static USER_KEY = 'user'
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  static async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.API_URL}/user/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to login')
    }

    const data = await response.json()
    this.setAuth({ user: { id: username, username }, message: data.message })
    
    // Clear browser history and prevent back navigation
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/dashboard')
      window.history.pushState(null, '', '/dashboard')
      window.onpopstate = function() {
        window.history.pushState(null, '', '/dashboard')
      }
    }
    
    return data
  }

  static async register(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.API_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to register')
    }

    const data = await response.json()
    this.setAuth({ user: { id: username, username }, message: data.message })
    
    // Clear browser history and prevent back navigation
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/dashboard')
      window.history.pushState(null, '', '/dashboard')
      window.onpopstate = function() {
        window.history.pushState(null, '', '/dashboard')
      }
    }
    
    return data
  }

  static setAuth(data: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, 'authenticated')
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user))
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static getUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY)
    return user ? JSON.parse(user) : null
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  static logout() {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    
    if (typeof window !== 'undefined') {
      // Clear all history
      window.history.pushState(null, '', '/auth')
      
      // Prevent forward navigation after logout
      window.history.forward = function() {
        window.location.href = '/auth'
      }
      
      // Remove any existing popstate handlers
      window.onpopstate = null
      
      // Add handler to redirect to auth for any navigation attempts
      window.onpopstate = () => {
        if (!this.isAuthenticated()) {
          window.location.href = '/auth'
        }
      }
    }
  }

  static checkAuth() {
    if (this.isAuthenticated() && typeof window !== 'undefined') {
      window.history.pushState(null, '', window.location.href)
      window.onpopstate = function() {
        window.history.pushState(null, '', window.location.href)
      }
      return true
    }
    
    // If not authenticated and trying to access protected route, redirect to auth
    if (typeof window !== 'undefined' && 
        window.location.pathname !== '/auth' && 
        !this.isAuthenticated()) {
      window.location.href = '/auth'
    }
    
    return false
  }
}

export default AuthService 