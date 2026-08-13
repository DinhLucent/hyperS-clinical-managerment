// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { DrAliceSmith, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '../../test-utils/render';
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

  test('presents the synthetic nephrology cohort as an importable demo workflow', () => {
    const medplum = new MockClient({ profile: DrAliceSmith });

    render(
      <MedplumProvider medplum={medplum}>
        <GetStartedPage />
      </MedplumProvider>
    );

    expect(screen.getByText('Nephrology Demo Cohort')).toBeInTheDocument();
    expect(screen.getByText('15 synthetic patient journeys')).toBeInTheDocument();
    expect(screen.getByText(/6 longitudinal kidney-care stories/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import Nephrology Demo' })).toBeEnabled();
  });

  test('imports the linked nephrology resources as one idempotent conditional-create transaction', async () => {
    const medplum = new MockClient({ profile: DrAliceSmith });
    const executeBatch = vi.spyOn(medplum, 'executeBatch').mockResolvedValue({
      resourceType: 'Bundle',
      type: 'batch-response',
      entry: [{ response: { status: '200 OK' } }],
    });

    render(
      <MedplumProvider medplum={medplum}>
        <GetStartedPage />
      </MedplumProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Import Nephrology Demo' }));

    await waitFor(() => expect(executeBatch).toHaveBeenCalledOnce());
    const transaction = executeBatch.mock.calls[0][0];
    expect(transaction.type).toBe('transaction');
    expect(transaction.entry?.length).toBeGreaterThanOrEqual(250);
    expect(transaction.entry?.length).toBeLessThan(300);
    expect(transaction.entry?.every((entry) => entry.request?.method === 'POST' && entry.request.ifNoneExist)).toBe(
      true
    );
    expect(transaction.entry?.find((entry) => entry.resource?.resourceType === 'Task')?.resource).toMatchObject({
      owner: { reference: `Practitioner/${DrAliceSmith.id}` },
    });
  });
});
