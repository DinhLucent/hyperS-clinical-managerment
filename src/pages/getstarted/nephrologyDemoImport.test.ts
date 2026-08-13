// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Bundle } from '@medplum/fhirtypes';
import { describe, expect, test } from 'vitest';
import { getSuccessfulDemoImportCount } from './nephrologyDemoImport';

describe('getSuccessfulDemoImportCount', () => {
  test('returns the number of successful transaction entries', () => {
    const response: Bundle = {
      resourceType: 'Bundle',
      type: 'transaction-response',
      entry: [{ response: { status: '200 OK' } }, { response: { status: '201 Created' } }],
    };

    expect(getSuccessfulDemoImportCount(response)).toBe(2);
  });

  test('rejects empty or partially failed transaction responses', () => {
    const emptyResponse: Bundle = { resourceType: 'Bundle', type: 'transaction-response', entry: [] };
    const failedResponse: Bundle = {
      resourceType: 'Bundle',
      type: 'transaction-response',
      entry: [
        { response: { status: '200 OK' } },
        {
          response: {
            status: '400 Bad Request',
            outcome: {
              resourceType: 'OperationOutcome',
              issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Synthetic test failure' }],
            },
          },
        },
      ],
    };

    expect(() => getSuccessfulDemoImportCount(emptyResponse)).toThrow(/no resource results/i);
    expect(() => getSuccessfulDemoImportCount(failedResponse)).toThrow(/1 of 2 resources failed/i);
  });
});
