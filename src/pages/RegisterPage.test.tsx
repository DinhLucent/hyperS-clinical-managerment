// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MedplumClient } from '@medplum/core';
import { DrAliceSmith, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { App } from '../App';
import type { UserEvent } from '../test-utils/render';
import { act, render, screen, userEvent } from '../test-utils/render';

async function setup(medplum: MedplumClient, url = '/register'): Promise<UserEvent> {
  const user = userEvent.setup();
  await act(async () => {
    render(
      <MemoryRouter initialEntries={[url]} initialIndex={0}>
        <MedplumProvider medplum={medplum}>
          <App />
        </MedplumProvider>
      </MemoryRouter>
    );
  });

  return user;
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.stubEnv('MEDPLUM_REGISTER_ENABLED', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('Renders', async () => {
    vi.stubEnv('MEDPLUM_REGISTER_ENABLED', 'true');

    const medplum = new MockClient({ profile: null });
    await setup(medplum);

    expect(screen.getByText('Create your HyperSol account')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'HyperSol' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.queryByText(/Medplum/i)).not.toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  test('Redirects to sign in if signed in', async () => {
    vi.stubEnv('MEDPLUM_REGISTER_ENABLED', 'true');

    const medplum = new MockClient({ profile: DrAliceSmith });
    await setup(medplum);

    expect(screen.getByText('Sign in to HyperSol')).toBeInTheDocument();
  });

  test('Submit success', async () => {
    vi.stubEnv('MEDPLUM_REGISTER_ENABLED', 'true');

    const medplum = new MockClient({ profile: null });
    medplum.startNewUser = vi.fn(() => Promise.resolve({ login: '1' }));
    const user = await setup(medplum);

    Object.defineProperty(global, 'grecaptcha', {
      value: {
        ready(callback: () => void): void {
          callback();
        },
        execute(): Promise<string> {
          return Promise.resolve('token');
        },
      },
      configurable: true,
    });

    await user.type(screen.getByLabelText('First name *'), 'George');
    await user.type(screen.getByLabelText('Last name *'), 'Washington');
    await user.type(screen.getByLabelText('Email *'), 'george@example.com');
    await user.type(screen.getByLabelText('Password *'), 'password');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByLabelText('Project name *')).toBeInTheDocument();
  });

  test('prevents duplicate account submissions while a request is pending', async () => {
    vi.stubEnv('MEDPLUM_REGISTER_ENABLED', 'true');

    let resolveRegistration:
      | ((response: Awaited<ReturnType<MedplumClient['startNewUser']>>) => void)
      | undefined;
    const medplum = new MockClient({ profile: null });
    medplum.startNewUser = vi.fn(
      () =>
        new Promise<Awaited<ReturnType<MedplumClient['startNewUser']>>>((resolve) => {
          resolveRegistration = resolve;
        })
    );
    const user = await setup(medplum);

    await user.type(screen.getByLabelText('First name *'), 'George');
    await user.type(screen.getByLabelText('Last name *'), 'Washington');
    await user.type(screen.getByLabelText('Email *'), 'george@example.com');
    await user.type(screen.getByLabelText('Password *'), 'password');

    const submitButton = screen.getByRole('button', { name: 'Create account' });
    await user.dblClick(submitButton);

    expect(medplum.startNewUser).toHaveBeenCalledTimes(1);
    expect(submitButton).toBeDisabled();

    await act(async () => resolveRegistration?.({ login: '1' }));
    expect(await screen.findByLabelText('Project name *')).toBeInTheDocument();
  });

  test('shows a safe error and preserves entered values', async () => {
    vi.stubEnv('MEDPLUM_REGISTER_ENABLED', 'true');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const medplum = new MockClient({ profile: null });
    medplum.startNewUser = vi.fn(() => Promise.reject(new Error('postgres connection string leaked')));
    const user = await setup(medplum);

    const firstName = screen.getByLabelText('First name *');
    const email = screen.getByLabelText('Email *');
    await user.type(firstName, 'George');
    await user.type(screen.getByLabelText('Last name *'), 'Washington');
    await user.type(email, 'george@example.com');
    await user.type(screen.getByLabelText('Password *'), 'password');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "We couldn't create the account. Check your details and try again."
    );
    expect(screen.queryByText(/postgres connection string leaked/i)).not.toBeInTheDocument();
    expect(firstName).toHaveValue('George');
    expect(email).toHaveValue('george@example.com');
    expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled();
    consoleSpy.mockRestore();
  });

  test('Register disabled by default', async () => {
    const medplum = new MockClient({ profile: null });
    await setup(medplum);

    expect(screen.getByText('New projects are disabled on this server.')).toBeInTheDocument();
  });

  test('Register disabled when explicitly false', async () => {
    vi.stubEnv('MEDPLUM_REGISTER_ENABLED', 'false');

    const medplum = new MockClient({ profile: null });
    await setup(medplum);

    expect(screen.getByText('New projects are disabled on this server.')).toBeInTheDocument();
  });
});
