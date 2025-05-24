import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Educational Colors
        primary: '#3B82F6',    // Blue 500 - Main brand color
        secondary: '#2563EB',  // Blue 600 - Secondary actions
        accent: '#60A5FA',     // Blue 400 - Highlights
        success: '#4CAF50',    // Green - Positive feedback
        warning: '#FBBF24',    // Amber - Attention/caution
        info: '#2196F3',       // Light Blue - Information
        error: '#FF5252',      // Red - Error states
        
        // Text and Background
        background: '#FFFFFF',
        'background-alt': '#DBEAFE',
        text: '#212121',
        'text-secondary': '#757575'
      }
    },
  },
  plugins: []
}

export default config
