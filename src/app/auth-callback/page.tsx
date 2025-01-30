"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  // Perform the query
  const { data, isLoading, isSuccess, error } = trpc.authCallback.useQuery(
    undefined,
    {
      retry: true,
      retryDelay: 500,
    }
  );

  // Handle success with useEffect
  useEffect(() => {
    if (isSuccess && data) {
      console.log("Query successful! User data:", data);
      router.push(origin ? `/${origin}` : "/dashboard");
    } else if (error && data) {
      console.error("Query failed! Error:", error.message);
      if (error.data?.code === "UNAUTHORIZED") router.push("/sign-in");
    }
  }, [isSuccess, error, router, origin, data]);

  return (
    isLoading && (
      <div className="w=full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
          <h3 className="text-xl font-semibold">Setting up your account...</h3>
          <p>You will be redirected automatically.</p>
        </div>
      </div>
    )
  );
};

export default Page;
