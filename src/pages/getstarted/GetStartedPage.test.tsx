// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { DrAliceSmith, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react';
import { describe, expect, test } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { GetStartedPage } from './GetStartedPage';

describe('GetStartedPage', () => {
  test('uses HyperSol copy and keeps unavailable destinations non-interactive', () => {
    const medplum = new MockClient({ profile: DrAliceSmith });

    render(
      <MedplumProvider medplum={medplum}>
        <GetStartedPage />
      </MedplumProvider>
    );

    expect(screen.getByText('Get Started with HyperSol')).toBeInTheDocument();
    expect(screen.queryByText(/Medplum/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Subscribe|Contact|Discord|User Guide/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Coming soon' }).length).toBeGreaterThan(0);
    expect(document.querySelectorAll('a[href^="http"], a[href^="mailto:"]').length).toBe(0);
  });
});
