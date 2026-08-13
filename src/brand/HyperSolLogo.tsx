// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { CSSProperties, JSX } from 'react';
import { hyperSolBrand } from './brand';
import classes from './HyperSolLogo.module.css';

export interface HyperSolLogoProps {
  readonly size?: number | string;
  readonly withWordmark?: boolean;
  readonly className?: string;
}

export function HyperSolLogo({ size = 28, withWordmark = true, className }: HyperSolLogoProps): JSX.Element {
  const classNames = [classes.logo, className].filter(Boolean).join(' ');
  const logoSize = typeof size === 'number' ? `${size}px` : size;
  const style = { '--hypersol-logo-size': logoSize } as CSSProperties;

  return (
    <span className={classNames} role="img" aria-label={hyperSolBrand.name} style={style}>
      <img className={classes.mark} src="/brand/hypersol-mark.png" alt="" />
      {withWordmark && (
        <span className={classes.wordmark} aria-hidden="true">
          <span>Hyper</span>
          <span className={classes.wordmarkAccent}>Sol</span>
        </span>
      )}
    </span>
  );
}
