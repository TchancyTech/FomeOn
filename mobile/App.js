
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';

function HomeScreen({ navigation }) {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>FomeOn</Text>
      <Button title="Voir restaurants" onPress={()=>navigation.navigate('Restaurants')} />
    </View>
  );
}

function RestaurantsScreen() {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>Liste restaurants (MVP)</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Restaurants" component={RestaurantsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
