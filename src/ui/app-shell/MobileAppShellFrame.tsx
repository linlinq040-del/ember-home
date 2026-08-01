import type { ReactNode } from 'react';
import { AppTopbar, type AppTopbarProps } from '../shell/AppTopbar';

type MobileAppShellFrameProps = {
  topbarProps: AppTopbarProps;
  onReturnHome?: () => void;
  children: ReactNode;
};

export function MobileAppShellFrame({
  topbarProps,
  onReturnHome,
  children
}: MobileAppShellFrameProps) {
  return (
    <div className="app-stage">
      <AppTopbar {...topbarProps} onReturnHome={onReturnHome} />
      {children}
    </div>
  );
}
