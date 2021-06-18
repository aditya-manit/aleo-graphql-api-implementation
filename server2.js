var express = require('express');
var express_graphql = require('express-graphql');
var {buildSchema} = require('graphql');
var axios = require('axios');

// GraphQL Schema
var schema = buildSchema(`
    type Query {
        course(id: Int!): Course
        courses(topic: String): [Course]
        transaction(hash: String): Transaction
    }
    type Mutation {
        updateCourseTopic(id: Int!, topic: String!): Course
    }
    type Course {
        id: Int
        title: String
        author: String
        description: String
        topic: String
        url: String
    }
    
    type ParentBlock { 
      hash: String
      height: Int
      time: Int
      canonical: Boolean
    }

    type Transaction { 
      hash: String
      memo: String
      size: Int
      valueBalance: Int
      digest: String
      transactionProof: String
      localDataRoot: String
      programCommitment: String
      parentBlock: ParentBlock
      signatures: [String]
      oldSerialNumbers: [String]
      newCommitments: [String]
    }
`);

var coursesData = [
    {
        id: 1,
        title: 'The Complete Node.js Developer Course',
        author: 'Andrew Mead, Rob Percival',
        description: 'Learn Node.js by building real-world applications with Node, Express, MongoDB, Mocha, and more!',
        topic: 'Node.js',
        url: 'https://codingthesmartway.com/courses/nodejs/'
    },
    {
        id: 2,
        title: 'Node.js, Express & MongoDB Dev to Deployment',
        author: 'Brad Traversy',
        description: 'Learn by example building & deploying real-world Node.js applications from absolute scratch',
        topic: 'Node.js',
        url: 'https://codingthesmartway.com/courses/nodejs-express-mongodb/'
    },
    {
        id: 3,
        title: 'JavaScript: Understanding The Weird Parts',
        author: 'Anthony Alicea',
        description: 'An advanced JavaScript course for everyone! Scope, closures, prototypes, this, build your own framework, and more.',
        topic: 'JavaScript',
        url: 'https://codingthesmartway.com/courses/understand-javascript/'
    }
]

var getCourse = function (args) {
    console.log("here")
    var id = args.id;
    return coursesData.filter(course => {
        return course.id == id;
    })[0];
}

var getCourses = function (args) {
    if (args.topic) {
        var topic = args.topic;
        return coursesData.filter(course => course.topic === topic);
    } else {
        return coursesData;
    }
}

var updateCourseTopic = function ({id, topic}) {
    coursesData.map(course => {
        if (course.id === id) {
            course.topic = topic;
            return course;
        }
    });
    return coursesData.filter(course => course.id === id)[0];
}

var getTransactions = async function (args) {

    var test = null;
    var hash = args.hash;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'bearer YjEzNDY0NDctYTBhOS00OGMyLWE2YzMtOTA4ZjA4ZmYyNDk5'
    }
    var payload = {"hash": `${hash}`}

    await axios.post("https://api.aleo.network/transaction/getbyhash", payload, {
        headers: headers
    })
        .then(res => {
            console.log("transaction api response:", res.data.result)
            test = res.data.result
        })
        .catch(err => {
            console.log(err)
            return err
        })

    return test
}

// Root resolver
var root = {
    course: getCourse,
    courses: getCourses,
    // this should be same has whats defined in query
    transaction: getTransactions,
    updateCourseTopic: updateCourseTopic
};

// Create an expres server and a GraphQL endpoint
var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));