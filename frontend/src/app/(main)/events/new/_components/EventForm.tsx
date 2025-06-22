"use client";

import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Calendar, Tag, CreditCard } from "lucide-react";

interface EventFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  roleOptions: Array<{ value: string; label: string }>;
  addFeeSetting: () => void;
  removeFeeSetting: (index: number) => void;
  addPollCandidate: () => void;
  removePollCandidate: (index: number) => void;
  addTag: () => void;
  removeTag: (index: number) => void;
}

export const EventForm = ({
  onSubmit,
  isLoading,
  roleOptions,
  addFeeSetting,
  removeFeeSetting,
  addPollCandidate,
  removePollCandidate,
  addTag,
  removeTag,
}: EventFormProps) => {
  const form = useFormContext();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>イベントタイトル *</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 夏合宿" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <textarea 
                      placeholder="イベントの詳細な説明を入力してください"
                      className="min-h-[100px] w-full p-3 border rounded-md resize-vertical"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>会場 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 奥多摩" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 参加条件 */}
        <Card>
          <CardHeader>
            <CardTitle>参加条件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="allowedRoles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>参加可能な役割 *</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {roleOptions.map((role) => (
                        <Button
                          key={role.value}
                          type="button"
                          variant={field.value?.includes(role.value) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const currentRoles = field.value || [];
                            if (currentRoles.includes(role.value)) {
                              field.onChange(currentRoles.filter((r: string) => r !== role.value));
                            } else {
                              field.onChange([...currentRoles, role.value]);
                            }
                          }}
                        >
                          {role.label}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タグ</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {field.value?.map((tag: string, index: number) => (
                          <div key={index} className="flex items-center gap-1">
                            <Input
                              value={tag}
                              onChange={(e) => {
                                const newTags = [...(field.value || [])];
                                newTags[index] = e.target.value;
                                field.onChange(newTags);
                              }}
                              className="w-32"
                              placeholder="タグ名"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTag(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTag}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        タグを追加
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 料金設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              料金設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="feeSettings"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-4">
                      {field.value?.map((feeSetting: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">料金設定 {index + 1}</h4>
                            {field.value.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFeeSetting(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`feeSettings.${index}.applicableRole`}
                              render={({ field: roleField }) => (
                                <FormItem>
                                  <FormLabel>適用役割</FormLabel>
                                  <FormControl>
                                    <select
                                      {...roleField}
                                      className="w-full p-2 border rounded-md"
                                    >
                                      {roleOptions.map((role) => (
                                        <option key={role.value} value={role.value}>
                                          {role.label}
                                        </option>
                                      ))}
                                    </select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`feeSettings.${index}.applicableGeneration`}
                              render={({ field: genField }) => (
                                <FormItem>
                                  <FormLabel>適用世代（オプション）</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="例: 2023"
                                      {...genField}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`feeSettings.${index}.fee.amount`}
                              render={({ field: amountField }) => (
                                <FormItem>
                                  <FormLabel>金額（円）</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder="0"
                                      {...amountField}
                                      onChange={(e) => amountField.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addFeeSetting}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        料金設定を追加
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 日程調整 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              日程調整
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="pollCandidates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>日程候補 *</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value?.map((date: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => {
                              const newDates = [...(field.value || [])];
                              newDates[index] = e.target.value;
                              field.onChange(newDates);
                            }}
                          />
                          {field.value.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePollCandidate(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addPollCandidate}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        日程候補を追加
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "作成中..." : "イベントを作成"}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 