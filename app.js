import React, { Component } from 'react'
import { Image, ScrollView, Text, TextInput, 
		TouchableOpacity, View } from 'react-native'

var base = 'https://codestar.work:5000'
// var base = "https://algorist.app:6464"

export default class Main extends Component {
	constructor() {
		super()
		this.state = { current: <LogIn title="Minimal" container={this} /> }
	}
	render() {
		return this.state.current
	}
	toProfile() {
		this.setState({ current: <Profile container={this} /> }) 
	}
	toLogIn() {
		this.setState({ current: <LogIn title="Minimal" container={this} /> })
	}
}
class Profile extends Component {
	constructor() {
		super()
		this.state = { posts: [ ] }
		this.refresh()
	}
	async refresh() {
		var response = await fetch(base + "/api/list")
		var r = await response.json()
		if (r.result == null) r.result = [ ]
		var tmp = [ ]
		for (var i = 0; i < 5; i++) {
			for (var e of r.result) {
				tmp.push(e)
			}
		}
		this.setState({posts: tmp})
	}
	render() {
		var items = this.state.posts.map( (v,i) => <View 
			key={i} style={style.post}>
			<Text style={style.postText}>
			{v.detail}</Text>
			<Text style={style.postTime}>{v.time}</Text></View>)
		return <View style={style.main}>
			<ScrollView>
				{items}
			</ScrollView>
			<View style={style.menu}>
				<TouchableOpacity onPress={()=>this.refresh()}
					style={style.menuItem}>
					<Text style={style.buttonText}>Refresh</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={()=>this.doLogOut()}
					style={style.menuItem}>
					<Text style={style.buttonText}>Log Out</Text>
				</TouchableOpacity>
			</View>
		</View>
	}
	async doLogOut() {
		this.setState({posts:[]})
		var response = await fetch(base + "/api/logout")
		this.props.container.toLogIn()
	}
}

class LogIn extends Component {
	render() {
		return <View style={style.main}>
			<Text style={style.whiteTitle}>
				{this.props.title}
			</Text>
			<TextInput
				style={style.input}
				placeholder="Your Email"
				value={this.state.email}
				onChangeText={t => this.setState({email:t})}
			/>
			<TextInput
				style={style.input}
				placeholder="Your Password"
				secureTextEntry={true}
				value={this.state.password}
				onChangeText={t => this.setState({password:t})}
			/>
			<TouchableOpacity onPress={() => this.check()}
				style={style.button}>
				<Text style={style.buttonText}>Log In</Text>
			</TouchableOpacity>
			<Text>{this.state.result}</Text>
		</View>
	}

	async check() {
		let data = 'email=' + this.state.email +
			'&password=' + this.state.password
		var options = { method: 'POST', mode:'cors',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: data }
		var r = await fetch(base + '/api/login', options)
		console.log(r.headers)
		var m = await r.json()
		if (m.member == null) {
			this.setState({ result: 'FAIL' })
		} else {
			this.setState({result:m.member.first_name })
			this.props.container.toProfile()
		}
	}

	constructor() {
		super()
		this.state = {
			email: 'alice@email.com',
			password: 'alice123',
			result: '',
		}
	}
}

var iPhoneStyle = {
	main: {
		backgroundColor: '#BCD',
		height: '100%',
		paddingTop: 48,
		paddingLeft: 4,
		paddingRight: 4,
	},
	buttonText: {
		color: 'white',
		textAlign: 'center',
		fontSize: 24,
	},
	button: {
		backgroundColor: '#678',
		padding: 10,
		paddingLeft: 10,
		paddingRight: 10,
		borderRadius: 24,
	},
	input: { 
		borderColor: 'white',
		borderWidth: 1,
		height: 40,
		paddingLeft: 8,
		marginBottom: 10,
		fontSize: 24,
		borderRadius: 8,
		backgroundColor: 'white',
	},
	whiteTitle: {
		color: '#456',
		fontSize: 36,
		marginBottom: 10,
		textAlign: 'center',
	},
	post: {
		backgroundColor: "white",
		borderRadius: 8,
		paddingTop: 4,
		paddingBottom: 4,
		paddingLeft: 6,
		paddingRight: 6,
		marginBottom: 6,
	},
	postText: {
		fontSize: 20,
	},
	postTime: {
		fontSize: 12,
		color: '#aaa',
	},
	menu: {
		height: 60,
		flexDirection: 'row',
		justifyContent: 'flex-end'
	},
	menuItem: {
		marginLeft: 8,
	}
}
var AndroidStyle = {
	main: { backgroundColor: '#efe', height: '100%' },
}
var style = iPhoneStyle
