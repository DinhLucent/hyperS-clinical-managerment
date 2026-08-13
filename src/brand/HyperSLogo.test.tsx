// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import { render, screen } from '../test-utils/render';
import { HyperSLogo } from './HyperSLogo';

describe('HyperSLogo', () => {
  test('exposes an accessible HyperS name and the approved local asset', () => {
    render(<HyperSLogo />);

    const logo = screen.getByRole('img', { name: 'HyperS' });
    const image = logo.querySelector('img');

    expect(logo).toHaveAttribute('aria-label', 'HyperS');
    expect(image).toHaveAttribute('src', '/brand/hypers-mark.png');
    expect(image).toHaveAttribute('alt', '');
    expect(screen.getByText('HyperS')).toBeInTheDocument();
  });

  test('can render the mark without the wordmark', () => {
    render(<HyperSLogo withWordmark={false} />);

    expect(screen.getByRole('img', { name: 'HyperS' })).toBeInTheDocument();
    expect(screen.queryByText('HyperS')).not.toBeInTheDocument();
  });
});
