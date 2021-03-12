import { useState, useMemo, useRef, useEffect } from 'react';
import { Slate, Editable, withReact } from 'slate-react';
import { Editor, createEditor, Operation } from 'slate';
import io from 'socket.io-client'

const socket = io('http://localhost:4000');

export const SyncingEditor = () => {
    const [value, setValue] = useState([
        {
        type: 'paragraph',
        children: [{ text: 'A line of text in a paragraph.' }],
        },
    ])
    const id = useRef(`${Date.now()}`);
    // What was the point of this in the original?
    const editable = useRef(null);
    const editor = useMemo(() => withReact(createEditor()), [])
    const remote = useRef(false);
    
    useEffect(() => {
        socket.on('new-remote-operations', ({editorId, ops}) => {
            console.log(socket)
            if (id.current !== editorId) {
                remote.current = true;
                // Had to change, may have bugs
                ops.forEach(op => {
                    editor.apply(op)
                });
                remote.current = false;
            }
        })
    // What is dependency array?
    }, [editor]);
    return (<Slate 
            editor={editor} 
            value={value} 
            onChange={opts => {
                setValue(opts);
                const ops = editor.operations.filter(o => {
                    if (o) {
                        console.log(o.data)
                        return (
                            o.type !== "set_selection" &&
                            o.type !== "set_value" &&
                            (!o.data || !o.data.hasOwnProperty("source"))
                        );
                    }

                    return false;
                })
                .map(o => ({...o, data: { source: "one" } }));
                console.log(ops)
                if (ops.length && !remote.current) {
                    socket.emit('new-operations', {editorId: id.current, ops: ops})
                }
            }}
    >
        
    <Editable 
            style={{
                backgroundColor: "#fafafa",
                maxWidth: 800,
                minHeight: 150
            }}
      />
    </Slate>
    );
};