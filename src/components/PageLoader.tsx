import {LoadingOverlay} from './_loader.template';

export default function PageLoader() {
  return (
    <main className="h-full p-4">
      <section className="relative flex h-full min-h-0 flex-col">
        <LoadingOverlay isLoading showDelay={0} spinnerDelay={0} fadeDuration={120} />
      </section>
    </main>
  );
}

