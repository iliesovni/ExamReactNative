import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="book/[id]" options={{ headerShown: true, title: 'Détail du livre' }} />
      <Stack.Screen
        name="(tabs)/BookFormModal"
        options={{ presentation: 'modal', headerShown: true, title: 'Ajouter / Éditer un livre' }}
      />
    </Stack>
  );
}