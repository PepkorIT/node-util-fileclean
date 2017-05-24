import * as colors from 'colors/safe';
import * as fs from 'fs';
import * as globby from 'globby';
import * as minimist from 'minimist';
import * as moment from 'moment';

// NB: This is a very dangerous default, make sure its never changed!
let args:any = minimist(process.argv.splice(2), {boolean:"dryRun", default:{dryRun:true}});

let globs:string[];
if (args.globs) {
    globs = args.globs.split(',');
}

let maxAgeMins:number = null;
if (args.maxAgeMins != null) {
    maxAgeMins = args.maxAgeMins * 1;
}
else if (args.maxAgeHours != null) {
    maxAgeMins = args.maxAgeHours * 60;
}
else if (args.maxAgeDays != null) {
    maxAgeMins = args.maxAgeDays * 24 * 60;
}

let maxFiles:number = null;
if (args.maxFiles != null) maxFiles = args.maxFiles * 1;

if (args.maxFiles == null && args.maxAgeMins == null && args.maxAgeHours == null && args.maxAgeDays == null) {
    throw new Error('You must provide either --maxFiles or --maxAgeMins, --maxAgeHours, --maxAgeDays');
}

console.log('Globs: ', globs);
console.log('MaxFiles: ', maxFiles);
console.log('MaxAgeMins: ', maxAgeMins);
console.log('DryRun: ', args.dryRun);

let pad = (value, len = 2, prefix = " ") => {
    for (let i = 0; i < len; i++){
        if (value.length < len){
            value = prefix + value;
        }
        else {
            break;
        }
    }
    return value;
};

globby(globs)
    .then((files:string[]) => {

        let newFiles = [];
        files.forEach(file => {
            let fileTimeStr = fs.statSync(file).mtime;
            let ageMili     = moment(new Date()).diff(moment(fileTimeStr));
            let duration    = moment.duration(ageMili);
            let ageMins     = duration.asMinutes();
            let ageStr      = `${pad(duration.years())}Y, ${pad(duration.months())}M, ${pad(duration.days())}D, ${pad(duration.hours())}H, ${pad(duration.minutes())}M`;
            newFiles.push({path:file, ageMins:ageMins, ageStr:ageStr});
        });

        // Sort by age, oldest first
        newFiles.sort((a, b) => a.ageMins < b.ageMins ? 1 : -1);

        // Now lets run through the array and process by arguments
        let deleteFiles = [];
        let i = 0;
        let index = 1;
        while (i < newFiles.length){
            let deleteIt    = false;
            let fileObj     = newFiles[i];
            // simply too many in the list, so delete
            if (maxFiles != null && newFiles.length > maxFiles){
                deleteIt = true;
            }
            // Now that we have passed the max files lets check against the max age
            else if (maxAgeMins != null && newFiles[i].ageMins > maxAgeMins){
                // Drop out the one at the current index
                deleteIt = true;
            }

            let logStr = `#${pad(index, 4, "0")} | Age: ${fileObj.ageStr} | path: ${fileObj.path}`;
            index++;
            if (deleteIt){
                console.log(colors.red('X - ' + logStr));
                deleteFiles.push(newFiles.splice(i, 1)[0]);
            }
            else{
                console.log(colors.green('O - ' + logStr));
                i++;
            }
        }

        console.log(`Found ${files.length} initial files with the globs.`);
        console.log(`Found ${deleteFiles.length} files that need to be deleted.`);
        console.log(`There will be ${files.length - deleteFiles.length} files after this delete`);

        if (args.dryRun == true){
            console.log("Not running file delete. Set --dryRun=false if you want to do a delete.");
        }
        else{
            console.log("Deleting all files now...");
            deleteFiles.forEach(fileObj => {
                fs.unlinkSync(fileObj.path);
            })
        }

    });