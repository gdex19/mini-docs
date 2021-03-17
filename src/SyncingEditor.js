import { useState, useMemo, useRef, useEffect } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { Editor, createEditor, Operation } from "slate";
import io from "socket.io-client";

// const socket = io("http://localhost:4000");

const websocket = new WebSocket(
  "wss://5jucswldp8.execute-api.us-east-2.amazonaws.com/dev"
);


export const SyncingEditor = ({ groupId }) => {
  websocket.onopen = () => {
    websocket.send(JSON.stringify({ action: "groupadd", groupID: groupId }));
    websocket.send(JSON.stringify({ action: "getvalue", groupID: groupId }));
  }
  
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }],
    },
  ]);
  const id = useRef(`${Date.now()}`);
  // What was the point of this in the original?
  const editable = useRef(null);
  const editor = useMemo(() => withReact(createEditor()), []);
  const remote = useRef(false);

  useEffect(() => {

    websocket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "getvalue":
          setValue(data.value);
          break;
        case "new_ops":
          const ops = data.ops;
          remote.current = true;
          // Had to change, may have bugs
          ops.forEach((op) => {
            editor.apply(op);
          });
          remote.current = false;
          break;
      }
    };

    // socket.on(eventName, ({ editorId, ops }) => {
    //   if (id.current !== editorId) {
    //     remote.current = true;
    //     // Had to change, may have bugs
    //     ops.forEach((op) => {
    //       editor.apply(op);
    //     });
    //     remote.current = false;
    //   }
    // });

    return () => {
      //websocket.close();
    };
    // return () => {
    //   socket.off(eventName);
    // };
    // What is dependency array?
  }, [editor, groupId]);
  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(opts) => {
        setValue(opts);
        const ops = editor.operations
          .filter((o) => {
            if (o) {
              return (
                o.type !== "set_selection" &&
                o.type !== "set_value" &&
                (!o.data || !o.data.hasOwnProperty("source"))
              );
            }

            return false;
          })
          .map((o) => ({ ...o, data: { source: "one" } }));
        if (ops.length && !remote.current) {
          // socket.emit("new-operations", {
          //   editorId: id.current,
          //   groupId,
          //   ops: ops,
          //   value: opts,
          // });
          websocket.send(
            JSON.stringify({
              action: "message",
              groupID: groupId,
              ops: ops,
              value: opts,
            })
          );
        }
      }}
    >
      <Editable
        style={{
          backgroundColor: "#fafafa",
          maxWidth: 800,
          minHeight: 150,
        }}
      />
    </Slate>
  );
};
