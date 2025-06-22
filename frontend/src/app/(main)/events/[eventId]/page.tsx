"use client";

import { EventDetails } from './_components/EventDetails';
import { useEventDetailsViewModel } from './_viewmodels/useEventDetailsViewModel';

export default function EventDetailsPage() {
  const {
    event,
    isLoading,
    error,
    handleRegister,
    isRegistering,
    getStatusText,
    getStatusVariant,
    canRegister,
    isRegistered,
  } = useEventDetailsViewModel();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">イベントの読み込みに失敗しました</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <EventDetails
        event={event}
        handleRegister={handleRegister}
        isRegistering={isRegistering}
        getStatusText={getStatusText}
        getStatusVariant={getStatusVariant}
        canRegister={canRegister || false}
        isRegistered={isRegistered || false}
      />
    </div>
  );
} 