// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { normalizeErrorString } from '@medplum/core';
import { Alert, Button, Checkbox, Group, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { Document, getRecaptcha, initRecaptcha, useMedplum } from '@medplum/react';
import type { JSX, ReactNode, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { HyperSLogo } from '../brand/HyperSLogo';

export interface HyperSRegisterFormProps {
  readonly projectId?: string;
  readonly clientId?: string;
  readonly recaptchaSiteKey?: string;
  readonly login?: string;
  readonly children?: ReactNode;
  readonly onSuccess: () => void;
  readonly onSignIn?: () => void;
}

function getFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export function HyperSRegisterForm({
  projectId = 'new',
  clientId,
  recaptchaSiteKey,
  login: initialLogin,
  children,
  onSuccess,
  onSignIn,
}: HyperSRegisterFormProps): JSX.Element {
  const medplum = useMedplum();
  const [login, setLogin] = useState(initialLogin);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (recaptchaSiteKey) {
      initRecaptcha(recaptchaSiteKey);
    }
  }, [recaptchaSiteKey]);

  const handleAuthResponse = async (response: { code?: string; login?: string; emailVerificationRequired?: boolean }): Promise<void> => {
    try {
      if (response.code) {
        await medplum.processCode(response.code);
        onSuccess();
        return;
      }
      if (response.login) {
        setLogin(response.login);
      }
      if (response.emailVerificationRequired) {
        setEmailVerificationRequired(true);
      }
    } catch (err) {
      setError(normalizeErrorString(err));
    }
  };

  const handleNewUserSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(undefined);
    const formData = new FormData(event.currentTarget);
    try {
      const recaptchaToken = recaptchaSiteKey ? await getRecaptcha(recaptchaSiteKey) : '';
      const response = await medplum.startNewUser({
        projectId,
        clientId,
        firstName: getFormString(formData, 'firstName'),
        lastName: getFormString(formData, 'lastName'),
        email: getFormString(formData, 'email'),
        password: getFormString(formData, 'password'),
        remember: formData.get('remember') === 'on',
        recaptchaSiteKey,
        recaptchaToken,
      });
      await handleAuthResponse(response);
    } catch (err) {
      setError(normalizeErrorString(err));
    }
  };

  const handleNewProjectSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(undefined);
    const formData = new FormData(event.currentTarget);
    try {
      if (!login) {
        throw new Error('Registration session is not available.');
      }
      const response = await medplum.startNewProject({ login, projectName: getFormString(formData, 'projectName') });
      await handleAuthResponse(response);
    } catch (err) {
      setError(normalizeErrorString(err));
    }
  };

  return (
    <Document width={400} px="xl" py="xl" bdrs="md">
      {error && <Alert color="red" title="Registration unavailable" mb="lg">{error}</Alert>}
      {!login && !emailVerificationRequired && (
        <form onSubmit={handleNewUserSubmit}>
          <Stack gap="sm">
            <Stack align="center" gap={0} mb="md">
              {children}
            </Stack>
            <TextInput name="firstName" label="First name" placeholder="First name" required autoFocus />
            <TextInput name="lastName" label="Last name" placeholder="Last name" required />
            <TextInput name="email" type="email" label="Email" placeholder="name@domain.com" required />
            <PasswordInput name="password" label="Password" autoComplete="off" required />
            <Checkbox name="remember" label="Remember me" size="xs" mt="xs" />
            <Button type="submit" fullWidth>Register Account</Button>
            {onSignIn && (
              <Text size="sm" c="dimmed" ta="center" mt="md">
                Already have an account?{' '}
                <Button variant="subtle" size="compact-sm" type="button" onClick={onSignIn}>Sign In</Button>
              </Text>
            )}
            <Text c="dimmed" size="xs" ta="center" pt="md">
              By continuing, you agree to use this local HyperS demonstration environment.
            </Text>
            {recaptchaSiteKey && (
              <Text c="dimmed" size="xs" ta="center">
                Automated protection is enabled for this registration flow.
              </Text>
            )}
          </Stack>
        </form>
      )}
      {emailVerificationRequired && (
        <Stack align="center" gap="md">
          <HyperSLogo size={44} withWordmark />
          <Text ta="center">Please check your email for a verification link to continue setting up your HyperS account.</Text>
        </Stack>
      )}
      {login && !emailVerificationRequired && (
        <form onSubmit={handleNewProjectSubmit}>
          <Stack gap="md">
            <Stack align="center" gap={0} mb="md">
              <HyperSLogo size={44} withWordmark />
              <Text fw={700} size="lg" mt="md">Set up your HyperS workspace</Text>
            </Stack>
            <TextInput name="projectName" label="Project Name" placeholder="My workspace" required autoFocus />
            <Group justify="flex-end">
              <Button type="submit">Create Workspace</Button>
            </Group>
          </Stack>
        </form>
      )}
    </Document>
  );
}
