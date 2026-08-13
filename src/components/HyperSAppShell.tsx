// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getReferenceString, formatHumanName } from '@medplum/core';
import { ActionIcon, AppShell as MantineAppShell, Badge, Divider, Group, Menu, ScrollArea, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { spotlight } from '@mantine/spotlight';
import type { NavbarLink, NavbarMenu, SpotlightLinkAction } from '@medplum/react';
import { ResourceAvatar, Spotlight, useMedplum, useMedplumProfile, useNotificationCount } from '@medplum/react';
import { IconChevronDown, IconMenu2, IconSearch, IconSettings, IconLogout } from '@tabler/icons-react';
import type { JSX, ReactNode } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { HyperSLogo } from '../brand/HyperSLogo';
import styles from './HyperSAppShell.module.css';

export interface HyperSAppShellProps {
  readonly children: ReactNode;
  readonly pathname?: string;
  readonly searchParams?: URLSearchParams;
  readonly menus?: NavbarMenu[];
  readonly spotlightActions?: SpotlightLinkAction[];
}

export function HyperSAppShell(props: HyperSAppShellProps): JSX.Element {
  const profile = useMedplumProfile();

  // Auth pages intentionally render without the authenticated navigation shell.
  if (!profile) {
    return <>{props.children}</>;
  }

  return <AuthenticatedHyperSAppShell {...props} profile={profile} />;
}

interface AuthenticatedHyperSAppShellProps extends HyperSAppShellProps {
  readonly profile: NonNullable<ReturnType<typeof useMedplumProfile>>;
}

function AuthenticatedHyperSAppShell({ children, menus, spotlightActions, profile }: AuthenticatedHyperSAppShellProps): JSX.Element {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const location = useLocation();
  const [navbarOpen, setNavbarOpen] = useState(true);
  const project = medplum.getProject();
  const projectDisplay = project?.name ?? medplum.getActiveLogin()?.project.display;
  const profileDisplay = formatHumanName(profile.name?.[0]) || medplum.getActiveLogin()?.profile.display || 'Account';

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
              aria-controls="hypers-primary-navigation"
              onClick={toggleNavbar}
            >
              <IconMenu2 size={20} />
            </ActionIcon>
          </Tooltip>
          <UnstyledButton className={styles.logoButton} onClick={toggleNavbar} aria-label="HyperS navigation">
            <HyperSLogo size={28} withWordmark />
          </UnstyledButton>
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
                  <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => navigate(`/${getReferenceString(profile)}`)}>
                    Account settings
                  </Menu.Item>
                  <Menu.Item leftSection={<IconLogout size={16} />} onClick={() => { signOut().catch(console.error); }}>
                    Sign out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </div>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar id="hypers-primary-navigation" className={styles.navbar} aria-label="Primary navigation">
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
                    <HyperSNavLink key={link.href} link={link} pathname={location.pathname} onNavigate={closeNavbarOnMobile} />
                  ))}
                </Stack>
              </div>
            ))}
            <Divider my="sm" />
            <Text size="xs" c="dimmed" ta="center" px="sm">
              HyperS Clinical Management
            </Text>
          </Stack>
        </ScrollArea>
      </MantineAppShell.Navbar>

      <MantineAppShell.Main className={styles.main}>
        {children}
      </MantineAppShell.Main>

      {spotlightActions && spotlightActions.length > 0 && <Spotlight patientsOnly staticActions={spotlightActions} />}
    </MantineAppShell>
  );
}

interface HyperSNavLinkProps {
  readonly link: NavbarLink;
  readonly pathname: string;
  readonly onNavigate: () => void;
}

function HyperSNavLink(props: HyperSNavLinkProps): JSX.Element {
  const notificationCount = props.link.notificationCount;
  if (notificationCount) {
    return <HyperSNotificationNavLink {...props} notificationCount={notificationCount} />;
  }

  return <HyperSNavLinkContent {...props} />;
}

interface HyperSNotificationNavLinkProps extends HyperSNavLinkProps {
  readonly notificationCount: NonNullable<NavbarLink['notificationCount']>;
}

function HyperSNotificationNavLink({ notificationCount, ...props }: HyperSNotificationNavLinkProps): JSX.Element {
  const count = useNotificationCount(notificationCount);
  return <HyperSNavLinkContent {...props} count={count} />;
}

interface HyperSNavLinkContentProps extends HyperSNavLinkProps {
  readonly count?: number;
}

function HyperSNavLinkContent({ link, pathname, onNavigate, count }: HyperSNavLinkContentProps): JSX.Element {
  const active = pathname === link.href.split('?')[0] || (pathname.startsWith(`${link.href.split('?')[0]}/`) && link.href !== '/');

  return (
    <div className={styles.navLinkRow}>
      <Link className={styles.navLink} to={link.href} data-active={active || undefined} aria-current={active ? 'page' : undefined} onClick={onNavigate}>
        <span className={styles.navIcon}>{link.icon}</span>
        <span className={styles.navLabel}>{link.label}</span>
        {count !== undefined && count > 0 && <Badge size="sm" circle color="blue">{count}</Badge>}
        {link.count !== undefined && link.count > 0 && <Badge size="sm" circle color={link.alert ? 'red' : 'blue'}>{link.count}</Badge>}
      </Link>
      {link.onDismiss && (
        <ActionIcon className={styles.dismissButton} variant="subtle" size="sm" aria-label={`Hide ${link.label} shortcut`} onClick={link.onDismiss}>
          ×
        </ActionIcon>
      )}
    </div>
  );
}
