import { Component, type ReactNode } from 'react';

interface ViewerBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

/** Keeps a model that fails to load (e.g. a dropped connection) from taking the page down. */
export class ViewerBoundary extends Component<ViewerBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
