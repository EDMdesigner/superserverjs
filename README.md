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
proxy = createFileProxy({
	basePath: "testFolder",
	idProperty: "myVeryId",
	encoding: "utf8"
});
```
