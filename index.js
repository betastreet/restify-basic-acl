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

        if (skipAcl) {
            methodAllowedForRole = true;
        } else if(req.roles) {
            for (let i = 0; i < req.roles.length; i++) {
                //check if there are comob roles (combo roles are separated by space)
                if(/\s/.test(req.roles[i])) {
                    const comboRoles = req.roles[i].split(' ');
                    for(let j = 0; j < comboRoles.length; j++) {
                        if( !options.roles[comboRoles[j]] || options.roles[comboRoles[j]].indexOf(req.method.toLowerCase()) === -1 ) {
                            //break if the method doesn't exist in any of the roles
                            break;
                        } else if (options.roles[comboRoles[j]]
                            && options.roles[comboRoles[j]].indexOf(req.method.toLowerCase()) !== -1
                            && j == comboRoles.length -1) {
                            methodAllowedForRole = true;
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
