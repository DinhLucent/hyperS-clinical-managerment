// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '../test-utils/render';
import { HyperSolErrorBoundary } from './HyperSolErrorBoundary';

function BrokenClinicalView(): JSX.Element {
  throw new Error('postgres connection string leaked');
}

describe('HyperSolErrorBoundary', () => {
  test('shows a safe recovery state without exposing internal errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <HyperSolErrorBoundary>
        <BrokenClinicalView />
      </HyperSolErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: "We couldn't load this view" })).toBeInTheDocument();
    expect(screen.queryByText(/postgres connection string leaked/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
    consoleSpy.mockRestore();
  });
});
