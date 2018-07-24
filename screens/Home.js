import React, { Component } from 'react'
import { View, TouchableOpacity, StyleSheet, StatusBar, Alert, TextInput } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { ListMck } from '../components/home'
import Api from '../utils/Api'
import * as firebase from 'firebase'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setMcks, setUserLoggedIn, searchMcks, setMarkers } from '../store/actions'

class HomeScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'EMCEKA',
      headerLeft: (
        <TouchableOpacity
          style={{ paddingLeft: 10 }}
          onPress={navigation.getParam('addMck')}>
          <MaterialIcons name="add-a-photo" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 10 }}
          onPress={navigation.getParam('signOut')}>
          <MaterialIcons name="exit-to-app" size={24} color="white" />
        </TouchableOpacity>
      )
    }
  }

  constructor() {
    super()
    this.state = {
      query: ''
    }
    this._addMck = this._addMck.bind(this)
    this._signOut = this._signOut.bind(this)
    this._searchMcks = this._searchMcks.bind(this)
  }

  componentDidMount() {
    this.props.navigation.setParams({ addMck: this._addMck, signOut: this._signOut })
    this._getData()
  }

  async _getData() {
    const response = await Api.get('mcks')
    this.props.setMcks(response.data)

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.setUserLoggedIn(user)
      }
    })
  }

  _addMck() {
    this.props.navigation.navigate('AddMck')
  }

  _signOut() {
    firebase.auth().signOut()
      .then(() => {
        this.props.setUserLoggedIn({})
        this.props.setMcks([])
        this.props.setMarkers([])
        this.props.navigation.navigate('Login')
        Alert.alert('Success', 'Thank you for using the app')
      })
      .catch(err => console.log(err))
  }

  _searchMcks(query) {
    this.setState({ query: query })
    this.props.searchMcks(query)
  }

  render() {
    return (
      <View style={styles.homeContainer}>
        <StatusBar barStyle="light-content" hidden={false} />
        <View style={styles.searchContainer}>
          <View style={styles.searchView}>
            <TextInput
              placeholder="Type your search"
              underlineColorAndroid={'rgba(0,0,0,0)'}
              style={styles.searchTextInput}
              autoCapitalize="none"
              value={this.state.query}
              onChangeText={(text) => this._searchMcks(text)}
            />
          </View>
        </View>
        <View style={styles.listContainer}>
          {
            this.state.query != '' ? <ListMck mcks={this.props.data.searched} nav={this.props.navigation} /> : <ListMck mcks={this.props.data.mcks} nav={this.props.navigation} />
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  homeContainer: {

  },
  listContainer: {
    padding: 10
  },
  searchContainer: {
    backgroundColor: '#fff',
    marginBottom: 5
  },
  searchView: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row'
  },
  searchTextInput: {
    flex: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 5
  }
})

const mapStateToProps = (state) => {
  return {
    data: state
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({ setMcks, setUserLoggedIn, searchMcks, setMarkers }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen)
