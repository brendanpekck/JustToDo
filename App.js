import React, {useEffect, useState} from "react";
import { StyleSheet, Text, View, ScrollView, Button, StatusBar, TouchableOpacity, Pressable, TextInput, FlatList, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import VectorIcons from "react-native-vector-icons/FontAwesome";
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

//stack navigation
const Stack = createNativeStackNavigator();
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
  //individual completed todo items
  const [completeTask, setCompleteTask] = useState("");
  //list of all completed todo items
  const [completeList, setCompleteList] = useState([]);

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
      const jsonValue = await AsyncStorage.getItem("compl");
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

  //mark individual item from list of todo items as complete
  const completedTask = async (value) => {
    try {
      removeData(value.id);
      await AsyncStorage.setItem("compl", JSON.stringify([...completeList, value]));
      setCompleteList([...completeList, value]);
    } catch (e) {
      console.log("mark error");
    }
  }

  //remove completed invidual items from list of completed todo items
  const removeComplete = async (key) => {
    try {
      const deleteItem = completeList.filter(item => item.id != key);
      setCompleteList(deleteItem);
      await AsyncStorage.setItem("compl", JSON.stringify(deleteItem));
    } catch (e) {
      console.log("remove complete error");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.basic}>
      <View style={styles.textHeader}>
          <Text style={styles.loginText}>Tasks</Text>
        </View>
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
          {/* mark todo item complete */}
          <TouchableOpacity onPress={() => {completedTask({id: item.id, item: item.item})}}>
              <VectorIcons name="check" color="#123456" size={70}/>
          </TouchableOpacity>
        </View>
      ))}
      {/* render out all completed todo items */}
      {completeList.map((item, id) => (
        <View key={id} style={styles.listItem}>
          <Text style={styles.textSize}>{item.item}</Text>
          {/* remove completed todo item */}
          <TouchableOpacity onPress={() => {removeComplete(item.id)}}>
              <VectorIcons name="remove" color="#123456" size={70}/>
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
      {/* button for user input pop up */}
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

function TabNavigator() {
  return (
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
  );
}

function SignInScreen({ navigation }) {
  //username
  const [username, setUsername] = useState("");
  //password
  const [password, setPassword] = useState("");
  //login state
  const [signIn, setSignIn] = useState(false);
  //sign in button state
  const [disabled, setDisabled] = useState(true);

  const getInfo = async (key) => {
    try {
      let test = await SecureStore.getItemAsync(key);
      console.log(test);
    } catch (e) {
      setSignIn(false);
    }
  }

  //authenticate user
  const checkInfo = async (key, value) => {
    try {
      let pword = await SecureStore.getItemAsync(key);
      if (pword == value) {
        setSignIn(true);
        navigation.navigate("TabNavigator");
      } else {
        setSignIn(false);
      }
    } catch (e) {
      setSignIn(false);
    }
  }

  useEffect(() => {
    if (username != "" && password != "") {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [username, password])

  return (
    <ScrollView contentContainerStyle={styles.basic}>
      <View style={styles.maxWidth}>
        <View style={styles.textHeader}>
          <Text style={styles.loginText}>Log into existing account.</Text>
        </View>
        <View style={styles.loginInput}>
          <TextInput placeholder="Username" defaultValue={username} onChangeText={username => setUsername(username)} style={styles.inputSize} maxLength={15}/>
        </View>
        <View style={styles.loginInput}>
          <TextInput placeholder="Password" defaultValue={password} onChangeText={password => setPassword(password)} style={styles.inputSize} secureTextEntry={true} selectTextOnFocus={true} maxLength={30}/>
        </View>
        {/* authenticate login info */}
        <View style={styles.loginButton}>
          <TouchableOpacity disabled={disabled} style={disabled? styles.disabledButton : styles.enabledButton} onPress={() => {checkInfo(username, password)}}>
              <VectorIcons name="arrow-circle-right" color="#123456" size={70}/>
          </TouchableOpacity>
        </View>
        <View style={styles.registerView}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => {navigation.navigate("SignUp")}}>
            <Text style={styles.registerLink}>Sign up.</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function SignUpScreen({ navigation }) {
  //username
  const [username, setUsername] = useState("");
  //password
  const [password, setPassword] = useState("");
  //confirm password
  const [passwordC, setPasswordC] = useState("");
  //sign up button state
  const [disabled, setDisabled] = useState(true);

  const storeInfo = async (key, value) => {
    try {
      if (password == passwordC) {
        await SecureStore.setItemAsync(key, value);
        navigation.navigate("TabNavigator");
      } else {
        Alert.alert("test", "test", [{test: "ok"}]);
      }
    } catch (e) {''
      console.log(key);
    }
  }

  useEffect(() => {
    if (username != "" && password != "" && passwordC != "") {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [username, password, passwordC])

  return (
    <ScrollView contentContainerStyle={styles.basic}>
      <View style={styles.maxWidth}>
        <View style={styles.textHeader}>
          <Text style={styles.loginText}>Create new account.</Text>
        </View>
        <View style={styles.loginInput}>
          <TextInput placeholder="Username" defaultValue={username} onChangeText={username => setUsername(username)} style={styles.inputSize} maxLength={20}/>
        </View>
        <View style={styles.loginInput}>
          <TextInput placeholder="Password" defaultValue={password} onChangeText={password => setPassword(password)} style={styles.inputSize} secureTextEntry={true} selectTextOnFocus={true} maxLength={30}/>
        </View>
        <View style={styles.loginInput}>
          <TextInput placeholder="Confirm Password" defaultValue={passwordC} onChangeText={password => setPasswordC(password)} style={styles.inputSize} secureTextEntry={true} selectTextOnFocus={true} maxLength={30}/>
        </View>
        <View style={styles.loginButton}>
          <TouchableOpacity disabled={disabled} style={disabled? styles.disabledButton : styles.enabledButton} onPress={() => {storeInfo(username, password)}}>
              <VectorIcons name="arrow-circle-right" color="#123456" size={70}/>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn" screenOptions={{headerShown: false}}>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
      </Stack.Navigator>
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

  enabledButton: {
    margin: 15
  },

  disabledButton: {
    margin: 15,
    opacity: 0.5
  },

  taskButton: {
    margin: 15
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
    fontSize: 18,
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
  },

  maxWidth: {
    width: "100%",
    color: "#f8f8f8",
    alignItems: "center",
    flexGrow: 1
  },

  loginInput: {
    padding: 5,
    marginTop: 10,
    width: "90%",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },

  loginButton: {
    width: "100%",
    alignItems: "flex-end",
  },

  textHeader: {
    width: "100%",
    padding: 20
  },

  loginText: {
    fontSize: 40,
    fontWeight: "bold"
  },

  registerView: {
    padding: 15,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    flexGrow: 1,
    alignItems: "flex-end"
  },

  registerText: {
    fontSize: 14
  },

  registerLink: {
    fontSize: 14,
    color: "#2771ba"
  }
});
