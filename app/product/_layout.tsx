import { Stack } from 'expo-router';

export default function ProductLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen
        name="new"
        options={{
          title: 'Novo Produto',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Editar Produto',
        }}
      />
    </Stack>
  );
}
