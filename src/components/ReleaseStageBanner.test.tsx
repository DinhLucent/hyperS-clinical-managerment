// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import { render, screen } from '../test-utils/render';
import { ReleaseStageBanner } from './ReleaseStageBanner';

describe('ReleaseStageBanner', () => {
  test('keeps stage messaging local and non-interactive', () => {
    render(
      <ReleaseStageBanner stage="alpha">This feature is changing as the demo evolves.</ReleaseStageBanner>
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('This feature is changing as the demo evolves.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
