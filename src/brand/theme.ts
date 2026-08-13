// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createTheme } from '@mantine/core';
import { hyperSBlue } from './brand';

export const hyperSTheme = createTheme({
  colors: {
    blue: hyperSBlue,
  },
  primaryColor: 'blue',
  primaryShade: 6,
  defaultRadius: 'md',
  shadows: {
    xs: '0 1px 2px rgba(11, 41, 68, 0.04)',
    sm: '0 2px 8px rgba(11, 41, 68, 0.08)',
    md: '0 8px 24px rgba(11, 41, 68, 0.10)',
    lg: '0 16px 40px rgba(11, 41, 68, 0.12)',
    xl: '0 24px 56px rgba(11, 41, 68, 0.14)',
  },
  headings: {
    sizes: {
      h1: {
        fontSize: '1.125rem',
        fontWeight: '500',
        lineHeight: '2.0',
      },
    },
  },
  fontSizes: {
    xs: '0.6875rem',
    sm: '0.875rem',
    md: '0.875rem',
    lg: '1.0rem',
    xl: '1.125rem',
  },
});
