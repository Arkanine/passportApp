exports.dummyTestMethod = {
    'spec': {
        description : "GET method",
        path : "/test/",
        method: "GET",
        summary : "Just test",
        type : "void",
        nickname : "TestMethod",
        produces : ["application/json"]
    },
    'action': function (req, res) {
        res.send(JSON.stringify("test is ok"));
    }
};