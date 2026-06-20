import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Chat from "@/components/Chat";
import DocumentUploader from "@/components/Chat/DocumentUploader";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export default function AppPage() {
    const { id: sessionId } = useParams();
    const [showDesktopDocs, setShowDesktopDocs] = useState(true);
    const [showMobileDocs, setShowMobileDocs] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleToggleDocs = () => {
        if (isMobile) {
            setShowMobileDocs(true);
        } else {
            setShowDesktopDocs(!showDesktopDocs);
        }
    };

    return (
        <section className="flex w-full min-h-full h-[calc(100dvh-52px)] overflow-hidden">
            <div className="flex-1 min-w-0">
               <Chat onToggleDocs={handleToggleDocs} />
            </div>
            
            {/* Desktop side panel */}
            {!isMobile && showDesktopDocs && (
                <div className="w-80 md:w-96 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 h-full overflow-y-auto bg-white dark:bg-gray-900 transition-all duration-300">
                    <DocumentUploader key={sessionId || '__new__'} sessionId={sessionId} />
                </div>
            )}

            {/* Mobile sheet */}
            {isMobile && (
                <Sheet open={showMobileDocs} onOpenChange={setShowMobileDocs}>
                    <SheetContent side="right" className="w-full sm:w-96 p-0 border-l border-gray-200 dark:border-gray-800">
                        <SheetTitle className="sr-only">Documents</SheetTitle>
                        <div className="h-full overflow-y-auto">
                            <DocumentUploader key={sessionId || '__new__'} sessionId={sessionId} />
                        </div>
                    </SheetContent>
                </Sheet>
            )}
        </section>
    );
}