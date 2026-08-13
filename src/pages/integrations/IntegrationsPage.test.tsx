// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { IntegrationsPage } from './IntegrationsPage';

describe('IntegrationsPage', () => {
  function setup(): void {
    render(<IntegrationsPage />);
  }

  test('Renders all integrations', () => {
    setup();

    // Check that all integration names are rendered
    expect(screen.getByText('Okta')).toBeInTheDocument();
    expect(screen.getByText('Auth0')).toBeInTheDocument();
    expect(screen.getByText('Google Authentication')).toBeInTheDocument();
    expect(screen.getByText('Microsoft Entra SSO')).toBeInTheDocument();
    expect(screen.getByText('Labcorp')).toBeInTheDocument();
    expect(screen.getByText('Quest Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Health Gorilla')).toBeInTheDocument();
    expect(screen.getByText('Candid Health')).toBeInTheDocument();
    expect(screen.getByText('Particle')).toBeInTheDocument();
    expect(screen.getByText('Epic Systems')).toBeInTheDocument();
    expect(screen.getByText('reCAPTCHA')).toBeInTheDocument();
    expect(screen.getByText('Datadog')).toBeInTheDocument();
    expect(screen.getByText('Sumo Logic')).toBeInTheDocument();
    expect(screen.getByText('Snowflake')).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Stripe')).toBeInTheDocument();
    expect(screen.getByText('Acuity Scheduling')).toBeInTheDocument();
    expect(screen.getByText('Cal.com')).toBeInTheDocument();
    expect(screen.getByText('Claude')).toBeInTheDocument();
    expect(screen.getByText('DeepSeek')).toBeInTheDocument();
    expect(screen.getByText('Azure')).toBeInTheDocument();
    expect(screen.getByText('Healthie')).toBeInTheDocument();
  });

  test('Renders integration descriptions', () => {
    setup();

    expect(
      screen.getByText(/Implement SSO for healthcare staff with HIPAA-compliant authentication protocols/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Manage identity access for patient portals/)).toBeInTheDocument();
    expect(
      screen.getByText(/Place orders and receive lab results directly in your EHR from Labcorp/)
    ).toBeInTheDocument();
  });

  test('Renders integration tags', () => {
    setup();

    // Check for various tags
    expect(screen.getAllByText('Authentication').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Diagnostics').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Billing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('HIE').length).toBeGreaterThan(0);
    expect(screen.getAllByText('EHR').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Security').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Observability').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Scheduling').length).toBeGreaterThan(0);
  });

  test('Renders disabled Coming soon buttons for all integrations', () => {
    setup();

    const comingSoonButtons = screen.getAllByRole('button', { name: 'Coming soon' });
    expect(comingSoonButtons).toHaveLength(22);
    expect(comingSoonButtons.every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
    expect(document.querySelectorAll('a[href^="mailto:"]')).toHaveLength(0);
    expect(screen.queryByText(/Medplum/i)).not.toBeInTheDocument();
  });

  test('Renders integration display URLs', () => {
    setup();

    // Check that display URLs are rendered as links
    expect(screen.getByText('okta.com')).toBeInTheDocument();
    expect(screen.getByText('auth0.com')).toBeInTheDocument();
    expect(screen.getByText('labcorp.com')).toBeInTheDocument();
  });

  test('Integration links open in new tab', () => {
    setup();

    const oktaLink = screen.getByText('okta.com').closest('a');
    expect(oktaLink).toHaveAttribute('href', 'https://www.okta.com');
    expect(oktaLink).toHaveAttribute('target', '_blank');
    expect(oktaLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('Renders correct number of integrations', () => {
    setup();

    // Count unique integration names
    const integrationNames = [
      'Okta',
      'Auth0',
      'Google Authentication',
      'Microsoft Entra SSO',
      'Labcorp',
      'Quest Diagnostics',
      'Health Gorilla',
      'Candid Health',
      'Particle',
      'Epic Systems',
      'reCAPTCHA',
      'Datadog',
      'Sumo Logic',
      'Snowflake',
      'OpenAI',
      'Stripe',
      'Acuity Scheduling',
      'Cal.com',
      'Claude',
      'DeepSeek',
      'Azure',
      'Healthie',
    ];

    integrationNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});
