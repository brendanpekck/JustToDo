import React, {useState} from "react";
import { StyleSheet, Text, View, ScrollView, Button, StatusBar, TouchableOpacity, Pressable, TextInput, FlatList } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator, useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import VectorIcons from "react-native-vector-icons/FontAwesome";
import Modal from "react-native-modal";

const Tab = createBottomTabNavigator();
let taskID = 0;

function HomeScreen() {
  const [modalVisibility, setModalVisibility] = useState(false);
  const [taskItem, setTaskItem] = useState("");
  const [taskList, setTaskList] = useState([]);
  return (
    <ScrollView contentContainerStyle={styles.basic}>
      {taskList.map((item, id) => (
        <View key={id} style={styles.listItem}>
          <Text style={styles.textSize}>{item.item}</Text>
        </View>
      ))}
      <View>
        <Modal isVisible={modalVisibility}>
          <View style={styles.generalModal}>
            <View style={styles.inlineTogether}>
              <View style={styles.lineText}>
                <TextInput placeholder="Add new task" defaultValue={taskItem} onChangeText={newItem => setTaskItem(newItem)} style={styles.inputSize}/>
              </View>
              <View style={styles.lineButton}>
                <TouchableOpacity onPress={() => {setTaskList([...taskList, { id: taskID++, item: taskItem }]); setModalVisibility(false)}}>
                  <View>
                    <VectorIcons name="arrow-circle-up" color="#2F2F2F" size={40}/>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <View style={styles.botCen}>
        <TouchableOpacity style={styles.taskButton} onPress={() => setModalVisibility(true)}>
            <VectorIcons name="plus-circle" color="#2F2F2F" size={70}/>
        </TouchableOpacity>
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
            tabBarShowLabel: false,
            tabBarStyle: {
              height: 50
            }
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
    paddingTop: StatusBar.currentHeight,
    alignItems: "center",
    flexGrow: 1
  },

  botCen: {
    justifyContent: "flex-end",
    flex: 1
  },

  taskButton: {
    margin: 10
  },

  generalModal: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20
  },

  inlineTogether: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  lineText: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    width: "83%"
  },

  lineButton: {
    flex: 1,
    width: "17%",
    alignItems: "flex-end",
    justifyContent: "center"
  },

  inputSize: {
    fontSize: 20,
    padding: 15
  },

  textSize: {
    fontSize: 20
  },

  listItem: {
    padding: 20,
    marginTop: 10,
    width: "90%",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  }
});
