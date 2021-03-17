const { group } = require("console");
//const AWS = require("aws-sdk");
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
const value = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

let groupData = {};

io.on("connection", (socket) => {
  socket.on("new-operations", function (data) {
    groupData[data.groupId] = data.value;
    io.emit(`new-remote-operations-${data.groupId}`, data);
  });
});

app.get("/group/:id", (req, res) => {
  const { id } = req.params;
  if (!(id in groupData)) {
    groupData[id] = value;
  }
  res.send(groupData[id]);
});

http.listen(4000, () => {
  console.log("listening on *:4000");
});
