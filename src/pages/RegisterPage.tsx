// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Alert, Stack, Title } from '@mantine/core';
import { Document, useMedplum } from '@medplum/react';
import { IconAlertCircle } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { HyperSLogo } from '../brand/HyperSLogo';
import { HyperSRegisterForm } from '../components/HyperSRegisterForm';

export function RegisterPage(): JSX.Element | null {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (medplum.getProfile()) {
      navigate('/signin?project=new')?.catch(console.error);
    }
  }, [medplum, navigate]);

  if (import.meta.env.MEDPLUM_REGISTER_ENABLED !== 'true') {
    return (
      <Document width={450}>
        <Stack align="center" gap="md">
          <HyperSLogo size={44} withWordmark />
          <Alert icon={<IconAlertCircle size={16} />} title="New projects disabled" color="red" w="100%">
            New projects are disabled on this server.
          </Alert>
        </Stack>
      </Document>
    );
  }

  return (
    <HyperSRegisterForm
      projectId="new"
      onSuccess={() => {
        // Use window.location.href to force a reload
        // Otherwise we get caught in a React render loop
        window.location.href = '/';
      }}
      recaptchaSiteKey={import.meta.env.RECAPTCHA_SITE_KEY}
      login={searchParams.get('login') || undefined}
      onSignIn={() => navigate('/signin')?.catch(console.error)}
    >
      <HyperSLogo size={44} withWordmark />
      <Title order={3} py="lg">
        Create your HyperS account
      </Title>
    </HyperSRegisterForm>
  );
}
