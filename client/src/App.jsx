import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

/**
 * Root Application Component
 */
export const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
