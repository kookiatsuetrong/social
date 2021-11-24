var fs       = require("fs")
var express  = require("express")
var server   = express()
server.listen(6446)
var ejs      = require("ejs")
server.engine("html", ejs.renderFile)

var mysql    = require("mysql")
var source   = { host: "127.0.0.1", database: "bitsocial",
				 user: "james",     password: "bond" }
var pool     = mysql.createPool(source)

var photoFolder  = "photos"
var photoLimit   = 1000000
var photoDefault = "empty-profile.png"
var readBody   = express.urlencoded({extended:false})
var valid      = [ ]
var cookie     = require("cookie-parser")
var readCookie = cookie()
var multer     = require("multer")
var upload     = multer({dest: photoFolder})

server.use (readCookie)
server.use (createModel)
server.get ("/", showHome)
server.get ("/login", showLogInPage )
server.post("/login", readBody, checkPassword)
server.get (["/signup", "/register"], showRegisterPage)
server.post(["/signup", "/register"], readBody, registerMember)
server.get ("/profile", showProfilePage)
server.get ("/settings", showSettingsPage)
server.post("/save-settings", readBody, saveSettings)
server.get ("/asset", showAssetPage)
server.get ("/logout", logout)
server.post("/change-profile-photo", 
				upload.single("photo"), changeProfilePhoto)
server.use ("/:alias", displayMember)
server.post("/post-status", readBody, postStatus)
server.get ("/remove/:number", removeStatus)
server.use (express.static("public"))
server.use ("/" + photoFolder, express.static(photoFolder))
server.use (showError)

function createModel(request, response, next) {
	request.card = request.cookies.card || ""
	request.model = { }
	if (valid[request.card]) {
		request.model.member = valid[request.card]
	}
	next()
}

function showHome(request, response) {
	response.render("index.html", request.model)
}

function showError(request, response) {
	response.status(404).render("error.html", request.model)
}

function showRegisterPage(request, response) {
	var card = request.cookies.card || ""
	if (valid[card]) {
		response.redirect("/profile")
	} else {
		response.render("register.html", request.model)
	}
}

function showLogInPage(request, response) {
	var card = request.cookies.card || ""
	if (valid[card]) {
		response.redirect("/profile")
	} else {
		response.render("login.html", request.model)
	}
}

function showProfilePage(request, response) {
	var card = request.cookies.card || ""
	if (valid[card]) {
		var model = { member: valid[card] }
		var sql  = "select * from posts where owner=?"
		pool.query(sql, [valid[card].number], function(e,all) {
			model.all = all
			response.render("profile.html", model)
		})
	} else {
		response.redirect("/login?message=Please Login")
	}
}

function showSettingsPage(request, response) {
	var card = request.cookies.card || ""
	if (valid[card]) {
		var model = { member: valid[card] }
		response.render("settings.html", model)
	} else {
		response.redirect("/login?message=Please Login")
	}
}

function saveSettings(request, response) {
	var card = request.cookies.card || ""
	if (valid[card]) {
		var first = request.body["first-name"] || ""
		var last  = request.body["last-name"]  || ""
		var alias = request.body.alias         || ""
		var data  = [first, last, alias, valid[card].number]
		var sql   = " update members set first_name=?,    " +
					" last_name=?, alias=? where number=? "
		pool.query(sql, data, function(error, result) {
			var m = valid[card]
			m.first_name = first
			m.last_name = last
			m.alias = alias
			valid[card] = m
			response.redirect("/settings")
		})
	} else {
		response.redirect("/login?message=Please Login")
	}
}

function logout(request, response) {
	var card = request.cookies.card || ""
	if (valid[card]) {
		delete valid[card]
	}
	response.render("logout.html")
}

function checkPassword(request, response) {
	var card = request.cookies.card || ""
	if (valid[card]) {
		response.redirect("/profile")
		return
	}
	var email    = request.body.email    || ""
	var password = request.body.password || ""
	if (email == "" || password == "") {
		response.redirect('/login')
		return
	}
	var data = [email, password]
	var sql  =  " select * from members where      " +
				" email=? and password=sha2(?,512) "
	pool.query(sql, data, function(error, result) {
		if (result.length == 1) {
			var token = randomCard()
			valid[token] = result[0]
			response.header("Set-Cookie", 
							"card=" + token + "; HttpOnly;")
			response.redirect('/profile')
		} else {
			response.redirect('/login?message=Fail')
		}
	})
}

function randomCard() {
	var all = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	var block = [ ]
	for (var i = 0; i < 10; i++) {
		var item = ""
		for (var j = 0; j < 4; j++) {
			var r = parseInt(Math.random() * all.length)
			item += all[r]
		}
		block.push(item)
	}
	return block.join('-')
}

function registerMember(request, response) {
	var card = request.cookies.card || ""
	if (valid[card]) {
		response.redirect("/profile")
		return
	}
	var sql  =  " insert into members(email, password, " +
				"       first_name, last_name, wallet) " +
				" values(?, sha2(?, 512), ?, ?, ?)     "
	var email    = request.body.email         || ""
	var password = request.body.password      || ""
	var first    = request.body["first-name"] || ""
	var last     = request.body["last-name"]  || ""
	var address  = request.body.address       || ""
	var asset    = +request.body.asset        || -1

	var data = [ email, password, first, last, address ]
	console.log(sql)
	console.log(data)

	if (email == "" || password == "" || first == "" || 
		last  == "" || address  == "" /* || asset < 0 */) {
		response.redirect("/register?message=Invalid")
		return
	}
	pool.query(sql, data, function(error, result) {
		if (error == null) {
			response.redirect("/login")
			// TODO: Add activation code before login
		} else {
			response.redirect("/register?message=Fail")
		}
	})
}

function empty() {

}

function changeProfilePhoto(request, response) {
	var card = request.cookies.card || ""
	if (valid[card] && 
		request.file != null && 
		request.file.size < photoLimit) {
		var name = randomCard()
		var ext  = null
		if (request.file.mimetype == "image/png") {
			ext = ".png"
		}
		if (request.file.mimetype == "image/jpg") {
			ext = ".jpg"
		}
		if (ext != null) {
			// TODO: resize to square photo
			fs.rename(path.join(photoFolder, request.file.filename),
						path.join(photoFolder, name + ext), 
						empty)
			if (valid[card].profile != photoDefault) {
				fs.unlink(path.join(photoFolder, valid[card].profile), empty)
			}
			valid[card].profile = name + ext
			var sql =   " update members set profile = ? " +
						" where number = ?               "
			var data = [name + ext, valid[card].number]
			pool.query(sql, data, empty)
		}
	}
	if (request.file != null) {
		fs.unlink(path.join(photoFolder, request.file.filename), 
						empty)
	}
	response.redirect("/profile")
	/*
	request.file is as follow
	{
	fieldname: 'photo',
	originalname: 'Screen Shot 2021-11-17 at 12.07.08 AM.png',
	encoding: '7bit',
	mimetype: 'image/png',
	destination: 'photos',
	filename: '2918254101c8c209d9321b0b858c111e',
	path: 'photos/2918254101c8c209d9321b0b858c111e',
	size: 783286
	}
	*/
}

function displayMember(request, response, next) {
	var alias = request.params.alias || ""
	if (alias == "") {
		next()
		return
	}
	var sql = "select * from members where alias=?"
	var data = [alias]
	pool.query(sql, data, function(error, result) {
		if (error == null && result.length == 1) {
			var model = { }
			model.target = result[0]
			model.member = request.model.member

			var sql  = "select * from posts where owner=?"
			pool.query(sql, [model.target.number], function(e,all) {
				model.all = all
				response.render("show.html", model)
			})
		} else {
			next()
		}
	})
}

function postStatus(request, response) {
	var detail = request.body.detail || ""
	if (valid[request.card] == null ||
		detail == "") {
		response.redirect("/login")
		return
	}
	var sql  =  " insert into posts(detail,time,owner)   " +
				" select ?, now(), ?                     "
	var data = [detail, valid[request.card].number]
	pool.query(sql, data, function(error, result) {
		response.redirect("/profile")
	})
}

function removeStatus(request, response) {
	if (valid[request.card] == null) {
		response.redirect("/login")
		return
	}
	var sql  = "delete from posts where number=? and owner=?"
	var data = [ request.params.number, valid[request.card].number]
	pool.query(sql, data, function(error, result) {
		response.redirect("/profile")
	})
}

function showAssetPage(request, response) {
	if (valid[request.card] == null) {
		response.redirect("/login")
	} else {
		response.render("asset.html", {member: valid[request.card]})
	}
}














// The quick brown fox jumps over a lazy dog.
