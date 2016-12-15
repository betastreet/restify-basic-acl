module.exports = {};

module.exports.basicAclPlugin = function (options, restify) {
    if (!options) options = {};
    if (!options.userHeader) options.userHeader = 'X-User';
    if (!options.rolesHeader) options.rolesHeader = 'X-User-Roles';
    if (!options.roles) options.roles = {};
    if (!options.unauthorizedMessage) options.unauthorizedMessage = 'You do not have the necessary permission to access this resource.';
    return function (req, res, next) {
        const userHeader = req.header(options.userHeader);
        const rolesHeader = req.header(options.rolesHeader);

        if (!rolesHeader) {
            return next(new restify.UnauthorizedError(options.unauthorizedMessage));
        }

        // attempt to JSON decode header
        try {
            req.user = JSON.parse(userHeader);
        } catch (e) {
            req.user = userHeader;
        }

        req.roles = rolesHeader.split(',').map((s) => { return s.trim(); });

        let methodAllowedForRole = false;

        for (let i = 0; i < req.roles.length; i++) {
            if (options.roles[req.roles[i]]
                && options.roles[req.roles[i]].indexOf(req.method.toLowerCase()) !== -1) {
                methodAllowedForRole = true;
                break;
            }
        }

        if (!methodAllowedForRole) {
            return next(new restify.UnauthorizedError(options.unauthorizedMessage));
        }

        next();
    };
};
