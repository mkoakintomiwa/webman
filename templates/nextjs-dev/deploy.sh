nextJsFilesCommand="grep -rl --include '*.html' _next/static/chunks ."
nextJsFiles=""
rm -rf _next
eval $nextJsFilesCommand | xargs rm
rm -rf assets
unzip -o build.zip
for file in $(eval $nextJsFilesCommand); do
    nextJsFiles="$nextJsFiles $file"
done
git add _next $nextJsFiles assets
git commit _next "*.html" assets -m "Frontend deployment: commit $1"
rm build.zip