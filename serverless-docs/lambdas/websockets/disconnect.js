const Responses = require('../common/API_Responses');
const Dynamo = require('../common/Dynamo');

const tableName = process.env.tableName;
const docTableName = process.env.docTableName;

exports.handler = async event => {
    console.log('event', event);

    const { connectionId: connectionID } = event.requestContext;
    const { groupID } = await Dynamo.get(connectionID, tableName);

    await Dynamo.delete(connectionID, tableName);

    const record = await Dynamo.get(groupID, docTableName);
    var { connections } = record;

    updated = connections.filter(x => x !== connectionID);

    await Dynamo.write({
        ...record,
        connections: updated,
    }, docTableName)

    return Responses._200({message: 'disconnected'});
};