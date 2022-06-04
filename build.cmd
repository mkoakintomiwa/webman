@echo off
set rustModules=webman trace-save unsynced update-sent

(for %%m in (%rustModules%) do (
    if "%%m" == "%1" (
        pushd "rs/%1"
        cargo build --release
        popd
        IF NOT exist "bin" (
            mkdir "bin"
        )
        copy "target\release\%1.exe" "bin" /y
    )
))


if "%1" == "ts" (
    rem rmdir /s /q "scripts" && mkdir "scripts"
    yarn tsc
)