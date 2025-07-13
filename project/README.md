# Fraud Detection Dashboard

A modern, responsive web application for monitoring and analyzing fraud detection metrics in real-time. Built with React and featuring interactive charts, real-time data visualization, and comprehensive fraud analytics.

## Features

- **Real-time Monitoring**: Live dashboard with fraud detection metrics
- **Interactive Charts**: Visual representation of fraud patterns using Recharts
- **Responsive Design**: Fully responsive interface built with Tailwind CSS
- **Modern UI**: Clean, professional interface with Lucide React icons
- **Type Safety**: Built with TypeScript for enhanced code reliability
- **Fast Development**: Powered by Vite for lightning-fast builds and hot reloading

## Tech Stack

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Charts**: Recharts 2.12.2
- **Icons**: Lucide React 0.344.0
- **HTTP Client**: Axios 1.6.7
- **Routing**: React Router DOM 6.23.1
- **Language**: TypeScript 5.5.3

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fraud-detection-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server with hot reloading
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
fraud-detection-dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # Global styles
│   └── App.tsx             # Main application component
├── public/                 # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript configuration
```

## Development Guidelines

### Code Style
- Follow ESLint configuration for consistent code formatting
- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use Tailwind CSS utility classes for styling

### Components
- Create reusable components in the `components/` directory
- Use functional components with hooks
- Implement proper prop types with TypeScript interfaces
- Follow naming conventions (PascalCase for components)

### State Management
- Use React hooks (useState, useEffect, useReducer) for local state
- Implement custom hooks for complex logic
- Consider context API for global state if needed

## API Integration

The application uses Axios for HTTP requests. Configure your API endpoints in the appropriate service files:

```typescript
// Example API configuration
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';
```

## Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_API_URL=your_api_endpoint_here
VITE_APP_TITLE=Fraud Detection Dashboard
```

## Building for Production

1. Build the application:
```bash
npm run build
```

2. The built files will be in the `dist/` directory, ready for deployment.

## Deployment

The application can be deployed to any static hosting service:

- **Vercel**: Connect your repository and deploy automatically
- **Netlify**: Drag and drop the `dist/` folder or connect via Git
- **AWS S3**: Upload the built files to an S3 bucket with static hosting enabled
- **GitHub Pages**: Use GitHub Actions to deploy on push

## Performance Optimization

- Code splitting with React.lazy() for route-based splitting
- Image optimization and lazy loading
- Memoization with React.memo() and useMemo() where appropriate
- Bundle analysis with `npm run build -- --analyze`

## Browser Support

This application supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is private and proprietary. All rights reserved.

## Support

For support or questions, please contact the development team or create an issue in the repository.

## Changelog

### Version 0.0.0
- Initial project setup
- Basic React application structure
- Tailwind CSS integration
- TypeScript configuration
- Vite build setup