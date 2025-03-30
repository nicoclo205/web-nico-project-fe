# FriendlyBet - Frontend Application

A modern React application for a sports betting and prediction platform that allows users to create rooms, join competitions, and make predictions on sports matches.

## 🔍 Project Overview

FriendlyBet is a full-stack application consisting of:
- This React frontend
- A separate [Django backend API](https://github.com/nicoclo205/bet_project) for data management

The frontend provides an intuitive user interface for interacting with the betting platform, handling user interactions, data display, and communication with the backend API.

## 🛠️ Technology Stack

- **React**: UI library
- **TypeScript**: For type-safe code
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios** (or fetch API): For API requests

## 📋 Features

- User registration and login
- Dashboard for betting activity
- Creating and joining betting rooms
- Viewing sports matches and making predictions
- Real-time score updates
- Rankings and leaderboards
- In-app messaging system
- Responsive design for mobile and desktop

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running (see [backend repository](https://github.com/nicoclo205/bet_project))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nicoclo205/web-nico-project-fe.git
   cd web-nico-project-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:5173/

## 📁 Project Structure

```
src/
├── assets/            # Static assets like images
├── components/        # Reusable UI components
├── context/           # React context providers
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/          # API service layer
├── types/             # TypeScript definitions
├── utils/             # Utility functions
├── App.tsx            # Root component
├── main.tsx           # Entry point
└── router.tsx         # Routing configuration
```

## 🔌 API Integration

The frontend communicates with the backend API running at http://localhost:8000/ (in development). Authentication is handled through token-based auth.

Key API services:
- User authentication
- Betting room management
- Match data retrieval
- Prediction submission
- Chat messaging

## 🎨 Styling and UI Components

The UI is built with:
- Tailwind CSS for utility-based styling
- Custom components for consistent design
- Responsive layouts for all device sizes

## 🚢 Deployment

To build for production:

```bash
npm run build
```

This will generate optimized files in the `dist/` directory ready for deployment.

The frontend is designed to be deployed to a static hosting service like Netlify, Vercel, or GitHub Pages.

## 🔄 Development Workflow

1. Create a feature branch from `master` (or `main`)
2. Make your changes
3. Test changes locally
4. Create a pull request to merge into `master`
5. After review, merge the pull request

## 🧪 Testing

Run tests with:

```bash
npm run test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 👥 Authors

- nicoclo205 - Initial work and maintenance

-----------------
Additional info:

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
