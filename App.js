import React, {useEffect, useState} from "react";
import { StyleSheet, Text, View, ScrollView, Button, StatusBar, TouchableOpacity, Pressable, TextInput, FlatList } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator, useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import VectorIcons from "react-native-vector-icons/FontAwesome";
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';

//bottom tab navigation
const Tab = createBottomTabNavigator();
//initialize todo item's id
let taskID = 0;

//home screen/list of todo items
function HomeScreen() {
  //add todo item pop up
  const [addModal, setAddModal] = useState(false);
  //edit todo item pop up
  const [editModal, setEditModal] = useState(false);
  //store item id to be edited
  const [editKey, setEditKey] = useState("");
  //individual todo items
  const [taskItem, setTaskItem] = useState("");
  //list of all todo items
  const [taskList, setTaskList] = useState([]);

  //store data locally
  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem("tasky", JSON.stringify([...taskList, value]));
      setTaskList([...taskList, value]);
      setTaskItem("");
    } catch (e) {
      console.log("store error");
    }
  }

  //get locally stored data
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("tasky");
      console.log(jsonValue);
      return jsonValue != null? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log("retrieve error");
    }
  }

  //"remove" individual item from list of todo items
  const removeData = async (key) => {
    try {
      const deleteItem = taskList.filter(item => item.id != key);
      setTaskList(deleteItem);
      await AsyncStorage.setItem("tasky", JSON.stringify(deleteItem));
    } catch (e) {
      console.log("delete error");
    }
  }

  //"edit" individual item from list of todo items
  const editData = async (key, value) => {
    try {
      const deletedItem = taskList.filter(item => item.id != key);
      const replaceItem = [...deletedItem.slice(0, key), {id: key, item: value}, ...deletedItem.slice(key)];
      setTaskList(replaceItem);
      await AsyncStorage.setItem("tasky", JSON.stringify(replaceItem));
    } catch (e) {
      console.log("edit error");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.basic}>
      {/* render out all todo items */}
      {taskList.map((item, id) => (
        <View key={id} style={styles.listItem}>
          <Text style={styles.textSize}>{item.item}</Text>
          {/* remove todo item */}
          <TouchableOpacity onPress={() => {removeData(item.id)}}>
              <VectorIcons name="remove" color="#123456" size={70}/>
          </TouchableOpacity>
          {/* edit todo item */}
          <TouchableOpacity onPress={() => {setEditKey(item.id); setEditModal(true)}}>
              <VectorIcons name="edit" color="#123456" size={70}/>
          </TouchableOpacity>
        </View>
      ))}
      {/* pop up for user input to add to list of todo items */}
      <View>
        <Modal isVisible={addModal}>
          <View style={styles.generalModal}>
            {/* arrange input box and submit button next to each other */}
            <View style={styles.inlineTogether}>
              {/* take in user input */}
              <View style={styles.lineText}>
                <TextInput placeholder="Add new task" defaultValue={taskItem} onChangeText={newItem => setTaskItem(newItem)} style={styles.inputSize}/>
              </View>
              {/* submit user input */}
              <View style={styles.lineButton}>
                <TouchableOpacity onPress={() => {storeData({id: taskID++, item: taskItem}); setAddModal(false);}}>
                  <View>
                    <VectorIcons name="arrow-circle-up" color="#2F2F2F" size={40}/>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      {/* pop up for user input to edit list of todo items */}
      <View>
        <Modal isVisible={editModal}>
          <View style={styles.generalModal}>
            {/* arrange input box and submit button next to each other */}
            <View style={styles.inlineTogether}>
              {/* take in user input */}
              <View style={styles.lineText}>
                <TextInput placeholder="Add new task" defaultValue={taskItem} onChangeText={newItem => setTaskItem(newItem)} style={styles.inputSize}/>
              </View>
              {/* submit user input */}
              <View style={styles.lineButton}>
                <TouchableOpacity onPress={() => {editData(editKey, taskItem); setEditModal(false);}}>
                  <View>
                    <VectorIcons name="arrow-circle-up" color="#2F2F2F" size={40}/>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      {/* pop up to take in user input */}
      <View style={styles.botCen}>
        <TouchableOpacity style={styles.taskButton} onPress={() => setAddModal(true)}>
            <VectorIcons name="plus-circle" color="#2F2F2F" size={70}/>
        </TouchableOpacity>
        {/* debug - check local storage - REMOVE */}
        <TouchableOpacity style={styles.taskButton} onPress={() => {getData()}}>
            <VectorIcons name="glass" color="#123456" size={70}/>
        </TouchableOpacity>
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

//styles
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
