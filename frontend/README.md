# AgentIQ - Autonomous Agent Orchestration Platform

![AgentIQ](https://img.shields.io/badge/Vite-React-blue?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)

Enterprise-grade autonomous agent orchestration platform powered by Groq Llama 3.1 8B for intelligent task execution and multi-agent collaboration.

## 🚀 Features

- **🤖 Autonomous Agents**: AI-powered agents with specialized roles and capabilities
- **⚡ Smart Execution**: 3-step autonomous planning and execution system
- **🌐 Multi-Agent Collaboration**: Real-time agent network visualization
- **🧠 Thought Process Tracking**: Step-by-step execution monitoring
- **🎯 Task Orchestration**: Intelligent task decomposition and assignment
- **📊 Performance Metrics**: Real-time agent performance and success tracking

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Glassmorphism Design
- **AI**: Groq Llama 3.1 8B API
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Build**: Vite + PostCSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dimasergei/agentiq.git
   cd agentiq/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys to `.env.local`:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Architecture

```
src/
├── api/
│   └── agents.ts            # Agent execution API
├── mock-agents.ts           # Mock agent orchestration
├── components/
│   ├── Button.tsx          # Reusable UI components
│   ├── Card.tsx            # Glass card components
│   └── Badge.tsx           # Status badges
├── App.tsx                 # Main orchestration platform
├── main.tsx               # Vite entry point
└── globals.css            # Global styles
```

### Agent Execution System

The application uses Groq Llama 3.1 for intelligent agent orchestration:

```typescript
const plan = await mockExecuteAgentTask(task, agentRole);
// Returns structured execution plan with:
// - Step-by-step tasks
// - Confidence scores
// - Time estimates
// - Success probability
```

## 📊 Live Demo

**🔗 [https://agentiq-three.vercel.app](https://agentiq-three.vercel.app)**

Experience autonomous agent orchestration with:
- Multi-agent collaboration
- Real-time task execution
- Thought process visualization
- Performance analytics

## 🎯 Key Features

### Agent Capabilities
- **Analyst Agents**: Data analysis and pattern recognition
- **Developer Agents**: Code generation and technical implementation
- **Strategist Agents**: Planning and optimization
- **Monitor Agents**: Quality assurance and tracking

### Execution Planning
- **Task Decomposition**: Complex task breakdown
- **Strategy Formulation**: Intelligent approach planning
- **Resource Allocation**: Optimal resource distribution
- **Execution Monitoring**: Real-time progress tracking

### Collaboration Features
- **Agent Networks**: Visual agent connections
- **Thought Sharing**: Transparent decision processes
- **Performance Metrics**: Success rate and efficiency
- **Real-time Updates**: Live collaboration status

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Project Structure

- **`src/api/`**: Agent execution API and type definitions
- **`src/components/`**: Reusable React components
- **`src/App.tsx`**: Main orchestration platform
- **`public/`**: Static assets
- **`dist/`**: Production build output

## 🌟 Highlights

- **🤖 Intelligent Agents**: AI-powered autonomous execution
- **⚡ Real-Time Collaboration**: Live agent network visualization
- **🎨 Beautiful UI**: Glassmorphism design with smooth animations
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile
- **🔒 Secure**: Client-side processing with no data storage
- **🚀 Production Ready**: Optimized build with Vite

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email dimitris@example.com or create an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, and Groq Llama 3.1**
