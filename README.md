# node-util-fileclean
Basic nodejs utility script for cleaning up old files via a glob

To install use:
```shell
npm install node-util-fileclean --save
```

### Purpose
This script is designed to clean out old files.   
For example "delete all old old files in ./reports directory that are older than 3 days"

### Running the script
To run the script execute the executable bin file provided, e.g:
```
./bin/node_modules/node-util-fileclean --globs="./reports/*.html" --maxAgeDays=3 --dryRun=false
```
The above will attempt to delete any html files in the ./reports/ directory.  
Note the flag: --dryRun=false, without this flag the script will simply output the files to delete to the console.
