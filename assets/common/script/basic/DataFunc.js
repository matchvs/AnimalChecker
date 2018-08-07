/*
    create by hao.c 2018/04/10

    desc: 游戏数据相关操作逻辑
 */

window.dataFunc = {
    // 表格加载--
    arrTables: [],
    csvTables: {},
    csvTableForArr: {},
    tableCast: {},
    tableComment: {},
    CELL_DELIMITERS: [",", ";", "\t", "|", "^"],
    LINE_DELIMITERS: ["\r\n", "\r", "\n"],
    // 动画--
    uiPanelAnimationClips: {}
};

// [Min,Max],可以取到最大值与最小值
dataFunc.randomNum = function(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range);
    return num;
};

dataFunc.getTable = function(tableName) {
    return dataFunc.csvTables[tableName];
};

dataFunc.getTableArr = function(tableName) {
    return dataFunc.csvTableForArr[tableName];
};

dataFunc.queryOne = function(tableName, key, value) {
    var table = dataFunc.getTable(tableName);
    if (!table) {
        return null;
    }

    if (key) {
        for (var tbItem in table) {
            if (!table.hasOwnProperty(tbItem)) {
                continue;
            }

            if (table[tbItem][key] === value) {
                return table[tbItem];
            }
        }
    } else {
        return table[value];
    }
};

dataFunc.queryByID = function(tableName, ID) {
    return dataFunc.queryOne(tableName, null, ID);
};

dataFunc.queryAll = function(tableName, key, value) {
    var table = dataFunc.getTable(tableName);
    if (!table || !key) {
        return null;
    }

    var ret = {};
    for (var tbItem in table) {
        if (!table.hasOwnProperty(tbItem)) {
            continue;
        }

        if (table[tbItem][key] === value) {
            ret[tbItem] = table[tbItem];
        }
    }

    return ret;
};

dataFunc.loadConfigs = function(progressCb, callback) {

    // 加载动画
    cc.loader.loadResDir("panelAnimClips", cc.AnimationClip, function(err, clips) {
        if (err) {
            cc.error(err.message || err);
            return;
        }
        for (var i = 0; i < clips.length; i++) {
            dataFunc.uiPanelAnimationClips[clips[i].name] = clips[i];
        }
    });

    // 加载数据表
    var currentLoad = 0;
    dataFunc.arrTables.forEach(function(tableName, index) {
        cc.loader.loadRes("data/" + tableName, function(err, content) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            if (progressCb) {
                progressCb(index + 1, dataFunc.arrTables.length);
            }
            addTable(tableName, content);
            if (callback) {
                currentLoad++;
                if (currentLoad >= dataFunc.arrTables.length) {
                    callback();
                }
            }
        });
    });

    function addTable(tableName, tableContent, force) {
        if (dataFunc.csvTables[tableName] && !force) {
            return;
        }

        var tableData = {};
        var tableArr = [];
        var opts = {header: true};
        CSV.parse(tableContent, opts, function(row, keyname) {
            tableData[row[keyname]] = row;
            tableArr.push(row);
        });

        dataFunc.tableCast[tableName] = CSV.opts.cast;
        dataFunc.tableComment[tableName] = CSV.opts.comment;
        dataFunc.csvTables[tableName] = tableData;
        dataFunc.csvTableForArr[tableName] = tableArr;
    };

    function getterCast(value, index, cast, d) {

        if (cast instanceof Array) {
            if (cast[index] === "number") {
                return Number(d[index]);
            } else if (cast[index] === "boolean") {
                return d[index] === "true" || d[index] === "t" || d[index] === "1";
            } else {
                return d[index];
            }
        } else {
            if (!isNaN(Number(value))) {
                return Number(d[index]);
            } else if (value == "false" || value == "true" || value == "t" || value == "f") {
                return d[index] === "true" || d[index] === "t" || d[index] === "1";
            } else {
                return d[index];
            }
        }
    }

    var CSV = {
        /* =========================================
         * Constants ===============================
         * ========================================= */

        STANDARD_DECODE_OPTS: {
            skip: 0,
            limit: false,
            header: false,
            cast: false,
            comment: ""
        },

        STANDARD_ENCODE_OPTS: {
            delimiter: dataFunc.CELL_DELIMITERS[0],
            newline: dataFunc.LINE_DELIMITERS[0],
            skip: 0,
            limit: false,
            header: false
        },

        quoteMark: '"',
        doubleQuoteMark: '""',
        quoteRegex: /"/g,


        /* =========================================
         * Utility Functions =======================
         * ========================================= */



        assign: function() {
            var args = Array.prototype.slice.call(arguments);
            var base = args[0];
            var rest = args.slice(1);
            for (var i = 0, len = rest.length; i < len; i++) {
                for (var attr in rest[i]) {
                    base[attr] = rest[i][attr];
                }
            }

            return base;
        },

        map: function(collection, fn) {
            var results = [];
            for (var i = 0, len = collection.length; i < len; i++) {
                results[i] = fn(collection[i], i);
            }

            return results;
        },

        getType: function(obj) {
            return Object.prototype.toString.call(obj).slice(8, -1);
        },

        getLimit: function(limit, len) {
            return limit === false ? len : limit;
        },

        buildObjectConstructor: function(fields, sample, cast) {
            return function(d) {
                var object = new Object();
                var setter = function(attr, value) {
                    return object[attr] = value;
                };
                if (cast) {
                    fields.forEach(function(attr, idx) {
                        setter(attr, getterCast(sample[idx], idx, cast, d));
                    });
                } else {
                    fields.forEach(function(attr, idx) {
                        setter(attr, getterCast(sample[idx], idx, null, d));
                    });
                }
                // body.push("return object;");
                // body.join(";\n");
                return object;
            };
        },

        buildArrayConstructor: function(sample, cast) {
            return function(d) {
                var row = new Array(sample.length);
                var setter = function(idx, value) {
                    return row[idx] = value;
                };
                if (cast) {
                    fields.forEach(function(attr, idx) {
                        setter(attr, getterCast(sample[idx], idx, cast, d));
                    });
                } else {
                    fields.forEach(function(attr, idx) {
                        setter(attr, getterCast(sample[idx], idx, null, d));
                    });
                }
                return row;
            };
        },

        frequency: function(coll, needle, limit) {
            if (limit === void 0) limit = false;

            var count = 0;
            var lastIndex = 0;
            var maxIndex = this.getLimit(limit, coll.length);

            while (lastIndex < maxIndex) {
                lastIndex = coll.indexOf(needle, lastIndex);
                if (lastIndex === -1) break;
                lastIndex += 1;
                count++;
            }

            return count;
        },

        mostFrequent: function(coll, needles, limit) {
            var max = 0;
            var detected;

            for (var cur = needles.length - 1; cur >= 0; cur--) {
                if (this.frequency(coll, needles[cur], limit) > max) {
                    detected = needles[cur];
                }
            }

            return detected || needles[0];
        },

        unsafeParse: function(text, opts, fn) {
            var lines = text.split(opts.newline);

            if (opts.skip > 0) {
                lines.splice(opts.skip);
            }

            var fields;
            var constructor;

            function cells(lines) {
                var line = lines.shift();
                if (line.indexOf('"') >= 0) {// 含引号

                    // 找到这行完整的数据, 找到对称的双引号
                    var lastIndex = 0;
                    var findIndex = 0;
                    var count = 0;
                    while (lines.length > 0) {
                        lastIndex = line.indexOf('"', findIndex);
                        if (lastIndex === -1 && count % 2 === 0) break;

                        if (lastIndex !== -1) {
                            findIndex = lastIndex + 1;
                            count++;
                        } else {
                            line = line + opts.newline + lines.shift();
                        }
                    }

                    var list = [];
                    var item;

                    var quoteCount = 0;

                    var start = 0;
                    var end = 0;
                    var length = line.length;
                    for (var key in line) {
                        if (!line.hasOwnProperty(key)) {
                            continue;
                        }

                        key = parseInt(key);
                        var value = line[key];

                        if (key === 0 && value === '"') {
                            quoteCount++;
                            start = 1;
                        }

                        if (value === '"') {
                            quoteCount++;

                            if (line[key - 1] === opts.delimiter && start === key) {
                                start++;
                            }
                        }

                        if (value === '"' && quoteCount % 2 === 0) {

                            if (line[key + 1] === opts.delimiter || key + 1 === length) {
                                end = key;
                                item = line.substring(start, end);
                                list.push(item);
                                start = end + 2;
                                end = start;
                            }

                        }

                        if (value === opts.delimiter && quoteCount % 2 === 0) {
                            end = key;
                            if (end > start) {
                                item = line.substring(start, end);
                                list.push(item);
                                start = end + 1;
                                end = start;
                            } else if (end === start) {
                                list.push("");
                                start = end + 1;
                                end = start;
                            }
                        }

                    }

                    end = length;

                    if (end >= start) {
                        item = line.substring(start, end);
                        list.push(item);
                    }

                    return list;
                } else {
                    return line.split(opts.delimiter);
                }
            }

            if (opts.header) {
                if (opts.header === true) {
                    opts.comment = cells(lines); // 第一行是注释
                    opts.cast = cells(lines); // 第二行是数据类型
                    fields = cells(lines);
                } else if (this.getType(opts.header) === "Array") {
                    fields = opts.header;
                }

                constructor = this.buildObjectConstructor(fields, lines[0].split(opts.delimiter), opts.cast);
            } else {
                constructor = this.buildArrayConstructor(lines[0].split(opts.delimiter), opts.cast);
            }

            while (lines.length > 0) {
                var row = cells(lines);
                if (row.length > 1) {
                    fn(constructor(row), fields[0]);
                }
            }

            return true;
        },

        parse: function(text, opts, fn) {
            var rows;

            if (this.getType(opts) === "Function") {
                fn = opts;
                opts = {};
            } else if (this.getType(fn) !== "Function") {
                rows = [];
                fn = rows.push.bind(rows);
            } else {
                rows = [];
            }

            opts = this.assign({}, this.STANDARD_DECODE_OPTS, opts);
            this.opts = opts;

            if (!opts.delimiter || !opts.newline) {
                var limit = Math.min(48, Math.floor(text.length / 20), text.length);
                opts.delimiter = opts.delimiter || this.mostFrequent(text, dataFunc.CELL_DELIMITERS, limit);
                opts.newline = opts.newline || this.mostFrequent(text, dataFunc.LINE_DELIMITERS, limit);
            }

            // modify by jl 由表自行控制不要含有双引号.提高解析效率
            return this.unsafeParse(text, opts, fn) &&
                (rows.length > 0 ? rows : true);
        }
    };
}