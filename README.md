# Portal Educacional

A modern educational portal built with Next.js, featuring a Progressive Web App (PWA) implementation for enhanced accessibility and offline capabilities.

## 🌟 Features

- **Authentication System**
  - Student and Teacher login
  - Secure registration process
  - Role-based access control

- **Dashboard Interface**
  - Separate views for students and teachers
  - Interactive charts and statistics
  - Activity monitoring
  - Course progress tracking

- **Course Management**
  - Course creation and enrollment
  - Lesson plan management
  - Course materials distribution
  - Interactive quizzes

- **Live Learning**
  - Real-time class sessions
  - Interactive chat functionality
  - Student-teacher communication
  - Live class scheduling

- **Assignment System**
  - Assignment creation and submission
  - Progress tracking
  - Grade management

- **Progressive Web App (PWA)**
  - Offline functionality
  - Install as native app
  - Push notifications
  - Responsive design

## 🚀 Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **PWA**: next-pwa with Workbox
- **Icons**: React Icons
- **Testing**: Lighthouse, Puppeteer
- **Development**: ESLint, PostCSS

## 📦 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd portal-educacional
```

2. Install dependencies:
```bash
npm install
```

3. Create necessary environment variables:
```bash
# Create a .env.local file with required configurations
touch .env.local
```

## 🛠️ Usage

### Development

Run the development server:
```bash
npm run dev
```

### Production

Build and start the production server:
```bash
npm run build
npm start
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run verify:pwa` - Verify PWA configuration
- `npm run test:pwa` - Test PWA features

## 📱 PWA Features

The portal is equipped with Progressive Web App capabilities:

- Offline functionality
- Installable on devices
- Push notifications
- App-like experience
- Service worker for caching
- Automatic updates

## 📁 Project Structure

```
portal-educacional/
├── public/            # Static files and PWA assets
├── src/
│   ├── app/          # Next.js 14 app directory
│   ├── components/   # React components
│   ├── constants/    # Constants and mock data
│   ├── contexts/     # React contexts
│   ├── hooks/        # Custom React hooks
│   ├── providers/    # App providers
│   ├── services/     # API services
│   ├── styles/       # Global styles
│   ├── types/        # TypeScript types
│   └── utils/        # Utility functions
├── scripts/          # PWA testing scripts
└── ...config files
```

## ⚙️ Requirements

- Node.js 18.x or higher
- npm 9.x or higher
- Modern web browser with PWA support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

---

Built with ❤️ for education
