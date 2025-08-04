import ChatRoomFeature from '@/features/chat/ChatRoomFeature';

interface ChatRoomPageProps {
  params: {
    roomId: string;
  };
}

export default function ChatRoomPage({ params }: ChatRoomPageProps) {
  return <ChatRoomFeature roomId={params.roomId} />;
}