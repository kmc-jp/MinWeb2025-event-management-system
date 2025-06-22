"use client";

import { FormProvider } from 'react-hook-form';
import { EventForm } from './_components/EventForm';
import { useCreateEventViewModel } from './_viewmodels/useCreateEventViewModel';

export default function CreateEventPage() {
  const {
    form,
    onSubmit,
    isLoading,
    roleOptions,
    addFeeSetting,
    removeFeeSetting,
    addPollCandidate,
    removePollCandidate,
    addTag,
    removeTag,
  } = useCreateEventViewModel();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">新規イベント作成</h1>
        <p className="text-gray-600">新しいイベントを作成して、参加者を募集しましょう</p>
      </div>

      <FormProvider {...form}>
        <EventForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          roleOptions={roleOptions}
          addFeeSetting={addFeeSetting}
          removeFeeSetting={removeFeeSetting}
          addPollCandidate={addPollCandidate}
          removePollCandidate={removePollCandidate}
          addTag={addTag}
          removeTag={removeTag}
        />
      </FormProvider>
    </div>
  );
} 