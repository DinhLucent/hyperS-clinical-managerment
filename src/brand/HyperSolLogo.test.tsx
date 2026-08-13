// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import { render, screen } from '../test-utils/render';
import { HyperSolLogo } from './HyperSolLogo';

describe('HyperSolLogo', () => {
  test('exposes an accessible HyperSol name and the approved local asset', () => {
    render(<HyperSolLogo />);

    const logo = screen.getByRole('img', { name: 'HyperSol' });
    const image = logo.querySelector('img');

    expect(logo).toHaveAttribute('aria-label', 'HyperSol');
    expect(image).toHaveAttribute('src', '/brand/hypersol-mark.png');
    expect(image).toHaveAttribute('alt', '');
    expect(logo).toHaveTextContent('HyperSol');
  });

  test('can render the mark without the wordmark', () => {
    render(<HyperSolLogo withWordmark={false} />);

    expect(screen.getByRole('img', { name: 'HyperSol' })).toHaveTextContent('');
  });
});
