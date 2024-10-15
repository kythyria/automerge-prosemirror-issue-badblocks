import { spans } from '@automerge/automerge/next';
import { Repo, DocHandle, isValidAutomergeUrl } from "@automerge/automerge-repo";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { basicSchemaAdapter } from "./schema";
import { init } from "@automerge/prosemirror";
import { exampleSetup } from "prosemirror-example-setup";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import "prosemirror-example-setup/style/style.css"
import "prosemirror-menu/style/menu.css"
import "prosemirror-view/style/prosemirror.css"

let repo = new Repo({
  storage: new IndexedDBStorageAdapter(),
  network: [
      new BroadcastChannelNetworkAdapter()
  ]
});

const rootDocUrl = document.location.hash.substring(1);

interface SimpleDoc {
  body: string
}

let docHandle: DocHandle<SimpleDoc>;
if (isValidAutomergeUrl(rootDocUrl)) {
    docHandle = repo.find(rootDocUrl);
}
else {
    docHandle = repo.create<SimpleDoc>({ body: "" });
}

document.location.hash = docHandle.url;

await docHandle.whenReady();

const { schema, pmDoc, plugin } = init(docHandle, ['body'], {schemaAdapter: basicSchemaAdapter });

let editorConfig = {
  schema,
  plugins: [
      ...exampleSetup({schema}),
      plugin
  ],
  doc: pmDoc,
};
let state = EditorState.create(editorConfig);
const view = new EditorView(document.getElementById("prosemirror"), {state});

docHandle.on('change', (payload) => {
  document.getElementById("dump")!.innerText = spans(payload.doc, ['body']).map((i)=>JSON.stringify(i)).join("\n");
});

