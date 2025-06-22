"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

// モックデータ（後でAPIから取得）
const mockEvents = [
  {
    id: "event_1",
    title: "新歓合宿",
    finalizedDate: "2024-04-01T10:00:00Z",
    status: "CONFIRMED",
    organizerName: "田中太郎"
  },
  {
    id: "event_2",
    title: "夏合宿",
    finalizedDate: null,
    status: "DRAFT",
    organizerName: "佐藤花子"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return <Badge variant="default">確定済み</Badge>;
    case 'DRAFT':
      return <Badge variant="secondary">下書き</Badge>;
    case 'SCHEDULE_POLLING':
      return <Badge variant="outline">日程調整中</Badge>;
    case 'FINISHED':
      return <Badge variant="secondary">終了済み</Badge>;
    case 'CANCELLED':
      return <Badge variant="destructive">キャンセル済み</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function EventsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">イベント一覧</h1>
          <p className="text-gray-600">作成済みのイベントを確認できます</p>
        </div>
        <Button 
          onClick={() => router.push('/events/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          新規作成
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/events/${event.id}`)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                {getStatusBadge(event.status)}
              </div>
              <CardDescription>
                主催: {event.organizerName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {event.finalizedDate ? (
                <p className="text-sm text-gray-600">
                  開催日: {new Date(event.finalizedDate).toLocaleDateString('ja-JP')}
                </p>
              ) : (
                <p className="text-sm text-gray-500">日程未定</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {mockEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">まだイベントが作成されていません</p>
          <Button onClick={() => router.push('/events/new')}>
            最初のイベントを作成
          </Button>
        </div>
      )}
    </div>
  );
} 