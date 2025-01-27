import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import React, { createContext, ReactNode, useRef, useState } from "react";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};
export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});
interface Props {
  fileId: string;
  children: ReactNode;
}
export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const backupMessage = useRef("");
  const utils = trpc.useContext();
  const { toast } = useToast();
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ fileId, message }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.body;
    },
    onSuccess: async (data) => {
      setIsLoading(false);
      console.log("ai response : ", data);
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");
      await utils.getFileMessages.cancel();
      const previousMessages = utils.getFileMessages.getInfiniteData();
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) return { pages: [], pageParams: [] };
          let newPages = [...old.pages];
          let latestPage = newPages[0]!;
          latestPage.messages = [
            {
              _id: crypto.randomUUID(),
              file: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              user: crypto.randomUUID(),
            },
            ...latestPage.messages,
          ];
          newPages[0] = latestPage;
          return { ...old, pages: newPages };
        }
      );
      setIsLoading(true);
      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      );
    },
    onSettled: async () => {
      setIsLoading(false);
      await utils.getFileMessages.invalidate({ fileId });
    },
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  const addMessage = () => {
    sendMessage({ message });
  };
  return (
    <ChatContext.Provider
      value={{ addMessage, message, handleInputChange, isLoading }}
    >
      {children}
    </ChatContext.Provider>
  );
};
