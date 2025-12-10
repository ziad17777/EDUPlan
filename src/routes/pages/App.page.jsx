import Chat from "@/components/Chat";
import DocumentUploader from "@/components/Chat/DocumentUploader";

export default function AppPage() {
    return (
        <section className=" grid  grid-rows-1 grid-cols-4 w-full min-h-full  h-full ">
            <Chat />
            <div className="hidden md:flex  col-span-1 col-start-4  w-full ">
                <DocumentUploader />
            </div>
        </section>
    );
}