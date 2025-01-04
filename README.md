# QuestLearn - Your AI Learning Companion

> Transforming education through interactive AI-powered storytelling

QuestLearn revolutionizes learning by combining advanced AI technology with engaging storytelling to create 
personalized educational experiences. Choose any topic and embark on an interactive journey where your 
choices shape your learning path.

## 🌟 Features

- **Multiple AI Providers**: Support for both Google Gemini and Groq AI models
- **Dynamic Story Generation**: AI-powered narrative creation based on chosen topics
- **Interactive Learning**: Choose-your-own-adventure style progression
- **Adaptive Content**: Content difficulty adjusts based on user comprehension
- **Progress Tracking**: Detailed metrics and learning journey analysis
- **Custom Responses**: Users can write their own responses beyond preset choices
- **Secure API Key Management**: Local storage for API keys with an intuitive sidebar interface

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- API keys for either Google Gemini or Groq (or both)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/quest-learn.git

# Navigate to project directory
cd quest-learn

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Configuration

1. Open the application in your browser
2. Click the sidebar toggle on the left
3. Enter your API keys for either Gemini or Groq
4. Select your preferred AI provider
5. Enter a learning topic to begin

## 🔧 Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API, Groq API
- **State Management**: React Hooks
- **API Routes**: Next.js API Routes

## 🎯 Usage

1. **Configure API**: Set up your preferred AI provider and API key
2. **Select Topic**: Enter any educational topic you want to explore
3. **Start Journey**: Begin your interactive learning adventure
4. **Make Choices**: Select from AI-generated choices or write your own responses
5. **Track Progress**: Review your learning journey and comprehension metrics
6. **Get Insights**: Receive personalized feedback and suggested topics

## 🏗️ Project Structure

```
quest-learn/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── APIKeyManager.tsx
│   │   ├── AdventureGame.tsx
│   │   └── APIKeyInput.tsx
│   ├── services/
│   │   └── ai/
│   │       └── providers.ts
│   └── types/
│       └── ai.ts
├── public/
│   └── questlearn.png
└── tailwind.config.ts
```

## 🛠️ Development

### Key Components

- `APIKeyManager`: Manages API keys and provider selection
- `AdventureGame`: Main game logic and UI
- `providers.ts`: AI service integration handlers

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔐 Security

- API keys are stored in browser's localStorage
- Keys are never sent to any third-party services
- All AI requests are processed server-side

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI
- Groq AI
- Next.js team
- Tailwind CSS team

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.
