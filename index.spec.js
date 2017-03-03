const restify = require('restify');
const basicAcl = require('./index');
const httpMock = require('node-mocks-http');
const supertest = require('supertest');

describe('ACL module', () => {
    let request, permissions;
    beforeEach(() => {
        req = httpMock.createRequest();
        res = httpMock.createResponse({
            eventEmitter: require('events').EventEmitter
        });
        permissions = {
            user: [
                'get',
            ],
            admin: [
                'get',
                'delete',
                'post',
                'put'
            ],
            advertiser: [
                'get',
            ],
            'user+advertiser': [
                'put',
                'get'
            ],
        };

        const server = restify.createServer();

        server.use(basicAcl.basicAclPlugin({
            userHeader: 'X-User',
            rolesHeader: 'X-User-Roles',
            roles: permissions
        }, restify));

        server.get('/', (req, res) => {
            res.send('done');
        });

        server.post('/', (req, res) => {
            res.send('done');
        });

        request = supertest(server);
    });

    describe('basicAcl', () => {
        it('request should have access with the right roles', (done) => {

            const server = restify.createServer();
            request
                .get('/')
                .set('X-User-Roles', 'user, advertiser')
                .end((err, res) => {
                    const text = JSON.parse(res.text);
                    expect(text).toBe('done');
                    expect(err).toBeNull()
                    done();
                });

        });

        it('request should not have access without the right roles', (done) => {

            const server = restify.createServer();
            request
                .get('/')
                .end((err, res) => {
                    const message = JSON.parse(res.text);
                    expect(message.message).toBe('You do not have the necessary permission to access this resource.');
                    expect(message.code).toBe('UnauthorizedError');
                    done();
                });

        });

        it('request should not have access without the right roles', (done) => {
            const server = restify.createServer();
            request
                .post('/')
                .set('X-User-Roles', 'user, advertiser')
                .end((err, res) => {
                    const message = JSON.parse(res.text);
                    expect(message.message).toBe('You do not have the necessary permission to access this resource.');
                    expect(message.code).toBe('UnauthorizedError');
                    done();
                });

        });
    });
});
