"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Users, Settings } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">イベント管理システム</h1>
        <p className="text-gray-600">サークル内利用を想定したイベント管理システム</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              イベント一覧
            </CardTitle>
            <CardDescription>作成済みのイベントを確認できます</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/events')}
              className="w-full"
            >
              イベント一覧を見る
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              新規イベント作成
            </CardTitle>
            <CardDescription>新しいイベントを作成して参加者を募集しましょう</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/events/new')}
              className="w-full"
            >
              イベントを作成
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              マイイベント
            </CardTitle>
            <CardDescription>自分が参加登録したイベントを確認できます</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline"
              onClick={() => router.push('/events?filter=my')}
              className="w-full"
            >
              マイイベントを見る
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              設定
            </CardTitle>
            <CardDescription>アカウント設定やシステム設定を行えます</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline"
              onClick={() => router.push('/settings')}
              className="w-full"
            >
              設定を開く
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 