import {useEffect, useState} from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  isFetching?: boolean;
  showDelay?: number;
  fadeDuration?: number;
  spinnerDelay?: number;
  blockPointerEvents?: boolean;
}

export const LoadingOverlay = ({
  isLoading,
  isFetching = false,
  showDelay = 250,
  fadeDuration = 200,
  spinnerDelay = 400,
  blockPointerEvents = true,
}: LoadingOverlayProps) => {
  const shouldShow = isLoading || isFetching;
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    if (shouldShow) {
      setIsMounted(true);
      showTimer = setTimeout(() => setIsVisible(true), showDelay);
    } else {
      setIsVisible(false);
      hideTimer = setTimeout(() => setIsMounted(false), fadeDuration);
    }

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [shouldShow, showDelay, fadeDuration]);

  useEffect(() => {
    let spinnerTimer: ReturnType<typeof setTimeout> | null = null;

    if (isVisible) {
      spinnerTimer = setTimeout(() => setShowSpinner(true), spinnerDelay);
    } else {
      setShowSpinner(false);
    }

    return () => {
      if (spinnerTimer) clearTimeout(spinnerTimer);
    };
  }, [isVisible, spinnerDelay]);

  if (!isMounted) return null;

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-onyx-100/80 backdrop-blur-sm transition-opacity ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transitionDuration: `${fadeDuration}ms`,
        pointerEvents: blockPointerEvents && isVisible ? 'auto' : 'none',
      }}
    >
      {showSpinner ? (
        <div className="flex flex-col items-center gap-3 transition-opacity duration-300">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-onyx-200 border-t-onyx-700" />
        </div>
      ) : null}
    </div>
  );
};

