const path = require('path');
const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));
global.fetch = require('node-fetch');
const { Pact, Matchers } = require('@pact-foundation/pact');
const { like, eachLike } = Matchers;
const ApiConsumer = require('../app/api-consumer');
const MOCK_SERVER_PORT = 2202;

describe('Pact', () => {
  const provider = new Pact({
    consumer: 'app',
    provider: 'StudentService',
    port: MOCK_SERVER_PORT,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'WARN',
    spec: 2
  });

  const STUDENT = {
    id: '1234',
    firstName: 'Billy',
    lastName: 'Beakins'
  };

  let app;

  before(() => {
    app = new ApiConsumer(MOCK_SERVER_PORT);
    return provider.setup();
  });

  describe('when a call to the Student Service is asked to store a student', () => {
    describe('and the call includes a student ID of 1234', () => {
      before(() => {
        return provider.addInteraction({
          state: 'is listening',
          uponReceiving: 'a request to store a student with ID of 1234',
          withRequest: {
            method: 'POST',
            path: '/students/1234',
            headers: {
              'Content-Type': 'application/json'
            },
            body: like(STUDENT)
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        });
      });

      it('should fulfill the request', () => {
        return app.postStudent(1234, STUDENT).should.eventually.be.fulfilled.then(() => provider.verify());
      });
    });
  });

  describe('when a call to the Student Service is made to retrieve a list of students', () => {
    before(() => {
      return provider.addInteraction({
        state: 'has one or more students in the DB',
        uponReceiving: 'a request for a list of students',
        withRequest: {
          method: 'GET',
          path: '/students'
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          },
          body: eachLike(STUDENT, { min: 1 })
        }
      });
    });

    it('should return a list of students', () => {
      return app
        .getStudents()
        .then(list => {
          list.length.should.equal(1);
          list[0].should.have.property('id', STUDENT.id);
          list[0].should.have.property('firstName', STUDENT.firstName);
          list[0].should.have.property('lastName', STUDENT.lastName);
          return provider.verify();
        });
    });
  });

  describe('when a call to the Student Service is made to retrieve a single student by ID', () => {
    describe('and there is an student in the DB with ID 1234', () => {
      before(() => {
        return provider.addInteraction({
          state: 'has a student with ID 1234',
          uponReceiving: 'a request for a student with ID 1234',
          withRequest: {
            method: 'GET',
            path: '/students/1234'
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*'
            },
            body: like(STUDENT)
          }
        });
      });

      it('should return the student', () => {
        return app
          .getStudent(1234)
          .then(profile => {
            profile.should.deep.equal(STUDENT);
            return provider.verify();
          });
      });
    });

    describe('and there is no student with ID 1234', () => {
      before(() => {
        return provider.addInteraction({
          state: 'does not have student with ID 1234',
          uponReceiving: 'a request for a student with ID 1',
          withRequest: {
            method: 'GET',
            path: '/students/1234'
          },
          willRespondWith: {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        });
      });

      it('should respond with a 404 error', () => {
        return app
          .getStudent(1234)
          .catch(err => {
            err.status.should.equal(404);
            return provider.verify();
          });
      });
    });

    after(() => {
      return provider.finalize();
    });
  });
});