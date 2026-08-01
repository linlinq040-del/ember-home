import type { ReactNode } from 'react';
import { DesktopAppSidebar, type DesktopAppSidebarProps } from './DesktopAppSidebar';

type DesktopAppShellFrameProps = {
  desktopSidebarProps: DesktopAppSidebarProps;
  onReturnHome?: () => void;
  children: ReactNode;
};

export function DesktopAppShellFrame({
  desktopSidebarProps,
  onReturnHome,
  children
}: DesktopAppShellFrameProps) {
  return (
    <>
      <DesktopAppSidebar {...desktopSidebarProps} onReturnHome={onReturnHome} />
      <div className="app-stage">
        {children}
      </div>
    </>
  );
}
