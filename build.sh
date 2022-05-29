declare -a rustModules=(
    webman 
    trace-save 
    unsynced 
    update-sent
)

for m in ${rustModules[@]} 
do 
    if [ "$m" == "$1" ]; then
        pushd "rs/$1"
        cargo build --release
        popd
        mkdir -p "bin"
        cp "target/release/$1" "bin"
    fi
done


if [ "$1" == "ts" ]
then
    # rmdir /s /q "scripts" && mkdir "scripts"
    yarn tsc
fi