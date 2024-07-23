import { PropsWithChildren } from 'react';

function RootLayout({ children }: PropsWithChildren) {
  return (
    <div id="root" className="mx-auto flex min-h-screen max-w-[1440px] flex-col sm:max-w-[360px]">
      <div className="flex flex-1 gap-4">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default RootLayout;
