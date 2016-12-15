# restify-basic-acl
[![Version](https://badge.fury.io/js/restify-basic-acl.svg)](http://badge.fury.io/js/restify-basic-acl)
[![Downloads](http://img.shields.io/npm/dm/restify-basic-acl.svg)](https://www.npmjs.com/package/restify-basic-acl)

Enable basic role-based ACL on an HTTP-method basis. Great for small applications that manage one or two resources, such as micro-services.

### Installation & Usage

After installing `restify-basic-acl` with `npm i --save restify-basic-acl`,
add it as a Restify plugin:

```javascript
let restify = require('restify');
let basicAcl = require('restify-basic-acl');

let roles = {
    user: [
        'get',
    ],
    admin: [
        'get',
        'post',
        'put',
        'delete',
    ],
};

let server = restify.createServer();

server
    .use(basicAcl.basicAclPlugin({
        // the header that the authenticated user's info is passed (JSON is auto-decoded)
        // it is then stored in req.user in any future middleware
        userHeader: 'X-User',
        // the header that the authenticated user's roles are passed (comma-separated)
        // they are then stored in req.roles in any future middleware
        rolesHeader: 'X-User-Roles',
        // pass in your permission data here, that one of the user's roles should match
        roles: roles,
    }, restify))
    .listen(3000);
```
