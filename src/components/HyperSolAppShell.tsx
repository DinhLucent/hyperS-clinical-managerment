// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { formatHumanName, getReferenceString } from '@medplum/core';
import {
  ActionIcon,
  AppShell as MantineAppShell,
  Badge,
  Divider,
  Group,
  Menu,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { spotlight } from '@mantine/spotlight';
import type { NavbarLink, NavbarMenu, SpotlightLinkAction } from '@medplum/react';
import { ResourceAvatar, Spotlight, useMedplum, useMedplumProfile, useNotificationCount } from '@medplum/react';
import { IconChevronDown, IconLogout, IconMenu2, IconSearch, IconSettings } from '@tabler/icons-react';
import type { JSX, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { HyperSolLogo } from '../brand/HyperSolLogo';
import styles from './HyperSolAppShell.module.css';
import { HyperSolErrorBoundary } from './HyperSolErrorBoundary';

export interface HyperSolAppShellProps {
  readonly children: ReactNode;
  readonly pathname?: string;
  readonly searchParams?: URLSearchParams;
  readonly menus?: NavbarMenu[];
  readonly spotlightActions?: SpotlightLinkAction[];
}

export function HyperSolAppShell(props: HyperSolAppShellProps): JSX.Element {
  const profile = useMedplumProfile();

  // Auth pages intentionally render without the authenticated navigation shell.
  if (!profile) {
    return <>{props.children}</>;
  }

  return <AuthenticatedHyperSolAppShell {...props} profile={profile} />;
}

interface AuthenticatedHyperSolAppShellProps extends HyperSolAppShellProps {
  readonly profile: NonNullable<ReturnType<typeof useMedplumProfile>>;
}

function AuthenticatedHyperSolAppShell({
  children,
  menus,
  spotlightActions,
  profile,
}: AuthenticatedHyperSolAppShellProps): JSX.Element {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const location = useLocation();
  const [navbarOpen, setNavbarOpen] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 48em)').matches
      : false
  );
  const project = medplum.getProject();
  const projectDisplay = project?.name ?? medplum.getActiveLogin()?.project.display;
  const profileDisplay = formatHumanName(profile.name?.[0]) || medplum.getActiveLogin()?.profile.display || 'Account';

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const desktopQuery = window.matchMedia('(min-width: 48em)');
    const syncNavbarToViewport = (event: MediaQueryListEvent): void => setNavbarOpen(event.matches);
    desktopQuery.addEventListener('change', syncNavbarToViewport);
    return () => desktopQuery.removeEventListener('change', syncNavbarToViewport);
  }, []);

  const toggleNavbar = (): void => setNavbarOpen((opened) => !opened);
  const closeNavbarOnMobile = (): void => {
    if (window.innerWidth < 768) {
      setNavbarOpen(false);
    }
  };

  const signOut = async (): Promise<void> => {
    await medplum.signOut();
    await navigate('/signin');
  };

  return (
    <>
      <a className={styles.skipLink} href="#hypersol-main-content">
        Skip to clinical content
      </a>
      <MantineAppShell
        header={{ height: 60 }}
        navbar={{ width: 244, breakpoint: 'sm', collapsed: { mobile: !navbarOpen, desktop: !navbarOpen } }}
        padding="md"
      >
        <MantineAppShell.Header className={styles.header}>
          <Group className={styles.headerInner} gap="sm" wrap="nowrap">
            <Tooltip label={navbarOpen ? 'Collapse navigation' : 'Open navigation'}>
              <ActionIcon
                className={styles.menuButton}
                variant="subtle"
                size="lg"
                aria-label={navbarOpen ? 'Collapse navigation' : 'Open navigation'}
                aria-expanded={navbarOpen}
                aria-controls="hypersol-primary-navigation"
                onClick={toggleNavbar}
              >
                <IconMenu2 size={20} />
              </ActionIcon>
            </Tooltip>
            <Link className={styles.logoButton} to="/" aria-label="HyperSol home">
              <HyperSolLogo size={28} withWordmark />
            </Link>
            <div className={styles.headerActions}>
              <Group gap="xs" wrap="nowrap">
                {spotlightActions && spotlightActions.length > 0 && (
                  <Tooltip label="Search">
                    <ActionIcon variant="subtle" aria-label="Search" onClick={() => spotlight.open()}>
                      <IconSearch size={19} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Menu position="bottom-end" shadow="md" width={260}>
                  <Menu.Target>
                    <UnstyledButton className={styles.accountButton} aria-label="Account menu">
                      <Group gap="xs" wrap="nowrap">
                        <ResourceAvatar value={profile} radius="xl" size={28} />
                        <Stack className={styles.accountText} gap={0} visibleFrom="sm">
                          <Text className={styles.accountName} size="sm" fw={600} truncate>
                            {profileDisplay}
                          </Text>
                          {projectDisplay && (
                            <Text className={styles.projectName} size="xs" c="dimmed" truncate>
                              {projectDisplay}
                            </Text>
                          )}
                        </Stack>
                        <IconChevronDown size={14} />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>{profileDisplay}</Menu.Label>
                    <Menu.Item
                      leftSection={<IconSettings size={16} />}
                      onClick={() => navigate(`/${getReferenceString(profile)}`)}
                    >
                      Account settings
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconLogout size={16} />}
                      onClick={() => {
                        signOut().catch(console.error);
                      }}
                    >
                      Sign out
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </div>
          </Group>
        </MantineAppShell.Header>

        <MantineAppShell.Navbar
          id="hypersol-primary-navigation"
          className={styles.navbar}
          aria-label="Primary navigation"
        >
          <ScrollArea className={styles.navScrollArea}>
            <Stack gap={4}>
              {menus?.map((menu, index) => (
                <div key={menu.title ?? `menu-${index}`}>
                  {menu.title && (
                    <Text className={styles.menuTitle} component="div">
                      {menu.title}
                    </Text>
                  )}
                  <Stack gap={4}>
                    {menu.links?.map((link) => (
                      <HyperSolNavLink
                        key={link.href}
                        link={link}
                        pathname={location.pathname}
                        onNavigate={closeNavbarOnMobile}
                      />
                    ))}
                  </Stack>
                </div>
              ))}
              <Divider my="sm" />
              <Text size="xs" c="dimmed" ta="center" px="sm">
                HyperSol · Local clinical workspace
              </Text>
            </Stack>
          </ScrollArea>
        </MantineAppShell.Navbar>

        <MantineAppShell.Main id="hypersol-main-content" className={styles.main} tabIndex={-1}>
          <HyperSolErrorBoundary resetKey={`${location.pathname}${location.search}`}>
            {children}
          </HyperSolErrorBoundary>
        </MantineAppShell.Main>

        {spotlightActions && spotlightActions.length > 0 && <Spotlight patientsOnly staticActions={spotlightActions} />}
      </MantineAppShell>
    </>
  );
}

interface HyperSolNavLinkProps {
  readonly link: NavbarLink;
  readonly pathname: string;
  readonly onNavigate: () => void;
}

function HyperSolNavLink(props: HyperSolNavLinkProps): JSX.Element {
  const notificationCount = props.link.notificationCount;
  if (notificationCount) {
    return <HyperSolNotificationNavLink {...props} notificationCount={notificationCount} />;
  }

  return <HyperSolNavLinkContent {...props} />;
}

interface HyperSolNotificationNavLinkProps extends HyperSolNavLinkProps {
  readonly notificationCount: NonNullable<NavbarLink['notificationCount']>;
}

function HyperSolNotificationNavLink({
  notificationCount,
  ...props
}: HyperSolNotificationNavLinkProps): JSX.Element {
  const count = useNotificationCount(notificationCount);
  return <HyperSolNavLinkContent {...props} count={count} />;
}

interface HyperSolNavLinkContentProps extends HyperSolNavLinkProps {
  readonly count?: number;
}

function HyperSolNavLinkContent({ link, pathname, onNavigate, count }: HyperSolNavLinkContentProps): JSX.Element {
  const targetPath = link.href.split('?')[0];
  const active = pathname === targetPath || (pathname.startsWith(`${targetPath}/`) && targetPath !== '/');

  return (
    <div className={styles.navLinkRow}>
      <Link
        className={styles.navLink}
        to={link.href}
        data-active={active || undefined}
        aria-current={active ? 'page' : undefined}
        onClick={onNavigate}
      >
        <span className={styles.navIcon}>{link.icon}</span>
        <span className={styles.navLabel}>{link.label}</span>
        {count !== undefined && count > 0 && (
          <Badge size="sm" circle color="blue">
            {count}
          </Badge>
        )}
        {link.count !== undefined && link.count > 0 && (
          <Badge size="sm" circle color={link.alert ? 'red' : 'blue'}>
            {link.count}
          </Badge>
        )}
      </Link>
      {link.onDismiss && (
        <ActionIcon
          className={styles.dismissButton}
          variant="subtle"
          size="sm"
          aria-label={`Hide ${link.label} shortcut`}
          onClick={link.onDismiss}
        >
          ×
        </ActionIcon>
      )}
    </div>
  );
}
