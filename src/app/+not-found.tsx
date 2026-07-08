import { Stack, router } from 'expo-router';

import { MessageScreen } from '@/components/message-screen';

/** Branded fallback for any unmatched route (instead of a raw 404). */
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Pagina non trovata' }} />
      <MessageScreen
        title="Pagina non trovata"
        message="La pagina che cerchi non esiste o è stata spostata."
        actionLabel="TORNA ALLA HOME"
        onAction={() => router.replace('/')}
      />
    </>
  );
}
