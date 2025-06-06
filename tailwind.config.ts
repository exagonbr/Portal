import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				dark: '#357ABD',
  				light: '#7BB6F3',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				dark: '#718096',
  				light: '#E2E8F0',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				blue: {
  					DEFAULT: '#3B82F6',
  					dark: '#2563EB',
  					light: '#60A5FA'
  				},
  				green: {
  					DEFAULT: '#10B981',
  					dark: '#059669',
  					light: '#34D399'
  				},
  				orange: {
  					DEFAULT: '#F59E0B',
  					dark: '#D97706',
  					light: '#FBBF24'
  				},
  				purple: {
  					DEFAULT: '#8B5CF6',
  					dark: '#7C3AED',
  					light: '#A78BFA'
  				},
  				yellow: {
  					DEFAULT: '#FBBF24',
  					dark: '#F59E0B',
  					light: '#FCD34D'
  				},
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			success: {
  				DEFAULT: '#10B981',
  				dark: '#059669',
  				light: '#34D399',
  				text: '#065F46'
  			},
  			warning: {
  				DEFAULT: '#F59E0B',
  				dark: '#D97706',
  				light: '#FBBF24',
  				text: '#9A3412'
  			},
  			error: {
  				DEFAULT: '#EF4444',
  				dark: '#DC2626',
  				light: '#F87171',
  				text: '#991B1B'
  			},
  			info: {
  				DEFAULT: '#3B82F6',
  				dark: '#2563EB',
  				light: '#60A5FA',
  				text: '#1E40AF'
  			},
  			background: 'hsl(var(--background))',
  			text: {
  				primary: '#374151',
  				secondary: '#6B7280',
  				tertiary: '#9CA3AF',
  				disabled: '#D1D5DB'
  			},
  			border: 'hsl(var(--border))',
  			sidebar: {
  				bg: '#0f3460',
  				hover: '#1e4d82',
  				active: '#1e40af',
  				text: '#e2e8f0',
  				textActive: '#ffffff',
  				border: '#E2E8F0'
  			},
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.3s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'slide-down': 'slideDown 0.3s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			slideDown: {
  				'0%': {
  					transform: 'translateY(-100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
