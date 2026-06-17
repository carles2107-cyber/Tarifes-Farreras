import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import NewsListScreen from './src/screens/NewsListScreen';

const Tab = createBottomTabNavigator();

function TodoScreen() {
  return <NewsListScreen />;
}

function MaderaScreen() {
  return <NewsListScreen category="madera" />;
}

function MueblesCocinaScreen() {
  return <NewsListScreen category="muebles_cocina" />;
}

function MueblesHogarScreen() {
  return <NewsListScreen category="muebles_hogar" />;
}

function FeriasMaquinariaScreen() {
  return <NewsListScreen category="ferias_maquinaria" />;
}

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#7a5230',
            tabBarInactiveTintColor: '#999',
            headerStyle: { backgroundColor: '#7a5230' },
            headerTintColor: '#fff',
          }}
        >
          <Tab.Screen
            name="Todo"
            component={TodoScreen}
            options={{ title: 'Todo' }}
          />
          <Tab.Screen
            name="Madera"
            component={MaderaScreen}
            options={{ title: 'Madera' }}
          />
          <Tab.Screen
            name="MueblesCocina"
            component={MueblesCocinaScreen}
            options={{ title: 'Muebles de cocina' }}
          />
          <Tab.Screen
            name="MueblesHogar"
            component={MueblesHogarScreen}
            options={{ title: 'Muebles de hogar' }}
          />
          <Tab.Screen
            name="FeriasMaquinaria"
            component={FeriasMaquinariaScreen}
            options={{ title: 'Ferias y maquinaria' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
