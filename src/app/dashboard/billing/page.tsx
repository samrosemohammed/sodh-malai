"use client";

import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface BillingFormProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}
const Page = ({ subscriptionPlan }: BillingFormProps) => {
  console.log(subscriptionPlan);
  const { toast } = useToast();
  const { mutate: createStripeSessions, isPending } =
    trpc.createStripeSessions.useMutation({
      onSuccess: ({ url }) => {
        if (url) window.location.href = url;
        if (!url) {
          toast({
            title: "There was a prblem...",
            description: "Please try again in a moment",
            variant: "destructive",
          });
        }
      },
    });
  return (
    <MaxWidthWrapper className="max-w-5xl">
      <form
        action=""
        className="mt-12"
        onSubmit={(e) => {
          e.preventDefault();
          createStripeSessions();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription Title</CardTitle>
            <CardDescription>
              You are currently on the <strong>{subscriptionPlan?.name}</strong>{" "}
              plan.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button type="submit">
              {isPending ? (
                <Loader2 className="mr-4 h-4 w-4 animate-spin" />
              ) : null}
              {subscriptionPlan?.isSubscribed
                ? "Manage Subscription"
                : "Upgrade to pro"}
            </Button>
            {subscriptionPlan?.isSubscribed ? (
              <p className="rounded-full text-xs font-medium">
                {subscriptionPlan.isCanceled
                  ? "Your plan will be canceled on "
                  : "Your plan renews on"}
                {format(subscriptionPlan.stripeCurrentPeriodEnd!, "dd.MM.yyyy")}
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  );
};

export default Page;
