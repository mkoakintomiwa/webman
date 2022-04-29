@echo off
set rustModules=webman trace-save unsynced update-sent

(for %%m in (%rustModules%) do (
    if "%%m" == "%1" (
        pushd "rs/%1"
        cargo build --release
        copy "target\release\%1.exe" "../../bin" /y
        popd
    )
))


if "%1" == "ts" (
    rmdir /s /q "scripts" && mkdir "scripts"
    yarn tsc
)