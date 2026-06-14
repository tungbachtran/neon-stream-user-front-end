import { PastStreamWatchPage } from "@/components/streams/past-stream-watch-page"; 

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PastStreamWatchRoute({ params }: PageProps) {
  const { id } = await params;

  return <PastStreamWatchPage streamId={id} />;
}