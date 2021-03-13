const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let value = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

io.on("connection", (socket) => {
  socket.on("send-value", () => {
    io.emit("init-value", value);
  });

  socket.on("new-operations", function (data) {
    value = data.value;
    io.emit("new-remote-operations", data);
  });
});

http.listen(4000, () => {
  console.log("listening on *:4000");
});
