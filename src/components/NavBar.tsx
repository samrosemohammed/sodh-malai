import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { ArrowRight } from "lucide-react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import UserAccountNumber from "./UserAccountNumber";
import MobileNav from "./MobileNav";

const NavBar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href={"/"} className="flex z-40 font-semibold text-sm">
            SodMalai.
          </Link>
          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <Link
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                  href={"/pricing"}
                >
                  Pricing
                </Link>
                <LoginLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Sign in
                </LoginLink>
                <RegisterLink className={buttonVariants({ size: "sm" })}>
                  Get Started <ArrowRight className="ml-1.5 w-5 h-5" />
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                  href={"/dashboard"}
                >
                  Dashboard
                </Link>
                <UserAccountNumber
                  name={
                    !user.given_name || !user.family_name
                      ? "Your account"
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email || ""}
                  imgUrl={user.picture || ""}
                />
              </>
            )}
          </div>
          {/* to do mobile navbar */}
          <MobileNav isAuth={!!user} />
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default NavBar;
