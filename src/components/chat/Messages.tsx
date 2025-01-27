"use client";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Loader2, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";
import { useContext } from "react";
import { ChatContext } from "./ChatContext";
interface MessageProps {
  fileId: string;
}
const Messages = ({ fileId }: MessageProps) => {
  const { isLoading: isAiThinking } = useContext(ChatContext);

  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    );
  console.log("data from the infinite query: ", data);
  const messages = data?.pages.flatMap((page) => page.messages);
  console.log("messages: ", messages);
  const loadingMessage = {
    user: "system",
    _id: "loading-message",
    file: "system",
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    ),
    isUserMessage: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ];
  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scroll-thumb-blue scrollbar-track-blue scrollbar-thumb-rounded scrollbar-lighter scrollbar-w-2 scrolling-touch">
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          const isNextMessageSamePerson =
            combinedMessages[i - 1]?.isUserMessage ===
            combinedMessages[i]?.isUserMessage;
          if (i === combinedMessages.length - 1) {
            return (
              <Message
                key={message._id}
                isNextMessageSamePerson={isNextMessageSamePerson}
                message={message}
              />
            );
          } else
            return (
              <Message
                key={message._id}
                isNextMessageSamePerson={isNextMessageSamePerson}
                message={message}
              />
            );
        })
      ) : isLoading ? (
        <div className="w-full flex flex-col gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
