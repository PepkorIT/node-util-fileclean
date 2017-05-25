# node-util-fileclean
Basic nodejs utility script for cleaning up old files via a glob

To install use:
```shell
npm install node-util-fileclean --save
```

### Purpose
This script is designed to clean out old files.   
For example "delete all old old files in ./reports directory that are older than 3 days"
The script finds all files using a supplied glob then orders using the [mtime or last modified time](https://nodejs.org/api/fs.html#fs_stat_time_values).

### Running the script
To run the script execute the executable bin file provided, e.g:
```
./bin/node_modules/node-util-fileclean --globs="./reports/*.html" --maxAgeDays=3 --dryRun=false
```
The above will attempt to delete any html files in the ./reports/ directory.  
Note the flag: --dryRun=false, without this flag set to false the script will simply output the files to delete and the ones to keep to the console.

### Script Flags
The following is a list of the flags that the script supports. 

`--globs="./reports/*.html,./output/**/*"`
This flag is always required as it identifies all of the files in question. This uses [globby](https://github.com/sindresorhus/globby) under the hood so please view documentation there to see all options.

`--maxAgeDays=1` `--maxAgeHours=1` `--maxAgeMins=1`
The following is a list of the time flags that are possible. If you supply a time flag files older than the supplied value will be deleted. Only 1 is supported at a time.

`--maxFiles=100`
This flag will set the total number of files that is kept.

`--dryRun=false`
This flag is optional and will default to true. When set to true no files will be deleted so it can give you a chance to manually check the result. When set to false the files will be deleted.  
The script will always output a list of all the files it has found and sorted for your review. X prefix means delete, O prefix means keep.