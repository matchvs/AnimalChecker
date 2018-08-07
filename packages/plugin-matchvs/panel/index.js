var FS = require("fire-fs");
var PATH = require('fire-path');
var fse = require('fs-extra');
var rimraf = require('rimraf');
var Electron = require('electron');
var fsorigin = require('fs');

Editor.Panel.extend({
    style: FS.readFileSync(Editor.url('packages://plugin-matchvs/panel/index.html', 'utf8')) + "",
    template: FS.readFileSync(Editor.url('packages://plugin-matchvs/panel/index.html', 'utf8')) + "",

    $: {
        logTextArea: '#logTextArea',
    },

    ready() {
        let logCtrl = this.$logTextArea;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };

        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                console.log("created");
                this._refreshStatus();
            },
            data: {
                logView: [],
                projectnamedisplay: false,
                noprojectdisplay: false,
                createprojecttip: false,
                importmatchvstip: false,
                projectnamesimplevalue: [],
                projectnamevalue: [],
                importingmatchvsdisplay: false,
                finishimportmatchvstip: false,
                progressbarimport: false,
                progressbarvalue: [],
                disableImportButton: true,
            },
            methods: {
                _refreshStatus() {
                    let projectPath = Editor.projectInfo.path;
                    let buildCfg = PATH.join(projectPath, "local/builder.json");
                    let buildFolder = PATH.join(projectPath, "build");
                    let data
                    let buildData
                    let buildFullDir
                    if (!FS.existsSync(buildFolder)) {
                        this._setNotBuildStatus();
                    } else {
                        data = FS.readFileSync(buildCfg, 'utf-8');
                        buildData = JSON.parse(data);
                        buildFullDir = PATH.join(projectPath, buildData.buildPath);
                        let srcJsbinding = PATH.join(buildFullDir,
                            "jsb-" + buildData.template + "/frameworks/runtime-src/Classes/matchvsnative/jsb_matchvs_manual.cpp");
                        if (!FS.existsSync(srcJsbinding)) {
                            this._setNotIntegrateStatus();
                        } else {
                            this._setIntegrateStatus();
                        }
                    }
                },
                _setNotBuildStatus() {
                    this._addLog("status:not build");
                    this.projectnamedisplay = false;
                    this.noprojectdisplay = true;
                    this.createprojecttip = true;
                    this.importmatchvstip = false;
                    this.importingmatchvsdisplay = false;
                    this.finishimportmatchvstip = false;
                    this.progressbarimport = false;
                    this.disableImportButton = true;
                },
                _setNotIntegrateStatus() {
                    this._addLog("status: build, not intergrate matchvs");
                    this.projectnamedisplay = true;
                    this.noprojectdisplay = false;
                    this.createprojecttip = false;
                    this.importmatchvstip = true;
                    this.projectnamesimplevalue = Editor.projectInfo.name;
                    this.projectnamevalue = Editor.projectInfo.path;
                    this.importingmatchvsdisplay = false;
                    this.finishimportmatchvstip = false;
                    this.progressbarimport = false;
                    this.disableImportButton = false;
                },
                _setIntegrateStatus() {
                    this._addLog("status: end, intergrated with matchvs");
                    this.projectnamedisplay = true;
                    this.noprojectdisplay = false;
                    this.createprojecttip = false;
                    this.importmatchvstip = false;
                    this.projectnamesimplevalue = Editor.projectInfo.name;
                    this.projectnamevalue = Editor.projectInfo.path;
                    this.importingmatchvsdisplay = false;             
                    this.finishimportmatchvstip = true;
                    this.progressbarimport = false;
                    this.disableImportButton = false;
                },
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                _addLogNoTime(data) {
                    this.logView += data;
                    logListScrollToBottom();
                },
                onLogViewMenu(event) {
                    console.log("onLogViewMenu");
                    Editor.Ipc.sendToMain('plugin-matchvs:popup-create-menu', event.x, event.y, null);
                },
                onStartBuild() {
                    Editor.Panel.open("builder");
                },
                onAddMatchvsSdk() {
                    if(this.disableImportButton == true) {
                        return;
                    }
                    let cocosInstallPath = Editor.url('unpack://engine', 'utf-8');
                    window.plugin._addLog("cocosInstallPath:" + cocosInstallPath);
                    let projectName = Editor.projectInfo.name;
                    let projectPath = Editor.projectInfo.path;
                    let buildCfg = PATH.join(projectPath, "local/builder.json");
                    if (!FS.existsSync(buildCfg)) {
                        this._addLog("发现没有构建项目, 使用前请先构建项目!");
                        return;
                    }

                    this.projectnamedisplay = true;
                    this.noprojectdisplay = false;
                    this.createprojecttip = false;
                    this.importmatchvstip = false;
                    this.projectnamesimplevalue = projectName;
                    this.projectnamevalue = projectPath;
                    this.importingmatchvsdisplay = true;
                    this.finishimportmatchvstip = false;
                    this.progressbarimport = true;
                    this.progressbarvalue = '0';

                    let data = FS.readFileSync(buildCfg, 'utf-8');
                    let buildData = JSON.parse(data);
                    let buildFullDir = PATH.join(projectPath, buildData.buildPath);


                    let matchvsResPath = Editor.url('packages://plugin-matchvs/matchvs', 'utf8');
                    let projectConfigFilePath = "";
                    let projectConfigFilePathMac = "";


                    // 1.拷贝jsbinding代码
                    /* 将
                        packages\plugin-matchvs\matchvs\jsbinding下的文件
                       拷贝到
                        frameworks\runtime-src\Classes\
                    */

                    function step1() {
                        // 拷贝的源目录
                        let jsbindingPath = matchvsResPath;
                        if (!FS.existsSync(jsbindingPath)) {
                            window.plugin._addLog("没有发现插件matchvs的jsbinding文件" + jsbindingPath);
                            return;
                        }

                        // 拷贝的目标目录
                        let desDir = PATH.join(buildFullDir, "jsb-" + buildData.template + "/frameworks/runtime-src/Classes/");

                        if (!FS.existsSync(desDir)) {
                            window.plugin._addLog("请构建项目,项目目录不存在:" + desDir);
                            Editor.Dialog.messageBox({
                                    type: 'error',
                                    buttons: ['确定'],
                                    title: '导入失败',
                                    message: '导入失败，请先构建项目(注：web平台无需导入Matchvs)',
                                    detail: '',
                                    defaultId: 0,
                                    cancelId: 0,
                                    noLink: true,
                            });
                            window.plugin._setNotBuildStatus();
                            return;
                        }

                        let dllPath = PATH.join(jsbindingPath, 'matchvsnative/lib/win32/debug');
                        let dlldstPath = PATH.join(projectPath, "build/jsb-" + buildData.template + "/frameworks/runtime-src/proj.win32/Debug.win32");
                        fse.copy(dllPath, dlldstPath, function (err) {
                            if (err) {
                                window.plugin._addLog("copy dll debug failed");
                                console.log(err);
                            } else {
                                window.plugin._addLog("copy dll debug success!");
                            }
                        });

                        dllPath = PATH.join(jsbindingPath, 'matchvsnative/lib/win32/release');
                        dlldstPath = PATH.join(projectPath, "build/jsb-" + buildData.template + "/frameworks/runtime-src/proj.win32/Release.win32");
                        fse.copy(dllPath, dlldstPath, function (err) {
                            if (err) {
                                window.plugin._addLog("copy dll release failed");
                                console.log(err);
                            } else {
                                window.plugin._addLog("copy dll release success!");
                                window.plugin.progressbarvalue = '30';
                            }
                        });                        

                        window.plugin._addLog("copy jsbinding .. ");

                        fse.copy(jsbindingPath, desDir, function (err) {
                            if (err) {
                                window.plugin._addLog("copy jsbinding failed!");
                                console.log(err);
                            } else {
                                window.plugin._addLog("copy jsbinding success!");
                                step2();
                            }
                        });                        
                    };
                    // 2.修改AppDelegate.cpp
                    function step2() {
                        let AppDelegateCppFilePath = PATH.join(buildFullDir,
                            "jsb-" + buildData.template + "/frameworks/runtime-src/Classes/AppDelegate.cpp");
                        if (!FS.existsSync(AppDelegateCppFilePath)) {
                            window.plugin._addLog("没有发现文件: " + AppDelegateCppFilePath);
                            doFailed();
                            return;
                        }
                        let data = FS.readFileSync(AppDelegateCppFilePath, 'utf-8');
                        let newData = data;
                        // 添加头文件引入
                        let matchvsHeadFlag =
                            "// matchvs\n" +
                            "#include \"jsb_matchvs_manual.hpp\"\n" +
                            "USING_NS_CC;";
                        if (data.indexOf(matchvsHeadFlag) === -1) {
                            data = data.replace("USING_NS_CC;", matchvsHeadFlag);
                            window.plugin._addLog("[AppDelegate.cpp] 添加matchvs头文件引用");
                        } else {
                            window.plugin._addLog("[AppDelegate.cpp] 已经添加matchvs头文件引用");
                        }
                        // 添加matchvs初始化
                        let initFlag =
                            "    se->addRegisterCallback(register_all_matchvs_manual);\n" +
                            "    se->start();";

                        if (data.indexOf(initFlag) === -1) {
                            data = data.replace("    se->start();", initFlag);
                            window.plugin._addLog("[AppDelegate.cpp] 添加matchvs init code");
                        } else {
                            window.plugin._addLog("[AppDelegate.cpp] 已经添加matchvs init code");
                        }

                        FS.writeFileSync(AppDelegateCppFilePath, data);
                        step3();
                    }
                    
                    // 3.获取win32工程文件配置
                    function step3() {
                        window.plugin.progressbarvalue = '41';
                        let projectConfigFileDir = PATH.join(buildFullDir,
                            "jsb-" + buildData.template + "/frameworks/runtime-src/proj.win32");
                        
                        window.plugin._addLog("projectConfigFileDir:"+projectConfigFileDir);
                        fsorigin.readdir(projectConfigFileDir, function(err,files){
                            if(err){
                                window.plugin._addLog("read path fail:" + projectConfigFileDir);
                                doFailed();
                                return;
                            }
                            files.forEach(function(filename){
                                if(filename.indexOf("vcxproj") !== -1 && filename.indexOf("vcxproj.") === -1) {
                                    projectConfigFilePath = PATH.join(projectConfigFileDir, filename);
                                    step4();
                                }
                                return;
                            });
                            return;
                        });
                    }
                    
                    // 4.修改win32工程文件
                    function step4() {
                        window.plugin.progressbarvalue = '61';
                        if (!FS.existsSync(projectConfigFilePath)) {
                            window.plugin._addLog("没有发现文件: " + projectConfigFilePath);
                            doFailed();
                            return;
                        }
                        let data = fsorigin.readFileSync(projectConfigFilePath, 'utf-8');
                        // 添加编译文件引入
                        let matchvsCompileFlag = 
                            "    <ClCompile Include=\"main.cpp\" />\n" + 
                            "    <ClCompile Include=\"..\\Classes\\matchvsnative\\jsb_matchvs_manual.cpp\" />"
                        let index = data.indexOf(matchvsCompileFlag);
                        if (index === -1) {
                            data = data.replace("    <ClCompile Include=\"main.cpp\" />", matchvsCompileFlag);
                            window.plugin._addLog("添加win32 工程文件编译项");
                        } else {
                            window.plugin._addLog("已经添加win32 工程文件编译项");
                        }                       

                        // 添加头文件引入
                        let matchvsIncludeFlag = 
                            "<AdditionalIncludeDirectories>$(ProjectDir)..\\Classes;" + 
                            "$(ProjectDir)..\\Classes\\matchvsnative;" + 
                            "$(ProjectDir)..\\Classes\\matchvsnative\\include;";
                        index = data.indexOf(matchvsIncludeFlag);
                        if (index === -1) {
                            data = data.replace("<AdditionalIncludeDirectories>$(ProjectDir)..\\Classes;", matchvsIncludeFlag);
                            window.plugin._addLog("添加win32工程文件debug include项");
                        } else {
                            window.plugin._addLog("已经添加win32工程文件debug include项");
                        }
                        matchvsIncludeFlag = 
                            "<AdditionalIncludeDirectories>$(ProjectDir)..\\Classes;" + 
                            "$(ProjectDir)..\\Classes\\matchvsnative;" + 
                            "$(ProjectDir)..\\Classes\\matchvsnative\\include;"
                        
                        let substr1;
                        let substr2;
                        index = data.indexOf(matchvsIncludeFlag);
                        if (data.indexOf(matchvsIncludeFlag, index + 1) === -1) {
                            substr1 = data.substring(0, data.indexOf(matchvsIncludeFlag) + 1);
                            substr2 = data.substring(data.indexOf(matchvsIncludeFlag) + 1);
                            substr2 = substr2.replace("<AdditionalIncludeDirectories>$(ProjectDir)..\\Classes;", matchvsIncludeFlag);
                            data = substr1 + substr2;
                            window.plugin._addLog("添加win32工程文件release include项");
                        } else {
                            window.plugin._addLog("已经添加win32工程文件release include项");
                        }                        

                        // 添加lib文件引入
                        let matchvsLibFlag = 
                            "<AdditionalDependencies>v8.dll.lib;" + 
                            "MatchSDK.lib;";
                        if (data.indexOf(matchvsLibFlag) === -1) {
                            data = data.replace("<AdditionalDependencies>v8.dll.lib;", matchvsLibFlag);
                            window.plugin._addLog("添加win32工程文件 debug lib项");
                        } else {
                            window.plugin._addLog("已经添加win32工程文件 debug lib项");
                        }

                        matchvsLibFlag = 
                            "<AdditionalDependencies>v8.dll.lib;" + 
                            "MatchSDK.lib;";
                        index = data.indexOf(matchvsLibFlag);
                        if (data.indexOf(matchvsLibFlag, index + 1) === -1) {
                            substr1 = data.substring(0, data.indexOf(matchvsLibFlag) + 1);
                            substr2 = data.substring(data.indexOf(matchvsLibFlag) + 1);
                            substr2 = substr2.replace("<AdditionalDependencies>v8.dll.lib;", matchvsLibFlag);
                            data = substr1 + substr2;
                            window.plugin._addLog("添加win32工程文件 release lib项");
                        } else {
                            window.plugin._addLog("已经添加win32工程文件 release lib项");
                        }                        

                        let matchvsLibFindDebugFlag = 
                            "<AdditionalLibraryDirectories>$(OutDir);" + 
                            "$(ProjectDir)..\\Classes\\matchvsnative\\lib\\win32\\debug;";
                        if (data.indexOf(matchvsLibFindDebugFlag) === -1) {
                            data = data.replace("<AdditionalLibraryDirectories>$(OutDir);", matchvsLibFindDebugFlag);
                            window.plugin._addLog("添加win32工程文件 debug lib项目录");
                        } else {
                            window.plugin._addLog("已经添加win32工程文件 debug lib项目录");
                        }

                        matchvsLibFindReleaseFlag = 
                            "<AdditionalLibraryDirectories>$(OutDir);" + 
                            "$(ProjectDir)..\\Classes\\matchvsnative\\lib\\win32\\release;";
                        index = data.indexOf(matchvsLibFindDebugFlag);
                        if (data.indexOf(matchvsLibFindReleaseFlag, index + 1) === -1) {
                            substr1 = data.substring(0, data.indexOf(matchvsLibFindDebugFlag) + 1);
                            substr2 = data.substring(data.indexOf(matchvsLibFindDebugFlag) + 1);
                            substr2 = substr2.replace("<AdditionalLibraryDirectories>$(OutDir);", matchvsLibFindReleaseFlag);
                            data = substr1 + substr2;
                            window.plugin._addLog("添加win32工程文件 release lib项目录");
                        } else {
                            window.plugin._addLog("已经添加win32工程文件 release lib项目录");
                        }                        

                        FS.writeFileSync(projectConfigFilePath, data);
                        step5();
                    }
                    
                    // 5.修改android工程文件
                    function step5() {
                        window.plugin.progressbarvalue = '81';
                        let mkFile = PATH.join(buildFullDir,
                            "jsb-" + buildData.template + "/frameworks/runtime-src/proj.android-studio/app/jni/Android.mk");

                        if (!FS.existsSync(mkFile)) {
                            window.plugin._addLog("不存在mk文件: " + mkFile);
                            doFailed();
                            return;
                        }

                        let data = FS.readFileSync(mkFile, 'utf-8');
                        // 增加bugly.so模块
                        let matchvsSoFlag =
                            "LOCAL_PATH := $(call my-dir)\n" +
                            "# --- matchvs: 引用 libMatchSDK.so ---\n" +
                            "include $(CLEAR_VARS)\n" +
                            "LOCAL_MODULE := matchvs_native_prebuilt\n" +
                            "LOCAL_SRC_FILES := ../../../Classes/matchvsnative/lib/android/$(TARGET_ARCH_ABI)/libMatchSDK.so\n" +
                            "include $(PREBUILT_SHARED_LIBRARY)\n" +
                            "# --- matchvs: end ---";
                        if (data.indexOf(matchvsSoFlag) === -1) {
                            data = data.replace("LOCAL_PATH := $(call my-dir)", matchvsSoFlag);
                            window.plugin._addLog("[Android.mk] 增加libMatchSDK.so引用");
                        } else {
                            window.plugin._addLog("[Android.mk] 已经增加libMatchSDK.so引用");
                        }

                        // 增加matchvs jsbinding编译文件
                        let AppDelegateFlag =
                            "../../../Classes/AppDelegate.cpp \\\n" +
                            "../../../Classes/matchvsnative/jsb_matchvs_manual.cpp \\\n";
                        if (data.indexOf(AppDelegateFlag) === -1) {
                            data = data.replace("../../../Classes/AppDelegate.cpp \\\n", AppDelegateFlag);
                            window.plugin._addLog("[Android.mk] 增加jsb_matchvs_manual.cpp");
                        } else {
                            window.plugin._addLog("[Android.mk] 已经增加jsb_matchvs_manual.cpp");
                        }

                        // 增加matchvs include路径
                        let IncludeFlag = 
                            "LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../../Classes\n" +
                            "LOCAL_C_INCLUDES += $(LOCAL_PATH)/../../../Classes/matchvsnative\n" +
                            "LOCAL_C_INCLUDES += $(LOCAL_PATH)/../../../Classes/matchvsnative/include\n";
                        if (data.indexOf(IncludeFlag) === -1) {
                            data = data.replace("LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../../Classes\n", IncludeFlag);
                            window.plugin._addLog("[Android.mk] 增加matchvs include路径");
                        } else {
                            window.plugin._addLog("[Android.mk] 已经增加matchvs include路径");
                        }

                        // 增加matchvs LOCAL_SHARED_LIBRARIES
                        let shareFlag = 
                            "LOCAL_STATIC_LIBRARIES := cocos2d_js_static\n" + 
                            "LOCAL_SHARED_LIBRARIES := matchvs_native_prebuilt\n";
                        if (data.indexOf(shareFlag) === -1) {
                            data = data.replace("LOCAL_STATIC_LIBRARIES := cocos2d_js_static\n", shareFlag);
                            window.plugin._addLog("[Android.mk] 增加LOCAL_SHARED_LIBRARIES");
                        } else {
                            window.plugin._addLog("[Android.mk] 已经增加LOCAL_SHARED_LIBRARIES");
                        }

                        FS.writeFileSync(mkFile, data);
                        step6();
                    }
                    
                    // 6.获取mac工程文件名称
                    function step6() {
                        window.plugin.progressbarvalue = '91';
                        let projectConfigFileDirMac = PATH.join(buildFullDir,
                            "jsb-" + buildData.template + "/frameworks/runtime-src/proj.ios_mac");
                        
                        window.plugin._addLog("projectConfigFileDirMac:"+projectConfigFileDirMac);
                        fsorigin.readdir(projectConfigFileDirMac, function(err,files){
                            if(err){
                                window.plugin._addLog("read path fail:" + projectConfigFileDirMac);
                                doFailed();
                                return;
                            }
                            files.forEach(function(filename){
                                if(filename.indexOf("xcodeproj") !== -1 && filename.indexOf("._") === -1) {
                                    projectConfigFilePathMac = PATH.join(projectConfigFileDirMac, filename + "/project.pbxproj");
                                    window.plugin._addLog("find xcodeproj:" + projectConfigFilePathMac);
                                    step7();
                                }
                                return;
                            });
                            return;
                        });
                    }
                    
                    // 7.修改mac和ios工程文件
                    function step7() {
                        let srcProjectCfg = PATH.join(buildFullDir,
                            "jsb-" + buildData.template + "/frameworks/runtime-src/Classes/matchvsnative/macproj/" + buildData.template + "/project.pbxproj");
                        if (!FS.existsSync(srcProjectCfg)) {
                            window.plugin._addLog("没有发现文件: " + srcProjectCfg);
                            doFailed();
                            return;
                        }
                        let data = FS.readFileSync(srcProjectCfg, 'utf-8');
                        let dstProjectCfg = projectConfigFilePathMac;
                        FS.writeFileSync(dstProjectCfg, data);
                        doSuccess();
                    }

                    function doSuccess() {
                        window.plugin.progressbarvalue = '101';
                        window.plugin._addLog("成功添加matchvs,请重新编译项目!");
                        window.plugin._refreshStatus();
                    }

                    function doFailed() {
                        window.plugin._addLog("添加matchvs失败!");
                    }

                    step1();
                }
            }
        })
    },

    // register your ipc messages here
    messages: {
        'plugin-matchvs:cleanLog'(event) {
            window.plugin.logView = [];
        },
        'plugin-matchvs:buildFinished'(event) {
            window.plugin._addLog("buildfinished");
            window.plugin._refreshStatus();
        },
    }
});