import React from 'react';
import { StyleSheet, Text, View, ScrollView, Button, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import VectorIcons from 'react-native-vector-icons/FontAwesome';

const Tab = createBottomTabNavigator();

function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.basic}>
      <View>
        <Text>Home</Text>
      </View>
    </ScrollView>
  );
}

function CalendarScreen() {
  return (
    <ScrollView contentContainerStyle={styles.basic}>
      <View>
        <Text>Calendar</Text>
      </View>
    </ScrollView>
  );
}

function AccountScreen() {
  return (
    <ScrollView contentContainerStyle={styles.basic}>
      <View>
        <Text>Account</Text>
      </View>
    </ScrollView>
  );
}

function SettingScreen() {
  return (
    <ScrollView contentContainerStyle={styles.basic}>
      <View>
        <Text>Settings</Text>
      </View>
    </ScrollView>
  );
}

function App() {
  return (
    <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: "Home",
              tabBarIcon: ({focused}) => (<VectorIcons name="list" color={focused? "#ff6347": "#808080"} size={25}/>)
            }}
          />
          <Tab.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              tabBarLabel: "Calendar",
              tabBarIcon: ({focused}) => (<VectorIcons name="calendar" color={focused? "#ff6347": "#808080"} size={25}/>)
            }}
          />
          <Tab.Screen
            name="Account"
            component={AccountScreen}
            options={{
              tabBarLabel: "Account",
              tabBarIcon: ({focused}) => (<VectorIcons name="user-circle-o" color={focused? "#ff6347": "#808080"} size={28}/>)
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingScreen}
            options={{
              tabBarLabel: "Settings",
              tabBarIcon: ({focused}) => (<VectorIcons name="gear" color={focused? "#ff6347": "#808080"} size={30}/>)
            }}
          />
        </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  basic: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: StatusBar.currentHeight
  }
});
