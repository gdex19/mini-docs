const Responses = require("../common/API_Responses");
const Dynamo = require("../common/Dynamo");
const WebSocket = require("../common/websocketMessage");

const tableName = process.env.tableName;
const docTableName = process.env.docTableName;

exports.handler = async (event) => {
  console.log("event", event);

  const { connectionId: connectionID } = event.requestContext;

  const body = JSON.parse(event.body);

  try {
    const record = await Dynamo.get(connectionID, tableName);
    const { domainName, stage } = record;

    const groupRecord = await Dynamo.get(body.groupID, docTableName);
    const { connections } = groupRecord;

    await Dynamo.write({
      ...groupRecord,
      value: body.value
    }, docTableName);
    
    for (var i = 0; i < connections.length; i++) {
      if (connections[i] !== connectionID) {
        WebSocket.send({
          domainName,
          stage,
          connectionID: connections[i],
          message: JSON.stringify({ops: body.ops, type: "new_ops"}),
        });
        console.log("sent", connections[i]);
      }
    } 
    //connections.map(id => {
     // console.log("mapping connections", connections);
     // if (id !== connectionID) {
      //  console.log("sending", id);
       /// await WebSocket.send({
         // domainName,
         // stage,
          //connectionID: id,
         // message: JSON.stringify({ops, type: "new_ops"}),
        //});
        //console.log("sent", id);
     // }
    //});

    return Responses._200({ message: "got a message" });
  } catch (error) {
    return Responses._400({ message: "message could not be recieved" });
  }

  return Responses._200({ message: "got a message" });
};
