import { useState, useMemo, useRef, useEffect } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { Editor, createEditor, Operation } from "slate";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export const SyncingEditor = ({ groupId }) => {
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
    fetch(`http://localhost:4000/group/${groupId}`).then((x) =>
      x.json().then((data) => {
        setValue(data);
      })
    );

    const eventName = `new-remote-operations-${groupId}`;
    socket.on(eventName, ({ editorId, ops }) => {
      if (id.current !== editorId) {
        remote.current = true;
        // Had to change, may have bugs
        ops.forEach((op) => {
          editor.apply(op);
        });
        remote.current = false;
      }
    });

    return () => {
      socket.off(eventName);
    };
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
          socket.emit("new-operations", {
            editorId: id.current,
            groupId,
            ops: ops,
            value: opts,
          });
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
