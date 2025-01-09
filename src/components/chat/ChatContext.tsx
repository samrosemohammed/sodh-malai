import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import React, { createContext, useState } from "react";

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
  children: React.ReactNode;
}
export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
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
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  const addMessage = () => {
    sendMessage({ message });
  };
  return (
    <ChatContextProvider
      value={{ addMessage, message, handleInputChange, isLoading }}
    >
      {children}
    </ChatContextProvider>
  );
};
