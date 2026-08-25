import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Catches runtime errors anywhere in the component tree beneath it and
// shows a fallback instead of leaving the whole page blank. Does NOT
// catch errors from the initial data fetch (that's handled separately
// in App via its own error state) — this is specifically for unexpected
// rendering errors once real content is being displayed.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Caught by ErrorBoundary:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          message="This part of the page couldn't be displayed. Please try again."
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}