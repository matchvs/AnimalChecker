"use strict";

cc.loader.downloader.loadSubpackage = function (name, completeCallback) {
    wx.loadSubpackage({
        name: name,
        success: function success() {
            if (completeCallback) completeCallback();
        },
        fail: function fail() {
            if (completeCallback) completeCallback(new Error("Failed to load subpackage " + name));
        }
    });
};