// udemy react section 14 to know about Class Components
import React, { Component } from 'react';

export default class ErrorHandler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error, info) {
    console.error("Caught an error from ERROR HANDLER:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <p>{this.state.errorMessage === 'Unstable internet connection!' && 'Unstable internet connection!'}
          </p>
        </>
      );
    }
    return this.props.children;
  }
}
