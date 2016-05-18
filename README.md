[![Stories in Ready](https://badge.waffle.io/EDMdesigner/superserverjs.png?label=ready&title=Ready)](https://waffle.io/EDMdesigner/superserverjs)
# superdata-server

## crudRouter

As its name suggests, you can create CRUD routes - or a REST endpoint for your api. This module's dependency is a proxy, so the way how it stores the data should be implemented on that level.

### Params

Param	| Type	| Required	| Default value	| Description
---		| ---	| ---		| ---			| ---
proxy	| proxy | Yes		|				| A proxy object, which is responsible for storing the data. It can be a mongoProxy, a memoryProxy, a fileProxy, an s3Proxy, etc.
router	| express.Router | No | express.Router() | If you need to add middlewares to a router (eg. for authorization) you can pass a prepared router here. Otherwise a new router will be created and returned.


### Example

```javascript
var app = require("express")();
var superDataServer = require("superdata-server");

var createCrudRouter = superDataServer.crudRouter;
var mongoProxy = superDataServer.proxy.mongo;
var model; //set up your mongoose model

app.use(bodyParser.urlencoded({limit: "2mb", extended: true, parameterLimit: 10000}));
app.use(bodyParser.json({limit: "2mb"}));

app.use("/test", createCrudRouter({
	proxy: mongoProxy({
		model: model
	})
}));
```

## galleryRouter

This component creates CRUD routes for binary data. It uses two proxies, one for the binary data (binaryProxy) and one for the info derived from the binary data (infoProxy). The binaryProxy is tipically a fileProxy or an awsS3 proxy, while the infoProxy is tipically a mongoProxy. This way you can easily query based on the derived info. Listing, readOneById and updateOneById is directly calling the infoProxy, while createOne calls the binaryProxy to save the binary data. If saving the binary data succeeds, then it calls the createOne method of the infoProxy as well. Similarly, when you call the DELETE HTTP route, then first it removes the info from the infoProxy and if it succeeds, then it removes the data through the binaryProxy. If the latter does not succeed, then a background process should delete that stuck binary resource.

### Params

Param	| Type	| Required	| Default value	| Description
---		| ---	| ---		| ---			| ---
router | express.Router | No | express.Router() | The express router on which the CRUD routes of the gallery will be.
createInfoObject | function | Yes | | This function will be called when the binary router returned without error. This is the mapping of the binary router's output to the info router's input.
calculateBinaryId | function | Yes | | This function will be called when you delete a resoure. The output of the infoProxy will be the input of this function and it should calculate the id in the binary proxy.
fileUploadProp | string | Yes | | The router will search this prop in the request's payload when you upload a file.
fromUrlProp | string | Yes | | The router will search the url on this prop. The resource from that url will be downloaded and then saved to the binary proxy.
binaryProxy | superdata.proxy | Yes | | This is the proxy which is responsible to save the binary data somewhere. It can be a fileProxy or an s3 proxy, etc.
infoProxy | superdata.proxy | Yes | | This proxy will save the info of the saved resource. Eg. original filename.



### Example

```javascript
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var path = require("path");

var superdataServer = require("../../src/superdata-server");
var createGalleryRouter = superdataServer.router.gallery;
var createCrudRouter = superdataServer.router.crud;
var createFileProxy = superdataServer.proxy.file;
var createMongoProxy = superdataServer.proxy.mongo;

var app = express();
var port = 7357;
var mongoUrl = "mongodb://localhost:27017/testgallery";

var gallerySchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	thumbUrl: {
		type: String
	}
});

var galleryModel = mongoose.model("TestGalleryItems", gallerySchema);

mongoose.connect(mongoUrl);

var fileProxy = createFileProxy({
	basePath: "./tmp",
	idProperty: "id"
});

var mongoProxy = createMongoProxy({
	model: galleryModel
});

app.use(cors());

app.use(function(req, res, next) {
	console.log("req.path", req.path);
	next();
});

app.use(bodyParser.json());

app.options("*", cors());

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/upload", function(req, res) {
	res.sendFile(path.join(__dirname + "/upload.html"));
});


app.get("/from-url", function(req, res) {
	res.sendFile(path.join(__dirname + "/fromUrl.html"));
});

app.use("/images", createCrudRouter({
	proxy: fileProxy
}));

app.use("/gallery", createGalleryRouter({
	createInfoObject: function(data) {
		return {
			title: data.file.name,
			id: data.id,
			url: "http://localhost:7357/images/" + data.id
		};
	},
	binaryProxy: fileProxy,
	infoProxy: mongoProxy,

	fileUploadProp: "file",
	fromUrlProp: "url"
}));

app.listen(port, function(err) {
	if (err) {
		return console.log(err);
	}

	console.log("Gallery server listening on port: ", port);
});
```


## fileProxy

The file proxy is responsible for handling files in a directory. As other proxies, it also follows the CRUD logic.

### Params

Param	| Type	| Required	| Default value	| Description
---		| ---	| ---		| ---			| ---
basePath | string | Yes | | The path of the directory in which the fileProxy will handle files.
idProperty | string | Yes | | The name of the id propery. (eg.: "id", "_id", "customId")
encoding | string | No | | The encoding of the files to handle. (eg.: "utf8")


### Example

```javascript
var createFileProxy = require("superdata-server").proxy.file;

var proxy = createFileProxy({
	basePath: "testFolder",
	idProperty: "myVeryId",
	encoding: "utf8"
});
```

## mongoProxy

mongoProxy is responsible for handling data stored in MongoDB. As other proxies, it also follows the CRUD logic.

### Params

Param	| Type	| Required	| Default value	| Description
---		| ---	| ---		| ---			| ---
model | Mongoose model | Yes | | Mongoose object model


### Example

```javascript
var mongoose = require("mongoose");
var createMongoProxy = require("superdata-server").proxy.mongo;

var schema = new mongoose.Schema({ ... });
var model = mongoose.model("...", schema);

var proxy = createMongoProxy({
	model: model
});
```

## s3Proxy

s3Proxy is responsible for handling data stored in [AWS S3](https://aws.amazon.com/s3/). As other proxies, it also follows the CRUD logic.

### Params

Param	| Type	| Required	| Default value	| Description
---		| ---	| ---		| ---			| ---
accessKeyId | string | Yes | | your S3 access key
secretAccessKey | string | Yes | | your S3 secret access key
region | string | Yes | | AWS region name that your bucket belongs to
bucket | string | Yes | | name of your S3 bucket

### Example

```javascript
var createS3Proxy = require("superdata-server").proxy.s3;

var proxy = createS3Proxy({
	accessKeyId: "your S3 access key",
	secretAccessKey: "your S3 secret access key",
	region: "AWS region name that your bucket belongs to",
	bucket: "name of your bucket"
});
```
