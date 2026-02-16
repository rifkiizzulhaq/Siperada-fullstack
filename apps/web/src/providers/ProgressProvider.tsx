"use client";

import { useEffect, Suspense } from "react";
import NProgress from "nprogress";
import { usePathname, useSearchParams } from "next/navigation";
import "nprogress/nprogress.css";

function Progress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 500); 
    return () => clearTimeout(timer);
  }, []); 

  useEffect(() => {
    NProgress.done();
    return () => {
      NProgress.start();
    };
  }, [pathname, searchParams]); 

  return null;
}

export const NextProgress = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Suspense fallback={null}>
        <Progress />
      </Suspense>
      {children}
    </>
  );
};
