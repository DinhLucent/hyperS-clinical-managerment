// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { CSSProperties, JSX } from 'react';
import { hyperSBrand } from './brand';
import classes from './HyperSLogo.module.css';

export interface HyperSLogoProps {
  readonly size?: number | string;
  readonly withWordmark?: boolean;
  readonly className?: string;
}

export function HyperSLogo({ size = 28, withWordmark = true, className }: HyperSLogoProps): JSX.Element {
  const classNames = [classes.logo, className].filter(Boolean).join(' ');
  const logoSize = typeof size === 'number' ? `${size}px` : size;
  const style = { '--hypers-logo-size': logoSize } as CSSProperties;

  return (
    <span className={classNames} role="img" aria-label={hyperSBrand.name} style={style}>
      <img className={classes.mark} src="/brand/hypers-mark.png" alt="" />
      {withWordmark && (
        <span className={classes.wordmark} aria-hidden="true">
          {hyperSBrand.name}
        </span>
      )}
    </span>
  );
}
