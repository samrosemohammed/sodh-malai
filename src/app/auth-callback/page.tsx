import { Suspense } from "react";
import { AuthCallbackInner } from "./AuthCallbackInner";

const Page = () => {
  return (<Suspense fallback={<div>Loading...</div>}>
    <AuthCallbackInner/>
  </Suspense>)
};

export default Page;
