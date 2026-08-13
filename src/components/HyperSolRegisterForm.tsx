// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Alert, Button, Checkbox, Group, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { Document, getRecaptcha, initRecaptcha, useMedplum } from '@medplum/react';
import type { FormEvent, JSX, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { HyperSolLogo } from '../brand/HyperSolLogo';

export interface HyperSolRegisterFormProps {
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

export function HyperSolRegisterForm({
  projectId = 'new',
  clientId,
  recaptchaSiteKey,
  login: initialLogin,
  children,
  onSuccess,
  onSignIn,
}: HyperSolRegisterFormProps): JSX.Element {
  const medplum = useMedplum();
  const [login, setLogin] = useState(initialLogin);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const submissionInFlight = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recaptchaSiteKey) {
      initRecaptcha(recaptchaSiteKey);
    }
  }, [recaptchaSiteKey]);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  const beginSubmission = (): boolean => {
    if (submissionInFlight.current) {
      return false;
    }

    submissionInFlight.current = true;
    setSubmitting(true);
    setError(undefined);
    return true;
  };

  const endSubmission = (): void => {
    submissionInFlight.current = false;
    setSubmitting(false);
  };

  const reportError = (message: string, err: unknown): void => {
    console.error(message, err);
    setError(message);
  };

  const handleAuthResponse = async (response: {
    code?: string;
    login?: string;
    emailVerificationRequired?: boolean;
  }): Promise<void> => {
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
        return;
      }

      if (!response.login) {
        throw new Error('Registration response did not include a continuation method.');
      }
    } catch (err) {
      reportError("We couldn't finish signing you in. Try again.", err);
    }
  };

  const handleNewUserSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!beginSubmission()) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    try {
      const recaptchaToken = recaptchaSiteKey ? await getRecaptcha(recaptchaSiteKey) : '';
      const response = await medplum.startNewUser({
        projectId,
        clientId,
        firstName: getFormString(formData, 'firstName').trim(),
        lastName: getFormString(formData, 'lastName').trim(),
        email: getFormString(formData, 'email').trim().toLowerCase(),
        password: getFormString(formData, 'password'),
        remember: formData.get('remember') === 'on',
        recaptchaSiteKey,
        recaptchaToken,
      });
      await handleAuthResponse(response);
    } catch (err) {
      reportError("We couldn't create the account. Check your details and try again.", err);
    } finally {
      endSubmission();
    }
  };

  const handleNewProjectSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!beginSubmission()) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    try {
      if (!login) {
        throw new Error('Registration session is not available.');
      }
      const response = await medplum.startNewProject({
        login,
        projectName: getFormString(formData, 'projectName').trim(),
      });
      await handleAuthResponse(response);
    } catch (err) {
      reportError("We couldn't create the workspace. Check the name and try again.", err);
    } finally {
      endSubmission();
    }
  };

  return (
    <Document width={420} px="xl" py="xl" bdrs="md">
      {error && (
        <div ref={errorRef} tabIndex={-1}>
          <Alert role="alert" color="red" title="Registration unavailable" mb="lg">
            {error}
          </Alert>
        </div>
      )}
      {!login && !emailVerificationRequired && (
        <form onSubmit={handleNewUserSubmit}>
          <Stack gap="sm">
            <Stack align="center" gap={0} mb="md">
              {children}
            </Stack>
            <TextInput name="firstName" label="First name" placeholder="First name" autoComplete="given-name" required />
            <TextInput name="lastName" label="Last name" placeholder="Last name" autoComplete="family-name" required />
            <TextInput
              name="email"
              type="email"
              label="Email"
              placeholder="name@domain.com"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              required
            />
            <PasswordInput name="password" label="Password" autoComplete="new-password" required />
            <Checkbox name="remember" label="Remember me" size="xs" mt="xs" />
            <Button type="submit" fullWidth loading={submitting} disabled={submitting} aria-busy={submitting}>
              Create account
            </Button>
            {onSignIn && (
              <Text size="sm" c="dimmed" ta="center" mt="md">
                Already have an account?{' '}
                <Button variant="transparent" size="sm" type="button" onClick={onSignIn}>
                  Sign in
                </Button>
              </Text>
            )}
            <Text c="dimmed" size="xs" ta="center" pt="md">
              This account is stored only in your local HyperSol environment.
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
          <HyperSolLogo size={44} withWordmark />
          <Text ta="center">
            Please check your email for a verification link to continue setting up your HyperSol account.
          </Text>
        </Stack>
      )}
      {login && !emailVerificationRequired && (
        <form onSubmit={handleNewProjectSubmit}>
          <Stack gap="md">
            <Stack align="center" gap={0} mb="md">
              <HyperSolLogo size={44} withWordmark />
              <Text fw={700} size="lg" mt="md">
                Set up your HyperSol workspace
              </Text>
            </Stack>
            <TextInput name="projectName" label="Project name" placeholder="My workspace" autoComplete="organization" required />
            <Group justify="flex-end">
              <Button type="submit" fullWidth loading={submitting} disabled={submitting} aria-busy={submitting}>
                Create workspace
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Document>
  );
}
