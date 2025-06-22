"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Tag, CreditCard, Clock } from "lucide-react";

interface EventDetailsProps {
  event: any;
  handleRegister: () => void;
  isRegistering: boolean;
  getStatusText: (status: string) => string;
  getStatusVariant: (status: string) => any;
  canRegister: boolean;
  isRegistered: boolean;
}

export const EventDetails = ({
  event,
  handleRegister,
  isRegistering,
  getStatusText,
  getStatusVariant,
  canRegister,
  isRegistered,
}: EventDetailsProps) => {
  if (!event) return null;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={getStatusVariant(event.status)}>
              {getStatusText(event.status)}
            </Badge>
            <span className="text-gray-600">主催: {event.organizer.name}</span>
          </div>
        </div>
        
        {canRegister && !isRegistered && (
          <Button onClick={handleRegister} disabled={isRegistering}>
            {isRegistering ? "登録中..." : "参加登録"}
          </Button>
        )}
        
        {isRegistered && (
          <Badge variant="default">参加登録済み</Badge>
        )}
      </div>

      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <div>
              <h4 className="font-medium mb-2">説明</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{event.venue}</span>
          </div>
          
          {event.schedulePoll.finalizedDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>
                開催日時: {new Date(event.schedulePoll.finalizedDate).toLocaleString('ja-JP')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 参加条件 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            参加条件
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">参加可能な役割</h4>
            <div className="flex flex-wrap gap-2">
              {event.allowedRoles.map((role: string) => (
                <Badge key={role} variant="outline">
                  {role === 'CircleAdmin' && 'サークル管理者'}
                  {role === 'RegularMember' && '正規メンバー'}
                  {role === 'Alumni' && 'OB/OG'}
                  {role === 'External' && '外部参加者'}
                </Badge>
              ))}
            </div>
          </div>
          
          {event.tags && event.tags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">タグ</h4>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 料金設定 */}
      {event.feeSettings && event.feeSettings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              料金設定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {event.feeSettings.map((feeSetting: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">
                      {feeSetting.applicableRole === 'CircleAdmin' && 'サークル管理者'}
                      {feeSetting.applicableRole === 'RegularMember' && '正規メンバー'}
                      {feeSetting.applicableRole === 'Alumni' && 'OB/OG'}
                      {feeSetting.applicableRole === 'External' && '外部参加者'}
                    </span>
                    {feeSetting.applicableGeneration && (
                      <span className="text-gray-600 ml-2">
                        ({feeSetting.applicableGeneration}世代)
                      </span>
                    )}
                  </div>
                  <span className="font-bold">
                    ¥{feeSetting.fee.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 日程調整 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            日程調整
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">候補日</h4>
              <div className="space-y-1">
                {event.schedulePoll.candidateDates.map((date: string, index: number) => (
                  <div key={index} className="text-gray-700">
                    {new Date(date).toLocaleString('ja-JP')}
                  </div>
                ))}
              </div>
            </div>
            
            {event.schedulePoll.finalizedDate && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">確定日時</h4>
                <p className="text-green-700">
                  {new Date(event.schedulePoll.finalizedDate).toLocaleString('ja-JP')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 参加者一覧 */}
      {event.registrations && event.registrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              参加者一覧 ({event.registrations.length}人)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {event.registrations.map((registration: any) => (
                <div key={registration.registrationId} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{registration.user.name}</div>
                    <div className="text-sm text-gray-600">
                      {registration.user.generation}世代
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {new Date(registration.registeredAt).toLocaleDateString('ja-JP')}
                    </div>
                    <div className="font-medium">
                      ¥{registration.appliedFee.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 