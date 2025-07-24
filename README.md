# Gerrit UI

A modern web interface for the Gerrit Code Review system, built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Modern Authentication**: User registration and login with the Gerrit backend
- **Project Management**: Create and view Git repositories
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Toast notifications for user feedback
- **Type Safety**: Full TypeScript support with API type definitions

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrapper
- **Notifications**: Sonner toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- The Gerrit backend running on `http://localhost:8080`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── projects/          # Project management components
│   └── ui/                # shadcn/ui components
├── contexts/              # React contexts
├── lib/                   # Utility functions and API client
└── types/                 # TypeScript type definitions
```

## API Integration

The UI communicates with the Gerrit backend through the following endpoints:

### Authentication
- `PUT /a/accounts/{username}` - Create user account
- `GET /a/accounts/{username}` - Get user information

### Projects
- `PUT /a/projects/{projectName}` - Create new project
- `GET /a/projects/` - List all projects
- `GET /a/projects/{projectName}` - Get project details

### Changes
- `GET /a/changes/` - List changes
- `GET /a/changes/{changeId}` - Get change details

## Development

### Adding New Components

1. Use shadcn/ui to add new components:
   ```bash
   npx shadcn@latest add [component-name]
   ```

2. Create new components in the appropriate directory under `src/components/`

### API Integration

1. Add new types to `src/types/api.ts`
2. Add new methods to `src/lib/api.ts`
3. Create components that use the API client

### Styling

- Use Tailwind CSS classes for styling
- Follow the design system defined by shadcn/ui
- Use the color palette and spacing defined in `tailwind.config.js`

## Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new features
3. Include error handling and loading states
4. Test the UI with the Gerrit backend

## Troubleshooting

### Common Issues

1. **API Connection Errors**: Ensure the Gerrit backend is running on the correct port
2. **TypeScript Errors**: Check that all imports are correct and types are defined
3. **Styling Issues**: Verify Tailwind CSS is properly configured

### Development Tips

- Use the browser's developer tools to debug API calls
- Check the Network tab to see request/response details
- Use React DevTools to inspect component state
