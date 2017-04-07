import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  TextInput,
  TouchableHighlight,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Expo, { Permissions, } from 'expo';
import * as firebase from 'firebase';
import firebaseConfig from './firebaseConfig';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      text: '',
      animating: true,
      refreshing: false,
      dataSource: ds.cloneWithRows([]),
    };

    firebase.initializeApp(firebaseConfig);
    this.itemsRef = firebase.database().ref('todo/');
  }

  componentWillMount() {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows([{ title: 'loading' }])
    });
  }

  componentDidMount() {
    this.listenForItems(this.itemsRef);
  }

  addTodo() {
    if (this.state.text) {
      this.setState({animating: true});
      firebase.database().ref('todo/'+ (new Date).getTime()).set({
        title: this.state.text
      });
      this.setState({text: ''});
    }
  }

  removeTodo(key) {
    if (key) {
      this.setState({animating: true});
      this.itemsRef.child(key).remove();
    }
  }

  listenForItems(itemsRef) {
    itemsRef.on('value', (snap) => {
      // get children as an array
      var items = [];
      snap.forEach((child) => {
        console.log(child.key, child.val());
        items.push({
          title: child.val().title,
          _key: child.key
        });
      });

      this.setState({
        animating: false,
        dataSource: this.state.dataSource.cloneWithRows(items)
      });
    });
  }

  renderRow(rowData) {
    return (
      <TouchableHighlight
        underlayColor='#dddddd'
        onPress={() => this.removeTodo(rowData._key)}>
        <View>
          <View style={styles.row}>
            <Text style={styles.todoText}>{rowData.title}</Text>
          </View>
          <View style={styles.separator} />
        </View>
      </TouchableHighlight>
    );
  }

  onRefresh() {
    this.setState({
      refreshing: true,
      dataSource: this.state.dataSource.cloneWithRows([{ title: 'loading' }])
    });

    setTimeout(() => {
      this.itemsRef.once('value').then((snap) => {
        let items = [];

        snap.forEach((child) => {
          items.push({
            title: child.val().title,
            _key: child.key
          });
        });

        this.setState({
          refreshing: false,
          dataSource: this.state.dataSource.cloneWithRows(items)
        });
      });
    }, 300);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleView}>
          <Text style={styles.titleText}>
            My Todos
          </Text>
        </View>
        <View style={styles.inputcontainer}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => this.setState({text})}
            value={this.state.text}
            placeholder={'Type todo!'}
            underlineColorAndroid={'#fff'}
          />
          <TouchableHighlight
              style={styles.button}
              onPress={() => this.addTodo()}
              underlayColor='#ddd'>
              <Text style={styles.btnText}>Add</Text>
          </TouchableHighlight>
        </View>
        <ListView
          style={styles.listView}
          
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={this.renderRow.bind(this)}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.onRefresh()}
              title="Loading..."
            />
          }
        />
        <ActivityIndicator
          animating={this.state.animating}
          style={[styles.centering, {height: 80}]}
          size="large"
        />
        <View style={styles.footerView}>
          <Text style={styles.titleText}>
            Footer
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleView: {
    backgroundColor: '#48afdb',
    paddingTop: 30,
    paddingBottom: 10,
    flexDirection: 'row'
  },
  listView: {
    marginLeft: 5,
    marginRight: 5,
  },
  titleText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    flex: 1,
    fontSize: 20,
  },
  inputcontainer: {
    marginTop: 5,
    padding: 10,
    flexDirection: 'row'
  },
  footerView: {
    backgroundColor: '#48afdb',
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row'
  },
  button: {
    height: 36,
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#48afdb',
    justifyContent: 'center',
    borderRadius: 4,
  },
  btnText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 6,
  },
  input: {
    height: 36,
    padding: 4,
    marginRight: 5,
    flex: 6,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#48afdb',
    borderRadius: 4,
    color: '#48BBEC'
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    height: 44
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
  },
  todoText: {
    flex: 1,
  }
});
