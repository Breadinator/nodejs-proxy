const http = require("http");
const url = require("url");
const req = require("request");

const config = require("./config.js");

async function get(loc, encrypted=false) {
	if (loc.substring(0, 7) != "http://" && loc.substring(0, 8) != "https://") {
		loc = "https://".concat(loc);
	}

	return new Promise((resolve, reject) => {
		req(loc, (err, res, body) => {
			if (err != null) {
				resolve(err);
			}
			resolve([res, replaceURLs(body, loc)]);
		});
	});
}

function replaceURLs(html, current) {
	if (html) {
		html = html.replace(/((|http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)/g, 'http://192.168.1.100:8080/proxy/$1');
		html = html.replace(/"\/([^\/].*?)"/g, '"http://192.168.1.100:8080/proxy/'.concat(current).concat('/$1"'));
	}
	return html;
}

var server = http.createServer((request, response) => {
	path = url.parse(request.url, true).pathname;
	var query = url.parse(request.url, true).query;

	if (path.substring(1, 6) == "proxy") {

		get(path.substring(7)).then(data => {
			try {
				response.writeHead(data[0].statusCode, {"Content-Type": data[0].headers['content-type']});
				if (data[0]['content-type'] == "text/css") {
					console.log(data[1]);
				}
			} catch (err) {
				response.writeHead(200, {"Content-Type": "text/html"});
			}
			response.write(data[1]);
			response.end();
		});

	} else {
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("Coming soon...");
		response.end();
	}
});

server.listen(config["port"]);
console.log("Server listening on port ".concat(config["port"]));