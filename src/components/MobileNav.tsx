"use client";
import { ArrowRight, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  const pathname = usePathname();
  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathname]);
  const closeOnCurrent = (href: string) => {
    if (pathname === href) toggleOpen();
  };
  return (
    <div className="sm:hidden">
      <Menu
        onClick={toggleOpen}
        className="relative z-50 h-5 w-5 text-zinc-700"
      />
      {isOpen ? (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
          <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {!isAuth ? (
              <>
                <li className="flex items-center w-full font-semibold text-green-600">
                  <Link
                    onClick={() => closeOnCurrent("/sign-up")}
                    href={"/sign-up"}
                  >
                    Get Started
                    <ArrowRight className="inline-block ml-2 h-5 w-5" />
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li className="flex items-center w-full font-semibold">
                  <Link
                    onClick={() => closeOnCurrent("/sign-in")}
                    href={"/sign-in"}
                  >
                    Sign In
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li className="flex items-center w-full font-semibold">
                  <Link
                    onClick={() => closeOnCurrent("/pricing")}
                    href={"/pricing"}
                  >
                    Pricing
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center w-full font-semibold">
                  <Link
                    onClick={() => closeOnCurrent("/dashboard")}
                    href={"/dashboard"}
                  >
                    Dashbaord
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li className="flex items-center w-full font-semibold">
                  <Link href={"/sign-out"}>Sign Out</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default MobileNav;
