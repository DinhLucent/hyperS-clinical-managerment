// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Group, Stack, Text, Title } from '@mantine/core';
import type { ErrorInfo, ReactNode } from 'react';
import { Component, createRef } from 'react';
import classes from './HyperSolErrorBoundary.module.css';

export interface HyperSolErrorBoundaryProps {
  readonly children: ReactNode;
  readonly resetKey?: string;
}

interface HyperSolErrorBoundaryState {
  readonly error?: Error;
}

export class HyperSolErrorBoundary extends Component<HyperSolErrorBoundaryProps, HyperSolErrorBoundaryState> {
  private readonly containerRef = createRef<HTMLElement>();

  state: HyperSolErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): HyperSolErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('HyperSol view failed to render.', error, errorInfo);
  }

  componentDidUpdate(
    previousProps: HyperSolErrorBoundaryProps,
    previousState: HyperSolErrorBoundaryState
  ): void {
    if (this.state.error && !previousState.error) {
      this.containerRef.current?.focus();
    }

    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: undefined });
    }
  }

  private readonly retry = (): void => {
    this.setState({ error: undefined });
  };

  render(): ReactNode {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <section
        ref={this.containerRef}
        className={classes.boundary}
        role="alert"
        aria-labelledby="hypersol-view-error-title"
        tabIndex={-1}
      >
        <Stack gap="md">
          <Text className={classes.eyebrow}>Workspace interrupted</Text>
          <Title id="hypersol-view-error-title" order={2}>
            We couldn&apos;t load this view
          </Title>
          <Text className={classes.description}>
            Try loading the view again or return to the workspace home. Your data has not been changed.
          </Text>
          <Group gap="sm">
            <Button onClick={this.retry}>Try again</Button>
            <Button component="a" href="/" variant="outline">
              Return home
            </Button>
          </Group>
        </Stack>
      </section>
    );
  }
}
