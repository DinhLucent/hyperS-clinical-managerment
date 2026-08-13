// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { DrAliceSmith, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react';
import type { NavbarMenu } from '@medplum/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';
import { HyperSAppShell } from './HyperSAppShell';
import { render, screen } from '../test-utils/render';

const menus: NavbarMenu[] = [
  {
    links: [{ label: 'Patients', href: '/Patient', icon: <span aria-hidden="true">P</span> }],
  },
  {
    title: 'Quick Links',
    links: [{ label: 'Get Started', href: '/getstarted', icon: <span aria-hidden="true">G</span> }],
  },
];

describe('HyperSAppShell', () => {
  test('renders a branded authenticated shell without dependency branding', () => {
    const medplum = new MockClient({ profile: DrAliceSmith });

    render(
      <MemoryRouter initialEntries={['/Patient']}>
        <MedplumProvider medplum={medplum}>
          <HyperSAppShell menus={menus}>
            <div>Clinical content</div>
          </HyperSAppShell>
        </MedplumProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('img', { name: 'HyperS' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Patients' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Clinical content')).toBeInTheDocument();
    expect(screen.queryByText(/Medplum/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Medplum Logo/i })).not.toBeInTheDocument();
  });

  test('does not add authenticated navigation to public pages', () => {
    const medplum = new MockClient({ profile: null });

    render(
      <MemoryRouter>
        <MedplumProvider medplum={medplum}>
          <HyperSAppShell menus={menus}>
            <div>Public content</div>
          </HyperSAppShell>
        </MedplumProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Public content')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument();
  });
});
