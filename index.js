const _ = require('lodash');

module.exports = {};

module.exports.basicAclPlugin = function (options, restify) {
    if (!options) options = {};
    if (!options.userHeader) options.userHeader = 'X-User';
    if (!options.rolesHeader) options.rolesHeader = 'X-User-Roles';
    if (!options.roles) options.roles = {};
    if (!options.unprotectedRoutes) options.unprotectedRoutes = [];
    if (!options.unauthorizedMessage) options.unauthorizedMessage = 'You do not have the necessary permission to access this resource.';
    return function (req, res, next) {
        const userHeader = req.header(options.userHeader);
        const rolesHeader = req.header(options.rolesHeader);

        let skipAcl = false;
        // if the current path is specified as unprotected
        if (options.unprotectedRoutes.indexOf(req.path().replace(/\/$/, "")) != -1) {
            skipAcl = true;
        }

        if (!rolesHeader && !skipAcl) {
            return next(new restify.UnauthorizedError(options.unauthorizedMessage));
        }

        // attempt to JSON decode header
        if (userHeader) {
            try {
                req.user = JSON.parse(userHeader);
            } catch (e) {
                req.user = userHeader;
            }
        }

        req.roles = rolesHeader ? rolesHeader.split(',').map((s) => { return s.trim(); }) : null;

        let methodAllowedForRole = false;
        let comboRoles = [];
        //iterate through options.roles to get combo roles
        for (let k in options.roles) {
            if(/\+/.test(k)) {
                let comboRole = k.split('+');
                // comboRoles.push(comboRole);
                comboRoles.push({roleIdentifier: k, comboRole: comboRole});
            }
        }

        if (skipAcl) {
            methodAllowedForRole = true;q
        } else if(req.roles) {
            for (let i = 0; i < req.roles.length; i++) {
                if(req.roles.length > 1) {
                    for(let r = 0; r < comboRoles.length; r++) {
                        //compare the entire req.roles with each comboRole array
                        if (_.difference(comboRoles[r].comboRole, req.roles).length == 0
                            && options.roles[comboRoles[r].roleIdentifier].indexOf(req.method.toLowerCase()) !== -1) {
                            methodAllowedForRole = true;
                            break;
                        }
                    }
                }
                if (options.roles[req.roles[i]]
                    && options.roles[req.roles[i]].indexOf(req.method.toLowerCase()) !== -1) {
                    methodAllowedForRole = true;
                    break;
                }
            }
        }

        if (!methodAllowedForRole) {
            return next(new restify.UnauthorizedError(options.unauthorizedMessage));
        }

        next();
    };
};
