const Responses = require("../common/API_Responses");
const Dynamo = require("../common/Dynamo");
const WebSocket = require("../common/websocketMessage");

const tableName = process.env.tableName;
const docTableName = process.env.docTableName;

exports.handler = async (event) => {
  console.log("event", event);

  try {
    const { connectionId: connectionID } = event.requestContext;

    const body = JSON.parse(event.body);

    const record = await Dynamo.get(connectionID, tableName);

    const { domainName, stage } = record;

    const { value } = await Dynamo.get(body.groupID, docTableName);

    WebSocket.send({
      domainName,
      stage,
      connectionID,
      message: JSON.stringify({value, type: "getvalue"})
    });
  } catch {
    const value = [
      {
        type: "paragraph",
        children: [{ text: "A line of text in a paragraph." }],
      },
    ];

    WebSocket.send({
      domainName,
      stage,
      connectionID,
      message: JSON.stringify({value, type: "getvalue"})
    });
  }
  return Responses._200({ message: "added connection" });
};
