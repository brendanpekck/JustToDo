import React, {useEffect, useState} from "react";
import { StyleSheet, Text, View, ScrollView, Button, StatusBar, TouchableOpacity, Pressable, TextInput, FlatList, Alert, BackHandler } from "react-native";
import { NavigationContainer, useIsFocused, useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import VectorIcons from "react-native-vector-icons/FontAwesome";
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { SHA256 } from "crypto-es/lib/sha256";
import * as SQLite from "expo-sqlite";

//stack navigation
const Stack = createNativeStackNavigator();
//bottom tab navigation
const Tab = createBottomTabNavigator();
//store user id
let userID = -1;
//store username
let userName = "";
//sign in "token"
let signedIn = false;
//track finished task
let finishedTask = 0;
//track pending task
let pendingTask = 0;
//tasks count update switch
let taskUpdate = false;

//database
function openDatabase() {
  const db = SQLite.openDatabase("db.db");
  return db;
}
const db = openDatabase();


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
  //list of all completed todo items
  const [completeList, setCompleteList] = useState([]);
  //submit button state
  const [disabled, setDisabled] = useState(true);

  //add todo item to todo list
  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem("tasky", JSON.stringify([...taskList, value]));
      setTaskList([...taskList, value]);
      setTaskItem("");
      pendingTask++;
    } catch (e) {
      console.log("store error");
    }
  }

  const addItem = () => {
    db.transaction(
      (tx) => {
        tx.executeSql("")
      }
    )
  }

  //debug - get locally stored data - REMOVE
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
      pendingTask--;
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
      finishedTask++;
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
      finishedTask--;
    } catch (e) {
      console.log("remove complete error");
    }
  }
  
  useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "create table if not exists items (id integer foreign key references users(id), itemid integer primary key autoincrement, item varchar(50));"
        );
      }
    );
  }, [])

  useEffect(() => {
    if (taskItem != "") {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [taskItem])

  return (
    <ScrollView contentContainerStyle={styles.basic}>
      <View style={styles.textHeader}>
          <Text style={styles.smallerHeader}>Tasks</Text>
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
      {/* pop up for user input to add to list of todo items */}
      <View>
        <Modal isVisible={addModal} onBackButtonPress={() => setAddModal(false)} onBackdropPress={() => setAddModal(false)}>
          <View style={styles.generalModal}>
            {/* arrange input box and submit button next to each other */}
            <View style={styles.inlineTogether}>
              {/* take in user input */}
              <View style={styles.lineText}>
                <TextInput placeholder="Add new task" defaultValue={taskItem} onChangeText={newItem => setTaskItem(newItem)} style={styles.inputSize} maxLength={50}/>
              </View>
              {/* submit user input */}
              <View style={styles.lineButton}>
                <TouchableOpacity disabled={disabled} style={disabled? styles.disabledButton : styles.enabledButton} onPress={() => {storeData({id: taskID++, item: taskItem}); setAddModal(false);}}>
                  <VectorIcons name="arrow-circle-up" color="#2F2F2F" size={40}/>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      {/* pop up for user input to edit list of todo items */}
      <View>
        <Modal isVisible={editModal} onBackButtonPress={() => setEditModal(false)} onBackdropPress={() => setEditModal(false)}>
          <View style={styles.generalModal}>
            {/* arrange input box and submit button next to each other */}
            <View style={styles.inlineTogether}>
              {/* take in user input */}
              <View style={styles.lineText}>
                <TextInput placeholder="Edit task" defaultValue={taskItem} onChangeText={newItem => setTaskItem(newItem)} style={styles.inputSize} maxLength={50}/>
              </View>
              {/* submit user input */}
              <View style={styles.lineButton}>
                <TouchableOpacity disabled={disabled} style={disabled? styles.disabledButton : styles.enabledButton} onPress={() => {editData(editKey, taskItem); setEditModal(false);}}>
                    <VectorIcons name="arrow-circle-up" color="#2F2F2F" size={40}/>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      {/* button for user input pop up */}
      <View>
        <TouchableOpacity style={styles.taskButton} onPress={() => setAddModal(true)}>
            <VectorIcons name="plus-circle" color="#2F2F2F" size={70}/>
        </TouchableOpacity>
      </View>
      {/* render out all completed todo items */}
      {completeList.length > 0 ? <View style={styles.textHeader}><Text style={styles.smallerHeader}>Completed Tasks</Text></View> : null }
      {completeList.map((item, id) => (
          <View key={id} style={styles.listItem}>
            <Text style={styles.textSize}>{item.item}</Text>
            {/* remove completed todo item */}
            <TouchableOpacity onPress={() => {removeComplete(item.id)}}>
                <VectorIcons name="remove" color="#123456" size={70}/>
            </TouchableOpacity>
          </View>
      ))}
    </ScrollView>
  );
}

function AccountScreen({ navigation }) {
  const signOut = () => {
    userID = -1;
    userName = "";
    signedIn = false;
    navigation.navigate("SignIn");
  }

  const isFocused = useIsFocused();

  isFocused? taskUpdate = !taskUpdate : null;

  useEffect(() => {
  }, [taskUpdate])

  return (
    <ScrollView contentContainerStyle={styles.basic}>
      <View style={styles.textHeader}>
          <Text style={styles.smallerHeader}>Hi, {userName}</Text>
      </View>
      <View style={styles.inlineEvenly}>
        <View style={styles.statBox}>
          <View style={styles.numBox}>
            <Text style={styles.statNum}>{finishedTask}</Text>
          </View>
          <View style={styles.textBox}>
            <Text style={styles.statText}>Completed Tasks</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <View style={styles.numBox}>
            <Text style={styles.statNum}>{pendingTask}</Text>
          </View>
          <View style={styles.textBox}>
            <Text style={styles.statText}>Pending Tasks</Text>
          </View>
        </View>
      </View>
      <View style={styles.smallView}>
        <TouchableOpacity onPress={() => {signOut()}}>
          <Text style={styles.logoutLink}>Log out {userName}</Text>
        </TouchableOpacity>
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
        name="Test"
        component={TestScreen}
        options={{
          tabBarLabel: "Test",
          tabBarIcon: ({focused}) => (<VectorIcons name="user-circle-o" color={focused? "#ff6347": "#808080"} size={28}/>)
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
  //wrong username
  const [wrongName, setWrongName] = useState(false);
  //wrong password
  const [wrongPass, setWrongPass] = useState(false);

  //local storage
  /*
  //authenticate user
  const checkInfo = async (key, value) => {
    try {
      let pword = await SecureStore.getItemAsync(key);
      if (pword == value) {
        setSignIn(true);
        userName = key;
        navigation.navigate("TabNavigator");
      } else {
        setSignIn(false);
      }
    } catch (e) {
      setSignIn(false);
    }
  }
  */

  useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "create table if not exists users (id integer primary key autoincrement, uname varchar(30), pword varchar);"
        );
      }
    );
  }, [])

  useEffect(() => {
    if (username != "" && password != "") {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [username, password])

  useEffect(() => {
    setWrongName(false);
  }, [username])

  useEffect(() => {
    setWrongPass(false);
  }, [password])

  const checkUser = () => {
    db.transaction(
      (tx) => {
        tx.executeSql("select * from users where uname = ?", [username], (txObj, { rows }) => {
          if (rows.length > 0) {
            userID = rows.item(0).id;
            console.log(userID);
            setWrongName(false);
            const encryptPass = (SHA256(password)).toString();
            //tx.executeSql("insert into users (uname, pword) values (?, ?)", [name, encryptPass]);
            if (encryptPass == rows.item(0).pword) {
              setWrongPass(false);
              userName = username;
              signedIn = true;
              setUsername("");
              setPassword("");
              navigation.navigate("TabNavigator");
            } else {
              setWrongPass(true);
              console.log("wrongpassword");
            }
          } else {
            setWrongName(true);
            console.log("wrongusername");
          }
        });
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.basic}>
      <View style={styles.maxWidth}>
        <View style={styles.textHeader}>
          <Text style={styles.headerFont}>Log into existing account.</Text>
        </View>
        <View style={styles.loginInput}>
          <TextInput placeholder="Username" defaultValue={username} onChangeText={username => setUsername(username)} style={styles.inputSize} maxLength={15}/>
        </View>
        {wrongName? <View style={styles.errorText}><Text style={styles.errorFont}>There is no account with that username.</Text></View> : null}
        <View style={styles.loginInput}>
          <TextInput placeholder="Password" defaultValue={password} onChangeText={password => setPassword(password)} style={styles.inputSize} secureTextEntry={true} selectTextOnFocus={true} maxLength={30}/>
        </View>
        {wrongPass? <View style={styles.errorText}><Text style={styles.errorFont}>Incorrect password.</Text></View> : null}
        {/* authenticate login info */}
        <View style={styles.loginButton}>
          <TouchableOpacity disabled={disabled} style={disabled? styles.disabledButton : styles.enabledButton} onPress={() => {checkUser()}}>
              <VectorIcons name="arrow-circle-right" color="#123456" size={70}/>
          </TouchableOpacity>
        </View>
        <View style={styles.smallView}>
          <Text style={styles.smallText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => {navigation.navigate("SignUp")}}>
            <Text style={styles.smallLink}>Sign up</Text>
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
  //username in use
  const [nameTaken, setNameTaken] = useState(false);
  //password not matched
  const [mismatch, setMismatch] = useState(false);

  //local storage
  /*
  const storeInfo = async (key, value) => {
    try {
      if (password == passwordC) {
        await SecureStore.setItemAsync(key, value);
        userName = key;
        navigation.navigate("TabNavigator");
      } else {
        Alert.alert("test", "test", [{test: "ok"}]);
      }
    } catch (e) {
      console.log(key);
    }
  }
  */

  useEffect(() => {
    if (username != "" && password != "" && passwordC != "") {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [username, password, passwordC])

  useEffect(() => {
    setNameTaken(false);
  }, [username])

  useEffect(() => {
    setMismatch(false);
  }, [password, passwordC])

  const addUser = () => {
    db.transaction(
      (tx) => {
        tx.executeSql("select * from users where uname = ?", [username], (txObj, { rows }) => {
          if (rows.length == 0 && password == passwordC) {
            setNameTaken(false);
            setMismatch(false);
            const encryptPass = (SHA256(password)).toString();
            tx.executeSql("insert into users (uname, pword) values (?, ?)", [username, encryptPass]);
            userName = username;
            signedIn = true;
            setUsername("");
            setPassword("");
            setPasswordC("");
            navigation.navigate("TabNavigator");
          } else {
            if (rows.length > 0) {
              setNameTaken(true);
              console.log("nametaken");
            }
            if (password != passwordC){
              setMismatch(true);
              console.log("passwordmismatch");
            }
          }
        });
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.basic}>
      <View style={styles.maxWidth}>
        <View style={styles.textHeader}>
          <Text style={styles.headerFont}>Create new account.</Text>
        </View>
        <View style={styles.loginInput}>
          <TextInput placeholder="Username" defaultValue={username} onChangeText={username => setUsername(username)} style={styles.inputSize} maxLength={20}/>
        </View>
        {nameTaken? <View style={styles.errorText}><Text style={styles.errorFont}>A user with that username already exists.</Text></View> : null}
        <View style={styles.loginInput}>
          <TextInput placeholder="Password" defaultValue={password} onChangeText={password => setPassword(password)} style={styles.inputSize} secureTextEntry={true} selectTextOnFocus={true} maxLength={30}/>
        </View>
        {mismatch? <View style={styles.errorText}><Text style={styles.errorFont}>Password does not match.</Text></View> : null}
        <View style={styles.loginInput}>
          <TextInput placeholder="Confirm Password" defaultValue={passwordC} onChangeText={password => setPasswordC(password)} style={styles.inputSize} secureTextEntry={true} selectTextOnFocus={true} maxLength={30}/>
        </View>
        {mismatch? <View style={styles.errorText}><Text style={styles.errorFont}>Password does not match.</Text></View> : null}
        <View style={styles.loginButton}>
          <TouchableOpacity disabled={disabled} style={disabled? styles.disabledButton : styles.enabledButton} onPress={() => {addUser()}}>
              <VectorIcons name="arrow-circle-right" color="#123456" size={70}/>
          </TouchableOpacity>
        </View>
        <View style={styles.smallView}>
          <Text style={styles.smallText}>Have an account? </Text>
          <TouchableOpacity onPress={() => {navigation.navigate("SignIn")}}>
            <Text style={styles.smallLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function TestScreen() {}

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

  enabledButton: {
    opacity: 1
  },

  disabledButton: {
    opacity: 0.5
  },

  taskButton: {
    marginTop: 5,
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

  inlineEvenly: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    flexGrow: 1
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
    margin: 5,
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
    padding: 15
  },

  textHeader: {
    width: "100%",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20
  },

  headerFont: {
    fontSize: 40,
    fontWeight: "bold"
  },

  smallView: {
    padding: 15,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    flexGrow: 1,
    alignItems: "flex-end"
  },

  smallText: {
    fontSize: 14
  },

  smallLink: {
    fontSize: 14,
    color: "#2771ba"
  },

  logoutLink: {
    fontSize: 14,
    color: "#ba2727"
  },

  smallerHeader: {
    fontSize: 30,
    fontWeight: "bold"
  },

  itemCenter: {
    padding: 20,
    margin: 5,
    width: "90%",
    borderRadius: 10,
    backgroundColor: "#c2d9f0",
    alignItems: "center"
  },

  statBox: {
    width: "45%",
    height: "30%",
    backgroundColor: "#ffffff",
    borderRadius: 10
  },
  
  numBox: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  textBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10
  },
  
  statNum: {
    fontSize: 30,
    fontWeight: "bold"
  },

  statText: {
    fontSize: 14,
    opacity: 0.7
  },

  errorText: {
    width: "90%"
  },

  errorFont: {
    fontSize: 14,
    color: "#ba2727"
  }
});