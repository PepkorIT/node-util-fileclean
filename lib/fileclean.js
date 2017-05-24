"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var colors = require("colors/safe");
var fs = require("fs");
var globby = require("globby");
var minimist = require("minimist");
var moment = require("moment");
// NB: This is a very dangerous default, make sure its never changed!
var args = minimist(process.argv.splice(2), { boolean: "dryRun", default: { dryRun: true } });
var globs;
if (args.globs) {
    globs = args.globs.split(',');
}
var maxAgeMins = null;
if (args.maxAgeMins != null) {
    maxAgeMins = args.maxAgeMins * 1;
}
else if (args.maxAgeHours != null) {
    maxAgeMins = args.maxAgeHours * 60;
}
else if (args.maxAgeDays != null) {
    maxAgeMins = args.maxAgeDays * 24 * 60;
}
var maxFiles = null;
if (args.maxFiles != null)
    maxFiles = args.maxFiles * 1;
if (args.maxFiles == null && args.maxAgeMins == null && args.maxAgeHours == null && args.maxAgeDays == null) {
    throw new Error('You must provide either --maxFiles or --maxAgeMins, --maxAgeHours, --maxAgeDays');
}
console.log('Globs: ', globs);
console.log('MaxFiles: ', maxFiles);
console.log('MaxAgeMins: ', maxAgeMins);
console.log('DryRun: ', args.dryRun);
var pad = function (value, len, prefix) {
    if (len === void 0) { len = 2; }
    if (prefix === void 0) { prefix = " "; }
    for (var i = 0; i < len; i++) {
        if (value.length < len) {
            value = prefix + value;
        }
        else {
            break;
        }
    }
    return value;
};
globby(globs)
    .then(function (files) {
    var newFiles = [];
    files.forEach(function (file) {
        var fileTimeStr = fs.statSync(file).mtime;
        var ageMili = moment(new Date()).diff(moment(fileTimeStr));
        var duration = moment.duration(ageMili);
        var ageMins = duration.asMinutes();
        var ageStr = pad(duration.years()) + "Y, " + pad(duration.months()) + "M, " + pad(duration.days()) + "D, " + pad(duration.hours()) + "H, " + pad(duration.minutes()) + "M";
        newFiles.push({ path: file, ageMins: ageMins, ageStr: ageStr });
    });
    // Sort by age, oldest first
    newFiles.sort(function (a, b) { return a.ageMins < b.ageMins ? 1 : -1; });
    // Now lets run through the array and process by arguments
    var deleteFiles = [];
    var i = 0;
    var index = 1;
    while (i < newFiles.length) {
        var deleteIt = false;
        var fileObj = newFiles[i];
        // simply too many in the list, so delete
        if (maxFiles != null && newFiles.length > maxFiles) {
            deleteIt = true;
        }
        else if (maxAgeMins != null && newFiles[i].ageMins > maxAgeMins) {
            // Drop out the one at the current index
            deleteIt = true;
        }
        var logStr = "#" + pad(index, 4, "0") + " | Age: " + fileObj.ageStr + " | path: " + fileObj.path;
        index++;
        if (deleteIt) {
            console.log(colors.red('X - ' + logStr));
            deleteFiles.push(newFiles.splice(i, 1)[0]);
        }
        else {
            console.log(colors.green('O - ' + logStr));
            i++;
        }
    }
    console.log("Found " + files.length + " initial files with the globs.");
    console.log("Found " + deleteFiles.length + " files that need to be deleted.");
    console.log("There will be " + (files.length - deleteFiles.length) + " files after this delete");
    if (args.dryRun == true) {
        console.log("Not running file delete. Set --dryRun=false if you want to do a delete.");
    }
    else {
        console.log("Deleting all files now...");
        deleteFiles.forEach(function (fileObj) {
            fs.unlinkSync(fileObj.path);
        });
    }
});
//# sourceMappingURL=fileclean.js.map