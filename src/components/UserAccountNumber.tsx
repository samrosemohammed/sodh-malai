import { getUserSubscriptionPlan } from "@/lib/stripe";
import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Icons } from "./icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Gem, LogOut } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

interface UserAccountNumberProps {
  email: string | undefined;
  imgUrl: string;
  name: string;
}
const UserAccountNumber = async ({
  email,
  imgUrl,
  name,
}: UserAccountNumberProps) => {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="rounded-full h-8 w-8 aspect-square bg-slate-400">
          <Avatar className="relative w-8 h-8">
            {imgUrl ? (
              <div className="relative aspect-square h-full w-full">
                <Image
                  fill
                  src={imgUrl}
                  alt="profile picture"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <AvatarFallback className="flex items-center justify-center w-full h-full">
                <span className="sr-only">{name}</span>
                <Icons.user className="w-4 h-4 text-zinc-900" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            {name && (
              <span className="font-medium text-sm text-black">{name}</span>
            )}
            {email && (
              <p className="truncate w-[200px] text-xs text-zinc-700">
                {email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={"/dashboard"}>Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          {subscriptionPlan?.isSubscribed ? (
            <Link href={"/dashboard/billing"}>Manage Subscription</Link>
          ) : (
            <Link href={"/pricing"}>
              Upgrade <Gem className="text-blue-600 w-4 h-4 ml-1.5" />
            </Link>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <LogoutLink>
            <LogOut className="w-4 h-4 mr-1.5 inline-block" />
            Log Out
          </LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNumber;
