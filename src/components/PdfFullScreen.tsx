import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { Document, Page } from "react-pdf";
import { useToast } from "@/hooks/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PdfFullScreenProps {
  fileUrl: string;
}
const PdfFullScreen = ({ fileUrl }: PdfFullScreenProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>();
  const { width, ref } = useResizeDetector();
  const { toast } = useToast();
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button variant="ghost" className="gap-1.5" aria-label="full screen">
          <Expand className="w-4 h-4"></Expand>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <DialogTitle>
          <VisuallyHidden>PDF Fullscreen Viewer</VisuallyHidden>
        </DialogTitle>
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={ref}>
            <Document
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin my-24" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error loading PDF",
                  description: "Please try again later",
                  variant: "destructive",
                });
              }}
              file={fileUrl}
              className="max-h-full"
            >
              {new Array(numPages).fill(0).map((_, i) => {
                return (
                  <Page key={i} pageNumber={i + 1} width={width ? width : 1} />
                );
              })}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullScreen;
