import { useState, useMemo, useRef, useEffect } from 'react';
import { Slate, Editable, withReact } from 'slate-react';
import { Editor, createEditor, Operation } from 'slate';
import Mitt from 'mitt';
import { RemoveTextOperation } from 'slate';

const emitter = new Mitt();

export const SyncingEditor = () => {
    const [value, setValue] = useState([
        {
        type: 'paragraph',
        children: [{ text: 'A line of text in a paragraph.' }],
        },
    ])
    const id = useRef(`${Date.now()}`);
    const editable = useRef(null);
    const editor = useMemo(() => withReact(createEditor()), [])
    const remote = useRef(false);
    
    useEffect(() => {
        emitter.on("*", (type, ops) => {
            if (id.current !== type) {
                remote.current = true;
                console.log(editable)
                // Had to change, may have bugs
                ops.forEach(op => {
                    editor.apply(op)
                });
                remote.current = false;
            }
        });
    }, []);
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
                    emitter.emit(id.current, ops)
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