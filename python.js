const defaultPyodideUrl = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js";

let _apps = {};
let _documentUrl = document.URL;

// This method is called from Dart on backend.connect()
// dartOnMessage is called on backend.onMessage
// it accepts "data" of type JSUint8Array
globalThis.jsConnect = async function(appId, args, dartOnMessage) {
    let app = {
        "dartOnMessage": dartOnMessage
    };
    console.log(`Starting up Python worker: ${appId}, args: ${args}`);
    _apps[appId] = app;
    app.worker = new Worker("python-worker.js");

    var error;
    app.worker.onmessage = (event) => {
        if (typeof event.data === "string") {
            if (event.data != "initialized") {
                error = event.data;
            }
            app.onPythonInitialized();
        } else {
            app.dartOnMessage(event.data);
        }
    };

    let pythonInitialized = new Promise((resolveCallback) => app.onPythonInitialized = resolveCallback);

    // Merge dependencies from flet config into args if they exist
    let mergedArgs = args || {};
    if (flet.dependencies && Array.isArray(flet.dependencies)) {
        mergedArgs = { ...mergedArgs };
        if (mergedArgs.dependencies) {
            // Merge with existing dependencies, avoiding duplicates
            mergedArgs.dependencies = [...new Set([...mergedArgs.dependencies, ...flet.dependencies])];
        } else {
            mergedArgs.dependencies = flet.dependencies;
        }
    }

    // initialize worker
    app.worker.postMessage({
        pyodideUrl: flet.noCdn ? flet.pyodideUrl : defaultPyodideUrl,
        args: mergedArgs,
        documentUrl: _documentUrl,
        appPackageUrl: flet.appPackageUrl,
        micropipIncludePre: flet.micropipIncludePre,
        pythonModuleName: flet.pythonModuleName
    });

    await pythonInitialized;

    if (error) {
        console.log("Python worker init error:", error);
        throw error;
    } else {
        console.log(`Python worker initialized: ${appId}`);
    }
}

// Called from Dart on backend.send
// data is a message serialized to JSUint8Array
globalThis.jsSend = async function(appId, data) {
    if (appId in _apps) {
        const app = _apps[appId];
        app.worker.postMessage(data);
    }
}

// Called from Dart on channel.disconnect
globalThis.jsDisconnect = async function(appId) {
    if (appId in _apps) {
        console.log(`Terminating Python worker: ${appId}`);
        const app = _apps[appId];
        delete _apps[appId];
        app.worker.terminate();
        app.worker.onmessage = null;
        app.worker.onerror = null;
    }
}
