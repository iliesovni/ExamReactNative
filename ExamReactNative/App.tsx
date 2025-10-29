import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import BookFormModal from './app/(tabs)/BookFormModal';
import Index from './app/index';

export type RootStackParamList = {
  Home: undefined;
  BookFormModal: { mode?: 'add' | 'edit'; book?: any; onSaved?: () => Promise<void> } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Index} options={{ headerShown: false }} />
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="BookFormModal" component={BookFormModal} options={{ title: 'Ajouter / Éditer un livre' }} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}