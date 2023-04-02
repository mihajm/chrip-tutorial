import type { PropsWithChildren } from 'react';

export const PageLayout = ({children}: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center overflow-hidden">
      <div className="h-full w-full md:max-w-2xl border-x border-slate-400">
        {children}
      </div>
    </main>
  );
};