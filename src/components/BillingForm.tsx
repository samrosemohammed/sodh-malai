'use client';

import { trpc } from "@/app/_trpc/client";
import { useToast } from "@/hooks/use-toast";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface BillingFormProps {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}
export const BillingForm = ({subscriptionPlan} : BillingFormProps) => {
    const {toast} = useToast();
    const {mutate: createStripeSessions, isPending} = trpc.createStripeSessions.useMutation({
        onSuccess: ({url}) => {
            if (url) window.location.href = url;
            if (!url) {
                toast({
                    title: "Error",
                    description: "Failed to create billing session. Please try again.",
                    variant: "destructive",
                });
            }
        }
    })
    return <MaxWidthWrapper className="max-w-5xl">
        <form className="mt-12" onSubmit={(e) => {
            e.preventDefault();
            createStripeSessions();
        }}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Subscription Plan
                    </CardTitle>
                    <CardDescription>
                        You are currently on the <strong>{subscriptionPlan.name}</strong> plan.
                    </CardDescription>
                    <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
                        <Button type="submit">
                            {isPending ? <Loader2 className="mr-4 h-4 w-4 animate-spin"/>: null}
                            {subscriptionPlan.isSubscribed ? "Manage Subscription" : "Upgrade to Pro"}
                        </Button>
                        {subscriptionPlan.isSubscribed ? (<p className="rounded-full text-xs font-medium">
                            {subscriptionPlan.isCanceled ? "Your subscription is canceled. You can still access your files until the end of the billing period." : "You are subscribed to the Pro plan."}
                            {format(subscriptionPlan.stripeCurrentPeriodEnd!, "dd.MM.yyyy")}.
                        </p>) : null}
                    </CardFooter>
                </CardHeader>
            </Card>
        </form>
    </MaxWidthWrapper>
}