'use strict';

module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        'open'() {
            // open entry panel registered in package.json
            Editor.Panel.open('plugin-matchvs');
        },
        'say-hello'() {
            Editor.log('Hello World!');
            // send ipc message to panel
            Editor.Ipc.sendToPanel('plugin-matchvs', 'plugin-matchvs:hello');
        },
        'clicked'() {
            Editor.log('Button clicked!');
        },
        'popup-create-menu'(event, x, y, data) {
            let electron = require('electron');
            let BrowserWindow = electron.BrowserWindow;
            let template = [
                {
                    label: '清空日志', click() {
                    Editor.Ipc.sendToPanel('plugin-matchvs', 'plugin-matchvs:cleanLog', data);
                }
                },
                // {type: 'separator'},
            ];
            let editorMenu = new Editor.Menu(template, event.sender);

            x = Math.floor(x);
            y = Math.floor(y);
            editorMenu.nativeMenu.popup(BrowserWindow.fromWebContents(event.sender), x, y);
            editorMenu.dispose();
        },
        'editor:build-finished'(event){
            Editor.Ipc.sendToPanel('plugin-matchvs', 'plugin-matchvs:buildFinished', event);
        },        
    },
};