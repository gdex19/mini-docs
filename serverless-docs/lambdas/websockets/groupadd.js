const Responses = require("../common/API_Responses");
const Dynamo = require("../common/Dynamo");

const tableName = process.env.tableName;
const docTableName = process.env.docTableName;

exports.handler = async (event) => {
  console.log("event", event);

  const { connectionId: connectionID } = event.requestContext;

  const body = JSON.parse(event.body);

  const connectionData = await Dynamo.get(connectionID, tableName);

  const data1 = {
    ...connectionData,
    groupID: body.groupID,
  };

  await Dynamo.write(data1, tableName);

  try {
    const record = await Dynamo.get(body.groupID, docTableName);

    const { connections } = record;

    connections.push(connectionID);

    const data2 = {
      ...record,
      connections,
    };
    await Dynamo.write(data2, docTableName);
  } catch (error) {
    const data2 = {
      ID: body.groupID,
      connections: [connectionID],
      value: [
        {
          type: "paragraph",
          children: [{ text: "A line of text in a paragraph." }],
        },
      ],
    };
    await Dynamo.write(data2, docTableName);
  }
  
  return Responses._200({ message: "added connection" });
};
