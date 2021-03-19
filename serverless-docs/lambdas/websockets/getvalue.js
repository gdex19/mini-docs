const Responses = require("../common/API_Responses");
const Dynamo = require("../common/Dynamo");
const WebSocket = require("../common/websocketMessage");

const tableName = process.env.tableName;
const docTableName = process.env.docTableName;

exports.handler = async (event) => {
  console.log("event", event);

  const { connectionId: connectionID } = event.requestContext;

  console.log("ConnectionID", connectionID);
  const body = JSON.parse(event.body);

  const connectionData = await Dynamo.get(connectionID, tableName);
  
  const { domainName, stage } = connectionData;

  const defaultValue = [
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }],
    },
  ];

  try {
    const { value = defaultValue } = await Dynamo.get(body.groupID, docTableName);

    WebSocket.send({
      domainName,
      stage,
      connectionID,
      message: JSON.stringify({value, type: "getvalue"})
    });
  } catch (error) {
      console.log("Error with getvalue", error);
  };
  return Responses._200({ message: "added connection" });
};
