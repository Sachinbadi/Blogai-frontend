module.exports = {
  // ...other config
  theme: {
    extend: {
      // ... other extensions
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      },
      animation: {
        progress: 'progress 3s ease-in-out infinite'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ...other plugins
  ],
} 